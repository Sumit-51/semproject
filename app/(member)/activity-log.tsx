import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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

interface CheckInRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  duration: number; // seconds
  checkInTime: Date;
  checkOutTime: Date;
  gymName: string;
}

const ActivityLog: React.FC = () => {
  const router = useRouter();
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  // Load check-in history from Firebase - FIXED VERSION
  const loadCheckInHistory = async () => {
    if (!userData?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const checkInHistoryRef = collection(db, "checkInHistory");

      try {
        // FIRST TRY: Try the optimized query (needs index)
        const q = query(
          checkInHistoryRef,
          where("userId", "==", userData.uid),
          orderBy("checkOutTime", "desc"),
          limit(100), // Limit to 100 most recent records
        );

        const querySnapshot = await getDocs(q);

        const history: CheckInRecord[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Extract date from timestamp
          let dateString = "";
          if (data.date) {
            dateString = data.date;
          } else if (data.checkOutTime) {
            const checkOutDate = data.checkOutTime.toDate();
            dateString = checkOutDate.toISOString().split("T")[0];
          }

          history.push({
            id: doc.id,
            date: dateString,
            duration: data.duration || 0,
            checkInTime: data.checkInTime?.toDate() || new Date(),
            checkOutTime: data.checkOutTime?.toDate() || new Date(),
            gymName: data.gymName || "Unknown Gym",
          });
        });

        setCheckInHistory(history);
      } catch (indexError: any) {
        // If index error occurs, use a fallback query
        console.log("Index not ready, using fallback query...");

        // SECOND TRY: Fallback query without orderBy
        const fallbackQ = query(
          checkInHistoryRef,
          where("userId", "==", userData.uid),
          limit(100),
        );

        const fallbackSnapshot = await getDocs(fallbackQ);

        const history: CheckInRecord[] = [];
        fallbackSnapshot.forEach((doc) => {
          const data = doc.data();

          // Extract date from timestamp
          let dateString = "";
          if (data.date) {
            dateString = data.date;
          } else if (data.checkOutTime) {
            const checkOutDate = data.checkOutTime.toDate();
            dateString = checkOutDate.toISOString().split("T")[0];
          }

          history.push({
            id: doc.id,
            date: dateString,
            duration: data.duration || 0,
            checkInTime: data.checkInTime?.toDate() || new Date(),
            checkOutTime: data.checkOutTime?.toDate() || new Date(),
            gymName: data.gymName || "Unknown Gym",
          });
        });

        // Sort by checkOutTime descending client-side
        history.sort(
          (a, b) => b.checkOutTime.getTime() - a.checkOutTime.getTime(),
        );
        setCheckInHistory(history);

        // Show warning about index
        setError(
          "Note: For better performance, please create the Firestore index by clicking the link in your console.",
        );
      }
    } catch (error: any) {
      console.error("Error loading check-in history:", error);
      setError("Failed to load check-in history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // This will reload data every time you come back to this page
  useFocusEffect(
    useCallback(() => {
      loadCheckInHistory();
    }, [userData?.uid]),
  );

  // Also reload when month changes
  useEffect(() => {
    loadCheckInHistory();
  }, [currentMonth, userData?.uid]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 = Sunday
  };

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isFutureDate = (day: number) => {
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return checkDate > new Date();
  };

  const getCheckInForDay = (day: number) => {
    const dateKey = formatDateKey(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
    );
    return checkInHistory.find((record) => record.date === dateKey);
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    const next = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
    );
    const today = new Date();

    // Only allow going to current month or past months
    if (
      next.getMonth() <= today.getMonth() &&
      next.getFullYear() <= today.getFullYear()
    ) {
      setCurrentMonth(next);
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const checkIn = getCheckInForDay(day);
      const today = isToday(day);
      const future = isFutureDate(day);

      days.push(
        <View
          key={day}
          style={[
            styles.dayCell,
            checkIn && styles.dayCellPresent,
            !checkIn && !future && styles.dayCellAbsent,
            today && styles.dayCellToday,
            future && styles.dayCellFuture,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              checkIn && styles.dayTextPresent,
              today && styles.dayTextToday,
              future && styles.dayTextFuture,
            ]}
          >
            {day}
          </Text>
          {checkIn && <View style={styles.presentDot} />}
        </View>,
      );
    }

    return days;
  };

  const thisMonthAttendance = checkInHistory.filter((record) => {
    if (!record.date) return false;

    const recordDate = new Date(record.date);
    return (
      recordDate.getMonth() === currentMonth.getMonth() &&
      recordDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const totalDays = getDaysInMonth(currentMonth);
  const attendedDays = thisMonthAttendance.length;
  const attendanceRate =
    totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 0;
  const totalDuration = thisMonthAttendance.reduce(
    (sum, record) => sum + record.duration,
    0,
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading activity log...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#e9eef7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Log</Text>
        <TouchableOpacity
          onPress={loadCheckInHistory}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh-outline" size={24} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="information-circle" size={20} color="#fbbf24" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError(null)}
              style={styles.closeErrorButton}
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        )}

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={previousMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={24} color="#e9eef7" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={nextMonth}
            style={[
              styles.monthArrow,
              currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear() &&
                styles.monthArrowDisabled,
            ]}
            disabled={
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear()
            }
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                currentMonth.getMonth() === new Date().getMonth() &&
                currentMonth.getFullYear() === new Date().getFullYear()
                  ? "#374151"
                  : "#e9eef7"
              }
            />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{attendedDays}</Text>
            <Text style={styles.statLabel}>Days Present</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{attendanceRate}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {formatDuration(totalDuration)}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendBoxPresent]} />
            <Text style={styles.legendText}>Present</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendBoxAbsent]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendBoxToday]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendar}>
          <View style={styles.weekDays}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.daysGrid}>{renderCalendar()}</View>
        </View>

        {/* Recent Sessions */}
        <View style={styles.recentSessions}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {thisMonthAttendance.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#64748b" />
              <Text style={styles.emptyStateText}>No check-ins this month</Text>
            </View>
          ) : (
            thisMonthAttendance
              .slice(0, 10) // Already sorted by checkOutTime in loadCheckInHistory
              .map((record, index) => (
                <View key={`${record.id}-${index}`} style={styles.sessionCard}>
                  <View style={styles.sessionLeft}>
                    <View style={styles.sessionIconContainer}>
                      <Ionicons name="fitness" size={20} color="#4ade80" />
                    </View>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionDate}>
                          {record.checkOutTime.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                        <Text style={styles.sessionTime}>
                          {formatTime(record.checkInTime)} -{" "}
                          {formatTime(record.checkOutTime)}
                        </Text>
                      </View>
                      <View style={styles.sessionDetails}>
                        <Text style={styles.sessionDuration}>
                          {formatDuration(record.duration)}
                        </Text>
                        <Text style={styles.sessionGym}>{record.gymName}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                </View>
              ))
          )}
        </View>

        {/* Total Stats */}
        {checkInHistory.length > 0 && (
          <View style={styles.totalStats}>
            <Text style={styles.sectionTitle}>All Time Stats</Text>
            <View style={styles.totalStatsGrid}>
              <View style={styles.totalStatCard}>
                <Ionicons name="calendar-outline" size={24} color="#fbbf24" />
                <Text style={styles.totalStatNumber}>
                  {checkInHistory.length}
                </Text>
                <Text style={styles.totalStatLabel}>Total Sessions</Text>
              </View>
              <View style={styles.totalStatCard}>
                <Ionicons name="time-outline" size={24} color="#a855f7" />
                <Text style={styles.totalStatNumber}>
                  {formatDuration(
                    checkInHistory.reduce(
                      (sum, record) => sum + record.duration,
                      0,
                    ),
                  )}
                </Text>
                <Text style={styles.totalStatLabel}>Total Time</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ActivityLog;

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
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e9eef7",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 20,
  },
  monthArrow: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  monthArrowDisabled: {
    opacity: 0.3,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e9eef7",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4ade80",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendBoxPresent: {
    backgroundColor: "#4ade80",
  },
  legendBoxAbsent: {
    backgroundColor: "rgba(248, 113, 113, 0.3)",
    borderWidth: 1,
    borderColor: "#f87171",
  },
  legendBoxToday: {
    backgroundColor: "#6366f1",
  },
  legendText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  calendar: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    width: (width - 72) / 7,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: (width - 72) / 7,
    height: (width - 72) / 7,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 8,
  },
  dayCellPresent: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
  },
  dayCellAbsent: {
    backgroundColor: "rgba(248, 113, 113, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
  },
  dayCellToday: {
    backgroundColor: "#6366f1",
  },
  dayCellFuture: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  dayTextPresent: {
    color: "#4ade80",
  },
  dayTextToday: {
    color: "#fff",
  },
  dayTextFuture: {
    color: "#374151",
  },
  presentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4ade80",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e9eef7",
    marginBottom: 16,
  },
  recentSessions: {
    marginTop: 8,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 12,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sessionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  sessionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  sessionInfo: {
    flex: 1,
    gap: 4,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e9eef7",
  },
  sessionTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  sessionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDuration: {
    fontSize: 13,
    color: "#4ade80",
    fontWeight: "600",
  },
  sessionGym: {
    fontSize: 12,
    color: "#64748b",
  },
  totalStats: {
    marginTop: 8,
  },
  totalStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  totalStatCard: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  totalStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e9eef7",
    marginTop: 8,
    marginBottom: 4,
  },
  totalStatLabel: {
    fontSize: 12,
    color: "#94a3b8",
  },
  // Error banner styles
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#fbbf24",
    marginLeft: 8,
    marginRight: 8,
  },
  closeErrorButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
