# Snowplow Signals JavaScript Core

[![Apache-2.0 License](https://img.shields.io/badge/License-Apache2-red.svg?style=flat-square)](https://opensource.org/license/apache-2-0) [![npm package](https://img.shields.io/npm/v/@snowplow/signals-core?style=flat-square)](https://www.npmjs.com/package/@snowplow/signals-core)

This is the Snowplow Signals core for JavaScript SDKs. You would use this only if you want to extend the available packages or integrate with an environment we not yet support.

## Installation

```bash
npm i @snowplow/signals-core
# or
yarn add @snowplow/signals-core
# or
pnpm i @snowplow/signals-core
```

## Extending

Every new package/implementation should extend from `SignalsCore` and implement the required functionality to work properly in the target environment. An example can be seen in the [Node.js implementation](../signals-node/src/Signals.ts).
