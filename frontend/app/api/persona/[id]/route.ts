import { NextResponse } from "next/server";
import { retrievePersona } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = (await params).id;
        const persona = await retrievePersona(id);
        return NextResponse.json(persona);
    } catch (error) {
        console.error("Error fetching persona:", error);
        return NextResponse.error();
    }
}