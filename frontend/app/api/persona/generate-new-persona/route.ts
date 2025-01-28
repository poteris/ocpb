import { generateNewPersona as newPersona } from './generateNewPersona';

export async function GET() {
  try {
    const persona = await newPersona();
    
    console.log(persona); 
    // Return the persona as a JSON response
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
