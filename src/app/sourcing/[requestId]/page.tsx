'use client';

import { useParams } from 'next/navigation';

export default function SourcingPage() {
  const params = useParams();
  const requestId = params?.requestId as string | undefined; // ✅ safe extraction

  if (!requestId) {
    return (
      <div className="p-6 text-red-600">
        ❌ Invalid Request ID
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sourcing Request Details</h1>
      
      {/* ✅ Replace this with your real fetching and rendering */}
      <p>Loading details for request ID: <strong>{requestId}</strong></p>
    </div>
  );
}
