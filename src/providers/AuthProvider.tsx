import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  email: string;
  onboarding_done: boolean;
}

interface AuthContextType {
  session: { user: UserProfile } | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<{ user: UserProfile } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = '@local_auth_users';

  // ローカルに登録されているユーザー一覧を取得
  const getStoredUsers = async (): Promise<UserProfile[]> => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUsers = async (users: UserProfile[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  const fetchProfile = async (userId: string) => {
    const users = await getStoredUsers();
    const user = users.find(u => u.id === userId) ?? null;
    setProfile(user);
  };

  useEffect(() => {
    // 起動時にセッションをロード
    AsyncStorage.getItem('@local_auth_session').then(data => {
      if (data) {
        const s = JSON.parse(data);
        setSession(s);
        fetchProfile(s.user.id);
      }
      setLoading(false);
    });
  }, []);

  const signUp = async (email: string, password: string) => {
    const users = await getStoredUsers();

    // 既に登録済みかチェック
    if (users.find(u => u.email === email)) {
      return { error: 'User already exists' };
    }

    const newUser: UserProfile = {
      id: `${Date.now()}`,
      email,
      onboarding_done: false,
    };

    users.push(newUser);
    await saveUsers(users);

    // 自動でログイン
    const newSession = { user: newUser };
    await AsyncStorage.setItem('@local_auth_session', JSON.stringify(newSession));
    setSession(newSession);
    setProfile(newUser);

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const users = await getStoredUsers();
    const user = users.find(u => u.email === email);
    if (!user) return { error: 'User not found' };

    const newSession = { user };
    await AsyncStorage.setItem('@local_auth_session', JSON.stringify(newSession));
    setSession(newSession);
    setProfile(user);

    return { error: null };
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@local_auth_session');
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.user) return;
    const users = await getStoredUsers();
    const idx = users.findIndex(u => u.id === session.user.id);
    if (idx === -1) return;

    users[idx] = { ...users[idx], ...updates };
    await saveUsers(users);

    await fetchProfile(session.user.id);

    const newSession = { user: users[idx] };
    await AsyncStorage.setItem('@local_auth_session', JSON.stringify(newSession));
    setSession(newSession);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
