import { Player as PlaybackPlayer } from "../../modules/audio/audio-core";
import { readPlaybackPreferences } from "../../modules/playback/playback-preferences";
export class Player extends PlaybackPlayer {
  constructor(preferences = readPlaybackPreferences) {
    super(preferences);
  }
}
