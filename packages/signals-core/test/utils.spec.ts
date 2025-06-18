import { formatVersionedViewAttribute } from "../src/utils";

describe("core utils", () => {
  test("formatVersionedViewAttribute", () => {
    const result = formatVersionedViewAttribute({
      viewName: "test_view",
      viewVersion: 1,
      attribute: "test_attribute",
    });
    expect(result).toBe("test_view_v1:test_attribute");
  });
});
