import { Signals } from "@snowplow/signals-node";

console.log("🧪 Testing ESM JavaScript imports...");

// Test 1: Import works
try {
  console.log("✅ Import successful");
  console.log("Signals constructor:", typeof Signals);
} catch (error) {
  console.error("❌ Import failed:", error.message);
  process.exit(1);
}

// Test 2: Instance creation works
try {
  const signals = new Signals({
    baseUrl: "https://example.com",
    apiKey: "test-key",
    apiKeyId: "test-key-id",
    organizationId: "test-org",
  });
  console.log("✅ Instance creation successful");
} catch (error) {
  console.error("❌ Instance creation failed:", error.message);
  process.exit(1);
}

// Test 3: Method existence and basic structure
try {
  const signals = new Signals({
    baseUrl: "https://httpbin.org/status/200",
    apiKey: "test-key",
    apiKeyId: "test-key-id",
    organizationId: "test-org",
  });

  // Test method existence
  if (typeof signals.getServiceAttributes !== "function") {
    throw new Error("getServiceAttributes method not found");
  }

  if (typeof signals.getViewAttributes !== "function") {
    throw new Error("getViewAttributes method not found");
  }

  console.log("✅ Method existence check passed");
  console.log("Methods available:", {
    getServiceAttributes: typeof signals.getServiceAttributes,
    getViewAttributes: typeof signals.getViewAttributes,
  });
} catch (error) {
  console.error("❌ Method existence check failed:", error.message);
  process.exit(1);
}

console.log("🎉 All ESM tests passed!");
