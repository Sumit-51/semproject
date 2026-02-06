import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { Gym, PlanChangeRequest } from "../types";

const Payments: React.FC = () => {
  const { userData, refreshUserData } = useAuth();
  const [currentTimeSlot, setCurrentTimeSlot] =
    useState<string>("Not Assigned");
  const [gymData, setGymData] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [latestRequest, setLatestRequest] = useState<PlanChangeRequest | null>(
    null,
  );

  const status = userData?.enrollmentStatus ?? "none";
  const enrolledAt = userData?.enrolledAt ?? null;
  const currentDuration = userData?.planDuration ?? 1;

  // Create a simpler query that doesn't need the index
  useEffect(() => {
    if (!userData?.uid) return;

    const q = query(
      collection(db, "planChangeRequests"),
      where("userId", "==", userData.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          // Manually sort and get latest
          const sortedDocs = snapshot.docs.sort((a, b) => {
            const aData = a.data();
            const bData = b.data();
            // Handle both Firestore timestamp and Date formats
            const getTimestamp = (data: any) => {
              if (data.createdAt?.seconds) return data.createdAt.seconds;
              if (data.createdAt?.toDate)
                return data.createdAt.toDate().getTime() / 1000;
              if (data.createdAt?.getTime)
                return data.createdAt.getTime() / 1000;
              return 0;
            };
            const aTime = getTimestamp(aData);
            const bTime = getTimestamp(bData);
            return bTime - aTime; // Descending
          });

          const latest = sortedDocs[0];
          const data = latest.data();

          if (
            data.status === "approved" &&
            latestRequest?.status !== "approved"
          ) {
            refreshUserData();
          }

          // Create the PlanChangeRequest object with all required fields
          const requestData: PlanChangeRequest = {
            id: latest.id,
            userId: data.userId,
            gymId: data.gymId,
            currentDuration: data.currentDuration,
            requestedDuration: data.requestedDuration,
            status: data.status,
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : new Date(data.createdAt),
            reviewedAt: data.reviewedAt?.toDate
              ? data.reviewedAt.toDate()
              : data.reviewedAt
                ? new Date(data.reviewedAt)
                : null,
            reviewedBy: data.reviewedBy || null,
          };

          setLatestRequest(requestData);
        } else {
          setLatestRequest(null);
        }
      },
      (error) => {
        console.error("Plan change request listener error:", error);
        setUpdateError("Failed to load plan requests. Please try again.");
      },
    );

    return () => unsubscribe();
  }, [userData?.uid]);

  // Fetch gym data
  useEffect(() => {
    const fetchGym = async () => {
      if (!userData?.gymId) {
        setLoading(false);
        return;
      }
      try {
        const gymDoc = await getDoc(doc(db, "gyms", userData.gymId));
        if (gymDoc.exists()) {
          const data = gymDoc.data();
          setGymData({
            id: gymDoc.id,
            name: data.name,
            address: data.address,
            phone: data.phone,
            email: data.email,
            upiId: data.upiId,
            monthlyFee: data.monthlyFee,
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
            adminId: data.adminId,
            isActive: data.isActive,
            quarterlyFee: data.quarterlyFee,
            annualFee: data.annualFee,
          } as Gym);
        }
      } catch (e) {
        console.error("Failed to fetch gym:", e);
        Alert.alert("Error", "Failed to load gym information");
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, [userData?.gymId]);

  // Fetch time slot
  useEffect(() => {
    if (userData?.timeSlot) {
      setCurrentTimeSlot(userData.timeSlot);
    }
  }, [userData?.timeSlot]);

  const getExpiryDate = (duration: number) => {
    if (!enrolledAt) return "N/A";
    const newExpiry = new Date(enrolledAt);
    newExpiry.setMonth(newExpiry.getMonth() + duration);
    return newExpiry.toDateString();
  };

  const getDaysLeft = (duration: number) => {
    if (!enrolledAt) return 0;
    const expiryDate = new Date(enrolledAt);
    expiryDate.setMonth(expiryDate.getMonth() + duration);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const expiryDate = getExpiryDate(currentDuration);
  const daysLeft = getDaysLeft(currentDuration);

  const allPlans = [
    { months: 1, label: "1 Month", fee: gymData?.monthlyFee ?? 0 },
    {
      months: 3,
      label: "3 Months",
      fee: gymData?.quarterlyFee ?? (gymData?.monthlyFee ?? 0) * 3,
    },
    {
      months: 6,
      label: "6 Months",
      fee:
        gymData?.annualFee != null
          ? gymData.annualFee / 2
          : (gymData?.monthlyFee ?? 0) * 6,
    },
    {
      months: 12,
      label: "12 Months",
      fee: gymData?.annualFee ?? (gymData?.monthlyFee ?? 0) * 12,
    },
  ];

  const handleChangePlan = async (newDuration: number) => {
    if (!userData?.uid) {
      setUpdateError("User not found. Please log in again.");
      return;
    }
    if (newDuration === currentDuration) return;
    if (latestRequest?.status === "pending") {
      Alert.alert(
        "Request Pending",
        "You already have a pending request. Wait for admin approval.",
      );
      return;
    }

    setUpdating(true);
    setUpdateError(null);
    try {
      await addDoc(collection(db, "planChangeRequests"), {
        userId: userData.uid,
        gymId: userData.gymId,
        currentDuration: currentDuration,
        requestedDuration: newDuration,
        status: "pending",
        createdAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        // These fields are for admin reference but not in the PlanChangeRequest type
        userName: userData.displayName,
        userEmail: userData.email,
        gymName: gymData?.name,
      });

      setModalVisible(false);
      Alert.alert(
        "Request Sent",
        "Your plan change request has been sent to the admin for approval.",
      );
    } catch (e: any) {
      console.error("Failed to submit plan change request:", e);
      Alert.alert("Error", "Failed to submit request. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      {/* Header with safe area */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Membership</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {status === "none" || !gymData ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Active Membership</Text>
            <Text style={styles.emptySubtitle}>
              Join a gym to see your membership details here.
            </Text>
          </View>
        ) : (
          <>
            {/* Gym Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.gymName}>{gymData.name}</Text>
                <View
                  style={[
                    styles.badge,
                    status === "approved"
                      ? styles.badgeActive
                      : styles.badgeInactive,
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.planDisplay}>
                <Text style={styles.planDurationNumber}>{currentDuration}</Text>
                <Text style={styles.planDurationLabel}>
                  {currentDuration === 1 ? "Month" : "Months"} Plan
                </Text>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Enrolled</Text>
                  <Text style={styles.detailValue}>
                    {enrolledAt?.toDateString() ?? "N/A"}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Expires</Text>
                  <Text style={styles.detailValue}>{expiryDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Days Left</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      daysLeft <= 7 && styles.detailValueWarning,
                    ]}
                  >
                    {daysLeft}d
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Time Slot</Text>
                  <Text style={styles.detailValue}>{currentTimeSlot}</Text>
                </View>
              </View>
            </View>

            {/* Request Status Banner */}
            {latestRequest && (
              <View
                style={[
                  styles.requestBanner,
                  latestRequest.status === "pending" &&
                    styles.requestBannerPending,
                  latestRequest.status === "approved" &&
                    styles.requestBannerApproved,
                  latestRequest.status === "rejected" &&
                    styles.requestBannerRejected,
                ]}
              >
                <View style={styles.requestBannerRow}>
                  <View style={styles.requestBannerIcon}>
                    <Text style={styles.requestBannerDot}>
                      {latestRequest.status === "pending"
                        ? "⏳"
                        : latestRequest.status === "approved"
                          ? "✓"
                          : "✕"}
                    </Text>
                  </View>
                  <View style={styles.requestBannerContent}>
                    <Text style={styles.requestBannerTitle}>
                      {latestRequest.status === "pending"
                        ? "Plan Change Pending"
                        : latestRequest.status === "approved"
                          ? "Plan Change Approved"
                          : "Plan Change Rejected"}
                    </Text>
                    <Text style={styles.requestBannerSub}>
                      {latestRequest.status === "pending"
                        ? `Requested: ${latestRequest.requestedDuration} ${latestRequest.requestedDuration === 1 ? "Month" : "Months"} Plan`
                        : latestRequest.status === "approved"
                          ? `Your plan has been updated to ${latestRequest.requestedDuration} ${latestRequest.requestedDuration === 1 ? "Month" : "Months"}`
                          : `Request for ${latestRequest.requestedDuration} ${latestRequest.requestedDuration === 1 ? "Month" : "Months"} Plan was rejected`}
                    </Text>
                    {latestRequest.status !== "pending" &&
                      latestRequest.reviewedAt && (
                        <Text style={styles.requestBannerDate}>
                          Reviewed:{" "}
                          {latestRequest.reviewedAt.toLocaleDateString()}
                        </Text>
                      )}
                  </View>
                </View>
              </View>
            )}

            {/* Change Plan Button */}
            {status === "approved" && (
              <TouchableOpacity
                style={[
                  styles.changeBtn,
                  latestRequest?.status === "pending" &&
                    styles.changeBtnDisabled,
                ]}
                onPress={() => setModalVisible(true)}
                disabled={latestRequest?.status === "pending"}
              >
                <Text style={styles.changeBtnText}>
                  {latestRequest?.status === "pending"
                    ? "Request Pending..."
                    : "Change Plan"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* Plan Change Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Your Plan</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Current: {currentDuration}{" "}
              {currentDuration === 1 ? "Month" : "Months"}
            </Text>

            {allPlans.map((plan) => {
              const isCurrent = plan.months === currentDuration;
              return (
                <TouchableOpacity
                  key={plan.months}
                  style={[
                    styles.planOption,
                    isCurrent && styles.planOptionCurrent,
                  ]}
                  onPress={() => handleChangePlan(plan.months)}
                  disabled={updating || isCurrent}
                >
                  <View style={styles.planOptionLeft}>
                    <Text style={styles.planOptionLabel}>{plan.label}</Text>
                    <Text style={styles.planOptionFee}>
                      ₹{plan.fee.toFixed(0)}
                    </Text>
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

            {updating && (
              <ActivityIndicator
                size="small"
                color="#4ade80"
                style={styles.updatingIndicator}
              />
            )}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Payments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1a",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0a0f1a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 12,
    fontSize: 14,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e9eef7",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e9eef7",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  gymName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e9eef7",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
  },
  badgeInactive: {
    backgroundColor: "rgba(249, 115, 22, 0.15)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ade80",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 20,
  },
  planDisplay: {
    alignItems: "center",
    marginBottom: 24,
  },
  planDurationNumber: {
    fontSize: 56,
    fontWeight: "800",
    color: "#4ade80",
    lineHeight: 64,
  },
  planDurationLabel: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: "500",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e9eef7",
  },
  detailValueWarning: {
    color: "#f97316",
  },
  requestBanner: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  requestBannerPending: {
    backgroundColor: "rgba(251, 191, 36, 0.08)",
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  requestBannerApproved: {
    backgroundColor: "rgba(74, 222, 128, 0.08)",
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  requestBannerRejected: {
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    borderColor: "rgba(249, 115, 22, 0.3)",
  },
  requestBannerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  requestBannerIcon: {
    marginTop: 2,
  },
  requestBannerDot: {
    fontSize: 20,
  },
  requestBannerContent: {
    flex: 1,
  },
  requestBannerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e9eef7",
    marginBottom: 4,
  },
  requestBannerSub: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  requestBannerDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontStyle: "italic",
  },
  changeBtn: {
    backgroundColor: "#4ade80",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  changeBtnDisabled: {
    backgroundColor: "rgba(74, 222, 128, 0.35)",
    opacity: 0.7,
  },
  changeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a0f1a",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0a0f1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e9eef7",
  },
  modalClose: {
    fontSize: 24,
    color: "#64748b",
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
  },
  planOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  planOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e9eef7",
  },
  planOptionFee: {
    fontSize: 14,
    color: "#4ade80",
    fontWeight: "600",
  },
  planOptionArrow: {
    fontSize: 24,
    color: "#64748b",
  },
  planOptionCurrent: {
    borderColor: "rgba(74, 222, 128, 0.4)",
    backgroundColor: "rgba(74, 222, 128, 0.07)",
  },
  planOptionCurrentBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4ade80",
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  errorText: {
    color: "#f97316",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
  updatingIndicator: {
    marginTop: 12,
  },
  modalCloseBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 16,
  },
  modalCloseBtnText: {
    fontSize: 16,
    color: "#64748b",
  },
});
