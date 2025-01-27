import {trainingScenarios} from '@/const/scenarios'
export async function GET(request: Request) {
    return new Response(JSON.stringify(trainingScenarios), {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
    }