'use server'
import { supabase } from "./init";
import { TrainingScenario, TrainingScenarioSchema } from "@/types/scenarios";
import { Persona } from "@/types/persona";
import { Result, ok, err } from "@/types/result";
import { z } from "zod";

export async function getAllScenarios(): Promise<Result<TrainingScenario[], string>> {
  const { data, error } = await supabase.from("scenarios").select(`
    id,
    title,
    description,
    context,
    scenario_objectives (objective)
  `);

  if (error) {
    console.error("Error fetching scenarios:", error);
    return err(error.message);
  }
  // we need to add the objectives to the scenario object
  const scenarios = data.map((scenario) => ({
    ...scenario,
    objectives: scenario.scenario_objectives?.map((obj) => obj.objective) || [],
  }));

  const validationResult = z.array(TrainingScenarioSchema).safeParse(scenarios);
  if (!validationResult.success) {
    console.error("Error validating scenarios data:", validationResult.error);
    return err("Error validating data");
  }

  return ok(validationResult.data);
}

export async function getScenario(scenarioId: string): Promise<TrainingScenario> {
  const { data, error } = await supabase
    .from("scenarios")
    .select(
      `
      id,
      title,
      description,
      context,
      scenario_objectives (objective)
    `
    )
    .eq("id", scenarioId)
    .single();

  if (error) throw error;

  return {
    ...data,
    objectives: data.scenario_objectives.map((obj: { objective: string }) => obj.objective),
  };
}

export async function retrievePersona(personaId: string) {
  const { data: personas, error } = await supabase.from("personas").select("*").eq("id", personaId).single();

  if (error) {
    console.error("Error fetching persona:", error);
    return null;
  }

  return personas;
}

export async function getSystemPrompt(promptId: number): Promise<string> {
  try {
    const { data: promptData, error: promptError } = await supabase
      .from("system_prompts")
      .select("content")
      .eq("id", promptId)
      .single();

    if (promptError || !promptData) {
      console.warn("No system prompt found, using default");
      return "You are an AI assistant helping with union conversations. Be helpful and professional.";
    }

    // Return the content directly as a string
    return promptData.content;
  } catch (error) {
    console.error("Error in getSystemPrompt:", error);
    return "You are an AI assistant helping with union conversations. Be helpful and professional.";
  }
}

export async function getConversationContext(conversationId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("scenario_id, persona_id, system_prompt_id")
    .eq("conversation_id", conversationId)
    .single();

  if (error) throw error;

  const scenario = await getScenario(data.scenario_id);
  const persona = await retrievePersona(data.persona_id);
  const systemPrompt = await getSystemPrompt(data.system_prompt_id);

  if (!scenario || !persona) {
    throw new Error("Scenario or persona not found");
  }

  return { scenario, persona, systemPrompt };
}

export async function saveMessages(conversationId: string, userMessage: string, aiResponse: string) {
  const { error } = await supabase.from("messages").insert([
    { conversation_id: conversationId, role: "user", content: userMessage },
    { conversation_id: conversationId, role: "assistant", content: aiResponse },
  ]);

  if (error) throw error;
}

export async function upsertPersona(persona: Persona) {
  const { error } = await supabase.from("personas").upsert(persona, { onConflict: "id" });

  if (error) {
    console.error("Error upserting persona:", error);
    throw error;
  }
}

export async function insertConversation(
  conversationId: string,
  userId: string,
  scenarioId: string,
  personaId: string,
  systemPromptId: number,
  feedback_prompt_id = 1
) {
  const { error } = await supabase.from("conversations").insert({
    conversation_id: conversationId,
    user_id: userId,
    scenario_id: scenarioId,
    persona_id: personaId,
    feedback_prompt_id: feedback_prompt_id,
    system_prompt_id: systemPromptId,
  });

  if (error) {
    console.error("Error inserting conversation:", error);
    throw error;
  }
}

export async function getAllChatMessages(conversationId: string) {
  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    return messagesData;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return null;
  }
}

export async function getConversationById(conversationId: string) {
  return await supabase
    .from("conversations")
    .select(
      `
          *,
          scenario:scenarios(*),
          persona:personas(*),
          messages(*)
        `
    )
    .eq("conversation_id", conversationId)
    .single();
}

export async function getFeedbackPrompt() {
  return await supabase.from("feedback_prompts").select("content").single();
}

export async function getScenarioById(scenarioId: string): Promise<Result<TrainingScenario, string>> {
  const { data: scenario, error } = await supabase.from("scenarios").select("*").eq("id", scenarioId).single();

  if (error) {
    return err(`Error fetching scenario: ${error.message}`);
  }

  if (!scenario) {
    return err("Scenario not found");
  }

  const { data: objectives, error: objectivesError } = await supabase
    .from("scenario_objectives")
    .select("objective")
    .eq("scenario_id", scenarioId);

  if (objectivesError) {
    return err(`Error fetching objectives: ${objectivesError.message}`);
  }

  return ok({ ...scenario, objectives: objectives.map((obj) => obj.objective) });
}
