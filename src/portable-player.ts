import { decodePlaybackAsset, readPlaybackData } from "./playback-export";
import { mountPlaybackRuntime } from "./playback-runtime";

async function start() {
  const data = await readPlaybackData(
    document.getElementById("portable-data")!.textContent!,
  );
  await mountPlaybackRuntime({
    root: document.getElementById("app")!,
    song: data.song,
    audio: decodePlaybackAsset(data.audio),
    pages: data.pages.map(decodePlaybackAsset),
    scores: data.scores?.map((score) => ({
      song: score.song,
      pages: score.pages.map(decodePlaybackAsset),
    })),
    initial: data.initial,
    licenses: JSON.parse(
      document.getElementById("portable-licenses")!.textContent!,
    ),
  });
}
void start().catch((e) => {
  document.getElementById("app")!.textContent =
    e instanceof Error ? e.message : String(e);
});
