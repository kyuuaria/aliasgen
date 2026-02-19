import { generateSlug } from 'random-word-slugs';

export function generateAlphaSuffix(length: number): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  const limit = 256 - (256 % alphabet.length);
  const result: string[] = [];
  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length - result.length + 4));
    for (const b of bytes) {
      if (b < limit && result.length < length) {
        result.push(alphabet[b % alphabet.length]);
      }
    }
  }
  return result.join('');
}

export function generateWordSuffix(wordCount: number): string {
  if (wordCount === 1) {
    return generateSlug(1, { format: 'kebab', partsOfSpeech: ['adjective'] });
  }
  const adjectives = Array.from({ length: wordCount - 1 }, () =>
    generateSlug(1, { format: 'kebab', partsOfSpeech: ['adjective'] })
  );
  const noun = generateSlug(1, { format: 'kebab', partsOfSpeech: ['noun'] });
  return [...adjectives, noun].join('-');
}
