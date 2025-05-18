import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfilePetugas() {
  const navigation = useNavigation();
  const db = getFirestore();
  const auth = getAuth();

  const [userData, setUserData] = useState(null);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userDoc = docSnap.data();
        setUserData(userDoc);
        setIsProfileCompleted(userDoc.isProfileCompleted);  
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');  
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat logout');
    }
  };

  const handleEditProfile = () => {
    if (!isProfileCompleted) {
      Alert.alert(
        'Lengkapi Data Diri',
        'Harap isi semua informasi sebelum melanjutkan.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DataUser'),  
          },
        ]
      );
    } else {
      navigation.navigate('EditUser');  
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#782F06" style={styles.profileIcon} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData?.name || 'Nama Pengguna'}</Text>
          <Text style={styles.userDetails}>
            {userData?.address || 'Alamat belum diisi'}
          </Text>
          <Text style={styles.userDetails}>
            Hp: {userData?.phone || 'Nomor belum diisi'}
          </Text>
        </View>
      </View>
      <View style={styles.profileStatus}>
        <Text style={styles.statusText}>
          {isProfileCompleted ? 'Profil Anda sudah lengkap' : 'Profil Anda belum lengkap'}
        </Text>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.editButtonText}>
          {isProfileCompleted ? 'Edit Profil' : 'Lengkapi Profil'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("HCpetugas")} style={styles.navButton}>
          <Ionicons name="home-outline" size={30} color="#fff8e1" />
          <Text style={{ color: '#fff8e1', fontWeight: 'bold' }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Cam")} style={styles.navButton}>
          <Ionicons name="camera-outline" size={30} color="#fff8e1" />
          <Text style={{ color: '#fff8e1', fontWeight: 'bold' }}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TambahBarang')} style={styles.navButton}>
          <Ionicons name="cube-outline" size={30} color="#fff8e1" />
          <Text style={{ color: '#fff8e1', fontWeight: 'bold' }}>Telur</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ProfilPetugas")} style={styles.navButton}>
          <Ionicons name="person-outline" size={30} color="#ffff" />
          <Text style={{ color: '#fff8e1', fontWeight: 'bold' }}>Profil</Text>
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
    color: '#782F06',
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
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#F8AB29',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  profileStatus: {
    marginVertical: 20,
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#8EAD21',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
