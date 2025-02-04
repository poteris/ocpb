import { supabase } from "@/lib/init";
import { TrainingScenario } from "@/types/scenarios";
import { NextRequest, NextResponse } from "next/server";
export async function createScenario(scenario: TrainingScenario) {
  // Start a Supabase transaction
  const { data: newScenario, error: scenarioError } = await supabase
    .from("scenarios")
    .insert({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      context: scenario.context,
    })
    .select()
    .single();

  if (scenarioError) {
    console.error("Error creating scenario:", scenarioError);
    throw scenarioError;
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

  return newScenario;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  createScenario(body);
}
