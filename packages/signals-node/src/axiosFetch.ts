import axios from "axios";
import { SignalsFetchOptions, SignalsFetchResponse } from "./core/types";

export const axiosFetch = async (
  url: string,
  options: SignalsFetchOptions
): Promise<SignalsFetchResponse> => {
  const res = await axios.request({
    url,
    headers: options.headers,
    method: options.method.toLowerCase(),
    data: options.body,
  });

  return {
    status: res.status,
    text: async () => {
      try {
        return JSON.stringify(res.data);
      } catch (err) {
        return res.data;
      }
    },
    json: async () => res.data,
  };
};
