import {afterEach,expect,it,vi} from 'vitest';
vi.mock('music-metadata',()=>({parseBlob:vi.fn()}));
import {parseBlob} from 'music-metadata';
import {readAudioPractice} from '../src/audio-practice';
import {checkAudioFormat,MAX_AUDIO_FILE_BYTES} from '../src/audio-import-limits';

afterEach(()=>{vi.clearAllMocks();vi.unstubAllGlobals();});

it('rejects oversized files before reading bytes, metadata or creating a decoder',async()=>{
  const read=vi.fn();const decoder=vi.fn();vi.stubGlobal('AudioContext',decoder);
  const file={size:MAX_AUDIO_FILE_BYTES+1,arrayBuffer:read} as unknown as File;
  await expect(readAudioPractice(file)).rejects.toThrow('100MiB');
  expect(read).not.toHaveBeenCalled();expect(parseBlob).not.toHaveBeenCalled();expect(decoder).not.toHaveBeenCalled();
});

it('rejects unknown or excessive decoded size before allocating the decoder',async()=>{
  const file=new File(['header'],'long.mp3');const read=vi.spyOn(file,'arrayBuffer');
  const decoder=vi.fn();vi.stubGlobal('AudioContext',decoder);
  for(const format of [{},{duration:3600,numberOfChannels:2},{duration:1200,numberOfChannels:2},{duration:1,numberOfChannels:8}]) {
    vi.mocked(parseBlob).mockResolvedValueOnce({format} as Awaited<ReturnType<typeof parseBlob>>);
    await expect(readAudioPractice(file)).rejects.toThrow();
  }
  expect(read).not.toHaveBeenCalled();expect(decoder).not.toHaveBeenCalled();
});

it('accepts normal stereo tracks and bounds duration, channels and PCM separately',()=>{
  expect(()=>checkAudioFormat(360,2)).not.toThrow();
  expect(()=>checkAudioFormat(1800,1)).not.toThrow();
  for(const [duration,channels] of [[NaN,2],[Infinity,2],[0,2],[10,0],[10,1.5],[1801,1],[1200,2]])
    expect(()=>checkAudioFormat(duration,channels)).toThrow();
});
