# Offline-First Web Demo

This repo contains a small offline-first web prototype that demonstrates:
- Client-side storage with IndexedDB (Dexie.js)
- A local change queue for offline writes
- A simple Node/Express mock sync server (/api/sync)
- A Service Worker that caches the app shell for offline loading

Run the web demo:
1. Install dependencies:
   npm install
2. Start the server:
   npm start
3. Open http://localhost:3000

Notes:
- The server uses an in-memory array as the server DB for demo purposes. Restarting the server clears server data.
- To simulate offline, use the browser devtools Network > Offline. Create items while offline, then go Online to sync.
