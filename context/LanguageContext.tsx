import React, { createContext, useContext, useMemo, useState } from 'react';

type Locale = 'en' | 'hi';

type Dict = Record<string, string>;

const translations: Record<Locale, Dict> = {
  en: {
    city: 'City',
    sector: 'Sector',
    areaOfCity: 'Area of the City',
    area: 'Area',
    enterCity: 'Enter city',
    enterSector: 'Enter sector',
    enterAreaOfCity: 'Enter area of the city',
    enterArea: 'Enter Area',
    price: 'Price',
    enterPrice: 'Enter Price',
    pricePerPrefix: 'Price per',
    verifiedOnly: 'Verified only',
    chooseLocation: 'Choose location',
    searchCity: 'Search city',
    nearby: 'Nearby',
    allCities: 'All cities',
    useCurrent: 'Use current',
    setLocation: 'Set location',
    verified: 'Verified',
    notVerified: 'Not Verified',
    editProfile: 'Edit Profile',
    subscription: 'Subscription',
    properties: 'Properties',
    addProperty: 'Add Property',
    chat: 'Chat',
    call: 'Call',
    addPropertyTitle: 'Add Property',
    title: 'Title',
    description: 'Description',
    submit: 'Submit',
    pricePlaceholder: 'e.g. 0-5000000',
    // Details pages
    plotDetails: 'Plot Details',
    landDetails: 'Land Details',
    houseDetails: 'House Details',
    apartmentDetails: 'Apartment Details',
    plotInformation: 'Plot Information',
    landInformation: 'Land Information',
    houseInformation: 'House Information',
    apartmentInformation: 'Apartment Information',
    address: 'Address',
    cityLabel: 'City',
    pricePerUnitTotal: 'Price (per unit / total)',
    propertyDealerDetails: 'Property Dealer Details',
    dealerName: 'Dealer Name',
    phone: 'Phone',
    contactNumber: 'Contact Number',
    email: 'Email',
    experience: 'Experience',
    apartmentName: 'Apartment Name',
    floorNumber: 'Floor Number',
    totalFloors: 'Total Floors',
    numberBedrooms: 'Number of Bedrooms',
    numberBathrooms: 'Number of Bathrooms',
    balconies: 'Balconies',
    amenities: 'Amenities',
    // Add Property form
    uploadPhoto: 'Upload Photo',
    category: 'Category',
    uploadDocument: 'Upload Document',
    district: 'District',
    state: 'State',
  },
  hi: {
    city: 'शहर',
    sector: 'सेक्टर',
    areaOfCity: 'शहर का क्षेत्र',
    area: 'क्षेत्रफल',
    enterCity: 'शहर दर्ज करें',
    enterSector: 'सेक्टर दर्ज करें',
    enterAreaOfCity: 'शहर के क्षेत्र का नाम',
    enterArea: 'क्षेत्रफल दर्ज करें',
    price: 'कीमत',
    enterPrice: 'कीमत दर्ज करें',
    pricePerPrefix: 'प्रति',
    verifiedOnly: 'केवल सत्यापित',
    chooseLocation: 'स्थान चुनें',
    searchCity: 'शहर खोजें',
    nearby: 'पास के',
    allCities: 'सभी शहर',
    useCurrent: 'वर्तमान स्थान उपयोग करें',
    setLocation: 'स्थान सेट करें',
    verified: 'सत्यापित',
    notVerified: 'असत्यापित',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    subscription: 'सदस्यता',
    properties: 'संपत्तियाँ',
    addProperty: 'संपत्ति जोड़ें',
    chat: 'चैट',
    call: 'कॉल',
    addPropertyTitle: 'संपत्ति जोड़ें',
    title: 'शीर्षक',
    description: 'विवरण',
    submit: 'जमा करें',
    pricePlaceholder: 'उदा. 0-5000000',
    // Details pages
    plotDetails: 'प्लॉट विवरण',
    landDetails: 'भूमि विवरण',
    houseDetails: 'मकान विवरण',
    apartmentDetails: 'अपार्टमेंट विवरण',
    plotInformation: 'प्लॉट जानकारी',
    landInformation: 'भूमि जानकारी',
    houseInformation: 'मकान जानकारी',
    apartmentInformation: 'अपार्टमेंट जानकारी',
    address: 'पता',
    cityLabel: 'शहर',
    pricePerUnitTotal: 'कीमत (प्रति इकाई / कुल)',
    propertyDealerDetails: 'प्रॉपर्टी डीलर विवरण',
    dealerName: 'डीलर नाम',
    phone: 'फोन',
    contactNumber: 'संपर्क नंबर',
    email: 'ईमेल',
    experience: 'अनुभव',
    apartmentName: 'अपार्टमेंट नाम',
    floorNumber: 'मंज़िल संख्या',
    totalFloors: 'कुल मंज़िलें',
    numberBedrooms: 'शयनकक्षों की संख्या',
    numberBathrooms: 'बाथरूमों की संख्या',
    balconies: 'बालकनी',
    amenities: 'सुविधाएँ',
    // Add Property form
    uploadPhoto: 'फ़ोटो अपलोड करें',
    category: 'श्रेणी',
    uploadDocument: 'दस्तावेज़ अपलोड करें',
    district: 'ज़िला',
    state: 'राज्य',
  },
};

type LanguageCtx = {
  locale: Locale;
  toggle: () => void;
  t: (key: keyof typeof translations['en']) => string;
};

const Ctx = createContext<LanguageCtx | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const t = (key: keyof typeof translations['en']) => translations[locale][key] || translations.en[key] || String(key);
  const value = useMemo(() => ({ locale, toggle: () => setLocale((l) => (l === 'en' ? 'hi' : 'en')), t }), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLanguage() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
