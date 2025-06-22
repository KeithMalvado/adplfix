import React, { useState } from 'react';
import { Text, SafeAreaView, TouchableOpacity, TextInput, Alert, View, StyleSheet } from 'react-native';
import { ref, push, set } from 'firebase/database';
import { realtimeDb } from '../firebase/index';
import { themeColors } from '../../theme/theme';

export default function TambahArtikel({ navigation }) {
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState('');

  const handleAddArtikel = async () => {
    if (!judul || !isi) {
      Alert.alert('Warning', 'Judul dan isi artikel wajib diisi!');
      return;
    }

    const newArtikel = {
      judul,
      isi,
      gambar,
      createdAt: new Date().toISOString()
    };

    try {
      const artikelRef = ref(realtimeDb, 'artikel');
      const newArtikelRef = push(artikelRef);
      await set(newArtikelRef, newArtikel);

      Alert.alert('Sukses', 'Artikel berhasil ditambahkan!');
      setJudul('');
      setIsi('');
      setGambar('');
      if (navigation) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error adding artikel:', error);
      Alert.alert('Error', 'Gagal menambahkan artikel');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 40 }}>
        <Text style={styles.title}>Tambah Artikel</Text>
        <TextInput
          style={styles.input}
          placeholder="Judul Artikel"
          value={judul}
          onChangeText={setJudul}
        />
        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="Isi Artikel"
          multiline
          value={isi}
          onChangeText={setIsi}
        />
        <TextInput
          style={styles.input}
          placeholder="URL Gambar (opsional)"
          value={gambar}
          onChangeText={setGambar}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddArtikel}>
          <Text style={styles.buttonText}>Tambah Artikel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    padding: 16,
    backgroundColor: themeColors.secondary,
    color: themeColors.textSecondary,
    borderRadius: 16,
    marginBottom: 14,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: themeColors.button,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});
