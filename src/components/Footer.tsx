'use client';

export default function Footer() {
  return (
    <footer className="w-full text-center py-6 mt-12 text-gray-500 dark:text-gray-400 text-sm">
      © {new Date().getFullYear()} CogTechAI — All rights reserved.
    </footer>
  );
}
