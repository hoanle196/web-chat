'use client';

import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm';
import ChatList from '@/components/ChatList';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <ChatList />;
}
