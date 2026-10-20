---
"@snowplow/signals-core": minor
"@snowplow/signals-node": minor
---

Add `Signals#publishIntervention(targets, intervention)` to the Node SDK, covering the `POST /api/v1/interventions` endpoint. Publishes an intervention to any subscribers currently listening for the given attribute-key targets and returns the delivery status (`success` / `undelivered` / `failure`). Adds the `InterventionInstance`, `TargetAttributeKey`, `AttributeKeyIdentifiers`, and `PublishInterventionStatus` types.
