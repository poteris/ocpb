import {generatedPersona as newPersona} from './newPersona'

export async function GET(request: Request) {
    
    const persona = newPersona;
    console.log(persona)
    return new Response(JSON.stringify(persona), {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}