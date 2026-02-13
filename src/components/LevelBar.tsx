import { Text, View } from 'react-native';

import { LEVEL_THRESHOLDS } from '@/constants/theme';

interface LevelBarProps {
  level: number;
  exp: number;
}

export function LevelBar({ level, exp }: LevelBarProps) {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 1000;
  const progress = ((exp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return (
    <View className="mb-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-junrei-gold">
          Lv.{level}
        </Text>
        <Text className="text-xs text-junrei-muted">
          {exp} / {nextThreshold} EXP
        </Text>
      </View>
      <View className="h-3 overflow-hidden rounded-full bg-junrei-bg">
        <View
          className="h-full rounded-full bg-junrei-gold"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </View>
    </View>
  );
}
