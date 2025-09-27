import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { Text, View } from 'react-native';

type TabParamList = {
  Plot: undefined;
  Land: undefined;
  Shop: undefined;
  Houses: undefined;
  Apartments: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function Placeholder({ label }: { label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{label}</Text>
    </View>
  );
}

export default function FooterTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Plot" children={() => <HomeScreen />} />
      <Tab.Screen name="Land" children={() => <HomeScreen />} />
      <Tab.Screen name="Shop" component={HomeScreen} />
      <Tab.Screen name="Houses" children={() => <HomeScreen />} />
      <Tab.Screen name="Apartments" children={() => <HomeScreen />} />
    </Tab.Navigator>
  );
}
