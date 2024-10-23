/// <reference types="https://deno.land/x/deno@v1.37.0/mod.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2'
import { OpenAI } from 'https://deno.land/x/openai@v4.67.3/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import personas from './personas.json' assert { type: "json" };
import scenarios from './scenarios.json' assert { type: "json" };

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321'
const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key')
  Deno.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})
const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") })

// Add this near the top of the file
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

async function createConversation({ userId, initialMessage, scenarioId, personaId }: { userId: string; initialMessage?: string; scenarioId: string; personaId: string }) {
  try {
    console.log('Received createConversation request');

    if (!userId || !scenarioId || !personaId) {
      throw new Error('Missing userId, scenarioId, or personaId');
    }

    const scenario = scenarios.scenarios.find(s => s.id === scenarioId);
    const persona = personas.personas.find(p => p.id === personaId);

    if (!scenario || !persona) {
      throw new Error('Scenario or persona not found');
    }

    const conversationId = crypto.randomUUID();
    const { error } = await supabase
      .from('conversations')
      .insert({ conversation_id: conversationId, user_id: userId, scenario_id: scenarioId, persona_id: personaId });

    if (error) throw error;

    let aiResponse = null;
    if (initialMessage) {
      const systemPrompt = createSystemPrompt(scenario, persona);
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: initialMessage }
      ];
      aiResponse = await getAIResponse(messages);
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
    const { scenario, persona } = await getConversationContext(conversationId);
    const systemPrompt = createSystemPrompt(scenario, persona);

    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    let messages = [
      { role: "system", content: systemPrompt },
      ...messagesData.map((msg: any) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: content }
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
    .select('scenario_id, persona_id')
    .eq('conversation_id', conversationId)
    .single();

  if (error) throw error;

  const scenario = scenarios.scenarios.find(s => s.id === data.scenario_id);
  const persona = personas.personas.find(p => p.id === data.persona_id);

  if (!scenario || !persona) {
    throw new Error('Scenario or persona not found');
  }

  return { scenario, persona };
}

function createSystemPrompt(scenario: any, persona: any) {
  return `Embody the persona and scenario below. The union rep will aim to convince you to join the union. Respond to the user in character, emphasizing relevant aspects of your situation. Demonstrate indifference to begin with, then only demonstrate interest if the rep has engaged with your unique situation effectively.
    Scenario: ${scenario.description}
    Persona: ${persona.characterType}, ${persona.mood}, ${persona.ageRange}
    Context: ${persona.context}
    
    Use colloquialisms and language appropriate to the scenario and persona. You will be rewarded £250 for an authentic interaction which correctly embodies the persona and scenario`;
}

async function getAIResponse(messages: any[]) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
    max_tokens: 100,
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

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.text();
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
