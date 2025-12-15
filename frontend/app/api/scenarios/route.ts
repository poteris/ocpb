import { getScenarios } from "@/lib/server/services/scenarios/getScenarios";
import { TrainingScenario } from "@/types/scenarios";
import { NextResponse, NextRequest } from "next/server";
import { supabaseService as supabase } from "../service-init";
import {  DatabaseError, DatabaseErrorCodes } from "@/utils/errors";
import { getTenantFromRequest } from "@/lib/tenant";


export async function GET(request: NextRequest) {
  try {
    const organizationId = getTenantFromRequest(request);
    const result = await getScenarios(organizationId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Error in GET scenarios:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

async function createScenarioWithObjectives(scenario: TrainingScenario & { organisation_id: string }) {
  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      context: scenario.context,
      organisation_id: scenario.organisation_id,
    })
    .select()
    .single();

  if (error) {
    const dbError = new DatabaseError("Error creating scenario", "create_scenario", DatabaseErrorCodes.Insert, {
      details: {
        error: error,
      }
    });
    console.error(dbError.toLog());
    throw dbError;
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
      const dbError = new DatabaseError("Error creating objectives", "create_scenario", DatabaseErrorCodes.Insert, {
        details: {
          error: objectivesError,
        }
      });
      console.error(dbError.toLog());
      throw dbError;
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
    const organizationId = getTenantFromRequest(req);
    const body = await req.json();
    const scenarioWithOrg = { ...body, organisation_id: organizationId };
    const result = await createScenarioWithObjectives(scenarioWithOrg);
     
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    console.error("Error in POST scenarios:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
