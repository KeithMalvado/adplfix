import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { themeColors } from "../../theme/theme";
import { addArtikel } from "../../screen/firebase/index"; 

export default function TambahArtikel() {
  const navigation = useNavigation();
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [gambarUrl, setGambarUrl] = useState("");

  const handleSimpan = async () => {
    if (!judul || !isi || !gambarUrl) {
      Alert.alert("Peringatan", "Harap isi semua kolom dan pilih URL gambar.");
      return;
    }

    try {
      await addArtikel({
        judul,
        isi,
        gambar: gambarUrl, 
        createdAt: new Date().toISOString()
      });

      Alert.alert("Sukses", "Artikel berhasil disimpan!");
      setJudul("");
      setIsi("");
      setGambarUrl("");
    } catch (err) {
      Alert.alert("Error", "Gagal menyimpan artikel.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff8e1' }}>
      <Text style={styles.label}>Judul Artikel</Text>
      <TextInput
        style={styles.input}
        placeholder="Masukkan judul"
        value={judul}
        onChangeText={setJudul}
      />
      <Text style={styles.label}>Isi Artikel</Text>
      <TextInput
        style={[styles.input, { height: 120, textAlignVertical: "top" }]}
        placeholder="Tulis isi artikel di sini"
        multiline
        numberOfLines={6}
        value={isi}
        onChangeText={setIsi}
      />

      <TextInput
        style={styles.input}
        placeholder="Masukkan URL gambar"
        value={gambarUrl}
        onChangeText={setGambarUrl}
      />

      {gambarUrl ? (
        <Text style={{ marginVertical: 10, color: 'green', fontWeight: 'bold' }}>
          Gambar URL telah dipilih
        </Text>
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSimpan}>
        <Text style={styles.buttonText}>Simpan Artikel</Text>
      </TouchableOpacity>
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
          <Text style={{ color: '#fff8e1', fontWeight: 'bold' }}>Telur</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ProfilPetugas")} style={styles.navButton}>
          <Ionicons name="person-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
          <View style={styles.gambar}>
        <Image
          source={require('../../assets/images/back.png')}
          style={{ width: '100%', height: 325, resizeMode: 'cover' }}/>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#000",
  },
  gambar:{
    paddingVertical: 50,
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: themeColors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomNav: {
    backgroundColor: '#8BAA21',
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    position: "absolute",
    bottom: -10,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    color: "#fff8e1",
    fontWeight: "bold",
  },
});
