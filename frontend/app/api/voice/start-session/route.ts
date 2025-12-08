import { NextRequest, NextResponse } from "next/server";
import { createElevenLabsAgent, getSignedWebSocketUrl } from "@/lib/server/services/elevenlabs/agentService";
import { markConversationAsVoice } from "@/lib/server/services/elevenlabs/transcriptService";
import { getConversationContext, getSystemPrompt } from "@/lib/server/db";
import { createBasePromptForMessage } from "@/lib/server/llm";
import { supabaseService as supabase } from "../../service-init";

// Simple in-memory cache to prevent duplicate agent creation during React StrictMode
const activeCreations = new Map<string, Promise<any>>();

export async function POST(req: NextRequest) {
  try {
    console.log('🎙️ Starting voice session request...');
    
    const body = await req.json();
    const { conversationId, personaId, scenarioId } = body;

    console.log('📋 Request parameters:', {
      conversationId,
      personaId,
      scenarioId
    });

    if (!conversationId || !personaId || !scenarioId) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: conversationId, personaId, scenarioId' },
        { status: 400 }
      );
    }

    // Create unique key for this request
    const requestKey = `${conversationId}-${personaId}-${scenarioId}`;
    
    // Use promise-based deduplication for React StrictMode
    if (activeCreations.has(requestKey)) {
      console.log('🔄 Request already in progress, waiting for existing creation...');
      try {
        const existingResult = await activeCreations.get(requestKey);
        return NextResponse.json(existingResult, { status: 200 });
      } catch (error) {
        console.error('❌ Existing creation failed, proceeding with new attempt');
        activeCreations.delete(requestKey);
      }
    }

    // ATOMIC OPERATION: Try to claim this conversation for voice processing
    console.log('🔒 Attempting to atomically claim conversation for voice processing...');
    const { data: claimResult, error: claimError } = await supabase
      .from('conversations')
      .update({ 
        is_voice_conversation: true,
        elevenlabs_agent_id: 'CREATING' // Temporary placeholder to claim the conversation
      })
      .eq('conversation_id', conversationId)
      .eq('is_voice_conversation', false) // Only update if not already voice
      .select('conversation_id, is_voice_conversation, elevenlabs_agent_id')
      .single();

    // If the update affected no rows, another request already claimed it
    if (!claimResult || claimError) {
      console.log('🔄 Conversation already claimed by another request, waiting for completion...');
      
      // Wait longer and retry multiple times for the other request to complete
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Wait 800ms between attempts
        attempts++;
        
        // Check if the other request created an agent
        const { data: existingSession } = await supabase
          .from('conversations')
          .select('is_voice_conversation, elevenlabs_agent_id')
          .eq('conversation_id', conversationId)
          .single();

        if (existingSession?.is_voice_conversation && existingSession?.elevenlabs_agent_id && existingSession.elevenlabs_agent_id !== 'CREATING') {
          console.log('🔄 Found existing voice session after waiting:', existingSession.elevenlabs_agent_id);
          
          const signedUrl = await getSignedWebSocketUrl(existingSession.elevenlabs_agent_id);
          const { data: persona } = await supabase
            .from('personas')
            .select('name, voice_name')
            .eq('id', personaId)
            .single();

          // Return a special status to indicate this is a duplicate request that found existing session
          return NextResponse.json({
            signedUrl,
            agentId: existingSession.elevenlabs_agent_id,
            sessionId: conversationId,
            maxDurationSeconds: 1800,
            persona: {
              name: persona?.name || 'Agent',
              voice_name: persona?.voice_name
            },
            isDuplicate: true // Flag to indicate this was a duplicate request
          }, { status: 202 }); // 202 Accepted instead of 200 OK
        }
        
        console.log(`🔄 Attempt ${attempts}/${maxAttempts}: Still waiting for other request to complete...`);
      }
      
      // If we've waited long enough and still no result, the other request likely failed
      console.log('🔄 Other request appears to have failed, attempting to reset and claim...');
      
      // Try to reset the conversation state and claim it
      await supabase
        .from('conversations')
        .update({ 
          is_voice_conversation: false,
          elevenlabs_agent_id: null
        })
        .eq('conversation_id', conversationId)
        .eq('elevenlabs_agent_id', 'CREATING');
        
      // Now try to claim it again
      const { data: retryClaimResult } = await supabase
        .from('conversations')
        .update({ 
          is_voice_conversation: true,
          elevenlabs_agent_id: 'CREATING'
        })
        .eq('conversation_id', conversationId)
        .eq('is_voice_conversation', false)
        .select('conversation_id, is_voice_conversation, elevenlabs_agent_id')
        .single();
        
      if (!retryClaimResult) {
        return NextResponse.json(
          { error: 'Unable to claim conversation for voice processing. Please try again.' },
          { status: 429 }
        );
      }
      
      console.log('✅ Successfully claimed conversation after retry');
    } else {
      console.log('✅ Successfully claimed conversation for voice processing');
    }

    // Create and cache the creation promise
    const creationPromise = createVoiceSession(conversationId, personaId, scenarioId);
    activeCreations.set(requestKey, creationPromise);

    try {
      const result = await creationPromise;
      activeCreations.delete(requestKey); // Clean up on success
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      activeCreations.delete(requestKey); // Clean up on error
      
      // Reset the conversation state if agent creation failed
      await supabase
        .from('conversations')
        .update({ 
          is_voice_conversation: false,
          elevenlabs_agent_id: null
        })
        .eq('conversation_id', conversationId)
        .eq('elevenlabs_agent_id', 'CREATING'); // Only reset if still in CREATING state
      
      throw error;
    }

  } catch (error) {
    console.error('Error starting voice session:', error);
    return NextResponse.json(
      { error: 'Failed to start voice session', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function createVoiceSession(conversationId: string, personaId: string, scenarioId: string) {
  // 1. Verify organization has voice enabled
  console.log('👤 Fetching persona...');
  const { data: persona } = await supabase
    .from('personas')
    .select('*, organisation_id')
    .eq('id', personaId)
    .single();

  if (!persona) {
    console.error('❌ Persona not found:', personaId);
    throw new Error('Persona not found');
  }

  console.log('✅ Persona found:', {
    id: persona.id,
    name: persona.name,
    voice_id: persona.voice_id,
    voice_name: persona.voice_name,
    organisation_id: persona.organisation_id
  });

  console.log('🏢 Fetching organization settings...');
  const { data: org } = await supabase
    .from('organisations')
    .select('voice_enabled, voice_settings')
    .eq('id', persona.organisation_id || 'default')
    .single();

  console.log('🏢 Organization settings:', org);

  if (!org?.voice_enabled) {
    console.error('❌ Voice not enabled for organization');
    throw new Error('Voice not enabled for organization');
  }

  // 2. Get conversation context (scenario, persona, system prompt)
  console.log('📖 Getting conversation context...');
  const { scenario } = await getConversationContext(conversationId);
  
  console.log('📝 Getting system prompt...');
  const { data: conversation } = await supabase
    .from('conversations')
    .select('system_prompt_id')
    .eq('conversation_id', conversationId)
    .single();
  
  const systemPromptTemplate = await getSystemPrompt(conversation.system_prompt_id);
  
  // Build full system prompt with persona and scenario
  console.log('🔧 Building system prompt...');
  const systemPrompt = await createBasePromptForMessage(
    persona,
    scenario,
    systemPromptTemplate
  );

  console.log('📊 System prompt created, length:', systemPrompt.length);
  console.log('📝 System prompt preview (first 500 chars):', systemPrompt.substring(0, 500));
  console.log('📝 System prompt template ID:', conversation.system_prompt_id);
  console.log('👤 Persona details for prompt:', {
    name: persona.name,
    job: persona.job,
    segment: persona.segment,
    major_issues_in_workplace: persona.major_issues_in_workplace
  });

  // 3. Create ElevenLabs agent with persona's voice
  console.log('🤖 Creating ElevenLabs agent...');
  const agentId = await createElevenLabsAgent(persona, scenario, systemPrompt);

  // 4. Get signed WebSocket URL
  console.log('🔗 Getting signed WebSocket URL...');
  const signedUrl = await getSignedWebSocketUrl(agentId);

  // 5. Mark conversation as voice-based
  console.log('💾 Marking conversation as voice-based...');
  await markConversationAsVoice(conversationId, agentId);

  // 6. Return connection details
  console.log('✅ Voice session started successfully!');
  return {
    signedUrl,
    agentId,
    sessionId: conversationId,
    maxDurationSeconds: org.voice_settings?.max_conversation_minutes * 60 || 1800,
    persona: {
      name: persona.name,
      voice_name: persona.voice_name
    }
  };
}