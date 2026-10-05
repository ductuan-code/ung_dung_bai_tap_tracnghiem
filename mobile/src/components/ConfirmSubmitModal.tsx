import { Modal, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { PrimaryButton } from './PrimaryButton';
import { ErrorMessage } from './ErrorMessage';
import { formatTime } from '@/utils/attemptClock';
export function ConfirmSubmitModal({
  visible,
  answered,
  total,
  busy,
  remaining,
  error,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  answered: number;
  total: number;
  busy: boolean;
  remaining: number;
  error: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!busy) onCancel();
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: colors.overlay,
          padding: 24,
        }}
      >
        <ScrollView
          style={{ flexGrow: 0 }}
          contentContainerStyle={{
            padding: 24,
            gap: 18,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
          accessibilityViewIsModal
        >
          <Ionicons
            name="paper-plane-outline"
            size={32}
            color={colors.primary}
          />
          <Text
            accessibilityRole="header"
            style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}
          >
            Nộp bài?
          </Text>
          <Text style={{ color: colors.text, lineHeight: 24 }}>
            {answered === total ? 'Bạn đã hoàn thành' : 'Bạn đã trả lời'}{' '}
            {answered}/{total} câu hỏi.
          </Text>
          <Text
            style={{
              color: remaining <= 10 ? colors.incorrect : colors.primary,
            }}
          >
            Thời gian còn lại: {formatTime(remaining)}
          </Text>
          {answered < total && (
            <Text style={{ color: colors.warning }}>
              Còn {total - answered} câu chưa trả lời.
            </Text>
          )}
          <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
            Bạn có chắc chắn muốn nộp bài? Kết quả sẽ được chấm và lưu trên hệ
            thống.
          </Text>
          {error && <ErrorMessage message={error} />}
          <PrimaryButton title="Nộp bài" onPress={onSubmit} loading={busy} />
          <PrimaryButton
            title="Tiếp tục làm"
            variant="outline"
            disabled={busy}
            onPress={onCancel}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
