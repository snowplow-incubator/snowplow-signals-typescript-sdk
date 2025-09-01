import { GetOnlineAttributesRequest } from "./models/GetOnlineAttributesRequest";
import type { GetAttributesResponse } from "./models/GetAttributesResponse";
import type {
  GetBatchServiceAttributesRequest,
  GetServiceAttributesRequest,
  GetGroupAttributesRequest,
  SignalsCoreOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
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

const X_SIGNALS_SDK_NAME = `signals-ts ${version}`;
export abstract class SignalsCore {
  baseUrl: string;
  authMode: 'bdp' | 'trial';
  organizationId?: string;
  apiKeyId?: string;
  apiKey?: string;
  trialToken?: string;
  private accessToken: string | undefined = undefined;

  constructor(params: SignalsCoreOptions) {
    // Validate required parameters first
    if (!params.baseUrl) {
      throw new Error('[Signals] baseUrl required for instantiation');
    }

    this.baseUrl = removeTrailingSlash(params.baseUrl);
    this.authMode = params.authMode || 'bdp';
    this.organizationId = params.organizationId;
    this.apiKeyId = params.apiKeyId;
    this.apiKey = params.apiKey;
    this.trialToken = params.trialToken;

    if (this.authMode === 'trial') {
      if (!this.trialToken) {
        throw new Error('[Signals] trialToken required when authMode is "trial"');
      }
    } else {
      // BDP mode validation
      const requiredBdpParams = ['apiKey', 'apiKeyId', 'organizationId'] as const;
      const missingBdpParams = requiredBdpParams.filter((param) => !this[param]);
      if (missingBdpParams.length > 0) {
        throw new Error(
          `[Signals] ${missingBdpParams.join(', ')} required for BDP authentication mode`
        );
      }
    }
  }

  protected async _fetchToken(): Promise<string> {
    if (this.authMode === 'trial') {
      // For trial mode, we use the trial token directly
      return this.trialToken!;
    }

    // BDP token fetching logic
    const accessTokenUrl = process.env.BDP_NEXT
      ? `https://next.console.snowplowanalytics.com/api/msc/v1/organizations/${this.organizationId}/credentials/v3/token`
      : `https://console.snowplowanalytics.com/api/msc/v1/organizations/${this.organizationId}/credentials/v3/token`;

    try {
      const response = await this.fetch(accessTokenUrl, {
        method: "GET",
        headers: {
          "X-API-Key-Id": this.apiKeyId!,
          "X-API-Key": this.apiKey!,
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
    if (this.authMode === 'trial') {
      // Trial tokens don't expire, always return the trial token
      return this.trialToken!;
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
    const data = await res.json();

    if (res.status < 200 || res.status >= 400) {
      throw new Error(`[Signals] ${res.status} ${res.text()}`);
    }

    return data;
  }
}
