'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { chatApi, usersApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface Room {
  id: number;
  userId1: number;
  userId2: number;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  name: string;
  avatar?: string;
}

export default function ChatList() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roomsData, usersData] = await Promise.all([
        chatApi.getRooms(),
        usersApi.getAllUsers(),
      ]);
      setRooms(roomsData);
      setUsers(usersData.filter((u: User) => u.id !== user?.id));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (userId: number) => {
    try {
      const room = await chatApi.createRoom(userId);
      router.push(`/chat/${room.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        padding: '16px',
        backgroundColor: '#0070f3',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Chat</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px' }}>{user?.name}</span>
          <button
            onClick={logout}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Danh sách người dùng</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => handleCreateRoom(u.id)}
              style={{
                padding: '12px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#0070f3',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '600',
              }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>{u.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>@{u.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


