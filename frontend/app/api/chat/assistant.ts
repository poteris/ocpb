import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
  return data[0]
}

async function createThread({ userId, assistantId }: { userId: string; assistantId: string }) {
  const thread = await openai.beta.threads.create()
  
  const { data, error } = await supabase
    .from('threads')
    .insert({ thread_id: thread.id, user_id: userId, assistant_id: assistantId })
    .select()

  if (error) throw error
  return data[0]
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
