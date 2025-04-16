
import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { ref, push } from 'firebase/database';
import { getFirestore, query, where, getDocs, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { realtimeDb } from '../firebase/index';
import { themeColors } from '../../theme/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TambahBarang() {
  const [namaBarang, setNamaBarang] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [hargaTertinggi, setHargaTertinggi] = useState('');
  const [openBit, setOpenBit] = useState('');
  const [tanggalLelang, setTanggalLelang] = useState(new Date());
  const [jamAwalLelang, setJamAwalLelang] = useState(new Date());
  const [jamTutupLelang, setJamTutupLelang] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePickerAwal, setShowTimePickerAwal] = useState(false);
  const [showTimePickerTutup, setShowTimePickerTutup] = useState(false);
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
  }, [auth, db]);

  const handleHargaTertinggiChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setHargaTertinggi(numericValue);
  };

  const handleOpenBitChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setOpenBit(numericValue);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setTanggalLelang(date);
  };

  const handleTimeAwalChange = (event, date) => {
    setShowTimePickerAwal(false);
    if (date) setJamAwalLelang(date);
  };

  const handleTimeTutupChange = (event, date) => {
    setShowTimePickerTutup(false);
    if (date) setJamTutupLelang(date);
  };

  const handleAddBarang = async () => {
    if (namaBarang && deskripsi && hargaTertinggi && openBit && tanggalLelang && jamAwalLelang && jamTutupLelang) {
      if (isNaN(parseInt(hargaTertinggi)) || isNaN(parseInt(openBit))) {
        Alert.alert('Warning', 'Max Bid dan Open Bid harus berupa angka.');
        return;
      }

      if (parseInt(openBit) >= parseInt(hargaTertinggi)) {
        Alert.alert('Warning', 'Open Bid harus lebih kecil dari Max Bid.');
        return;
      }

      const barangData = {
        namaBarang,
        deskripsi,
        hargaTertinggi: parseInt(hargaTertinggi),
        openBit: parseInt(openBit),
        hargaSaatIni: parseInt(openBit),
        tanggalLelang: tanggalLelang.getTime(),
        jamAwalLelang: jamAwalLelang.getTime(),
        jamTutupLelang: jamTutupLelang.getTime(),
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
        const barangRef = ref(realtimeDb, 'barang');
        const newBarangRef = push(barangRef, barangData);
        const newBarangId = newBarangRef.key;

        Alert.alert('Success', `Barang berhasil ditambahkan dengan ID: ${newBarangId}`);
        setNamaBarang('');
        setDeskripsi('');
        setHargaTertinggi('');
        setOpenBit('');
        setTanggalLelang(new Date());
        setJamAwalLelang(new Date());
        setJamTutupLelang(new Date());
      } catch (error) {
        console.error('Error adding barang:', error);
        Alert.alert('Error', 'Terjadi kesalahan saat menambahkan barang. Coba lagi nanti.');
      }
    } else {
      Alert.alert('Warning', 'Mohon lengkapi semua kolom!');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg, justifyContent: 'center', paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: themeColors.text, marginBottom: 20, textAlign: 'center' }}>
        Tambah Barang
      </Text>
      <Image
        source={require('../../assets/images/welcome.png')}
        style={{ width: 300, height: 300, alignSelf: 'center', marginBottom: 20 }}
      />
      <TextInput
        style={{
          padding: 16,
          backgroundColor: themeColors.secondary,
          color: themeColors.textSecondary,
          borderRadius: 16,
          marginBottom: 12,
        }}
        placeholder="Nama Barang"
        value={namaBarang}
        onChangeText={setNamaBarang}
      />
      <TextInput
        style={{
          padding: 16,
          backgroundColor: themeColors.secondary,
          color: themeColors.textSecondary,
          borderRadius: 16,
          marginBottom: 12,
        }}
        placeholder="Deskripsi"
        value={deskripsi}
        onChangeText={setDeskripsi}
      />
      <TextInput
        style={{
          padding: 16,
          backgroundColor: themeColors.secondary,
          color: themeColors.textSecondary,
          borderRadius: 16,
          marginBottom: 12,
        }}
        placeholder="Max Bid"
        keyboardType="numeric"
        value={hargaTertinggi}
        onChangeText={handleHargaTertinggiChange}
      />
      <TextInput
        style={{
          padding: 16,
          backgroundColor: themeColors.secondary,
          color: themeColors.textSecondary,
          borderRadius: 16,
          marginBottom: 12,
        }}
        placeholder="Harga Start"
        keyboardType="numeric"
        value={openBit}
        onChangeText={handleOpenBitChange}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: themeColors.text, marginBottom: 12 }}>
          Pilih Tanggal Lelang: {tanggalLelang.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={tanggalLelang} mode="date" display="default" onChange={handleDateChange} />
      )}
      <TouchableOpacity onPress={() => setShowTimePickerAwal(true)}>
        <Text style={{ color: themeColors.text, marginBottom: 12 }}>
          Pilih Jam Awal Lelang: {jamAwalLelang.toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
      {showTimePickerAwal && (
        <DateTimePicker value={jamAwalLelang} mode="time" display="default" onChange={handleTimeAwalChange} />
      )}
      <TouchableOpacity onPress={() => setShowTimePickerTutup(true)}>
        <Text style={{ color: themeColors.text, marginBottom: 20 }}>
          Pilih Jam Tutup Lelang: {jamTutupLelang.toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
      {showTimePickerTutup && (
        <DateTimePicker value={jamTutupLelang} mode="time" display="default" onChange={handleTimeTutupChange} />
      )}
      <TouchableOpacity
        style={{
          paddingVertical: 16,
          backgroundColor: themeColors.button,
          borderRadius: 16,
          alignItems: 'center',
        }}
        onPress={handleAddBarang}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: themeColors.textSecondary }}>Tambah Barang</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
