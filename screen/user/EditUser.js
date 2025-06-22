import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView,  Platform, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { doc, getDocs, query, where, collection, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ScreenDataUser({ onAdd }) {
  const [namaUser, setNamaUser] = useState('');
  const [alamatUser, setAlamatUser] = useState('');
  const [ktpUser, setKtpUser] = useState('');
  const [phoneUser, setPhoneUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const navigation = useNavigation();
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
        Alert.alert('Berhasil', 'Data profil berhasil diperbarui');
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
        Alert.alert('Berhasil', 'Data profil berhasil disimpan');
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

  const renderInputField = (label, value, onChangeText, placeholder, keyboardType = 'default', fieldKey, icon) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        focusedField === fieldKey && styles.inputWrapperFocused
      ]}>
        <View style={styles.inputIconContainer}>
          <Ionicons name={icon} size={20} color={focusedField === fieldKey ? '#8BAA21' : '#999'} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={styles.input}
          keyboardType={keyboardType}
          placeholderTextColor="#999"
          onFocus={() => setFocusedField(fieldKey)}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {userId ? 'Edit Profil' : 'Lengkapi Profil'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons name="document-text-outline" size={24} color="#8BAA21" />
              <Text style={styles.formTitle}>Data Pribadi</Text>
            </View>

            {renderInputField(
              'Nama Lengkap',
              namaUser,
              setNamaUser,
              'Masukkan nama lengkap',
              'default',
              'nama',
              'person-outline'
            )}

            {renderInputField(
              'Alamat Lengkap',
              alamatUser,
              setAlamatUser,
              'Masukkan alamat lengkap',
              'default',
              'alamat',
              'location-outline'
            )}

            {renderInputField(
              'Nomor KTP',
              ktpUser,
              setKtpUser,
              'Masukkan 16 digit nomor KTP',
              'number-pad',
              'ktp',
              'card-outline'
            )}

            {renderInputField(
              'Nomor Handphone',
              phoneUser,
              setPhoneUser,
              'Contoh: 08123456789',
              'phone-pad',
              'phone',
              'call-outline'
            )}
            <TouchableOpacity
              onPress={handleAdd}
              style={styles.submitButton}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#999'] : ['#8BAA21', '#6d8f1a']}
                style={styles.submitGradient}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="sync" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Menyimpan...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      {userId ? 'Update Profil' : 'Simpan Profil'}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#8BAA21',
    backgroundColor: '#fff',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#8BAA21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 40,
  },
};