export type Temperament =
  | 'mirror'    // 鏡を見る者（内省型）
  | 'number'    // 数を追う者（論理型）
  | 'abyss'     // 深淵を覗く者（哲学型）
  | 'story'     // 物語を紡ぐ者（創造型）
  | 'breaker';  // 仕組みを壊す者（批判型）

export type EncounterId = 'little-prince' | 'adler' | 'fermat';

export type Tier = 0 | 1 | 2;

export interface UserProfile {
  id: string;
  display_name: string | null;
  temperament: Temperament | null;
  sub_temperament: Temperament | null;
  level: number;
  exp: number;
  title: string;
  onboarding_done: boolean;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  encounter_id: EncounterId;
  session_number: number;
  messages: ChatMessage[];
  is_completed: boolean;
  thought_depth: number;
  created_at: string;
}

export interface EncounterProgress {
  id: string;
  user_id: string;
  encounter_id: EncounterId;
  current_session: number;
  total_sessions: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface CollectedQuote {
  id: string;
  user_id: string;
  encounter_id: EncounterId;
  quote: string;
  author: string;
  collected_at: string;
}

export interface Encounter {
  id: EncounterId;
  tier: Tier;
  title: string;
  author: string;
  book: string;
  coreTheme: string;
  sessions: number;
  temperamentAffinity: Temperament[];
  description: string;
}

export interface TemperamentInfo {
  id: Temperament;
  name: string;
  subtitle: string;
  questionDirection: string;
  entryThought: string;
  targetAudience: string;
  emoji: string;
}

export interface AffiliateLink {
  amazon: string;
  rakuten: string;
}

export interface BookInfo {
  encounterId: EncounterId;
  title: string;
  author: string;
  coverEmoji: string;
  affiliateLinks: AffiliateLink;
}
