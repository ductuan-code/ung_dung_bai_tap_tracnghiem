import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, PageHeading, screenStyles } from '@/components/Screen';
import { InputField } from '@/components/InputField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/authService';
import { errorMessage } from '@/utils/study';

export default function ChangePasswordScreen() {
  const { colors } = useTheme();
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.replace('/(tabs)/profile'), 1500);
    return () => clearTimeout(timer);
  }, [success]);
  async function update() {
    if (lock.current) return;
    if (
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setError('Vui lòng nhập đầy đủ ba trường mật khẩu.');
      return;
    }
    if (
      newPassword.length < 6 ||
      newPassword.length > 128 ||
      currentPassword.length > 128
    ) {
      setError(
        'Mật khẩu mới cần 6–128 ký tự; mật khẩu hiện tại tối đa 128 ký tự.',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu mới không khớp.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrent('');
      setNew('');
      setConfirm('');
      setSuccess(true);
    } catch (e) {
      setError(errorMessage(e));
      lock.current = false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen>
        <PageHeading
          title="Đổi mật khẩu"
          subtitle="Mật khẩu mới cần từ 6 đến 128 ký tự."
          back
        />
        <View
          style={[
            screenStyles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <InputField
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={setCurrent}
            secureToggle
            autoComplete="current-password"
            autoCorrect={false}
            editable={!busy && !success}
            maxLength={128}
          />
          <InputField
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNew}
            secureToggle
            autoComplete="new-password"
            autoCorrect={false}
            editable={!busy && !success}
            maxLength={128}
          />
          <InputField
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirm}
            secureToggle
            autoComplete="new-password"
            autoCorrect={false}
            editable={!busy && !success}
            maxLength={128}
            onSubmitEditing={update}
          />
          {!!error && <ErrorMessage message={error} />}
          {success && (
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: colors.correct }}
            >
              Đổi mật khẩu thành công
            </Text>
          )}
          <PrimaryButton
            title="Cập nhật mật khẩu"
            onPress={update}
            loading={busy}
            disabled={success}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
