import type { ReactNode } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export function Screen({
  children,
  tab = false,
  refreshing = false,
  onRefresh,
}: {
  children: ReactNode;
  tab?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={
        tab ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']
      }
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function PageHeading({
  title,
  subtitle,
  back = false,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.heading}>
      {back && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(tabs)')
          }
          style={[styles.back, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={{ color: colors.textSecondary, lineHeight: 21 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.heading}>
      <Text
        accessibilityRole="header"
        style={{ color: colors.text, fontSize: 18, fontWeight: '700', flex: 1 }}
      >
        {title}
      </Text>
      {action && (
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          style={{ paddingVertical: 10 }}
        >
          <Text style={{ color: colors.primary, fontSize: 13 }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
export const screenStyles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 12 },
  row: { flexDirection: 'row', gap: 10 },
});
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 20,
    flexGrow: 1,
  },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 34 },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
});
