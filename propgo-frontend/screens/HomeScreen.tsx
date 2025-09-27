import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import SearchRow, { SearchFilters } from '../components/SearchRow';
import PropertyCard, { Property } from '../components/PropertyCard';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { ApartmentFilterState } from '../src/utils/apartmentFilters';
import { HouseFilterState } from '../src/utils/houseFilters';
import ReactNative from 'react-native';

type PropertyExt = Property & { sector?: string; areaOfCity?: string };

const MOCK: PropertyExt[] = [
  { id: '1', title: '2BHK Apartment in Andheri', city: 'Mumbai', price: 9500000, area: 850, verified: true, category: 'Apartments', sector: 'Andheri West' },
  { id: '2', title: 'Luxury Villa in Baner', city: 'Pune', price: 21000000, area: 3200, verified: false, category: 'Houses', sector: 'Baner' },
  { id: '3', title: 'Residential Plot in Sector 62', city: 'Noida', price: 4500000, area: 1800, verified: true, category: 'Plot', sector: '62' },
  { id: '4', title: 'Land near ORR', city: 'Hyderabad', price: 8000000, area: 5000, verified: true, category: 'Land', areaOfCity: 'Outer Ring Road' },
  { id: '5', title: '3BHK Independent Home', city: 'Bengaluru', price: 15000000, area: 2200, verified: false, category: 'Home', sector: 'HSR Layout' },
];

export type Category = 'Plot' | 'Land' | 'Home' | 'Houses' | 'Apartments';

type Props = {
  category?: Category;
  apartmentFilters?: ApartmentFilterState;
  renderBelowArea?: React.ReactNode;
  houseFilters?: HouseFilterState;
};

