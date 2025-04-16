import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { themeColors } from '../theme/theme';

export default function ProfileScreen() {
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
        <Ionicons name="person-circle-outline" size={80} color="#000" style={styles.profileIcon} />
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
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={styles.navButton}
              >
                <Ionicons name="home-outline" size={30} color="#fff8e1" />
                <Text style={{ color: '#fff8e1', fontWeight:'bold' }}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('camera')}
                style={styles.navButton}
              >
                <Ionicons name="camera-outline" size={30} color="#fff8e1"/>
                <Text style={{ color: '#fff8e1', fontWeight:'bold' }}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('CariBarang')}
                style={styles.navButton}
              >
                <Ionicons name="search-outline" size={30} color="#fff8e1" />
                <Text style={{ color: '#fff8e1', fontWeight:'bold' }}>Search</Text>
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
  },
  gambar:{
    paddingVertical: 50,
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    marginBottom: 12,
  },
  profileIcon: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue'
  },
  userDetails: {
    fontSize: 14,
    color: 'black',
    marginTop: 2,
    fontWeight: 'bold'
  },
  profileStatus: {
    marginVertical: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#00796b',
  },
  editButton: {
    backgroundColor: '#974714',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',

  },
  logoutButton: {
    backgroundColor: '#E59315',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
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
});
