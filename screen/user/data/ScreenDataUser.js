import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { themeColors } from '../../../theme/theme'; 
import { useNavigation, useRoute } from '@react-navigation/native'; 
import { doc, getDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { getFirestore, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ScreenDataUser({ onAdd }) {
  const [namaUser, setNamaUser] = useState('');
  const [alamatUser, setAlamatUser] = useState('');
  const [ktpUser, setKtpUser] = useState('');
  const [phoneUser, setPhoneUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);

  const navigation = useNavigation();
  const route = useRoute();
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);

      const fetchUserData = async () => {
        const q = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setUserId(querySnapshot.docs[0].id);  
          setNamaUser(docData.name || '');
          setAlamatUser(docData.address || '');
          setKtpUser(docData.ktp || '');
          setPhoneUser(docData.phone || '');
        }
      };

      fetchUserData();
    }
  }, [auth, db]);

  const handleAdd = async () => {
    if (!namaUser || !alamatUser || !ktpUser || !phoneUser) {
      Alert.alert('Error', 'Semua data wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (userId) {
        await updateDoc(doc(db, 'users', userId), {
          name: namaUser,
          address: alamatUser,
          ktp: ktpUser,
          phone: phoneUser,
          isProfileCompleted: true,
        });
        Alert.alert('Success', 'User data updated successfully');
      } else {
        await addDoc(collection(db, 'users'), {
          name: namaUser,
          address: alamatUser,
          ktp: ktpUser,
          phone: phoneUser,
          createdAt: serverTimestamp(),
          email: userEmail,
          isProfileCompleted: true,
        });
        Alert.alert('Success', 'User added successfully');
      }

      setNamaUser('');
      setAlamatUser('');
      setKtpUser('');
      setPhoneUser('');
      
      if (onAdd && typeof onAdd === 'function') {
        onAdd();
      }

      navigation.goBack(); 
    } catch (error) {
      console.error('Error adding or updating user: ', error);
      Alert.alert('Error', 'There was an issue saving the user data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.bg }}>
      <View style={{ flex: 1, justifyContent: 'space-around', marginTop: 16, marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
            color: themeColors.text,
            marginBottom: 16,
          }}
        >
          {userId ? 'Edit User' : 'Tambah User'}
        </Text>

        <View style={{ marginHorizontal: 28 }}>
          <TextInput
            value={namaUser}
            onChangeText={setNamaUser}
            placeholder="Masukkan Nama user"
            style={inputStyle}
          />
          <TextInput
            value={alamatUser}
            onChangeText={setAlamatUser}
            placeholder="Masukkan Alamat"
            style={inputStyle}
          />
          <TextInput
            value={ktpUser}
            onChangeText={setKtpUser}
            placeholder="Masukkan Nomor KTP"
            style={inputStyle}
          />
          <TextInput
            value={phoneUser}
            onChangeText={setPhoneUser}
            placeholder="Masukkan Nomor Handphone"
            style={inputStyle}
          />
          <TouchableOpacity
            onPress={handleAdd}
            style={{
              paddingVertical: 12,
              backgroundColor: themeColors.button,
              borderRadius: 16,
              marginBottom: 16,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                color: themeColors.textSecondary,
              }}
            >
              {loading ? 'Loading...' : 'Simpan'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const inputStyle = {
  padding: 16,
  backgroundColor: themeColors.secondary,
  color: themeColors.textSecondary,
  borderRadius: 16,
  marginBottom: 16,
  fontSize: 16,
};

