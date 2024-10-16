import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function createThread(userId: string, assistantId: string) {
  const { data, error } = await supabase.functions.invoke('chat-api', {
    body: JSON.stringify({ action: 'createThread', userId, assistantId })
  })
  if (error) throw error
  return data
}

export async function sendMessage(threadId: string, content: string) {
  const { data, error } = await supabase.functions.invoke('chat-api', {
    body: JSON.stringify({ action: 'sendMessage', threadId, content })
  })
  if (error) throw error
  return data
}

export async function runAssistant(threadId: string) {
  const { data, error } = await supabase.functions.invoke('chat-api', {
    body: JSON.stringify({ action: 'runAssistant', threadId })
  })
  if (error) throw error
  return data
}

export async function getThreadMessages(threadId: string) {
  const { data, error } = await supabase.functions.invoke('chat-api', {
    body: JSON.stringify({ action: 'getThreadMessages', threadId })
  })
  if (error) throw error
  return data
}