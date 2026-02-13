import { Pressable, Text, View } from 'react-native';

import type { Encounter } from '@/types';

interface EncounterCardProps {
  encounter: Encounter;
  isCompleted: boolean;
  currentSession: number;
  onPress: () => void;
}

export function EncounterCard({
  encounter,
  isCompleted,
  currentSession,
  onPress,
}: EncounterCardProps) {
  const progressPercent = isCompleted
    ? 100
    : Math.round(((currentSession - 1) / encounter.sessions) * 100);

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-2xl bg-junrei-surface">
      <View className="p-5">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-2xl">
            {isCompleted ? '✨' : currentSession > 1 ? '🔥' : '📖'}
          </Text>
          {isCompleted && (
            <View className="rounded-full bg-green-500/20 px-3 py-1">
              <Text className="text-xs text-green-400">邂逅済み</Text>
            </View>
          )}
        </View>

        <Text className="mb-1 text-xl font-bold text-junrei-text">
          {encounter.title}
        </Text>
        <Text className="mb-2 text-sm text-junrei-muted">
          {encounter.author}
        </Text>
        <Text className="mb-3 text-sm leading-5 text-junrei-muted">
          {encounter.coreTheme}
        </Text>

        <View className="h-2 overflow-hidden rounded-full bg-junrei-bg">
          <View
            className="h-full rounded-full bg-junrei-accent"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
        <Text className="mt-1 text-xs text-junrei-muted">
          {isCompleted
            ? '全セッション完了'
            : `セッション ${currentSession} / ${encounter.sessions}`}
        </Text>
      </View>
    </Pressable>
  );
}
