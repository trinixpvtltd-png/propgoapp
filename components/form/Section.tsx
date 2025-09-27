import React, { useState, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  title: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export const Section: React.FC<Props> = ({ title, children, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const toggle = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setCollapsed(!collapsed); };
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.8}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.chevron}>{collapsed ? '▼' : '▲'}</Text>
      </TouchableOpacity>
      {!collapsed && <View style={styles.body}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 22, borderRadius: 14, backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  chevron: { fontSize: 14, color: '#64748b' },
  body: { padding: 16, paddingTop: 10 },
});
