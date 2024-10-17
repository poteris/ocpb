import dotenv from 'dotenv'
import personas from '../../frontend/src/lib/personas.json'

dotenv.config()

const FUNCTION_URL = 'http://localhost:54321/functions/v1/assistant'

interface AssistantResponse {
  result: {
    assistant_id: string;
    name: string;
    description: string;
    model: string;
    persona_id: string;
    instructions: string;
  };
}

async function createAssistant(persona: any) {
  const name = `${persona.characterType} (${persona.mood})`
  const description = `${persona.context} Age range: ${persona.ageRange}`
  const model = 'gpt-4o-mini'
  const instructions = `You are a ${persona.characterType.toLowerCase()} who is ${persona.mood.toLowerCase()}. ${persona.context} Respond to queries as this character, maintaining their perspective and emotional state.`

  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        action: 'createAssistant',
        name,
        description,
        model,
        instructions,
        persona_id: persona.id
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }

    const result = await response.json() as AssistantResponse

    if (!result.result || !result.result.assistant_id) {
      throw new Error('Invalid response format: missing assistant_id')
    }

    console.log(`Created assistant for ${name}:`, result.result)
    return result.result.assistant_id
  } catch (error) {
    console.error(`Error creating assistant for ${name}:`, error)
    // Re-throw the error to stop the process if an assistant fails to create
    throw error
  }
}

// Modify the createAllAssistants function to stop on first error
async function createAllAssistants() {
  for (const persona of personas.personas) {
    await createAssistant(persona)
  }
}

createAllAssistants().then(() => {
  console.log('All assistants created')
  process.exit(0)
}).catch((error) => {
  console.error('Error creating assistants:', error)
  process.exit(1)
})
