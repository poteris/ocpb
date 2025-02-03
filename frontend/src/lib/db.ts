import { supabase } from "./init";
import { TrainingScenario } from "@/types/scenarios";
import { Persona } from "@/types/persona";
import { getFeedbackPrompt } from "../../app/api/feedback/generate-feedback/feedbackPrompt";

/**
 * Retrieves a training scenario from the database by its ID.
 *
 * @param {string} scenarioId - The ID of the scenario to retrieve.
 * @returns {Promise<TrainingScenario>} A promise that resolves to the training scenario.
 * @throws Will throw an error if the database query fails.
 */
export async function getScenario(
  scenarioId: string
): Promise<TrainingScenario> {
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
    objectives: data.scenario_objectives.map(
      (obj: { objective: string }) => obj.objective
    ),
  };
}

/**
 * Retrieves a persona from the database by its ID.
 *
 * @param {string} personaId - The ID of the persona to retrieve.
 * @returns {Promise<object | null>} - A promise that resolves to the persona object if found, or null if an error occurs.
 */
export async function retrievePersona(personaId: string) {
  const { data: personas, error } = await supabase
    .from("personas")
    .select("*")
    .eq("id", personaId)
    .single();

  if (error) {
    console.error("Error fetching persona:", error);
    return null;
  }

  return personas;
}

/**
 * Retrieves the system prompt content based on the provided prompt ID.
 *
 * @param {number} promptId - The ID of the system prompt to retrieve.
 * @returns {Promise<string>} A promise that resolves to the content of the system prompt.
 * If the prompt is not found or an error occurs, a default prompt is returned.
 *
 * @throws Will log an error message if an error occurs during the retrieval process.
 */
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

/**
 * Retrieves the context of a conversation including scenario, persona, and system prompt.
 *
 * @param {string} conversationId - The ID of the conversation to retrieve context for.
 * @returns {Promise<{ scenario: any, persona: any, systemPrompt: any }>} - An object containing the scenario, persona, and system prompt.
 * @throws Will throw an error if the conversation context cannot be retrieved or if the scenario or persona is not found.
 */
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

/**
 * Saves user and AI messages to the database.
 *
 * @param conversationId - The unique identifier for the conversation.
 * @param userMessage - The message sent by the user.
 * @param aiResponse - The response generated by the AI.
 * @throws Will throw an error if the database insertion fails.
 */
export async function saveMessages(
  conversationId: string,
  userMessage: string,
  aiResponse: string
) {
  const { error } = await supabase.from("messages").insert([
    { conversation_id: conversationId, role: "user", content: userMessage },
    { conversation_id: conversationId, role: "assistant", content: aiResponse },
  ]);

  if (error) throw error;
}

/**
 * Upserts a persona into the "personas" table in the database.
 * If a persona with the same ID already exists, it will be updated.
 * Otherwise, a new persona will be inserted.
 *
 * @param {Persona} persona - The persona object to upsert.
 * @throws Will throw an error if the upsert operation fails.
 */
export async function upsertPersona(persona: Persona) {
  const { error } = await supabase
    .from("personas")
    .upsert(persona, { onConflict: "id" });

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

export async function getAllMessage(conversationId: string) {
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

export async function getAllScenarios() {
  try {
    const { data, error } = await supabase.from("scenarios").select(`
        id,
        title,
        description,
        context,
        scenario_objectives (objective)
      `);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching scenarios:", error);
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

export async function getFeedbackPrompt(conversationId: string) {
  return await supabase.from("feedback_prompts").select("content").single();
}
