// 'use client';   ✅ Add this if you want to be safe

 import { View, Flex, Text } from "@aws-amplify/ui-react";
 

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="flex flex-col">
      {/* First container - Gray background with Topics */}
      <div className="bg-gray-100 p-4 text-center">
        <p className="text-gray-600">Topics more services</p>
      </div>

      {/* Second container - Black background with Copyright */}
      <div className="bg-black text-white p-4 text-center ">
        <p className="text-sm text-white">© {currentYear} Your Company</p>
      </div>
    </div>
  );
}