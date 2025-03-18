import { axiosFetch } from "./axiosFetch";
import { SignalsCore } from "@snowplow/ai-core";
import type {
  SignalsCoreOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "@snowplow/ai-core";

export class Signals extends SignalsCore {
  constructor(params: SignalsCoreOptions) {
    super({
      baseUrl: params.baseUrl,
      apiKey: params.apiKey,
      apiKeyId: params.apiKeyId,
      organizationId: params.organizationId,
    });
  }

  fetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse> {
    return axiosFetch(url, options);
  }
}
