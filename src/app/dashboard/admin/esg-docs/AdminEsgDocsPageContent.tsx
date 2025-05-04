'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { unparse } from 'papaparse';

export function AdminEsgDocsPageContent() {
  const supabase = createClientComponentClient();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);

    const { data: docsData, error: docsError } = await supabase
      .from('esg_docs')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (docsError) {
      toast.error('Failed to fetch documents');
      setLoading(false);
      return;
    }

    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email');

    if (usersError) {
      toast.error('Failed to fetch user emails');
      setLoading(false);
      return;
    }

    const emailMap: Record<string, string> = {};
    usersData?.forEach((user) => {
      emailMap[user.id] = user.email;
    });

    const enrichedDocs = docsData.map((doc) => ({
      ...doc,
      reviewer_email: emailMap[doc.reviewed_by] || null,
    }));

    setDocs(enrichedDocs);
    setLoading(false);
  };

  const handleNoteChange = (id: string, note: string) => {
    setNotesMap((prev) => ({ ...prev, [id]: note }));
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const notes = notesMap[id] || '';

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('esg_docs')
      .update({
        status,
        notes,
        reviewed_by: user?.id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) toast.error('Update failed');
    else {
      toast.success(`Marked as ${status}`);
      fetchDocs();
    }
  };

  const exportToCSV = () => {
    const exportData = filteredDocs.map((doc) => ({
      ID: doc.id,
      User: doc.user_id,
      Status: doc.status,
      Notes: doc.notes || '',
      'Reviewed By': doc.reviewer_email || doc.reviewed_by || '',
      'Reviewed At': doc.reviewed_at
        ? new Date(doc.reviewed_at).toLocaleString()
        : '',
      'Uploaded At': new Date(doc.uploaded_at).toLocaleString(),
      'File URL': doc.file_url,
    }));

    const csv = unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'esg_reviews.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDocs = filter === 'all' ? docs : docs.filter((doc) => doc.status === filter);

  const filters: { label: string; value: typeof filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">ESG Document Submissions</h2>

      {/* Filter Tabs + Export */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex gap-2">
          {filters.map(({ label, value }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={exportToCSV}>
          Export to CSV
        </Button>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <div className="grid gap-4">
          {filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              className="p-4 flex flex-col md:flex-row justify-between items-start gap-4"
            >
              <div className="flex-1">
                <p><strong>User:</strong> {doc.user_id}</p>
                <p><strong>Status:</strong> {doc.status}</p>
                <p><strong>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleString()}</p>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mt-2 inline-block"
                >
                  View Document
                </a>
                {doc.reviewer_email && (
                  <p className="text-sm text-gray-600 mt-2">
                    Reviewed by: <code>{doc.reviewer_email}</code>
                  </p>
                )}
                {doc.reviewed_at && (
                  <p className="text-sm text-gray-600">
                    Reviewed at: {new Date(doc.reviewed_at).toLocaleString()}
                  </p>
                )}
                <textarea
                  className="mt-2 w-full border rounded-md p-2 text-sm"
                  placeholder="Add reviewer comments (optional)..."
                  value={notesMap[doc.id] || ''}
                  onChange={(e) => handleNoteChange(doc.id, e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => updateStatus(doc.id, 'approved')}>
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => updateStatus(doc.id, 'rejected')}>
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
