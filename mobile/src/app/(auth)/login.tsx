import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/apiClient';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function LoginScreen() {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { signIn } = useAuthContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const response = await authService.login({ username: username.trim(), password });
      await signIn(
        {
          userId: response.userId,
          username: response.username,
          email: response.email,
          role: response.role,
        },
        response.token,
      );
      // Stack.Protected tự redirect về (tabs) sau khi isAuthenticated = true
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setErrors({ general: 'Tên đăng nhập hoặc mật khẩu không đúng' });
      } else {
        setErrors({ general: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary, fontSize: fontSize.xxxl, fontWeight: fontWeight.extrabold }]}>
            QuizApp
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fontSize.md }]}>
            Đăng nhập để bắt đầu làm bài
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: 16, borderColor: colors.border }]}>
          {errors.general && (
            <View style={[styles.errorBanner, { backgroundColor: colors.incorrectBg, borderRadius: 10 }]}>
              <Text style={{ color: colors.incorrect, fontSize: fontSize.sm }}>
                {errors.general}
              </Text>
            </View>
          )}

          <InputField
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            autoComplete="username"
            returnKeyType="next"
          />

          <InputField
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureToggle
            autoComplete="current-password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <PrimaryButton title="Đăng nhập" onPress={handleLogin} loading={loading} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            Chưa có tài khoản?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')} accessibilityRole="link">
            <Text style={[styles.footerText, { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }]}>
              Đăng ký ngay
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {},
  subtitle: {},
  card: {
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  errorBanner: {
    padding: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {},
});
