import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { ref, get } from 'firebase/database';
import { StripeProvider, initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { realtimeDb } from "../../screen/firebase/index"; 
import { themeColors } from '../../theme/theme';

const Pembayaran = ({ route }) => {
  const { barangId } = route.params;
  const [hargaSaatIni, setHargaSaatIni] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHargaBarang = async () => {
      try {
        const barangRef = ref(realtimeDb, `barang/${barangId}`);
        const snapshot = await get(barangRef);
        if (snapshot.exists()) {
          const barangData = snapshot.val();
          setHargaSaatIni(barangData.hargaSaatIni);
        } else {
          Alert.alert("Error", "Barang tidak ditemukan.");
        }
      } catch (error) {
        console.error("Error fetching harga barang: ", error);
        Alert.alert("Error", "Terjadi kesalahan saat mengambil data barang.");
      } finally {
        setLoading(false);
      }
    };

    fetchHargaBarang();
  }, [barangId]);

  const handlePembayaran = async () => {
    if (!hargaSaatIni || isNaN(hargaSaatIni) || hargaSaatIni <= 0) {
      Alert.alert("Warning", "Harga barang tidak valid.");
      return;
    }

    try {
      const response = await fetch('https://58cf-103-47-133-182.ngrok-free.app/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(hargaSaatIni * 100),
          currency: 'idr',
          orderId: barangId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert("Error", `Gagal membuat payment intent: ${errorText}`);
        return;
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        Alert.alert("Error", "Gagal mendapatkan clientSecret.");
        return;
      }

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Nama Toko Anda',
      });

      if (initError) {
        console.error("Error inisialisasi pembayaran:", initError);
        Alert.alert("Error", "Gagal menginisialisasi pembayaran.");
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error("Error saat menampilkan pembayaran:", presentError);
        Alert.alert("Error", "Pembayaran gagal: " + presentError.message);
      } else {
        Alert.alert("Success", "Pembayaran berhasil!");
      }
    } catch (error) {
      console.error("Error saat memproses pembayaran:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memproses pembayaran: " + error.message);
    }
  };

  if (loading) {
    return (
      <StripeProvider publishableKey="pk_test_51QUWjzDRTy3ktVhtVi64IwTAoarI8FKJcoDssiwRpz51r5foXiqF7bhYuB7D8UPmxdpIP9ZLpjtotOszxpQSrg7J002e2wDa68">
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </SafeAreaView>
      </StripeProvider>
    );
  }

  return (
    <StripeProvider publishableKey="pk_test_51QUWjzDRTy3ktVhtVi64IwTAoarI8FKJcoDssiwRpz51r5foXiqF7bhYuB7D8UPmxdpIP9ZLpjtotOszxpQSrg7J002e2wDa68">
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          {hargaSaatIni ? (
            <>
              <Text style={styles.title}>Total Pembayaran</Text>
              <Text style={styles.price}>Rp {hargaSaatIni.toLocaleString('id-ID')}</Text>
              <TouchableOpacity style={styles.button} onPress={handlePembayaran}>
                <Text style={styles.buttonText}>Proses Pembayaran</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>Harga tidak tersedia.</Text>
          )}
        </View>
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 16,
  },
  button: {
    backgroundColor: themeColors.bg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
  },
});

export default Pembayaran;
