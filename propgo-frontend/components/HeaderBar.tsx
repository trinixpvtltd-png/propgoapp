import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationCtx } from '../context/LocationContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LocationPicker from './LocationPicker';
import { useLanguage } from '../context/LanguageContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function HeaderBar({ navigation }: Props) {
  const { currentCity, setManualCity } = useLocationCtx();
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const { locale, toggle, t } = useLanguage();
  return (
    <SafeAreaView edges={['top']}>
      {/* Spacer to move header slightly lower from top */}
      <View style={{ height: 8 }} />
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.title}>PropGo</Text>
          <TouchableOpacity onPress={() => setPickerOpen(true)}>
            <Text style={styles.locationText}>{currentCity || t('setLocation')}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggle} style={[styles.iconBtn, { marginRight: 6 }]}> 
            <Text style={{ fontWeight: '600' }}>{locale === 'en' ? 'EN' : 'HI'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.iconBtn}>
          <MaterialCommunityIcons name="account-circle-outline" size={26} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
      <LocationPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(city) => setManualCity(city)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: '700' },
  iconBtn: { padding: 6, borderRadius: 999 },
  locationText: { marginLeft: 10, color: '#2563eb' },
});
