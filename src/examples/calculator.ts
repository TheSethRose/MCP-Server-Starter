/**
 * Calculator Tool Example
 *
 * This module demonstrates how to implement a basic MCP tool that performs arithmetic
 * operations. It serves as a simple example of:
 * - Tool registration
 * - Input schema definition using Zod
 * - Parameter validation
 * - Error handling
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Schema for the calculator tool parameters
 */
const CalculatorSchema = z.object({
  a: z.number().describe("First number to add"),
  b: z.number().describe("Second number to add")
});

/**
 * Registers the calculator tool with the MCP server.
 * This function demonstrates the basic pattern for adding a new tool:
 * 1. Define the tool's schema using Zod
 * 2. Register the tool with input validation
 * 3. Implement the tool's execution logic
 *
 * @param server - The MCP server instance to register the tool with
 */
export function registerCalculatorTool(server: McpServer) {
  server.tool(
    "calculate_sum",
    CalculatorSchema.shape,
    async (params) => ({
      content: [{
        type: "text",
        text: String(params.a + params.b)
      }]
    })
  );
}
