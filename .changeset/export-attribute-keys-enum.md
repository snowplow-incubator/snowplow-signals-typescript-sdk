---
"@snowplow/signals-core": patch
"@snowplow/signals-node": patch
---

Export `SnowplowStandardAttributeKeys` as a value, so the enum members can be used at runtime (for example `SnowplowStandardAttributeKeys.DOMAIN_SESSION_ID`) instead of only as a type.
