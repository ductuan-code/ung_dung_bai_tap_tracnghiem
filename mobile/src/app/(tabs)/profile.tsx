import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Switch } from 'react-native';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthContext } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import {
  Screen,
  PageHeading,
  SectionTitle,
  screenStyles,
} from '@/components/Screen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ErrorMessage } from '@/components/ErrorMessage';
export default function ProfileScreen() {
  const { user, signOut } = useAuthContext();
  const { colors } = useTheme();
  const theme = useThemeContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setBusy(true);
    setError('');
    try {
      await signOut();
    } catch {
      setError('Không thể đăng xuất. Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen tab>
      <PageHeading title="Hồ sơ" subtitle="Không gian học tập của bạn." />
      <View
        style={[
          screenStyles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            alignItems: 'center',
            paddingVertical: 30,
          },
        ]}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 28,
            backgroundColor: colors.primary + '25',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{ color: colors.primary, fontSize: 34, fontWeight: '800' }}
          >
            {user?.username.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 23, fontWeight: '700' }}>
          {user?.username}
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          {user?.role === 'Student' ? 'Sinh viên' : user?.role}
        </Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => router.push('/statistics')}
        style={[
          screenStyles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <Ionicons name="stats-chart-outline" size={24} color={colors.primary} />
        <Text style={{ color: colors.text, flex: 1, fontWeight: '600' }}>
          Thống kê học tập
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      <SectionTitle title="GIAO DIỆN" />
      <View
        style={[
          screenStyles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <Text style={{ color: colors.text, flex: 1 }}>Chế độ tối</Text>
        <Switch
          accessibilityLabel="Chế độ tối"
          value={theme.mode === 'dark'}
          disabled={theme.saving}
          onValueChange={(dark) => {
            void theme.setMode(dark ? 'dark' : 'light');
          }}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.textInverse}
        />
      </View>
      {theme.error && <ErrorMessage message={theme.error} />}
      <SectionTitle title="BẢO MẬT" />
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => router.push('/change-password')}
        style={[
          screenStyles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
          },
        ]}
      >
        <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
        <Text style={{ color: colors.text, flex: 1 }}>Đổi mật khẩu</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      <SectionTitle title="Thông tin tài khoản" />
      <View
        style={[
          screenStyles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={{ color: colors.textSecondary }}>Tên đăng nhập</Text>
        <Text selectable style={{ color: colors.text }}>
          {user?.username}
        </Text>
        {user?.email && (
          <>
            <Text style={{ color: colors.textSecondary }}>Email</Text>
            <Text selectable style={{ color: colors.text }}>
              {user.email}
            </Text>
          </>
        )}
        <Text style={{ color: colors.textSecondary }}>Mã tài khoản</Text>
        <Text style={{ color: colors.text }}>#{user?.userId}</Text>
      </View>
      <SectionTitle title="Giới thiệu ứng dụng" />
      <View
        style={[
          screenStyles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
          QuizApp
        </Text>
        <Text style={{ color: colors.textSecondary, lineHeight: 23 }}>
          Luyện tập theo chủ đề, nhận kết quả sau mỗi bài và theo dõi tiến bộ
          của bạn.
        </Text>
      </View>
      {!!error && <ErrorMessage message={error} />}
      <PrimaryButton
        title="Đăng xuất"
        variant="outline"
        loading={busy}
        onPress={() =>
          Alert.alert('Đăng xuất?', 'Bạn có muốn kết thúc phiên đăng nhập?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', onPress: logout },
          ])
        }
      />
    </Screen>
  );
}
