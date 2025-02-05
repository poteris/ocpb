import { z } from "zod";

export const PromptDataSchema = z.object({
  id: z.number(),
  content: z.string(),
  scenario_id: z.string().optional(),
  persona_id: z.string().optional(),
  created_at: z.string(),
});


const ScenarioSchema = z.object({
  title: z.string(),
  description: z.string(),
  context: z.string(),
});

export const PromptWithDetailsSchema = PromptDataSchema.extend({
  scenario: ScenarioSchema.optional(), 
});


export type PromptData = z.infer<typeof PromptDataSchema>;
export type PromptWithDetails = z.infer<typeof PromptWithDetailsSchema>;
