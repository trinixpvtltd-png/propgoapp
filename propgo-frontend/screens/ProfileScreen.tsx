import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking, ScrollView, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { useListings } from '../context/ListingsContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { listings } = useListings();
  const mock = {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    subscription: 'Active',
    propertiesUploaded: 12,
    avatar: 'https://i.pravatar.cc/150?img=12',
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: mock.avatar }} style={styles.avatar} />
      <Text style={styles.name}>{mock.name}</Text>
      <Text style={styles.meta}>{mock.email}</Text>
      <Text style={styles.meta}>{mock.phone}</Text>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>{t('subscription')}: {mock.subscription}</Text>
        <Text style={styles.badge}>{t('properties')}: {mock.propertiesUploaded}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>{t('editProfile')}</Text>
      </TouchableOpacity>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('addProperty')} Section</Text>
        <Text style={styles.sectionDesc}>Create a new property listing with photos, details, pricing and documents.</Text>
        <TouchableOpacity style={[styles.primaryBtn]} onPress={() => navigation.navigate('AddListing')}>
          <Text style={styles.primaryBtnText}>{t('addProperty')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.actionText}>{t('chat')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => Linking.openURL(`tel:${mock.phone.replace(/[^0-9+]/g,'')}`)}>
          <Text style={styles.actionText}>{t('call')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.sectionCard, { alignItems: 'flex-start' }]}> 
        <Text style={styles.sectionTitle}>My Listings</Text>
        {listings.length === 0 && <Text style={styles.emptyText}>No properties saved yet.</Text>}
        {listings.map(item => (
          <View key={item.id} style={styles.listingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.listingMeta}>{item.typeOfProperty} • {item.city}</Text>
            </View>
            <TouchableOpacity style={styles.editSmallBtn} onPress={() => navigation.navigate('AddListing', { listingId: item.id })}>
              <Text style={styles.editSmallText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '700' },
  meta: { color: '#555', marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  badge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  editBtn: { marginTop: 14, backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  editText: { color: '#fff', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 40 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
  sectionCard: { width: '100%', marginTop: 28, backgroundColor: '#f8fafc', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#0f172a' },
  sectionDesc: { fontSize: 13, color: '#475569', marginBottom: 14 },
  primaryBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  listingRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', gap: 10 },
  listingTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  listingMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  editSmallBtn: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  editSmallText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  emptyText: { fontSize: 12, color: '#64748b' }
});
