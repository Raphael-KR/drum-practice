import { it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { displayRegion } from '../src/score-view';
import type { Song } from '../src/model';
const song: Song = JSON.parse(readFileSync('public/demo/song.json', 'utf8'));
it('trims verified clef prefixes without changing source data or note page coordinates', () => {
  const original = song.regions[24];
  const before = JSON.stringify(original);
  const cropped = displayRegion(song, original);
  expect(cropped.x * 612).toBeCloseTo(original.x * 612 + 15);
  expect(cropped.x + cropped.w).toBeCloseTo(original.x + original.w);
  original.beatXs.forEach((beat, i) => {
    expect(cropped.x + cropped.w * cropped.beatXs[i]).toBeCloseTo(original.x + original.w * beat);
  });
  expect(JSON.stringify(original)).toBe(before);
  expect(displayRegion(song, song.regions[25])).toBe(song.regions[25]);
});
it('preserves the opening title, clef and meter', () => {
  expect(displayRegion(song, song.regions[0])).toBe(song.regions[0]);
});
it('does not guess at trimming an unrelated score', () => {
  expect(displayRegion({ ...song, id: 'other' }, song.regions[24])).toBe(song.regions[24]);
});
