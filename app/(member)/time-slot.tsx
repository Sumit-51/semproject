import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";

const { width, height } = Dimensions.get("window");
const isSmall = height < 700;

// Time slot types
type TimeSlot = "Morning" | "Evening" | "Night";
type TimeSlotDetails = {
  name: TimeSlot;
  description: string;
  timeRange: string;
  icon: string;
  color: string;
};

const TimeSlotPage: React.FC = () => {
  const router = useRouter();
  const { userData } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [currentTimeSlot, setCurrentTimeSlot] = useState<TimeSlot | null>(null);
  const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [changingSlot, setChangingSlot] = useState<boolean>(false);
  const [gymName, setGymName] = useState<string>("");

  // Available time slots with details
  const timeSlots: TimeSlotDetails[] = [
    {
      name: "Morning",
      description: "Perfect for starting your day energized",
      timeRange: "6:00 AM - 12:00 PM",
      icon: "sunny-outline",
      color: "#fbbf24",
    },
    {
      name: "Evening",
      description: "Ideal for post-work workouts",
      timeRange: "4:00 PM - 9:00 PM",
      icon: "partly-sunny-outline",
      color: "#f97316",
    },
    {
      name: "Night",
      description: "For those who prefer late-night training",
      timeRange: "9:00 PM - 12:00 AM",
      icon: "moon-outline",
      color: "#8b5cf6",
    },
  ];

  useEffect(() => {
    loadUserTimeSlot();
  }, [userData]);

  const loadUserTimeSlot = async () => {
    try {
      setLoading(true);

      // First try to get from AsyncStorage (local cache)
      const savedTimeSlot = (await AsyncStorage.getItem(
        "userTimeSlot",
      )) as TimeSlot | null;

      if (
        savedTimeSlot &&
        ["Morning", "Evening", "Night"].includes(savedTimeSlot)
      ) {
        setCurrentTimeSlot(savedTimeSlot);
      } else {
        // If not in local storage, try to get from Firestore
        if (userData?.uid) {
          const userDoc = await getDoc(doc(db, "users", userData.uid));
          if (userDoc.exists()) {
            const userDataFromDb = userDoc.data();
            const dbTimeSlot = userDataFromDb.timeSlot as TimeSlot;

            if (
              dbTimeSlot &&
              ["Morning", "Evening", "Night"].includes(dbTimeSlot)
            ) {
              setCurrentTimeSlot(dbTimeSlot);
              // Save to AsyncStorage for future use
              await AsyncStorage.setItem("userTimeSlot", dbTimeSlot);
            }
          }
        }
      }

      // Load gym name if available
      if (userData?.gymId) {
        const gymDoc = await getDoc(doc(db, "gyms", userData.gymId));
        if (gymDoc.exists()) {
          setGymName(gymDoc.data().name || "");
        }
      }
    } catch (error) {
      console.error("Error loading time slot:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTimeSlotDetails = () => {
    if (!currentTimeSlot) return null;
    return timeSlots.find((slot) => slot.name === currentTimeSlot);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmChange = async () => {
    if (!selectedSlot || !userData?.uid) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    setChangingSlot(true);
    try {
      // Update in Firestore
      await updateDoc(doc(db, "users", userData.uid), {
        timeSlot: selectedSlot,
        timeSlotUpdatedAt: new Date(),
      });

      // Update local state and AsyncStorage
      setCurrentTimeSlot(selectedSlot);
      await AsyncStorage.setItem("userTimeSlot", selectedSlot);

      setShowChangeModal(false);
      setSelectedSlot(null);

      Alert.alert(
        "Success!",
        `Your time slot has been changed to ${selectedSlot}`,
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Error updating time slot:", error);
      Alert.alert("Error", "Failed to update time slot. Please try again.");
    } finally {
      setChangingSlot(false);
    }
  };

  const handleCancelChange = () => {
    setSelectedSlot(null);
    setShowChangeModal(false);
  };

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 17) return "Good Afternoon!";
    return "Good Evening!";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const currentSlotDetails = getCurrentTimeSlotDetails();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#e9eef7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Time Slot</Text>
          <View style={{ width: 40 }} /> {/* Spacer for alignment */}
        </View>

        {/* Current Time Slot Card */}
        <View style={styles.currentSlotCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={28} color="#3b82f6" />
            <Text style={styles.cardTitle}>Your Current Time Slot</Text>
          </View>

          {currentSlotDetails ? (
            <>
              <View
                style={[
                  styles.slotIndicator,
                  { backgroundColor: `${currentSlotDetails.color}20` },
                ]}
              >
                <View
                  style={[
                    styles.slotIconContainer,
                    { backgroundColor: currentSlotDetails.color },
                  ]}
                >
                  <Ionicons
                    name={currentSlotDetails.icon as any}
                    size={32}
                    color="#0a0f1a"
                  />
                </View>
                <View style={styles.slotInfo}>
                  <Text style={styles.slotName}>{currentSlotDetails.name}</Text>
                  <Text style={styles.slotTime}>
                    {currentSlotDetails.timeRange}
                  </Text>
                  <Text style={styles.slotDescription}>
                    {currentSlotDetails.description}
                  </Text>
                </View>
              </View>

              <View style={styles.slotStatusContainer}>
                <View style={styles.statusBadge}>
                  <View
                    style={[styles.statusDot, { backgroundColor: "#10b981" }]}
                  />
                  <Text style={styles.statusText}>Active</Text>
                </View>
                <Text style={styles.lastUpdated}>
                  {gymName
                    ? `Active for ${gymName}`
                    : "Ready for your workouts"}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.noSlotContainer}>
              <Ionicons name="time-outline" size={64} color="#64748b" />
              <Text style={styles.noSlotTitle}>No Time Slot Selected</Text>
              <Text style={styles.noSlotText}>
                You haven't selected a preferred time slot yet. Choose one to
                optimize your gym experience.
              </Text>
            </View>
          )}
        </View>

        {/* Change Time Slot Button */}
        <TouchableOpacity
          style={styles.changeButton}
          onPress={() => setShowChangeModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-horizontal" size={22} color="#0a0f1a" />
          <Text style={styles.changeButtonText}>
            {currentTimeSlot ? "Change Time Slot" : "Select Time Slot"}
          </Text>
        </TouchableOpacity>

        {/* Benefits Section */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>
            Benefits of Setting a Time Slot
          </Text>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="people-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitItemTitle}>Avoid Crowds</Text>
              <Text style={styles.benefitItemDescription}>
                Train during your preferred time to avoid peak hours
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitItemTitle}>Better Planning</Text>
              <Text style={styles.benefitItemDescription}>
                Plan your workouts consistently at your chosen time
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="trending-up-outline" size={20} color="#3b82f6" />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitItemTitle}>Improved Consistency</Text>
              <Text style={styles.benefitItemDescription}>
                Stick to a routine for better fitness results
              </Text>
            </View>
          </View>
        </View>

        {/* Time Greeting */}
        <View style={styles.greetingContainer}>
          <Ionicons name="happy-outline" size={24} color="#fbbf24" />
          <Text style={styles.greetingText}>{getCurrentTimeGreeting()}</Text>
        </View>
      </ScrollView>

      {/* Change Time Slot Modal */}
      <Modal visible={showChangeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {currentTimeSlot ? "Change Time Slot" : "Select Time Slot"}
              </Text>
              <TouchableOpacity onPress={handleCancelChange}>
                <Ionicons name="close" size={28} color="#e9eef7" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalSubtitle}>
                Choose your preferred workout time
              </Text>

              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.name}
                  style={[
                    styles.slotOption,
                    selectedSlot === slot.name && styles.slotOptionSelected,
                    currentTimeSlot === slot.name && styles.currentSlotOption,
                  ]}
                  onPress={() => handleSelectSlot(slot.name)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.optionIconContainer,
                      { backgroundColor: slot.color },
                    ]}
                  >
                    <Ionicons
                      name={slot.icon as any}
                      size={24}
                      color="#0a0f1a"
                    />
                  </View>

                  <View style={styles.optionInfo}>
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionName}>{slot.name}</Text>
                      {currentTimeSlot === slot.name && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.optionTime}>{slot.timeRange}</Text>
                    <Text style={styles.optionDescription}>
                      {slot.description}
                    </Text>
                  </View>

                  <View style={styles.optionSelector}>
                    {selectedSlot === slot.name ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={28}
                        color={slot.color}
                      />
                    ) : (
                      <View
                        style={[
                          styles.selectorCircle,
                          { borderColor: slot.color },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Confirmation Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancelChange}
                  disabled={changingSlot}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    (!selectedSlot || changingSlot) &&
                      styles.confirmButtonDisabled,
                  ]}
                  onPress={handleConfirmChange}
                  disabled={!selectedSlot || changingSlot}
                >
                  {changingSlot ? (
                    <ActivityIndicator color="#0a0f1a" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {currentTimeSlot ? "Change Slot" : "Confirm Selection"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TimeSlotPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f1a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0a0f1a",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.02,
    paddingBottom: height * 0.02,
  },
  accentCircleOne: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(59, 130, 246, 0.06)",
    top: -width * 0.2,
    right: -width * 0.2,
  },
  accentCircleTwo: {
    position: "absolute",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    bottom: height * 0.3,
    left: -width * 0.15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.03,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e9eef7",
    textAlign: "center",
    flex: 1,
  },
  currentSlotCard: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e9eef7",
  },
  slotIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  slotIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  slotInfo: {
    flex: 1,
  },
  slotName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e9eef7",
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 8,
  },
  slotDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  slotStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  lastUpdated: {
    fontSize: 12,
    color: "#64748b",
  },
  noSlotContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  noSlotTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e9eef7",
    marginTop: 16,
    marginBottom: 8,
  },
  noSlotText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: "80%",
  },
  changeButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a0f1a",
  },
  benefitsCard: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e9eef7",
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e9eef7",
    marginBottom: 4,
  },
  benefitItemDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.2)",
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fbbf24",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0a0f1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e9eef7",
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 20,
    marginBottom: 16,
  },
  slotOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  slotOptionSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  currentSlotOption: {
    borderColor: "rgba(16, 185, 129, 0.3)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e9eef7",
    marginRight: 8,
  },
  currentBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#10b981",
  },
  optionTime: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  optionSelector: {
    marginLeft: 8,
  },
  selectorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e9eef7",
  },
  confirmButton: {
    backgroundColor: "#3b82f6",
  },
  confirmButtonDisabled: {
    backgroundColor: "#374151",
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a0f1a",
  },
});
