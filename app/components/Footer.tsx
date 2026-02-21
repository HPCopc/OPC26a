// 'use client';   ✅ Add this if you want to be safe
// left and right padding p-4/m-4

 import { View, Flex, Text } from "@aws-amplify/ui-react";
 import Link from 'next/link';
 import NavItem from '../types/navigation';
 
   const footerleft: NavItem[] = [
    { label: 'Home', href: '/about' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Advertise', href: '/about' },
  ];

     const Topics: NavItem[] = [
    { label: 'Markets', href: '/about' },
    { label: 'Technology', href: '/about' },
    { label: 'Crude Processing Studies', href: '/CRstudies' },
    { label: 'Shale Oil', href: '/ShaleOil' },
    { label: 'Opportunity Crudes', href: '/' },
  ];

    const More: NavItem[] = [
    { label: 'Videos', href: '/Videos' },
    { label: 'White Papers', href: '/WhitePapers' },
    { label: 'Resources', href: '/Resources' },
    { label: 'Events', href: '/Events' },
    { label: 'Terms & Conditions', href: '/Terms' },
  ];

    const Services: NavItem[] = [
    { label: 'Advertise with OpportunityCrudes.com', href: '/Advertise' },
    { label: 'Register with OpportunityCrudes.com', href: '/Register' },
  ];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="flex flex-col ">
      {/* First container - Gray background with Topics */}
      <div className="flex flex-row justify-between bg-gray-100  text-center p-4">
        <div>
          <h1>Topics</h1>
            <ul  className="flex flex-col items-start  ">
            {Topics
              .filter(item => !item.children)  
              .map((item) => (
               <li key={item.label} className="my-0 py-0"  >
               <Link href={item.href || '#'}  >
                {item.label}
               </Link>
               </li>
              ))}
          </ul>
        </div>
        <div>
          <h2>More</h2>
          <ul  className="flex flex-col items-start my-0 py-0 ">
            {More
              .filter(item => !item.children)  
              .map((item) => (
               <li key={item.label} className="my-0 py-0"  >
               <Link href={item.href || '#'}  >
                {item.label}
               </Link>
               </li>
              ))}
          </ul>
          </div>
        <div>
         <h1>Services</h1>
         <ul  className="flex flex-col items-start  ">
            {Services
              .filter(item => !item.children)  
              .map((item) => (
               <li key={item.label} className="my-0 py-0"  >
               <Link href={item.href || '#'}  >
                {item.label}
               </Link>
               </li>
              ))}
          </ul>          
          </div>
      </div>
  


      {/* Second container - Black background with Copyright */}
       <div className="flex flex-row justify-between items-center bg-black text-white p-4 ">
           
          <ul  className="flex space-x-4 ">
            {footerleft
              .filter(item => !item.children)  
              .map((item) => (
               <li key={item.label}    >
               <Link href={item.href || '#'}  >
                {item.label}
               </Link>
               </li>
              ))}
          </ul>
           
            <p className="text-sm text-white m-4">© {currentYear} OpportunityCrudes.com</p>
          
        </div>
        
      
    </div>
  );
}