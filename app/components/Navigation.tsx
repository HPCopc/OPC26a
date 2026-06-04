// app/components/Navigation.tsx with dropdown
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

export default function Navigation() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
  try {
    console.log('1. Starting loadUserInfo');
    
    const attributes = await fetchUserAttributes();
    console.log('2. Attributes:', attributes);
    
    const session = await fetchAuthSession();
    console.log('3. Session:', session);
    console.log('4. Tokens:', session.tokens);
    console.log('5. ID Token payload:', session.tokens?.accessToken?.payload);
    
    const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] ?? [];
    console.log('6. Groups:', groups);
    
    setUserName(attributes.given_name || attributes.email?.split('@')[0] || 'User');
    setIsAdmin(groups.includes('ADMINS'));
    
  } catch (error) {
    console.error('ERROR in loadUserInfo:', error);
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
          {/* 👇 Admin link — only visible to admins */}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md text-sm font-medium"
            >
              Admin
            </Link>
          )}


          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              {/* 👇 Optional: show a small badge if admin */}
              <span className="text-gray-700">{userName}</span>
              {isAdmin && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              )}
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
                {/* 👇 Admin dashboard link inside dropdown too */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-red-600 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}


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