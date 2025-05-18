import React, { useEffect, useState } from 'react';
import { Text, SafeAreaView, TouchableOpacity, TextInput, Alert, FlatList, View, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, query, where, getDocs, collection } from 'firebase/firestore';
import { ref, push, onValue, update } from 'firebase/database';
import { realtimeDb } from '../firebase';
import { themeColors } from '../../theme/theme';

export default function BeliTelur() {
  const [dataTelur, setDataTelur] = useState([]);
  const [selectedTelur, setSelectedTelur] = useState(null);
  const [jumlahKg, setJumlahKg] = useState('');
  const [alamatPengiriman, setAlamatPengiriman] = useState('');
  const [catatan, setCatatan] = useState('');
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

    const telurRef = ref(realtimeDb, 'produk');
    onValue(telurRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setDataTelur(list);
      }
    });
  }, []);

  const handleJumlahKgChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setJumlahKg(numericValue);
  };

  const handleBeli = async () => {
    if (!selectedTelur || !jumlahKg || !alamatPengiriman) {
      Alert.alert('Warning', 'Harap isi semua data!');
      return;
    }

    const kg = parseInt(jumlahKg);
    if (isNaN(kg)) {
      Alert.alert('Error', 'Jumlah harus angka!');
      return;
    }

    if (kg > selectedTelur.stok) {
      Alert.alert('Error', 'Stok tidak mencukupi!');
      return;
    }

    const pembelianData = {
      telurId: selectedTelur.id,
      namaTelur: selectedTelur.namaTelur,
      jumlahKg: kg,
      alamatPengiriman,
      catatan,
      userId: auth.currentUser.uid,
      createdAt: Date.now(),
      user: {
        address: userData?.address || '',
        email: userData?.email || '',
        name: userData?.name || '',
        phone: userData?.phone || '',
        userId: auth.currentUser.uid
      },
      statusPesanan: 'menunggu_konfirmasi'
    };

    try {
      const pembelianRef = ref(realtimeDb, 'pembelian_telur');
      const newPembelianRef = push(pembelianRef, pembelianData);

      const newStok = selectedTelur.stok - kg;
      const telurUpdateRef = ref(realtimeDb, `produk/${selectedTelur.id}`);
      await update(telurUpdateRef, { stok: newStok });

      Alert.alert('Berhasil', 'Pesanan berhasil dibuat!');
      setSelectedTelur(null);
      setJumlahKg('');
      setAlamatPengiriman('');
      setCatatan('');
    } catch (error) {
      console.error('Error saat membeli:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membeli.');
    }
  };

  const renderTelurItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedTelur(item)}
      style={{
        padding: 16,
        backgroundColor: selectedTelur?.id === item.id ? themeColors.button : themeColors.secondary,
        marginBottom: 10,
        borderRadius: 12,
      }}
    >
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: themeColors.textSecondary }}>
        {item.namaTelur} - {item.kategori}
      </Text>
      <Text style={{ color: themeColors.textSecondary }}>
        Harga: Rp {item.hargaPerKg}/kg | Stok: {item.stok} kg
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: themeColors.text, marginBottom: 10 }}>
        Beli Telur
      </Text>

      <Image
        source={require('../../assets/images/welcome.png')}
        style={{ width: 250, height: 250, alignSelf: 'center', marginBottom: 10 }}
      />

      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10, color: themeColors.text }}>
        Pilih Telur:
      </Text>

      <FlatList
        data={dataTelur}
        renderItem={renderTelurItem}
        keyExtractor={(item) => item.id}
        style={{ marginBottom: 16 }}
      />

      {selectedTelur && (
        <>
          <Text style={{ fontSize: 16, marginBottom: 5, color: themeColors.text }}>
            Anda memilih: <Text style={{ fontWeight: 'bold' }}>{selectedTelur.namaTelur}</Text>
          </Text>

          <TextInput
            style={{
              padding: 16,
              backgroundColor: themeColors.secondary,
              borderRadius: 12,
              marginBottom: 12,
              color: themeColors.textSecondary,
            }}
            placeholder="Jumlah (kg)"
            keyboardType="numeric"
            value={jumlahKg}
            onChangeText={handleJumlahKgChange}
          />
          <TextInput
            style={{
              padding: 16,
              backgroundColor: themeColors.secondary,
              borderRadius: 12,
              marginBottom: 12,
              color: themeColors.textSecondary,
            }}
            placeholder="Alamat Pengiriman"
            value={alamatPengiriman}
            onChangeText={setAlamatPengiriman}
          />
          <TextInput
            style={{
              padding: 16,
              backgroundColor: themeColors.secondary,
              borderRadius: 12,
              marginBottom: 12,
              color: themeColors.textSecondary,
            }}
            placeholder="Catatan (opsional)"
            value={catatan}
            onChangeText={setCatatan}
          />
          <TouchableOpacity
            style={{
              backgroundColor: themeColors.button,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
            onPress={handleBeli}
          >
            <Text style={{ color: themeColors.textSecondary, fontWeight: 'bold' }}>Beli Sekarang</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
