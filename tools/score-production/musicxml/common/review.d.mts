import type { Song } from "../../../../src/model/model";
import type { RecordData, ScoreVariant } from "../../../../src/model/record";

export interface ScoreReviewOptions {
  /** One-based positions in record.song.measures or stable IDs. Default: source systems. */
  measureGroups?: readonly (readonly (number | string)[])[];
  /** Index in record.otherScores; omitted selects the first other format, null disables it. */
  alternateIndex?: number | null;
  /** CSS pixels. Mount defaults to viewport minus 40px, bounded 200..1200; pure plan defaults to 1200. */
  rowWidth?: number;
  showSVGPages?: boolean;
  /** Also flag lyrics without reviewed PDF anchors. Default: report coverage only. */
  requirePDFAnchors?: boolean;
}
export interface ScoreReviewReport {
  songId: string;
  disposed: boolean;
  rowFormat: ScoreVariant["format"];
  alternateIndex: number | null;
  rows: {
    group: number;
    measures: number[];
    height: number;
    bounds: {
      top: number;
      bottom: number;
      width: number;
      height: number;
    } | null;
  }[];
  svgPages: { page: number; width: number; height: number }[];
  anchors: {
    expected: number;
    checked: number;
    unanchored: number;
    maxErrorPx: number;
    tolerancePx: number;
  };
  /** False in DOM-only tests; those tests must not claim browser geometry verification. */
  layoutObserved: boolean;
  failures: {
    code: string;
    group: number;
    measure?: number;
    lyricId?: string;
    errorPx?: number;
    details?: Record<string, number>;
  }[];
  status: "passed" | "failed" | "unmeasured" | "disposed";
}
export interface MountedScoreReview {
  element: HTMLDialogElement;
  root: ShadowRoot;
  report(): ScoreReviewReport;
  dispose(): void;
}
export const REVIEW_ANCHOR_TOLERANCE_PX: number;
export function planScoreReview(
  record: RecordData,
  options?: ScoreReviewOptions,
): {
  song: Song;
  source: ScoreVariant;
  svg?: ScoreVariant;
  /** Zero-based measure indices, in the requested order. */
  groups: number[][];
  rowWidth: number;
  alternateIndex: number | null;
};
export function mountScoreReview(
  record: RecordData,
  options?: ScoreReviewOptions,
): Promise<MountedScoreReview>;
