/// <reference types="https://deno.land/x/deno@v1.37.0/mod.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2'
import { OpenAI } from 'https://deno.land/x/openai@v4.67.3/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import personas from './personas.json' assert { type: "json" };
import scenarios from './scenarios.json' assert { type: "json" };

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://127.0.0.1:54321'
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

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

    // Fetch scenario and persona details from JSON files
    const scenario = scenarios.scenarios.find(s => s.id === scenarioId);
    const persona = personas.personas.find(p => p.id === personaId);

    if (!scenario || !persona) {
      throw new Error('Scenario or persona not found');
    }

    // Create system prompt
    const systemPrompt = `You are a colleague of the union rep, who will aim to convince you to join the union. Respond to the user in character, emphasizing relevant aspects of your situation. Only demonstrate interest in joining the union if the rep has engaged with your unique situation effectively.
    Scenario: ${scenario.description}
    Persona: ${persona.characterType}, ${persona.mood}, ${persona.ageRange}
    Context: ${persona.context}`;

    let messages = [
      { role: "system", content: systemPrompt },
    ];

    if (initialMessage) {
      messages.push({ role: "user", content: initialMessage });
    }

    // Create conversation in the database
    const conversationId = crypto.randomUUID();
    const { error } = await supabase
      .from('conversations')
      .insert({ conversation_id: conversationId, user_id: userId, scenario_id: scenarioId, persona_id: personaId });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // If there's an initial message, get the AI response
    let aiResponse = null;
    if (initialMessage) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
      });
      aiResponse = completion.choices[0].message.content;
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
    // Fetch the conversation details
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('scenario_id, persona_id')
      .eq('conversation_id', conversationId)
      .single();

    if (conversationError) throw conversationError;

    // Fetch scenario and persona details from JSON files
    const scenario = scenarios.scenarios.find(s => s.id === conversationData.scenario_id);
    const persona = personas.personas.find(p => p.id === conversationData.persona_id);

    if (!scenario || !persona) {
      throw new Error('Scenario or persona not found');
    }

    // Create system prompt
    const systemPrompt = `You are a colleague of the union rep, who will aim to convince you to join the union. Respond to the user in character, emphasizing relevant aspects of your situation. Only demonstrate interest in joining the union if the rep has engaged with your unique situation effectively.
    Scenario: ${scenario.description}
    Persona: ${persona.characterType}, ${persona.mood}, ${persona.ageRange}
    Context: ${persona.context}`;

    // Fetch previous messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    let messages = [
      { role: "system", content: systemPrompt },
      ...messagesData.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: content }
    ];

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
    });
    const aiResponse = completion.choices[0].message.content;

    // Save messages to database
    const { error: insertError } = await supabase.from('messages').insert([
      { conversation_id: conversationId, role: 'user', content: content },
      { conversation_id: conversationId, role: 'assistant', content: aiResponse }
    ]);

    if (insertError) throw insertError;

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

  return messages.data.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content
  }));
}

serve(async (req) => {
  console.log('Received request:', req.method, req.url);

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
