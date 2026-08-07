# @snowplow/signals-core

## 0.4.1

### Patch Changes

- 5af641a: Update axios version to latest stable 1.19.0 to resolve open security advisories

## 0.4.0

### Minor Changes

- 28d785d: Add `getAgenticContext` method to read the buffered event log for an identifier from the `GET /api/v1/event_log` endpoint. Returns a structured `AgenticContextResponse` by default, or an LLM-ready plain-text string when `format: "narrative"` is passed.

## 0.3.1

### Patch Changes

- d5f7b80: Update axios version to latest stable 1.15.1

## 0.3.0

### Minor Changes

- 6723bec: Add SignalsAPIError for structured error handling

### Patch Changes

- 82a90c7: Await res.text() in fetchResult

## 0.2.0

### Minor Changes

- ae7c38c: Adding sandbox authentication support
- f13e814: Renames for the latest API version

## 0.1.2

### Patch Changes

- 71001ad: Add SDK version on header

## 0.1.1

### Patch Changes

- ba98a89: Fix MJS import syntax error from unused typings

## 0.1.0

### Minor Changes

- e58487f: Add getBatchServiceAttributes method

### Patch Changes

- 13be84c: Add proper error message on API exceptions

## 0.0.6

### Patch Changes

- fd1b113: Allow any custom entity identifiers to be used to fetch online attributes
- 31c13c8: Removed `getOnlineAttributes` and replaced with `getViewAttributes` and `getServiceAttributes`

## 0.0.5

### Patch Changes

- af493e2: Update entity identifiers for GetOnlineAttributes

## 0.0.4

### Patch Changes

- 184ae7e: Adjusting to new online-features API

## 0.0.3

### Patch Changes

- ef85958: Update changelogs with instructions

## 0.0.2

### Patch Changes

- 2645ead: First public publish :rocket:
