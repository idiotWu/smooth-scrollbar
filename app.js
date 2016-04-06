/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(1);
	
	__webpack_require__(142);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Object$keys = __webpack_require__(2)['default'];
	
	var _interopRequireDefault = __webpack_require__(14)['default'];
	
	var _src = __webpack_require__(15);
	
	var _src2 = _interopRequireDefault(_src);
	
	var DPR = window.devicePixelRatio;
	var TIME_RANGE_MAX = 20 * 1e3;
	
	var content = document.getElementById('content');
	var thumb = document.getElementById('thumb');
	var track = document.getElementById('track');
	var canvas = document.getElementById('chart');
	var ctx = canvas.getContext('2d');
	
	var div = document.createElement('div');
	div.innerHTML = Array(101).join('<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita eaque debitis, dolorem doloribus, voluptatibus minima illo est, atque aliquid ipsum necessitatibus cumque veritatis beatae, ratione repudiandae quos! Omnis hic, animi.</p>');
	
	content.appendChild(div);
	
	_src2['default'].initAll();
	
	var scrollbar = _src2['default'].get(content);
	
	var chartType = 'offset';
	
	var thumbWidth = 0;
	var endOffset = 0;
	
	var timeRange = 5 * 1e3;
	
	var records = [];
	var size = {
	    width: 300,
	    height: 200
	};
	
	var shouldUpdate = true;
	
	var tangentPoint = null;
	var tangentPointPre = null;
	
	var hoverLocked = false;
	var hoverPointerX = undefined;
	var pointerDownOnTrack = undefined;
	var hoverPrecision = 'ontouchstart' in document ? 5 : 1;
	
	canvas.width = size.width * DPR;
	canvas.height = size.height * DPR;
	ctx.scale(DPR, DPR);
	
	function notation() {
	    var num = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	    if (!num || Math.abs(num) > Math.pow(10, -2)) return num.toFixed(2);
	
	    var exp = -3;
	
	    while (!(num / Math.pow(10, exp))) {
	        if (exp < -10) {
	            return num > 0 ? 'Infinity' : '-Infinity';
	        }
	
	        exp--;
	    }
	
	    return (num * Math.pow(10, -exp)).toFixed(2) + 'e' + exp;
	};
	
	function addEvent(elems, evts, handler) {
	    evts.split(/\s+/).forEach(function (name) {
	        [].concat(elems).forEach(function (el) {
	            el.addEventListener(name, function () {
	                handler.apply(undefined, arguments);
	                shouldUpdate = true;
	            });
	        });
	    });
	};
	
	function sliceRecord() {
	    var endIdx = Math.floor(records.length * (1 - endOffset));
	    var last = records[records.length - 1];
	    var dropIdx = 0;
	
	    var result = records.filter(function (pt, idx) {
	        if (last.time - pt.time > TIME_RANGE_MAX) {
	            dropIdx++;
	            endIdx--;
	            return;
	        }
	
	        var end = records[endIdx - 1];
	
	        return end.time - pt.time <= timeRange && idx <= endIdx;
	    });
	
	    records.splice(0, dropIdx);
	    thumbWidth = result.length ? result.length / records.length : 1;
	
	    thumb.style.width = thumbWidth * 100 + '%';
	    thumb.style.right = endOffset * 100 + '%';
	
	    return result;
	};
	
	function getLimit(points) {
	    return points.reduce(function (pre, cur) {
	        var val = cur[chartType];
	        return {
	            max: Math.max(pre.max, val),
	            min: Math.min(pre.min, val)
	        };
	    }, { max: -Infinity, min: Infinity });
	};
	
	function assignProps(props) {
	    if (!props) return;
	
	    _Object$keys(props).forEach(function (name) {
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
	    ctx.restore();
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
	    var totalY = limit.max - limit.min || 1;
	
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
	
	    var lastPoint = points.reduce(function (pre, cur, idx) {
	        var time = cur.time,
	            value = cur[chartType];
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
	
	    fillText('↙' + notation(limit.min), [0, 0], {
	        props: {
	            fillStyle: '#000',
	            textAlign: 'left',
	            textBaseline: 'bottom',
	            font: '12px sans-serif'
	        }
	    });
	    fillText(notation(end[chartType]), lastPoint, {
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
	
	    var realK = (tangentPoint.point[chartType] - tangentPointPre.point[chartType]) / (tangentPoint.point.time - tangentPointPre.point.time);
	
	    fillText('dy/dx: ' + notation(realK), [size.width / 2, 0], {
	        props: {
	            fillStyle: '#f00',
	            textAlign: 'center',
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
	
	    var pointInfo = ['(', date.getMinutes(), ':', date.getSeconds(), '.', date.getMilliseconds(), ', ', notation(point[chartType]), ')'].join('');
	
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
	
	    fillText(chartType.toUpperCase(), [0, size.height], {
	        props: {
	            fillStyle: '#f00',
	            textAlign: 'left',
	            textBaseline: 'top',
	            font: 'bold 14px sans-serif'
	        }
	    });
	
	    drawMain();
	    drawHover();
	
	    if (hoverLocked) {
	        fillText('LOCKED', [size.width, size.height], {
	            props: {
	                fillStyle: '#f00',
	                textAlign: 'right',
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
	
	scrollbar.addListener(function () {
	    var current = Date.now(),
	        offset = scrollbar.offset.y,
	        duration = current - lastTime;
	
	    if (!duration || offset === lastOffset) return;
	
	    if (duration > 50) {
	        reduceAmount += duration - 1;
	        duration -= duration - 1;
	    }
	
	    var velocity = (offset - lastOffset) / duration;
	    lastTime = current;
	    lastOffset = offset;
	
	    records.push({
	        time: current - reduceAmount,
	        reduce: reduceAmount,
	        offset: offset,
	        speed: Math.abs(velocity)
	    });
	
	    shouldUpdate = true;
	});
	
	function getPointer(e) {
	    return e.touches ? e.touches[e.touches.length - 1] : e;
	};
	
	// range
	var input = document.getElementById('duration');
	var label = document.getElementById('duration-value');
	input.max = TIME_RANGE_MAX / 1e3;
	input.min = 1;
	input.value = timeRange / 1e3;
	label.textContent = input.value + 's';
	
	addEvent(input, 'input', function (e) {
	    var start = records[0];
	    var end = records[records.length - 1];
	    var val = parseFloat(e.target.value);
	    label.textContent = val + 's';
	    timeRange = val * 1e3;
	
	    if (end) {
	        endOffset = Math.min(endOffset, Math.max(0, 1 - timeRange / (end.time - start.time)));
	    }
	});
	
	addEvent(document.getElementById('reset'), 'click', function () {
	    records.length = endOffset = reduceAmount = 0;
	    hoverLocked = false;
	    hoverPointerX = undefined;
	    tangentPoint = null;
	    tangentPointPre = null;
	    sliceRecord();
	});
	
	// hover
	addEvent(canvas, 'mousemove touchmove', function (e) {
	    if (hoverLocked || pointerDownOnTrack) return;
	
	    var pointer = getPointer(e);
	
	    hoverPointerX = pointer.clientX - canvas.getBoundingClientRect().left;
	});
	
	function resetHover() {
	    hoverPointerX = 0;
	    tangentPoint = null;
	    tangentPointPre = null;
	};
	
	addEvent([canvas, window], 'mouseleave touchend', function () {
	    if (hoverLocked) return;
	    resetHover();
	});
	
	addEvent(canvas, 'click', function () {
	    hoverLocked = !hoverLocked;
	
	    if (!hoverLocked) resetHover();
	});
	
	// track
	addEvent(thumb, 'mousedown touchstart', function (e) {
	    var pointer = getPointer(e);
	    pointerDownOnTrack = pointer.clientX;
	});
	
	addEvent(window, 'mousemove touchmove', function (e) {
	    if (!pointerDownOnTrack) return;
	
	    var pointer = getPointer(e);
	    var moved = (pointer.clientX - pointerDownOnTrack) / size.width;
	
	    pointerDownOnTrack = pointer.clientX;
	    endOffset = Math.min(1 - thumbWidth, Math.max(0, endOffset - moved));
	});
	
	addEvent(window, 'mouseup touchend blur', function (e) {
	    pointerDownOnTrack = undefined;
	});
	
	addEvent(thumb, 'click touchstart', function (e) {
	    e.stopPropagation();
	});
	
	addEvent(track, 'click touchstart', function (e) {
	    var pointer = getPointer(e);
	    var rect = track.getBoundingClientRect();
	    var offset = (pointer.clientX - rect.left) / rect.width;
	    endOffset = Math.min(1 - thumbWidth, Math.max(0, 1 - (offset + thumbWidth / 2)));
	});
	
	// switch chart
	addEvent([].slice.call(document.querySelectorAll('.chart-type')), 'change', function (_ref) {
	    var target = _ref.target;
	
	    if (target.checked) {
	        chartType = target.value;
	    }
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	module.exports = __webpack_require__(10).Object.keys;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(5);
	
	__webpack_require__(7)('keys', function($keys){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(6);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(8)
	  , core    = __webpack_require__(10)
	  , fails   = __webpack_require__(13);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(9)
	  , core      = __webpack_require__(10)
	  , ctx       = __webpack_require__(11)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$export.F = 1;  // forced
	$export.G = 2;  // global
	$export.S = 4;  // static
	$export.P = 8;  // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	module.exports = $export;

/***/ },
/* 9 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 10 */
/***/ function(module, exports) {

	var core = module.exports = {version: '1.2.6'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(12);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	exports.__esModule = true;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _shared = __webpack_require__(53);
	
	__webpack_require__(99);
	
	__webpack_require__(115);
	
	__webpack_require__(119);
	
	__webpack_require__(131);
	
	exports['default'] = _smooth_scrollbar.SmoothScrollbar;
	
	_smooth_scrollbar.SmoothScrollbar.version = '4.2.2';
	
	/**
	 * init scrollbar on given element
	 *
	 * @param {Element} elem: target element
	 * @param {Object} options: scrollbar options
	 *
	 * @return {Scrollbar} scrollbar instance
	 */
	_smooth_scrollbar.SmoothScrollbar.init = function (elem, options) {
	    if (!elem || elem.nodeType !== 1) {
	        throw new TypeError('expect element to be DOM Element, but got ' + typeof elem);
	    }
	
	    if (_shared.sbList.has(elem)) return _shared.sbList.get(elem);
	
	    elem.setAttribute('data-scrollbar', '');
	
	    var children = [].concat(_toConsumableArray(elem.children));
	
	    var div = document.createElement('div');
	
	    div.innerHTML = '\n        <article class="scroll-content"></article>\n        <aside class="scrollbar-track scrollbar-track-x">\n            <div class="scrollbar-thumb scrollbar-thumb-x"></div>\n        </aside>\n        <aside class="scrollbar-track scrollbar-track-y">\n            <div class="scrollbar-thumb scrollbar-thumb-y"></div>\n        </aside>\n    ';
	
	    var scrollContent = div.querySelector('.scroll-content');
	
	    [].concat(_toConsumableArray(div.children)).forEach(function (el) {
	        return elem.appendChild(el);
	    });
	
	    children.forEach(function (el) {
	        return scrollContent.appendChild(el);
	    });
	
	    return new _smooth_scrollbar.SmoothScrollbar(elem, options);
	};
	
	/**
	 * init scrollbars on pre-defined selectors
	 *
	 * @param {Object} options: scrollbar options
	 *
	 * @return {Array} a collection of scrollbar instances
	 */
	_smooth_scrollbar.SmoothScrollbar.initAll = function (options) {
	    return [].concat(_toConsumableArray(document.querySelectorAll(_shared.selectors))).map(function (el) {
	        return _smooth_scrollbar.SmoothScrollbar.init(el, options);
	    });
	};
	
	/**
	 * check if scrollbar exists on given element
	 *
	 * @return {Boolean}
	 */
	_smooth_scrollbar.SmoothScrollbar.has = function (elem) {
	    return _shared.sbList.has(elem);
	};
	
	/**
	 * get scrollbar instance through given element
	 *
	 * @param {Element} elem: target scrollbar container
	 *
	 * @return {Scrollbar}
	 */
	_smooth_scrollbar.SmoothScrollbar.get = function (elem) {
	    return _shared.sbList.get(elem);
	};
	
	/**
	 * get all scrollbar instances
	 *
	 * @return {Array} a collection of scrollbars
	 */
	_smooth_scrollbar.SmoothScrollbar.getAll = function () {
	    return [].concat(_toConsumableArray(_shared.sbList.values()));
	};
	
	/**
	 * destroy scrollbar on given element
	 *
	 * @param {Element} elem: target scrollbar container
	 */
	_smooth_scrollbar.SmoothScrollbar.destroy = function (elem) {
	    return _smooth_scrollbar.SmoothScrollbar.has(elem) && _smooth_scrollbar.SmoothScrollbar.get(elem).destroy();
	};
	
	/**
	 * destroy all scrollbars in scrollbar instances
	 */
	_smooth_scrollbar.SmoothScrollbar.destroyAll = function () {
	    _shared.sbList.forEach(function (sb) {
	        sb.destroy();
	    });
	};
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Array$from = __webpack_require__(17)["default"];
	
	exports["default"] = function (arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
	
	    return arr2;
	  } else {
	    return _Array$from(arr);
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(18), __esModule: true };

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(19);
	__webpack_require__(36);
	module.exports = __webpack_require__(10).Array.from;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(20)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(22)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(21)
	  , defined   = __webpack_require__(6);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(23)
	  , $export        = __webpack_require__(8)
	  , redefine       = __webpack_require__(24)
	  , hide           = __webpack_require__(25)
	  , has            = __webpack_require__(29)
	  , Iterators      = __webpack_require__(30)
	  , $iterCreate    = __webpack_require__(31)
	  , setToStringTag = __webpack_require__(32)
	  , getProto       = __webpack_require__(26).getProto
	  , ITERATOR       = __webpack_require__(33)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';
	
	var returnThis = function(){ return this; };
	
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , methods, key;
	  // Fix native
	  if($native){
	    var IteratorPrototype = getProto($default.call(new Base));
	    // Set @@toStringTag to native iterators
	    setToStringTag(IteratorPrototype, TAG, true);
	    // FF fix
	    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    // fix Array#{values, @@iterator}.name in V8 / FF
	    if(DEF_VALUES && $native.name !== VALUES){
	      VALUES_BUG = true;
	      $default = function values(){ return $native.call(this); };
	    }
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES  ? $default : getMethod(VALUES),
	      keys:    IS_SET      ? $default : getMethod(KEYS),
	      entries: !DEF_VALUES ? $default : getMethod('entries')
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(25);

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(26)
	  , createDesc = __webpack_require__(27);
	module.exports = __webpack_require__(28) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(13)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 29 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(26)
	  , descriptor     = __webpack_require__(27)
	  , setToStringTag = __webpack_require__(32)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(25)(IteratorPrototype, __webpack_require__(33)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(26).setDesc
	  , has = __webpack_require__(29)
	  , TAG = __webpack_require__(33)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(34)('wks')
	  , uid    = __webpack_require__(35)
	  , Symbol = __webpack_require__(9).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(9)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx         = __webpack_require__(11)
	  , $export     = __webpack_require__(8)
	  , toObject    = __webpack_require__(5)
	  , call        = __webpack_require__(37)
	  , isArrayIter = __webpack_require__(40)
	  , toLength    = __webpack_require__(41)
	  , getIterFn   = __webpack_require__(42);
	$export($export.S + $export.F * !__webpack_require__(45)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , $$      = arguments
	      , $$len   = $$.length
	      , mapfn   = $$len > 1 ? $$[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        result[index] = mapping ? mapfn(O[index], index) : O[index];
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(38);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(39);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(30)
	  , ITERATOR   = __webpack_require__(33)('iterator')
	  , ArrayProto = Array.prototype;
	
	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(21)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(43)
	  , ITERATOR  = __webpack_require__(33)('iterator')
	  , Iterators = __webpack_require__(30);
	module.exports = __webpack_require__(10).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(44)
	  , TAG = __webpack_require__(33)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';
	
	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 44 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(33)('iterator')
	  , SAFE_CLOSING = false;
	
	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }
	
	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ safe = true; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Class} SmoothScrollbar
	 */
	
	'use strict';
	
	var _classCallCheck = __webpack_require__(47)['default'];
	
	var _Object$freeze = __webpack_require__(48)['default'];
	
	var _Object$defineProperties = __webpack_require__(51)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _shared = __webpack_require__(53);
	
	var _utils = __webpack_require__(85);
	
	/**
	 * @constructor
	 * Create scrollbar instance
	 *
	 * @param {Element} container: target element
	 * @param {Object} [options]: options
	 */
	
	var SmoothScrollbar = function SmoothScrollbar(container) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    _classCallCheck(this, SmoothScrollbar);
	
	    _shared.sbList.set(container, this);
	
	    // make container focusable
	    container.setAttribute('tabindex', '1');
	
	    // reset scroll position
	    container.scrollTop = container.scrollLeft = 0;
	
	    (0, _utils.setStyle)(container, {
	        overflow: 'hidden',
	        outline: 'none'
	    });
	
	    var trackX = (0, _utils.findChild)(container, 'scrollbar-track-x');
	    var trackY = (0, _utils.findChild)(container, 'scrollbar-track-y');
	
	    // readonly properties
	    this.__readonly('targets', _Object$freeze({
	        container: container,
	        content: (0, _utils.findChild)(container, 'scroll-content'),
	        xAxis: _Object$freeze({
	            track: trackX,
	            thumb: (0, _utils.findChild)(trackX, 'scrollbar-thumb-x')
	        }),
	        yAxis: _Object$freeze({
	            track: trackY,
	            thumb: (0, _utils.findChild)(trackY, 'scrollbar-thumb-y')
	        })
	    })).__readonly('offset', {
	        x: 0,
	        y: 0
	    }).__readonly('limit', {
	        x: Infinity,
	        y: Infinity
	    }).__readonly('movement', {
	        x: 0,
	        y: 0
	    }).__readonly('size', this.getSize());
	
	    // non-enmurable properties
	    _Object$defineProperties(this, {
	        __updateThrottle: {
	            value: (0, _utils.debounce)(this.update.bind(this))
	        },
	        __listeners: {
	            value: []
	        },
	        __handlers: {
	            value: []
	        },
	        __children: {
	            value: []
	        },
	        __timerID: {
	            value: {}
	        }
	    });
	
	    // accessors
	    _Object$defineProperties(this, {
	        scrollTop: {
	            get: function get() {
	                return this.offset.y;
	            }
	        },
	        scrollLeft: {
	            get: function get() {
	                return this.offset.x;
	            }
	        }
	    });
	
	    this.__initOptions(options);
	    this.__initScrollbar();
	};
	
	exports.SmoothScrollbar = SmoothScrollbar;

/***/ },
/* 47 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(49), __esModule: true };

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(50);
	module.exports = __webpack_require__(10).Object.freeze;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(39);
	
	__webpack_require__(7)('freeze', function($freeze){
	  return function freeze(it){
	    return $freeze && isObject(it) ? $freeze(it) : it;
	  };
	});

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(52), __esModule: true };

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	module.exports = function defineProperties(T, D){
	  return $.setDescs(T, D);
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _sb_list = __webpack_require__(67);
	
	_defaults(exports, _interopExportWildcard(_sb_list, _defaults));
	
	var _selectors = __webpack_require__(84);
	
	_defaults(exports, _interopExportWildcard(_selectors, _defaults));

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$getOwnPropertyNames = __webpack_require__(55)["default"];
	
	var _Object$getOwnPropertyDescriptor = __webpack_require__(61)["default"];
	
	var _Object$defineProperty = __webpack_require__(64)["default"];
	
	exports["default"] = function (obj, defaults) {
	  var keys = _Object$getOwnPropertyNames(defaults);
	
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	
	    var value = _Object$getOwnPropertyDescriptor(defaults, key);
	
	    if (value && value.configurable && obj[key] === undefined) {
	      _Object$defineProperty(obj, key, value);
	    }
	  }
	
	  return obj;
	};
	
	exports.__esModule = true;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(56), __esModule: true };

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	__webpack_require__(57);
	module.exports = function getOwnPropertyNames(it){
	  return $.getNames(it);
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 Object.getOwnPropertyNames(O)
	__webpack_require__(7)('getOwnPropertyNames', function(){
	  return __webpack_require__(58).get;
	});

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(59)
	  , getNames  = __webpack_require__(26).getNames
	  , toString  = {}.toString;
	
	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};
	
	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames(toIObject(it));
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(60)
	  , defined = __webpack_require__(6);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(44);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(62), __esModule: true };

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	__webpack_require__(63);
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $.getDesc(it, key);
	};

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject = __webpack_require__(59);
	
	__webpack_require__(7)('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(65), __esModule: true };

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 66 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj, defaults) {
	  var newObj = defaults({}, obj);
	  delete newObj["default"];
	  return newObj;
	};
	
	exports.__esModule = true;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Map} sbList
	 */
	
	"use strict";
	
	var _Map = __webpack_require__(68)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var sbList = new _Map();
	
	var originSet = sbList.set.bind(sbList);
	
	sbList.update = function () {
	    sbList.forEach(function (sb) {
	        requestAnimationFrame(function () {
	            sb.__updateChildren();
	        });
	    });
	};
	
	// patch #set with #update method
	sbList.set = function () {
	    var res = originSet.apply(undefined, arguments);
	    sbList.update();
	
	    return res;
	};
	
	exports.sbList = sbList;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(69), __esModule: true };

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(70);
	__webpack_require__(19);
	__webpack_require__(71);
	__webpack_require__(75);
	__webpack_require__(82);
	module.exports = __webpack_require__(10).Map;

/***/ },
/* 70 */
/***/ function(module, exports) {



/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(72);
	var Iterators = __webpack_require__(30);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(73)
	  , step             = __webpack_require__(74)
	  , Iterators        = __webpack_require__(30)
	  , toIObject        = __webpack_require__(59);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(22)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 74 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(76);
	
	// 23.1 Map Objects
	__webpack_require__(81)('Map', function(get){
	  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $            = __webpack_require__(26)
	  , hide         = __webpack_require__(25)
	  , redefineAll  = __webpack_require__(77)
	  , ctx          = __webpack_require__(11)
	  , strictNew    = __webpack_require__(78)
	  , defined      = __webpack_require__(6)
	  , forOf        = __webpack_require__(79)
	  , $iterDefine  = __webpack_require__(22)
	  , step         = __webpack_require__(74)
	  , ID           = __webpack_require__(35)('id')
	  , $has         = __webpack_require__(29)
	  , isObject     = __webpack_require__(39)
	  , setSpecies   = __webpack_require__(80)
	  , DESCRIPTORS  = __webpack_require__(28)
	  , isExtensible = Object.isExtensible || isObject
	  , SIZE         = DESCRIPTORS ? '_s' : 'size'
	  , id           = 0;
	
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!$has(it, ID)){
	    // can't set id to frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add id
	    if(!create)return 'E';
	    // add missing object id
	    hide(it, ID, ++id);
	  // return object id with prefix
	  } return 'O' + it[ID];
	};
	
	var getEntry = function(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index !== 'F')return that._i[index];
	  // frozen object case
	  for(entry = that._f; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	};
	
	module.exports = {
	  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
	    var C = wrapper(function(that, iterable){
	      strictNew(that, C, NAME);
	      that._i = $.create(null); // index
	      that._f = undefined;      // first entry
	      that._l = undefined;      // last entry
	      that[SIZE] = 0;           // size
	      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear(){
	        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that._f == entry)that._f = next;
	          if(that._l == entry)that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /*, that = undefined */){
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
	          , entry;
	        while(entry = entry ? entry.n : this._f){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if(DESCRIPTORS)$.setDesc(C.prototype, 'size', {
	      get: function(){
	        return defined(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that._f)that._f = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index !== 'F')that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function(C, NAME, IS_MAP){
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function(iterated, kind){
	      this._t = iterated;  // target
	      this._k = kind;      // kind
	      this._l = undefined; // previous
	    }, function(){
	      var that  = this
	        , kind  = that._k
	        , entry = that._l;
	      // revert to the last existing entry
	      while(entry && entry.r)entry = entry.p;
	      // get next entry
	      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if(kind == 'keys'  )return step(0, entry.k);
	      if(kind == 'values')return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);
	
	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var redefine = __webpack_require__(24);
	module.exports = function(target, src){
	  for(var key in src)redefine(target, key, src[key]);
	  return target;
	};

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(11)
	  , call        = __webpack_require__(37)
	  , isArrayIter = __webpack_require__(40)
	  , anObject    = __webpack_require__(38)
	  , toLength    = __webpack_require__(41)
	  , getIterFn   = __webpack_require__(42);
	module.exports = function(iterable, entries, fn, that){
	  var iterFn = getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    call(iterator, f, step.value, entries);
	  }
	};

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var core        = __webpack_require__(10)
	  , $           = __webpack_require__(26)
	  , DESCRIPTORS = __webpack_require__(28)
	  , SPECIES     = __webpack_require__(33)('species');
	
	module.exports = function(KEY){
	  var C = core[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(26)
	  , global         = __webpack_require__(9)
	  , $export        = __webpack_require__(8)
	  , fails          = __webpack_require__(13)
	  , hide           = __webpack_require__(25)
	  , redefineAll    = __webpack_require__(77)
	  , forOf          = __webpack_require__(79)
	  , strictNew      = __webpack_require__(78)
	  , isObject       = __webpack_require__(39)
	  , setToStringTag = __webpack_require__(32)
	  , DESCRIPTORS    = __webpack_require__(28);
	
	module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
	  var Base  = global[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
	    new C().entries().next();
	  }))){
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	  } else {
	    C = wrapper(function(target, iterable){
	      strictNew(target, C, NAME);
	      target._c = new Base;
	      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
	    });
	    $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','),function(KEY){
	      var IS_ADDER = KEY == 'add' || KEY == 'set';
	      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
	        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
	        var result = this._c[KEY](a === 0 ? 0 : a, b);
	        return IS_ADDER ? this : result;
	      });
	    });
	    if('size' in proto)$.setDesc(C.prototype, 'size', {
	      get: function(){
	        return this._c.size;
	      }
	    });
	  }
	
	  setToStringTag(C, NAME);
	
	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F, O);
	
	  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);
	
	  return C;
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(8);
	
	$export($export.P, 'Map', {toJSON: __webpack_require__(83)('Map')});

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var forOf   = __webpack_require__(79)
	  , classof = __webpack_require__(43);
	module.exports = function(NAME){
	  return function toJSON(){
	    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
	    var arr = [];
	    forOf(this, false, arr.push, arr);
	    return arr;
	  };
	};

/***/ },
/* 84 */
/***/ function(module, exports) {

	/**
	 * @module
	 * @export {String} selectors
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var selectors = 'scrollbar, [scrollbar], [data-scrollbar]';
	exports.selectors = selectors;

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _debounce = __webpack_require__(86);
	
	_defaults(exports, _interopExportWildcard(_debounce, _defaults));
	
	var _set_style = __webpack_require__(87);
	
	_defaults(exports, _interopExportWildcard(_set_style, _defaults));
	
	var _get_delta = __webpack_require__(88);
	
	_defaults(exports, _interopExportWildcard(_get_delta, _defaults));
	
	var _find_child = __webpack_require__(90);
	
	_defaults(exports, _interopExportWildcard(_find_child, _defaults));
	
	var _build_curve = __webpack_require__(94);
	
	_defaults(exports, _interopExportWildcard(_build_curve, _defaults));
	
	var _get_touch_id = __webpack_require__(95);
	
	_defaults(exports, _interopExportWildcard(_get_touch_id, _defaults));
	
	var _get_position = __webpack_require__(97);
	
	_defaults(exports, _interopExportWildcard(_get_position, _defaults));
	
	var _pick_in_range = __webpack_require__(98);
	
	_defaults(exports, _interopExportWildcard(_pick_in_range, _defaults));
	
	var _get_pointer_data = __webpack_require__(96);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_data, _defaults));
	
	var _get_original_event = __webpack_require__(89);
	
	_defaults(exports, _interopExportWildcard(_get_original_event, _defaults));

/***/ },
/* 86 */
/***/ function(module, exports) {

	/**
	 * @module
	 * @export {Function} debounce
	 */
	
	// debounce timers reset wait
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	var RESET_WAIT = 100;
	
	/**
	 * Call fn if it isn't be called in a period
	 *
	 * @param {Function} fn
	 * @param {Number} [wait]: debounce wait, default is REST_WAIT
	 * @param {Boolean} [immediate]: whether to run task at leading, default is true
	 *
	 * @return {Function}
	 */
	var debounce = function debounce(fn) {
	    var wait = arguments.length <= 1 || arguments[1] === undefined ? RESET_WAIT : arguments[1];
	    var immediate = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
	
	    if (typeof fn !== 'function') return;
	
	    var timer = undefined;
	
	    return function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }
	
	        if (!timer && immediate) {
	            setTimeout(function () {
	                return fn.apply(undefined, args);
	            });
	        }
	
	        clearTimeout(timer);
	
	        timer = setTimeout(function () {
	            timer = undefined;
	            fn.apply(undefined, args);
	        }, wait);
	    };
	};
	exports.debounce = debounce;

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Function} setStyle
	 */
	
	'use strict';
	
	var _Object$keys = __webpack_require__(2)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	var VENDOR_PREFIX = ['webkit', 'moz', 'ms', 'o'];
	
	var RE = new RegExp('^-(?!(?:' + VENDOR_PREFIX.join('|') + ')-)');
	
	var autoPrefix = function autoPrefix(styles) {
	    var res = {};
	
	    _Object$keys(styles).forEach(function (prop) {
	        if (!RE.test(prop)) {
	            res[prop] = styles[prop];
	            return;
	        }
	
	        var val = styles[prop];
	
	        prop = prop.replace(/^-/, '');
	        res[prop] = val;
	
	        VENDOR_PREFIX.forEach(function (prefix) {
	            res['-' + prefix + '-' + prop] = val;
	        });
	    });
	
	    return res;
	};
	
	/**
	 * set css style for target element
	 *
	 * @param {Element} elem: target element
	 * @param {Object} styles: css styles to apply
	 */
	var setStyle = function setStyle(elem, styles) {
	    styles = autoPrefix(styles);
	
	    _Object$keys(styles).forEach(function (prop) {
	        var cssProp = prop.replace(/^-/, '').replace(/-([a-z])/g, function (m, $1) {
	            return $1.toUpperCase();
	        });
	        elem.style[cssProp] = styles[prop];
	    });
	};
	exports.setStyle = setStyle;

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Function} getDelta
	 * @dependencies [ getOriginalEvent ]
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _get_original_event = __webpack_require__(89);
	
	var DELTA_SCALE = {
	    STANDARD: 1,
	    OTHERS: -3
	};
	
	var DELTA_MODE = [1.0, 28.0, 500.0];
	
	var getDeltaMode = function getDeltaMode(mode) {
	    return DELTA_MODE[mode] || DELTA_MODE[0];
	};
	
	/**
	 * Normalizing wheel delta
	 *
	 * @param {Object} evt: event object
	 */
	var getDelta = function getDelta(evt) {
	    // get original DOM event
	    evt = (0, _get_original_event.getOriginalEvent)(evt);
	
	    if ('deltaX' in evt) {
	        var mode = getDeltaMode(evt.deltaMode);
	
	        return {
	            x: evt.deltaX / DELTA_SCALE.STANDARD * mode,
	            y: evt.deltaY / DELTA_SCALE.STANDARD * mode
	        };
	    }
	
	    if ('wheelDeltaX' in evt) {
	        return {
	            x: evt.wheelDeltaX / DELTA_SCALE.OTHERS,
	            y: evt.wheelDeltaY / DELTA_SCALE.OTHERS
	        };
	    }
	
	    // ie with touchpad
	    return {
	        x: 0,
	        y: evt.wheelDelta / DELTA_SCALE.OTHERS
	    };
	};
	exports.getDelta = getDelta;

/***/ },
/* 89 */
/***/ function(module, exports) {

	/**
	 * @module
	 * @export {Function} getOriginalEvent
	 */
	
	/**
	 * Get original DOM event
	 *
	 * @param {Object} evt: event object
	 *
	 * @return {EventObject}
	 */
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var getOriginalEvent = function getOriginalEvent(evt) {
	  return evt.originalEvent || evt;
	};
	exports.getOriginalEvent = getOriginalEvent;

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Function} findChild
	 */
	
	/**
	 * Find element with specific class name within children
	 *
	 * @param {Element} parentElem
	 * @param {String} className
	 *
	 * @return {Element}: first matched child
	 */
	"use strict";
	
	var _getIterator = __webpack_require__(91)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var findChild = function findChild(parentElem, className) {
	  var children = parentElem.children;
	
	  if (!children) return null;
	
	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;
	
	  try {
	    for (var _iterator = _getIterator(children), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var elem = _step.value;
	
	      if (elem.className.match(className)) return elem;
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator["return"]) {
	        _iterator["return"]();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }
	
	  return null;
	};
	exports.findChild = findChild;

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(92), __esModule: true };

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(71);
	__webpack_require__(19);
	module.exports = __webpack_require__(93);

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(38)
	  , get      = __webpack_require__(42);
	module.exports = __webpack_require__(10).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ },
/* 94 */
/***/ function(module, exports) {

	/**
	 * @module
	 * @export {Function} buildCurve
	 */
	
	/**
	 * Build quadratic easing curve
	 *
	 * @param {Number} begin
	 * @param {Number} duration
	 *
	 * @return {Array}: points
	 */
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var buildCurve = function buildCurve(distance, duration) {
	  var res = [];
	
	  if (duration <= 0) return res;
	
	  var t = Math.round(duration / 1000 * 60);
	  var a = -distance / Math.pow(t, 2);
	  var b = -2 * a * t;
	
	  for (var i = 0; i < t; i++) {
	    res.push(a * Math.pow(i, 2) + b * i);
	  }
	
	  return res;
	};
	exports.buildCurve = buildCurve;

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Function} getTouchID
	 * @dependencies [ getOriginalEvent, getPointerData ]
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _get_original_event = __webpack_require__(89);
	
	var _get_pointer_data = __webpack_require__(96);
	
	/**
	 * Get touch identifier
	 *
	 * @param {Object} evt: event object
	 *
	 * @return {Number}: touch id
	 */
	var getTouchID = function getTouchID(evt) {
	  evt = (0, _get_original_event.getOriginalEvent)(evt);
	
	  var data = (0, _get_pointer_data.getPointerData)(evt);
	
	  return data.identifier;
	};
	exports.getTouchID = getTouchID;

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Function} getPointerData
	 * @dependencies [ getOriginalEvent ]
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _get_original_event = __webpack_require__(89);
	
	/**
	 * Get pointer/touch data
	 * @param {Object} evt: event object
	 */
	var getPointerData = function getPointerData(evt) {
	  // if is touch event, return last item in touchList
	  // else return original event
	  evt = (0, _get_original_event.getOriginalEvent)(evt);
	
	  return evt.touches ? evt.touches[evt.touches.length - 1] : evt;
	};
	exports.getPointerData = getPointerData;

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Function} getPosition
	 * @dependencies [ getOriginalEvent, getPointerData ]
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _get_original_event = __webpack_require__(89);
	
	var _get_pointer_data = __webpack_require__(96);
	
	/**
	 * Get pointer/finger position
	 * @param {Object} evt: event object
	 *
	 * @return {Object}: position{x, y}
	 */
	var getPosition = function getPosition(evt) {
	  evt = (0, _get_original_event.getOriginalEvent)(evt);
	
	  var data = (0, _get_pointer_data.getPointerData)(evt);
	
	  return {
	    x: data.clientX,
	    y: data.clientY
	  };
	};
	exports.getPosition = getPosition;

/***/ },
/* 98 */
/***/ function(module, exports) {

	/**
	 * @module
	 * @export {Function} pickInRange
	 */
	
	/**
	 * Pick value in range [min, max]
	 * @param {Number} value
	 * @param {Number} [min]
	 * @param {Number} [max]
	 *
	 * @return {Number}
	 */
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var pickInRange = function pickInRange(value) {
	  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var max = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	  return Math.max(min, Math.min(value, max));
	};
	exports.pickInRange = pickInRange;

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _update = __webpack_require__(100);
	
	_defaults(exports, _interopExportWildcard(_update, _defaults));
	
	var _destroy = __webpack_require__(101);
	
	_defaults(exports, _interopExportWildcard(_destroy, _defaults));
	
	var _get_size = __webpack_require__(102);
	
	_defaults(exports, _interopExportWildcard(_get_size, _defaults));
	
	var _listener = __webpack_require__(103);
	
	_defaults(exports, _interopExportWildcard(_listener, _defaults));
	
	var _scroll_to = __webpack_require__(104);
	
	_defaults(exports, _interopExportWildcard(_scroll_to, _defaults));
	
	var _set_options = __webpack_require__(105);
	
	_defaults(exports, _interopExportWildcard(_set_options, _defaults));
	
	var _set_position = __webpack_require__(110);
	
	_defaults(exports, _interopExportWildcard(_set_position, _defaults));
	
	var _toggle_track = __webpack_require__(112);
	
	_defaults(exports, _interopExportWildcard(_toggle_track, _defaults));
	
	var _infinite_scroll = __webpack_require__(113);
	
	_defaults(exports, _interopExportWildcard(_infinite_scroll, _defaults));
	
	var _get_content_elem = __webpack_require__(114);
	
	_defaults(exports, _interopExportWildcard(_get_content_elem, _defaults));

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} update
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Update scrollbars appearance
	 *
	 * @param {Boolean} async: update asynchronous
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.update = function () {
	    var _this = this;
	
	    var async = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
	
	    var update = function update() {
	        _this.__updateBounding();
	
	        var size = _this.getSize();
	
	        _this.__readonly('size', size);
	
	        var newLimit = {
	            x: size.content.width - size.container.width,
	            y: size.content.height - size.container.height
	        };
	
	        if (_this.limit && newLimit.x === _this.limit.x && newLimit.y === _this.limit.y) return;
	
	        _this.__readonly('limit', newLimit);
	
	        var _targets = _this.targets;
	        var xAxis = _targets.xAxis;
	        var yAxis = _targets.yAxis;
	
	        // hide scrollbar if content size less than container
	        (0, _utilsIndex.setStyle)(xAxis.track, {
	            'display': size.content.width <= size.container.width ? 'none' : 'block'
	        });
	        (0, _utilsIndex.setStyle)(yAxis.track, {
	            'display': size.content.height <= size.container.height ? 'none' : 'block'
	        });
	
	        // use percentage value for thumb
	        (0, _utilsIndex.setStyle)(xAxis.thumb, {
	            'width': (0, _utilsIndex.pickInRange)(size.container.width / size.content.width, 0, 1) * 100 + '%'
	        });
	        (0, _utilsIndex.setStyle)(yAxis.thumb, {
	            'height': (0, _utilsIndex.pickInRange)(size.container.height / size.content.height, 0, 1) * 100 + '%'
	        });
	
	        // re-positioning
	        var offset = _this.offset;
	        var limit = _this.limit;
	
	        _this.setPosition(Math.min(offset.x, limit.x), Math.min(offset.y, limit.y));
	        _this.__setThumbPosition();
	    };
	
	    if (async) {
	        requestAnimationFrame(update);
	    } else {
	        update();
	    }
	};

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} destroy
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utils = __webpack_require__(85);
	
	var _shared = __webpack_require__(53);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Remove all scrollbar listeners and event handlers
	 * Reset
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.destroy = function () {
	    var _this = this;
	
	    var __listeners = this.__listeners;
	    var __handlers = this.__handlers;
	    var targets = this.targets;
	    var container = targets.container;
	    var content = targets.content;
	
	    __handlers.forEach(function (_ref) {
	        var evt = _ref.evt;
	        var elem = _ref.elem;
	        var handler = _ref.handler;
	
	        elem.removeEventListener(evt, handler);
	    });
	
	    this.scrollTo(0, 0, 300, function () {
	        cancelAnimationFrame(_this.__timerID.scrollAnimation);
	        __handlers.length = __listeners.length = 0;
	
	        // reset scroll position
	        (0, _utils.setStyle)(container, {
	            overflow: ''
	        });
	
	        container.scrollTop = container.scrollLeft = 0;
	
	        // reset content
	        var children = [].concat(_toConsumableArray(content.children));
	
	        container.innerHTML = '';
	
	        children.forEach(function (el) {
	            return container.appendChild(el);
	        });
	
	        // remove form sbList
	        _shared.sbList['delete'](container);
	    });
	};

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} getSize
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Get container and content size
	 *
	 * @return {Object}: an object contains container and content's width and height
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.getSize = function () {
	    var container = this.targets.container;
	    var content = this.targets.content;
	
	    return {
	        container: {
	            // requires `overflow: hidden`
	            width: container.clientWidth,
	            height: container.clientHeight
	        },
	        content: {
	            // border width should be included
	            width: content.offsetWidth,
	            height: content.offsetHeight
	        }
	    };
	};

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} addListener
	 *            {Function} removeListener
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Add scrolling listener
	 *
	 * @param {Function} cb: listener
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.addListener = function (cb) {
	  if (typeof cb !== 'function') return;
	
	  this.__listeners.push(cb);
	};
	
	/**
	 * @method
	 * @api
	 * Remove specific listener from all listeners
	 * @param {type} param: description
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.removeListener = function (cb) {
	  if (typeof cb !== 'function') return;
	
	  this.__listeners.some(function (fn, idx, all) {
	    return fn === cb && all.splice(idx, 1);
	  });
	};

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} scrollTo
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Scrolling scrollbar to position with transition
	 *
	 * @param {Number} [x]: scrollbar position in x axis
	 * @param {Number} [y]: scrollbar position in y axis
	 * @param {Number} [duration]: transition duration
	 * @param {Function} [cb]: callback
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.scrollTo = function () {
	    var x = arguments.length <= 0 || arguments[0] === undefined ? this.offset.x : arguments[0];
	    var y = arguments.length <= 1 || arguments[1] === undefined ? this.offset.y : arguments[1];
	
	    var _this = this;
	
	    var duration = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
	    var cb = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
	    var options = this.options;
	    var offset = this.offset;
	    var limit = this.limit;
	    var velocity = this.velocity;
	    var __timerID = this.__timerID;
	
	    cancelAnimationFrame(__timerID.scrollTo);
	    cb = typeof cb === 'function' ? cb : function () {};
	
	    var startX = offset.x;
	    var startY = offset.y;
	
	    var disX = (0, _utilsIndex.pickInRange)(x, 0, limit.x) - startX;
	    var disY = (0, _utilsIndex.pickInRange)(y, 0, limit.y) - startY;
	
	    var curveX = (0, _utilsIndex.buildCurve)(disX, duration);
	    var curveY = (0, _utilsIndex.buildCurve)(disY, duration);
	
	    var frame = 0,
	        totalFrame = curveX.length;
	
	    var scroll = function scroll() {
	        if (frame === totalFrame) {
	            _this.setPosition(x, y);
	
	            return requestAnimationFrame(function () {
	                cb(_this);
	            });
	        }
	
	        _this.setPosition(startX + curveX[frame], startY + curveY[frame]);
	
	        frame++;
	
	        __timerID.scrollTo = requestAnimationFrame(scroll);
	    };
	
	    scroll();
	};

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} setOptions
	 */
	
	'use strict';
	
	var _Object$assign = __webpack_require__(106)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _utils = __webpack_require__(85);
	
	var _shared = __webpack_require__(53);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Set scrollbar options
	 *
	 * @param {Object} options
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.setOptions = function () {
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	  _Object$assign(this.options, options);
	};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(107), __esModule: true };

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(108);
	module.exports = __webpack_require__(10).Object.assign;

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(8);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(109)});

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.1 Object.assign(target, source, ...)
	var $        = __webpack_require__(26)
	  , toObject = __webpack_require__(5)
	  , IObject  = __webpack_require__(60);
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = __webpack_require__(13)(function(){
	  var a = Object.assign
	    , A = {}
	    , B = {}
	    , S = Symbol()
	    , K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function(k){ B[k] = k; });
	  return a({}, A)[S] != 7 || Object.keys(a({}, B)).join('') != K;
	}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
	  var T     = toObject(target)
	    , $$    = arguments
	    , $$len = $$.length
	    , index = 1
	    , getKeys    = $.getKeys
	    , getSymbols = $.getSymbols
	    , isEnum     = $.isEnum;
	  while($$len > index){
	    var S      = IObject($$[index++])
	      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
	      , length = keys.length
	      , j      = 0
	      , key;
	    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
	  }
	  return T;
	} : Object.assign;

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} setPosition
	 */
	
	'use strict';
	
	var _extends = __webpack_require__(111)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Set scrollbar position without transition
	 *
	 * @param {Number} [x]: scrollbar position in x axis
	 * @param {Number} [y]: scrollbar position in y axis
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.setPosition = function () {
	    var x = arguments.length <= 0 || arguments[0] === undefined ? this.offset.x : arguments[0];
	    var y = arguments.length <= 1 || arguments[1] === undefined ? this.offset.y : arguments[1];
	
	    this.__updateThrottle();
	
	    var status = {};
	    var offset = this.offset;
	    var limit = this.limit;
	    var targets = this.targets;
	    var __listeners = this.__listeners;
	
	    if (Math.abs(x - offset.x) > 1) this.showTrack('x');
	    if (Math.abs(y - offset.y) > 1) this.showTrack('y');
	
	    x = (0, _utilsIndex.pickInRange)(x, 0, limit.x);
	    y = (0, _utilsIndex.pickInRange)(y, 0, limit.y);
	
	    this.hideTrack();
	
	    if (x === offset.x && y === offset.y) return;
	
	    status.direction = {
	        x: x === offset.x ? 'none' : x > offset.x ? 'right' : 'left',
	        y: y === offset.y ? 'none' : y > offset.y ? 'down' : 'up'
	    };
	
	    status.limit = _extends({}, limit);
	
	    offset.x = x;
	    offset.y = y;
	    status.offset = _extends({}, offset);
	
	    // reset thumb position after offset update
	    this.__setThumbPosition();
	
	    (0, _utilsIndex.setStyle)(targets.content, {
	        '-transform': 'translate3d(' + -x + 'px, ' + -y + 'px, 0)'
	    });
	
	    // invoke all listeners
	    __listeners.forEach(function (fn) {
	        requestAnimationFrame(function () {
	            fn(status);
	        });
	    });
	};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$assign = __webpack_require__(106)["default"];
	
	exports["default"] = _Object$assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];
	
	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }
	
	  return target;
	};
	
	exports.__esModule = true;

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} showTrack
	 * @prototype {Function} hideTrack
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * show scrollbar track on given direction
	 *
	 * @param {String} direction: which direction of tracks to show, default is 'both'
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.showTrack = function () {
	    var direction = arguments.length <= 0 || arguments[0] === undefined ? 'both' : arguments[0];
	    var _targets = this.targets;
	    var container = _targets.container;
	    var xAxis = _targets.xAxis;
	    var yAxis = _targets.yAxis;
	
	    direction = direction.toLowerCase();
	    container.classList.add('scrolling');
	
	    if (direction === 'both') {
	        xAxis.track.classList.add('show');
	        yAxis.track.classList.add('show');
	    }
	
	    if (direction === 'x') {
	        xAxis.track.classList.add('show');
	    }
	
	    if (direction === 'y') {
	        yAxis.track.classList.add('show');
	    }
	};
	
	/**
	 * @method
	 * @api
	 * hide track with 300ms debounce
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.hideTrack = function () {
	    var targets = this.targets;
	    var __timerID = this.__timerID;
	    var container = targets.container;
	    var xAxis = targets.xAxis;
	    var yAxis = targets.yAxis;
	
	    clearTimeout(__timerID.track);
	
	    __timerID.track = setTimeout(function () {
	        container.classList.remove('scrolling');
	        xAxis.track.classList.remove('show');
	        yAxis.track.classList.remove('show');
	    }, 300);
	};

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} infiniteScroll
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Create infinite scroll listener
	 *
	 * @param {Function} cb: infinite scroll action
	 * @param {Number} [threshold]: infinite scroll threshold(to bottom), default is 50(px)
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.infiniteScroll = function (cb) {
	    var threshold = arguments.length <= 1 || arguments[1] === undefined ? 50 : arguments[1];
	
	    if (typeof cb !== 'function') return;
	
	    var lastOffset = {
	        x: 0,
	        y: 0
	    };
	
	    var entered = false;
	
	    this.addListener(function (status) {
	        var offset = status.offset;
	        var limit = status.limit;
	
	        if (limit.y - offset.y <= threshold && offset.y > lastOffset.y && !entered) {
	            entered = true;
	            setTimeout(function () {
	                return cb(status);
	            });
	        }
	
	        if (limit.y - offset.y > threshold) {
	            entered = false;
	        }
	
	        lastOffset = offset;
	    });
	};

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} getContentElem
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @api
	 * Get scroll content element
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.getContentElem = function () {
	  return this.targets.content;
	};

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _render = __webpack_require__(116);
	
	_defaults(exports, _interopExportWildcard(_render, _defaults));
	
	var _add_movement = __webpack_require__(117);
	
	_defaults(exports, _interopExportWildcard(_add_movement, _defaults));
	
	var _set_movement = __webpack_require__(118);
	
	_defaults(exports, _interopExportWildcard(_set_movement, _defaults));

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __render
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function nextTick(options, current, movement) {
	    var fricton = options.fricton;
	
	    if (Math.abs(movement) < 1) {
	        var next = current + movement;
	
	        return {
	            movement: 0,
	            position: current > next ? Math.ceil(next) : Math.floor(next)
	        };
	    }
	
	    var q = 1 - fricton / 100;
	
	    return {
	        movement: movement * q,
	        position: current + movement * (1 - q)
	    };
	};
	
	function __render() {
	    var options = this.options;
	    var offset = this.offset;
	    var movement = this.movement;
	    var __timerID = this.__timerID;
	
	    if (movement.x || movement.y) {
	        var nextX = nextTick(options, offset.x, movement.x);
	        var nextY = nextTick(options, offset.y, movement.y);
	
	        movement.x = nextX.movement;
	        movement.y = nextY.movement;
	
	        this.setPosition(nextX.position, nextY.position);
	    }
	
	    __timerID.scrollAnimation = requestAnimationFrame(__render.bind(this));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__render', {
	    value: __render,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __addMovement
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utils = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __addMovement() {
	    var deltaX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	    var deltaY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var options = this.options;
	    var movement = this.movement;
	
	    this.__updateThrottle();
	
	    var limit = this.__getDeltaLimit();
	
	    movement.x = _utils.pickInRange.apply(undefined, [movement.x + deltaX * options.speed].concat(_toConsumableArray(limit.x)));
	    movement.y = _utils.pickInRange.apply(undefined, [movement.y + deltaY * options.speed].concat(_toConsumableArray(limit.y)));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__addMovement', {
	    value: __addMovement,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __setMovement
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utils = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __setMovement() {
	    var deltaX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	    var deltaY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var options = this.options;
	    var movement = this.movement;
	
	    this.__updateThrottle();
	
	    var limit = this.__getDeltaLimit();
	
	    movement.x = _utils.pickInRange.apply(undefined, [deltaX * options.speed].concat(_toConsumableArray(limit.x)));
	    movement.y = _utils.pickInRange.apply(undefined, [deltaY * options.speed].concat(_toConsumableArray(limit.y)));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__setMovement', {
	    value: __setMovement,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _drag = __webpack_require__(120);
	
	_defaults(exports, _interopExportWildcard(_drag, _defaults));
	
	var _touch = __webpack_require__(121);
	
	_defaults(exports, _interopExportWildcard(_touch, _defaults));
	
	var _mouse = __webpack_require__(122);
	
	_defaults(exports, _interopExportWildcard(_mouse, _defaults));
	
	var _wheel = __webpack_require__(123);
	
	_defaults(exports, _interopExportWildcard(_wheel, _defaults));
	
	var _resize = __webpack_require__(124);
	
	_defaults(exports, _interopExportWildcard(_resize, _defaults));
	
	var _select = __webpack_require__(125);
	
	_defaults(exports, _interopExportWildcard(_select, _defaults));
	
	var _keyboard = __webpack_require__(126);
	
	_defaults(exports, _interopExportWildcard(_keyboard, _defaults));

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __dragHandler
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	var __dragHandler = function __dragHandler() {
	    var _this = this;
	
	    var _targets = this.targets;
	    var container = _targets.container;
	    var content = _targets.content;
	
	    var isDrag = false;
	    var animation = undefined;
	    var targetHeight = undefined;
	
	    Object.defineProperty(this, '__isDrag', {
	        get: function get() {
	            return isDrag;
	        },
	        enumerable: false
	    });
	
	    var scroll = function scroll(_ref) {
	        var x = _ref.x;
	        var y = _ref.y;
	
	        if (!x && !y) return;
	
	        _this.__setMovement(x, y);
	
	        animation = requestAnimationFrame(function () {
	            scroll({ x: x, y: y });
	        });
	    };
	
	    this.__addEvent(document, 'dragover mousemove touchmove', function (evt) {
	        if (!isDrag || _this.__ignoreEvent(evt)) return;
	        cancelAnimationFrame(animation);
	        evt.preventDefault();
	
	        var dir = _this.__getPointerTrend(evt, targetHeight);
	
	        scroll(dir);
	    });
	
	    this.__addEvent(container, 'dragstart', function (evt) {
	        if (_this.__ignoreEvent(evt)) return;
	
	        (0, _utilsIndex.setStyle)(content, {
	            'pointer-events': 'auto'
	        });
	
	        targetHeight = evt.target.clientHeight;
	        cancelAnimationFrame(animation);
	        _this.__updateBounding();
	        isDrag = true;
	    });
	    this.__addEvent(document, 'dragend mouseup touchend blur', function (evt) {
	        if (_this.__ignoreEvent(evt)) return;
	        cancelAnimationFrame(animation);
	        isDrag = false;
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__dragHandler', {
	    value: __dragHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __touchHandler
	 */
	
	'use strict';
	
	var _Object$keys = __webpack_require__(2)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	var EASING_DURATION = navigator.userAgent.match(/android/i) ? 1500 : 750;
	
	/**
	 * @method
	 * @internal
	 * Touch event handlers builder
	 */
	var __touchHandler = function __touchHandler() {
	    var _this = this;
	
	    var container = this.targets.container;
	
	    var lastTouchTime = undefined,
	        lastTouchID = undefined;
	    var moveVelocity = {},
	        lastTouchPos = {},
	        touchRecords = {};
	
	    var updateRecords = function updateRecords(evt) {
	        var touchList = (0, _utilsIndex.getOriginalEvent)(evt).touches;
	
	        _Object$keys(touchList).forEach(function (key) {
	            // record all touches that will be restored
	            if (key === 'length') return;
	
	            var touch = touchList[key];
	
	            touchRecords[touch.identifier] = (0, _utilsIndex.getPosition)(touch);
	        });
	    };
	
	    this.__addEvent(container, 'touchstart', function (evt) {
	        if (_this.__isDrag) return;
	
	        var movement = _this.movement;
	
	        updateRecords(evt);
	
	        lastTouchTime = Date.now();
	        lastTouchID = (0, _utilsIndex.getTouchID)(evt);
	        lastTouchPos = (0, _utilsIndex.getPosition)(evt);
	
	        // stop scrolling
	        movement.x = movement.y = 0;
	        moveVelocity.x = moveVelocity.y = 0;
	    });
	
	    this.__addEvent(container, 'touchmove', function (evt) {
	        if (_this.__ignoreEvent(evt) || _this.__isDrag) return;
	
	        updateRecords(evt);
	
	        var touchID = (0, _utilsIndex.getTouchID)(evt);
	        var offset = _this.offset;
	        var limit = _this.limit;
	
	        if (lastTouchID === undefined) {
	            // reset last touch info from records
	            lastTouchID = touchID;
	
	            // don't need error handler
	            lastTouchTime = Date.now();
	            lastTouchPos = touchRecords[touchID];
	        } else if (touchID !== lastTouchID) {
	            // prevent multi-touch bouncing
	            return;
	        }
	
	        if (!lastTouchPos) return;
	
	        evt.preventDefault();
	
	        var duration = Date.now() - lastTouchTime;
	        var _lastTouchPos = lastTouchPos;
	        var lastX = _lastTouchPos.x;
	        var lastY = _lastTouchPos.y;
	
	        var _lastTouchPos2 = lastTouchPos = (0, _utilsIndex.getPosition)(evt);
	
	        var curX = _lastTouchPos2.x;
	        var curY = _lastTouchPos2.y;
	
	        duration = duration || 1; // fix Infinity error
	
	        moveVelocity.x = (lastX - curX) / duration;
	        moveVelocity.y = (lastY - curY) / duration;
	
	        var destX = (0, _utilsIndex.pickInRange)(lastX - curX + offset.x, 0, limit.x);
	        var destY = (0, _utilsIndex.pickInRange)(lastY - curY + offset.y, 0, limit.y);
	
	        _this.setPosition(destX, destY);
	    });
	
	    this.__addEvent(container, 'touchend', function (evt) {
	        if (_this.__ignoreEvent(evt) || _this.__isDrag) return;
	
	        // release current touch
	        delete touchRecords[lastTouchID];
	        lastTouchID = undefined;
	
	        var x = moveVelocity.x;
	        var y = moveVelocity.y;
	
	        _this.__setMovement(x ? x / Math.abs(x) * Math.sqrt(Math.abs(x) * 1e3) * 20 : 0, y ? y / Math.abs(y) * Math.sqrt(Math.abs(y) * 1e3) * 20 : 0);
	
	        moveVelocity.x = moveVelocity.y = 0;
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__touchHandler', {
	    value: __touchHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __mouseHandler
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @internal
	 * Mouse event handlers builder
	 *
	 * @param {Object} option
	 */
	var __mouseHandler = function __mouseHandler() {
	    var _this = this;
	
	    var container = this.targets.container;
	
	    var isMouseDown = undefined,
	        isMouseMove = undefined,
	        startOffsetToThumb = undefined,
	        startTrackDirection = undefined,
	        containerRect = undefined;
	
	    var getTrackDir = function getTrackDir(className) {
	        var matches = className.match(/scrollbar\-(?:track|thumb)\-([xy])/);
	
	        return matches && matches[1];
	    };
	
	    this.__addEvent(container, 'click', function (evt) {
	        if (isMouseMove || !/scrollbar-track/.test(evt.target.className) || _this.__ignoreEvent(evt)) return;
	
	        var track = evt.target;
	        var direction = getTrackDir(track.className);
	        var rect = track.getBoundingClientRect();
	        var clickPos = (0, _utilsIndex.getPosition)(evt);
	
	        var size = _this.size;
	        var offset = _this.offset;
	
	        if (direction === 'x') {
	            var thumbSize = (0, _utilsIndex.pickInRange)(size.container.width / size.content.width, 0, 1);
	            var clickOffset = (clickPos.x - rect.left) / size.container.width;
	
	            _this.movement.x = (clickOffset - thumbSize / 2) * size.content.width - offset.x;
	        } else {
	            var thumbSize = (0, _utilsIndex.pickInRange)(size.container.height / size.content.height, 0, 1);
	            var clickOffset = (clickPos.y - rect.top) / size.container.height;
	
	            _this.movement.y = (clickOffset - thumbSize / 2) * size.content.height - offset.y;
	        }
	    });
	
	    this.__addEvent(container, 'mousedown', function (evt) {
	        if (!/scrollbar-thumb/.test(evt.target.className) || _this.__ignoreEvent(evt)) return;
	        isMouseDown = true;
	
	        var cursorPos = (0, _utilsIndex.getPosition)(evt);
	        var thumbRect = evt.target.getBoundingClientRect();
	
	        startTrackDirection = getTrackDir(evt.target.className);
	
	        // pointer offset to thumb
	        startOffsetToThumb = {
	            x: cursorPos.x - thumbRect.left,
	            y: cursorPos.y - thumbRect.top
	        };
	
	        // container bounding rectangle
	        containerRect = _this.targets.container.getBoundingClientRect();
	    });
	
	    this.__addEvent(window, 'mousemove', function (evt) {
	        if (!isMouseDown) return;
	
	        isMouseMove = true;
	        evt.preventDefault();
	
	        var size = _this.size;
	        var offset = _this.offset;
	
	        var cursorPos = (0, _utilsIndex.getPosition)(evt);
	
	        if (startTrackDirection === 'x') {
	            // get percentage of pointer position in track
	            // then tranform to px
	            _this.setPosition((cursorPos.x - startOffsetToThumb.x - containerRect.left) / (containerRect.right - containerRect.left) * size.content.width, offset.y);
	
	            return;
	        }
	
	        // don't need easing
	        _this.setPosition(offset.x, (cursorPos.y - startOffsetToThumb.y - containerRect.top) / (containerRect.bottom - containerRect.top) * size.content.height);
	    });
	
	    // release mousemove spy on window lost focus
	    this.__addEvent(window, 'mouseup blur', function () {
	        isMouseDown = isMouseMove = false;
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__mouseHandler', {
	    value: __mouseHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __wheelHandler
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	// is standard `wheel` event supported check
	var WHEEL_EVENT = 'onwheel' in window ? 'wheel' : 'mousewheel';
	
	/**
	 * @method
	 * @internal
	 * Wheel event handler builder
	 *
	 * @param {Object} option
	 *
	 * @return {Function}: event handler
	 */
	var __wheelHandler = function __wheelHandler() {
	    var _this = this;
	
	    var container = this.targets.container;
	
	    this.__addEvent(container, WHEEL_EVENT, function (evt) {
	        if (_this.__ignoreEvent(evt)) return;
	
	        evt.preventDefault();
	        evt.stopPropagation();
	
	        var offset = _this.offset;
	        var limit = _this.limit;
	
	        var delta = (0, _utilsIndex.getDelta)(evt);
	
	        _this.__addMovement(delta.x, delta.y);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__wheelHandler', {
	    value: __wheelHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __resizeHandler
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @internal
	 * Wheel event handler builder
	 *
	 * @param {Object} option
	 *
	 * @return {Function}: event handler
	 */
	var __resizeHandler = function __resizeHandler() {
	  this.__addEvent(window, 'resize', this.__updateThrottle);
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__resizeHandler', {
	  value: __resizeHandler,
	  writable: true,
	  configurable: true
	});

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __selectHandler
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	// todo: select handler for touch screen
	var __selectHandler = function __selectHandler() {
	    var _this = this;
	
	    var isSelected = false;
	    var animation = undefined;
	
	    var _targets = this.targets;
	    var container = _targets.container;
	    var content = _targets.content;
	
	    var scroll = function scroll(_ref) {
	        var x = _ref.x;
	        var y = _ref.y;
	
	        if (!x && !y) return;
	
	        _this.__setMovement(x, y);
	
	        animation = requestAnimationFrame(function () {
	            scroll({ x: x, y: y });
	        });
	    };
	
	    var setSelect = function setSelect() {
	        var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	
	        (0, _utilsIndex.setStyle)(container, {
	            '-user-select': value
	        });
	    };
	
	    this.__addEvent(window, 'mousemove', function (evt) {
	        if (!isSelected) return;
	
	        cancelAnimationFrame(animation);
	
	        var dir = _this.__getPointerTrend(evt);
	
	        scroll(dir);
	    });
	
	    this.__addEvent(content, 'selectstart', function (evt) {
	        if (_this.__ignoreEvent(evt)) {
	            return setSelect('none');
	        }
	
	        cancelAnimationFrame(animation);
	
	        _this.__updateBounding();
	        isSelected = true;
	    });
	
	    this.__addEvent(window, 'mouseup blur', function () {
	        cancelAnimationFrame(animation);
	        setSelect();
	
	        isSelected = false;
	    });
	
	    // temp patch for touch devices
	    this.__addEvent(container, 'scroll', function (evt) {
	        evt.preventDefault();
	        container.scrollTop = container.scrollLeft = 0;
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__selectHandler', {
	    value: __selectHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __keyboardHandler
	 */
	
	'use strict';
	
	var _slicedToArray = __webpack_require__(127)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	// key maps [deltaX, deltaY]
	var KEYMAPS = {
	    32: [0, 5], // space
	    37: [-1, 0], // left
	    38: [0, -1], // up
	    39: [1, 0], // right
	    40: [0, 1] // down
	};
	
	/**
	 * @method
	 * @internal
	 * Keypress event handler builder
	 *
	 * @param {Object} option
	 */
	var __keyboardHandler = function __keyboardHandler() {
	    var _this = this;
	
	    var container = this.targets.container;
	
	    var isFocused = false;
	
	    this.__addEvent(container, 'focus', function () {
	        isFocused = true;
	    });
	
	    this.__addEvent(container, 'blur', function () {
	        isFocused = false;
	    });
	
	    this.__addEvent(container, 'keydown', function (evt) {
	        if (!isFocused || _this.__ignoreEvent(evt)) return;
	
	        evt = (0, _utilsIndex.getOriginalEvent)(evt);
	
	        var keyCode = evt.keyCode || evt.which;
	
	        if (!KEYMAPS.hasOwnProperty(keyCode)) return;
	
	        evt.preventDefault();
	
	        var speed = _this.options.speed;
	
	        var _KEYMAPS$keyCode = _slicedToArray(KEYMAPS[keyCode], 2);
	
	        var x = _KEYMAPS$keyCode[0];
	        var y = _KEYMAPS$keyCode[1];
	
	        _this.__addMovement(x * 40, y * 40);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__keyboardHandler', {
	    value: __keyboardHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _getIterator = __webpack_require__(91)["default"];
	
	var _isIterable = __webpack_require__(128)["default"];
	
	exports["default"] = (function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;
	
	    try {
	      for (var _i = _getIterator(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);
	
	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }
	
	    return _arr;
	  }
	
	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if (_isIterable(Object(arr))) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	})();
	
	exports.__esModule = true;

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(129), __esModule: true };

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(71);
	__webpack_require__(19);
	module.exports = __webpack_require__(130);

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(43)
	  , ITERATOR  = __webpack_require__(33)('iterator')
	  , Iterators = __webpack_require__(30);
	module.exports = __webpack_require__(10).isIterable = function(it){
	  var O = Object(it);
	  return O[ITERATOR] !== undefined
	    || '@@iterator' in O
	    || Iterators.hasOwnProperty(classof(O));
	};

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _readonly = __webpack_require__(132);
	
	_defaults(exports, _interopExportWildcard(_readonly, _defaults));
	
	var _add_event = __webpack_require__(133);
	
	_defaults(exports, _interopExportWildcard(_add_event, _defaults));
	
	var _init_options = __webpack_require__(134);
	
	_defaults(exports, _interopExportWildcard(_init_options, _defaults));
	
	var _ignore_event = __webpack_require__(135);
	
	_defaults(exports, _interopExportWildcard(_ignore_event, _defaults));
	
	var _init_scrollbar = __webpack_require__(136);
	
	_defaults(exports, _interopExportWildcard(_init_scrollbar, _defaults));
	
	var _get_delta_limit = __webpack_require__(137);
	
	_defaults(exports, _interopExportWildcard(_get_delta_limit, _defaults));
	
	var _update_children = __webpack_require__(138);
	
	_defaults(exports, _interopExportWildcard(_update_children, _defaults));
	
	var _update_bounding = __webpack_require__(139);
	
	_defaults(exports, _interopExportWildcard(_update_bounding, _defaults));
	
	var _get_pointer_trend = __webpack_require__(140);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_trend, _defaults));
	
	var _set_thumb_position = __webpack_require__(141);
	
	_defaults(exports, _interopExportWildcard(_set_thumb_position, _defaults));

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __readonly
	 * @dependencies [ SmoothScrollbar ]
	 */
	
	'use strict';
	
	var _Object$defineProperty = __webpack_require__(64)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @internal
	 * create readonly property
	 *
	 * @param {String} prop
	 * @param {Any} value
	 */
	function __readonly(prop, value) {
	    return _Object$defineProperty(this, prop, {
	        value: value,
	        enumerable: true,
	        configurable: true
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__readonly', {
	    value: __readonly,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __addEvent
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __addEvent(elem, events, fn) {
	    var _this = this;
	
	    if (!elem || typeof elem.addEventListener !== 'function') {
	        throw new TypeError('expect elem to be a DOM element, but got ' + elem);
	    }
	
	    events.split(/\s+/g).forEach(function (evt) {
	        _this.__handlers.push({ evt: evt, elem: elem, fn: fn });
	
	        elem.addEventListener(evt, fn);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__addEvent', {
	    value: __addEvent,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __initOptions
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$defineProperties = __webpack_require__(51)['default'];
	
	var _Object$assign = __webpack_require__(106)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utils = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __initOptions() {
	    var opt = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    var options = {
	        speed: 1, // scroll speed scale
	        fricton: 10, // fricton factor, percent
	        ignoreEvents: [] // events names to be ignored
	    };
	
	    var limit = {
	        fricton: [1, 99],
	        speed: [0, Infinity]
	    };
	
	    this.__readonly('options', _Object$defineProperties({}, {
	        ignoreEvents: {
	            get: function get() {
	                return options.ignoreEvents;
	            },
	            set: function set(v) {
	                if (!Array.isArray(v)) {
	                    throw new TypeError('expect `options.ignoreEvents` to be a number, but got ' + typeof v);
	                }
	
	                options.ignoreEvents = v;
	            },
	            configurable: true,
	            enumerable: true
	        },
	        speed: {
	            get: function get() {
	                return options.speed;
	            },
	            set: function set(v) {
	                if (isNaN(parseFloat(v))) {
	                    throw new TypeError('expect `options.speed` to be a number, but got ' + typeof v);
	                }
	
	                options.speed = _utils.pickInRange.apply(undefined, [v].concat(_toConsumableArray(limit.speed)));
	            },
	            configurable: true,
	            enumerable: true
	        },
	        fricton: {
	            get: function get() {
	                return options.fricton;
	            },
	            set: function set(v) {
	                if (isNaN(parseFloat(v))) {
	                    throw new TypeError('expect `options.fricton` to be a number, but got ' + typeof v);
	                }
	
	                options.fricton = _utils.pickInRange.apply(undefined, [v].concat(_toConsumableArray(limit.fricton)));
	            },
	            configurable: true,
	            enumerable: true
	        }
	    }));
	
	    _Object$assign(this.options, opt);
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__initOptions', {
	    value: __initOptions,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __ignoreEvent
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utils = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __ignoreEvent() {
	    var evt = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    var _getOriginalEvent = (0, _utils.getOriginalEvent)(evt);
	
	    var target = _getOriginalEvent.target;
	
	    return !evt.type.match(/drag/) && evt.defaultPrevented || this.options.ignoreEvents.some(function (rule) {
	        return evt.type.match(rule);
	    }) || this.children.some(function (sb) {
	        return sb.contains(target);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__ignoreEvent', {
	    value: __ignoreEvent,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __initScrollbar
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @internal
	 * initialize scrollbar
	 *
	 * This method will attach several listeners to elements
	 * and create a destroy method to remove listeners
	 *
	 * @param {Object} option: as is explained in constructor
	 */
	function __initScrollbar() {
	  this.update(); // initialize thumb position
	
	  this.__keyboardHandler();
	  this.__resizeHandler();
	  this.__selectHandler();
	  this.__mouseHandler();
	  this.__touchHandler();
	  this.__wheelHandler();
	  this.__dragHandler();
	
	  this.__render();
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__initScrollbar', {
	  value: __initScrollbar,
	  writable: true,
	  configurable: true
	});

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __getDeltaLimit
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __getDeltaLimit() {
	    var offset = this.offset;
	    var limit = this.limit;
	
	    return {
	        x: [-offset.x, limit.x - offset.x],
	        y: [-offset.y, limit.y - offset.y]
	    };
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__getDeltaLimit', {
	    value: __getDeltaLimit,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __updateChildren
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _sharedSelectors = __webpack_require__(84);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __updateChildren() {
	    this.__readonly('children', [].concat(_toConsumableArray(this.targets.content.querySelectorAll(_sharedSelectors.selectors))));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__updateChildren', {
	    value: __updateChildren,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __updateBounding
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _sharedSelectors = __webpack_require__(84);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __updateBounding() {
	    var container = this.targets.container;
	
	    var _container$getBoundingClientRect = container.getBoundingClientRect();
	
	    var top = _container$getBoundingClientRect.top;
	    var right = _container$getBoundingClientRect.right;
	    var bottom = _container$getBoundingClientRect.bottom;
	    var left = _container$getBoundingClientRect.left;
	    var innerHeight = window.innerHeight;
	    var innerWidth = window.innerWidth;
	
	    this.__readonly('bounding', {
	        top: Math.max(top, 0),
	        right: Math.min(right, innerWidth),
	        bottom: Math.min(bottom, innerHeight),
	        left: Math.max(left, 0)
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__updateBounding', {
	    value: __updateBounding,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __getPointerTrend
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utils = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __getPointerTrend(evt) {
	    var edge = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var _bounding = this.bounding;
	    var top = _bounding.top;
	    var right = _bounding.right;
	    var bottom = _bounding.bottom;
	    var left = _bounding.left;
	
	    var _getPosition = (0, _utils.getPosition)(evt);
	
	    var x = _getPosition.x;
	    var y = _getPosition.y;
	
	    var res = {
	        x: 0,
	        y: 0
	    };
	
	    if (x === 0 && y === 0) return res;
	
	    if (x > right - edge) {
	        res.x = x - right + edge;
	    } else if (x < left + edge) {
	        res.x = x - left - edge;
	    }
	
	    if (y > bottom - edge) {
	        res.y = y - bottom + edge;
	    } else if (y < top + edge) {
	        res.y = y - top - edge;
	    }
	
	    return res;
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__getPointerTrend', {
	    value: __getPointerTrend,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __setThumbPosition
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @internal
	 * Set thumb position in track
	 */
	function __setThumbPosition() {
	    var _offset = this.offset;
	    var x = _offset.x;
	    var y = _offset.y;
	    var _targets = this.targets;
	    var xAxis = _targets.xAxis;
	    var yAxis = _targets.yAxis;
	
	    var styleX = 'translate3d(' + x / this.size.content.width * this.size.container.width + 'px, 0, 0)';
	    var styleY = 'translate3d(0, ' + y / this.size.content.height * this.size.container.height + 'px, 0)';
	
	    (0, _utilsIndex.setStyle)(xAxis.thumb, {
	        '-webkit-transform': styleX,
	        'transform': styleX
	    });
	
	    (0, _utilsIndex.setStyle)(yAxis.thumb, {
	        '-webkit-transform': styleY,
	        'transform': styleY
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__setThumbPosition', {
	    value: __setThumbPosition,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = __webpack_require__(127)['default'];
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$assign = __webpack_require__(106)['default'];
	
	var _interopRequireDefault = __webpack_require__(14)['default'];
	
	var _src = __webpack_require__(15);
	
	var _src2 = _interopRequireDefault(_src);
	
	var DPR = window.devicePixelRatio;
	
	var size = {
	    width: 250,
	    height: 150
	};
	
	var canvas = document.getElementById('preview');
	var scrollbar = _src2['default'].get(document.getElementById('content'));
	var ctx = canvas.getContext('2d');
	var options = _Object$assign({}, scrollbar.options);
	
	canvas.width = size.width * DPR;
	canvas.height = size.height * DPR;
	ctx.scale(DPR, DPR);
	
	ctx.strokeStyle = '#94a6b7';
	ctx.fillStyle = '#abc';
	
	var shouldUpdate = true;
	
	function render() {
	    if (!shouldUpdate) {
	        return requestAnimationFrame(render);
	    }
	
	    var dots = calcDots();
	
	    ctx.clearRect(0, 0, size.width, size.height);
	    ctx.save();
	    ctx.transform(1, 0, 0, -1, 0, size.height);
	    ctx.beginPath();
	    ctx.moveTo(0, 0);
	
	    var scaleX = size.width / dots.length * (options.speed / 20 + 0.5);
	    dots.forEach(function (_ref) {
	        var _ref2 = _slicedToArray(_ref, 2);
	
	        var x = _ref2[0];
	        var y = _ref2[1];
	
	        ctx.lineTo(x * scaleX, y);
	    });
	
	    ctx.stroke();
	
	    var _dots = _slicedToArray(dots[dots.length - 1], 2);
	
	    var x = _dots[0];
	    var y = _dots[1];
	
	    ctx.lineTo(x * scaleX, y);
	    ctx.fill();
	    ctx.closePath();
	    ctx.restore();
	
	    shouldUpdate = false;
	
	    requestAnimationFrame(render);
	};
	
	render();
	
	function calcDots() {
	    var speed = options.speed;
	    var fricton = options.fricton;
	
	    var dots = [];
	
	    var x = 0;
	    var y = (speed / 20 + 0.5) * size.height;
	
	    while (y > 0.1) {
	        dots.push([x, y]);
	
	        y *= 1 - fricton / 100;
	        x++;
	    }
	
	    return dots;
	};
	
	[].concat(_toConsumableArray(document.querySelectorAll('.options'))).forEach(function (el) {
	    var prop = el.name;
	    var label = document.querySelector('.option-' + prop);
	
	    el.addEventListener('input', function () {
	        label.textContent = options[prop] = parseFloat(el.value);
	        scrollbar.setOptions(options);
	        shouldUpdate = true;
	    });
	});
	
	render();

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjM5YWMyOTFjYTRlMWU4ZmRiMDkiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9zY3JpcHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LXNhcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jdHguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZmFpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1yZXF1aXJlLWRlZmF1bHQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGlkZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlc2NyaXB0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGFzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVpZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2hhcmVkL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2RlZmF1bHRzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5nZXQtbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1leHBvcnQtd2lsZGNhcmQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9zYl9saXN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1zdGVwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLWFsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mb3Itb2YuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtc3BlY2llcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzIiwid2VicGFjazovLy8uL3NyYy9zaGFyZWQvc2VsZWN0b3JzLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZGVib3VuY2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL3NldF9zdHlsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X2RlbHRhLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfb3JpZ2luYWxfZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2ZpbmRfY2hpbGQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2J1aWxkX2N1cnZlLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfdG91Y2hfaWQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9wb2ludGVyX2RhdGEuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvcGlja19pbl9yYW5nZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy91cGRhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvZGVzdHJveS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfc2l6ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9saXN0ZW5lci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9zY3JvbGxfdG8uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1hc3NpZ24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X3Bvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2V4dGVuZHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvdG9nZ2xlX3RyYWNrLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2luZmluaXRlX3Njcm9sbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfY29udGVudF9lbGVtLmpzIiwid2VicGFjazovLy8uL3NyYy9yZW5kZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9yZW5kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9hZGRfbW92ZW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9zZXRfbW92ZW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL2RyYWcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy90b3VjaC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL21vdXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvd2hlZWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9yZXNpemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9rZXlib2FyZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9zbGljZWQtdG8tYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvaXMtaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3JlYWRvbmx5LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvYWRkX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaW5pdF9vcHRpb25zLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaWdub3JlX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaW5pdF9zY3JvbGxiYXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9nZXRfZGVsdGFfbGltaXQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy91cGRhdGVfY2hpbGRyZW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy91cGRhdGVfYm91bmRpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9nZXRfcG9pbnRlcl90cmVuZC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3NldF90aHVtYl9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi90ZXN0L3NjcmlwdHMvcHJldmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O3FCQ3RDTyxDQUFXOztxQkFDWCxHQUFXLEU7Ozs7Ozs7Ozs7OztnQ0NESSxFQUFZOzs7O0FBRWxDLEtBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztBQUNwQyxLQUFNLGNBQWMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDOztBQUVoQyxLQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELEtBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0MsS0FBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQyxLQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FB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QUksSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFekMsWUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQ1gsYUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVsQixVQUFDLElBQUssQ0FBQyxHQUFHLE9BQU8sR0FBRyxHQUFJLENBQUM7QUFDekIsVUFBQyxFQUFFLENBQUM7TUFDUDs7QUFFRCxZQUFPLElBQUksQ0FBQztFQUNmLENBQUM7O0FBRUYsOEJBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFFLE9BQU8sQ0FBQyxVQUFDLEVBQUUsRUFBSztBQUN2RCxTQUFNLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ3JCLFNBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLGNBQVksSUFBSSxDQUFHLENBQUM7O0FBRXhELE9BQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUMvQixjQUFLLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pELGtCQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzlCLHFCQUFZLEdBQUcsSUFBSSxDQUFDO01BQ3ZCLENBQUMsQ0FBQztFQUNOLENBQUMsQ0FBQzs7QUFFSCxPQUFNLEVBQUUsQyIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDYzOWFjMjkxY2E0ZTFlOGZkYjA5XG4gKiovIiwiaW1wb3J0ICcuL21vbml0b3InO1xuaW1wb3J0ICcuL3ByZXZpZXcnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9zY3JpcHRzL2luZGV4LmpzXG4gKiovIiwiaW1wb3J0IFNjcm9sbGJhciBmcm9tICcuLi8uLi9zcmMvJztcblxuY29uc3QgRFBSID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5jb25zdCBUSU1FX1JBTkdFX01BWCA9IDIwICogMWUzO1xuXG5jb25zdCBjb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKTtcbmNvbnN0IHRodW1iID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RodW1iJyk7XG5jb25zdCB0cmFjayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0cmFjaycpO1xuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXJ0Jyk7XG5jb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxubGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuZGl2LmlubmVySFRNTCA9IEFycmF5KDEwMSkuam9pbignPHA+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIEV4cGVkaXRhIGVhcXVlIGRlYml0aXMsIGRvbG9yZW0gZG9sb3JpYnVzLCB2b2x1cHRhdGlidXMgbWluaW1hIGlsbG8gZXN0LCBhdHF1ZSBhbGlxdWlkIGlwc3VtIG5lY2Vzc2l0YXRpYnVzIGN1bXF1ZSB2ZXJpdGF0aXMgYmVhdGFlLCByYXRpb25lIHJlcHVkaWFuZGFlIHF1b3MhIE9tbmlzIGhpYywgYW5pbWkuPC9wPicpO1xuXG5jb250ZW50LmFwcGVuZENoaWxkKGRpdik7XG5cblNjcm9sbGJhci5pbml0QWxsKCk7XG5cbmNvbnN0IHNjcm9sbGJhciA9IFNjcm9sbGJhci5nZXQoY29udGVudCk7XG5cbmxldCBjaGFydFR5cGUgPSAnb2Zmc2V0JztcblxubGV0IHRodW1iV2lkdGggPSAwO1xubGV0IGVuZE9mZnNldCA9IDA7XG5cbmxldCB0aW1lUmFuZ2UgPSA1ICogMWUzO1xuXG5sZXQgcmVjb3JkcyA9IFtdO1xubGV0IHNpemUgPSB7XG4gICAgd2lkdGg6IDMwMCxcbiAgICBoZWlnaHQ6IDIwMFxufTtcblxubGV0IHNob3VsZFVwZGF0ZSA9IHRydWU7XG5cbmxldCB0YW5nZW50UG9pbnQgPSBudWxsO1xubGV0IHRhbmdlbnRQb2ludFByZSA9IG51bGw7XG5cbmxldCBob3ZlckxvY2tlZCA9IGZhbHNlO1xubGV0IGhvdmVyUG9pbnRlclggPSB1bmRlZmluZWQ7XG5sZXQgcG9pbnRlckRvd25PblRyYWNrID0gdW5kZWZpbmVkO1xubGV0IGhvdmVyUHJlY2lzaW9uID0gJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQgPyA1IDogMTtcblxuY2FudmFzLndpZHRoID0gc2l6ZS53aWR0aCAqIERQUjtcbmNhbnZhcy5oZWlnaHQgPSBzaXplLmhlaWdodCAqIERQUjtcbmN0eC5zY2FsZShEUFIsIERQUik7XG5cbmZ1bmN0aW9uIG5vdGF0aW9uKG51bSA9IDApIHtcbiAgICBpZiAoIW51bSB8fCBNYXRoLmFicyhudW0pID4gMTAqKi0yKSByZXR1cm4gbnVtLnRvRml4ZWQoMik7XG5cbiAgICBsZXQgZXhwID0gLTM7XG5cbiAgICB3aGlsZSAoIShudW0gLyAxMCoqZXhwKSkge1xuICAgICAgICBpZiAoZXhwIDwgLTEwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVtID4gMCA/ICdJbmZpbml0eScgOiAnLUluZmluaXR5JztcbiAgICAgICAgfVxuXG4gICAgICAgIGV4cC0tO1xuICAgIH1cblxuICAgIHJldHVybiAobnVtICogMTAqKi1leHApLnRvRml4ZWQoMikgKyAnZScgKyBleHA7XG59O1xuXG5mdW5jdGlvbiBhZGRFdmVudChlbGVtcywgZXZ0cywgaGFuZGxlcikge1xuICAgIGV2dHMuc3BsaXQoL1xccysvKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIFtdLmNvbmNhdChlbGVtcykuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBzbGljZVJlY29yZCgpIHtcbiAgICBsZXQgZW5kSWR4ID0gTWF0aC5mbG9vcihyZWNvcmRzLmxlbmd0aCAqICgxIC0gZW5kT2Zmc2V0KSk7XG4gICAgbGV0IGxhc3QgPSByZWNvcmRzW3JlY29yZHMubGVuZ3RoIC0gMV07XG4gICAgbGV0IGRyb3BJZHggPSAwO1xuXG4gICAgbGV0IHJlc3VsdCA9IHJlY29yZHMuZmlsdGVyKChwdCwgaWR4KSA9PiB7XG4gICAgICAgIGlmIChsYXN0LnRpbWUgLSBwdC50aW1lID4gVElNRV9SQU5HRV9NQVgpIHtcbiAgICAgICAgICAgIGRyb3BJZHgrKztcbiAgICAgICAgICAgIGVuZElkeC0tO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVuZCA9IHJlY29yZHNbZW5kSWR4IC0gMV07XG5cbiAgICAgICAgcmV0dXJuIGVuZC50aW1lIC0gcHQudGltZSA8PSB0aW1lUmFuZ2UgJiYgaWR4IDw9IGVuZElkeDtcbiAgICB9KTtcblxuICAgIHJlY29yZHMuc3BsaWNlKDAsIGRyb3BJZHgpO1xuICAgIHRodW1iV2lkdGggPSByZXN1bHQubGVuZ3RoID8gcmVzdWx0Lmxlbmd0aCAvIHJlY29yZHMubGVuZ3RoIDogMTtcblxuICAgIHRodW1iLnN0eWxlLndpZHRoID0gdGh1bWJXaWR0aCAqIDEwMCArICclJztcbiAgICB0aHVtYi5zdHlsZS5yaWdodCA9IGVuZE9mZnNldCAqIDEwMCArICclJztcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5mdW5jdGlvbiBnZXRMaW1pdChwb2ludHMpIHtcbiAgICByZXR1cm4gcG9pbnRzLnJlZHVjZSgocHJlLCBjdXIpID0+IHtcbiAgICAgICAgbGV0IHZhbCA9IGN1cltjaGFydFR5cGVdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF4OiBNYXRoLm1heChwcmUubWF4LCB2YWwpLFxuICAgICAgICAgICAgbWluOiBNYXRoLm1pbihwcmUubWluLCB2YWwpXG4gICAgICAgIH07XG4gICAgfSwgeyBtYXg6IC1JbmZpbml0eSwgbWluOiBJbmZpbml0eSB9KTtcbn07XG5cbmZ1bmN0aW9uIGFzc2lnblByb3BzKHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcykgcmV0dXJuO1xuXG4gICAgT2JqZWN0LmtleXMocHJvcHMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgY3R4W25hbWVdID0gcHJvcHNbbmFtZV07XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBkcmF3TGluZShwMCwgcDEsIG9wdGlvbnMpIHtcbiAgICBsZXQgeDAgPSBwMFswXSxcbiAgICAgICAgeTAgPSBwMFsxXSxcbiAgICAgICAgeDEgPSBwMVswXSxcbiAgICAgICAgeTEgPSBwMVsxXTtcblxuICAgIGFzc2lnblByb3BzKG9wdGlvbnMucHJvcHMpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zZXRMaW5lRGFzaChvcHRpb25zLmRhc2hlZCA/IG9wdGlvbnMuZGFzaGVkIDogW10pO1xuICAgIGN0eC5tb3ZlVG8oeDAsIHkwKTtcbiAgICBjdHgubGluZVRvKHgxLCB5MSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xufTtcblxuZnVuY3Rpb24gYWRqdXN0VGV4dChjb250ZW50LCBwLCBvcHRpb25zKSB7XG4gICAgbGV0IHggPSBwWzBdLFxuICAgICAgICB5ID0gcFsxXTtcblxuICAgIGxldCB3aWR0aCA9IGN0eC5tZWFzdXJlVGV4dChjb250ZW50KS53aWR0aDtcblxuICAgIGlmICh4ICsgd2lkdGggPiBzaXplLndpZHRoKSB7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICAgIH0gZWxzZSBpZiAoeCAtIHdpZHRoIDwgMCkge1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBvcHRpb25zLnRleHRBbGlnbjtcbiAgICB9XG5cbiAgICBjdHguZmlsbFRleHQoY29udGVudCwgeCwgLXkpO1xufTtcblxuZnVuY3Rpb24gZmlsbFRleHQoY29udGVudCwgcCwgb3B0aW9ucykge1xuICAgIGFzc2lnblByb3BzKG9wdGlvbnMucHJvcHMpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIHNpemUuaGVpZ2h0KTtcbiAgICBhZGp1c3RUZXh0KGNvbnRlbnQsIHAsIG9wdGlvbnMpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG59O1xuXG5mdW5jdGlvbiBkcmF3TWFpbigpIHtcbiAgICBsZXQgcG9pbnRzID0gc2xpY2VSZWNvcmQoKTtcbiAgICBpZiAoIXBvaW50cy5sZW5ndGgpIHJldHVybjtcblxuICAgIGxldCBsaW1pdCA9IGdldExpbWl0KHBvaW50cyk7XG5cbiAgICBsZXQgc3RhcnQgPSBwb2ludHNbMF07XG4gICAgbGV0IGVuZCA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV07XG5cbiAgICBsZXQgdG90YWxYID0gdGh1bWJXaWR0aCA9PT0gMSA/IHRpbWVSYW5nZSA6IGVuZC50aW1lIC0gc3RhcnQudGltZTtcbiAgICBsZXQgdG90YWxZID0gKGxpbWl0Lm1heCAtIGxpbWl0Lm1pbikgfHwgMTtcblxuICAgIGxldCBncmQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgc2l6ZS5oZWlnaHQsIDAsIDApO1xuICAgIGdyZC5hZGRDb2xvclN0b3AoMCwgJ3JnYigxNzAsIDIxNSwgMjU1KScpO1xuICAgIGdyZC5hZGRDb2xvclN0b3AoMSwgJ3JnYmEoMTcwLCAyMTUsIDI1NSwgMC4yKScpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG5cbiAgICBjdHgubGluZVdpZHRoID0gMTtcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZ2IoNjQsIDE2NSwgMjU1KSc7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG5cbiAgICBsZXQgbGFzdFBvaW50ID0gcG9pbnRzLnJlZHVjZSgocHJlLCBjdXIsIGlkeCkgPT4ge1xuICAgICAgICBsZXQgdGltZSA9IGN1ci50aW1lLFxuICAgICAgICAgICAgdmFsdWUgPSBjdXJbY2hhcnRUeXBlXTtcbiAgICAgICAgbGV0IHggPSAodGltZSAtIHN0YXJ0LnRpbWUpIC8gdG90YWxYICogc2l6ZS53aWR0aCxcbiAgICAgICAgICAgIHkgPSAodmFsdWUgLSBsaW1pdC5taW4pIC8gdG90YWxZICogKHNpemUuaGVpZ2h0IC0gMjApO1xuXG4gICAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG5cbiAgICAgICAgaWYgKGhvdmVyUG9pbnRlclggJiYgTWF0aC5hYnMoaG92ZXJQb2ludGVyWCAtIHgpIDwgaG92ZXJQcmVjaXNpb24pIHtcbiAgICAgICAgICAgIHRhbmdlbnRQb2ludCA9IHtcbiAgICAgICAgICAgICAgICBjb29yZDogW3gsIHldLFxuICAgICAgICAgICAgICAgIHBvaW50OiBjdXJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRhbmdlbnRQb2ludFByZSA9IHtcbiAgICAgICAgICAgICAgICBjb29yZDogcHJlLFxuICAgICAgICAgICAgICAgIHBvaW50OiBwb2ludHNbaWR4IC0gMV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3gsIHldO1xuICAgIH0sIFtdKTtcblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHgubGluZVRvKGxhc3RQb2ludFswXSwgMCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIGRyYXdMaW5lKFswLCBsYXN0UG9pbnRbMV1dLCBsYXN0UG9pbnQsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAnI2Y2MCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZmlsbFRleHQoJ+KGmScgKyBub3RhdGlvbihsaW1pdC5taW4pLCBbMCwgMF0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyMwMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJzEycHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGZpbGxUZXh0KG5vdGF0aW9uKGVuZFtjaGFydFR5cGVdKSwgbGFzdFBvaW50LCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjYwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBmb250OiAnMTZweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBkcmF3VGFuZ2VudExpbmUoKSB7XG4gICAgbGV0IGNvb3JkID0gdGFuZ2VudFBvaW50LmNvb3JkLFxuICAgICAgICBjb29yZFByZSA9IHRhbmdlbnRQb2ludFByZS5jb29yZDtcblxuICAgIGxldCBrID0gKGNvb3JkWzFdIC0gY29vcmRQcmVbMV0pIC8gKGNvb3JkWzBdIC0gY29vcmRQcmVbMF0pIHx8IDA7XG4gICAgbGV0IGIgPSBjb29yZFsxXSAtIGsgKiBjb29yZFswXTtcblxuICAgIGRyYXdMaW5lKFswLCBiXSwgW3NpemUud2lkdGgsIGsgKiBzaXplLndpZHRoICsgYl0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAnI2YwMCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IHJlYWxLID0gKHRhbmdlbnRQb2ludC5wb2ludFtjaGFydFR5cGVdIC0gdGFuZ2VudFBvaW50UHJlLnBvaW50W2NoYXJ0VHlwZV0pIC9cbiAgICAgICAgICAgICAgICAodGFuZ2VudFBvaW50LnBvaW50LnRpbWUgLSB0YW5nZW50UG9pbnRQcmUucG9pbnQudGltZSk7XG5cbiAgICBmaWxsVGV4dCgnZHkvZHg6ICcgKyBub3RhdGlvbihyZWFsSyksIFtzaXplLndpZHRoIC8gMiwgMF0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBmb250OiAnYm9sZCAxMnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdIb3ZlcigpIHtcbiAgICBpZiAoIXRhbmdlbnRQb2ludCkgcmV0dXJuO1xuXG4gICAgZHJhd1RhbmdlbnRMaW5lKCk7XG5cbiAgICBsZXQgY29vcmQgPSB0YW5nZW50UG9pbnQuY29vcmQsXG4gICAgICAgIHBvaW50ID0gdGFuZ2VudFBvaW50LnBvaW50O1xuXG4gICAgbGV0IGNvb3JkU3R5bGUgPSB7XG4gICAgICAgIGRhc2hlZDogWzgsIDRdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGU6ICdyZ2IoNjQsIDE2NSwgMjU1KSdcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkcmF3TGluZShbMCwgY29vcmRbMV1dLCBbc2l6ZS53aWR0aCwgY29vcmRbMV1dLCBjb29yZFN0eWxlKTtcbiAgICBkcmF3TGluZShbY29vcmRbMF0sIDBdLCBbY29vcmRbMF0sIHNpemUuaGVpZ2h0XSwgY29vcmRTdHlsZSk7XG5cbiAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHBvaW50LnRpbWUgKyBwb2ludC5yZWR1Y2UpO1xuXG4gICAgbGV0IHBvaW50SW5mbyA9IFtcbiAgICAgICAgJygnLFxuICAgICAgICBkYXRlLmdldE1pbnV0ZXMoKSxcbiAgICAgICAgJzonLFxuICAgICAgICBkYXRlLmdldFNlY29uZHMoKSxcbiAgICAgICAgJy4nLFxuICAgICAgICBkYXRlLmdldE1pbGxpc2Vjb25kcygpLFxuICAgICAgICAnLCAnLFxuICAgICAgICBub3RhdGlvbihwb2ludFtjaGFydFR5cGVdKSxcbiAgICAgICAgJyknXG4gICAgXS5qb2luKCcnKTtcblxuICAgIGZpbGxUZXh0KHBvaW50SW5mbywgY29vcmQsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyMwMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJ2JvbGQgMTJweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgaWYgKCFzaG91bGRVcGRhdGUpIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG5cbiAgICBmaWxsVGV4dChjaGFydFR5cGUudG9VcHBlckNhc2UoKSwgWzAsIHNpemUuaGVpZ2h0XSwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2YwMCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ3RvcCcsXG4gICAgICAgICAgICBmb250OiAnYm9sZCAxNHB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRyYXdNYWluKCk7XG4gICAgZHJhd0hvdmVyKCk7XG5cbiAgICBpZiAoaG92ZXJMb2NrZWQpIHtcbiAgICAgICAgZmlsbFRleHQoJ0xPQ0tFRCcsIFtzaXplLndpZHRoLCBzaXplLmhlaWdodF0sIHtcbiAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2YwMCcsXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAncmlnaHQnLFxuICAgICAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ3RvcCcsXG4gICAgICAgICAgICAgICAgZm9udDogJ2JvbGQgMTRweCBzYW5zLXNlcmlmJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgc2hvdWxkVXBkYXRlID0gZmFsc2U7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbn07XG5cbnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG5sZXQgbGFzdFRpbWUgPSBEYXRlLm5vdygpLFxuICAgIGxhc3RPZmZzZXQgPSAwLFxuICAgIHJlZHVjZUFtb3VudCA9IDA7XG5cbnNjcm9sbGJhci5hZGRMaXN0ZW5lcigoKSA9PiB7XG4gICAgbGV0IGN1cnJlbnQgPSBEYXRlLm5vdygpLFxuICAgICAgICBvZmZzZXQgPSBzY3JvbGxiYXIub2Zmc2V0LnksXG4gICAgICAgIGR1cmF0aW9uID0gY3VycmVudCAtIGxhc3RUaW1lO1xuXG4gICAgaWYgKCFkdXJhdGlvbiB8fCBvZmZzZXQgPT09IGxhc3RPZmZzZXQpIHJldHVybjtcblxuICAgIGlmIChkdXJhdGlvbiA+IDUwKSB7XG4gICAgICAgIHJlZHVjZUFtb3VudCArPSAoZHVyYXRpb24gLSAxKTtcbiAgICAgICAgZHVyYXRpb24gLT0gKGR1cmF0aW9uIC0gMSk7XG4gICAgfVxuXG4gICAgbGV0IHZlbG9jaXR5ID0gKG9mZnNldCAtIGxhc3RPZmZzZXQpIC8gZHVyYXRpb247XG4gICAgbGFzdFRpbWUgPSBjdXJyZW50O1xuICAgIGxhc3RPZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICByZWNvcmRzLnB1c2goe1xuICAgICAgICB0aW1lOiBjdXJyZW50IC0gcmVkdWNlQW1vdW50LFxuICAgICAgICByZWR1Y2U6IHJlZHVjZUFtb3VudCxcbiAgICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgIHNwZWVkOiBNYXRoLmFicyh2ZWxvY2l0eSlcbiAgICB9KTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG59KTtcblxuZnVuY3Rpb24gZ2V0UG9pbnRlcihlKSB7XG4gICAgcmV0dXJuIGUudG91Y2hlcyA/IGUudG91Y2hlc1tlLnRvdWNoZXMubGVuZ3RoIC0gMV0gOiBlO1xufTtcblxuLy8gcmFuZ2VcbmxldCBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkdXJhdGlvbicpO1xubGV0IGxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R1cmF0aW9uLXZhbHVlJyk7XG5pbnB1dC5tYXggPSBUSU1FX1JBTkdFX01BWCAvIDFlMztcbmlucHV0Lm1pbiA9IDE7XG5pbnB1dC52YWx1ZSA9IHRpbWVSYW5nZSAvIDFlMztcbmxhYmVsLnRleHRDb250ZW50ID0gaW5wdXQudmFsdWUgKyAncyc7XG5cbmFkZEV2ZW50KGlucHV0LCAnaW5wdXQnLCAoZSkgPT4ge1xuICAgIGxldCBzdGFydCA9IHJlY29yZHNbMF07XG4gICAgbGV0IGVuZCA9IHJlY29yZHNbcmVjb3Jkcy5sZW5ndGggLSAxXTtcbiAgICBsZXQgdmFsID0gcGFyc2VGbG9hdChlLnRhcmdldC52YWx1ZSk7XG4gICAgbGFiZWwudGV4dENvbnRlbnQgPSB2YWwgKyAncyc7XG4gICAgdGltZVJhbmdlID0gdmFsICogMWUzO1xuXG4gICAgaWYgKGVuZCkge1xuICAgICAgICBlbmRPZmZzZXQgPSBNYXRoLm1pbihlbmRPZmZzZXQsIE1hdGgubWF4KDAsIDEgLSB0aW1lUmFuZ2UgLyAoZW5kLnRpbWUgLSBzdGFydC50aW1lKSkpO1xuICAgIH1cbn0pO1xuXG5hZGRFdmVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQnKSwgJ2NsaWNrJywgKCkgPT4ge1xuICAgIHJlY29yZHMubGVuZ3RoID0gZW5kT2Zmc2V0ID0gcmVkdWNlQW1vdW50ID0gMDtcbiAgICBob3ZlckxvY2tlZCA9IGZhbHNlO1xuICAgIGhvdmVyUG9pbnRlclggPSB1bmRlZmluZWQ7XG4gICAgdGFuZ2VudFBvaW50ID0gbnVsbDtcbiAgICB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xuICAgIHNsaWNlUmVjb3JkKCk7XG59KTtcblxuLy8gaG92ZXJcbmFkZEV2ZW50KGNhbnZhcywgJ21vdXNlbW92ZSB0b3VjaG1vdmUnLCAoZSkgPT4ge1xuICAgIGlmIChob3ZlckxvY2tlZCB8fCBwb2ludGVyRG93bk9uVHJhY2spIHJldHVybjtcblxuICAgIGxldCBwb2ludGVyID0gZ2V0UG9pbnRlcihlKTtcblxuICAgIGhvdmVyUG9pbnRlclggPSBwb2ludGVyLmNsaWVudFggLSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbn0pO1xuXG5mdW5jdGlvbiByZXNldEhvdmVyKCkge1xuICAgIGhvdmVyUG9pbnRlclggPSAwO1xuICAgIHRhbmdlbnRQb2ludCA9IG51bGw7XG4gICAgdGFuZ2VudFBvaW50UHJlID0gbnVsbDtcbn07XG5cbmFkZEV2ZW50KFtjYW52YXMsIHdpbmRvd10sICdtb3VzZWxlYXZlIHRvdWNoZW5kJywgKCkgPT4ge1xuICAgIGlmIChob3ZlckxvY2tlZCkgcmV0dXJuO1xuICAgIHJlc2V0SG92ZXIoKTtcbn0pO1xuXG5hZGRFdmVudChjYW52YXMsICdjbGljaycsICgpID0+IHtcbiAgICBob3ZlckxvY2tlZCA9ICFob3ZlckxvY2tlZDtcblxuICAgIGlmICghaG92ZXJMb2NrZWQpIHJlc2V0SG92ZXIoKTtcbn0pO1xuXG4vLyB0cmFja1xuYWRkRXZlbnQodGh1bWIsICdtb3VzZWRvd24gdG91Y2hzdGFydCcsIChlKSA9PiB7XG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuICAgIHBvaW50ZXJEb3duT25UcmFjayA9IHBvaW50ZXIuY2xpZW50WDtcbn0pO1xuXG5hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGUpID0+IHtcbiAgICBpZiAoIXBvaW50ZXJEb3duT25UcmFjaykgcmV0dXJuO1xuXG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuICAgIGxldCBtb3ZlZCA9IChwb2ludGVyLmNsaWVudFggLSBwb2ludGVyRG93bk9uVHJhY2spIC8gc2l6ZS53aWR0aDtcblxuICAgIHBvaW50ZXJEb3duT25UcmFjayA9IHBvaW50ZXIuY2xpZW50WDtcbiAgICBlbmRPZmZzZXQgPSBNYXRoLm1pbigxIC0gdGh1bWJXaWR0aCwgTWF0aC5tYXgoMCwgZW5kT2Zmc2V0IC0gbW92ZWQpKTtcbn0pO1xuXG5hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIHRvdWNoZW5kIGJsdXInLCAoZSkgPT4ge1xuICAgIHBvaW50ZXJEb3duT25UcmFjayA9IHVuZGVmaW5lZDtcbn0pO1xuXG5hZGRFdmVudCh0aHVtYiwgJ2NsaWNrIHRvdWNoc3RhcnQnLCAoZSkgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG59KTtcblxuYWRkRXZlbnQodHJhY2ssICdjbGljayB0b3VjaHN0YXJ0JywgKGUpID0+IHtcbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG4gICAgbGV0IHJlY3QgPSB0cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBsZXQgb2Zmc2V0ID0gKHBvaW50ZXIuY2xpZW50WCAtIHJlY3QubGVmdCkgLyByZWN0LndpZHRoO1xuICAgIGVuZE9mZnNldCA9IE1hdGgubWluKDEgLSB0aHVtYldpZHRoLCBNYXRoLm1heCgwLCAxIC0gKG9mZnNldCArIHRodW1iV2lkdGggLyAyKSkpO1xufSk7XG5cbi8vIHN3aXRjaCBjaGFydFxuYWRkRXZlbnQoXG4gICAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hhcnQtdHlwZScpKSxcbiAgICAnY2hhbmdlJyxcbiAgICAoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAodGFyZ2V0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHRhcmdldC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbik7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmtleXMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5PYmplY3Qua2V5cztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2tleXMnLCBmdW5jdGlvbigka2V5cyl7XG4gIHJldHVybiBmdW5jdGlvbiBrZXlzKGl0KXtcbiAgICByZXR1cm4gJGtleXModG9PYmplY3QoaXQpKTtcbiAgfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanNcbiAqKiBtb2R1bGUgaWQgPSA0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgZmFpbHMgICA9IHJlcXVpcmUoJy4vJC5mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVksIGV4ZWMpe1xuICB2YXIgZm4gID0gKGNvcmUuT2JqZWN0IHx8IHt9KVtLRVldIHx8IE9iamVjdFtLRVldXG4gICAgLCBleHAgPSB7fTtcbiAgZXhwW0tFWV0gPSBleGVjKGZuKTtcbiAgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiBmYWlscyhmdW5jdGlvbigpeyBmbigxKTsgfSksICdPYmplY3QnLCBleHApO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3Qtc2FwLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgSVNfV1JBUCAgID0gdHlwZSAmICRleHBvcnQuV1xuICAgICwgZXhwb3J0cyAgID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSlcbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGtleSwgb3duLCBvdXQ7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbihDKXtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24ocGFyYW0pe1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEMgPyBuZXcgQyhwYXJhbSkgOiBDKHBhcmFtKTtcbiAgICAgIH07XG4gICAgICBGW1BST1RPVFlQRV0gPSBDW1BST1RPVFlQRV07XG4gICAgICByZXR1cm4gRjtcbiAgICAvLyBtYWtlIHN0YXRpYyB2ZXJzaW9ucyBmb3IgcHJvdG90eXBlIG1ldGhvZHNcbiAgICB9KShvdXQpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgaWYoSVNfUFJPVE8pKGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pKVtrZXldID0gb3V0O1xuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7IC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAvLyB3cmFwXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZXhwb3J0LmpzXG4gKiogbW9kdWxlIGlkID0gOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qc1xuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzEuMi42J307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzXG4gKiogbW9kdWxlIGlkID0gMTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qc1xuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZhaWxzLmpzXG4gKiogbW9kdWxlIGlkID0gMTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtZGVmYXVsdC5qc1xuICoqIG1vZHVsZSBpZCA9IDE0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2VsZWN0b3JzLCBzYkxpc3QgfSBmcm9tICcuL3NoYXJlZCc7XG5cbmltcG9ydCAnLi9hcGlzLyc7XG5pbXBvcnQgJy4vcmVuZGVyLyc7XG5pbXBvcnQgJy4vZXZlbnRzLyc7XG5pbXBvcnQgJy4vaW50ZXJuYWxzLyc7XG5cbmV4cG9ydCBkZWZhdWx0IFNtb290aFNjcm9sbGJhcjtcblxuU21vb3RoU2Nyb2xsYmFyLnZlcnNpb24gPSAnPCU9IHZlcnNpb24gJT4nO1xuXG4vKipcbiAqIGluaXQgc2Nyb2xsYmFyIG9uIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uczogc2Nyb2xsYmFyIG9wdGlvbnNcbiAqXG4gKiBAcmV0dXJuIHtTY3JvbGxiYXJ9IHNjcm9sbGJhciBpbnN0YW5jZVxuICovXG5TbW9vdGhTY3JvbGxiYXIuaW5pdCA9IChlbGVtLCBvcHRpb25zKSA9PiB7XG4gICAgaWYgKCFlbGVtIHx8IGVsZW0ubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IGVsZW1lbnQgdG8gYmUgRE9NIEVsZW1lbnQsIGJ1dCBnb3QgJHt0eXBlb2YgZWxlbX1gKTtcbiAgICB9XG5cbiAgICBpZiAoc2JMaXN0LmhhcyhlbGVtKSkgcmV0dXJuIHNiTGlzdC5nZXQoZWxlbSk7XG5cbiAgICBlbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxiYXInLCAnJyk7XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi5lbGVtLmNoaWxkcmVuXTtcblxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgZGl2LmlubmVySFRNTCA9IGBcbiAgICAgICAgPGFydGljbGUgY2xhc3M9XCJzY3JvbGwtY29udGVudFwiPjwvYXJ0aWNsZT5cbiAgICAgICAgPGFzaWRlIGNsYXNzPVwic2Nyb2xsYmFyLXRyYWNrIHNjcm9sbGJhci10cmFjay14XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsYmFyLXRodW1iIHNjcm9sbGJhci10aHVtYi14XCI+PC9kaXY+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICAgIDxhc2lkZSBjbGFzcz1cInNjcm9sbGJhci10cmFjayBzY3JvbGxiYXItdHJhY2steVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbGJhci10aHVtYiBzY3JvbGxiYXItdGh1bWIteVwiPjwvZGl2PlxuICAgICAgICA8L2FzaWRlPlxuICAgIGA7XG5cbiAgICBjb25zdCBzY3JvbGxDb250ZW50ID0gZGl2LnF1ZXJ5U2VsZWN0b3IoJy5zY3JvbGwtY29udGVudCcpO1xuXG4gICAgWy4uLmRpdi5jaGlsZHJlbl0uZm9yRWFjaCgoZWwpID0+IGVsZW0uYXBwZW5kQ2hpbGQoZWwpKTtcblxuICAgIGNoaWxkcmVuLmZvckVhY2goKGVsKSA9PiBzY3JvbGxDb250ZW50LmFwcGVuZENoaWxkKGVsKSk7XG5cbiAgICByZXR1cm4gbmV3IFNtb290aFNjcm9sbGJhcihlbGVtLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogaW5pdCBzY3JvbGxiYXJzIG9uIHByZS1kZWZpbmVkIHNlbGVjdG9yc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zOiBzY3JvbGxiYXIgb3B0aW9uc1xuICpcbiAqIEByZXR1cm4ge0FycmF5fSBhIGNvbGxlY3Rpb24gb2Ygc2Nyb2xsYmFyIGluc3RhbmNlc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuaW5pdEFsbCA9IChvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyldLm1hcCgoZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIFNtb290aFNjcm9sbGJhci5pbml0KGVsLCBvcHRpb25zKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogY2hlY2sgaWYgc2Nyb2xsYmFyIGV4aXN0cyBvbiBnaXZlbiBlbGVtZW50XG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmhhcyA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIHNiTGlzdC5oYXMoZWxlbSk7XG59O1xuXG4vKipcbiAqIGdldCBzY3JvbGxiYXIgaW5zdGFuY2UgdGhyb3VnaCBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtOiB0YXJnZXQgc2Nyb2xsYmFyIGNvbnRhaW5lclxuICpcbiAqIEByZXR1cm4ge1Njcm9sbGJhcn1cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmdldCA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIHNiTGlzdC5nZXQoZWxlbSk7XG59O1xuXG4vKipcbiAqIGdldCBhbGwgc2Nyb2xsYmFyIGluc3RhbmNlc1xuICpcbiAqIEByZXR1cm4ge0FycmF5fSBhIGNvbGxlY3Rpb24gb2Ygc2Nyb2xsYmFyc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuZ2V0QWxsID0gKCkgPT4ge1xuICAgIHJldHVybiBbLi4uc2JMaXN0LnZhbHVlcygpXTtcbn07XG5cbi8qKlxuICogZGVzdHJveSBzY3JvbGxiYXIgb24gZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbTogdGFyZ2V0IHNjcm9sbGJhciBjb250YWluZXJcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmRlc3Ryb3kgPSAoZWxlbSkgPT4ge1xuICAgIHJldHVybiBTbW9vdGhTY3JvbGxiYXIuaGFzKGVsZW0pICYmIFNtb290aFNjcm9sbGJhci5nZXQoZWxlbSkuZGVzdHJveSgpO1xufTtcblxuLyoqXG4gKiBkZXN0cm95IGFsbCBzY3JvbGxiYXJzIGluIHNjcm9sbGJhciBpbnN0YW5jZXNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmRlc3Ryb3lBbGwgPSAoKSA9PiB7XG4gICAgc2JMaXN0LmZvckVhY2goKHNiKSA9PiB7XG4gICAgICAgIHNiLmRlc3Ryb3koKTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9BcnJheSRmcm9tID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIF9BcnJheSRmcm9tKGFycik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanNcbiAqKiBtb2R1bGUgaWQgPSAxNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb21cIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LmFycmF5LmZyb20nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5BcnJheS5mcm9tO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgJGF0ICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBpbmRleCA9IHRoaXMuX2lcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4ge3ZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWV9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4ge3ZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2V9O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSAxOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zdHJpbmctYXQuanNcbiAqKiBtb2R1bGUgaWQgPSAyMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWludGVnZXIuanNcbiAqKiBtb2R1bGUgaWQgPSAyMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi8kLmxpYnJhcnknKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgcmVkZWZpbmUgICAgICAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgSXRlcmF0b3JzICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNyZWF0ZScpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIGdldFByb3RvICAgICAgID0gcmVxdWlyZSgnLi8kJykuZ2V0UHJvdG9cbiAgLCBJVEVSQVRPUiAgICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEJVR0dZICAgICAgICAgID0gIShbXS5rZXlzICYmICduZXh0JyBpbiBbXS5rZXlzKCkpIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgLCBGRl9JVEVSQVRPUiAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEtFWVMgICAgICAgICAgID0gJ2tleXMnXG4gICwgVkFMVUVTICAgICAgICAgPSAndmFsdWVzJztcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRUQpe1xuICAkaXRlckNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihraW5kKXtcbiAgICBpZighQlVHR1kgJiYga2luZCBpbiBwcm90bylyZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoKGtpbmQpe1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgICAgICAgID0gTkFNRSArICcgSXRlcmF0b3InXG4gICAgLCBERUZfVkFMVUVTID0gREVGQVVMVCA9PSBWQUxVRVNcbiAgICAsIFZBTFVFU19CVUcgPSBmYWxzZVxuICAgICwgcHJvdG8gICAgICA9IEJhc2UucHJvdG90eXBlXG4gICAgLCAkbmF0aXZlICAgID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCAkZGVmYXVsdCAgID0gJG5hdGl2ZSB8fCBnZXRNZXRob2QoREVGQVVMVClcbiAgICAsIG1ldGhvZHMsIGtleTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZigkbmF0aXZlKXtcbiAgICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90bygkZGVmYXVsdC5jYWxsKG5ldyBCYXNlKSk7XG4gICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgIC8vIEZGIGZpeFxuICAgIGlmKCFMSUJSQVJZICYmIGhhcyhwcm90bywgRkZfSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gICAgaWYoREVGX1ZBTFVFUyAmJiAkbmF0aXZlLm5hbWUgIT09IFZBTFVFUyl7XG4gICAgICBWQUxVRVNfQlVHID0gdHJ1ZTtcbiAgICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gICAgfVxuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZigoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSl7XG4gICAgaGlkZShwcm90bywgSVRFUkFUT1IsICRkZWZhdWx0KTtcbiAgfVxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9ICRkZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSByZXR1cm5UaGlzO1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiAgREVGX1ZBTFVFUyAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogICAgSVNfU0VUICAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKVxuICAgIH07XG4gICAgaWYoRk9SQ0VEKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWRlZmluZS5qc1xuICoqIG1vZHVsZSBpZCA9IDIyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qc1xuICoqIG1vZHVsZSBpZCA9IDIzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5oaWRlJyk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucmVkZWZpbmUuanNcbiAqKiBtb2R1bGUgaWQgPSAyNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuLyQucHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oaWRlLmpzXG4gKiogbW9kdWxlIGlkID0gMjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkT2JqZWN0ID0gT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogICAgICRPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICAkT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBpc0VudW06ICAgICB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxcbiAgZ2V0RGVzYzogICAgJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgICRPYmplY3QuZGVmaW5lUHJvcGVydHksXG4gIHNldERlc2NzOiAgICRPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgJE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXG4gIGdldFN5bWJvbHM6ICRPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBlYWNoOiAgICAgICBbXS5mb3JFYWNoXG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzXG4gKiogbW9kdWxlIGlkID0gMjZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5wcm9wZXJ0eS1kZXNjLmpzXG4gKiogbW9kdWxlIGlkID0gMjdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vJC5mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZXNjcmlwdG9ycy5qc1xuICoqIG1vZHVsZSBpZCA9IDI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oYXMuanNcbiAqKiBtb2R1bGUgaWQgPSAyOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyYXRvcnMuanNcbiAqKiBtb2R1bGUgaWQgPSAzMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBkZXNjcmlwdG9yICAgICA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vJC5zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5oaWRlJykoSXRlcmF0b3JQcm90b3R5cGUsIHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gJC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHtuZXh0OiBkZXNjcmlwdG9yKDEsIG5leHQpfSk7XG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNyZWF0ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDMxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi8kJykuc2V0RGVzY1xuICAsIGhhcyA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qc1xuICoqIG1vZHVsZSBpZCA9IDMyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgc3RvcmUgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICA9IHJlcXVpcmUoJy4vJC51aWQnKVxuICAsIFN5bWJvbCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKS5TeW1ib2w7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBTeW1ib2wgJiYgU3ltYm9sW25hbWVdIHx8IChTeW1ib2wgfHwgdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qc1xuICoqIG1vZHVsZSBpZCA9IDMzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zaGFyZWQuanNcbiAqKiBtb2R1bGUgaWQgPSAzNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudWlkLmpzXG4gKiogbW9kdWxlIGlkID0gMzVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsICRleHBvcnQgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi8kLmlzLWFycmF5LWl0ZXInKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XG4gICAgdmFyIE8gICAgICAgPSB0b09iamVjdChhcnJheUxpa2UpXG4gICAgICAsIEMgICAgICAgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5XG4gICAgICAsICQkICAgICAgPSBhcmd1bWVudHNcbiAgICAgICwgJCRsZW4gICA9ICQkLmxlbmd0aFxuICAgICAgLCBtYXBmbiAgID0gJCRsZW4gPiAxID8gJCRbMV0gOiB1bmRlZmluZWRcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgaXRlckZuICA9IGdldEl0ZXJGbihPKVxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYobWFwcGluZyltYXBmbiA9IGN0eChtYXBmbiwgJCRsZW4gPiAyID8gJCRbMl0gOiB1bmRlZmluZWQsIDIpO1xuICAgIC8vIGlmIG9iamVjdCBpc24ndCBpdGVyYWJsZSBvciBpdCdzIGFycmF5IHdpdGggZGVmYXVsdCBpdGVyYXRvciAtIHVzZSBzaW1wbGUgY2FzZVxuICAgIGlmKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKXtcbiAgICAgIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKE8pLCByZXN1bHQgPSBuZXcgQzsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgICBmb3IocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5mcm9tLmpzXG4gKiogbW9kdWxlIGlkID0gMzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhbk9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgfSBjYXRjaChlKXtcbiAgICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNhbGwuanNcbiAqKiBtb2R1bGUgaWQgPSAzN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDM4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXMtb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gMzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3JcbnZhciBJdGVyYXRvcnMgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1hcnJheS1pdGVyLmpzXG4gKiogbW9kdWxlIGlkID0gNDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanNcbiAqKiBtb2R1bGUgaWQgPSA0MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZClyZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanNcbiAqKiBtb2R1bGUgaWQgPSA0MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLy8gRVMzIHdyb25nIGhlcmVcbiAgLCBBUkcgPSBjb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbVEFHXSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNsYXNzb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIElURVJBVE9SICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMsIHNraXBDbG9zaW5nKXtcbiAgaWYoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgc2FmZSA9IHRydWU7IH07XG4gICAgYXJyW0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1kZXRlY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA0NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtDbGFzc30gU21vb3RoU2Nyb2xsYmFyXG4gKi9cblxuaW1wb3J0IHsgc2JMaXN0IH0gZnJvbSAnLi9zaGFyZWQvJztcbmltcG9ydCB7XG4gICAgZGVib3VuY2UsXG4gICAgZmluZENoaWxkLFxuICAgIHNldFN0eWxlXG59IGZyb20gJy4vdXRpbHMvJztcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIENyZWF0ZSBzY3JvbGxiYXIgaW5zdGFuY2VcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lcjogdGFyZ2V0IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc106IG9wdGlvbnNcbiAqL1xuZXhwb3J0IGNsYXNzIFNtb290aFNjcm9sbGJhciB7XG4gICAgY29uc3RydWN0b3IoY29udGFpbmVyLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgc2JMaXN0LnNldChjb250YWluZXIsIHRoaXMpO1xuXG4gICAgICAgIC8vIG1ha2UgY29udGFpbmVyIGZvY3VzYWJsZVxuICAgICAgICBjb250YWluZXIuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcxJyk7XG5cbiAgICAgICAgLy8gcmVzZXQgc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsTGVmdCA9IDA7XG5cbiAgICAgICAgc2V0U3R5bGUoY29udGFpbmVyLCB7XG4gICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICBvdXRsaW5lOiAnbm9uZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdHJhY2tYID0gZmluZENoaWxkKGNvbnRhaW5lciwgJ3Njcm9sbGJhci10cmFjay14Jyk7XG4gICAgICAgIGNvbnN0IHRyYWNrWSA9IGZpbmRDaGlsZChjb250YWluZXIsICdzY3JvbGxiYXItdHJhY2steScpO1xuXG4gICAgICAgIC8vIHJlYWRvbmx5IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5fX3JlYWRvbmx5KCd0YXJnZXRzJywgT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICBjb250YWluZXIsXG4gICAgICAgICAgICBjb250ZW50OiBmaW5kQ2hpbGQoY29udGFpbmVyLCAnc2Nyb2xsLWNvbnRlbnQnKSxcbiAgICAgICAgICAgIHhBeGlzOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgICAgICB0cmFjazogdHJhY2tYLFxuICAgICAgICAgICAgICAgIHRodW1iOiBmaW5kQ2hpbGQodHJhY2tYLCAnc2Nyb2xsYmFyLXRodW1iLXgnKVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB5QXhpczogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICAgICAgdHJhY2s6IHRyYWNrWSxcbiAgICAgICAgICAgICAgICB0aHVtYjogZmluZENoaWxkKHRyYWNrWSwgJ3Njcm9sbGJhci10aHVtYi15JylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pKVxuICAgICAgICAuX19yZWFkb25seSgnb2Zmc2V0Jywge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ2xpbWl0Jywge1xuICAgICAgICAgICAgeDogSW5maW5pdHksXG4gICAgICAgICAgICB5OiBJbmZpbml0eVxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnbW92ZW1lbnQnLCB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnc2l6ZScsIHRoaXMuZ2V0U2l6ZSgpKTtcblxuICAgICAgICAvLyBub24tZW5tdXJhYmxlIHByb3BlcnRpZXNcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAgICAgX191cGRhdGVUaHJvdHRsZToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBkZWJvdW5jZSg6OnRoaXMudXBkYXRlKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9fbGlzdGVuZXJzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX19oYW5kbGVyczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBbXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9fY2hpbGRyZW46IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogW11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX3RpbWVySUQ6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZToge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWNjZXNzb3JzXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDoge1xuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Lnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNjcm9sbExlZnQ6IHtcbiAgICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9mZnNldC54O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fX2luaXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9faW5pdFNjcm9sbGJhcigpO1xuICAgIH1cbn1cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanNcbiAqKiBtb2R1bGUgaWQgPSA0N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9mcmVlemVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDQ4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZnJlZXplJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmZyZWV6ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9mcmVlemUuanNcbiAqKiBtb2R1bGUgaWQgPSA0OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjUgT2JqZWN0LmZyZWV6ZShPKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xuXG5yZXF1aXJlKCcuLyQub2JqZWN0LXNhcCcpKCdmcmVlemUnLCBmdW5jdGlvbigkZnJlZXplKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuICRmcmVlemUgJiYgaXNPYmplY3QoaXQpID8gJGZyZWV6ZShpdCkgOiBpdDtcbiAgfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDUwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qc1xuICoqIG1vZHVsZSBpZCA9IDUxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKFQsIEQpe1xuICByZXR1cm4gJC5zZXREZXNjcyhULCBEKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9zYl9saXN0JztcbmV4cG9ydCAqIGZyb20gJy4vc2VsZWN0b3JzJztcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lc1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqLCBkZWZhdWx0cykge1xuICB2YXIga2V5cyA9IF9PYmplY3QkZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG5cbiAgICB2YXIgdmFsdWUgPSBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cywga2V5KTtcblxuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb25maWd1cmFibGUgJiYgb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgX09iamVjdCRkZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9kZWZhdWx0cy5qc1xuICoqIG1vZHVsZSBpZCA9IDU0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICByZXR1cm4gJC5nZXROYW1lcyhpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5TmFtZXMnLCBmdW5jdGlvbigpe1xuICByZXR1cm4gcmVxdWlyZSgnLi8kLmdldC1uYW1lcycpLmdldDtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZmFsbGJhY2sgZm9yIElFMTEgYnVnZ3kgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgd2l0aCBpZnJhbWUgYW5kIHdpbmRvd1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0JylcbiAgLCBnZXROYW1lcyAgPSByZXF1aXJlKCcuLyQnKS5nZXROYW1lc1xuICAsIHRvU3RyaW5nICA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG52YXIgZ2V0V2luZG93TmFtZXMgPSBmdW5jdGlvbihpdCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdldE5hbWVzKGl0KTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIGlmKHdpbmRvd05hbWVzICYmIHRvU3RyaW5nLmNhbGwoaXQpID09ICdbb2JqZWN0IFdpbmRvd10nKXJldHVybiBnZXRXaW5kb3dOYW1lcyhpdCk7XG4gIHJldHVybiBnZXROYW1lcyh0b0lPYmplY3QoaXQpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2V0LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNjBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICByZXR1cm4gJC5nZXREZXNjKGl0LCBrZXkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ipe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDY0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhpdCwga2V5LCBkZXNjKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzXG4gKiogbW9kdWxlIGlkID0gNjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gIHZhciBuZXdPYmogPSBkZWZhdWx0cyh7fSwgb2JqKTtcbiAgZGVsZXRlIG5ld09ialtcImRlZmF1bHRcIl07XG4gIHJldHVybiBuZXdPYmo7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLWV4cG9ydC13aWxkY2FyZC5qc1xuICoqIG1vZHVsZSBpZCA9IDY2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge01hcH0gc2JMaXN0XG4gKi9cblxuY29uc3Qgc2JMaXN0ID0gbmV3IE1hcCgpO1xuXG5jb25zdCBvcmlnaW5TZXQgPSA6OnNiTGlzdC5zZXQ7XG5cbnNiTGlzdC51cGRhdGUgPSAoKSA9PiB7XG4gICAgc2JMaXN0LmZvckVhY2goKHNiKSA9PiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBzYi5fX3VwZGF0ZUNoaWxkcmVuKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLy8gcGF0Y2ggI3NldCB3aXRoICN1cGRhdGUgbWV0aG9kXG5zYkxpc3Quc2V0ID0gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCByZXMgPSBvcmlnaW5TZXQoLi4uYXJncyk7XG4gICAgc2JMaXN0LnVwZGF0ZSgpO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbmV4cG9ydCB7IHNiTGlzdCB9O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9zYl9saXN0LmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL21hcFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA2OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy8kLmNvcmUnKS5NYXA7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA2OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBJdGVyYXRvcnMuQXJyYXk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSA3MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLyQuYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSXRlcmF0b3JzICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwga2luZCAgPSB0aGlzLl9rXG4gICAgLCBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA3MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFkZC10by11bnNjb3BhYmxlcy5qc1xuICoqIG1vZHVsZSBpZCA9IDczXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItc3RlcC5qc1xuICoqIG1vZHVsZSBpZCA9IDc0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XG5cbi8vIDIzLjEgTWFwIE9iamVjdHNcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ01hcCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBNYXAoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcbiAgfSxcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzXG4gKiogbW9kdWxlIGlkID0gNzVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGhpZGUgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCByZWRlZmluZUFsbCAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUtYWxsJylcbiAgLCBjdHggICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBzdHJpY3ROZXcgICAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpXG4gICwgZGVmaW5lZCAgICAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKVxuICAsIGZvck9mICAgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsICRpdGVyRGVmaW5lICA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpXG4gICwgc3RlcCAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSUQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpKCdpZCcpXG4gICwgJGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgaXNPYmplY3QgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgc2V0U3BlY2llcyAgID0gcmVxdWlyZSgnLi8kLnNldC1zcGVjaWVzJylcbiAgLCBERVNDUklQVE9SUyAgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBTSVpFICAgICAgICAgPSBERVNDUklQVE9SUyA/ICdfcycgOiAnc2l6ZSdcbiAgLCBpZCAgICAgICAgICAgPSAwO1xuXG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYoISRoYXMoaXQsIElEKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxuICAgIGhpZGUoaXQsIElELCArK2lkKTtcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XG59O1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbih0aGF0LCBrZXkpe1xuICAvLyBmYXN0IGNhc2VcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcbiAgaWYoaW5kZXggIT09ICdGJylyZXR1cm4gdGhhdC5faVtpbmRleF07XG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxuICBmb3IoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0aGF0LCBDLCBOQU1FKTtcbiAgICAgIHRoYXQuX2kgPSAkLmNyZWF0ZShudWxsKTsgLy8gaW5kZXhcbiAgICAgIHRoYXQuX2YgPSB1bmRlZmluZWQ7ICAgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgICAgLy8gbGFzdCBlbnRyeVxuICAgICAgdGhhdFtTSVpFXSA9IDA7ICAgICAgICAgICAvLyBzaXplXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XG4gICAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0Ll9pLCBlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKGVudHJ5LnApZW50cnkucCA9IGVudHJ5LnAubiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGF0Ll9mID0gdGhhdC5fbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhhdFtTSVpFXSA9IDA7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgICAgICBpZihlbnRyeSl7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXG4gICAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xuICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9pW2VudHJ5LmldO1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XG4gICAgICAgICAgaWYodGhhdC5fZiA9PSBlbnRyeSl0aGF0Ll9mID0gbmV4dDtcbiAgICAgICAgICBpZih0aGF0Ll9sID09IGVudHJ5KXRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzLl9mKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKERFU0NSSVBUT1JTKSQuc2V0RGVzYyhDLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBkZWZpbmVkKHRoaXNbU0laRV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcbiAgICAgICwgcHJldiwgaW5kZXg7XG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XG4gICAgaWYoZW50cnkpe1xuICAgICAgZW50cnkudiA9IHZhbHVlO1xuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5fbCA9IGVudHJ5ID0ge1xuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxuICAgICAgICB2OiB2YWx1ZSwgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgICAgcDogcHJldiA9IHRoYXQuX2wsICAgICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XG4gICAgICAgIHI6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSByZW1vdmVkXG4gICAgICB9O1xuICAgICAgaWYoIXRoYXQuX2YpdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcbiAgICAgIHRoYXRbU0laRV0rKztcbiAgICAgIC8vIGFkZCB0byBpbmRleFxuICAgICAgaWYoaW5kZXggIT09ICdGJyl0aGF0Ll9pW2luZGV4XSA9IGVudHJ5O1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcbiAgc2V0U3Ryb25nOiBmdW5jdGlvbihDLCBOQU1FLCBJU19NQVApe1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICAgICB0aGlzLl90ID0gaXRlcmF0ZWQ7ICAvLyB0YXJnZXRcbiAgICAgIHRoaXMuX2sgPSBraW5kOyAgICAgIC8vIGtpbmRcbiAgICAgIHRoaXMuX2wgPSB1bmRlZmluZWQ7IC8vIHByZXZpb3VzXG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgLCBraW5kICA9IHRoYXQuX2tcbiAgICAgICAgLCBlbnRyeSA9IHRoYXQuX2w7XG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmKCF0aGF0Ll90IHx8ICEodGhhdC5fbCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhhdC5fdC5fZikpe1xuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxuICAgICAgICB0aGF0Ll90ID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gc3RlcCgxKTtcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcbiAgICAgIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgZW50cnkuayk7XG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xuICAgICAgcmV0dXJuIHN0ZXAoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTtcbiAgICB9LCBJU19NQVAgPyAnZW50cmllcycgOiAndmFsdWVzJyAsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24tc3Ryb25nLmpzXG4gKiogbW9kdWxlIGlkID0gNzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XG4gIGZvcih2YXIga2V5IGluIHNyYylyZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS1hbGwuanNcbiAqKiBtb2R1bGUgaWQgPSA3N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUpe1xuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKXRocm93IFR5cGVFcnJvcihuYW1lICsgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanNcbiAqKiBtb2R1bGUgaWQgPSA3OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vJC5pcy1hcnJheS1pdGVyJylcbiAgLCBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQpe1xuICB2YXIgaXRlckZuID0gZ2V0SXRlckZuKGl0ZXJhYmxlKVxuICAgICwgZiAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yO1xuICBpZih0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ZXJhYmxlICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIC8vIGZhc3QgY2FzZSBmb3IgYXJyYXlzIHdpdGggZGVmYXVsdCBpdGVyYXRvclxuICBpZihpc0FycmF5SXRlcihpdGVyRm4pKWZvcihsZW5ndGggPSB0b0xlbmd0aChpdGVyYWJsZS5sZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICB9IGVsc2UgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7ICl7XG4gICAgY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZm9yLW9mLmpzXG4gKiogbW9kdWxlIGlkID0gNzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIFNQRUNJRVMgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSBjb3JlW0tFWV07XG4gIGlmKERFU0NSSVBUT1JTICYmIEMgJiYgIUNbU1BFQ0lFU10pJC5zZXREZXNjKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXNwZWNpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA4MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBnbG9iYWwgICAgICAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgZmFpbHMgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZmFpbHMnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIHJlZGVmaW5lQWxsICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lLWFsbCcpXG4gICwgZm9yT2YgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBzdHJpY3ROZXcgICAgICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBpc09iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi8kLnNldC10by1zdHJpbmctdGFnJylcbiAgLCBERVNDUklQVE9SUyAgICA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gZ2xvYmFsW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBpZighREVTQ1JJUFRPUlMgfHwgdHlwZW9mIEMgIT0gJ2Z1bmN0aW9uJyB8fCAhKElTX1dFQUsgfHwgcHJvdG8uZm9yRWFjaCAmJiAhZmFpbHMoZnVuY3Rpb24oKXtcbiAgICBuZXcgQygpLmVudHJpZXMoKS5uZXh0KCk7XG4gIH0pKSl7XG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcbiAgICBDID0gY29tbW9uLmdldENvbnN0cnVjdG9yKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbih0YXJnZXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0YXJnZXQsIEMsIE5BTUUpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2U7XG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGFyZ2V0W0FEREVSXSwgdGFyZ2V0KTtcbiAgICB9KTtcbiAgICAkLmVhY2guY2FsbCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMnLnNwbGl0KCcsJyksZnVuY3Rpb24oS0VZKXtcbiAgICAgIHZhciBJU19BRERFUiA9IEtFWSA9PSAnYWRkJyB8fCBLRVkgPT0gJ3NldCc7XG4gICAgICBpZihLRVkgaW4gcHJvdG8gJiYgIShJU19XRUFLICYmIEtFWSA9PSAnY2xlYXInKSloaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICBpZighSVNfQURERVIgJiYgSVNfV0VBSyAmJiAhaXNPYmplY3QoYSkpcmV0dXJuIEtFWSA9PSAnZ2V0JyA/IHVuZGVmaW5lZCA6IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBJU19BRERFUiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZignc2l6ZScgaW4gcHJvdG8pJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Muc2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNldFRvU3RyaW5nVGFnKEMsIE5BTUUpO1xuXG4gIE9bTkFNRV0gPSBDO1xuICAkZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiwgTyk7XG5cbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldFN0cm9uZyhDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gODFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZXhwb3J0ICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAsICdNYXAnLCB7dG9KU09OOiByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ01hcCcpfSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDgyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgZm9yT2YgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIGNsYXNzb2YgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpe1xuICAgIGlmKGNsYXNzb2YodGhpcykgIT0gTkFNRSl0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBmb3JPZih0aGlzLCBmYWxzZSwgYXJyLnB1c2gsIGFycik7XG4gICAgcmV0dXJuIGFycjtcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzXG4gKiogbW9kdWxlIGlkID0gODNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7U3RyaW5nfSBzZWxlY3RvcnNcbiAqL1xuXG5leHBvcnQgY29uc3Qgc2VsZWN0b3JzID0gJ3Njcm9sbGJhciwgW3Njcm9sbGJhcl0sIFtkYXRhLXNjcm9sbGJhcl0nO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9zZWxlY3RvcnMuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL2RlYm91bmNlJztcbmV4cG9ydCAqIGZyb20gJy4vc2V0X3N0eWxlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X2RlbHRhJztcbmV4cG9ydCAqIGZyb20gJy4vZmluZF9jaGlsZCc7XG5leHBvcnQgKiBmcm9tICcuL2J1aWxkX2N1cnZlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3RvdWNoX2lkJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3Bvc2l0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vcGlja19pbl9yYW5nZSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZGVib3VuY2VcbiAqL1xuXG4vLyBkZWJvdW5jZSB0aW1lcnMgcmVzZXQgd2FpdFxuY29uc3QgUkVTRVRfV0FJVCA9IDEwMDtcblxuLyoqXG4gKiBDYWxsIGZuIGlmIGl0IGlzbid0IGJlIGNhbGxlZCBpbiBhIHBlcmlvZFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge051bWJlcn0gW3dhaXRdOiBkZWJvdW5jZSB3YWl0LCBkZWZhdWx0IGlzIFJFU1RfV0FJVFxuICogQHBhcmFtIHtCb29sZWFufSBbaW1tZWRpYXRlXTogd2hldGhlciB0byBydW4gdGFzayBhdCBsZWFkaW5nLCBkZWZhdWx0IGlzIHRydWVcbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGxldCBkZWJvdW5jZSA9IChmbiwgd2FpdCA9IFJFU0VUX1dBSVQsIGltbWVkaWF0ZSA9IHRydWUpID0+IHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICBsZXQgdGltZXI7XG5cbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKCF0aW1lciAmJiBpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gZm4oLi4uYXJncykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBmbiguLi5hcmdzKTtcbiAgICAgICAgfSwgd2FpdCk7XG4gICAgfTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZGVib3VuY2UuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBzZXRTdHlsZVxuICovXG5cbmNvbnN0IFZFTkRPUl9QUkVGSVggPSBbXG4gICAgJ3dlYmtpdCcsXG4gICAgJ21veicsXG4gICAgJ21zJyxcbiAgICAnbydcbl07XG5cbmNvbnN0IFJFID0gbmV3IFJlZ0V4cChgXi0oPyEoPzoke1ZFTkRPUl9QUkVGSVguam9pbignfCcpfSktKWApO1xuXG5sZXQgYXV0b1ByZWZpeCA9IChzdHlsZXMpID0+IHtcbiAgICBjb25zdCByZXMgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBpZiAoIVJFLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgIHJlc1twcm9wXSA9IHN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbCA9IHN0eWxlc1twcm9wXTtcblxuICAgICAgICBwcm9wID0gcHJvcC5yZXBsYWNlKC9eLS8sICcnKTtcbiAgICAgICAgcmVzW3Byb3BdID0gdmFsO1xuXG4gICAgICAgIFZFTkRPUl9QUkVGSVguZm9yRWFjaCgocHJlZml4KSA9PiB7XG4gICAgICAgICAgICByZXNbYC0ke3ByZWZpeH0tJHtwcm9wfWBdID0gdmFsO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogc2V0IGNzcyBzdHlsZSBmb3IgdGFyZ2V0IGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGVzOiBjc3Mgc3R5bGVzIHRvIGFwcGx5XG4gKi9cbmV4cG9ydCBsZXQgc2V0U3R5bGUgPSAoZWxlbSwgc3R5bGVzKSA9PiB7XG4gICAgc3R5bGVzID0gYXV0b1ByZWZpeChzdHlsZXMpO1xuXG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGxldCBjc3NQcm9wID0gcHJvcC5yZXBsYWNlKC9eLS8sICcnKS5yZXBsYWNlKC8tKFthLXpdKS9nLCAobSwgJDEpID0+ICQxLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICBlbGVtLnN0eWxlW2Nzc1Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9zZXRfc3R5bGUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXREZWx0YVxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cbmNvbnN0IERFTFRBX1NDQUxFID0ge1xuICAgIFNUQU5EQVJEOiAxLFxuICAgIE9USEVSUzogLTNcbn07XG5cbmNvbnN0IERFTFRBX01PREUgPSBbMS4wLCAyOC4wLCA1MDAuMF07XG5cbmxldCBnZXREZWx0YU1vZGUgPSAobW9kZSkgPT4gREVMVEFfTU9ERVttb2RlXSB8fCBERUxUQV9NT0RFWzBdO1xuXG4vKipcbiAqIE5vcm1hbGl6aW5nIHdoZWVsIGRlbHRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKi9cbmV4cG9ydCBsZXQgZ2V0RGVsdGEgPSAoZXZ0KSA9PiB7XG4gICAgLy8gZ2V0IG9yaWdpbmFsIERPTSBldmVudFxuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGlmICgnZGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgY29uc3QgbW9kZSA9IGdldERlbHRhTW9kZShldnQuZGVsdGFNb2RlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogZXZ0LmRlbHRhWCAvIERFTFRBX1NDQUxFLlNUQU5EQVJEICogbW9kZSxcbiAgICAgICAgICAgIHk6IGV2dC5kZWx0YVkgLyBERUxUQV9TQ0FMRS5TVEFOREFSRCAqIG1vZGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoJ3doZWVsRGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGV2dC53aGVlbERlbHRhWCAvIERFTFRBX1NDQUxFLk9USEVSUyxcbiAgICAgICAgICAgIHk6IGV2dC53aGVlbERlbHRhWSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIGllIHdpdGggdG91Y2hwYWRcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiBldnQud2hlZWxEZWx0YSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgIH07XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X2RlbHRhLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0T3JpZ2luYWxFdmVudFxuICovXG5cbi8qKlxuICogR2V0IG9yaWdpbmFsIERPTSBldmVudFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge0V2ZW50T2JqZWN0fVxuICovXG5leHBvcnQgbGV0IGdldE9yaWdpbmFsRXZlbnQgPSAoZXZ0KSA9PiB7XG4gICAgcmV0dXJuIGV2dC5vcmlnaW5hbEV2ZW50IHx8IGV2dDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X29yaWdpbmFsX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZmluZENoaWxkXG4gKi9cblxuLyoqXG4gKiBGaW5kIGVsZW1lbnQgd2l0aCBzcGVjaWZpYyBjbGFzcyBuYW1lIHdpdGhpbiBjaGlsZHJlblxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gcGFyZW50RWxlbVxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZVxuICpcbiAqIEByZXR1cm4ge0VsZW1lbnR9OiBmaXJzdCBtYXRjaGVkIGNoaWxkXG4gKi9cbmV4cG9ydCBsZXQgZmluZENoaWxkID0gKHBhcmVudEVsZW0sIGNsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IHBhcmVudEVsZW0uY2hpbGRyZW47XG5cbiAgICBpZiAoIWNoaWxkcmVuKSByZXR1cm4gbnVsbDtcblxuICAgIGZvciAobGV0IGVsZW0gb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGVsZW0uY2xhc3NOYW1lLm1hdGNoKGNsYXNzTmFtZSkpIHJldHVybiBlbGVtO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9maW5kX2NoaWxkLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA5MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvcicpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIGdldCAgICAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5nZXRJdGVyYXRvciA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldChpdCk7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgcmV0dXJuIGFuT2JqZWN0KGl0ZXJGbi5jYWxsKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDkzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBidWlsZEN1cnZlXG4gKi9cblxuLyoqXG4gKiBCdWlsZCBxdWFkcmF0aWMgZWFzaW5nIGN1cnZlXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJlZ2luXG4gKiBAcGFyYW0ge051bWJlcn0gZHVyYXRpb25cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX06IHBvaW50c1xuICovXG5leHBvcnQgbGV0IGJ1aWxkQ3VydmUgPSAoZGlzdGFuY2UsIGR1cmF0aW9uKSA9PiB7XG4gICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgaWYgKGR1cmF0aW9uIDw9IDApIHJldHVybiByZXM7XG5cbiAgICBjb25zdCB0ID0gTWF0aC5yb3VuZChkdXJhdGlvbiAvIDEwMDAgKiA2MCk7XG4gICAgY29uc3QgYSA9IC1kaXN0YW5jZSAvIHQqKjI7XG4gICAgY29uc3QgYiA9IC0yICogYSAqIHQ7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHQ7IGkrKykge1xuICAgICAgICByZXMucHVzaChhICogaSoqMiArIGIgKiBpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9idWlsZF9jdXJ2ZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldFRvdWNoSURcbiAqIEBkZXBlbmRlbmNpZXMgWyBnZXRPcmlnaW5hbEV2ZW50LCBnZXRQb2ludGVyRGF0YSBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcbmltcG9ydCB7IGdldFBvaW50ZXJEYXRhIH0gZnJvbSAnLi9nZXRfcG9pbnRlcl9kYXRhJztcblxuLyoqXG4gKiBHZXQgdG91Y2ggaWRlbnRpZmllclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge051bWJlcn06IHRvdWNoIGlkXG4gKi9cbmV4cG9ydCBsZXQgZ2V0VG91Y2hJRCA9IChldnQpID0+IHtcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICBsZXQgZGF0YSA9IGdldFBvaW50ZXJEYXRhKGV2dCk7XG5cbiAgICByZXR1cm4gZGF0YS5pZGVudGlmaWVyO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9nZXRfdG91Y2hfaWQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXRQb2ludGVyRGF0YVxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cbi8qKlxuICogR2V0IHBvaW50ZXIvdG91Y2ggZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKi9cbmV4cG9ydCBsZXQgZ2V0UG9pbnRlckRhdGEgPSAoZXZ0KSA9PiB7XG4gICAgLy8gaWYgaXMgdG91Y2ggZXZlbnQsIHJldHVybiBsYXN0IGl0ZW0gaW4gdG91Y2hMaXN0XG4gICAgLy8gZWxzZSByZXR1cm4gb3JpZ2luYWwgZXZlbnRcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICByZXR1cm4gZXZ0LnRvdWNoZXMgPyBldnQudG91Y2hlc1tldnQudG91Y2hlcy5sZW5ndGggLSAxXSA6IGV2dDtcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9nZXRfcG9pbnRlcl9kYXRhLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0UG9zaXRpb25cbiAqIEBkZXBlbmRlbmNpZXMgWyBnZXRPcmlnaW5hbEV2ZW50LCBnZXRQb2ludGVyRGF0YSBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcbmltcG9ydCB7IGdldFBvaW50ZXJEYXRhIH0gZnJvbSAnLi9nZXRfcG9pbnRlcl9kYXRhJztcblxuLyoqXG4gKiBHZXQgcG9pbnRlci9maW5nZXIgcG9zaXRpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge09iamVjdH06IHBvc2l0aW9ue3gsIHl9XG4gKi9cbmV4cG9ydCBsZXQgZ2V0UG9zaXRpb24gPSAoZXZ0KSA9PiB7XG4gICAgZXZ0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgbGV0IGRhdGEgPSBnZXRQb2ludGVyRGF0YShldnQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogZGF0YS5jbGllbnRYLFxuICAgICAgICB5OiBkYXRhLmNsaWVudFlcbiAgICB9O1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF9wb3NpdGlvbi5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IHBpY2tJblJhbmdlXG4gKi9cblxuLyoqXG4gKiBQaWNrIHZhbHVlIGluIHJhbmdlIFttaW4sIG1heF1cbiAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICogQHBhcmFtIHtOdW1iZXJ9IFttaW5dXG4gKiBAcGFyYW0ge051bWJlcn0gW21heF1cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydCBsZXQgcGlja0luUmFuZ2UgPSAodmFsdWUsIG1pbiA9IDAsIG1heCA9IDApID0+IE1hdGgubWF4KG1pbiwgTWF0aC5taW4odmFsdWUsIG1heCkpO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvcGlja19pbl9yYW5nZS5qc1xuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vdXBkYXRlJztcbmV4cG9ydCAqIGZyb20gJy4vZGVzdHJveSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9zaXplJztcbmV4cG9ydCAqIGZyb20gJy4vbGlzdGVuZXInO1xuZXhwb3J0ICogZnJvbSAnLi9zY3JvbGxfdG8nO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9wb3NpdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL3RvZ2dsZV90cmFjayc7XG5leHBvcnQgKiBmcm9tICcuL2luZmluaXRlX3Njcm9sbCc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9jb250ZW50X2VsZW0nO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSB1cGRhdGVcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSwgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogVXBkYXRlIHNjcm9sbGJhcnMgYXBwZWFyYW5jZVxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYXN5bmM6IHVwZGF0ZSBhc3luY2hyb25vdXNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihhc3luYyA9IHRydWUpIHtcbiAgICBsZXQgdXBkYXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcblxuICAgICAgICBsZXQgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuXG4gICAgICAgIHRoaXMuX19yZWFkb25seSgnc2l6ZScsIHNpemUpO1xuXG4gICAgICAgIGxldCBuZXdMaW1pdCA9IHtcbiAgICAgICAgICAgIHg6IHNpemUuY29udGVudC53aWR0aCAtIHNpemUuY29udGFpbmVyLndpZHRoLFxuICAgICAgICAgICAgeTogc2l6ZS5jb250ZW50LmhlaWdodCAtIHNpemUuY29udGFpbmVyLmhlaWdodFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmxpbWl0ICYmXG4gICAgICAgICAgICBuZXdMaW1pdC54ID09PSB0aGlzLmxpbWl0LnggJiZcbiAgICAgICAgICAgIG5ld0xpbWl0LnkgPT09IHRoaXMubGltaXQueSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX19yZWFkb25seSgnbGltaXQnLCBuZXdMaW1pdCk7XG5cbiAgICAgICAgbGV0IHsgeEF4aXMsIHlBeGlzIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICAgICAgLy8gaGlkZSBzY3JvbGxiYXIgaWYgY29udGVudCBzaXplIGxlc3MgdGhhbiBjb250YWluZXJcbiAgICAgICAgc2V0U3R5bGUoeEF4aXMudHJhY2ssIHtcbiAgICAgICAgICAgICdkaXNwbGF5Jzogc2l6ZS5jb250ZW50LndpZHRoIDw9IHNpemUuY29udGFpbmVyLndpZHRoID8gJ25vbmUnIDogJ2Jsb2NrJ1xuICAgICAgICB9KTtcbiAgICAgICAgc2V0U3R5bGUoeUF4aXMudHJhY2ssIHtcbiAgICAgICAgICAgICdkaXNwbGF5Jzogc2l6ZS5jb250ZW50LmhlaWdodCA8PSBzaXplLmNvbnRhaW5lci5oZWlnaHQgPyAnbm9uZScgOiAnYmxvY2snXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHVzZSBwZXJjZW50YWdlIHZhbHVlIGZvciB0aHVtYlxuICAgICAgICBzZXRTdHlsZSh4QXhpcy50aHVtYiwge1xuICAgICAgICAgICAgJ3dpZHRoJzogYCR7cGlja0luUmFuZ2Uoc2l6ZS5jb250YWluZXIud2lkdGggLyBzaXplLmNvbnRlbnQud2lkdGgsIDAsIDEpICogMTAwfSVgXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRTdHlsZSh5QXhpcy50aHVtYiwge1xuICAgICAgICAgICAgJ2hlaWdodCc6IGAke3BpY2tJblJhbmdlKHNpemUuY29udGFpbmVyLmhlaWdodCAvIHNpemUuY29udGVudC5oZWlnaHQsIDAsIDEpICogMTAwfSVgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlLXBvc2l0aW9uaW5nXG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0LCBsaW1pdCB9ID0gdGhpcztcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihNYXRoLm1pbihvZmZzZXQueCwgbGltaXQueCksIE1hdGgubWluKG9mZnNldC55LCBsaW1pdC55KSk7XG4gICAgICAgIHRoaXMuX19zZXRUaHVtYlBvc2l0aW9uKCk7XG4gICAgfTtcblxuICAgIGlmIChhc3luYykge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGUoKTtcbiAgICB9XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvdXBkYXRlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gZGVzdHJveVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBzYkxpc3QgfSBmcm9tICcuLi9zaGFyZWQnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBSZW1vdmUgYWxsIHNjcm9sbGJhciBsaXN0ZW5lcnMgYW5kIGV2ZW50IGhhbmRsZXJzXG4gKiBSZXNldFxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IF9fbGlzdGVuZXJzLCBfX2hhbmRsZXJzLCB0YXJnZXRzIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCBjb250ZW50IH0gPSB0YXJnZXRzO1xuXG4gICAgX19oYW5kbGVycy5mb3JFYWNoKCh7IGV2dCwgZWxlbSwgaGFuZGxlciB9KSA9PiB7XG4gICAgICAgIGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGhhbmRsZXIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zY3JvbGxUbygwLCAwLCAzMDAsICgpID0+IHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fX3RpbWVySUQuc2Nyb2xsQW5pbWF0aW9uKTtcbiAgICAgICAgX19oYW5kbGVycy5sZW5ndGggPSBfX2xpc3RlbmVycy5sZW5ndGggPSAwO1xuXG4gICAgICAgIC8vIHJlc2V0IHNjcm9sbCBwb3NpdGlvblxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcbiAgICAgICAgICAgIG92ZXJmbG93OiAnJ1xuICAgICAgICB9KTtcblxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xuXG4gICAgICAgIC8vIHJlc2V0IGNvbnRlbnRcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBbLi4uY29udGVudC5jaGlsZHJlbl07XG5cbiAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goKGVsKSA9PiBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpKTtcblxuICAgICAgICAvLyByZW1vdmUgZm9ybSBzYkxpc3RcbiAgICAgICAgc2JMaXN0LmRlbGV0ZShjb250YWluZXIpO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2Rlc3Ryb3kuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBnZXRTaXplXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIEdldCBjb250YWluZXIgYW5kIGNvbnRlbnQgc2l6ZVxuICpcbiAqIEByZXR1cm4ge09iamVjdH06IGFuIG9iamVjdCBjb250YWlucyBjb250YWluZXIgYW5kIGNvbnRlbnQncyB3aWR0aCBhbmQgaGVpZ2h0XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLnRhcmdldHMuY29udGFpbmVyO1xuICAgIGxldCBjb250ZW50ID0gdGhpcy50YXJnZXRzLmNvbnRlbnQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250YWluZXI6IHtcbiAgICAgICAgICAgIC8vIHJlcXVpcmVzIGBvdmVyZmxvdzogaGlkZGVuYFxuICAgICAgICAgICAgd2lkdGg6IGNvbnRhaW5lci5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogY29udGFpbmVyLmNsaWVudEhlaWdodFxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAvLyBib3JkZXIgd2lkdGggc2hvdWxkIGJlIGluY2x1ZGVkXG4gICAgICAgICAgICB3aWR0aDogY29udGVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogY29udGVudC5vZmZzZXRIZWlnaHRcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvZ2V0X3NpemUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBhZGRMaXN0ZW5lclxuICogICAgICAgICAgICB7RnVuY3Rpb259IHJlbW92ZUxpc3RlbmVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIEFkZCBzY3JvbGxpbmcgbGlzdGVuZXJcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYjogbGlzdGVuZXJcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgdGhpcy5fX2xpc3RlbmVycy5wdXNoKGNiKTtcbn07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogUmVtb3ZlIHNwZWNpZmljIGxpc3RlbmVyIGZyb20gYWxsIGxpc3RlbmVyc1xuICogQHBhcmFtIHt0eXBlfSBwYXJhbTogZGVzY3JpcHRpb25cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgdGhpcy5fX2xpc3RlbmVycy5zb21lKChmbiwgaWR4LCBhbGwpID0+IHtcbiAgICAgICAgcmV0dXJuIGZuID09PSBjYiAmJiBhbGwuc3BsaWNlKGlkeCwgMSk7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvbGlzdGVuZXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzY3JvbGxUb1xuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlLCBidWlsZEN1cnZlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFNjcm9sbGluZyBzY3JvbGxiYXIgdG8gcG9zaXRpb24gd2l0aCB0cmFuc2l0aW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt4XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHggYXhpc1xuICogQHBhcmFtIHtOdW1iZXJ9IFt5XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHkgYXhpc1xuICogQHBhcmFtIHtOdW1iZXJ9IFtkdXJhdGlvbl06IHRyYW5zaXRpb24gZHVyYXRpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl06IGNhbGxiYWNrXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc2Nyb2xsVG8gPSBmdW5jdGlvbih4ID0gdGhpcy5vZmZzZXQueCwgeSA9IHRoaXMub2Zmc2V0LnksIGR1cmF0aW9uID0gMCwgY2IgPSBudWxsKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIGxpbWl0LFxuICAgICAgICB2ZWxvY2l0eSxcbiAgICAgICAgX190aW1lcklEXG4gICAgfSA9IHRoaXM7XG5cbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZShfX3RpbWVySUQuc2Nyb2xsVG8pO1xuICAgIGNiID0gdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nID8gY2IgOiAoKSA9PiB7fTtcblxuICAgIGNvbnN0IHN0YXJ0WCA9IG9mZnNldC54O1xuICAgIGNvbnN0IHN0YXJ0WSA9IG9mZnNldC55O1xuXG4gICAgY29uc3QgZGlzWCA9IHBpY2tJblJhbmdlKHgsIDAsIGxpbWl0LngpIC0gc3RhcnRYO1xuICAgIGNvbnN0IGRpc1kgPSBwaWNrSW5SYW5nZSh5LCAwLCBsaW1pdC55KSAtIHN0YXJ0WTtcblxuICAgIGNvbnN0IGN1cnZlWCA9IGJ1aWxkQ3VydmUoZGlzWCwgZHVyYXRpb24pO1xuICAgIGNvbnN0IGN1cnZlWSA9IGJ1aWxkQ3VydmUoZGlzWSwgZHVyYXRpb24pO1xuXG4gICAgbGV0IGZyYW1lID0gMCwgdG90YWxGcmFtZSA9IGN1cnZlWC5sZW5ndGg7XG5cbiAgICBsZXQgc2Nyb2xsID0gKCkgPT4ge1xuICAgICAgICBpZiAoZnJhbWUgPT09IHRvdGFsRnJhbWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNiKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHN0YXJ0WCArIGN1cnZlWFtmcmFtZV0sIHN0YXJ0WSArIGN1cnZlWVtmcmFtZV0pO1xuXG4gICAgICAgIGZyYW1lKys7XG5cbiAgICAgICAgX190aW1lcklELnNjcm9sbFRvID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbCk7XG4gICAgfTtcblxuICAgIHNjcm9sbCgpO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3Njcm9sbF90by5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNldE9wdGlvbnNcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5pbXBvcnQgeyBPUFRJT05fTElNSVQgfSBmcm9tICcuLi9zaGFyZWQvJztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTZXQgc2Nyb2xsYmFyIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zID0ge30pIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvc2V0X29wdGlvbnMuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnblwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gMTA2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmFzc2lnbjtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSAxMDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYsICdPYmplY3QnLCB7YXNzaWduOiByZXF1aXJlKCcuLyQub2JqZWN0LWFzc2lnbicpfSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gMTA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgSU9iamVjdCAgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpO1xuXG4vLyBzaG91bGQgd29yayB3aXRoIHN5bWJvbHMgYW5kIHNob3VsZCBoYXZlIGRldGVybWluaXN0aWMgcHJvcGVydHkgb3JkZXIgKFY4IGJ1Zylcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXtcbiAgdmFyIGEgPSBPYmplY3QuYXNzaWduXG4gICAgLCBBID0ge31cbiAgICAsIEIgPSB7fVxuICAgICwgUyA9IFN5bWJvbCgpXG4gICAgLCBLID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0JztcbiAgQVtTXSA9IDc7XG4gIEsuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24oayl7IEJba10gPSBrOyB9KTtcbiAgcmV0dXJuIGEoe30sIEEpW1NdICE9IDcgfHwgT2JqZWN0LmtleXMoYSh7fSwgQikpLmpvaW4oJycpICE9IEs7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgdmFyIFQgICAgID0gdG9PYmplY3QodGFyZ2V0KVxuICAgICwgJCQgICAgPSBhcmd1bWVudHNcbiAgICAsICQkbGVuID0gJCQubGVuZ3RoXG4gICAgLCBpbmRleCA9IDFcbiAgICAsIGdldEtleXMgICAgPSAkLmdldEtleXNcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHNcbiAgICAsIGlzRW51bSAgICAgPSAkLmlzRW51bTtcbiAgd2hpbGUoJCRsZW4gPiBpbmRleCl7XG4gICAgdmFyIFMgICAgICA9IElPYmplY3QoJCRbaW5kZXgrK10pXG4gICAgICAsIGtleXMgICA9IGdldFN5bWJvbHMgPyBnZXRLZXlzKFMpLmNvbmNhdChnZXRTeW1ib2xzKFMpKSA6IGdldEtleXMoUylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaiAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUobGVuZ3RoID4gailpZihpc0VudW0uY2FsbChTLCBrZXkgPSBrZXlzW2orK10pKVRba2V5XSA9IFNba2V5XTtcbiAgfVxuICByZXR1cm4gVDtcbn0gOiBPYmplY3QuYXNzaWduO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSAxMDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNldFBvc2l0aW9uXG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UsIHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFNldCBzY3JvbGxiYXIgcG9zaXRpb24gd2l0aG91dCB0cmFuc2l0aW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt4XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHggYXhpc1xuICogQHBhcmFtIHtOdW1iZXJ9IFt5XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHkgYXhpc1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCA9IHRoaXMub2Zmc2V0LngsIHkgPSB0aGlzLm9mZnNldC55KSB7XG4gICAgdGhpcy5fX3VwZGF0ZVRocm90dGxlKCk7XG5cbiAgICBjb25zdCBzdGF0dXMgPSB7fTtcbiAgICBjb25zdCB7IG9mZnNldCwgbGltaXQsIHRhcmdldHMsIF9fbGlzdGVuZXJzIH0gPSB0aGlzO1xuXG4gICAgaWYgKE1hdGguYWJzKHggLSBvZmZzZXQueCkgPiAxKSB0aGlzLnNob3dUcmFjaygneCcpO1xuICAgIGlmIChNYXRoLmFicyh5IC0gb2Zmc2V0LnkpID4gMSkgdGhpcy5zaG93VHJhY2soJ3knKTtcblxuICAgIHggPSBwaWNrSW5SYW5nZSh4LCAwLCBsaW1pdC54KTtcbiAgICB5ID0gcGlja0luUmFuZ2UoeSwgMCwgbGltaXQueSk7XG5cbiAgICB0aGlzLmhpZGVUcmFjaygpO1xuXG4gICAgaWYgKHggPT09IG9mZnNldC54ICYmIHkgPT09IG9mZnNldC55KSByZXR1cm47XG5cbiAgICBzdGF0dXMuZGlyZWN0aW9uID0ge1xuICAgICAgICB4OiB4ID09PSBvZmZzZXQueCA/ICdub25lJyA6ICh4ID4gb2Zmc2V0LnggPyAncmlnaHQnIDogJ2xlZnQnKSxcbiAgICAgICAgeTogeSA9PT0gb2Zmc2V0LnkgPyAnbm9uZScgOiAoeSA+IG9mZnNldC55ID8gJ2Rvd24nIDogJ3VwJylcbiAgICB9O1xuXG4gICAgc3RhdHVzLmxpbWl0ID0geyAuLi5saW1pdCB9O1xuXG4gICAgb2Zmc2V0LnggPSB4O1xuICAgIG9mZnNldC55ID0geTtcbiAgICBzdGF0dXMub2Zmc2V0ID0geyAuLi5vZmZzZXQgfTtcblxuICAgIC8vIHJlc2V0IHRodW1iIHBvc2l0aW9uIGFmdGVyIG9mZnNldCB1cGRhdGVcbiAgICB0aGlzLl9fc2V0VGh1bWJQb3NpdGlvbigpO1xuXG4gICAgc2V0U3R5bGUodGFyZ2V0cy5jb250ZW50LCB7XG4gICAgICAgICctdHJhbnNmb3JtJzogYHRyYW5zbGF0ZTNkKCR7LXh9cHgsICR7LXl9cHgsIDApYFxuICAgIH0pO1xuXG4gICAgLy8gaW52b2tlIGFsbCBsaXN0ZW5lcnNcbiAgICBfX2xpc3RlbmVycy5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgZm4oc3RhdHVzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvc2V0X3Bvc2l0aW9uLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGFzc2lnbiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnblwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX09iamVjdCRhc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9leHRlbmRzLmpzXG4gKiogbW9kdWxlIGlkID0gMTExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzaG93VHJhY2tcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBoaWRlVHJhY2tcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogc2hvdyBzY3JvbGxiYXIgdHJhY2sgb24gZ2l2ZW4gZGlyZWN0aW9uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbjogd2hpY2ggZGlyZWN0aW9uIG9mIHRyYWNrcyB0byBzaG93LCBkZWZhdWx0IGlzICdib3RoJ1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNob3dUcmFjayA9IGZ1bmN0aW9uKGRpcmVjdGlvbiA9ICdib3RoJykge1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCB4QXhpcywgeUF4aXMgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzY3JvbGxpbmcnKTtcblxuICAgIGlmIChkaXJlY3Rpb24gPT09ICdib3RoJykge1xuICAgICAgICB4QXhpcy50cmFjay5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgICAgIHlBeGlzLnRyYWNrLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSAneCcpIHtcbiAgICAgICAgeEF4aXMudHJhY2suY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gPT09ICd5Jykge1xuICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBoaWRlIHRyYWNrIHdpdGggMzAwbXMgZGVib3VuY2VcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5oaWRlVHJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IHRhcmdldHMsIF9fdGltZXJJRCB9ID0gdGhpcztcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgeEF4aXMsIHlBeGlzIH0gPSB0YXJnZXRzO1xuXG4gICAgY2xlYXJUaW1lb3V0KF9fdGltZXJJRC50cmFjayk7XG5cbiAgICBfX3RpbWVySUQudHJhY2sgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbGluZycpO1xuICAgICAgICB4QXhpcy50cmFjay5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgIHlBeGlzLnRyYWNrLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICB9LCAzMDApO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3RvZ2dsZV90cmFjay5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGluZmluaXRlU2Nyb2xsXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIENyZWF0ZSBpbmZpbml0ZSBzY3JvbGwgbGlzdGVuZXJcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYjogaW5maW5pdGUgc2Nyb2xsIGFjdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IFt0aHJlc2hvbGRdOiBpbmZpbml0ZSBzY3JvbGwgdGhyZXNob2xkKHRvIGJvdHRvbSksIGRlZmF1bHQgaXMgNTAocHgpXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuaW5maW5pdGVTY3JvbGwgPSBmdW5jdGlvbihjYiwgdGhyZXNob2xkID0gNTApIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICBsZXQgbGFzdE9mZnNldCA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZW50ZXJlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5hZGRMaXN0ZW5lcigoc3RhdHVzKSA9PiB7XG4gICAgICAgIGxldCB7IG9mZnNldCwgbGltaXQgfSA9IHN0YXR1cztcblxuICAgICAgICBpZiAobGltaXQueSAtIG9mZnNldC55IDw9IHRocmVzaG9sZCAmJiBvZmZzZXQueSA+IGxhc3RPZmZzZXQueSAmJiAhZW50ZXJlZCkge1xuICAgICAgICAgICAgZW50ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGNiKHN0YXR1cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpbWl0LnkgLSBvZmZzZXQueSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgZW50ZXJlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdE9mZnNldCA9IG9mZnNldDtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9pbmZpbml0ZV9zY3JvbGwuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBnZXRDb250ZW50RWxlbVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBHZXQgc2Nyb2xsIGNvbnRlbnQgZWxlbWVudFxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmdldENvbnRlbnRFbGVtID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0cy5jb250ZW50O1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2dldF9jb250ZW50X2VsZW0uanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlbmRlcic7XG5leHBvcnQgKiBmcm9tICcuL2FkZF9tb3ZlbWVudCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9tb3ZlbWVudCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19yZW5kZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIG5leHRUaWNrKG9wdGlvbnMsIGN1cnJlbnQsIG1vdmVtZW50KSB7XG4gICAgY29uc3QgeyBmcmljdG9uIH0gPSBvcHRpb25zO1xuXG4gICAgaWYgKE1hdGguYWJzKG1vdmVtZW50KSA8IDEpIHtcbiAgICAgICAgbGV0IG5leHQgPSBjdXJyZW50ICsgbW92ZW1lbnQ7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1vdmVtZW50OiAwLFxuICAgICAgICAgICAgcG9zaXRpb246IGN1cnJlbnQgPiBuZXh0ID8gTWF0aC5jZWlsKG5leHQpIDogTWF0aC5mbG9vcihuZXh0KVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGxldCBxID0gMSAtIGZyaWN0b24gLyAxMDA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBtb3ZlbWVudDogbW92ZW1lbnQgKiBxLFxuICAgICAgICBwb3NpdGlvbjogY3VycmVudCArIG1vdmVtZW50ICogKDEgLSBxKVxuICAgIH07XG59O1xuXG5mdW5jdGlvbiBfX3JlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgbW92ZW1lbnQsXG4gICAgICAgIF9fdGltZXJJRFxuICAgIH0gPSB0aGlzO1xuXG4gICAgaWYgKG1vdmVtZW50LnggfHwgbW92ZW1lbnQueSkge1xuICAgICAgICBsZXQgbmV4dFggPSBuZXh0VGljayhvcHRpb25zLCBvZmZzZXQueCwgbW92ZW1lbnQueCk7XG4gICAgICAgIGxldCBuZXh0WSA9IG5leHRUaWNrKG9wdGlvbnMsIG9mZnNldC55LCBtb3ZlbWVudC55KTtcblxuICAgICAgICBtb3ZlbWVudC54ID0gbmV4dFgubW92ZW1lbnQ7XG4gICAgICAgIG1vdmVtZW50LnkgPSBuZXh0WS5tb3ZlbWVudDtcblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKG5leHRYLnBvc2l0aW9uLCBuZXh0WS5wb3NpdGlvbik7XG4gICAgfVxuXG4gICAgX190aW1lcklELnNjcm9sbEFuaW1hdGlvbiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzOjpfX3JlbmRlcik7XG5cbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19yZW5kZXInLCB7XG4gICAgdmFsdWU6IF9fcmVuZGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL3JlbmRlci5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fYWRkTW92ZW1lbnRcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fYWRkTW92ZW1lbnQoZGVsdGFYID0gMCwgZGVsdGFZID0gMCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgbW92ZW1lbnRcbiAgICB9ID0gdGhpcztcblxuICAgIHRoaXMuX191cGRhdGVUaHJvdHRsZSgpO1xuXG4gICAgbGV0IGxpbWl0ID0gdGhpcy5fX2dldERlbHRhTGltaXQoKTtcblxuICAgIG1vdmVtZW50LnggPSBwaWNrSW5SYW5nZShtb3ZlbWVudC54ICsgZGVsdGFYICogb3B0aW9ucy5zcGVlZCwgLi4ubGltaXQueCk7XG4gICAgbW92ZW1lbnQueSA9IHBpY2tJblJhbmdlKG1vdmVtZW50LnkgKyBkZWx0YVkgKiBvcHRpb25zLnNwZWVkLCAuLi5saW1pdC55KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19hZGRNb3ZlbWVudCcsIHtcbiAgICB2YWx1ZTogX19hZGRNb3ZlbWVudCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9hZGRfbW92ZW1lbnQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3NldE1vdmVtZW50XG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX3NldE1vdmVtZW50KGRlbHRhWCA9IDAsIGRlbHRhWSA9IDApIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG1vdmVtZW50XG4gICAgfSA9IHRoaXM7XG5cbiAgICB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcblxuICAgIGxldCBsaW1pdCA9IHRoaXMuX19nZXREZWx0YUxpbWl0KCk7XG5cbiAgICBtb3ZlbWVudC54ID0gcGlja0luUmFuZ2UoZGVsdGFYICogb3B0aW9ucy5zcGVlZCwgLi4ubGltaXQueCk7XG4gICAgbW92ZW1lbnQueSA9IHBpY2tJblJhbmdlKGRlbHRhWSAqIG9wdGlvbnMuc3BlZWQsIC4uLmxpbWl0LnkpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3NldE1vdmVtZW50Jywge1xuICAgIHZhbHVlOiBfX3NldE1vdmVtZW50LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL3NldF9tb3ZlbWVudC5qc1xuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vZHJhZyc7XG5leHBvcnQgKiBmcm9tICcuL3RvdWNoJztcbmV4cG9ydCAqIGZyb20gJy4vbW91c2UnO1xuZXhwb3J0ICogZnJvbSAnLi93aGVlbCc7XG5leHBvcnQgKiBmcm9tICcuL3Jlc2l6ZSc7XG5leHBvcnQgKiBmcm9tICcuL3NlbGVjdCc7XG5leHBvcnQgKiBmcm9tICcuL2tleWJvYXJkJztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2RyYWdIYW5kbGVyXG4gKi9cblxuIGltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuIGltcG9ydCB7XG4gICAgZ2V0T3JpZ2luYWxFdmVudCxcbiAgICBnZXRQb3NpdGlvbixcbiAgICBnZXRUb3VjaElELFxuICAgIHBpY2tJblJhbmdlLFxuICAgIHNldFN0eWxlXG59IGZyb20gJy4uL3V0aWxzL2luZGV4JztcblxuIGV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4gbGV0IF9fZHJhZ0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgY29udGVudCB9ID0gdGhpcy50YXJnZXRzO1xuXG4gICAgbGV0IGlzRHJhZyA9IGZhbHNlO1xuICAgIGxldCBhbmltYXRpb24gPSB1bmRlZmluZWQ7XG4gICAgbGV0IHRhcmdldEhlaWdodCA9IHVuZGVmaW5lZDtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX19pc0RyYWcnLCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0RyYWc7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBsZXQgc2Nyb2xsID0gKHsgeCwgeSB9KSA9PiB7XG4gICAgICAgIGlmICgheCAmJiAheSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX19zZXRNb3ZlbWVudCh4LCB5KTtcblxuICAgICAgICBhbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgc2Nyb2xsKHsgeCwgeSB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChkb2N1bWVudCwgJ2RyYWdvdmVyIG1vdXNlbW92ZSB0b3VjaG1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNEcmFnIHx8IHRoaXMuX19pZ25vcmVFdmVudChldnQpKSByZXR1cm47XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX19nZXRQb2ludGVyVHJlbmQoZXZ0LCB0YXJnZXRIZWlnaHQpO1xuXG4gICAgICAgIHNjcm9sbChkaXIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2RyYWdzdGFydCcsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpKSByZXR1cm47XG5cbiAgICAgICAgc2V0U3R5bGUoY29udGVudCwge1xuICAgICAgICAgICAgJ3BvaW50ZXItZXZlbnRzJzogJ2F1dG8nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRhcmdldEhlaWdodCA9IGV2dC50YXJnZXQuY2xpZW50SGVpZ2h0O1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcbiAgICAgICAgaXNEcmFnID0gdHJ1ZTtcbiAgICB9KTtcbiAgICB0aGlzLl9fYWRkRXZlbnQoZG9jdW1lbnQsICdkcmFnZW5kIG1vdXNldXAgdG91Y2hlbmQgYmx1cicsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpKSByZXR1cm47XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XG4gICAgICAgIGlzRHJhZyA9IGZhbHNlO1xuICAgIH0pO1xuIH07XG5cbiBPYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fZHJhZ0hhbmRsZXInLCB7XG4gICAgIHZhbHVlOiBfX2RyYWdIYW5kbGVyLFxuICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gfSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvZHJhZy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fdG91Y2hIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQge1xuICAgIGdldE9yaWdpbmFsRXZlbnQsXG4gICAgZ2V0UG9zaXRpb24sXG4gICAgZ2V0VG91Y2hJRCxcbiAgICBwaWNrSW5SYW5nZVxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5jb25zdCBFQVNJTkdfRFVSQVRJT04gPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9hbmRyb2lkL2kpID8gMTUwMCA6IDc1MDtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFRvdWNoIGV2ZW50IGhhbmRsZXJzIGJ1aWxkZXJcbiAqL1xubGV0IF9fdG91Y2hIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGxldCBsYXN0VG91Y2hUaW1lLCBsYXN0VG91Y2hJRDtcbiAgICBsZXQgbW92ZVZlbG9jaXR5ID0ge30sIGxhc3RUb3VjaFBvcyA9IHt9LCB0b3VjaFJlY29yZHMgPSB7fTtcblxuICAgIGxldCB1cGRhdGVSZWNvcmRzID0gKGV2dCkgPT4ge1xuICAgICAgICBjb25zdCB0b3VjaExpc3QgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCkudG91Y2hlcztcblxuICAgICAgICBPYmplY3Qua2V5cyh0b3VjaExpc3QpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgLy8gcmVjb3JkIGFsbCB0b3VjaGVzIHRoYXQgd2lsbCBiZSByZXN0b3JlZFxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2xlbmd0aCcpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgdG91Y2ggPSB0b3VjaExpc3Rba2V5XTtcblxuICAgICAgICAgICAgdG91Y2hSZWNvcmRzW3RvdWNoLmlkZW50aWZpZXJdID0gZ2V0UG9zaXRpb24odG91Y2gpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3RvdWNoc3RhcnQnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faXNEcmFnKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgeyBtb3ZlbWVudCB9ID0gdGhpcztcblxuICAgICAgICB1cGRhdGVSZWNvcmRzKGV2dCk7XG5cbiAgICAgICAgbGFzdFRvdWNoVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIGxhc3RUb3VjaElEID0gZ2V0VG91Y2hJRChldnQpO1xuICAgICAgICBsYXN0VG91Y2hQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgICAgIC8vIHN0b3Agc2Nyb2xsaW5nXG4gICAgICAgIG1vdmVtZW50LnggPSBtb3ZlbWVudC55ID0gMDtcbiAgICAgICAgbW92ZVZlbG9jaXR5LnggPSBtb3ZlVmVsb2NpdHkueSA9IDA7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAndG91Y2htb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkgfHwgdGhpcy5fX2lzRHJhZykgcmV0dXJuO1xuXG4gICAgICAgIHVwZGF0ZVJlY29yZHMoZXZ0KTtcblxuICAgICAgICBjb25zdCB0b3VjaElEID0gZ2V0VG91Y2hJRChldnQpO1xuICAgICAgICBjb25zdCB7IG9mZnNldCwgbGltaXQgfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKGxhc3RUb3VjaElEID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIHJlc2V0IGxhc3QgdG91Y2ggaW5mbyBmcm9tIHJlY29yZHNcbiAgICAgICAgICAgIGxhc3RUb3VjaElEID0gdG91Y2hJRDtcblxuICAgICAgICAgICAgLy8gZG9uJ3QgbmVlZCBlcnJvciBoYW5kbGVyXG4gICAgICAgICAgICBsYXN0VG91Y2hUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIGxhc3RUb3VjaFBvcyA9IHRvdWNoUmVjb3Jkc1t0b3VjaElEXTtcbiAgICAgICAgfSBlbHNlIGlmICh0b3VjaElEICE9PSBsYXN0VG91Y2hJRCkge1xuICAgICAgICAgICAgLy8gcHJldmVudCBtdWx0aS10b3VjaCBib3VuY2luZ1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFsYXN0VG91Y2hQb3MpIHJldHVybjtcblxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBsZXQgZHVyYXRpb24gPSBEYXRlLm5vdygpIC0gbGFzdFRvdWNoVGltZTtcbiAgICAgICAgbGV0IHsgeDogbGFzdFgsIHk6IGxhc3RZIH0gPSBsYXN0VG91Y2hQb3M7XG4gICAgICAgIGxldCB7IHg6IGN1clgsIHk6IGN1clkgfSA9IGxhc3RUb3VjaFBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICAgICAgZHVyYXRpb24gPSBkdXJhdGlvbiB8fCAxOyAvLyBmaXggSW5maW5pdHkgZXJyb3JcblxuICAgICAgICBtb3ZlVmVsb2NpdHkueCA9IChsYXN0WCAtIGN1clgpIC8gZHVyYXRpb247XG4gICAgICAgIG1vdmVWZWxvY2l0eS55ID0gKGxhc3RZIC0gY3VyWSkgLyBkdXJhdGlvbjtcblxuICAgICAgICBsZXQgZGVzdFggPSBwaWNrSW5SYW5nZShsYXN0WCAtIGN1clggKyBvZmZzZXQueCwgMCwgbGltaXQueCk7XG4gICAgICAgIGxldCBkZXN0WSA9IHBpY2tJblJhbmdlKGxhc3RZIC0gY3VyWSArIG9mZnNldC55LCAwLCBsaW1pdC55KTtcblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKGRlc3RYLCBkZXN0WSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAndG91Y2hlbmQnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSB8fCB0aGlzLl9faXNEcmFnKSByZXR1cm47XG5cbiAgICAgICAgLy8gcmVsZWFzZSBjdXJyZW50IHRvdWNoXG4gICAgICAgIGRlbGV0ZSB0b3VjaFJlY29yZHNbbGFzdFRvdWNoSURdO1xuICAgICAgICBsYXN0VG91Y2hJRCA9IHVuZGVmaW5lZDtcblxuICAgICAgICBsZXQgeyB4LCB5IH0gPSBtb3ZlVmVsb2NpdHk7XG5cbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KFxuICAgICAgICAgICAgeCA/IHggLyBNYXRoLmFicyh4KSAqIE1hdGguc3FydChNYXRoLmFicyh4KSAqIDFlMykgKiAyMCA6IDAsXG4gICAgICAgICAgICB5ID8geSAvIE1hdGguYWJzKHkpICogTWF0aC5zcXJ0KE1hdGguYWJzKHkpICogMWUzKSAqIDIwIDogMFxuICAgICAgICApO1xuXG4gICAgICAgIG1vdmVWZWxvY2l0eS54ID0gbW92ZVZlbG9jaXR5LnkgPSAwO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3RvdWNoSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX190b3VjaEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy90b3VjaC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fbW91c2VIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXRQb3NpdGlvbiwgZ2V0VG91Y2hJRCwgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogTW91c2UgZXZlbnQgaGFuZGxlcnMgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqL1xubGV0IF9fbW91c2VIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcbiAgICBsZXQgaXNNb3VzZURvd24sIGlzTW91c2VNb3ZlLCBzdGFydE9mZnNldFRvVGh1bWIsIHN0YXJ0VHJhY2tEaXJlY3Rpb24sIGNvbnRhaW5lclJlY3Q7XG5cbiAgICBsZXQgZ2V0VHJhY2tEaXIgPSAoY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgIGxldCBtYXRjaGVzID0gY2xhc3NOYW1lLm1hdGNoKC9zY3JvbGxiYXJcXC0oPzp0cmFja3x0aHVtYilcXC0oW3h5XSkvKTtcblxuICAgICAgICByZXR1cm4gbWF0Y2hlcyAmJiBtYXRjaGVzWzFdO1xuICAgIH07XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAnY2xpY2snLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmIChpc01vdXNlTW92ZSB8fCAhL3Njcm9sbGJhci10cmFjay8udGVzdChldnQudGFyZ2V0LmNsYXNzTmFtZSkgfHwgdGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkpIHJldHVybjtcblxuICAgICAgICBsZXQgdHJhY2sgPSBldnQudGFyZ2V0O1xuICAgICAgICBsZXQgZGlyZWN0aW9uID0gZ2V0VHJhY2tEaXIodHJhY2suY2xhc3NOYW1lKTtcbiAgICAgICAgbGV0IHJlY3QgPSB0cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IGNsaWNrUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICBjb25zdCB7IHNpemUsIG9mZnNldCB9ID0gdGhpcztcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAneCcpIHtcbiAgICAgICAgICAgIGxldCB0aHVtYlNpemUgPSBwaWNrSW5SYW5nZShzaXplLmNvbnRhaW5lci53aWR0aCAvIHNpemUuY29udGVudC53aWR0aCwgMCwgMSk7XG4gICAgICAgICAgICBsZXQgY2xpY2tPZmZzZXQgPSAoY2xpY2tQb3MueCAtIHJlY3QubGVmdCkgLyBzaXplLmNvbnRhaW5lci53aWR0aDtcblxuICAgICAgICAgICAgdGhpcy5tb3ZlbWVudC54ID0gKGNsaWNrT2Zmc2V0IC0gdGh1bWJTaXplIC8gMikgKiBzaXplLmNvbnRlbnQud2lkdGggLSBvZmZzZXQueDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCB0aHVtYlNpemUgPSBwaWNrSW5SYW5nZShzaXplLmNvbnRhaW5lci5oZWlnaHQgLyBzaXplLmNvbnRlbnQuaGVpZ2h0LCAwLCAxKTtcbiAgICAgICAgICAgIGxldCBjbGlja09mZnNldCA9IChjbGlja1Bvcy55IC0gcmVjdC50b3ApIC8gc2l6ZS5jb250YWluZXIuaGVpZ2h0O1xuXG4gICAgICAgICAgICB0aGlzLm1vdmVtZW50LnkgPSAoY2xpY2tPZmZzZXQgLSB0aHVtYlNpemUgLyAyKSAqIHNpemUuY29udGVudC5oZWlnaHQgLSBvZmZzZXQueTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ21vdXNlZG93bicsIChldnQpID0+IHtcbiAgICAgICAgaWYgKCEvc2Nyb2xsYmFyLXRodW1iLy50ZXN0KGV2dC50YXJnZXQuY2xhc3NOYW1lKSB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBpc01vdXNlRG93biA9IHRydWU7XG5cbiAgICAgICAgbGV0IGN1cnNvclBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG4gICAgICAgIGxldCB0aHVtYlJlY3QgPSBldnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIHN0YXJ0VHJhY2tEaXJlY3Rpb24gPSBnZXRUcmFja0RpcihldnQudGFyZ2V0LmNsYXNzTmFtZSk7XG5cbiAgICAgICAgLy8gcG9pbnRlciBvZmZzZXQgdG8gdGh1bWJcbiAgICAgICAgc3RhcnRPZmZzZXRUb1RodW1iID0ge1xuICAgICAgICAgICAgeDogY3Vyc29yUG9zLnggLSB0aHVtYlJlY3QubGVmdCxcbiAgICAgICAgICAgIHk6IGN1cnNvclBvcy55IC0gdGh1bWJSZWN0LnRvcFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGNvbnRhaW5lciBib3VuZGluZyByZWN0YW5nbGVcbiAgICAgICAgY29udGFpbmVyUmVjdCA9IHRoaXMudGFyZ2V0cy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQod2luZG93LCAnbW91c2Vtb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzTW91c2VEb3duKSByZXR1cm47XG5cbiAgICAgICAgaXNNb3VzZU1vdmUgPSB0cnVlO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBsZXQgeyBzaXplLCBvZmZzZXQgfSA9IHRoaXM7XG4gICAgICAgIGxldCBjdXJzb3JQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgICAgIGlmIChzdGFydFRyYWNrRGlyZWN0aW9uID09PSAneCcpIHtcbiAgICAgICAgICAgIC8vIGdldCBwZXJjZW50YWdlIG9mIHBvaW50ZXIgcG9zaXRpb24gaW4gdHJhY2tcbiAgICAgICAgICAgIC8vIHRoZW4gdHJhbmZvcm0gdG8gcHhcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oXG4gICAgICAgICAgICAgICAgKGN1cnNvclBvcy54IC0gc3RhcnRPZmZzZXRUb1RodW1iLnggLSBjb250YWluZXJSZWN0LmxlZnQpIC8gKGNvbnRhaW5lclJlY3QucmlnaHQgLSBjb250YWluZXJSZWN0LmxlZnQpICogc2l6ZS5jb250ZW50LndpZHRoLFxuICAgICAgICAgICAgICAgIG9mZnNldC55XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkb24ndCBuZWVkIGVhc2luZ1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgb2Zmc2V0LngsXG4gICAgICAgICAgICAoY3Vyc29yUG9zLnkgLSBzdGFydE9mZnNldFRvVGh1bWIueSAtIGNvbnRhaW5lclJlY3QudG9wKSAvIChjb250YWluZXJSZWN0LmJvdHRvbSAtIGNvbnRhaW5lclJlY3QudG9wKSAqIHNpemUuY29udGVudC5oZWlnaHRcbiAgICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIHJlbGVhc2UgbW91c2Vtb3ZlIHNweSBvbiB3aW5kb3cgbG9zdCBmb2N1c1xuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIGJsdXInLCAoKSA9PiB7XG4gICAgICAgIGlzTW91c2VEb3duID0gaXNNb3VzZU1vdmUgPSBmYWxzZTtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19tb3VzZUhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fbW91c2VIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvbW91c2UuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3doZWVsSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0RGVsdGEgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vLyBpcyBzdGFuZGFyZCBgd2hlZWxgIGV2ZW50IHN1cHBvcnRlZCBjaGVja1xuY29uc3QgV0hFRUxfRVZFTlQgPSAnb253aGVlbCcgaW4gd2luZG93ID8gJ3doZWVsJyA6ICdtb3VzZXdoZWVsJztcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fd2hlZWxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsIFdIRUVMX0VWRU5ULCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0IH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBkZWx0YSA9IGdldERlbHRhKGV2dCk7XG5cbiAgICAgICAgdGhpcy5fX2FkZE1vdmVtZW50KGRlbHRhLngsIGRlbHRhLnkpO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3doZWVsSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX193aGVlbEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy93aGVlbC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fcmVzaXplSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fcmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLl9fdXBkYXRlVGhyb3R0bGUpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3Jlc2l6ZUhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fcmVzaXplSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3Jlc2l6ZS5qc1xuICoqLyIsIi8qKlxyXG4gKiBAbW9kdWxlXHJcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3NlbGVjdEhhbmRsZXJcclxuICovXHJcblxyXG4gaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XHJcbiBpbXBvcnQge1xyXG4gICAgZ2V0T3JpZ2luYWxFdmVudCxcclxuICAgIGdldFBvc2l0aW9uLFxyXG4gICAgZ2V0VG91Y2hJRCxcclxuICAgIHBpY2tJblJhbmdlLFxyXG4gICAgc2V0U3R5bGVcclxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XHJcblxyXG4gZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XHJcblxyXG4vLyB0b2RvOiBzZWxlY3QgaGFuZGxlciBmb3IgdG91Y2ggc2NyZWVuXHJcbiBsZXQgX19zZWxlY3RIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgY29udGVudCB9ID0gdGhpcy50YXJnZXRzO1xyXG5cclxuICAgIGxldCBzY3JvbGwgPSAoeyB4LCB5IH0pID0+IHtcclxuICAgICAgICBpZiAoIXggJiYgIXkpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KHgsIHkpO1xyXG5cclxuICAgICAgICBhbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICAgICAgICBzY3JvbGwoeyB4LCB5IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgc2V0U2VsZWN0ID0gKHZhbHVlID0gJycpID0+IHtcclxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgJy11c2VyLXNlbGVjdCc6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgaWYgKCFpc1NlbGVjdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XHJcblxyXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX19nZXRQb2ludGVyVHJlbmQoZXZ0KTtcclxuXHJcbiAgICAgICAgc2Nyb2xsKGRpcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGVudCwgJ3NlbGVjdHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0U2VsZWN0KCdub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcclxuICAgICAgICBpc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIGJsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcclxuICAgICAgICBzZXRTZWxlY3QoKTtcclxuXHJcbiAgICAgICAgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gdGVtcCBwYXRjaCBmb3IgdG91Y2ggZGV2aWNlc1xyXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3Njcm9sbCcsIChldnQpID0+IHtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xyXG4gICAgfSk7XHJcbiB9O1xyXG5cclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZWxlY3RIYW5kbGVyJywge1xyXG4gICAgIHZhbHVlOiBfX3NlbGVjdEhhbmRsZXIsXHJcbiAgICAgd3JpdGFibGU6IHRydWUsXHJcbiAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiB9KTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3NlbGVjdC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fa2V5Ym9hcmRIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCwgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8vIGtleSBtYXBzIFtkZWx0YVgsIGRlbHRhWV1cbmNvbnN0IEtFWU1BUFMgPSB7XG4gICAgMzI6IFswLCA1XSwgICAvLyBzcGFjZVxuICAgIDM3OiBbLTEsIDBdLCAgLy8gbGVmdFxuICAgIDM4OiBbMCwgLTFdLCAgLy8gdXBcbiAgICAzOTogWzEsIDBdLCAgIC8vIHJpZ2h0XG4gICAgNDA6IFswLCAxXSAgICAvLyBkb3duXG59O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogS2V5cHJlc3MgZXZlbnQgaGFuZGxlciBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICovXG5sZXQgX19rZXlib2FyZEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGxldCBpc0ZvY3VzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdmb2N1cycsICgpID0+IHtcbiAgICAgICAgaXNGb2N1c2VkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdibHVyJywgKCkgPT4ge1xuICAgICAgICBpc0ZvY3VzZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdrZXlkb3duJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRm9jdXNlZCB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgICAgICBjb25zdCBrZXlDb2RlID0gZXZ0LmtleUNvZGUgfHwgZXZ0LndoaWNoO1xuXG4gICAgICAgIGlmICghS0VZTUFQUy5oYXNPd25Qcm9wZXJ0eShrZXlDb2RlKSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHsgc3BlZWQgfSA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgY29uc3QgW3gsIHldID0gS0VZTUFQU1trZXlDb2RlXTtcblxuICAgICAgICB0aGlzLl9fYWRkTW92ZW1lbnQoeCAqIDQwLCB5ICogNDApO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2tleWJvYXJkSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19rZXlib2FyZEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9rZXlib2FyZC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2dldEl0ZXJhdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3JcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX2lzSXRlcmFibGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkge1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2kgPSBfZ2V0SXRlcmF0b3IoYXJyKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZCA9IHRydWU7XG4gICAgICBfZSA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9hcnI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSBlbHNlIGlmIChfaXNJdGVyYWJsZShPYmplY3QoYXJyKSkpIHtcbiAgICAgIHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3NsaWNlZC10by1hcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDEyN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUnKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5pc0l0ZXJhYmxlID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTyA9IE9iamVjdChpdCk7XG4gIHJldHVybiBPW0lURVJBVE9SXSAhPT0gdW5kZWZpbmVkXG4gICAgfHwgJ0BAaXRlcmF0b3InIGluIE9cbiAgICB8fCBJdGVyYXRvcnMuaGFzT3duUHJvcGVydHkoY2xhc3NvZihPKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmlzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTMwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlYWRvbmx5JztcbmV4cG9ydCAqIGZyb20gJy4vYWRkX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5pdF9vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vaWdub3JlX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5pdF9zY3JvbGxiYXInO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfZGVsdGFfbGltaXQnO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfY2hpbGRyZW4nO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfYm91bmRpbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9pbnRlcl90cmVuZCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF90aHVtYl9wb3NpdGlvbic7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3JlYWRvbmx5XG4gKiBAZGVwZW5kZW5jaWVzIFsgU21vb3RoU2Nyb2xsYmFyIF1cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIGNyZWF0ZSByZWFkb25seSBwcm9wZXJ0eVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FueX0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gX19yZWFkb25seShwcm9wLCB2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcCwge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3JlYWRvbmx5Jywge1xuICAgIHZhbHVlOiBfX3JlYWRvbmx5LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvcmVhZG9ubHkuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZEV2ZW50XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZEV2ZW50KGVsZW0sIGV2ZW50cywgZm4pIHtcbiAgICBpZiAoIWVsZW0gfHwgdHlwZW9mIGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3QgZWxlbSB0byBiZSBhIERPTSBlbGVtZW50LCBidXQgZ290ICR7ZWxlbX1gKTtcbiAgICB9XG5cbiAgICBldmVudHMuc3BsaXQoL1xccysvZykuZm9yRWFjaCgoZXZ0KSA9PiB7XG4gICAgICAgIHRoaXMuX19oYW5kbGVycy5wdXNoKHsgZXZ0LCBlbGVtLCBmbiB9KTtcblxuICAgICAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmbik7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fYWRkRXZlbnQnLCB7XG4gICAgdmFsdWU6IF9fYWRkRXZlbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvYWRkX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19pbml0T3B0aW9uc1xuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19pbml0T3B0aW9ucyhvcHQgPSB7fSkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIHNwZWVkOiAxLCAgICAgICAgLy8gc2Nyb2xsIHNwZWVkIHNjYWxlXG4gICAgICAgIGZyaWN0b246IDEwLCAgICAgLy8gZnJpY3RvbiBmYWN0b3IsIHBlcmNlbnRcbiAgICAgICAgaWdub3JlRXZlbnRzOiBbXSAvLyBldmVudHMgbmFtZXMgdG8gYmUgaWdub3JlZFxuICAgIH07XG5cbiAgICBjb25zdCBsaW1pdCA9IHtcbiAgICAgICAgZnJpY3RvbjogWzEsIDk5XSxcbiAgICAgICAgc3BlZWQ6IFswLCBJbmZpbml0eV1cbiAgICB9O1xuXG4gICAgdGhpcy5fX3JlYWRvbmx5KCdvcHRpb25zJywge1xuICAgICAgICBnZXQgaWdub3JlRXZlbnRzKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuaWdub3JlRXZlbnRzO1xuICAgICAgICB9LFxuICAgICAgICBzZXQgaWdub3JlRXZlbnRzKHYpIHtcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2KSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdCBcXGBvcHRpb25zLmlnbm9yZUV2ZW50c1xcYCB0byBiZSBhIG51bWJlciwgYnV0IGdvdCAke3R5cGVvZiB2fWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLmlnbm9yZUV2ZW50cyA9IHY7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IHNwZWVkKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuc3BlZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCBzcGVlZCh2KSB7XG4gICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdCh2KSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3QgXFxgb3B0aW9ucy5zcGVlZFxcYCB0byBiZSBhIG51bWJlciwgYnV0IGdvdCAke3R5cGVvZiB2fWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLnNwZWVkID0gcGlja0luUmFuZ2UodiwgLi4ubGltaXQuc3BlZWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBmcmljdG9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZnJpY3RvbjtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0IGZyaWN0b24odikge1xuICAgICAgICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQodikpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IFxcYG9wdGlvbnMuZnJpY3RvblxcYCB0byBiZSBhIG51bWJlciwgYnV0IGdvdCAke3R5cGVvZiB2fWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHRpb25zLmZyaWN0b24gPSBwaWNrSW5SYW5nZSh2LCAuLi5saW1pdC5mcmljdG9uKTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHQpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2luaXRPcHRpb25zJywge1xuICAgIHZhbHVlOiBfX2luaXRPcHRpb25zLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2luaXRfb3B0aW9ucy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9faWdub3JlRXZlbnRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19pZ25vcmVFdmVudChldnQgPSB7fSkge1xuICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICByZXR1cm4gKCFldnQudHlwZS5tYXRjaCgvZHJhZy8pICYmIGV2dC5kZWZhdWx0UHJldmVudGVkKSB8fFxuICAgICAgICB0aGlzLm9wdGlvbnMuaWdub3JlRXZlbnRzLnNvbWUocnVsZSA9PiBldnQudHlwZS5tYXRjaChydWxlKSkgfHxcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5zb21lKChzYikgPT4gc2IuY29udGFpbnModGFyZ2V0KSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19faWdub3JlRXZlbnQnLCB7XG4gICAgdmFsdWU6IF9faWdub3JlRXZlbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaWdub3JlX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19pbml0U2Nyb2xsYmFyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBpbml0aWFsaXplIHNjcm9sbGJhclxuICpcbiAqIFRoaXMgbWV0aG9kIHdpbGwgYXR0YWNoIHNldmVyYWwgbGlzdGVuZXJzIHRvIGVsZW1lbnRzXG4gKiBhbmQgY3JlYXRlIGEgZGVzdHJveSBtZXRob2QgdG8gcmVtb3ZlIGxpc3RlbmVyc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb246IGFzIGlzIGV4cGxhaW5lZCBpbiBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBfX2luaXRTY3JvbGxiYXIoKSB7XG4gICAgdGhpcy51cGRhdGUoKTsgLy8gaW5pdGlhbGl6ZSB0aHVtYiBwb3NpdGlvblxuXG4gICAgdGhpcy5fX2tleWJvYXJkSGFuZGxlcigpO1xuICAgIHRoaXMuX19yZXNpemVIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3NlbGVjdEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fbW91c2VIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3RvdWNoSGFuZGxlcigpO1xuICAgIHRoaXMuX193aGVlbEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fZHJhZ0hhbmRsZXIoKTtcblxuICAgIHRoaXMuX19yZW5kZXIoKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19pbml0U2Nyb2xsYmFyJywge1xuICAgIHZhbHVlOiBfX2luaXRTY3JvbGxiYXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9pbml0X3Njcm9sbGJhci5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fZ2V0RGVsdGFMaW1pdFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19nZXREZWx0YUxpbWl0KCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBsaW1pdFxuICAgIH0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogWy1vZmZzZXQueCwgbGltaXQueCAtIG9mZnNldC54XSxcbiAgICAgICAgeTogWy1vZmZzZXQueSwgbGltaXQueSAtIG9mZnNldC55XVxuICAgIH07XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fZ2V0RGVsdGFMaW1pdCcsIHtcbiAgICB2YWx1ZTogX19nZXREZWx0YUxpbWl0LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2dldF9kZWx0YV9saW1pdC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fdXBkYXRlQ2hpbGRyZW5cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IHNlbGVjdG9ycyB9IGZyb20gJy4uL3NoYXJlZC9zZWxlY3RvcnMnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX191cGRhdGVDaGlsZHJlbigpIHtcbiAgICB0aGlzLl9fcmVhZG9ubHkoJ2NoaWxkcmVuJywgWy4uLnRoaXMudGFyZ2V0cy5jb250ZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKV0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3VwZGF0ZUNoaWxkcmVuJywge1xuICAgIHZhbHVlOiBfX3VwZGF0ZUNoaWxkcmVuLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2NoaWxkcmVuLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX191cGRhdGVCb3VuZGluZ1xuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2VsZWN0b3JzIH0gZnJvbSAnLi4vc2hhcmVkL3NlbGVjdG9ycyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX3VwZGF0ZUJvdW5kaW5nKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG4gICAgY29uc3QgeyB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQgfSA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB7IGlubmVySGVpZ2h0LCBpbm5lcldpZHRoIH0gPSB3aW5kb3c7XG5cbiAgICB0aGlzLl9fcmVhZG9ubHkoJ2JvdW5kaW5nJywge1xuICAgICAgICB0b3A6IE1hdGgubWF4KHRvcCwgMCksXG4gICAgICAgIHJpZ2h0OiBNYXRoLm1pbihyaWdodCwgaW5uZXJXaWR0aCksXG4gICAgICAgIGJvdHRvbTogTWF0aC5taW4oYm90dG9tLCBpbm5lckhlaWdodCksXG4gICAgICAgIGxlZnQ6TWF0aC5tYXgobGVmdCwgMClcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX191cGRhdGVCb3VuZGluZycsIHtcbiAgICB2YWx1ZTogX191cGRhdGVCb3VuZGluZyxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZV9ib3VuZGluZy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fZ2V0UG9pbnRlclRyZW5kXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXRQb3NpdGlvbiB9IGZyb20gJy4uL3V0aWxzLyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2dldFBvaW50ZXJUcmVuZChldnQsIGVkZ2UgPSAwKSB7XG4gICAgY29uc3QgeyB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQgfSA9IHRoaXMuYm91bmRpbmc7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgY29uc3QgcmVzID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGlmICh4ID09PSAwICYmIHkgPT09IDApIHJldHVybiByZXM7XG5cbiAgICBpZiAoeCA+IHJpZ2h0IC0gZWRnZSkge1xuICAgICAgICByZXMueCA9ICh4IC0gcmlnaHQgKyBlZGdlKTtcbiAgICB9IGVsc2UgaWYgKHggPCBsZWZ0ICsgZWRnZSkge1xuICAgICAgICByZXMueCA9ICh4IC0gbGVmdCAtIGVkZ2UpO1xuICAgIH1cblxuICAgIGlmICh5ID4gYm90dG9tIC0gZWRnZSkge1xuICAgICAgICByZXMueSA9ICh5IC0gYm90dG9tICsgZWRnZSk7XG4gICAgfSBlbHNlIGlmICh5IDwgdG9wICsgZWRnZSkge1xuICAgICAgICByZXMueSA9ICh5IC0gdG9wIC0gZWRnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19nZXRQb2ludGVyVHJlbmQnLCB7XG4gICAgdmFsdWU6IF9fZ2V0UG9pbnRlclRyZW5kLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2dldF9wb2ludGVyX3RyZW5kLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19zZXRUaHVtYlBvc2l0aW9uXG4gKi9cblxuaW1wb3J0IHsgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBTZXQgdGh1bWIgcG9zaXRpb24gaW4gdHJhY2tcbiAqL1xuZnVuY3Rpb24gX19zZXRUaHVtYlBvc2l0aW9uKCkge1xuICAgIGxldCB7IHgsIHkgfSA9IHRoaXMub2Zmc2V0O1xuICAgIGxldCB7IHhBeGlzLCB5QXhpcyB9ID0gdGhpcy50YXJnZXRzO1xuXG4gICAgbGV0IHN0eWxlWCA9IGB0cmFuc2xhdGUzZCgke3ggLyB0aGlzLnNpemUuY29udGVudC53aWR0aCAqIHRoaXMuc2l6ZS5jb250YWluZXIud2lkdGh9cHgsIDAsIDApYDtcbiAgICBsZXQgc3R5bGVZID0gYHRyYW5zbGF0ZTNkKDAsICR7eSAvIHRoaXMuc2l6ZS5jb250ZW50LmhlaWdodCAqIHRoaXMuc2l6ZS5jb250YWluZXIuaGVpZ2h0fXB4LCAwKWA7XG5cbiAgICBzZXRTdHlsZSh4QXhpcy50aHVtYiwge1xuICAgICAgICAnLXdlYmtpdC10cmFuc2Zvcm0nOiBzdHlsZVgsXG4gICAgICAgICd0cmFuc2Zvcm0nOiBzdHlsZVhcbiAgICB9KTtcblxuICAgIHNldFN0eWxlKHlBeGlzLnRodW1iLCB7XG4gICAgICAgICctd2Via2l0LXRyYW5zZm9ybSc6IHN0eWxlWSxcbiAgICAgICAgJ3RyYW5zZm9ybSc6IHN0eWxlWVxuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3NldFRodW1iUG9zaXRpb24nLCB7XG4gICAgdmFsdWU6IF9fc2V0VGh1bWJQb3NpdGlvbixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL3NldF90aHVtYl9wb3NpdGlvbi5qc1xuICoqLyIsImltcG9ydCBTY3JvbGxiYXIgZnJvbSAnLi4vLi4vc3JjLyc7XG5cbmNvbnN0IERQUiA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXG5jb25zdCBzaXplID0ge1xuICAgIHdpZHRoOiAyNTAsXG4gICAgaGVpZ2h0OiAxNTBcbn07XG5cbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3Jyk7XG5jb25zdCBzY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50JykpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5jb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgc2Nyb2xsYmFyLm9wdGlvbnMpO1xuXG5jYW52YXMud2lkdGggPSBzaXplLndpZHRoICogRFBSO1xuY2FudmFzLmhlaWdodCA9IHNpemUuaGVpZ2h0ICogRFBSO1xuY3R4LnNjYWxlKERQUiwgRFBSKTtcblxuY3R4LnN0cm9rZVN0eWxlID0gJyM5NGE2YjcnO1xuY3R4LmZpbGxTdHlsZSA9ICcjYWJjJztcblxubGV0IHNob3VsZFVwZGF0ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoIXNob3VsZFVwZGF0ZSkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgfVxuXG4gICAgbGV0IGRvdHMgPSBjYWxjRG90cygpO1xuXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG5cbiAgICBsZXQgc2NhbGVYID0gKHNpemUud2lkdGggLyBkb3RzLmxlbmd0aCkgKiAob3B0aW9ucy5zcGVlZCAvIDIwICsgMC41KTtcbiAgICBkb3RzLmZvckVhY2goKFt4LCB5XSkgPT4ge1xuICAgICAgICBjdHgubGluZVRvKHggKiBzY2FsZVgsIHkpO1xuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgbGV0IFt4LCB5XSA9IGRvdHNbZG90cy5sZW5ndGggLSAxXTtcbiAgICBjdHgubGluZVRvKHggKiBzY2FsZVgsIHkpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBzaG91bGRVcGRhdGUgPSBmYWxzZTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xufTtcblxucmVuZGVyKCk7XG5cbmZ1bmN0aW9uIGNhbGNEb3RzKCkge1xuICAgIGxldCB7XG4gICAgICAgIHNwZWVkLFxuICAgICAgICBmcmljdG9uXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBsZXQgZG90cyA9IFtdO1xuXG4gICAgbGV0IHggPSAwO1xuICAgIGxldCB5ID0gKHNwZWVkIC8gMjAgKyAwLjUpICogc2l6ZS5oZWlnaHQ7XG5cbiAgICB3aGlsZSh5ID4gMC4xKSB7XG4gICAgICAgIGRvdHMucHVzaChbeCwgeV0pO1xuXG4gICAgICAgIHkgKj0gKDEgLSBmcmljdG9uIC8gMTAwKTtcbiAgICAgICAgeCsrO1xuICAgIH1cblxuICAgIHJldHVybiBkb3RzO1xufTtcblxuWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcHRpb25zJyldLmZvckVhY2goKGVsKSA9PiB7XG4gICAgY29uc3QgcHJvcCA9IGVsLm5hbWU7XG4gICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAub3B0aW9uLSR7cHJvcH1gKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IG9wdGlvbnNbcHJvcF0gPSBwYXJzZUZsb2F0KGVsLnZhbHVlKTtcbiAgICAgICAgc2Nyb2xsYmFyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgfSk7XG59KTtcblxucmVuZGVyKCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L3NjcmlwdHMvcHJldmlldy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=