import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  helperText?: string;
  containerStyle?: any;
  inputStyle?: any;
}

export const FormTextInput: React.FC<Props> = ({ label, error, helperText, containerStyle, inputStyle, ...rest }) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        {...rest}
        style={[styles.input, error && styles.inputError, inputStyle]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, borderRadius: 10, backgroundColor: '#ffffff' },
  inputError: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  error: { color: '#dc2626', fontSize: 11, marginTop: 4 },
  helper: { color: '#64748b', fontSize: 11, marginTop: 4 },
});
