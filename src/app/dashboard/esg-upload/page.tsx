// File: /src/app/dashboard/esg-upload/page.tsx
'use client';

import { useSession } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function ESGUploadPage() {
  const session = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file || !session?.user?.email) {
      setMessage('Please select a file and ensure you are logged in.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', session.user.email);

    setUploading(true);
    const res = await fetch('/api/esg/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setUploading(false);
    setMessage(result?.error ? 'Upload failed.' : '✅ File uploaded successfully!');
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">📄 ESG Document Upload</h1>

      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {uploading ? 'Uploading...' : 'Upload ESG Document'}
      </button>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
