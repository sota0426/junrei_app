import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AuthProvider } from '@/providers/AuthProvider';

//@ts-ignore
import '../../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View className="flex-1 bg-junrei-bg">
        <Slot />
        <StatusBar style="light" />
      </View>
    </AuthProvider>
  );
}
