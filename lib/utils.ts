import { useState } from 'react';

export function useMessage() {
  const [message, setMessage] = useState('');

  function showMessage(msg: string) {
    setMessage(msg);
    if (msg.startsWith('✅')) {
      setTimeout(() => setMessage(''), 4000);
    }
  }

  return { message, showMessage };
}