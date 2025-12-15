import { NextResponse } from "next/server";
import { supabaseService as supabase } from "../../service-init";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("organisations")
      .select("id, name")
      .order('name');

    if (error) {
      console.error("Error fetching organizations:", error);
      return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in organizations API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
