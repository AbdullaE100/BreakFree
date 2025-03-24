import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function OnboardingLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="login" options={{ gestureEnabled: true }} />
        <Stack.Screen name="signup" options={{ gestureEnabled: true }} />
        <Stack.Screen name="forgot-password" options={{ gestureEnabled: true }} />
        <Stack.Screen name="reset-password" options={{ gestureEnabled: true }} />
      </Stack>
    </>
  );
} 