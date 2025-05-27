import nock from "nock";
import { BASE_URL, createTestClient, MOCK_ORG_ID } from "./utils";

describe("Signals", () => {
  test("Should throw on missing base_url", () => {
    expect(() => {
      createTestClient({ baseUrl: "" });
    }).toThrow("[Signals] baseUrl required for instantiation");
  });

  test("Should throw on failed auth", async () => {
    const signals = createTestClient();

    await expect(async () => {
      await signals.getOnlineAttributes({
        entities: {
          domain_sessionid: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"],
        },
        service: "session_attributes",
      });
    }).rejects.toThrow("[Signals] Failed to fetch access token");
  });

  test("Should get online attributes using feature service", async () => {
    nock(
      `https://console.snowplowanalytics.com/api/msc/v1/organizations/${MOCK_ORG_ID}/credentials/v3/token`
    )
      .get("")
      .reply(200, { accessToken: "test" });

    nock(BASE_URL)
      .post("/api/v1/get-online-attributes", {
        entities: {
          domain_sessionid: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"],
        },
        service: "session_attributes",
      })
      .reply(200, {
        unique_product_names: [["Foo", "Bar"]],
        add_to_cart_events_count: [1],
        min_cart_value: [10.4],
      });

    const signals = createTestClient();
    const attributes = await signals.getOnlineAttributes({
      entities: { domain_sessionid: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"] },
      service: "session_attributes",
    });

    expect(attributes).toEqual({
      unique_product_names: [["Foo", "Bar"]],
      add_to_cart_events_count: [1],
      min_cart_value: [10.4],
    });
  });
});
