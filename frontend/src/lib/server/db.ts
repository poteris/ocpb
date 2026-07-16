'use server'
import { TrainingScenario, TrainingScenarioSchema } from "@/types/scenarios";
import { Persona } from "@/types/persona";
import { LeaderboardEntry, leaderboardRowSchema } from "@/types/leaderboard";
import { z } from "zod";
import { DatabaseError, DatabaseErrorCodes} from "@/utils/errors";
import { createClient } from "@/utils/supabase/server";

export async function getAllScenarios(): Promise<TrainingScenario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("scenarios").select(`
    id,
    title,
    description,
    context,
    scenario_objectives (objective)
  `);

  if (error) {
    const dbError = new DatabaseError("Error fetching scenarios", "getAllScenarios", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }

    });
    console.error(dbError.toLog());
    throw dbError;
  }
  // we need to add the objectives to the scenario object
  const scenarios = data.map((scenario) => ({
    ...scenario,
    objectives: scenario.scenario_objectives?.map((obj) => obj.objective) || [],
  }));

  const validationResult = z.array(TrainingScenarioSchema).safeParse(scenarios);
  if (!validationResult.success) {
    console.error(validationResult.error);
    throw new Error ("Error validating scenarios data", {
      cause: validationResult.error,
    });
  } 
  return validationResult.data;
}

export async function getScenario(scenarioId: string): Promise<TrainingScenario> {
  const supabase = await createClient();
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

  if (error) {
    const dbError = new DatabaseError("Error fetching scenario", "getScenario", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  return {
    ...data,
    objectives: data.scenario_objectives.map((obj: { objective: string }) => obj.objective),
  };
}

export async function retrievePersona(personaId: string) {
  const supabase = await createClient();
  const { data: personas, error } = await supabase.from("personas").select("*").eq("id", personaId).single();

  if (error) {
    const dbError = new DatabaseError("Error fetching persona", "retrievePersona", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  return personas;
}


export async function getSystemPrompt(promptId: number): Promise<string> {
    const supabase = await createClient();
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
  } 
  catch (error) {
    console.error("Error fetching system prompt", error);
    const dbError = new DatabaseError("Error fetching system prompt", "getSystemPrompt", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
}

export async function getConversationContext(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("scenario_id, persona_id, system_prompt_id")
    .eq("conversation_id", conversationId)
    .single();

  if (error) {
    const dbError = new DatabaseError("Error fetching conversation context", "getConversationContext", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  const scenario = await getScenario(data.scenario_id);
  const persona = await retrievePersona(data.persona_id);
  const systemPrompt = await getSystemPrompt(data.system_prompt_id);

  if (!scenario || !persona) {
    const dbError = new DatabaseError("Scenario or persona not found", "getConversationContext", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
  return { scenario, persona, systemPrompt };
} 

export async function saveMessages(conversationId: string, userMessage: string, aiResponse: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert([
    { conversation_id: conversationId, role: "user", content: userMessage },
    { conversation_id: conversationId, role: "assistant", content: aiResponse },
  ]);

  if (error) {
    const dbError = new DatabaseError("Error saving messages", "saveMessages", DatabaseErrorCodes.Insert, {
      details: {
        error: error
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
}

export async function upsertPersona(persona: Persona) {
  const supabase = await createClient();
  const { error } = await supabase.from("personas").upsert(persona, { onConflict: "id" });

  if (error) {
    const dbError = new DatabaseError("Error upserting persona", "upsertPersona", DatabaseErrorCodes.Insert, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
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
  const supabase = await createClient();
  const { error } = await supabase.from("conversations").insert({
    conversation_id: conversationId,
    user_id: userId,
    scenario_id: scenarioId,
    persona_id: personaId,
    feedback_prompt_id: feedback_prompt_id,
    system_prompt_id: systemPromptId,
  });

  if (error) {
    const dbError = new DatabaseError("Error inserting conversation", "insertConversation", DatabaseErrorCodes.Insert, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }
}

export async function getAllChatMessages(conversationId: string) {
  try {
    const supabase = await createClient();
      const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      const dbError = new DatabaseError("Error fetching messages", "getAllChatMessages", DatabaseErrorCodes.Select, {
        details: {
          error: messagesError,
        }
      });
      console.error(dbError.toLog());
      throw dbError;
    }

    return messagesData;
  } 
catch (error) {
    const dbError = new DatabaseError("Error fetching messages", "getAllChatMessages", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    }); 
    console.error(dbError.toLog());
    throw dbError;
  }}


export async function getConversationById(conversationId: string) {
const supabase = await createClient();
  const { data, error } = await supabase
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

  if (error) {
    const dbError = new DatabaseError("Error fetching conversation", "getConversationById", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  return data;
}



const feedbackPromptSchema = z.object({
  content: z.string(),
});

type FeedbackPrompt = z.infer<typeof feedbackPromptSchema>;

export async function getFeedbackPrompt(): Promise<FeedbackPrompt> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("feedback_prompts").select("content").single();

  if (error) {
    const dbError = new DatabaseError("Error fetching feedback prompt", "getFeedbackPrompt", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  const feedbackPrompt = feedbackPromptSchema.safeParse(data);

  if (!feedbackPrompt.success) {
    console.error("Failed to validate feedback prompt", feedbackPrompt.error);
    throw new Error("Failed to validate feedback prompt", {
      cause: feedbackPrompt.error,
    });
  }

  return feedbackPrompt.data;
}

const LEADERBOARD_ROW_LIMIT = 500;

export async function getScenarioLeaderboard(scenarioId: string): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scenario_leaderboard")
    .select("user_id, display_name, best_score, attempt_count, best_score_at")
    .eq("scenario_id", scenarioId)
    .order("best_score", { ascending: false })
    .order("best_score_at", { ascending: true })
    .limit(LEADERBOARD_ROW_LIMIT);

  if (error) {
    const dbError = new DatabaseError("Error fetching leaderboard", "getScenarioLeaderboard", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  const rows = z.array(leaderboardRowSchema).parse(data ?? []);
  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function getScenarioById(scenarioId: string): Promise<TrainingScenario> {
const supabase = await createClient();
    const { data: scenario, error } = await supabase.from("scenarios").select("*").eq("id", scenarioId).single();

  if (error) {
    const dbError = new DatabaseError("Error fetching scenario", "getScenarioById", DatabaseErrorCodes.Select, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  if (!scenario) {
    const dbError = new DatabaseError("Scenario not found", "getScenarioById", DatabaseErrorCodes.Select, {
      details: {
        error: "Scenario not found",
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  const { data: objectives, error: objectivesError } = await supabase
    .from("scenario_objectives")
    .select("objective")
    .eq("scenario_id", scenarioId);

  if (objectivesError) {
    const dbError = new DatabaseError("Error fetching objectives", "getScenarioById", DatabaseErrorCodes.Select, {
      details: {
        error: objectivesError,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
  }

  return { ...scenario, objectives: objectives.map((obj: {objective: string}) => obj.objective) };
}
