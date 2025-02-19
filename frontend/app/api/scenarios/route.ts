import { getScenarios } from "@/lib/server/services/scenarios/getScenarios";
import { TrainingScenario } from "@/types/scenarios";
import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/init";
import {  DatabaseError, DatabaseErrorCodes } from "@/utils/errors";


export async function GET() {
  try {
    const result = await getScenarios();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET scenarios:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

async function createScenarioWithObjectives(scenario: TrainingScenario) {
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
    throw new DatabaseError("Error creating scenario", "create_scenario", DatabaseErrorCodes.Insert, {
      error,
    });
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
      throw new DatabaseError("Error creating objectives", "create_scenario", DatabaseErrorCodes.Insert, {
        error: objectivesError,
      });
    }
  }

  const newScenario = {
    id: data.id,
    title: data.title,
    description: data.description,
    context: data.context,
    objectives: data.objectives,
  } as TrainingScenario;

  return newScenario;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createScenarioWithObjectives(body);
     
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("Error in POST scenarios:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
