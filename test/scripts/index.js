import './monitor';
import './preview';

document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
    e.stopPropagation();
});