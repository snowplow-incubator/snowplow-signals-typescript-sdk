// Currently openapi generates Entities type inline on the server models.
type Entities = { [key: string]: string[] };

export type GetServiceAttributesRequest = {
  service: string;
  entities: Entities;
};

export type GetViewAttributesRequest = {
  name: string;
  version: number;
  attributes: string[];
  entities: Entities;
};

export type VersionedAttributeName = `${string}_v${number}:${string}`;

export type SignalsFetchOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH";
  headers: { [key: string]: string };
  body?: string;
};

export type SignalsFetchResponse<T = any> = {
  status: number;
  text: () => Promise<string>;
  json: () => Promise<T>;
};

export type SignalsCoreOptions = {
  baseUrl: string;
  apiKey: string;
  apiKeyId: string;
  organizationId: string;
};
