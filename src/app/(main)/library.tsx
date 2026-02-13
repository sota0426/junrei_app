import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookLink } from '@/components/BookLink';
import { TIER0_ENCOUNTERS } from '@/constants/encounters';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { CollectedQuote, EncounterId } from '@/types';

export default function LibraryScreen() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<CollectedQuote[]>([]);

  const loadQuotes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('collected_quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('collected_at', { ascending: false });
    if (data) setQuotes(data as CollectedQuote[]);
  }, [user]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  return (
    <SafeAreaView className="flex-1 bg-junrei-bg">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="mb-1 text-3xl font-bold text-junrei-text">
            書庫
          </Text>
          <Text className="text-sm text-junrei-muted">
            集めた名言と、出会った書物たち
          </Text>
        </View>

        {/* Collected Quotes */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-8 w-1 rounded-full bg-junrei-gold" />
            <Text className="text-lg font-bold text-junrei-text">
              お守り（名言コレクション）
            </Text>
          </View>

          {quotes.length === 0 ? (
            <View className="rounded-2xl bg-junrei-surface p-6">
              <Text className="text-center text-sm text-junrei-muted">
                対話の中で出会った名言がここに集まります。{'\n'}
                語り部との旅を続けよう。
              </Text>
            </View>
          ) : (
            quotes.map((quote) => (
              <View
                key={quote.id}
                className="mb-3 rounded-2xl border-l-4 border-junrei-gold bg-junrei-surface p-4">
                <Text className="mb-2 text-base italic leading-6 text-junrei-text">
                  「{quote.quote}」
                </Text>
                <Text className="text-right text-xs text-junrei-muted">
                  ── {quote.author}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Book Recommendations with Affiliate Links */}
        <View className="mb-6">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-8 w-1 rounded-full bg-junrei-accent" />
            <Text className="text-lg font-bold text-junrei-text">
              書物の案内
            </Text>
          </View>

          <Text className="mb-4 text-sm text-junrei-muted">
            興味が湧いた本を手に取ってみよう。読書は義務ではなく、報酬です。
          </Text>

          {TIER0_ENCOUNTERS.map((enc) => (
            <BookLink key={enc.id} encounterId={enc.id as EncounterId} />
          ))}
        </View>

        {/* Locked Content */}
        <View className="mb-8 rounded-2xl border border-junrei-muted/20 bg-junrei-surface/50 p-5">
          <Text className="mb-1 text-center text-base text-junrei-muted">
            🔒 さらなる書物
          </Text>
          <Text className="text-center text-xs text-junrei-muted">
            Tier 1・2 の邂逅を進めると、新しい書物が解放されます
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
