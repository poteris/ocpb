
import {getScenarios} from "./fetchScenarios"

export async function GET(  ) {
    const trainingScenarios = await getScenarios()
    
    return new Response(JSON.stringify(trainingScenarios), {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
    }