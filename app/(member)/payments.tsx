import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

const Payments: React.FC = () => {
  return (
    <View style={styles. container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1a" />
      <Text style={styles. title}>Payments</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

export default Payments;

const styles = StyleSheet.create({
  container: {
    flex:  1,
    backgroundColor: '#0a0f1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e9eef7',
  },
  subtitle: {
    fontSize:  16,
    color: '#64748b',
    marginTop: 8,
  },
});