/** Screen Y increases downwards. Chords use the head nearest the beam. */
export function drumBeamSlope(ys: number[], span: number, staffGap: number) {
  const directions = new Set(ys.slice(1).map((y, i) => Math.sign(y - ys[i])).filter(Boolean));
  if (directions.size !== 1 || span <= 0) return 0;
  return Math.sign(ys.at(-1)! - ys[0]) * Math.min(0.08, staffGap / 2 / span);
}
/** OSMD 2.1/VexFlow adapter, applied before native stem extension and beam drawing. */
export function installDrumBeams(osmd: any) {
  const calculator = osmd.GraphicSheet.GetCalculator;
  const calculate = calculator.calculateMeasureXLayout.bind(calculator);
  const wrapped = new WeakSet<object>();
  calculator.calculateMeasureXLayout = (row: any[]) => {
    const result = calculate(row);
    for (const measure of row) {
      if (wrapped.has(measure)) continue;
      wrapped.add(measure);
      const draw = measure.draw;
      measure.draw = function (...args: any[]) {
        const beams = new Set<any>();
        for (const entry of measure.staffEntries)
          for (const voice of entry.graphicalVoiceEntries) {
            const beam = voice.vfStaveNote?.beam;
            if (beam) beams.add(beam);
          }
        for (const beam of beams) {
          beam.calculateSlope = function () {
            const notes = this.notes;
            const up = this.stem_direction === 1;
            const ys = notes.map((n: any) => up ? Math.min(...n.getYs()) : Math.max(...n.getYs()));
            const first = notes[0], x = first.getStemX(), y = first.getStemExtents().topY;
            this.slope = drumBeamSlope(ys, notes.at(-1).getStemX() - x,
              first.getStave().getSpacingBetweenLines());
            // Native stems already include minimum clearance. Only extend them.
            const shifts = notes.map((n: any) => n.getStemExtents().topY -
              (y + (n.getStemX() - x) * this.slope));
            this.y_shift = up ? Math.min(0, ...shifts) : Math.max(0, ...shifts);
          };
        }
        return draw.apply(this, args);
      };
    }
    return result;
  };
}
