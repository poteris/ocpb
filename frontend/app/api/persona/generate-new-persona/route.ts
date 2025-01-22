import { generatedPersona as newPersona } from './generateNewPersona'

export async function GET() {

  const persona = newPersona;
  console.log(persona)
  return new Response(JSON.stringify(persona), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
