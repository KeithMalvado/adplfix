
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getAuth, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { themeColors } from '../theme/theme';

export default function App() {
  return <HomeScreen />;
}

function HomeScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) {
          console.log('Pengguna terverifikasi:', user.email);
        } else {
          sendEmailVerification(user).then(() => {
            Alert.alert(
              'Verifikasi Email',
              'Silakan verifikasi email Anda. Kami telah mengirimkan email verifikasi.'
            );
          }).catch((error) => {
            console.log('Error mengirimkan email verifikasi:', error);
          });
          Alert.alert(
            'Verifikasi Email',
            'Silakan verifikasi email Anda terlebih dahulu.'
          );
          signOut(auth);
          navigation.replace('Login');
        }
      } else {
        navigation.replace('Login');
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        setUserData(userDoc);
        setIsProfileCompleted(userDoc.isProfileCompleted);  
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFocus = () => {
    navigation.navigate('CariBara ng', { searchQuery });
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleFeatureNavigation = (feature) => {
    if (!isProfileCompleted) {
      Alert.alert(
        'Lengkapi Data Diri',
        'Harap isi semua informasi sebelum menggunakan fitur ini.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DataUser'),
          },
        ]
      );
      return; 
    }
    navigation.navigate(feature);
  };

  const handleSaveProfile = async (newData) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, newData);
      setUserData((prevData) => ({ ...prevData, ...newData }));
      setIsProfileCompleted(true); 
      Alert.alert('Data berhasil disimpan');
    }
  };

  const services = [
    { id: '1', title: 'Pakan Ternak', image: require('../assets/images/farm.jpg') },
    { id: '2', title: 'Kesehatan Ayam', image: require('../assets/images/farm1.jpg') },
    { id: '3', title: 'Manajemen Kandang', image: require('../assets/images/farm3.jpeg') }
  ];

  return (
    <View style={styles.container}>
    <View style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <View style={styles.profileContainer}>
        <Ionicons
          name="person-circle-outline"
          size={70}
          color="black"
          style={styles.profileIcon}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData?.name || 'Nama Pengguna'}</Text>
          <Text style={styles.userDetails}>Welcome</Text>
        </View>
      </View>
      <View>
        <TextInput
          style={styles.searchBar}
          placeholder="Cari Artikel?"
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={handleFocus}  
        />
        </View>
      <View style={styles.serviceContainer}>
      <FlatList
          data={services}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <Image source={item.image} style={styles.serviceImage} />
              <Text style={styles.serviceTitle}>{item.title}</Text>
            </View>
          )}
        />
    </View>
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.navButton}
        >
          <Ionicons name="home-outline" size={30} color="#fff8e1" />
          <Text style={{ color: '#fff8e1', fontWeight:'bold' }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('DaftarBarang')}
          style={styles.navButton}
        >
          <Ionicons name="search-outline" size={30} color="#fff8e1" />
          <Text style={{ color: '#fff8e1', fontWeight:'bold' }}>Belanja</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Artikel')}
          style={styles.navButton}
        >
          <Ionicons name="book-outline" size={30} color="#fff8e1"/>
          <Text style={{ color: '#fff8e1', fontWeight:'bold' }}>Artikel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.navButton}
        >
          <Ionicons name="person-outline" size={30} color="#fff8e1"/>
          <Text style={{ color: '#fff8e1', fontWeight:'bold' }}>Profile</Text>
        </TouchableOpacity>
        <View style={styles.gambar}>
        <Image
          source={require('../assets/images/back.png')}
          style={{ width: '100%', height: 325, resizeMode: 'cover' }}/>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 20,
    color: 'white'
  },
  gambar:{
    paddingVertical: 50,
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
  allText: {
    fontSize: 14,
    color: 'blue',
    fontWeight: 'bold'
  },  
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    marginBottom: 12,
  },
  profileIcon: {
    marginRight: 5,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'blue',
  },
  userDetails: {
    fontSize: 12,
    color: 'black',
    marginTop: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceContainer: {
    marginBottom: 20,
    paddingVertical: 10,
  },
  serviceImage: {
    width: 180,
    height: 110,
    marginBottom: 10,
    borderRadius: 10
  },
  serviceCard: {
    justifyContent: "center",
    alignItems: 'center',
    padding: 9,
    width: 200,
    height: 150, 
    marginRight: 1, 
  },
  serviceTitle: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
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
  searchBar: {
    backgroundColor: "#fff8e1",
    height: 40,
    borderColor:'black',
    borderWidth: 1.5,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  navButton: {
    alignItems: 'center',
  },
});
