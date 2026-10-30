import {
  formatVersionedGroupAttributes,
  getOnlineAttributesApiAttributeKey,
  formatGetAttributesResponse,
  formatGetBatchAttributesResponse,
  isJwtExpired,
} from "../src/utils";

const createJwt = (exp: number) => {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ exp })}.signature`;
};

describe("core utils", () => {
  test("isJwtExpired", () => {
    const now = Math.floor(Date.now() / 1000);
    expect(isJwtExpired(createJwt(now + 60))).toBe(false);
    expect(isJwtExpired(createJwt(now - 1))).toBe(true);
    expect(isJwtExpired(createJwt(now + 60), 30)).toBe(false);
    expect(isJwtExpired(createJwt(now + 20), 30)).toBe(true);
  });

  test("formatVersionedGroupAttribute", () => {
    const result = formatVersionedGroupAttributes({
      groupName: "test_group",
      groupVersion: 1,
      attributes: ["test_attribute", "test_attribute2"],
    });
    expect(result).toStrictEqual([
      "test_group_v1:test_attribute",
      "test_group_v1:test_attribute2",
    ]);
  });

  test("getOnlineAttributesApiAttributeKey", () => {
    const result = getOnlineAttributesApiAttributeKey({
      attribute_key: "domain_sessionid",
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

  test("formatGetBatchAttributesResponse", () => {
    const response = {
      domain_sessionid: [
        "85e73962-ddd2-4fa2-8901-98708d05022f",
        "b24d3aaa-160e-40de-a569-1580fb3ad6d8",
      ],
      last_cart_value: [529, null],
      add_to_cart_events_count: [1, null],
      max_cart_value: [529, null],
      unique_product_names: [["Manifest"], null],
      avg_product_price: [529, null],
      min_cart_value: [529, null],
      product_view_events_count: [5, null],
      total_product_price: [529, null],
      brand_names_viewed: [["Lib Tech", "Gnu", "Korua", "K2"], null],
      count_size_switched: [null, null],
      unique_sizes_switched: [null, null],
    };
    const result = formatGetBatchAttributesResponse(response);
    expect(result).toEqual({
      domain_sessionid: [
        "85e73962-ddd2-4fa2-8901-98708d05022f",
        "b24d3aaa-160e-40de-a569-1580fb3ad6d8",
      ],
      last_cart_value: [529, null],
      add_to_cart_events_count: [1, null],
      max_cart_value: [529, null],
      unique_product_names: ["Manifest", null],
      avg_product_price: [529, null],
      min_cart_value: [529, null],
      product_view_events_count: [5, null],
      total_product_price: [529, null],
      brand_names_viewed: [["Lib Tech", "Gnu", "Korua", "K2"], null],
      count_size_switched: [null, null],
      unique_sizes_switched: [null, null],
    });
  });
});
