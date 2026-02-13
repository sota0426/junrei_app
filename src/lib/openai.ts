import OpenAI from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export async function sendChatMessage(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 1000,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content ?? '';
}

export function parseThoughtDepth(response: string): number {
  const match = response.match(/\[THOUGHT_DEPTH\](\d+)\[\/THOUGHT_DEPTH\]/);
  return match ? parseInt(match[1], 10) : 3;
}

export function parseQuote(
  response: string,
): { text: string; author: string } | null {
  const match = response.match(/\[QUOTE\](.*?)\[\/QUOTE\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as { text: string; author: string };
  } catch {
    return null;
  }
}

export function parseTemperamentResult(
  response: string,
): { main: string; sub: string } | null {
  const match = response.match(
    /\[TEMPERAMENT_RESULT\](.*?)\[\/TEMPERAMENT_RESULT\]/,
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as { main: string; sub: string };
  } catch {
    return null;
  }
}

export function cleanResponse(response: string): string {
  return response
    .replace(/\[THOUGHT_DEPTH\]\d+\[\/THOUGHT_DEPTH\]/g, '')
    .replace(/\[QUOTE\].*?\[\/QUOTE\]/g, '')
    .replace(/\[TEMPERAMENT_RESULT\].*?\[\/TEMPERAMENT_RESULT\]/g, '')
    .trim();
}
