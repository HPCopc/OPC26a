"use client";

import { useState } from 'react';

// Add these interface definitions
interface UserAttribute {
  Name: string;
  Value: string;
}

interface UserData {
  Username: string;
  UserAttributes: UserAttribute[];
  UserCreateDate?: string;
  UserLastModifiedDate?: string;
  Enabled?: boolean;
  UserStatus?: string;
}

export default function AdminUsersPage() {
  const [username, setUsername] = useState('');
  // ✅ Properly type the state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    if (!username.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user');
      }
      
      setUserData(data);
    } catch (err: any) {
      setError(err.message);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin User Management</h1>
      
      <div className="mb-4">
        <input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchUser()}
          placeholder="Enter username"
          className="border p-2 mr-2 rounded"
        />
        <button 
          onClick={fetchUser}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search User'}
        </button>
      </div>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}
      
      {userData && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">User Attributes for: {userData.Username}</h3>
          <pre className="bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(userData.UserAttributes, null, 2)}
          </pre>
          
          {/* Optional: Display user status */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Status: {userData.Enabled ? '✅ Enabled' : '❌ Disabled'}</p>
            <p>User Status: {userData.UserStatus || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
}