'use server'

import { Persona } from "@/types/persona";
import { TrainingScenario } from "@/types/scenarios";
import { getVoiceOrDefault } from "@/const/voices";

interface ElevenLabsAgentConfig {
  agent: {
    prompt: {
      prompt: string;
      llm: string;
    };
    first_message: string;
    language: string;
  };
  conversation_config: {
    tts: {
      voice_id: string;
      model_id: string;
    };
    asr: {
      quality: string;
      language: string;
    };
  };
}

interface CreateAgentResponse {
  agent_id: string;
}

interface SignedUrlResponse {
  signed_url: string;
}

/**
 * Create an ElevenLabs conversational AI agent
 */
export async function createElevenLabsAgent(
  persona: Persona,
  scenario: TrainingScenario,
  systemPrompt: string
): Promise<string> {
  const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
  
  if (!elevenLabsApiKey) {
    throw new Error('ELEVEN_LABS_API_KEY not configured');
  }

  // Add debug logging
  console.log('🎤 Creating ElevenLabs agent:', {
    persona: persona.name,
    personaVoiceId: persona.voice_id,
    scenarioTitle: scenario.title,
    systemPromptLength: systemPrompt.length,
    apiKeyPresent: !!elevenLabsApiKey,
    apiKeyLength: elevenLabsApiKey.length
  });

  // Test API key and get available voices
  let availableVoices: any[] = [];
  try {
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabsApiKey
      }
    });
    if (!voicesResponse.ok) {
      const voicesError = await voicesResponse.text();
      console.error('❌ API key test failed:', voicesError);
      throw new Error(`API key invalid or expired: ${voicesResponse.status} - ${voicesError}`);
    } else {
      const voicesData = await voicesResponse.json();
      availableVoices = voicesData.voices || [];
      console.log('✅ API key valid, found', availableVoices.length, 'voices');
      
      // Log available voice IDs for debugging
      console.log('🎤 Available voice IDs in account:', availableVoices.map(v => `${v.name} (${v.voice_id})`));
    }
  } catch (apiKeyError) {
    console.error('🚨 API key validation failed:', apiKeyError);
    throw new Error(`API key validation failed: ${apiKeyError instanceof Error ? apiKeyError.message : 'Unknown error'}`);
  }

  // Get voice for persona and validate it exists in account
  // Pass persona gender to select an appropriate voice if no specific voice is set
  let voice = getVoiceOrDefault(persona.voice_id, persona.gender);
  console.log('🎯 Requested voice:', {
    personaVoiceId: persona.voice_id,
    personaGender: persona.gender,
    resolvedVoice: voice
  });

  // Check if the voice exists in the user's account
  const voiceExists = availableVoices.find(v => v.voice_id === voice.id);
  console.log('🔍 Voice validation:', {
    requestedVoiceId: voice.id,
    voiceExistsInAccount: !!voiceExists,
    availableVoicesCount: availableVoices.length
  });
  
  if (!voiceExists && availableVoices.length > 0) {
    console.warn(`⚠️ Voice ${voice.id} (${voice.name}) not found in account, using fallback: ${availableVoices[0].name}`);
    const firstVoice = availableVoices[0];
    voice = {
      id: firstVoice.voice_id,
      name: firstVoice.name,
      accent: 'Available Voice',
      description: `${firstVoice.name} - Available in account`,
      gender: voice.gender // Preserve the original gender from the selected voice
    };
    console.log('🔄 Using fallback voice:', voice);
  } else if (voiceExists) {
    console.log('✅ Voice found in account:', voiceExists.name);
  } else {
    console.warn('⚠️ No voices available in account, using default voice configuration');
  }

  // Try multiple API structures to find what works
  const configs = [
    // Structure 1: Correct prompt field (conversation_config.agent.prompt.prompt)
    {
      name: `${persona.name} - ${scenario.title}`,
      conversation_config: {
        agent: {
          prompt: {
            prompt: `${systemPrompt}\n\nIMPORTANT: Do not prefix your responses with your name or any labels like "${persona.name}:". Respond directly as the character without any name prefixes. Speak naturally as if you are ${persona.name} in conversation.`
          },
          first_message: `Hello, I'm ${persona.name}. How may I assist you today?`,
          llm: {
            model: "qwen-3-30b-a3b",
            temperature: 0.7,
            max_tokens: 2048
          },
          language: "en"
        },
        tts: {
          voice_id: voice.id,
          model_id: "eleven_flash_v2",
          optimize_streaming_latency: 4,
          stability: 0.5,
          similarity_boost: 0.75
        },
        asr: {
          quality: "high",
          language: "en"
        }
      }
    },
    // Structure 2: Direct prompt field (alternative structure)
    {
      name: `${persona.name} - ${scenario.title}`,
      conversation_config: {
        agent: {
          prompt: `${systemPrompt}\n\nIMPORTANT: Do not prefix your responses with your name or any labels like "${persona.name}:". Respond directly as the character without any name prefixes. Speak naturally as if you are ${persona.name} in conversation.`,
          first_message: `Hello, I'm ${persona.name}. How may I assist you today?`,
          llm: {
            model: "qwen-3-30b-a3b",
            temperature: 0.7,
            max_tokens: 2048
          },
          language: "en"
        },
        tts: {
          voice_id: voice.id,
          model_id: "eleven_flash_v2",
          optimize_streaming_latency: 4,
          stability: 0.5,
          similarity_boost: 0.75
        },
        asr: {
          quality: "high",
          language: "en"
        }
      }
    },
    // Structure 3: Alternative nested structure
    {
      name: `${persona.name} - ${scenario.title}`,
      conversation_config: {
        agent: {
          prompt: {
            prompt: `${systemPrompt}\n\nIMPORTANT: Do not prefix your responses with your name or any labels like "${persona.name}:". Respond directly as the character without any name prefixes. Speak naturally as if you are ${persona.name} in conversation.`
          },
          first_message: `Hello, I'm ${persona.name}. How may I assist you today?`,
          llm: {
            model: "qwen-3-30b-a3b",
            temperature: 0.7,
            max_tokens: 2048
          },
          language: "en"
        },
        tts: {
          voice_id: voice.id,
          model_id: "eleven_flash_v2",
          optimize_streaming_latency: 4,
          stability: 0.5,
          similarity_boost: 0.75
        },
        asr: {
          quality: "high",
          language: "en"
        }
      }
    },
    // Structure 4: Top-level system_prompt (legacy fallback)
    {
      name: `${persona.name} - ${scenario.title}`,
      system_prompt: `${systemPrompt}\n\nIMPORTANT: Do not prefix your responses with your name or any labels like "${persona.name}:". Respond directly as the character without any name prefixes. Speak naturally as if you are ${persona.name} in conversation.`,
      first_message: `Hello, I'm ${persona.name}. How may I assist you today?`,
      language: "en",
      llm: "qwen-3-30b-a3b",
      conversation_config: {
        tts: {
          voice_id: voice.id,
          model_id: "eleven_flash_v2",
          optimize_streaming_latency: 4,
          stability: 0.5,
          similarity_boost: 0.75
        },
        asr: {
          quality: "high",
          language: "en"
        }
      }
    }
  ];

  // Validate system prompt
  if (!systemPrompt || systemPrompt.trim().length === 0) {
    console.error('❌ System prompt is empty or invalid');
    throw new Error('System prompt is required but was empty');
  }

  if (systemPrompt.length > 10000) {
    console.warn('⚠️ System prompt is very long:', systemPrompt.length, 'characters. This might cause issues.');
  }

  console.log('🔄 Trying multiple API structures to find working format');
  console.log('📤 System prompt length:', systemPrompt.length);
  console.log('📤 System prompt preview:', systemPrompt.substring(0, 200) + '...');
  console.log('📤 System prompt contains persona name:', systemPrompt.includes(persona.name));
  console.log('📤 System prompt contains scenario title:', systemPrompt.includes(scenario.title));

  const endpoint = 'https://api.elevenlabs.io/v1/convai/agents/create';
  console.log(`🌐 Using endpoint: ${endpoint}`);
  
  // Try each config structure until one works
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    const structureNames = [
      'Correct prompt field (conversation_config.agent.prompt.prompt)',
      'Direct prompt field (conversation_config.agent.prompt)',
      'Alternative nested (conversation_config.agent.prompt.prompt)',
      'Top-level system_prompt (system_prompt)'
    ];
    
    console.log(`🧪 Trying structure ${i + 1}/4: ${structureNames[i]}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      // Response logging removed to reduce noise

      if (response.ok) {
        const data: CreateAgentResponse = await response.json();
        console.log(`✅ SUCCESS! Agent created with structure ${i + 1}/4 (${structureNames[i]}):`, data);
        console.log(`🎯 WORKING STRUCTURE FOUND: ${structureNames[i]}`);
        console.log(`📋 Agent ID: ${data.agent_id}`);
        
        // Try to verify the agent was created with the correct system prompt
        try {
          const verifyResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${data.agent_id}`, {
            method: 'GET',
            headers: {
              'xi-api-key': elevenLabsApiKey
            }
          });
          
          if (verifyResponse.ok) {
            const agentData = await verifyResponse.json();
            console.log('🔍 Raw agent data structure:', JSON.stringify(agentData, null, 2));
            
            // Check multiple possible locations for the system prompt
            const systemPromptSources = [
              agentData.system_prompt,
              agentData.conversation_config?.agent?.prompt?.prompt,  // This should be the correct one now
              agentData.conversation_config?.agent?.prompt?.system_prompt,
              agentData.conversation_config?.agent?.prompt,
              agentData.prompt?.system_prompt,
              agentData.prompt
            ];
            
            const foundPrompt = systemPromptSources.find(source => source && typeof source === 'string' && source.length > 0);
            const hasSystemPrompt = !!foundPrompt;
            const promptLength = foundPrompt ? foundPrompt.length : 0;
            const promptPreview = foundPrompt ? foundPrompt.substring(0, 100) + '...' : 'No prompt found';
            
            console.log('🔍 Agent verification:', { 
              hasSystemPrompt, 
              promptLength, 
              promptPreview,
              agentName: agentData.name 
            });
          }
        } catch (verifyError) {
          console.warn('⚠️ Agent verification failed (non-critical)');
        }
        
        return data.agent_id;
      } else {
        const error = await response.text();
        console.error(`❌ Structure ${i + 1}/4 failed:`, error);
        
        // Continue to next structure unless this is the last one
        if (i === configs.length - 1) {
          throw new Error(`All API structures failed. Last error: ${response.status} - ${error}`);
        }
      }
    } catch (fetchError) {
      console.error(`🚨 Network error for structure ${i + 1}/4:`, fetchError);
      
      // Continue to next structure unless this is the last one
      if (i === configs.length - 1) {
        throw new Error(`Network error creating ElevenLabs agent: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
    }
  }
  
  throw new Error('All API structures failed - this should not be reached');
}

/**
 * Get a signed WebSocket URL for connecting to an agent
 */
export async function getSignedWebSocketUrl(agentId: string): Promise<string> {
  const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
  
  if (!elevenLabsApiKey) {
    throw new Error('ELEVEN_LABS_API_KEY not configured');
  }

  console.log('🔗 Getting signed WebSocket URL for agent:', agentId);

  // Use the correct endpoint pattern
  const endpoint = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
  console.log(`🌐 Using signed URL endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabsApiKey
      }
    });

    console.log(`📡 Signed URL response:`, {
      status: response.status,
      statusText: response.statusText
    });

    if (response.ok) {
      const data: SignedUrlResponse = await response.json();
      console.log('✅ Signed URL obtained successfully');
      return data.signed_url;
    } else {
      const error = await response.text();
      console.error('Failed to get signed URL:', error);
      throw new Error(`Failed to get signed URL: ${response.status} - ${error}`);
    }
  } catch (fetchError) {
    console.error(`🚨 Network error for signed URL:`, fetchError);
    throw new Error(`Network error getting signed URL: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
  }
}

/**
 * Get conversation history/transcript from ElevenLabs
 */
export async function getConversationTranscript(conversationId: string): Promise<any> {
  const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
  
  if (!elevenLabsApiKey) {
    throw new Error('ELEVEN_LABS_API_KEY not configured');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
    {
      method: 'GET',
      headers: {
        'xi-api-key': elevenLabsApiKey
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to get conversation transcript:', error);
    throw new Error(`Failed to get transcript: ${response.status}`);
  }

  return await response.json();
}

