'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SupplierQuotesPage() {
  const session = useSession();
  const supabase = createClientComponentClient();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('submitted_by', session.user.email);

      if (data) setQuotes(data);
      setLoading(false);
    };

    fetchQuotes();
  }, [session]);

  if (!session) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600">⚠️ Please log in to view your quotes</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-sky-700">📄 Your Submitted Quotes</h1>

      {loading ? (
        <p>Loading...</p>
      ) : quotes.length === 0 ? (
        <p>No quotes submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="border p-4 rounded shadow bg-white">
              <p><strong>💵 Price:</strong> ${quote.price}</p>
              <p><strong>⏳ Timeline:</strong> {quote.timeline}</p>
              <p><strong>📅 Status:</strong> 
                {quote.status === 'approved' ? (
                  <span className="text-green-600 font-semibold"> Approved ✅</span>
                ) : quote.status === 'rejected' ? (
                  <span className="text-red-600 font-semibold"> Rejected ❌</span>
                ) : (
                  <span className="text-yellow-500 font-semibold"> Pending ⏳</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
