import { NextRequest, NextResponse } from "next/server";
import { retrievePersona } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const persona = await retrievePersona(id);

    return NextResponse.json(persona, { status: 200 });
  } catch (error) {
    console.error("Error retrieving persona:", error);
    return NextResponse.json({ message: "Error retrieving persona" }, { status: 500 });
  }
}
