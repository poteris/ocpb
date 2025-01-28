import OpenAI from 'openai';
import { genericPersonaPrompt } from './genericPrompt';
import {Persona} from '@/types/persona'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const generateNewPersona = async () => { 
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: genericPersonaPrompt }],
    functions: [
      {
        name: "generate_persona",
        description: "Generate a coherent persona for a workplace conversation with a trade union representative",
        parameters: {
          type: "object",
          properties: {
            name: { 
              type: "string",
              description: "Full name of the person"
            },
            segment: { 
              type: "string",
              description: "Segment of the person (Former Union Member, Non-member of the Union, Reluctant Worker, Young Worker)"
            },
            age: { 
              type: "number",
              description: "Age of the person (between 15 and 62)"
            },
            gender: { 
              type: "string",
              description: "Gender of the person (Male or Female)"
            },
            family_status: { 
              type: "string",
              description: "Family status of the person (Divorced, In a relationship, Married, Married with Children, Single, Widowed)"
            },
            uk_party_affiliation: { 
              type: "string",
              description: "Political affiliation of the person (Conservative, Labour, Lib Dem, Green, Reform UK, Independent)"
            },
            workplace: { 
              type: "string",
              description: "Place of work of the person (an office in the department of work and pensions)"
            },
            job: { 
              type: "string",
              description: "Specific job title and role"
            },
            busyness_level: { 
              type: "string",
              description: "Busyness level of the person (low, medium, high)"
            },
            major_issues_in_workplace: { 
              type: "string",
              description: "Key workplace concerns and challenges"
            },
            personality_traits: { 
              type: "string",
              description: "Comma-separated list of personality characteristics"
            },
            emotional_conditions: { 
              type: "string",
              description: "Emotional factors that would influence union support"
            }
          },
          required: ["name", "segment", "age", "gender", "family_status", "uk_party_affiliation", "workplace", "job", "major_issues_in_workplace", "personality_traits", "emotional_conditions"]
        }
      }
    ],
    function_call: { name: "generate_persona" }
  });

  const functionCall = completion.choices[0].message.function_call; // TODO: fix depracation of function_call
  if (!functionCall || !functionCall.arguments) {
    throw new Error('No function call or arguments received from OpenAI');
  }


  const generatedPersona = JSON.parse(functionCall.arguments) as Persona; // expecting openai functions to handle consistent keys
  return generatedPersona;
}

export { generateNewPersona }


