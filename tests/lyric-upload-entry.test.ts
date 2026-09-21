// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { hasLyrics } from '../src/score-management';
import type { RecordData } from '../src/storage';
const record = (xml = '', text = '', lyrics: unknown[] = []) => ({canonicalXML: xml, song: {lyricText: text, lyrics}} as RecordData);
describe('lyric upload entry', () => {
  it('shows upload for absent or whitespace-only lyrics', () => {
    expect(hasLyrics(undefined)).toBe(false);
    expect(hasLyrics(record('<score-partwise/>', ' '))).toBe(false);
  });
  it('recognizes canonical MusicXML lyrics even before the model is populated', () => {
    expect(hasLyrics(record('<score-partwise><part><measure><note><lyric><text>hello</text></lyric></note></measure></part></score-partwise>'))).toBe(true);
  });
  it('preserves imported documents and existing aligned lyrics', () => {
    expect(hasLyrics(record('', 'hello'))).toBe(true);
    expect(hasLyrics(record('', '', [{text: 'hello'}]))).toBe(true);
  });
});
