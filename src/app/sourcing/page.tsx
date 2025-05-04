'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export default function SourcingPage() {
  const supabase = createClientComponentClient();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const { data, error } = await supabase
          .from('sourcing_needs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Supabase error:', error.message);
          setError(error.message);
        } else {
          setData(data || []);
        }
      } catch (err: any) {
        console.error('❌ Network/client fetch error:', err.message || err);
        setError('Client fetch failed: ' + (err.message || err.toString()));
      } finally {
        setLoading(false);
      }
    };

    fetchNeeds();
  }, []);

  if (loading) return <p className="p-6">⏳ Loading sourcing needs...</p>;
  if (error) return <p className="p-6 text-red-600">❌ {error}</p>;
  if (data.length === 0) return <p className="p-6">📭 No sourcing needs found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🌍 Open Sourcing Needs</h1>
      <ul className="space-y-3">
        {data.map((n) => (
          <li key={n.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
            <h2 className="font-semibold">{n.title}</h2>
            <p className="text-sm text-gray-600">{n.description}</p>
            <p className="text-sm text-gray-600">Qty: {n.quantity}</p>
            <span className="text-xs text-gray-500">{n.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
