import { Text, View } from 'react-native';

import type { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-br-sm bg-junrei-accent'
            : 'rounded-bl-sm bg-junrei-surface'
        }`}>
        {!isUser && (
          <Text className="mb-1 text-xs text-junrei-gold">語り部</Text>
        )}
        <Text
          className={`text-base leading-6 ${
            isUser ? 'text-white' : 'text-junrei-text'
          }`}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}
