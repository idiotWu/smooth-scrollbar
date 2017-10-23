import Scrollbar from 'smooth-scrollbar';
import * as Prism from 'prismjs';
import 'prismjs/themes/prism.css';

import './monitor';
import './controller';
import '../styles/index.styl';

// for debug
(window as any).Scrollbar = Scrollbar;

Prism.highlightAll(false);

(document.getElementById('version') as HTMLElement).textContent = Scrollbar.version;
