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
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	__webpack_require__(2);
	
	__webpack_require__(143);
	
	var _src = __webpack_require__(15);
	
	var _src2 = _interopRequireDefault(_src);
	
	window.Scrollbar = _src2['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Object$keys = __webpack_require__(3)['default'];
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(4), __esModule: true };

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(5);
	module.exports = __webpack_require__(11).Object.keys;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(6);
	
	__webpack_require__(8)('keys', function($keys){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(7);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(9)
	  , core    = __webpack_require__(11)
	  , fails   = __webpack_require__(14);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(10)
	  , core      = __webpack_require__(11)
	  , ctx       = __webpack_require__(12)
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
/* 10 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 11 */
/***/ function(module, exports) {

	var core = module.exports = {version: '1.2.6'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(13);
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
/* 13 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

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
	
	__webpack_require__(116);
	
	__webpack_require__(120);
	
	__webpack_require__(132);
	
	exports['default'] = _smooth_scrollbar.SmoothScrollbar;
	
	_smooth_scrollbar.SmoothScrollbar.version = '5.2.1';
	
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
	module.exports = __webpack_require__(11).Array.from;

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
	  , defined   = __webpack_require__(7);
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
	  , $export        = __webpack_require__(9)
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
	module.exports = !__webpack_require__(14)(function(){
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
	  , Symbol = __webpack_require__(10).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(10)
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
	var ctx         = __webpack_require__(12)
	  , $export     = __webpack_require__(9)
	  , toObject    = __webpack_require__(6)
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
	module.exports = __webpack_require__(11).getIteratorMethod = function(it){
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
	    }).__readonly('thumbSize', {
	        x: 0,
	        y: 0,
	        realX: 0,
	        realY: 0
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
	module.exports = __webpack_require__(11).Object.freeze;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(39);
	
	__webpack_require__(8)('freeze', function($freeze){
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
	__webpack_require__(8)('getOwnPropertyNames', function(){
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
	  , defined = __webpack_require__(7);
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
	
	__webpack_require__(8)('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
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
	module.exports = __webpack_require__(11).Map;

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
	  , ctx          = __webpack_require__(12)
	  , strictNew    = __webpack_require__(78)
	  , defined      = __webpack_require__(7)
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

	var ctx         = __webpack_require__(12)
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
	var core        = __webpack_require__(11)
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
	  , global         = __webpack_require__(10)
	  , $export        = __webpack_require__(9)
	  , fails          = __webpack_require__(14)
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
	var $export  = __webpack_require__(9);
	
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
	
	var _Object$keys = __webpack_require__(3)['default'];
	
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
	module.exports = __webpack_require__(11).getIterator = function(it){
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
	
	var _clear_movement = __webpack_require__(113);
	
	_defaults(exports, _interopExportWildcard(_clear_movement, _defaults));
	
	var _infinite_scroll = __webpack_require__(114);
	
	_defaults(exports, _interopExportWildcard(_infinite_scroll, _defaults));
	
	var _get_content_elem = __webpack_require__(115);
	
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
	
	        var targets = _this.targets;
	        var options = _this.options;
	
	        var thumbSize = {
	            // real thumb sizes
	            realX: size.container.width / size.content.width * size.container.width,
	            realY: size.container.height / size.content.height * size.container.height
	        };
	
	        // rendered thumb sizes
	        thumbSize.x = Math.max(thumbSize.realX, options.thumbMinSize);
	        thumbSize.y = Math.max(thumbSize.realY, options.thumbMinSize);
	
	        _this.__readonly('limit', newLimit).__readonly('thumbSize', thumbSize);
	
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
	            'width': thumbSize.x + 'px'
	        });
	        (0, _utilsIndex.setStyle)(yAxis.thumb, {
	            'height': thumbSize.y + 'px'
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
	        cancelAnimationFrame(_this.__timerID.render);
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
	
	var _Object$keys = __webpack_require__(3)['default'];
	
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
	  var _this = this;
	
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	  var res = {};
	
	  _Object$keys(options).forEach(function (prop) {
	    if (!_this.options.hasOwnProperty(prop) || options[prop] === undefined) return;
	
	    res[prop] = options[prop];
	  });
	
	  _Object$assign(this.options, res);
	};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(107), __esModule: true };

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(108);
	module.exports = __webpack_require__(11).Object.assign;

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(9);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(109)});

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.1 Object.assign(target, source, ...)
	var $        = __webpack_require__(26)
	  , toObject = __webpack_require__(6)
	  , IObject  = __webpack_require__(60);
	
	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = __webpack_require__(14)(function(){
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
	 * @param {Boolean} [withoutCallbacks]: disable callback functions temporarily
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.setPosition = function () {
	    var x = arguments.length <= 0 || arguments[0] === undefined ? this.offset.x : arguments[0];
	    var y = arguments.length <= 1 || arguments[1] === undefined ? this.offset.y : arguments[1];
	    var withoutCallbacks = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	
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
	    if (withoutCallbacks) return;
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
	 * @prototype {Function} clearMovement|stop
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
	 * Stop scrollbar right away
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.clearMovement = _smooth_scrollbar.SmoothScrollbar.prototype.stop = function () {
	  this.movement.x = this.movement.y = 0;
	};

/***/ },
/* 114 */
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
/* 115 */
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
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _render = __webpack_require__(117);
	
	_defaults(exports, _interopExportWildcard(_render, _defaults));
	
	var _add_movement = __webpack_require__(118);
	
	_defaults(exports, _interopExportWildcard(_add_movement, _defaults));
	
	var _set_movement = __webpack_require__(119);
	
	_defaults(exports, _interopExportWildcard(_set_movement, _defaults));

/***/ },
/* 117 */
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
	    var friction = options.friction;
	
	    if (Math.abs(movement) < 1) {
	        var next = current + movement;
	
	        return {
	            movement: 0,
	            position: current > next ? Math.ceil(next) : Math.floor(next)
	        };
	    }
	
	    var q = 1 - friction / 100;
	
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
	
	    __timerID.render = requestAnimationFrame(__render.bind(this));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__render', {
	    value: __render,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 118 */
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
	
	    var x = movement.x + deltaX * options.speed;
	    var y = movement.y + deltaY * options.speed;
	
	    if (options.continuousScrolling) {
	        movement.x = x;
	        movement.y = y;
	    } else {
	        var limit = this.__getDeltaLimit();
	
	        movement.x = _utils.pickInRange.apply(undefined, [x].concat(_toConsumableArray(limit.x)));
	        movement.y = _utils.pickInRange.apply(undefined, [y].concat(_toConsumableArray(limit.y)));
	    }
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__addMovement', {
	    value: __addMovement,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 119 */
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
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _drag = __webpack_require__(121);
	
	_defaults(exports, _interopExportWildcard(_drag, _defaults));
	
	var _touch = __webpack_require__(122);
	
	_defaults(exports, _interopExportWildcard(_touch, _defaults));
	
	var _mouse = __webpack_require__(123);
	
	_defaults(exports, _interopExportWildcard(_mouse, _defaults));
	
	var _wheel = __webpack_require__(124);
	
	_defaults(exports, _interopExportWildcard(_wheel, _defaults));
	
	var _resize = __webpack_require__(125);
	
	_defaults(exports, _interopExportWildcard(_resize, _defaults));
	
	var _select = __webpack_require__(126);
	
	_defaults(exports, _interopExportWildcard(_select, _defaults));
	
	var _keyboard = __webpack_require__(127);
	
	_defaults(exports, _interopExportWildcard(_keyboard, _defaults));

/***/ },
/* 121 */
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
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __touchHandler
	 */
	
	'use strict';
	
	var _Object$keys = __webpack_require__(3)['default'];
	
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
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __mouseHandler
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utils = __webpack_require__(85);
	
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
	        var clickPos = (0, _utils.getPosition)(evt);
	        var deltaLimit = _this.__getDeltaLimit();
	
	        var size = _this.size;
	        var offset = _this.offset;
	        var thumbSize = _this.thumbSize;
	
	        if (direction === 'x') {
	            var clickOffset = (clickPos.x - rect.left - thumbSize.x / 2) / (size.container.width - (thumbSize.x - thumbSize.realX));
	            _this.movement.x = _utils.pickInRange.apply(undefined, [clickOffset * size.content.width - offset.x].concat(_toConsumableArray(deltaLimit.x)));
	        } else {
	            var clickOffset = (clickPos.y - rect.top - thumbSize.y / 2) / (size.container.height - (thumbSize.y - thumbSize.realY));
	            _this.movement.y = _utils.pickInRange.apply(undefined, [clickOffset * size.content.height - offset.y].concat(_toConsumableArray(deltaLimit.y)));
	        }
	    });
	
	    this.__addEvent(container, 'mousedown', function (evt) {
	        if (!/scrollbar-thumb/.test(evt.target.className) || _this.__ignoreEvent(evt)) return;
	        isMouseDown = true;
	
	        var cursorPos = (0, _utils.getPosition)(evt);
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
	
	        var cursorPos = (0, _utils.getPosition)(evt);
	
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
/* 124 */
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
	        if (_this.__ignoreEvent(evt, true)) return;
	
	        var offset = _this.offset;
	        var limit = _this.limit;
	        var options = _this.options;
	
	        var delta = (0, _utilsIndex.getDelta)(evt);
	
	        if (options.continuousScrolling) {
	            var destX = (0, _utilsIndex.pickInRange)(delta.x + offset.x, 0, limit.x);
	            var destY = (0, _utilsIndex.pickInRange)(delta.y + offset.y, 0, limit.y);
	
	            if (Math.abs(destX - offset.x) < 1 && Math.abs(destY - offset.y) < 1) {
	                return _this.__updateThrottle();
	            }
	        }
	
	        evt.preventDefault();
	        evt.stopPropagation();
	
	        _this.__addMovement(delta.x, delta.y);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__wheelHandler', {
	    value: __wheelHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 125 */
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
/* 126 */
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
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __keyboardHandler
	 */
	
	'use strict';
	
	var _slicedToArray = __webpack_require__(128)['default'];
	
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
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _getIterator = __webpack_require__(91)["default"];
	
	var _isIterable = __webpack_require__(129)["default"];
	
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
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(130), __esModule: true };

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(71);
	__webpack_require__(19);
	module.exports = __webpack_require__(131);

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(43)
	  , ITERATOR  = __webpack_require__(33)('iterator')
	  , Iterators = __webpack_require__(30);
	module.exports = __webpack_require__(11).isIterable = function(it){
	  var O = Object(it);
	  return O[ITERATOR] !== undefined
	    || '@@iterator' in O
	    || Iterators.hasOwnProperty(classof(O));
	};

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _readonly = __webpack_require__(133);
	
	_defaults(exports, _interopExportWildcard(_readonly, _defaults));
	
	var _add_event = __webpack_require__(134);
	
	_defaults(exports, _interopExportWildcard(_add_event, _defaults));
	
	var _init_options = __webpack_require__(135);
	
	_defaults(exports, _interopExportWildcard(_init_options, _defaults));
	
	var _ignore_event = __webpack_require__(136);
	
	_defaults(exports, _interopExportWildcard(_ignore_event, _defaults));
	
	var _init_scrollbar = __webpack_require__(137);
	
	_defaults(exports, _interopExportWildcard(_init_scrollbar, _defaults));
	
	var _get_delta_limit = __webpack_require__(138);
	
	_defaults(exports, _interopExportWildcard(_get_delta_limit, _defaults));
	
	var _update_children = __webpack_require__(139);
	
	_defaults(exports, _interopExportWildcard(_update_children, _defaults));
	
	var _update_bounding = __webpack_require__(140);
	
	_defaults(exports, _interopExportWildcard(_update_bounding, _defaults));
	
	var _get_pointer_trend = __webpack_require__(141);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_trend, _defaults));
	
	var _set_thumb_position = __webpack_require__(142);
	
	_defaults(exports, _interopExportWildcard(_set_thumb_position, _defaults));

