import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../theme';
import { Quiz } from '../../types';

interface Props {
  quiz: Quiz;
  onPress: () => void;
}

export default function QuizCard({ quiz, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>{quiz.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {quiz.description}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="help-circle-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{quiz.questions.length} câu hỏi</Text>
        </View>
      </View>
      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={20} color="#B2BEC3" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.card,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#2D3436',
  },
  description: {
    fontSize: FontSize.sm,
    color: '#636E72',
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: '#636E72',
    fontWeight: '600',
  },
  arrow: {
    marginLeft: Spacing.sm,
  },
});
