// @vitest-environment jsdom
import { it, expect } from 'vitest';
import { chooseRecent, rememberScore } from '../src/recent-score';
it('remembers opened order across reads and skips deleted scores', () => {
  localStorage.clear();
  const a = { song: { id: 'a', title: 'A' } }, b = { song: { id: 'b', title: 'B' } };
  rememberScore('a');
  rememberScore('b');
  expect(chooseRecent([a, b])).toBe(b);
  expect(JSON.parse(localStorage.getItem('drum-practice.recent-scores')!)[0]).toBe('b');
  expect(chooseRecent([a])).toBe(a);
  rememberScore('a');
  expect(chooseRecent([a, b])).toBe(a);
  expect(chooseRecent([])).toBeUndefined();
});
