import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import AppRouter from './routes/AppRouter';

export default function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <AppRouter />;
}