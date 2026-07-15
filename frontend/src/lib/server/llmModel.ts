'use server'

const DEFAULT_LLM_MODEL = "gpt-5.4-mini-2026-03-17";

export async function getLlmModel(): Promise<string> {
  return process.env.LLM_MODEL || DEFAULT_LLM_MODEL;
}
