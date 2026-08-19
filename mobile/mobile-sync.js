import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { getSyncQueue, removeQueueItem, markItemSynced } from './mobile-db';

let unsubscribe = null;

export function startNetworkWatcher(syncUrl, onOnlineCallback) {
  // Start listening to connectivity changes
  unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected) {
      if (onOnlineCallback) onOnlineCallback();
    }
  });
}

export async function processQueue(syncServerUrl) {
  const queue = await getSyncQueue();
  if (!queue.length) return;
  try {
    const payload = queue.map(q => ({ id: q.id, operation: q.operation, tableName: q.tableName, payload: JSON.parse(q.payload) }));
    const res = await axios.post((syncServerUrl || '') + '/api/sync', { changes: payload });
    const applied = res.data.applied || [];
    for (const r of applied) {
      if (r.success) {
        const matched = queue.find(q => q.id === r.queueId);
        if (matched && matched.payload) {
          const localId = matched.payload.id;
          await removeQueueItem(r.queueId);
          await markItemSynced(localId, r.serverId, r.updatedAt || new Date().toISOString());
        }
      }
    }
  } catch (err) {
    console.error('processQueue error', err);
    // retry later
  }
}
