import type { TemperamentInfo } from '@/types';

export const TEMPERAMENTS: Record<string, TemperamentInfo> = {
  mirror: {
    id: 'mirror',
    name: '鏡を見る者',
    subtitle: '内省型',
    questionDirection: '自分とは何か。他者との関係とは何か。',
    entryThought: 'アドラー心理学の核心',
    targetAudience: '人間関係に悩む人、自己肯定感が揺れている人',
    emoji: '🪞',
  },
  number: {
    id: 'number',
    name: '数を追う者',
    subtitle: '論理型',
    questionDirection: 'なぜそう言えるのか。根拠とは何か。',
    entryThought: '科学的思考の美しさ',
    targetAudience: '理系的好奇心がある人、「証拠」を求める人',
    emoji: '🔢',
  },
  abyss: {
    id: 'abyss',
    name: '深淵を覗く者',
    subtitle: '哲学型',
    questionDirection: '存在とは。意味とは。無とは。',
    entryThought: '実存主義の入口',
    targetAudience: '漠然とした不安を抱える人、「なぜ生きるのか」を考える人',
    emoji: '🌀',
  },
  story: {
    id: 'story',
    name: '物語を紡ぐ者',
    subtitle: '創造型',
    questionDirection: '表現とは何か。言葉はどこまで届くか。',
    entryThought: '文学の力',
    targetAudience: '創作好き、言葉に敏感な人、感受性が強い人',
    emoji: '📖',
  },
  breaker: {
    id: 'breaker',
    name: '仕組みを壊す者',
    subtitle: '批判型',
    questionDirection: '社会は正しいのか。常識とは誰が決めたのか。',
    entryThought: '社会批評・構造への問い',
    targetAudience: '反骨心がある人、「おかしくないか？」と感じている人',
    emoji: '🔨',
  },
};
