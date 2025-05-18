import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { realtimeDb } from '../firebase/index';

export default function Riwayat() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const riwayatRef = ref(realtimeDb, 'riwayat');
    const unsubscribe = onValue(riwayatRef, snapshot => {
      const val = snapshot.val();
      if (!val) {
        setRiwayat([]);
        setLoading(false);
        return;
      }

      const dataArray = Object.keys(val).map(tanggal => {
        const itemPerTanggal = val[tanggal];
        const items = Object.values(itemPerTanggal || {});

        let jumlahTelurBagus = 0;
        let jumlahTelurRusak = 0;

        const gambarList = [];

        items.forEach(item => {
          if (item.gambar) {
            gambarList.push(item.gambar);
          }

          if (Array.isArray(item.deteksi)) {
            item.deteksi.forEach(d => {
              if (d.class === 0) jumlahTelurBagus++;
              else if (d.class === 1) jumlahTelurRusak++;
            });
          }
        });

        return {
          tanggal,
          scan: items.length,
          telurBagus: jumlahTelurBagus,
          telurRusak: jumlahTelurRusak,
          gambarList
        };
      });

      dataArray.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setRiwayat(dataArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {Array.isArray(riwayat) && riwayat.map((item, index) => (
        <View style={styles.card} key={index}>
          <Text style={styles.date}>{item.tanggal}</Text>
          <Text style={styles.count}>Jumlah Scan: {item.scan}</Text>
          <Text style={styles.good}>Telur Bagus: {item.telurBagus}</Text>
          <Text style={styles.bad}>Telur Rusak: {item.telurRusak}</Text>
          <ScrollView horizontal>
            {item.gambarList.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                style={styles.image}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff8e1'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6
  },
  count: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2
  },
  good: {
    fontSize: 14,
    color: 'green',
    marginBottom: 2
  },
  bad: {
    fontSize: 14,
    color: 'red',
    marginBottom: 8
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8
  }
});
