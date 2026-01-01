// app/signup.tsx
import '@/global.css';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import { auth } from './lib/firebase';

const errorMessage = (code?: string): string => {
  const messages: { [key: string]: string } = {
    'auth/email-already-in-use': 'Email is already in use.',
    'auth/invalid-email': 'Email is invalid.',
    'auth/operation-not-allowed': 'Email/password sign-up is disabled.',
    'auth/weak-password': 'Password is too weak (use 6+ chars).',
  };
  return messages[code || ''] || 'Unable to sign up. Please try again.';
};

const isEmailValid = (val: string): boolean => /\S+@\S+\.\S+/.test(val);

const Signup: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallDevice = height < 700;
  const isTablet = width >= 768;

  const responsiveStyles = useMemo(
    () => ({
      logoSize: isSmallDevice ? 65 : isTablet ? 95 : 80,
      brandFontSize: isSmallDevice ? 26 : isTablet ? 40 : 32,
      taglineFontSize: isSmallDevice ? 12 : isTablet ? 15 : 13,
      cardPadding: isTablet ? width * 0.08 : width * 0.055,
      horizontalPadding: isTablet ? width * 0.15 : width * 0.05,
      inputHeight: isSmallDevice ? 50 : isTablet ? 60 : 54,
      buttonHeight: isSmallDevice ? 48 : isTablet ? 56 : 52,
      cardTitleSize: isSmallDevice ? 18 : isTablet ? 26 : 22,
    }),
    [width, height, isSmallDevice, isTablet]
  );

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
  const toggleConfirmPasswordVisibility = (): void =>
    setShowConfirmPassword(!showConfirmPassword);

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
    if (password.length < 6) {
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
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      if (cred.user && trimmedName) {
        await updateProfile(cred.user, { displayName: trimmedName });
      }
      router.replace('/');
    } catch (err: any) {
      setErrorText(errorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

            {/* Background Accents */}
            <View
              style={[
                styles.accentCircle,
                {
                  width: width * 0.7,
                  height: width * 0.7,
                  borderRadius: (width * 0.7) / 2,
                  top: -width * 0.25,
                  right: -width * 0.2,
                },
              ]}
            />
            <View
              style={[
                styles.accentCircle,
                {
                  width: width * 0.5,
                  height: width * 0.5,
                  borderRadius: (width * 0.5) / 2,
                  backgroundColor: 'rgba(59, 130, 246, 0.06)',
                  bottom: height * 0.1,
                  left: -width * 0.2,
                },
              ]}
            />
            <View
              style={[
                styles.accentCircle,
                {
                  width: width * 0.3,
                  height: width * 0.3,
                  borderRadius: (width * 0.3) / 2,
                  backgroundColor: 'rgba(251, 191, 36, 0.06)',
                  bottom: -width * 0.1,
                  right: width * 0.1,
                },
              ]}
            />

            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingHorizontal: responsiveStyles.horizontalPadding,
                  paddingTop: isSmallDevice ? height * 0.03 : height * 0.06,
                  paddingBottom: height * 0.05,
                },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Header */}
              <View style={styles.headerSection}>
                <View
                  style={[
                    styles.logoCircle,
                    {
                      width: responsiveStyles.logoSize,
                      height: responsiveStyles.logoSize,
                      borderRadius: responsiveStyles.logoSize / 2,
                    },
                  ]}
                >
                  <Ionicons
                    name="fitness-outline"
                    size={isSmallDevice ? 30 : isTablet ? 45 : 38}
                    color="#0a0f1a"
                  />
                </View>

                <Text
                  style={[
                    styles.brandName,
                    {
                      fontSize: responsiveStyles.brandFontSize,
                      marginTop: height * 0.015,
                    },
                  ]}
                >
                  FITCORE
                </Text>

                <Text
                  style={[
                    styles.tagline,
                    {
                      fontSize: responsiveStyles.taglineFontSize,
                      marginTop: height * 0.01,
                    },
                  ]}
                >
                  Start Your Transformation
                </Text>
              </View>

              {/* Signup Card */}
              <View
                style={[
                  styles.card,
                  {
                    padding: responsiveStyles.cardPadding,
                    maxWidth: isTablet ? 550 : '100%',
                    alignSelf: 'center',
                  },
                ]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        fontSize: responsiveStyles.cardTitleSize,
                      },
                    ]}
                  >
                    Create Account
                  </Text>
                  <View style={styles.badge}>
                    <Ionicons name="shield-checkmark" size={11} color="#0a0f1a" />
                    <Text
                      style={[
                        styles.badgeText,
                        { fontSize: isTablet ? 10 : 9 },
                      ]}
                    >
                      SECURE
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.cardSubtitle,
                    {
                      marginBottom: height * 0.02,
                      fontSize: isTablet ? 14 : 12,
                    },
                  ]}
                >
                  Join the fitness community today
                </Text>

                {/* Name Input */}
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      height: responsiveStyles.inputHeight,
                      marginBottom: height * 0.014,
                    },
                  ]}
                >
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
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>

                {/* Email Input */}
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      height: responsiveStyles.inputHeight,
                      marginBottom: height * 0.014,
                    },
                  ]}
                >
                  <View style={styles.inputIconBox}>
                    <Ionicons name="mail-outline" size={20} color="#64748b" />
                  </View>
                  <TextInput
                    placeholder="Email Address"
                    placeholderTextColor="#64748b"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>

                {/* Password Input */}
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      height: responsiveStyles.inputHeight,
                      marginBottom: height * 0.014,
                    },
                  ]}
                >
                  <View style={styles.inputIconBox}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#64748b"
                    />
                  </View>
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#64748b"
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput]}
                    autoCapitalize="none"
                    autoComplete="password"
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      height: responsiveStyles.inputHeight,
                      marginBottom: height * 0.02,
                    },
                  ]}
                >
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
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSignup}
                  />
                  <TouchableOpacity
                    onPress={toggleConfirmPasswordVisibility}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {errorText ? (
                  <View
                    style={[
                      styles.errorBox,
                      { marginBottom: height * 0.012 },
                    ]}
                  >
                    <Ionicons name="alert-circle" size={16} color="#f87171" />
                    <Text style={[styles.errorText, { fontSize: isTablet ? 13 : 12 }]}>
                      {errorText}
                    </Text>
                  </View>
                ) : null}

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      height: responsiveStyles.buttonHeight,
                      marginBottom: height * 0.018,
                    },
                    loading && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.75}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0a0f1a" size="small" />
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.primaryButtonText,
                          { fontSize: isSmallDevice ? 14 : isTablet ? 16 : 15 },
                        ]}
                      >
                        Create Account
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={isSmallDevice ? 16 : isTablet ? 18 : 17}
                        color="#0a0f1a"
                      />
                    </>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={[styles.dividerRow, { marginVertical: height * 0.018 }]}>
                  <View style={styles.dividerLine} />
                  <Text style={[styles.dividerText, { fontSize: isTablet ? 13 : 11 }]}>
                    or
                  </Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <View style={[styles.socialRow, { marginBottom: height * 0.02 }]}>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <Ionicons
                      name="logo-google"
                      size={isTablet ? 22 : 18}
                      color="#e9eef7"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <Ionicons
                      name="logo-apple"
                      size={isTablet ? 22 : 18}
                      color="#e9eef7"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <Ionicons
                      name="logo-facebook"
                      size={isTablet ? 22 : 18}
                      color="#e9eef7"
                    />
                  </TouchableOpacity>
                </View>

                {/* Login Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onLogin}
                  style={styles.linkRow}
                >
                  <Text style={[styles.linkText, { fontSize: isTablet ? 14 : 12 }]}>
                    Already have an account?{' '}
                  </Text>
                  <Text style={[styles.linkAccent, { fontSize: isTablet ? 14 : 12 }]}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0f1a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  accentCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoCircle: {
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  brandName: {
    fontWeight: '900',
    color: '#e9eef7',
    letterSpacing: 4,
  },
  tagline: {
    color: '#94a3b8',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontWeight: '700',
    color: '#e9eef7',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#4ade80',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#0a0f1a',
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#94a3b8',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputIconBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#e9eef7',
    paddingRight: 12,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.25)',
  },
  errorText: {
    color: '#fca5a5',
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4ade80',
    borderRadius: 14,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontWeight: '700',
    color: '#0a0f1a',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  dividerText: {
    color: '#64748b',
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    width: 48,
    height: 48,
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
    marginTop: 6,
  },
  linkText: {
    color: '#94a3b8',
  },
  linkAccent: {
    color: '#4ade80',
    fontWeight: '700',
  },
});

export default Signup;
