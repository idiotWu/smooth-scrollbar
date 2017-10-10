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
