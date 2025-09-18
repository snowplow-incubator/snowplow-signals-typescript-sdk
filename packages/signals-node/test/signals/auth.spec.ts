import { createTestClient, createSandboxTestClient } from "../utils";

describe("Auth", () => {
  test("Should throw on failed BDP auth", async () => {
    const signals = createTestClient();

    await expect(async () => {
      await signals.getServiceAttributes({
        attribute_key: "domain_sessionid",
        identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
        name: "session_attributes",
      });
    }).rejects.toThrow("[Signals] Failed to fetch access token");
  });

  test("Should initialize with sandbox mode", () => {
    expect(() => {
      createSandboxTestClient();
    }).not.toThrow();
  });

  test("Should throw when sandbox mode is missing token", () => {
    expect(() => {
      createSandboxTestClient({ sandboxToken: undefined });
    }).toThrow("[Signals] sandboxToken required when authMode is \"sandbox\"");
  });

  test("Should throw when BDP mode is missing apiKey", () => {
    expect(() => {
      createTestClient({ apiKey: undefined });
    }).toThrow("[Signals] apiKey required for BDP authentication mode");
  });

  test("Should throw when BDP mode is missing apiKeyId", () => {
    expect(() => {
      createTestClient({ apiKeyId: undefined });
    }).toThrow("required for BDP authentication mode");
  });

  test("Should throw when BDP mode is missing organizationId", () => {
    expect(() => {
      createTestClient({ organizationId: undefined });
    }).toThrow("required for BDP authentication mode");
  });

  test("Should throw when baseUrl is missing", () => {
    expect(() => {
      createTestClient({ baseUrl: undefined as any });
    }).toThrow("[Signals] baseUrl required for instantiation");
  });
});
