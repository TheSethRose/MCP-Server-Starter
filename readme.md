## What is MCP?

The Model Context Protocol (MCP) is a specialized framework designed to streamline the process of enabling AI agents to interact with a wide array of tools. This starter template helps you quickly build a Model Context Protocol (MCP) server using TypeScript. It provides a robust foundation that you can easily extend to create advanced MCP tools and seamlessly integrate them with AI assistants like Claude or other MCP-supported platforms. By following this guide, you can effectively design, build, and manage custom functionalities without the overhead of writing specialized integration code.

It is divided into three core components:

- **MCP Servers**: These servers act as bridges, exposing APIs, databases, and code libraries to external AI hosts. By implementing an MCP server in Python or TypeScript, developers can share data sources or computational logic in a standardized way.
- **MCP Clients**: These are the consumer-facing side of MCP, communicating with servers to query data or perform actions. MCP clients also use Python or TypeScript SDKs, ensuring a uniform approach to tool usage.
- **MCP Hosts**: Systems such as Claude Desktop, Zed, and Sourcegraph Cody coordinate requests between servers and clients, ensuring seamless data flow. A single MCP server can thus be accessed by multiple AI hosts without custom integrations.

By using MCP, developers no longer need complex custom code to integrate new tools or services. Instead, they build an MCP server and make it available to supported hosts.

## Prerequisites

- **Node.js (v18 or later)**: A modern version of Node.js that takes advantage of the latest JavaScript features and performance improvements.
- **npm (v7 or later)**: Ensures compatibility for installing and managing packages.
- **VS Code with Dev Containers extension**: Allows you to quickly spin up a reproducible development environment, making collaboration easier and more efficient.

## Project Structure

A typical file layout for the MCP server template may look like this:

```
mcp-server/
├── .devcontainer/        # Dev container configuration
│   └── devcontainer.json
├── src/
│   ├── index.ts         # MCP Server main entry point
│   └── examples/        # Example tool implementations
│       ├── calculator.ts # Calculator tool example
│       └── rest-api.ts  # REST API tool example
├── package.json         # Project configuration
└── tsconfig.json        # TypeScript configuration
```

The `.devcontainer` directory streamlines container-based development, while the `src/` folder houses the main server logic and examples of custom tools. This structure keeps your project organized and easy to navigate.

## Quick Start

1. **Clone this template**: Retrieve the repository files from your preferred source.
2. **Open in VS Code with Dev Containers**: If you have the Dev Containers extension installed, you will be prompted to open this project inside a container.
3. **Install dependencies**:
   ```bash
   npm install
   ```
   This command fetches and installs all required packages for the MCP server.
4. **Build the project**:
   ```bash
   npm run build
   ```
   This compiles your TypeScript code into JavaScript, preparing it for runtime.

## Development Scripts

- **Build the project**:
  ```bash
  npm run build
  ```
  Compiles your TypeScript source and sets file permissions for the main entry point.

- **Watch mode**:
  ```bash
  npm run watch
  ```
  Automatically recompiles TypeScript files whenever changes are made, ideal for active development.

- **Run with inspector**:
  ```bash
  npm run inspector
  ```
  Launches the server alongside a debugging tool, enabling you to trace issues, set breakpoints, and inspect variables in real time.

## Setting Up Your MCP Server

### Step 1: Install Dependencies

Create a new project directory and initialize an npm package. Include dependencies for both MCP functionality and TypeScript to ensure robust type-checking and maintainability.

Below is a sample `package.json` demonstrating a possible configuration for your server:

```json
{
  "name": "mcp-server",
  "version": "0.1.0",
  "description": "A Model Context Protocol server example",
  "private": true,
  "type": "module",
  "bin": {
    "mcp-server": "./build/index.js"
  },
  "files": [
    "build"
  ],
  "scripts": {
    "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
    "prepare": "npm run build",
    "watch": "tsc --watch",
    "inspector": "npx @modelcontextprotocol/inspector build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "typescript": "^5.3.3"
  }
}
```

