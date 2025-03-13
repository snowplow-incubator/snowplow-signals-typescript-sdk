import { Signals } from "../src/index";
import nock from "nock";

const BASE_URL = "http://localhost:8000";

describe("Signals", () => {
  test("Should throw on missing base_url", () => {
    expect(() => {
      new Signals({ baseUrl: "" });
    }).toThrow("[Signals] baseUrl is required for instantiation");
  });

  test("Should get online features using feature service", async () => {
    nock(BASE_URL)
      .post("/api/v1/get-online-features", {
        entities: { session: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"] },
        feature_service: "session_features",
      })
      .reply(200, {
        unique_product_names: [["Foo", "Bar"]],
        add_to_cart_events_count: [1],
        min_cart_value: [10.4],
      });

    const signals = new Signals({ baseUrl: BASE_URL });
    const features = await signals.getOnlineFeatures({
      entities: { session: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"] },
      feature_service: "session_features",
    });

    expect(features).toEqual({
      unique_product_names: [["Foo", "Bar"]],
      add_to_cart_events_count: [1],
      min_cart_value: [10.4],
    });
  });
});
