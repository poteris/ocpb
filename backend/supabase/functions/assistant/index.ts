/// <reference types="https://deno.land/x/deno@v1.37.0/mod.ts" />

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2'
import { OpenAI } from 'https://deno.land/x/openai@v4.67.3/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { HandlebarsJS } from "https://deno.land/x/handlebars@v0.10.0/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321'
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key')
  Deno.exit(1)
}

let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  })
} catch (error) {
  console.error('Error initialising Supabase client:', error)
  Deno.exit(1)
}

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

// Update the generatePersona function
async function generatePersona() {

  // Fetch the persona prompt
  const { data: personaPromptData, error: personaPromptError } = await supabase
    .from('persona_prompts')
    .select('content')
    .eq('id', 1)  // Using default prompt ID 1
    .single();

  if (personaPromptError) {
    console.error('Error fetching persona prompt:', personaPromptError);
    throw personaPromptError;
  }

  const prompt = `${personaPromptData.content}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    functions: [
      {
        name: "generate_persona",
        description: "Generate a coherent persona for a workplace conversation with a trade union representative",
        parameters: {
          type: "object",
          properties: {
            name: { 
              type: "string",
              description: "Full name of the person"
            },
            segment: { 
              type: "string",
              description: "Segment of the person (Former Union Member, Non-member of the Union, Reluctant Worker, Young Worker)"
            },
            age: { 
              type: "number",
              description: "Age of the person (between 15 and 62)"
            },
            gender: { 
              type: "string",
              description: "Gender of the person (Male or Female)"
            },
            family_status: { 
              type: "string",
              description: "Family status of the person (Divorced, In a relationship, Married, Married with Children, Single, Widowed)"
            },
            uk_party_affiliation: { 
              type: "string",
              description: "Political affiliation of the person (Conservative, Labour, Lib Dem, Green, Reform UK, Independent)"
            },
            workplace: { 
              type: "string",
              description: "Place of work of the person (an office in the department of work and pensions)"
            },
            job: { 
              type: "string",
              description: "Specific job title and role"
            },
            busyness_level: { 
              type: "string",
              description: "Busyness level of the person (low, medium, high)"
            },
            major_issues_in_workplace: { 
              type: "string",
              description: "Key workplace concerns and challenges"
            },
            personality_traits: { 
              type: "string",
              description: "Comma-separated list of personality characteristics"
            },
            emotional_conditions: { 
              type: "string",
              description: "Emotional factors that would influence union support"
            }
          },
          required: ["name", "segment", "age", "gender", "family_status", "uk_party_affiliation", "workplace", "job", "major_issues_in_workplace", "personality_traits", "emotional_conditions"]
        }
      }
    ],
    function_call: { name: "generate_persona" }
  });

  const functionCall = completion.choices[0].message.function_call;
  if (!functionCall || !functionCall.arguments) {
    throw new Error('No function call or arguments received from OpenAI');
  }

  const generatedPersona = JSON.parse(functionCall.arguments);

  return {
    id: `${generatedPersona.job.toLowerCase().replace(/\s+/g, '')}-${generatedPersona.name.toLowerCase().replace(/\s+/g, '')}-${generatedPersona.age}-${generatedPersona.gender.toLowerCase()}`,
    ...generatedPersona,
  };
}

// Add this new function to handle feedback generation
async function generateFeedback(conversationId: string) {
  try {
    // Fetch the conversation and its related data
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        *,
        scenario:scenarios(*),
        persona:personas(*)
      `)
      .eq('conversation_id', conversationId)
      .single();

    if (conversationError) throw conversationError;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    // Fetch the feedback prompt from feedback_prompts
    const { data: feedbackPromptData, error: feedbackPromptError } = await supabase
      .from('feedback_prompts')
      .select('content')
      .single();

    if (feedbackPromptError) throw feedbackPromptError;

    if (!feedbackPromptData) {
      throw new Error('Feedback prompt not found in feedback_prompts');
    }

    // Construct the conversation history
    const conversationHistory = messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');

    // Construct the prompt for feedback
    const feedbackPrompt = `
${feedbackPromptData.content}

Scenario: ${conversation.scenario.title}
${conversation.scenario.description}

Persona: ${conversation.persona.name}, ${conversation.persona.age} years old, ${conversation.persona.job}
Personality: ${conversation.persona.personality_traits}
Union Support Conditions: ${conversation.persona.emotional_conditions}

Conversation:
${conversationHistory}

Provide feedback based on the conversation above.
`;

    // Send the completion request to OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: feedbackPrompt }],
      functions: [
        {
          name: "generate_feedback",
          description: "Generate feedback for the conversation",
          parameters: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score between 1 and 5"
              },
              summary: {
                type: "string",
                description: "Brief summary of overall performance"
              },
              strengths: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" }
                  }
                },
                description: "List of strengths identified in the conversation"
              },
              areas_for_improvement: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" }
                  }
                },
                description: "List of areas for improvement identified in the conversation"
              }
            },
            required: ["score", "summary", "strengths", "areas_for_improvement"]
          }
        }
      ],
      function_call: { name: "generate_feedback" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call or arguments received from OpenAI');
    }

    const feedbackData = JSON.parse(functionCall.arguments);

    return feedbackData;
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
}

