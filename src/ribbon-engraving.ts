/** OSMD 2.1.x adapter: change musical positions before native engraving, never scale glyphs. */
export interface RibbonSpacing {
  quarter: number;
  uniformQuarters?: number;
  rowWidth?: number;
  offset: number;
  constraints?: { measure: number; beat: number; quarter: number; boundary: boolean; left: number; right: number }[];
}
export function ribbonSpacing(osmd: any): RibbonSpacing {
  let quarter = 64,
    offset = 8;
  const measures: { q: number; left: number; right: number }[][] = [];
  for (const row of osmd.GraphicSheet.MeasureList) {
    const g = row[0];
    const entries: { q: number; left: number; right: number }[] = [];
    for (const e of g.staffEntries) {
      let left = 0,
        right = 12;
      for (const v of e.graphicalVoiceEntries) {
        if (v.parentVoiceEntry.IsGrace) continue;
        const metrics = v.vfStaveNote?.getTickContext()?.getMetrics();
        left = Math.max(left, metrics?.extraLeftPx || 0);
        right = Math.max(
          right,
          (metrics?.notePx || 12) + (metrics?.extraRightPx || 0),
        );
      }
      entries.push({ q: e.relInMeasureTimestamp.RealValue * 4, left, right });
      // Only an ornament on the first beat needs a leading margin.
      // Interior ornaments are already covered by their preceding interval.
      if (Math.abs(e.relInMeasureTimestamp.RealValue) < 1e-7)
        offset = Math.max(offset, left + 4);
    }
    entries.push({
      q: g.parentSourceMeasure.Duration.RealValue * 4,
      left: 0,
      right: 0,
    });
    measures.push(entries);
  }
  const constraints: NonNullable<RibbonSpacing["constraints"]> = [];
  for (const [measure, entries] of measures.entries())
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1],
        next = entries[i],
        delta = next.q - prev.q;
      if (delta > 1e-7) {
        constraints.push({measure: measure+1, beat: prev.q, quarter: Math.max((prev.right+next.left+4)/delta, i===entries.length-1 ? (offset+prev.right+4)/delta : 0), boundary:i===entries.length-1,left:next.left,right:prev.right});
        quarter = Math.max(
          quarter,
          (prev.right + next.left + 4) / delta,
          i === entries.length - 1 ? (offset + prev.right + 4) / delta : 0,
        );
      }
    }
  const rowWidth = Math.ceil(Math.max(320, ...measures.map(entries => offset + rowMinimum(entries))));
  return { rowWidth, quarter: Math.ceil(quarter), offset: Math.ceil(offset), constraints: constraints.sort((a,b)=>b.quarter-a.quarter).slice(0,8) };
}
export function installRibbonEngraving(osmd: any, spacing: RibbonSpacing) {
  const calculator = osmd.GraphicSheet.GetCalculator;
  installMeasureEndWedges(osmd);
  const calculate = calculator.calculateMeasureXLayout.bind(calculator);
  calculator.calculateMeasureXLayout = (row: any[]) => {
    const minimum = calculate(row);
    for (const measure of row) {
      if (!measure?.formatVoices) continue;
      const format = measure.formatVoices;
      measure.formatVoices = (width: number, parent: any) => {
        format(width, parent);
        const duration = measure.parentSourceMeasure.Duration.RealValue * 4;
        const quarters = spacing.uniformQuarters ?? duration;
        const rowEntries = spacing.uniformQuarters && spacing.rowWidth ? measure.staffEntries.map((e: any) => {
          let left = 0, right = 12;
          for (const v of e.graphicalVoiceEntries) {
            if (v.parentVoiceEntry.IsGrace) continue;
            const metrics = v.vfStaveNote?.getTickContext()?.getMetrics();
            left = Math.max(left, metrics?.extraLeftPx || 0);
            right = Math.max(right, (metrics?.notePx || 12) + (metrics?.extraRightPx || 0));
          }
          return {q:e.relInMeasureTimestamp.RealValue*4,left,right};
        }) : [];
        const points = spacing.uniformQuarters && spacing.rowWidth
          ? rowPositions([...rowEntries,{q:duration,left:0,right:0}],spacing.offset,spacing.rowWidth) : undefined;
        measure.setWidth((points ? spacing.rowWidth! : quarters * spacing.quarter) / 10);
        const stave = measure.getVFStave(),
          contexts = new Set();
        for (const [entryIndex, entry] of measure.staffEntries.entries())
          for (const voice of entry.graphicalVoiceEntries) {
            // GraceNoteGroup remains attached to its principal note in VexFlow.
            if (voice.parentVoiceEntry.IsGrace) continue;
            const note = voice.vfStaveNote;
            if (!note) continue;
            note.setStave(stave);
            const context = note.getTickContext();
            if (contexts.has(context)) continue;
            contexts.add(context);
            const x =
              stave.getX() +
              (points ? points[entryIndex] : spacing.offset +
              entry.relInMeasureTimestamp.RealValue * 4 * spacing.quarter * quarters / duration);
            context.setX(context.getX() + x - note.getAbsoluteX());
          }
      };
    }
    return minimum;
  };
}

interface RowEntry {q:number;left:number;right:number}
function rowMinimum(entries:RowEntry[]) {
  return entries.slice(1).reduce((sum,e,i)=>sum+entries[i].right+e.left+4,0);
}
/** Reserve glyph/ornament clearance, then distribute spare space by musical time. */
export function rowPositions(entries:RowEntry[],offset:number,width:number) {
  const spare=Math.max(0,width-offset-rowMinimum(entries));
  const duration=entries.at(-1)!.q;
  let used=offset;
  return entries.map((e,i)=>{
    if(i) used+=entries[i-1].right+e.left+4;
    return used+spare*e.q/duration;
  });
}

/** OSMD 2.1.x treats an end-offset at the barline as the next system's x=0.
 * For playback's one-measure systems, anchor that stop to the last timed entry;
 * native wedge layout then extends it to this measure's right boundary.
 * Scope the adaptation to the calculation; never mutate the canonical input.
 */
export function installMeasureEndWedges(osmd: any) {
  const calculator = osmd.GraphicSheet.GetCalculator;
  if (!calculator.calculateGraphicalContinuousDynamic) return;
  const calculate = calculator.calculateGraphicalContinuousDynamic.bind(calculator);
  calculator.calculateGraphicalContinuousDynamic = (expression: any, position: any) => {
    const end = expression.ContinuousDynamic.EndMultiExpression;
    const offset = end?.EndOffsetFraction;
    const source = end?.SourceMeasureParent;
    const timestamp = end?.Timestamp;
    const atBarline = offset && timestamp && source &&
      Math.abs(timestamp.RealValue + offset.RealValue - source.Duration.RealValue) < 1e-8;
    const measure = atBarline && osmd.GraphicSheet.MeasureList[source.measureListIndex]
      ?.find((m: any) => m?.ParentStaff === expression.StartMeasure.ParentStaff);
    const last = measure?.staffEntries?.filter((entry: any) =>
      entry.relInMeasureTimestamp.RealValue < source.Duration.RealValue &&
      entry.graphicalVoiceEntries.some((v: any) => !v.parentVoiceEntry.IsGrace)
    ).at(-1);
    if (!last || expression.IsSoftAccent) return calculate(expression, position);
    end.Timestamp = last.relInMeasureTimestamp;
    end.EndOffsetFraction = undefined;
    try { return calculate(expression, position); }
    finally { end.Timestamp = timestamp; end.EndOffsetFraction = offset; }
  };
}
