import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
import { TemperamentBadge } from '@/components/TemperamentBadge';
import { ONBOARDING_SYSTEM_PROMPT } from '@/constants/prompts';
import {
  cleanResponse,
  parseTemperamentResult,
  sendChatMessage,
} from '@/lib/openai';
import { useAuth } from '@/providers/AuthProvider';
import type { ChatMessage, Temperament } from '@/types';

export default function OnboardingScreen() {
  const { updateProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [temperamentResult, setTemperamentResult] = useState<{
    main: Temperament;
    sub: Temperament;
  } | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;
      setIsLoading(true);

      const userMsg: ChatMessage = {
        role: 'user',
        content: userText.trim(),
        timestamp: new Date().toISOString(),
      };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput('');

      try {
        const apiMessages = updated.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        const rawResponse = await sendChatMessage(
          ONBOARDING_SYSTEM_PROMPT,
          apiMessages,
        );

        const result = parseTemperamentResult(rawResponse);
        const displayText = cleanResponse(rawResponse);

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: displayText,
          timestamp: new Date().toISOString(),
        };
        setMessages([...updated, assistantMsg]);

        if (result) {
          setTemperamentResult({
            main: result.main as Temperament,
            sub: result.sub as Temperament,
          });
        }
      } catch {
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: '接続に問題が発生しました。もう一度試してください。',
          timestamp: new Date().toISOString(),
        };
        setMessages([...updated, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading],
  );

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawResponse = await sendChatMessage(ONBOARDING_SYSTEM_PROMPT, []);
      const displayText = cleanResponse(rawResponse);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: displayText,
        timestamp: new Date().toISOString(),
      };
      setMessages([assistantMsg]);
    } catch {
      setMessages([
        {
          role: 'assistant',
          content: 'やあ、はじめまして。僕はこの旅の語り部。君のことをもう少し知りたいんだ。',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleComplete = async () => {
    if (!temperamentResult) return;
    await updateProfile({
      temperament: temperamentResult.main,
      sub_temperament: temperamentResult.sub,
      onboarding_done: true,
    });
    router.replace('/(main)/home');
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-junrei-bg">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="mb-2 text-5xl">🏔️</Text>
          <Text className="mb-2 text-3xl font-bold text-junrei-text">
            巡礼の始まり
          </Text>
          <Text className="mb-8 text-center text-base leading-6 text-junrei-muted">
            語り部があなたのことを知りたがっています。{'\n'}
            少しだけ、お話ししませんか？
          </Text>
          <Pressable
            onPress={startConversation}
            className="rounded-xl bg-junrei-accent px-8 py-4">
            <Text className="text-lg font-bold text-white">旅を始める</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-junrei-bg">
      <View className="border-b border-junrei-surface px-4 py-3">
        <Text className="text-center text-lg font-bold text-junrei-text">
          語り部との対話
        </Text>
        <Text className="text-center text-xs text-junrei-muted">
          導入対話
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
        />

        {temperamentResult ? (
          <View className="border-t border-junrei-surface px-4 py-4">
            <Text className="mb-3 text-center text-sm text-junrei-muted">
              あなたの気質が見えてきました
            </Text>
            <View className="mb-3 flex-row justify-center gap-3">
              <TemperamentBadge temperament={temperamentResult.main} />
              <TemperamentBadge temperament={temperamentResult.sub} />
            </View>
            <Pressable
              onPress={handleComplete}
              className="items-center rounded-xl bg-junrei-accent py-4">
              <Text className="text-lg font-bold text-white">
                巡礼を始める
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-end border-t border-junrei-surface px-4 py-3">
            <TextInput
              className="mr-3 max-h-24 min-h-[44px] flex-1 rounded-2xl bg-junrei-surface px-4 py-3 text-base text-junrei-text"
              value={input}
              onChangeText={setInput}
              placeholder="考えを伝えてみよう..."
              placeholderTextColor="#8892a8"
              multiline
              editable={!isLoading}
            />
            <Pressable
              onPress={() => sendMessage(input)}
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
