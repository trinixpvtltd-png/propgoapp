import React from 'react';
import { View, StyleSheet } from 'react-native';
import AuthForm from '../components/AuthForm';

export default function LoginSignupScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <AuthForm onDone={() => navigation.replace('Tabs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
});
