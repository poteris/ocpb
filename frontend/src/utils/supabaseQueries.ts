import { createClient } from '@supabase/supabase-js';
import { Persona } from "@/types/persona";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Scenario {
  id: string;
  title: string;
  description: string;
  context: string;
  objectives: string[];
}

export interface ScenarioForm {
  id: string;
  title: string;
  description: string;
  context: string;
  objectives: string[];
}

export interface Prompt {
  id: number;
  content: string;
  scenario_id?: string;
  persona_id?: string;
  created_at: string;
}

export interface PromptWithDetails extends Prompt {
  scenario?: {
    title: string;
    description: string;
    context: string;
  };
}

export async function getScenarios(): Promise<Scenario[]> {
  const { data: scenarios, error: scenariosError } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      description,
      context
    `);

  if (scenariosError) {
    console.error('Error fetching scenarios:', scenariosError);
    return [];
  }

  // Fetch objectives for all scenarios
  const { data: objectives, error: objectivesError } = await supabase
    .from('scenario_objectives')
    .select('*');

  if (objectivesError) {
    console.error('Error fetching objectives:', objectivesError);
    return scenarios.map(scenario => ({
      ...scenario,
      objectives: []
    }));
  }

  // Combine scenarios with their objectives
  return scenarios.map(scenario => ({
    ...scenario,
    objectives: objectives
      ?.filter(obj => obj.scenario_id === scenario.id)
      .map(obj => obj.objective) || []
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
      emotional_conditions: persona.emotional_conditions,
      busyness_level: persona.busyness_level,
      workplace: persona.workplace
    });

  if (error) {
    console.error('Error storing persona:', error);
    throw error;
  }

  return data;
}

export async function getSystemPrompts(): Promise<PromptWithDetails[]> {
  const { data, error } = await supabase
    .from('system_prompts')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching system prompts:', error);
    return [];
  }

  return data;
}

export async function getPersonaPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('persona_prompts')
    .select('*')
    .order('created_at', { ascending: true });

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
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching feedback prompts:', error.message, error.details);
    return [];
  }
  
  return data || [];
}

export async function updatePrompt(type: 'system' | 'feedback' | 'persona', id: number, content: string): Promise<void> {
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
  type: 'system' | 'feedback' | 'persona', 
  content: string
): Promise<void> {
  const data = {
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from(`${type}_prompts`)
    .insert(data);

  if (error) {
    console.error(`Error creating ${type} prompt:`, error);
    throw error;
  }
}

export async function deletePrompt(type: 'system' | 'feedback' | 'persona', id: number): Promise<void> {
  const { error } = await supabase
    .from(`${type}_prompts`)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting ${type} prompt:`, error);
    throw error;
  }
}

export async function createScenario(scenario: { 
  id: string; 
  title: string; 
  description: string;
  context: string;
}) {
  const { error } = await supabase
    .from('scenarios')
    .insert({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      context: scenario.context
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
      description: scenario.description,
      context: scenario.context
    })
    .select()
    .single();

  if (scenarioError) {
    console.error('Error creating scenario:', scenarioError);
    throw scenarioError;
  }

  // Create objectives with unique IDs
  if (scenario.objectives.length > 0) {
    const objectivesData = scenario.objectives.map((objective, index) => ({
      id: `${scenario.id}-${index + 1}`, // Create a unique ID combining scenario ID and index
      scenario_id: scenario.id,
      objective
    }));

    const { error: objectivesError } = await supabase
      .from('scenario_objectives')
      .insert(objectivesData);

    if (objectivesError) {
      // If objectives creation fails, clean up the scenario
      await supabase
        .from('scenarios')
        .delete()
        .eq('id', scenario.id);
      console.error('Error creating objectives:', objectivesError);
      throw objectivesError;
    }
  }

  return newScenario;
}

export async function deleteScenario(scenarioId: string) {
  try {
    // First delete the objectives for this scenario
    const { error: objectivesError } = await supabase
      .from('scenario_objectives')
      .delete()
      .eq('scenario_id', scenarioId);

    if (objectivesError) {
      console.error('Error deleting objectives:', objectivesError);
      throw objectivesError;
    }

    // Then delete the scenario
    const { error: scenarioError } = await supabase
      .from('scenarios')
      .delete()
      .eq('id', scenarioId);

    if (scenarioError) {
      console.error('Error deleting scenario:', scenarioError);
      throw scenarioError;
    }
  } catch (error) {
    console.error('Error in deleteScenario:', error);
    throw error;
  }
}

export async function updateScenarioObjectives(scenarioId: string, objectives: string[]) {
  try {
    // First delete existing objectives
    const { error: deleteError } = await supabase
      .from('scenario_objectives')
      .delete()
      .eq('scenario_id', scenarioId);

    if (deleteError) {
      console.error('Error deleting existing objectives:', deleteError);
      throw deleteError;
    }

    // Then insert new objectives if there are any
    if (objectives.length > 0) {
      // Generate unique IDs for each objective
      const objectivesData = objectives.map((objective, index) => ({
        id: `${scenarioId}-${index + 1}`, // Create a unique ID combining scenario ID and index
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
  } catch (error) {
    console.error('Error in updateScenarioObjectives:', error);
    throw error;
  }
}

export async function updateScenarioDetails(
  scenarioId: string, 
  updates: { 
    title?: string; 
    description?: string;
    context?: string;
    objectives?: string[];
  }
) {
  // Update scenario details if provided
  if (updates.title || updates.description || updates.context) {
    const { error: scenarioError } = await supabase
      .from('scenarios')
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.context && { context: updates.context })
      })
      .eq('id', scenarioId);

    if (scenarioError) {
      throw scenarioError;
    }
  }

  // Update objectives if provided
  if (updates.objectives) {
    await updateScenarioObjectives(scenarioId, updates.objectives);
  }
}
