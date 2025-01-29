import { generateNewPersona as newPersona } from './generateNewPersona';
import { z } from "zod";

 const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment: z.string(),
  age: z.number(),
  gender: z.string(),
  family_status: z.string(),
  uk_party_affiliation: z.string(),
  workplace: z.string(),
  job: z.string(),
  busyness_level: z.string(),
  major_issues_in_workplace: z.string(),
  personality_traits: z.string(),
  emotional_conditions: z.string(),
});

export async function GET() {
  try {
    const persona = await newPersona();
    
    personaSchema.parse(persona); // will throw an error if the persona does not match the schema
    
    console.log(persona); 
    return new Response(JSON.stringify(persona), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error generating persona:', error);

    return new Response(
      JSON.stringify({ error: 'Failed to generate persona' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
