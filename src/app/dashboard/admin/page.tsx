'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import { sendEmail } from './emailService'; // Assuming you have emailService

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const supabase = createClientComponentClient();
  const session = useSession();

  const [needs, setNeeds] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Record<string, number>>({});
  const [filterTier, setFilterTier] = useState<'All' | 'Unverified' | 'Silver' | 'Gold' | 'Platinum'>('All');
  const [filterRole, setFilterRole] = useState<'All' | 'Freelancer' | 'Client' | 'Manufacturer'>('All');
  const [filterSubscription, setFilterSubscription] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [page, setPage] = useState(1);
  const pageSize = 10; // Adjust this

  const isAdmin = session?.user?.email === 'admin@cogtechai.com';

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      const { data: needsData } = await supabase
        .from('sourcing_needs')
        .select('id, title, quantity, description, email, user_profiles(full_name, role, subscription_active, tier)')
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const needIds = (needsData || []).map(n => n.id);

      const { data: allQuotesData } = await supabase
        .from('quotes')
        .select('id, need_id, price, notes, email')
        .in('need_id', needIds);

      const quotesByNeed = (allQuotesData || []).reduce((acc, quote) => {
        const needId = quote.need_id;
        if (!acc[needId]) acc[needId] = [];
        acc[needId].push(quote);
        return acc;
      }, {} as Record<string, any[]>);

      const tierCount: Record<string, number> = {};
      for (const need of needsData || []) {
        const tier = need.user_profiles?.[0]?.tier || 'Unverified';
        tierCount[tier] = (tierCount[tier] || 0) + 1;
      }

      setNeeds(needsData || []);
      setQuotes(quotesByNeed);
      setAnalytics(tierCount);
      setLoading(false);
    };

    fetchData();
  }, [isAdmin, page]);

  const filteredNeeds = useMemo(() => {
    return needs.filter((need) => {
      const matchesTier = filterTier === 'All' || need.user_profiles?.[0]?.tier === filterTier;
      const matchesRole = filterRole === 'All' || need.user_profiles?.[0]?.role === filterRole;
      const matchesSubscription =
        filterSubscription === 'All' ||
        (filterSubscription === 'Active' ? need.user_profiles?.[0]?.subscription_active : !need.user_profiles?.[0]?.subscription_active);

      return matchesTier && matchesRole && matchesSubscription;
    });
  }, [needs, filterTier, filterRole, filterSubscription]);

  const pieData = useMemo(() => (
    Object.entries(analytics).map(([name, value]) => ({ name, value }))
  ), [analytics]);

  const csvData = filteredNeeds.flatMap(need => (
    (quotes[need.id] || []).map(q => ({
      need_title: need.title,
      need_quantity: need.quantity,
      need_description: need.description,
      quote_price: q.price,
      quote_notes: q.notes,
      quote_email: q.email
    }))
  ));

  const handleExportCSV = () => {
    alert('✅ CSV export ready. Click "Export CSV" button above to download.');
  };

  if (!isAdmin) {
    return <div className="p-6 text-red-600">⛔ Unauthorized access</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🛠️ Admin Dashboard</h1>
        <CSVLink
          data={csvData}
          headers={[
            { label: "Need Title", key: "need_title" },
            { label: "Quantity", key: "need_quantity" },
            { label: "Description", key: "need_description" },
            { label: "Quote Price", key: "quote_price" },
            { label: "Quote Notes", key: "quote_notes" },
            { label: "Quote Email", key: "quote_email" },
          ]}
          filename="user_quotes.csv"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </CSVLink>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Filter by Tier:</label>
        {['All', 'Unverified', 'Silver', 'Gold', 'Platinum'].map(t => (
          <button
            key={t}
            onClick={() => setFilterTier(t as typeof filterTier)}
            className={`px-3 py-1 rounded mr-2 ${filterTier === t ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="font-semibold mr-2">Filter by Role:</label>
        {['All', 'Freelancer', 'Client', 'Manufacturer'].map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role as typeof filterRole)}
            className={`px-3 py-1 rounded mr-2 ${filterRole === role ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label className="font-semibold mr-2">Filter by Subscription:</label>
        {['All', 'Active', 'Inactive'].map(subscription => (
          <button
            key={subscription}
            onClick={() => setFilterSubscription(subscription as typeof filterSubscription)}
            className={`px-3 py-1 rounded mr-2 ${filterSubscription === subscription ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {subscription}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">User Tier Distribution</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Needs + Quotes List */}
      {loading ? (
        <p>Loading sourcing needs...</p>
      ) : (
        <div className="space-y-6">
          {filteredNeeds.map((need) => (
            <div key={need.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
              <h2 className="text-lg font-semibold">{need.title}</h2>
              <p><strong>Quantity:</strong> {need.quantity}</p>
              <p><strong>Description:</strong> {need.description}</p>
              <p className="text-sm text-gray-500">
                Posted by: {need.user_profiles?.[0]?.full_name || need.email} ({need.user_profiles?.[0]?.role})
              </p>
              <p className="text-sm text-green-600">
                {need.user_profiles?.[0]?.subscription_active ? '✅ Subscribed' : '❌ Not Subscribed'}
              </p>

              <h3 className="mt-4 font-semibold">Quotes:</h3>
              {quotes[need.id]?.length ? (
                <ul className="mt-2 space-y-1 text-sm">
                  {quotes[need.id].map((q, i) => (
                    <li key={i} className="p-2 border rounded bg-gray-100 dark:bg-gray-700">
                      💵 <strong>${q.price}</strong> – {q.notes || 'No notes'}<br />
                      <span className="text-xs text-gray-500">From: {q.email}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No quotes submitted.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
