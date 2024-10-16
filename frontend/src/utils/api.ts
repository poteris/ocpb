import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const isDevelopment = process.env.NODE_ENV === 'development'

function getFunctionUrl(functionName: string) {
  return isDevelopment
    ? `http://127.0.0.1:54321/functions/v1/${functionName}`
    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`
}

async function invokeFunction(functionName: string, body: any) {
  try {
    if (isDevelopment) {
      const response = await fetch(getFunctionUrl(functionName), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error invoking function ${functionName}:`, errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }
      return response.json();
    } else {
      const { data, error } = await supabase.functions.invoke(functionName, { body: JSON.stringify(body) });
      if (error) {
        console.error(`Error invoking function ${functionName}:`, error);
        throw error;
      }
      return data;
    }
  } catch (error) {
    console.error(`Error in invokeFunction for ${functionName}:`, error);
    throw error;
  }
}

export async function createAssistant(name: string, description: string, model: string) {
  return invokeFunction('assistant', { action: 'createAssistant', name, description, model })
}

export async function createThread(assistantId: string) {
  console.log('Creating thread with assistantId:', assistantId);
  return invokeFunction('assistant', { action: 'createThread', assistantId })
}

export async function sendMessage(threadId: string, content: string) {
  return invokeFunction('assistant', { action: 'sendMessage', threadId, content })
}

export async function runAssistant(threadId: string) {
  return invokeFunction('assistant', { action: 'runAssistant', threadId })
}

export async function getThreadMessages(threadId: string) {
  return invokeFunction('assistant', { action: 'getThreadMessages', threadId })
}
