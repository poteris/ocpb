
import { getScenarios } from "@/lib/services/scenarios";
import { TrainingScenario, TrainingScenarioSchema } from "@/types/scenarios";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/init";
import { Result } from "@/types/result";


export async function GET() {
    const result = await getScenarios()
    if (!result.success) {
        return NextResponse.json({ message: result.error }, { status: 500 });
    }
    return NextResponse.json(result.data, { status: 200 });
}


export async function createScenario(scenario: TrainingScenario): Promise<Result<TrainingScenario>> {
    const validatedParams = TrainingScenarioSchema.safeParse(scenario);
    if (!validatedParams.success) {
        console.error("Validation failed:", validatedParams.error.format());
        return { success: false, error: "Invalid scenario data" };
    }

    const { data, error } = await supabase
        .from("scenarios")
        .insert({
            id: scenario.id,
            title: scenario.title,
            description: scenario.description,
            context: scenario.context,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating scenario:", error);
        return { success: false, error: error.message };
    }

    const validatedResult = TrainingScenarioSchema.safeParse(data);
    if (!validatedResult.success) {
        console.error("Error validating scenario data:", validatedResult.error);
        return { success: false, error: "Error validating data" };
    }

    // Create objectives with unique IDs
    if (scenario.objectives.length > 0) {
        const objectivesData = scenario.objectives.map((objective, index) => ({
            id: `${scenario.id}-${index + 1}`, // Create a unique ID combining scenario ID and index
            scenario_id: scenario.id,
            objective,
        }));

        const { error: objectivesError } = await supabase
            .from("scenario_objectives")
            .insert(objectivesData);

        if (objectivesError) {
            // If objectives creation fails, clean up the scenario
            await supabase.from("scenarios").delete().eq("id", scenario.id);
            console.error("Error creating objectives:", objectivesError);
            throw objectivesError;
        }
    }

    const newScenario = {
        id: validatedResult.data.id,
        title: validatedResult.data.title,
        description: validatedResult.data.description,
        context: validatedResult.data.context,
        objectives: validatedResult.data.objectives,
    } as TrainingScenario;

    return { success: true, data: newScenario };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await createScenario(body);
        if (!result.success) {
            return NextResponse.json({ message: result.error }, { status: 500 });
        }
        return NextResponse.json(result.data, { status: 201 });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
