import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { HouseFilterState, defaultHouseFilters } from '../src/utils/houseFilters';

type Props = {
  value: HouseFilterState;
  onChange: (next: Partial<HouseFilterState>) => void;
  onSearch: () => void;
};

export default function HouseFilters({ value, onChange, onSearch }: Props) {
  const [open, setOpen] = React.useState(false);

  const toggleAmenity = (name: HouseFilterState['amenities'][number]) => {
    const set = new Set(value.amenities);
    if (set.has(name)) set.delete(name); else set.add(name);
    onChange({ amenities: Array.from(set) as HouseFilterState['amenities'] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.rowBtn, styles.filterRowBtn, styles.full]} onPress={() => setOpen((o) => !o)}>
          <Text style={styles.filterText}>Filter ▾</Text>
        </TouchableOpacity>
      </View>
      {open && (
        <View style={styles.panel}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 320 }} contentContainerStyle={{ paddingBottom: 4 }}>
            <View style={styles.row}>
              <Checkbox label="House" checked={!!value.house} onToggle={() => onChange({ house: !value.house })} />
              <Checkbox label="Society" checked={!!value.society} onToggle={() => onChange({ society: !value.society })} />
            </View>
            <Dropdown label="Floor" value={value.floor || ''} options={["Ground","1st","2nd","3rd","4th+"]} onChange={(v) => onChange({ floor: v as any })} />
            <Dropdown label="Number of Rooms" value={value.rooms || ''} options={["1 BHK","2 BHK","3 BHK","4+ BHK"]} onChange={(v) => onChange({ rooms: v as any })} />
            <Dropdown label="Number of Bathrooms" value={value.bathrooms || ''} options={["1","2","3","4+"]} onChange={(v) => onChange({ bathrooms: v as any })} />
            <Dropdown label="Balcony" value={value.balcony || ''} options={["0","1","2","3+"]} onChange={(v) => onChange({ balcony: v as any })} />

            <Text style={styles.subLabel}>Amenities</Text>
            <View style={styles.wrap}>
              {(["Parking","Garden","Water Supply","Power Backup","Security","Terrace Access"] as const).map((a) => (
                <Checkbox key={a} label={a} checked={value.amenities.includes(a)} onToggle={() => toggleAmenity(a)} />
              ))}
            </View>

            <Dropdown label="Year of Construction" value={value.year || ''} options={["<2000","2000-2010","2011-2020","2021+"]} onChange={(v) => onChange({ year: v as any })} />
            <Dropdown label="Property Type" value={value.propertyType || ''} options={["Independent House","Villa","Duplex","Row House"]} onChange={(v) => onChange({ propertyType: v as any })} />
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function Checkbox({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
      <View style={[styles.box, checked && styles.boxChecked]} />
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}

function Dropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.subLabel}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setOpen((o) => !o)}>
        <Text>{value || `Select ${label}`}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {options.map((opt) => (
            <TouchableOpacity key={opt} style={styles.option} onPress={() => { onChange(opt); setOpen(false); }}>
              <Text>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', width: '100%' },
  // Row buttons (top): unified height and alignment
  rowBtn: { minHeight: 44, paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  filterRowBtn: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa' },
  searchRowBtn: { backgroundColor: '#2563eb' },
  buttonsRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  half: { flex: 1 },
  full: { flex: 1 },
  filterText: { fontWeight: '600' },
  panel: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  subLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  box: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#bbb', marginRight: 6 },
  boxChecked: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#fafafa' },
  dropdown: { marginTop: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff' },
  option: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  // Panel search button (separate from row)
  searchBtn: { marginTop: 12, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  searchText: { color: '#fff', fontWeight: '700' },
});
