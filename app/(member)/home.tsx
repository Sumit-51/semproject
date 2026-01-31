import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { Gym } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const LOCATIONS = [
  'Banepa',
  'Bhaktapur',
  'Dhulikhel',
  'Kathmandu',
  'Lalitpur',
];

const MemberHome: React.FC = () => {
  const { userData } = useAuth();
  const router = useRouter();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [sortByPrice, setSortByPrice] = useState<'asc' | 'desc' | null>(null);
  const [nearMe, setNearMe] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGyms();
  }, []);

  useEffect(() => {
    let list = [...gyms];

    // 🔍 Search
    if (searchText.trim()) {
      list = list.filter((gym) =>
        gym.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 📍 Location
    if (nearMe && selectedLocation) {
      list = list.filter((gym) =>
        gym.address?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // 💰 Price
    if (sortByPrice === 'asc') {
      list.sort((a, b) => a.monthlyFee - b.monthlyFee);
    }
    if (sortByPrice === 'desc') {
      list.sort((a, b) => b.monthlyFee - a.monthlyFee);
    }

    setFilteredGyms(list);
  }, [gyms, searchText, sortByPrice, nearMe, selectedLocation]);

  const fetchGyms = async () => {
    try {
      const gymsQuery = query(
        collection(db, 'gyms'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(gymsQuery);
      const gymsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Gym[];

      setGyms(gymsList);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderGymCard = ({ item }: { item: Gym }) => {
    const isEnrolled = userData?.gymId === item.id;
    const isPending = isEnrolled && userData?.enrollmentStatus === 'pending';
    const isApproved = isEnrolled && userData?.enrollmentStatus === 'approved';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/gymdetails/${item.id}`)}
      >
        <View style={[styles.gymCard, isEnrolled && styles.gymCardEnrolled]}>
          <View style={styles.gymIconContainer}>
            <Ionicons name="barbell" size={28} color="#4ade80" />
          </View>

          <View style={styles.gymInfo}>
            <View style={styles.gymNameRow}>
              <Text style={styles.gymName}>{item.name}</Text>
              {isPending && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.badgeText}>Pending</Text>
                </View>
              )}
              {isApproved && (
                <View style={styles.enrolledBadge}>
                  <Text style={styles.badgeText}>Enrolled</Text>
                </View>
              )}
            </View>

            <View style={styles.gymDetailRow}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.gymAddress}>{item.address}</Text>
            </View>

            <View style={styles.gymDetailRow}>
              <Ionicons name="call-outline" size={14} color="#64748b" />
              <Text style={styles.gymPhone}>{item.phone}</Text>
            </View>
          </View>

          <View style={styles.gymPriceContainer}>
            <Text style={styles.gymPriceLabel}>Monthly</Text>
            <Text style={styles.gymPrice}>₹{item.monthlyFee}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading gyms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userData?.displayName || 'Member'}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Available Gyms</Text>

      {/* 🔍 SEARCH + FILTER ICON */}
      <View style={styles.filterContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search gym..."
              placeholderTextColor="#64748b"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity
            style={styles.filterIconBtn}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={showFilters ? '#4ade80' : '#e9eef7'}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  sortByPrice === 'asc' && styles.activeFilter,
                ]}
                onPress={() => setSortByPrice('asc')}
              >
                <Text style={styles.filterText}>Price ↑</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  sortByPrice === 'desc' && styles.activeFilter,
                ]}
                onPress={() => setSortByPrice('desc')}
              >
                <Text style={styles.filterText}>Price ↓</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterBtn, nearMe && styles.activeFilter]}
                onPress={() => {
                  setNearMe(!nearMe);
                  setSelectedLocation(null);
                }}
              >
                <Text style={styles.filterText}>Gym near me</Text>
              </TouchableOpacity>
            </View>

            {nearMe && (
              <View style={styles.dropdown}>
                {LOCATIONS.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => setSelectedLocation(loc)}
                    style={[
                      styles.dropdownItem,
                      selectedLocation === loc &&
                        styles.activeDropdownItem,
                    ]}
                  >
                    <Text style={styles.dropdownText}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <FlatList
        data={filteredGyms}
        renderItem={renderGymCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default MemberHome;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1a' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94a3b8', marginTop: 16 },

  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
  },
  greeting: { fontSize: 16, color: '#94a3b8' },
  userName: {
    fontSize: isSmall ? 24 : 28,
    fontWeight: '700',
    color: '#e9eef7',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e9eef7',
    paddingHorizontal: width * 0.05,
    marginVertical: 12,
  },

  filterContainer: { paddingHorizontal: width * 0.05 ,marginBottom :30},
  searchRow: { flexDirection: 'row', gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, color: '#e9eef7', marginLeft: 8 },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(30,41,59,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(30,41,59,0.85)',
  },
  activeFilter: { backgroundColor: '#4ade80' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#e9eef7' },

  dropdown: {
    marginTop: 8,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 12,
  },
  dropdownItem: { padding: 12 },
  activeDropdownItem: { backgroundColor: 'rgba(74,222,128,0.2)' },
  dropdownText: { color: '#e9eef7' },

  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
  },

  gymCard: {
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gymCardEnrolled: { borderColor: '#4ade80', borderWidth: 1.5 },
  gymIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(74,222,128,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymInfo: { flex: 1, marginLeft: 14 },
  gymNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  gymName: { fontSize: 17, fontWeight: '700', color: '#e9eef7' },
  pendingBadge: {
    backgroundColor: 'rgba(251,191,36,0.15)',
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 6,
  },
  enrolledBadge: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#4ade80' },
  gymDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  gymAddress: { fontSize: 13, color: '#64748b', marginLeft: 6, flex: 1 },
  gymPhone: { fontSize: 13, color: '#64748b', marginLeft: 6 },
  gymPriceContainer: { alignItems: 'flex-end' },
  gymPriceLabel: { fontSize: 11, color: '#64748b' },
  gymPrice: { fontSize: 20, fontWeight: '800', color: '#4ade80' },
});
