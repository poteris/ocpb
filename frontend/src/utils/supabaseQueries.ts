import { createClient } from '@supabase/supabase-js';
import { PersonaInfo } from '@/context/ScenarioContext';

const supabaseUrl = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:54321'
  : process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('supabaseUrl', supabaseUrl);
console.log('supabaseAnonKey', supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Scenario {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prompts: string[];
}

export interface Persona {
  id: string;
  character_type: string;
  mood: string;
  age_range: string;
  context: string;
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
      scenario_objectives (objective),
      scenario_prompts (prompt)
    `);

  if (error) {
    console.error('Error fetching scenarios:', error);
    return [];
  }

  return scenarios.map(scenario => ({
    ...scenario,
    objectives: scenario.scenario_objectives.map(obj => obj.objective),
    prompts: scenario.scenario_prompts.map(prompt => prompt.prompt)
  }));
}

export async function getPersonas(): Promise<Persona[]> {
  const { data: personas, error } = await supabase
    .from('personas')
    .select('*');

  if (error) {
    console.error('Error fetching personas:', error);
    return [];
  }

  return personas;
}

export function convertToPersonaInfo(persona: Persona): PersonaInfo {
  return {
    id: persona.id,
    characterType: persona.character_type,
    mood: persona.mood,
    ageRange: persona.age_range,
    context: persona.context
  };
}

export async function getRandomPersona(): Promise<PersonaInfo | null> {
  const { data: personas, error } = await supabase
    .from('personas')
    .select('*');

  if (error) {
    console.error('Error fetching personas:', error);
    return null;
  }

  if (personas && personas.length > 0) {
    const randomIndex = Math.floor(Math.random() * personas.length);
    const randomPersona = personas[randomIndex];
    return convertToPersonaInfo(randomPersona);
  }

  return null;
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
  console.log('prompts', prompts);

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
