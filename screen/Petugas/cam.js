import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ref, push } from 'firebase/database';
import { realtimeDb } from '../firebase/index';
import { Ionicons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function Cam({ navigation }) {  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [photoUri, setPhotoUri] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [yoloImageSize, setYoloImageSize] = useState({ width: 1, height: 1 });

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const saveToRiwayat = (data, uri) => {
    const date = new Date().toISOString().split('T')[0];
    const waktu = new Date().toISOString();

    const riwayatRef = ref(realtimeDb, `riwayat/${date}`);
    const riwayatData = {
      gambar: uri,
      deteksi: data,
      waktu: waktu
    };

    push(riwayatRef, riwayatData)
      .then(() => console.log('Riwayat berhasil disimpan.'))
      .catch(error => console.error('Gagal simpan riwayat:', error));
  };

  const takeAndSendPicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setPhotoUri(photo.uri);

      try {
        const res = await fetch("http://192.168.123.157:5000/predict", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: photo.base64 })
        });

        const result = await res.json();
        setDetections(Array.isArray(result.detections) ? result.detections : []);
        setYoloImageSize({
          width: result.image_width || 1,
          height: result.image_height || 1
        });
        saveToRiwayat(result.detections, photo.uri);
      } catch (error) {
        console.error('Gagal mengirim gambar:', error);
      }
    }
  };

  const renderBoundingBoxes = () => {
    if (!Array.isArray(detections)) return null;
    return detections.map((detection, index) => {
      const { box, confidence, class: classId } = detection;
      const [x1, y1, x2, y2] = box;

      // Gunakan ukuran YOLO, bukan imageSize dari kamera
      const scaleX = windowWidth / yoloImageSize.width;
      const scaleY = windowHeight / yoloImageSize.height;

      const className = classId === 0 ? 'Telur Bagus' : 'Telur Rusak';

      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: x1 * scaleX,
            top: y1 * scaleY,
            width: (x2 - x1) * scaleX,
            height: (y2 - y1) * scaleY,
            borderWidth: 2,
            borderColor: 'red',
            backgroundColor: 'transparent',
          }}
        >
          <Text style={{ color: 'red', backgroundColor: 'white', fontSize: 12 }}>
            {className} ({(confidence * 100).toFixed(1)}%)
          </Text>
        </View>
      );
    });
  };

  const handleRefresh = () => {
    setDetections([]);
    setPhotoUri(null);
  };

  if (!permission) {
    return <View style={styles.center}><Text>Memeriksa izin kamera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Izinkan akses kamera untuk melanjutkan</Text>
        <Button title="Izinkan" onPress={requestPermission} />
      </View>
    );
  }

 return (
  <View style={{ flex: 1 }}>
    {!photoUri ? (
      <>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View style={styles.buttonContainer}>
          <Button title="Scan Telur" onPress={takeAndSendPicture} />
        </View>
      </>
    ) : (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]}>
        <Image
          source={{ uri: photoUri }}
          style={{ width: windowWidth, height: windowHeight, position: 'absolute', top: 0, left: 0 }}
          resizeMode="contain"
        />
        {renderBoundingBoxes()}
        <Ionicons
          name="refresh-outline"
          size={30}
          color="black"
          style={styles.refreshButton}
          onPress={handleRefresh}
        />
        <Ionicons
          name="list-outline"
          size={30}
          color="black"
          style={styles.riwayatButton}
          onPress={() => navigation.navigate('Riwayat')}
        />
      </View>
    )}
  </View>
);}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10
  },
  refreshButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 1
  },
  riwayatButton: {
    position: 'absolute',
    top: 30,
    right: 70,
    zIndex: 1
  }
});