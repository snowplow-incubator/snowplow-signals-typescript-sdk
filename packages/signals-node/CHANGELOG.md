# @snowplow/signals-node

## 0.4.1

### Patch Changes

- 5af641a: Update axios version to latest stable 1.19.0 to resolve open security advisories
- Updated dependencies [5af641a]
  - @snowplow/signals-core@0.4.1

## 0.4.0

### Minor Changes

- 28d785d: Add `getAgenticContext` method to read the buffered event log for an identifier from the `GET /api/v1/event_log` endpoint. Returns a structured `AgenticContextResponse` by default, or an LLM-ready plain-text string when `format: "narrative"` is passed.

### Patch Changes

- Updated dependencies [28d785d]
  - @snowplow/signals-core@0.4.0

## 0.3.1

### Patch Changes

- d5f7b80: Update axios version to latest stable 1.15.1
- Updated dependencies [d5f7b80]
  - @snowplow/signals-core@0.3.1

## 0.3.0

### Patch Changes

- Updated dependencies [6723bec]
- Updated dependencies [82a90c7]
  - @snowplow/signals-core@0.3.0

## 0.2.0

### Minor Changes

- ae7c38c: Adding sandbox authentication support
- f13e814: Renames for the latest API version

### Patch Changes

- Updated dependencies [ae7c38c]
- Updated dependencies [f13e814]
  - @snowplow/signals-core@0.2.0

## 0.1.2

### Patch Changes

- 71001ad: Add SDK version on header
- Updated dependencies [71001ad]
  - @snowplow/signals-core@0.1.2

## 0.1.1

### Patch Changes

- ba98a89: Fix MJS import syntax error from unused typings
- Updated dependencies [ba98a89]
  - @snowplow/signals-core@0.1.1

## 0.1.0

### Minor Changes

- e58487f: Add getBatchServiceAttributes method

### Patch Changes

- 13be84c: Add proper error message on API exceptions
- Updated dependencies [e58487f]
- Updated dependencies [13be84c]
  - @snowplow/signals-core@0.1.0

## 0.0.6

### Patch Changes

- fd1b113: Allow any custom entity identifiers to be used to fetch online attributes
- 31c13c8: Removed `getOnlineAttributes` and replaced with `getViewAttributes` and `getServiceAttributes`
- Updated dependencies [fd1b113]
- Updated dependencies [31c13c8]
  - @snowplow/signals-core@0.0.6

## 0.0.5

### Patch Changes

- af493e2: Update entity identifiers for GetOnlineAttributes
- Updated dependencies [af493e2]
  - @snowplow/signals-core@0.0.5

## 0.0.4

### Patch Changes

- 184ae7e: Adjusting to new online-features API
- Updated dependencies [184ae7e]
  - @snowplow/signals-core@0.0.4

## 0.0.3

### Patch Changes

- ef85958: Update changelogs with instructions
- Updated dependencies [ef85958]
  - @snowplow/signals-core@0.0.3

## 0.0.2

### Patch Changes

- 2645ead: First public publish :rocket:
- Updated dependencies [2645ead]
  - @snowplow/signals-core@0.0.2
