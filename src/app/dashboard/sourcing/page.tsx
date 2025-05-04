'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import QuoteList from '@/components/QuoteList';
import QuoteForm from '@/components/forms/QuoteForm';
import PostNeedForm from '@/components/forms/PostNeedForm';

export const dynamic = 'force-dynamic';

type QuotePayload = {
  need_id: string;
  [key: string]: any;
};

export default function PublicSourcingPage() {
  const supabase = createClientComponentClient();
  const session = useSession();

  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteVisible, setQuoteVisible] = useState<Record<string, boolean>>({});
  const [quoteList, setQuoteList] = useState<Record<string, any[]>>({});
  const [loadingQuotes, setLoadingQuotes] = useState<Record<string, boolean>>({});
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const fetchNeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('sourcing_needs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch error:', error.message);
      } else {
        setNeeds(data || []);
      }
    } catch (err) {
      console.error('❌ Fetch needs failed:', err);
    }
    setLoading(false);
  };

  const fetchQuotes = async (needId: string) => {
    try {
      const res = await fetch(`/api/quotes/${needId}`);
      const data = await res.json();
      setQuoteList((prev) => ({ ...prev, [needId]: data }));
    } catch (err) {
      console.error(`❌ Fetch quotes failed for ${needId}:`, err);
    }
  };

  useEffect(() => {
    fetchNeeds();

    const fetchSubscriptionStatus = async () => {
      if (!session?.user?.email) return;
      const { data } = await supabase
        .from('users')
        .select('subscription_active')
        .eq('email', session.user.email)
        .single();

      if (data?.subscription_active) {
        setSubscriptionActive(true);
      }
    };

    fetchSubscriptionStatus();

    const channel = supabase
      .channel('quotes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        (payload) => {
          const newQuote = payload.new as QuotePayload;
          if (newQuote?.need_id) fetchQuotes(newQuote.need_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleQuotes = async (needId: string) => {
    const isVisible = quoteVisible[needId];

    if (!isVisible) {
      setLoadingQuotes((prev) => ({ ...prev, [needId]: true }));
      await fetchQuotes(needId);
      setLoadingQuotes((prev) => ({ ...prev, [needId]: false }));
    }

    setQuoteVisible((prev) => ({ ...prev, [needId]: !prev[needId] }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-indigo-700 mb-6">
        🌍 Open Sourcing Needs
      </h1>

      {subscriptionActive ? (
        <PostNeedForm onSubmitted={fetchNeeds} />
      ) : (
        <p className="text-red-600 mb-4">Only subscribed users can post sourcing needs.</p>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Loading sourcing needs...</p>
      ) : needs.length === 0 ? (
        <p className="mt-6 text-gray-500">No sourcing needs found.</p>
      ) : (
        <div className="space-y-6 mt-8">
          {needs.map((req) => (
            <div
              key={req.id}
              className="border p-4 rounded shadow bg-white dark:bg-gray-800"
            >
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">{req.title}</h2>
                <p><strong>Quantity:</strong> {req.quantity}</p>
                <p><strong>Description:</strong> {req.description}</p>
                <p className="text-sm text-gray-500">Posted by: {req.email}</p>
              </div>

              <div className="mt-4 border-t pt-4">
                <QuoteForm
                  needId={req.id}
                  userEmail={session?.user?.email || ''}
                  onSubmitted={() => {
                    if (quoteVisible[req.id]) toggleQuotes(req.id);
                  }}
                />

                <button
                  onClick={() => toggleQuotes(req.id)}
                  className="mt-3 text-sm text-indigo-600 underline"
                >
                  {quoteVisible[req.id]
                    ? `Hide Quotes (${quoteList[req.id]?.length || 0})`
                    : `View Quotes (${quoteList[req.id]?.length || 0})`}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
