import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, TouchableOpacity, TextInput, Alert, View, StyleSheet } from 'react-native';
import { ref, push } from 'firebase/database';
import { getFirestore, query, where, getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { realtimeDb } from '../firebase/index';
import { themeColors } from '../../theme/theme';

export default function TambahTelur() {
  const [namaTelur, setNamaTelur] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [hargaPerKg, setHargaPerKg] = useState('');
  const [stok, setStok] = useState('');
  const [kategori, setKategori] = useState('');
  const [userData, setUserData] = useState(null);

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchUserData = async () => {
        const q = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      };
      fetchUserData();
    }
  }, []);

  const handleHargaPerKgChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setHargaPerKg(numericValue);
  };

  const handleStokChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setStok(numericValue);
  };

  const handleAddTelur = async () => {
    if (!namaTelur || !deskripsi || !hargaPerKg || !stok || !kategori) {
      Alert.alert('Warning', 'Mohon lengkapi semua kolom!');
      return;
    }
    if (isNaN(parseInt(hargaPerKg)) || isNaN(parseInt(stok))) {
      Alert.alert('Warning', 'Harga dan stok harus berupa angka.');
      return;
    }
    const onlyDigits = /^\d+$/;
    if (onlyDigits.test(namaTelur)) {
      Alert.alert('Warning', 'Harap Isi Sesuai Format.');
      return;
    }
    if (onlyDigits.test(kategori)) {
      Alert.alert('Warning', 'Harap Isi Sesuai Format.');
      return;
    }

    const telurData = {
      namaTelur,
      deskripsi,
      hargaPerKg: parseInt(hargaPerKg),
      stok: parseInt(stok),
      kategori,
      userId: auth.currentUser.uid,
      createdAt: Date.now(),
      user: {
        address: userData?.address || '',
        email: userData?.email || '',
        ktp: userData?.ktp || '',
        name: userData?.name || '',
        phone: userData?.phone || '',
        username: userData?.name || '',
        userId: auth.currentUser.uid,
      },
      statusValidasi: 'menunggu',
    };

    try {
      const telurRef = ref(realtimeDb, 'produk');
      const newTelurRef = push(telurRef, telurData);
      const newTelurId = newTelurRef.key;

      Alert.alert('Success', `Telur berhasil ditambahkan dengan ID: ${newTelurId}`);
      setNamaTelur('');
      setDeskripsi('');
      setHargaPerKg('');
      setStok('');
      setKategori('');
    } catch (error) {
      console.error('Error adding telur:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat menambahkan telur.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <View style={{ flex: 1, justifyContent: 'flex-start', paddingHorizontal: 20, marginTop: 55 }}>
        <Text style={styles.title}>Tambah Telur</Text>
        <TextInput style={styles.input} placeholder="Nama Telur" value={namaTelur} onChangeText={setNamaTelur} />
        <TextInput style={styles.input} placeholder="Deskripsi" value={deskripsi} onChangeText={setDeskripsi} />
        <TextInput style={styles.input} placeholder="Harga Per Kg" keyboardType="numeric" value={hargaPerKg} onChangeText={handleHargaPerKgChange} />
        <TextInput style={styles.input} placeholder="Stok" keyboardType="numeric" value={stok} onChangeText={handleStokChange} />
        <TextInput style={styles.input} placeholder="Kategori (contoh: Ayam Kampung, Ayam Negeri)" value={kategori} onChangeText={setKategori} />
        <TouchableOpacity style={styles.button} onPress={handleAddTelur}>
          <Text style={styles.buttonText}>Tambah Telur</Text>
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