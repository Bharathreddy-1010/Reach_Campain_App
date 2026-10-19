import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CampaignRepository } from '../src/repositories/campaignRepository';
import { ThemeProvider, useTheme, setActiveTheme } from '../src/theme';

import { ReachieProvider } from '../src/context/ReachieContext';
import { ReachieFloatingTrigger } from '../src/components/reachie/ReachieFloatingTrigger';
import { ReachieModal } from '../src/components/reachie/ReachieModal';
import { ReachieTopVoiceBar } from '../src/components/reachie/ReachieTopVoiceBar';

function RootNav() {
  const { colors, statusBarStyle } = useTheme();

  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor={colors.background} />
      <ReachieTopVoiceBar />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="get-started" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen
          name="campaign/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="contribution/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="creator/index"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
      <ReachieFloatingTrigger />
      <ReachieModal />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize repository on app launch
    CampaignRepository.init();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider onThemeChanged={setActiveTheme}>
        <ReachieProvider>
          <RootNav />
        </ReachieProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}


