import { NextRequest, NextResponse } from "next/server";
import { retrievePersona } from "@/lib/db";
import { personaSchema } from "@/types/persona";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const persona = await retrievePersona(id);
    const parsedPersona = personaSchema.parse(persona);
    return NextResponse.json(parsedPersona, { status: 200 });
  } catch (error) {
    console.error("Error retrieving persona:", error);
    return NextResponse.json({ message: "Error retrieving persona" }, { status: 500 });
  }
}
