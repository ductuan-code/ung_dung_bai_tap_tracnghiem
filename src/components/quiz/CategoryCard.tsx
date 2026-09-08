import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, Radius, Shadow, Spacing } from '../../theme';
import { Category } from '../../types';

interface Props {
  category: Category;
  quizCount: number;
  onPress: () => void;
}

export default function CategoryCard({ category, quizCount, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon as any} size={28} color={category.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.count}>{quizCount} bài quiz</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B2BEC3" />
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
    gap: Spacing.md,
    ...Shadow.card,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 2,
  },
  count: {
    fontSize: FontSize.sm,
    color: '#636E72',
  },
});