export default function HomeScreen({ category, apartmentFilters, renderBelowArea, houseFilters }: Props) {
  const navigation = useNavigation<any>();
  const { isAuthenticated, didSkip } = useAuth();
  const extraField = category === 'Land' ? 'areaOfCity' : category ? 'sector' : undefined;
  const [filters, setFilters] = useState<SearchFilters>({ city: '', price: '', area: '', areaUnit: 'Sqft', verifiedOnly: false, sector: '', areaOfCity: '' });

  const filtered = useMemo(() => {
    let out = MOCK;
    if (category) {
      out = out.filter((p) => p.category === category);
    }
    if (filters.city.trim()) {
      const c = filters.city.trim().toLowerCase();
      out = out.filter((p) => p.city.toLowerCase().includes(c));
    }
    if (filters.verifiedOnly) {
      out = out.filter((p) => p.verified);
    }
    // Price: treat filters.price as per-unit (based on filters.areaUnit). We compare property price-per-sqft to the entered per-unit range.
    const priceLabel = filters.price.trim();
    if (priceLabel) {
      // Convert user-entered per-unit range to per-sqft
      const unit = filters.areaUnit;
      const perUnitToPerSqft = (v: number) => {
        switch (unit) {
          case 'Sqft': return v; // already per sqft
          case 'Sq Yards': return v / 9; // per sqyd -> per sqft
          case 'Sq Meters': return v / 10.7639; // per sqm -> per sqft
          case 'Acres': return v / 43560; // per acre -> per sqft
          case 'Hectares': return v / 107639; // per hectare -> per sqft
          default: return v;
        }
      };
      let minPerSqft = 0;
      let maxPerSqft = Number.MAX_SAFE_INTEGER;
      if (priceLabel.includes('-') && /[0-9]/.test(priceLabel)) {
        const [minS, maxS] = priceLabel.split('-');
        minPerSqft = perUnitToPerSqft(Number(minS) || 0);
        maxPerSqft = perUnitToPerSqft(Number(maxS) || Number.MAX_SAFE_INTEGER);
      } else if (/^[0-9]+$/.test(priceLabel)) {
        // Single value means exact per-unit price; treat as min=max
        const v = perUnitToPerSqft(Number(priceLabel));
        minPerSqft = v; maxPerSqft = v;
      }
      out = out.filter((p) => {
        const perSqft = p.area > 0 ? (p.price / p.area) : Number.MAX_SAFE_INTEGER;
        return perSqft >= minPerSqft && perSqft <= maxPerSqft;
      });
    }
    // Area: expects "min-max" in chosen unit; convert to sqft for comparison
    const unit = filters.areaUnit;
    const toSqft = (val: number) => {
      switch (unit) {
        case 'Sqft': return val;
        case 'Sq Yards': return val * 9;
        case 'Sq Meters': return val * 10.7639;
        case 'Acres': return val * 43560;
        case 'Hectares': return val * 107639;
        default: return val;
      }
    };
    if (filters.area.includes('-')) {
      const [minS, maxS] = filters.area.split('-');
      const min = toSqft(Number(minS) || 0);
      const max = toSqft(Number(maxS) || Number.MAX_SAFE_INTEGER);
      out = out.filter((p) => p.area >= min && p.area <= max);
    }
    if (extraField === 'sector' && filters.sector?.trim()) {
      const s = filters.sector.trim().toLowerCase();
      out = out.filter((p) => (p as PropertyExt).sector?.toLowerCase().includes(s));
    }
    if (extraField === 'areaOfCity' && filters.areaOfCity?.trim()) {
      const a = filters.areaOfCity.trim().toLowerCase();
      out = out.filter((p) => (p as PropertyExt).areaOfCity?.toLowerCase().includes(a));
    }
    // Apartment-specific filters
  if (category === 'Apartments' && apartmentFilters) {
      const af = apartmentFilters;
      // Floor
      if (af.floor) {
        out = out.filter((p) => {
          const floorProp = (p as any).floor as string | undefined;
          if (floorProp) return floorProp === af.floor;
          // fallback: try to match in title
          const t = p.title.toLowerCase();
          return af.floor ? t.includes(af.floor.toLowerCase()) : true;
        });
      }
      // Rooms (BHK)
      if (af.rooms) {
        const want = af.rooms.replace(' ', '').toUpperCase(); // e.g. 2BHK
        out = out.filter((p) => {
          const t = p.title.replace(' ', '').toUpperCase();
          const roomsProp = ((p as any).rooms as string | undefined)?.replace(' ', '').toUpperCase();
          return t.includes(want) || roomsProp === want;
        });
      }
      // Bathrooms
      if (af.bathrooms) {
        out = out.filter((p) => {
          const baths = (p as any).bathrooms as string | number | undefined;
          if (!baths && af.bathrooms === '') return true;
          if (!baths) return false;
          const bathsStr = String(baths);
          if (af.bathrooms === '4+') return Number(bathsStr) >= 4;
          return bathsStr === af.bathrooms;
        });
      }
      // Balconies
      if (af.balconies) {
        out = out.filter((p) => {
          const balc = (p as any).balconies as string | number | undefined;
          if (!balc && af.balconies === '') return true;
          if (!balc) return false;
          const balcStr = String(balc);
          if (af.balconies === '3+') return Number(balcStr) >= 3;
          return balcStr === af.balconies;
        });
      }
      // Amenities (all selected must be present)
      if (af.amenities && af.amenities.length > 0) {
        out = out.filter((p) => {
          const am = (p as any).amenities as string[] | undefined;
          if (!am || am.length === 0) return false;
          return af.amenities.every((a) => am.includes(a));
        });
      }
      // Society checkbox heuristic: require "Society" in title if checked
      if (af.society) {
        out = out.filter((p) => /society/i.test(p.title));
      }
      // 'Apartment' checkbox is redundant given category filter; ignore or enforce category
    }
    // House-specific filters
    if (category === 'Houses' && houseFilters) {
      const hf = houseFilters;
      if (hf.floor) {
        out = out.filter((p) => {
          const floorProp = (p as any).floor as string | undefined;
          if (floorProp) return floorProp === hf.floor;
          const t = p.title.toLowerCase();
          return hf.floor ? t.includes(hf.floor.toLowerCase()) : true;
        });
      }
      if (hf.rooms) {
        const want = hf.rooms.replace(' ', '').toUpperCase();
        out = out.filter((p) => {
          const t = p.title.replace(' ', '').toUpperCase();
          const roomsProp = ((p as any).rooms as string | undefined)?.replace(' ', '').toUpperCase();
          return t.includes(want) || roomsProp === want;
        });
      }
      if (hf.bathrooms) {
        out = out.filter((p) => {
          const baths = (p as any).bathrooms as string | number | undefined;
          if (!baths && hf.bathrooms === '') return true;
          if (!baths) return false;
          const bathsStr = String(baths);
          if (hf.bathrooms === '4+') return Number(bathsStr) >= 4;
          return bathsStr === hf.bathrooms;
        });
      }
      if (hf.balcony) {
        out = out.filter((p) => {
          const balc = (p as any).balcony as string | number | undefined;
          if (!balc && hf.balcony === '') return true;
          if (!balc) return false;
          const balcStr = String(balc);
          if (hf.balcony === '3+') return Number(balcStr) >= 3;
          return balcStr === hf.balcony;
        });
      }
      if (hf.amenities && hf.amenities.length > 0) {
        out = out.filter((p) => {
          const am = (p as any).amenities as string[] | undefined;
          if (!am || am.length === 0) return false;
          return hf.amenities.every((a) => am.includes(a));
        });
      }
      if (hf.year) {
        out = out.filter((p) => {
          const year = (p as any).constructionYear as number | undefined;
          if (!year) return false;
          switch (hf.year) {
            case '<2000': return year < 2000;
            case '2000-2010': return year >= 2000 && year <= 2010;
            case '2011-2020': return year >= 2011 && year <= 2020;
            case '2021+': return year >= 2021;
            default: return true;
          }
        });
      }
      if (hf.propertyType) {
        out = out.filter((p) => ((p as any).propertyType as string | undefined) === hf.propertyType);
      }
      if (hf.society) {
        out = out.filter((p) => /society/i.test(p.title));
      }
    }
    return out;
  }, [filters, category, apartmentFilters, houseFilters]);

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={(
          <SearchRow
            filters={filters}
            onChange={(next) => setFilters((f) => ({ ...f, ...next }))}
            extraField={extraField}
            renderBelowArea={renderBelowArea || null}
          />
        )}
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PropertyCard
            item={item}
            onPress={(id) => {
              if (!isAuthenticated) {
                // If user skipped, send them to LoginSignup
                navigation.navigate('Login');
                return;
              }
              navigation.navigate('PropertyDetails', { id, item, areaUnit: filters.areaUnit, category: item.category });
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  listContent: { padding: 12 },
});
