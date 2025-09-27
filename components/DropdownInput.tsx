import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';

type Props = {
  label: string;
  options: string[];
  value?: string;
  onChange: (v: string) => void;
  allowManual?: boolean;
  placeholder?: string;
};

export default function DropdownInput({ label, options, value, onChange, allowManual, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {!manual ? (
        <TouchableOpacity style={styles.input} onPress={() => setOpen((v) => !v)}>
          <Text style={{ color: value ? '#111' : '#888' }}>{value || (placeholder || 'Select')}</Text>
        </TouchableOpacity>
      ) : (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
        />
      )}
      {allowManual && (
        <TouchableOpacity onPress={() => { setManual((m) => !m); setOpen(false); }}>
          <Text style={styles.toggle}>{manual ? 'Use dropdown' : 'Enter manually'}</Text>
        </TouchableOpacity>
      )}
      {open && !manual && (
        <View style={styles.dropdown}>
          <FlatList
            data={options}
            keyExtractor={(it) => it}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => { onChange(item); setOpen(false); }}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10, flex: 1 },
  label: { fontSize: 12, color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  toggle: { marginTop: 6, color: '#2563eb', fontSize: 12 },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 160,
  },
  option: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
});
