# Offline-First Mobile Demo (Expo)

This folder contains a minimal Expo app that demonstrates an offline-first pattern using SQLite (expo-sqlite) and a local change queue.

Important:
- Set SYNC_SERVER_URL in mobile/App.js to your development machine IP (e.g. http://192.168.1.5:3000) so a device or emulator on your LAN can reach the mock server in this repo.

Run the mobile demo:
1. Install Expo CLI: npm install -g expo-cli
2. From the mobile/ folder install dependencies: npm install
3. Start the project: npm start
4. Open in Expo Go on a device or emulator.

Notes:
- This demo uses a simple queue stored in SQLite and NetInfo to detect connectivity. For production, implement background sync and secure storage for auth tokens.
