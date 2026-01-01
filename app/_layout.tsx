// app/_layout.tsx
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { Stack } from 'expo-router';
import React from 'react';

const RootLayout = () => {
  return (
    <GluestackUIProvider mode="dark">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="login" 
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="signup" />
        <Stack.Screen name="index" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="modal" />
      </Stack>
    </GluestackUIProvider>
  );
};

export default RootLayout;
