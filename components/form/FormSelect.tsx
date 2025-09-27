import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';

interface Option { label: string; value: string; }
interface Props {
  label: string;
  value?: string;
  options: (string | Option)[];
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export const FormSelect: React.FC<Props> = ({ label, value, options, onChange, placeholder = 'Select', error, helperText }) => {
  const [open, setOpen] = useState(false);
  const get = (o: string | Option): Option => typeof o === 'string' ? { label: o, value: o } : o;
  const selected = options.map(get).find(o => o.value === value);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.input, error && styles.inputError]} onPress={() => setOpen(true)}>
        <Text style={[styles.valueText, !selected && styles.placeholder]}>{selected ? selected.label : placeholder}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {options.map(o => {
                const opt = get(o);
                const active = opt.value === value;
                return (
                  <TouchableOpacity key={opt.value} style={[styles.option, active && styles.optionActive]} onPress={() => { onChange(opt.value); setOpen(false); }}>
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 12, paddingVertical: 14, borderRadius: 10, backgroundColor: '#fff' },
  inputError: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  valueText: { fontSize: 14, color: '#0f172a' },
  placeholder: { color: '#94a3b8' },
  error: { color: '#dc2626', fontSize: 11, marginTop: 4 },
  helper: { color: '#64748b', fontSize: 11, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%' },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  option: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  optionActive: { backgroundColor: '#f1f5f9' },
  optionText: { fontSize: 14, color: '#0f172a' },
  optionTextActive: { fontWeight: '600' },
  closeBtn: { alignSelf: 'flex-end', marginTop: 12 },
  closeText: { color: '#2563eb', fontWeight: '600' },
});
