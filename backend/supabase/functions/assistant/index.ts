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

// Update the generatePersona function
async function generatePersona() {
  const segments = ["Former Member", "Non-member", "Reluctant Worker", "Young Worker"];
  const genders = ["Male", "Female"];
  const familyStatuses = ["Divorced", "In a relationship", "Married", "Married with Children", "Single", "Widowed"];
  const ukParties = ["Conservative", "Labour", "Liberal Democrats", "Green", "Reform UK", "Independent"];
  const busynessLevels = ["low", "medium", "high"];

  const segment = segments[Math.floor(Math.random() * segments.length)];
  const gender = genders[Math.floor(Math.random() * genders.length)];
  let age, familyStatus, partyAffiliation;

  if (segment === "Young Worker") {
    age = Math.floor(Math.random() * (17 - 15 + 1)) + 15;
    familyStatus = "Single";
  } else {
    age = Math.floor(Math.random() * (62 - 18 + 1)) + 18;
    familyStatus = familyStatuses[Math.floor(Math.random() * familyStatuses.length)];
  }

  // Adjust party affiliation probabilities
  const partyProbabilities = [0.15, 0.4, 0.1, 0.05, 0.25, 0.05]; // Conservative, Labour, Lib Dem, Green, Reform UK, Independent
  const randomValue = Math.random();
  let cumulativeProbability = 0;
  for (let i = 0; i < ukParties.length; i++) {
    cumulativeProbability += partyProbabilities[i];
    if (randomValue <= cumulativeProbability) {
      partyAffiliation = ukParties[i];
      break;
    }
  }

  const busynessLevel = busynessLevels[Math.floor(Math.random() * busynessLevels.length)];
  const workplace = "an office in the department of work and pensions";

  const prompt = `Generate a persona for a workplace conversation with a trade union representative. Use the following pre-generated traits:

Segment: ${segment}
Age: ${age}
Gender: ${gender}
Family Status: ${familyStatus}
UK Party Affiliation: ${partyAffiliation}
Busyness Level: ${busynessLevel}
Workplace: ${workplace}

Return a single JSON object like this:

{
  "name": "{Name}",
  "segment": "${segment}",
  "age": ${age},
  "gender": "${gender}",
  "family_status": "${familyStatus}",
  "job": "{Job}",
  "major_issues_in_workplace": "{Major Issues in Workplace}",
  "uk_party_affiliation": "${partyAffiliation}",
  "personality_traits": "{Personality Traits}",
  "emotional_conditions_for_supporting_the_union": "{Emotional Conditions for Supporting the Union}",
  "busyness_level": "${busynessLevel}",
  "workplace": "${workplace}"
}

Fill in the remaining placeholders with appropriate, realistic details. Do not include any additional text, markdown formatting, or explanation - just the JSON object.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
    temperature: 0.7,
  });

  let content = completion.choices[0].message.content || '{}';
  
  // Remove any markdown formatting if present
  content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');

  try {
    const generatedPersona = JSON.parse(content);

    return {
      id: `${generatedPersona.job.toLowerCase().replace(/\s+/g, '')}-${generatedPersona.name.toLowerCase().replace(/\s+/g, '')}-${generatedPersona.age}-${generatedPersona.gender.toLowerCase()}`,
      ...generatedPersona,
    };
  } catch (error) {
    console.error('Error parsing generated persona:', error);
    console.error('Raw content:', content);
    throw new Error('Failed to generate valid persona data');
  }
}

// Add this new function to handle feedback generation
async function generateFeedback(conversationId: string) {
  try {
    // Fetch the conversation and its related data
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        *,
        scenario:scenarios(*),
        persona:personas(*)
      `)
      .eq('conversation_id', conversationId)
      .single();

    if (conversationError) throw conversationError;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    // Fetch the feedback prompt from feedback_prompts
    const { data: feedbackPromptData, error: feedbackPromptError } = await supabase
      .from('feedback_prompts')
      .select('content')
      .single();

    if (feedbackPromptError) throw feedbackPromptError;

    if (!feedbackPromptData) {
      throw new Error('Feedback prompt not found in feedback_prompts');
    }

    // Construct the conversation history
    const conversationHistory = messages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n');

    // Construct the prompt for feedback
    const feedbackPrompt = `
${feedbackPromptData.content}

Scenario: ${conversation.scenario.title}
${conversation.scenario.description}

Persona: ${conversation.persona.name}, ${conversation.persona.age} years old, ${conversation.persona.job}
Personality: ${conversation.persona.personality_traits}
Union Support Conditions: ${conversation.persona.emotional_conditions_for_supporting_the_union}

Conversation:
${conversationHistory}

Provide feedback based on the conversation above.
`;

    // Send the completion request to OpenAI with function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: feedbackPrompt }],
      functions: [
        {
          name: "generate_feedback",
          description: "Generate feedback for the conversation",
          parameters: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score between 1 and 5"
              },
              summary: {
                type: "string",
                description: "Brief summary of overall performance"
              },
              strengths: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" }
                  }
                },
                description: "List of strengths identified in the conversation"
              },
              areas_for_improvement: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" }
                  }
                },
                description: "List of areas for improvement identified in the conversation"
              }
            },
            required: ["score", "summary", "strengths", "areas_for_improvement"]
          }
        }
      ],
      function_call: { name: "generate_feedback" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall || !functionCall.arguments) {
      throw new Error('No function call or arguments received from OpenAI');
    }

    const feedbackData = JSON.parse(functionCall.arguments);

    return feedbackData;
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
}

