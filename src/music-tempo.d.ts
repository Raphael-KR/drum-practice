declare module "music-tempo" {
  export default class MusicTempo {
    constructor(samples: Float32Array, options?: Record<string, number>);
    beats: number[];
    events: number[];
    tempo: string;
  }
}
