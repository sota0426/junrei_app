import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LevelBar } from '@/components/LevelBar';
import { TemperamentBadge } from '@/components/TemperamentBadge';
import { TitleBadge } from '@/components/TitleBadge';
import { TIER0_ENCOUNTERS } from '@/constants/encounters';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileScreen() {
  const { profile, user, signOut } = useAuth();

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-junrei-bg">
        <Text className="text-junrei-muted">読み込み中...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-junrei-bg">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Profile Header */}
        <View className="mb-6 items-center rounded-2xl bg-junrei-surface p-6">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-junrei-bg">
            <Text className="text-4xl">🏔️</Text>
          </View>
          <Text className="mb-1 text-2xl font-bold text-junrei-text">
            {profile.display_name ?? '巡礼者'}
          </Text>
          <TitleBadge title={profile.title} />

          <View className="mt-4 flex-row gap-3">
            {profile.temperament && (
              <TemperamentBadge temperament={profile.temperament} />
            )}
            {profile.sub_temperament && (
              <TemperamentBadge temperament={profile.sub_temperament} />
            )}
          </View>
        </View>

        {/* Level & EXP */}
        <View className="mb-6 rounded-2xl bg-junrei-surface p-4">
          <Text className="mb-3 text-base font-bold text-junrei-text">
            巡礼の記録
          </Text>
          <LevelBar level={profile.level} exp={profile.exp} />
        </View>

        {/* Temperament Detail */}
        {profile.temperament && (
          <View className="mb-6">
            <Text className="mb-3 text-base font-bold text-junrei-text">
              あなたの気質
            </Text>
            <TemperamentBadge
              temperament={profile.temperament}
              size="lg"
            />
          </View>
        )}

        {/* Encountered Authors */}
        <View className="mb-6">
          <Text className="mb-3 text-base font-bold text-junrei-text">
            邂逅した著者
          </Text>
          <View className="rounded-2xl bg-junrei-surface p-4">
            {TIER0_ENCOUNTERS.map((enc) => (
              <View
                key={enc.id}
                className="mb-3 flex-row items-center last:mb-0">
                <Text className="mr-3 text-2xl">📖</Text>
                <View>
                  <Text className="text-sm font-bold text-junrei-text">
                    {enc.author}
                  </Text>
                  <Text className="text-xs text-junrei-muted">
                    『{enc.title}』
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View className="mb-6 flex-row gap-3">
          <View className="flex-1 items-center rounded-2xl bg-junrei-surface p-4">
            <Text className="text-2xl font-bold text-junrei-gold">
              {profile.level}
            </Text>
            <Text className="text-xs text-junrei-muted">レベル</Text>
          </View>
          <View className="flex-1 items-center rounded-2xl bg-junrei-surface p-4">
            <Text className="text-2xl font-bold text-junrei-accent">
              {profile.exp}
            </Text>
            <Text className="text-xs text-junrei-muted">総EXP</Text>
          </View>
        </View>

        {/* Sign Out */}
        <Pressable
          onPress={signOut}
          className="mb-8 items-center rounded-xl border border-junrei-muted/30 py-4">
          <Text className="text-sm text-junrei-muted">ログアウト</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
