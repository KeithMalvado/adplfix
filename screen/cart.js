import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const Cart = () => {
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [produkData, setProdukData] = useState({});
  const [totalHarga, setTotalHarga] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setItems([]);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const produkRef = ref(db, 'produk');

    const unsubscribeProduk = onValue(produkRef, (snapshot) => {
      const data = snapshot.val() || {};
      setProdukData(data);
    });

    return () => unsubscribeProduk();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const cartRef = ref(db, 'pembelian_telur');

    const unsubscribeDb = onValue(cartRef, (snapshot) => {
      const data = snapshot.val() || {};
      const userItems = [];

      for (let key in data) {
        const item = data[key];
        if (item.user?.userId === userId) {
          userItems.push({ id: key, ...item });
        }
      }

      setItems(userItems);
    });

    return () => unsubscribeDb();
  }, [userId]);

  useEffect(() => {
    if (!items.length || !produkData) {
      setTotalHarga(0);
      return;
    }

    let total = 0;

    items.forEach((item) => {
      const produk = produkData[item.telurId];
      if (produk) {
        const hargaPerKg = produk.hargaPerKg || 0;
        total += hargaPerKg * (item.jumlahKg || 0);
      }
    });

    setTotalHarga(total);
  }, [items, produkData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };



  const renderItem = ({ item, index }) => {
    const produk = produkData[item.telurId];
    const hargaPerKg = produk?.hargaPerKg || 0;
    const hargaTotalItem = hargaPerKg * (item.jumlahKg || 0);

    return (
      <TouchableOpacity
        style={[styles.card, { marginBottom: index === items.length - 1 ? 20 : 16 }]}
        onPress={() =>
          navigation.navigate('Pembayaran', {
            produk: {
              id: item.barangId || item.id,
              namaTelur: item.namaTelur,
              hargaPerKg: produk?.hargaPerKg || 0,
              deskripsi: produk?.deskripsi || '',
              jumlahKg: item.jumlahKg || 0,
            },
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.namaTelur}</Text>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={() =>
              navigation.navigate('Pembayaran', {
                produk: {
                  id: item.barangId || item.id,
                  namaTelur: item.namaTelur,
                  hargaPerKg: produk?.hargaPerKg || 0,
                  deskripsi: produk?.deskripsi || '',
                  jumlahKg: item.jumlahKg || 0,
                },
              })
            }
          >
            <Text style={styles.buyButtonText}>Bayar Sekarang</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Jumlah</Text>
              <Text style={styles.infoValue}>{item.jumlahKg} kg</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Harga/kg</Text>
              <Text style={styles.infoValue}>{formatCurrency(hargaPerKg)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Total</Text>
              <Text style={styles.infoValueHighlight}>{formatCurrency(hargaTotalItem)}</Text>
            </View>
          </View>
          
          {item.catatan && (
            <View style={styles.noteContainer}>
              <Text style={styles.noteLabel}>Catatan:</Text>
              <Text style={styles.noteText}>{item.catatan}</Text>
            </View>
          )}
          
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>📍 Alamat Pengiriman:</Text>
            <Text style={styles.addressText}>{item.alamatPengiriman}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyCartComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Keranjang Kosong</Text>
      <Text style={styles.emptySubtitle}>Belum ada produk di keranjang Anda</Text>
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopButtonText}>Mulai Belanja</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat...</Text>
      </View>
    );
  }

  if (userId === null) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>🛒 Keranjang Belanja</Text>
        </LinearGradient>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginIcon}>🔐</Text>
          <Text style={styles.loginTitle}>Login Diperlukan</Text>
          <Text style={styles.loginSubtitle}>Silakan login terlebih dahulu untuk melihat keranjang Anda</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🛒 Keranjang Belanja</Text>
        <Text style={styles.headerSubtitle}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyCartComponent />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 12,
  },
  buyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoValueHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  noteContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noteLabel: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
  },
  addressContainer: {
    backgroundColor: '#d1ecf1',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  addressLabel: {
    fontSize: 12,
    color: '#0c5460',
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#0c5460',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalContainer: {
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  checkoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  checkoutButtonIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loginIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Cart;