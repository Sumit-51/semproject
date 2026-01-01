import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const PendingApproval:  React.FC = () => {
  const router = useRouter();
  const { userData, logout, refreshUserData } = useAuth();

  const handleRefresh = async (): Promise<void> => {
    await refreshUserData();
    if (userData?. enrollmentStatus === 'approved') {
      router.replace('/(member)/home');
    }
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles. container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles. accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <View style={styles.content}>
        {/* Pending Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="time-outline" size={64} color="#fbbf24" />
          </View>
          <View style={styles.pulseRing} />
        </View>

        <Text style={styles.title}>Enrollment Pending</Text>
        <Text style={styles.subtitle}>
          Your enrollment request has been submitted successfully.  Please wait for the gym admin to verify your payment. 
        </Text>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending Verification</Text>
            </View>
          </View>

          {userData?.paymentMethod === 'online' && (
            <>
              <View style={styles. divider} />
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Transaction ID</Text>
                <Text style={styles.statusValue}>{userData?.transactionId || 'N/A'}</Text>
              </View>
            </>
          )}

          {userData?.paymentMethod === 'offline' && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color="#fbbf24" />
                <Text style={styles.infoText}>
                  Please visit the gym to complete your payment
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.refreshBtn}
          activeOpacity={0.85}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh-outline" size={20} color="#e9eef7" />
          <Text style={styles.refreshBtnText}>Check Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.85}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PendingApproval;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:  '#0a0f1a',
  },
  accentCircleOne: {
    position:  'absolute',
    width:  width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  accentCircleTwo: {
    position: 'absolute',
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    bottom: height * 0.2,
    left: -width * 0.15,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: height * 0.04,
    position: 'relative',
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing:  {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    top: -15,
    left: -15,
    zIndex: -1,
  },
  title: {
    fontSize: isSmall ? 26 : 30,
    fontWeight: '800',
    color: '#e9eef7',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  statusCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginTop: height * 0.035,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e9eef7',
  },
  pendingBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 12,
    paddingVertical:  6,
    borderRadius:  20,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fbbf24',
  },
  divider: {
    height: 1,
    backgroundColor:  'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    padding:  12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize:  13,
    color: '#fbbf24',
    lineHeight: 18,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems:  'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    height: 54,
    borderRadius: 14,
    width: '100%',
    marginTop: height * 0.03,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  refreshBtnText: {
    fontSize:  16,
    fontWeight:  '600',
    color: '#e9eef7',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    height: 54,
    borderRadius: 14,
    width: '100%',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color:  '#f87171',
  },
});