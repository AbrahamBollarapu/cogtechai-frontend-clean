'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function AuthCallbackPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">🔄 Verifying login... Please wait...</p>
      </div>
    </div>
  );
}
