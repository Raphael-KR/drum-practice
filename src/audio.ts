import { Player as PlaybackPlayer } from "./audio-core";
import { readPlaybackPreferences } from "./playback-preferences";
export class Player extends PlaybackPlayer {
  constructor(preferences = readPlaybackPreferences) {
    super(preferences);
  }
}
