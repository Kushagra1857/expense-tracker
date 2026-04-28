import { useState, useEffect } from 'react';
import { checkHealth } from '../api/expensesApi';

export const useServerStatus = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 12; // 12 × 5s = 60s max wait
    let timeoutId;

    const poll = async () => {
      try {
        const res = await checkHealth();
        if (res.data.status === 'ok') { setStatus('awake'); return; }
      } catch {
        // server not ready yet
      }

      attempts++;
      if (attempts === 1) setStatus('waking');
      if (attempts >= MAX_ATTEMPTS) { setStatus('error'); return; }
      timeoutId = setTimeout(poll, 5000);
    };

    poll();

    return () => clearTimeout(timeoutId);
  }, []);

  return status;
};
