import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading){
      console.log('⏳ Still loading...');
      return;
    } 

    const inAuthGroup = segments[0] === '(tabs)';
    console.log('📍 In auth group?', inAuthGroup);

    if (!isAuthenticated && inAuthGroup) {
      console.log('🔒 Not authenticated, redirecting to /auth');
      router.replace('/auth');
    } else if (isAuthenticated && !inAuthGroup) {
      console.log('🚀 Authenticated, redirecting to /(tabs)');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="callback" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}