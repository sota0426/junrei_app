import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';
import {
  cleanResponse,
  parseQuote,
  parseThoughtDepth,
  sendChatMessage,
} from '@/lib/openai';
import { useAuth } from '@/providers/AuthProvider';
import { EXP_REWARDS, LEVEL_THRESHOLDS } from '@/constants/theme';
import type { ChatMessage, EncounterId } from '@/types';

export function useChat(encounterId: EncounterId, systemPrompt: string) {
  const { user, profile, updateProfile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const addExp = useCallback(
    async (amount: number) => {
      if (!profile) return;
      const newExp = profile.exp + amount;
      let newLevel = profile.level;
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (newExp >= LEVEL_THRESHOLDS[i]) {
          newLevel = i + 1;
          break;
        }
      }
      await updateProfile({ exp: newExp, level: newLevel });
    },
    [profile, updateProfile],
  );

  const saveQuote = useCallback(
    async (quote: { text: string; author: string }) => {
      if (!user) return;
      await supabase.from('collected_quotes').insert({
        user_id: user.id,
        encounter_id: encounterId,
        quote: quote.text,
        author: quote.author,
      });
    },
    [user, encounterId],
  );

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!user || isLoading) return;
      setIsLoading(true);

      const userMsg: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      try {
        const apiMessages = updatedMessages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        const rawResponse = await sendChatMessage(systemPrompt, apiMessages);
        const thoughtDepth = parseThoughtDepth(rawResponse);
        const quote = parseQuote(rawResponse);
        const displayText = cleanResponse(rawResponse);

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: displayText,
          timestamp: new Date().toISOString(),
        };
        const allMessages = [...updatedMessages, assistantMsg];
        setMessages(allMessages);

        // Save conversation
        if (conversationId) {
          await supabase
            .from('conversations')
            .update({
              messages: allMessages,
              thought_depth: thoughtDepth,
            })
            .eq('id', conversationId);
        } else {
          const { data } = await supabase
            .from('conversations')
            .insert({
              user_id: user.id,
              encounter_id: encounterId,
              session_number: 1,
              messages: allMessages,
              thought_depth: thoughtDepth,
            })
            .select('id')
            .single();
          if (data) setConversationId(data.id);
        }

        // Award EXP
        const bonusExp =
          thoughtDepth >= 7
            ? EXP_REWARDS.DEEP_ANSWER_MAX
            : thoughtDepth >= 4
              ? EXP_REWARDS.DEEP_ANSWER_MIN
              : 0;
        await addExp(EXP_REWARDS.SESSION + bonusExp);

        // Save quote if found
        if (quote) await saveQuote(quote);
      } catch (error) {
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: '接続に問題が発生しました。少し待ってからもう一度試してください。',
          timestamp: new Date().toISOString(),
        };
        setMessages([...updatedMessages, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      user,
      isLoading,
      messages,
      systemPrompt,
      conversationId,
      encounterId,
      addExp,
      saveQuote,
    ],
  );

  const loadConversation = useCallback(
    async (convoId: string) => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', convoId)
        .single();
      if (data) {
        setConversationId(data.id);
        setMessages(data.messages as ChatMessage[]);
      }
    },
    [],
  );

  return {
    messages,
    isLoading,
    sendMessage,
    loadConversation,
    conversationId,
  };
}
