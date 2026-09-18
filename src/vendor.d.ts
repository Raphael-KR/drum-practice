declare module "soundtouchjs" {
  export class SoundTouch {
    tempo: number;
    stretch: {
      setParameters(
        sr: number,
        seq: number,
        seek: number,
        overlap: number,
      ): void;
    };
  }
  export class SimpleFilter {
    constructor(
      source: {
        extract(target: Float32Array, frames: number, position: number): number;
      },
      pipe: SoundTouch,
    );
    extract(target: Float32Array, frames: number): number;
  }
}
