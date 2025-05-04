'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';

export default function SubmitQuotePage() {
  const params = useParams();
  const requestId = params?.requestId as string | undefined; // ✅ Correct way
  const router = useRouter();
  const session = useSession();
  const supabase = createClientComponentClient();

  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');

  useEffect(() => {
    if (!requestId) return;

    async function fetchTitle() {
      const { data, error } = await supabase
        .from('sourcing_needs')
        .select('title')
        .eq('id', requestId)
        .single();

      if (data) setRequestTitle(data.title);
    }

    fetchTitle();
  }, [requestId, supabase]);

  const handleSubmit = async () => {
    if (!price || !session?.user?.email) {
      alert('Please enter a price and make sure you are logged in.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('quotes').insert([
      {
        need_id: requestId,
        price: Number(price),
        notes,
        email: session.user.email,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Failed to submit quote.');
    } else {
      alert('Quote submitted!');
      router.push('/dashboard/sourcing');
    }
  };

  if (!requestId) {
    return (
      <div className="p-6 text-red-600">
        ❌ Invalid Request ID
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit Quote for</h1>
      <p className="text-lg mb-6">{requestTitle || '...'}</p>

      <input
        type="number"
        placeholder="Quote Price"
        className="w-full p-2 mb-4 border rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <textarea
        placeholder="Notes (optional)"
        className="w-full p-2 mb-4 border rounded"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
      />

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-indigo-600 text-white"
      >
        {loading ? 'Submitting...' : 'Submit Quote'}
      </Button>
    </div>
  );
}
