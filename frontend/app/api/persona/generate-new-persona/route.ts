import { generateNewPersona as newPersona } from "@/lib/server/services/persona/generateNewPersona";
import { NextRequest, NextResponse } from "next/server";
import { getTenantFromRequest } from "@/lib/tenant";
import { z } from "zod";

const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment: z.string(),
  age: z.number(),
  gender: z.string(),
  family_status: z.string(),
  uk_party_affiliation: z.string(),
  //workplace: z.string(),
  job: z.string(),
  busyness_level: z.string(),
  personality_traits: z.string(),
  emotional_conditions: z.string(),
  location: z.string(),
  major_issues: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const organizationId = getTenantFromRequest(request);
    const persona = await newPersona(request.headers);
    
    // Add organisation_id to the generated persona
    const personaWithOrg = { ...persona, organisation_id: organizationId };

    personaSchema.parse(persona); // will throw an error if the persona does not match the schema

    return NextResponse.json(personaWithOrg, { status: 200 });
  } catch (error) {
    console.error("Error generating persona:", error);

    return NextResponse.json({ error: "Failed to generate persona" }, { status: 500 });
  }
}
