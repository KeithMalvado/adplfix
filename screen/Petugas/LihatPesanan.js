import React, { useEffect, useState } from 'react';
import { View, Text, FlatList,  StyleSheet,  StatusBar, RefreshControl, } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const LihatPesanan = () => {
  const [items, setItems] = useState([]);
  const [produkData, setProdukData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

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
    const db = getDatabase();
    const cartRef = ref(db, 'pembelian_telur');
    const unsubscribeDb = onValue(cartRef, (snapshot) => {
      const data = snapshot.val() || {};
      const allItems = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      allItems.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setItems(allItems);
      setLoading(false);
    });

    return () => unsubscribeDb();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#34C759';
      case 'shipped': return '#007AFF';
      case 'delivered': return '#30D158';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const renderItem = ({ item, index }) => {
    const produk = produkData[item.telurId];
    const hargaPerKg = produk?.hargaPerKg || 0;
    const hargaTotalItem = hargaPerKg * (item.jumlahKg || 0);
    const status = item.status || 'pending';

    return (
      <View style={[styles.card, { transform: [{ scale: 1 }] }]}>
        <View style={styles.cardHeader}>
          <View style={styles.orderNumberContainer}>
            <Ionicons name="receipt-outline" size={16} color="#666" />
            <Text style={styles.orderNumber}>Pesanan #{index + 1}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.productSection}>
          <Text style={styles.productName}>{item.namaTelur}</Text>
          <View style={styles.productDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="scale-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{item.jumlahKg} kg</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="pricetag-outline" size={16} color="#666" />
              <Text style={styles.detailText}>Rp {hargaPerKg.toLocaleString()}/kg</Text>
            </View>
          </View>
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.totalLabel}>Total Harga:</Text>
          <Text style={styles.totalPrice}>Rp {hargaTotalItem.toLocaleString()}</Text>
        </View>
        {item.catatan && (
          <View style={styles.noteSection}>
            <Ionicons name="chatbubble-outline" size={14} color="#666" />
            <Text style={styles.noteText}>{item.catatan}</Text>
          </View>
        )}

        <View style={styles.addressSection}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.addressText}>{item.alamatPengiriman}</Text>
        </View>
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <Ionicons name="person-outline" size={14} color="#666" />
            <Text style={styles.customerText}>
              {item.user?.email || 'Tidak diketahui'}
            </Text>
          </View>
          <Text style={styles.userIdText}>ID: {item.user?.userId}</Text>
        </View>
        <View style={styles.actionIndicator}>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.heading}>📋 Daftar Pesanan</Text>
      <Text style={styles.subheading}>
        {items.length} pesanan ditemukan
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Belum Ada Pesanan</Text>
      <Text style={styles.emptySubtitle}>
        Pesanan akan muncul di sini setelah pelanggan melakukan pemesanan
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default LihatPesanan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productSection: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD60A',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  userIdText: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  actionIndicator: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#C7C7CC',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
  },
});
