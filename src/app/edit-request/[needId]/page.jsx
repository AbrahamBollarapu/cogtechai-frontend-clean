'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EditRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function loadRequest() {
      const { data, error } = await supabase
        .from('sourcing_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setTitle(data.title);
        setDescription(data.description);
      }
    }

    loadRequest();
  }, [id]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('sourcing_requests')
      .update({ title, description })
      .eq('id', id);

    if (error) {
      alert('Update failed');
    } else {
      alert('Request updated');
      router.push('/dashboard');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Sourcing Request</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mb-2 p-2 border rounded" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mb-4 p-2 border rounded" />
      <button onClick={handleUpdate} className="bg-green-500 text-white px-4 py-2 rounded">Update</button>
    </div>
  );
}
