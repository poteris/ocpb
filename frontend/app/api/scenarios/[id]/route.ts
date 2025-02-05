import { supabase } from "@/lib/init";
import { NextRequest, NextResponse } from "next/server";
import { Result, err, ok, Option } from "@/types/result";

export async function updateScenarioObjectives(
  scenarioId: string,
  objectives: string[]
): Promise<Result<Option<void>, string>> {
  // First delete existing objectives
  const { error: deleteError } = await supabase.from("scenario_objectives").delete().eq("scenario_id", scenarioId);

  if (deleteError) {
    console.error("Error deleting existing objectives:", deleteError);
    return err(deleteError.message);
  }

  // Then insert new objectives if there are any
  if (objectives.length > 0) {
    // Generate unique IDs for each objective
    const objectivesData = objectives.map((objective, index) => ({
      id: `${scenarioId}-${index + 1}`, // Create a unique ID combining scenario ID and index
      scenario_id: scenarioId,
      objective,
    }));

    const { error: insertError } = await supabase.from("scenario_objectives").insert(objectivesData);

    if (insertError) {
      console.error("Error creating new objectives:", insertError);
      return err(insertError.message);
    }
  }

  return ok({ isSome: false });
}

export async function updateScenarioDetails(
  scenarioId: string,
  updates: {
    title?: string;
    description?: string;
    context?: string;
    objectives?: string[];
  }
): Promise<Result<Option<void>, string>> {
  // Update scenario details if provided
  if (updates.title || updates.description || updates.context) {
    const { error: scenarioError } = await supabase
      .from("scenarios")
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.context && { context: updates.context }),
      })
      .eq("id", scenarioId);

    if (scenarioError) {
      console.error("Error updating scenario details:", scenarioError);
      return err("Error updating scenario details");
    }
  }

  // Update objectives if provided
  if (updates.objectives) {
    const result = await updateScenarioObjectives(scenarioId, updates.objectives);
    if (!result.isOk) {
      console.error("Error updating scenario objectives:", result.error);
      return err("Error updating scenario objectives");
    }
  }

  return ok({ isSome: false });
}
export async function DELETE({ params }: { params: { id: string } }) {
  const { id } = params;
  const result = await deleteScenario(id);
  if (!result.isOk) {
    console.error("Error deleting scenario:", result.error);
    return NextResponse.json({ message: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const { id } = await params;
  const result = await updateScenarioDetails(id, body);
  if (!result.isOk) {
    console.error("Error updating scenario details:", result.error);
    return NextResponse.json({ message: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function deleteScenario(scenarioId: string): Promise<Result<Option<void>, string>> {
  // First delete the objectives for this scenario
  const { error: objectivesError } = await supabase.from("scenario_objectives").delete().eq("scenario_id", scenarioId);

  if (objectivesError) {
    console.error("Error deleting objectives:", objectivesError);
    return err(objectivesError.message);
  }

  // Then delete the scenario
  const { error: scenarioError } = await supabase.from("scenarios").delete().eq("id", scenarioId);

  if (scenarioError) {
    console.error("Error deleting scenario:", scenarioError);
    return err(scenarioError.message);
  }

  // Return a successful result with an empty Option
  return ok({ isSome: false });
}
