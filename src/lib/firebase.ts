import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { usersApi } from './api';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseApp() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
  return getApps()[0];
}

export async function initFirebaseMessaging(platform: 'web' | 'android' | 'ios') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

  const token = await getToken(messaging as Messaging, {
    vapidKey: vapidKey,
  });

  if (token) {
    await usersApi.saveDeviceToken(token, platform);
  }

  onMessage(messaging, (payload) => {
    console.log('📨 FCM message received:', payload);
  });
}


