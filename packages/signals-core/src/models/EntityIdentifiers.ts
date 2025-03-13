export class EntityIdentifiers {
  "session"?: Array<any> | null;
  "user"?: Array<any> | null;

  static readonly discriminator: string | undefined = undefined;

  static readonly mapping: { [index: string]: string } | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    {
      name: "session",
      baseName: "session",
      type: "Array<any>",
      format: "",
    },
    {
      name: "user",
      baseName: "user",
      type: "Array<any>",
      format: "",
    },
  ];

  static getAttributeTypeMap() {
    return EntityIdentifiers.attributeTypeMap;
  }

  public constructor() {}
}
