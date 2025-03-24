import { Stack } from 'expo-router';

export default function CheckinLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="mood" />
      <Stack.Screen name="journal" />
    </Stack>
  );
}