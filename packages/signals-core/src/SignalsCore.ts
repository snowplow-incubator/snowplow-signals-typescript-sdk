import { GetOnlineFeaturesRequest } from "./models/GetOnlineFeaturesRequest";
import { GetOnlineFeaturesResponse } from "./models/GetOnlineFeaturesResponse";
import {
  SignalsCoreOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "./types";
import { isJwtExpired, removeTrailingSlash } from "./utils";

export abstract class SignalsCore {
  baseUrl: string;
  organizationId: string;
  apiKeyId: string;
  apiKey: string;
  private accessToken: string | undefined = undefined;

  constructor(params: SignalsCoreOptions) {
    this.baseUrl = removeTrailingSlash(params.baseUrl);
    this.organizationId = params.organizationId;
    this.apiKeyId = params.apiKeyId;
    this.apiKey = params.apiKey;

    const requiredParams = [
      "baseUrl",
      "apiKey",
      "apiKeyId",
      "organizationId",
    ] as const;
    const missingParams = requiredParams.filter((param) => !this[param]);
    if (missingParams.length > 0) {
      throw new Error(
        `[Signals] ${missingParams.join(", ")} required for instantiation`
      );
    }
  }

  protected async _fetchToken(): Promise<string> {
    const accessTokenUrl = process.env.BDP_NEXT
      ? `https://next.console.snowplowanalytics.com/api/msc/v1/organizations/${this.organizationId}/credentials/v3/token`
      : `https://console.snowplowanalytics.com/api/msc/v1/organizations/${this.organizationId}/credentials/v3/token`;

    try {
      const response = await this.fetch(accessTokenUrl, {
        method: "GET",
        headers: {
          "X-API-Key-Id": this.apiKeyId,
          "X-API-Key": this.apiKey,
          "X-Signals-Sdk-Name": "signals-ts",
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
        "X-Signals-Sdk-Name": "signals-ts",
      },
      body: options.body,
    };

    return fetchOptions;
  }

  protected abstract fetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse>;

  async getOnlineFeatures(
    body: GetOnlineFeaturesRequest
  ): Promise<GetOnlineFeaturesResponse> {
    return this.fetchResult(
      `${this.baseUrl}/api/v1/get-online-features`,
      this._getFetchOptions({ method: "POST", body: JSON.stringify(body) })
    );
  }

  private async _checkToken(token: string | undefined): Promise<string> {
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
