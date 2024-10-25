import { createClient } from '@supabase/supabase-js';
import { Persona } from '@/utils/api';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Scenario {
  id: string;
  title: string;
  description: string;
  objectives: string[];
}

export interface SystemPrompt {
  id: number;
  content: string;
}

export async function getScenarios(): Promise<Scenario[]> {
  const { data: scenarios, error } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      description,
      scenario_objectives (objective)
    `);

  if (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }

  return scenarios.map(scenario => ({
    ...scenario,
    objectives: scenario.scenario_objectives.map(obj => obj.objective)
  }));
}

// Update the function signature
export async function storePersona(persona: Persona) {
  const { data, error } = await supabase
    .from('personas')
    .insert({
      id: persona.id,
      name: persona.name,
      segment: persona.segment,
      age: persona.age,
      gender: persona.gender,
      family_status: persona.family_status,
      job: persona.job,
      major_issues_in_workplace: persona.major_issues_in_workplace,
      uk_party_affiliation: persona.uk_party_affiliation,
      personality_traits: persona.personality_traits,
      emotional_conditions_for_supporting_the_union: persona.emotional_conditions_for_supporting_the_union,
      busyness_level: persona.busyness_level,
      workplace: persona.workplace
    });

  if (error) {
    console.error('Error storing persona:', error);
    throw error;
  }

  return data;
}

export async function getSystemPrompts(): Promise<SystemPrompt[]> {
  const { data: prompts, error } = await supabase
    .from('system_prompts')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching system prompts:', error);
    return [];
  }

  return prompts;
}

export async function updateSystemPrompt(id: number, content: string): Promise<void> {
  const { error } = await supabase
    .from('system_prompts')
    .update({ content })
    .eq('id', id);

  if (error) {
    console.error('Error updating system prompt:', error);
    throw error;
  }
}

export async function createSystemPrompt(content: string): Promise<void> {
  const { error } = await supabase
    .from('system_prompts')
    .insert({ content });

  if (error) {
    console.error('Error creating system prompt:', error);
    throw error;
  }
}

export async function deleteSystemPrompt(id: number): Promise<void> {
  const { error } = await supabase
    .from('system_prompts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting system prompt:', error);
    throw error;
  }
}

export async function getSystemPromptById(id: number): Promise<SystemPrompt | null> {
  const { data, error } = await supabase
    .from('system_prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching system prompt:', error);
    return null;
  }

  return data;
}
