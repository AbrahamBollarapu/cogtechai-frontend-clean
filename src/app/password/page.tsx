'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const correctPassword = 'CogTech@2025!Secure'; // ✅ Strong secret password (Changeable)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password === correctPassword) {
      sessionStorage.setItem('access_granted', 'true');
      router.push('/');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition">
      <form onSubmit={handleSubmit} className="p-8 bg-white dark:bg-gray-800 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Protected Access</h1>

        <input
          type="password"
          placeholder="Enter Access Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-4 py-2 rounded w-full mb-4 dark:bg-gray-700 dark:border-gray-600"
          required
        />

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
