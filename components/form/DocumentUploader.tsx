import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export interface DocItem { uri: string; name: string; size?: number; mimeType?: string; }

interface Props {
  label: string;
  documents: DocItem[];
  onChange: (docs: DocItem[]) => void;
  max?: number;
  error?: string;
  helperText?: string;
  acceptedMimeTypes?: string[];
}

export const DocumentUploader: React.FC<Props> = ({ label, documents, onChange, max = 5, error, helperText, acceptedMimeTypes }) => {
  const pick = async () => {
    if (documents.length >= max) return;
    const res = await DocumentPicker.getDocumentAsync({ multiple: true, type: acceptedMimeTypes?.length ? acceptedMimeTypes : '*/*', copyToCacheDirectory: true });
    if (res.canceled) return;
    const newOnes = res.assets.map(a => ({ uri: a.uri, name: a.name, size: a.size, mimeType: a.mimeType }));
    onChange([...documents, ...newOnes].slice(0, max));
  };
  const remove = (uri: string) => onChange(documents.filter(d => d.uri !== uri));
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.list}>
        {documents.map(doc => (
          <View key={doc.uri} style={styles.docRow}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.docName}>{doc.name}</Text>
              {doc.size != null && <Text style={styles.docMeta}>{(doc.size/1024).toFixed(1)} KB</Text>}
            </View>
            <TouchableOpacity onPress={() => remove(doc.uri)}><Text style={styles.remove}>Remove</Text></TouchableOpacity>
          </View>
        ))}
        {documents.length < max && (
          <TouchableOpacity style={styles.addBtn} onPress={pick}>
            <Text style={styles.addBtnText}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.counter}>{documents.length}/{max} documents</Text>
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  list: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, backgroundColor: '#fff', gap: 8 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docName: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  docMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  remove: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  addBtn: { backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  counter: { fontSize: 11, color: '#64748b', marginTop: 4 },
  error: { fontSize: 11, color: '#b91c1c', marginTop: 4 },
  helper: { fontSize: 11, color: '#6b7280', marginTop: 4 },
});
