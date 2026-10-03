import { expect, it } from 'vitest';
import { installMeasureEndWedges } from '../src/ribbon-engraving';
function fixture(stop=1) {
 const timestamp={RealValue:0}, offset={RealValue:stop}, last={RealValue:.875};
 const staff={}; const source={Duration:{RealValue:1},measureListIndex:0};
 const end={Timestamp:timestamp,EndOffsetFraction:offset,SourceMeasureParent:source};
 const expression={ContinuousDynamic:{EndMultiExpression:end},StartMeasure:{ParentStaff:staff}};
 const calls:any[]=[];
 const calculator={calculateGraphicalContinuousDynamic:(_expression:any,_position:any)=>{calls.push({...end});return 7}};
 const measure={ParentStaff:staff,staffEntries:[{relInMeasureTimestamp:last,graphicalVoiceEntries:[{parentVoiceEntry:{IsGrace:false}}]}]};
 const osmd={GraphicSheet:{GetCalculator:calculator,MeasureList:[[measure]]}};
 return {osmd,calculator,end,expression,calls,timestamp,offset,last};
}
it('anchors a bar-end offset to the final timed entry for native wedge layout, then restores source state',()=>{
 const f=fixture();installMeasureEndWedges(f.osmd);
 expect(f.calculator.calculateGraphicalContinuousDynamic(f.expression,{})).toBe(7);
 expect(f.calls[0].Timestamp).toBe(f.last);
 expect(f.calls[0].EndOffsetFraction).toBeUndefined();
 expect(f.end.Timestamp).toBe(f.timestamp);expect(f.end.EndOffsetFraction).toBe(f.offset);
});
it('leaves interior stops unchanged',()=>{
 const f=fixture(.5);installMeasureEndWedges(f.osmd);
 f.calculator.calculateGraphicalContinuousDynamic(f.expression,{});
 expect(f.calls[0].Timestamp).toBe(f.timestamp);expect(f.calls[0].EndOffsetFraction).toBe(f.offset);
});
it('restores source state even when native layout fails',()=>{
 const f=fixture();f.calculator.calculateGraphicalContinuousDynamic=()=>{throw Error('layout')};
 installMeasureEndWedges(f.osmd);
 expect(()=>f.calculator.calculateGraphicalContinuousDynamic(f.expression,{})).toThrow('layout');
 expect(f.end.Timestamp).toBe(f.timestamp);expect(f.end.EndOffsetFraction).toBe(f.offset);
});
