import { generateNewPersona as newPersona } from "@/lib/services/persona/generateNewPersona";
import { NextResponse } from "next/server";
import { z } from "zod";

const personaSchema = z.object({
  id: z.string(),
  name: z.string(),
  segment: z.string(),
  age: z.number(),
  gender: z.string(),
  family_status: z.string(),
  uk_party_affiliation: z.string(),
  workplace: z.string(),
  job: z.string(),
  busyness_level: z.string(),
  major_issues_in_workplace: z.string(),
  personality_traits: z.string(),
  emotional_conditions: z.string(),
});

export async function GET() {
  try {
    const persona = await newPersona();

    personaSchema.parse(persona); // will throw an error if the persona does not match the schema

    return NextResponse.json(persona, { status: 200 });
  } catch (error) {
    console.error("Error generating persona:", error);

    return NextResponse.json({ error: "Failed to generate persona" }, { status: 500 });
  }
}