Next, configure TypeScript in `tsconfig.json` to dictate how the compiler processes your code:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

This setup ensures you have access to modern JavaScript features and helps catch potential type issues early. The `"strict": true` option enforces stricter checks, reducing runtime bugs.

### Step 2: Example Tools

First, set up your main server entry point (`src/index.ts`):

```typescript
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
```

Then, create your tool implementations. Each tool should be in its own file under the `src/examples/` directory:

#### Calculator Tool Example

Below is a simple arithmetic tool that adds two numbers:

```typescript
/**
 * Calculator Tool Example
 *
 * This module demonstrates how to implement a basic MCP tool that performs arithmetic
 * operations. It highlights:
 * - Tool registration
 * - Input schema definition using Zod
 * - Parameter validation
 * - Error handling
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Schema for the calculator tool parameters.
 * Descriptions clarify the purpose of each parameter for AI agents.
 */
const CalculatorSchema = z.object({
  a: z.number().describe("First number to add"),
  b: z.number().describe("Second number to add")
});

/**
 * Registers the calculator tool with the MCP server.
 * By defining the schema and providing a callback function, you ensure the server knows how
 * to parse the input, execute the calculation, and format the response.
 *
 * @param server - The MCP server instance to register the tool with.
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
```

Thanks to the schema, the tool automatically validates that both `a` and `b` are numbers.

#### REST API Tool Example

For a more advanced scenario, here is a tool that fetches data from an external API and transforms it into an MCP-compatible result:

