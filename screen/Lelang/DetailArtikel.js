import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function DetailArtikel({ route }) {
  const { artikel } = route.params;
  const [showFullContent, setShowFullContent] = useState(false);

  const maxChars = 1500;

  const getShortContent = () => {
    return artikel.isi.substring(0, maxChars) + '...';
  };

  return (
    <ScrollView style={styles.container}>
      {artikel.gambar && (
        <Image source={{ uri: artikel.gambar }} style={styles.image} />
      )}
      <Text style={styles.title}>{artikel.judul}</Text>

      <Text style={styles.content}>
        {showFullContent || artikel.isi.length <= maxChars
          ? artikel.isi
          : getShortContent()}
      </Text>

      {artikel.isi.length > maxChars && (
        <TouchableOpacity onPress={() => setShowFullContent(!showFullContent)}>
          <Text style={styles.readMore}>
            {showFullContent ? 'Sembunyikan' : 'Baca Selengkapnya'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.date}>
        {new Date(artikel.createdAt).toLocaleDateString()}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 16
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12
  },
  content: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12
  },
  readMore: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
    marginBottom: 20
  },
  date: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right'
  }
});
