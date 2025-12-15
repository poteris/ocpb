import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromRequest } from '@/lib/tenant';
import { supabaseService } from '../../service-init';

export async function POST(request: NextRequest) {
  try {
    const organizationId = getTenantFromRequest(request);
    
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and SVG files are allowed' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}-logo-${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage using service role
    const { error: uploadError } = await supabaseService.storage
      .from('organization-assets')
      .upload(`logos/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseService.storage
      .from('organization-assets')
      .getPublicUrl(`logos/${fileName}`);

    return NextResponse.json({ 
      logoUrl: publicUrl,
      message: 'Logo uploaded successfully' 
    });
  } catch (error) {
    console.error('Error in POST /api/upload/logo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
