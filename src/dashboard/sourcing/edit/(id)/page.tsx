'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EditSourcingPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeed = async () => {
      const { data, error } = await supabase
        .from('sourcing_needs')
        .select('title, description, quantity')
        .eq('id', id)
        .single();

      if (data) {
        setTitle(data.title);
        setDescription(data.description);
        setQuantity(data.quantity);
      }

      setLoading(false);
    };

    if (id) fetchNeed();
  }, [id]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('sourcing_needs')
      .update({ title, description, quantity })
      .eq('id', id);

    if (!error) {
      alert('✅ Updated!');
      router.push('/dashboard/sourcing/list');
    } else {
      alert('❌ Update failed.');
    }
  };

  if (loading) return <div className="p-6">Loading need details...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">✏️ Edit Sourcing Need</h1>

      <label className="block mb-2">
        Title
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block mb-2">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
        />
      </label>

      <label className="block mb-4">
        Quantity
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </label>

      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Update Need
      </button>
    </div>
  );
}
