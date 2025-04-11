import { z } from 'zod';


// Input schema for the get_component tool
export const GetHookSchema = z.object({
  hookName: z.string().describe('Name of the vue-hooks-plus hook (e.g., "useRequest","useBoolean")'),
});

export const GetHookDemoSchema = z.object({
  hookName: z.string().describe('Name of the vue-hooks-plus hook (e.g., "useRequest","useBoolean")'),
});

