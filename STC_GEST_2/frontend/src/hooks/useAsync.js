import { useCallback, useState } from 'react';

export function useAsync(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError('');
      try {
        return await asyncFn(...args);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Une erreur est survenue');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { execute, loading, error, setError };
}
