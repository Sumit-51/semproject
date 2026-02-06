import "@/global.css";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { auth, db } from "./lib/firebase";

const { width, height } = Dimensions.get("window");
const isSmall = height < 700;

const errorMessage = (code?: string): string => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email is already in use.";
    case "auth/invalid-email":
      return "Email is invalid.";
    case "auth/operation-not-allowed":
      return "Email/password sign-up is disabled.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters with uppercase, lowercase, and numbers.";
    default:
      return "Unable to sign up. Please try again.";
  }
};

const isEmailValid = (val: string): boolean => /\S+@\S+\.\S+/.test(val);

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  let strength = "Very Weak";
  let color = "#f87171";

  if (score === 5) {
    strength = "Very Strong";
    color = "#10b981";
  } else if (score >= 4) {
    strength = "Strong";
    color = "#4ade80";
  } else if (score >= 3) {
    strength = "Good";
    color = "#fbbf24";
  } else if (score >= 2) {
    strength = "Weak";
    color = "#f97316";
  }

  return { checks, strength, color, score };
};

const Signup: React.FC = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    },
    strength: "Very Weak",
    color: "#f87171",
    score: 0,
  });

  // Update password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({
        checks: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
        },
        strength: "Very Weak",
        color: "#f87171",
        score: 0,
      });
    }
  }, [password]);

  const onLogin = () => router.replace("/login");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSignup = async (): Promise<void> => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    // Validation
    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorText("Please fill all fields.");
      return;
    }

    if (!isEmailValid(trimmedEmail)) {
      setErrorText("Please enter a valid email address.");
      return;
    }

    // Enhanced password validation
    if (password.length < 8) {
      setErrorText("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorText("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorText("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setErrorText("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorText("Passwords do not match.");
      return;
    }

    // Optional: Require special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setErrorText(
        "Password must contain at least one special character (!@#$%^&* etc.).",
      );
      return;
    }

    try {
      setLoading(true);
      setErrorText("");

      const userCred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );

      await updateProfile(userCred.user, {
        displayName: trimmedName,
      });

      await setDoc(doc(db, "users", userCred.user.uid), {
        displayName: trimmedName,
        email: trimmedEmail,
        role: "member",
        gymId: null,
        enrollmentStatus: "none",
        planDuration: 1,
        timeSlot: null,
        createdAt: serverTimestamp(),
      });

      // Redirect directly to home page
      router.replace("/(member)/home");
    } catch (err: any) {
      setErrorText(errorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordRequirement = (label: string, isMet: boolean) => (
    <View style={styles.requirementRow} key={label}>
      <Ionicons
        name={isMet ? "checkmark-circle" : "close-circle"}
        size={16}
        color={isMet ? "#4ade80" : "#64748b"}
      />
      <Text style={[styles.requirementText, isMet && styles.requirementMet]}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="fitness-outline" size={40} color="#0a0f1a" />
            </View>
            <Text style={styles.brandName}>FITCORE</Text>
            <Text style={styles.tagline}>Start Your Transformation</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>

            {/* Name Input */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={name}
                onChangeText={setName}
                editable={!loading}
                autoComplete="name"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Create Password"
                placeholderTextColor="#64748b"
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthLabel}>Password Strength:</Text>
                  <Text
                    style={[
                      styles.strengthValue,
                      { color: passwordStrength.color },
                    ]}
                  >
                    {passwordStrength.strength}
                  </Text>
                </View>

                {/* Strength Bar */}
                <View style={styles.strengthBarContainer}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>

                {/* Requirements List */}
                <View style={styles.requirementsContainer}>
                  {renderPasswordRequirement(
                    "At least 8 characters",
                    passwordStrength.checks.length,
                  )}
                  {renderPasswordRequirement(
                    "One uppercase letter",
                    passwordStrength.checks.uppercase,
                  )}
                  {renderPasswordRequirement(
                    "One lowercase letter",
                    passwordStrength.checks.lowercase,
                  )}
                  {renderPasswordRequirement(
                    "One number",
                    passwordStrength.checks.number,
                  )}
                  {renderPasswordRequirement(
                    "One special character",
                    passwordStrength.checks.special,
                  )}
                </View>
              </View>
            )}

            {/* Confirm Password Input */}
            <View
              style={[
                styles.inputWrapper,
                { marginTop: password.length > 0 ? 16 : 0 },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#64748b"
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                onSubmitEditing={handleSignup}
              />
              <TouchableOpacity
                onPress={toggleConfirmPasswordVisibility}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                <Ionicons
                  name={
                    password === confirmPassword
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={16}
                  color={password === confirmPassword ? "#4ade80" : "#f87171"}
                />
                <Text
                  style={[
                    styles.matchText,
                    {
                      color:
                        password === confirmPassword ? "#4ade80" : "#f87171",
                    },
                  ]}
                >
                  {password === confirmPassword
                    ? "Passwords match"
                    : "Passwords don't match"}
                </Text>
              </View>
            )}

            {/* Error Message */}
            {errorText ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#f87171" />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.buttonDisabled,
                passwordStrength.score < 3 && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading || passwordStrength.score < 3}
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

            {/* Login Link */}
            <TouchableOpacity onPress={onLogin} style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.linkAccent}>Login</Text>
              </Text>
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
    backgroundColor: "#0a0f1a",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.08,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  brandName: {
    color: "#e9eef7",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 10,
    letterSpacing: 2,
  },
  tagline: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardTitle: {
    color: "#e9eef7",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  inputIcon: {
    marginHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: "#e9eef7",
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  passwordStrengthContainer: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  strengthLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },
  strengthValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
  },
  requirementsContainer: {
    gap: 8,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    color: "#64748b",
    fontSize: 12,
  },
  requirementMet: {
    color: "#94a3b8",
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  matchText: {
    fontSize: 13,
    fontWeight: "500",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.25)",
    marginBottom: 12,
  },
  errorText: {
    color: "#fca5a5",
    flex: 1,
    fontSize: 13,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4ade80",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: "#0a0f1a",
    fontWeight: "700",
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 20,
  },
  linkText: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 14,
  },
  linkAccent: {
    color: "#4ade80",
    fontWeight: "700",
  },
});
