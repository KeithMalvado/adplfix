import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { themeColors } from "../../theme/theme";
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, addArtikel } from "../../screen/firebase/index"; // pastikan fungsi addArtikel ada di index.js
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

export default function TambahArtikel() {
  const navigation = useNavigation();
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [gambar, setGambar] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pilihGambar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setGambar(result.assets[0].uri);
    }
  };

  const handleSimpan = async () => {
    if (!judul || !isi || !gambar) {
      Alert.alert("Peringatan", "Harap isi semua kolom dan pilih gambar.");
      return;
    }

    setUploading(true);

    try {
      const response = await fetch(gambar);
      const blob = await response.blob();
      const filename = `artikel/${uuidv4()}.jpg`;
      const imageRef = storageRef(storage, filename);
      await uploadBytes(imageRef, blob);
      const urlGambar = await getDownloadURL(imageRef);

      await addArtikel({
        judul,
        isi,
        gambar: urlGambar,
        createdAt: new Date().toISOString()
      });

      Alert.alert("Sukses", "Artikel berhasil disimpan!");
      setJudul("");
      setIsi("");
      setGambar(null);
    } catch (err) {
      console.error("Gagal upload:", err);
      Alert.alert("Error", "Gagal menyimpan artikel.");
    }

    setUploading(false);
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

      <TouchableOpacity style={styles.button} onPress={pilihGambar}>
        <Text style={styles.buttonText}>Pilih Gambar</Text>
      </TouchableOpacity>

      {gambar && (
        <Image
          source={{ uri: gambar }}
          style={{ width: "100%", height: 200, marginVertical: 10, borderRadius: 10 }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSimpan} disabled={uploading}>
        <Text style={styles.buttonText}>{uploading ? "Menyimpan..." : "Simpan Artikel"}</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.navButton}>
          <Ionicons name="home-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cam")} style={styles.navButton}>
          <Ionicons name="camera-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ProfilPetugas")} style={styles.navButton}>
          <Ionicons name="person-outline" size={30} color="#fff8e1" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gambar}>
        <Image
          source={require("../../assets/images/back.png")}
          style={{ width: "100%", height: 325, resizeMode: "cover" }}
        />
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
  gambar: {
    paddingVertical: 50,
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
});
