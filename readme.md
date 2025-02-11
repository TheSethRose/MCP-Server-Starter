## What is MCP?

The Model Context Protocol (MCP) is a specialized framework designed to streamline the process of enabling AI agents to interact with a wide array of tools. This starter template helps you quickly build a Model Context Protocol (MCP) server using TypeScript. It provides a robust foundation that you can easily extend to create advanced MCP tools and seamlessly integrate them with AI assistants like Claude or other MCP-supported platforms.

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

## Tool Response Format

MCP tools must return responses in a specific format to ensure proper communication with AI hosts. Here's the structure:

```typescript
interface ToolResponse {
  content: ContentItem[];
  isError?: boolean;
  metadata?: Record<string, unknown>;
}

interface ContentItem {
  type: string;
  text?: string;
  mimeType?: string;
  data?: unknown;
}
```

Supported content types include:
- `text`: Plain text content
- `code`: Code snippets with optional language specification
- `image`: Base64-encoded images with MIME type
- `file`: File content with MIME type
- `error`: Error messages (when `isError` is true)

Example response:
```typescript
return {
  content: [
    {
      type: "text",
      text: "Operation completed successfully"
    },
    {
      type: "code",
      text: "console.log('Hello, World!')",
      mimeType: "application/javascript"
    }
  ]
};
```

## Security Best Practices

When developing MCP tools, follow these security guidelines:

1. **Input Validation**:
   - Always validate input parameters using Zod schemas
   - Implement strict type checking
   - Sanitize user inputs before processing
   - Use the `strict()` option in schemas to prevent extra properties

2. **Error Handling**:
   - Never expose internal error details to clients
   - Implement proper error boundaries
   - Log errors securely
   - Return user-friendly error messages

3. **Resource Management**:
   - Implement proper cleanup procedures
   - Handle process termination signals
   - Close connections and free resources
   - Implement timeouts for long-running operations

4. **API Security**:
   - Use secure transport protocols
   - Implement rate limiting
   - Store sensitive data securely
   - Use environment variables for configuration

Example secure tool implementation:
```typescript
const SecureSchema = z.object({
  input: z.string()
    .min(1)
    .max(1000)
    .transform(str => str.trim())
    .pipe(z.string().regex(/^[a-zA-Z0-9\s]+$/))
});

server.tool(
  "secure_tool",
  SecureSchema.shape,
  async (params) => {
    try {
      // Implement rate limiting
      await rateLimiter.checkLimit();

      // Process validated input
      const result = await processSecurely(params.input);

      return {
        content: [{
          type: "text",
          text: result
        }]
      };
    } catch (error) {
      // Log error internally
      logger.error(error);

      // Return safe error message
      return {
        content: [{
          type: "text",
          text: "An error occurred processing your request"
        }],
        isError: true
      };
    }
  }
);
```

## Advanced Features

### Streaming Responses

MCP supports streaming responses for long-running operations:

```typescript
server.tool(
  "stream_data",
  StreamSchema.shape,
  async function* (params) {
    for (const chunk of dataStream) {
      yield {
        content: [{
          type: "text",
          text: chunk
        }]
      };
    }
  }
);
```

### Custom Content Types

You can define custom content types for specialized data:

```typescript
interface CustomContent extends ContentItem {
  type: "custom";
  data: {
    format: string;
    value: unknown;
  };
}
```

### Async Tool Execution

Implement proper async handling:

```typescript
server.tool(
  "async_operation",
  AsyncSchema.shape,
  async (params) => {
    const operation = await startAsyncOperation();

    while (!operation.isComplete()) {
      await operation.wait();
    }

    return {
      content: [{
        type: "text",
        text: await operation.getResult()
      }]
    };
  }
);
```

## Testing & Debugging

### Unit Testing

Use Jest for testing your tools:

```typescript
describe('Calculator Tool', () => {
  let server: McpServer;

  beforeEach(() => {
    server = new McpServer({
      name: "test-server",
      version: "1.0.0"
    });
    registerCalculatorTool(server);
  });

  test('adds numbers correctly', async () => {
    const result = await server.executeTool('calculate', {
      a: 5,
      b: 3,
      operation: 'add'
    });

    expect(result.content[0].text).toBe('8');
  });
});
```

### Debugging Tools

1. **MCP Inspector**:
   ```bash
   npm run inspector
   ```
   Provides real-time inspection of:
   - Tool registration
   - Request/response flow
   - Error handling
   - Performance metrics

2. **Logging**:
   ```typescript
   function logMessage(level: 'info' | 'warn' | 'error', message: string) {
     console.error(`[${level.toUpperCase()}] ${message}`);
   }
   ```

3. **Error Tracking**:
   ```typescript
   process.on('uncaughtException', (error: Error) => {
     logMessage('error', `Uncaught error: ${error.message}`);
     // Implement error reporting
   });
   ```

## Transport Configuration

MCP supports multiple transport protocols:

### stdio Transport

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

### WebSocket Transport

```typescript
import { WebSocketServerTransport } from "@modelcontextprotocol/sdk/server/websocket.js";

const transport = new WebSocketServerTransport({
  port: 3000
});
await server.connect(transport);
```

### Custom Transport

```typescript
import { Transport } from "@modelcontextprotocol/sdk/server/transport.js";

class CustomTransport implements Transport {
  // Implement transport methods
}
```

## Server Capabilities

Configure server capabilities:

```typescript
const server = new McpServer({
  name: "mcp-server",
  version: "1.0.0",
  capabilities: {
    tools: {}, // Enable tools capability
    streaming: true, // Enable streaming support
    customContent: ["myFormat"], // Define custom content types
    metadata: true // Enable metadata support
  }
});
```

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
- [MCP TypeScript SDK Documentation](https://modelcontextprotocol.io/typescript): Comprehensive documentation of the TypeScript SDK.
- [MCP Security Guidelines](https://modelcontextprotocol.io/security): Detailed security best practices and recommendations.

## Conclusion

By following this template and best practices, you can quickly build a robust MCP server that opens your tools to a broad range of AI hosts. This expanded approach ensures easier maintenance, better type safety, and a smooth user experience when harnessing the capabilities of modern AI systems.

## Credits

**Template created by Seth Rose**:
- **Website**: [https://www.sethrose.dev](https://www.sethrose.dev)
- **𝕏 (Twitter)**: [https://x.com/TheSethRose](https://x.com/TheSethRose)
- **🦋 (Bluesky)**: [https://bsky.app/profile/sethrose.dev](https://bsky.app/profile/sethrose.dev)
