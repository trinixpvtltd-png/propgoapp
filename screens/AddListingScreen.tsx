import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useListings } from '../context/ListingsContext';

/* ---------------------- Constants & Spec ---------------------- */
const MAX_IMAGES = 12;
const MAX_DOCS = 5;
const currentYear = new Date().getFullYear();

type PropertyType = 'Apartment' | 'House' | 'Land' | 'Plot' | 'Shop' | '';
type PricingMode = 'Per Unit' | 'Total';

interface FieldRule {
  name: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'textarea' | 'image-array' | 'doc-array' | 'multiselect-chips';
  options?: string[];
  required?: boolean;
  max?: number | string;
  min?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  integer?: boolean;
  visibleWhen?: Record<string, string[]>; // field -> allowed values
  placeholder?: string;
}

const AMENITIES = [
  'Parking','Lift','Power Backup','Security','Gym','Park','Swimming Pool','24x7 Water','Gas Pipeline','Air Conditioning','Club House'
];

// Normalized field list (subset rendered based on property type)
const FIELD_GROUPS: Record<'ApartmentHouse' | 'LandPlot' | 'Shop', FieldRule[]> = {
  ApartmentHouse: [
    { name: 'typeOfProperty', label: 'Type of property', type: 'select', options: ['Apartment','House'], required: true },
    { name: 'authority', label: 'Authority', type: 'select', options: ['Government','Private','Builder'], required: true },
    { name: 'for', label: 'For', type: 'select', options: ['Sale','Rent'], required: true },
    { name: 'title', label: 'Title', type: 'text', required: true, minLength: 5, maxLength: 80, placeholder: 'e.g., 2BHK in Sector 62' },
    { name: 'photos', label: 'Photos Upload (optional)', type: 'image-array', max: 12 },
    { name: 'floor', label: 'Floor (Apartment)', type: 'number', integer: true, min: 0, visibleWhen: { typeOfProperty: ['Apartment'] } },
    { name: 'numberOfFloors', label: 'Number of Floor (House)', type: 'number', integer: true, min: 1, visibleWhen: { typeOfProperty: ['House'] } },
    { name: 'rooms', label: 'Number of rooms', type: 'number', required: true, integer: true, min: 1, max: 20 },
    { name: 'bathrooms', label: 'Number of bathrooms', type: 'number', required: true, integer: true, min: 1, max: 20 },
    { name: 'balconies', label: 'Balconies', type: 'number', integer: true, min: 0, max: 10 },
    { name: 'amenities', label: 'Amenities', type: 'multiselect-chips', options: AMENITIES },
    { name: 'yearOfConstruction', label: 'Year of construction', type: 'number', integer: true, min: 1900, max: 'currentYear' },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'House no., street' },
    { name: 'society', label: 'Society (Optional)', type: 'text' },
    { name: 'areaLocality', label: 'Area (Sector/more)', type: 'text', required: true },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'pincode', label: 'Pincode', type: 'text', required: true, pattern: '^\\d{6}$' },
    { name: 'district', label: 'District', type: 'text', required: true },
    { name: 'state', label: 'State', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', maxLength: 1000 },
    { name: 'areaOfProperty', label: 'Area of property', type: 'number', required: true, min: 1 },
    { name: 'areaUnit', label: 'Measurement Unit', type: 'select', options: ['Sqft','Sq Yards','Sq Meters','Acres','Hectares'], required: true },
    { name: 'pricePerUnit', label: 'Price Per Unit', type: 'number', required: true, min: 0 },
    { name: 'documents', label: 'Document Upload (Proof of ownership/sell)', type: 'doc-array', max: 5 },
  ],
  LandPlot: [
    { name: 'typeOfProperty', label: 'Type of property', type: 'select', options: ['Land','Plot'], required: true },
    { name: 'authority', label: 'Authority', type: 'select', options: ['Government','Private','Builder'], required: true },
    { name: 'for', label: 'For', type: 'select', options: ['Sale','Rent'], required: true },
    { name: 'category', label: 'Category', type: 'select', options: ['Residential','Commercial'], required: true },
    { name: 'title', label: 'Title', type: 'text', required: true, minLength: 5, maxLength: 80, placeholder: 'e.g., Residential plot near highway' },
    { name: 'photos', label: 'Upload photo (Optional)', type: 'image-array', max: 12 },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Plot no., street' },
    { name: 'areaLocality', label: 'Area (village/block/tehsil/more)', type: 'text', required: true },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'district', label: 'District', type: 'text', required: true },
    { name: 'state', label: 'State', type: 'text', required: true },
    { name: 'pincode', label: 'Pincode', type: 'text', required: true, pattern: '^\\d{6}$' },
    { name: 'description', label: 'Description', type: 'textarea', maxLength: 1000 },
    { name: 'areaOfProperty', label: 'Area of property', type: 'number', required: true, min: 1 },
    { name: 'pricingMode', label: 'Price mode', type: 'select', options: ['Per Unit','Total'], required: true },
    { name: 'pricePerUnit', label: 'Price per measurement unit', type: 'number', min: 0, visibleWhen: { pricingMode: ['Per Unit'] } },
    { name: 'areaUnit', label: 'Measurement Unit', type: 'select', options: ['Sqft','Sq Yards','Sq Meters','Acres','Hectares'], visibleWhen: { pricingMode: ['Per Unit'] } },
    { name: 'totalPrice', label: 'Total price', type: 'number', min: 0, visibleWhen: { pricingMode: ['Total'] } },
    { name: 'documents', label: 'Upload document (for verification)', type: 'doc-array', max: 5 },
  ],
  Shop: [
    { name: 'typeOfProperty', label: 'Type of property', type: 'select', options: ['Shop'], required: true },
    { name: 'authority', label: 'Authority', type: 'select', options: ['Government','Private','Builder'], required: true },
    { name: 'for', label: 'For', type: 'select', options: ['Sale','Rent'], required: true },
    { name: 'title', label: 'Title', type: 'text', required: true, minLength: 5, maxLength: 80, placeholder: 'e.g., Commercial shop near market' },
    { name: 'photos', label: 'Upload photo (Optional)', type: 'image-array', max: 12 },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Shop no., street' },
    { name: 'areaLocality', label: 'Area (village/block/tehsil/more)', type: 'text', required: true },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'district', label: 'District', type: 'text', required: true },
    { name: 'state', label: 'State', type: 'text', required: true },
    { name: 'pincode', label: 'Pincode', type: 'text', required: true, pattern: '^\\d{6}$' },
    { name: 'description', label: 'Description', type: 'textarea', maxLength: 1000 },
    { name: 'areaOfProperty', label: 'Area of property', type: 'number', required: true, min: 1 },
    { name: 'pricingMode', label: 'Price mode', type: 'select', options: ['Per Unit','Total'], required: true },
    { name: 'pricePerUnit', label: 'Price per measurement unit', type: 'number', min: 0, visibleWhen: { pricingMode: ['Per Unit'] } },
    { name: 'areaUnit', label: 'Measurement Unit', type: 'select', options: ['Sqft','Sq Yards','Sq Meters','Acres','Hectares'], visibleWhen: { pricingMode: ['Per Unit'] } },
    { name: 'totalPrice', label: 'Total price', type: 'number', min: 0, visibleWhen: { pricingMode: ['Total'] } },
    { name: 'documents', label: 'Upload document (for verification)', type: 'doc-array', max: 5 },
  ],
};

