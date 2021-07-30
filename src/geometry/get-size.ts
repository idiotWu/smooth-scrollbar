import * as I from '../interfaces/';

export function getSize(scrollbar: I.Scrollbar): I.ScrollbarSize {
  const {
    containerEl,
    contentEl,
  } = scrollbar;

  const containerStyles = getComputedStyle(containerEl);
  const paddings = [
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
  ].map(prop => {
    return containerStyles[prop] ? parseFloat(containerStyles[prop]) : 0;
  });
  const verticalPadding = paddings[0] + paddings[1];
  const horizontalPadding = paddings[2] + paddings[3];

  return {
    container: {
      // requires `overflow: hidden`
      width: containerEl.clientWidth,
      height: containerEl.clientHeight,
    },
    content: {
      // border width and paddings should be included
      width: contentEl.offsetWidth - contentEl.clientWidth + contentEl.scrollWidth + horizontalPadding,
      height: contentEl.offsetHeight - contentEl.clientHeight + contentEl.scrollHeight + verticalPadding,
    },
  };
}
