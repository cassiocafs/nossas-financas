import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { type ColorValue } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

function TabIcon({ name, color }: { name: keyof typeof Feather.glyphMap; color: ColorValue }) {
  return <Feather name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  const { session } = useAuth();
  const colors = Colors.light;

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
        options={{ title: 'Início', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="transacoes"
        options={{ title: 'Transações', tabBarIcon: ({ color }) => <TabIcon name="list" color={color} /> }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{ title: 'Relatórios', tabBarIcon: ({ color }) => <TabIcon name="pie-chart" color={color} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <TabIcon name="user" color={color} /> }}
      />
    </Tabs>
  );
}
