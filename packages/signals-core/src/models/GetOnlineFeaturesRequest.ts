import { EntityIdentifiers } from "./EntityIdentifiers";

export class GetOnlineFeaturesRequest {
  "entities": EntityIdentifiers;
  "feature_service"?: string | null;
  "features"?: Array<string> | null;
  "full_feature_names"?: boolean;

  static readonly discriminator: string | undefined = undefined;

  static readonly mapping: { [index: string]: string } | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    {
      name: "entities",
      baseName: "entities",
      type: "EntityIdentifiers",
      format: "",
    },
    {
      name: "feature_service",
      baseName: "feature_service",
      type: "string",
      format: "",
    },
    {
      name: "features",
      baseName: "features",
      type: "Array<string>",
      format: "",
    },
    {
      name: "full_feature_names",
      baseName: "full_feature_names",
      type: "boolean",
      format: "",
    },
  ];

  static getAttributeTypeMap() {
    return GetOnlineFeaturesRequest.attributeTypeMap;
  }

  public constructor() {}
}
