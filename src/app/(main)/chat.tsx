import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/ChatBubble';
import { BookLink } from '@/components/BookLink';
import { TIER0_ENCOUNTERS } from '@/constants/encounters';
import { ENCOUNTER_PROMPTS } from '@/constants/prompts';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/providers/AuthProvider';
import type { EncounterId } from '@/types';

export default function ChatScreen() {
  const params = useLocalSearchParams<{ encounterId?: string }>();
  const { profile } = useAuth();
  const [input, setInput] = useState('');
  const [selectedEncounter, setSelectedEncounter] = useState<EncounterId | null>(
    (params.encounterId as EncounterId) ?? null,
  );
  const flatListRef = useRef<FlatList>(null);

  const encounterId = selectedEncounter ?? 'little-prince';
  const systemPrompt = ENCOUNTER_PROMPTS[encounterId] ?? ENCOUNTER_PROMPTS['little-prince'];
  const encounter = TIER0_ENCOUNTERS.find((e) => e.id === encounterId);

  const { messages, isLoading, sendMessage } = useChat(encounterId, systemPrompt);

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      sendMessage('（巡礼者が訪れた）');
    }
  }, [selectedEncounter]);

  if (!selectedEncounter) {
    return (
      <SafeAreaView className="flex-1 bg-junrei-bg">
        <View className="border-b border-junrei-surface px-4 py-3">
          <Text className="text-center text-xl font-bold text-junrei-text">
            邂逅を選ぶ
          </Text>
          <Text className="text-center text-xs text-junrei-muted">
            Tier 0: 入口の一冊
          </Text>
        </View>

        <View className="flex-1 px-4 pt-4">
          {TIER0_ENCOUNTERS.map((enc) => (
            <Pressable
              key={enc.id}
              onPress={() => setSelectedEncounter(enc.id)}
              className="mb-4 rounded-2xl bg-junrei-surface p-5">
              <Text className="mb-1 text-xl font-bold text-junrei-text">
                {enc.title}
              </Text>
              <Text className="mb-2 text-sm text-junrei-muted">
                {enc.author}
              </Text>
              <Text className="mb-3 text-sm leading-5 text-junrei-text">
                {enc.coreTheme}
              </Text>
              <Text className="text-xs text-junrei-muted">
                想定セッション数: {enc.sessions}回
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <SafeAreaView className="flex-1 bg-junrei-bg">
      <View className="border-b border-junrei-surface px-4 py-3">
        <Text className="text-center text-lg font-bold text-junrei-text">
          {encounter?.title ?? '対話'}
        </Text>
        <Text className="text-center text-xs text-junrei-muted">
          {encounter?.author} ── {encounter?.coreTheme}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            <BookLink encounterId={encounterId} />
          }
        />

        <View className="flex-row items-end border-t border-junrei-surface px-4 py-3">
          <TextInput
            className="mr-3 max-h-24 min-h-[44px] flex-1 rounded-2xl bg-junrei-surface px-4 py-3 text-base text-junrei-text"
            value={input}
            onChangeText={setInput}
            placeholder="考えを伝えてみよう..."
            placeholderTextColor="#8892a8"
            multiline
            editable={!isLoading}
            onSubmitEditing={handleSend}
          />
          <Pressable
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              isLoading || !input.trim()
                ? 'bg-junrei-surface'
                : 'bg-junrei-accent'
            }`}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#e94560" />
            ) : (
              <Text className="text-lg text-white">↑</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
