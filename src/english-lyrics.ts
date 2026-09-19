import type { Song } from './model';
import source from './lyric-reading-data';
export const englishGroups = [
  {ids:[0],before:'아',text:'Ah'},
  {ids:[138,139],before:'원스',text:'once'},
  {ids:[140,141],before:'어겐',text:'again'},
  {ids:[188,189,190,191],before:'올웨이즈',text:'always'},
  {ids:[192,193,194,195],before:'브라이트',text:'blight'},
  {ids:[196,197],before:'와이',text:'why?'},
  {ids:[337,338,339],before:'빌리브',text:'believe'},
  {ids:[340,341,342,343],before:'마이셀프',text:'myself'},
  {ids:[476,477],before:'원스',text:'once'},
  {ids:[478,479],before:'어겐',text:'again'},
  {ids:[526,527,528,529],before:'올웨이즈',text:'always'},
  {ids:[530,531,532,533],before:'브라이트',text:'blight'},
];
export function applyEnglishLyrics(song: Song): boolean {
  if (song.id !== source.songId || song.lyricRevision !== source.id) return false;
  const groups = englishGroups.map(group => {
    const index = song.lyrics.findIndex(l => l.id === `v2-l${group.ids[0]}`);
    const members = song.lyrics.slice(index,index+group.ids.length);
    return {group,index,members};
  });
  if (groups.some(({group,index,members}) => index < 0 ||
      members.map(l=>l.text).join('') !== group.before ||
      members.some((l,i)=>l.id !== `v2-l${group.ids[i]}`))) return false;
  const next = song.lyrics.map(l=>({...l}));
  for (const {group,index,members} of groups.sort((a,b)=>b.index-a.index)) {
    next.splice(index,members.length,{
      ...members[0],text:group.text,end:members[members.length-1].end,
      confirmed:members.every(l=>l.confirmed),
    });
  }
  song.lyricArchive = [...(song.lyricArchive || []),{
    revision:song.lyricRevision,lyrics:song.lyrics.map(l=>({...l})),
  }];
  song.lyrics = next;
  song.lyricRevision = 'japanese-canonical-english-2026-09-19-v4';
  return true;
}

// Correct the user-confirmed typo on already migrated songs as well.
export function correctBrightSpelling(song: Song): boolean {
  if (song.id !== source.songId) return false;
  const targets = song.lyrics.filter(l =>
    ['v2-l192', 'v2-l530'].includes(l.id) && l.text === 'blight');
  if (!targets.length) return false;
  song.lyricArchive = [...(song.lyricArchive || []), {
    revision: 'before-bright-spelling-2026-09-19',
    lyrics: structuredClone(song.lyrics),
  }];
  for (const lyric of targets) lyric.text = 'bright';
  return true;
}
