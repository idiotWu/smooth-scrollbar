import * as I from '../interfaces/';
import debounce from 'lodash-es/debounce';

import {
  eventScope,
} from '../utils/';

export function resizeHandler(scrollbar: I.Scrollbar) {
  const addEvent = eventScope(scrollbar);

  addEvent(
    window,
    'resize',
    debounce(scrollbar.update.bind(scrollbar), 300),
  );
}
