import { GetOnlineAttributesRequest } from "./models/GetOnlineAttributesRequest";
import type { GetAttributesResponse } from "./models/GetAttributesResponse";
import type { AgenticContextResponse } from "./models/AgenticContextResponse";
import type {
  GetAgenticContextRequest,
  GetBatchServiceAttributesRequest,
  GetServiceAttributesRequest,
  GetGroupAttributesRequest,
  SignalsCoreOptions,
  SignalsCoreSandboxOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "./types";
import {
  isBDPAuthOptions,
  isSandboxAuthOptions,
} from "./types";
import {
  formatGetAttributesResponse,
  formatGetBatchAttributesResponse,
  formatVersionedGroupAttributes,
  getOnlineAttributesApiAttributeKey,
  isJwtExpired,
  removeTrailingSlash,
} from "./utils";
import { version } from "./version";
import { SignalsAPIError } from "./errors";

const X_SIGNALS_SDK_NAME = `signals-ts ${version}`;
// Refresh the access token this long before it expires, so it doesn't expire while a request is in flight
const ACCESS_TOKEN_EXPIRY_LEEWAY_SECONDS = 30;

export abstract class SignalsCore {
  baseUrl: string;
  authMode: 'bdp' | 'sandbox';
  organizationId?: string;
  apiKeyId?: string;
  apiKey?: string;
  sandboxToken?: string;
  private accessToken: string | undefined = undefined;
  private accessTokenRequest: Promise<string> | undefined = undefined;

  constructor(params: SignalsCoreOptions | SignalsCoreSandboxOptions) {
    // Validate required parameters first
    if (!params.baseUrl) {
      throw new Error('[Signals] baseUrl required for instantiation');
    }

    this.baseUrl = removeTrailingSlash(params.baseUrl);

    // Infer auth mode from the provided options
    if (isSandboxAuthOptions(params)) {
      this.authMode = 'sandbox';
      this.sandboxToken = params.sandboxToken;
      this.organizationId = undefined;
      this.apiKeyId = undefined;
      this.apiKey = undefined;
    } else if (isBDPAuthOptions(params)) {
      this.authMode = 'bdp';
      this.organizationId = params.organizationId;
      this.apiKeyId = params.apiKeyId;
      this.apiKey = params.apiKey;
      this.sandboxToken = undefined;
    } else {
      throw new Error('[Signals] Invalid authentication options provided. Must provide either sandbox token or BDP credentials (apiKey, apiKeyId, organizationId)');
    }
  }

  private async _fetchToken(): Promise<string> {
    // BDP token fetching logic – `_fetchToken` is called only on BDP auth mode
    const accessTokenUrl = process.env.BDP_NEXT
      ? `https://next.console.snowplowanalytics.com/api/msc/v1/organizations/${this.organizationId}/credentials/v3/token`
      : `https://console.snowplowanalytics.com/api/msc/v1/organizations/${this.organizationId}/credentials/v3/token`;

    if (!this.apiKey) {
      throw new Error('[Signals] apiKey is required for BDP authentication');
    }
    if (!this.apiKeyId) {
      throw new Error('[Signals] apiKeyId is required for BDP authentication');
    }

    try {
      const response = await this.fetch(accessTokenUrl, {
        method: "GET",
        headers: {
          "X-API-Key-Id": this.apiKeyId,
          "X-API-Key": this.apiKey,
          "X-Signals-Sdk-Name": X_SIGNALS_SDK_NAME,
        },
      });
      if (response.status < 200 || response.status >= 400) {
        throw new Error(`Token request failed with status ${response.status}`);
      }
      const responseJson = await response.json();
      const accessToken = responseJson["accessToken"];
      if (typeof accessToken !== "string" || !accessToken) {
        throw new Error("Token response did not include an accessToken");
      }
      return accessToken;
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      throw new Error(`[Signals] Failed to fetch access token: ${reason}`);
    }
  }

  _getFetchOptions(options: {
    method: SignalsFetchOptions["method"];
    body?: SignalsFetchOptions["body"];
  }): SignalsFetchOptions {
    const fetchOptions: SignalsFetchOptions = {
      method: options.method,
      headers: {
        "Content-Type": "application/json",
        "X-Signals-Sdk-Name": X_SIGNALS_SDK_NAME,
      },
      body: options.body,
    };

    return fetchOptions;
  }

  protected abstract fetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse>;

  async getServiceAttributes(serviceAttributes: GetServiceAttributesRequest) {
    return await this._getOnlineAttributes({
      service: serviceAttributes.name,
      attribute_keys: getOnlineAttributesApiAttributeKey(serviceAttributes),
    });
  }

  async getBatchServiceAttributes(
    serviceAttributes: GetBatchServiceAttributesRequest
  ) {
    return await this._getOnlineBatchAttributes({
      service: serviceAttributes.name,
      attribute_keys: {
        [serviceAttributes.attribute_key]: serviceAttributes.identifiers,
      },
    });
  }

  async getGroupAttributes(groupAttributes: GetGroupAttributesRequest) {
    const versionedAttributes = formatVersionedGroupAttributes({
      attributes: groupAttributes.attributes,
      groupName: groupAttributes.name,
      groupVersion: groupAttributes.version,
    });
    return await this._getOnlineAttributes({
      attributes: versionedAttributes,
      attribute_keys: getOnlineAttributesApiAttributeKey(groupAttributes),
    });
  }

  async getAgenticContext(
    request: GetAgenticContextRequest & { format: "narrative" }
  ): Promise<string>;
  async getAgenticContext(
    request: GetAgenticContextRequest & { format?: "json" }
  ): Promise<AgenticContextResponse>;
  async getAgenticContext(
    request: GetAgenticContextRequest
  ): Promise<AgenticContextResponse | string> {
    const params = new URLSearchParams({
      identifier: request.identifier,
      name: request.name,
    });
    if (request.format) params.set("format", request.format);

    const res = await this._authorizedFetch(
      `${this.baseUrl}/api/v1/event_log?${params.toString()}`,
      this._getFetchOptions({ method: "GET" })
    );

    return request.format === "narrative"
      ? await res.text()
      : await res.json();
  }

  private async _getOnlineAttributesRequest(
    getOnlineAttributes: GetOnlineAttributesRequest
  ): Promise<GetAttributesResponse> {
    const result = await this.fetchResult<GetAttributesResponse>(
      `${this.baseUrl}/api/v1/get-online-attributes`,
      this._getFetchOptions({
        method: "POST",
        body: JSON.stringify(getOnlineAttributes),
      })
    );
    return result;
  }

  private async _getOnlineAttributes(
    getOnlineAttributes: GetOnlineAttributesRequest
  ): Promise<Record<string, unknown>> {
    const result = await this._getOnlineAttributesRequest(getOnlineAttributes);
    return formatGetAttributesResponse(result);
  }

  private async _getOnlineBatchAttributes(
    getOnlineAttributes: GetOnlineAttributesRequest
  ): Promise<Record<string, unknown[]>> {
    const result = await this._getOnlineAttributesRequest(getOnlineAttributes);
    return formatGetBatchAttributesResponse(result);
  }

  private async _checkToken(): Promise<string> {
    if (this.authMode === 'sandbox') {
      // Sandbox tokens don't expire, always return the sandbox token
      return this.sandboxToken!;
    }

    // BDP token management with expiration checking
    // TODO: Can optimize slightly by storing the expiration time directly.
    if (
      this.accessToken !== undefined &&
      !isJwtExpired(this.accessToken, ACCESS_TOKEN_EXPIRY_LEEWAY_SECONDS)
    ) {
      return this.accessToken;
    }

    // Share a single in-flight token request between concurrent callers,
    // so a burst of requests on a cold or expired token fetches it only once
    if (!this.accessTokenRequest) {
      this.accessTokenRequest = this._refreshToken();
    }
    return this.accessTokenRequest;
  }

  private async _refreshToken(): Promise<string> {
    try {
      this.accessToken = await this._fetchToken();
      return this.accessToken;
    } finally {
      // Cleared on failure too, so the next caller retries instead of reusing a rejected request
      this.accessTokenRequest = undefined;
    }
  }

  private async _authorizedFetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse> {
    const accessToken = await this._checkToken();
    options.headers.Authorization =
      options.headers.Authorization || `Bearer ${accessToken}`;

    const res = await this.fetch(url, options);

    if (res.status < 200 || res.status >= 400) {
      throw new SignalsAPIError(res.status, await res.text());
    }

    return res;
  }

  private async fetchResult<T>(
    url: string,
    options: SignalsFetchOptions
  ): Promise<T> {
    const res = await this._authorizedFetch(url, options);
    return await res.json();
  }
}
