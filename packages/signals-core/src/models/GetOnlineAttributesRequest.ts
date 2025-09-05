export class GetOnlineAttributesRequest {
  "attribute_keys": { [key: string]: Array<string> };
  "service"?: string | null;
  "attributes"?: Array<string> | null;
  "full_attribute_names"?: boolean;

  static readonly discriminator: string | undefined = undefined;

  static readonly mapping: { [index: string]: string } | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    {
      name: "attribute_keys",
      baseName: "attribute_keys",
      type: "{ [key: string]: Array<string>; }",
      format: "",
    },
    {
      name: "service",
      baseName: "service",
      type: "string",
      format: "",
    },
    {
      name: "attributes",
      baseName: "attributes",
      type: "Array<string>",
      format: "",
    },
    {
      name: "full_attribute_names",
      baseName: "full_attribute_names",
      type: "boolean",
      format: "",
    },
  ];

  static getAttributeTypeMap() {
    return GetOnlineAttributesRequest.attributeTypeMap;
  }

  public constructor() {}
}
