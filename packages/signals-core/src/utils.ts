import { jwtDecode } from "jwt-decode";
import type { IdentifierSpecification, VersionedAttributeName } from "./types";
import type { GetAttributesResponse } from "./models/GetAttributesResponse";

export function removeTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function isJwtExpired(token: string): boolean {
  const decodedToken = jwtDecode(token);
  const currentTime = Date.now() / 1000;
  if (!decodedToken.exp) {
    throw new Error("Token invalid: no expiry date");
  }
  return currentTime >= decodedToken.exp;
}

export function formatVersionedViewAttributes({
  attributes,
  viewName,
  viewVersion,
}: {
  attributes: string[];
  viewName: string;
  viewVersion: number;
}): VersionedAttributeName[] {
  return attributes.map(
    (attribute): VersionedAttributeName =>
      `${viewName}_v${viewVersion}:${attribute}`
  );
}

export function formatGetAttributesResponse(
  response: GetAttributesResponse
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in response) {
    const value = response[key];
    if (Array.isArray(value)) {
      result[key] = value[0];
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function formatGetBatchAttributesResponse(
  response: GetAttributesResponse
): Record<string, unknown[]> {
  const result: Record<string, unknown[]> = {};
  for (const key in response) {
    const value = response[key];
    result[key] = Array.isArray(value)
      ? value.map((v) => {
          if (Array.isArray(v)) {
            return v.length > 1 ? v : v[0];
          }
          return v;
        })
      : [value];
  }
  return result;
}

export function getOnlineAttributesApiEntity({
  entity,
  identifier,
}: IdentifierSpecification) {
  return {
    [entity]: [identifier],
  };
}
