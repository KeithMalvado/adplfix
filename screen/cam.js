import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Cam() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [detections, setDetections] = useState([]);
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const takeAndSendPicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setPhotoUri(photo.uri);  // Simpan URI foto

      const res = await fetch("http://192.168.1.3:5000/predict", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photo.base64 })
      });

      const result = await res.json();
      setDetections(result);  // Simpan hasil deteksi
    }
  };

  const renderBoundingBoxes = () => {
    return detections.map((detection, index) => {
      const { box, confidence } = detection;
      const [x1, y1, x2, y2] = box;
      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: y1,
            left: x1,
            width: x2 - x1,
            height: y2 - y1,
            borderWidth: 2,
            borderColor: 'red',
            backgroundColor: 'transparent'
          }}
        >
          <Text style={{ color: 'red', position: 'absolute', top: -20, left: 0 }}>
            Confidence: {confidence}
          </Text>
        </View>
      );
    });
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
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <View style={styles.buttonContainer}>
        <Button title="Scan Telur" onPress={takeAndSendPicture} />
      </View>
      
      {/* Menampilkan hasil gambar dan bounding box */}
      {photoUri && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Image source={{ uri: photoUri }} style={{ flex: 1, resizeMode: 'contain' }} />
          {renderBoundingBoxes()}
        </View>
      )}
    </View>
  );
}

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
  }
});
