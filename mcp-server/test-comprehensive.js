#!/usr/bin/env node

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";

const TEST_RESULTS = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, status, details = "") {
  const symbol = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⚠";
  console.log(`${symbol} ${name}`);
  if (details) console.log(`  ${details}`);
  
  if (status === "PASS") TEST_RESULTS.passed.push(name);
  else if (status === "FAIL") TEST_RESULTS.failed.push({ name, details });
  else TEST_RESULTS.warnings.push({ name, details });
}

async function runTests() {
  console.log("🧪 VibeBuff MCP Server Comprehensive Test Suite\n");
  console.log("=" .repeat(60));
  
  const serverProcess = spawn("node", ["build/index.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      VIBEBUFF_API_URL: "https://vibebuff.dev/api"
    }
  });

  const transport = new StdioClientTransport({
    command: "node",
    args: ["build/index.js"],
    env: {
      VIBEBUFF_API_URL: "https://vibebuff.dev/api"
    }
  });

  const client = new Client({
    name: "vibebuff-test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    logTest("MCP Server Connection", "PASS", "Successfully connected to MCP server");

    console.log("\n📋 Testing Tools...");
    console.log("-".repeat(60));
    
    const toolsResult = await client.listTools();
    const expectedTools = [
      "recommend_stack",
      "search_tools", 
      "get_tool_details",
      "compare_tools",
      "get_stack_template",
      "get_categories"
    ];
    
    const foundTools = toolsResult.tools.map(t => t.name);
    expectedTools.forEach(toolName => {
      if (foundTools.includes(toolName)) {
        logTest(`Tool: ${toolName}`, "PASS");
      } else {
        logTest(`Tool: ${toolName}`, "FAIL", "Tool not found");
      }
    });

    console.log("\n🔧 Testing Tool Execution...");
    console.log("-".repeat(60));

    try {
      const searchResult = await client.callTool({
        name: "search_tools",
        arguments: {
          query: "authentication",
          limit: 5
        }
      });
      logTest("search_tools execution", "PASS", `Returned ${searchResult.content.length} content items`);
    } catch (error) {
      logTest("search_tools execution", "FAIL", error.message);
    }

    try {
      const categoriesResult = await client.callTool({
        name: "get_categories",
        arguments: {
          includeTools: true
        }
      });
      logTest("get_categories execution", "PASS", `Returned ${categoriesResult.content.length} content items`);
    } catch (error) {
      logTest("get_categories execution", "FAIL", error.message);
    }

    try {
      const recommendResult = await client.callTool({
        name: "recommend_stack",
        arguments: {
          projectDescription: "A real-time chat application with video calls",
          budget: "medium",
          scale: "startup"
        }
      });
      logTest("recommend_stack execution", "PASS", `Returned ${recommendResult.content.length} content items`);
    } catch (error) {
      logTest("recommend_stack execution", "FAIL", error.message);
    }

    try {
      const templateResult = await client.callTool({
        name: "get_stack_template",
        arguments: {
          templateType: "saas",
          budget: "free"
        }
      });
      logTest("get_stack_template execution", "PASS", `Returned ${templateResult.content.length} content items`);
    } catch (error) {
      logTest("get_stack_template execution", "FAIL", error.message);
    }

    console.log("\n📚 Testing Resources...");
    console.log("-".repeat(60));

    const resourcesResult = await client.listResources();
    const expectedResources = [
      "vibebuff://tools/all",
      "vibebuff://categories/all",
      "vibebuff://templates/all",
      "vibebuff://synergies/all",
      "vibebuff://trends/current"
    ];

    const foundResources = resourcesResult.resources.map(r => r.uri);
    expectedResources.forEach(uri => {
      if (foundResources.includes(uri)) {
        logTest(`Resource: ${uri}`, "PASS");
      } else {
        logTest(`Resource: ${uri}`, "FAIL", "Resource not found");
      }
    });

    console.log("\n📖 Testing Resource Reading...");
    console.log("-".repeat(60));

    try {
      const toolsResource = await client.readResource({
        uri: "vibebuff://categories/all"
      });
      logTest("Read vibebuff://categories/all", "PASS", `Returned ${toolsResource.contents.length} content items`);
    } catch (error) {
      logTest("Read vibebuff://categories/all", "FAIL", error.message);
    }

    console.log("\n💬 Testing Prompts...");
    console.log("-".repeat(60));

    const promptsResult = await client.listPrompts();
    const expectedPrompts = [
      "architect_stack",
      "migrate_stack",
      "optimize_stack",
      "evaluate_tool"
    ];

    const foundPrompts = promptsResult.prompts.map(p => p.name);
    expectedPrompts.forEach(promptName => {
      if (foundPrompts.includes(promptName)) {
        logTest(`Prompt: ${promptName}`, "PASS");
      } else {
        logTest(`Prompt: ${promptName}`, "FAIL", "Prompt not found");
      }
    });

    console.log("\n🎯 Testing Prompt Execution...");
    console.log("-".repeat(60));

    try {
      const promptResult = await client.getPrompt({
        name: "architect_stack",
        arguments: {
          projectType: "SaaS application",
          requirements: "Need authentication and payments"
        }
      });
      logTest("architect_stack prompt", "PASS", `Returned ${promptResult.messages.length} messages`);
    } catch (error) {
      logTest("architect_stack prompt", "FAIL", error.message);
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Test Summary");
    console.log("=".repeat(60));
    console.log(`✓ Passed: ${TEST_RESULTS.passed.length}`);
    console.log(`✗ Failed: ${TEST_RESULTS.failed.length}`);
    console.log(`⚠ Warnings: ${TEST_RESULTS.warnings.length}`);

    if (TEST_RESULTS.failed.length > 0) {
      console.log("\n❌ Failed Tests:");
      TEST_RESULTS.failed.forEach(({ name, details }) => {
        console.log(`  - ${name}: ${details}`);
      });
    }

    if (TEST_RESULTS.warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      TEST_RESULTS.warnings.forEach(({ name, details }) => {
        console.log(`  - ${name}: ${details}`);
      });
    }

    const successRate = (TEST_RESULTS.passed.length / (TEST_RESULTS.passed.length + TEST_RESULTS.failed.length) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);

    await client.close();
    serverProcess.kill();

    process.exit(TEST_RESULTS.failed.length > 0 ? 1 : 0);

  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    console.error(error.stack);
    serverProcess.kill();
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
