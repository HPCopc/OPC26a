// 'use client';   ✅ Add this if you want to be safe

 import { View, Flex, Text } from "@aws-amplify/ui-react";

export default function Footer() {
  return (
    <div className="flex flex-row
     items-center justify-center p-4 bg-gray-100">
      <div className="mb-2">
        <p className="text-gray-600">Topics more services</p>
      </div>

      <div className="mt-2">
        <p className="text-sm text-gray-500">© 2024 Your Company</p>
      </div>
    </div>
  );
}