import { View, StyleSheet, Text, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import '@/global.css';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Signup = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onLogin = () => {
    router.replace('/login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSignup = () => {
    console.log('Signup pressed with:', { name, email, password, confirmPassword });
  
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/fitcore.jpg')}
      style={styles.backgroundimage}
      resizeMode='cover'
    >
      <View style={styles.overlay}>
        {/* Fitcore Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.brandname}>
            Fitcore
          </Text>
        </View>

        {/* Input Fields Container */}
        <View style={styles.inputsContainer}>
          <View style={{ paddingBottom: 20, justifyContent: 'center' }}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </View>
          
          {/* Name Input */}
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#999"
              style={styles.textInput}
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input with Eye Icon */}
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              style={[styles.textInput, { flex: 1 }]}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input with Eye Icon */}
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              style={[styles.textInput, { flex: 1 }]}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity 
              onPress={toggleConfirmPasswordVisibility}
              style={styles.eyeIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Login Text */}
          <TouchableOpacity activeOpacity={0.7} onPress={onLogin}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Signup;

const styles = StyleSheet.create({
  backgroundimage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 0,
    margin: 0,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  brandname: {
    fontSize: 50,
    fontWeight: '800',
    color: '#d1dbe6ff',
    textAlign: 'center',
  },
  createAccountText: {
    color: '#d1dbe6ff',
    fontSize: 40,
    textAlign: 'center',
  },
  inputsContainer: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 15,
  },
  inputBox: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  eyeIcon: {
    padding: 5,
    marginLeft: 10,
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#627182ff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loginText: {
    color: '#d1dbe6ff',
    fontSize: 14,
    marginTop: 15,
  },
  loginLink: {
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});
