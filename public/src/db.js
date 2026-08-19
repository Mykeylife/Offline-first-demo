// Dexie wrapper for IndexedDB (client-side storage + sync queue)
import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.3/dist/dexie.mjs';

export const db = new Dexie('offlineFirstDemo');
db.version(1).stores({
  items: '++id, title, updatedAt, synced',
  syncQueue: '++id, operation, tableName, createdAt'
});

export async function createItemLocally(title) {
  const now = new Date().toISOString();
  // store item in items table
  const localId = await db.items.add({ title, updatedAt: now, synced: 0 });
  // add to sync queue
  await db.syncQueue.add({
    operation: 'create',
    tableName: 'items',
    payload: { id: localId, title, updatedAt: now },
    createdAt: now
  });
  return localId;
}

export function getAllItems() {
  return db.items.toArray();
}

export async function markItemSynced(localId, serverId, updatedAt) {
  await db.items.update(localId, { synced: 1, updatedAt, serverId });
}

export async function getSyncQueue() {
  return db.syncQueue.orderBy('id').toArray();
}

export async function removeSyncQueueItem(queueId) {
  return db.syncQueue.delete(queueId);
}
