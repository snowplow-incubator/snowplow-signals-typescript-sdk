export class EntityIdentifiers {
  "domain_userid"?: Array<any> | null;
  "domain_sessionid"?: Array<any> | null;
  "network_userid"?: Array<any> | null;
  "user_id"?: Array<any> | null;

  static readonly discriminator: string | undefined = undefined;

  static readonly mapping: { [index: string]: string } | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    {
      name: "domain_userid",
      baseName: "domain_userid",
      type: "Array<any>",
      format: "",
    },
    {
      name: "domain_sessionid",
      baseName: "domain_sessionid",
      type: "Array<any>",
      format: "",
    },
    {
      name: "network_userid",
      baseName: "network_userid",
      type: "Array<any>",
      format: "",
    },
    {
      name: "user_id",
      baseName: "user_id",
      type: "Array<any>",
      format: "",
    },
  ];

  static getAttributeTypeMap() {
    return EntityIdentifiers.attributeTypeMap;
  }

  public constructor() {}
}
