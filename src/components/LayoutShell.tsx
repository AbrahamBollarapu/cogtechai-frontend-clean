// File: /src/components/LayoutShell.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SunIcon, MoonIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { label: '🏠 Dashboard', href: '/dashboard' },
    { label: '📦 Post Needs', href: '/dashboard/sourcing' },
    { label: '🗂️ My Needs', href: '/dashboard/sourcing/list' },
    { label: '🌍 Public Sourcing', href: '/sourcing' },
    { label: '📤 ESG Upload', href: '/dashboard/esg/upload' },
    { label: '📁 ESG Docs', href: '/dashboard/esg/documents' },
    { label: '🔧 Admin', href: '/dashboard/admin' },
  ];

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <body className="bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className={`fixed md:static top-0 z-40 h-full bg-white dark:bg-gray-800 shadow-md p-4 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64`}>
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold text-indigo-600">CogTechAI</h2>
              <button onClick={toggleSidebar}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded ${
                    pathname === item.href
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-600 dark:text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6">
              <button onClick={toggleDarkMode} className="flex items-center space-x-2 text-sm px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded">
                {darkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 ml-0 md:ml-64 p-6">
            {/* Mobile Top Bar */}
            <div className="md:hidden mb-4 flex items-center justify-between">
              <h1 className="font-bold text-lg text-indigo-600">CogTechAI</h1>
              <button onClick={toggleSidebar}>
                <Bars3Icon className="w-6 h-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
