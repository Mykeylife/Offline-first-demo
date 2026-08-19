# Offline-first demo (root)

This repository contains two demo projects that implement an offline-first pattern:

- Web: public/ (IndexedDB via Dexie, Service Worker, Node/Express mock sync server)
- Mobile: mobile/ (Expo, expo-sqlite, NetInfo)

Quick start (web):
1. npm install
2. npm start
3. Open http://localhost:3000

Quick start (mobile):
1. cd mobile
2. npm install
3. Set SYNC_SERVER_URL in mobile/App.js to your machine IP
4. npm start

If you want me to add a CI workflow, persistent server DB, or encrypt stored data, tell me and I will add those next.
