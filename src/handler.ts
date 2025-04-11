import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";
import { createSuccessResponse, toolHandlers, tools } from "./tools.js";
import * as schemas from "./schemas/hooks.js";
import { decodeGitHubContent } from "./utils/code.js";

/**
 * Sets up all request handlers for the MCP server
 * @param server - The MCP server instance
 */
export const setupHandlers = (server: Server): void => {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools),
  }));

  // @ts-ignore
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params ?? {};

    if (!name || typeof name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, "Tool name is required");
    }
    const handler = toolHandlers[name as keyof typeof toolHandlers];

    if (!handler) {
      throw new McpError(ErrorCode.InvalidParams, `Tool not found: ${name}`);
    }

    try {
      // Validate tool input with Zod if applicable
      const toolSchema = getToolSchema(name);
      let validatedParams = params;

      if (toolSchema) {
        try {
          validatedParams = toolSchema.parse(params);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const errorMessages = validationError.errors.map(err =>
              `${err.path.join('.')}: ${err.message}`
            ).join(', ');

            throw new McpError(
              ErrorCode.InvalidParams,
              `Invalid parameters: ${errorMessages}`
            );
          }
          throw validationError;
        }
      }

      // Ensure handler returns a Promise
      const result = await handler(validatedParams);
      // @ts-ignore
      return createSuccessResponse(result)
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError,
        `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // Add global error handler
  server.onerror = (error) => {
    console.error("[MCP Server Error]", error);
  };
};

/**
 * Get Zod schema for tool validation if available
 * @param toolName Name of the tool
 * @returns Zod schema or undefined
 */
function getToolSchema(toolName: string): z.ZodType | undefined {
  try {
    switch (toolName) {
      case 'get_hook':
        return schemas.GetHookSchema;
      default:
        return undefined;
    }
  } catch (error) {
    console.error("Error getting schema:", error);
    return undefined;
  }
}