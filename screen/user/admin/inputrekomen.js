import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

export default function AdminScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation();
  const db = getFirestore();
  const storage = getStorage();
  const auth = getAuth();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return null;

    try {
      setUploading(true);
      const response = await fetch(image);
      const blob = await response.blob();

      const filename = `rekomendasi/${new Date().getTime()}-${auth.currentUser.uid}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      setUploading(false);
      return imageUrl;
    } catch (error) {
      console.error("Upload Gambar Gagal:", error);
      Alert.alert("Error", "Gagal mengunggah gambar.");
      setUploading(false);
      return null;
    }
  };

  const handleAddRecommendation = async () => {
    if (!title || !description || !image) {
      Alert.alert("Error", "Semua kolom harus diisi!");
      return;
    }

    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) return;

      await addDoc(collection(db, "rekomendasi"), {
        title,
        description,
        imageUrl,
      });

      Alert.alert("Sukses", "Rekomendasi berhasil ditambahkan!");
      setTitle("");
      setDescription("");
      setImage(null);
      navigation.goBack();
    } catch (error) {
      console.error("Gagal menambahkan rekomendasi:", error);
      Alert.alert("Error", "Gagal menambahkan rekomendasi.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tambah Rekomendasi</Text>

      <TextInput
        style={styles.input}
        placeholder="Judul Rekomendasi"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Keterangan Rekomendasi"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text>Pilih Gambar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, uploading && { backgroundColor: "gray" }]}
        onPress={handleAddRecommendation}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? "Mengunggah..." : "Tambahkan"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff8e1",
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  imagePicker: {
    backgroundColor: "#d9d9d9",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#8BAA21",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff8e1",
    fontSize: 18,
    fontWeight: "bold",
  },
});
