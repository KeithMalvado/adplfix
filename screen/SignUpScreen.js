import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, SafeAreaView, Alert, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../screen/firebase/index';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { themeColors } from '../theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Registrasi = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const db = getFirestore();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Semua field wajib diisi.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan Konfirmasi Password tidak sama.');
      return;
    }

    const passwordPattern = /[!@#$%^&*(),.?":{}|<>]/;
    if (!passwordPattern.test(password)) {
      Alert.alert('Error', 'Harap memberikan suatu karakter pada password.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'user',
      });

      await sendEmailVerification(user);
      Alert.alert('Sukses', 'Akun berhasil dibuat. Silakan verifikasi email Anda.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeColors.bg,
        justifyContent: 'center',
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: themeColors.textSecondary,
          marginBottom: 30,
          textAlign: 'center',
        }}
      >
        Halaman Registrasi
        <View style={{ alignItems: 'center' }}>
          <Image
            source={require('../assets/images/farm1.png')}
            style={{ width: 250, height: 250, marginBottom: 1 }}
          />
        </View>
      </Text>
      <Text style={{ marginBottom: 8, color: themeColors.textSecondary, fontWeight: 'bold' }}>Email</Text>
      <TextInput
        style={{
          padding: 16,
          backgroundColor: themeColors.secondary,
          color: themeColors.textSecondary,
          borderRadius: 16,
          marginBottom: 12,
        }}
        placeholder="Masukan Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={{ marginBottom: 8, color: themeColors.textSecondary, fontWeight: 'bold' }}>Password</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.secondary,
          borderRadius: 16,
          marginBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 16,
            color: themeColors.textSecondary,
          }}
          placeholder="Masukan Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color={themeColors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <Text style={{ marginBottom: 8, color: themeColors.textSecondary, fontWeight: 'bold' }}>Konfirmasi Password</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: themeColors.secondary,
          borderRadius: 16,
          marginBottom: 12,
          paddingHorizontal: 16,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 16,
            color: themeColors.textSecondary,
          }}
          placeholder="Konfirmasi Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color={themeColors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          paddingVertical: 16,
          backgroundColor: themeColors.button,
          borderRadius: 16,
          marginBottom: 20,
          alignItems: 'center',
        }}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color:'white' }}>
          {loading ? 'Loading...' : 'Registrasi'}
        </Text>
      </TouchableOpacity>
      <Text style={{ textAlign: 'center', color: themeColors.primary }}>
        Sudah punya akun?{' '}
        <Text
          style={{ color: themeColors.textSecondary, fontWeight: 'bold' }}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Text>
      </Text>
    </SafeAreaView>
  );
};

export default Registrasi;
