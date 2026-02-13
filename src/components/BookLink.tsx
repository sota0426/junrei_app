import { Pressable, Text, View } from 'react-native';

import { openAmazonLink, openRakutenLink } from '@/lib/affiliateLinks';
import { BOOK_INFO } from '@/constants/encounters';
import type { EncounterId } from '@/types';

interface BookLinkProps {
  encounterId: EncounterId;
}

export function BookLink({ encounterId }: BookLinkProps) {
  const book = BOOK_INFO[encounterId];
  if (!book) return null;

  return (
    <View className="mb-4 rounded-2xl bg-junrei-surface p-4">
      <View className="mb-3 flex-row items-center">
        <Text className="mr-3 text-3xl">{book.coverEmoji}</Text>
        <View className="flex-1">
          <Text className="text-base font-bold text-junrei-text">
            {book.title}
          </Text>
          <Text className="text-sm text-junrei-muted">{book.author}</Text>
        </View>
      </View>

      <Text className="mb-3 text-xs text-junrei-muted">
        興味が湧いたら、実際に読んでみよう（読書ボーナス: +500 EXP）
      </Text>

      <View className="flex-row gap-3">
        <Pressable
          onPress={() => openAmazonLink(encounterId)}
          className="flex-1 items-center rounded-xl bg-[#FF9900]/20 py-3">
          <Text className="text-sm font-bold text-[#FF9900]">
            Amazon で見る
          </Text>
        </Pressable>
        <Pressable
          onPress={() => openRakutenLink(encounterId)}
          className="flex-1 items-center rounded-xl bg-[#BF0000]/20 py-3">
          <Text className="text-sm font-bold text-[#BF0000]">
            楽天ブックス
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
