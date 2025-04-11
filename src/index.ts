import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupHandlers } from "./handler.js";

const server = new Server({
  name: "vue-hooks-plus",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},          // Will be filled with registered tools
  },
});
// Set up request handlers and register components (tools, resources, etc.)
setupHandlers(server);

const transport = new StdioServerTransport();
server.connect(transport);

console.info('{"jsonrpc": "2.0", "method": "log", "params": { "message": "Server running..." }}');

