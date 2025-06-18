import {
  formatVersionedViewAttributes,
  getOnlineAttributesApiEntity,
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
});
