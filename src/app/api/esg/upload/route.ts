// File: /src/app/api/esg/upload/route.ts

'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userEmail = formData.get('email') as string;

    if (!file || !userEmail) {
      return NextResponse.json({ error: 'Missing file or email' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('esg_docs')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
    }

    // Generate public URL
    const { data: publicURL } = supabase
      .storage
      .from('esg_docs')
      .getPublicUrl(fileName);

    if (!publicURL?.publicUrl) {
      return NextResponse.json({ error: 'Could not generate public URL' }, { status: 500 });
    }

    // Insert metadata into `esg_uploads`
    const { error: dbError } = await supabase
      .from('esg_uploads')
      .insert({
        file_url: publicURL.publicUrl,
        user_email: userEmail,
        status: 'pending', // default status for admin review
      });

    if (dbError) {
      console.error(dbError);
      return NextResponse.json({ error: 'Failed to save metadata' }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: publicURL.publicUrl });
  } catch (err: any) {
    console.error('Upload failed:', err.message);
    return NextResponse.json({ error: 'Unexpected error during upload' }, { status: 500 });
  }
}
