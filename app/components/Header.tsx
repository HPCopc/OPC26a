'use client';
// app/components/Header.tsx
// left right p-4/m-4
import Link from 'next/link';
// import Image from 'next/image';
// import HeaderClient from './HeaderClient';
// syntax for import the file in the same folder
//'@/app/types/navigation' → Looks in the app/types folder from root
//'../../types/navigation' → Goes up 2 levels, then into types folder

import { NavItem } from '../types/navigation';
import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Hub } from 'aws-amplify/utils'; // ✅ Add 
// Add this state at the top of the component alongside the others:



const utilityLeft: NavItem[] = [
  { label: 'HPC', href: 'https://www.hydrocarbonpublishing.com/', external: true },
  { label: 'OPC', href: '/' },
];

const utilityRight: NavItem[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const primaryNav: NavItem[] = [
  { label: 'News', href: '/news' },
  { label: 'Videos', href: '/videos' },
  { label: 'White Papers', href: '/white-papers' },
  { label: 'Resources', href: '/resources' },
  { label: 'Events', href: '/events' },
];

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await  getCurrentUser();
        const attrs = await fetchUserAttributes();
        setUserInfo({ 
          name: attrs.name || attrs.given_name || attrs.email?.split('@')[0], 
           email: attrs.email 
        });
       setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };
    checkUser();

    // ✅ Listen for login/logout events in real time
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn') {
        setIsLoggedIn(true);
        checkUser(); 
      }
      if (payload.event === 'signedOut') {
        setIsLoggedIn(false);
        setUserInfo(null); 
      }
    });

    // Add a click-outside handler in the same useEffect:
  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
     setDropdownOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);

// return cleanup:
return () => { unsubscribe(); document.removeEventListener('mousedown', handleClickOutside); };
  }, []);


  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };


  return (
    <header className="border-b border-black ">
      {/* Top utility bar */}
      <div className="bg-black text-white p-4  flex justify-between "
 role="navigation" aria-label="Utility">
    
         <ul className="flex flex-row gap-0  list-none text-sm ">
          {utilityLeft.map((item) => (
            <li key={item.label}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"                 
                >
                  {item.label}
                </a>
              ) : (
                <Link href={item.href!} >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <ul className="flex flex-row gap-0  list-none text-sm">
          {utilityRight.map((item) => (
            <li key={item.label}>
              <Link href={item.href!} >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
       
      </div>

      {/* Main bar */}
      <div className="flex flex-row justify-between   " >
       <div className="flex flex-row items-center  "> 
         
        <Link href="/"><img src="/opcdrop.png"></img> </Link>
        

        <div>
          <h1 className="text-6xl md:text-5xl font-bold text-gray-900 mb-4">Opportunity Crudes</h1>
          <p>in Changing Times</p>
          <p className="text-xs md:text-base italic text-gray-600 max-w-3xl mx-auto">Knowledge to Meet Crude Trilemma: Supply, Affordability & Low Carbon Intensity</p>
        </div>

         
          <ul className="flex flex-row items-center">
            {primaryNav
              .filter(item => !item.children)  
              .map((item) => (
               <li key={item.label}    >
               <Link href={item.href || '#'}  >
                {item.label}
               </Link>
               </li>
              ))}
          </ul>
         
        
        </div>

         
 
        <div className="flex items-center p-4">
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              {/* Initials avatar */}
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
              {userInfo?.name?.slice(0, 2).toUpperCase() || 'ME'}
              </span>
              <span className="hidden md:block">{userInfo?.name ?? 'Account'}</span>
                <svg className="w-3 h-3 opacity-60" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {/* User info header */}
               <div className="px-4 py-3 border-b border-gray-100">
               <p className="text-sm font-medium text-gray-900 truncate">{userInfo?.name}</p>
               <p className="text-xs text-gray-500 truncate">{userInfo?.email}</p>
              </div>

            {/* Update Profile */}
              <Link href="/profile" onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"  >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Update profile
              </Link>

            {/* Sign Out */}
            <button onClick={() => { setDropdownOpen(false); handleSignOut(); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left" >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-4-4-4M14 7H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </button>
            </div>
      )}
            </div>
          ) : (
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
          )}
        </div>
      
      </div>


    </header>

  );
}
