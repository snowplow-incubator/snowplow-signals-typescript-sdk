import {
  Signals,
  type GetServiceAttributesRequest,
} from "@snowplow/signals-node";

console.log("🧪 Testing TypeScript compilation and imports...");

// Test 1: Import works with proper types
try {
  console.log("✅ Import successful");
  console.log("Signals constructor:", typeof Signals);
} catch (error) {
  console.error("❌ Import failed:", (error as Error).message);
  process.exit(1);
}

// Test 2: Type checking works
try {
  // This should compile without errors
  const requestData: GetServiceAttributesRequest = {
    attribute_key: "user",
    identifier: "test-id",
    name: "test-service",
  };

  console.log("✅ Type checking successful");
  console.log("Request data structure:", typeof requestData);
} catch (error) {
  console.error("❌ Type checking failed:", (error as Error).message);
  process.exit(1);
}

// Test 3: Instance creation with typed parameters
try {
  const signals = new Signals({
    baseUrl: "https://example.com",
    apiKey: "test-key",
    apiKeyId: "test-key-id",
    organizationId: "test-org",
  });
  console.log("✅ Typed instance creation successful");
} catch (error) {
  console.error("❌ Typed instance creation failed:", (error as Error).message);
  process.exit(1);
}

// Test 4: Method existence and typing
try {
  const signals = new Signals({
    baseUrl: "https://httpbin.org/status/200",
    apiKey: "test-key",
    apiKeyId: "test-key-id",
    organizationId: "test-org",
  });

  // Test method existence and TypeScript understands their signatures
  if (typeof signals.getServiceAttributes !== "function") {
    throw new Error("getServiceAttributes method not found");
  }

  if (typeof signals.getGroupAttributes !== "function") {
    throw new Error("getGroupAttributes method not found");
  }

  console.log("✅ Typed method existence check passed");
  console.log("Methods available with proper typing:", {
    getServiceAttributes: typeof signals.getServiceAttributes,
    getGroupAttributes: typeof signals.getGroupAttributes,
  });
} catch (error) {
  console.error("❌ Typed method calls failed:", (error as Error).message);
  process.exit(1);
}

console.log("🎉 All TypeScript tests passed!");
