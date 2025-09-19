import type { SignalsCoreOptions, SignalsCoreSandboxOptions } from "@snowplow/signals-core";
import { Signals } from "../src";

export const BASE_URL = "http://localhost:8000";
export const MOCK_ORG_ID = "test-org";
export const MOCK_SANDBOX_TOKEN = "test-sandbox-token";

export function createTestClient(options: Partial<SignalsCoreOptions> = {}) {
  const defaultOptions: SignalsCoreOptions = {
    baseUrl: BASE_URL,
    apiKey: "test",
    apiKeyId: "test id",
    organizationId: MOCK_ORG_ID,
  };
  return new Signals({ ...defaultOptions, ...options });
}

export function createSandboxTestClient(options: Partial<SignalsCoreSandboxOptions> = {}) {
  const defaultOptions: SignalsCoreSandboxOptions = {
    baseUrl: BASE_URL,
    sandboxToken: MOCK_SANDBOX_TOKEN,
  };
  return new Signals({ ...defaultOptions, ...options });
}
