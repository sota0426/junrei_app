import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-junrei-bg">
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (profile && !profile.onboarding_done) {
    return <Redirect href="/(main)/onboarding" />;
  }

  return <Redirect href="/(main)/home" />;
}
