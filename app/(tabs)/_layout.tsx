import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabsLayout() {
  const { colors, themeId } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.nav.tabBarActive,
        tabBarInactiveTintColor: colors.nav.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.nav.tabBarBg,
          borderTopColor: colors.nav.tabBarBorder,
          borderTopWidth: themeId === 'aurora' ? 0 : 1,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          elevation: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <View
              style={[
                styles.createIconWrap,
                themeId === 'aurora' && styles.auroraCreateWrap,
                themeId === 'glassmorphism' && styles.glassCreateWrap,
              ]}
            >
              <PlusCircle
                size={24}
                color={
                  themeId === 'aurora'
                    ? colors.primary
                    : themeId === 'glassmorphism'
                    ? '#0EA5E9'
                    : color
                }
                strokeWidth={2.4}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Bell size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  auroraCreateWrap: {
    shadowColor: '#9E7E67',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  glassCreateWrap: {
    shadowColor: '#3882F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
});
