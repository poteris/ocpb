import { supabase } from "@/lib/init";

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
  },
) {
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
      throw scenarioError;
    }
  }

  // Update objectives if provided
  if (updates.objectives) {
    await updateScenarioObjectives(scenarioId, updates.objectives);
  }
}
