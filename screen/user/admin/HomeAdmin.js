import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, TextInput, Dimensions, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper'; 
import { themeColors } from '../../../theme/theme';
import { getAuth, signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeAdmin() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleSelections, setRoleSelections] = useState({});

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(getFirestore(), 'users'));
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const userRef = doc(getFirestore(), 'users', userId);
      await updateDoc(userRef, { role: newRole });
      Alert.alert('Success', 'User role updated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert('Error', 'Failed to update user role.');
    }
  };

  const handleLogout = async () => {
    const auth = getAuth(); 
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat logout');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const petugas = filteredUsers.filter(user => user.role === 'petugas');
  const regularUsers = filteredUsers.filter(user => user.role === 'user');

  const handleRoleSelection = (userId, newRole) => {
    setRoleSelections((prevState) => ({
      ...prevState,
      [userId]: newRole
    }));
  };

  const UserCard = ({ user, isOfficer = false }) => (
    <View style={styles.userCard}>
      <View style={styles.userCardContent}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || 'Unknown User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[
            styles.roleBadge, 
            { backgroundColor: isOfficer ? '#4CAF50' : '#2196F3' }
          ]}>
            <Text style={styles.roleBadgeText}>
              {isOfficer ? 'Petugas' : 'User'}
            </Text>
          </View>
        </View>
        
        <View style={styles.roleActions}>
          <RadioButton.Group
            onValueChange={(newRole) => handleRoleSelection(user.id, newRole)}
            value={roleSelections[user.id] || user.role}
          >
            <View style={styles.radioContainer}>
              <View style={styles.radioOption}>
                <RadioButton 
                  value="petugas" 
                  color="#4CAF50"
                />
                <Text style={styles.radioLabel}>Petugas</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton 
                  value="user" 
                  color="#2196F3"
                />
                <Text style={styles.radioLabel}>User</Text>
              </View>
            </View>
          </RadioButton.Group>
          
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => handleRoleChange(user.id, roleSelections[user.id] || user.role)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const StatsCard = ({ title, count, icon, color, gradient }) => (
    <LinearGradient colors={gradient} style={styles.statsCard}>
      <View style={styles.statsContent}>
        <View style={[styles.statsIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.statsText}>
          <Text style={styles.statsNumber}>{count}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerUserInfo}>
            <Text style={styles.welcomeText}>Selamat Datang</Text>
            <Text style={styles.adminName}>Keith Administrator</Text>
            <Text style={styles.adminRole}>Super Admin</Text>
          </View>
          <TouchableOpacity style={styles.profileContainer}>
            <Image
              source={{ uri: 'https://i.pinimg.com/originals/80/5b/49/805b490a98ba4396c335ee732e6e67b9.jpg' }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsContainer}>
          <StatsCard 
            title="Total Petugas"
            count={petugas.length}
            icon="people"
            color="#4CAF50"
            gradient={['#4CAF50', '#45a049']}
          />
          <StatsCard 
            title="Total Users"
            count={regularUsers.length}
            icon="person"
            color="#2196F3"
            gradient={['#2196F3', '#1976D2']}
          />
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berdasarkan nama atau email..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Daftar Petugas</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{petugas.length}</Text>
            </View>
          </View>
          {petugas.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Belum ada petugas terdaftar</Text>
            </View>
          ) : (
            petugas.map((user) => (
              <UserCard key={user.id} user={user} isOfficer={true} />
            ))
          )}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Daftar Users</Text>
            <View style={[styles.sectionBadge, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.sectionBadgeText}>{regularUsers.length}</Text>
            </View>
          </View>
          {regularUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Belum ada user terdaftar</Text>
            </View>
          ) : (
            regularUsers.map((user) => (
              <UserCard key={user.id} user={user} isOfficer={false} />
            ))
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomNavContainer}>
        <LinearGradient 
          colors={['#fff', '#f8f9ff']} 
          style={styles.bottomNav}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('HomeAdmin')}
            style={[styles.navButton, styles.activeNavButton]}
          >
            <View style={styles.navIconContainer}>
              <Ionicons name="home" size={24} color="#667eea" />
            </View>
            <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('CariRole')}
            style={styles.navButton}
          >
            <View style={styles.navIconContainer}>
              <Ionicons name="search-outline" size={24} color="#999" />
            </View>
            <Text style={styles.navText}>Search</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.navButton}
          >
            <View style={styles.navIconContainer}>
              <Ionicons name="log-out-outline" size={24} color="#999" />
            </View>
            <Text style={styles.navText}>Logout</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerUserInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  adminName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  profileContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 3,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  statsCard: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statsText: {
    flex: 1,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userCardContent: {
    padding: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  roleActions: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  radioContainer: {
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    alignItems: 'center',
    flex: 1,
  },
  activeNavButton: {
    transform: [{ scale: 1.1 }],
  },
  navIconContainer: {
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#667eea',
    fontWeight: '600'
  }
});
