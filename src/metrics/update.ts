import {
  Scrollbar,
} from '../interfaces/';

export function update(scrollbar: Scrollbar) {
  const newSize = scrollbar.getSize();

  const limit = {
    x: Math.max(newSize.content.width - newSize.container.width, 0),
    y: Math.max(newSize.content.height - newSize.container.height, 0),
  };

  // metrics
  const containerBounding = scrollbar.containerEl.getBoundingClientRect();

  const bounding = {
    top: Math.max(containerBounding.top, 0),
    right: Math.min(containerBounding.right, window.innerWidth),
    bottom: Math.min(containerBounding.bottom, window.innerHeight),
    left: Math.max(containerBounding.left, 0),
  };

  // assign props
  scrollbar.size = newSize;
  scrollbar.limit = limit;
  scrollbar.bounding = bounding;

  // update tracks
  scrollbar.track.update();

  // re-positioning
  scrollbar.setPosition();
}
