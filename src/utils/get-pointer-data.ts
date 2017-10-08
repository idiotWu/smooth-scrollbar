/**
 * Get pointer/touch data
 */
export function getPointerData(evt: any) {
  // if is touch event, return last item in touchList
  // else return original event
  return evt.touches ? evt.touches[evt.touches.length - 1] : evt;
}
