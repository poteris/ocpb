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

export interface ScenarioForm {
  id: string;
  title: string;
  description: string;
  objectives: string[];
}

export interface Prompt {
  id: number;
  content: string;
  scenario_id?: string;
  persona_id?: string;
  created_at: string;
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

export async function getScenarioPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('scenario_prompts')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching scenario prompts:', error);
    return [];
  }

  return data;
}

export async function getPersonaPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('persona_prompts')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching persona prompts:', error);
    return [];
  }

  return data;
}

export async function getFeedbackPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('feedback_prompts')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching feedback prompts:', error.message, error.details);
    return [];
  }
  
  return data || [];
}

export async function updatePrompt(type: 'scenario' | 'persona' | 'feedback', id: number, content: string): Promise<void> {
  const { error } = await supabase
    .from(`${type}_prompts`)
    .update({ content })
    .eq('id', id);

  if (error) {
    console.error(`Error updating ${type} prompt:`, error);
    throw error;
  }
}

export async function createPrompt(
  type: 'scenario' | 'persona' | 'feedback', 
  content: string, 
  scenarioId?: string
): Promise<void> {
  const data = type === 'scenario' 
    ? { content, scenario_id: scenarioId }
    : { content };

  const { error } = await supabase
    .from(`${type}_prompts`)
    .insert(data);

  if (error) {
    console.error(`Error creating ${type} prompt:`, error);
    throw error;
  }
}

export async function deletePrompt(type: 'scenario' | 'persona' | 'feedback', id: number): Promise<void> {
  const { error } = await supabase
    .from(`${type}_prompts`)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting ${type} prompt:`, error);
    throw error;
  }
}

export async function createScenario(scenario: { id: string; title: string; description: string }) {
  const { error } = await supabase
    .from('scenarios')
    .insert({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description
    });

  if (error) {
    console.error('Error creating scenario:', error);
    throw error;
  }
}

export async function createScenarioWithObjectives(scenario: ScenarioForm) {
  // Start a Supabase transaction
  const { data: newScenario, error: scenarioError } = await supabase
    .from('scenarios')
    .insert({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description
    })
    .select()
    .single();

  if (scenarioError) {
    console.error('Error creating scenario:', scenarioError);
    throw scenarioError;
  }

  // Create objectives
  if (scenario.objectives.length > 0) {
    const objectivesData = scenario.objectives.map(objective => ({
      scenario_id: scenario.id,
      objective
    }));

    const { error: objectivesError } = await supabase
      .from('scenario_objectives')
      .insert(objectivesData);

    if (objectivesError) {
      console.error('Error creating objectives:', objectivesError);
      throw objectivesError;
    }
  }

  return newScenario;
}

export async function updateScenarioObjectives(scenarioId: string, objectives: string[]) {
  // First delete existing objectives
  const { error: deleteError } = await supabase
    .from('scenario_objectives')
    .delete()
    .eq('scenario_id', scenarioId);

  if (deleteError) {
    console.error('Error deleting existing objectives:', deleteError);
    throw deleteError;
  }

  // Then insert new objectives
  if (objectives.length > 0) {
    const objectivesData = objectives.map(objective => ({
      scenario_id: scenarioId,
      objective
    }));

    const { error: insertError } = await supabase
      .from('scenario_objectives')
      .insert(objectivesData);

    if (insertError) {
      console.error('Error creating new objectives:', insertError);
      throw insertError;
    }
  }
}
