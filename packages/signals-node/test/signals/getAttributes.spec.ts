import nock from "nock";
import { BASE_URL, createTestClient, MOCK_ORG_ID } from "../utils";

describe("Get attributes", () => {
  beforeAll(() => {
    nock(
      `https://console.snowplowanalytics.com/api/msc/v1/organizations/${MOCK_ORG_ID}/credentials/v3/token`
    )
      .persist()
      .get("")
      .reply(200, { accessToken: "test" });
  });

  afterAll(() => {
    nock.cleanAll();
  });

  test("Should get service attributes", async () => {
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
    const attributes = await signals.getServiceAttributes({
      entities: { domain_sessionid: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"] },
      service: "session_attributes",
    });

    expect(attributes).toEqual({
      unique_product_names: [["Foo", "Bar"]],
      add_to_cart_events_count: [1],
      min_cart_value: [10.4],
    });
  });

  test("Should get view attributes", async () => {
    nock(BASE_URL)
      .post("/api/v1/get-online-attributes", {
        entities: {
          domain_sessionid: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"],
        },
        attributes: [
          "ecommerce_v1:unique_product_names",
          "ecommerce_v1:add_to_cart_events_count",
          "ecommerce_v1:min_cart_value",
        ],
      })
      .reply(200, {
        unique_product_names: [["Foo", "Bar"]],
        add_to_cart_events_count: [1],
        min_cart_value: [10.4],
      });

    const signals = createTestClient();
    const attributes = await signals.getViewAttributes({
      entities: { domain_sessionid: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"] },
      attributes: [
        "unique_product_names",
        "add_to_cart_events_count",
        "min_cart_value",
      ],
      name: "ecommerce",
      version: "1",
    });

    expect(attributes).toEqual({
      unique_product_names: [["Foo", "Bar"]],
      add_to_cart_events_count: [1],
      min_cart_value: [10.4],
    });
  });
});
