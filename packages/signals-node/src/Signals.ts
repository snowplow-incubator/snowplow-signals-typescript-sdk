import { axiosFetch } from "./axiosFetch";
import { SignalsCore } from "signals-core";
import {
  SignalsCoreOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "signals-core";

export class Signals extends SignalsCore {
  constructor(params: SignalsCoreOptions) {
    if (!params.baseUrl) {
      throw new Error("[Signals] baseUrl is required for instantiation");
    }

    super({ baseUrl: params.baseUrl });
  }

  fetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse> {
    return axiosFetch(url, options);
  }
}
