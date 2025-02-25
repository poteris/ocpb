import { NextRequest, NextResponse } from "next/server";
import { upsertPersona } from "@/lib/db";
import { personaSchema } from "@/types/persona";

export async function POST(req: NextRequest) {
    try {
        const persona = await req.json();
        const parsedPersona = personaSchema.parse(persona);
        const id = await upsertPersona(parsedPersona);
        return NextResponse.json({ id });
    } catch (error) {
        console.error("Error saving persona:", error);
        return NextResponse.json({ error: "Error saving persona" }, { status: 500 });
    }
}