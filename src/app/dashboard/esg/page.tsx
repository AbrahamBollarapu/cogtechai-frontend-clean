// File: /app/dashboard/esg/page.tsx
"use client";
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSession } from '@supabase/auth-helpers-react';

export default function ESGFormPage() {
  const supabase = createClientComponentClient();
  const session = useSession();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { data, error } = await supabase.from("esg_verifications").insert({
      user_id: session?.user?.id,
      category,
      description,
      status: "pending"
    });
    if (!error) setSubmitted(true);
  };

  if (submitted) return <p className="p-4">✅ Verification request submitted!</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Request ESG Verification</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Category (e.g., Design, Materials)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 w-full"
          required
        />
        <textarea
          placeholder="Describe your ESG practice..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-3 py-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit Verification
        </button>
      </form>
    </div>
  );
}
