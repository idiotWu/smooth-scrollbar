import { getPointerData } from './get-pointer-data';

/**
 * Get pointer/finger position
 */
export function getPosition(evt: any) {
  const data = getPointerData(evt);

  return {
    x: data.clientX,
    y: data.clientY,
  };
}
