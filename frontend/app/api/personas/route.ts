import { NextRequest, NextResponse } from "next/server";
import { supabaseService as supabase } from "../service-init";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get('organisation_id') || 'default';

    const { data: personas, error } = await supabase
      .from('personas')
      .select('*')
      .eq('organisation_id', organisationId);

    if (error) {
      console.error('Error fetching personas:', error);
      return NextResponse.json({ error: 'Failed to fetch personas' }, { status: 500 });
    }

    return NextResponse.json(personas, { status: 200 });
  } catch (error) {
    console.error('Error in personas GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




