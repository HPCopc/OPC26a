"use client";

import { useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface UserAttributes {
  Name: string;
  Value: string;
}

interface UserData {
  Username: string;
  UserAttributes: UserAttributes[];
  UserCreateDate?: string;
  UserLastModifiedDate?: string;
  Enabled?: boolean;
  UserStatus?: string;
}

export default function AdminPage() {
  const { user } = useAuthenticator();
  const [username, setUsername] = useState('');
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

  // Helper to get specific attribute
  const getAttribute = (attrName: string) => {
    return userData?.UserAttributes?.find(attr => attr.Name === attrName)?.Value || 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Logged in as: <span className="font-semibold">{user?.signInDetails?.loginId}</span>
        </p>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">User Search</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUser()}
              placeholder="Enter username (email or sub)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={fetchUser}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-600 text-sm">{error}</p>
          )}
        </div>

        {/* Results Section */}
        {userData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">User Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">Username</span>
                <p className="font-medium">{userData.Username}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-sm text-gray-600">Status</span>
                <p className="font-medium">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    userData.Enabled ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {userData.UserStatus || (userData.Enabled ? 'ENABLED' : 'DISABLED')}
                </p>
              </div>
            </div>

            <h3 className="font-semibold mb-3">Attributes</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Attribute</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {userData.UserAttributes?.map((attr, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 font-mono text-sm text-gray-600">{attr.Name}</td>
                      <td className="py-2 px-4">{attr.Value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Raw JSON for debugging (optional) */}
            <details className="mt-6">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                View Raw JSON
              </summary>
              <pre className="mt-3 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}