import { createHash } from 'crypto';

export function normalizeUrl(rawUrl: string): string {
    return rawUrl
      .trim()
      .replace(/[\u00ad\ufffc\ufffd\ufffe]/g, '')
      .replace(/\s+/g, '');
  }

  export function cleanPageText(input: string): string {
    return input
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  
  export function truncateForLlm(input: string, maxChars = 14000): string {
    if (input.length <= maxChars) return input;
    return input.slice(0, maxChars);
  }


export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function isHttpUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

export function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === null || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'y'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'n'].includes(normalized)) {
    return false;
  }

  return fallback;
}

export function buildSourceCode(category: string, url: string): string {
  const categoryPart = category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const hashPart = sha256(url).slice(0, 8);

  return `${categoryPart}_${hashPart}`;
}