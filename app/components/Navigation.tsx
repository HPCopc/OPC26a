// app/components/Navigation.tsx with dropdown
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

export default function Navigation() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const attributes = await fetchUserAttributes();
      setUserName(attributes.given_name || attributes.email?.split('@')[0] || 'User');
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">OPC</h1>
          <span className="text-gray-600">Opportunity Crudes</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/news" className="text-gray-700 hover:text-blue-600">
            News
          </Link>
          <Link href="/videos" className="text-gray-700 hover:text-blue-600">
            Videos
          </Link>
          <Link href="/white-papers" className="text-gray-700 hover:text-blue-600">
            White Papers
          </Link>
          <Link href="/resources" className="text-gray-700 hover:text-blue-600">
            Resources
          </Link>
          <Link href="/events" className="text-gray-700 hover:text-blue-600">
            Events
          </Link>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <span className="text-gray-700">{userName}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                <Link
                  href="/profile/edit"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}