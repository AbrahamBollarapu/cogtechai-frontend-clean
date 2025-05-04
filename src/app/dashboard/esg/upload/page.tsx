'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ESGUploadPage() {
  const session = useSession();
  const supabase = createClientComponentClient();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      setLoading(false);
    };

    fetchSubscriptionStatus();
  }, [session, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadedUrl('');
      setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!file || !session?.user?.email) return;

    setUploading(true);
    setStatus('⏳ Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', session.user.email);

    const res = await fetch('/api/esg/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setStatus('✅ Upload successful!');
      setUploadedUrl(data.url);
    } else {
      setStatus(`❌ Upload failed: ${data.error}`);
    }

    setUploading(false);
  };

  if (!session) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-xl font-bold">Please log in to upload ESG documents.</h2>
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-gray-500">Checking subscription status...</div>;
  }

  if (!subscriptionActive) {
    return (
      <div className="p-6 text-yellow-700 bg-yellow-50 border border-yellow-300 rounded">
        <h2 className="text-xl font-semibold mb-2">⚠️ Subscription Required</h2>
        <p>Please subscribe to upload ESG documents.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-4">📤 ESG Verification Upload</h1>

      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="mb-4 border p-2 w-full rounded"
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>

      {status && <p className="mt-4 font-medium">{status}</p>}

      {uploadedUrl && (
        <p className="mt-2 text-sm">
          📄 View uploaded file:{' '}
          <a
            href={uploadedUrl}
            className="text-blue-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {uploadedUrl}
          </a>
        </p>
      )}
    </div>
  );
}
