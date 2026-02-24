import { GetOnlineAttributesRequest } from "./models/GetOnlineAttributesRequest";
import type { GetAttributesResponse } from "./models/GetAttributesResponse";
import type {
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

export abstract class SignalsCore {
  baseUrl: string;
  authMode: 'bdp' | 'sandbox';
  organizationId?: string;
  apiKeyId?: string;
  apiKey?: string;
  sandboxToken?: string;
  private accessToken: string | undefined = undefined;

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
      const responseJson = await response.json();
      return responseJson["accessToken"];
    } catch (e) {
      throw new Error("[Signals] Failed to fetch access token");
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

  private async _checkToken(token: string | undefined): Promise<string> {
    if (this.authMode === 'sandbox') {
      // Sandbox tokens don't expire, always return the sandbox token
      return this.sandboxToken!;
    }

    // BDP token management with expiration checking
    if (token === undefined) {
      return await this._fetchToken();
    } else if (isJwtExpired(token)) {
      // TODO: Can optimize slightly by storing the expiration time directly.
      return await this._fetchToken();
    } else {
      return token;
    }
  }

  private async fetchResult<T>(
    url: string,
    options: SignalsFetchOptions
  ): Promise<T> {
    const accessToken = await this._checkToken(this.accessToken);
    this.accessToken = accessToken;
    options.headers.Authorization =
      options.headers.Authorization || `Bearer ${accessToken}`;

    const res = await this.fetch(url, options);

    if (res.status < 200 || res.status >= 400) {
      throw new SignalsAPIError(res.status, await res.text());
    }

    return await res.json();
  }
}
