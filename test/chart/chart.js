(function() {
    'use strict';

    var DPR = window.devicePixelRatio;

    var scrollbar = Scrollbar.init(document.getElementById('content'));
    var thumb = document.getElementById('thumb');
    var track = document.getElementById('track');
    var canvas = document.getElementById('chart');
    var ctx = canvas.getContext('2d');

    var thumbWidth = 0
    var endOffset = 0;

    var timeRange = 5 * 1e3;
    var TIME_RANGE_MAX = 20 * 1e3;

    var records = [];
    var size = {
        width: 300,
        height: 200
    };

    var shouldUpdate = false;

    var tangentPoint = null;
    var tangentPointPre = null;

    var hoverLocked = false;
    var hoverPointerX = undefined;
    var pointerDownOnTrack = undefined;
    var hoverPrecision = 'ontouchstart' in document ? 5 : 1;

    canvas.width = size.width * DPR;
    canvas.height = size.height * DPR;
    ctx.scale(DPR, DPR);

    function sliceRecord() {
        var source = records;
        var endIdx = Math.floor(source.length * (1 - endOffset));
        var start = source[0];
        var end = source[endIdx - 1];

        var result = source.filter(function(pt, idx) {
            var d = end.time - pt.time;

            if (d > TIME_RANGE_MAX) {
                records.shift();
            }

            return d <= timeRange && idx <= endIdx;
        });

        thumbWidth = result.length ? result.length / records.length : 1;

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

    function assignProps(props) {
        if (!props) return;

        Object.keys(props).forEach(function(name) {
            ctx[name] = props[name];
        });
    };

    function drawLine(p0, p1, options) {
        var x0 = p0[0],
            y0 = p0[1],
            x1 = p1[0],
            y1 = p1[1];

        assignProps(options.props);

        ctx.save();
        ctx.transform(1, 0, 0, -1, 0, size.height);
        ctx.beginPath();
        ctx.setLineDash(options.dashed ? options.dashed : []);
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();
        ctx.restore()
    };

    function adjustText(content, p, options) {
        var x = p[0],
            y = p[1];

        var width = ctx.measureText(content).width;

        if (x + width > size.width) {
            ctx.textAlign = 'right';
        } else if (x - width < 0) {
            ctx.textAlign = 'left';
        } else {
            ctx.textAlign = options.textAlign;
        }

        ctx.fillText(content, x, -y);
    };

    function fillText(content, p, options) {
        assignProps(options.props);

        ctx.save();
        ctx.transform(1, 0, 0, 1, 0, size.height);
        adjustText(content, p, options);
        ctx.restore();
    };

    function drawMain() {
        var points = sliceRecord();
        if (!points.length) return;

        var limit = getLimit(points);

        var start = points[0];
        var end = points[points.length - 1];

        var totalX = thumbWidth === 1 ? timeRange : end.time - start.time;
        var totalY = (limit.max - limit.min) || 1;

        var grd = ctx.createLinearGradient(0, size.height, 0, 0);
        grd.addColorStop(0, 'rgb(170, 215, 255)');
        grd.addColorStop(1, 'rgba(170, 215, 255, 0.2)');

        ctx.save();
        ctx.transform(1, 0, 0, -1, 0, size.height);

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

            if (hoverPointerX && Math.abs(hoverPointerX - x) < hoverPrecision) {
                tangentPoint = {
                    coord: [x, y],
                    point: cur
                };

                tangentPointPre = {
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
        ctx.restore();

        drawLine([0, lastPoint[1]], lastPoint, {
            props: {
                strokeStyle: '#f60'
            }
        });

        fillText('↙' + limit.min.toFixed(2), [0, 0], {
            props: {
                fillStyle: '#000',
                textAlign: 'left',
                textBaseline: 'bottom',
                font: '12px sans-serif'
            }
        });
        fillText(end.offset.toFixed(2), lastPoint, {
            props: {
                fillStyle: '#f60',
                textAlign: 'right',
                textBaseline: 'bottom',
                font: '16px sans-serif'
            }
        });
    };

    function drawTangentLine() {
        var coord = tangentPoint.coord,
            coordPre = tangentPointPre.coord;

        var k = (coord[1] - coordPre[1]) / (coord[0] - coordPre[0]) || 0;
        var b = coord[1] - k * coord[0];

        drawLine([0, b], [size.width, k * size.width + b], {
            props: {
                lineWidth: 1,
                strokeStyle: '#f00'
            }
        });

        fillText('v: ' + k.toFixed(2), [size.width, 0], {
            props: {
                fillStyle: '#f00',
                textAlign: 'right',
                textBaseline: 'bottom',
                font: 'bold 12px sans-serif'
            }
        });
    };

    function drawHover() {
        if (!tangentPoint) return;

        drawTangentLine();

        var coord = tangentPoint.coord,
            point = tangentPoint.point;

        var coordStyle = {
            dashed: [8, 4],
            props: {
                lineWidth: 1,
                strokeStyle: 'rgb(64, 165, 255)'
            }
        };

        drawLine([0, coord[1]], [size.width, coord[1]], coordStyle);
        drawLine([coord[0], 0], [coord[0], size.height], coordStyle);

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
            props: {
                fillStyle: '#000',
                textAlign: 'left',
                textBaseline: 'bottom',
                font: 'bold 12px sans-serif'
            }
        });
    };

    function render() {
        if (!shouldUpdate) return requestAnimationFrame(render);

        ctx.save();
        ctx.clearRect(0, 0, size.width, size.height);

        drawMain();
        drawHover();

        if (hoverLocked) {
            fillText('LOCKED', [10, size.height], {
                props: {
                    fillStyle: '#f00',
                    textAlign: 'left',
                    textBaseline: 'top',
                    font: 'bold 14px sans-serif'
                }
            });
        }

        ctx.restore();

        shouldUpdate = false;

        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    var lastTime = Date.now(),
        lastOffset = 0,
        reduceAmount = 0;

    scrollbar.addListener(function() {
        var current = Date.now(),
            offset = scrollbar.offset.y,
            duration = current - lastTime;

        if (!duration || offset === lastOffset) return;

        if (duration > 50) {
            reduceAmount += (duration - 1);
        }

        lastTime = current;
        lastOffset = offset;

        records.push({
            time: current - reduceAmount,
            reduce: reduceAmount,
            offset: offset
        });

        shouldUpdate = true;
    });

    function getPointer(e) {
        return e.touches ? e.touches[e.touches.length - 1] : e;
    };

    function addEvent(elems, evts, handler) {
        evts.split(/\s+/).forEach(function(name) {
            [].concat(elems).forEach(function(el) {
                el.addEventListener(name, function() {
                    handler.apply(this, [].slice.call(arguments));
                    shouldUpdate = true;
                });
            });
        });
    };

    // range
    var input = document.getElementById('duration');
    var label = document.querySelector('label');
    input.max = TIME_RANGE_MAX / 1e3;
    input.min = 1;
    input.value = timeRange / 1e3;
    label.textContent = input.value + 's';

    addEvent(input, 'input', function(e) {
        var val = parseFloat(e.target.value);
        label.textContent = val + 's';
        timeRange = val * 1e3;
        endOffset = 0;
    });

    addEvent(document.getElementById('reset'), 'click', function() {
        records.length = endOffset = reduceAmount = 0;
        hoverLocked = false;
        hoverPointerX = undefined;
        tangentPoint = null;
        tangentPointPre = null;
        sliceRecord();
    });

    // hover
    addEvent(canvas, 'mousemove touchmove', function(e) {
        if (hoverLocked || pointerDownOnTrack) return;

        var pointer = getPointer(e);

        hoverPointerX = pointer.clientX - canvas.getBoundingClientRect().left;
    });

    function resetHover() {
        hoverPointerX = 0;
        tangentPoint = null;
        tangentPointPre = null;
    };

    addEvent([canvas, window], 'mouseleave touchend', function() {
        if (hoverLocked) return;
        resetHover();
    });

    addEvent(canvas, 'click', function() {
        hoverLocked = !hoverLocked;

        if (!hoverLocked) resetHover();
    });

    // track
    addEvent(thumb, 'mousedown touchstart', function(e) {
        var pointer = getPointer(e);
        pointerDownOnTrack = pointer.clientX;
    });

    addEvent(window, 'mousemove touchmove', function(e) {
        if (!pointerDownOnTrack) return;

        var pointer = getPointer(e);
        var moved = (pointer.clientX - pointerDownOnTrack) / size.width;

        pointerDownOnTrack = pointer.clientX;
        endOffset = Math.min(1 - thumbWidth, Math.max(0, endOffset - moved));
    });

    addEvent(window, 'mouseup touchend blur', function(e) {
        pointerDownOnTrack = undefined;
    });

    addEvent(thumb, 'click touchstart', function(e) {
        e.stopPropagation();
    });

    addEvent(track, 'click touchstart', function(e) {
        var pointer = getPointer(e);
        var rect = track.getBoundingClientRect();
        var offset = (pointer.clientX - rect.left) / rect.width;
        endOffset = Math.min(1 - thumbWidth, Math.max(0, 1 - (offset + thumbWidth / 2)));
    });
})();