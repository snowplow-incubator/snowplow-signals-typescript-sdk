import { jwtDecode } from "jwt-decode";

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
