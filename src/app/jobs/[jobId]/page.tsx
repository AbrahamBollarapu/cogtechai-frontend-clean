'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.jobId as string | undefined;  // Safe typing

  const [range, setRange] = useState<{
    lowerBound: number;
    median: number;
    upperBound: number;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    if (!jobId) return;

    // ⚡ Replace with actual job category if you have dynamic data
    const category = "engineering";  

    fetch('/api/ai/price-trend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobCategory: category }),
    })
      .then((res) => res.json())
      .then((data) => setRange(data))
      .catch(console.error);
  }, [jobId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Job Details</h1>

      {/* Your existing job details would go here */}

      {range && (
        <div className="mt-6 p-4 bg-gray-50 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">📈 Pricing Insights</h2>
          <p>
            Typical bids: <strong>${range.lowerBound}</strong> –{' '}
            <strong>${range.upperBound}</strong> (Median:{' '}
            <strong>${range.median}</strong>)
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Confidence: <strong>{Math.round(range.confidence * 100)}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}
