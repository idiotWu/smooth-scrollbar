import './monitor';
import './controller';
import Scrollbar from '../../src/';
import '../styles/index.styl';

window.Scrollbar = Scrollbar;
Prism.highlightAll();
document.getElementById('version').textContent = Scrollbar.version;

if (window.innerWidth < 800) {
    [...document.querySelectorAll('pre, table')].forEach((el) => {
        const wrap = document.createElement('div');
        wrap.className = 'wrap';

        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);

        Scrollbar.init(wrap);
    });
}
