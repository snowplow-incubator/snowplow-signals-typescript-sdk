export function removeTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}
