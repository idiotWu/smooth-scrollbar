import * as I from '../interfaces/';

export function getSize(scrollbar: I.Scrollbar): I.ScrollbarSize {
  const {
    containerEl,
    contentEl,
  } = scrollbar;

  return {
    container: {
      // requires `overflow: hidden`
      width: containerEl.clientWidth,
      height: containerEl.clientHeight,
    },
    content: {
      // border width should be included
      width: contentEl.offsetWidth - contentEl.clientWidth + contentEl.scrollWidth,
      height: contentEl.offsetHeight - contentEl.clientHeight + contentEl.scrollHeight,
    },
  };
}
