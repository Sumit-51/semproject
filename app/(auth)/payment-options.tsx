import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { PaymentMethod } from '../types';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const PaymentOptions:  React.FC = () => {
  const router = useRouter();
  const { user, userData, refreshUserData } = useAuth();
  const params = useLocalSearchParams<{
    gymId: string;
    gymName: string;
    monthlyFee: string;
    upiId: string;
  }>();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);

  const handlePaymentMethodSelect = (method: PaymentMethod): void => {
    setPaymentMethod(method);
    if (method === 'online') {
      setShowQR(true);
    } else {
      setShowQR(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (paymentMethod === 'online' && !transactionId. trim()) {
      Alert.alert('Error', 'Please enter the transaction ID');
      return;
    }

    if (!user || !userData) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setLoading(true);

      // Create enrollment record
      await addDoc(collection(db, 'enrollments'), {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: userData.email,
        gymId: params. gymId,
        gymName:  params.gymName,
        paymentMethod: paymentMethod,
        transactionId:  paymentMethod === 'online' ?  transactionId. trim() : null,
        amount: parseFloat(params.monthlyFee),
        status: 'pending',
        createdAt: serverTimestamp(),
        verifiedAt: null,
        verifiedBy: null,
      });

      // Update user document
      await updateDoc(doc(db, 'users', user.uid), {
        gymId: params.gymId,
        enrollmentStatus: 'pending',
        paymentMethod: paymentMethod,
        transactionId: paymentMethod === 'online' ? transactionId.trim() : null,
        enrolledAt: serverTimestamp(),
      });

      await refreshUserData();

      router.replace('/(auth)/pending-approval' as any);
    } catch (error) {
      console.error('Error submitting enrollment:', error);
      Alert.alert('Error', 'Failed to submit enrollment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#e9eef7" />
        </TouchableOpacity>

        <Text style={styles.title}>Payment Options</Text>
        <Text style={styles.subtitle}>
          Complete your enrollment for {params.gymName}
        </Text>

        {/* Gym Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Gym</Text>
            <Text style={styles.summaryValue}>{params.gymName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly Fee</Text>
            <Text style={styles. summaryAmount}>₹{params.monthlyFee}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        <TouchableOpacity
          style={[
            styles.paymentCard,
            paymentMethod === 'online' && styles.paymentCardSelected,
          ]}
          activeOpacity={0.8}
          onPress={() => handlePaymentMethodSelect('online')}
        >
          <View style={[styles.paymentIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Ionicons name="qr-code-outline" size={28} color="#3b82f6" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Pay Online (UPI)</Text>
            <Text style={styles.paymentDesc}>Scan QR code and pay instantly</Text>
          </View>
          {paymentMethod === 'online' && (
            <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentCard,
            paymentMethod === 'offline' && styles.paymentCardSelected,
          ]}
          activeOpacity={0.8}
          onPress={() => handlePaymentMethodSelect('offline')}
        >
          <View style={[styles.paymentIcon, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
            <Ionicons name="cash-outline" size={28} color="#fbbf24" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Pay at Gym (Offline)</Text>
            <Text style={styles.paymentDesc}>Visit the gym and pay in person</Text>
          </View>
          {paymentMethod === 'offline' && (
            <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
          )}
        </TouchableOpacity>

        {/* QR Code Section */}
        {showQR && (
          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Scan & Pay</Text>

            {/* QR Code Placeholder */}
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={120} color="#e9eef7" />
              </View>
              <Text style={styles.upiId}>UPI ID: {params.upiId}</Text>
              <Text style={styles.qrAmount}>Amount: ₹{params.monthlyFee}</Text>
            </View>

            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.instructionText}>
                After payment, enter the UPI Transaction ID below
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Transaction ID *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="receipt-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles. input}
                  placeholder="Enter UPI Transaction ID"
                  placeholderTextColor="#64748b"
                  value={transactionId}
                  onChangeText={setTransactionId}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>
        )}

        {/* Offline Instructions */}
        {paymentMethod === 'offline' && (
          <View style={styles.offlineSection}>
            <View style={styles.instructionCard}>
              <Ionicons name="information-circle" size={20} color="#fbbf24" />
              <Text style={styles.instructionText}>
                Your enrollment request will be sent to the gym.  Visit the gym to complete payment and get verified.
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        {paymentMethod && (
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ?  (
              <ActivityIndicator color="#0a0f1a" />
            ) : (
              <>
                <Text style={styles. submitBtnText}>Submit Enrollment</Text>
                <Ionicons name="arrow-forward" size={20} color="#0a0f1a" />
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default PaymentOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  accentCircleOne:  {
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
    bottom: height * 0.2,
    left: -width * 0.15,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.05,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title:  {
    fontSize: isSmall ? 26 : 30,
    fontWeight: '800',
    color: '#e9eef7',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    marginBottom: height * 0.025,
  },
  summaryCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 18,
    padding: 20,
    marginBottom: height * 0.03,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e9eef7',
  },
  summaryAmount: {
    fontSize:  22,
    fontWeight: '800',
    color: '#4ade80',
  },
  divider: {
    height: 1,
    backgroundColor:  'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 14,
  },
  paymentCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  paymentCardSelected: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  paymentIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e9eef7',
  },
  paymentDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  qrSection: {
    marginTop: height * 0.02,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e9eef7',
    marginBottom: 14,
    textAlign: 'center',
  },
  qrContainer:  {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  upiId: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  qrAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ade80',
    marginTop: 8,
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  instructionText: {
    flex: 1,
    fontSize:  13,
    color: '#94a3b8',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e9eef7',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems:  'center',
    backgroundColor:  'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex:  1,
    fontSize: 16,
    color: '#e9eef7',
  },
  offlineSection: {
    marginTop: height * 0.02,
  },
  submitBtn:  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4ade80',
    height: 56,
    borderRadius: 14,
    marginTop: height * 0.02,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity:  0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText:  {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0f1a',
  },
});