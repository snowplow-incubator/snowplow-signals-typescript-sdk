# Integration Tests

This directory contains comprehensive integration tests for `@snowplow/signals-node` to ensure compatibility across:

- **ESM JavaScript** (`esm-project/`) - Modern ES modules
- **CommonJS JavaScript** (`cjs-project/`) - Traditional Node.js modules
- **TypeScript** (`typescript-project/`) - Full TypeScript compilation and type checking

## Structure

```
integration-tests/
├── package.json           # Main test runner scripts
├── run-tests.js          # Comprehensive test orchestrator
├── esm-project/          # ESM JavaScript test
├── cjs-project/          # CommonJS JavaScript test
└── typescript-project/   # TypeScript compilation test
```

## Usage

### Run all tests

```bash
# From project root
npm run test:integration

# Or from integration-tests directory
npm test
```

### Run individual tests

```bash
npm run test:esm        # ESM only
npm run test:cjs        # CommonJS only
npm run test:typescript # TypeScript only
```

### Clean up

```bash
npm run clean  # Remove all node_modules and build artifacts
```

## What These Tests Verify

✅ **Import/Require Compatibility**: Package can be imported in all module systems  
✅ **Runtime Compatibility**: No runtime errors during basic usage  
✅ **Type Safety**: TypeScript compilation works with proper type exports  
✅ **API Surface**: All public methods are accessible and callable  
✅ **Bundle Formats**: Both ESM (.mjs) and CommonJS (.js) bundles work

## Test Strategy

- **No Network Calls**: Tests focus on import/runtime compatibility, not API functionality
- **Smoke Tests**: Verify basic instantiation and method calls don't throw
- **Type Checking**: Ensure TypeScript compilation succeeds with proper type inference
- **Cross-Platform**: Tests work on different Node.js versions and environments

## CI Integration

Add to your CI workflow:

```yaml
- name: Build package
  run: npm run build

- name: Run integration tests
  run: npm run test:integration
```

This ensures your package works correctly for all consumers regardless of their module system choice.
