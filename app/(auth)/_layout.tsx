import { Stack } from 'expo-router';
import React from 'react';

const AuthLayout: React.FC = () => {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="gym-selection" />
      <Stack.Screen name="payment-options" />
      <Stack.Screen name="pending-approval" />
    </Stack>
  );
};

export default AuthLayout;