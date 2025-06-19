import { createTestClient } from "../utils";

describe("Initialization", () => {
  test("Should throw on missing base_url", () => {
    expect(() => {
      createTestClient({ baseUrl: "" });
    }).toThrow("[Signals] baseUrl required for instantiation");
  });
});
