interface TrackMetadata {title: string; artist: string}
const clean = (text: string) => text.normalize('NFC').trim().replace(/\s*\[(?:가사\s*\/?\s*Lyrics?|Lyrics?\s*\/?\s*가사|가사|Lyrics?|Official\s+(?:Audio|Video|MV))\]\s*/gi, ' ').replace(/\s+/g,' ').trim();
/** Accept explicit artist/title separators; don't invent an artist from an unstructured filename. */
export function splitTrackName(text: string): TrackMetadata | undefined {
  const name=clean(text.replace(/\.(mp3|m4a|wav|aac|ogg|flac|aif|aiff|webm)$/i,''));
  const separator=/\s+[-–—]\s+|[–—]/.exec(name) ?? (name.split('-').length===2 ? /-/.exec(name) : null);
  if(!separator || !separator.index) return;
  const artist=name.slice(0,separator.index).trim().replace(/\s*\d+집$/,'').trim();
  const title=name.slice(separator.index+separator[0].length).trim();
  if(!artist || !title || artist.length>150 || title.length>300) return;
  return {title,artist};
}
const identity=(s:string)=>s.normalize('NFC').toLowerCase().replace(/[\s()]/g,'');
export function resolveAudioMetadata(filename: string, tags: Partial<TrackMetadata>, includeUnstructuredFilename=true): TrackMetadata {
  const filePair=splitTrackName(filename), tagPair=splitTrackName(tags.title || '');
  // A structured tag title corroborated by the filename is stronger than an uploader's artist tag.
  if(tagPair && filePair && identity(tagPair.title)===identity(filePair.title)) return tagPair;
  const title=clean(tags.title || ''),artist=clean(tags.artist || '');
  if(title) return {title:title.slice(0,300),artist:(artist || (filePair && identity(title)===identity(filePair.title) ? filePair.artist : '')).slice(0,300)};
  if(filePair)return {...filePair,artist:artist || filePair.artist};
  return {title:includeUnstructuredFilename ? clean(filename.replace(/\.[^.]+$/,'')).slice(0,300) : '',artist:artist.slice(0,300)};
}
/** Only resolved track fields may leave the device; raw filename/path never does. */
export async function audioMetadata(file: File, includeUnstructuredFilename = true): Promise<TrackMetadata> {
  try {
    const {parseBlob} = await import('music-metadata');
    const {common} = await parseBlob(file, {skipCovers:true,duration:false});
    return resolveAudioMetadata(file.name,{title:common.title,artist:common.artist || common.artists?.join(', ')},includeUnstructuredFilename);
  } catch { return resolveAudioMetadata(file.name,{},includeUnstructuredFilename); }
}
