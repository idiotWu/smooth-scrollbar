(function() {
    'use strict';

    var scrollbar = Scrollbar.init(document.getElementById('content'));
    var thumb = document.getElementById('thumb');
    var canvas = document.getElementById('chart');
    var ctx = canvas.getContext('2d');

    var thumbWidth = 0, endOffset = 0;
    var pointerX = 0;
    var duration = 5 * 1e3;
    var MAX_DURATION = 20 * 1e3;

    var records = [];
    var size = {
        width: 300,
        height: 200
    };

    var locked = false;
    var hoverPoint = null;
    var hoverPointPre = null;

    canvas.width = size.width;
    canvas.height = size.height;

    function sliceRecord() {
        var source = records;
        var endIdx = Math.floor(source.length * (1 - endOffset));
        var start = source[0];
        var end = source[endIdx - 1];
        var sliceIdx = 0,
            dropIdx = 0;

        source.some(function(pt, idx) {
            var d = end.time - pt.time;

            if (d > MAX_DURATION) {
                dropIdx = idx;
            }

            if (d < duration) {
                sliceIdx = idx - dropIdx;
                return true;
            }
        });

        records = source.slice(dropIdx);

        var result = source.slice(sliceIdx, endIdx);

        thumbWidth = result.length / records.length;

        thumb.style.width = thumbWidth * 100 + '%';
        thumb.style.right = endOffset * 100 + '%';

        return result;
    };

    function getLimit(points) {
        return points.reduce(function(pre, cur) {
            var val = cur.offset;
            return {
                max: Math.max(pre.max, val),
                min: Math.min(pre.min, val)
            };
        }, { max: -Infinity, min: Infinity });
    };

    function assignOptions(options) {
        if (!options) return;

        Object.keys(options).forEach(function(prop) {
            ctx[prop] = options[prop];
        });
    };

    function drawLine(p0, p1, options) {
        var x0 = p0[0],
            y0 = p0[1],
            x1 = p1[0],
            y1 = p1[1];

        if (options.dashed) {
            ctx.setLineDash(options.dashed);
            delete options.dashed;
        } else {
            ctx.setLineDash([]);
        }

        assignOptions(options);

        ctx.setTransform(1, 0, 0, -1, 0, size.height);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();
    };

    function fillText(content, p, options) {
        var x = p[0],
            y = p[1];

        assignOptions(options);
        ctx.setTransform(1, 0, 0, 1, 0, size.height);
        ctx.fillText(content, x, -y);
    };

    function drawMain() {
        var points = sliceRecord();
        var limit = getLimit(points);

        var start = points[0];
        var end = points[points.length - 1];

        var totalX = duration;
        var totalY = (limit.max - limit.min) || 1;

        var grd = ctx.createLinearGradient(0, size.height, 0, 0);
        grd.addColorStop(0, 'rgb(170, 215, 255)');
        grd.addColorStop(1, 'rgba(170, 215, 255, 0.2)');

        ctx.setTransform(1, 0, 0, -1, 0, size.height);

        ctx.lineWidth = 1;
        ctx.fillStyle = grd;
        ctx.strokeStyle = 'rgb(64, 165, 255)';
        ctx.beginPath();
        ctx.moveTo(0, 0);

        var lastPoint = points.reduce(function(pre, cur, idx) {
            var time = cur.time,
                value = cur.offset;
            var x = (time - start.time) / totalX * size.width,
                y = (value - limit.min) / totalY * (size.height - 20);

            ctx.lineTo(x, y);

            if (pointerX && Math.abs(pointerX - x) < 1) {
                hoverPoint = {
                    coord: [x, y],
                    point: cur
                };

                hoverPointPre = {
                    coord: pre,
                    point: points[idx - 1]
                };
            }

            return [x, y];
        }, []);

        ctx.stroke();
        ctx.lineTo(lastPoint[0], 0);
        ctx.fill();
        ctx.closePath();

        drawLine([0, lastPoint[1]], lastPoint, {
            strokeStyle: '#f60'
        });

        fillText('↙' + limit.min.toFixed(2), [0, 0], {
            fillStyle: '#000',
            textAlign: 'left',
            textBaseline: 'bottom',
            font: '12px sans-serif'
        });
        fillText(end.offset.toFixed(2), lastPoint, {
            fillStyle: '#f60',
            textAlign: 'right',
            textBaseline: 'bottom',
            font: '16px sans-serif'
        });
    };

    function drawTangentLine() {
        var coord = hoverPoint.coord,
            coordPre = hoverPointPre.coord;

        var k = (coord[1] - coordPre[1]) / (coord[0] - coordPre[0]) || 0;
        var b = coord[1] - k * coord[0];

        drawLine([0, b], [size.width, k * size.width + b], {
            lineWidth: 1,
            strokeStyle: '#f00'
        });

        fillText('v: ' + k.toFixed(2), [size.width, 0], {
            fillStyle: '#f00',
            textAlign: 'right',
            textBaseline: 'bottom',
            font: 'bold 12px sans-serif'
        });
    };

    function drawHover() {
        if (!hoverPoint) return;

        drawTangentLine();

        var coord = hoverPoint.coord,
            point = hoverPoint.point;

        var coordStyle = {
            lineWidth: 1,
            strokeStyle: 'rgb(64, 165, 255)',
            dashed: [8, 4]
        };

        drawLine([0, coord[1]], [size.width, coord[1]], Object.assign({}, coordStyle));
        drawLine([coord[0], 0], [coord[0], size.height], Object.assign({}, coordStyle));

        var date = new Date(point.time + point.reduce);

        var pointInfo = [
            '(',
            date.getMinutes(),
            ':',
            date.getSeconds(),
            '.',
            date.getMilliseconds(),
            ', ',
            point.offset.toFixed(2),
            ')'
        ].join('');

        fillText(pointInfo, coord, {
            fillStyle: '#000',
            textAlign: 'left',
            textBaseline: 'bottom',
            font: 'bold 12px sans-serif'
        });
    };

    function render() {
        ctx.save();
        ctx.clearRect(0, 0, size.width, size.height);

        if (records.length > 2) {
            drawMain();
            drawHover();
        }

        if (locked) {
            fillText('LOCKED', [10, size.height], {
                fillStyle: '#f00',
                textAlign: 'left',
                textBaseline: 'top',
                font: 'bold 14px sans-serif'
            });
        }

        ctx.restore();

        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    var lastTime = Date.now(),
        lastOffset = 0,
        reduceAmount = 0;

    scrollbar.addListener(function() {
        if (locked) return;

        var current = Date.now(),
            offset = scrollbar.offset.y,
            duration = current - lastTime;

        if (offset === lastOffset) return;

        if (duration > 50) {
            reduceAmount += duration;
        }

        lastTime = current;
        lastOffset = offset;

        records.push({
            time: current - reduceAmount,
            reduce: reduceAmount,
            offset: offset
        });
    });

    function getPointer(e) {
        return e.touches ? e.touches[e.touches.length - 1] : e;
    };

    function addEvent(el, evt, handler) {
        evt.split(/\s+/).forEach(function(name) {
            el.addEventListener(name, handler);
        });
    };

    var input = document.getElementById('duration');
    var label = document.querySelector('label');
    input.max = MAX_DURATION / 1e3;
    input.min = 1;
    input.value = duration / 1e3;
    label.textContent = input.value + 's';

    addEvent(input, 'input', function(e) {
        var val = parseFloat(e.target.value);
        label.textContent = val + 's';
        duration = val * 1e3;
    });

    addEvent(canvas, 'mousemove touchmove', function(e) {
        if (locked) return;

        var pointer = getPointer(e);

        pointerX = pointer.clientX - canvas.getBoundingClientRect().left;
    });

    addEvent(canvas, 'mouseleave', function() {
        if (locked) return;
        pointerX = 0;
        hoverPoint = null;
    });

    addEvent(window, 'touchend', function() {
        if (locked) return;
        pointerX = 0;
        hoverPoint = null;
    });

    addEvent(canvas, 'click', function() {
        locked = !locked;
    });

    document.getElementById('reset').addEventListener('click', function() {
        records.length = 0;
    });

    var pointerDownX = undefined;

    addEvent(thumb, 'mousedown touchstart', function(e) {
        var pointer = getPointer(e);
        pointerDownX = pointer.clientX;
    });

    addEvent(window, 'mousemove touchmove', function(e) {
        if (!pointerDownX) return;

        var pointer = getPointer(e);
        var moved = (pointer.clientX - pointerDownX) / size.width;

        pointerDownX = pointer.clientX;
        endOffset = Math.min(1 - thumbWidth, Math.max(0, endOffset - moved));
    });

    addEvent(window, 'mouseup touchend blur', function() {
        pointerDownX = undefined;
    });
})();