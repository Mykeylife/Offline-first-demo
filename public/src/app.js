import { db, createItemLocally, getAllItems, getSyncQueue, removeSyncQueueItem, markItemSynced } from './db.js';

const statusEl = document.getElementById('status');
const itemsEl = document.getElementById('items');
const form = document.getElementById('itemForm');
const titleInput = document.getElementById('title');
const pullBtn = document.getElementById('pullBtn');

const SYNC_URL = '/api/sync';
const PULL_URL = '/api/items';

function updateOnlineStatus() {
  statusEl.textContent = navigator.onLine ? 'online' : 'offline';
  if (navigator.onLine) processQueue();
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

async function renderItems() {
  const items = await db.items.toArray();
  itemsEl.innerHTML = '';
  items.forEach(i => {
    const li = document.createElement('li');
    li.textContent = `${i.title} ${i.synced ? '(synced)' : '(local)'}`;
    if (i.synced) li.classList.add('synced');
    itemsEl.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await createItemLocally(title);
  titleInput.value = '';
  await renderItems();
  if (navigator.onLine) await processQueue();
});

pullBtn.addEventListener('click', async () => {
  try {
    const res = await fetch(PULL_URL);
    if (!res.ok) throw new Error('pull failed');
    const data = await res.json();
    // Basic: add server items locally if not present (demo)
    for (const s of data.items) {
      // if we already have item with serverId skip
      const exists = await db.items.where('serverId').equals(s.id).first();
      if (!exists) {
        await db.items.add({ title: s.title, updatedAt: s.updatedAt, synced: 1, serverId: s.id });
      }
    }
    await renderItems();
  } catch (err) {
    console.error('Pull error', err);
    alert('Failed to pull server items');
  }
});

async function processQueue() {
  const queue = await getSyncQueue();
  if (!queue.length) return;
  try {
    const payload = queue.map(q => ({ id: q.id, operation: q.operation, tableName: q.tableName, payload: q.payload }));
    const res = await fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes: payload })
    });
    if (!res.ok) throw new Error('sync failed: ' + res.status);
    const result = await res.json();
    for (const r of result.applied) {
      if (r.success) {
        // remove queue record
        await removeSyncQueueItem(r.queueId);
        // find matching local queued change to get local item id
        const matched = queue.find(q => q.id === r.queueId);
        if (matched && matched.payload && matched.payload.id) {
          await markItemSynced(matched.payload.id, r.serverId, r.updatedAt || matched.payload.updatedAt);
        }
      }
    }
    await renderItems();
  } catch (err) {
    console.error('Sync error:', err);
    // In production use exponential backoff and detailed retries
  }
}

// register service worker for offline app shell
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('SW registered');
  }).catch(err => console.warn('SW reg failed', err));
}

// initial render
renderItems();
