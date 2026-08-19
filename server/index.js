const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// serve static public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Simple in-memory "server DB"
let serverItems = [];
let nextServerId = 1;

// GET server items (client can pull changes)
app.get('/api/items', (req, res) => {
  res.json({ items: serverItems });
});

// POST /api/sync
// Accepts { changes: [ { id, operation, tableName, payload } ] }
// Returns { applied: [ { queueId, success, serverId, updatedAt } ] }
app.post('/api/sync', (req, res) => {
  const { changes } = req.body || {};
  if (!Array.isArray(changes)) return res.status(400).json({ error: 'invalid payload' });

  const applied = changes.map(change => {
    try {
      if (change.operation === 'create' && change.tableName === 'items') {
        const payload = change.payload || {};
        const serverItem = {
          id: nextServerId++,
          title: payload.title,
          clientLocalId: payload.id, // keep mapping for demo
          updatedAt: new Date().toISOString()
        };
        serverItems.push(serverItem);
        return { queueId: change.id, success: true, serverId: serverItem.id, updatedAt: serverItem.updatedAt };
      }
      // For demo: treat unknown operations as failed
      return { queueId: change.id, success: false };
    } catch (err) {
      return { queueId: change.id, success: false };
    }
  });

  // simulate slight delay
  setTimeout(() => res.json({ applied }), 200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