/***/ },
/* 133 */
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
/* 134 */
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
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __initOptions
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$defineProperties = __webpack_require__(51)['default'];
	
	var _Object$keys = __webpack_require__(3)['default'];
	
	var _Object$defineProperty = __webpack_require__(64)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utils = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __initOptions(userPreference) {
	    var options = {
	        speed: 1, // scroll speed scale
	        friction: 10, // friction factor, percent
	        ignoreEvents: [], // events names to be ignored
	        thumbMinSize: 20, // min size for scrollbar thumb
	        continuousScrolling: false // allow uper scrollable content to scroll when reaching edge
	    };
	
	    var limit = {
	        friction: [1, 99],
	        speed: [0, Infinity],
	        thumbMinSize: [0, Infinity]
	    };
	
	    var optionAccessors = _Object$defineProperties({}, {
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
	        continuousScrolling: {
	            get: function get() {
	                return options.continuousScrolling;
	            },
	            set: function set(v) {
	                options.continuousScrolling = !!v;
	            },
	            configurable: true,
	            enumerable: true
	        }
	    });
	
	    _Object$keys(options).filter(function (prop) {
	        return !optionAccessors.hasOwnProperty(prop);
	    }).forEach(function (prop) {
	        _Object$defineProperty(optionAccessors, prop, {
	            enumerable: true,
	            get: function get() {
	                return options[prop];
	            },
	            set: function set(v) {
	                if (isNaN(parseFloat(v))) {
	                    throw new TypeError('expect `options.' + prop + '` to be a number, but got ' + typeof v);
	                }
	
	                options[prop] = _utils.pickInRange.apply(undefined, [v].concat(_toConsumableArray(limit[prop])));
	            }
	        });
	    });
	
	    this.__readonly('options', optionAccessors);
	    this.setOptions(userPreference);
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__initOptions', {
	    value: __initOptions,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 136 */
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
	    var allowChild = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	
	    var _getOriginalEvent = (0, _utils.getOriginalEvent)(evt);
	
	    var target = _getOriginalEvent.target;
	
	    return !evt.type.match(/drag/) && evt.defaultPrevented || this.options.ignoreEvents.some(function (rule) {
	        return evt.type.match(rule);
	    }) || (allowChild ? false : this.children.some(function (sb) {
	        return sb.contains(target);
	    }));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__ignoreEvent', {
	    value: __ignoreEvent,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 137 */
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
/* 138 */
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
/* 139 */
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
/* 140 */
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
/* 141 */
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
/* 142 */
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
	    var targets = this.targets;
	    var size = this.size;
	    var offset = this.offset;
	    var thumbSize = this.thumbSize;
	
	    var thumbPositionX = offset.x / size.content.width * (size.container.width - (thumbSize.x - thumbSize.realX));
	    var thumbPositionY = offset.y / size.content.height * (size.container.height - (thumbSize.y - thumbSize.realY));
	
	    (0, _utilsIndex.setStyle)(targets.xAxis.thumb, {
	        '-transform': 'translate3d(' + thumbPositionX + 'px, 0, 0)'
	    });
	
	    (0, _utilsIndex.setStyle)(targets.yAxis.thumb, {
	        '-transform': 'translate3d(0, ' + thumbPositionY + 'px, 0)'
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__setThumbPosition', {
	    value: __setThumbPosition,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = __webpack_require__(128)['default'];
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$assign = __webpack_require__(106)['default'];
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
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
	    var friction = options.friction;
	
	    var dots = [];
	
	    var x = 0;
	    var y = (speed / 20 + 0.5) * size.height;
	
	    while (y > 0.1) {
	        dots.push([x, y]);
	
	        y *= 1 - friction / 100;
	        x++;
	    }
	
	    return dots;
	};
	
	document.querySelector('#version').textContent = 'v' + _src2['default'].version;
	
	[].concat(_toConsumableArray(document.querySelectorAll('.options'))).forEach(function (el) {
	    var prop = el.name;
	    var label = document.querySelector('.option-' + prop);
	
	    el.addEventListener('input', function () {
	        label.textContent = options[prop] = parseFloat(el.value);
	        scrollbar.setOptions(options);
	        shouldUpdate = true;
	    });
	});
	
	var innerScrollbar = _src2['default'].get(document.querySelector('.inner-scrollbar'));
	
	document.querySelector('#continuous').addEventListener('change', function (_ref3) {
	    var target = _ref3.target;
	
	    innerScrollbar.setOptions({
	        continuousScrolling: target.checked
	    });
	});
	
	render();

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgN2U5YzMzYzUwYjQ1MzBjYWI0N2EiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9zY3JpcHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2ludGVyb3AtcmVxdWlyZS1kZWZhdWx0LmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LXNhcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jdHguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZmFpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGlkZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlc2NyaXB0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGFzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVpZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2hhcmVkL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2RlZmF1bHRzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5nZXQtbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1leHBvcnQtd2lsZGNhcmQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9zYl9saXN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1zdGVwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLWFsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mb3Itb2YuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtc3BlY2llcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzIiwid2VicGFjazovLy8uL3NyYy9zaGFyZWQvc2VsZWN0b3JzLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZGVib3VuY2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL3NldF9zdHlsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X2RlbHRhLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfb3JpZ2luYWxfZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2ZpbmRfY2hpbGQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2J1aWxkX2N1cnZlLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfdG91Y2hfaWQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9wb2ludGVyX2RhdGEuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvcGlja19pbl9yYW5nZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy91cGRhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvZGVzdHJveS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfc2l6ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9saXN0ZW5lci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9zY3JvbGxfdG8uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1hc3NpZ24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X3Bvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2V4dGVuZHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvdG9nZ2xlX3RyYWNrLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2NsZWFyX21vdmVtZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2luZmluaXRlX3Njcm9sbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfY29udGVudF9lbGVtLmpzIiwid2VicGFjazovLy8uL3NyYy9yZW5kZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9yZW5kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9hZGRfbW92ZW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9zZXRfbW92ZW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL2RyYWcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy90b3VjaC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL21vdXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvd2hlZWwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9yZXNpemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9rZXlib2FyZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9zbGljZWQtdG8tYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvaXMtaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3JlYWRvbmx5LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvYWRkX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaW5pdF9vcHRpb25zLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaWdub3JlX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaW5pdF9zY3JvbGxiYXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9nZXRfZGVsdGFfbGltaXQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy91cGRhdGVfY2hpbGRyZW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy91cGRhdGVfYm91bmRpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9nZXRfcG9pbnRlcl90cmVuZC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3NldF90aHVtYl9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi90ZXN0L3NjcmlwdHMvcHJldmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7cUJDdENPLENBQVc7O3FCQUNYLEdBQVc7O2dDQUNJLEVBQVk7Ozs7QUFDbEMsT0FBTSxDQUFDLFNBQVMsbUJBQVksQzs7Ozs7O0FDSDVCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkI7Ozs7Ozs7Ozs7OztnQ0NSc0IsRUFBWTs7OztBQUVsQyxLQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7QUFDcEMsS0FBTSxjQUFjLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQzs7QUFFaEMsS0FBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuRCxLQUFNLEtBQUssR0FBRyxRQUFRLENB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TixDQUFDLENBQUM7O0FBRUgsS0FBTSxjQUFjLEdBQUcsaUJBQVUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDOztBQUVqRixTQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxVQUFDLEtBQVUsRUFBSztTQUFiLE1BQU0sR0FBUixLQUFVLENBQVIsTUFBTTs7QUFDdEUsbUJBQWMsQ0FBQyxVQUFVLENBQUM7QUFDdEIsNEJBQW1CLEVBQUUsTUFBTSxDQUFDLE9BQU87TUFDdEMsQ0FBQyxDQUFDO0VBQ04sQ0FBQyxDQUFDOztBQUVILE9BQU0sRUFBRSxDIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgN2U5YzMzYzUwYjQ1MzBjYWI0N2FcbiAqKi8iLCJpbXBvcnQgJy4vbW9uaXRvcic7XG5pbXBvcnQgJy4vcHJldmlldyc7XG5pbXBvcnQgU2Nyb2xsYmFyIGZyb20gJy4uLy4uL3NyYy8nO1xud2luZG93LlNjcm9sbGJhciA9IFNjcm9sbGJhcjtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtZGVmYXVsdC5qc1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCBTY3JvbGxiYXIgZnJvbSAnLi4vLi4vc3JjLyc7XG5cbmNvbnN0IERQUiA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuY29uc3QgVElNRV9SQU5HRV9NQVggPSAyMCAqIDFlMztcblxuY29uc3QgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50Jyk7XG5jb25zdCB0aHVtYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHVtYicpO1xuY29uc3QgdHJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHJhY2snKTtcbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydCcpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmRpdi5pbm5lckhUTUwgPSBBcnJheSgxMDEpLmpvaW4oJzxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBFeHBlZGl0YSBlYXF1ZSBkZWJpdGlzLCBkb2xvcmVtIGRvbG9yaWJ1cywgdm9sdXB0YXRpYnVzIG1pbmltYSBpbGxvIGVzdCwgYXRxdWUgYWxpcXVpZCBpcHN1bSBuZWNlc3NpdGF0aWJ1cyBjdW1xdWUgdmVyaXRhdGlzIGJlYXRhZSwgcmF0aW9uZSByZXB1ZGlhbmRhZSBxdW9zISBPbW5pcyBoaWMsIGFuaW1pLjwvcD4nKTtcblxuY29udGVudC5hcHBlbmRDaGlsZChkaXYpO1xuXG5TY3JvbGxiYXIuaW5pdEFsbCgpO1xuXG5jb25zdCBzY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGNvbnRlbnQpO1xuXG5sZXQgY2hhcnRUeXBlID0gJ29mZnNldCc7XG5cbmxldCB0aHVtYldpZHRoID0gMDtcbmxldCBlbmRPZmZzZXQgPSAwO1xuXG5sZXQgdGltZVJhbmdlID0gNSAqIDFlMztcblxubGV0IHJlY29yZHMgPSBbXTtcbmxldCBzaXplID0ge1xuICAgIHdpZHRoOiAzMDAsXG4gICAgaGVpZ2h0OiAyMDBcbn07XG5cbmxldCBzaG91bGRVcGRhdGUgPSB0cnVlO1xuXG5sZXQgdGFuZ2VudFBvaW50ID0gbnVsbDtcbmxldCB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xuXG5sZXQgaG92ZXJMb2NrZWQgPSBmYWxzZTtcbmxldCBob3ZlclBvaW50ZXJYID0gdW5kZWZpbmVkO1xubGV0IHBvaW50ZXJEb3duT25UcmFjayA9IHVuZGVmaW5lZDtcbmxldCBob3ZlclByZWNpc2lvbiA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50ID8gNSA6IDE7XG5cbmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiBEUFI7XG5jYW52YXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKiBEUFI7XG5jdHguc2NhbGUoRFBSLCBEUFIpO1xuXG5mdW5jdGlvbiBub3RhdGlvbihudW0gPSAwKSB7XG4gICAgaWYgKCFudW0gfHwgTWF0aC5hYnMobnVtKSA+IDEwKiotMikgcmV0dXJuIG51bS50b0ZpeGVkKDIpO1xuXG4gICAgbGV0IGV4cCA9IC0zO1xuXG4gICAgd2hpbGUgKCEobnVtIC8gMTAqKmV4cCkpIHtcbiAgICAgICAgaWYgKGV4cCA8IC0xMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bSA+IDAgPyAnSW5maW5pdHknIDogJy1JbmZpbml0eSc7XG4gICAgICAgIH1cblxuICAgICAgICBleHAtLTtcbiAgICB9XG5cbiAgICByZXR1cm4gKG51bSAqIDEwKiotZXhwKS50b0ZpeGVkKDIpICsgJ2UnICsgZXhwO1xufTtcblxuZnVuY3Rpb24gYWRkRXZlbnQoZWxlbXMsIGV2dHMsIGhhbmRsZXIpIHtcbiAgICBldnRzLnNwbGl0KC9cXHMrLykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBbXS5jb25jYXQoZWxlbXMpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKG5hbWUsICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciguLi5hcmdzKTtcbiAgICAgICAgICAgICAgICBzaG91bGRVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gc2xpY2VSZWNvcmQoKSB7XG4gICAgbGV0IGVuZElkeCA9IE1hdGguZmxvb3IocmVjb3Jkcy5sZW5ndGggKiAoMSAtIGVuZE9mZnNldCkpO1xuICAgIGxldCBsYXN0ID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCBkcm9wSWR4ID0gMDtcblxuICAgIGxldCByZXN1bHQgPSByZWNvcmRzLmZpbHRlcigocHQsIGlkeCkgPT4ge1xuICAgICAgICBpZiAobGFzdC50aW1lIC0gcHQudGltZSA+IFRJTUVfUkFOR0VfTUFYKSB7XG4gICAgICAgICAgICBkcm9wSWR4Kys7XG4gICAgICAgICAgICBlbmRJZHgtLTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlbmQgPSByZWNvcmRzW2VuZElkeCAtIDFdO1xuXG4gICAgICAgIHJldHVybiBlbmQudGltZSAtIHB0LnRpbWUgPD0gdGltZVJhbmdlICYmIGlkeCA8PSBlbmRJZHg7XG4gICAgfSk7XG5cbiAgICByZWNvcmRzLnNwbGljZSgwLCBkcm9wSWR4KTtcbiAgICB0aHVtYldpZHRoID0gcmVzdWx0Lmxlbmd0aCA/IHJlc3VsdC5sZW5ndGggLyByZWNvcmRzLmxlbmd0aCA6IDE7XG5cbiAgICB0aHVtYi5zdHlsZS53aWR0aCA9IHRodW1iV2lkdGggKiAxMDAgKyAnJSc7XG4gICAgdGh1bWIuc3R5bGUucmlnaHQgPSBlbmRPZmZzZXQgKiAxMDAgKyAnJSc7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuZnVuY3Rpb24gZ2V0TGltaXQocG9pbnRzKSB7XG4gICAgcmV0dXJuIHBvaW50cy5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7XG4gICAgICAgIGxldCB2YWwgPSBjdXJbY2hhcnRUeXBlXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1heDogTWF0aC5tYXgocHJlLm1heCwgdmFsKSxcbiAgICAgICAgICAgIG1pbjogTWF0aC5taW4ocHJlLm1pbiwgdmFsKVxuICAgICAgICB9O1xuICAgIH0sIHsgbWF4OiAtSW5maW5pdHksIG1pbjogSW5maW5pdHkgfSk7XG59O1xuXG5mdW5jdGlvbiBhc3NpZ25Qcm9wcyhwcm9wcykge1xuICAgIGlmICghcHJvcHMpIHJldHVybjtcblxuICAgIE9iamVjdC5rZXlzKHByb3BzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGN0eFtuYW1lXSA9IHByb3BzW25hbWVdO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZHJhd0xpbmUocDAsIHAxLCBvcHRpb25zKSB7XG4gICAgbGV0IHgwID0gcDBbMF0sXG4gICAgICAgIHkwID0gcDBbMV0sXG4gICAgICAgIHgxID0gcDFbMF0sXG4gICAgICAgIHkxID0gcDFbMV07XG5cbiAgICBhc3NpZ25Qcm9wcyhvcHRpb25zLnByb3BzKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAtMSwgMCwgc2l6ZS5oZWlnaHQpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc2V0TGluZURhc2gob3B0aW9ucy5kYXNoZWQgPyBvcHRpb25zLmRhc2hlZCA6IFtdKTtcbiAgICBjdHgubW92ZVRvKHgwLCB5MCk7XG4gICAgY3R4LmxpbmVUbyh4MSwgeTEpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbn07XG5cbmZ1bmN0aW9uIGFkanVzdFRleHQoY29udGVudCwgcCwgb3B0aW9ucykge1xuICAgIGxldCB4ID0gcFswXSxcbiAgICAgICAgeSA9IHBbMV07XG5cbiAgICBsZXQgd2lkdGggPSBjdHgubWVhc3VyZVRleHQoY29udGVudCkud2lkdGg7XG5cbiAgICBpZiAoeCArIHdpZHRoID4gc2l6ZS53aWR0aCkge1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcbiAgICB9IGVsc2UgaWYgKHggLSB3aWR0aCA8IDApIHtcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9ICdsZWZ0JztcbiAgICB9IGVsc2Uge1xuICAgICAgICBjdHgudGV4dEFsaWduID0gb3B0aW9ucy50ZXh0QWxpZ247XG4gICAgfVxuXG4gICAgY3R4LmZpbGxUZXh0KGNvbnRlbnQsIHgsIC15KTtcbn07XG5cbmZ1bmN0aW9uIGZpbGxUZXh0KGNvbnRlbnQsIHAsIG9wdGlvbnMpIHtcbiAgICBhc3NpZ25Qcm9wcyhvcHRpb25zLnByb3BzKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCBzaXplLmhlaWdodCk7XG4gICAgYWRqdXN0VGV4dChjb250ZW50LCBwLCBvcHRpb25zKTtcbiAgICBjdHgucmVzdG9yZSgpO1xufTtcblxuZnVuY3Rpb24gZHJhd01haW4oKSB7XG4gICAgbGV0IHBvaW50cyA9IHNsaWNlUmVjb3JkKCk7XG4gICAgaWYgKCFwb2ludHMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBsZXQgbGltaXQgPSBnZXRMaW1pdChwb2ludHMpO1xuXG4gICAgbGV0IHN0YXJ0ID0gcG9pbnRzWzBdO1xuICAgIGxldCBlbmQgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgbGV0IHRvdGFsWCA9IHRodW1iV2lkdGggPT09IDEgPyB0aW1lUmFuZ2UgOiBlbmQudGltZSAtIHN0YXJ0LnRpbWU7XG4gICAgbGV0IHRvdGFsWSA9IChsaW1pdC5tYXggLSBsaW1pdC5taW4pIHx8IDE7XG5cbiAgICBsZXQgZ3JkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIHNpemUuaGVpZ2h0LCAwLCAwKTtcbiAgICBncmQuYWRkQ29sb3JTdG9wKDAsICdyZ2IoMTcwLCAyMTUsIDI1NSknKTtcbiAgICBncmQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKDE3MCwgMjE1LCAyNTUsIDAuMiknKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAtMSwgMCwgc2l6ZS5oZWlnaHQpO1xuXG4gICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyZDtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmdiKDY0LCAxNjUsIDI1NSknO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDAsIDApO1xuXG4gICAgbGV0IGxhc3RQb2ludCA9IHBvaW50cy5yZWR1Y2UoKHByZSwgY3VyLCBpZHgpID0+IHtcbiAgICAgICAgbGV0IHRpbWUgPSBjdXIudGltZSxcbiAgICAgICAgICAgIHZhbHVlID0gY3VyW2NoYXJ0VHlwZV07XG4gICAgICAgIGxldCB4ID0gKHRpbWUgLSBzdGFydC50aW1lKSAvIHRvdGFsWCAqIHNpemUud2lkdGgsXG4gICAgICAgICAgICB5ID0gKHZhbHVlIC0gbGltaXQubWluKSAvIHRvdGFsWSAqIChzaXplLmhlaWdodCAtIDIwKTtcblxuICAgICAgICBjdHgubGluZVRvKHgsIHkpO1xuXG4gICAgICAgIGlmIChob3ZlclBvaW50ZXJYICYmIE1hdGguYWJzKGhvdmVyUG9pbnRlclggLSB4KSA8IGhvdmVyUHJlY2lzaW9uKSB7XG4gICAgICAgICAgICB0YW5nZW50UG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgY29vcmQ6IFt4LCB5XSxcbiAgICAgICAgICAgICAgICBwb2ludDogY3VyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0YW5nZW50UG9pbnRQcmUgPSB7XG4gICAgICAgICAgICAgICAgY29vcmQ6IHByZSxcbiAgICAgICAgICAgICAgICBwb2ludDogcG9pbnRzW2lkeCAtIDFdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFt4LCB5XTtcbiAgICB9LCBbXSk7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmxpbmVUbyhsYXN0UG9pbnRbMF0sIDApO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBkcmF3TGluZShbMCwgbGFzdFBvaW50WzFdXSwgbGFzdFBvaW50LCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzdHJva2VTdHlsZTogJyNmNjAnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZpbGxUZXh0KCfihpknICsgbm90YXRpb24obGltaXQubWluKSwgWzAsIDBdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjMDAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICcxMnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmaWxsVGV4dChub3RhdGlvbihlbmRbY2hhcnRUeXBlXSksIGxhc3RQb2ludCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2Y2MCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJzE2cHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZHJhd1RhbmdlbnRMaW5lKCkge1xuICAgIGxldCBjb29yZCA9IHRhbmdlbnRQb2ludC5jb29yZCxcbiAgICAgICAgY29vcmRQcmUgPSB0YW5nZW50UG9pbnRQcmUuY29vcmQ7XG5cbiAgICBsZXQgayA9IChjb29yZFsxXSAtIGNvb3JkUHJlWzFdKSAvIChjb29yZFswXSAtIGNvb3JkUHJlWzBdKSB8fCAwO1xuICAgIGxldCBiID0gY29vcmRbMV0gLSBrICogY29vcmRbMF07XG5cbiAgICBkcmF3TGluZShbMCwgYl0sIFtzaXplLndpZHRoLCBrICogc2l6ZS53aWR0aCArIGJdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBsaW5lV2lkdGg6IDEsXG4gICAgICAgICAgICBzdHJva2VTdHlsZTogJyNmMDAnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCByZWFsSyA9ICh0YW5nZW50UG9pbnQucG9pbnRbY2hhcnRUeXBlXSAtIHRhbmdlbnRQb2ludFByZS5wb2ludFtjaGFydFR5cGVdKSAvXG4gICAgICAgICAgICAgICAgKHRhbmdlbnRQb2ludC5wb2ludC50aW1lIC0gdGFuZ2VudFBvaW50UHJlLnBvaW50LnRpbWUpO1xuXG4gICAgZmlsbFRleHQoJ2R5L2R4OiAnICsgbm90YXRpb24ocmVhbEspLCBbc2l6ZS53aWR0aCAvIDIsIDBdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJ2JvbGQgMTJweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBkcmF3SG92ZXIoKSB7XG4gICAgaWYgKCF0YW5nZW50UG9pbnQpIHJldHVybjtcblxuICAgIGRyYXdUYW5nZW50TGluZSgpO1xuXG4gICAgbGV0IGNvb3JkID0gdGFuZ2VudFBvaW50LmNvb3JkLFxuICAgICAgICBwb2ludCA9IHRhbmdlbnRQb2ludC5wb2ludDtcblxuICAgIGxldCBjb29yZFN0eWxlID0ge1xuICAgICAgICBkYXNoZWQ6IFs4LCA0XSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAncmdiKDY0LCAxNjUsIDI1NSknXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZHJhd0xpbmUoWzAsIGNvb3JkWzFdXSwgW3NpemUud2lkdGgsIGNvb3JkWzFdXSwgY29vcmRTdHlsZSk7XG4gICAgZHJhd0xpbmUoW2Nvb3JkWzBdLCAwXSwgW2Nvb3JkWzBdLCBzaXplLmhlaWdodF0sIGNvb3JkU3R5bGUpO1xuXG4gICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShwb2ludC50aW1lICsgcG9pbnQucmVkdWNlKTtcblxuICAgIGxldCBwb2ludEluZm8gPSBbXG4gICAgICAgICcoJyxcbiAgICAgICAgZGF0ZS5nZXRNaW51dGVzKCksXG4gICAgICAgICc6JyxcbiAgICAgICAgZGF0ZS5nZXRTZWNvbmRzKCksXG4gICAgICAgICcuJyxcbiAgICAgICAgZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSxcbiAgICAgICAgJywgJyxcbiAgICAgICAgbm90YXRpb24ocG9pbnRbY2hhcnRUeXBlXSksXG4gICAgICAgICcpJ1xuICAgIF0uam9pbignJyk7XG5cbiAgICBmaWxsVGV4dChwb2ludEluZm8sIGNvb3JkLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjMDAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICdib2xkIDEycHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghc2hvdWxkVXBkYXRlKSByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuXG4gICAgZmlsbFRleHQoY2hhcnRUeXBlLnRvVXBwZXJDYXNlKCksIFswLCBzaXplLmhlaWdodF0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnLFxuICAgICAgICAgICAgZm9udDogJ2JvbGQgMTRweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkcmF3TWFpbigpO1xuICAgIGRyYXdIb3ZlcigpO1xuXG4gICAgaWYgKGhvdmVyTG9ja2VkKSB7XG4gICAgICAgIGZpbGxUZXh0KCdMT0NLRUQnLCBbc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHRdLCB7XG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnLFxuICAgICAgICAgICAgICAgIGZvbnQ6ICdib2xkIDE0cHggc2Fucy1zZXJpZidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59O1xuXG5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxubGV0IGxhc3RUaW1lID0gRGF0ZS5ub3coKSxcbiAgICBsYXN0T2Zmc2V0ID0gMCxcbiAgICByZWR1Y2VBbW91bnQgPSAwO1xuXG5zY3JvbGxiYXIuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICAgIGxldCBjdXJyZW50ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgb2Zmc2V0ID0gc2Nyb2xsYmFyLm9mZnNldC55LFxuICAgICAgICBkdXJhdGlvbiA9IGN1cnJlbnQgLSBsYXN0VGltZTtcblxuICAgIGlmICghZHVyYXRpb24gfHwgb2Zmc2V0ID09PSBsYXN0T2Zmc2V0KSByZXR1cm47XG5cbiAgICBpZiAoZHVyYXRpb24gPiA1MCkge1xuICAgICAgICByZWR1Y2VBbW91bnQgKz0gKGR1cmF0aW9uIC0gMSk7XG4gICAgICAgIGR1cmF0aW9uIC09IChkdXJhdGlvbiAtIDEpO1xuICAgIH1cblxuICAgIGxldCB2ZWxvY2l0eSA9IChvZmZzZXQgLSBsYXN0T2Zmc2V0KSAvIGR1cmF0aW9uO1xuICAgIGxhc3RUaW1lID0gY3VycmVudDtcbiAgICBsYXN0T2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgcmVjb3Jkcy5wdXNoKHtcbiAgICAgICAgdGltZTogY3VycmVudCAtIHJlZHVjZUFtb3VudCxcbiAgICAgICAgcmVkdWNlOiByZWR1Y2VBbW91bnQsXG4gICAgICAgIG9mZnNldDogb2Zmc2V0LFxuICAgICAgICBzcGVlZDogTWF0aC5hYnModmVsb2NpdHkpXG4gICAgfSk7XG5cbiAgICBzaG91bGRVcGRhdGUgPSB0cnVlO1xufSk7XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXIoZSkge1xuICAgIHJldHVybiBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbZS50b3VjaGVzLmxlbmd0aCAtIDFdIDogZTtcbn07XG5cbi8vIHJhbmdlXG5sZXQgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHVyYXRpb24nKTtcbmxldCBsYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkdXJhdGlvbi12YWx1ZScpO1xuaW5wdXQubWF4ID0gVElNRV9SQU5HRV9NQVggLyAxZTM7XG5pbnB1dC5taW4gPSAxO1xuaW5wdXQudmFsdWUgPSB0aW1lUmFuZ2UgLyAxZTM7XG5sYWJlbC50ZXh0Q29udGVudCA9IGlucHV0LnZhbHVlICsgJ3MnO1xuXG5hZGRFdmVudChpbnB1dCwgJ2lucHV0JywgKGUpID0+IHtcbiAgICBsZXQgc3RhcnQgPSByZWNvcmRzWzBdO1xuICAgIGxldCBlbmQgPSByZWNvcmRzW3JlY29yZHMubGVuZ3RoIC0gMV07XG4gICAgbGV0IHZhbCA9IHBhcnNlRmxvYXQoZS50YXJnZXQudmFsdWUpO1xuICAgIGxhYmVsLnRleHRDb250ZW50ID0gdmFsICsgJ3MnO1xuICAgIHRpbWVSYW5nZSA9IHZhbCAqIDFlMztcblxuICAgIGlmIChlbmQpIHtcbiAgICAgICAgZW5kT2Zmc2V0ID0gTWF0aC5taW4oZW5kT2Zmc2V0LCBNYXRoLm1heCgwLCAxIC0gdGltZVJhbmdlIC8gKGVuZC50aW1lIC0gc3RhcnQudGltZSkpKTtcbiAgICB9XG59KTtcblxuYWRkRXZlbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0JyksICdjbGljaycsICgpID0+IHtcbiAgICByZWNvcmRzLmxlbmd0aCA9IGVuZE9mZnNldCA9IHJlZHVjZUFtb3VudCA9IDA7XG4gICAgaG92ZXJMb2NrZWQgPSBmYWxzZTtcbiAgICBob3ZlclBvaW50ZXJYID0gdW5kZWZpbmVkO1xuICAgIHRhbmdlbnRQb2ludCA9IG51bGw7XG4gICAgdGFuZ2VudFBvaW50UHJlID0gbnVsbDtcbiAgICBzbGljZVJlY29yZCgpO1xufSk7XG5cbi8vIGhvdmVyXG5hZGRFdmVudChjYW52YXMsICdtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGUpID0+IHtcbiAgICBpZiAoaG92ZXJMb2NrZWQgfHwgcG9pbnRlckRvd25PblRyYWNrKSByZXR1cm47XG5cbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG5cbiAgICBob3ZlclBvaW50ZXJYID0gcG9pbnRlci5jbGllbnRYIC0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG59KTtcblxuZnVuY3Rpb24gcmVzZXRIb3ZlcigpIHtcbiAgICBob3ZlclBvaW50ZXJYID0gMDtcbiAgICB0YW5nZW50UG9pbnQgPSBudWxsO1xuICAgIHRhbmdlbnRQb2ludFByZSA9IG51bGw7XG59O1xuXG5hZGRFdmVudChbY2FudmFzLCB3aW5kb3ddLCAnbW91c2VsZWF2ZSB0b3VjaGVuZCcsICgpID0+IHtcbiAgICBpZiAoaG92ZXJMb2NrZWQpIHJldHVybjtcbiAgICByZXNldEhvdmVyKCk7XG59KTtcblxuYWRkRXZlbnQoY2FudmFzLCAnY2xpY2snLCAoKSA9PiB7XG4gICAgaG92ZXJMb2NrZWQgPSAhaG92ZXJMb2NrZWQ7XG5cbiAgICBpZiAoIWhvdmVyTG9ja2VkKSByZXNldEhvdmVyKCk7XG59KTtcblxuLy8gdHJhY2tcbmFkZEV2ZW50KHRodW1iLCAnbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAoZSkgPT4ge1xuICAgIGxldCBwb2ludGVyID0gZ2V0UG9pbnRlcihlKTtcbiAgICBwb2ludGVyRG93bk9uVHJhY2sgPSBwb2ludGVyLmNsaWVudFg7XG59KTtcblxuYWRkRXZlbnQod2luZG93LCAnbW91c2Vtb3ZlIHRvdWNobW92ZScsIChlKSA9PiB7XG4gICAgaWYgKCFwb2ludGVyRG93bk9uVHJhY2spIHJldHVybjtcblxuICAgIGxldCBwb2ludGVyID0gZ2V0UG9pbnRlcihlKTtcbiAgICBsZXQgbW92ZWQgPSAocG9pbnRlci5jbGllbnRYIC0gcG9pbnRlckRvd25PblRyYWNrKSAvIHNpemUud2lkdGg7XG5cbiAgICBwb2ludGVyRG93bk9uVHJhY2sgPSBwb2ludGVyLmNsaWVudFg7XG4gICAgZW5kT2Zmc2V0ID0gTWF0aC5taW4oMSAtIHRodW1iV2lkdGgsIE1hdGgubWF4KDAsIGVuZE9mZnNldCAtIG1vdmVkKSk7XG59KTtcblxuYWRkRXZlbnQod2luZG93LCAnbW91c2V1cCB0b3VjaGVuZCBibHVyJywgKGUpID0+IHtcbiAgICBwb2ludGVyRG93bk9uVHJhY2sgPSB1bmRlZmluZWQ7XG59KTtcblxuYWRkRXZlbnQodGh1bWIsICdjbGljayB0b3VjaHN0YXJ0JywgKGUpID0+IHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xufSk7XG5cbmFkZEV2ZW50KHRyYWNrLCAnY2xpY2sgdG91Y2hzdGFydCcsIChlKSA9PiB7XG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuICAgIGxldCByZWN0ID0gdHJhY2suZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGV0IG9mZnNldCA9IChwb2ludGVyLmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aDtcbiAgICBlbmRPZmZzZXQgPSBNYXRoLm1pbigxIC0gdGh1bWJXaWR0aCwgTWF0aC5tYXgoMCwgMSAtIChvZmZzZXQgKyB0aHVtYldpZHRoIC8gMikpKTtcbn0pO1xuXG4vLyBzd2l0Y2ggY2hhcnRcbmFkZEV2ZW50KFxuICAgIFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoYXJ0LXR5cGUnKSksXG4gICAgJ2NoYW5nZScsXG4gICAgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKHRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgICBjaGFydFR5cGUgPSB0YXJnZXQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L3NjcmlwdHMvbW9uaXRvci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5c1wiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3Qva2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5rZXlzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmtleXM7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDE5LjEuMi4xNCBPYmplY3Qua2V5cyhPKVxudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpO1xuXG5yZXF1aXJlKCcuLyQub2JqZWN0LXNhcCcpKCdrZXlzJywgZnVuY3Rpb24oJGtleXMpe1xuICByZXR1cm4gZnVuY3Rpb24ga2V5cyhpdCl7XG4gICAgcmV0dXJuICRrZXlzKHRvT2JqZWN0KGl0KSk7XG4gIH07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gNy4xLjEzIFRvT2JqZWN0KGFyZ3VtZW50KVxudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZGVmaW5lZC5qc1xuICoqIG1vZHVsZSBpZCA9IDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIG1vc3QgT2JqZWN0IG1ldGhvZHMgYnkgRVM2IHNob3VsZCBhY2NlcHQgcHJpbWl0aXZlc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCBjb3JlICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsIGZhaWxzICAgPSByZXF1aXJlKCcuLyQuZmFpbHMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZLCBleGVjKXtcbiAgdmFyIGZuICA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZXhwID0ge307XG4gIGV4cFtLRVldID0gZXhlYyhmbik7XG4gICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogZmFpbHMoZnVuY3Rpb24oKXsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LXNhcC5qc1xuICoqIG1vZHVsZSBpZCA9IDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkZcbiAgICAsIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0LkdcbiAgICAsIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlNcbiAgICAsIElTX1BST1RPICA9IHR5cGUgJiAkZXhwb3J0LlBcbiAgICAsIElTX0JJTkQgICA9IHR5cGUgJiAkZXhwb3J0LkJcbiAgICAsIElTX1dSQVAgICA9IHR5cGUgJiAkZXhwb3J0LldcbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBrZXksIG93biwgb3V0O1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBleHBvcnRzW2tleV0gPSBJU19HTE9CQUwgJiYgdHlwZW9mIHRhcmdldFtrZXldICE9ICdmdW5jdGlvbicgPyBzb3VyY2Vba2V5XVxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgOiBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbClcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIDogSVNfV1JBUCAmJiB0YXJnZXRba2V5XSA9PSBvdXQgPyAoZnVuY3Rpb24oQyl7XG4gICAgICB2YXIgRiA9IGZ1bmN0aW9uKHBhcmFtKXtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBDID8gbmV3IEMocGFyYW0pIDogQyhwYXJhbSk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIGlmKElTX1BST1RPKShleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KSlba2V5XSA9IG91dDtcbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgLy8gd3JhcFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qc1xuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5nbG9iYWwuanNcbiAqKiBtb2R1bGUgaWQgPSAxMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMS4yLjYnfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvcmUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmEtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY3R4LmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmEtZnVuY3Rpb24uanNcbiAqKiBtb2R1bGUgaWQgPSAxM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZmFpbHMuanNcbiAqKiBtb2R1bGUgaWQgPSAxNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IHNlbGVjdG9ycywgc2JMaXN0IH0gZnJvbSAnLi9zaGFyZWQnO1xuXG5pbXBvcnQgJy4vYXBpcy8nO1xuaW1wb3J0ICcuL3JlbmRlci8nO1xuaW1wb3J0ICcuL2V2ZW50cy8nO1xuaW1wb3J0ICcuL2ludGVybmFscy8nO1xuXG5leHBvcnQgZGVmYXVsdCBTbW9vdGhTY3JvbGxiYXI7XG5cblNtb290aFNjcm9sbGJhci52ZXJzaW9uID0gJzwlPSB2ZXJzaW9uICU+JztcblxuLyoqXG4gKiBpbml0IHNjcm9sbGJhciBvbiBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtOiB0YXJnZXQgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnM6IHNjcm9sbGJhciBvcHRpb25zXG4gKlxuICogQHJldHVybiB7U2Nyb2xsYmFyfSBzY3JvbGxiYXIgaW5zdGFuY2VcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmluaXQgPSAoZWxlbSwgb3B0aW9ucykgPT4ge1xuICAgIGlmICghZWxlbSB8fCBlbGVtLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdCBlbGVtZW50IHRvIGJlIERPTSBFbGVtZW50LCBidXQgZ290ICR7dHlwZW9mIGVsZW19YCk7XG4gICAgfVxuXG4gICAgaWYgKHNiTGlzdC5oYXMoZWxlbSkpIHJldHVybiBzYkxpc3QuZ2V0KGVsZW0pO1xuXG4gICAgZWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtc2Nyb2xsYmFyJywgJycpO1xuXG4gICAgY29uc3QgY2hpbGRyZW4gPSBbLi4uZWxlbS5jaGlsZHJlbl07XG5cbiAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIGRpdi5pbm5lckhUTUwgPSBgXG4gICAgICAgIDxhcnRpY2xlIGNsYXNzPVwic2Nyb2xsLWNvbnRlbnRcIj48L2FydGljbGU+XG4gICAgICAgIDxhc2lkZSBjbGFzcz1cInNjcm9sbGJhci10cmFjayBzY3JvbGxiYXItdHJhY2steFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbGJhci10aHVtYiBzY3JvbGxiYXItdGh1bWIteFwiPjwvZGl2PlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgICA8YXNpZGUgY2xhc3M9XCJzY3JvbGxiYXItdHJhY2sgc2Nyb2xsYmFyLXRyYWNrLXlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzY3JvbGxiYXItdGh1bWIgc2Nyb2xsYmFyLXRodW1iLXlcIj48L2Rpdj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICBgO1xuXG4gICAgY29uc3Qgc2Nyb2xsQ29udGVudCA9IGRpdi5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsLWNvbnRlbnQnKTtcblxuICAgIFsuLi5kaXYuY2hpbGRyZW5dLmZvckVhY2goKGVsKSA9PiBlbGVtLmFwcGVuZENoaWxkKGVsKSk7XG5cbiAgICBjaGlsZHJlbi5mb3JFYWNoKChlbCkgPT4gc2Nyb2xsQ29udGVudC5hcHBlbmRDaGlsZChlbCkpO1xuXG4gICAgcmV0dXJuIG5ldyBTbW9vdGhTY3JvbGxiYXIoZWxlbSwgb3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIGluaXQgc2Nyb2xsYmFycyBvbiBwcmUtZGVmaW5lZCBzZWxlY3RvcnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uczogc2Nyb2xsYmFyIG9wdGlvbnNcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0gYSBjb2xsZWN0aW9uIG9mIHNjcm9sbGJhciBpbnN0YW5jZXNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmluaXRBbGwgPSAob3B0aW9ucykgPT4ge1xuICAgIHJldHVybiBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpXS5tYXAoKGVsKSA9PiB7XG4gICAgICAgIHJldHVybiBTbW9vdGhTY3JvbGxiYXIuaW5pdChlbCwgb3B0aW9ucyk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIGNoZWNrIGlmIHNjcm9sbGJhciBleGlzdHMgb24gZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblNtb290aFNjcm9sbGJhci5oYXMgPSAoZWxlbSkgPT4ge1xuICAgIHJldHVybiBzYkxpc3QuaGFzKGVsZW0pO1xufTtcblxuLyoqXG4gKiBnZXQgc2Nyb2xsYmFyIGluc3RhbmNlIHRocm91Z2ggZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbTogdGFyZ2V0IHNjcm9sbGJhciBjb250YWluZXJcbiAqXG4gKiBAcmV0dXJuIHtTY3JvbGxiYXJ9XG4gKi9cblNtb290aFNjcm9sbGJhci5nZXQgPSAoZWxlbSkgPT4ge1xuICAgIHJldHVybiBzYkxpc3QuZ2V0KGVsZW0pO1xufTtcblxuLyoqXG4gKiBnZXQgYWxsIHNjcm9sbGJhciBpbnN0YW5jZXNcbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0gYSBjb2xsZWN0aW9uIG9mIHNjcm9sbGJhcnNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmdldEFsbCA9ICgpID0+IHtcbiAgICByZXR1cm4gWy4uLnNiTGlzdC52YWx1ZXMoKV07XG59O1xuXG4vKipcbiAqIGRlc3Ryb3kgc2Nyb2xsYmFyIG9uIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBzY3JvbGxiYXIgY29udGFpbmVyXG4gKi9cblNtb290aFNjcm9sbGJhci5kZXN0cm95ID0gKGVsZW0pID0+IHtcbiAgICByZXR1cm4gU21vb3RoU2Nyb2xsYmFyLmhhcyhlbGVtKSAmJiBTbW9vdGhTY3JvbGxiYXIuZ2V0KGVsZW0pLmRlc3Ryb3koKTtcbn07XG5cbi8qKlxuICogZGVzdHJveSBhbGwgc2Nyb2xsYmFycyBpbiBzY3JvbGxiYXIgaW5zdGFuY2VzXG4gKi9cblNtb290aFNjcm9sbGJhci5kZXN0cm95QWxsID0gKCkgPT4ge1xuICAgIHNiTGlzdC5mb3JFYWNoKChzYikgPT4ge1xuICAgICAgICBzYi5kZXN0cm95KCk7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2luZGV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfQXJyYXkkZnJvbSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbVwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTtcblxuICAgIHJldHVybiBhcnIyO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBfQXJyYXkkZnJvbShhcnIpO1xuICB9XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy90by1jb25zdW1hYmxlLWFycmF5LmpzXG4gKiogbW9kdWxlIGlkID0gMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9hcnJheS9mcm9tXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2FycmF5L2Zyb20uanNcbiAqKiBtb2R1bGUgaWQgPSAxN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5hcnJheS5mcm9tJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuQXJyYXkuZnJvbTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb20uanNcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwgaW5kZXggPSB0aGlzLl9pXG4gICAgLCBwb2ludDtcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHt2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlfTtcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xuICB0aGlzLl9pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHt2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gMTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLyQudG8taW50ZWdlcicpXG4gICwgZGVmaW5lZCAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcbi8vIHRydWUgIC0+IFN0cmluZyNhdFxuLy8gZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRPX1NUUklORyl7XG4gIHJldHVybiBmdW5jdGlvbih0aGF0LCBwb3Mpe1xuICAgIHZhciBzID0gU3RyaW5nKGRlZmluZWQodGhhdCkpXG4gICAgICAsIGkgPSB0b0ludGVnZXIocG9zKVxuICAgICAgLCBsID0gcy5sZW5ndGhcbiAgICAgICwgYSwgYjtcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbCB8fCAoYiA9IHMuY2hhckNvZGVBdChpICsgMSkpIDwgMHhkYzAwIHx8IGIgPiAweGRmZmZcbiAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXG4gICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzXG4gKiogbW9kdWxlIGlkID0gMjBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pbnRlZ2VyLmpzXG4gKiogbW9kdWxlIGlkID0gMjFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBMSUJSQVJZICAgICAgICA9IHJlcXVpcmUoJy4vJC5saWJyYXJ5JylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lJylcbiAgLCBoaWRlICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIEl0ZXJhdG9ycyAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgJGl0ZXJDcmVhdGUgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jcmVhdGUnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi8kLnNldC10by1zdHJpbmctdGFnJylcbiAgLCBnZXRQcm90byAgICAgICA9IHJlcXVpcmUoJy4vJCcpLmdldFByb3RvXG4gICwgSVRFUkFUT1IgICAgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBCVUdHWSAgICAgICAgICA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKSAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gICwgRkZfSVRFUkFUT1IgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKXtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgaWYoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHICAgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTXG4gICAgLCBWQUxVRVNfQlVHID0gZmFsc2VcbiAgICAsIHByb3RvICAgICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgJG5hdGl2ZSAgICA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgJGRlZmF1bHQgICA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpXG4gICAgLCBtZXRob2RzLCBrZXk7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoJG5hdGl2ZSl7XG4gICAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8oJGRlZmF1bHQuY2FsbChuZXcgQmFzZSkpO1xuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAvLyBGRiBmaXhcbiAgICBpZighTElCUkFSWSAmJiBoYXMocHJvdG8sIEZGX0lURVJBVE9SKSloaWRlKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICAgIGlmKERFRl9WQUxVRVMgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpe1xuICAgICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgICAkZGVmYXVsdCA9IGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gJG5hdGl2ZS5jYWxsKHRoaXMpOyB9O1xuICAgIH1cbiAgfVxuICAvLyBEZWZpbmUgaXRlcmF0b3JcbiAgaWYoKCFMSUJSQVJZIHx8IEZPUkNFRCkgJiYgKEJVR0dZIHx8IFZBTFVFU19CVUcgfHwgIXByb3RvW0lURVJBVE9SXSkpe1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gID0gcmV0dXJuVGhpcztcbiAgaWYoREVGQVVMVCl7XG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIHZhbHVlczogIERFRl9WQUxVRVMgID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAhREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKCdlbnRyaWVzJylcbiAgICB9O1xuICAgIGlmKEZPUkNFRClmb3Ioa2V5IGluIG1ldGhvZHMpe1xuICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKXJlZGVmaW5lKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XG4gICAgfSBlbHNlICRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5GICogKEJVR0dZIHx8IFZBTFVFU19CVUcpLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxuICByZXR1cm4gbWV0aG9kcztcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1kZWZpbmUuanNcbiAqKiBtb2R1bGUgaWQgPSAyMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmxpYnJhcnkuanNcbiAqKiBtb2R1bGUgaWQgPSAyM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuaGlkZScpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzXG4gKiogbW9kdWxlIGlkID0gMjRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmRlc2NyaXB0b3JzJykgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICByZXR1cm4gJC5zZXREZXNjKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGlkZS5qc1xuICoqIG1vZHVsZSBpZCA9IDI1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJE9iamVjdCA9IE9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6ICAgICAkT2JqZWN0LmNyZWF0ZSxcbiAgZ2V0UHJvdG86ICAgJE9iamVjdC5nZXRQcm90b3R5cGVPZixcbiAgaXNFbnVtOiAgICAge30ucHJvcGVydHlJc0VudW1lcmFibGUsXG4gIGdldERlc2M6ICAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICBzZXREZXNjOiAgICAkT2JqZWN0LmRlZmluZVByb3BlcnR5LFxuICBzZXREZXNjczogICAkT2JqZWN0LmRlZmluZVByb3BlcnRpZXMsXG4gIGdldEtleXM6ICAgICRPYmplY3Qua2V5cyxcbiAgZ2V0TmFtZXM6ICAgJE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICBnZXRTeW1ib2xzOiAkT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyxcbiAgZWFjaDogICAgICAgW10uZm9yRWFjaFxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5qc1xuICoqIG1vZHVsZSBpZCA9IDI2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJpdG1hcCwgdmFsdWUpe1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qc1xuICoqIG1vZHVsZSBpZCA9IDI3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuLyQuZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZGVzY3JpcHRvcnMuanNcbiAqKiBtb2R1bGUgaWQgPSAyOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGFzLmpzXG4gKiogbW9kdWxlIGlkID0gMjlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0ge307XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzXG4gKiogbW9kdWxlIGlkID0gMzBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuLyQucHJvcGVydHktZGVzYycpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCl7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jcmVhdGUuanNcbiAqKiBtb2R1bGUgaWQgPSAzMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vJCcpLnNldERlc2NcbiAgLCBoYXMgPSByZXF1aXJlKCcuLyQuaGFzJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIHRhZywgc3RhdCl7XG4gIGlmKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpZGVmKGl0LCBUQUcsIHtjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWd9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXRvLXN0cmluZy10YWcuanNcbiAqKiBtb2R1bGUgaWQgPSAzMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHN0b3JlICA9IHJlcXVpcmUoJy4vJC5zaGFyZWQnKSgnd2tzJylcbiAgLCB1aWQgICAgPSByZXF1aXJlKCcuLyQudWlkJylcbiAgLCBTeW1ib2wgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJykuU3ltYm9sO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgU3ltYm9sICYmIFN5bWJvbFtuYW1lXSB8fCAoU3ltYm9sIHx8IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC53a3MuanNcbiAqKiBtb2R1bGUgaWQgPSAzM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2hhcmVkLmpzXG4gKiogbW9kdWxlIGlkID0gMzRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpZCA9IDBcbiAgLCBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVpZC5qc1xuICoqIG1vZHVsZSBpZCA9IDM1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgY3R4ICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCAkZXhwb3J0ICAgICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIHRvT2JqZWN0ICAgID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vJC5pcy1hcnJheS1pdGVyJylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlLyosIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKi8pe1xuICAgIHZhciBPICAgICAgID0gdG9PYmplY3QoYXJyYXlMaWtlKVxuICAgICAgLCBDICAgICAgID0gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheVxuICAgICAgLCAkJCAgICAgID0gYXJndW1lbnRzXG4gICAgICAsICQkbGVuICAgPSAkJC5sZW5ndGhcbiAgICAgICwgbWFwZm4gICA9ICQkbGVuID4gMSA/ICQkWzFdIDogdW5kZWZpbmVkXG4gICAgICAsIG1hcHBpbmcgPSBtYXBmbiAhPT0gdW5kZWZpbmVkXG4gICAgICAsIGluZGV4ICAgPSAwXG4gICAgICAsIGl0ZXJGbiAgPSBnZXRJdGVyRm4oTylcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xuICAgIGlmKG1hcHBpbmcpbWFwZm4gPSBjdHgobWFwZm4sICQkbGVuID4gMiA/ICQkWzJdIDogdW5kZWZpbmVkLCAyKTtcbiAgICAvLyBpZiBvYmplY3QgaXNuJ3QgaXRlcmFibGUgb3IgaXQncyBhcnJheSB3aXRoIGRlZmF1bHQgaXRlcmF0b3IgLSB1c2Ugc2ltcGxlIGNhc2VcbiAgICBpZihpdGVyRm4gIT0gdW5kZWZpbmVkICYmICEoQyA9PSBBcnJheSAmJiBpc0FycmF5SXRlcihpdGVyRm4pKSl7XG4gICAgICBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChPKSwgcmVzdWx0ID0gbmV3IEM7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgbWFwZm4sIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgICAgZm9yKHJlc3VsdCA9IG5ldyBDKGxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBtYXBmbihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDM2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2goZSl7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZihyZXQgIT09IHVuZGVmaW5lZClhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jYWxsLmpzXG4gKiogbW9kdWxlIGlkID0gMzdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hbi1vYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSAzOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDM5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIElURVJBVE9SICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b1tJVEVSQVRPUl0gPT09IGl0KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXMtYXJyYXktaXRlci5qc1xuICoqIG1vZHVsZSBpZCA9IDQwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLyQudG8taW50ZWdlcicpXG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8tbGVuZ3RoLmpzXG4gKiogbW9kdWxlIGlkID0gNDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjbGFzc29mICAgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuY29yZScpLmdldEl0ZXJhdG9yTWV0aG9kID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCAhPSB1bmRlZmluZWQpcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzXG4gKiogbW9kdWxlIGlkID0gNDJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgVEFHID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXG4gIC8vIEVTMyB3cm9uZyBoZXJlXG4gICwgQVJHID0gY29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1RBR10pID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jbGFzc29mLmpzXG4gKiogbW9kdWxlIGlkID0gNDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29mLmpzXG4gKiogbW9kdWxlIGlkID0gNDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBJVEVSQVRPUiAgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBTQUZFX0NMT1NJTkcgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIHJpdGVyID0gWzddW0lURVJBVE9SXSgpO1xuICByaXRlclsncmV0dXJuJ10gPSBmdW5jdGlvbigpeyBTQUZFX0NMT1NJTkcgPSB0cnVlOyB9O1xuICBBcnJheS5mcm9tKHJpdGVyLCBmdW5jdGlvbigpeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjLCBza2lwQ2xvc2luZyl7XG4gIGlmKCFza2lwQ2xvc2luZyAmJiAhU0FGRV9DTE9TSU5HKXJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyICA9IFs3XVxuICAgICAgLCBpdGVyID0gYXJyW0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uKCl7IHNhZmUgPSB0cnVlOyB9O1xuICAgIGFycltJVEVSQVRPUl0gPSBmdW5jdGlvbigpeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgcmV0dXJuIHNhZmU7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7Q2xhc3N9IFNtb290aFNjcm9sbGJhclxuICovXG5cbmltcG9ydCB7IHNiTGlzdCB9IGZyb20gJy4vc2hhcmVkLyc7XG5pbXBvcnQge1xuICAgIGRlYm91bmNlLFxuICAgIGZpbmRDaGlsZCxcbiAgICBzZXRTdHlsZVxufSBmcm9tICcuL3V0aWxzLyc7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBDcmVhdGUgc2Nyb2xsYmFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXI6IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdOiBvcHRpb25zXG4gKi9cbmV4cG9ydCBjbGFzcyBTbW9vdGhTY3JvbGxiYXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lciwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHNiTGlzdC5zZXQoY29udGFpbmVyLCB0aGlzKTtcblxuICAgICAgICAvLyBtYWtlIGNvbnRhaW5lciBmb2N1c2FibGVcbiAgICAgICAgY29udGFpbmVyLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnMScpO1xuXG4gICAgICAgIC8vIHJlc2V0IHNjcm9sbCBwb3NpdGlvblxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xuXG4gICAgICAgIHNldFN0eWxlKGNvbnRhaW5lciwge1xuICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHRyYWNrWCA9IGZpbmRDaGlsZChjb250YWluZXIsICdzY3JvbGxiYXItdHJhY2steCcpO1xuICAgICAgICBjb25zdCB0cmFja1kgPSBmaW5kQ2hpbGQoY29udGFpbmVyLCAnc2Nyb2xsYmFyLXRyYWNrLXknKTtcblxuICAgICAgICAvLyByZWFkb25seSBwcm9wZXJ0aWVzXG4gICAgICAgIHRoaXMuX19yZWFkb25seSgndGFyZ2V0cycsIE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgICAgY29udGFpbmVyLFxuICAgICAgICAgICAgY29udGVudDogZmluZENoaWxkKGNvbnRhaW5lciwgJ3Njcm9sbC1jb250ZW50JyksXG4gICAgICAgICAgICB4QXhpczogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICAgICAgdHJhY2s6IHRyYWNrWCxcbiAgICAgICAgICAgICAgICB0aHVtYjogZmluZENoaWxkKHRyYWNrWCwgJ3Njcm9sbGJhci10aHVtYi14JylcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgeUF4aXM6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgICAgICAgIHRyYWNrOiB0cmFja1ksXG4gICAgICAgICAgICAgICAgdGh1bWI6IGZpbmRDaGlsZCh0cmFja1ksICdzY3JvbGxiYXItdGh1bWIteScpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ29mZnNldCcsIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdsaW1pdCcsIHtcbiAgICAgICAgICAgIHg6IEluZmluaXR5LFxuICAgICAgICAgICAgeTogSW5maW5pdHlcbiAgICAgICAgfSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ21vdmVtZW50Jywge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ3RodW1iU2l6ZScsIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgcmVhbFg6IDAsXG4gICAgICAgICAgICByZWFsWTogMFxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnc2l6ZScsIHRoaXMuZ2V0U2l6ZSgpKTtcblxuICAgICAgICAvLyBub24tZW5tdXJhYmxlIHByb3BlcnRpZXNcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAgICAgX191cGRhdGVUaHJvdHRsZToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBkZWJvdW5jZSg6OnRoaXMudXBkYXRlKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9fbGlzdGVuZXJzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX19oYW5kbGVyczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBbXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9fY2hpbGRyZW46IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogW11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX3RpbWVySUQ6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZToge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWNjZXNzb3JzXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDoge1xuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Lnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNjcm9sbExlZnQ6IHtcbiAgICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9mZnNldC54O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fX2luaXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9faW5pdFNjcm9sbGJhcigpO1xuICAgIH1cbn1cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanNcbiAqKiBtb2R1bGUgaWQgPSA0N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9mcmVlemVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDQ4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZnJlZXplJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmZyZWV6ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9mcmVlemUuanNcbiAqKiBtb2R1bGUgaWQgPSA0OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjUgT2JqZWN0LmZyZWV6ZShPKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xuXG5yZXF1aXJlKCcuLyQub2JqZWN0LXNhcCcpKCdmcmVlemUnLCBmdW5jdGlvbigkZnJlZXplKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuICRmcmVlemUgJiYgaXNPYmplY3QoaXQpID8gJGZyZWV6ZShpdCkgOiBpdDtcbiAgfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDUwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qc1xuICoqIG1vZHVsZSBpZCA9IDUxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKFQsIEQpe1xuICByZXR1cm4gJC5zZXREZXNjcyhULCBEKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9zYl9saXN0JztcbmV4cG9ydCAqIGZyb20gJy4vc2VsZWN0b3JzJztcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lc1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqLCBkZWZhdWx0cykge1xuICB2YXIga2V5cyA9IF9PYmplY3QkZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG5cbiAgICB2YXIgdmFsdWUgPSBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cywga2V5KTtcblxuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb25maWd1cmFibGUgJiYgb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgX09iamVjdCRkZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9kZWZhdWx0cy5qc1xuICoqIG1vZHVsZSBpZCA9IDU0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICByZXR1cm4gJC5nZXROYW1lcyhpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5TmFtZXMnLCBmdW5jdGlvbigpe1xuICByZXR1cm4gcmVxdWlyZSgnLi8kLmdldC1uYW1lcycpLmdldDtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZmFsbGJhY2sgZm9yIElFMTEgYnVnZ3kgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgd2l0aCBpZnJhbWUgYW5kIHdpbmRvd1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0JylcbiAgLCBnZXROYW1lcyAgPSByZXF1aXJlKCcuLyQnKS5nZXROYW1lc1xuICAsIHRvU3RyaW5nICA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG52YXIgZ2V0V2luZG93TmFtZXMgPSBmdW5jdGlvbihpdCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdldE5hbWVzKGl0KTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIGlmKHdpbmRvd05hbWVzICYmIHRvU3RyaW5nLmNhbGwoaXQpID09ICdbb2JqZWN0IFdpbmRvd10nKXJldHVybiBnZXRXaW5kb3dOYW1lcyhpdCk7XG4gIHJldHVybiBnZXROYW1lcyh0b0lPYmplY3QoaXQpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2V0LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNTlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNjBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICByZXR1cm4gJC5nZXREZXNjKGl0LCBrZXkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ipe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDY0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhpdCwga2V5LCBkZXNjKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzXG4gKiogbW9kdWxlIGlkID0gNjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gIHZhciBuZXdPYmogPSBkZWZhdWx0cyh7fSwgb2JqKTtcbiAgZGVsZXRlIG5ld09ialtcImRlZmF1bHRcIl07XG4gIHJldHVybiBuZXdPYmo7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLWV4cG9ydC13aWxkY2FyZC5qc1xuICoqIG1vZHVsZSBpZCA9IDY2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge01hcH0gc2JMaXN0XG4gKi9cblxuY29uc3Qgc2JMaXN0ID0gbmV3IE1hcCgpO1xuXG5jb25zdCBvcmlnaW5TZXQgPSA6OnNiTGlzdC5zZXQ7XG5cbnNiTGlzdC51cGRhdGUgPSAoKSA9PiB7XG4gICAgc2JMaXN0LmZvckVhY2goKHNiKSA9PiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBzYi5fX3VwZGF0ZUNoaWxkcmVuKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLy8gcGF0Y2ggI3NldCB3aXRoICN1cGRhdGUgbWV0aG9kXG5zYkxpc3Quc2V0ID0gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCByZXMgPSBvcmlnaW5TZXQoLi4uYXJncyk7XG4gICAgc2JMaXN0LnVwZGF0ZSgpO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbmV4cG9ydCB7IHNiTGlzdCB9O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9zYl9saXN0LmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL21hcFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA2OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy8kLmNvcmUnKS5NYXA7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA2OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBJdGVyYXRvcnMuQXJyYXk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSA3MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLyQuYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSXRlcmF0b3JzICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwga2luZCAgPSB0aGlzLl9rXG4gICAgLCBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA3MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFkZC10by11bnNjb3BhYmxlcy5qc1xuICoqIG1vZHVsZSBpZCA9IDczXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItc3RlcC5qc1xuICoqIG1vZHVsZSBpZCA9IDc0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XG5cbi8vIDIzLjEgTWFwIE9iamVjdHNcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ01hcCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBNYXAoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcbiAgfSxcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzXG4gKiogbW9kdWxlIGlkID0gNzVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGhpZGUgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCByZWRlZmluZUFsbCAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUtYWxsJylcbiAgLCBjdHggICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBzdHJpY3ROZXcgICAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpXG4gICwgZGVmaW5lZCAgICAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKVxuICAsIGZvck9mICAgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsICRpdGVyRGVmaW5lICA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpXG4gICwgc3RlcCAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSUQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpKCdpZCcpXG4gICwgJGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgaXNPYmplY3QgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgc2V0U3BlY2llcyAgID0gcmVxdWlyZSgnLi8kLnNldC1zcGVjaWVzJylcbiAgLCBERVNDUklQVE9SUyAgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBTSVpFICAgICAgICAgPSBERVNDUklQVE9SUyA/ICdfcycgOiAnc2l6ZSdcbiAgLCBpZCAgICAgICAgICAgPSAwO1xuXG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYoISRoYXMoaXQsIElEKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxuICAgIGhpZGUoaXQsIElELCArK2lkKTtcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XG59O1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbih0aGF0LCBrZXkpe1xuICAvLyBmYXN0IGNhc2VcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcbiAgaWYoaW5kZXggIT09ICdGJylyZXR1cm4gdGhhdC5faVtpbmRleF07XG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxuICBmb3IoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0aGF0LCBDLCBOQU1FKTtcbiAgICAgIHRoYXQuX2kgPSAkLmNyZWF0ZShudWxsKTsgLy8gaW5kZXhcbiAgICAgIHRoYXQuX2YgPSB1bmRlZmluZWQ7ICAgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgICAgLy8gbGFzdCBlbnRyeVxuICAgICAgdGhhdFtTSVpFXSA9IDA7ICAgICAgICAgICAvLyBzaXplXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XG4gICAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0Ll9pLCBlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKGVudHJ5LnApZW50cnkucCA9IGVudHJ5LnAubiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGF0Ll9mID0gdGhhdC5fbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhhdFtTSVpFXSA9IDA7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgICAgICBpZihlbnRyeSl7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXG4gICAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xuICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9pW2VudHJ5LmldO1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XG4gICAgICAgICAgaWYodGhhdC5fZiA9PSBlbnRyeSl0aGF0Ll9mID0gbmV4dDtcbiAgICAgICAgICBpZih0aGF0Ll9sID09IGVudHJ5KXRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzLl9mKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKERFU0NSSVBUT1JTKSQuc2V0RGVzYyhDLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBkZWZpbmVkKHRoaXNbU0laRV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcbiAgICAgICwgcHJldiwgaW5kZXg7XG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XG4gICAgaWYoZW50cnkpe1xuICAgICAgZW50cnkudiA9IHZhbHVlO1xuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5fbCA9IGVudHJ5ID0ge1xuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxuICAgICAgICB2OiB2YWx1ZSwgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgICAgcDogcHJldiA9IHRoYXQuX2wsICAgICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XG4gICAgICAgIHI6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSByZW1vdmVkXG4gICAgICB9O1xuICAgICAgaWYoIXRoYXQuX2YpdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcbiAgICAgIHRoYXRbU0laRV0rKztcbiAgICAgIC8vIGFkZCB0byBpbmRleFxuICAgICAgaWYoaW5kZXggIT09ICdGJyl0aGF0Ll9pW2luZGV4XSA9IGVudHJ5O1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcbiAgc2V0U3Ryb25nOiBmdW5jdGlvbihDLCBOQU1FLCBJU19NQVApe1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICAgICB0aGlzLl90ID0gaXRlcmF0ZWQ7ICAvLyB0YXJnZXRcbiAgICAgIHRoaXMuX2sgPSBraW5kOyAgICAgIC8vIGtpbmRcbiAgICAgIHRoaXMuX2wgPSB1bmRlZmluZWQ7IC8vIHByZXZpb3VzXG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgLCBraW5kICA9IHRoYXQuX2tcbiAgICAgICAgLCBlbnRyeSA9IHRoYXQuX2w7XG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmKCF0aGF0Ll90IHx8ICEodGhhdC5fbCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhhdC5fdC5fZikpe1xuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxuICAgICAgICB0aGF0Ll90ID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gc3RlcCgxKTtcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcbiAgICAgIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgZW50cnkuayk7XG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xuICAgICAgcmV0dXJuIHN0ZXAoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTtcbiAgICB9LCBJU19NQVAgPyAnZW50cmllcycgOiAndmFsdWVzJyAsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24tc3Ryb25nLmpzXG4gKiogbW9kdWxlIGlkID0gNzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XG4gIGZvcih2YXIga2V5IGluIHNyYylyZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS1hbGwuanNcbiAqKiBtb2R1bGUgaWQgPSA3N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUpe1xuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKXRocm93IFR5cGVFcnJvcihuYW1lICsgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanNcbiAqKiBtb2R1bGUgaWQgPSA3OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vJC5pcy1hcnJheS1pdGVyJylcbiAgLCBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQpe1xuICB2YXIgaXRlckZuID0gZ2V0SXRlckZuKGl0ZXJhYmxlKVxuICAgICwgZiAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yO1xuICBpZih0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ZXJhYmxlICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIC8vIGZhc3QgY2FzZSBmb3IgYXJyYXlzIHdpdGggZGVmYXVsdCBpdGVyYXRvclxuICBpZihpc0FycmF5SXRlcihpdGVyRm4pKWZvcihsZW5ndGggPSB0b0xlbmd0aChpdGVyYWJsZS5sZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICB9IGVsc2UgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7ICl7XG4gICAgY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZm9yLW9mLmpzXG4gKiogbW9kdWxlIGlkID0gNzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIFNQRUNJRVMgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSBjb3JlW0tFWV07XG4gIGlmKERFU0NSSVBUT1JTICYmIEMgJiYgIUNbU1BFQ0lFU10pJC5zZXREZXNjKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXNwZWNpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA4MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBnbG9iYWwgICAgICAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgZmFpbHMgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZmFpbHMnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIHJlZGVmaW5lQWxsICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lLWFsbCcpXG4gICwgZm9yT2YgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBzdHJpY3ROZXcgICAgICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBpc09iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi8kLnNldC10by1zdHJpbmctdGFnJylcbiAgLCBERVNDUklQVE9SUyAgICA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gZ2xvYmFsW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBpZighREVTQ1JJUFRPUlMgfHwgdHlwZW9mIEMgIT0gJ2Z1bmN0aW9uJyB8fCAhKElTX1dFQUsgfHwgcHJvdG8uZm9yRWFjaCAmJiAhZmFpbHMoZnVuY3Rpb24oKXtcbiAgICBuZXcgQygpLmVudHJpZXMoKS5uZXh0KCk7XG4gIH0pKSl7XG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcbiAgICBDID0gY29tbW9uLmdldENvbnN0cnVjdG9yKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbih0YXJnZXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0YXJnZXQsIEMsIE5BTUUpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2U7XG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGFyZ2V0W0FEREVSXSwgdGFyZ2V0KTtcbiAgICB9KTtcbiAgICAkLmVhY2guY2FsbCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMnLnNwbGl0KCcsJyksZnVuY3Rpb24oS0VZKXtcbiAgICAgIHZhciBJU19BRERFUiA9IEtFWSA9PSAnYWRkJyB8fCBLRVkgPT0gJ3NldCc7XG4gICAgICBpZihLRVkgaW4gcHJvdG8gJiYgIShJU19XRUFLICYmIEtFWSA9PSAnY2xlYXInKSloaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICBpZighSVNfQURERVIgJiYgSVNfV0VBSyAmJiAhaXNPYmplY3QoYSkpcmV0dXJuIEtFWSA9PSAnZ2V0JyA/IHVuZGVmaW5lZCA6IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBJU19BRERFUiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZignc2l6ZScgaW4gcHJvdG8pJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Muc2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNldFRvU3RyaW5nVGFnKEMsIE5BTUUpO1xuXG4gIE9bTkFNRV0gPSBDO1xuICAkZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiwgTyk7XG5cbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldFN0cm9uZyhDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gODFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZXhwb3J0ICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAsICdNYXAnLCB7dG9KU09OOiByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ01hcCcpfSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDgyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgZm9yT2YgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIGNsYXNzb2YgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpe1xuICAgIGlmKGNsYXNzb2YodGhpcykgIT0gTkFNRSl0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBmb3JPZih0aGlzLCBmYWxzZSwgYXJyLnB1c2gsIGFycik7XG4gICAgcmV0dXJuIGFycjtcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzXG4gKiogbW9kdWxlIGlkID0gODNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7U3RyaW5nfSBzZWxlY3RvcnNcbiAqL1xuXG5leHBvcnQgY29uc3Qgc2VsZWN0b3JzID0gJ3Njcm9sbGJhciwgW3Njcm9sbGJhcl0sIFtkYXRhLXNjcm9sbGJhcl0nO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9zZWxlY3RvcnMuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL2RlYm91bmNlJztcbmV4cG9ydCAqIGZyb20gJy4vc2V0X3N0eWxlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X2RlbHRhJztcbmV4cG9ydCAqIGZyb20gJy4vZmluZF9jaGlsZCc7XG5leHBvcnQgKiBmcm9tICcuL2J1aWxkX2N1cnZlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3RvdWNoX2lkJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3Bvc2l0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vcGlja19pbl9yYW5nZSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZGVib3VuY2VcbiAqL1xuXG4vLyBkZWJvdW5jZSB0aW1lcnMgcmVzZXQgd2FpdFxuY29uc3QgUkVTRVRfV0FJVCA9IDEwMDtcblxuLyoqXG4gKiBDYWxsIGZuIGlmIGl0IGlzbid0IGJlIGNhbGxlZCBpbiBhIHBlcmlvZFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge051bWJlcn0gW3dhaXRdOiBkZWJvdW5jZSB3YWl0LCBkZWZhdWx0IGlzIFJFU1RfV0FJVFxuICogQHBhcmFtIHtCb29sZWFufSBbaW1tZWRpYXRlXTogd2hldGhlciB0byBydW4gdGFzayBhdCBsZWFkaW5nLCBkZWZhdWx0IGlzIHRydWVcbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGxldCBkZWJvdW5jZSA9IChmbiwgd2FpdCA9IFJFU0VUX1dBSVQsIGltbWVkaWF0ZSA9IHRydWUpID0+IHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICBsZXQgdGltZXI7XG5cbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKCF0aW1lciAmJiBpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gZm4oLi4uYXJncykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBmbiguLi5hcmdzKTtcbiAgICAgICAgfSwgd2FpdCk7XG4gICAgfTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZGVib3VuY2UuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBzZXRTdHlsZVxuICovXG5cbmNvbnN0IFZFTkRPUl9QUkVGSVggPSBbXG4gICAgJ3dlYmtpdCcsXG4gICAgJ21veicsXG4gICAgJ21zJyxcbiAgICAnbydcbl07XG5cbmNvbnN0IFJFID0gbmV3IFJlZ0V4cChgXi0oPyEoPzoke1ZFTkRPUl9QUkVGSVguam9pbignfCcpfSktKWApO1xuXG5sZXQgYXV0b1ByZWZpeCA9IChzdHlsZXMpID0+IHtcbiAgICBjb25zdCByZXMgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBpZiAoIVJFLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgIHJlc1twcm9wXSA9IHN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbCA9IHN0eWxlc1twcm9wXTtcblxuICAgICAgICBwcm9wID0gcHJvcC5yZXBsYWNlKC9eLS8sICcnKTtcbiAgICAgICAgcmVzW3Byb3BdID0gdmFsO1xuXG4gICAgICAgIFZFTkRPUl9QUkVGSVguZm9yRWFjaCgocHJlZml4KSA9PiB7XG4gICAgICAgICAgICByZXNbYC0ke3ByZWZpeH0tJHtwcm9wfWBdID0gdmFsO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogc2V0IGNzcyBzdHlsZSBmb3IgdGFyZ2V0IGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGVzOiBjc3Mgc3R5bGVzIHRvIGFwcGx5XG4gKi9cbmV4cG9ydCBsZXQgc2V0U3R5bGUgPSAoZWxlbSwgc3R5bGVzKSA9PiB7XG4gICAgc3R5bGVzID0gYXV0b1ByZWZpeChzdHlsZXMpO1xuXG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGxldCBjc3NQcm9wID0gcHJvcC5yZXBsYWNlKC9eLS8sICcnKS5yZXBsYWNlKC8tKFthLXpdKS9nLCAobSwgJDEpID0+ICQxLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICBlbGVtLnN0eWxlW2Nzc1Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9zZXRfc3R5bGUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXREZWx0YVxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cbmNvbnN0IERFTFRBX1NDQUxFID0ge1xuICAgIFNUQU5EQVJEOiAxLFxuICAgIE9USEVSUzogLTNcbn07XG5cbmNvbnN0IERFTFRBX01PREUgPSBbMS4wLCAyOC4wLCA1MDAuMF07XG5cbmxldCBnZXREZWx0YU1vZGUgPSAobW9kZSkgPT4gREVMVEFfTU9ERVttb2RlXSB8fCBERUxUQV9NT0RFWzBdO1xuXG4vKipcbiAqIE5vcm1hbGl6aW5nIHdoZWVsIGRlbHRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKi9cbmV4cG9ydCBsZXQgZ2V0RGVsdGEgPSAoZXZ0KSA9PiB7XG4gICAgLy8gZ2V0IG9yaWdpbmFsIERPTSBldmVudFxuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGlmICgnZGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgY29uc3QgbW9kZSA9IGdldERlbHRhTW9kZShldnQuZGVsdGFNb2RlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogZXZ0LmRlbHRhWCAvIERFTFRBX1NDQUxFLlNUQU5EQVJEICogbW9kZSxcbiAgICAgICAgICAgIHk6IGV2dC5kZWx0YVkgLyBERUxUQV9TQ0FMRS5TVEFOREFSRCAqIG1vZGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoJ3doZWVsRGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGV2dC53aGVlbERlbHRhWCAvIERFTFRBX1NDQUxFLk9USEVSUyxcbiAgICAgICAgICAgIHk6IGV2dC53aGVlbERlbHRhWSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIGllIHdpdGggdG91Y2hwYWRcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiBldnQud2hlZWxEZWx0YSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgIH07XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X2RlbHRhLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0T3JpZ2luYWxFdmVudFxuICovXG5cbi8qKlxuICogR2V0IG9yaWdpbmFsIERPTSBldmVudFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge0V2ZW50T2JqZWN0fVxuICovXG5leHBvcnQgbGV0IGdldE9yaWdpbmFsRXZlbnQgPSAoZXZ0KSA9PiB7XG4gICAgcmV0dXJuIGV2dC5vcmlnaW5hbEV2ZW50IHx8IGV2dDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X29yaWdpbmFsX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZmluZENoaWxkXG4gKi9cblxuLyoqXG4gKiBGaW5kIGVsZW1lbnQgd2l0aCBzcGVjaWZpYyBjbGFzcyBuYW1lIHdpdGhpbiBjaGlsZHJlblxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gcGFyZW50RWxlbVxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZVxuICpcbiAqIEByZXR1cm4ge0VsZW1lbnR9OiBmaXJzdCBtYXRjaGVkIGNoaWxkXG4gKi9cbmV4cG9ydCBsZXQgZmluZENoaWxkID0gKHBhcmVudEVsZW0sIGNsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IHBhcmVudEVsZW0uY2hpbGRyZW47XG5cbiAgICBpZiAoIWNoaWxkcmVuKSByZXR1cm4gbnVsbDtcblxuICAgIGZvciAobGV0IGVsZW0gb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGVsZW0uY2xhc3NOYW1lLm1hdGNoKGNsYXNzTmFtZSkpIHJldHVybiBlbGVtO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9maW5kX2NoaWxkLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA5MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvcicpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIGdldCAgICAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5nZXRJdGVyYXRvciA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldChpdCk7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgcmV0dXJuIGFuT2JqZWN0KGl0ZXJGbi5jYWxsKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDkzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBidWlsZEN1cnZlXG4gKi9cblxuLyoqXG4gKiBCdWlsZCBxdWFkcmF0aWMgZWFzaW5nIGN1cnZlXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJlZ2luXG4gKiBAcGFyYW0ge051bWJlcn0gZHVyYXRpb25cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX06IHBvaW50c1xuICovXG5leHBvcnQgbGV0IGJ1aWxkQ3VydmUgPSAoZGlzdGFuY2UsIGR1cmF0aW9uKSA9PiB7XG4gICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgaWYgKGR1cmF0aW9uIDw9IDApIHJldHVybiByZXM7XG5cbiAgICBjb25zdCB0ID0gTWF0aC5yb3VuZChkdXJhdGlvbiAvIDEwMDAgKiA2MCk7XG4gICAgY29uc3QgYSA9IC1kaXN0YW5jZSAvIHQqKjI7XG4gICAgY29uc3QgYiA9IC0yICogYSAqIHQ7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHQ7IGkrKykge1xuICAgICAgICByZXMucHVzaChhICogaSoqMiArIGIgKiBpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9idWlsZF9jdXJ2ZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldFRvdWNoSURcbiAqIEBkZXBlbmRlbmNpZXMgWyBnZXRPcmlnaW5hbEV2ZW50LCBnZXRQb2ludGVyRGF0YSBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcbmltcG9ydCB7IGdldFBvaW50ZXJEYXRhIH0gZnJvbSAnLi9nZXRfcG9pbnRlcl9kYXRhJztcblxuLyoqXG4gKiBHZXQgdG91Y2ggaWRlbnRpZmllclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge051bWJlcn06IHRvdWNoIGlkXG4gKi9cbmV4cG9ydCBsZXQgZ2V0VG91Y2hJRCA9IChldnQpID0+IHtcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICBsZXQgZGF0YSA9IGdldFBvaW50ZXJEYXRhKGV2dCk7XG5cbiAgICByZXR1cm4gZGF0YS5pZGVudGlmaWVyO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9nZXRfdG91Y2hfaWQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXRQb2ludGVyRGF0YVxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cbi8qKlxuICogR2V0IHBvaW50ZXIvdG91Y2ggZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKi9cbmV4cG9ydCBsZXQgZ2V0UG9pbnRlckRhdGEgPSAoZXZ0KSA9PiB7XG4gICAgLy8gaWYgaXMgdG91Y2ggZXZlbnQsIHJldHVybiBsYXN0IGl0ZW0gaW4gdG91Y2hMaXN0XG4gICAgLy8gZWxzZSByZXR1cm4gb3JpZ2luYWwgZXZlbnRcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICByZXR1cm4gZXZ0LnRvdWNoZXMgPyBldnQudG91Y2hlc1tldnQudG91Y2hlcy5sZW5ndGggLSAxXSA6IGV2dDtcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9nZXRfcG9pbnRlcl9kYXRhLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0UG9zaXRpb25cbiAqIEBkZXBlbmRlbmNpZXMgWyBnZXRPcmlnaW5hbEV2ZW50LCBnZXRQb2ludGVyRGF0YSBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcbmltcG9ydCB7IGdldFBvaW50ZXJEYXRhIH0gZnJvbSAnLi9nZXRfcG9pbnRlcl9kYXRhJztcblxuLyoqXG4gKiBHZXQgcG9pbnRlci9maW5nZXIgcG9zaXRpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge09iamVjdH06IHBvc2l0aW9ue3gsIHl9XG4gKi9cbmV4cG9ydCBsZXQgZ2V0UG9zaXRpb24gPSAoZXZ0KSA9PiB7XG4gICAgZXZ0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgbGV0IGRhdGEgPSBnZXRQb2ludGVyRGF0YShldnQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogZGF0YS5jbGllbnRYLFxuICAgICAgICB5OiBkYXRhLmNsaWVudFlcbiAgICB9O1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF9wb3NpdGlvbi5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IHBpY2tJblJhbmdlXG4gKi9cblxuLyoqXG4gKiBQaWNrIHZhbHVlIGluIHJhbmdlIFttaW4sIG1heF1cbiAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICogQHBhcmFtIHtOdW1iZXJ9IFttaW5dXG4gKiBAcGFyYW0ge051bWJlcn0gW21heF1cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmV4cG9ydCBsZXQgcGlja0luUmFuZ2UgPSAodmFsdWUsIG1pbiA9IDAsIG1heCA9IDApID0+IE1hdGgubWF4KG1pbiwgTWF0aC5taW4odmFsdWUsIG1heCkpO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvcGlja19pbl9yYW5nZS5qc1xuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vdXBkYXRlJztcbmV4cG9ydCAqIGZyb20gJy4vZGVzdHJveSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9zaXplJztcbmV4cG9ydCAqIGZyb20gJy4vbGlzdGVuZXInO1xuZXhwb3J0ICogZnJvbSAnLi9zY3JvbGxfdG8nO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9wb3NpdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL3RvZ2dsZV90cmFjayc7XG5leHBvcnQgKiBmcm9tICcuL2NsZWFyX21vdmVtZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5maW5pdGVfc2Nyb2xsJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X2NvbnRlbnRfZWxlbSc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHVwZGF0ZVxuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlLCBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBVcGRhdGUgc2Nyb2xsYmFycyBhcHBlYXJhbmNlXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBhc3luYzogdXBkYXRlIGFzeW5jaHJvbm91c1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGFzeW5jID0gdHJ1ZSkge1xuICAgIGxldCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX191cGRhdGVCb3VuZGluZygpO1xuXG4gICAgICAgIGxldCBzaXplID0gdGhpcy5nZXRTaXplKCk7XG5cbiAgICAgICAgdGhpcy5fX3JlYWRvbmx5KCdzaXplJywgc2l6ZSk7XG5cbiAgICAgICAgbGV0IG5ld0xpbWl0ID0ge1xuICAgICAgICAgICAgeDogc2l6ZS5jb250ZW50LndpZHRoIC0gc2l6ZS5jb250YWluZXIud2lkdGgsXG4gICAgICAgICAgICB5OiBzaXplLmNvbnRlbnQuaGVpZ2h0IC0gc2l6ZS5jb250YWluZXIuaGVpZ2h0XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMubGltaXQgJiZcbiAgICAgICAgICAgIG5ld0xpbWl0LnggPT09IHRoaXMubGltaXQueCAmJlxuICAgICAgICAgICAgbmV3TGltaXQueSA9PT0gdGhpcy5saW1pdC55KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgeyB0YXJnZXRzLCBvcHRpb25zIH0gPSB0aGlzO1xuXG4gICAgICAgIGxldCB0aHVtYlNpemUgPSB7XG4gICAgICAgICAgICAvLyByZWFsIHRodW1iIHNpemVzXG4gICAgICAgICAgICByZWFsWDogc2l6ZS5jb250YWluZXIud2lkdGggLyBzaXplLmNvbnRlbnQud2lkdGggKiBzaXplLmNvbnRhaW5lci53aWR0aCxcbiAgICAgICAgICAgIHJlYWxZOiBzaXplLmNvbnRhaW5lci5oZWlnaHQgLyBzaXplLmNvbnRlbnQuaGVpZ2h0ICogc2l6ZS5jb250YWluZXIuaGVpZ2h0XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gcmVuZGVyZWQgdGh1bWIgc2l6ZXNcbiAgICAgICAgdGh1bWJTaXplLnggPSBNYXRoLm1heCh0aHVtYlNpemUucmVhbFgsIG9wdGlvbnMudGh1bWJNaW5TaXplKTtcbiAgICAgICAgdGh1bWJTaXplLnkgPSBNYXRoLm1heCh0aHVtYlNpemUucmVhbFksIG9wdGlvbnMudGh1bWJNaW5TaXplKTtcblxuICAgICAgICB0aGlzLl9fcmVhZG9ubHkoJ2xpbWl0JywgbmV3TGltaXQpXG4gICAgICAgICAgICAuX19yZWFkb25seSgndGh1bWJTaXplJywgdGh1bWJTaXplKTtcblxuICAgICAgICBjb25zdCB7IHhBeGlzLCB5QXhpcyB9ID0gdGhpcy50YXJnZXRzO1xuXG4gICAgICAgIC8vIGhpZGUgc2Nyb2xsYmFyIGlmIGNvbnRlbnQgc2l6ZSBsZXNzIHRoYW4gY29udGFpbmVyXG4gICAgICAgIHNldFN0eWxlKHhBeGlzLnRyYWNrLCB7XG4gICAgICAgICAgICAnZGlzcGxheSc6IHNpemUuY29udGVudC53aWR0aCA8PSBzaXplLmNvbnRhaW5lci53aWR0aCA/ICdub25lJyA6ICdibG9jaydcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFN0eWxlKHlBeGlzLnRyYWNrLCB7XG4gICAgICAgICAgICAnZGlzcGxheSc6IHNpemUuY29udGVudC5oZWlnaHQgPD0gc2l6ZS5jb250YWluZXIuaGVpZ2h0ID8gJ25vbmUnIDogJ2Jsb2NrJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyB1c2UgcGVyY2VudGFnZSB2YWx1ZSBmb3IgdGh1bWJcbiAgICAgICAgc2V0U3R5bGUoeEF4aXMudGh1bWIsIHtcbiAgICAgICAgICAgICd3aWR0aCc6IGAke3RodW1iU2l6ZS54fXB4YFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0U3R5bGUoeUF4aXMudGh1bWIsIHtcbiAgICAgICAgICAgICdoZWlnaHQnOiBgJHt0aHVtYlNpemUueX1weGBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmUtcG9zaXRpb25pbmdcbiAgICAgICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0IH0gPSB0aGlzO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKE1hdGgubWluKG9mZnNldC54LCBsaW1pdC54KSwgTWF0aC5taW4ob2Zmc2V0LnksIGxpbWl0LnkpKTtcbiAgICAgICAgdGhpcy5fX3NldFRodW1iUG9zaXRpb24oKTtcbiAgICB9O1xuXG4gICAgaWYgKGFzeW5jKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgIH1cbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy91cGRhdGUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBkZXN0cm95XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHNiTGlzdCB9IGZyb20gJy4uL3NoYXJlZCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFJlbW92ZSBhbGwgc2Nyb2xsYmFyIGxpc3RlbmVycyBhbmQgZXZlbnQgaGFuZGxlcnNcbiAqIFJlc2V0XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgX19saXN0ZW5lcnMsIF9faGFuZGxlcnMsIHRhcmdldHMgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBjb250YWluZXIsIGNvbnRlbnQgfSA9IHRhcmdldHM7XG5cbiAgICBfX2hhbmRsZXJzLmZvckVhY2goKHsgZXZ0LCBlbGVtLCBoYW5kbGVyIH0pID0+IHtcbiAgICAgICAgZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgaGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNjcm9sbFRvKDAsIDAsIDMwMCwgKCkgPT4ge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9fdGltZXJJRC5yZW5kZXIpO1xuICAgICAgICBfX2hhbmRsZXJzLmxlbmd0aCA9IF9fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgLy8gcmVzZXQgc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIHNldFN0eWxlKGNvbnRhaW5lciwge1xuICAgICAgICAgICAgb3ZlcmZsb3c6ICcnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsTGVmdCA9IDA7XG5cbiAgICAgICAgLy8gcmVzZXQgY29udGVudFxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi5jb250ZW50LmNoaWxkcmVuXTtcblxuICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cbiAgICAgICAgY2hpbGRyZW4uZm9yRWFjaCgoZWwpID0+IGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbCkpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBmb3JtIHNiTGlzdFxuICAgICAgICBzYkxpc3QuZGVsZXRlKGNvbnRhaW5lcik7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvZGVzdHJveS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGdldFNpemVcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogR2V0IGNvbnRhaW5lciBhbmQgY29udGVudCBzaXplXG4gKlxuICogQHJldHVybiB7T2JqZWN0fTogYW4gb2JqZWN0IGNvbnRhaW5zIGNvbnRhaW5lciBhbmQgY29udGVudCdzIHdpZHRoIGFuZCBoZWlnaHRcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMudGFyZ2V0cy5jb250YWluZXI7XG4gICAgbGV0IGNvbnRlbnQgPSB0aGlzLnRhcmdldHMuY29udGVudDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRhaW5lcjoge1xuICAgICAgICAgICAgLy8gcmVxdWlyZXMgYG92ZXJmbG93OiBoaWRkZW5gXG4gICAgICAgICAgICB3aWR0aDogY29udGFpbmVyLmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBjb250YWluZXIuY2xpZW50SGVpZ2h0XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgIC8vIGJvcmRlciB3aWR0aCBzaG91bGQgYmUgaW5jbHVkZWRcbiAgICAgICAgICAgIHdpZHRoOiBjb250ZW50Lm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBjb250ZW50Lm9mZnNldEhlaWdodFxuICAgICAgICB9XG4gICAgfTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9nZXRfc2l6ZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGFkZExpc3RlbmVyXG4gKiAgICAgICAgICAgIHtGdW5jdGlvbn0gcmVtb3ZlTGlzdGVuZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogQWRkIHNjcm9sbGluZyBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiOiBsaXN0ZW5lclxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24oY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICB0aGlzLl9fbGlzdGVuZXJzLnB1c2goY2IpO1xufTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBSZW1vdmUgc3BlY2lmaWMgbGlzdGVuZXIgZnJvbSBhbGwgbGlzdGVuZXJzXG4gKiBAcGFyYW0ge3R5cGV9IHBhcmFtOiBkZXNjcmlwdGlvblxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICB0aGlzLl9fbGlzdGVuZXJzLnNvbWUoKGZuLCBpZHgsIGFsbCkgPT4ge1xuICAgICAgICByZXR1cm4gZm4gPT09IGNiICYmIGFsbC5zcGxpY2UoaWR4LCAxKTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9saXN0ZW5lci5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNjcm9sbFRvXG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UsIGJ1aWxkQ3VydmUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogU2Nyb2xsaW5nIHNjcm9sbGJhciB0byBwb3NpdGlvbiB3aXRoIHRyYW5zaXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3hdOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0gW3ldOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geSBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0gW2R1cmF0aW9uXTogdHJhbnNpdGlvbiBkdXJhdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXTogY2FsbGJhY2tcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uKHggPSB0aGlzLm9mZnNldC54LCB5ID0gdGhpcy5vZmZzZXQueSwgZHVyYXRpb24gPSAwLCBjYiA9IG51bGwpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgbGltaXQsXG4gICAgICAgIHZlbG9jaXR5LFxuICAgICAgICBfX3RpbWVySURcbiAgICB9ID0gdGhpcztcblxuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKF9fdGltZXJJRC5zY3JvbGxUbyk7XG4gICAgY2IgPSB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgPyBjYiA6ICgpID0+IHt9O1xuXG4gICAgY29uc3Qgc3RhcnRYID0gb2Zmc2V0Lng7XG4gICAgY29uc3Qgc3RhcnRZID0gb2Zmc2V0Lnk7XG5cbiAgICBjb25zdCBkaXNYID0gcGlja0luUmFuZ2UoeCwgMCwgbGltaXQueCkgLSBzdGFydFg7XG4gICAgY29uc3QgZGlzWSA9IHBpY2tJblJhbmdlKHksIDAsIGxpbWl0LnkpIC0gc3RhcnRZO1xuXG4gICAgY29uc3QgY3VydmVYID0gYnVpbGRDdXJ2ZShkaXNYLCBkdXJhdGlvbik7XG4gICAgY29uc3QgY3VydmVZID0gYnVpbGRDdXJ2ZShkaXNZLCBkdXJhdGlvbik7XG5cbiAgICBsZXQgZnJhbWUgPSAwLCB0b3RhbEZyYW1lID0gY3VydmVYLmxlbmd0aDtcblxuICAgIGxldCBzY3JvbGwgPSAoKSA9PiB7XG4gICAgICAgIGlmIChmcmFtZSA9PT0gdG90YWxGcmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2IodGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oc3RhcnRYICsgY3VydmVYW2ZyYW1lXSwgc3RhcnRZICsgY3VydmVZW2ZyYW1lXSk7XG5cbiAgICAgICAgZnJhbWUrKztcblxuICAgICAgICBfX3RpbWVySUQuc2Nyb2xsVG8gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsKTtcbiAgICB9O1xuXG4gICAgc2Nyb2xsKCk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvc2Nyb2xsX3RvLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2V0T3B0aW9uc1xuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcbmltcG9ydCB7IE9QVElPTl9MSU1JVCB9IGZyb20gJy4uL3NoYXJlZC8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFNldCBzY3JvbGxiYXIgb3B0aW9uc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCByZXMgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkocHJvcCkgfHwgb3B0aW9uc1twcm9wXSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAgICAgcmVzW3Byb3BdID0gb3B0aW9uc1twcm9wXTtcbiAgICB9KTtcblxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCByZXMpO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3NldF9vcHRpb25zLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9hc3NpZ25cIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDEwNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLk9iamVjdC5hc3NpZ247XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gMTA3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjMuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuLyQuZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLm9iamVjdC1hc3NpZ24nKX0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDEwOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIElPYmplY3QgID0gcmVxdWlyZSgnLi8kLmlvYmplY3QnKTtcblxuLy8gc2hvdWxkIHdvcmsgd2l0aCBzeW1ib2xzIGFuZCBzaG91bGQgaGF2ZSBkZXRlcm1pbmlzdGljIHByb3BlcnR5IG9yZGVyIChWOCBidWcpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHZhciBhID0gT2JqZWN0LmFzc2lnblxuICAgICwgQSA9IHt9XG4gICAgLCBCID0ge31cbiAgICAsIFMgPSBTeW1ib2woKVxuICAgICwgSyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG4gIEFbU10gPSA3O1xuICBLLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyBCW2tdID0gazsgfSk7XG4gIHJldHVybiBhKHt9LCBBKVtTXSAhPSA3IHx8IE9iamVjdC5rZXlzKGEoe30sIEIpKS5qb2luKCcnKSAhPSBLO1xufSkgPyBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2UpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHZhciBUICAgICA9IHRvT2JqZWN0KHRhcmdldClcbiAgICAsICQkICAgID0gYXJndW1lbnRzXG4gICAgLCAkJGxlbiA9ICQkLmxlbmd0aFxuICAgICwgaW5kZXggPSAxXG4gICAgLCBnZXRLZXlzICAgID0gJC5nZXRLZXlzXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzXG4gICAgLCBpc0VudW0gICAgID0gJC5pc0VudW07XG4gIHdoaWxlKCQkbGVuID4gaW5kZXgpe1xuICAgIHZhciBTICAgICAgPSBJT2JqZWN0KCQkW2luZGV4KytdKVxuICAgICAgLCBrZXlzICAgPSBnZXRTeW1ib2xzID8gZ2V0S2V5cyhTKS5jb25jYXQoZ2V0U3ltYm9scyhTKSkgOiBnZXRLZXlzKFMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGogICAgICA9IDBcbiAgICAgICwga2V5O1xuICAgIHdoaWxlKGxlbmd0aCA+IGopaWYoaXNFbnVtLmNhbGwoUywga2V5ID0ga2V5c1tqKytdKSlUW2tleV0gPSBTW2tleV07XG4gIH1cbiAgcmV0dXJuIFQ7XG59IDogT2JqZWN0LmFzc2lnbjtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3QtYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gMTA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzZXRQb3NpdGlvblxuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlLCBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTZXQgc2Nyb2xsYmFyIHBvc2l0aW9uIHdpdGhvdXQgdHJhbnNpdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeF06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB4IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeV06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB5IGF4aXNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3dpdGhvdXRDYWxsYmFja3NdOiBkaXNhYmxlIGNhbGxiYWNrIGZ1bmN0aW9ucyB0ZW1wb3JhcmlseVxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCA9IHRoaXMub2Zmc2V0LngsIHkgPSB0aGlzLm9mZnNldC55LCB3aXRob3V0Q2FsbGJhY2tzID0gZmFsc2UpIHtcbiAgICB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcblxuICAgIGNvbnN0IHN0YXR1cyA9IHt9O1xuICAgIGNvbnN0IHsgb2Zmc2V0LCBsaW1pdCwgdGFyZ2V0cywgX19saXN0ZW5lcnMgfSA9IHRoaXM7XG5cbiAgICBpZiAoTWF0aC5hYnMoeCAtIG9mZnNldC54KSA+IDEpIHRoaXMuc2hvd1RyYWNrKCd4Jyk7XG4gICAgaWYgKE1hdGguYWJzKHkgLSBvZmZzZXQueSkgPiAxKSB0aGlzLnNob3dUcmFjaygneScpO1xuXG4gICAgeCA9IHBpY2tJblJhbmdlKHgsIDAsIGxpbWl0LngpO1xuICAgIHkgPSBwaWNrSW5SYW5nZSh5LCAwLCBsaW1pdC55KTtcblxuICAgIHRoaXMuaGlkZVRyYWNrKCk7XG5cbiAgICBpZiAoeCA9PT0gb2Zmc2V0LnggJiYgeSA9PT0gb2Zmc2V0LnkpIHJldHVybjtcblxuICAgIHN0YXR1cy5kaXJlY3Rpb24gPSB7XG4gICAgICAgIHg6IHggPT09IG9mZnNldC54ID8gJ25vbmUnIDogKHggPiBvZmZzZXQueCA/ICdyaWdodCcgOiAnbGVmdCcpLFxuICAgICAgICB5OiB5ID09PSBvZmZzZXQueSA/ICdub25lJyA6ICh5ID4gb2Zmc2V0LnkgPyAnZG93bicgOiAndXAnKVxuICAgIH07XG5cbiAgICBzdGF0dXMubGltaXQgPSB7IC4uLmxpbWl0IH07XG5cbiAgICBvZmZzZXQueCA9IHg7XG4gICAgb2Zmc2V0LnkgPSB5O1xuICAgIHN0YXR1cy5vZmZzZXQgPSB7IC4uLm9mZnNldCB9O1xuXG4gICAgLy8gcmVzZXQgdGh1bWIgcG9zaXRpb24gYWZ0ZXIgb2Zmc2V0IHVwZGF0ZVxuICAgIHRoaXMuX19zZXRUaHVtYlBvc2l0aW9uKCk7XG5cbiAgICBzZXRTdHlsZSh0YXJnZXRzLmNvbnRlbnQsIHtcbiAgICAgICAgJy10cmFuc2Zvcm0nOiBgdHJhbnNsYXRlM2QoJHsteH1weCwgJHsteX1weCwgMClgXG4gICAgfSk7XG5cbiAgICAvLyBpbnZva2UgYWxsIGxpc3RlbmVyc1xuICAgIGlmICh3aXRob3V0Q2FsbGJhY2tzKSByZXR1cm47XG4gICAgX19saXN0ZW5lcnMuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGZuKHN0YXR1cyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3NldF9wb3NpdGlvbi5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRhc3NpZ24gPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9hc3NpZ25cIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9PYmplY3QkYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuXG4gICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvZXh0ZW5kcy5qc1xuICoqIG1vZHVsZSBpZCA9IDExMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2hvd1RyYWNrXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gaGlkZVRyYWNrXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIHNob3cgc2Nyb2xsYmFyIHRyYWNrIG9uIGdpdmVuIGRpcmVjdGlvblxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb246IHdoaWNoIGRpcmVjdGlvbiBvZiB0cmFja3MgdG8gc2hvdywgZGVmYXVsdCBpcyAnYm90aCdcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zaG93VHJhY2sgPSBmdW5jdGlvbihkaXJlY3Rpb24gPSAnYm90aCcpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgeEF4aXMsIHlBeGlzIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24udG9Mb3dlckNhc2UoKTtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc2Nyb2xsaW5nJyk7XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSAnYm90aCcpIHtcbiAgICAgICAgeEF4aXMudHJhY2suY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3gnKSB7XG4gICAgICAgIHhBeGlzLnRyYWNrLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSAneScpIHtcbiAgICAgICAgeUF4aXMudHJhY2suY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogaGlkZSB0cmFjayB3aXRoIDMwMG1zIGRlYm91bmNlXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuaGlkZVRyYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyB0YXJnZXRzLCBfX3RpbWVySUQgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBjb250YWluZXIsIHhBeGlzLCB5QXhpcyB9ID0gdGFyZ2V0cztcblxuICAgIGNsZWFyVGltZW91dChfX3RpbWVySUQudHJhY2spO1xuXG4gICAgX190aW1lcklELnRyYWNrID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGxpbmcnKTtcbiAgICAgICAgeEF4aXMudHJhY2suY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgfSwgMzAwKTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy90b2dnbGVfdHJhY2suanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBjbGVhck1vdmVtZW50fHN0b3BcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogU3RvcCBzY3JvbGxiYXIgcmlnaHQgYXdheVxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmNsZWFyTW92ZW1lbnQgPSBTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm1vdmVtZW50LnggPSB0aGlzLm1vdmVtZW50LnkgPSAwO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2NsZWFyX21vdmVtZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gaW5maW5pdGVTY3JvbGxcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogQ3JlYXRlIGluZmluaXRlIHNjcm9sbCBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiOiBpbmZpbml0ZSBzY3JvbGwgYWN0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW3RocmVzaG9sZF06IGluZmluaXRlIHNjcm9sbCB0aHJlc2hvbGQodG8gYm90dG9tKSwgZGVmYXVsdCBpcyA1MChweClcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5pbmZpbml0ZVNjcm9sbCA9IGZ1bmN0aW9uKGNiLCB0aHJlc2hvbGQgPSA1MCkge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIGxldCBsYXN0T2Zmc2V0ID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGxldCBlbnRlcmVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmFkZExpc3RlbmVyKChzdGF0dXMpID0+IHtcbiAgICAgICAgbGV0IHsgb2Zmc2V0LCBsaW1pdCB9ID0gc3RhdHVzO1xuXG4gICAgICAgIGlmIChsaW1pdC55IC0gb2Zmc2V0LnkgPD0gdGhyZXNob2xkICYmIG9mZnNldC55ID4gbGFzdE9mZnNldC55ICYmICFlbnRlcmVkKSB7XG4gICAgICAgICAgICBlbnRlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gY2Ioc3RhdHVzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGltaXQueSAtIG9mZnNldC55ID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBlbnRlcmVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0T2Zmc2V0ID0gb2Zmc2V0O1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2luZmluaXRlX3Njcm9sbC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGdldENvbnRlbnRFbGVtXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIEdldCBzY3JvbGwgY29udGVudCBlbGVtZW50XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuZ2V0Q29udGVudEVsZW0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50YXJnZXRzLmNvbnRlbnQ7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvZ2V0X2NvbnRlbnRfZWxlbS5qc1xuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vcmVuZGVyJztcbmV4cG9ydCAqIGZyb20gJy4vYWRkX21vdmVtZW50JztcbmV4cG9ydCAqIGZyb20gJy4vc2V0X21vdmVtZW50JztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9yZW5kZXIvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3JlbmRlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gbmV4dFRpY2sob3B0aW9ucywgY3VycmVudCwgbW92ZW1lbnQpIHtcbiAgICBjb25zdCB7IGZyaWN0aW9uIH0gPSBvcHRpb25zO1xuXG4gICAgaWYgKE1hdGguYWJzKG1vdmVtZW50KSA8IDEpIHtcbiAgICAgICAgbGV0IG5leHQgPSBjdXJyZW50ICsgbW92ZW1lbnQ7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1vdmVtZW50OiAwLFxuICAgICAgICAgICAgcG9zaXRpb246IGN1cnJlbnQgPiBuZXh0ID8gTWF0aC5jZWlsKG5leHQpIDogTWF0aC5mbG9vcihuZXh0KVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGxldCBxID0gMSAtIGZyaWN0aW9uIC8gMTAwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbW92ZW1lbnQ6IG1vdmVtZW50ICogcSxcbiAgICAgICAgcG9zaXRpb246IGN1cnJlbnQgKyBtb3ZlbWVudCAqICgxIC0gcSlcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gX19yZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG1vdmVtZW50LFxuICAgICAgICBfX3RpbWVySURcbiAgICB9ID0gdGhpcztcblxuICAgIGlmIChtb3ZlbWVudC54IHx8IG1vdmVtZW50LnkpIHtcbiAgICAgICAgbGV0IG5leHRYID0gbmV4dFRpY2sob3B0aW9ucywgb2Zmc2V0LngsIG1vdmVtZW50LngpO1xuICAgICAgICBsZXQgbmV4dFkgPSBuZXh0VGljayhvcHRpb25zLCBvZmZzZXQueSwgbW92ZW1lbnQueSk7XG5cbiAgICAgICAgbW92ZW1lbnQueCA9IG5leHRYLm1vdmVtZW50O1xuICAgICAgICBtb3ZlbWVudC55ID0gbmV4dFkubW92ZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihuZXh0WC5wb3NpdGlvbiwgbmV4dFkucG9zaXRpb24pO1xuICAgIH1cblxuICAgIF9fdGltZXJJRC5yZW5kZXIgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpczo6X19yZW5kZXIpO1xuXG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVuZGVyJywge1xuICAgIHZhbHVlOiBfX3JlbmRlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9yZW5kZXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZE1vdmVtZW50XG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZE1vdmVtZW50KGRlbHRhWCA9IDAsIGRlbHRhWSA9IDApIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG1vdmVtZW50XG4gICAgfSA9IHRoaXM7XG5cbiAgICB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcblxuICAgIGxldCB4ID0gbW92ZW1lbnQueCArIGRlbHRhWCAqIG9wdGlvbnMuc3BlZWQ7XG4gICAgbGV0IHkgPSBtb3ZlbWVudC55ICsgZGVsdGFZICogb3B0aW9ucy5zcGVlZDtcblxuICAgIGlmIChvcHRpb25zLmNvbnRpbnVvdXNTY3JvbGxpbmcpIHtcbiAgICAgICAgbW92ZW1lbnQueCA9IHg7XG4gICAgICAgIG1vdmVtZW50LnkgPSB5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBsaW1pdCA9IHRoaXMuX19nZXREZWx0YUxpbWl0KCk7XG5cbiAgICAgICAgbW92ZW1lbnQueCA9IHBpY2tJblJhbmdlKHgsIC4uLmxpbWl0LngpO1xuICAgICAgICBtb3ZlbWVudC55ID0gcGlja0luUmFuZ2UoeSwgLi4ubGltaXQueSk7XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2FkZE1vdmVtZW50Jywge1xuICAgIHZhbHVlOiBfX2FkZE1vdmVtZW50LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL2FkZF9tb3ZlbWVudC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2V0TW92ZW1lbnRcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fc2V0TW92ZW1lbnQoZGVsdGFYID0gMCwgZGVsdGFZID0gMCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgbW92ZW1lbnRcbiAgICB9ID0gdGhpcztcblxuICAgIHRoaXMuX191cGRhdGVUaHJvdHRsZSgpO1xuXG4gICAgbGV0IGxpbWl0ID0gdGhpcy5fX2dldERlbHRhTGltaXQoKTtcblxuICAgIG1vdmVtZW50LnggPSBwaWNrSW5SYW5nZShkZWx0YVggKiBvcHRpb25zLnNwZWVkLCAuLi5saW1pdC54KTtcbiAgICBtb3ZlbWVudC55ID0gcGlja0luUmFuZ2UoZGVsdGFZICogb3B0aW9ucy5zcGVlZCwgLi4ubGltaXQueSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fc2V0TW92ZW1lbnQnLCB7XG4gICAgdmFsdWU6IF9fc2V0TW92ZW1lbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9yZW5kZXIvc2V0X21vdmVtZW50LmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9kcmFnJztcbmV4cG9ydCAqIGZyb20gJy4vdG91Y2gnO1xuZXhwb3J0ICogZnJvbSAnLi9tb3VzZSc7XG5leHBvcnQgKiBmcm9tICcuL3doZWVsJztcbmV4cG9ydCAqIGZyb20gJy4vcmVzaXplJztcbmV4cG9ydCAqIGZyb20gJy4vc2VsZWN0JztcbmV4cG9ydCAqIGZyb20gJy4va2V5Ym9hcmQnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fZHJhZ0hhbmRsZXJcbiAqL1xuXG4gaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG4gaW1wb3J0IHtcbiAgICBnZXRPcmlnaW5hbEV2ZW50LFxuICAgIGdldFBvc2l0aW9uLFxuICAgIGdldFRvdWNoSUQsXG4gICAgcGlja0luUmFuZ2UsXG4gICAgc2V0U3R5bGVcbn0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuXG4gZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbiBsZXQgX19kcmFnSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCBjb250ZW50IH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBsZXQgaXNEcmFnID0gZmFsc2U7XG4gICAgbGV0IGFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcbiAgICBsZXQgdGFyZ2V0SGVpZ2h0ID0gdW5kZWZpbmVkO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdfX2lzRHJhZycsIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzRHJhZztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KTtcblxuICAgIGxldCBzY3JvbGwgPSAoeyB4LCB5IH0pID0+IHtcbiAgICAgICAgaWYgKCF4ICYmICF5KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KHgsIHkpO1xuXG4gICAgICAgIGFuaW1hdGlvbiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBzY3JvbGwoeyB4LCB5IH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGRvY3VtZW50LCAnZHJhZ292ZXIgbW91c2Vtb3ZlIHRvdWNobW92ZScsIChldnQpID0+IHtcbiAgICAgICAgaWYgKCFpc0RyYWcgfHwgdGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkpIHJldHVybjtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgZGlyID0gdGhpcy5fX2dldFBvaW50ZXJUcmVuZChldnQsIHRhcmdldEhlaWdodCk7XG5cbiAgICAgICAgc2Nyb2xsKGRpcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAnZHJhZ3N0YXJ0JywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkpIHJldHVybjtcblxuICAgICAgICBzZXRTdHlsZShjb250ZW50LCB7XG4gICAgICAgICAgICAncG9pbnRlci1ldmVudHMnOiAnYXV0bydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGFyZ2V0SGVpZ2h0ID0gZXZ0LnRhcmdldC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XG4gICAgICAgIHRoaXMuX191cGRhdGVCb3VuZGluZygpO1xuICAgICAgICBpc0RyYWcgPSB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuX19hZGRFdmVudChkb2N1bWVudCwgJ2RyYWdlbmQgbW91c2V1cCB0b3VjaGVuZCBibHVyJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkpIHJldHVybjtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgaXNEcmFnID0gZmFsc2U7XG4gICAgfSk7XG4gfTtcblxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19kcmFnSGFuZGxlcicsIHtcbiAgICAgdmFsdWU6IF9fZHJhZ0hhbmRsZXIsXG4gICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICBjb25maWd1cmFibGU6IHRydWVcbiB9KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9kcmFnLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX190b3VjaEhhbmRsZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7XG4gICAgZ2V0T3JpZ2luYWxFdmVudCxcbiAgICBnZXRQb3NpdGlvbixcbiAgICBnZXRUb3VjaElELFxuICAgIHBpY2tJblJhbmdlXG59IGZyb20gJy4uL3V0aWxzL2luZGV4JztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmNvbnN0IEVBU0lOR19EVVJBVElPTiA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL2FuZHJvaWQvaSkgPyAxNTAwIDogNzUwO1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogVG91Y2ggZXZlbnQgaGFuZGxlcnMgYnVpbGRlclxuICovXG5sZXQgX190b3VjaEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuXG4gICAgbGV0IGxhc3RUb3VjaFRpbWUsIGxhc3RUb3VjaElEO1xuICAgIGxldCBtb3ZlVmVsb2NpdHkgPSB7fSwgbGFzdFRvdWNoUG9zID0ge30sIHRvdWNoUmVjb3JkcyA9IHt9O1xuXG4gICAgbGV0IHVwZGF0ZVJlY29yZHMgPSAoZXZ0KSA9PiB7XG4gICAgICAgIGNvbnN0IHRvdWNoTGlzdCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KS50b3VjaGVzO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHRvdWNoTGlzdCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAvLyByZWNvcmQgYWxsIHRvdWNoZXMgdGhhdCB3aWxsIGJlIHJlc3RvcmVkXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnbGVuZ3RoJykgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCB0b3VjaCA9IHRvdWNoTGlzdFtrZXldO1xuXG4gICAgICAgICAgICB0b3VjaFJlY29yZHNbdG91Y2guaWRlbnRpZmllcl0gPSBnZXRQb3NpdGlvbih0b3VjaCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAndG91Y2hzdGFydCcsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pc0RyYWcpIHJldHVybjtcblxuICAgICAgICBjb25zdCB7IG1vdmVtZW50IH0gPSB0aGlzO1xuXG4gICAgICAgIHVwZGF0ZVJlY29yZHMoZXZ0KTtcblxuICAgICAgICBsYXN0VG91Y2hUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGFzdFRvdWNoSUQgPSBnZXRUb3VjaElEKGV2dCk7XG4gICAgICAgIGxhc3RUb3VjaFBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICAgICAgLy8gc3RvcCBzY3JvbGxpbmdcbiAgICAgICAgbW92ZW1lbnQueCA9IG1vdmVtZW50LnkgPSAwO1xuICAgICAgICBtb3ZlVmVsb2NpdHkueCA9IG1vdmVWZWxvY2l0eS55ID0gMDtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICd0b3VjaG1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSB8fCB0aGlzLl9faXNEcmFnKSByZXR1cm47XG5cbiAgICAgICAgdXBkYXRlUmVjb3JkcyhldnQpO1xuXG4gICAgICAgIGNvbnN0IHRvdWNoSUQgPSBnZXRUb3VjaElEKGV2dCk7XG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0LCBsaW1pdCB9ID0gdGhpcztcblxuICAgICAgICBpZiAobGFzdFRvdWNoSUQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gcmVzZXQgbGFzdCB0b3VjaCBpbmZvIGZyb20gcmVjb3Jkc1xuICAgICAgICAgICAgbGFzdFRvdWNoSUQgPSB0b3VjaElEO1xuXG4gICAgICAgICAgICAvLyBkb24ndCBuZWVkIGVycm9yIGhhbmRsZXJcbiAgICAgICAgICAgIGxhc3RUb3VjaFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgbGFzdFRvdWNoUG9zID0gdG91Y2hSZWNvcmRzW3RvdWNoSURdO1xuICAgICAgICB9IGVsc2UgaWYgKHRvdWNoSUQgIT09IGxhc3RUb3VjaElEKSB7XG4gICAgICAgICAgICAvLyBwcmV2ZW50IG11bHRpLXRvdWNoIGJvdW5jaW5nXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxhc3RUb3VjaFBvcykgcmV0dXJuO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBsYXN0VG91Y2hUaW1lO1xuICAgICAgICBsZXQgeyB4OiBsYXN0WCwgeTogbGFzdFkgfSA9IGxhc3RUb3VjaFBvcztcbiAgICAgICAgbGV0IHsgeDogY3VyWCwgeTogY3VyWSB9ID0gbGFzdFRvdWNoUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uIHx8IDE7IC8vIGZpeCBJbmZpbml0eSBlcnJvclxuXG4gICAgICAgIG1vdmVWZWxvY2l0eS54ID0gKGxhc3RYIC0gY3VyWCkgLyBkdXJhdGlvbjtcbiAgICAgICAgbW92ZVZlbG9jaXR5LnkgPSAobGFzdFkgLSBjdXJZKSAvIGR1cmF0aW9uO1xuXG4gICAgICAgIGxldCBkZXN0WCA9IHBpY2tJblJhbmdlKGxhc3RYIC0gY3VyWCArIG9mZnNldC54LCAwLCBsaW1pdC54KTtcbiAgICAgICAgbGV0IGRlc3RZID0gcGlja0luUmFuZ2UobGFzdFkgLSBjdXJZICsgb2Zmc2V0LnksIDAsIGxpbWl0LnkpO1xuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oZGVzdFgsIGRlc3RZKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICd0b3VjaGVuZCcsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpIHx8IHRoaXMuX19pc0RyYWcpIHJldHVybjtcblxuICAgICAgICAvLyByZWxlYXNlIGN1cnJlbnQgdG91Y2hcbiAgICAgICAgZGVsZXRlIHRvdWNoUmVjb3Jkc1tsYXN0VG91Y2hJRF07XG4gICAgICAgIGxhc3RUb3VjaElEID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCB7IHgsIHkgfSA9IG1vdmVWZWxvY2l0eTtcblxuICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoXG4gICAgICAgICAgICB4ID8geCAvIE1hdGguYWJzKHgpICogTWF0aC5zcXJ0KE1hdGguYWJzKHgpICogMWUzKSAqIDIwIDogMCxcbiAgICAgICAgICAgIHkgPyB5IC8gTWF0aC5hYnMoeSkgKiBNYXRoLnNxcnQoTWF0aC5hYnMoeSkgKiAxZTMpICogMjAgOiAwXG4gICAgICAgICk7XG5cbiAgICAgICAgbW92ZVZlbG9jaXR5LnggPSBtb3ZlVmVsb2NpdHkueSA9IDA7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fdG91Y2hIYW5kbGVyJywge1xuICAgIHZhbHVlOiBfX3RvdWNoSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3RvdWNoLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19tb3VzZUhhbmRsZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IGdldFBvc2l0aW9uLCBnZXRUb3VjaElELCBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogTW91c2UgZXZlbnQgaGFuZGxlcnMgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqL1xubGV0IF9fbW91c2VIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcbiAgICBsZXQgaXNNb3VzZURvd24sIGlzTW91c2VNb3ZlLCBzdGFydE9mZnNldFRvVGh1bWIsIHN0YXJ0VHJhY2tEaXJlY3Rpb24sIGNvbnRhaW5lclJlY3Q7XG5cbiAgICBsZXQgZ2V0VHJhY2tEaXIgPSAoY2xhc3NOYW1lKSA9PiB7XG4gICAgICAgIGxldCBtYXRjaGVzID0gY2xhc3NOYW1lLm1hdGNoKC9zY3JvbGxiYXJcXC0oPzp0cmFja3x0aHVtYilcXC0oW3h5XSkvKTtcblxuICAgICAgICByZXR1cm4gbWF0Y2hlcyAmJiBtYXRjaGVzWzFdO1xuICAgIH07XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAnY2xpY2snLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmIChpc01vdXNlTW92ZSB8fCAhL3Njcm9sbGJhci10cmFjay8udGVzdChldnQudGFyZ2V0LmNsYXNzTmFtZSkgfHwgdGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkpIHJldHVybjtcblxuICAgICAgICBsZXQgdHJhY2sgPSBldnQudGFyZ2V0O1xuICAgICAgICBsZXQgZGlyZWN0aW9uID0gZ2V0VHJhY2tEaXIodHJhY2suY2xhc3NOYW1lKTtcbiAgICAgICAgbGV0IHJlY3QgPSB0cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IGNsaWNrUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcbiAgICAgICAgbGV0IGRlbHRhTGltaXQgPSB0aGlzLl9fZ2V0RGVsdGFMaW1pdCgpO1xuXG4gICAgICAgIGNvbnN0IHsgc2l6ZSwgb2Zmc2V0LCB0aHVtYlNpemUgfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3gnKSB7XG4gICAgICAgICAgICBsZXQgY2xpY2tPZmZzZXQgPSAoY2xpY2tQb3MueCAtIHJlY3QubGVmdCAtIHRodW1iU2l6ZS54IC8gMikgLyAoc2l6ZS5jb250YWluZXIud2lkdGggLSAodGh1bWJTaXplLnggLSB0aHVtYlNpemUucmVhbFgpKTtcbiAgICAgICAgICAgIHRoaXMubW92ZW1lbnQueCA9IHBpY2tJblJhbmdlKGNsaWNrT2Zmc2V0ICogc2l6ZS5jb250ZW50LndpZHRoIC0gb2Zmc2V0LngsIC4uLmRlbHRhTGltaXQueCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgY2xpY2tPZmZzZXQgPSAoY2xpY2tQb3MueSAtIHJlY3QudG9wIC0gdGh1bWJTaXplLnkgLyAyKSAvIChzaXplLmNvbnRhaW5lci5oZWlnaHQgLSAodGh1bWJTaXplLnkgLSB0aHVtYlNpemUucmVhbFkpKTtcbiAgICAgICAgICAgIHRoaXMubW92ZW1lbnQueSA9IHBpY2tJblJhbmdlKGNsaWNrT2Zmc2V0ICogc2l6ZS5jb250ZW50LmhlaWdodCAtIG9mZnNldC55LCAuLi5kZWx0YUxpbWl0LnkpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAnbW91c2Vkb3duJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIS9zY3JvbGxiYXItdGh1bWIvLnRlc3QoZXZ0LnRhcmdldC5jbGFzc05hbWUpIHx8IHRoaXMuX19pZ25vcmVFdmVudChldnQpKSByZXR1cm47XG4gICAgICAgIGlzTW91c2VEb3duID0gdHJ1ZTtcblxuICAgICAgICBsZXQgY3Vyc29yUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcbiAgICAgICAgbGV0IHRodW1iUmVjdCA9IGV2dC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgc3RhcnRUcmFja0RpcmVjdGlvbiA9IGdldFRyYWNrRGlyKGV2dC50YXJnZXQuY2xhc3NOYW1lKTtcblxuICAgICAgICAvLyBwb2ludGVyIG9mZnNldCB0byB0aHVtYlxuICAgICAgICBzdGFydE9mZnNldFRvVGh1bWIgPSB7XG4gICAgICAgICAgICB4OiBjdXJzb3JQb3MueCAtIHRodW1iUmVjdC5sZWZ0LFxuICAgICAgICAgICAgeTogY3Vyc29yUG9zLnkgLSB0aHVtYlJlY3QudG9wXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gY29udGFpbmVyIGJvdW5kaW5nIHJlY3RhbmdsZVxuICAgICAgICBjb250YWluZXJSZWN0ID0gdGhpcy50YXJnZXRzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNNb3VzZURvd24pIHJldHVybjtcblxuICAgICAgICBpc01vdXNlTW92ZSA9IHRydWU7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCB7IHNpemUsIG9mZnNldCB9ID0gdGhpcztcbiAgICAgICAgbGV0IGN1cnNvclBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0VHJhY2tEaXJlY3Rpb24gPT09ICd4Jykge1xuICAgICAgICAgICAgLy8gZ2V0IHBlcmNlbnRhZ2Ugb2YgcG9pbnRlciBwb3NpdGlvbiBpbiB0cmFja1xuICAgICAgICAgICAgLy8gdGhlbiB0cmFuZm9ybSB0byBweFxuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAoY3Vyc29yUG9zLnggLSBzdGFydE9mZnNldFRvVGh1bWIueCAtIGNvbnRhaW5lclJlY3QubGVmdCkgLyAoY29udGFpbmVyUmVjdC5yaWdodCAtIGNvbnRhaW5lclJlY3QubGVmdCkgKiBzaXplLmNvbnRlbnQud2lkdGgsXG4gICAgICAgICAgICAgICAgb2Zmc2V0LnlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvbid0IG5lZWQgZWFzaW5nXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oXG4gICAgICAgICAgICBvZmZzZXQueCxcbiAgICAgICAgICAgIChjdXJzb3JQb3MueSAtIHN0YXJ0T2Zmc2V0VG9UaHVtYi55IC0gY29udGFpbmVyUmVjdC50b3ApIC8gKGNvbnRhaW5lclJlY3QuYm90dG9tIC0gY29udGFpbmVyUmVjdC50b3ApICogc2l6ZS5jb250ZW50LmhlaWdodFxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gcmVsZWFzZSBtb3VzZW1vdmUgc3B5IG9uIHdpbmRvdyBsb3N0IGZvY3VzXG4gICAgdGhpcy5fX2FkZEV2ZW50KHdpbmRvdywgJ21vdXNldXAgYmx1cicsICgpID0+IHtcbiAgICAgICAgaXNNb3VzZURvd24gPSBpc01vdXNlTW92ZSA9IGZhbHNlO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX21vdXNlSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19tb3VzZUhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9tb3VzZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fd2hlZWxIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXREZWx0YSwgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vLyBpcyBzdGFuZGFyZCBgd2hlZWxgIGV2ZW50IHN1cHBvcnRlZCBjaGVja1xuY29uc3QgV0hFRUxfRVZFTlQgPSAnb253aGVlbCcgaW4gd2luZG93ID8gJ3doZWVsJyA6ICdtb3VzZXdoZWVsJztcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fd2hlZWxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsIFdIRUVMX0VWRU5ULCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0LCB0cnVlKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0LCBsaW1pdCwgb3B0aW9ucyB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgZGVsdGEgPSBnZXREZWx0YShldnQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNvbnRpbnVvdXNTY3JvbGxpbmcpIHtcbiAgICAgICAgICAgIGxldCBkZXN0WCA9IHBpY2tJblJhbmdlKGRlbHRhLnggKyBvZmZzZXQueCwgMCwgbGltaXQueCk7XG4gICAgICAgICAgICBsZXQgZGVzdFkgPSBwaWNrSW5SYW5nZShkZWx0YS55ICsgb2Zmc2V0LnksIDAsIGxpbWl0LnkpO1xuXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGVzdFggLSBvZmZzZXQueCkgPCAxICYmIE1hdGguYWJzKGRlc3RZIC0gb2Zmc2V0LnkpIDwgMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5fX2FkZE1vdmVtZW50KGRlbHRhLngsIGRlbHRhLnkpO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3doZWVsSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX193aGVlbEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy93aGVlbC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fcmVzaXplSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fcmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLl9fdXBkYXRlVGhyb3R0bGUpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3Jlc2l6ZUhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fcmVzaXplSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3Jlc2l6ZS5qc1xuICoqLyIsIi8qKlxyXG4gKiBAbW9kdWxlXHJcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3NlbGVjdEhhbmRsZXJcclxuICovXHJcblxyXG4gaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XHJcbiBpbXBvcnQge1xyXG4gICAgZ2V0T3JpZ2luYWxFdmVudCxcclxuICAgIGdldFBvc2l0aW9uLFxyXG4gICAgZ2V0VG91Y2hJRCxcclxuICAgIHBpY2tJblJhbmdlLFxyXG4gICAgc2V0U3R5bGVcclxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XHJcblxyXG4gZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XHJcblxyXG4vLyB0b2RvOiBzZWxlY3QgaGFuZGxlciBmb3IgdG91Y2ggc2NyZWVuXHJcbiBsZXQgX19zZWxlY3RIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgY29udGVudCB9ID0gdGhpcy50YXJnZXRzO1xyXG5cclxuICAgIGxldCBzY3JvbGwgPSAoeyB4LCB5IH0pID0+IHtcclxuICAgICAgICBpZiAoIXggJiYgIXkpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KHgsIHkpO1xyXG5cclxuICAgICAgICBhbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICAgICAgICBzY3JvbGwoeyB4LCB5IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgc2V0U2VsZWN0ID0gKHZhbHVlID0gJycpID0+IHtcclxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgJy11c2VyLXNlbGVjdCc6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgaWYgKCFpc1NlbGVjdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XHJcblxyXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX19nZXRQb2ludGVyVHJlbmQoZXZ0KTtcclxuXHJcbiAgICAgICAgc2Nyb2xsKGRpcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGVudCwgJ3NlbGVjdHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0U2VsZWN0KCdub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcclxuICAgICAgICBpc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIGJsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcclxuICAgICAgICBzZXRTZWxlY3QoKTtcclxuXHJcbiAgICAgICAgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gdGVtcCBwYXRjaCBmb3IgdG91Y2ggZGV2aWNlc1xyXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3Njcm9sbCcsIChldnQpID0+IHtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xyXG4gICAgfSk7XHJcbiB9O1xyXG5cclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZWxlY3RIYW5kbGVyJywge1xyXG4gICAgIHZhbHVlOiBfX3NlbGVjdEhhbmRsZXIsXHJcbiAgICAgd3JpdGFibGU6IHRydWUsXHJcbiAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiB9KTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3NlbGVjdC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fa2V5Ym9hcmRIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCwgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8vIGtleSBtYXBzIFtkZWx0YVgsIGRlbHRhWV1cbmNvbnN0IEtFWU1BUFMgPSB7XG4gICAgMzI6IFswLCA1XSwgICAvLyBzcGFjZVxuICAgIDM3OiBbLTEsIDBdLCAgLy8gbGVmdFxuICAgIDM4OiBbMCwgLTFdLCAgLy8gdXBcbiAgICAzOTogWzEsIDBdLCAgIC8vIHJpZ2h0XG4gICAgNDA6IFswLCAxXSAgICAvLyBkb3duXG59O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogS2V5cHJlc3MgZXZlbnQgaGFuZGxlciBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICovXG5sZXQgX19rZXlib2FyZEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGxldCBpc0ZvY3VzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdmb2N1cycsICgpID0+IHtcbiAgICAgICAgaXNGb2N1c2VkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdibHVyJywgKCkgPT4ge1xuICAgICAgICBpc0ZvY3VzZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdrZXlkb3duJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRm9jdXNlZCB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgICAgICBjb25zdCBrZXlDb2RlID0gZXZ0LmtleUNvZGUgfHwgZXZ0LndoaWNoO1xuXG4gICAgICAgIGlmICghS0VZTUFQUy5oYXNPd25Qcm9wZXJ0eShrZXlDb2RlKSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHsgc3BlZWQgfSA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgY29uc3QgW3gsIHldID0gS0VZTUFQU1trZXlDb2RlXTtcblxuICAgICAgICB0aGlzLl9fYWRkTW92ZW1lbnQoeCAqIDQwLCB5ICogNDApO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2tleWJvYXJkSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19rZXlib2FyZEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9rZXlib2FyZC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2dldEl0ZXJhdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3JcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX2lzSXRlcmFibGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkge1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2kgPSBfZ2V0SXRlcmF0b3IoYXJyKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZCA9IHRydWU7XG4gICAgICBfZSA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9hcnI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSBlbHNlIGlmIChfaXNJdGVyYWJsZShPYmplY3QoYXJyKSkpIHtcbiAgICAgIHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3NsaWNlZC10by1hcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDEyOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUnKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTMwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5pc0l0ZXJhYmxlID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTyA9IE9iamVjdChpdCk7XG4gIHJldHVybiBPW0lURVJBVE9SXSAhPT0gdW5kZWZpbmVkXG4gICAgfHwgJ0BAaXRlcmF0b3InIGluIE9cbiAgICB8fCBJdGVyYXRvcnMuaGFzT3duUHJvcGVydHkoY2xhc3NvZihPKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmlzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTMxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlYWRvbmx5JztcbmV4cG9ydCAqIGZyb20gJy4vYWRkX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5pdF9vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vaWdub3JlX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5pdF9zY3JvbGxiYXInO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfZGVsdGFfbGltaXQnO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfY2hpbGRyZW4nO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfYm91bmRpbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9pbnRlcl90cmVuZCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF90aHVtYl9wb3NpdGlvbic7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3JlYWRvbmx5XG4gKiBAZGVwZW5kZW5jaWVzIFsgU21vb3RoU2Nyb2xsYmFyIF1cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIGNyZWF0ZSByZWFkb25seSBwcm9wZXJ0eVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FueX0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gX19yZWFkb25seShwcm9wLCB2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcCwge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3JlYWRvbmx5Jywge1xuICAgIHZhbHVlOiBfX3JlYWRvbmx5LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvcmVhZG9ubHkuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZEV2ZW50XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZEV2ZW50KGVsZW0sIGV2ZW50cywgZm4pIHtcbiAgICBpZiAoIWVsZW0gfHwgdHlwZW9mIGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3QgZWxlbSB0byBiZSBhIERPTSBlbGVtZW50LCBidXQgZ290ICR7ZWxlbX1gKTtcbiAgICB9XG5cbiAgICBldmVudHMuc3BsaXQoL1xccysvZykuZm9yRWFjaCgoZXZ0KSA9PiB7XG4gICAgICAgIHRoaXMuX19oYW5kbGVycy5wdXNoKHsgZXZ0LCBlbGVtLCBmbiB9KTtcblxuICAgICAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmbik7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fYWRkRXZlbnQnLCB7XG4gICAgdmFsdWU6IF9fYWRkRXZlbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvYWRkX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19pbml0T3B0aW9uc1xuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19pbml0T3B0aW9ucyh1c2VyUHJlZmVyZW5jZSkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIHNwZWVkOiAxLCAgICAgICAgICAgICAgICAgIC8vIHNjcm9sbCBzcGVlZCBzY2FsZVxuICAgICAgICBmcmljdGlvbjogMTAsICAgICAgICAgICAgICAvLyBmcmljdGlvbiBmYWN0b3IsIHBlcmNlbnRcbiAgICAgICAgaWdub3JlRXZlbnRzOiBbXSwgICAgICAgICAgLy8gZXZlbnRzIG5hbWVzIHRvIGJlIGlnbm9yZWRcbiAgICAgICAgdGh1bWJNaW5TaXplOiAyMCwgICAgICAgICAgLy8gbWluIHNpemUgZm9yIHNjcm9sbGJhciB0aHVtYlxuICAgICAgICBjb250aW51b3VzU2Nyb2xsaW5nOiBmYWxzZSAvLyBhbGxvdyB1cGVyIHNjcm9sbGFibGUgY29udGVudCB0byBzY3JvbGwgd2hlbiByZWFjaGluZyBlZGdlXG4gICAgfTtcblxuICAgIGNvbnN0IGxpbWl0ID0ge1xuICAgICAgICBmcmljdGlvbjogWzEsIDk5XSxcbiAgICAgICAgc3BlZWQ6IFswLCBJbmZpbml0eV0sXG4gICAgICAgIHRodW1iTWluU2l6ZTogWzAsIEluZmluaXR5XVxuICAgIH07XG5cbiAgICBjb25zdCBvcHRpb25BY2Nlc3NvcnMgPSB7XG4gICAgICAgIGdldCBpZ25vcmVFdmVudHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pZ25vcmVFdmVudHM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCBpZ25vcmVFdmVudHModikge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHYpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IFxcYG9wdGlvbnMuaWdub3JlRXZlbnRzXFxgIHRvIGJlIGEgbnVtYmVyLCBidXQgZ290ICR7dHlwZW9mIHZ9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMuaWdub3JlRXZlbnRzID0gdjtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0IGNvbnRpbnVvdXNTY3JvbGxpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb250aW51b3VzU2Nyb2xsaW5nO1xuICAgICAgICB9LFxuICAgICAgICBzZXQgY29udGludW91c1Njcm9sbGluZyh2KSB7XG4gICAgICAgICAgICBvcHRpb25zLmNvbnRpbnVvdXNTY3JvbGxpbmcgPSAhIXY7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucylcbiAgICAgICAgLmZpbHRlcigocHJvcCkgPT4gIW9wdGlvbkFjY2Vzc29ycy5oYXNPd25Qcm9wZXJ0eShwcm9wKSlcbiAgICAgICAgLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvcHRpb25BY2Nlc3NvcnMsIHByb3AsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnNbcHJvcF07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdCh2KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdCBcXGBvcHRpb25zLiR7cHJvcH1cXGAgdG8gYmUgYSBudW1iZXIsIGJ1dCBnb3QgJHt0eXBlb2Ygdn1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbcHJvcF0gPSBwaWNrSW5SYW5nZSh2LCAuLi5saW1pdFtwcm9wXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgdGhpcy5fX3JlYWRvbmx5KCdvcHRpb25zJywgb3B0aW9uQWNjZXNzb3JzKTtcbiAgICB0aGlzLnNldE9wdGlvbnModXNlclByZWZlcmVuY2UpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2luaXRPcHRpb25zJywge1xuICAgIHZhbHVlOiBfX2luaXRPcHRpb25zLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2luaXRfb3B0aW9ucy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9faWdub3JlRXZlbnRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19pZ25vcmVFdmVudChldnQgPSB7fSwgYWxsb3dDaGlsZCA9IGZhbHNlKSB7XG4gICAgY29uc3QgeyB0YXJnZXQgfSA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIHJldHVybiAoIWV2dC50eXBlLm1hdGNoKC9kcmFnLykgJiYgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHx8XG4gICAgICAgIHRoaXMub3B0aW9ucy5pZ25vcmVFdmVudHMuc29tZShydWxlID0+IGV2dC50eXBlLm1hdGNoKHJ1bGUpKSB8fFxuICAgICAgICAoYWxsb3dDaGlsZCA/IGZhbHNlIDogdGhpcy5jaGlsZHJlbi5zb21lKChzYikgPT4gc2IuY29udGFpbnModGFyZ2V0KSkpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2lnbm9yZUV2ZW50Jywge1xuICAgIHZhbHVlOiBfX2lnbm9yZUV2ZW50LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2lnbm9yZV9ldmVudC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9faW5pdFNjcm9sbGJhclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogaW5pdGlhbGl6ZSBzY3JvbGxiYXJcbiAqXG4gKiBUaGlzIG1ldGhvZCB3aWxsIGF0dGFjaCBzZXZlcmFsIGxpc3RlbmVycyB0byBlbGVtZW50c1xuICogYW5kIGNyZWF0ZSBhIGRlc3Ryb3kgbWV0aG9kIHRvIHJlbW92ZSBsaXN0ZW5lcnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uOiBhcyBpcyBleHBsYWluZWQgaW4gY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gX19pbml0U2Nyb2xsYmFyKCkge1xuICAgIHRoaXMudXBkYXRlKCk7IC8vIGluaXRpYWxpemUgdGh1bWIgcG9zaXRpb25cblxuICAgIHRoaXMuX19rZXlib2FyZEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fcmVzaXplSGFuZGxlcigpO1xuICAgIHRoaXMuX19zZWxlY3RIYW5kbGVyKCk7XG4gICAgdGhpcy5fX21vdXNlSGFuZGxlcigpO1xuICAgIHRoaXMuX190b3VjaEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fd2hlZWxIYW5kbGVyKCk7XG4gICAgdGhpcy5fX2RyYWdIYW5kbGVyKCk7XG5cbiAgICB0aGlzLl9fcmVuZGVyKCk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19faW5pdFNjcm9sbGJhcicsIHtcbiAgICB2YWx1ZTogX19pbml0U2Nyb2xsYmFyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5pdF9zY3JvbGxiYXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2dldERlbHRhTGltaXRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fZ2V0RGVsdGFMaW1pdCgpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgbGltaXRcbiAgICB9ID0gdGhpcztcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IFstb2Zmc2V0LngsIGxpbWl0LnggLSBvZmZzZXQueF0sXG4gICAgICAgIHk6IFstb2Zmc2V0LnksIGxpbWl0LnkgLSBvZmZzZXQueV1cbiAgICB9O1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2dldERlbHRhTGltaXQnLCB7XG4gICAgdmFsdWU6IF9fZ2V0RGVsdGFMaW1pdCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9nZXRfZGVsdGFfbGltaXQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3VwZGF0ZUNoaWxkcmVuXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZWxlY3RvcnMgfSBmcm9tICcuLi9zaGFyZWQvc2VsZWN0b3JzJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fdXBkYXRlQ2hpbGRyZW4oKSB7XG4gICAgdGhpcy5fX3JlYWRvbmx5KCdjaGlsZHJlbicsIFsuLi50aGlzLnRhcmdldHMuY29udGVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyldKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX191cGRhdGVDaGlsZHJlbicsIHtcbiAgICB2YWx1ZTogX191cGRhdGVDaGlsZHJlbixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZV9jaGlsZHJlbi5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fdXBkYXRlQm91bmRpbmdcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IHNlbGVjdG9ycyB9IGZyb20gJy4uL3NoYXJlZC9zZWxlY3RvcnMnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX191cGRhdGVCb3VuZGluZygpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGNvbnN0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IH0gPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgeyBpbm5lckhlaWdodCwgaW5uZXJXaWR0aCB9ID0gd2luZG93O1xuXG4gICAgdGhpcy5fX3JlYWRvbmx5KCdib3VuZGluZycsIHtcbiAgICAgICAgdG9wOiBNYXRoLm1heCh0b3AsIDApLFxuICAgICAgICByaWdodDogTWF0aC5taW4ocmlnaHQsIGlubmVyV2lkdGgpLFxuICAgICAgICBib3R0b206IE1hdGgubWluKGJvdHRvbSwgaW5uZXJIZWlnaHQpLFxuICAgICAgICBsZWZ0Ok1hdGgubWF4KGxlZnQsIDApXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fdXBkYXRlQm91bmRpbmcnLCB7XG4gICAgdmFsdWU6IF9fdXBkYXRlQm91bmRpbmcsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy91cGRhdGVfYm91bmRpbmcuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2dldFBvaW50ZXJUcmVuZFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0UG9zaXRpb24gfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19nZXRQb2ludGVyVHJlbmQoZXZ0LCBlZGdlID0gMCkge1xuICAgIGNvbnN0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IH0gPSB0aGlzLmJvdW5kaW5nO1xuICAgIGNvbnN0IHsgeCwgeSB9ID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgIGNvbnN0IHJlcyA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBpZiAoeCA9PT0gMCAmJiB5ID09PSAwKSByZXR1cm4gcmVzO1xuXG4gICAgaWYgKHggPiByaWdodCAtIGVkZ2UpIHtcbiAgICAgICAgcmVzLnggPSAoeCAtIHJpZ2h0ICsgZWRnZSk7XG4gICAgfSBlbHNlIGlmICh4IDwgbGVmdCArIGVkZ2UpIHtcbiAgICAgICAgcmVzLnggPSAoeCAtIGxlZnQgLSBlZGdlKTtcbiAgICB9XG5cbiAgICBpZiAoeSA+IGJvdHRvbSAtIGVkZ2UpIHtcbiAgICAgICAgcmVzLnkgPSAoeSAtIGJvdHRvbSArIGVkZ2UpO1xuICAgIH0gZWxzZSBpZiAoeSA8IHRvcCArIGVkZ2UpIHtcbiAgICAgICAgcmVzLnkgPSAoeSAtIHRvcCAtIGVkZ2UpO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fZ2V0UG9pbnRlclRyZW5kJywge1xuICAgIHZhbHVlOiBfX2dldFBvaW50ZXJUcmVuZCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9nZXRfcG9pbnRlcl90cmVuZC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2V0VGh1bWJQb3NpdGlvblxuICovXG5cbmltcG9ydCB7IHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogU2V0IHRodW1iIHBvc2l0aW9uIGluIHRyYWNrXG4gKi9cbmZ1bmN0aW9uIF9fc2V0VGh1bWJQb3NpdGlvbigpIHtcbiAgICBjb25zdCB7IHRhcmdldHMsIHNpemUsIG9mZnNldCwgdGh1bWJTaXplIH0gPSB0aGlzO1xuXG4gICAgbGV0IHRodW1iUG9zaXRpb25YID0gb2Zmc2V0LnggLyBzaXplLmNvbnRlbnQud2lkdGggKiAoc2l6ZS5jb250YWluZXIud2lkdGggLSAodGh1bWJTaXplLnggLSB0aHVtYlNpemUucmVhbFgpKTtcbiAgICBsZXQgdGh1bWJQb3NpdGlvblkgPSBvZmZzZXQueSAvIHNpemUuY29udGVudC5oZWlnaHQgKiAoc2l6ZS5jb250YWluZXIuaGVpZ2h0IC0gKHRodW1iU2l6ZS55IC0gdGh1bWJTaXplLnJlYWxZKSk7XG5cbiAgICBzZXRTdHlsZSh0YXJnZXRzLnhBeGlzLnRodW1iLCB7XG4gICAgICAgICctdHJhbnNmb3JtJzogIGB0cmFuc2xhdGUzZCgke3RodW1iUG9zaXRpb25YfXB4LCAwLCAwKWBcbiAgICB9KTtcblxuICAgIHNldFN0eWxlKHRhcmdldHMueUF4aXMudGh1bWIsIHtcbiAgICAgICAgJy10cmFuc2Zvcm0nOiBgdHJhbnNsYXRlM2QoMCwgJHt0aHVtYlBvc2l0aW9uWX1weCwgMClgXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fc2V0VGh1bWJQb3NpdGlvbicsIHtcbiAgICB2YWx1ZTogX19zZXRUaHVtYlBvc2l0aW9uLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvc2V0X3RodW1iX3Bvc2l0aW9uLmpzXG4gKiovIiwiaW1wb3J0IFNjcm9sbGJhciBmcm9tICcuLi8uLi9zcmMvJztcblxuY29uc3QgRFBSID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5cbmNvbnN0IHNpemUgPSB7XG4gICAgd2lkdGg6IDI1MCxcbiAgICBoZWlnaHQ6IDE1MFxufTtcblxuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByZXZpZXcnKTtcbmNvbnN0IHNjcm9sbGJhciA9IFNjcm9sbGJhci5nZXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKSk7XG5jb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbmNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBzY3JvbGxiYXIub3B0aW9ucyk7XG5cbmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiBEUFI7XG5jYW52YXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKiBEUFI7XG5jdHguc2NhbGUoRFBSLCBEUFIpO1xuXG5jdHguc3Ryb2tlU3R5bGUgPSAnIzk0YTZiNyc7XG5jdHguZmlsbFN0eWxlID0gJyNhYmMnO1xuXG5sZXQgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICB9XG5cbiAgICBsZXQgZG90cyA9IGNhbGNEb3RzKCk7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2Zvcm0oMSwgMCwgMCwgLTEsIDAsIHNpemUuaGVpZ2h0KTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCAwKTtcblxuICAgIGxldCBzY2FsZVggPSAoc2l6ZS53aWR0aCAvIGRvdHMubGVuZ3RoKSAqIChvcHRpb25zLnNwZWVkIC8gMjAgKyAwLjUpO1xuICAgIGRvdHMuZm9yRWFjaCgoW3gsIHldKSA9PiB7XG4gICAgICAgIGN0eC5saW5lVG8oeCAqIHNjYWxlWCwgeSk7XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICBsZXQgW3gsIHldID0gZG90c1tkb3RzLmxlbmd0aCAtIDFdO1xuICAgIGN0eC5saW5lVG8oeCAqIHNjYWxlWCwgeSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59O1xuXG5yZW5kZXIoKTtcblxuZnVuY3Rpb24gY2FsY0RvdHMoKSB7XG4gICAgbGV0IHtcbiAgICAgICAgc3BlZWQsXG4gICAgICAgIGZyaWN0aW9uXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBsZXQgZG90cyA9IFtdO1xuXG4gICAgbGV0IHggPSAwO1xuICAgIGxldCB5ID0gKHNwZWVkIC8gMjAgKyAwLjUpICogc2l6ZS5oZWlnaHQ7XG5cbiAgICB3aGlsZSh5ID4gMC4xKSB7XG4gICAgICAgIGRvdHMucHVzaChbeCwgeV0pO1xuXG4gICAgICAgIHkgKj0gKDEgLSBmcmljdGlvbiAvIDEwMCk7XG4gICAgICAgIHgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gZG90cztcbn07XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ZXJzaW9uJykudGV4dENvbnRlbnQgPSBgdiR7U2Nyb2xsYmFyLnZlcnNpb259YDtcblxuWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcHRpb25zJyldLmZvckVhY2goKGVsKSA9PiB7XG4gICAgY29uc3QgcHJvcCA9IGVsLm5hbWU7XG4gICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAub3B0aW9uLSR7cHJvcH1gKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IG9wdGlvbnNbcHJvcF0gPSBwYXJzZUZsb2F0KGVsLnZhbHVlKTtcbiAgICAgICAgc2Nyb2xsYmFyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgfSk7XG59KTtcblxuY29uc3QgaW5uZXJTY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbm5lci1zY3JvbGxiYXInKSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250aW51b3VzJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICBpbm5lclNjcm9sbGJhci5zZXRPcHRpb25zKHtcbiAgICAgICAgY29udGludW91c1Njcm9sbGluZzogdGFyZ2V0LmNoZWNrZWRcbiAgICB9KTtcbn0pO1xuXG5yZW5kZXIoKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9zY3JpcHRzL3ByZXZpZXcuanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9