/// <reference types="https://deno.land/x/deno@v1.37.0/mod.ts" />

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2'
import { OpenAI } from 'https://deno.land/x/openai@v4.67.3/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
  console.log('Supabase client initialized successfully')
} catch (error) {
  console.error('Error initializing Supabase client:', error)
  Deno.exit(1)
}

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

export async function POST(req: Request) {
  const { action, ...params } = await req.json()

  switch (action) {
    case 'createConversation':
      return await createConversation(params)
    case 'sendMessage':
      return await sendMessage(params)
    case 'getConversationMessages':
      return await getConversationMessages(params)
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  }
}

async function createConversation({ userId, initialMessage, scenarioId, personaId, systemPromptId = '1' }: { userId: string; initialMessage?: string; scenarioId: string; personaId: string; systemPromptId?: string }) {
  try {
    console.log('Received createConversation request', { userId, initialMessage, scenarioId, personaId, systemPromptId });

    if (!userId || !scenarioId || !personaId) {
      throw new Error('Missing userId, scenarioId, or personaId');
    }

    const scenario = await getScenario(scenarioId);
    console.log('Scenario:', scenario);

    const persona = await getPersona(personaId);
    console.log('Persona:', persona);

    if (!scenario || !persona) {
      throw new Error('Scenario or persona not found');
    }

    const conversationId = crypto.randomUUID();
    console.log('Generated conversationId:', conversationId);

    const { error } = await supabase
      .from('conversations')
      .insert({ conversation_id: conversationId, user_id: userId, scenario_id: scenarioId, persona_id: personaId, system_prompt_id: systemPromptId });

    if (error) {
      console.error('Error inserting conversation:', error);
      throw error;
    }

    let aiResponse = null;
    if (initialMessage) {
      const systemPrompt = await getSystemPromptById(systemPromptId);
      console.log('System prompt:', systemPrompt);

      const messages = [
        { role: "system", content: createSystemPrompt(scenario, persona, systemPrompt) },
        { role: "user", content: initialMessage }
      ];
      console.log('Messages for AI:', messages);

      aiResponse = await getAIResponse(messages, scenario, persona);
      console.log('AI Response:', aiResponse);

      await saveMessages(conversationId, initialMessage, aiResponse || '');
    }

    console.log('Conversation created:', conversationId);
    return { id: conversationId, aiResponse };
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
}

async function sendMessage({ conversationId, content }: { conversationId: string; content: string }) {
  try {
    const { scenario, persona, systemPromptId } = await getConversationContext(conversationId);

    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    const systemPrompt = await getSystemPromptById(systemPromptId);
    let messages = [
      { role: "system", content: createSystemPrompt(scenario, persona, systemPrompt) },
      ...messagesData.map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: content }
    ];

    const aiResponse = await getAIResponse(messages, scenario, persona);
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
  const persona = await getPersona(data.persona_id);

  if (!scenario || !persona) {
    throw new Error('Scenario or persona not found');
  }

  return { scenario, persona, systemPromptId: data.system_prompt_id || '1' };
}

async function getScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      description,
      scenario_objectives (objective),
      scenario_prompts (prompt)
    `)
    .eq('id', scenarioId)
    .single();

  if (error) throw error;

  return {
    ...data,
    objectives: data.scenario_objectives.map((obj: any) => obj.objective),
    prompts: data.scenario_prompts.map((prompt: any) => prompt.prompt)
  };
}

async function getPersona(personaId: string) {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', personaId)
    .single();

  if (error) throw error;

  return data;
}

async function getSystemPromptById(id: string) {
  console.log('Fetching system prompt for id:', id);
  const { data, error } = await supabase
    .from('system_prompts')
    .select('content')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching system prompt:', error);
    return "You are an AI assistant. Respond to the user's messages appropriately.";
  }

  console.log('Retrieved system prompt:', data);
  return data.content;
}

function createSystemPrompt(scenario: any, persona: any, systemPromptContent: string): string {
  return `${systemPromptContent}
    
    Scenario: ${scenario.description}
    Persona: ${persona.character_type}, ${persona.mood}, ${persona.age_range}
    Context: ${persona.context}
    
    Provide a concise response in 2-3 sentences.`;
}

async function getAIResponse(messages: any[], scenario: any, persona: any) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    max_tokens: 150,
    temperature: 0.7,
    presence_penalty: 0.6,
    frequency_penalty: 0.6,
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
  console.log('Received request:', req.method, req.url);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.text();
    console.log('Request body:', body);
    let params: any = {};
    
    if (body) {
      try {
        params = JSON.parse(body);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const { action, ...otherParams } = params;
    console.log('Action:', action, 'Params:', otherParams);

    let result;

    switch (action) {
      case 'createConversation':
        result = await createConversation(params);
        break;
      case 'sendMessage':
        result = await sendMessage(params);
        break;
      case 'getConversationMessages':
        result = await getConversationMessages(params);
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
