/** Centre is 100%; retain the existing 50–300% range. */
export const ZOOM_TICKS = [0,25,50,75,100];
export function zoomFromSlider(position:number) {
  const p=Math.max(0,Math.min(100,position));
  return p<=50 ? .5+p/100 : 1+(p-50)/25;
}
export function sliderFromZoom(zoom:number) {
  return Math.max(0,Math.min(100,zoom<=1 ? (zoom-.5)*100 : 50+(zoom-1)*25));
}
export function snapZoomSlider(position:number) {
  const tick=ZOOM_TICKS.find(t=>Math.abs(position-t)<=3);
  return tick ?? position;
}
