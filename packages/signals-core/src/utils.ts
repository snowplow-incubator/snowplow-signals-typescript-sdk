import { jwtDecode } from "jwt-decode";
import { IdentifierSpecification, VersionedAttributeName } from "./types";

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

export function getOnlineAttributesApiEntity({
  entity,
  identifier,
}: IdentifierSpecification) {
  return {
    [entity]: [identifier],
  };
}
