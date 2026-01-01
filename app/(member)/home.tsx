import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const MemberHome: React.FC = () => {
  const { userData } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);

  const handleCheckInOut = (): void => {
    setIsCheckedIn(!isCheckedIn);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles. header}>
          <View>
            <Text style={styles. greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userData?.displayName || 'Member'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#e9eef7" />
          </TouchableOpacity>
        </View>

        <View style={styles.gymCard}>
          <Ionicons name="barbell-outline" size={24} color="#4ade80" />
          <View style={styles.gymInfo}>
            <Text style={styles.gymName}>FitCore Gym</Text>
            <Text style={styles.gymAddress}>123 Fitness Street, City</Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Open</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkInBtn, isCheckedIn && styles.checkOutBtn]}
          activeOpacity={0.85}
          onPress={handleCheckInOut}
        >
          <View style={styles.checkInIconContainer}>
            <Ionicons
              name={isCheckedIn ?  'exit-outline' : 'enter-outline'}
              size={40}
              color="#0a0f1a"
            />
          </View>
          <Text style={styles.checkInText}>
            {isCheckedIn ? 'Check Out' :  'Check In'}
          </Text>
          <Text style={styles.checkInSubtext}>
            {isCheckedIn ? 'Tap to end your session' : 'Tap to start your workout'}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={28} color="#f97316" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={28} color="#3b82f6" />
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles. statCard}>
            <Ionicons name="time-outline" size={28} color="#a855f7" />
            <Text style={styles.statNumber}>1. 5h</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
        </View>

        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <Text style={styles.membershipTitle}>Membership Status</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles. membershipDetails}>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipLabel}>Plan</Text>
              <Text style={styles.membershipValue}>Monthly Premium</Text>
            </View>
            <View style={styles. membershipRow}>
              <Text style={styles.membershipLabel}>Expires</Text>
              <Text style={styles.membershipValue}>Jan 31, 2026</Text>
            </View>
            <View style={styles.membershipRow}>
              <Text style={styles.membershipLabel}>Days Left</Text>
              <Text style={[styles.membershipValue, { color: '#4ade80' }]}>30 days</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MemberHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
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
    alignItems: 'center',
    marginBottom: height * 0.025,
  },
  greeting:  {
    fontSize: 16,
    color: '#94a3b8',
  },
  userName: {
    fontSize: isSmall ? 24 : 28,
    fontWeight: '700',
    color: '#e9eef7',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: height * 0.025,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gymInfo:  {
    flex: 1,
    marginLeft: 12,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  gymAddress: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge:  {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 10,
    paddingVertical:  6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  statusText:  {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ade80',
  },
  checkInBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 24,
    paddingVertical: height * 0.04,
    alignItems: 'center',
    marginBottom: height * 0.025,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity:  0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  checkOutBtn: {
    backgroundColor: '#f97316',
    shadowColor: '#f97316',
  },
  checkInIconContainer:  {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkInText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0a0f1a',
  },
  checkInSubtext:  {
    fontSize: 14,
    color: 'rgba(10, 15, 26, 0.7)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statNumber:  {
    fontSize: 22,
    fontWeight: '700',
    color: '#e9eef7',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop:  4,
  },
  membershipCard: {
    backgroundColor:  'rgba(15, 23, 42, 0.8)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  membershipTitle: {
    fontSize:  18,
    fontWeight:  '700',
    color: '#e9eef7',
  },
  activeBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 12,
    paddingVertical:  6,
    borderRadius:  20,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ade80',
  },
  membershipDetails: {
    gap: 12,
  },
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  membershipLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  membershipValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e9eef7',
  },
});