export const COLORS = {
  bg: '#1a1a2e',
  surface: '#16213e',
  surfaceLight: '#1f2b47',
  accent: '#e94560',
  gold: '#f5c542',
  text: '#eaeaea',
  muted: '#8892a8',
  white: '#ffffff',
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#ef4444',
} as const;

export const LEVEL_THRESHOLDS = [
  0,     // Lv.1
  200,   // Lv.2
  500,   // Lv.3
  1000,  // Lv.4
  1800,  // Lv.5
  3000,  // Lv.6
  4500,  // Lv.7
  6500,  // Lv.8
  9000,  // Lv.9
  12000, // Lv.10
] as const;

export const EXP_REWARDS = {
  SESSION: 100,
  DEEP_ANSWER_MIN: 50,
  DEEP_ANSWER_MAX: 200,
  DAILY_LOGIN: 20,
  BOOK_READ: 500,
  SHADOW_DIALOGUE: 1000,
} as const;

export const TITLES: Record<string, string> = {
  first_dialogue: '旅立つ者',
  tier0_clear: '問いを知った者',
  tier1_clear: '世界を見た者',
  tier2_clear: '深淵を渡った者',
  final_clear: '巡礼を終えた者',
  all_temperaments: '万象を巡った者',
} as const;
