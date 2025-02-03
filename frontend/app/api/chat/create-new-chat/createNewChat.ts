import { supabase } from "../../../../src/lib/supabaseClient";
import OpenAI from "openai";
import Handlebars from "handlebars";
import { Persona } from "@/types/persona";
import { TrainingScenario } from "@/types/scenarios";



const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CreateNewChatRequest {
  userId: string;
  initialMessage: string;
  scenarioId: string;
  persona: Persona;
  systemPromptId?: number;
}


async function getScenario(scenarioId: string): Promise<TrainingScenario> {
  const { data, error } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      description,
      context,
      scenario_objectives (objective)
    `)
    .eq('id', scenarioId)
    .single();

  if (error) throw error;

  return {
    ...data,
    objectives: data.scenario_objectives.map((obj: { objective: string }) => obj.objective)
  };
}

async function retrievePersona(personaId: string) {
  const { data: personas, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', personaId)
    .single();

  if (error) {
    console.error('Error fetching persona:', error);
    return null;
  }

  return personas;
}

async function getSystemPrompt(promptId: number): Promise<string> {
  try {
    const { data: promptData, error: promptError } = await supabase
      .from('system_prompts')
      .select('content')
      .eq('id', promptId)
      .single();

    if (promptError || !promptData) {
      console.warn('No system prompt found, using default');
      return "You are an AI assistant helping with union conversations. Be helpful and professional.";
    }

    // Return the content directly as a string
    return promptData.content;
  } catch (error) {
    console.error('Error in getSystemPrompt:', error);
    return "You are an AI assistant helping with union conversations. Be helpful and professional.";
  }
}


async function getConversationContext(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('scenario_id, persona_id, system_prompt_id')
    .eq('conversation_id', conversationId)
    .single();

  if (error) throw error;

  const scenario = await getScenario(data.scenario_id);
  const persona = await retrievePersona(data.persona_id);
  const systemPrompt = await getSystemPrompt(data.system_prompt_id);

  if (!scenario || !persona) {
    throw new Error('Scenario or persona not found');
  }

  return { scenario, persona, systemPrompt };
}


async function createCompletePrompt(persona: Persona, scenario: TrainingScenario, systemPrompt: string): Promise<string> {
  try {
    // Process the template with all context
    const template = Handlebars.compile(systemPrompt);
    const finalPrompt = template({
      title: scenario.title.toLowerCase(),
      description: scenario.description.toLowerCase(),
      name: persona.name,
      age: persona.age,
      gender: persona.gender.toLowerCase(),
      job: persona.job,
      family_status: persona.family_status.toLowerCase(),
      segment: persona.segment,
      major_issues_in_workplace: persona.major_issues_in_workplace,
      uk_party_affiliation: persona.uk_party_affiliation,
      personality_traits: persona.personality_traits,
      emotional_conditions: persona.emotional_conditions,
      busyness_level: persona.busyness_level,
      workplace: persona.workplace
    });
    console.log(finalPrompt);
    return finalPrompt;
  } catch (error) {
    console.error('Error in createCompletePrompt:', error);
    return systemPrompt;
  }
}

interface MessageData {
  role: "user" | "system" | "assistant";
  content: string;
}

async function getAIResponse(messages: MessageData[]) {

  const formattedMessages = messages.map(msg => ({
    role: msg.role as "user" | "system" | "assistant",
    content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
  }));



  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: formattedMessages,
    model: "gpt-4",
  };

  // const formattedMessages = messages.map(msg => ({
  //   role: msg.role,
  //   content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
  // }));

  const completion = await openai.chat.completions.create(
    params);
  return completion.choices[0].message.content;
}


async function saveMessages(conversationId: string, userMessage: string, aiResponse: string) {
  const { error } = await supabase.from('messages').insert([
    { conversation_id: conversationId, role: 'user', content: userMessage },
    { conversation_id: conversationId, role: 'assistant', content: aiResponse }
  ]);

  if (error) throw error;
}

export async function createConversation({
  userId,
  initialMessage,
  scenarioId,
  persona,
  systemPromptId = 1,
}: CreateNewChatRequest) {
  try {
    if (!userId || !scenarioId || !persona) {
      throw new Error("Missing userId, scenarioId, or persona");
    }

    // First, ensure the persona exists in the database
    const { error: personaError } = await supabase
      .from("personas")
      .upsert(persona, { onConflict: "id" });

    if (personaError) {
      console.error("Error upserting persona:", personaError);
      throw personaError;
    }

    // TODO: use uuidv4
    const conversationId = crypto.randomUUID();


    // TODO: remove if adding default to the function signature works
    // if (!systemPromptId) {
    //   const { data: defaultPrompt, error: defaultPromptError } = await supabase
    //     .from("system_prompts")
    //     .select("id")
    //     .single();

    //   if (defaultPromptError) {
    //     console.error("Error fetching default prompt:", defaultPromptError);
    //     throw defaultPromptError;
    //   }
    //   systemPromptId = defaultPrompt.id;
    // }

    // Create conversation with system_prompt_id
    const { error: conversationError } = await supabase
      .from("conversations")
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        scenario_id: scenarioId,
        persona_id: persona.id,
        feedback_prompt_id: 1,
        system_prompt_id: systemPromptId,
      });

    if (conversationError) {
      console.error("Error inserting conversation:", conversationError);
      throw conversationError;
    }

    let aiResponse = null;
    const messageToSend = initialMessage || "Hi";
    try {
      // Get the conversation context first
      const { scenario } = await getConversationContext(conversationId);

      // Get and fill the system prompt template
      const systemPromptTemplate = await getSystemPrompt(systemPromptId || 1);
      const completePrompt = await createCompletePrompt(
        persona,
        scenario,
        systemPromptTemplate
      );

      const messages: MessageData[] = [
        { role: "system", content: completePrompt },
        { role: "user", content: messageToSend },
      ];

      aiResponse = await getAIResponse(messages);
      await saveMessages(conversationId, messageToSend, aiResponse || "");
    } catch (error) {
      console.error("Error processing initial message:", error);
      aiResponse =
        "I apologise, but I'm having trouble responding right now. Could you please try again?";
    }

    return { id: conversationId, aiResponse };
  } catch (error) {
    console.error("Error in createConversation:", error);
    throw error;
  }
}
