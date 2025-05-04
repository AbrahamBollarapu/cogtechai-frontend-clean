// File: /src/app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createPagesBrowserClient();

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession();

      if (!error) {
        router.replace('/dashboard');
      } else {
        console.error('Auth error:', error.message);
        router.replace('/');
      }
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors">
      {/* ✅ Brand Logo */}
      <Image
        src="/logo.jpg" // <-- reference to the uploaded logo
        alt="CogTechAI Logo"
        width={160}
        height={60}
        className="mb-6"
      />

      <h1 className="text-xl font-bold mb-2">Signing you in…</h1>

      {/* ✅ Spinner */}
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

      <p className="mt-4 text-sm text-gray-500">Please wait while we verify your session.</p>
    </div>
  );
}
