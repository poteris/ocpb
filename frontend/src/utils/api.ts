import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string)

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

export interface Persona {
  id: string;
  name: string;
  segment: string;
  age: string;
  gender: string;
  family_status: string;
  job: string;
  major_issues_in_workplace: string;
  uk_party_affiliation: string;
  personality_traits: string;
  emotional_conditions_for_supporting_the_union: string;
  busyness_level: string;
  workplace: string;
}

export async function generatePersona(): Promise<Persona | null> {
  try {
    const response = await invokeFunction('assistant', {
      action: 'generatePersona',
    });

    if (response && response.result) {
      return response.result;
    } else {
      console.error('Unexpected response format:', response);
      throw new Error('Unexpected response format from server');
    }
  } catch (error) {
    console.error('Error fetching persona:', error);
    return null;
  }
}

export async function storePersona(persona: Persona): Promise<void> {
  try {
    const { error } = await supabase.from('personas').upsert(persona, { onConflict: 'id' });
    if (error) throw error;
  } catch (error) {
    console.error('Error storing persona:', error);
    throw error;
  }
}

export async function createConversation(initialMessage: string, scenarioId: string, persona: Persona, systemPromptId?: string) {
  const userId = await getUserId();
  const response = await invokeFunction('assistant', { 
    action: 'createConversation', 
    userId, 
    initialMessage, 
    scenarioId, 
    persona,
    systemPromptId
  });
  return response.result;
}

export async function sendMessage(conversationId: string, content: string, scenarioId?: string) {
  const response = await invokeFunction('assistant', { action: 'sendMessage', conversationId, content });
  if (response && response.result && response.result.content) {
    return response.result;
  } else {
    console.error('Unexpected response format:', response);
    throw new Error('Unexpected response format from server');
  }
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

export interface FeedbackData {
  score: number;
  strengths: { title: string; description: string; }[];
  areas_for_improvement: { title: string; description: string; }[];
  summary: string;
}

export async function getFeedback(conversationId: string): Promise<FeedbackData> {
  try {
    const response = await invokeFunction('assistant', {
      action: 'getFeedback',
      conversationId,
    });

    if (response && response.result) {
      return response.result;
    } else {
      console.error('Unexpected response format:', response);
      throw new Error('Unexpected response format from server');
    }
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
}
