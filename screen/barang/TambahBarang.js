import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, TouchableOpacity, TextInput, Alert, Image, View, StyleSheet } from 'react-native';
import { ref, push } from 'firebase/database';
import { getFirestore, query, where, getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { realtimeDb } from '../firebase/index';
import { themeColors } from '../../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function TambahTelur() {
  const [namaTelur, setNamaTelur] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [hargaPerKg, setHargaPerKg] = useState('');
  const [stok, setStok] = useState('');
  const [kategori, setKategori] = useState('');
  const [userData, setUserData] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

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
  }, [auth, db]);

  const handleHargaPerKgChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setHargaPerKg(numericValue);
  };

  const handleStokChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setStok(numericValue);
  };

  const handleAddTelur = async () => {
    if (namaTelur && deskripsi && hargaPerKg && stok && kategori) {
      if (isNaN(parseInt(hargaPerKg)) || isNaN(parseInt(stok))) {
        Alert.alert('Warning', 'Harga dan stok harus berupa angka.');
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
        Alert.alert('Error', 'Terjadi kesalahan saat menambahkan telur. Coba lagi nanti.');
      }
    } else {
      Alert.alert('Warning', 'Mohon lengkapi semua kolom!');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
        <View style={{ flex: 1, justifyContent: 'flex-start', paddingHorizontal: 20, marginTop: 55 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black', marginBottom: 20, textAlign: 'center' }}>
          Tambah Telur
        </Text>
        <TextInput style={styles.input} placeholder="Nama Telur" value={namaTelur} onChangeText={setNamaTelur} />
        <TextInput style={styles.input} placeholder="Deskripsi" value={deskripsi} onChangeText={setDeskripsi} />
        <TextInput style={styles.input} placeholder="Harga Per Kg" keyboardType="numeric" value={hargaPerKg} onChangeText={handleHargaPerKgChange} />
        <TextInput style={styles.input} placeholder="Stok" keyboardType="numeric" value={stok} onChangeText={handleStokChange} />
        <TextInput style={styles.input} placeholder="Kategori (contoh: Ayam Kampung, Ayam Negeri)" value={kategori} onChangeText={setKategori} />
        <TouchableOpacity style={styles.button} onPress={handleAddTelur}>
          <Text style={styles.buttonText}>Tambah Telur</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("HCpetugas")} style={styles.navButton}>
          <Ionicons name="home-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cam")} style={styles.navButton}>
          <Ionicons name="camera-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TambahBarang')} style={styles.navButton}>
          <Ionicons name="cube-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Telur</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ProfilPetugas")} style={styles.navButton}>
          <Ionicons name="person-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
        <View style={styles.gambar}>
          <Image source={require('../../assets/images/back.png')} style={{ width: '100%', height: 325, resizeMode: 'cover' }} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 16,
    backgroundColor: themeColors.secondary,
    color: themeColors.textSecondary,
    borderRadius: 16,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 16,
    backgroundColor: themeColors.button,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomNav: {
    backgroundColor: '#8BAA21',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff8e1',
    fontWeight: 'bold',
  },
  gambar: {
    paddingVertical: 50,
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
});
