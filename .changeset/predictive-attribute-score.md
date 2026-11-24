---
"@snowplow/signals-core": minor
"@snowplow/signals-node": minor
---

Add `getPredictiveAttributeScore` method to score a published predictive attribute for an entity from the `GET /api/v1/predictive_attribute` endpoint. Takes one identifier per attribute key used by the model's input attribute groups and returns a `PredictiveAttributeScore`.
