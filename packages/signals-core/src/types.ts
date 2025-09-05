type NonEmptyArray<T> = [T, ...T[]];

export enum SnowplowStandardAttributeKeys {
  USER_ID = "user_id",
  DOMAIN_SESSION_ID = "domain_sessionid",
  DOMAIN_USER_ID = "domain_userid",
  NETWORK_USER_ID = "network_userid",
}

export type IdentifierSpecification = {
  attribute_key: string | SnowplowStandardAttributeKeys;
  identifier: string;
};

export type GetServiceAttributesRequest = IdentifierSpecification & {
  name: string;
};

export type GetGroupAttributesRequest = IdentifierSpecification & {
  name: string;
  version: number;
  attributes: NonEmptyArray<string>;
};

export type GetBatchServiceAttributesRequest = {
  identifiers: NonEmptyArray<string>;
  name: string;
  attribute_key: string | SnowplowStandardAttributeKeys;
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
