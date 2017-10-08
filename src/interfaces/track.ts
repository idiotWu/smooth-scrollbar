export interface ScrollbarThumb {
  readonly element: HTMLElement;
  displaySize: number;
  realSize: number;
  offset: number;

  attachTo(track: HTMLElement): void;
  update(scrollOffset: number, containerSize: number, pageSize: number): void;
}

export interface ScrollbarTrack {
  readonly element: HTMLElement;
  readonly thumb: ScrollbarThumb;

  attachTo(container: HTMLElement): void;
  show(): void;
  hide(): void;
  update(scrollOffset: number, containerSize: number, pageSize: number): void;
}

export interface TrackController {
  readonly xAxis: ScrollbarTrack;
  readonly yAxis: ScrollbarTrack;

  update(): void;
  autoHideOnIdle(): void;
}
