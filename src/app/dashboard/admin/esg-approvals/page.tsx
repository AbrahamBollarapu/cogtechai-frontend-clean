// File: /src/app/dashboard/admin/esg-approvals/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';

interface ESGUpload {
  id: number;
  user_email: string;
  file_url: string;
  approved: boolean;
  created_at: string;
}

export default function ESGApprovalsPage() {
  const session = useSession();
  const supabase = createClientComponentClient();

  const [uploads, setUploads] = useState<ESGUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUploads = async () => {
      const { data, error } = await supabase
        .from('esg_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setUploads(data);
      setLoading(false);
    };

    fetchUploads();
  }, []);

  const handleApprove = async (id: number) => {
    const { error } = await supabase
      .from('esg_uploads')
      .update({ approved: true })
      .eq('id', id);

    if (!error) {
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, approved: true } : u))
      );
    }
  };

  if (!session || session.user.email !== 'admin@cogtechai.com') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold text-red-600">🚫 Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">📄 ESG Document Approvals</h1>
      {loading ? (
        <p>Loading...</p>
      ) : uploads.length === 0 ? (
        <p>No uploads found.</p>
      ) : (
        <div className="space-y-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="border p-4 rounded shadow">
              <p className="text-sm">📧 {upload.user_email}</p>
              <a
                href={upload.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Document
              </a>
              <p className="text-sm">🕒 {new Date(upload.created_at).toLocaleString()}</p>
              <p className="text-sm">
                ✅ Approved:{' '}
                <span className={upload.approved ? 'text-green-600' : 'text-red-600'}>
                  {upload.approved ? 'Yes' : 'No'}
                </span>
              </p>
              {!upload.approved && (
                <button
                  onClick={() => handleApprove(upload.id)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
                >
                  Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
