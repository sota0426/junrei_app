import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-junrei-bg">
      <View className="flex-1 justify-center px-8">
        <Text className="mb-2 text-center text-4xl font-bold text-junrei-text">
          巡礼
        </Text>
        <Text className="mb-10 text-center text-lg text-junrei-muted">
          Junrei
        </Text>

        <Text className="mb-1 text-sm text-junrei-muted">メールアドレス</Text>
        <TextInput
          className="mb-4 rounded-xl border border-junrei-muted/30 bg-junrei-surface px-4 py-3 text-junrei-text"
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          placeholderTextColor="#8892a8"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text className="mb-1 text-sm text-junrei-muted">パスワード</Text>
        <TextInput
          className="mb-6 rounded-xl border border-junrei-muted/30 bg-junrei-surface px-4 py-3 text-junrei-text"
          value={password}
          onChangeText={setPassword}
          placeholder="パスワード"
          placeholderTextColor="#8892a8"
          secureTextEntry
        />

        {error ? (
          <Text className="mb-4 text-center text-sm text-red-400">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          className="mb-4 items-center rounded-xl bg-junrei-accent py-4">
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-lg font-bold text-white">ログイン</Text>
          )}
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable className="items-center py-2">
            <Text className="text-junrei-muted">
              アカウントをお持ちでない方は
              <Text className="text-junrei-accent"> 新規登録</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
