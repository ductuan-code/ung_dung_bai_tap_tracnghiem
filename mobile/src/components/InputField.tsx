import { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
}

export function InputField({ label, error, secureToggle, style, ...props }: InputFieldProps) {
  const { colors, radius, fontSize, fontWeight } = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderColor = error ? colors.incorrect : focused ? colors.borderFocus : colors.border;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text, fontSize: fontSize.md },
            style,
          ]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureToggle ? !visible : props.secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            style={styles.eyeButton}
            accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
              {visible ? 'Ẩn' : 'Hiện'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.incorrect, fontSize: fontSize.xs }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    height: 52,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  error: {
    marginTop: 2,
  },
});
