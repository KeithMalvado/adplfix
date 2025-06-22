import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../firebase/index';
import { useNavigation } from '@react-navigation/native';

export default function ReadArtikel() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const artikelRef = ref(realtimeDb, 'artikel');
    const unsubscribe = onValue(artikelRef, snapshot => {
      const val = snapshot.val() || {};
      const arr = Object.keys(val).map(key => ({ id: key, ...val[key] }));
      setData(arr);
      setFilteredData(arr);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = data.filter(item =>
      item.judul.toLowerCase().includes(query) ||
      item.isi.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  }, [searchQuery, data]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Cari artikel..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isLong = item.isi.length > 150;
          const preview = isLong
            ? item.isi.slice(0, 150) + '...'
            : item.isi;

          return (
            <View style={styles.card}>
              {item.gambar && (
                <Image source={{ uri: item.gambar }} style={styles.image} />
              )}
              <Text style={styles.title}>{item.judul}</Text>
              <Text style={styles.content}>{preview}</Text>
              {isLong && (
                <TouchableOpacity onPress={() => navigation.navigate('DetailArtikel', { artikel: item })}>
                  <Text style={styles.readMore}>Baca Selengkapnya</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 16
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000'
  },
  content: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333'
  },
  readMore: {
    color: '#1e88e5',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8
  },
  date: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right'
  }
});
