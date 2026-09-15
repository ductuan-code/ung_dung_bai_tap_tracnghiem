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

export default function RegisterScreen() {
  const { colors, spacing, fontSize, fontWeight } = useTheme();
  const { signIn } = useAuthContext();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const response = await authService.register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      await signIn(
        {
          userId: response.userId,
          username: response.username,
          email: response.email,
          role: response.role,
        },
        response.token,
      );
      // Stack.Protected tự redirect về (tabs)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ general: 'Tên đăng nhập hoặc email đã được sử dụng' });
      } else if (err instanceof ApiError && err.status === 400) {
        setErrors({ general: err.message });
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
            Đăng ký
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fontSize.md }]}>
            Tạo tài khoản Student miễn phí
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
            placeholder="Tối thiểu 3 ký tự"
            value={username}
            onChangeText={setUsername}
            error={errors.username}
            autoComplete="username-new"
            returnKeyType="next"
          />

          <InputField
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
          />

          <InputField
            label="Mật khẩu"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureToggle
            autoComplete="new-password"
            returnKeyType="next"
          />

          <InputField
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureToggle
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          <PrimaryButton title="Tạo tài khoản" onPress={handleRegister} loading={loading} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
            Đã có tài khoản?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} accessibilityRole="link">
            <Text style={[styles.footerText, { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }]}>
              Đăng nhập
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
