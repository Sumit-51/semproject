// app/gymdetails/layout.tsx
import { Stack } from "expo-router";

export default function GymDetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a0f1a" },
      }}
    />
  );
}
