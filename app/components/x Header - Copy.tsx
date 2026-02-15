'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  return (
<header >
   
    
    {/* Left: Logo + Brand */}
    
      <Image
        src="/opcdrop.png"
        alt="Opportunity Crudes & Global Shale Plays"
        width={100}
        height={50}
        priority
      />
      <h1 >Header-OPC</h1> 
    

    {/* Center: Navigation */}
     
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/services">Services</a>
        <a href="/contact">Contact</a>
      </nav>
     

    {/* Right: Auth */}
    
       
        <button className="login-btn">Login</button>
        <button className="signup-btn">Sign Up</button>
       
    
    
  
</header>
  );
}

