import { themeColors } from "../../theme/theme";
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Image, StyleSheet, ActivityIndicator,
  TextInput, TouchableOpacity, Alert
} from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { realtimeDb } from '../firebase/index';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ArtikelPetugas() {
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

  const handleDelete = (id) => {
    Alert.alert(
      'Konfirmasi',
      'Yakin ingin menghapus artikel ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          onPress: async () => {
            try {
              await remove(ref(realtimeDb, `artikel/${id}`));
              Alert.alert('Sukses', 'Artikel berhasil dihapus');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus artikel');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back to Home Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('HCpetugas')}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Artikel</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari artikel..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('TambahArtikel')}
      >
        <MaterialIcons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Tambah Artikel</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isLong = item.isi.length > 150;
          const preview = isLong ? item.isi.slice(0, 150) + '...' : item.isi;

          return (
            <View style={styles.card}>
              {item.gambar && (
                <Image source={{ uri: item.gambar }} style={styles.image} resizeMode="cover" />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.title}>{item.judul}</Text>
                <Text style={styles.content}>{preview}</Text>
                {isLong && (
                  <TouchableOpacity
                    style={styles.readMoreContainer}
                    onPress={() => navigation.navigate('DetailArtikel', { artikel: item })}
                  >
                    <Text style={styles.readMore}>Baca Selengkapnya</Text>
                    <MaterialIcons name="chevron-right" size={16} color={themeColors.primary} />
                  </TouchableOpacity>
                )}
                <View style={styles.cardFooter}>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate('EditArtikel', { artikel: item })}
                    >
                      <MaterialIcons name="edit" size={16} color="#fff" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      <MaterialIcons name="delete" size={16} color="#fff" />
                      <Text style={styles.actionText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
    marginBottom: 16,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 12,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  readMore: {
    color: themeColors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffb300',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
