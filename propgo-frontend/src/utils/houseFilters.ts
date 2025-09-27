export type HouseFilterState = {
  house?: boolean;
  society?: boolean;
  floor?: 'Ground' | '1st' | '2nd' | '3rd' | '4th+' | '';
  rooms?: '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | '';
  bathrooms?: '1' | '2' | '3' | '4+' | '';
  balcony?: '0' | '1' | '2' | '3+' | '';
  amenities: Array<'Parking' | 'Garden' | 'Water Supply' | 'Power Backup' | 'Security' | 'Terrace Access'>;
  year?: '<2000' | '2000-2010' | '2011-2020' | '2021+' | '';
  propertyType?: 'Independent House' | 'Villa' | 'Duplex' | 'Row House' | '';
};

export const defaultHouseFilters: HouseFilterState = {
  house: false,
  society: false,
  floor: '',
  rooms: '',
  bathrooms: '',
  balcony: '',
  amenities: [],
  year: '',
  propertyType: '',
};
