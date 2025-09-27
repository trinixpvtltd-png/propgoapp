import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocationCtx } from '../context/LocationContext';
import { CITIES } from '../utils/geo';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
};

export default function LocationPicker({ visible, onClose, onSelect }: Props) {
  const { currentCity, suggestions, refresh } = useLocationCtx();
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const allCities = useMemo(() => {
    const names = CITIES.map((c) => c.name);
    return names.sort();
  }, []);

  const filteredNearby = useMemo(() => {
    const list = suggestions;
    if (!query.trim()) return list;
    return list.filter((c) => c.toLowerCase().includes(query.toLowerCase()));
  }, [suggestions, query]);

  const filteredAll = useMemo(() => {
    if (!query.trim()) return allCities;
    return allCities.filter((c) => c.toLowerCase().includes(query.toLowerCase()));
  }, [allCities, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('chooseLocation')}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={18} color="#666" />
            <TextInput
              style={styles.search}
              placeholder={t('searchCity')}
              value={query}
              onChangeText={setQuery}
            />
          </View>
          {currentCity ? (
            <TouchableOpacity style={styles.current} onPress={() => { onSelect(currentCity); onClose(); }}>
              <MaterialCommunityIcons name="crosshairs-gps" size={18} color="#2563eb" />
              <Text style={styles.currentText}>{t('useCurrent')}: {currentCity}</Text>
              <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={refresh}>
                <MaterialCommunityIcons name="refresh" size={18} color="#2563eb" />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : null}

          {filteredNearby.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.section}>{t('nearby')}</Text>
              <FlatList
                data={filteredNearby}
                keyExtractor={(it) => 'near-' + it}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.option} onPress={() => { onSelect(item); onClose(); }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={18} color="#111" />
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <Text style={styles.section}>{t('allCities')}</Text>
          <FlatList
            data={filteredAll}
            keyExtractor={(it) => 'all-' + it}
            style={{ flexGrow: 0, maxHeight: 260 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.option} onPress={() => { onSelect(item); onClose(); }}>
                <MaterialCommunityIcons name="city-variant-outline" size={18} color="#111" />
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  search: { flex: 1 },
  section: { fontSize: 12, color: '#6b7280', marginTop: 12, marginBottom: 6 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', gap: 8 },
  optionText: { fontSize: 14 },
  current: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  currentText: { color: '#2563eb', fontWeight: '600' },
});
