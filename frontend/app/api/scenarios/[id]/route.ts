import { supabase } from "../../init";
import { NextRequest, NextResponse } from "next/server";
import { getScenarioById } from "@/lib/services/scenarios/getScenarios";
import { DatabaseError, isDatabaseError } from "@/utils/errors";
import { z } from "zod";

const UpdateScenarioSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  context: z.string().optional(),
  objectives: z.array(z.string()).optional(),
});

type UpdateScenario = z.infer<typeof UpdateScenarioSchema>; 

async function updateScenarioObjectives(scenarioId: string, objectives: string[]): Promise<void> {
  
  try {
  // First delete existing objectives
  const { error: deleteError } = await supabase
    .from("scenario_objectives")
    .delete()
    .eq("scenario_id", scenarioId);

  if (deleteError) throw new DatabaseError("Error deleting existing objectives", "updateScenarioObjectives", deleteError);

  // Then insert new objectives if there are any
  if (objectives.length > 0) {
    // Generate unique IDs for each objective
    const objectivesData = objectives.map((objective, index) => ({
      id: `${scenarioId}-${index + 1}`, // Create a unique ID combining scenario ID and index
      scenario_id: scenarioId,
      objective,
    }));

    const { error: insertError } = await supabase
      .from("scenario_objectives")
      .insert(objectivesData);

    if (insertError) throw new DatabaseError("Error creating new objectives", "updateScenarioObjectives", insertError);
  }
  } catch (error: unknown) {
    throw new DatabaseError("Failed to update scenario objectives", "updateScenarioObjectives", error as Error);
  }

}

async function updateScenarioDetails( scenarioId: string, updates: UpdateScenario): Promise<void> {
  try {
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

    if (scenarioError) throw new DatabaseError("Error updating scenario details", "updateScenarioDetails", scenarioError);
    
  }

  // Update objectives if provided
  if (updates.objectives) {
    try {
      await updateScenarioObjectives(scenarioId, updates.objectives);
    } catch (error: unknown) {
      throw new DatabaseError("Error updating scenario objectives", "updateScenarioDetails", error as Error);
    }
  }
  } catch (error: unknown) {
    throw new DatabaseError("Failed to update scenario details and objectives", "updateScenarioDetails", error as Error);
  }
}


// NOTE: currently returns true if there are no errors and the scenario is deleted or if there are no objectives to delete
// i.e. the scenario id is not found
// TODO: Update to handle the case where the scenario id is not found
async function deleteScenario(scenarioId: string): Promise<void> {
  try {
  // First delete the objectives for this scenario
  const { error: objectivesError } = await supabase
    .from("scenario_objectives")
    .delete()
    .eq("scenario_id", scenarioId);

  if (objectivesError) throw new DatabaseError("Error deleting objectives", "deleteScenario", objectivesError);
  

  // Then delete the scenario
  const { error: scenarioError } = await supabase.from("scenarios").delete().eq("id", scenarioId);

  if (scenarioError) throw new DatabaseError("Error deleting scenario", "deleteScenario", scenarioError);

} catch (error: unknown) {
  throw new DatabaseError("Failed to delete scenario", "deleteScenario", error as Error);
}
}



// NOTE: don't remove the unused req param because Next expects the first param to be a NextRequest or Request
// https://stackoverflow.com/questions/79124951/type-error-in-next-js-route-type-params-id-string-does-not-satis
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
try {
  const id = (await params).id;
  await deleteScenario(id);
  return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    if (isDatabaseError(error)) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    console.error("Internal server error", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { 
  const body = await req.json();
  const validationResult = UpdateScenarioSchema.safeParse(body);
  if (!validationResult.success) {
    console.error("Invalid request body", validationResult.error);
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
  const id = (await params).id;
  await updateScenarioDetails(id, validationResult.data);
  return NextResponse.json({ success: true }, { status: 200 });
} catch (error: unknown) {
  if (isDatabaseError(error)) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  console.error("Internal server error", error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
}



export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const id = (await params).id;
  const scenario = await getScenarioById(id);

      if (!scenario) {
    return NextResponse.json(
      { message: "Scenario not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(scenario);
} catch (error: unknown) {
  if (isDatabaseError(error)) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
  console.error("Internal server error", error);
  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
}