// File: /src/app/dashboard/esg/documents/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ESGDocumentsPage() {
  const session = useSession();
  const supabase = createClientComponentClient();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from('esg_uploads')
        .select('*')
        .eq('user_email', session.user.email)
        .order('created_at', { ascending: false });

      if (data) setDocuments(data);
      setLoading(false);
    };

    fetchDocs();
  }, [session]);

  if (!session) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-xl font-bold">Please log in to view documents.</h2>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📄 ESG Documents</h1>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-4">
          {documents.map((doc) => (
            <li key={doc.id} className="border p-4 rounded bg-white shadow">
              <p><strong>Uploaded:</strong> {new Date(doc.created_at).toLocaleString()}</p>
              <p>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Document
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
