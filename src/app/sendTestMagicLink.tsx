'use client';

import axios from 'axios';

export async function sendTestMagicLink(email: string) {
  const supabaseUrl = 'https://hauytlbdwgctngqbvdav.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1hZG1pbiIsInN1YiI6ImU0YmZmODc3LTMzNWUtNDFhZi04NmI2LTA4ZDM4OWJlYmFiMiIsImlhdCI6MTcxNDU3MDc5NSwiZXhwIjoxNzE3MTYyNzk1fQ.rZFEeUAY-q_NjqihMyl3oqb_-ME8KBgR5u0VqCk_TIA';

  try {
    const response = await axios.post(
      `${supabaseUrl}/auth/v1/otp`,
      {
        email: email,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback'
        }
      },
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Magic link sent successfully:', response.data);
    alert('✅ Magic link sent successfully');
  } catch (error: any) {
    console.error('❌ Error sending magic link:', error.response?.data || error.message);
    alert('❌ Error sending magic link');
  }
}
