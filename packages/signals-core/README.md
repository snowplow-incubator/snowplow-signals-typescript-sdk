<a href="https://signals.snowplow.io/"><img src="https://raw.githubusercontent.com/snowplow-incubator/snowplow-signals-typescript-sdk/main/assets/signals-logo.png" width="96" alt="Snowplow Signals logo"></a>

# Snowplow Signals Core

[![Early Release][early-release-image]][early-release]
[![Build][build-image]][build-url]
[![npm version][npm-image]][npm-url]
[![License][license-image]][license]

The transport-agnostic core of the TypeScript SDK for [Snowplow Signals][signals-docs], real-time customer context & digital personalization from Snowplow.

> Building a Node.js or server-side TypeScript app? Use [`@snowplow/signals-node`][node-npm-url] instead. This package is for building a Signals SDK for a runtime we do not yet support.

Snowplow Signals computes user attributes from behavioral data in real time and serves them over an API. This package holds everything an SDK needs to read from that API except the HTTP transport: authentication, request building, and response parsing for service attributes, attribute groups, batch reads, and agentic context. You supply the transport for your runtime (the browser, an edge worker, React Native, and so on) by implementing a single `fetch` method.

🚀 **[Start free](https://signals.snowplow.io/)** on the Snowplow Signals developer tier.

📚 **[Read the documentation](https://docs.snowplow.io/docs/signals/connection/#signals-nodejs-sdk)** for the full Signals SDK setup and usage guide.

The package ships ECMAScript module and CommonJS builds with bundled TypeScript types.

## Installation

```bash
npm install @snowplow/signals-core
# or
yarn add @snowplow/signals-core
# or
pnpm add @snowplow/signals-core
```

## Building an SDK

Extend the abstract `SignalsCore` class and implement `fetch`. The core calls it for every HTTP request it makes, including the Console token request in BDP mode. Your implementation receives the URL, the method, the headers, and an optional string body, and returns the status code with `text()` and `json()` accessors for the response body.

This example uses the global `fetch` available in browsers, edge runtimes, and modern Node.js:

```ts
import { SignalsCore } from "@snowplow/signals-core";
import type {
  SignalsCoreOptions,
  SignalsCoreSandboxOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "@snowplow/signals-core";

export class Signals extends SignalsCore {
  constructor(params: SignalsCoreOptions | SignalsCoreSandboxOptions) {
    super(params);
  }

  async fetch(url: string, options: SignalsFetchOptions): Promise<SignalsFetchResponse> {
    const res = await fetch(url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
    });
    const body = await res.text();

    return {
      status: res.status,
      text: async () => body,
      json: async () => JSON.parse(body),
    };
  }
}
```

The Node.js SDK is a working reference: see [`Signals.ts`][node-signals-src] and its [`axios` transport][node-axios-src].

## Using your SDK

Your class inherits the full Signals API from `SignalsCore`, with the same authentication modes as the Node.js SDK.

```ts
// BDP, with API key credentials from the Snowplow Console
const signals = new Signals({
  baseUrl: SIGNALS_DEPLOYED_URL,
  apiKey: CONSOLE_API_KEY,
  apiKeyId: CONSOLE_API_KEY_ID,
  organizationId: ORG_ID,
});

// Sandbox, with a sandbox token for trials and local development
const sandbox = new Signals({
  baseUrl: SIGNALS_DEPLOYED_URL,
  sandboxToken: SANDBOX_TOKEN,
});
```

In BDP mode the core fetches a short-lived access token from the Console and refreshes it automatically when it expires.

| Method | What it returns |
| --- | --- |
| `getServiceAttributes` | The attributes a service exposes for one user. |
| `getGroupAttributes` | Selected attributes from a versioned attribute group for one user. |
| `getBatchServiceAttributes` | Service attributes for many users in a single request, one value per identifier, in order. |
| `getAgenticContext` | Recent event context for a user, as structured JSON or a natural-language narrative. |

See the [`@snowplow/signals-node` README][node-npm-url] for examples of each method.

## Find out more

| Resource | Link |
| --- | --- |
| Signals documentation | [docs.snowplow.io/docs/signals][signals-docs] |
| Retrieving attributes | [docs.snowplow.io/docs/signals/applications/retrieve-attributes][retrieve-docs] |
| `@snowplow/signals-node` on npm | [npmjs.com/package/@snowplow/signals-node][node-npm-url] |
| Source code | [snowplow-signals-typescript-sdk][repo-url] |
| Changelog | [CHANGELOG.md][changelog] |

## Contributing

See [CONTRIBUTING.md][contributing].

## Copyright and License

Snowplow Signals TypeScript SDK is copyright 2025-2027 Snowplow Analytics Ltd.

Licensed under the [Apache License, Version 2.0][license] (the "License");
you may not use this software except in compliance with the License.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

[npm-url]: https://www.npmjs.com/package/@snowplow/signals-core
[npm-image]: https://img.shields.io/npm/v/@snowplow/signals-core?style=flat
[node-npm-url]: https://www.npmjs.com/package/@snowplow/signals-node
[node-signals-src]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/blob/main/packages/signals-node/src/Signals.ts
[node-axios-src]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/blob/main/packages/signals-node/src/axiosFetch.ts
[license]: https://www.apache.org/licenses/LICENSE-2.0
[license-image]: https://img.shields.io/badge/license-Apache--2-blue.svg?style=flat
[signals-docs]: https://docs.snowplow.io/docs/signals/introduction/
[retrieve-docs]: https://docs.snowplow.io/docs/signals/applications/retrieve-attributes/
[repo-url]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk
[changelog]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/blob/main/packages/signals-core/CHANGELOG.md
[contributing]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/blob/main/CONTRIBUTING.md
[early-release]: https://github.com/snowplow/snowplow/wiki/Tracker-Maintenance-Classification
[early-release-image]: https://img.shields.io/static/v1?style=flat&label=Snowplow&message=Early%20Release&color=014477&labelColor=9ba0aa
[build-url]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/actions/workflows/ci.yml
[build-image]: https://github.com/snowplow-incubator/snowplow-signals-typescript-sdk/actions/workflows/ci.yml/badge.svg