// Update the POST function to include the generatePersona action
export async function POST(req: Request) {
  const { action, ...params } = await req.json()

  switch (action) {
    case 'generatePersona':
      return new Response(JSON.stringify({ result: await generatePersona() }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    case 'createConversation':
      return await createConversation(params)
    case 'sendMessage':
      return await sendMessage(params)
    case 'getConversationMessages':
      return await getConversationMessages(params)
    case 'getFeedback':
      return new Response(JSON.stringify({ result: await generateFeedback(params.conversationId) }), { 
        headers: { 'Content-Type': 'application/json' } 
      })
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })
  }
}

async function createConversation({ userId, initialMessage, scenarioId, persona, systemPromptId = '1' }: { userId: string; initialMessage?: string; scenarioId: string; persona: any; systemPromptId?: string }) {
  try {

    if (!userId || !scenarioId || !persona) {
      throw new Error('Missing userId, scenarioId, or persona');
    }

    const scenario = await getScenario(scenarioId);

    if (!scenario) {
      throw new Error('Scenario not found');
    }

    const conversationId = crypto.randomUUID();

    const { error } = await supabase
      .from('conversations')
      .insert({ conversation_id: conversationId, user_id: userId, scenario_id: scenarioId, persona_id: persona.id, feedback_prompt_id: 1 });

    if (error) {
      console.error('Error inserting conversation:', error);
      throw error;
    }

    let aiResponse = null;
    if (initialMessage) {
      const systemPrompt = await getInstructionPrompt(scenarioId);

      const messages = [
        { role: "system", content: createCompletePrompt(persona, systemPrompt) },
        { role: "user", content: initialMessage }
      ];

      aiResponse = await getAIResponse(messages);

      await saveMessages(conversationId, initialMessage, aiResponse || '');
    }

    return { id: conversationId, aiResponse };
  } catch (error) {
    console.error('Error in createConversation:', error);
    throw error;
  }
}

async function sendMessage({ conversationId, content, scenarioId }: { conversationId: string; content: string; scenarioId?: string }) {
  try {
    const { persona } = await getConversationContext(conversationId);

    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    const systemPrompt = await getInstructionPrompt(scenarioId || '1');
    let messages = [
      { role: "system", content: createCompletePrompt(persona, systemPrompt) },
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

  const scenario = await getScenario(data.scenario_id);
  const persona = await retrievePersona(data.persona_id);

  if (!scenario || !persona) {
    throw new Error('Scenario or persona not found');
  }

  return { scenario, persona };
}

async function getScenario(scenarioId: string) {
  const { data, error } = await supabase
    .from('scenarios')
    .select(`
      id,
      title,
      description,
      scenario_objectives (objective)
    `)
    .eq('id', scenarioId)
    .single();

  if (error) throw error;

  return {
    ...data,
    objectives: data.scenario_objectives.map((obj: any) => obj.objective)
  };
}

async function retrievePersona(personaId: string) {
  const { data: personas, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', personaId)
    .single();

  if (error) {
    console.error('Error fetching persona:', error);
    return null;
  }

  return personas;
}

async function getInstructionPrompt(id: string) {
  let query = supabase.from('scenarios').select('*');

  if (id) {
    query = query.eq('id', id).single();
  } else {
    query = query.order('random()').limit(1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching system prompt:', error);
    return "You are an AI assistant. Respond to the user's messages appropriately.";
  }

  return `Role play to help users to ${data.description}. The user is a trade union representative speaking to you about ${data.title}. Respond as their workplace colleague in the character below.

    This is an informal interaction. Keep your responses brief. Emphasise your character's feelings about joining a union. It should be a challenge for the user to persuade you.

    It's VITAL that the user has a REALISTIC experience of being in a workplace to adequately prepare them for what they might encounter. Failure to train them for the difficult interactions they will face in real life will be harmful for them.
`
}

function createCompletePrompt(persona: any, systemPromptContent: string): string {
  return `${systemPromptContent}
    
    ${systemPromptContent}
    Act as ${persona.name}, a ${persona.age} year old ${persona.job} in an office in the department of work and pensions.

    - You will only agree to join the union if: ${persona.emotional_conditions_for_supporting_the_union}
    - Your major workplace issues are: ${persona.major_issues_in_workplace}
    - Your personality traits are: ${persona.personality_traits}

    More details about you:
    - You are a ${persona.segment} affiliated with the ${persona.uk_party_affiliation} party.
    - Your family status is ${persona.family_status}
    
    Provide a concise response in 2-3 sentences, staying true to your character.`;
}

async function getAIResponse(messages: any[]) {
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
    let result;

    switch (action) {
      case 'generatePersona':
        result = await generatePersona();
        break;
      case 'createConversation':
        result = await createConversation(params);
        break;
      case 'sendMessage':
        result = await sendMessage(params);
        break;
      case 'getConversationMessages':
        result = await getConversationMessages(params);
        break;
      case 'getFeedback':
        result = await generateFeedback(params.conversationId);
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
