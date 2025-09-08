import { createTestClient } from "../utils";

describe("Auth", () => {
  test("Should throw on failed auth", async () => {
    const signals = createTestClient();

    await expect(async () => {
      await signals.getServiceAttributes({
        attribute_key: "domain_sessionid",
        identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
        name: "session_attributes",
      });
    }).rejects.toThrow("[Signals] Failed to fetch access token");
  });
});
