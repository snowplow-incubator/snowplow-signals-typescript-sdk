import axios from "axios";
import type {
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "@snowplow/signals-core";

export const axiosFetch = async (
  url: string,
  options: SignalsFetchOptions
): Promise<SignalsFetchResponse> => {
  try {
    const res = await axios.request({
      url,
      headers: options.headers,
      method: options.method.toLowerCase(),
      data: options.body,
    });

    return {
      status: res.status,
      text: async () => {
        if (typeof res.data === "string") {
          return res.data;
        }
        try {
          return JSON.stringify(res.data);
        } catch (err) {
          return res.data;
        }
      },
      json: async () => res.data,
    };
  } catch (e) {
    if (axios.isAxiosError(e)) {
      throw new Error(
        `[Signals] API error: ${e.status} ${e.message} ${
          e.response?.data && JSON.stringify(e.response.data, null, 2)
        }`
      );
    }
    throw e;
  }
};
