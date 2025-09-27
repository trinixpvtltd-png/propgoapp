import React from 'react';
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity, FlatList } from 'react-native';
import { useLocationCtx } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

export type SearchFilters = {
  city: string;
  price: string; // label or manual e.g. "0-1000000"
  area: string; // e.g. "0-2000"
  areaUnit: 'Sqft' | 'Sq Yards' | 'Sq Meters' | 'Acres' | 'Hectares';
  verifiedOnly: boolean;
  sector?: string; // For Plot, Houses, Apartments
  areaOfCity?: string; // For Land
};

type Props = {
  filters: SearchFilters;
  onChange: (next: Partial<SearchFilters>) => void;
  extraField?: 'sector' | 'areaOfCity';
  renderBelowArea?: React.ReactNode; // custom UI to render below area/price row, above verified row
};

export default function SearchRow({ filters, onChange, extraField, renderBelowArea }: Props) {
  const { suggestions, currentCity } = useLocationCtx();
  const { t } = useLanguage();
  const [showCitySuggestions, setShowCitySuggestions] = React.useState(false);
  const [priceOpen, setPriceOpen] = React.useState(false);
  const [unitOpen, setUnitOpen] = React.useState(false);

  // Map internal unit to UI label
  const unitLabelFromValue = (v: SearchFilters['areaUnit']) => {
    switch (v) {
      case 'Sqft': return 'sqft';
      case 'Sq Meters': return 'sqmtr';
      case 'Acres': return 'acre';
      case 'Hectares': return 'hectare';
      case 'Sq Yards': return 'sqyd';
      default: return 'sqft';
    }
  };
  const unitOptions: Array<{ label: 'sqft' | 'sqmtr' | 'acre' | 'hectare' | 'sqyd'; value: SearchFilters['areaUnit'] }> = [
    { label: 'sqft', value: 'Sqft' },
    { label: 'sqyd', value: 'Sq Yards' },
    { label: 'sqmtr', value: 'Sq Meters' },
    { label: 'acre', value: 'Acres' },
    { label: 'hectare', value: 'Hectares' },
  ];
  const pricePerLabel = `${t('pricePerPrefix')} ${unitLabelFromValue(filters.areaUnit)}`;
  return (
    <View style={styles.container}>
      {/* Top row: City + (Sector | Area of the City) */}
      <View style={styles.row}>
        <View style={[styles.field, styles.rowItem]}>
          <Text style={styles.label}>{t('city')}</Text>
          <TextInput
            placeholder={t('enterCity')}
            value={filters.city}
            onChangeText={(text) => onChange({ city: text })}
            style={styles.input}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
          />
          {showCitySuggestions && (filters.city.length > 0 || currentCity) && (
            <View style={styles.dropdown}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={(filters.city
                  ? suggestions.filter((c) => c.toLowerCase().includes(filters.city.toLowerCase()))
                  : suggestions).slice(0, 6)}
                keyExtractor={(it) => it}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => { onChange({ city: item }); setShowCitySuggestions(false); }} style={styles.option}>
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
                ListFooterComponent={() => (
                  currentCity ? (
                    <TouchableOpacity onPress={() => { onChange({ city: currentCity }); setShowCitySuggestions(false); }} style={styles.option}>
                      <Text>Use current: {currentCity}</Text>
                    </TouchableOpacity>
                  ) : null
                )}
              />
            </View>
          )}
        </View>
        {extraField === 'sector' && (
          <View style={[styles.field, styles.rowItem]}>
            <Text style={styles.label}>{t('sector')}</Text>
            <TextInput
              placeholder={t('enterSector')}
              value={filters.sector || ''}
              onChangeText={(t) => onChange({ sector: t })}
              style={styles.input}
            />
          </View>
        )}
        {extraField === 'areaOfCity' && (
          <View style={[styles.field, styles.rowItem]}>
            <Text style={styles.label}>{t('areaOfCity')}</Text>
            <TextInput
              placeholder={t('enterAreaOfCity')}
              value={filters.areaOfCity || ''}
              onChangeText={(t) => onChange({ areaOfCity: t })}
              style={styles.input}
            />
          </View>
        )}
      </View>

      {/* Second row: Area (left) + Price (right) */}
      <View style={styles.row}>
        <View style={[styles.field, styles.rowItem]}>
          <View style={styles.areaLabelRow}>
            <Text style={[styles.label, styles.inlineLabel]}>{t('area')}</Text>
            <View style={styles.divider} />
            <View style={{ position: 'relative', marginLeft: 6, zIndex: 30 }}>
              <TouchableOpacity
                onPress={() => setUnitOpen((o) => !o)}
                activeOpacity={0.7}
                style={styles.unitPlain}
              >
                <Text style={styles.unitText}>{unitLabelFromValue(filters.areaUnit)}</Text>
                <Text style={styles.chevPlain}>▾</Text>
              </TouchableOpacity>
              {unitOpen && (
                <View style={styles.dropdownMenu}>
                  {unitOptions.map((opt) => (
                    <TouchableOpacity key={opt.label} style={styles.option} onPress={() => { onChange({ areaUnit: opt.value }); setUnitOpen(false); }}>
                      <Text>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          <TextInput
            placeholder={t('enterArea')}
            value={filters.area}
            onChangeText={(t) => onChange({ area: t })}
            style={[styles.input]}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.field, styles.rowItem]}>
          <Text style={styles.label}>{pricePerLabel}</Text>
          <TextInput
            placeholder={t('enterPrice')}
            value={filters.price}
            onChangeText={(t) => onChange({ price: t })}
            style={[styles.input]}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Custom slot below area/price and above verified */}
      {renderBelowArea}

      {/* Third row: Verified only switch */}
      <View style={[styles.row, styles.switchRow]}>
  <Text style={styles.label}>{t('verifiedOnly')}</Text>
        <Switch
          value={filters.verifiedOnly}
          onValueChange={(v) => onChange({ verifiedOnly: v })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#fff' },
  field: { marginBottom: 10 },
  label: { fontSize: 12, lineHeight: 16, color: '#555', marginBottom: 6 },
  inlineLabel: { marginBottom: 0 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row', gap: 10 },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowItem: { flex: 1 },
  areaLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 6, marginBottom: 6 },
  divider: { width: 1, height: 14, backgroundColor: '#e5e7eb' },
  switchRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 160,
  },
  option: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  unitDropdownWrap: { width: 140 },
  flex: { flex: 1 },
  unitBox: { paddingRight: 28, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minWidth: 80 },
  unitPlain: { flexDirection: 'row', alignItems: 'center' },
  unitText: { textTransform: 'lowercase', color: '#555', fontSize: 12, lineHeight: 16 },
  chev: { position: 'absolute', right: 8, color: '#111' },
  chevPlain: { color: '#555', fontSize: 12, lineHeight: 16, marginLeft: 2 },
  dropdownMenu: { position: 'absolute', top: '100%', left: 0, marginTop: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff', zIndex: 9999, minWidth: 160, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
});
