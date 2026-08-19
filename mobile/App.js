import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList } from 'react-native';
import { initDB, createItemLocally, getItems } from './mobile-db';
import { startNetworkWatcher, processQueue } from './mobile-sync';

const SYNC_SERVER_URL = 'http://YOUR_MACHINE_IP:3000'; // <- set this to your dev machine IP

export default function App() {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    initDB();
    refresh();
    startNetworkWatcher(SYNC_SERVER_URL, async () => {
      await processQueue(SYNC_SERVER_URL);
      refresh();
    });
  }, []);

  async function refresh() {
    const rows = await getItems();
    setItems(rows);
  }

  async function addItem() {
    if (!title.trim()) return;
    await createItemLocally(title.trim());
    setTitle('');
    await refresh();
    // try to sync immediately (best-effort)
    await processQueue(SYNC_SERVER_URL);
    await refresh();
  }

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>Offline-First Mobile</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Item title" style={styles.input} />
        <Button title="Add" onPress={addItem} />
      </View>
      <FlatList data={items} keyExtractor={(i) => String(i.id)} renderItem={({ item }) => (
        <View style={{ padding: 8 }}>
          <Text>{item.title} {item.synced ? '(synced)' : '(local)'}</Text>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, flex: 1, marginRight: 8, borderRadius: 4 }
});
