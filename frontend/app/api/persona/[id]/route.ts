import { NextRequest, NextResponse } from "next/server";
import { retrievePersona } from "@/lib/server/db";
import { getTenantFromRequest } from "@/lib/tenant";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: "Persona ID is required" }, { status: 400 });
    }

    const organizationId = getTenantFromRequest(req);
    const persona = await retrievePersona(id, organizationId);
    
    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    return NextResponse.json(persona, { status: 200 });
  } catch (error) {
    console.error("Error fetching persona:", error);
    return NextResponse.json({ error: "Failed to fetch persona" }, { status: 500 });
  }
}
