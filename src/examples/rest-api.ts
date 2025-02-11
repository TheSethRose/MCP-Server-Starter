/**
 * REST API Tool Example
 *
 * This module demonstrates how to implement an MCP tool that interacts with external APIs.
 * It serves as a comprehensive example of:
 * - Making HTTP requests with proper error handling
 * - Input validation and schema enforcement
 * - Retry logic for transient failures
 * - Rate limiting protection
 * - Proper error reporting through MCP
 * - Type-safe response handling
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Constants for retry logic
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Schema for the user data returned by JSONPlaceholder API.
 * This demonstrates proper schema validation for external data.
 */
const UserDataSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  address: z.object({
    street: z.string(),
    suite: z.string(),
    city: z.string(),
    zipcode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid zipcode format")
  }),
  phone: z.string().regex(/^[0-9-().+ ]+$/, "Invalid phone format"),
  website: z.string().url(),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string()
  })
}).strict(); // Ensures no extra fields

type UserData = z.infer<typeof UserDataSchema>;

/**
 * Schema for the fetch user tool parameters
 */
const FetchUserSchema = z.object({
  userId: z.number()
    .positive()
    .int()
    .describe("ID of the user to fetch (must be a positive integer)")
});

/**
 * Helper function to implement exponential backoff for retries
 * @param attempt - Current retry attempt number
 * @returns Delay in milliseconds before next retry
 */
function getRetryDelay(attempt: number): number {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt);
}

/**
 * Helper function to format user data into a readable string
 * @param userData - Validated user data object
 * @returns Formatted string representation
 */
function formatUserData(userData: UserData): string {
  return `
User Profile:
  Name: ${userData.name}
  Username: ${userData.username}
  Email: ${userData.email}
  Address: ${userData.address.street}, ${userData.address.suite}
           ${userData.address.city}, ${userData.address.zipcode}
  Phone: ${userData.phone}
  Website: ${userData.website}
  Company: ${userData.company.name}
          "${userData.company.catchPhrase}"
`.trim();
}

/**
 * Registers the REST API tool with the MCP server.
 * This function demonstrates how to create a tool that interacts with external services:
 * 1. Define strict input validation
 * 2. Implement retry logic for resilience
 * 3. Handle all possible error cases
 * 4. Format responses for optimal LLM consumption
 *
 * @param server - The MCP server instance to register the tool with
 */
export function registerRestApiTool(server: McpServer) {
  server.tool(
    "fetch_user",
    "Fetch user details from JSONPlaceholder API",
    FetchUserSchema.shape,
    async (params) => {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Add user agent and accept headers for proper API etiquette
          const response = await fetch(
            `https://jsonplaceholder.typicode.com/users/${params.userId}`,
            {
              headers: {
                'User-Agent': 'MCP-Example-Server/1.0',
                'Accept': 'application/json'
              }
            }
          );

          // Handle different HTTP status codes appropriately
          if (response.status === 404) {
            return {
              content: [{
                type: "text",
                text: `User with ID ${params.userId} not found`
              }],
              isError: true
            };
          }

          if (response.status === 429) {
            // If we're rate limited and out of retries, report it
            if (attempt === MAX_RETRIES - 1) {
              return {
                content: [{
                  type: "text",
                  text: "Rate limit exceeded. Please try again later."
                }],
                isError: true
              };
            }
            // Otherwise wait and retry
            await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
            continue;
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Parse and validate the API response
          const rawData = await response.json();
          const userData = UserDataSchema.parse(rawData);

          // Return formatted user data
          return {
            content: [{
              type: "text",
              text: formatUserData(userData)
            }]
          };

        } catch (error) {
          // On last attempt, handle the error appropriately
          if (attempt === MAX_RETRIES - 1) {
            if (error instanceof z.ZodError) {
              return {
                content: [{
                  type: "text",
                  text: `Invalid API response format: ${error.errors.map(e => e.message).join(", ")}`
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
                text: "An unknown error occurred while fetching user data"
              }],
              isError: true
            };
          }

          // If not the last attempt, wait and retry
          await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt)));
        }
      }

      // This should never be reached due to error handling above
      return {
        content: [{
          type: "text",
          text: "Failed to fetch user data after all retry attempts"
        }],
        isError: true
      };
    }
  );
}
