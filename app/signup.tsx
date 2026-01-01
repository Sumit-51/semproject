import '@/global.css';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './lib/firebase';

const { width, height } = Dimensions.get('window');
const isSmall = height < 700;

const errorMessage = (code?:  string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email is already in use. ';
    case 'auth/invalid-email':
      return 'Email is invalid.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-up is disabled.';
    case 'auth/weak-password':
      return 'Password is too weak (use 6+ chars).';
    default:
      return 'Unable to sign up.  Please try again.';
  }
};

const isEmailValid = (val: string): boolean => /\S+@\S+\.\S+/.test(val);

const Signup: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const onLogin = (): void => router.replace('/login');
  const togglePasswordVisibility = (): void => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = (): void => setShowConfirmPassword(!showConfirmPassword);

  const handleSignup = async (): Promise<void> => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorText('Please fill all fields.');
      return;
    }
    if (!isEmailValid(trimmedEmail)) {
      setErrorText('Please enter a valid email address.');
      return;
    }
    if (password. length < 6) {
      setErrorText('Use at least 6 characters for password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorText('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setErrorText('');

      // Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

      // Update display name
      if (userCred.user) {
        await updateProfile(userCred. user, { displayName: trimmedName });
      }

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCred.user. uid), {
        displayName: trimmedName,
        email: trimmedEmail,
        role: 'member',
        gymId: null,
        enrollmentStatus: 'none',
        paymentMethod: null,
        transactionId: null,
        enrolledAt: null,
        createdAt: serverTimestamp(),
      });

      // New user, needs to select gym
      router.replace('/(auth)/gym-selection' as any);
    } catch (err:  any) {
      setErrorText(errorMessage(err?. code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <View style={styles.accentCircleOne} />
      <View style={styles.accentCircleTwo} />
      <View style={styles.accentCircleThree} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="fitness-outline" size={isSmall ? 32 : 40} color="#0a0f1a" />
              </View>
            </View>
            <Text style={styles.brandName}>FITCORE</Text>
            <Text style={styles.tagline}>Start Your Transformation</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Create Account</Text>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={12} color="#0a0f1a" />
                <Text style={styles.badgeText}>SECURE</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>Join the fitness community today</Text>

            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Ionicons name="person-outline" size={20} color="#64748b" />
              </View>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                style={styles.input}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <View style={styles. inputIconBox}>
                <Ionicons name="mail-outline" size={20} color="#64748b" />
              </View>
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#64748b"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
              </View>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#64748b"
                secureTextEntry={! showPassword}
                style={[styles.input, styles.passwordInput]}
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ?  'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Ionicons name="shield-outline" size={20} color="#64748b" />
              </View>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#64748b"
                secureTextEntry={!showConfirmPassword}
                style={[styles.input, styles.passwordInput]}
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={styles.eyeButton}
                hitSlop={{ top:  10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorText ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#f87171" />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            ) : null}

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              activeOpacity={0.85}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0a0f1a" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="#0a0f1a" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Ionicons name="logo-google" size={22} color="#e9eef7" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={22} color="#e9eef7" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Ionicons name="logo-facebook" size={22} color="#e9eef7" />
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <TouchableOpacity activeOpacity={0.8} onPress={onLogin} style={styles.linkRow}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Text style={styles.linkAccent}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow:  1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.05,
    justifyContent: 'center',
  },
  accentCircleOne: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    top: -width * 0.25,
    right: -width * 0.2,
  },
  accentCircleTwo: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    bottom: height * 0.1,
    left: -width * 0.2,
  },
  accentCircleThree: {
    position:  'absolute',
    width:  width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(251, 191, 36, 0.06)',
    bottom: -width * 0.1,
    right: width * 0.1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  logoContainer: {
    marginBottom: height * 0.015,
  },
  logoCircle: {
    width: isSmall ? 65 : 80,
    height: isSmall ? 65 : 80,
    borderRadius: isSmall ? 32.5 : 40,
    backgroundColor: '#4ade80',
    alignItems:  'center',
    justifyContent: 'center',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity:  0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  brandName: {
    fontSize: isSmall ? 28 : 34,
    fontWeight: '900',
    color: '#e9eef7',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: isSmall ? 13 : 15,
    color: '#94a3b8',
    marginTop: 6,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    padding: width * 0.055,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity:  0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: isSmall ? 20 : 24,
    fontWeight: '700',
    color: '#e9eef7',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4ade80',
    paddingHorizontal: 10,
    paddingVertical:  5,
    borderRadius: 20,
  },
  badgeText: {
    color: '#0a0f1a',
    fontWeight: '800',
    fontSize: 10,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: height * 0.02,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems:  'center',
    backgroundColor:  'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: height * 0.015,
    height: isSmall ? 52 : 56,
  },
  inputIconBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#e9eef7',
    paddingRight: 16,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 6,
  },
  errorBox: {
    flexDirection:  'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.25)',
    marginBottom: height * 0.012,
  },
  errorText: {
    color: '#fca5a5',
    fontSize:  13,
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4ade80',
    height: isSmall ? 50 : 54,
    borderRadius: 14,
    marginTop: height * 0.008,
    shadowColor: '#4ade80',
    shadowOffset: { width:  0, height: 6 },
    shadowOpacity:  0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0f1a',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection:  'row',
    alignItems: 'center',
    marginVertical: height * 0.02,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  dividerText: {
    color: '#64748b',
    marginHorizontal: 14,
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: height * 0.02,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  linkAccent: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: 13,
  },
});