// app/forgot-password.tsx
import '@/global.css';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
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
    'auth/invalid-email': 'Email is invalid.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/too-many-requests': 'Too many attempts. Try again later.',
  };
  return messages[code || ''] || 'Unable to send reset email. Please try again.';
};

const isEmailValid = (val: string): boolean => /\S+@\S+\.\S+/.test(val);

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallDevice = height < 700;
  const isTablet = width >= 768;

  const responsiveStyles = useMemo(
    () => ({
      logoSize: isSmallDevice ? 70 : isTablet ? 100 : 85,
      brandFontSize: isSmallDevice ? 28 : isTablet ? 42 : 36,
      taglineFontSize: isSmallDevice ? 12 : isTablet ? 16 : 14,
      cardPadding: isTablet ? width * 0.08 : width * 0.06,
      horizontalPadding: isTablet ? width * 0.15 : width * 0.05,
      inputHeight: isSmallDevice ? 52 : isTablet ? 60 : 56,
      buttonHeight: isSmallDevice ? 50 : isTablet ? 58 : 54,
      cardTitleSize: isSmallDevice ? 20 : isTablet ? 28 : 24,
    }),
    [width, height, isSmallDevice, isTablet]
  );

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const onBackToLogin = (): void => router.back();

  const handleResetPassword = async (): Promise<void> => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setErrorText('Please enter your email address.');
      return;
    }
    
    if (!isEmailValid(trimmedEmail)) {
      setErrorText('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setErrorText('');
      setSuccessMessage('');
      
      await sendPasswordResetEmail(auth, trimmedEmail);
      
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setEmail('');
      
      // Navigate back to login after 3 seconds
      setTimeout(() => {
        router.back();
      }, 3000);
      
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

            {/* Back Button */}
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  top: Platform.OS === 'ios' ? height * 0.06 : height * 0.02,
                  left: width * 0.05,
                },
              ]}
              onPress={onBackToLogin}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#e9eef7" />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingHorizontal: responsiveStyles.horizontalPadding,
                  paddingTop: isSmallDevice ? height * 0.1 : height * 0.12,
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
                    name="lock-closed"
                    size={isSmallDevice ? 32 : isTablet ? 48 : 40}
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
                  Reset Password
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
                  Enter your email to receive reset link
                </Text>
              </View>

              {/* Reset Card */}
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
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      fontSize: responsiveStyles.cardTitleSize,
                      marginBottom: height * 0.01,
                    },
                  ]}
                >
                  Forgot Password?
                </Text>

                <Text
                  style={[
                    styles.cardSubtitle,
                    {
                      marginBottom: height * 0.025,
                      fontSize: isTablet ? 15 : 13,
                    },
                  ]}
                >
                  No worries! Enter your email and we'll send you a link to reset your password.
                </Text>

                {/* Email Input */}
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
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                </View>

                {/* Error Message */}
                {errorText ? (
                  <View
                    style={[
                      styles.errorBox,
                      { marginBottom: height * 0.015 },
                    ]}
                  >
                    <Ionicons name="alert-circle" size={16} color="#f87171" />
                    <Text style={[styles.errorText, { fontSize: isTablet ? 14 : 12 }]}>
                      {errorText}
                    </Text>
                  </View>
                ) : null}

                {/* Success Message */}
                {successMessage ? (
                  <View
                    style={[
                      styles.successBox,
                      { marginBottom: height * 0.015 },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                    <Text style={[styles.successText, { fontSize: isTablet ? 14 : 12 }]}>
                      {successMessage}
                    </Text>
                  </View>
                ) : null}

                {/* Reset Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      height: responsiveStyles.buttonHeight,
                      marginBottom: height * 0.02,
                    },
                    loading && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.75}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0a0f1a" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="mail"
                        size={isSmallDevice ? 16 : isTablet ? 20 : 18}
                        color="#0a0f1a"
                      />
                      <Text
                        style={[
                          styles.primaryButtonText,
                          { fontSize: isSmallDevice ? 15 : isTablet ? 17 : 16 },
                        ]}
                      >
                        Send Reset Link
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Back to Login Link */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onBackToLogin}
                  style={styles.linkRow}
                >
                  <Ionicons name="arrow-back" size={16} color="#4ade80" />
                  <Text style={[styles.linkAccent, { fontSize: isTablet ? 15 : 13, marginLeft: 6 }]}>
                    Back to Login
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
  backButton: {
    position: 'absolute',
    zIndex: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
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
    letterSpacing: 3,
  },
  tagline: {
    color: '#94a3b8',
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  cardTitle: {
    fontWeight: '700',
    color: '#e9eef7',
  },
  cardSubtitle: {
    color: '#94a3b8',
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 0,
  },
  inputIconBox: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#e9eef7',
    paddingRight: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.25)',
  },
  errorText: {
    color: '#fca5a5',
    flex: 1,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  successText: {
    color: '#4ade80',
    flex: 1,
    fontWeight: '600',
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
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  linkAccent: {
    color: '#4ade80',
    fontWeight: '700',
  },
});

export default ForgotPassword;
