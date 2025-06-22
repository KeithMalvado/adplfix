import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity,  Image, Dimensions, StatusBar, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getAuth, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { themeColors } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
    navigation.navigate('CariBarang', { searchQuery });
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

    const features = [
    {
      id: 1,
      name: "Artikel",
      icon: "book-outline",
      route: "Artikel",
      gradient: ["#667eea", "#764ba2"],
      description: "Baca artikel terbaru",
      shadowColor: "#667eea",
    },
    {
      id: 2,
      name: "Keranjang",
      icon: "cart-outline",
      route: "Cart",
      gradient: ["#f093fb", "#f5576c"],
      description: "Lihat keranjang",
      shadowColor: "#f093fb",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Enhanced Header */}
      <View style={styles.headerContainer}>
        <Image
          source={require("../assets/images/back.png")}
          style={styles.backgroundImage}
        />
        <LinearGradient
          colors={["rgba(30,41,59,0.8)", "rgba(30,41,59,0.4)", "rgba(30,41,59,0.1)"]}
          style={styles.gradientOverlay}
        />
        
        {/* Floating particles effect */}
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <View style={styles.titleUnderline} />
          </View>
          <Text style={styles.headerSubtitle}>Pilih fitur yang ingin digunakan</Text>
          
          {/* Welcome badge */}
          <View style={styles.welcomeBadge}>
            <Ionicons name="star" size={12} color="#ffd700" />
            <Text style={styles.welcomeText}>Selamat Datang!</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fitur Utama</Text>
          <View style={styles.sectionDivider} />
        </View>

        <View style={styles.featureGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                { 
                  shadowColor: feature.shadowColor,
                  transform: [{ scale: 1 }]
                }
              ]}
              onPress={() => navigation.navigate(feature.route)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Decorative elements */}
                <View style={styles.decorativeCircle1} />
                <View style={styles.decorativeCircle2} />
                
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={feature.icon} size={32} color="#fff" />
                    <View style={styles.iconGlow} />
                  </View>
                  
                  <View style={styles.textContainer}>
                    <Text style={styles.featureName}>{feature.name}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  
                  {/* Arrow indicator */}
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
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
          
          <TouchableOpacity onPress={() => navigation.navigate("Home")} style={[styles.navItem, styles.activeNavItem]}>
            <View style={[styles.navIconContainer, styles.activeNavIcon]}>
              <Ionicons name="home" size={24} color="#fff" />
            </View>
            <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.navItem}>
            <View style={styles.navIconContainer}>
              <Ionicons name="person-outline" size={24} color={themeColors.primary} />
            </View>
            <Text style={styles.navText}>Profil</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  headerContainer: {
    height: height * 0.32,
    position: "relative",
    overflow: "hidden",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 50,
  },
  particle1: {
    width: 60,
    height: 60,
    top: "20%",
    right: "10%",
  },
  particle2: {
    width: 40,
    height: 40,
    top: "60%",
    right: "80%",
  },
  particle3: {
    width: 30,
    height: 30,
    top: "40%",
    right: "40%",
  },
  headerContent: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  titleContainer: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: "#60a5fa",
    borderRadius: 2,
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  welcomeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -5 },
    shadowRadius: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  sectionDivider: {
    width: 40,
    height: 3,
    backgroundColor: "#60a5fa",
    borderRadius: 2,
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    marginBottom: 16,
  },
  featureGradient: {
    padding: 20,
    minHeight: 120,
    position: "relative",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -20,
    right: -20,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -10,
    left: -10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    position: "relative",
  },
  iconGlow: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  featureName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  featureDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 16,
    fontWeight: "500",
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  statsGradient: {
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 20,
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