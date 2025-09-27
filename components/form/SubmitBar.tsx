import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';

interface Props {
  onSubmit: () => void;
  disabled?: boolean;
  submitting?: boolean;
  label?: string;
}

export const SubmitBar: React.FC<Props> = ({ onSubmit, disabled, submitting, label = 'Create Listing' }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity disabled={disabled || submitting} onPress={onSubmit} style={[styles.btn, (disabled || submitting) && styles.btnDisabled]}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{label}</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: 'rgba(255,255,255,0.92)', borderTopWidth: 1, borderColor: '#e2e8f0', ...(Platform.OS === 'web' ? { position: 'fixed' as any } : {}) },
  btn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#94a3b8' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
