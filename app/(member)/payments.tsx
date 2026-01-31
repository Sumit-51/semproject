import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc, addDoc, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { Gym } from '../types'; // adjust path if needed

const Payments: React.FC = () => {
  const { userData } = useAuth();

  const [gymData, setGymData] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  // --- Derived values ---
  const status = userData?.enrollmentStatus || 'none';
  const enrolledAt = userData?.enrolledAt;
  const currentDuration = userData?.planDuration || 1;

  const getExpiryDate = (duration: number) => {
    if (!enrolledAt) return 'N/A';
    return new Date(enrolledAt.getTime() + duration * 30 * 24 * 60 * 60 * 1000).toDateString();
  };

  const getDaysLeft = (duration: number) => {
    if (!enrolledAt) return 0;
    return Math.max(
      0,
      Math.ceil(
        (new Date(enrolledAt.getTime() + duration * 30 * 24 * 60 * 60 * 1000).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  const expiryDate = getExpiryDate(currentDuration);
  const daysLeft = getDaysLeft(currentDuration);

  // --- Fetch gym data ---
  useEffect(() => {
    const fetchGym = async () => {
      if (!userData?.gymId) {
        setLoading(false);
        return;
      }
      try {
        const gymDoc = await getDoc(doc(db, 'gyms', userData.gymId));
        if (gymDoc.exists()) {
          const data = gymDoc.data();
          setGymData({
            ...data,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
          } as Gym);
        }
      } catch (e) {
        console.error('Failed to fetch gym:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [userData?.gymId]);

  const [updateError, setUpdateError] = useState<string | null>(null);
  const [latestRequest, setLatestRequest] = useState<{
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedDuration: number;
  } | null>(null);

  // --- Listen to latest plan change request in real-time ---
  useEffect(() => {
    if (!userData?.uid) return;

    const q = query(
      collection(db, 'planChangeRequests'),
      where('userId', '==', userData.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latest = snapshot.docs[0];
        const data = latest.data();
        setLatestRequest({
          id: latest.id,
          status: data.status,
          requestedDuration: data.requestedDuration,
        });
      } else {
        setLatestRequest(null);
      }
    });

    return () => unsubscribe();
  }, [userData?.uid]);
  const allPlans = [
    { months: 1, label: '1 Month', fee: gymData?.monthlyFee ?? 0 },
    { months: 3, label: '3 Months', fee: gymData?.quarterlyFee ?? (gymData?.monthlyFee ?? 0) * 3 },
    { months: 6, label: '6 Months', fee: gymData?.annualFee != null ? gymData.annualFee / 2 : (gymData?.monthlyFee ?? 0) * 6 },
    { months: 12, label: '12 Months', fee: gymData?.annualFee ?? (gymData?.monthlyFee ?? 0) * 12 },
  ];

  // --- Handle plan change request ---
  const handleChangePlan = async (newDuration: number) => {
    if (!userData?.uid) {
      setUpdateError('User not found. Please log in again.');
      return;
    }
    if (newDuration === currentDuration) return;
    if (latestRequest?.status === 'pending') {
      setUpdateError('You already have a pending request. Wait for admin approval.');
      return;
    }
    setUpdating(true);
    setUpdateError(null);
    try {
      await addDoc(collection(db, 'planChangeRequests'), {
        userId: userData.uid,
        gymId: userData.gymId,
        currentDuration: currentDuration,
        requestedDuration: newDuration,
        status: 'pending',
        createdAt: new Date(),
      });
      setModalVisible(false);
    } catch (e: any) {
      console.error('Failed to submit plan change request:', e);
      setUpdateError(e?.message || 'Something went wrong. Try again.');
    } finally {
      setUpdating(false);
    }
  };

  // --- Loading state ---
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <Text style={styles.header}>Membership</Text>

      {/* ─── Membership Card ─── */}
      <View style={styles.card}>
        {/* Top row: gym name + status badge */}
        <View style={styles.cardHeader}>
          <Text style={styles.gymName}>{gymData?.name ?? 'Unknown Gym'}</Text>
          <View style={[styles.badge, status === 'approved' ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeText}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Plan duration big display */}
        <View style={styles.planDisplay}>
          <Text style={styles.planDurationNumber}>{currentDuration}</Text>
          <Text style={styles.planDurationLabel}>{currentDuration === 1 ? 'Month' : 'Months'} Plan</Text>
        </View>

        {/* Details grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Enrolled</Text>
            <Text style={styles.detailValue}>{enrolledAt?.toDateString() ?? 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expires</Text>
            <Text style={styles.detailValue}>{expiryDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Days Left</Text>
            <Text style={[styles.detailValue, daysLeft <= 7 && styles.detailValueWarning]}>{daysLeft}d</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Monthly Fee</Text>
            <Text style={styles.detailValue}>₹{gymData?.monthlyFee ?? '—'}</Text>
          </View>
        </View>
      </View>

      {/* ─── Plan Change Request Status ─── */}
      {latestRequest && (
        <View style={[
          styles.requestBanner,
          latestRequest.status === 'pending' && styles.requestBannerPending,
          latestRequest.status === 'approved' && styles.requestBannerApproved,
          latestRequest.status === 'rejected' && styles.requestBannerRejected,
        ]}>
          <View style={styles.requestBannerRow}>
            <Text style={styles.requestBannerDot}>
              {latestRequest.status === 'pending' ? '⏳' : latestRequest.status === 'approved' ? '✓' : '✕'}
            </Text>
            <View>
              <Text style={styles.requestBannerTitle}>
                {latestRequest.status === 'pending'
                  ? 'Plan Change Pending'
                  : latestRequest.status === 'approved'
                  ? 'Plan Change Approved'
                  : 'Plan Change Rejected'}
              </Text>
              <Text style={styles.requestBannerSub}>
                Requested: {latestRequest.requestedDuration} {latestRequest.requestedDuration === 1 ? 'Month' : 'Months'} Plan
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* ─── Change Plan Button ─── */}
      {status === 'approved' && (
        <TouchableOpacity
          style={[styles.changeBtn, latestRequest?.status === 'pending' && styles.changeBtnDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={latestRequest?.status === 'pending'}
        >
          <Text style={styles.changeBtnText}>
            {latestRequest?.status === 'pending' ? 'Request Pending...' : 'Change Plan'}
          </Text>
        </TouchableOpacity>
      )}

      {/* ─── Change Plan Modal ─── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upgrade Your Plan</Text>
            <Text style={styles.modalSubtitle}>
              Current: {currentDuration} {currentDuration === 1 ? 'Month' : 'Months'}
            </Text>

            {allPlans.map((plan) => {
              const isCurrent = plan.months === currentDuration;
              return (
                <TouchableOpacity
                  key={plan.months}
                  style={[styles.planOption, isCurrent && styles.planOptionCurrent]}
                  onPress={() => handleChangePlan(plan.months)}
                  disabled={updating || isCurrent}
                >
                  <View style={styles.planOptionLeft}>
                    <Text style={styles.planOptionLabel}>{plan.label}</Text>
                    <Text style={styles.planOptionFee}>₹{plan.fee.toFixed(0)}</Text>
                  </View>
                  {isCurrent ? (
                    <Text style={styles.planOptionCurrentBadge}>Current</Text>
                  ) : (
                    <Text style={styles.planOptionArrow}>›</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {updateError && <Text style={styles.errorText}>{updateError}</Text>}

            {updating && <ActivityIndicator size="small" color="#6366f1" style={{ marginTop: 12 }} />}

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Payments;

// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 24,
  },

  // ── Card ──
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gymName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9eef7',
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4ade80',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 18,
  },

  // ── Plan display ──
  planDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planDurationNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#6366f1',
    lineHeight: 64,
  },
  planDurationLabel: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '500',
  },

  // ── Details grid ──
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9eef7',
  },
  detailValueWarning: {
    color: '#f97316',
  },

  // ── Change plan button ──
  changeBtn: {
    marginTop: 24,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  changeBtnDisabled: {
    backgroundColor: '#3b3f6b',
    shadowColor: 'transparent',
    opacity: 0.6,
  },
  changeBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // ── Request status banner ──
  requestBanner: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  requestBannerPending: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  requestBannerApproved: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  requestBannerRejected: {
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  requestBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestBannerDot: {
    fontSize: 20,
  },
  requestBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e9eef7',
  },
  requestBannerSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  planOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  planOptionFee: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  planOptionArrow: {
    fontSize: 24,
    color: '#64748b',
  },
  planOptionCurrent: {
    borderColor: 'rgba(74, 222, 128, 0.4)',
    backgroundColor: 'rgba(74, 222, 128, 0.07)',
  },
  planOptionCurrentBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  errorText: {
    color: '#f97316',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  modalCloseBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalCloseBtnText: {
    fontSize: 15,
    color: '#64748b',
  },
});