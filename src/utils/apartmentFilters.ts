export type ApartmentFilterState = {
  apartment?: boolean;
  society?: boolean;
  floor?: 'Ground' | '1st' | '2nd' | '3rd' | '4th+' | 'Penthouse' | '';
  rooms?: '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK' | '';
  bathrooms?: '1' | '2' | '3' | '4+' | '';
  balconies?: '0' | '1' | '2' | '3+' | '';
  amenities: Array<'Parking' | 'Lift' | 'Swimming Pool' | 'Gym' | 'Security' | 'Power Backup' | 'Play Area'>;
};

export const defaultApartmentFilters: ApartmentFilterState = {
  apartment: false,
  society: false,
  floor: '',
  rooms: '',
  bathrooms: '',
  balconies: '',
  amenities: [],
};
