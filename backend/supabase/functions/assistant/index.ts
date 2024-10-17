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

// Add this near the top of the file
const ASSISTANT_ID = 'asst_RxXjFSaqQuMvn5WIbdNZ88Tr'; // Store this in an environment variable

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
  
  const { error } = await supabase
    .from('assistants')
    .insert({ assistant_id: assistant.id, name, description, model })
    .select()

  if (error) throw error
  return { assistant_id: assistant.id, name, description, model }
}

async function createThread({ userId, initialMessage }: { userId: string; initialMessage?: string }) {
  try {
    console.log('Received createThread request');

    if (!userId) {
      throw new Error('Missing userId');
    }

    let threadOptions: any = {};
    if (initialMessage) {
      threadOptions.messages = [
        {
          role: "user",
          content: initialMessage
        }
      ];
    }

    const thread = await openai.beta.threads.create(threadOptions);
    
    // Store only essential information in the database
    const { error } = await supabase
      .from('threads')
      .insert({ thread_id: thread.id, user_id: userId, assistant_id: ASSISTANT_ID });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Thread created:', thread.id);
    return { id: thread.id };
  } catch (error) {
    console.error('Error in createThread:', error);
    throw error;
  }
}

async function sendMessage({ threadId, content }: { threadId: string; content: string }) {
  // Send the user message
  const userMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: content
  });
  console.log('User message created:', userMessage);

  // Run the assistant and get the response
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
    instructions: 'Provide a casual response within 50 words.'
  });

  // Wait for completion (consider implementing a more efficient waiting mechanism)
  let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  while (runStatus.status !== 'completed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
  }

  // Fetch the assistant's response
  const messages = await openai.beta.threads.messages.list(threadId, { limit: 1 });
  const latestMessage = messages.data[0];

  // Extract the content safely
  let messageContent = '';
  if (latestMessage.content[0].type === 'text') {
    messageContent = latestMessage.content[0].text.value;
  } else {
    console.log('Unsupported message content type:', latestMessage.content[0].type);
  }

  return {
    id: latestMessage.id,
    role: 'assistant',
    content: messageContent
  };
}

async function getThreadMessages({ threadId }: { threadId: string }) {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content[0].type === 'text' ? msg.content[0].text.value : ''
  }));
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
