/**
 * REST API Tool Example
 *
 * This module demonstrates how to implement an MCP tool that interacts with external APIs.
 * It serves as an example of:
 * - Making HTTP requests
 * - Handling API responses
 * - Proper error handling for network requests
 * - Converting external API data into MCP tool results
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Schema for the user data returned by JSONPlaceholder API
 */
const UserDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string()
  }),
  phone: z.string(),
  website: z.string(),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string()
  })
});

/**
 * Schema for the fetch user tool parameters
 */
const FetchUserSchema = z.object({
  userId: z.number().positive().describe("ID of the user to fetch")
});

/**
 * Registers the REST API tool with the MCP server.
 * This function demonstrates how to create a tool that interacts with external services:
 * 1. Define the tool's schema using Zod
 * 2. Handle HTTP requests and responses
 * 3. Implement proper error handling for network operations
 *
 * @param server - The MCP server instance to register the tool with
 */
export function registerRestApiTool(server: McpServer) {
  server.tool(
    "fetch_user",
    FetchUserSchema.shape,
    async (params) => {
      try {
        // Make the HTTP request to the external API
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users/${params.userId}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return {
              content: [{
                type: "text",
                text: `User with ID ${params.userId} not found`
              }],
              isError: true
            };
          }
          return {
            content: [{
              type: "text",
              text: `API request failed with status ${response.status}`
            }],
            isError: true
          };
        }

        // Parse and validate the API response
        const rawData = await response.json();
        const userData = UserDataSchema.parse(rawData);

        return {
          content: [{
            type: "text",
            text: JSON.stringify(userData, null, 2)
          }]
        };
      } catch (error) {
        // Handle errors appropriately
        if (error instanceof z.ZodError) {
          return {
            content: [{
              type: "text",
              text: `Invalid API response format: ${error.message}`
            }],
            isError: true
          };
        }
        if (error instanceof Error) {
          return {
            content: [{
              type: "text",
              text: `Failed to fetch user data: ${error.message}`
            }],
            isError: true
          };
        }
        return {
          content: [{
            type: "text",
            text: "An unknown error occurred"
          }],
          isError: true
        };
      }
    }
  );
}
