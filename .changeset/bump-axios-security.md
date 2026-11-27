---
"@snowplow/signals-core": patch
"@snowplow/signals-node": patch
---

Update `axios` from a pinned `1.19.0` to `^1.21.1` to resolve high-severity advisories (prototype-pollution gadgets, redirect-based SSRF, header injection, ReDoS, and HTTP/2 DNS/proxy-control bypass), which also pulls in a patched `follow-redirects`. No public API changes.
