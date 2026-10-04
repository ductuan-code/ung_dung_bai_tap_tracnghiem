import { View, Text, TouchableOpacity } from 'react-native';
import type { Question } from '@/types';
import { useTheme } from '@/hooks/useTheme';
export function QuestionNavigator({
  questions,
  answers,
  current,
  disabled,
  onSelect,
}: {
  questions: Question[];
  answers: Map<number, number>;
  current: number;
  disabled: boolean;
  onSelect: (index: number) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
        CHUYỂN NHANH CÂU HỎI
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {questions.map((q, i) => {
          const answered = answers.has(q.questionId);
          return (
            <TouchableOpacity
              key={q.questionId}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={`Câu ${i + 1}, ${answered ? 'đã trả lời' : 'chưa trả lời'}`}
              accessibilityState={{ selected: i === current, disabled }}
              onPress={() => onSelect(i)}
              style={{
                minWidth: 44,
                minHeight: 44,
                paddingHorizontal: 8,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                borderWidth: i === current ? 2 : 1,
                borderColor:
                  i === current
                    ? colors.primary
                    : answered
                      ? colors.accent
                      : colors.border,
                backgroundColor:
                  i === current
                    ? colors.primary
                    : answered
                      ? colors.primary + '20'
                      : colors.surface,
              }}
            >
              <Text
                style={{
                  color:
                    i === current
                      ? colors.textInverse
                      : answered
                        ? colors.accent
                        : colors.textSecondary,
                  fontWeight: '700',
                }}
              >
                {i + 1}
                {answered ? ' •' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
        Nền xanh: câu hiện tại · Dấu •: đã trả lời
      </Text>
    </View>
  );
}
