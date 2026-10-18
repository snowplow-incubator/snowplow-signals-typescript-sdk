<a href="https://signals.snowplow.io/"><img src="assets/signals-logo.png" width="96" alt="Snowplow Signals logo"></a>

# Snowplow Signals TypeScript SDK

[![Early Release][early-release-image]][early-release]
[![Build][build-image]][build-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license]

The TypeScript SDK for [Snowplow Signals][signals-docs], real-time customer context & digital personalization from Snowplow.

Snowplow Signals computes user attributes from behavioral data in real time and serves them over an API. This SDK is the read side of that API for Node.js and TypeScript applications: use it to retrieve a user's attributes, and to fetch agentic context, so your app, model, or agent can act on what a user is doing right now.

🚀 **[Start free](https://signals.snowplow.io/)** on the Snowplow Signals developer tier.

📚 **[Read the documentation](https://docs.snowplow.io/docs/signals/connection/#signals-nodejs-sdk)** for the full Signals Node.js SDK setup and usage guide.

## Packages

This is a monorepo of two packages:

| Package | Description |
| --- | --- |
| [`@snowplow/signals-node`][npm-url] | The SDK for Node.js and server-side TypeScript. Start here. |
| [`@snowplow/signals-core`](packages/signals-core) | The transport-agnostic core. Use it only if you are building a Signals SDK for a runtime we do not yet support. |

Both ship ECMAScript module and CommonJS builds with bundled TypeScript types.

## Installation

```bash
npm install @snowplow/signals-node
# or
yarn add @snowplow/signals-node
# or
pnpm add @snowplow/signals-node
```

## Quickstart

```ts
import { Signals } from "@snowplow/signals-node";

const signals = new Signals({
  baseUrl: SIGNALS_DEPLOYED_URL,
  apiKey: CONSOLE_API_KEY,
  apiKeyId: CONSOLE_API_KEY_ID,
  organizationId: ORG_ID,
});

// Retrieve the attributes a service exposes for one user.
const attributes = await signals.getServiceAttributes({
  name: "session_attributes",
  attribute_key: "domain_sessionid",
  identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
});

console.log(attributes);
// { add_to_cart_events_count: 1, min_cart_value: 10.4, ... }
```

## Authentication

The SDK supports two authentication modes, chosen automatically from the options you pass.

**BDP** (API key credentials from the Snowplow Console):

```ts
const signals = new Signals({
  baseUrl: SIGNALS_DEPLOYED_URL,
  apiKey: CONSOLE_API_KEY,
  apiKeyId: CONSOLE_API_KEY_ID,
  organizationId: ORG_ID,
});
```

**Sandbox** (a sandbox token, for trials and local development):

```ts
const signals = new Signals({
  baseUrl: SIGNALS_DEPLOYED_URL,
  sandboxToken: SANDBOX_TOKEN,
});
```

In BDP mode the SDK fetches a short-lived access token from the Console and refreshes it automatically when it expires.

## Retrieving attributes

Every read identifies the user by an attribute key and an identifier value. The common keys are available as the `SnowplowStandardAttributeKeys` enum (`user_id`, `domain_userid`, `domain_sessionid`, `network_userid`), and you can pass any custom key as a string.

### From a service

```ts
const attributes = await signals.getServiceAttributes({
  name: "session_attributes",
  attribute_key: "domain_sessionid",
  identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
});
```

### From an attribute group

Attribute groups are versioned, so you pass the group name, its version, and the attributes you want.

```ts
const attributes = await signals.getGroupAttributes({
  name: "ecommerce",
  version: 1,
  attribute_key: "domain_sessionid",
  identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
  attributes: ["unique_product_names", "add_to_cart_events_count", "min_cart_value"],
});
```

### For many users at once

Pass a list of identifiers to read the same service attributes in a single batch request. The result holds one value per identifier, in order.

```ts
const attributes = await signals.getBatchServiceAttributes({
  name: "session_attributes",
  attribute_key: "domain_sessionid",
  identifiers: [
    "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
    "b24d3aaa-160e-40de-a569-1580fb3ad6d8",
  ],
});
```

## Agentic context

Fetch the recent event context for a user, ready to hand to an LLM or agent. Ask for structured JSON, or a natural-language narrative.

```ts
// Structured (default)
const context = await signals.getAgenticContext({
  name: "checkout_help",
  identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
});

// Narrative text, ready to drop into a prompt
const narrative = await signals.getAgenticContext({
  name: "checkout_help",
  identifier: "e24d3aaa-160e-40de-a569-1580fb3ad6d7",
  format: "narrative",
});
```

## Other runtimes

`@snowplow/signals-node` uses `axios` for transport. To support a different runtime (the browser, an edge worker, React Native, and so on), extend `SignalsCore` from [`@snowplow/signals-core`](packages/signals-core) and implement its `fetch` method for your environment.

## Find out more

| Resource | Link |
| --- | --- |
| Signals documentation | [docs.snowplow.io/docs/signals][signals-docs] |
| Retrieving attributes | [docs.snowplow.io/docs/signals/applications/retrieve-attributes][retrieve-docs] |
| `@snowplow/signals-node` on npm | [npmjs.com/package/@snowplow/signals-node][npm-url] |
| Python SDK | [snowplow-signals-python-sdk][python-sdk] |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Copyright and License

Snowplow Signals TypeScript SDK is copyright 2025-2027 Snowplow Analytics Ltd.

Licensed under the [Apache License, Version 2.0][license] (the "License");
you may not use this software except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[npm-url]: https://www.npmjs.com/package/@snowplow/signals-node
[npm-image]: https://img.shields.io/npm/v/@snowplow/signals-node?style=flat
[license]: https://www.apache.org/licenses/LICENSE-2.0
[license-image]: https://img.shields.io/badge/license-Apache--2-blue.svg?style=flat
[signals-docs]: https://docs.snowplow.io/docs/signals/introduction/
[retrieve-docs]: https://docs.snowplow.io/docs/signals/applications/retrieve-attributes/
[python-sdk]: https://github.com/snowplow-incubator/snowplow-signals-python-sdk
[early-release]: https://github.com/snowplow/snowplow/wiki/Tracker-Maintenance-Classification
[early-release-image]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Early%20Release&color=014477&labelColor=9ba0aa
[build-url]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/actions/workflows/ci.yml
[build-image]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/actions/workflows/ci.yml/badge.svg
