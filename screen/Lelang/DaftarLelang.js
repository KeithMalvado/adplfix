import React, { useEffect, useState } from 'react';
import { Text, SafeAreaView, TouchableOpacity, TextInput, Alert, FlatList, View, Image, ScrollView, StyleSheet, Dimensions, Modal } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, query, where, getDocs, collection } from 'firebase/firestore';
import { ref, push, onValue, update } from 'firebase/database';
import { realtimeDb } from '../firebase';
import { themeColors } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function BeliTelur() {
  const [dataTelur, setDataTelur] = useState([]);
  const [selectedTelur, setSelectedTelur] = useState(null);
  const [jumlahKg, setJumlahKg] = useState('');
  const [alamatPengiriman, setAlamatPengiriman] = useState('');
  const [catatan, setCatatan] = useState('');
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

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

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const renderTelurItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedTelur(item)}
      style={[
        styles.telurCard,
        {
          backgroundColor: selectedTelur?.id === item.id ? themeColors.button : '#FFFFFF',
          borderColor: selectedTelur?.id === item.id ? themeColors.button : '#E5E7EB',
          shadowColor: themeColors.text,
        }
      ]}
    >
      <View style={styles.telurHeader}>
        <View style={styles.telurInfo}>
          <Text style={[styles.telurName, { 
            color: selectedTelur?.id === item.id ? '#FFFFFF' : themeColors.text 
          }]}>
            {item.namaTelur}
          </Text>
          <View style={[styles.kategoriTag, {
            backgroundColor: selectedTelur?.id === item.id ? 'rgba(255,255,255,0.2)' : themeColors.secondary
          }]}>
            <Text style={[styles.kategoriText, {
              color: selectedTelur?.id === item.id ? '#FFFFFF' : themeColors.textSecondary
            }]}>
              {item.kategori}
            </Text>
          </View>
        </View>
        {selectedTelur?.id === item.id && (
          <View style={styles.selectedIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.telurDetails}>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, {
            color: selectedTelur?.id === item.id ? 'rgba(255,255,255,0.8)' : '#6B7280'
          }]}>
            Harga per kg
          </Text>
          <Text style={[styles.priceValue, {
            color: selectedTelur?.id === item.id ? '#FFFFFF' : themeColors.button
          }]}>
            {formatRupiah(item.hargaPerKg)}
          </Text>
        </View>
        
        <View style={styles.stockContainer}>
          <Text style={[styles.stockLabel, {
            color: selectedTelur?.id === item.id ? 'rgba(255,255,255,0.8)' : '#6B7280'
          }]}>
            Stok tersedia
          </Text>
          <Text style={[styles.stockValue, {
            color: selectedTelur?.id === item.id ? '#FFFFFF' : themeColors.text
          }]}>
            {item.stok} kg
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalHarga = selectedTelur && jumlahKg ? 
    selectedTelur.hargaPerKg * parseInt(jumlahKg || '0') : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Beli Telur Segar
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Pilih telur berkualitas untuk kebutuhan Anda
          </Text>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/welcome.png')}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Daftar Produk Telur
          </Text>
          {dataTelur.length > 0 ? (
            <FlatList
              data={dataTelur}
              renderItem={renderTelurItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                Belum ada produk telur tersedia
              </Text>
            </View>
          )}
        </View>
        {!selectedTelur && dataTelur.length > 0 && (
          <View style={styles.instructionContainer}>
            <Text style={[styles.instructionText, { color: themeColors.textSecondary }]}>
              👆 Pilih salah satu produk telur di atas untuk melanjutkan pemesanan
            </Text>
          </View>
        )}
      </ScrollView>
      <Modal
        visible={selectedTelur !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setSelectedTelur(null);
          setJumlahKg('');
          setAlamatPengiriman('');
          setCatatan('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                  🛒 Detail Pesanan
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedTelur(null);
                    setJumlahKg('');
                    setAlamatPengiriman('');
                    setCatatan('');
                  }}
                  style={styles.closeButton}
                >
                  <Text style={[styles.closeButtonText, { color: themeColors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {selectedTelur && (
                <>
                  <View style={[styles.selectedProductInfo, { backgroundColor: themeColors.secondary }]}>
                    <Text style={[styles.selectedProductLabel, { color: themeColors.textSecondary }]}>
                      Produk yang dipilih:
                    </Text>
                    <Text style={[styles.selectedProductName, { color: themeColors.text }]}>
                      {selectedTelur.namaTelur} - {selectedTelur.kategori}
                    </Text>
                    <Text style={[styles.selectedProductPrice, { color: themeColors.button }]}>
                      {formatRupiah(selectedTelur.hargaPerKg)}/kg
                    </Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                      Jumlah (kg) *
                    </Text>
                    <TextInput
                      style={[styles.input, { 
                        backgroundColor: themeColors.secondary,
                        color: themeColors.textSecondary 
                      }]}
                      placeholder="Masukkan jumlah dalam kg"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={jumlahKg}
                      onChangeText={handleJumlahKgChange}
                    />
                    {jumlahKg && (
                      <Text style={[styles.totalPrice, { color: themeColors.button }]}>
                        Total: {formatRupiah(totalHarga)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                      Alamat Pengiriman *
                    </Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput, { 
                        backgroundColor: themeColors.secondary,
                        color: themeColors.textSecondary 
                      }]}
                      placeholder="Masukkan alamat lengkap pengiriman"
                      placeholderTextColor="#9CA3AF"
                      value={alamatPengiriman}
                      onChangeText={setAlamatPengiriman}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                      Catatan (opsional)
                    </Text>
                    <TextInput
                      style={[styles.input, styles.multilineInput, { 
                        backgroundColor: themeColors.secondary,
                        color: themeColors.textSecondary 
                      }]}
                      placeholder="Tambahkan catatan khusus untuk pesanan Anda"
                      placeholderTextColor="#9CA3AF"
                      value={catatan}
                      onChangeText={setCatatan}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.orderButton, { backgroundColor: themeColors.button }]}
                    onPress={handleBeli}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.orderButtonText}>
                      🛍️ Pesan Sekarang
                    </Text>
                    {totalHarga > 0 && (
                      <Text style={styles.orderButtonSubtext}>
                        {formatRupiah(totalHarga)}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <View style={styles.navbar}>
                    <LinearGradient
                      colors={["#ffffff", "#f8fafc"]}
                      style={styles.navbarGradient}
                    >
                      <TouchableOpacity onPress={() => navigation.navigate("DaftarBarang")} style={[styles.navItem, styles.activeNavItem]}>
                        <View style={[styles.navIconContainer, styles.activeNavIcon]}>
                          <Ionicons name="search-outline" size={24} color="#fff" />
                        </View>
                        <Text style={[styles.navText, styles.activeNavText]}>Belanja</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={[styles.navItem]}>
                        <View style={[styles.navIconContainer]}>
                          <Ionicons name="home" size={24} color="#fff" />
                        </View>
                        <Text style={styles.navText}>Home</Text>
                      </TouchableOpacity>
                     <TouchableOpacity onPress={() => navigation.navigate("Profil")} style={[styles.navItem]}>
                                 <View style={[styles.navIconContainer]}>
                                   <Ionicons name="person" size={24} color="#fff" />
                                 </View>
                                 <Text style={[styles.navText]}>Profil</Text>
                               </TouchableOpacity>
                    </LinearGradient>
                  </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeImage: {
    width: width * 0.6,
    height: width * 0.4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  telurCard: {
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  telurHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  telurInfo: {
    flex: 1,
  },
  telurName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  kategoriTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  kategoriText: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  telurDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedProductInfo: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  selectedProductLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  selectedProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  selectedProductPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'right',
  },
  orderButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderButtonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },
 navbar: {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      elevation: 20,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: -5 },
      shadowRadius: 15,
    },
    navbarGradient: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      height: 70,
      paddingBottom: 10,
      paddingTop: 10,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    navItem: {
      alignItems: "center",
      paddingVertical: 5,
    },
    activeNavItem: {
      transform: [{ translateY: -5 }],
    },
    navIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(96, 165, 250, 0.1)",
    },
    activeNavIcon: {
      backgroundColor: "#60a5fa",
      elevation: 4,
      shadowColor: "#60a5fa",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
    },
    navText: {
      fontSize: 11,
      color: themeColors.primary,
      marginTop: 4,
      fontWeight: "600",
    },
    activeNavText: {
      color: "#60a5fa",
      fontWeight: "700",
    },
  });