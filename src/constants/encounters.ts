import type { BookInfo, Encounter } from '@/types';

export const TIER0_ENCOUNTERS: Encounter[] = [
  {
    id: 'little-prince',
    tier: 0,
    title: '星の王子さま',
    author: 'サン＝テグジュペリ',
    book: 'Le Petit Prince',
    coreTheme: '本当に大切なものは目に見えない',
    sessions: 5,
    temperamentAffinity: ['story', 'mirror', 'abyss'],
    description:
      '砂漠に不時着した飛行士と、小さな星からやってきた王子さまの物語。短く、比喩が豊かで、年齢を問わず深い問いが可能。',
  },
  {
    id: 'adler',
    tier: 0,
    title: '嫌われる勇気',
    author: 'アドラー（岸見一郎・古賀史健）',
    book: 'The Courage to Be Disliked',
    coreTheme: '他者の期待から自由になる',
    sessions: 8,
    temperamentAffinity: ['mirror', 'breaker'],
    description:
      'アドラー心理学を対話形式で学ぶ一冊。「嫌われることを恐れない」という考え方が、自分を縛る鎖を解き放つ。',
  },
  {
    id: 'fermat',
    tier: 0,
    title: 'フェルマーの最終定理',
    author: 'サイモン・シン',
    book: "Fermat's Last Theorem",
    coreTheme: '知的執念の美しさ',
    sessions: 8,
    temperamentAffinity: ['number', 'abyss'],
    description:
      '360年間誰も解けなかった数学の問題に挑んだ人々の物語。知的好奇心と執念が生む美しさに触れる。',
  },
];

export const BOOK_INFO: Record<string, BookInfo> = {
  'little-prince': {
    encounterId: 'little-prince',
    title: '星の王子さま',
    author: 'サン＝テグジュペリ',
    coverEmoji: '🌟',
    affiliateLinks: {
      amazon: 'https://www.amazon.co.jp/dp/4102122044?tag=${AMAZON_TAG}',
      rakuten: 'https://books.rakuten.co.jp/rb/652057/?l-id=search-c-item-text-01&rafid=${RAKUTEN_ID}',
    },
  },
  adler: {
    encounterId: 'adler',
    title: '嫌われる勇気',
    author: '岸見一郎・古賀史健',
    coverEmoji: '💪',
    affiliateLinks: {
      amazon: 'https://www.amazon.co.jp/dp/4478025819?tag=${AMAZON_TAG}',
      rakuten: 'https://books.rakuten.co.jp/rb/12368878/?l-id=search-c-item-text-01&rafid=${RAKUTEN_ID}',
    },
  },
  fermat: {
    encounterId: 'fermat',
    title: 'フェルマーの最終定理',
    author: 'サイモン・シン',
    coverEmoji: '🔢',
    affiliateLinks: {
      amazon: 'https://www.amazon.co.jp/dp/4102159711?tag=${AMAZON_TAG}',
      rakuten: 'https://books.rakuten.co.jp/rb/1013498/?l-id=search-c-item-text-01&rafid=${RAKUTEN_ID}',
    },
  },
};
