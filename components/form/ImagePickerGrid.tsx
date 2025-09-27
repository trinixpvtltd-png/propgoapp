import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImageItem { uri: string; width?: number; height?: number; }

interface Props {
  label: string;
  images: ImageItem[];
  onChange: (imgs: ImageItem[]) => void;
  max?: number;
  error?: string;
  helperText?: string;
}

export const ImagePickerGrid: React.FC<Props> = ({ label, images, onChange, max = 12, error, helperText }) => {
  const pick = async () => {
    if (images.length >= max) return Alert.alert('Limit reached', `You can upload up to ${max} photos.`);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission required', 'Media library permission is needed.');
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images, selectionLimit: max - images.length });
    if (res.canceled) return;
    const picked = res.assets.map(a => ({ uri: a.uri, width: a.width, height: a.height }));
    onChange([...images, ...picked].slice(0, max));
  };
  const remove = (uri: string) => onChange(images.filter(i => i.uri !== uri));
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {images.map(img => (
          <View key={img.uri} style={styles.item}>
            <Image source={{ uri: img.uri }} style={styles.image} />
            <TouchableOpacity style={styles.remove} onPress={() => remove(img.uri)}><Text style={styles.removeText}>×</Text></TouchableOpacity>
          </View>
        ))}
        {images.length < max && (
          <TouchableOpacity style={styles.add} onPress={pick}>
            <Text style={styles.addPlus}>＋</Text>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.counter}>{images.length}/{max} photos</Text>
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
};

const SIZE = 86;
const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: { width: SIZE, height: SIZE, borderRadius: 12, overflow: 'hidden', position: 'relative', backgroundColor: '#f1f5f9' },
  image: { width: '100%', height: '100%' },
  remove: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.35)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  removeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  add: { width: SIZE, height: SIZE, borderRadius: 12, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', padding: 4 },
  addPlus: { fontSize: 28, lineHeight: 28, color: '#475569', marginBottom: 2 },
  addText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  counter: { fontSize: 11, color: '#64748b', marginTop: 4 },
  error: { fontSize: 11, color: '#b91c1c', marginTop: 4 },
  helper: { fontSize: 11, color: '#6b7280', marginTop: 4 },
});
