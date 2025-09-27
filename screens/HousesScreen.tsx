import React from 'react';
import HomeScreen from './HomeScreen';
import { defaultHouseFilters, HouseFilterState } from '../src/utils/houseFilters';
import HouseFilters from '../components/HouseFilters';
import { View } from 'react-native';

export default function HousesScreen() {
  const [filters, setFilters] = React.useState<HouseFilterState>(defaultHouseFilters);
  return (
    <HomeScreen
      category="Houses"
      houseFilters={filters}
      renderBelowArea={(
        <View style={{ paddingHorizontal: 12 }}>
          <HouseFilters value={filters} onChange={(next) => setFilters((s) => ({ ...s, ...next }))} onSearch={() => {}} />
        </View>
      )}
    />
  );
}
