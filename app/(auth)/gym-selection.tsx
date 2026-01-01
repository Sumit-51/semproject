import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { Gym } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const GymSelection: React.FC = () => {
  const router = useRouter();
  const { userData, logout } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async (): Promise<void> => {
    try {
      const gymsQuery = query(
        collection(db, 'gyms'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(gymsQuery);
      const gymsList: Gym[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?. toDate() || new Date(),
      })) as Gym[];

      setGyms(gymsList);
    } catch (error) {
      console.error('Error fetching gyms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGymSelect = (gym: Gym): void => {
    setSelectedGym(gym);
  };

  const handleContinue = (): void => {
    if (selectedGym) {
      router.push({
        pathname: '/(auth)/payment-options',
        params: {
          gymId: selectedGym.id,
          gymName: selectedGym.name,
          monthlyFee: selectedGym. monthlyFee. toString(),
          upiId: selectedGym.upiId,
        },
      });
    }
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/login');
  };

  const renderGymCard = ({ item }: { item:  Gym }) => {
    const isSelected = selectedGym?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.gymCard, isSelected && styles.gymCardSelected]}
        activeOpacity={0.8}
        onPress={() => handleGymSelect(item)}
      >
        <View style={styles.gymIconContainer}>
          <Ionicons name="barbell" size={28} color={isSelected ? '#0a0f1a' : '#4ade80'} />
        </View>
        <View style={styles.gymInfo}>
          <Text style={styles.gymName}>{item.name}</Text>
          <View style={styles.gymDetailRow}>
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text style={styles. gymAddress}>{item.address}</Text>
          </View>
          <View style={styles.gymDetailRow}>
            <Ionicons name="call-outline" size={14} color="#64748b" />
            <Text style={styles.gymPhone}>{item. phone}</Text>
          </View>
        </View>
        <View style={styles.gymPriceContainer}>
          <Text style={styles.gymPriceLabel}>Monthly</Text>
          <Text style={[styles.gymPrice, isSelected && styles.gymPriceSelected]}>
            ₹{item.monthlyFee}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading gyms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles. greeting}>Hello, {userData?.displayName || 'there'}!</Text>
          <Text style={styles.title}>Choose Your Gym</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#f87171" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Select a gym near you to start your fitness journey
      </Text>

      {/* Gym List */}
      {gyms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fitness-outline" size={64} color="#64748b" />
          <Text style={styles.emptyText}>No gyms available</Text>
          <Text style={styles.emptySubtext}>Please check back later</Text>
        </View>
      ) : (
        <FlatList
          data={gyms}
          renderItem={renderGymCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Continue Button */}
      {selectedGym && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.85}
            onPress={handleContinue}
          >
            <Text style={styles.continueBtnText}>Continue with {selectedGym.name}</Text>
            <Ionicons name="arrow-forward" size={20} color="#0a0f1a" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GymSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  loadingContainer: {
    flex:  1,
    backgroundColor: '#0a0f1a',
    justifyContent: 'center',
    alignItems:  'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 16,
  },
  accentCircleOne: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  accentCircleTwo: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    bottom: height * 0.3,
    left: -width * 0.15,
  },
  header:  {
    flexDirection: 'row',
    justifyContent:  'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
  },
  greeting:  {
    fontSize: 14,
    color: '#94a3b8',
  },
  title: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: '800',
    color: '#e9eef7',
    marginTop: 4,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    paddingHorizontal: width * 0.05,
    marginTop: 8,
    marginBottom: height * 0.025,
  },
  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 100,
  },
  gymCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gymCardSelected: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  gymIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent:  'center',
  },
  gymInfo: {
    flex: 1,
    marginLeft: 14,
  },
  gymName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 6,
  },
  gymDetailRow: {
    flexDirection:  'row',
    alignItems: 'center',
    marginTop: 3,
  },
  gymAddress: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
    flex: 1,
  },
  gymPhone: {
    fontSize: 13,
    color:  '#64748b',
    marginLeft: 6,
  },
  gymPriceContainer:  {
    alignItems: 'flex-end',
  },
  gymPriceLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  gymPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4ade80',
  },
  gymPriceSelected: {
    color: '#4ade80',
  },
  checkmark:  {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e9eef7',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize:  14,
    color: '#64748b',
    marginTop: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left:  0,
    right: 0,
    padding: width * 0.05,
    paddingBottom: height * 0.04,
    backgroundColor: 'rgba(10, 15, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4ade80',
    height: 56,
    borderRadius: 14,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity:  0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0f1a',
  },
});