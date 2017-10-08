import Scrollbar from 'smooth-scrollbar';
import * as Prism from 'prismjs';
import 'prismjs/themes/prism.css';

import './monitor';
import './controller';
import '../styles/index.styl';

declare var __SCROLLBAR_VERSION__: string;

// for debug
(window as any).Scrollbar = Scrollbar;

Prism.highlightAll(false);

(document.getElementById('version') as HTMLElement).textContent = __SCROLLBAR_VERSION__;

if (window.innerWidth < 800) {
  Array.from(document.querySelectorAll('pre, table')).forEach((el: HTMLElement) => {
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.appendChild(el);

    if (el.parentNode) {
      el.parentNode.insertBefore(wrap, el);
    }

    Scrollbar.init(wrap, {
      plugins: {
        overscroll: false,
      },
    });
  });
}
