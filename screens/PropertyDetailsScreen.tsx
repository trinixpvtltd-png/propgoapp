import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

type PlotDetails = {
  area: string;
  address: string;
  city: string;
  description: string;
  price: string; // e.g. "₹ 4,800,000 (Price per sqft: ₹ 4000)"
};

type Dealer = {
  name: string;
  phone: string;
  email: string;
  experience: string;
};

export default function PropertyDetailsScreen({ route, navigation }: any) {
  const { id, areaUnit, category, item } = route.params || {};
  const { t } = useLanguage();

  // Dummy data per spec
  const plot: PlotDetails = useMemo(() => ({
    area: '1200 sqft',
    address: '123, Green Valley Road, Sector 45',
    city: 'New Delhi',
    description: 'Spacious residential plot in a prime locality, close to schools and markets.',
    price: '₹ 4,800,000 (Price per sqft: ₹ 4000)'
  }), []);

  const dealer: Dealer = useMemo(() => ({
    name: 'Rohit Sharma',
    phone: '+91-9876543210',
    email: 'rohit.sharma@propertydealers.com',
    experience: '10+ years in real estate'
  }), []);

  const handleChat = () => {
    navigation?.navigate?.('Chat');
  };

  // Helpers: convert sqft <-> unit and compute per-unit price
  const targetUnit: 'Sqft' | 'Sq Yards' | 'Sq Meters' | 'Acres' | 'Hectares' = areaUnit || 'Sqft';
  const unitLabel = (u: typeof targetUnit) => {
    switch (u) {
      case 'Sqft': return 'sqft';
      case 'Sq Yards': return 'sqyd';
      case 'Sq Meters': return 'sqmtr';
      case 'Acres': return 'acre';
      case 'Hectares': return 'hectare';
      default: return 'sqft';
    }
  };
  const sqftToUnit = (v: number) => {
    switch (targetUnit) {
      case 'Sqft': return v;
      case 'Sq Yards': return v / 9;
      case 'Sq Meters': return v / 10.7639;
      case 'Acres': return v / 43560;
      case 'Hectares': return v / 107639;
      default: return v;
    }
  };
  const perSqftToPerUnit = (v: number) => {
    switch (targetUnit) {
      case 'Sqft': return v;
      case 'Sq Yards': return v * 9;
      case 'Sq Meters': return v * 10.7639;
      case 'Acres': return v * 43560;
      case 'Hectares': return v * 107639;
      default: return v;
    }
  };

  // Use passed item (from mock list). Assume item.area is in sqft and item.price is total INR.
  const baseAreaSqft = typeof item?.area === 'number' ? item.area : 1200;
  const totalPrice = typeof item?.price === 'number' ? item.price : 4800000;
  const pricePerSqft = baseAreaSqft > 0 ? (totalPrice / baseAreaSqft) : 0;
  const pricePerTarget = perSqftToPerUnit(pricePerSqft);
  const areaInTarget = sqftToUnit(baseAreaSqft);

  const isHouse = category === 'Houses' || category === 'Home';
  const isApartment = category === 'Apartments';
  const pageTitle = isHouse ? t('houseDetails') : isApartment ? t('apartmentDetails') : (category === 'Land' ? t('landDetails') : t('plotDetails'));
  const infoTitle = isHouse ? t('houseInformation') : isApartment ? t('apartmentInformation') : (category === 'Land' ? t('landInformation') : t('plotInformation'));

  // House-specific extra fields (dummy for now)
  const houseExtras = {
    bedrooms: '3',
    bathrooms: '2',
    floors: '2',
    furnishing: 'Semi-Furnished',
    amenities: ['Parking', 'Balcony', 'Garden'],
    constructionYear: '2015',
    propertyType: 'Independent House',
    address: '45, Sunrise Apartments, Sector 21',
  };

  // Dealer selection by category
  const chosenDealer: Dealer = isHouse
    ? { name: 'Anita Verma', phone: '+91-9123456780', email: 'anita.verma@propertydealers.com', experience: '8 years in residential property' }
    : isApartment
      ? { name: 'ABC Realty (Dummy)', phone: '+91 9876543210', email: 'dealer@abc.com', experience: '—' }
      : { name: dealer.name, phone: dealer.phone, email: dealer.email, experience: dealer.experience };

  // Apartment-specific extra fields (dummy for now)
  const apartmentExtras = {
    name: item?.title || 'Skyline Heights (Dummy)',
    areaNote: '(Dummy)',
    address: 'Block A, Sector 45, Gurgaon (Dummy)',
    city: item?.city || 'Gurgaon (Dummy)',
    floorNumber: '8th Floor (Dummy)',
    totalFloors: '20 (Dummy)',
    bedrooms: '3 BHK (Dummy)',
    bathrooms: '2 (Dummy)',
    balconies: '2 (Dummy)',
    amenities: ['Gym', 'Swimming Pool', 'Parking', 'Clubhouse (Dummy)'],
    description: 'Spacious 3 BHK apartment with modern amenities and good ventilation. (Dummy)'
  };

  const handleCall = () => {
    const tel = (chosenDealer.phone || dealer.phone).replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${tel}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>{pageTitle}</Text>

      {/* Information Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{infoTitle}</Text>
        {/* Area */}
  <View style={styles.row}><Text style={styles.label}>{t('area')}</Text><Text style={styles.value}>{`${Math.round(areaInTarget)} ${unitLabel(targetUnit)}${isApartment ? ' (Dummy)' : ''}`}</Text></View>
  {/* Address */}
  <View style={styles.row}><Text style={styles.label}>{t('address')}</Text><Text style={styles.value}>{isHouse ? houseExtras.address : isApartment ? apartmentExtras.address : plot.address}</Text></View>
  {/* City */}
  <View style={styles.row}><Text style={styles.label}>{t('cityLabel')}</Text><Text style={styles.value}>{isApartment ? apartmentExtras.city : (item?.city || plot.city)}</Text></View>
  {/* Description */}
  <View style={styles.rowCol}><Text style={styles.label}>{t('description')}</Text><Text style={styles.value}>{isApartment ? apartmentExtras.description : plot.description}</Text></View>
        {isHouse && (
          <>
            <View style={styles.row}><Text style={styles.label}>{t('numberBedrooms')}</Text><Text style={styles.value}>{houseExtras.bedrooms}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('numberBathrooms')}</Text><Text style={styles.value}>{houseExtras.bathrooms}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Floors</Text><Text style={styles.value}>{houseExtras.floors}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Furnishing Status</Text><Text style={styles.value}>{houseExtras.furnishing}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('amenities')}</Text><Text style={styles.value}>{houseExtras.amenities.join(', ')}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Construction Year</Text><Text style={styles.value}>{houseExtras.constructionYear}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Property Type</Text><Text style={styles.value}>{houseExtras.propertyType}</Text></View>
          </>
        )}
        {isApartment && (
          <>
            <View style={styles.row}><Text style={styles.label}>{t('apartmentName')}</Text><Text style={styles.value}>{apartmentExtras.name}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('floorNumber')}</Text><Text style={styles.value}>{apartmentExtras.floorNumber}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('totalFloors')}</Text><Text style={styles.value}>{apartmentExtras.totalFloors}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('numberBedrooms')}</Text><Text style={styles.value}>{apartmentExtras.bedrooms}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('numberBathrooms')}</Text><Text style={styles.value}>{apartmentExtras.bathrooms}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('balconies')}</Text><Text style={styles.value}>{apartmentExtras.balconies}</Text></View>
            <View style={styles.row}><Text style={styles.label}>{t('amenities')}</Text><Text style={styles.value}>{apartmentExtras.amenities.join(', ')}</Text></View>
          </>
        )}
        {/* Price */}
        {!isApartment && (
          <View style={styles.row}><Text style={styles.label}>{t('price')}</Text><Text style={styles.value}>{`₹ ${totalPrice.toLocaleString('en-IN')} (${t('pricePerPrefix')} ${unitLabel(targetUnit)}: ₹ ${Math.round(pricePerTarget).toLocaleString('en-IN')})`}</Text></View>
        )}
        {isApartment && (
          <View style={styles.row}><Text style={styles.label}>{t('pricePerUnitTotal')}</Text><Text style={styles.value}>{`₹ ${Math.round(pricePerTarget).toLocaleString('en-IN')} ${t('pricePerPrefix')} ${unitLabel(targetUnit)} / ₹ ${totalPrice.toLocaleString('en-IN')} total (Dummy)`}</Text></View>
        )}
      </View>

      {/* Dealer Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t('propertyDealerDetails')}</Text>
        <View style={styles.row}><Text style={styles.label}>{t('dealerName')}</Text><Text style={styles.value}>{chosenDealer.name}</Text></View>
        <View style={styles.row}><Text style={styles.label}>{t('contactNumber')}</Text><Text style={styles.value}>{chosenDealer.phone}</Text></View>
        <View style={styles.row}><Text style={styles.label}>{t('email')}</Text><Text style={styles.value}>{chosenDealer.email}</Text></View>
        {isApartment ? null : <View style={styles.row}><Text style={styles.label}>{t('experience')}</Text><Text style={styles.value}>{chosenDealer.experience}</Text></View>}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.chat]} onPress={handleChat}>
          <MaterialCommunityIcons name="chat" size={18} color="#fff" />
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.call]} onPress={handleCall}>
          <MaterialCommunityIcons name="phone" size={18} color="#fff" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  content: { padding: 16 },
  pageTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowCol: { paddingVertical: 6 },
  label: { color: '#666', width: 110 },
  value: { color: '#111', flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: '600' },
  chat: { backgroundColor: '#2563eb' },
  call: { backgroundColor: '#16a34a' },
});
