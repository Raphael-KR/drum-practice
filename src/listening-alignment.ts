import type { Lyric } from './model';
export interface ListeningAnchor { id: string; time: number; confirmed: boolean }
/** Redistribute old intervals between explicit anchors; do not shift the whole song. */
export function alignBetweenAnchors(lyrics: Lyric[], anchors: ListeningAnchor[]): Lyric[] {
  const byId = new Map(lyrics.map((l,i)=>[l.id,i]));
  const fixed = new Map<number,ListeningAnchor>();
  for (const anchor of anchors) {
    const index=byId.get(anchor.id);
    if (index===undefined || !Number.isFinite(anchor.time) || anchor.time<0) throw Error('Invalid listening anchor');
    const previous=fixed.get(index);
    if (previous && previous.time!==anchor.time) throw Error('Conflicting listening anchors');
    fixed.set(index,anchor);
  }
  const points=[...fixed.entries()].sort((a,b)=>a[0]-b[0]);
  for (let i=1;i<points.length;i++) if (points[i][1].time<=points[i-1][1].time) throw Error('Listening anchors cross');
  const next=lyrics.map(l=>({...l}));
  for(const [index,a] of points) {next[index].time=a.time;next[index].confirmed=a.confirmed;}
  for(let p=1;p<points.length;p++) {
    const [left,a]=points[p-1], [right,b]=points[p];
    if(a.time===lyrics[left].time && b.time===lyrics[right].time) continue;
    const originalSpan=lyrics[right].time-lyrics[left].time;
    if(originalSpan<=0) throw Error('Invalid original lyric ordering');
    for(let i=left+1;i<right;i++) {
      if(lyrics[i].confirmed && !fixed.has(i)) throw Error('Confirmed position must be an anchor');
      const ratio=(lyrics[i].time-lyrics[left].time)/originalSpan;
      next[i].time=a.time+ratio*(b.time-a.time);
    }
  }
  for(let i=0;i<next.length;i++) {
    if(i && next[i].time<=next[i-1].time) throw Error('Realigned lyrics cross');
    if(next[i].time!==lyrics[i].time || (i+1<next.length && next[i+1].time!==lyrics[i+1].time)) {
      const duration=lyrics[i].end-lyrics[i].time;
      const wasConnected=i+1<lyrics.length && Math.abs(lyrics[i].end-lyrics[i+1].time)<1e-6;
      next[i].end=i+1<next.length ? (wasConnected ? next[i+1].time : Math.min(next[i].time+duration,next[i+1].time)) : next[i].time+duration;
    }
  }
  return next;
}
