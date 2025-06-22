import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, Linking } from 'react-native';
import { getDatabase, ref, remove } from 'firebase/database';

const Pembayaran = ({ route, navigation }) => {
  const { produk, userId, itemId } = route.params;
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const hapusProdukDariKeranjang = async (id) => {
    try {
      const db = getDatabase();
      await remove(ref(db, `pembelian_telur/${id}`));
    } catch (error) {
      Alert.alert('Error', 'Gagal menghapus item dari keranjang');
    }
  };

  const handlePay = async () => {
    if (!produk) {
      Alert.alert('Error', 'Produk belum tersedia');
      return;
    }
    setLoading(true);
    const data = {
      order_id: `ORDER-${userId}-${produk.id}-${Date.now()}`,
      gross_amount: produk.hargaPerKg * produk.jumlahKg,
      item_details: [
        {
          id: produk.id,
          price: produk.hargaPerKg,
          quantity: produk.jumlahKg,
          name: produk.namaTelur,
        },
      ],
    };
    try {
      const response = await fetch('http://192.168.123.157:8082/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        Alert.alert('Error', `Server error: ${response.status}`);
        setLoading(false);
        return;
      }
      const json = await response.json();
      setOrderId(data.order_id);
      if (json.redirect_url) {
        Linking.openURL(json.redirect_url);
      } else {
        Alert.alert('Error', 'Gagal membuat transaksi');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const cekStatusPembayaran = async () => {
    if (!orderId) {
      Alert.alert('Info', 'Transaksi belum dibuat');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.1.7:8082/status-transaction/${orderId}`);
      if (!response.ok) throw new Error('Gagal ambil status');
      const data = await response.json();
      Alert.alert('Status Pembayaran', JSON.stringify(data, null, 2));
      if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
        if (userId && itemId) {
          await hapusProdukDariKeranjang(itemId);
          navigation.goBack();
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!produk) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center' }}>Bayar {produk.namaTelur}</Text>
      <Text style={{ fontSize: 18, marginVertical: 10, color: 'green', textAlign: 'center' }}>
        Total: {(produk.hargaPerKg * produk.jumlahKg).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
      </Text>
      <Button title={loading ? 'Memproses...' : 'Bayar Sekarang'} onPress={handlePay} disabled={loading} />
      <View style={{ marginTop: 20 }}>
        <Button title="Cek Status Pembayaran" onPress={cekStatusPembayaran} disabled={loading || !orderId} />
      </View>
      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
    </View>
  );
};

export default Pembayaran;
