import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('offline.db');

export function initDB() {
  db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, updatedAt TEXT, synced INTEGER, serverId INTEGER);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS syncQueue (id INTEGER PRIMARY KEY AUTOINCREMENT, operation TEXT, tableName TEXT, payload TEXT, createdAt TEXT);');
  }, (err) => console.error('initDB tx error', err));
}

export function createItemLocally(title) {
  const now = new Date().toISOString();
  const payload = JSON.stringify({ title, updatedAt: now });
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO items (title, updatedAt, synced) VALUES (?, ?, 0);', [title, now],
        (_, result) => {
          const localId = result.insertId;
          tx.executeSql('INSERT INTO syncQueue (operation, tableName, payload, createdAt) VALUES (?, ?, ?, ?);', ['create', 'items', JSON.stringify({ id: localId, title, updatedAt: now }), now],
            () => resolve(localId),
            (_, err) => reject(err)
          );
        },
        (_, err) => reject(err)
      );
    });
  });
}

export function getItems() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM items ORDER BY id DESC;', [], (_, { rows }) => resolve(rows._array), (_, err) => reject(err));
    }, (err) => reject(err));
  });
}

// helper to remove queue item
export function removeQueueItem(queueId) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM syncQueue WHERE id = ?;', [queueId], () => resolve(), (_, err) => reject(err));
    });
  });
}

export function markItemSynced(localId, serverId, updatedAt) {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('UPDATE items SET synced = 1, serverId = ?, updatedAt = ? WHERE id = ?;', [serverId, updatedAt, localId], () => resolve(), (_, err) => reject(err));
    });
  });
}

export function getSyncQueue() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM syncQueue ORDER BY id ASC;', [], (_, { rows }) => resolve(rows._array), (_, err) => reject(err));
    });
  });
}
