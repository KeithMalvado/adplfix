import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, } from 'react-native';
import { ref, update, get, child } from 'firebase/database';
import { realtimeDb } from '../firebase/index';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function EditArtikel() {
  const navigation = useNavigation();
  const route = useRoute();
  const { artikel } = route.params;

  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [gambar, setGambar] = useState('');

  useEffect(() => {
    if (artikel) {
      setJudul(artikel.judul || '');
      setIsi(artikel.isi || '');
      setGambar(artikel.gambar || '');
    }
  }, [artikel]);

  const handleUpdate = async () => {
    if (!judul.trim() || !isi.trim()) {
      Alert.alert('Error', 'lengkapi semua data');
      return;
    }

    try {
      const artikelRef = ref(realtimeDb, `artikel/${artikel.id}`);

      await update(artikelRef, {
        judul: judul.trim(),
        isi: isi.trim(),
        gambar: gambar.trim() || null,
      });

      Alert.alert('Sukses', 'Artikel berhasil diperbarui');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Gagal memperbarui artikel');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Judul Artikel</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan judul artikel"
          value={judul}
          onChangeText={setJudul}
        />

        <Text style={styles.label}>Isi Artikel</Text>
        <TextInput
          style={[styles.input, { height: 150, textAlignVertical: 'top' }]}
          placeholder="Masukkan isi artikel"
          multiline
          value={isi}
          onChangeText={setIsi}
        />

        <Text style={styles.label}>URL Gambar (opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan URL gambar"
          value={gambar}
          onChangeText={setGambar}
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Perbarui Artikel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff8e1',
    flexGrow: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    color: '#000',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ffb300',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
