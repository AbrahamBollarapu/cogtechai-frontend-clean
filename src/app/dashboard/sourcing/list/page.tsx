'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Need {
  id: string;
  title: string;
  description: string;
  quantity: number;
  email: string;
}

export default function MySourcingNeeds() {
  const session = useSession();
  const supabase = createClientComponentClient();
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetchMyNeeds();
  }, [session]);

  const fetchMyNeeds = async () => {
    const { data, error } = await supabase
      .from('sourcing_needs')
      .select('*')
      .eq('email', session?.user?.email)
      .order('created_at', { ascending: false });

    if (data) setNeeds(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this need?')) return;
    const { error } = await supabase.from('sourcing_needs').delete().eq('id', id);
    if (!error) fetchMyNeeds();
    else alert('Delete failed');
  };

  if (!session) return <p className="p-6 text-red-600">Please log in.</p>;
  if (loading) return <p className="p-6">Loading your needs…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">📦 My Sourcing Needs</h1>

      {needs.length === 0 ? (
        <p>No needs posted yet.</p>
      ) : (
        <ul className="space-y-3">
          {needs.map((n) => (
            <li key={n.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{n.title}</h2>
                <p className="text-sm text-gray-600">{n.description} — Qty: {n.quantity}</p>
              </div>
              <div className="space-x-2">
                <Link href={`/dashboard/sourcing/${n.id}/edit`}>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">Edit</button>
                </Link>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
