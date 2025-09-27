import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HeaderBar from '../components/HeaderBar';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import PlotScreen from '../screens/PlotScreen';
import LandScreen from '../screens/LandScreen';
import HousesScreen from '../screens/HousesScreen';
import ApartmentsScreen from '../screens/ApartmentsScreen';
import { View } from 'react-native';
import LoginSignupScreen from '../screens/LoginSignupScreen';
import PropertyDetailsScreen from '../screens/PropertyDetailsScreen';
import AddListingScreen from '../screens/AddListingScreen';
import ChatScreen from '../screens/ChatScreen';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ListingsProvider } from '../context/ListingsContext';

type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  Profile: undefined;
  PropertyDetails: { id: string; item?: any; areaUnit?: 'Sqft' | 'Sq Yards' | 'Sq Meters' | 'Acres' | 'Hectares'; category?: 'Plot' | 'Land' | 'Home' | 'Houses' | 'Apartments' } | undefined;
  AddListing: undefined;
  Chat: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';
          switch (route.name) {
            case 'Plot':
              iconName = 'map';
              break;
            case 'Land':
              iconName = 'terrain';
              break;
            case 'Shop':
              iconName = 'storefront-outline';
              break;
            case 'Houses':
              iconName = 'home-city-outline';
              break;
            case 'Apartments':
              iconName = 'office-building-outline';
              break;
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Plot" component={PlotScreen} />
      <Tab.Screen name="Land" component={LandScreen} />
  <Tab.Screen name="Shop" children={() => <HomeScreen />} />
      <Tab.Screen name="Houses" component={HousesScreen} />
      <Tab.Screen name="Apartments" component={ApartmentsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <LocationProvider>
        <LanguageProvider>
        <ListingsProvider>
        <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginSignupScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Tabs"
            component={TabsNavigator}
            options={{
              header: ({ navigation }) => (
                <View>
                  <HeaderBar navigation={navigation as any} />
                </View>
              ),
            }}
          />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
          <Stack.Screen name="AddListing" component={AddListingScreen} options={{ title: 'Add Property' }} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
        </NavigationContainer>
        </ListingsProvider>
        </LanguageProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
