import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

type OptionState = 'default' | 'selected' | 'correct' | 'wrong' | 'correct-unselected';

interface Props {
  label: string;
  text: string;
  state: OptionState;
  onPress?: () => void;
  disabled?: boolean;
}

export default function OptionButton({ label, text, state, onPress, disabled }: Props) {
  const containerStyle = [
    styles.container,
    state === 'selected' && styles.selectedContainer,
    state === 'correct' && styles.correctContainer,
    state === 'wrong' && styles.wrongContainer,
    state === 'correct-unselected' && styles.correctUnselectedContainer,
  ];

  const labelStyle = [
    styles.label,
    state === 'selected' && styles.selectedLabel,
    state === 'correct' && styles.correctLabel,
    state === 'wrong' && styles.wrongLabel,
    state === 'correct-unselected' && styles.correctUnselectedLabel,
  ];

  const textStyle = [
    styles.text,
    state === 'correct' && styles.correctText,
    state === 'wrong' && styles.wrongText,
  ];

  const icon =
    state === 'correct' ? (
      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
    ) : state === 'wrong' ? (
      <Ionicons name="close-circle" size={20} color={Colors.danger} />
    ) : state === 'correct-unselected' ? (
      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
    ) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={containerStyle}
    >
      <View style={labelStyle}>
        <Text
          style={[
            styles.labelText,
            (state === 'correct' || state === 'wrong' || state === 'correct-unselected') &&
              styles.labelTextAlt,
          ]}
        >
          {label}
        </Text>
      </View>
      <Text style={textStyle} numberOfLines={3}>
        {text}
      </Text>
      {icon && <View style={styles.icon}>{icon}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: '#DFE6E9',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  selectedContainer: {
    borderColor: Colors.primary,
    backgroundColor: '#F0EEFF',
  },
  correctContainer: {
    borderColor: Colors.success,
    backgroundColor: '#E8F8F5',
  },
  wrongContainer: {
    borderColor: Colors.danger,
    backgroundColor: '#FDECEA',
  },
  correctUnselectedContainer: {
    borderColor: Colors.success + '60',
    backgroundColor: '#F0FBF8',
  },
  label: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  selectedLabel: {
    backgroundColor: Colors.primary,
  },
  correctLabel: {
    backgroundColor: Colors.success,
  },
  wrongLabel: {
    backgroundColor: Colors.danger,
  },
  correctUnselectedLabel: {
    backgroundColor: Colors.success + '30',
  },
  labelText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  labelTextAlt: {
    color: '#fff',
  },
  text: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  correctText: {
    color: Colors.success,
    fontWeight: '600',
  },
  wrongText: {
    color: Colors.danger,
    fontWeight: '600',
  },
  icon: {
    flexShrink: 0,
  },
});
