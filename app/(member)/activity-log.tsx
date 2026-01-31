import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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

const { width, height } = Dimensions.get("window");

interface CheckInRecord {
  date: string; // "YYYY-MM-DD"
  duration: number; // seconds
}

const ActivityLog: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // This will reload data every time you come back to this page
  useFocusEffect(
    useCallback(() => {
      loadCheckInHistory();
    }, [])
  );

  const loadCheckInHistory = async () => {
    try {
      setLoading(true);
      const historyJson = await AsyncStorage.getItem("checkInHistory");
      if (historyJson) {
        const history: CheckInRecord[] = JSON.parse(historyJson);
        setCheckInHistory(history);
      }
    } catch (error) {
      console.error("Error loading check-in history:", error);
    } finally {
      setLoading(false);
    }
  };

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
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
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
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate > new Date();
  };

  const getCheckInForDay = (day: number) => {
    const dateKey = formatDateKey(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );
    return checkInHistory.find((record) => record.date === dateKey);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
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
        </View>
      );
    }

    return days;
  };

  const thisMonthAttendance = checkInHistory.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      recordDate.getMonth() === currentMonth.getMonth() &&
      recordDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const totalDays = getDaysInMonth(currentMonth);
  const attendedDays = thisMonthAttendance.length;
  const attendanceRate = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 0;
  const totalDuration = thisMonthAttendance.reduce((sum, record) => sum + record.duration, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#e9eef7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Log</Text>
        <TouchableOpacity onPress={loadCheckInHistory} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={previousMonth} style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={24} color="#e9eef7" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </Text>
          <TouchableOpacity
            onPress={nextMonth}
            style={[styles.monthArrow, currentMonth.getMonth() === new Date().getMonth() && styles.monthArrowDisabled]}
            disabled={currentMonth.getMonth() === new Date().getMonth()}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={currentMonth.getMonth() === new Date().getMonth() ? '#374151' : '#e9eef7'} 
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
            <Text style={styles.statNumber}>{formatDuration(totalDuration)}</Text>
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
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((record, index) => (
                <View key={index} style={styles.sessionCard}>
                  <View style={styles.sessionLeft}>
                    <Ionicons name="fitness" size={20} color="#4ade80" />
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDate}>
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                      <Text style={styles.sessionDuration}>{formatDuration(record.duration)}</Text>
                    </View>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                </View>
              ))
          )}
        </View>
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
  },
  sessionInfo: {
    gap: 2,
  },
  sessionDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e9eef7",
  },
  sessionDuration: {
    fontSize: 13,
    color: "#64748b",
  },
});