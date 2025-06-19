import {
  formatVersionedViewAttributes,
  getOnlineAttributesApiEntity,
  formatGetAttributesResponse,
} from "../src/utils";

describe("core utils", () => {
  test("formatVersionedViewAttribute", () => {
    const result = formatVersionedViewAttributes({
      viewName: "test_view",
      viewVersion: 1,
      attributes: ["test_attribute", "test_attribute2"],
    });
    expect(result).toBe([
      "test_view_v1:test_attribute",
      "test_view_v1:test_attribute2",
    ]);
  });

  test("getOnlineAttributesApiEntity", () => {
    const result = getOnlineAttributesApiEntity({
      entity: "domain_sessionid",
      identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
    });
    expect(result).toEqual({
      domain_sessionid: ["e24d3aaa-160e-40de-a569-1580fb3ad6d7"],
    });
  });

  test("formatGetAttributesResponse", () => {
    const response = {
      unique_product_names: [["Foo", "Bar"]],
      add_to_cart_events_count: [1],
      min_cart_value: [10.4],
      brands_viewed: [[]],
    };
    const result = formatGetAttributesResponse(response);
    expect(result).toEqual({
      unique_product_names: ["Foo", "Bar"],
      add_to_cart_events_count: 1,
      min_cart_value: 10.4,
      brands_viewed: [],
    });
  });
});
