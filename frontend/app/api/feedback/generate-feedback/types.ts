import { z } from 'zod';
import { personaSchema } from '@/types/persona'

export interface MessageData {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const messageDataSchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  created_at: z.string(),
});

const scenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  context: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  description: z.string(),
});

export const conversationDataSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  user_id: z.string().uuid(),
  scenario_id: z.string(),
  persona_id: z.string(),
  system_prompt_id: z.number(),
  feedback_prompt_id: z.number(),
  created_at: z.string(),
  last_message_at: z.string(),
  scenario: scenarioSchema,
  persona: personaSchema,
  messages: z.array(messageDataSchema),
});

