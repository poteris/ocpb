import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant';
import { supabaseService as supabase } from '../../../service-init';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = getTenantFromRequest(request);
    const { id } = await params;
    
    // Verify the requested ID matches the tenant from subdomain
    if (id !== organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: organization, error } = await supabase
      .from('organisations')
      .select('logo_url, primary_color')
      .eq('id', organizationId)
      .single();

    if (error) {
      console.error('Error fetching organization branding:', error);
      return NextResponse.json({ error: 'Failed to fetch branding' }, { status: 500 });
    }

    return NextResponse.json({
      logoUrl: organization.logo_url,
      primaryColor: organization.primary_color,
    });
  } catch (error) {
    console.error('Error in GET /api/organizations/[id]/branding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = getTenantFromRequest(request);
    const { id } = await params;
    
    // Verify the requested ID matches the tenant from subdomain
    if (id !== organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { logoUrl, primaryColor } = body;

    // Validate hex colors
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      return NextResponse.json({ error: 'Invalid primary color format' }, { status: 400 });
    }

    const updateData: { logo_url?: string; primary_color?: string } = {};
    if (logoUrl !== undefined) updateData.logo_url = logoUrl;
    if (primaryColor !== undefined) updateData.primary_color = primaryColor;

    const { data, error } = await supabase
      .from('organisations')
      .update(updateData)
      .eq('id', organizationId)
      .select('logo_url, primary_color')
      .single();

    if (error) {
      console.error('Error updating organization branding:', error);
      return NextResponse.json({ error: 'Failed to update branding' }, { status: 500 });
    }

    return NextResponse.json({
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
    });
  } catch (error) {
    console.error('Error in PUT /api/organizations/[id]/branding:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
