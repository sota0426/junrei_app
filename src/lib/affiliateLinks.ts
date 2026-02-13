import { Linking } from 'react-native';

import { BOOK_INFO } from '@/constants/encounters';
import type { EncounterId } from '@/types';

const AMAZON_TAG = process.env.EXPO_PUBLIC_AMAZON_ASSOCIATE_TAG ?? '';
const RAKUTEN_ID = process.env.EXPO_PUBLIC_RAKUTEN_AFFILIATE_ID ?? '';

function buildUrl(template: string): string {
  return template
    .replace('${AMAZON_TAG}', AMAZON_TAG)
    .replace('${RAKUTEN_ID}', RAKUTEN_ID);
}

export function getAmazonLink(encounterId: EncounterId): string {
  const book = BOOK_INFO[encounterId];
  if (!book) return '';
  return buildUrl(book.affiliateLinks.amazon);
}

export function getRakutenLink(encounterId: EncounterId): string {
  const book = BOOK_INFO[encounterId];
  if (!book) return '';
  return buildUrl(book.affiliateLinks.rakuten);
}

export async function openAmazonLink(encounterId: EncounterId): Promise<void> {
  const url = getAmazonLink(encounterId);
  if (url) await Linking.openURL(url);
}

export async function openRakutenLink(encounterId: EncounterId): Promise<void> {
  const url = getRakutenLink(encounterId);
  if (url) await Linking.openURL(url);
}
