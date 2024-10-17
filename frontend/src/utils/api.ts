import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = 'https://fgtbrxevozlpcqrjvqvk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const isDevelopment = process.env.NODE_ENV === 'development'

function getFunctionUrl(functionName: string) {
  return isDevelopment
    ? `http://127.0.0.1:54321/functions/v1/${functionName}`
    : `${supabaseUrl}/functions/v1/${functionName}`
}

// Define a type for the function body
type FunctionBody = {
  action: string;
  [key: string]: unknown;
};

async function invokeFunction(functionName: string, body: FunctionBody) {
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

export async function createConversation(initialMessage: string, scenarioId: string, personaId: string) {
  const userId = await getUserId();
  const response = await invokeFunction('assistant', { action: 'createConversation', userId, initialMessage, scenarioId, personaId });
  return response.result;
}

export async function sendMessage(conversationId: string, content: string) {
  const response = await invokeFunction('assistant', { action: 'sendMessage', conversationId, content });
  if (response && response.result && response.result.content) {
    return response.result;
  } else {
    console.error('Unexpected response format:', response);
    throw new Error('Unexpected response format from server');
  }
}

export async function runAssistant(threadId: string) {
  return invokeFunction('assistant', { action: 'runAssistant', threadId })
}

export async function getThreadMessages(threadId: string) {
  return invokeFunction('assistant', { action: 'getThreadMessages', threadId })
}

// Implement this function to get the current user's ID
async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.id) {
    return user.id;
  } else {
    // Generate or retrieve a temporary userID for unauthenticated users
    return getOrCreateTemporaryUserId();
  }
}

function getOrCreateTemporaryUserId() {
  const storageKey = 'temporaryUserId';
  let temporaryUserId = localStorage.getItem(storageKey);
  
  if (!temporaryUserId) {
    temporaryUserId = `temp_${uuidv4()}`;
    localStorage.setItem(storageKey, temporaryUserId);
  }
  
  return temporaryUserId;
}
