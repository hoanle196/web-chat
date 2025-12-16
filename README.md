# Frontend - Chat Mobile App

Next.js PWA với Socket.IO và Firebase Cloud Messaging.

## 🚀 Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local với API URL và Firebase config
npm run dev
```

## 📱 PWA Features

- ✅ Installable như mobile app
- ✅ Offline support (Service Worker)
- ✅ Push notifications (FCM)
- ✅ Responsive mobile UI

## 🔥 Firebase Setup

1. Tạo Firebase project tại https://console.firebase.google.com
2. Enable Cloud Messaging
3. Copy config vào `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
4. Generate VAPID key và thêm vào `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

## 📦 Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server

## 🎨 Features

- Login/Register
- Chat list
- Realtime chat với WebSocket
- Push notifications
- Mobile-first UI


