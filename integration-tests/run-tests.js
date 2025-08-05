#!/usr/bin/env node

/**
 * Comprehensive integration test runner
 * Tests the package across ESM, CommonJS, and TypeScript environments
 */

const { spawn } = require("child_process");
const path = require("path");

const TESTS = [
  { name: "ESM JavaScript", dir: ".", cmd: "npm", args: ["run", "test:esm"] },
  {
    name: "CommonJS JavaScript",
    dir: ".",
    cmd: "npm",
    args: ["run", "test:cjs"],
  },
  {
    name: "TypeScript",
    dir: ".",
    cmd: "npm",
    args: ["run", "test:typescript"],
  },
];

async function runCommand(name, dir, cmd, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Running ${name} test...`);
    console.log(`📁 Directory: ${dir}`);
    console.log(`🔨 Command: ${cmd} ${args.join(" ")}`);
    console.log("".padEnd(50, "-"));

    const child = spawn(cmd, args, {
      cwd: path.join(__dirname, dir),
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${name} test passed!`);
        resolve();
      } else {
        console.error(`❌ ${name} test failed with code ${code}`);
        reject(new Error(`${name} test failed`));
      }
    });

    child.on("error", (error) => {
      console.error(`❌ ${name} test error:`, error.message);
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log("🚀 Starting comprehensive integration tests...");
  console.log(
    "This will test @snowplow/signals-node across different environments\n"
  );

  const results = [];

  for (const test of TESTS) {
    try {
      await runCommand(test.name, test.dir, test.cmd, test.args);
      results.push({ ...test, status: "PASSED" });
    } catch (error) {
      results.push({ ...test, status: "FAILED", error: error.message });
    }
  }

  // Summary
  console.log("\n" + "=".padEnd(60, "="));
  console.log("📊 INTEGRATION TEST SUMMARY");
  console.log("=".padEnd(60, "="));

  results.forEach((result) => {
    const status = result.status === "PASSED" ? "✅" : "❌";
    console.log(`${status} ${result.name}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const passedCount = results.filter((r) => r.status === "PASSED").length;
  const totalCount = results.length;

  console.log(`\n📈 Results: ${passedCount}/${totalCount} tests passed`);

  if (passedCount === totalCount) {
    console.log(
      "🎉 All integration tests passed! Package is compatible across all targets."
    );
    process.exit(0);
  } else {
    console.error(
      "💥 Some integration tests failed. Please check the output above."
    );
    process.exit(1);
  }
}

// Handle script termination
process.on("SIGINT", () => {
  console.log("\n⚠️ Integration tests interrupted");
  process.exit(1);
});

// Run the tests
runAllTests().catch((error) => {
  console.error("💥 Integration test runner failed:", error.message);
  process.exit(1);
});
