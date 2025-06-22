import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, FlatList, StyleSheet, Alert, Animated, RefreshControl, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { themeColors } from '../../../theme/theme';

const { width } = Dimensions.get('window');

export default function CariAdmin({ navigation }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const animValues = useRef([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(getFirestore(), 'users'));
      const usersList = [];
      querySnapshot.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));

      setUsers(usersList);
      setFilteredUsers(usersList);

      animValues.current = usersList.map(() => new Animated.Value(0));
      Animated.stagger(
        100,
        animValues.current.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ),
      ).start();
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data user.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const auth = getAuth();
            try {
              await signOut(auth);
              navigation.replace('Login');
            } catch {
              Alert.alert('Error', 'Gagal logout.');
            }
          },
        },
      ],
    );
  };

  const filterUsers = (query, tab) => {
    let filtered = users;

    if (query.trim()) {
      filtered = filtered.filter(user =>
        (user.email && user.email.toLowerCase().includes(query.toLowerCase())) ||
        (user.name && user.name.toLowerCase().includes(query.toLowerCase())),
      );
    }

    if (tab === 'petugas') filtered = filtered.filter(user => user.role === 'petugas');
    else if (tab === 'users') filtered = filtered.filter(user => user.role === 'user');

    setFilteredUsers(filtered);

    animValues.current = filtered.map(() => new Animated.Value(0));
    Animated.stagger(
      100,
      animValues.current.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  const handleSearch = query => {
    setSearchQuery(query);
    filterUsers(query, activeTab);
  };

  const handleTabChange = tab => {
    setActiveTab(tab);
    filterUsers(searchQuery, tab);
  };

  const totalPetugas = users.filter(user => user.role === 'petugas').length;
  const totalUsers = users.filter(user => user.role === 'user').length;

  const getInitials = name => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserItem = ({ item, index }) => {
    const anim = animValues.current[index] || new Animated.Value(1);

    return (
      <Animated.View
        style={[
          styles.userCard,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: item.role === 'petugas' ? themeColors.bg : '#28a745' },
              styles.avatarShadow,
            ]}
          >
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name || 'Tanpa Nama'}</Text>
            <Text style={styles.userEmail}>{item.email || '-'}</Text>
          </View>

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: item.role === 'petugas' ? themeColors.bg : '#28a745' },
              styles.roleBadgeShadow,
            ]}
          >
            <Text style={styles.roleBadgeText}>
              {item.role === 'petugas' ? 'PETUGAS' : 'USER'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            <Ionicons
              name={item.role === 'petugas' ? 'shield-checkmark' : 'person'}
              size={16}
              color="#666"
            />
            <Text style={styles.statText}>
              {item.role === 'petugas' ? 'Petugas' : 'User Biasa'}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={themeColors.bg} />
        </TouchableOpacity>

        <Text style={styles.title}>Data Pengguna</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari pengguna..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabChange('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Semua ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'petugas' && styles.activeTab]}
          onPress={() => handleTabChange('petugas')}
        >
          <Text style={[styles.tabText, activeTab === 'petugas' && styles.activeTabText]}>
            Petugas ({totalPetugas})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'users' && styles.activeTab]}
          onPress={() => handleTabChange('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            User ({totalUsers})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Data pengguna tidak ditemukan</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightBg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  logoutButton: {
    width: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.bg,
  },
  searchContainer: {
    margin: 15,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 35,
    borderRadius: 25,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeTab: {
    backgroundColor: themeColors.bg,
  },
  tabText: {
    fontWeight: '600',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 7,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
  },
  userEmail: {
    color: '#777',
    fontSize: 14,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  roleBadgeShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  roleBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: 10,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  statText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 13,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