/* --------------------- Primitive Components -------------------- */
interface SelectProps { label?: string; value: string; onChange: (val: string) => void; options?: string[]; placeholder?: string; error?: string; disabled?: boolean; }
const Select: React.FC<SelectProps> = ({ label, value, onChange, options = [], placeholder='Select', error, disabled }) => {
  const [open,setOpen]=useState(false);
  return (<View style={styles.fieldWrap}>{label&&<Text style={styles.label}>{label}</Text>}
    <TouchableOpacity style={[styles.input, styles.select, disabled&&styles.disabledInput, error&&styles.inputError]} onPress={()=>!disabled&&setOpen(true)} activeOpacity={0.8}>
      <Text style={[styles.inputText,!value&&styles.placeholder]}>{value||placeholder}</Text><Text style={styles.chev}>▾</Text>
    </TouchableOpacity>
    {!!error&&<Text style={styles.errorText}>{error}</Text>}
    <Modal visible={open} transparent animationType="fade" onRequestClose={()=>setOpen(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={()=>setOpen(false)}>
        <View style={styles.modalSheet}><Text style={styles.modalTitle}>{label||'Choose'}</Text>
          <FlatList data={options} keyExtractor={i=>i} renderItem={({item})=> <TouchableOpacity style={styles.optionRow} onPress={()=>{onChange(item);setOpen(false);}}><Text style={styles.optionText}>{item}</Text></TouchableOpacity>} ItemSeparatorComponent={()=> <View style={styles.separator}/> }/> 
        </View>
      </TouchableOpacity>
    </Modal>
  </View>);
};

interface TextFieldProps { label?: string; value: string; onChangeText: (t:string)=>void; placeholder?: string; keyboardType?: any; error?: string; multiline?: boolean; maxLength?: number; disabled?: boolean; }
const TextField: React.FC<TextFieldProps> = (p) => {
  const { label,value,onChangeText,placeholder,keyboardType,error,multiline,maxLength,disabled } = p;
  return (<View style={styles.fieldWrap}>{label&&<Text style={styles.label}>{label}</Text>}<TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9aa0a6" keyboardType={keyboardType} style={[styles.input,multiline&&styles.textArea,disabled&&styles.disabledInput,error&&styles.inputError]} multiline={multiline} maxLength={maxLength} editable={!disabled} />{!!error&&<Text style={styles.errorText}>{error}</Text>}</View>);
};
const NumberField: React.FC<Omit<TextFieldProps,'keyboardType'>> = (props)=> <TextField {...props} keyboardType={Platform.OS==='ios'?'numbers-and-punctuation':'numeric'} />;

interface ImageAsset { uri: string; width?: number; height?: number; }
const ImagePickerGrid: React.FC<{label:string; images:ImageAsset[]; setImages:(a:ImageAsset[])=>void; max?:number;}> = ({label, images,setImages,max=MAX_IMAGES}) => {
  const pick = async () => { const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); if (status!=='granted'){ Alert.alert('Permission required','Allow photo access.'); return;} const res= await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,allowsMultipleSelection:true,quality:0.85,selectionLimit: Math.max(1,max-images.length)}); if(res.canceled) return; const assets=(res.assets||[]).map(a=>({uri:a.uri,width:a.width,height:a.height})); setImages([...images,...assets].slice(0,max));};
  const removeAt=(idx:number)=> setImages(images.filter((_,i)=>i!==idx));
  return (<View style={styles.fieldWrap}><Text style={styles.label}>{label} <Text style={styles.hint}>(up to {max})</Text></Text><View style={styles.imageGrid}>{images.map((img,i)=>(<View key={img.uri+i} style={styles.thumbWrap}><Image source={{uri:img.uri}} style={styles.thumb}/><TouchableOpacity style={styles.thumbRemove} onPress={()=>removeAt(i)}><Text style={styles.thumbRemoveText}>✕</Text></TouchableOpacity></View>))}{images.length<max && (<TouchableOpacity style={[styles.thumbWrap,styles.addThumb]} onPress={pick}><Text style={styles.addThumbText}>＋</Text><Text style={styles.addThumbSub}>Add photos</Text></TouchableOpacity>)}</View></View>);
};

