import { Text, View } from 'react-native';

interface TitleBadgeProps {
  title: string;
}

export function TitleBadge({ title }: TitleBadgeProps) {
  return (
    <View className="rounded-full border border-junrei-gold/30 bg-junrei-gold/10 px-4 py-1">
      <Text className="text-sm font-bold text-junrei-gold">{title}</Text>
    </View>
  );
}
