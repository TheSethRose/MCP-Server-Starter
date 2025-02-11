/**
 * Calculator Tool Example
 *
 * This module demonstrates how to implement a basic MCP tool that performs arithmetic
 * operations. It serves as a simple example of:
 * - Tool registration with proper error handling
 * - Input schema definition using Zod
 * - Parameter validation with descriptive errors
 * - Structured error responses
 * - Proper type safety
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Schema for the calculator tool parameters.
 * Using Zod for runtime type safety and validation.
 */
const CalculatorSchema = z.object({
  a: z.number()
    .describe("First number for calculation")
    .finite()
    .safe(),
  b: z.number()
    .describe("Second number for calculation")
    .finite()
    .safe(),
  operation: z.enum(['add', 'subtract', 'multiply', 'divide'])
    .describe("The arithmetic operation to perform")
});

/**
 * Registers the calculator tool with the MCP server.
 * This function demonstrates the basic pattern for adding a new tool:
 * 1. Define the tool's schema using Zod for runtime validation
 * 2. Register the tool with proper error handling
 * 3. Implement the tool's execution logic with safety checks
 * 4. Return structured responses for both success and error cases
 *
 * @param server - The MCP server instance to register the tool with
 * @throws Will not throw - all errors are handled and returned in the response
 */
export function registerCalculatorTool(server: McpServer) {
  server.tool(
    "calculate",
    "Perform basic arithmetic operations",
    CalculatorSchema.shape,
    async (params) => {
      try {
        let result: number;

        switch (params.operation) {
          case 'add':
            result = params.a + params.b;
            break;
          case 'subtract':
            result = params.a - params.b;
            break;
          case 'multiply':
            result = params.a * params.b;
            break;
          case 'divide':
            if (params.b === 0) {
              return {
                content: [{
                  type: "text",
                  text: "Division by zero is not allowed"
                }],
                isError: true
              };
            }
            result = params.a / params.b;
            break;
        }

        // Check for overflow/underflow
        if (!Number.isFinite(result)) {
          return {
            content: [{
              type: "text",
              text: "Result is too large or small to represent"
            }],
            isError: true
          };
        }

        return {
          content: [{
            type: "text",
            text: String(result)
          }]
        };
      } catch (error) {
        // Handle any unexpected errors
        return {
          content: [{
            type: "text",
            text: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );
}