interface DocAsset { uri: string; name?: string; mimeType?: string; }
const DocumentUploader: React.FC<{label:string; docs:DocAsset[]; setDocs:(d:DocAsset[])=>void; max?:number;}> = ({label, docs,setDocs,max=MAX_DOCS}) => {
  const pick = async ()=> { const res = await DocumentPicker.getDocumentAsync({multiple:true,type:['application/pdf','image/*'],copyToCacheDirectory:true}); if(res.canceled) return; const nf=(res.assets||[]).map(a=>({uri:a.uri,name:a.name,mimeType:a.mimeType})); setDocs([...docs,...nf].slice(0,max)); };
  const removeAt=(idx:number)=> setDocs(docs.filter((_,i)=>i!==idx));
  return (<View style={styles.fieldWrap}><Text style={styles.label}>{label} <Text style={styles.hint}>(up to {max})</Text></Text>{docs.map((d,i)=>(<View key={d.uri+i} style={styles.docRow}><Text style={styles.docName} numberOfLines={1}>{d.name||'Document'}</Text><TouchableOpacity onPress={()=>removeAt(i)}><Text style={styles.removeLink}>Remove</Text></TouchableOpacity></View>))}{docs.length<max && (<TouchableOpacity style={styles.buttonOutline} onPress={pick}><Text style={styles.buttonOutlineText}>Upload document</Text></TouchableOpacity>)}</View>);
};

