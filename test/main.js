(function(document, Scrollbar) {
    'use strict';

    Scrollbar.initAll();

    var sortOpts = {
        scroll: false,
        animation: 150,
        ghostClass: 'onsort'
    };

    if ('ontouchstart' in document) {
        // touch screen
        var isDrag = false;

        sortOpts.onStart = function(evt) {
            isDrag = true;
            var dragEvt = document.createEvent('Event');
            dragEvt.initEvent('dragstart', true, true);
            evt.from.dispatchEvent(dragEvt);
        };

        sortOpts.onEnd = function(evt) {
            isDrag = false;
            var dragEvt = document.createEvent('Event');
            dragEvt.initEvent('dragend', true, true);
            evt.from.dispatchEvent(dragEvt);
        };

        window.addEventListener('touchmove', function(evt) {
            if (!isDrag) return;

            var touchList = evt.touches;
            var finger = touchList[touchList.length - 1];

            var dragEvt = document.createEvent('Event');
            dragEvt.initEvent('drag', true, true);
            dragEvt.clientX= finger.clientX;
            dragEvt.clientY = finger.clientY;

            evt.target.dispatchEvent(dragEvt);
        });
    }

    Sortable.create(document.querySelector('#sortable ul'), sortOpts);

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
