import { supabase } from "@/lib/init";
import { NextRequest, NextResponse } from "next/server";
import { Result } from "@/types/result";
import { TrainingScenario } from "@/types/scenarios";

export async function updateScenarioObjectives(scenarioId: string, objectives: string[]) {
  try {
    // First delete existing objectives
    const { error: deleteError } = await supabase
      .from("scenario_objectives")
      .delete()
      .eq("scenario_id", scenarioId);

    if (deleteError) {
      console.error("Error deleting existing objectives:", deleteError);
      throw deleteError;
    }

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

      if (insertError) {
        console.error("Error creating new objectives:", insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error in updateScenarioObjectives:", error);
    throw error;
  }
}
export async function updateScenarioDetails(
  scenarioId: string,
  updates: {
    title?: string;
    description?: string;
    context?: string;
    objectives?: string[];
  }
): Promise<Result<TrainingScenario>> {
 
  if (updates.title || updates.description || updates.context) {
    const { data, error } = await supabase
      .from("scenarios")
      .update({
        ...(updates.title && { title: updates.title }),
        ...(updates.description && { description: updates.description }),
        ...(updates.context && { context: updates.context }),
      })
      .eq("id", scenarioId);



    if (error) {
      console.error("Error updating scenario details:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data: data };
  
  }

  // Update objectives if provided
  if (updates.objectives) {
    await updateScenarioObjectives(scenarioId, updates.objectives);
  }
  
 
}


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await updateScenarioDetails(params.id, body);
    return NextResponse.ok({ success: true });
  } catch (error) {
    console.error("Error updating scenario:", error);
    return NextResponse.error({ message: "Error updating scenario" });
  }


}