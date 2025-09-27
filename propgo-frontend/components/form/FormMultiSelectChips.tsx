import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';

interface Props {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  options: string[];
  error?: string;
  helperText?: string;
}

export const FormMultiSelectChips: React.FC<Props> = ({ label, values, onChange, options, error, helperText }) => {
  const [open, setOpen] = useState(false);
  const toggle = (v: string) => {
    if (values.includes(v)) onChange(values.filter(x => x !== v));
    else onChange([...values, v]);
  };
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inlineChips}>
        {values.length === 0 && <Text style={styles.placeholder}>None selected</Text>}
        {values.slice(0,4).map(v => (
          <View key={v} style={styles.selectedChip}><Text style={styles.selectedChipText}>{v}</Text></View>
        ))}
        {values.length > 4 && <View style={styles.moreChip}><Text style={styles.moreChipText}>+{values.length - 4}</Text></View>}
        <TouchableOpacity onPress={() => setOpen(true)} style={styles.manageBtn}><Text style={styles.manageText}>Manage</Text></TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {options.map(o => {
                const active = values.includes(o);
                return (
                  <TouchableOpacity key={o} style={[styles.optionChip, active && styles.optionChipActive]} onPress={() => toggle(o)}>
                    <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>{o}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}><Text style={styles.closeText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 },
  inlineChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 8, backgroundColor: '#fff' },
  placeholder: { fontSize: 12, color: '#9ca3af', marginRight: 6 },
  selectedChip: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  selectedChipText: { fontSize: 12, color: '#0369a1', fontWeight: '600' },
  moreChip: { backgroundColor: '#e5e7eb', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 16 },
  moreChipText: { fontSize: 12, color: '#374151' },
  manageBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  manageText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  error: { fontSize: 11, color: '#b91c1c', marginTop: 4 },
  helper: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  optionChip: { borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 10 },
  optionChipActive: { backgroundColor: '#dbeafe', borderColor: '#60a5fa' },
  optionChipText: { fontSize: 13, color: '#374151' },
  optionChipTextActive: { fontSize: 13, color: '#1d4ed8', fontWeight: '600' },
  closeBtn: { alignSelf: 'flex-end', marginTop: 8 },
  closeText: { color: '#2563eb', fontWeight: '600' },
});
