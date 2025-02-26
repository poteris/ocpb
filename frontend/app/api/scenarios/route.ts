import { getScenarios } from "@/lib/services/scenarios/getScenarios";
import { TrainingScenario } from "@/types/scenarios";
import { NextResponse, NextRequest } from "next/server";
import { Result, err, ok } from "@/types/result";
import { getSupabaseClient } from "@/lib/initSupabase";


export async function GET() {
  const result = await getScenarios();
  if (!result.isOk) {
    return NextResponse.json({ message: result.error }, { status: 500 });
  }
  return NextResponse.json(result.value, { status: 200 });
}

async function createScenarioWithObjectives(scenario: TrainingScenario): Promise<Result<TrainingScenario, string>> {
  const supabase = await getSupabaseClient();
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
    return err(error.message);
  }

  const objectivesString = (objectives: string[]) => {
    return objectives.join("\n");
  };

  // NOTE: Objectives are stored as a markdown string in the database
  if (scenario.objectives.length > 0) {
    const objectivesData = {
      scenario_id: data.id,
      objective: objectivesString(scenario.objectives),
    };

    const { error: objectivesError } = await supabase.from("scenario_objectives").insert(objectivesData);

    if (objectivesError) {
      // If objectives creation fails, clean up the scenario
      await supabase.from("scenarios").delete().eq("id", scenario.id);
      console.error("Error creating objectives:", objectivesError);
      return err("Failed to create objectives");
    }
  }

  const newScenario = {
    id: data.id,
    title: data.title,
    description: data.description,
    context: data.context,
    objectives: data.objectives,
  } as TrainingScenario;

  return ok(newScenario);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createScenarioWithObjectives(body);
    if (!result.isOk) {
      return NextResponse.json({ message: result.error }, { status: 500 });
    }
    return NextResponse.json(result.value, { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
