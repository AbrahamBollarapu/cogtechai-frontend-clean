'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function VerifyESGPage() {
  const supabase = createPagesBrowserClient();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      setStatus('error');
      return alert('User not logged in');
    }

    const { error } = await supabase.from('esg_verifications').insert([
      {
        user_id: session.user.id,
        description,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('submitted');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Request ESG Verification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border border-gray-300 p-3 rounded"
          placeholder="Describe your eco-friendly practices here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
      {status === 'submitted' && <p className="text-green-600 mt-4">✅ Submitted successfully! Admin will review your request.</p>}
      {status === 'error' && <p className="text-red-600 mt-4">❌ There was an error. Please try again.</p>}
    </div>
  );
}
