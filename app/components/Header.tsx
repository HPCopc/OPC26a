// app/components/Header.tsx
// left right p-4/m-4
import Link from 'next/link';
// import Image from 'next/image';
// import HeaderClient from './HeaderClient';
// syntax for import the file in the same folder
//'@/app/types/navigation' → Looks in the app/types folder from root
//'../../types/navigation' → Goes up 2 levels, then into types folder

import { NavItem } from '../types/navigation';



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
        <Link href="/login" className="text-blue-600 font-semibold hover:underline ">Login</Link>
        </div>
         
      
      </div>


    </header>

  );
}
