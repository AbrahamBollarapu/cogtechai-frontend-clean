
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import QuoteList from '@/components/QuoteList';
import QuoteForm from '@/components/forms/QuoteForm';
import PostNeedForm from '@/components/forms/PostNeedForm';

export default function PublicSourcingPage() {
  const supabase = createClientComponentClient();
  const session = useSession();

  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteVisible, setQuoteVisible] = useState<Record<string, boolean>>({});
  const [quoteList, setQuoteList] = useState<Record<string, any[]>>({});
  const [loadingQuotes, setLoadingQuotes] = useState<Record<string, boolean>>({});

  const fetchNeeds = async () => {
    const { data } = await supabase
      .from('sourcing_needs')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setNeeds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNeeds();
  }, []);

  const toggleQuotes = async (needId: string) => {
    const isVisible = quoteVisible[needId];

    if (!isVisible) {
      setLoadingQuotes((prev) => ({ ...prev, [needId]: true }));
      const res = await fetch(`/api/quotes/${needId}`);
      const data = await res.json();
      setQuoteList((prev) => ({ ...prev, [needId]: data }));
      setLoadingQuotes((prev) => ({ ...prev, [needId]: false }));
    }

    setQuoteVisible((prev) => ({ ...prev, [needId]: !prev[needId] }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">🌍 Open Sourcing Needs</h1>

      <PostNeedForm onSubmitted={fetchNeeds} />

      {loading ? (
        <p className="mt-6">Loading sourcing needs...</p>
      ) : needs.length === 0 ? (
        <p className="mt-6">No sourcing needs found.</p>
      ) : (
        <div className="space-y-6 mt-6">
          {needs.map((req) => (
            <div key={req.id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{req.title}</h2>
              <p><strong>Quantity:</strong> {req.quantity}</p>
              <p><strong>Description:</strong> {req.description}</p>
              <p className="text-sm text-gray-500">Posted by: {req.email}</p>

              <QuoteForm
                needId={req.id}
                userEmail={session?.user?.email || ''}
                onSubmitted={() => {
                  if (quoteVisible[req.id]) toggleQuotes(req.id);
                }}
              />

              <button
                onClick={() => toggleQuotes(req.id)}
                className="text-sm text-indigo-600 underline mt-2"
              >
                {quoteVisible[req.id] ? 'Hide Quotes' : 'View Quotes'}
              </button>

              {quoteVisible[req.id] && (
                <div className="mt-4">
                  <QuoteList
                    quotes={quoteList[req.id] || []}
                    loading={loadingQuotes[req.id] || false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
