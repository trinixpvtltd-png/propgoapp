import React from 'react';
import HomeScreen from './HomeScreen';
import ApartmentFilters from '../components/ApartmentFilters';
import { ApartmentFilterState, defaultApartmentFilters } from '../src/utils/apartmentFilters';
import { View } from 'react-native';

export default function ApartmentsScreen() {
  const [aptFilters, setAptFilters] = React.useState<ApartmentFilterState>(defaultApartmentFilters);

  return (
    <HomeScreen
      category="Apartments"
      apartmentFilters={aptFilters}
      renderBelowArea={(
        <View style={{ paddingHorizontal: 12 }}>
          <ApartmentFilters
            value={aptFilters}
            onChange={(next) => setAptFilters((s) => ({ ...s, ...next }))}
            onSearch={() => { /* filtering reactive */ }}
          />
        </View>
      )}
    />
  );
}
