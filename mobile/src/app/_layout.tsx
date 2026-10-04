import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { ThemeProvider, useThemeContext } from '@/contexts/ThemeContext';
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme,
  DefaultTheme,
} from 'expo-router/react-navigation';

// Ngăn splash screen tự ẩn khi chờ load auth
SplashScreen.preventAutoHideAsync();

function SplashScreenController() {
  const { isLoading } = useAuthContext();
  const { ready } = useThemeContext();

  useEffect(() => {
    if (!isLoading && ready) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, ready]);

  return null;
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { ready } = useThemeContext();
  const scheme = useColorScheme();
  const { colors } = useTheme();

  if (!ready || isLoading) return null;

  return (
    <NavigationThemeProvider
      value={scheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Routes chỉ hiển thị khi chưa đăng nhập */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        {/* Routes chỉ hiển thị khi đã đăng nhập */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="quiz-list" />
          <Stack.Screen name="quiz-detail" />
          <Stack.Screen name="quiz-play" />
          <Stack.Screen name="result" />
          <Stack.Screen name="statistics" />
          <Stack.Screen name="change-password" />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SplashScreenController />
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
