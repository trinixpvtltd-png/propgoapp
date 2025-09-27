import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { defaultApartmentFilters, ApartmentFilterState } from '../src/utils/apartmentFilters';

// Lightweight dropdown & checkbox UI matching existing styles

type Props = {
  value: ApartmentFilterState;
  onChange: (next: Partial<ApartmentFilterState>) => void;
  onSearch: () => void;
};

export default function ApartmentFilters({ value, onChange, onSearch }: Props) {
  const [open, setOpen] = React.useState(false);

  const toggleAmenity = (name: ApartmentFilterState['amenities'][number]) => {
    const set = new Set(value.amenities);
    if (set.has(name)) set.delete(name); else set.add(name);
    onChange({ amenities: Array.from(set) as ApartmentFilterState['amenities'] });
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
              <Checkbox label="Apartment" checked={!!value.apartment} onToggle={() => onChange({ apartment: !value.apartment })} />
              <Checkbox label="Society" checked={!!value.society} onToggle={() => onChange({ society: !value.society })} />
            </View>
            <Dropdown label="Floor" value={value.floor || ''} options={["Ground","1st","2nd","3rd","4th+","Penthouse"]} onChange={(v) => onChange({ floor: v as any })} />
            <Dropdown label="Number of Rooms" value={value.rooms || ''} options={["1 BHK","2 BHK","3 BHK","4+ BHK"]} onChange={(v) => onChange({ rooms: v as any })} />
            <Dropdown label="Number of Bathrooms" value={value.bathrooms || ''} options={["1","2","3","4+"]} onChange={(v) => onChange({ bathrooms: v as any })} />
            <Dropdown label="Number of Balconies" value={value.balconies || ''} options={["0","1","2","3+"]} onChange={(v) => onChange({ balconies: v as any })} />

            <Text style={styles.subLabel}>Amenities</Text>
            <View style={styles.wrap}>
              {(["Parking","Lift","Swimming Pool","Gym","Security","Power Backup","Play Area"] as const).map((a) => (
                <Checkbox key={a} label={a} checked={value.amenities.includes(a)} onToggle={() => toggleAmenity(a)} />
              ))}
            </View>
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
  buttonsRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  half: { flex: 1 },
  full: { flex: 1 },
});
