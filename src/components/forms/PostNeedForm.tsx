'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';

interface Props {
  onSubmitted: () => void;
}

interface FormState {
  title: string;
  description: string;
  quantity: string;
  email: string;
}

export default function PostNeedForm({ onSubmitted }: Props) {
  const session = useSession();

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    quantity: '',
    email: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // ✅ Safely assign email with fallback to empty string
    setForm((prev) => ({
      ...prev,
      email: session?.user?.email ?? '',
    }));
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch('/api/sourcing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    if (res.ok) {
      toast.success('Need posted!');
      setForm({
        title: '',
        description: '',
        quantity: '',
        email: session?.user?.email ?? '',
      });
      onSubmitted();
    } else {
      toast.error(result.error || 'Failed to submit');
    }

    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded shadow max-w-md mx-auto"
    >
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={form.quantity}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        value={form.email}
        readOnly
        className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
      >
        {submitting ? 'Submitting...' : 'Submit Need'}
      </button>
    </form>
  );
}
