/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 * 
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { getFileContent } from "./utils/github.js";
import { decodeGitHubContent } from "./utils/code.js";

const buttonStyleInine = `\n<style>
body{
    padding: 12px;
    border-radius: 12px;
    overflow: hidden;
    margin-top: 8px;
    box-shadow: 1px 3px 4px rgba(188, 189, 190, 0.3);
    border: 1px solid rgba(235, 235, 235, 0.38);
    background-color: #010e19;
    color: white;
}  
button{
    border: 1px solid #42d392;
    color:rgba(255, 255, 255, .87);
    background-color: #33a06f;
    padding-left: 6px;
    padding-right: 6px;
    border-radius: 5px;
    min-width: 60px;
    height: 36px;
    font-weight: 500;
    white-space: nowrap;
    transition: color 0.25s, border-color 0.25s, background-color 0.25s, box-shadow 0.4s,
      opacity 0.4s;
    cursor: pointer;
    transform: scale(1);
}
button:hover {
    border-color: #35eb9a;
    background-color: #42b883;
  }

button::after {
    position: absolute;
    content: '';
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    box-shadow: 0 0 0 6px #42b883;
    transition: 0.4s;
  }
button:active::after {
    box-shadow: none;
    opacity: 1;
    transition: 0s;
  }
input {
    opacity: 1;
    color: white;
    background-color: rgba(255, 255, 255, 0.08);
    padding-left: 8px;
    height: 36px;
    font-weight: 500;
    border-radius: 5px;
    font-size: 15px;
    transition: all 0.3s;
}
</style>`


// Tool definitions exported to the MCP handler
export const tools = {
  // Get hook source code
  'get_hook': {
    name: 'get_hook',
    description: 'Get the source code for a specific vue-hooks-plus hook',
    inputSchema: {
      type: 'object',
      properties: {
        hookName: {
          type: 'string',
          description: 'Name of the vue-hooks-plus hook (e.g., "useRequest","useBoolean")',
        },
      },
      required: ['hookName'],
    },
  },

  // Get hook demo code
  'get_hook_demo': {
    name: 'get_hook_demo',
    description: 'Get demo code url for a specific vue-hooks-plus hook',
    inputSchema: {
      type: 'object',
      properties: {
        hookName: {
          type: 'string',
          description: 'Name of the vue-hooks-plus hook (e.g., "useRequest","useBoolean")',
        },
      },
      required: ['hookName'],
    },
  },
};

/**
 * Validates hook name from arguments
 * @param args Arguments object
 * @returns Validated hook name
 * @throws McpError if validation fails
 */
function validateHookName(args: any): string {
  if (!args?.hookName || typeof args.hookName !== "string") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Hook name is required and must be a string"
    );
  }
  return args.hookName
}

/**
 * Creates a standardized success response
 * @param data Data to include in the response
 * @returns Formatted response object
 */
export function createSuccessResponse(data: any) {
  return {
    content: [
      {
        type: "text",
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Implementation of the get_component tool
 * Fetches the component's source code from GitHub
 */
const getHook = async (args: any) => {
  try {
    const hookName = validateHookName(args);
    // Fetch the hook from GitHub
    try {
      const githubContent = await getFileContent('NelsonYong', 'vue-hooks-plus', `packages/hooks/src/${hookName}/index.ts`)
      // @ts-ignore
      return decodeGitHubContent(githubContent?.content)
    } catch (error) {
      throw error;
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get hook source code: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_component_demo tool
 * Fetches the component's demo code from GitHub
 */
const getHookDemo = async (args: any) => {
  try {
    const sfcBaseUrl = 'https://sfc.vuejs.org/'
    const hookName = validateHookName(args);
    const githubContent = await getFileContent('NelsonYong', 'vue-hooks-plus', `docs/demo/${hookName}/demo.vue`)
    // @ts-ignore
    const content = decodeGitHubContent(githubContent?.content) ?? ''
    const sfcJson = {
      'App.vue': content?.replace(/vhp-/g, '') + buttonStyleInine,
    } as Record<string, string>

    sfcJson['import-map.json'] = JSON.stringify({
      imports: {
        'vue-hooks-plus': 'https://cdn.jsdelivr.net/npm/vue-hooks-plus/dist/js/index.es.js',
      },
    })
    return `${sfcBaseUrl}#${btoa(unescape(encodeURIComponent(JSON.stringify(sfcJson))))}`
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get component demo code: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Map of tool names to their handler functions
 */
export const toolHandlers = {
  "get_hook": getHook,
  "get_hook_demo": getHookDemo,
};