```typescript
/**
 * REST API Tool Example
 *
 * This module demonstrates how to implement an MCP tool that interacts with external APIs.
 * It showcases:
 * - Making HTTP requests
 * - Handling API responses
 * - Proper error handling for network requests
 * - Converting external API data into MCP tool results
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Schema for the user data returned by JSONPlaceholder API.
 * This helps ensure the structure of the response is correct.
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
 * Schema for the fetch user tool parameters.
 * This ensures a valid user ID is provided.
 */
const FetchUserSchema = z.object({
  userId: z.number().positive().describe("ID of the user to fetch")
});

/**
 * Registers the REST API tool with the MCP server.
 *
 * This demonstrates how you can connect external data sources to the MCP ecosystem by
 * validating inputs, sending a request, and returning the response.
 *
 * @param server - The MCP server instance to register the tool with.
 */
export function registerRestApiTool(server: McpServer) {
  server.tool(
    "fetch_user",
    FetchUserSchema.shape,
    async (params) => {
      try {
        // Make the HTTP request
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users/${params.userId}`
        );

        if (!response.ok) {
          // Handle HTTP errors gracefully
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

        // Return the validated data as formatted text
        return {
          content: [{
            type: "text",
            text: JSON.stringify(userData, null, 2)
          }]
        };
      } catch (error) {
        // Handle unexpected or Zod validation errors
        if (error instanceof z.ZodError) {
          return {
            content: [{
              type: "text",
              text: `Invalid API response format: ${error.message}`
            }],
            isError: true
          };
        } else if (error instanceof Error) {
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
```

When integrated with an AI environment, you can invoke this tool by requesting something like `fetch_user` with `userId=3`, receiving validated user data or a clear error message.

## Integration with MCP Hosts

### Smithery Integration

A convenient way to run this MCP server is through Smithery, a centralized platform for discovering and publishing MCP servers. Smithery simplifies deployment and ensures your server can be integrated into various AI workflows.

#### Quick Run

You can immediately execute this server via the Smithery CLI:

```bash
npx -y @smithery/cli@latest run mcp-server-template --config "{}"
```

Smithery automatically fetches, installs, and runs the server from its latest release, requiring minimal setup from you.

#### Publishing Your Own Version

If you have developed new tools or made local modifications and wish to share them, consider publishing your customized server:

1. Create an account on [Smithery](https://smithery.ai).
2. Follow their deployment instructions to bundle and publish your MCP server.
3. Other users can then run your server through Smithery by referencing your unique package name.

Smithery offers:
- A centralized registry to discover and share MCP servers.
- Simplified deployment, removing repetitive setup.
- A community-driven approach where developers contribute diverse tools.
- Easy integration with popular AI hosts.

For additional guidance:
- [Smithery Documentation](https://smithery.ai/docs)
- [Smithery GitHub](https://github.com/smithery-ai)

### Cursor Integration

Cursor is another AI development environment that supports MCP. To incorporate your server into Cursor:

1. **Build your server**:
   ```bash
   npm run build
   ```
   Ensure an executable `index.js` is generated in the `build` directory.

2. **In Cursor, go to** `Settings` > `Features` > `MCP`:
   Add a new MCP server.

3. **Register your server**:
   - Select `stdio` as the transport type.
   - Provide a descriptive `Name`.
   - Set the command, for example: `node /path/to/your/mcp-server/build/index.js`.

4. **Save** your configuration.

Cursor then detects and lists your tools. During AI-assisted coding sessions or prompt-based interactions, it will call your MCP tools whenever relevant. You can also instruct the AI to use a specific tool by name.

### Claude Desktop Integration

Claude Desktop provides a chat-based environment where you can leverage MCP tools. To include your server:

1. **Build your server**:
   ```bash
   npm run build
   ```
   Confirm that no errors occur and that the main script is generated in `build`.

2. **Modify** `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "mcp-server": {
         "command": "node",
         "args": [
           "/path/to/your/mcp-server/build/index.js"
         ]
       }
     }
   }
   ```
   Provide the path to your compiled main file along with any additional arguments.

3. **Restart Claude Desktop** to load the new configuration.

When you interact with Claude Desktop, it can now invoke the MCP tools you have registered. If a user's request aligns with any of your tool's functionality, Claude will prompt to use that tool.

## Development Best Practices

1. **Use TypeScript** for better type checking, clearer code organization, and easier maintenance over time.
2. **Adopt consistent patterns** for implementing tools:
   - Keep each tool in its own file
   - Use descriptive schemas with proper documentation
   - Implement comprehensive error handling
   - Return properly formatted content
3. **Include thorough documentation**:
   - Add JSDoc comments to explain functionality
   - Document parameters and return types
   - Include examples where helpful
4. **Leverage the inspector** for debugging:
   ```bash
   npm run inspector
   ```
   This helps you:
   - Test tool functionality
   - Debug request/response flow
   - Verify schema validation
   - Check error handling
5. **Test comprehensively** before deployment:
   - Verify input validation
   - Test error scenarios
   - Check response formatting
   - Ensure proper integration with hosts
6. **Follow MCP best practices**:
   - Use proper content types
   - Implement proper error handling
   - Validate all inputs and outputs
   - Handle network requests safely
   - Format responses consistently

## Learn More

For further information on the MCP ecosystem, refer to:

- [Model Context Protocol Documentation](https://modelcontextprotocol.io): Detailed coverage of MCP architecture, design principles, and more advanced usage examples.
- [Smithery - MCP Server Registry](https://smithery.ai/docs): Guidelines for publishing your tools to Smithery and best practices for their registry.

## Conclusion

By following this template and best practices, you can quickly build a robust MCP server that opens your tools to a broad range of AI hosts. This expanded approach ensures easier maintenance, better type safety, and a smooth user experience when harnessing the capabilities of modern AI systems.

## Credits

**Template created by Seth Rose**:
- **Website**: [https://www.sethrose.dev](https://www.sethrose.dev)
- **𝕏 (Twitter)**: [https://x.com/TheSethRose](https://x.com/TheSethRose)
- **🦋 (Bluesky)**: [https://bsky.app/profile/sethrose.dev](https://bsky.app/profile/sethrose.dev)
