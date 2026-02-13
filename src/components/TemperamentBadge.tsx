import { Text, View } from 'react-native';

import { TEMPERAMENTS } from '@/constants/temperaments';
import type { Temperament } from '@/types';

interface TemperamentBadgeProps {
  temperament: Temperament;
  size?: 'sm' | 'lg';
}

export function TemperamentBadge({
  temperament,
  size = 'sm',
}: TemperamentBadgeProps) {
  const info = TEMPERAMENTS[temperament];
  if (!info) return null;

  if (size === 'lg') {
    return (
      <View className="items-center rounded-2xl bg-junrei-surface p-4">
        <Text className="mb-2 text-4xl">{info.emoji}</Text>
        <Text className="text-lg font-bold text-junrei-text">{info.name}</Text>
        <Text className="text-sm text-junrei-muted">{info.subtitle}</Text>
        <Text className="mt-2 text-center text-xs leading-5 text-junrei-muted">
          {info.questionDirection}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center rounded-full bg-junrei-surface px-3 py-1">
      <Text className="mr-1 text-sm">{info.emoji}</Text>
      <Text className="text-xs text-junrei-text">{info.name}</Text>
    </View>
  );
}
