'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminQuotesModerationPage() {
  const session = useSession();
  const supabase = createClientComponentClient();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from('quotes')
        .select('*');

      if (data) setQuotes(data);
      setLoading(false);
    }

    fetchQuotes();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status } : q))
      );
    }
  };

  if (!session || session.user.email !== 'admin@cogtechai.com') {
    return (
      <div className="p-6">
        <h1 className="text-xl text-red-600 font-bold">🚫 Access Denied</h1>
      </div>
    );
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛠️ Moderate Supplier Quotes</h1>
      {quotes.length === 0 ? (
        <p>No quotes available.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="border p-4 rounded shadow bg-white">
              <p><strong>💵 Price:</strong> ${quote.price}</p>
              <p><strong>⏳ Timeline:</strong> {quote.timeline}</p>
              <p><strong>📧 Submitted by:</strong> {quote.submitted_by}</p>
              <p><strong>📝 Status:</strong> {quote.status || 'Pending'}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => updateStatus(quote.id, 'approved')}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => updateStatus(quote.id, 'rejected')}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
