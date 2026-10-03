import { repairLegacyDrumIdentity } from "./legacy-drum-identity";
/** Approved project legend. Names identify instruments; glyphs never identify them. */
export const DRUM_LEGEND: Record<string, [string, string, string, string?]> = {
  'closed hi-hat':['G','5','x'], 'open hi-hat':['G','5','circle-x'],
  'ride':['F','5','x'], 'ride cymbal':['F','5','x'], 'ride bell':['F','5','triangle','yes'],
  'crash':['A','5','x'], 'crash cymbal':['A','5','x'],
  'china':['A','5','circle-x'], 'splash':['A','5','diamond','no'], 'cowbell':['A','5','triangle','yes'],
  'snare':['C','5','normal'], 'cross stick':['C','5','x'], 'cross stick (rim click)':['C','5','x'],
  'tom 1':['E','5','normal'], 'high tom':['E','5','normal'],
  'tom 2':['D','5','normal'], 'mid tom':['D','5','normal'],
  'tom 3':['B','4','normal'], 'tom 4':['A','4','normal'], 'tom 4 / floor tom':['A','4','normal'],
  'floor tom':['A','4','normal'], 'low tom':['A','4','normal'], 'tom 5':['G','4','normal'],
  'bass drum':['F','4','normal'], 'right bass / single kick':['F','4','normal'], 'right bass':['F','4','normal'],
  'left bass':['E','4','normal'], 'hi-hat pedal':['D','4','x'], 'hi-hat splash':['D','4','circle-x'],
};
const set=(parent:Element,tag:string,value:string)=>{
 let e=parent.querySelector(`:scope > ${tag}`);
 if(!e){e=parent.ownerDocument.createElement(tag);parent.append(e);} e.textContent=value;
};
export function applyDrumLegend(doc:Document) {
 const names=new Map([...doc.querySelectorAll('score-instrument')].map(e=>[e.id,e.querySelector('instrument-name')?.textContent?.trim().toLowerCase()||'']));
 for(const note of doc.querySelectorAll('part > measure > note')) {
  const name=names.get(note.querySelector('instrument')?.getAttribute('id')||'')||'';
  const rule=DRUM_LEGEND[name],u=note.querySelector('unpitched');
  if(!rule||!u)continue;
  set(u,'display-step',rule[0]);set(u,'display-octave',rule[1]);
  set(note,'notehead',rule[2]);const head=note.querySelector('notehead')!;
  if(rule[3])head.setAttribute('filled',rule[3]);else head.removeAttribute('filled');
 }
}

export function normalizeDrumScore(text:string) {
 const doc=new DOMParser().parseFromString(text,'application/xml');
 if(doc.querySelector('parsererror'))throw Error('Invalid MusicXML');
 repairLegacyDrumIdentity(doc);applyDrumLegend(doc);
 // MusicXML sequence order; retain all notes, directions and expressive attributes.
 const order=['grace','cue','chord','pitch','unpitched','rest','duration','tie','instrument','footnote','level','voice','type','dot','accidental','time-modification','stem','notehead','notehead-text','staff','beam','notations','lyric','play','listen'];
 for(const n of doc.querySelectorAll('part > measure > note')) {
  const children=[...n.children];children.sort((a,b)=>order.indexOf(a.localName)-order.indexOf(b.localName));children.forEach(e=>n.append(e));
 }
 return new XMLSerializer().serializeToString(doc);
}
