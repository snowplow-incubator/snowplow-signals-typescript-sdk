---
"@snowplow/signals-core": patch
"@snowplow/signals-node": patch
---

Fetch the BDP access token once when concurrent requests find it missing or expired, instead of once per request. The token is now refreshed 30 seconds before it expires, and an error or empty token response now fails with `Failed to fetch access token` instead of sending `Bearer undefined`. The error message now includes the underlying reason.
