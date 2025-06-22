import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity,  Image,  StatusBar, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { themeColors } from '../theme/theme';

const { width, height } = Dimensions.get('window');

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
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Terjadi kesalahan saat logout');
            }
          }
        }
      ]
    );
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

  const profileMenus = [
    {
      id: 1,
      title: isProfileCompleted ? 'Edit Profil' : 'Lengkapi Profil',
      icon: 'person-outline',
      color: '#4facfe',
      action: handleEditProfile
    },
    {
      id: 2,
      title: 'Pengaturan',
      icon: 'settings-outline',
      color: '#43e97b',
      action: () => Alert.alert('Info', 'Fitur dalam pengembangan')
    },
    {
      id: 3,
      title: 'Bantuan',
      icon: 'help-circle-outline',
      color: '#fa709a',
      action: () => Alert.alert('Info', 'Fitur dalam pengembangan')
    },
    {
      id: 4,
      title: 'Tentang Aplikasi',
      icon: 'information-circle-outline',
      color: '#a8edea',
      action: () => Alert.alert('Info', 'Fitur dalam pengembangan')
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8BAA21" />
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#8BAA21', '#6d8f1a']}
          style={styles.headerGradient}
        />
        <Image
          source={require('../assets/images/back.png')}
          style={styles.headerBackgroundImage}
        />
        <LinearGradient
          colors={['rgba(139,170,33,0.8)', 'rgba(139,170,33,0.6)']}
          style={styles.headerOverlay}
        />
        <View style={styles.profileHeaderContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Ionicons name="person" size={40} color="#8BAA21" />
            </View>
          </View>
          
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.userName}>{userData?.name || 'Nama Pengguna'}</Text>
            <Text style={styles.userEmail}>{auth.currentUser?.email || 'Email'}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: isProfileCompleted ? '#4CAF50' : '#FF9800' }
            ]}>
              <Ionicons 
                name={isProfileCompleted ? "checkmark-circle" : "warning"} 
                size={12} 
                color="#fff" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {isProfileCompleted ? 'Profil Lengkap' : 'Profil Belum Lengkap'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#8BAA21" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Alamat</Text>
                <Text style={styles.infoValue}>
                  {userData?.address || 'Alamat belum diisi'}
                </Text>
              </View>
            </View>           
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color="#8BAA21" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Nomor Telepon</Text>
                <Text style={styles.infoValue}>
                  {userData?.phone || 'Nomor belum diisi'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {profileMenus.map((menu) => (
            <TouchableOpacity
              key={menu.id}
              style={styles.menuItem}
              onPress={menu.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIconContainer, { backgroundColor: menu.color + '20' }]}>
                  <Ionicons name={menu.icon} size={24} color={menu.color} />
                </View>
                <Text style={styles.menuItemText}>{menu.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Keluar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>
       <View style={styles.navbar}>
              <LinearGradient
                colors={["#ffffff", "#f8fafc"]}
                style={styles.navbarGradient}
              >
                <TouchableOpacity onPress={() => navigation.navigate("DaftarBarang")} style={styles.navItem}>
                  <View style={styles.navIconContainer}>
                    <Ionicons name="search-outline" size={24} color={themeColors.primary} />
                  </View>
                  <Text style={styles.navText}>Belanja</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => navigation.navigate("Home")} style={[styles.navItem]}>
                  <View style={[styles.navIconContainer]}>
                    <Ionicons name="home" size={24} color="#fff" />
                  </View>
                  <Text style={[styles.navText]}>Home</Text>
                </TouchableOpacity>
                
               <TouchableOpacity onPress={() => navigation.navigate("Profil")} style={[styles.navItem, styles.activeNavItem]}>
                           <View style={[styles.navIconContainer, styles.activeNavIcon]}>
                             <Ionicons name="person" size={24} color="#fff" />
                           </View>
                           <Text style={[styles.navText, styles.activeNavText]}>Profil</Text>
                         </TouchableOpacity>
              </LinearGradient>
            </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    height: height * 0.3,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.3,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileHeaderContent: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
  },
  infoSection: {
    padding: 20,
    paddingTop: 30,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  menuSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutSection: {
    padding: 20,
    paddingTop: 10,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 120,
  },
   
    navbar: {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      elevation: 20,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: -5 },
      shadowRadius: 15,
    },
    navbarGradient: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      height: 70,
      paddingBottom: 10,
      paddingTop: 10,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    navItem: {
      alignItems: "center",
      paddingVertical: 5,
    },
    activeNavItem: {
      transform: [{ translateY: -5 }],
    },
    navIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(96, 165, 250, 0.1)",
    },
    activeNavIcon: {
      backgroundColor: "#60a5fa",
      elevation: 4,
      shadowColor: "#60a5fa",
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
    },
    navText: {
      fontSize: 11,
      color: themeColors.primary,
      marginTop: 4,
      fontWeight: "600",
    },
    activeNavText: {
      color: "#60a5fa",
      fontWeight: "700",
    },
  
  });