import { useEffect, useState } from 'react';

export function useHealthData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  return { loading, error, refreshInsight: () => {} };
}