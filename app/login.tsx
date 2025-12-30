import { View, StyleSheet, Text, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import '@/global.css';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSignup = () => {
    router.replace('/signup');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    console.log('Login pressed with:', { email, password });
    
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/fitcore.jpg')}
      style={styles.backgroundimage}
      resizeMode='cover'
    >
      <View style={styles.overlay}>
        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.brandname}>
            Fitcore
          </Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <View style={{ paddingBottom: 30, justifyContent: 'center' }}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
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

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {/* Sign Up Text */}
          <TouchableOpacity activeOpacity={0.7} onPress={onSignup}>
            <Text style={styles.signupText}>
              Don&apos;t have an account? <Text style={styles.signupLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default Login;

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
    gap: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 0,
    margin: 0,
  },
  welcomeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  brandname: {
    fontSize: 50,
    fontWeight: '800',
    color: '#d1dbe6ff',
    textAlign: 'center',
  },
  welcomeText: {
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
  signupText: {
    color: '#d1dbe6ff',
    fontSize: 14,
    marginTop: 15,
  },
  signupLink: {
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});