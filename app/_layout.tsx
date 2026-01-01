import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from './context/AuthContext';

const RootLayout: React.FC = () => {
  return (
    <AuthProvider>
      <GluestackUIProvider mode="dark">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="(auth)" />
          <Stack. Screen name="(member)" />
        </Stack>
      </GluestackUIProvider>
    </AuthProvider>
  );
};

export default RootLayout;