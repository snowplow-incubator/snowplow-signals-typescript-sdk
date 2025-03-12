import { EntityIdentifiers } from "./EntityIdentifiers";

export class GetOnlineFeaturesRequest {
  "entities": EntityIdentifiers;
  "featureService"?: string | null;
  "features"?: Array<string> | null;
  "fullFeatureNames"?: boolean;

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
      name: "featureService",
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
      name: "fullFeatureNames",
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
