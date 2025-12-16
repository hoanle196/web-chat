'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { chatApi, usersApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface Message {
  id: number;
  userId: number;
  userName?: string;
  content: string;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = parseInt(params.roomId as string);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    loadMessages();
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_room', { roomId });
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const msgs = await chatApi.getMessages(roomId);
      setMessages(msgs.reverse());

      const rooms = await chatApi.getRooms();
      const currentRoom = rooms.find((r: any) => r.id === roomId);
      if (currentRoom) {
        const otherUserId =
          currentRoom.userId1 === user?.id ? currentRoom.userId2 : currentRoom.userId1;
        const allUsers = await usersApi.getAllUsers();
        const other = allUsers.find((u: any) => u.id === otherUserId);
        if (other) {
          setOtherUser({ id: other.id, name: other.name });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const connectSocket = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.emit('join_room', { roomId });

    socket.on('new_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on(
      'user_typing',
      (data: { userId: number; userName: string; isTyping: boolean }) => {
        if (data.userId !== user?.id) {
          setIsTyping(data.isTyping);
        }
      },
    );
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      roomId,
      content: inputMessage,
    });

    setInputMessage('');
    socketRef.current.emit('typing', { roomId, isTyping: false });
  };

  const handleTyping = (value: string) => {
    setInputMessage(value);
    if (socketRef.current) {
      socketRef.current.emit('typing', { roomId, isTyping: value.length > 0 });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '16px',
          backgroundColor: '#0070f3',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {otherUser?.name.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontWeight: '600' }}>{otherUser?.name || 'Loading...'}</div>
          {isTyping && (
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Đang gõ...</div>
          )}
        </div>
      </header>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          backgroundColor: '#f5f5f5',
        }}
      >
        {messages.map((msg) => {
          const isOwn = msg.userId === user?.id;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px',
                  backgroundColor: isOwn ? '#0070f3' : 'white',
                  color: isOwn ? 'white' : 'black',
                  borderRadius: '12px',
                  wordBreak: 'break-word',
                }}
              >
                {!isOwn && (
                  <div
                    style={{
                      fontSize: '12px',
                      marginBottom: '4px',
                      opacity: 0.8,
                    }}
                  >
                    {msg.userName || 'User'}
                  </div>
                )}
                <div>{msg.content}</div>
                <div
                  style={{
                    fontSize: '10px',
                    marginTop: '4px',
                    opacity: 0.7,
                    textAlign: 'right',
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: '12px',
          backgroundColor: 'white',
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          placeholder="Nhập tin nhắn..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '24px',
            fontSize: '16px',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            fontSize: '16px',
            cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
            opacity: inputMessage.trim() ? 1 : 0.5,
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}