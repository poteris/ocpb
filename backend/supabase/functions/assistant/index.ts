/// <reference types="https://deno.land/x/deno@v1.37.0/mod.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.2'
import { OpenAI } from 'https://deno.land/x/openai@v4.67.3/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key')
  Deno.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

// Add this near the top of the file
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function POST(req: Request) {
  const { action, ...params } = await req.json()

  switch (action) {
    case 'createAssistant':
      return await createAssistant(params)
    case 'createThread':
      return await createThread(params)
    case 'sendMessage':
      return await sendMessage(params)
    case 'runAssistant':
      return await runAssistant(params)
    case 'getThreadMessages':
      return await getThreadMessages(params)
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  }
}

async function createAssistant({ name, description, model }: { name: string; description: string; model: string }) {
  const assistant = await openai.beta.assistants.create({ name, description, model })
  
  const { data, error } = await supabase
    .from('assistants')
    .insert({ assistant_id: assistant.id, name, description, model })
    .select()

  if (error) throw error
  return { assistant_id: assistant.id, name, description, model }
}

async function createThread({ assistantId }: { assistantId: string }) {
  try {
    console.log('Received createThread request with assistantId:', assistantId);

    if (!assistantId) {
      throw new Error('Missing assistantId');
    }

    const thread = await openai.beta.threads.create();
    
    const { data, error } = await supabase
      .from('threads')
      .insert({ thread_id: thread.id, assistant_id: assistantId })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No data returned from Supabase');
    }

    return { id: thread.id, assistant_id: assistantId };
  } catch (error) {
    console.error('Error in createThread:', error);
    throw error;
  }
}

async function sendMessage({ threadId, content }: { threadId: string; content: string }) {
  const { data: threadData } = await supabase
    .from('threads')
    .select('thread_id')
    .eq('id', threadId)
    .single()

  const message = await openai.beta.threads.messages.create(threadData?.thread_id, {
    role: 'user',
    content
  })

  const { data, error } = await supabase
    .from('messages')
    .insert({ message_id: message.id, thread_id: threadId, role: 'user', content })
    .select()

  if (error) throw error
  return data[0]
}

async function runAssistant({ threadId }: { threadId: string }) {
  const { data: threadData } = await supabase
    .from('threads')
    .select('thread_id, assistant_id')
    .eq('id', threadId)
    .single()

  const { data: assistantData } = await supabase
    .from('assistants')
    .select('assistant_id')
    .eq('id', threadData?.assistant_id)
    .single()

  const run = await openai.beta.threads.runs.create(threadData?.thread_id, {
    assistant_id: assistantData?.assistant_id
  })

  // Poll for completion
  let runStatus = await openai.beta.threads.runs.retrieve(threadData?.thread_id, run.id)
  while (runStatus.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    runStatus = await openai.beta.threads.runs.retrieve(threadData?.thread_id, run.id)
  }

  // Fetch and save the assistant's response
  const messages = await openai.beta.threads.messages.list(threadData?.thread_id)
  const latestMessage = messages.data[0]

  // Extract the content safely
  let messageContent = ''
  if (latestMessage.content[0].type === 'text') {
    messageContent = latestMessage.content[0].text.value
  } else {
    // Handle other content types if necessary
    console.log('Unsupported message content type:', latestMessage.content[0].type)
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ message_id: latestMessage.id, thread_id: threadId, role: 'assistant', content: messageContent })
    .select()

  if (error) throw error
  return data[0]
}

async function getThreadMessages({ threadId }: { threadId: string }) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...params } = await req.json();
    console.log('Received action:', action, 'with params:', params);

    let result;

    switch (action) {
      case 'createAssistant':
        result = await createAssistant(params);
        break;
      case 'createThread':
        result = await createThread(params);
        break;
      case 'sendMessage':
        result = await sendMessage(params);
        break;
      case 'runAssistant':
        result = await runAssistant(params);
        break;
      case 'getThreadMessages':
        result = await getThreadMessages(params);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Ensure all responses include CORS headers
    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in serve function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
