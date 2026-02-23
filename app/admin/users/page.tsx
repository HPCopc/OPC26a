"use client";

import { useState } from 'react';

export default function AdminUsersPage() {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);

  const fetchUser = async () => {
    const response = await fetch(`/api/admin/users/${username}`);
    const data = await response.json();
    setUserData(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin User Management</h1>
      <div className="mb-4">
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="border p-2 mr-2"
        />
        <button 
          onClick={fetchUser}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search User
        </button>
      </div>
      
      {userData && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">User Attributes:</h3>
          <pre>{JSON.stringify(userData.UserAttributes, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}