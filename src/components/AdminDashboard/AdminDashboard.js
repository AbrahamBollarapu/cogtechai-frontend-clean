import React, { useEffect, useState, useMemo } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import supabase from '../../utils/supabaseClient'; // Import Supabase client
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify'; // Optional, for showing notifications

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const session = useSession();
  const [needs, setNeeds] = useState([]);  // Store sourcing needs
  const [quotes, setQuotes] = useState({});  // Store quotes data grouped by need_id
  const [loading, setLoading] = useState(true);  // Track loading state
  const [analytics, setAnalytics] = useState({});  // Store analytics (e.g., tier distribution)
  const [filterTier, setFilterTier] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [filterSubscription, setFilterSubscription] = useState('All');
  const [message, setMessage] = useState(null);  // For showing success/failure messages

  // Check if the user is an admin
  const isAdmin = session?.user?.email === 'admin@cogtechai.com';

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch initial data
    const fetchData = async () => {
      const { data: needsData } = await supabase
        .from('sourcing_needs')
        .select('id, title, quantity, description, email, user_profiles(full_name, role, subscription_active, tier)')
        .order('created_at', { ascending: false });

      const needIds = needsData.map(n => n.id);

      // Fetch quotes associated with the needs
      const { data: allQuotesData } = await supabase
        .from('quotes')
        .select('id, need_id, price, notes, email')
        .in('need_id', needIds);

      const quotesByNeed = allQuotesData.reduce((acc, quote) => {
        const needId = quote.need_id;
        if (!acc[needId]) acc[needId] = [];
        acc[needId].push(quote);
        return acc;
      }, {});

      // Create tier analytics
      const tierCount = {};
      for (const need of needsData) {
        const tier = need.user_profiles?.tier || 'Unverified';
        tierCount[tier] = (tierCount[tier] || 0) + 1;
      }

      setNeeds(needsData);
      setQuotes(quotesByNeed);
      setAnalytics(tierCount);
      setLoading(false);
    };

    // Real-time subscription to listen for new rows in `sourcing_needs` and `quotes`
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sourcing_needs' }, (payload) => {
        setNeeds(prevState => [...prevState, payload.new]); // New need added
        toast.success('New sourcing need added');
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quotes' }, (payload) => {
        setQuotes(prevState => ({
          ...prevState,
          [payload.new.need_id]: [...(prevState[payload.new.need_id] || []), payload.new]
        }));
        toast.success('New quote added');
      })
      .subscribe();

    // Fetch initial data
    fetchData();

    // Cleanup real-time subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Filter needs based on tier
  const filteredNeeds = needs.filter(need => {
    const matchesTier = filterTier === 'All' || need.user_profiles?.tier === filterTier;
    const matchesRole = filterRole === 'All' || need.user_profiles?.role === filterRole;
    const matchesSubscription = 
      filterSubscription === 'All' || 
      (filterSubscription === 'Active' ? need.user_profiles?.subscription_active : !need.user_profiles?.subscription_active);

    return matchesTier && matchesRole && matchesSubscription;
  });

  // Prepare pie chart data
  const pieData = Object.entries(analytics).map(([name, value]) => ({ name, value }));

  // Handle CSV export
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

  if (!isAdmin) {
    return <div className="p-6 text-red-600">⛔ Unauthorized access</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🛠️ Admin Dashboard</h1>
        <CSVLink
          data={csvData}
          headers={Object.keys(csvData[0] || {}).map(k => ({ label: k, key: k }))}
          filename={`quotes_export_${Date.now()}.csv`}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </CSVLink>
      </div>

      <div className="mb-4">
        <label className="font-semibold mr-2">Filter by Tier:</label>
        {['All', 'Unverified', 'Silver', 'Gold', 'Platinum'].map(t => (
          <button
            key={t}
            onClick={() => setFilterTier(t)}
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
            onClick={() => setFilterRole(role)}
            className={`px-3 py-1 rounded mr-2 ${filterRole === role ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="font-semibold mr-2">Filter by Subscription:</label>
        {['All', 'Active', 'Inactive'].map(subscription => (
          <button
            key={subscription}
            onClick={() => setFilterSubscription(subscription)}
            className={`px-3 py-1 rounded mr-2 ${filterSubscription === subscription ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
          >
            {subscription}
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">User Tier Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading ? (
        <p>Loading sourcing data...</p>
      ) : (
        <div className="space-y-6">
          {filteredNeeds.map((need) => (
            <div key={need.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-indigo-700">{need.title}</h2>
              <p><strong>Quantity:</strong> {need.quantity}</p>
              <p><strong>Description:</strong> {need.description}</p>
              <p className="text-sm text-gray-500">
                Posted by: {need.user_profiles?.full_name || need.email} ({need.user_profiles?.role})
              </p>
              <p className="text-sm text-green-600">
                {need.user_profiles?.subscription_active ? '✅ Subscribed User' : '❌ Not Subscribed'}
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