const Chips: React.FC<{ label?:string; options:string[]; values:string[]; onToggle:(v:string)=>void; }> = ({label,options,values,onToggle}) => (
  <View style={styles.fieldWrap}>{label&&<Text style={styles.label}>{label}</Text>}<View style={styles.chipsRow}>{options.map(o=> { const sel=values.includes(o); return <TouchableOpacity key={o} style={[styles.chip, sel && styles.chipActive]} onPress={()=> onToggle(o)}><Text style={[styles.chipText, sel && styles.chipTextActive]}>{o}</Text></TouchableOpacity>; })}</View></View>
);

const Section: React.FC<{title:string; children:React.ReactNode}> = ({title,children}) => (<View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>);

/* ---------------------- Main Screen ---------------------- */
export default function AddListingScreen(){
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { addListing, updateListing, getListing } = useListings();
  const scrollRef = useRef<ScrollView>(null);
  const editingId = route.params?.listingId as string | undefined;

  // Core state
  const [typeOfProperty,setTypeOfProperty]=useState<PropertyType>('');
  const [authority,setAuthority]=useState('');
  const [saleOrRent,setSaleOrRent]=useState('');
  const [category,setCategory]=useState('');
  const [title,setTitle]=useState('');
  const [photos,setPhotos]=useState<ImageAsset[]>([]);
  // Layout / specifics
  const [floor,setFloor]=useState('');
  const [numberOfFloors,setNumberOfFloors]=useState('');
  const [rooms,setRooms]=useState('');
  const [bathrooms,setBathrooms]=useState('');
  const [balconies,setBalconies]=useState('');
  const [amenities,setAmenities]=useState<string[]>([]);
  const [yearOfConstruction,setYearOfConstruction]=useState('');
  const [society,setSociety]=useState('');
  // Location
  const [address,setAddress]=useState('');
  const [areaLocality,setAreaLocality]=useState('');
  const [city,setCity]=useState('');
  const [district,setDistrict]=useState('');
  const [stateName,setStateName]=useState('');
  const [pincode,setPincode]=useState('');
  // Area & pricing
  const [areaOfProperty,setAreaOfProperty]=useState('');
  const [areaUnit,setAreaUnit]=useState('Sqft');
  const [pricingMode,setPricingMode]=useState<PricingMode>('Per Unit'); // Land/Plot/Shop only
  const [pricePerUnit,setPricePerUnit]=useState('');
  const [totalPrice,setTotalPrice]=useState('');
  const [description,setDescription]=useState('');
  const [documents,setDocuments]=useState<DocAsset[]>([]);
  const [errors,setErrors]=useState<Record<string,string>>({});

  // Editing prefill
  useEffect(()=> { if(editingId){ const ex = getListing(editingId); if(ex){
    setTypeOfProperty(ex.typeOfProperty as PropertyType);
    setAuthority(ex.authority||''); setSaleOrRent(ex.for); setCategory(ex.category||''); setTitle(ex.title); setPhotos(ex.photos as any);
    setAddress(ex.address); setAreaLocality(ex.areaLocality||''); setCity(ex.city); setDistrict(ex.district); setStateName(ex.state); setPincode(ex.pincode);
    setAreaOfProperty(String(ex.area));
    if(ex.rooms) setRooms(String(ex.rooms)); if(ex.bathrooms) setBathrooms(String(ex.bathrooms)); if(ex.balconies!==undefined) setBalconies(String(ex.balconies));
    if(ex.floor!==undefined) setFloor(String(ex.floor)); if(ex.numberOfFloors!==undefined) setNumberOfFloors(String(ex.numberOfFloors));
    if(ex.amenities) setAmenities(ex.amenities); if(ex.yearOfConstruction) setYearOfConstruction(String(ex.yearOfConstruction)); if(ex.society) setSociety(ex.society);
    if(ex.pricing.mode==='PerUnit'){ setPricingMode('Per Unit'); setPricePerUnit(String(ex.pricing.pricePerUnit)); setAreaUnit(ex.pricing.unit); }
    else { setPricingMode('Total'); setTotalPrice(String(ex.pricing.totalPrice)); }
    setDescription(ex.description); setDocuments(ex.documents as any);
  }} }, [editingId,getListing]);

  /* ------------- Derived flags ------------- */
  const isApt = typeOfProperty==='Apartment';
  const isHouse = typeOfProperty==='House';
  const isApartmentHouse = isApt || isHouse;
  const isLandPlot = typeOfProperty==='Land' || typeOfProperty==='Plot';
  const isShop = typeOfProperty==='Shop';
  const pricingModeApplies = isLandPlot || isShop; // else forced PerUnit style for Apartment/House
  const showCategory = isLandPlot; // category only for land/plot
  const showFloor = isApt; const showNumberOfFloors = isHouse;
  const showLayoutBlock = isApartmentHouse;
  const perUnitActive = (pricingMode==='Per Unit') || isApartmentHouse; // apt/house always per unit

  /* ------------- Validation ------------- */
  const validationMessages = {
    required: 'This field is required.',
    pattern: 'Invalid format.',
    min: 'Value too low.',
    max: 'Value too high.',
    minLength: 'Too short.',
    maxLength: 'Too long.',
    integer: 'Must be a whole number.'
  } as const;
  const req = (v:any)=> v!==undefined && v!==null && String(v).trim()!=='';
  const intOk = (v:string)=> /^-?\d+$/.test(v);
  const pushErr = (k:string,msg:string, bag:Record<string,string>)=> { if(!bag[k]) bag[k]=msg; };
  const validate = () => {
    const e:Record<string,string>={};
    // Core required
    if(!req(typeOfProperty)) pushErr('typeOfProperty',validationMessages.required,e);
    if(!req(authority)) pushErr('authority',validationMessages.required,e);
    if(!req(saleOrRent)) pushErr('for',validationMessages.required,e);
    if(showCategory && !req(category)) pushErr('category',validationMessages.required,e);
    // Title length
    if(!req(title)) pushErr('title',validationMessages.required,e); else {
      if(title.trim().length < 5) pushErr('title',validationMessages.minLength,e);
      else if(title.trim().length > 80) pushErr('title',validationMessages.maxLength,e);
    }
    // Address & locality
    if(!req(address)) pushErr('address',validationMessages.required,e);
    if(!req(areaLocality)) pushErr('areaLocality',validationMessages.required,e);
    if(!req(city)) pushErr('city',validationMessages.required,e);
    if(!req(district)) pushErr('district',validationMessages.required,e);
    if(!req(stateName)) pushErr('state',validationMessages.required,e);
    if(!/^\d{6}$/.test(pincode||'')) pushErr('pincode',validationMessages.pattern,e);
    // Area & pricing
    if(!req(areaOfProperty) || isNaN(Number(areaOfProperty)) || Number(areaOfProperty)<1) pushErr('areaOfProperty',validationMessages.min,e);
    if(perUnitActive){
      if(!req(pricePerUnit) || isNaN(Number(pricePerUnit)) || Number(pricePerUnit)<0) pushErr('pricePerUnit',validationMessages.min,e);
      if(!req(areaUnit)) pushErr('areaUnit',validationMessages.required,e);
    } else {
      if(!req(totalPrice) || isNaN(Number(totalPrice)) || Number(totalPrice)<0) pushErr('totalPrice',validationMessages.min,e);
    }
    // Layout only for Apartment/House
    if(showLayoutBlock){
      if(!req(rooms) || !intOk(rooms) || Number(rooms)<1) pushErr('rooms',validationMessages.min,e); else if(Number(rooms)>20) pushErr('rooms',validationMessages.max,e);
      if(!req(bathrooms) || !intOk(bathrooms) || Number(bathrooms)<1) pushErr('bathrooms',validationMessages.min,e); else if(Number(bathrooms)>20) pushErr('bathrooms',validationMessages.max,e);
      if(balconies){
        if(!intOk(balconies) || Number(balconies)<0) pushErr('balconies',validationMessages.min,e); else if(Number(balconies)>10) pushErr('balconies',validationMessages.max,e);
      }
      if(showFloor){
        if(!req(floor) || !intOk(floor) || Number(floor)<0) pushErr('floor',validationMessages.min,e);
      }
      if(showNumberOfFloors){
        if(!req(numberOfFloors) || !intOk(numberOfFloors) || Number(numberOfFloors)<1) pushErr('numberOfFloors',validationMessages.min,e);
      }
      if(yearOfConstruction){
        if(!intOk(yearOfConstruction)) pushErr('yearOfConstruction',validationMessages.integer,e); else if(Number(yearOfConstruction)<1900) pushErr('yearOfConstruction',validationMessages.min,e); else if(Number(yearOfConstruction)>currentYear) pushErr('yearOfConstruction',validationMessages.max,e);
      }
    }
    setErrors(e); return e;
  };

  /* ------------- Submit ------------- */
  const handleSubmit = () => {
    const e = validate(); const first = Object.keys(e)[0];
    if(first){
      Alert.alert('Fix errors', e[first]);
      // naive scroll to top (could map specific y positions later)
      scrollRef.current?.scrollTo({y:0,animated:true});
      return;
    }
    const id = editingId || Math.random().toString(36).slice(2);
    const perUnitTotal = perUnitActive ? Number(pricePerUnit||0) * Number(areaOfProperty||0) : undefined;
    const pricing = perUnitActive ? { mode:'PerUnit' as const, pricePerUnit: Number(pricePerUnit||0), unit: areaUnit, computedTotal: perUnitTotal||0 } : { mode:'Total' as const, totalPrice: Number(totalPrice||0) };
    const payload = {
      id,
      typeOfProperty,
      authority,
      for: saleOrRent,
      category: showCategory? category: undefined,
      title: title.trim(),
      photos,
      address: address.trim(),
      society: society.trim()||undefined,
      areaLocality: areaLocality.trim(),
      // Keep both keys for backward compatibility and explicit naming per spec
      area: Number(areaOfProperty),
      areaOfProperty: Number(areaOfProperty),
      city: city.trim(),
      district: district.trim(),
      state: stateName.trim(),
      pincode: pincode.trim(),
      description: description.trim(),
      pricing,
  areaUnit: areaUnit,
      documents,
      createdAt: new Date().toISOString(),
      floor: showFloor? Number(floor): undefined,
      numberOfFloors: showNumberOfFloors? Number(numberOfFloors): undefined,
      rooms: showLayoutBlock? Number(rooms): undefined,
      bathrooms: showLayoutBlock? Number(bathrooms): undefined,
      balconies: showLayoutBlock && balconies? Number(balconies): undefined,
      amenities: showLayoutBlock? amenities: undefined,
      yearOfConstruction: showLayoutBlock && yearOfConstruction? Number(yearOfConstruction): undefined,
    };

    if(editingId){ updateListing(editingId, payload); Alert.alert('Listing updated','Changes saved.'); }
    else { addListing(payload); Alert.alert('Listing created','Your property listing has been created.'); }
    navigation.navigate('PropertyDetails',{ id, item: payload, category: typeOfProperty, areaUnit });
  };

  /* ------------- Rendering Helpers ------------- */
  const renderNumber = (label:string,value:string,set:(v:string)=>void, errorKey:string, placeholder?:string) => (
    <NumberField label={label} value={value} onChangeText={set} placeholder={placeholder} error={errors[errorKey]} />
  );

  const pricePreview = useMemo(()=> {
    if(!perUnitActive) return null; if(!Number(pricePerUnit)||!Number(areaOfProperty)) return null; const total = Number(pricePerUnit)*Number(areaOfProperty); return <Text style={styles.previewText}>Estimated Total: {total.toLocaleString()}</Text>;
  },[perUnitActive, pricePerUnit, areaOfProperty]);

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>{editingId? 'Edit Property':'Add Property'}</Text>

        <Section title="Basic">
          <Select label="Type of property" value={typeOfProperty} onChange={(v)=>{ setTypeOfProperty(v as PropertyType); /* reset dependent */ setCategory(''); setPricingMode('Per Unit'); }} options={['Apartment','House','Land','Plot','Shop']} error={errors.typeOfProperty} />
          <Select label="Authority" value={authority} onChange={setAuthority} options={['Government','Private','Builder']} error={errors.authority} />
          <Select label="For" value={saleOrRent} onChange={setSaleOrRent} options={['Sale','Rent']} error={errors.for} />
          {showCategory && <Select label="Category" value={category} onChange={setCategory} options={['Residential','Commercial']} error={errors.category} />}
          <TextField label="Title" value={title} onChangeText={setTitle} placeholder={isLandPlot? 'e.g., Residential plot near highway':'e.g., 2BHK in Sector 62'} error={errors.title} maxLength={80} />
          <ImagePickerGrid label={isApartmentHouse ? 'Photos Upload (optional)' : (isLandPlot ? 'Upload photo (Optional)' : isShop ? 'Upload photo (Optional)' : 'Photos')} images={photos} setImages={setPhotos} />
        </Section>

        {showLayoutBlock && (
          <Section title="Layout">
            {showFloor && renderNumber('Floor (Apartment)', floor, setFloor, 'floor', 'e.g., 3')}
            {showNumberOfFloors && renderNumber('Number of Floor (House)', numberOfFloors, setNumberOfFloors, 'numberOfFloors', 'e.g., 2')}
            {renderNumber('Number of rooms', rooms, setRooms, 'rooms', 'e.g., 3')}
            {renderNumber('Number of bathrooms', bathrooms, setBathrooms, 'bathrooms', 'e.g., 2')}
            {renderNumber('Balconies', balconies, setBalconies, 'balconies', 'e.g., 1')}
            <Chips label="Amenities" options={AMENITIES} values={amenities} onToggle={(v)=> setAmenities(prev => prev.includes(v)? prev.filter(x=>x!==v): [...prev,v])} />
            {renderNumber('Year of construction', yearOfConstruction, setYearOfConstruction, 'yearOfConstruction', String(currentYear))}
          </Section>
        )}

        <Section title="Location">
          <TextField label="Address" value={address} onChangeText={setAddress} placeholder={isLandPlot? 'Plot no., street':'House no., street'} error={errors.address} />
          {isApartmentHouse && <TextField label="Society (Optional)" value={society} onChangeText={setSociety} placeholder="Society / Apartment name" />}
          <TextField label={isApartmentHouse? 'Area (Sector/more)' : 'Area (village/block/tehsil/more)'} value={areaLocality} onChangeText={setAreaLocality} error={errors.areaLocality} />
          <TextField label="City" value={city} onChangeText={setCity} error={errors.city} />
          <TextField label="District" value={district} onChangeText={setDistrict} error={errors.district} />
            <TextField label="State" value={stateName} onChangeText={setStateName} error={errors.state} />
          <NumberField label="Pincode" value={pincode} onChangeText={setPincode} placeholder="6-digit" error={errors.pincode} />
        </Section>

        <Section title="Details & Pricing">
          <TextField label="Description" value={description} onChangeText={setDescription} placeholder="Describe the property..." multiline maxLength={1000} />
          <NumberField label="Area of property" value={areaOfProperty} onChangeText={setAreaOfProperty} error={errors.areaOfProperty} placeholder="e.g., 1200" />
          {pricingModeApplies && (
            <Select label="Price mode" value={pricingMode} onChange={(v)=> { setPricingMode(v as PricingMode); setPricePerUnit(''); setTotalPrice(''); }} options={['Per Unit','Total']} />
          )}
          {perUnitActive ? (
            <>
              <NumberField label={isApartmentHouse? 'Price Per Unit':'Price per measurement unit'} value={pricePerUnit} onChangeText={setPricePerUnit} error={errors.pricePerUnit} />
              <Select label="Measurement Unit" value={areaUnit} onChange={setAreaUnit} options={['Sqft','Sq Yards','Sq Meters','Acres','Hectares']} error={errors.areaUnit} />
              {pricePreview}
            </>
          ) : (
            <NumberField label="Total price" value={totalPrice} onChangeText={setTotalPrice} error={errors.totalPrice} />
          )}
        </Section>

        <Section title="Documents">
          <DocumentUploader label={isLandPlot || isShop ? 'Upload document (for verification)' : 'Document Upload (Proof of ownership/sell)'} docs={documents} setDocs={setDocuments} />
        </Section>
        <View style={{height:20}} />
      </ScrollView>
      <View style={styles.submitBar}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>{editingId? 'Save Changes':'Create Listing'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  screenTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  fieldWrap: { marginBottom: 12 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '600' },
  hint: { fontSize: 12, color: '#6b7280', fontWeight: '400' },
  input: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontSize: 15, color: '#111827' },
  inputText: { fontSize: 15, color: '#111827' },
  placeholder: { color: '#9aa0a6' },
  textArea: { height: 110, textAlignVertical: 'top' },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  disabledInput: { opacity: 0.6 },
  inputError: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  errorText: { color: '#b91c1c', marginTop: 4, fontSize: 12 },
  row2: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f3f4f6', borderColor: '#e5e7eb', borderWidth: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  thumb: { width: '100%', height: '100%' },
  thumbRemove: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  thumbRemoveText: { color: '#fff', fontSize: 12 },
  addThumb: { borderStyle: 'dashed' },
  addThumbText: { fontSize: 26, color: '#6b7280' },
  addThumbSub: { fontSize: 12, color: '#6b7280' },
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  docName: { flex: 1, marginRight: 8, fontSize: 14, color: '#111827' },
  removeLink: { color: '#ef4444', fontWeight: '600' },
  buttonOutline: { borderWidth: 1, borderColor: '#111827', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  buttonOutlineText: { color: '#111827', fontWeight: '600' },
  submitBar: { borderTopWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff', padding: 12 },
  submitBtn: { backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '60%', backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14, paddingBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  optionRow: { paddingHorizontal: 16, paddingVertical: 14 },
  optionText: { fontSize: 15, color: '#111827' },
  separator: { height: 1, backgroundColor: '#f3f4f6' },
  chev: { color: '#6b7280', fontSize: 18 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth:1, borderColor:'#e5e7eb', paddingHorizontal:12, paddingVertical:6, borderRadius:999, backgroundColor:'#f9fafb' },
  chipActive: { backgroundColor:'#111827' },
  chipText: { fontSize:12, color:'#111827' },
  chipTextActive: { color:'#fff' },
  previewText: { fontSize:12, color:'#374151', marginTop: -4, marginBottom: 6, fontStyle:'italic' }
});
