import './monitor';
import './controller';
import Scrollbar from '../../src/';

window.Scrollbar = Scrollbar;
Prism.highlightAll();
document.getElementById('version').textContent = Scrollbar.version;
