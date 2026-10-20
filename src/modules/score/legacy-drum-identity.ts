/** Data migration for the verified old transcription, not a song-specific display rule. */
export function repairLegacyDrumIdentity(doc:Document) {
 const raw=doc.querySelector('miscellaneous-field[name="drum-practice:source-provenance"]')?.textContent;
 if(!raw)return;
 let provenance:any;try{provenance=JSON.parse(raw);}catch{return;}
 if(provenance.pdf_sha256!=='003e2b2a6db24c34f5d37847940098a34bcd368956ded94f0dd0f8b9541b8625')return;
 const instrument=doc.querySelector('score-instrument[id="P1-hh-open"]');
 if(instrument?.querySelector('instrument-name')?.textContent!=='Open Hi-Hat')return;
 instrument.id='P1-crash';instrument.querySelector('instrument-name')!.textContent='Crash cymbal';
 for(const midi of doc.querySelectorAll('midi-instrument[id="P1-hh-open"]')){midi.id='P1-crash';const pitch=midi.querySelector('midi-unpitched');if(pitch)pitch.textContent='50';}
 for(const ref of doc.querySelectorAll('note > instrument[id="P1-hh-open"]'))ref.setAttribute('id','P1-crash');
}
