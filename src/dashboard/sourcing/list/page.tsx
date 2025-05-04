'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function MySourcingListPage() {
  const session = useSession();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchNeeds = async () => {
      const { data, error } = await supabase
        .from('sourcing_needs')
        .select('*')
        .eq('user_email', session.user.email);

      if (data) setNeeds(data);
      setLoading(false);
    };

    fetchNeeds();
  }, [session]);

  const handleDelete = async (id: number) => {
    const confirm = window.confirm('Are you sure you want to delete this post?');
    if (!confirm) return;

    const { error } = await supabase.from('sourcing_needs').delete().eq('id', id);
    if (!error) {
      setNeeds((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/sourcing/edit/${id}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧾 My Sourcing Needs</h1>

      {needs.length === 0 ? (
        <p>No sourcing needs found.</p>
      ) : (
        <ul className="space-y-4">
          {needs.map((item) => (
            <li key={item.id} className="border p-4 rounded shadow-sm">
              <p><strong>Title:</strong> {item.title}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>
              <p><strong>Required by:</strong> {item.required_by}</p>

              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
