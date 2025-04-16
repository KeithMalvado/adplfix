import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { RadioButton } from 'react-native-paper'; 
import { themeColors } from '../../../theme/theme';
import { getAuth, signOut } from 'firebase/auth';

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
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const Petugas = filteredUsers.filter(user => user.role === 'petugas');
  const regularUsers = filteredUsers.filter(user => user.role === 'user');

  const handleRoleSelection = (userId, newRole) => {
    setRoleSelections((prevState) => ({
      ...prevState,
      [userId]: newRole
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Hello Keith</Text>
            <Text style={styles.userDetails}>Admin High</Text>
          </View>
          <Image
            source={{ uri: 'https://i.pinimg.com/originals/80/5b/49/805b490a98ba4396c335ee732e6e67b9.jpg' }}
            style={styles.profileImage}
          />
        </View>
        <TextInput
          style={styles.searchBar}
          placeholder="Cari Email user/petugas?"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Text style={styles.sectionTitle}>Daftar Petugas</Text>
        {Petugas.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <Text style={styles.userCardText}>{user.name} ({user.email})</Text>
            <View style={styles.roleButtons}>
              <RadioButton.Group
                onValueChange={(newRole) => handleRoleSelection(user.id, newRole)}
                value={roleSelections[user.id] || user.role}
              >
                <View style={styles.radioButtonContainer}>
                  <RadioButton value="petugas" />
                  <Text style={styles.radioButtonLabel}>Petugas</Text>
                </View>
                <View style={styles.radioButtonContainer}>
                  <RadioButton value="user" />
                  <Text style={styles.radioButtonLabel}>User</Text>
                </View>
              </RadioButton.Group>
              <TouchableOpacity
                style={styles.updateRoleButton}
                onPress={() => handleRoleChange(user.id, roleSelections[user.id] || user.role)}
              >
                <Text style={styles.updateRoleButtonText}>Edit Role</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <Text style={styles.sectionTitle}>Daftar Users</Text>
        {regularUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <Text style={styles.userCardText}>{user.name} ({user.email})</Text>
            <View style={styles.roleButtons}>
              <RadioButton.Group
                onValueChange={(newRole) => handleRoleSelection(user.id, newRole)}
                value={roleSelections[user.id] || user.role}
              >
                <View style={styles.radioButtonContainer}>
                  <RadioButton value="petugas" />
                  <Text style={styles.radioButtonLabel}>Petugas</Text>
                </View>
                <View style={styles.radioButtonContainer}>
                  <RadioButton value="user" />
                  <Text style={styles.radioButtonLabel}>User</Text>
                </View>
              </RadioButton.Group>
              <TouchableOpacity
                style={styles.updateRoleButton}
                onPress={() => handleRoleChange(user.id, roleSelections[user.id] || user.role)}
              >
                <Text style={styles.updateRoleButtonText}>Edit Role</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeAdmin')}
          style={styles.navButton}
        >
          <Ionicons name="home-outline" size={30} color="#000" />
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CariRole')}
          style={styles.navButton}
        >
          <Ionicons name="search-outline" size={30} color="#000" />
          <Text>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.navButton}
        >
          <Ionicons name="log-out-outline" size={30} color="#000" /> 
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 80, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    fontSize: 14,
    color: '#555',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 10,
  },
  searchBar: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  userCard: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCardText: {
    fontSize: 14,
    flex: 1,
  },
  roleButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonLabel: {
    fontSize: 14,
    marginLeft: 5,
  },
  updateRoleButton: {
    backgroundColor: themeColors.bg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  updateRoleButtonText: {
    color: '#000',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 50,
    right: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 30,
  },
  navButton: {
    alignItems: 'center',
  },
});
