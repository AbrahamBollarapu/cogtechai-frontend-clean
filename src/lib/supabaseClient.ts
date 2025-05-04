'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createPagesBrowserClient({
  supabaseUrl: 'https://hauytlbdwgctngqbvdav.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1hZG1pbiIsInN1YiI6ImU0YmZmODc3LTMzNWUtNDFhZi04NmI2LTA4ZDM4OWJlYmFiMiIsImlhdCI6MTcxNDU3MDc5NSwiZXhwIjoxNzE3MTYyNzk1fQ.rZFEeUAY-q_NjqihMyl3oqb_-ME8KBgR5u0VqCk_TIA',
});
