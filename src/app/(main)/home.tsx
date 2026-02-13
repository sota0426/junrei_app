import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EncounterCard } from '@/components/EncounterCard';
import { LevelBar } from '@/components/LevelBar';
import { TemperamentBadge } from '@/components/TemperamentBadge';
import { TIER0_ENCOUNTERS } from '@/constants/encounters';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { EncounterProgress } from '@/types';

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const [progress, setProgress] = useState<EncounterProgress[]>([]);

  const loadProgress = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('encounter_progress')
      .select('*')
      .eq('user_id', user.id);
    if (data) setProgress(data as EncounterProgress[]);
  }, [user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const getEncounterProgress = (encounterId: string) => {
    return progress.find((p) => p.encounter_id === encounterId);
  };

  return (
    <SafeAreaView className="flex-1 bg-junrei-bg">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="mb-1 text-3xl font-bold text-junrei-text">
            巡礼の地図
          </Text>
          <Text className="text-sm text-junrei-muted">
            思想の地を旅し、著者たちの「残響」と出会う
          </Text>
        </View>

        {/* Player Status */}
        {profile && (
          <View className="mb-6 rounded-2xl bg-junrei-surface p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-junrei-text">
                  {profile.display_name ?? '巡礼者'}
                </Text>
                <Text className="text-xs text-junrei-gold">
                  {profile.title}
                </Text>
              </View>
              {profile.temperament && (
                <TemperamentBadge temperament={profile.temperament} />
              )}
            </View>
            <LevelBar level={profile.level} exp={profile.exp} />
          </View>
        )}

        {/* Tier 0 Header */}
        <View className="mb-4 flex-row items-center">
          <View className="mr-3 h-8 w-1 rounded-full bg-junrei-accent" />
          <View>
            <Text className="text-lg font-bold text-junrei-text">
              Tier 0: 入口
            </Text>
            <Text className="text-xs text-junrei-muted">
              最初の一冊を選ぼう
            </Text>
          </View>
        </View>

        {/* Encounter Cards */}
        {TIER0_ENCOUNTERS.map((encounter) => {
          const prog = getEncounterProgress(encounter.id);
          return (
            <EncounterCard
              key={encounter.id}
              encounter={encounter}
              isCompleted={prog?.is_completed ?? false}
              currentSession={prog?.current_session ?? 1}
              onPress={() =>
                router.push({
                  pathname: '/(main)/chat',
                  params: { encounterId: encounter.id },
                })
              }
            />
          );
        })}

        {/* Locked Tiers */}
        <View className="mt-4 rounded-2xl border border-junrei-muted/20 bg-junrei-surface/50 p-5">
          <Text className="mb-1 text-center text-lg text-junrei-muted">
            🔒 Tier 1: 世界が広がる
          </Text>
          <Text className="text-center text-xs text-junrei-muted">
            Tier 0 をクリアすると解放されます
          </Text>
        </View>

        <View className="mb-8 mt-4 rounded-2xl border border-junrei-muted/20 bg-junrei-surface/50 p-5">
          <Text className="mb-1 text-center text-lg text-junrei-muted">
            🔒 Tier 2: 思想の深淵
          </Text>
          <Text className="text-center text-xs text-junrei-muted">
            Tier 1 をクリアすると解放されます
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
