import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View, useColorScheme, type ColorValue } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function TabDot({ focused, color }: { focused: boolean; color: ColorValue }) {
  return <View style={[styles.dot, { backgroundColor: focused ? color : 'transparent', borderColor: color }]} />;
}

export default function TabsLayout() {
  const { session } = useAuth();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ focused, color }) => <TabDot focused={focused} color={color} /> }}
      />
      <Tabs.Screen
        name="transacoes"
        options={{
          title: 'Transações',
          tabBarIcon: ({ focused, color }) => <TabDot focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ focused, color }) => <TabDot focused={focused} color={color} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5 },
});
