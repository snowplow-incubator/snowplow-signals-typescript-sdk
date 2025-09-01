import { axiosFetch } from "./axiosFetch";
import { SignalsCore } from "@snowplow/signals-core";
import type {
  SignalsCoreOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "@snowplow/signals-core";

export class Signals extends SignalsCore {
  constructor(params: SignalsCoreOptions) {
    super(params);
  }

  fetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse> {
    return axiosFetch(url, options);
  }
}
