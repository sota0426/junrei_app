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

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signUp(email, password);
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
          新しい旅を始めよう
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
          className="mb-4 rounded-xl border border-junrei-muted/30 bg-junrei-surface px-4 py-3 text-junrei-text"
          value={password}
          onChangeText={setPassword}
          placeholder="6文字以上"
          placeholderTextColor="#8892a8"
          secureTextEntry
        />

        <Text className="mb-1 text-sm text-junrei-muted">パスワード（確認）</Text>
        <TextInput
          className="mb-6 rounded-xl border border-junrei-muted/30 bg-junrei-surface px-4 py-3 text-junrei-text"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="もう一度入力"
          placeholderTextColor="#8892a8"
          secureTextEntry
        />

        {error ? (
          <Text className="mb-4 text-center text-sm text-red-400">{error}</Text>
        ) : null}

        <Pressable
          onPress={handleRegister}
          disabled={loading}
          className="mb-4 items-center rounded-xl bg-junrei-accent py-4">
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-lg font-bold text-white">新規登録</Text>
          )}
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="items-center py-2">
            <Text className="text-junrei-muted">
              既にアカウントをお持ちの方は
              <Text className="text-junrei-accent"> ログイン</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
