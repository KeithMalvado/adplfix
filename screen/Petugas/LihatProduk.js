import React, { useEffect, useState } from "react";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  View,
  ImageBackground,
  Alert,
  StatusBar,
  StyleSheet,
  Dimensions,
} from "react-native";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";
import { ref, onValue, update } from "firebase/database";
import { realtimeDb } from "../firebase";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function LihatProduk() {
  const [dataTelur, setDataTelur] = useState([]);
  const [userData, setUserData] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchUserData = async () => {
        const q = query(
          collection(db, "users"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      };
      fetchUserData();
    }

    const telurRef = ref(realtimeDb, "produk");
    onValue(telurRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setDataTelur(list);
      }
    });
  }, []);

  const updateStokTelur = async (item, delta) => {
    const newStok = item.stok + delta;
    if (newStok < 0) {
      Alert.alert("Error", "Stok tidak bisa kurang dari 0");
      return;
    }
    try {
      const telurUpdateRef = ref(realtimeDb, `produk/${item.id}`);
      await update(telurUpdateRef, { stok: newStok });

      setDataTelur((prevData) =>
        prevData.map((telur) =>
          telur.id === item.id ? { ...telur, stok: newStok } : telur
        )
      );
    } catch (error) {
      console.error("Error update stok:", error);
      Alert.alert("Error", "Gagal update stok telur.");
    }
  };

  const renderTelurItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>
            {item.namaTelur} - {item.kategori}
          </Text>
          <View style={styles.priceStockContainer}>
            <Text style={styles.itemSubtitle}>
              Rp {item.hargaPerKg.toLocaleString()}/kg
            </Text>
            <Text style={styles.stockText}>Stok: {item.stok} kg</Text>
          </View>
        </View>

        <View style={styles.stockControls}>
          <TouchableOpacity
            onPress={() => updateStokTelur(item, -1)}
            style={[styles.stockButton, styles.decreaseButton]}
          >
            <Ionicons name="remove" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => updateStokTelur(item, +1)}
            style={[styles.stockButton, styles.increaseButton]}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Header with Image Background and Layered Overlay */}
      <ImageBackground 
        source={require("../../assets/images/welcome.png")}
        style={styles.headerBackground}
        resizeMode="cover"
      >
        <View style={styles.imageOverlay}>
          <LinearGradient
            colors={['rgba(46, 125, 50, 0.6)', 'rgba(46, 125, 50, 0.8)']}
            style={styles.gradientOverlay}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate("HCpetugas")}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backText}>Kembali</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Manajemen Produk Telur</Text>
          </LinearGradient>
        </View>
      </ImageBackground>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Daftar Produk Telur</Text>
          <Text style={styles.itemCount}>{dataTelur.length} item</Text>
        </View>

        <FlatList
          data={dataTelur}
          renderItem={renderTelurItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("TambahBarang")}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.addButtonText}>Tambah Produk Baru</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBackground: {
    width: windowWidth,
    height: 220,
    justifyContent: 'center',
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  gradientOverlay: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: StatusBar.currentHeight + 10,
    left: 20,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -25,
    padding: 20,
    paddingTop: 30,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E7D32",
  },
  itemCount: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  priceStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemSubtitle: {
    color: "#2E7D32",
    fontWeight: '600',
    marginRight: 10,
  },
  stockText: {
    color: "#666",
    fontSize: 13,
  },
  stockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  stockButton: {
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  decreaseButton: {
    backgroundColor: "#C62828",
  },
  increaseButton: {
    backgroundColor: "#2E7D32",
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});