// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { fullScoreLabels } from '../src/full-score-labels';
it('labels only the leftmost measure of each actual row using page-relative positions',()=>{
 const svg='<svg viewBox="0 0 1000 2000"><g class="vf-measure" id="33"><path d="M50 100L300 100"/></g><g class="vf-measure" id="34"><path d="M300 100L500 100"/></g><g class="vf-measure" id="37"><path d="M50 400L300 400"/></g></svg>';
 expect(fullScoreLabels(svg)).toEqual([{label:'33',left:5,top:5},{label:'37',left:5,top:20}]);
 expect(svg).not.toContain('full-svg-measure-label');
});
it('rejects missing page geometry',()=>expect(fullScoreLabels('<svg/>')).toEqual([]));
