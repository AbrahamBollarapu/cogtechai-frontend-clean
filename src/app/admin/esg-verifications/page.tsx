// File: src/app/admin/esg-verifications/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';

export default function ESGVerificationAdminPage() {
  const supabase = createClientComponentClient();
  const session = useSession();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('esg_verifications').select('*');
      if (!error) setRequests(data);
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('esg_verifications')
      .update({ status })
      .eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending ESG Verifications</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">User Email</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Details</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td className="px-4 py-2 border">{r.user_email}</td>
              <td className="px-4 py-2 border">{r.verification_category}</td>
              <td className="px-4 py-2 border">{r.details}</td>
              <td className="px-4 py-2 border">{r.status}</td>
              <td className="px-4 py-2 border space-x-2">
                <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => updateStatus(r.id, 'approved')}>Approve</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
