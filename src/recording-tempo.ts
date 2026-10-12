import bundled from "./bundled-recording-tempo.json";
import type { RecordData } from "./storage";

const FIELD = "drum-practice:recording-tempo:v1";
export interface RecordingTempo {
  version: 1;
  scoreBpm: number;
  bpmEstimate: number;
  firstBeatEstimateSeconds: number;
  audioSHA256: string;
  method: string;
  status: string;
}
/** Estimates describe the recording; they never set playback rate. */
export function readRecordingTempo(xml?: string): RecordingTempo | undefined {
  if (!xml || /<!ENTITY/i.test(xml)) return;
  try {
    const document = new DOMParser().parseFromString(xml, "application/xml");
    if (document.querySelector("parsererror")) return;
    const field = [...document.querySelectorAll("identification > miscellaneous > miscellaneous-field")]
      .find(node => node.getAttribute("name") === FIELD);
    if (!field) return;
    const value = JSON.parse(field.textContent || "") as RecordingTempo;
    if (value.version !== 1 || !Number.isFinite(value.scoreBpm) || value.scoreBpm <= 0 ||
      !Number.isFinite(value.bpmEstimate) || value.bpmEstimate <= 0 ||
      !Number.isFinite(value.firstBeatEstimateSeconds) || value.firstBeatEstimateSeconds < 0 ||
      !/^[a-f0-9]{64}$/.test(value.audioSHA256)) return;
    return value;
  } catch { return; }
}

/** Add known estimates only to an unchanged recording, preserving the existing XML bytes. */
export async function recordingTempoUpgrade(record: RecordData): Promise<string | undefined> {
  const xml = record.canonicalXML;
  const estimate = (bundled as Record<string, RecordingTempo>)[record.song.id];
  if (!xml || !estimate || readRecordingTempo(xml) || xml.includes(FIELD) ||
    record.song.bpm !== estimate.scoreBpm || !xml.includes("</miscellaneous>")) return;
  const hash = await crypto.subtle.digest("SHA-256", await record.audio.arrayBuffer());
  const hex = [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, "0")).join("");
  if (hex !== estimate.audioSHA256) return;
  const text = JSON.stringify(estimate).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  const next = xml.replace("</miscellaneous>", `<miscellaneous-field name="${FIELD}">${text}</miscellaneous-field></miscellaneous>`);
  return readRecordingTempo(next) ? next : undefined;
}
