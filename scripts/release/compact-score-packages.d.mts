export interface CompactScorePackageResult {
  bytes: Uint8Array;
  changes: {
    path: string;
    removed: number;
    before: number;
    after: number;
  }[];
}
export function compactScorePackage(
  input: Uint8Array,
): Promise<CompactScorePackageResult>;