// Update the POST function to include the generatePersona action
export async function POST(req: Request) {
  const { action, ...params } = await req.json()

  switch (action) {
    case 'generatePersona':
      return new Response(JSON.stringify({ result: await generatePersona() }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    case 'createConversation':
      return await createConversation(params)
    case 'sendMessage':
      return await sendMessage(params)
    case 'getConversationMessages':
      return await getConversationMessages(params)
    case 'getFeedback':
      return new Response(JSON.stringify({ result: await generateFeedback(params.conversationId) }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  }
}

async function createConversation({ userId, initialMessage, scenarioId, persona, systemPromptId }: { userId: string; initialMessage?: string; scenarioId: string; persona: any; systemPromptId?: number }) {
  try {
    if (!userId || !scenarioId || !persona) {
      throw new Error('Missing userId, scenarioId, or persona');
    }

    // First, ensure the persona exists in the database
    const { error: personaError } = await supabase
      .from('personas')
      .upsert(persona, { onConflict: 'id' });

    if (personaError) {
      console.error('Error upserting persona:', personaError);
      throw personaError;
    }

    const conversationId = crypto.randomUUID();

    if (!systemPromptId) {
      const { data: defaultPrompt, error: defaultPromptError } = await supabase
        .from('system_prompts')
        .select('id')
        .single();
      
      if (defaultPromptError) {
        console.error('Error fetching default prompt:', defaultPromptError);
        throw defaultPromptError;
      }
      systemPromptId = defaultPrompt.id;
    }

    // Create conversation with system_prompt_id
    const { error: conversationError } = await supabase
      .from('conversations')
      .insert({ 
        conversation_id: conversationId, 
        user_id: userId, 
        scenario_id: scenarioId, 
        persona_id: persona.id,
        feedback_prompt_id: 1,
        system_prompt_id: systemPromptId
      });

    if (conversationError) {
      console.error('Error inserting conversation:', conversationError);
      throw conversationError;
    }

    let aiResponse = null;
    const messageToSend = initialMessage || "Hi";
    try {
      // Get the conversation context first
      const { scenario } = await getConversationContext(conversationId);
      
      // Get and fill the system prompt template
      const systemPromptTemplate = await getSystemPrompt(systemPromptId || 1);
      const completePrompt = await createCompletePrompt(persona, scenario, systemPromptTemplate);
      
      const messages = [
        { role: "system", content: completePrompt },
        { role: "user", content: messageToSend }
      ];

      aiResponse = await getAIResponse(messages);
      await saveMessages(conversationId, messageToSend, aiResponse || '');
    } catch (error) {
      console.error('Error processing initial message:', error);
      aiResponse = "I apologise, but I'm having trouble responding right now. Could you please try again?";
    }

    return { id: conversationId, aiResponse };
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
}

async function sendMessage({ conversationId, content, scenarioId }: { conversationId: string; content: string; scenarioId?: string }) {
  try {
    // Get conversation context
    const { persona, scenario, systemPrompt } = await getConversationContext(conversationId);

    // Get message history
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;
    
    // Create a structured prompt that maintains context
    const completePrompt = await createCompletePrompt(persona, scenario, systemPrompt);
    
    // Organise messages with clear context preservation
    let messages = [
      // System message with complete context
      { 
        role: "system", 
        content: `${completePrompt}\n\nRemember to maintain consistent personality and context throughout the conversation. Previous context: This is message ${messagesData.length + 1} in the conversation.`
      },
      // Previous conversation history
      ...messagesData.map((msg: any) => ({ 
        role: msg.role, 
        content: msg.content 
      })),
      // New user message
      { 
        role: "user", 
        content: content 
      }
    ];

    const aiResponse = await getAIResponse(messages);
    await saveMessages(conversationId, content, aiResponse);

    return { content: aiResponse };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

async function getConversationMessages({ conversationId }: { conversationId: string }) {
  const messages = await supabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  return messages.data.map((msg: any) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content
  }));
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

async function getScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      description,
      scenario_objectives (objective)
    `)
    .eq('id', scenarioId)
    .single();

  if (error) throw error;

  return {
    ...data,
    objectives: data.scenario_objectives.map((obj: any) => obj.objective)
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

// Update the getSystemPrompt function
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

// Update the createCompletePrompt function
async function createCompletePrompt(persona: any, scenario: any, systemPrompt: string): Promise<string> {
  try {
    // Process the template with all context
    const template = HandlebarsJS.compile(systemPrompt);
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

async function getAIResponse(messages: any[]) {
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
  }));

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: formattedMessages,
    max_tokens: 150,
    temperature: 0.7,
    // Increase presence_penalty to encourage more dynamic responses
    presence_penalty: 0.8,
    // Reduce frequency_penalty to maintain consistent personality
    frequency_penalty: 0.3,
  });
  return completion.choices[0].message.content;
}

async function saveMessages(conversationId: string, userMessage: string, aiResponse: string) {
  const { error } = await supabase.from('messages').insert([
    { conversation_id: conversationId, role: 'user', content: userMessage },
    { conversation_id: conversationId, role: 'assistant', content: aiResponse }
  ]);

  if (error) throw error;
}

function withTimeout(handler: (req: Request) => Promise<Response>, timeoutMs: number) {
  return async (req: Request): Promise<Response> => {
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Function timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([handler(req), timeoutPromise]);
    } catch (error) {
      console.error('Function execution error:', error);
      return new Response(JSON.stringify({ error: 'Function execution failed or timed out' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  };
}

const mainHandler = async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const { action, ...params } = await req.json();

    let result;
    switch (action) {
      case 'generatePersona':
        result = await generatePersona();
        break;
      case 'createConversation':
        result = await createConversation(params);
        break;
      case 'sendMessage':
        result = await sendMessage(params);
        break;
      case 'getConversationMessages':
        result = await getConversationMessages(params);
        break;
      case 'getFeedback':
        result = await generateFeedback(params.conversationId);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in serve function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

const timeoutMs = 120000; // 120 seconds timeout
serve(withTimeout(mainHandler, timeoutMs));
