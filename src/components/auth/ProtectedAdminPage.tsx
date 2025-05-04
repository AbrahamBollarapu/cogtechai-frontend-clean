'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ProtectedAdminPage({ children }: { children: ReactNode }) {
  const session = useSession();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!session?.user) {
        router.push('/login'); // 🔒 Not logged in
        return;
      }

      const { data } = await supabase.auth.getUser();
      const isAdmin = data?.user?.user_metadata?.is_admin;

      if (isAdmin) {
        setAuthorized(true);
      } else {
        router.push('/unauthorized'); // ❌ Not admin
      }

      setLoading(false);
    };

    checkAdmin();
  }, [session]);

  if (loading) return <div className="p-6 text-center">Checking admin access...</div>;
  if (!authorized) return null;

  return <>{children}</>;
}
