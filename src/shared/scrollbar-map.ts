import { Scrollbar } from '../interfaces/';

// DO NOT use WeakMap here
// .getAll() methods requires `scrollbarMap.values()`
export const scrollbarMap = new Map<HTMLElement, Scrollbar>();
