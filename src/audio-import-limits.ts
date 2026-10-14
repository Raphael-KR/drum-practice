import { t } from "./i18n";

export const MAX_AUDIO_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_AUDIO_SECONDS = 30 * 60;
export const AUDIO_DECODE_SAMPLE_RATE = 32000;
export const MAX_AUDIO_PCM_BYTES = 256 * 1024 * 1024;

export function checkAudioFileSize(file: Pick<Blob, "size">): void {
  if (!file.size) throw Error(t("audioPractice.empty"));
  if (file.size > MAX_AUDIO_FILE_BYTES)
    throw Error(t("audioPractice.fileTooLarge", { limit: 100 }));
}

export function checkAudioFormat(
  duration: number | undefined,
  channels: number | undefined,
): void {
  if (
    !Number.isFinite(duration) ||
    !duration ||
    duration <= 0 ||
    !Number.isInteger(channels) ||
    !channels ||
    channels < 1
  )
    throw Error(t("audioPractice.unknownSize"));
  if (
    duration > MAX_AUDIO_SECONDS ||
    channels > 2 ||
    duration *
      channels *
      AUDIO_DECODE_SAMPLE_RATE *
      Float32Array.BYTES_PER_ELEMENT >
      MAX_AUDIO_PCM_BYTES
  )
    throw Error(t("audioPractice.decodedTooLarge"));
}

/** Parse bounded file metadata before allocating the complete decoded waveform. */
export async function checkAudioBeforeDecode(file: File): Promise<void> {
  checkAudioFileSize(file);
  const { parseBlob } = await import("music-metadata");
  const { format } = await parseBlob(file, {
    skipCovers: true,
    duration: true,
  });
  checkAudioFormat(format.duration, format.numberOfChannels);
}
