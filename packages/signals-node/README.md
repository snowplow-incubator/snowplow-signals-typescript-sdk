# Snowplow Signals Node.js SDK

[![Apache-2.0 License](https://img.shields.io/badge/License-Apache2-red.svg?style=flat-square)](https://opensource.org/license/apache-2-0) [![npm package](https://img.shields.io/npm/v/@snowplow/signals-node?style=flat-square)](https://www.npmjs.com/package/@snowplow/signals-node)

This is the Snowplow Signals SDK for Node.js environments.

## Installation

```bash
npm i @snowplow/signals-node
# or
yarn add @snowplow/signals-node
# or
pnpm i @snowplow/signals-node
```

## Usage

```js
const signals = new Signals({
  baseUrl: SIGNALS_DEPLOYED_URL,
  apiKey: CONSOLE_API_KEY,
  apiKeyId: CONSOLE_API_KEY_ID,
  organizationId: ORG_ID,
});

const attributes = await signals.getOnlineAttributes({
  entities: { session: ["session_identifier"] },
  service: "my_service",
});
```

## Documentation (WIP)
