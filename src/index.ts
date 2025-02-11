/**
 * Main entry point for the MCP server.
 * This file sets up the server instance, registers tools, and handles MCP protocol requests.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerCalculatorTool } from "./examples/calculator.js";
import { registerRestApiTool } from "./examples/rest-api.js";

/**
 * Create a new MCP server instance.
 * The server is configured with basic metadata and capabilities.
 *
 * @property name - The name of the server, used for identification
 * @property version - The semantic version of the server
 */
const server = new McpServer({
  name: "mcp-server-starter",
  version: "0.1.0"
});

// Register the example tools provided with the starter pack
registerCalculatorTool(server);
registerRestApiTool(server);

// Set up communication with the MCP host using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
