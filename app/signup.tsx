import "@/global.css";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
      return "Password is too weak (use 6+ chars).";
    default:
      return "Unable to sign up. Please try again.";
  }
};

const isEmailValid = (val: string): boolean => /\S+@\S+\.\S+/.test(val);

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

  const onLogin = () => router.replace("/login");

  const handleSignup = async (): Promise<void> => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setErrorText("Please fill all fields.");
      return;
    }

    if (!isEmailValid(trimmedEmail)) {
      setErrorText("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorText("Use at least 6 characters for password.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorText("Passwords do not match.");
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
        createdAt: serverTimestamp(),
      });

      // ✅ SUCCESS POPUP + REDIRECT
      Alert.alert(
        "Success 🎉",
        "Account created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ],
        { cancelable: false },
      );
    } catch (err: any) {
      setErrorText(errorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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

            {/* Inputs */}
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#64748b"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#64748b"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#64748b"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#64748b"
              style={styles.input}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {errorText ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : null}

            {/* Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0a0f1a" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login */}
            <TouchableOpacity onPress={onLogin}>
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
  container: { flex: 1, backgroundColor: "#0a0f1a" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.08,
  },
  headerSection: { alignItems: "center", marginBottom: 30 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: "#e9eef7",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 10,
  },
  tagline: { color: "#94a3b8", marginTop: 4 },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
  },
  cardTitle: {
    color: "#e9eef7",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    color: "#e9eef7",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#4ade80",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#0a0f1a",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#f87171",
    marginBottom: 8,
  },
  linkText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 16,
  },
  linkAccent: {
    color: "#4ade80",
    fontWeight: "700",
  },
});
