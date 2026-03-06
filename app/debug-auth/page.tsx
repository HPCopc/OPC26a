// app/debug-auth/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { signIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import outputs from '@/amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs, { ssr: true });

export default function DebugAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cookieDebug, setCookieDebug] = useState<any>(null);

  const addLog = (message: string, data?: any) => {
    const logMsg = `${new Date().toLocaleTimeString()}: ${message}` + (data ? `\n${JSON.stringify(data, null, 2)}` : '');
    setLogs(prev => [...prev, logMsg]);
    console.log(message, data || '');
  };

  // Check cookie storage configuration
  useEffect(() => {
    addLog('🔧 Checking cookie configuration...');
    try {
      // Log current cookie settings
      const cookieStorage = (cognitoUserPoolsTokenProvider as any).keyValueStorage;
      addLog('Cookie storage provider configured');
    } catch (error) {
      addLog('❌ Error checking cookie config:', error);
    }
    
    checkUser();
    
    // Listen to all auth events
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      addLog(`🔔 HUB EVENT: ${payload.event}`, payload.data);
    });

    return () => unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      addLog('🔍 Checking current user...');
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      addLog(`✅ User found: ${currentUser.username}`);
      
      // Check session tokens
      const session = await fetchAuthSession();
      addLog('Session tokens present:', {
        accessToken: !!session.tokens?.accessToken,
        idToken: !!session.tokens?.idToken,
        refreshToken: !!session.tokens?.refreshToken
      });
    } catch (error) {
      addLog(`❌ No user found: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const diagnoseCookies = () => {
    addLog('🍪 COOKIE DIAGNOSTIC ==========');
    
    // Method 1: Check document.cookie
    const allCookies = document.cookie;
    addLog('document.cookie:', allCookies || '(empty)');
    
    // Method 2: Check for specific patterns
    const cookies = allCookies.split(';').map(c => c.trim());
    const amplifyCookies = cookies.filter(c => 
      c.includes('Cognito') || 
      c.includes('amplify') || 
      c.includes('AWS')
    );
    
    if (amplifyCookies.length > 0) {
      addLog('✅ Found Amplify cookies:', amplifyCookies);
    } else {
      addLog('❌ NO AMPLIFY COOKIES FOUND');
    }
    
    // Method 3: Check localStorage (some auth data might be there)
    try {
      const localStorageData = { ...localStorage };
      const amplifyStorage = Object.keys(localStorageData)
        .filter(key => key.includes('Cognito') || key.includes('amplify'))
        .reduce((obj, key) => {
          obj[key] = '(present)';
          return obj;
        }, {} as any);
      
      if (Object.keys(amplifyStorage).length > 0) {
        addLog('📦 Found Amplify localStorage:', amplifyStorage);
      }
    } catch (e) {
      addLog('⚠️ Could not read localStorage');
    }
    
    // Method 4: Check if cookies are enabled
    addLog('Cookies enabled:', navigator.cookieEnabled ? '✅ YES' : '❌ NO');
    
    addLog('🍪 END COOKIE DIAGNOSTIC ======');
  };

  // In your debug page, replace the handleSignIn function:

const handleSignIn = async () => {
  try {
    addLog(`🔐 STEP 1: Starting sign in for: ${username}`);
    
    // Store pre-signin cookies for comparison
    const beforeCookies = document.cookie;
    addLog('Cookies before:', beforeCookies || '(none)');
    
    const result = await signIn({
      username,
      password,
    });
    
    addLog(`✅ STEP 2: Cognito authentication successful`);
    addLog(`Next step: ${result.nextStep?.signInStep}`);
    
    // Check if result contains tokens
    addLog('SignIn result:', result);
    
    // Check cookies immediately after
    setTimeout(() => {
      const afterCookies = document.cookie;
      addLog('Cookies after (immediate):', afterCookies || '(none)');
      
      // Check for specific token patterns
      const newCookies = afterCookies.split(';').map(c => c.trim());
      const tokenCookies = newCookies.filter(c => 
        c.includes('accessToken') || 
        c.includes('idToken') || 
        c.includes('refreshToken')
      );
      
      if (tokenCookies.length > 0) {
        addLog('✅ Token cookies found!', tokenCookies);
      } else {
        addLog('❌ No token cookies yet');
      }
    }, 500);
    
    // Try to get session after a short delay
    setTimeout(async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        addLog(`✅ User session retrieved after delay`);
      } catch (error) {
        addLog(`❌ Still cannot get session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 1000);
    
  } catch (error) {
    addLog(`❌ SIGN IN FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  const handleSignOut = async () => {
    try {
      await signOut();
      addLog('✅ Signed out');
      setUser(null);
      diagnoseCookies();
    } catch (error) {
      addLog(`❌ Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearAllData = () => {
    // Clear all Amplify-related data
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('Cognito') || key.includes('amplify')) {
        localStorage.removeItem(key);
      }
    });
    
    addLog('🧹 Cleared all Amplify data');
    diagnoseCookies();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Amplify Auth Deep Debugger</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Current User:</h2>
        <pre className="bg-white p-3 rounded border">
          {user ? JSON.stringify(user, null, 2) : 'No user signed in'}
        </pre>
      </div>

      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-4">Test Login:</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username/Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-2 flex-wrap">
            <button 
              onClick={handleSignIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sign In (Debug)
            </button>
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
            <button 
              onClick={diagnoseCookies}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Diagnose Cookies
            </button>
            <button 
              onClick={clearAllData}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Clear All Data
            </button>
            <button 
              onClick={checkUser}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Check User
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-black text-green-400 rounded font-mono text-sm h-96 overflow-y-auto">
        <h3 className="text-white mb-2">📋 Debug Logs (showing step-by-step):</h3>
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap border-b border-gray-700 pb-1 mb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}