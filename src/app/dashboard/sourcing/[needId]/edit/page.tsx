'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EditSourcingNeed() {
  const router = useRouter();
  const params = useParams() as { needId: string };
  const needId = params.needId;
  const session = useSession();
  const supabase = createClientComponentClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    quantity: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session || !needId) return;
    (async () => {
      const { data, error } = await supabase
        .from('sourcing_needs')
        .select('title, description, quantity')
        .eq('id', needId)
        .single();

      if (data) {
        setForm({
          title: data.title,
          description: data.description,
          quantity: data.quantity,
        });
      }

      setLoading(false);
    })();
  }, [needId, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/sourcing/${needId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) router.push('/dashboard/sourcing/list');
    else alert('Failed to save changes');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this need?')) return;
    const res = await fetch(`/api/sourcing/${needId}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard/sourcing/list');
    else alert('Failed to delete');
  };

  if (!session) return <p className="p-6 text-red-600">Please log in.</p>;
  if (loading) return <p className="p-6">Loading…</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Sourcing Need</h1>
      <label className="block mb-2">
        Title
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block mb-2">
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </label>
      <label className="block mb-4">
        Quantity
        <input
          name="quantity"
          type="number"
          value={form.quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </label>
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Delete
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
