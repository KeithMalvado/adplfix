import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView } from "react-native";
import { ref, onValue } from "firebase/database";
import { auth, realtimeDb } from "../firebase/index";
import { themeColors } from "../../theme/theme"; 
import { Ionicons } from "@expo/vector-icons"; 

export default function Pesan({ navigation }) {
  const [barangList, setBarangList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) {
      Alert.alert("Error", "Anda harus login untuk melihat data barang.");
      navigation.navigate('Login'); 
      return;
    }

    const barangRef = ref(realtimeDb, "barang");
    const unsubscribe = onValue(
      barangRef,
      (snapshot) => {
        setIsLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const barangArray = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .filter((item) => item.user.userId === currentUser.uid && item.statusValidasi === "menunggu");
          setBarangList(barangArray);
        } else {
          setBarangList([]);
        }
      },
      (error) => {
        setIsLoading(false);
        console.error("Error fetching data: ", error);
        Alert.alert("Error", "Gagal mengambil data barang.");
      }
    );

    return () => unsubscribe();
  }, [currentUser, navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (barangList.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Tidak ada barang yang perlu divalidasi
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Daftar Barang Lelang</Text>
      <FlatList
        data={barangList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.namaBarang}</Text>
            <Text style={styles.cardText}>Deskripsi: {item.deskripsi}</Text>
            <Text style={styles.cardText}>Harga Maksimum: {item.hargaTertinggi}</Text>
            <Text style={styles.cardText}>
              Status Validasi: {item.statusValidasi === "menunggu" ? "Belum Disetujui Oleh Petugas" : "Sudah Disetujui oleh Admin"}
            </Text>
          </View>
        )}
      />
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.navButton}
        >
          <Ionicons name="home-outline" size={30} color="#000" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CariBarang')}
          style={styles.navButton}
        >
          <Ionicons name="search-outline" size={30} color="#000" />
          <Text>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.navButton}
        >
          <Ionicons name="person-outline" size={30} color="#000" />
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: themeColors.bg,
    paddingHorizontal: 0,
    paddingTop: 70,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: themeColors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: themeColors.text,
    marginTop: 20,
  },
  card: {
    padding: 20,
    backgroundColor: themeColors.secondary,
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
    alignSelf: 'center'
  },
  bottomNav: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopColor: "#ddd",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: themeColors.text,
    paddingHorizontal: 30,
  },
  navButton: {
    alignItems: 'center',
    padding: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: themeColors.textSecondary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: themeColors.textSecondary,
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: themeColors.primary,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
