(function(document, Scrollbar) {
    'use strict';

    Scrollbar.initAll();

    var toggle = document.querySelector('#toggle'),
        curSB = document.querySelector('#cur-sb'),
        compare = document.querySelector('#compare');

    toggle.addEventListener('click', function() {
        if (Scrollbar.has(compare)) {
            Scrollbar.destroy(compare);
            curSB.textContent = 'Native Scrollbar';
        } else {
            Scrollbar.init(compare);
            curSB.textContent = 'Smooth Scrollbar'
        }
    });


    var infinite = Scrollbar.init(document.querySelector('#infinite'));

    var x = document.querySelector('#x'),
        y = document.querySelector('#y'),
        status = document.querySelector('#status');

    var createPara = function() {
        var p = document.createElement('p');
        p.textContent = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laboriosam, accusamus laudantium nostrum minima possimus optio voluptates id dignissimos, libero voluptas nesciunt. Consequatur deleniti corporis recusandae nesciunt. Maiores dignissimos praesentium tempore.';

        return p;
    };

    infinite.addListener(function(status) {
        var offset = status.offset;
        x.textContent = offset.x.toFixed(2);
        y.textContent = offset.y.toFixed(2);
    });

    var count = 0;
    var scrollContent = infinite.getContentElem();
    infinite.infiniteScroll(function() {
        if (count++ > 10) {
            status.textContent = 'the end';
        } else {
            status.textContent = 'loading...';

            setTimeout(function() {
                status.textContent = 'pending...';
                scrollContent.appendChild(createPara());
                scrollContent.appendChild(createPara());

                infinite.update();
            }, 500);
        }
    });
})(document, window.Scrollbar);
