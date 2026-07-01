---
"@snowplow/signals-core": minor
"@snowplow/signals-node": minor
---

Add `getAgenticContext` method to read the buffered event log for an identifier from the `GET /api/v1/event_log` endpoint. Returns a structured `AgenticContextResponse` by default, or an LLM-ready plain-text string when `format: "narrative"` is passed.
