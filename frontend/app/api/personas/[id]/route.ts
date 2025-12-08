import { NextRequest, NextResponse } from "next/server";
import { supabaseService as supabase } from "../../service-init";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    
    // Voice fields
    if (body.voice_id !== undefined) updateData.voice_id = body.voice_id;
    if (body.voice_name !== undefined) updateData.voice_name = body.voice_name;
    if (body.voice_accent !== undefined) updateData.voice_accent = body.voice_accent;
    
    // Other persona fields (for full updates)
    if (body.name !== undefined) updateData.name = body.name;
    if (body.segment !== undefined) updateData.segment = body.segment;
    if (body.age !== undefined) updateData.age = body.age;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.family_status !== undefined) updateData.family_status = body.family_status;
    if (body.uk_party_affiliation !== undefined) updateData.uk_party_affiliation = body.uk_party_affiliation;
    if (body.workplace !== undefined) updateData.workplace = body.workplace;
    if (body.job !== undefined) updateData.job = body.job;
    if (body.busyness_level !== undefined) updateData.busyness_level = body.busyness_level;
    if (body.major_issues_in_workplace !== undefined) updateData.major_issues_in_workplace = body.major_issues_in_workplace;
    if (body.personality_traits !== undefined) updateData.personality_traits = body.personality_traits;
    if (body.emotional_conditions !== undefined) updateData.emotional_conditions = body.emotional_conditions;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update the persona in the database
    const { data, error } = await supabase
      .from('personas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating persona:', error);
      return NextResponse.json({ error: 'Failed to update persona' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in persona PATCH:', error);
    return NextResponse.json(
      { error: 'Invalid request data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }
}




