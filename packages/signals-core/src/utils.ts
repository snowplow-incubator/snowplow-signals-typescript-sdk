import { jwtDecode } from "jwt-decode";
import { VersionedAttributeName } from "./types";

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

export function formatVersionedViewAttribute({
  viewName,
  viewVersion,
  attribute,
}: {
  viewName: string;
  viewVersion: string | number;
  attribute: string;
}): VersionedAttributeName {
  return `${viewName}_v${viewVersion}:${attribute}`;
}
