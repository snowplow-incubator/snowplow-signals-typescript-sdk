import { GetOnlineFeaturesRequest } from "./models/GetOnlineFeaturesRequest";
import { GetOnlineFeaturesResponse } from "./models/GetOnlineFeaturesResponse";
import {
  SignalsCoreOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "./types";
import { removeTrailingSlash } from "./utils";

export abstract class SignalsCore {
  baseUrl: string;

  constructor(params: SignalsCoreOptions) {
    const { baseUrl } = params;
    this.baseUrl = removeTrailingSlash(baseUrl);
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

  abstract fetch(
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

  private async fetchResult<T>(
    url: string,
    options: SignalsFetchOptions
  ): Promise<T> {
    const res = await this.fetch(url, options);
    const data = await res.json();

    if (res.status < 200 || res.status >= 400) {
      // Log errors
    }

    return data;
  }
}
