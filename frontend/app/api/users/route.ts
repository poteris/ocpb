import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService as supabase } from "../service-init";

const upsertUserSchema = z.object({
  userId: z.string().min(1),
  displayName: z.string().trim().min(1).max(40),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName } = upsertUserSchema.parse(body);

    const { error } = await supabase.from("users").upsert(
      {
        id: userId,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "That name is already taken" }, { status: 409 });
      }
      console.error("Error upserting user:", error);
      return NextResponse.json({ message: "Failed to save user" }, { status: 500 });
    }

    return NextResponse.json({ userId, displayName }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request", issues: error.issues }, { status: 400 });
    }
    console.error("Error in POST users:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
