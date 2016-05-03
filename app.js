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
	
	__webpack_require__(148);
	
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
	        offset: offset,
	        time: current - reduceAmount,
	        reduce: reduceAmount,
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
	
	addEvent(window, 'mouseup touchend blur', function () {
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
	
	__webpack_require__(100);
	
	__webpack_require__(120);
	
	__webpack_require__(124);
	
	__webpack_require__(136);
	
	exports['default'] = _smooth_scrollbar.SmoothScrollbar;
	
	_smooth_scrollbar.SmoothScrollbar.version = '5.6.2';
	
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
	    }).__readonly('bounding', {
	        top: 0,
	        right: 0,
	        bottom: 0,
	        left: 0
	    }).__readonly('children', []).__readonly('parents', []).__readonly('size', this.getSize()).__readonly('isNestedScrollbar', false);
	
	    // non-enmurable properties
	    _Object$defineProperties(this, {
	        __updateThrottle: {
	            value: (0, _utils.debounce)(this.update.bind(this))
	        },
	        __hideTrackThrottle: {
	            value: (0, _utils.debounce)(this.hideTrack.bind(this), 300, false)
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
	
	    // storage
	    _shared.sbList.set(container, this);
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
	var originDelete = sbList["delete"].bind(sbList);
	
	sbList.update = function () {
	    sbList.forEach(function (sb) {
	        requestAnimationFrame(function () {
	            sb.__updateTree();
	        });
	    });
	};
	
	// patch #set,#delete with #update method
	sbList["delete"] = function () {
	    var res = originDelete.apply(undefined, arguments);
	    sbList.update();
	
	    return res;
	};
	
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
	
	var _is_one_of = __webpack_require__(87);
	
	_defaults(exports, _interopExportWildcard(_is_one_of, _defaults));
	
	var _set_style = __webpack_require__(88);
	
	_defaults(exports, _interopExportWildcard(_set_style, _defaults));
	
	var _get_delta = __webpack_require__(89);
	
	_defaults(exports, _interopExportWildcard(_get_delta, _defaults));
	
	var _find_child = __webpack_require__(91);
	
	_defaults(exports, _interopExportWildcard(_find_child, _defaults));
	
	var _build_curve = __webpack_require__(95);
	
	_defaults(exports, _interopExportWildcard(_build_curve, _defaults));
	
	var _get_touch_id = __webpack_require__(96);
	
	_defaults(exports, _interopExportWildcard(_get_touch_id, _defaults));
	
	var _get_position = __webpack_require__(98);
	
	_defaults(exports, _interopExportWildcard(_get_position, _defaults));
	
	var _pick_in_range = __webpack_require__(99);
	
	_defaults(exports, _interopExportWildcard(_pick_in_range, _defaults));
	
	var _get_pointer_data = __webpack_require__(97);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_data, _defaults));
	
	var _get_original_event = __webpack_require__(90);
	
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
/***/ function(module, exports) {

	/**
	 * @module
	 * @export {Function} isOneOf
	 */
	
	/**
	 * Check if `a` is one of `[...b]`
	 *
	 * @return {Boolean}
	 */
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var isOneOf = function isOneOf(a) {
	  var b = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
	
	  return b.some(function (v) {
	    return a === v;
	  });
	};
	exports.isOneOf = isOneOf;

/***/ },
/* 88 */
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
/* 89 */
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
	
	var _get_original_event = __webpack_require__(90);
	
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
/* 90 */
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
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Function} findChild
	 */
	
	/**
	 * Find element with specific class name within children, like selector '>'
	 *
	 * @param {Element} parentElem
	 * @param {String} className
	 *
	 * @return {Element}: first matched child
	 */
	"use strict";
	
	var _getIterator = __webpack_require__(92)["default"];
	
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
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(93), __esModule: true };

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(71);
	__webpack_require__(19);
	module.exports = __webpack_require__(94);

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(38)
	  , get      = __webpack_require__(42);
	module.exports = __webpack_require__(11).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ },
/* 95 */
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
/* 96 */
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
	
	var _get_original_event = __webpack_require__(90);
	
	var _get_pointer_data = __webpack_require__(97);
	
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
/* 97 */
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
	
	var _get_original_event = __webpack_require__(90);
	
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
/* 98 */
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
	
	var _get_original_event = __webpack_require__(90);
	
	var _get_pointer_data = __webpack_require__(97);
	
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
/* 99 */
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
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _update = __webpack_require__(101);
	
	_defaults(exports, _interopExportWildcard(_update, _defaults));
	
	var _destroy = __webpack_require__(102);
	
	_defaults(exports, _interopExportWildcard(_destroy, _defaults));
	
	var _get_size = __webpack_require__(103);
	
	_defaults(exports, _interopExportWildcard(_get_size, _defaults));
	
	var _listener = __webpack_require__(104);
	
	_defaults(exports, _interopExportWildcard(_listener, _defaults));
	
	var _scroll_to = __webpack_require__(105);
	
	_defaults(exports, _interopExportWildcard(_scroll_to, _defaults));
	
	var _is_visible = __webpack_require__(106);
	
	_defaults(exports, _interopExportWildcard(_is_visible, _defaults));
	
	var _set_options = __webpack_require__(107);
	
	_defaults(exports, _interopExportWildcard(_set_options, _defaults));
	
	var _set_position = __webpack_require__(112);
	
	_defaults(exports, _interopExportWildcard(_set_position, _defaults));
	
	var _toggle_track = __webpack_require__(114);
	
	_defaults(exports, _interopExportWildcard(_toggle_track, _defaults));
	
	var _manage_events = __webpack_require__(115);
	
	_defaults(exports, _interopExportWildcard(_manage_events, _defaults));
	
	var _clear_movement = __webpack_require__(116);
	
	_defaults(exports, _interopExportWildcard(_clear_movement, _defaults));
	
	var _infinite_scroll = __webpack_require__(117);
	
	_defaults(exports, _interopExportWildcard(_infinite_scroll, _defaults));
	
	var _get_content_elem = __webpack_require__(118);
	
	_defaults(exports, _interopExportWildcard(_get_content_elem, _defaults));
	
	var _scroll_into_view = __webpack_require__(119);
	
	_defaults(exports, _interopExportWildcard(_scroll_into_view, _defaults));

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} update
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utils = __webpack_require__(85);
	
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
	
	        var xAxis = targets.xAxis;
	        var yAxis = targets.yAxis;
	
	        // hide scrollbar if content size less than container
	        (0, _utils.setStyle)(xAxis.track, {
	            'display': size.content.width <= size.container.width ? 'none' : 'block'
	        });
	        (0, _utils.setStyle)(yAxis.track, {
	            'display': size.content.height <= size.container.height ? 'none' : 'block'
	        });
	
	        // use percentage value for thumb
	        (0, _utils.setStyle)(xAxis.thumb, {
	            'width': thumbSize.x + 'px'
	        });
	        (0, _utils.setStyle)(yAxis.thumb, {
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
/* 102 */
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
	        var fn = _ref.fn;
	
	        elem.removeEventListener(evt, fn);
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
/* 103 */
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
/* 104 */
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
/* 105 */
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
	    var __timerID = this.__timerID;
	
	    cancelAnimationFrame(__timerID.scrollTo);
	    cb = typeof cb === 'function' ? cb : function () {};
	
	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        x = Math.round(x);
	        y = Math.round(y);
	    }
	
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
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} isVisible
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
	 * Check if an element is visible
	 *
	 * @param  {Element} target                      target element
	 * @return {Boolean}
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.isVisible = function (elem) {
	  var bounding = this.bounding;
	
	  var targetBounding = elem.getBoundingClientRect();
	
	  // check overlapping
	  var top = Math.max(bounding.top, targetBounding.top);
	  var left = Math.max(bounding.left, targetBounding.left);
	  var right = Math.min(bounding.right, targetBounding.right);
	  var bottom = Math.min(bounding.bottom, targetBounding.bottom);
	
	  return top <= bottom && left <= right;
	};

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} setOptions
	 */
	
	'use strict';
	
	var _Object$keys = __webpack_require__(3)['default'];
	
	var _Object$assign = __webpack_require__(108)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
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
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(109), __esModule: true };

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(110);
	module.exports = __webpack_require__(11).Object.assign;

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(9);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(111)});

/***/ },
/* 111 */
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
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} setPosition
	 */
	
	'use strict';
	
	var _extends = __webpack_require__(113)['default'];
	
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
	    var options = this.options;
	    var offset = this.offset;
	    var limit = this.limit;
	    var targets = this.targets;
	    var __listeners = this.__listeners;
	
	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        x = Math.round(x);
	        y = Math.round(y);
	    }
	
	    if (Math.abs(x - offset.x) > 1) this.showTrack('x');
	    if (Math.abs(y - offset.y) > 1) this.showTrack('y');
	
	    x = (0, _utilsIndex.pickInRange)(x, 0, limit.x);
	    y = (0, _utilsIndex.pickInRange)(y, 0, limit.y);
	
	    this.__hideTrackThrottle();
	
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
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$assign = __webpack_require__(108)["default"];
	
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
/* 114 */
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
	
	function toggleTrack() {
	    var action = arguments.length <= 0 || arguments[0] === undefined ? 'show' : arguments[0];
	
	    var method = action === 'show' ? 'add' : 'remove';
	
	    /**
	     * toggle scrollbar track on given direction
	     *
	     * @param {String} direction: which direction of tracks to show/hide, default is 'both'
	     */
	    return function () {
	        var direction = arguments.length <= 0 || arguments[0] === undefined ? 'both' : arguments[0];
	        var _targets = this.targets;
	        var container = _targets.container;
	        var xAxis = _targets.xAxis;
	        var yAxis = _targets.yAxis;
	
	        direction = direction.toLowerCase();
	        container.classList[method]('scrolling');
	
	        if (direction === 'both') {
	            xAxis.track.classList[method]('show');
	            yAxis.track.classList[method]('show');
	        }
	
	        if (direction === 'x') {
	            xAxis.track.classList[method]('show');
	        }
	
	        if (direction === 'y') {
	            yAxis.track.classList[method]('show');
	        }
	    };
	};
	
	_smooth_scrollbar.SmoothScrollbar.prototype.showTrack = toggleTrack('show');
	_smooth_scrollbar.SmoothScrollbar.prototype.hideTrack = toggleTrack('hide');

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} unregisterEvents
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function matchAllRules(str, rules) {
	    return !!rules.length && rules.every(function (regex) {
	        return str.match(regex);
	    });
	};
	
	function manageEvents(shouldUnregister) {
	    shouldUnregister = !!shouldUnregister;
	
	    var method = shouldUnregister ? 'removeEventListener' : 'addEventListener';
	
	    return function () {
	        for (var _len = arguments.length, rules = Array(_len), _key = 0; _key < _len; _key++) {
	            rules[_key] = arguments[_key];
	        }
	
	        this.__handlers.forEach(function (handler) {
	            var elem = handler.elem;
	            var evt = handler.evt;
	            var fn = handler.fn;
	            var hasRegistered = handler.hasRegistered;
	
	            // shouldUnregister = hasRegistered = false: register event
	            // shouldUnregister = hasRegistered = true: unregister event
	            if (shouldUnregister !== hasRegistered) return;
	
	            if (matchAllRules(evt, rules)) {
	                elem[method](evt, fn);
	                handler.hasRegistered = !hasRegistered;
	            }
	        });
	    };
	};
	
	_smooth_scrollbar.SmoothScrollbar.prototype.unregisterEvents = manageEvents(true);
	_smooth_scrollbar.SmoothScrollbar.prototype.registerEvents = manageEvents(false);

/***/ },
/* 116 */
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
	  cancelAnimationFrame(this.__timerID.scrollTo);
	};

/***/ },
/* 117 */
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
/* 118 */
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
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} scrollIntoView
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
	 * Scroll target element into visible area of scrollbar.
	 *
	 * @param  {Element} target                      target element
	 * @param  {Boolean} options.onlyScrollIfNeeded  whether scroll container when target element is visible
	 * @param  {Number}  options.offsetTop           scrolling stop offset to top
	 * @param  {Number}  options.offsetLeft          scrolling stop offset to left
	 */
	_smooth_scrollbar.SmoothScrollbar.prototype.scrollIntoView = function (elem) {
	    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    var _ref$onlyScrollIfNeeded = _ref.onlyScrollIfNeeded;
	    var onlyScrollIfNeeded = _ref$onlyScrollIfNeeded === undefined ? false : _ref$onlyScrollIfNeeded;
	    var _ref$offsetTop = _ref.offsetTop;
	    var offsetTop = _ref$offsetTop === undefined ? 0 : _ref$offsetTop;
	    var _ref$offsetLeft = _ref.offsetLeft;
	    var offsetLeft = _ref$offsetLeft === undefined ? 0 : _ref$offsetLeft;
	    var targets = this.targets;
	    var bounding = this.bounding;
	
	    if (!elem || !targets.container.contains(elem)) return;
	
	    var targetBounding = elem.getBoundingClientRect();
	
	    if (onlyScrollIfNeeded && this.isVisible(elem)) return;
	
	    this.__setMovement(targetBounding.left - bounding.left - offsetLeft, targetBounding.top - bounding.top - offsetTop);
	};

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _render = __webpack_require__(121);
	
	_defaults(exports, _interopExportWildcard(_render, _defaults));
	
	var _add_movement = __webpack_require__(122);
	
	_defaults(exports, _interopExportWildcard(_add_movement, _defaults));
	
	var _set_movement = __webpack_require__(123);
	
	_defaults(exports, _interopExportWildcard(_set_movement, _defaults));

/***/ },
/* 121 */
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
	    var renderByPixels = options.renderByPixels;
	
	    if (Math.abs(movement) < 1) {
	        var next = current + movement;
	
	        return {
	            movement: 0,
	            position: movement > 0 ? Math.ceil(next) : Math.floor(next)
	        };
	    }
	
	    var nextMovement = movement * (1 - friction / 100);
	
	    if (renderByPixels) {
	        nextMovement |= 0;
	    }
	
	    return {
	        movement: nextMovement,
	        position: current + movement - nextMovement
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
/* 122 */
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
	
	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        deltaX = Math.round(deltaX);
	        deltaY = Math.round(deltaY);
	    }
	
	    var x = movement.x + deltaX;
	    var y = movement.y + deltaY;
	
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
/* 123 */
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
	
	    if (options.renderByPixels) {
	        // ensure resolved with integer
	        deltaX = Math.round(deltaX);
	        deltaY = Math.round(deltaY);
	    }
	
	    movement.x = _utils.pickInRange.apply(undefined, [deltaX].concat(_toConsumableArray(limit.x)));
	    movement.y = _utils.pickInRange.apply(undefined, [deltaY].concat(_toConsumableArray(limit.y)));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__setMovement', {
	    value: __setMovement,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _drag = __webpack_require__(125);
	
	_defaults(exports, _interopExportWildcard(_drag, _defaults));
	
	var _touch = __webpack_require__(126);
	
	_defaults(exports, _interopExportWildcard(_touch, _defaults));
	
	var _mouse = __webpack_require__(127);
	
	_defaults(exports, _interopExportWildcard(_mouse, _defaults));
	
	var _wheel = __webpack_require__(128);
	
	_defaults(exports, _interopExportWildcard(_wheel, _defaults));
	
	var _resize = __webpack_require__(129);
	
	_defaults(exports, _interopExportWildcard(_resize, _defaults));
	
	var _select = __webpack_require__(130);
	
	_defaults(exports, _interopExportWildcard(_select, _defaults));
	
	var _keyboard = __webpack_require__(131);
	
	_defaults(exports, _interopExportWildcard(_keyboard, _defaults));

/***/ },
/* 125 */
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
	
	var _utils = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	var __dragHandler = function __dragHandler() {
	    var _this = this;
	
	    var _targets = this.targets;
	    var container = _targets.container;
	    var content = _targets.content;
	
	    var isDrag = false;
	    var animation = undefined;
	    var padding = undefined;
	
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
	
	        var speed = _this.options.speed;
	
	        _this.__setMovement(x * speed, y * speed);
	
	        animation = requestAnimationFrame(function () {
	            scroll({ x: x, y: y });
	        });
	    };
	
	    this.__addEvent(container, 'dragstart', function (evt) {
	        if (_this.__eventFromChildScrollbar(evt)) return;
	
	        isDrag = true;
	        padding = evt.target.clientHeight;
	
	        (0, _utils.setStyle)(content, {
	            'pointer-events': 'auto'
	        });
	
	        cancelAnimationFrame(animation);
	        _this.__updateBounding();
	    });
	
	    this.__addEvent(document, 'dragover mousemove touchmove', function (evt) {
	        if (!isDrag || _this.__eventFromChildScrollbar(evt)) return;
	        cancelAnimationFrame(animation);
	        evt.preventDefault();
	
	        var dir = _this.__getPointerTrend(evt, padding);
	
	        scroll(dir);
	    });
	
	    this.__addEvent(document, 'dragend mouseup touchend blur', function (evt) {
	        if (_this.__eventFromChildScrollbar(evt)) return;
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
/* 126 */
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
	
	var _utils = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
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
	        var touchList = (0, _utils.getOriginalEvent)(evt).touches;
	
	        _Object$keys(touchList).forEach(function (key) {
	            // record all touches that will be restored
	            if (key === 'length') return;
	
	            var touch = touchList[key];
	
	            touchRecords[touch.identifier] = (0, _utils.getPosition)(touch);
	        });
	    };
	
	    this.__addEvent(container, 'touchstart', function (evt) {
	        if (_this.__isDrag) return;
	
	        updateRecords(evt);
	
	        lastTouchTime = Date.now();
	        lastTouchID = (0, _utils.getTouchID)(evt);
	        lastTouchPos = (0, _utils.getPosition)(evt);
	
	        // stop scrolling
	        _this.stop();
	        moveVelocity.x = moveVelocity.y = 0;
	    });
	
	    this.__addEvent(container, 'touchmove', function (evt) {
	        if (_this.__isDrag) return;
	
	        updateRecords(evt);
	
	        var touchID = (0, _utils.getTouchID)(evt);
	        var offset = _this.offset;
	
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
	
	        var duration = Date.now() - lastTouchTime;
	        var _lastTouchPos = lastTouchPos;
	        var lastX = _lastTouchPos.x;
	        var lastY = _lastTouchPos.y;
	
	        var _lastTouchPos2 = lastTouchPos = (0, _utils.getPosition)(evt);
	
	        var curX = _lastTouchPos2.x;
	        var curY = _lastTouchPos2.y;
	
	        duration = duration || 1; // fix Infinity error
	
	        moveVelocity.x = (lastX - curX) / duration;
	        moveVelocity.y = (lastY - curY) / duration;
	
	        if (_this.options.continuousScrolling && _this.__scrollOntoEdge(lastX - curX, lastY - curY)) {
	            return _this.__updateThrottle();
	        }
	
	        evt.preventDefault();
	
	        _this.setPosition(lastX - curX + offset.x, lastY - curY + offset.y);
	    });
	
	    this.__addEvent(container, 'touchend', function () {
	        if (_this.__isDrag) return;
	
	        // release current touch
	        delete touchRecords[lastTouchID];
	        lastTouchID = undefined;
	
	        var x = moveVelocity.x;
	        var y = moveVelocity.y;
	
	        x *= 1e3;
	        y *= 1e3;
	
	        var speed = _this.options.speed;
	
	        _this.__setMovement(Math.abs(x) > 10 ? x * speed : 0, Math.abs(y) > 10 ? y * speed : 0);
	
	        moveVelocity.x = moveVelocity.y = 0;
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__touchHandler', {
	    value: __touchHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 127 */
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
	
	    var _targets = this.targets;
	    var container = _targets.container;
	    var xAxis = _targets.xAxis;
	    var yAxis = _targets.yAxis;
	
	    var isMouseDown = undefined,
	        isMouseMoving = undefined,
	        startOffsetToThumb = undefined,
	        startTrackDirection = undefined,
	        containerRect = undefined;
	
	    var getTrackDir = function getTrackDir(elem) {
	        if ((0, _utils.isOneOf)(elem, [xAxis.track, xAxis.thumb])) return 'x';
	        if ((0, _utils.isOneOf)(elem, [yAxis.track, yAxis.thumb])) return 'y';
	    };
	
	    this.__addEvent(container, 'click', function (evt) {
	        if (isMouseMoving || !(0, _utils.isOneOf)(evt.target, [xAxis.track, yAxis.track])) return;
	
	        var track = evt.target;
	        var direction = getTrackDir(track);
	        var rect = track.getBoundingClientRect();
	        var clickPos = (0, _utils.getPosition)(evt);
	
	        var size = _this.size;
	        var offset = _this.offset;
	        var thumbSize = _this.thumbSize;
	
	        if (direction === 'x') {
	            var clickOffset = (clickPos.x - rect.left - thumbSize.x / 2) / (size.container.width - (thumbSize.x - thumbSize.realX));
	            _this.__setMovement(clickOffset * size.content.width - offset.x, 0);
	        } else {
	            var clickOffset = (clickPos.y - rect.top - thumbSize.y / 2) / (size.container.height - (thumbSize.y - thumbSize.realY));
	            _this.__setMovement(0, clickOffset * size.content.height - offset.y);
	        }
	    });
	
	    this.__addEvent(container, 'mousedown', function (evt) {
	        if (!(0, _utils.isOneOf)(evt.target, [xAxis.thumb, yAxis.thumb])) return;
	
	        isMouseDown = true;
	
	        var cursorPos = (0, _utils.getPosition)(evt);
	        var thumbRect = evt.target.getBoundingClientRect();
	
	        startTrackDirection = getTrackDir(evt.target);
	
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
	
	        isMouseMoving = true;
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
	        isMouseDown = isMouseMoving = false;
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__mouseHandler', {
	    value: __mouseHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 128 */
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
	
	var _utils = __webpack_require__(85);
	
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
	        var options = _this.options;
	
	        var _getDelta = (0, _utils.getDelta)(evt);
	
	        var x = _getDelta.x;
	        var y = _getDelta.y;
	
	        if (options.continuousScrolling && _this.__scrollOntoEdge(x, y)) {
	            return _this.__updateThrottle();
	        }
	
	        evt.preventDefault();
	
	        _this.__addMovement(x * options.speed, y * options.speed);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__wheelHandler', {
	    value: __wheelHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 129 */
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
/* 130 */
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
	
	var _utils = __webpack_require__(85);
	
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
	
	        var speed = _this.options.speed;
	
	        _this.__setMovement(x * speed, y * speed);
	
	        animation = requestAnimationFrame(function () {
	            scroll({ x: x, y: y });
	        });
	    };
	
	    var setSelect = function setSelect() {
	        var value = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	
	        (0, _utils.setStyle)(container, {
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
	        if (_this.__eventFromChildScrollbar(evt)) {
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
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __keyboardHandler
	 */
	
	'use strict';
	
	var _slicedToArray = __webpack_require__(132)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(85);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	/**
	 * @method
	 * @internal
	 * Keypress event handler builder
	 *
	 * @param {Object} option
	 */
	var __keyboardHandler = function __keyboardHandler() {
	    var _this = this;
	
	    var targets = this.targets;
	    var options = this.options;
	
	    var getKeyDelta = function getKeyDelta(keyCode) {
	        // key maps [deltaX, deltaY, useSetMethod]
	        var size = _this.size;
	        var offset = _this.offset;
	        var limit = _this.limit;
	        var movement = _this.movement;
	        // need real time data
	
	        switch (keyCode) {
	            case 32:
	                // space
	                return [0, 200];
	            case 33:
	                // pageUp
	                return [0, -size.container.height + 40];
	            case 34:
	                // pageDown
	                return [0, size.container.height - 40];
	            case 35:
	                // end
	                return [0, Math.abs(movement.y) + limit.y - offset.y];
	            case 36:
	                // home
	                return [0, -Math.abs(movement.y) - offset.y];
	            case 37:
	                // left
	                return [-40, 0];
	            case 38:
	                // up
	                return [0, -40];
	            case 39:
	                // right
	                return [40, 0];
	            case 40:
	                // down
	                return [0, 40];
	            default:
	                return null;
	        }
	    };
	
	    var container = targets.container;
	
	    var isFocused = false;
	
	    this.__addEvent(container, 'focus', function () {
	        isFocused = true;
	    });
	
	    this.__addEvent(container, 'blur', function () {
	        isFocused = false;
	    });
	
	    this.__addEvent(container, 'keydown', function (evt) {
	        if (!isFocused) return;
	
	        evt = (0, _utilsIndex.getOriginalEvent)(evt);
	
	        var delta = getKeyDelta(evt.keyCode || evt.which);
	
	        if (!delta) return;
	
	        var _delta = _slicedToArray(delta, 2);
	
	        var x = _delta[0];
	        var y = _delta[1];
	
	        if (options.continuousScrolling && _this.__scrollOntoEdge(x, y)) {
	            container.blur();
	
	            if (_this.parents.length) {
	                _this.parents[0].focus();
	            }
	
	            return _this.__updateThrottle();
	        }
	
	        evt.preventDefault();
	
	        var speed = _this.options.speed;
	
	        _this.__addMovement(x * speed, y * speed);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__keyboardHandler', {
	    value: __keyboardHandler,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _getIterator = __webpack_require__(92)["default"];
	
	var _isIterable = __webpack_require__(133)["default"];
	
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
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(134), __esModule: true };

/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(71);
	__webpack_require__(19);
	module.exports = __webpack_require__(135);

/***/ },
/* 135 */
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
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _readonly = __webpack_require__(137);
	
	_defaults(exports, _interopExportWildcard(_readonly, _defaults));
	
	var _add_event = __webpack_require__(138);
	
	_defaults(exports, _interopExportWildcard(_add_event, _defaults));
	
	var _update_tree = __webpack_require__(139);
	
	_defaults(exports, _interopExportWildcard(_update_tree, _defaults));
	
	var _init_options = __webpack_require__(140);
	
	_defaults(exports, _interopExportWildcard(_init_options, _defaults));
	
	var _init_scrollbar = __webpack_require__(141);
	
	_defaults(exports, _interopExportWildcard(_init_scrollbar, _defaults));
	
	var _get_delta_limit = __webpack_require__(142);
	
	_defaults(exports, _interopExportWildcard(_get_delta_limit, _defaults));
	
	var _update_bounding = __webpack_require__(143);
	
	_defaults(exports, _interopExportWildcard(_update_bounding, _defaults));
	
	var _scroll_onto_edge = __webpack_require__(144);
	
	_defaults(exports, _interopExportWildcard(_scroll_onto_edge, _defaults));
	
	var _get_pointer_trend = __webpack_require__(145);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_trend, _defaults));
	
	var _set_thumb_position = __webpack_require__(146);
	
	_defaults(exports, _interopExportWildcard(_set_thumb_position, _defaults));
	
	var _event_from_child_scrollbar = __webpack_require__(147);
	
	_defaults(exports, _interopExportWildcard(_event_from_child_scrollbar, _defaults));

/***/ },
/* 137 */
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
/* 138 */
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
	
	function __addEvent(elem, events, handler) {
	    var _this = this;
	
	    if (!elem || typeof elem.addEventListener !== 'function') {
	        throw new TypeError('expect elem to be a DOM element, but got ' + elem);
	    }
	
	    var fn = function fn(evt) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	            args[_key - 1] = arguments[_key];
	        }
	
	        // ignore default prevented events or user ignored events
	        if (!evt.type.match(/drag/) && evt.defaultPrevented) return;
	
	        handler.apply(undefined, [evt].concat(args));
	    };
	
	    events.split(/\s+/g).forEach(function (evt) {
	        _this.__handlers.push({ evt: evt, elem: elem, fn: fn, hasRegistered: true });
	
	        elem.addEventListener(evt, fn);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__addEvent', {
	    value: __addEvent,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __updateTree
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _shared = __webpack_require__(53);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __updateTree() {
	    var _targets = this.targets;
	    var container = _targets.container;
	    var content = _targets.content;
	
	    this.__readonly('children', [].concat(_toConsumableArray(content.querySelectorAll(_shared.selectors))));
	    this.__readonly('isNestedScrollbar', false);
	
	    var parents = [];
	
	    while (container) {
	        container = container.parentElement;
	
	        if (_shared.sbList.has(container)) {
	            this.__readonly('isNestedScrollbar', true);
	            parents.push(container);
	        }
	    }
	
	    this.__readonly('parents', parents);
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__updateTree', {
	    value: __updateTree,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 140 */
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
	    var _this = this;
	
	    var options = {
	        speed: 1, // scroll speed scale
	        friction: 10, // friction factor, percent
	        ignoreEvents: [], // events names to be ignored
	        thumbMinSize: 20, // min size for scrollbar thumb
	        renderByPixels: true, // rendering by integer pixels
	        continuousScrolling: 'auto' // allow uper scrollable content to scroll when reaching edge
	    };
	
	    var limit = {
	        friction: [0, 100],
	        speed: [0, Infinity],
	        thumbMinSize: [0, Infinity]
	    };
	
	    var getScrollMode = function getScrollMode() {
	        var mode = arguments.length <= 0 || arguments[0] === undefined ? 'auto' : arguments[0];
	
	        switch (mode) {
	            case 'auto':
	                return _this.isNestedScrollbar;
	            default:
	                return !!mode;
	        }
	    };
	
	    var optionAccessors = _Object$defineProperties({}, {
	        ignoreEvents: {
	            // deprecated
	
	            set: function set(v) {
	                console.warn('`options.ignoreEvents` parameter is deprecated, use `instance#unregisterEvents()` method instead. https://github.com/idiotWu/smooth-scrollbar/wiki/Instance-Methods#instanceunregisterevents-regex--regex-regex--');
	            },
	            configurable: true,
	            enumerable: true
	        },
	        renderByPixels: {
	            get: function get() {
	                return options.renderByPixels;
	            },
	            set: function set(v) {
	                options.renderByPixels = !!v;
	            },
	            configurable: true,
	            enumerable: true
	        },
	        continuousScrolling: {
	            get: function get() {
	                return getScrollMode(options.continuousScrolling);
	            },
	            set: function set(v) {
	                if (v === 'auto') {
	                    options.continuousScrolling = v;
	                } else {
	                    options.continuousScrolling = !!v;
	                }
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
/* 141 */
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
/* 142 */
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
/* 143 */
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
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __scrollOntoEdge
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utils = __webpack_require__(85);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __scrollOntoEdge(deltaX, deltaY) {
	    var offset = this.offset;
	    var limit = this.limit;
	
	    var destX = (0, _utils.pickInRange)(deltaX + offset.x, 0, limit.x);
	    var destY = (0, _utils.pickInRange)(deltaY + offset.y, 0, limit.y);
	
	    if (destX === offset.x && destY === offset.y) {
	        return true;
	    }
	
	    return false;
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__scrollOntoEdge', {
	    value: __scrollOntoEdge,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 145 */
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
	    var padding = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
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
	
	    if (x > right - padding) {
	        res.x = x - right + padding;
	    } else if (x < left + padding) {
	        res.x = x - left - padding;
	    }
	
	    if (y > bottom - padding) {
	        res.y = y - bottom + padding;
	    } else if (y < top + padding) {
	        res.y = y - top - padding;
	    }
	
	    return res;
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__getPointerTrend', {
	    value: __getPointerTrend,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 146 */
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
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __eventFromChildScrollbar
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __eventFromChildScrollbar() {
	    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    var target = _ref.target;
	
	    return this.children.some(function (sb) {
	        return sb.contains(target);
	    });
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__eventFromChildScrollbar', {
	    value: __eventFromChildScrollbar,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = __webpack_require__(132)['default'];
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$assign = __webpack_require__(108)['default'];
	
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
	
	    dots.push([x, 0]);
	
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
	
	document.querySelector('#renderByPixels').addEventListener('change', function (_ref4) {
	    var target = _ref4.target;
	
	    _src2['default'].getAll().forEach(function (s) {
	        s.setOptions({
	            renderByPixels: target.checked
	        });
	    });
	});
	
	render();

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYmNjNDFmODdhMWQxYjVhMzdkZDgiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9zY3JpcHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2ludGVyb3AtcmVxdWlyZS1kZWZhdWx0LmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5rZXlzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlZmluZWQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1zYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2xvYmFsLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jdHguanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmEtZnVuY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZhaWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy90by1jb25zdW1hYmxlLWFycmF5LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2FycmF5L2Zyb20uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmluZy1hdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1kZWZpbmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmxpYnJhcnkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oaWRlLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZGVzY3JpcHRvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhhcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNyZWF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXRvLXN0cmluZy10YWcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2hhcmVkLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC51aWQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jYWxsLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hbi1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXMtYXJyYXktaXRlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8tbGVuZ3RoLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jbGFzc29mLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2YuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5mcmVlemUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2hhcmVkL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2RlZmF1bHRzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5nZXQtbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWlvYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlvYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2ludGVyb3AtZXhwb3J0LXdpbGRjYXJkLmpzIiwid2VicGFjazovLy8uL3NyYy9zaGFyZWQvc2JfbGlzdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLXN0ZXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucmVkZWZpbmUtYWxsLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zdHJpY3QtbmV3LmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mb3Itb2YuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNldC1zcGVjaWVzLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXRvLWpzb24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9zZWxlY3RvcnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9kZWJvdW5jZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvaXNfb25lX29mLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9zZXRfc3R5bGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9kZWx0YS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X29yaWdpbmFsX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9maW5kX2NoaWxkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvYnVpbGRfY3VydmUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF90b3VjaF9pZC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X3BvaW50ZXJfZGF0YS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X3Bvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9waWNrX2luX3JhbmdlLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3VwZGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9kZXN0cm95LmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2dldF9zaXplLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2xpc3RlbmVyLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3Njcm9sbF90by5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9pc192aXNpYmxlLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3NldF9vcHRpb25zLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9hc3NpZ24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwid2VicGFjazovLy8uL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3QtYXNzaWduLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3NldF9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9leHRlbmRzLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3RvZ2dsZV90cmFjay5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9tYW5hZ2VfZXZlbnRzLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2NsZWFyX21vdmVtZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2luZmluaXRlX3Njcm9sbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfY29udGVudF9lbGVtLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3Njcm9sbF9pbnRvX3ZpZXcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVuZGVyL3JlbmRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVuZGVyL2FkZF9tb3ZlbWVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVuZGVyL3NldF9tb3ZlbWVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvZHJhZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3RvdWNoLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvbW91c2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy93aGVlbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3Jlc2l6ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3NlbGVjdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL2tleWJvYXJkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3NsaWNlZC10by1hcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9pcy1pdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9mbi9pcy1pdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3JlYWRvbmx5LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvYWRkX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvdXBkYXRlX3RyZWUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pbml0X29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pbml0X3Njcm9sbGJhci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2dldF9kZWx0YV9saW1pdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZV9ib3VuZGluZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3Njcm9sbF9vbnRvX2VkZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9nZXRfcG9pbnRlcl90cmVuZC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3NldF90aHVtYl9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2V2ZW50X2Zyb21fY2hpbGRfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9wcmV2aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7OztxQkN0Q08sQ0FBVzs7cUJBQ1gsR0FBVzs7Z0NBQ0ksRUFBWTs7OztBQUNsQyxPQUFNLENBQUMsU0FBUyxtQkFBWSxDOzs7Ozs7QUNINUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwyQjs7Ozs7Ozs7Ozs7O2dDQ1JzQixFQUFZOzs7O0FBRWxDLEtBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztBQUNwQyxLQUFNLGNBQWMsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDOztBQUVoQyxLQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELEtBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FB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RSxDIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgYmNjNDFmODdhMWQxYjVhMzdkZDhcbiAqKi8iLCJpbXBvcnQgJy4vbW9uaXRvcic7XG5pbXBvcnQgJy4vcHJldmlldyc7XG5pbXBvcnQgU2Nyb2xsYmFyIGZyb20gJy4uLy4uL3NyYy8nO1xud2luZG93LlNjcm9sbGJhciA9IFNjcm9sbGJhcjtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtZGVmYXVsdC5qc1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCBTY3JvbGxiYXIgZnJvbSAnLi4vLi4vc3JjLyc7XG5cbmNvbnN0IERQUiA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuY29uc3QgVElNRV9SQU5HRV9NQVggPSAyMCAqIDFlMztcblxuY29uc3QgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50Jyk7XG5jb25zdCB0aHVtYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHVtYicpO1xuY29uc3QgdHJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHJhY2snKTtcbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydCcpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmRpdi5pbm5lckhUTUwgPSBBcnJheSgxMDEpLmpvaW4oJzxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBFeHBlZGl0YSBlYXF1ZSBkZWJpdGlzLCBkb2xvcmVtIGRvbG9yaWJ1cywgdm9sdXB0YXRpYnVzIG1pbmltYSBpbGxvIGVzdCwgYXRxdWUgYWxpcXVpZCBpcHN1bSBuZWNlc3NpdGF0aWJ1cyBjdW1xdWUgdmVyaXRhdGlzIGJlYXRhZSwgcmF0aW9uZSByZXB1ZGlhbmRhZSBxdW9zISBPbW5pcyBoaWMsIGFuaW1pLjwvcD4nKTtcblxuY29udGVudC5hcHBlbmRDaGlsZChkaXYpO1xuXG5TY3JvbGxiYXIuaW5pdEFsbCgpO1xuXG5jb25zdCBzY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGNvbnRlbnQpO1xuXG5sZXQgY2hhcnRUeXBlID0gJ29mZnNldCc7XG5cbmxldCB0aHVtYldpZHRoID0gMDtcbmxldCBlbmRPZmZzZXQgPSAwO1xuXG5sZXQgdGltZVJhbmdlID0gNSAqIDFlMztcblxubGV0IHJlY29yZHMgPSBbXTtcbmxldCBzaXplID0ge1xuICAgIHdpZHRoOiAzMDAsXG4gICAgaGVpZ2h0OiAyMDBcbn07XG5cbmxldCBzaG91bGRVcGRhdGUgPSB0cnVlO1xuXG5sZXQgdGFuZ2VudFBvaW50ID0gbnVsbDtcbmxldCB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xuXG5sZXQgaG92ZXJMb2NrZWQgPSBmYWxzZTtcbmxldCBob3ZlclBvaW50ZXJYID0gdW5kZWZpbmVkO1xubGV0IHBvaW50ZXJEb3duT25UcmFjayA9IHVuZGVmaW5lZDtcbmxldCBob3ZlclByZWNpc2lvbiA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50ID8gNSA6IDE7XG5cbmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiBEUFI7XG5jYW52YXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKiBEUFI7XG5jdHguc2NhbGUoRFBSLCBEUFIpO1xuXG5mdW5jdGlvbiBub3RhdGlvbihudW0gPSAwKSB7XG4gICAgaWYgKCFudW0gfHwgTWF0aC5hYnMobnVtKSA+IDEwKiotMikgcmV0dXJuIG51bS50b0ZpeGVkKDIpO1xuXG4gICAgbGV0IGV4cCA9IC0zO1xuXG4gICAgd2hpbGUgKCEobnVtIC8gMTAqKmV4cCkpIHtcbiAgICAgICAgaWYgKGV4cCA8IC0xMCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bSA+IDAgPyAnSW5maW5pdHknIDogJy1JbmZpbml0eSc7XG4gICAgICAgIH1cblxuICAgICAgICBleHAtLTtcbiAgICB9XG5cbiAgICByZXR1cm4gKG51bSAqIDEwKiotZXhwKS50b0ZpeGVkKDIpICsgJ2UnICsgZXhwO1xufTtcblxuZnVuY3Rpb24gYWRkRXZlbnQoZWxlbXMsIGV2dHMsIGhhbmRsZXIpIHtcbiAgICBldnRzLnNwbGl0KC9cXHMrLykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBbXS5jb25jYXQoZWxlbXMpLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKG5hbWUsICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICAgICAgaGFuZGxlciguLi5hcmdzKTtcbiAgICAgICAgICAgICAgICBzaG91bGRVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gc2xpY2VSZWNvcmQoKSB7XG4gICAgbGV0IGVuZElkeCA9IE1hdGguZmxvb3IocmVjb3Jkcy5sZW5ndGggKiAoMSAtIGVuZE9mZnNldCkpO1xuICAgIGxldCBsYXN0ID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCBkcm9wSWR4ID0gMDtcblxuICAgIGxldCByZXN1bHQgPSByZWNvcmRzLmZpbHRlcigocHQsIGlkeCkgPT4ge1xuICAgICAgICBpZiAobGFzdC50aW1lIC0gcHQudGltZSA+IFRJTUVfUkFOR0VfTUFYKSB7XG4gICAgICAgICAgICBkcm9wSWR4Kys7XG4gICAgICAgICAgICBlbmRJZHgtLTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlbmQgPSByZWNvcmRzW2VuZElkeCAtIDFdO1xuXG4gICAgICAgIHJldHVybiBlbmQudGltZSAtIHB0LnRpbWUgPD0gdGltZVJhbmdlICYmIGlkeCA8PSBlbmRJZHg7XG4gICAgfSk7XG5cbiAgICByZWNvcmRzLnNwbGljZSgwLCBkcm9wSWR4KTtcbiAgICB0aHVtYldpZHRoID0gcmVzdWx0Lmxlbmd0aCA/IHJlc3VsdC5sZW5ndGggLyByZWNvcmRzLmxlbmd0aCA6IDE7XG5cbiAgICB0aHVtYi5zdHlsZS53aWR0aCA9IHRodW1iV2lkdGggKiAxMDAgKyAnJSc7XG4gICAgdGh1bWIuc3R5bGUucmlnaHQgPSBlbmRPZmZzZXQgKiAxMDAgKyAnJSc7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuZnVuY3Rpb24gZ2V0TGltaXQocG9pbnRzKSB7XG4gICAgcmV0dXJuIHBvaW50cy5yZWR1Y2UoKHByZSwgY3VyKSA9PiB7XG4gICAgICAgIGxldCB2YWwgPSBjdXJbY2hhcnRUeXBlXTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1heDogTWF0aC5tYXgocHJlLm1heCwgdmFsKSxcbiAgICAgICAgICAgIG1pbjogTWF0aC5taW4ocHJlLm1pbiwgdmFsKVxuICAgICAgICB9O1xuICAgIH0sIHsgbWF4OiAtSW5maW5pdHksIG1pbjogSW5maW5pdHkgfSk7XG59O1xuXG5mdW5jdGlvbiBhc3NpZ25Qcm9wcyhwcm9wcykge1xuICAgIGlmICghcHJvcHMpIHJldHVybjtcblxuICAgIE9iamVjdC5rZXlzKHByb3BzKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGN0eFtuYW1lXSA9IHByb3BzW25hbWVdO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZHJhd0xpbmUocDAsIHAxLCBvcHRpb25zKSB7XG4gICAgbGV0IHgwID0gcDBbMF0sXG4gICAgICAgIHkwID0gcDBbMV0sXG4gICAgICAgIHgxID0gcDFbMF0sXG4gICAgICAgIHkxID0gcDFbMV07XG5cbiAgICBhc3NpZ25Qcm9wcyhvcHRpb25zLnByb3BzKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAtMSwgMCwgc2l6ZS5oZWlnaHQpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc2V0TGluZURhc2gob3B0aW9ucy5kYXNoZWQgPyBvcHRpb25zLmRhc2hlZCA6IFtdKTtcbiAgICBjdHgubW92ZVRvKHgwLCB5MCk7XG4gICAgY3R4LmxpbmVUbyh4MSwgeTEpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbn07XG5cbmZ1bmN0aW9uIGFkanVzdFRleHQoY29udGVudCwgcCwgb3B0aW9ucykge1xuICAgIGxldCB4ID0gcFswXSxcbiAgICAgICAgeSA9IHBbMV07XG5cbiAgICBsZXQgd2lkdGggPSBjdHgubWVhc3VyZVRleHQoY29udGVudCkud2lkdGg7XG5cbiAgICBpZiAoeCArIHdpZHRoID4gc2l6ZS53aWR0aCkge1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ3JpZ2h0JztcbiAgICB9IGVsc2UgaWYgKHggLSB3aWR0aCA8IDApIHtcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9ICdsZWZ0JztcbiAgICB9IGVsc2Uge1xuICAgICAgICBjdHgudGV4dEFsaWduID0gb3B0aW9ucy50ZXh0QWxpZ247XG4gICAgfVxuXG4gICAgY3R4LmZpbGxUZXh0KGNvbnRlbnQsIHgsIC15KTtcbn07XG5cbmZ1bmN0aW9uIGZpbGxUZXh0KGNvbnRlbnQsIHAsIG9wdGlvbnMpIHtcbiAgICBhc3NpZ25Qcm9wcyhvcHRpb25zLnByb3BzKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCBzaXplLmhlaWdodCk7XG4gICAgYWRqdXN0VGV4dChjb250ZW50LCBwLCBvcHRpb25zKTtcbiAgICBjdHgucmVzdG9yZSgpO1xufTtcblxuZnVuY3Rpb24gZHJhd01haW4oKSB7XG4gICAgbGV0IHBvaW50cyA9IHNsaWNlUmVjb3JkKCk7XG4gICAgaWYgKCFwb2ludHMubGVuZ3RoKSByZXR1cm47XG5cbiAgICBsZXQgbGltaXQgPSBnZXRMaW1pdChwb2ludHMpO1xuXG4gICAgbGV0IHN0YXJ0ID0gcG9pbnRzWzBdO1xuICAgIGxldCBlbmQgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgbGV0IHRvdGFsWCA9IHRodW1iV2lkdGggPT09IDEgPyB0aW1lUmFuZ2UgOiBlbmQudGltZSAtIHN0YXJ0LnRpbWU7XG4gICAgbGV0IHRvdGFsWSA9IChsaW1pdC5tYXggLSBsaW1pdC5taW4pIHx8IDE7XG5cbiAgICBsZXQgZ3JkID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIHNpemUuaGVpZ2h0LCAwLCAwKTtcbiAgICBncmQuYWRkQ29sb3JTdG9wKDAsICdyZ2IoMTcwLCAyMTUsIDI1NSknKTtcbiAgICBncmQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKDE3MCwgMjE1LCAyNTUsIDAuMiknKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAtMSwgMCwgc2l6ZS5oZWlnaHQpO1xuXG4gICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgY3R4LmZpbGxTdHlsZSA9IGdyZDtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmdiKDY0LCAxNjUsIDI1NSknO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDAsIDApO1xuXG4gICAgbGV0IGxhc3RQb2ludCA9IHBvaW50cy5yZWR1Y2UoKHByZSwgY3VyLCBpZHgpID0+IHtcbiAgICAgICAgbGV0IHRpbWUgPSBjdXIudGltZSxcbiAgICAgICAgICAgIHZhbHVlID0gY3VyW2NoYXJ0VHlwZV07XG4gICAgICAgIGxldCB4ID0gKHRpbWUgLSBzdGFydC50aW1lKSAvIHRvdGFsWCAqIHNpemUud2lkdGgsXG4gICAgICAgICAgICB5ID0gKHZhbHVlIC0gbGltaXQubWluKSAvIHRvdGFsWSAqIChzaXplLmhlaWdodCAtIDIwKTtcblxuICAgICAgICBjdHgubGluZVRvKHgsIHkpO1xuXG4gICAgICAgIGlmIChob3ZlclBvaW50ZXJYICYmIE1hdGguYWJzKGhvdmVyUG9pbnRlclggLSB4KSA8IGhvdmVyUHJlY2lzaW9uKSB7XG4gICAgICAgICAgICB0YW5nZW50UG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgY29vcmQ6IFt4LCB5XSxcbiAgICAgICAgICAgICAgICBwb2ludDogY3VyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0YW5nZW50UG9pbnRQcmUgPSB7XG4gICAgICAgICAgICAgICAgY29vcmQ6IHByZSxcbiAgICAgICAgICAgICAgICBwb2ludDogcG9pbnRzW2lkeCAtIDFdXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFt4LCB5XTtcbiAgICB9LCBbXSk7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmxpbmVUbyhsYXN0UG9pbnRbMF0sIDApO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBkcmF3TGluZShbMCwgbGFzdFBvaW50WzFdXSwgbGFzdFBvaW50LCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBzdHJva2VTdHlsZTogJyNmNjAnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZpbGxUZXh0KCfihpknICsgbm90YXRpb24obGltaXQubWluKSwgWzAsIDBdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjMDAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICcxMnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmaWxsVGV4dChub3RhdGlvbihlbmRbY2hhcnRUeXBlXSksIGxhc3RQb2ludCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2Y2MCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJzE2cHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZHJhd1RhbmdlbnRMaW5lKCkge1xuICAgIGxldCBjb29yZCA9IHRhbmdlbnRQb2ludC5jb29yZCxcbiAgICAgICAgY29vcmRQcmUgPSB0YW5nZW50UG9pbnRQcmUuY29vcmQ7XG5cbiAgICBsZXQgayA9IChjb29yZFsxXSAtIGNvb3JkUHJlWzFdKSAvIChjb29yZFswXSAtIGNvb3JkUHJlWzBdKSB8fCAwO1xuICAgIGxldCBiID0gY29vcmRbMV0gLSBrICogY29vcmRbMF07XG5cbiAgICBkcmF3TGluZShbMCwgYl0sIFtzaXplLndpZHRoLCBrICogc2l6ZS53aWR0aCArIGJdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBsaW5lV2lkdGg6IDEsXG4gICAgICAgICAgICBzdHJva2VTdHlsZTogJyNmMDAnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCByZWFsSyA9ICh0YW5nZW50UG9pbnQucG9pbnRbY2hhcnRUeXBlXSAtIHRhbmdlbnRQb2ludFByZS5wb2ludFtjaGFydFR5cGVdKSAvXG4gICAgICAgICAgICAgICAgKHRhbmdlbnRQb2ludC5wb2ludC50aW1lIC0gdGFuZ2VudFBvaW50UHJlLnBvaW50LnRpbWUpO1xuXG4gICAgZmlsbFRleHQoJ2R5L2R4OiAnICsgbm90YXRpb24ocmVhbEspLCBbc2l6ZS53aWR0aCAvIDIsIDBdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJ2JvbGQgMTJweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBkcmF3SG92ZXIoKSB7XG4gICAgaWYgKCF0YW5nZW50UG9pbnQpIHJldHVybjtcblxuICAgIGRyYXdUYW5nZW50TGluZSgpO1xuXG4gICAgbGV0IGNvb3JkID0gdGFuZ2VudFBvaW50LmNvb3JkLFxuICAgICAgICBwb2ludCA9IHRhbmdlbnRQb2ludC5wb2ludDtcblxuICAgIGxldCBjb29yZFN0eWxlID0ge1xuICAgICAgICBkYXNoZWQ6IFs4LCA0XSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAncmdiKDY0LCAxNjUsIDI1NSknXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZHJhd0xpbmUoWzAsIGNvb3JkWzFdXSwgW3NpemUud2lkdGgsIGNvb3JkWzFdXSwgY29vcmRTdHlsZSk7XG4gICAgZHJhd0xpbmUoW2Nvb3JkWzBdLCAwXSwgW2Nvb3JkWzBdLCBzaXplLmhlaWdodF0sIGNvb3JkU3R5bGUpO1xuXG4gICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShwb2ludC50aW1lICsgcG9pbnQucmVkdWNlKTtcblxuICAgIGxldCBwb2ludEluZm8gPSBbXG4gICAgICAgICcoJyxcbiAgICAgICAgZGF0ZS5nZXRNaW51dGVzKCksXG4gICAgICAgICc6JyxcbiAgICAgICAgZGF0ZS5nZXRTZWNvbmRzKCksXG4gICAgICAgICcuJyxcbiAgICAgICAgZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSxcbiAgICAgICAgJywgJyxcbiAgICAgICAgbm90YXRpb24ocG9pbnRbY2hhcnRUeXBlXSksXG4gICAgICAgICcpJ1xuICAgIF0uam9pbignJyk7XG5cbiAgICBmaWxsVGV4dChwb2ludEluZm8sIGNvb3JkLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjMDAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICdib2xkIDEycHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghc2hvdWxkVXBkYXRlKSByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuXG4gICAgZmlsbFRleHQoY2hhcnRUeXBlLnRvVXBwZXJDYXNlKCksIFswLCBzaXplLmhlaWdodF0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnLFxuICAgICAgICAgICAgZm9udDogJ2JvbGQgMTRweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkcmF3TWFpbigpO1xuICAgIGRyYXdIb3ZlcigpO1xuXG4gICAgaWYgKGhvdmVyTG9ja2VkKSB7XG4gICAgICAgIGZpbGxUZXh0KCdMT0NLRUQnLCBbc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHRdLCB7XG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnLFxuICAgICAgICAgICAgICAgIGZvbnQ6ICdib2xkIDE0cHggc2Fucy1zZXJpZidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59O1xuXG5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxubGV0IGxhc3RUaW1lID0gRGF0ZS5ub3coKSxcbiAgICBsYXN0T2Zmc2V0ID0gMCxcbiAgICByZWR1Y2VBbW91bnQgPSAwO1xuXG5zY3JvbGxiYXIuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICAgIGxldCBjdXJyZW50ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgb2Zmc2V0ID0gc2Nyb2xsYmFyLm9mZnNldC55LFxuICAgICAgICBkdXJhdGlvbiA9IGN1cnJlbnQgLSBsYXN0VGltZTtcblxuICAgIGlmICghZHVyYXRpb24gfHwgb2Zmc2V0ID09PSBsYXN0T2Zmc2V0KSByZXR1cm47XG5cbiAgICBpZiAoZHVyYXRpb24gPiA1MCkge1xuICAgICAgICByZWR1Y2VBbW91bnQgKz0gKGR1cmF0aW9uIC0gMSk7XG4gICAgICAgIGR1cmF0aW9uIC09IChkdXJhdGlvbiAtIDEpO1xuICAgIH1cblxuICAgIGxldCB2ZWxvY2l0eSA9IChvZmZzZXQgLSBsYXN0T2Zmc2V0KSAvIGR1cmF0aW9uO1xuICAgIGxhc3RUaW1lID0gY3VycmVudDtcbiAgICBsYXN0T2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgcmVjb3Jkcy5wdXNoKHtcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICB0aW1lOiBjdXJyZW50IC0gcmVkdWNlQW1vdW50LFxuICAgICAgICByZWR1Y2U6IHJlZHVjZUFtb3VudCxcbiAgICAgICAgc3BlZWQ6IE1hdGguYWJzKHZlbG9jaXR5KVxuICAgIH0pO1xuXG4gICAgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcbn0pO1xuXG5mdW5jdGlvbiBnZXRQb2ludGVyKGUpIHtcbiAgICByZXR1cm4gZS50b3VjaGVzID8gZS50b3VjaGVzW2UudG91Y2hlcy5sZW5ndGggLSAxXSA6IGU7XG59O1xuXG4vLyByYW5nZVxubGV0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R1cmF0aW9uJyk7XG5sZXQgbGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHVyYXRpb24tdmFsdWUnKTtcbmlucHV0Lm1heCA9IFRJTUVfUkFOR0VfTUFYIC8gMWUzO1xuaW5wdXQubWluID0gMTtcbmlucHV0LnZhbHVlID0gdGltZVJhbmdlIC8gMWUzO1xubGFiZWwudGV4dENvbnRlbnQgPSBpbnB1dC52YWx1ZSArICdzJztcblxuYWRkRXZlbnQoaW5wdXQsICdpbnB1dCcsIChlKSA9PiB7XG4gICAgbGV0IHN0YXJ0ID0gcmVjb3Jkc1swXTtcbiAgICBsZXQgZW5kID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCB2YWwgPSBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKTtcbiAgICBsYWJlbC50ZXh0Q29udGVudCA9IHZhbCArICdzJztcbiAgICB0aW1lUmFuZ2UgPSB2YWwgKiAxZTM7XG5cbiAgICBpZiAoZW5kKSB7XG4gICAgICAgIGVuZE9mZnNldCA9IE1hdGgubWluKGVuZE9mZnNldCwgTWF0aC5tYXgoMCwgMSAtIHRpbWVSYW5nZSAvIChlbmQudGltZSAtIHN0YXJ0LnRpbWUpKSk7XG4gICAgfVxufSk7XG5cbmFkZEV2ZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpLCAnY2xpY2snLCAoKSA9PiB7XG4gICAgcmVjb3Jkcy5sZW5ndGggPSBlbmRPZmZzZXQgPSByZWR1Y2VBbW91bnQgPSAwO1xuICAgIGhvdmVyTG9ja2VkID0gZmFsc2U7XG4gICAgaG92ZXJQb2ludGVyWCA9IHVuZGVmaW5lZDtcbiAgICB0YW5nZW50UG9pbnQgPSBudWxsO1xuICAgIHRhbmdlbnRQb2ludFByZSA9IG51bGw7XG4gICAgc2xpY2VSZWNvcmQoKTtcbn0pO1xuXG4vLyBob3ZlclxuYWRkRXZlbnQoY2FudmFzLCAnbW91c2Vtb3ZlIHRvdWNobW92ZScsIChlKSA9PiB7XG4gICAgaWYgKGhvdmVyTG9ja2VkIHx8IHBvaW50ZXJEb3duT25UcmFjaykgcmV0dXJuO1xuXG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuXG4gICAgaG92ZXJQb2ludGVyWCA9IHBvaW50ZXIuY2xpZW50WCAtIGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xufSk7XG5cbmZ1bmN0aW9uIHJlc2V0SG92ZXIoKSB7XG4gICAgaG92ZXJQb2ludGVyWCA9IDA7XG4gICAgdGFuZ2VudFBvaW50ID0gbnVsbDtcbiAgICB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xufTtcblxuYWRkRXZlbnQoW2NhbnZhcywgd2luZG93XSwgJ21vdXNlbGVhdmUgdG91Y2hlbmQnLCAoKSA9PiB7XG4gICAgaWYgKGhvdmVyTG9ja2VkKSByZXR1cm47XG4gICAgcmVzZXRIb3ZlcigpO1xufSk7XG5cbmFkZEV2ZW50KGNhbnZhcywgJ2NsaWNrJywgKCkgPT4ge1xuICAgIGhvdmVyTG9ja2VkID0gIWhvdmVyTG9ja2VkO1xuXG4gICAgaWYgKCFob3ZlckxvY2tlZCkgcmVzZXRIb3ZlcigpO1xufSk7XG5cbi8vIHRyYWNrXG5hZGRFdmVudCh0aHVtYiwgJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgKGUpID0+IHtcbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG4gICAgcG9pbnRlckRvd25PblRyYWNrID0gcG9pbnRlci5jbGllbnRYO1xufSk7XG5cbmFkZEV2ZW50KHdpbmRvdywgJ21vdXNlbW92ZSB0b3VjaG1vdmUnLCAoZSkgPT4ge1xuICAgIGlmICghcG9pbnRlckRvd25PblRyYWNrKSByZXR1cm47XG5cbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG4gICAgbGV0IG1vdmVkID0gKHBvaW50ZXIuY2xpZW50WCAtIHBvaW50ZXJEb3duT25UcmFjaykgLyBzaXplLndpZHRoO1xuXG4gICAgcG9pbnRlckRvd25PblRyYWNrID0gcG9pbnRlci5jbGllbnRYO1xuICAgIGVuZE9mZnNldCA9IE1hdGgubWluKDEgLSB0aHVtYldpZHRoLCBNYXRoLm1heCgwLCBlbmRPZmZzZXQgLSBtb3ZlZCkpO1xufSk7XG5cbmFkZEV2ZW50KHdpbmRvdywgJ21vdXNldXAgdG91Y2hlbmQgYmx1cicsICgpID0+IHtcbiAgICBwb2ludGVyRG93bk9uVHJhY2sgPSB1bmRlZmluZWQ7XG59KTtcblxuYWRkRXZlbnQodGh1bWIsICdjbGljayB0b3VjaHN0YXJ0JywgKGUpID0+IHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xufSk7XG5cbmFkZEV2ZW50KHRyYWNrLCAnY2xpY2sgdG91Y2hzdGFydCcsIChlKSA9PiB7XG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuICAgIGxldCByZWN0ID0gdHJhY2suZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGV0IG9mZnNldCA9IChwb2ludGVyLmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aDtcbiAgICBlbmRPZmZzZXQgPSBNYXRoLm1pbigxIC0gdGh1bWJXaWR0aCwgTWF0aC5tYXgoMCwgMSAtIChvZmZzZXQgKyB0aHVtYldpZHRoIC8gMikpKTtcbn0pO1xuXG4vLyBzd2l0Y2ggY2hhcnRcbmFkZEV2ZW50KFxuICAgIFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoYXJ0LXR5cGUnKSksXG4gICAgJ2NoYW5nZScsXG4gICAgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgICAgaWYgKHRhcmdldC5jaGVja2VkKSB7XG4gICAgICAgICAgICBjaGFydFR5cGUgPSB0YXJnZXQudmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L3NjcmlwdHMvbW9uaXRvci5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5c1wiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3Qva2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5rZXlzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmtleXM7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2tleXMnLCBmdW5jdGlvbigka2V5cyl7XG4gIHJldHVybiBmdW5jdGlvbiBrZXlzKGl0KXtcbiAgICByZXR1cm4gJGtleXModG9PYmplY3QoaXQpKTtcbiAgfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Qua2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgZmFpbHMgICA9IHJlcXVpcmUoJy4vJC5mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVksIGV4ZWMpe1xuICB2YXIgZm4gID0gKGNvcmUuT2JqZWN0IHx8IHt9KVtLRVldIHx8IE9iamVjdFtLRVldXG4gICAgLCBleHAgPSB7fTtcbiAgZXhwW0tFWV0gPSBleGVjKGZuKTtcbiAgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiBmYWlscyhmdW5jdGlvbigpeyBmbigxKTsgfSksICdPYmplY3QnLCBleHApO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1zYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgY29yZSAgICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsIGN0eCAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCBJU19XUkFQICAgPSB0eXBlICYgJGV4cG9ydC5XXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgdGFyZ2V0ICAgID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXVxuICAgICwga2V5LCBvd24sIG91dDtcbiAgaWYoSVNfR0xPQkFMKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiBrZXkgaW4gdGFyZ2V0O1xuICAgIGlmKG93biAmJiBrZXkgaW4gZXhwb3J0cyljb250aW51ZTtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IG93biA/IHRhcmdldFtrZXldIDogc291cmNlW2tleV07XG4gICAgLy8gcHJldmVudCBnbG9iYWwgcG9sbHV0aW9uIGZvciBuYW1lc3BhY2VzXG4gICAgZXhwb3J0c1trZXldID0gSVNfR0xPQkFMICYmIHR5cGVvZiB0YXJnZXRba2V5XSAhPSAnZnVuY3Rpb24nID8gc291cmNlW2tleV1cbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIDogSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpXG4gICAgLy8gd3JhcCBnbG9iYWwgY29uc3RydWN0b3JzIGZvciBwcmV2ZW50IGNoYW5nZSB0aGVtIGluIGxpYnJhcnlcbiAgICA6IElTX1dSQVAgJiYgdGFyZ2V0W2tleV0gPT0gb3V0ID8gKGZ1bmN0aW9uKEMpe1xuICAgICAgdmFyIEYgPSBmdW5jdGlvbihwYXJhbSl7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQyA/IG5ldyBDKHBhcmFtKSA6IEMocGFyYW0pO1xuICAgICAgfTtcbiAgICAgIEZbUFJPVE9UWVBFXSA9IENbUFJPVE9UWVBFXTtcbiAgICAgIHJldHVybiBGO1xuICAgIC8vIG1ha2Ugc3RhdGljIHZlcnNpb25zIGZvciBwcm90b3R5cGUgbWV0aG9kc1xuICAgIH0pKG91dCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICBpZihJU19QUk9UTykoZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSkpW2tleV0gPSBvdXQ7XG4gIH1cbn07XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7IC8vIHdyYXBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qc1xuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qc1xuICoqIG1vZHVsZSBpZCA9IDEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcxLjIuNid9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY3R4LmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYS1mdW5jdGlvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZhaWxzLmpzXG4gKiogbW9kdWxlIGlkID0gMTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZWxlY3RvcnMsIHNiTGlzdCB9IGZyb20gJy4vc2hhcmVkJztcblxuaW1wb3J0ICcuL2FwaXMvJztcbmltcG9ydCAnLi9yZW5kZXIvJztcbmltcG9ydCAnLi9ldmVudHMvJztcbmltcG9ydCAnLi9pbnRlcm5hbHMvJztcblxuZXhwb3J0IGRlZmF1bHQgU21vb3RoU2Nyb2xsYmFyO1xuXG5TbW9vdGhTY3JvbGxiYXIudmVyc2lvbiA9ICc8JT0gdmVyc2lvbiAlPic7XG5cbi8qKlxuICogaW5pdCBzY3JvbGxiYXIgb24gZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbTogdGFyZ2V0IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zOiBzY3JvbGxiYXIgb3B0aW9uc1xuICpcbiAqIEByZXR1cm4ge1Njcm9sbGJhcn0gc2Nyb2xsYmFyIGluc3RhbmNlXG4gKi9cblNtb290aFNjcm9sbGJhci5pbml0ID0gKGVsZW0sIG9wdGlvbnMpID0+IHtcbiAgICBpZiAoIWVsZW0gfHwgZWxlbS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3QgZWxlbWVudCB0byBiZSBET00gRWxlbWVudCwgYnV0IGdvdCAke3R5cGVvZiBlbGVtfWApO1xuICAgIH1cblxuICAgIGlmIChzYkxpc3QuaGFzKGVsZW0pKSByZXR1cm4gc2JMaXN0LmdldChlbGVtKTtcblxuICAgIGVsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXNjcm9sbGJhcicsICcnKTtcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gWy4uLmVsZW0uY2hpbGRyZW5dO1xuXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICBkaXYuaW5uZXJIVE1MID0gYFxuICAgICAgICA8YXJ0aWNsZSBjbGFzcz1cInNjcm9sbC1jb250ZW50XCI+PC9hcnRpY2xlPlxuICAgICAgICA8YXNpZGUgY2xhc3M9XCJzY3JvbGxiYXItdHJhY2sgc2Nyb2xsYmFyLXRyYWNrLXhcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzY3JvbGxiYXItdGh1bWIgc2Nyb2xsYmFyLXRodW1iLXhcIj48L2Rpdj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICAgICAgPGFzaWRlIGNsYXNzPVwic2Nyb2xsYmFyLXRyYWNrIHNjcm9sbGJhci10cmFjay15XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsYmFyLXRodW1iIHNjcm9sbGJhci10aHVtYi15XCI+PC9kaXY+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgYDtcblxuICAgIGNvbnN0IHNjcm9sbENvbnRlbnQgPSBkaXYucXVlcnlTZWxlY3RvcignLnNjcm9sbC1jb250ZW50Jyk7XG5cbiAgICBbLi4uZGl2LmNoaWxkcmVuXS5mb3JFYWNoKChlbCkgPT4gZWxlbS5hcHBlbmRDaGlsZChlbCkpO1xuXG4gICAgY2hpbGRyZW4uZm9yRWFjaCgoZWwpID0+IHNjcm9sbENvbnRlbnQuYXBwZW5kQ2hpbGQoZWwpKTtcblxuICAgIHJldHVybiBuZXcgU21vb3RoU2Nyb2xsYmFyKGVsZW0sIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBpbml0IHNjcm9sbGJhcnMgb24gcHJlLWRlZmluZWQgc2VsZWN0b3JzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnM6IHNjcm9sbGJhciBvcHRpb25zXG4gKlxuICogQHJldHVybiB7QXJyYXl9IGEgY29sbGVjdGlvbiBvZiBzY3JvbGxiYXIgaW5zdGFuY2VzXG4gKi9cblNtb290aFNjcm9sbGJhci5pbml0QWxsID0gKG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKV0ubWFwKChlbCkgPT4ge1xuICAgICAgICByZXR1cm4gU21vb3RoU2Nyb2xsYmFyLmluaXQoZWwsIG9wdGlvbnMpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBjaGVjayBpZiBzY3JvbGxiYXIgZXhpc3RzIG9uIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5TbW9vdGhTY3JvbGxiYXIuaGFzID0gKGVsZW0pID0+IHtcbiAgICByZXR1cm4gc2JMaXN0LmhhcyhlbGVtKTtcbn07XG5cbi8qKlxuICogZ2V0IHNjcm9sbGJhciBpbnN0YW5jZSB0aHJvdWdoIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBzY3JvbGxiYXIgY29udGFpbmVyXG4gKlxuICogQHJldHVybiB7U2Nyb2xsYmFyfVxuICovXG5TbW9vdGhTY3JvbGxiYXIuZ2V0ID0gKGVsZW0pID0+IHtcbiAgICByZXR1cm4gc2JMaXN0LmdldChlbGVtKTtcbn07XG5cbi8qKlxuICogZ2V0IGFsbCBzY3JvbGxiYXIgaW5zdGFuY2VzXG4gKlxuICogQHJldHVybiB7QXJyYXl9IGEgY29sbGVjdGlvbiBvZiBzY3JvbGxiYXJzXG4gKi9cblNtb290aFNjcm9sbGJhci5nZXRBbGwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFsuLi5zYkxpc3QudmFsdWVzKCldO1xufTtcblxuLyoqXG4gKiBkZXN0cm95IHNjcm9sbGJhciBvbiBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtOiB0YXJnZXQgc2Nyb2xsYmFyIGNvbnRhaW5lclxuICovXG5TbW9vdGhTY3JvbGxiYXIuZGVzdHJveSA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIFNtb290aFNjcm9sbGJhci5oYXMoZWxlbSkgJiYgU21vb3RoU2Nyb2xsYmFyLmdldChlbGVtKS5kZXN0cm95KCk7XG59O1xuXG4vKipcbiAqIGRlc3Ryb3kgYWxsIHNjcm9sbGJhcnMgaW4gc2Nyb2xsYmFyIGluc3RhbmNlc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuZGVzdHJveUFsbCA9ICgpID0+IHtcbiAgICBzYkxpc3QuZm9yRWFjaCgoc2IpID0+IHtcbiAgICAgICAgc2IuZGVzdHJveSgpO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX0FycmF5JGZyb20gPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2FycmF5L2Zyb21cIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycjJbaV0gPSBhcnJbaV07XG5cbiAgICByZXR1cm4gYXJyMjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gX0FycmF5JGZyb20oYXJyKTtcbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvdG8tY29uc3VtYWJsZS1hcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDE2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tLmpzXG4gKiogbW9kdWxlIGlkID0gMTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLkFycmF5LmZyb207XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb20uanNcbiAqKiBtb2R1bGUgaWQgPSAxOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwgaW5kZXggPSB0aGlzLl9pXG4gICAgLCBwb2ludDtcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHt2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlfTtcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xuICB0aGlzLl9pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHt2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSAxOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmluZy1hdC5qc1xuICoqIG1vZHVsZSBpZCA9IDIwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pbnRlZ2VyLmpzXG4gKiogbW9kdWxlIGlkID0gMjFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBMSUJSQVJZICAgICAgICA9IHJlcXVpcmUoJy4vJC5saWJyYXJ5JylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lJylcbiAgLCBoaWRlICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIEl0ZXJhdG9ycyAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgJGl0ZXJDcmVhdGUgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jcmVhdGUnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi8kLnNldC10by1zdHJpbmctdGFnJylcbiAgLCBnZXRQcm90byAgICAgICA9IHJlcXVpcmUoJy4vJCcpLmdldFByb3RvXG4gICwgSVRFUkFUT1IgICAgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBCVUdHWSAgICAgICAgICA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKSAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gICwgRkZfSVRFUkFUT1IgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKXtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgaWYoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHICAgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTXG4gICAgLCBWQUxVRVNfQlVHID0gZmFsc2VcbiAgICAsIHByb3RvICAgICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgJG5hdGl2ZSAgICA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgJGRlZmF1bHQgICA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpXG4gICAgLCBtZXRob2RzLCBrZXk7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoJG5hdGl2ZSl7XG4gICAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8oJGRlZmF1bHQuY2FsbChuZXcgQmFzZSkpO1xuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAvLyBGRiBmaXhcbiAgICBpZighTElCUkFSWSAmJiBoYXMocHJvdG8sIEZGX0lURVJBVE9SKSloaWRlKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICAgIGlmKERFRl9WQUxVRVMgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpe1xuICAgICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgICAkZGVmYXVsdCA9IGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gJG5hdGl2ZS5jYWxsKHRoaXMpOyB9O1xuICAgIH1cbiAgfVxuICAvLyBEZWZpbmUgaXRlcmF0b3JcbiAgaWYoKCFMSUJSQVJZIHx8IEZPUkNFRCkgJiYgKEJVR0dZIHx8IFZBTFVFU19CVUcgfHwgIXByb3RvW0lURVJBVE9SXSkpe1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gID0gcmV0dXJuVGhpcztcbiAgaWYoREVGQVVMVCl7XG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIHZhbHVlczogIERFRl9WQUxVRVMgID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAhREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKCdlbnRyaWVzJylcbiAgICB9O1xuICAgIGlmKEZPUkNFRClmb3Ioa2V5IGluIG1ldGhvZHMpe1xuICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKXJlZGVmaW5lKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XG4gICAgfSBlbHNlICRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5GICogKEJVR0dZIHx8IFZBTFVFU19CVUcpLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxuICByZXR1cm4gbWV0aG9kcztcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWRlZmluZS5qc1xuICoqIG1vZHVsZSBpZCA9IDIyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5saWJyYXJ5LmpzXG4gKiogbW9kdWxlIGlkID0gMjNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmhpZGUnKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzXG4gKiogbW9kdWxlIGlkID0gMjRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmRlc2NyaXB0b3JzJykgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICByZXR1cm4gJC5zZXREZXNjKG9iamVjdCwga2V5LCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oaWRlLmpzXG4gKiogbW9kdWxlIGlkID0gMjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkT2JqZWN0ID0gT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogICAgICRPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICAkT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBpc0VudW06ICAgICB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxcbiAgZ2V0RGVzYzogICAgJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgICRPYmplY3QuZGVmaW5lUHJvcGVydHksXG4gIHNldERlc2NzOiAgICRPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgJE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXG4gIGdldFN5bWJvbHM6ICRPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBlYWNoOiAgICAgICBbXS5mb3JFYWNoXG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuanNcbiAqKiBtb2R1bGUgaWQgPSAyNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qc1xuICoqIG1vZHVsZSBpZCA9IDI3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuLyQuZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZXNjcmlwdG9ycy5qc1xuICoqIG1vZHVsZSBpZCA9IDI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhhcy5qc1xuICoqIG1vZHVsZSBpZCA9IDI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzXG4gKiogbW9kdWxlIGlkID0gMzBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuLyQucHJvcGVydHktZGVzYycpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCl7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNyZWF0ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDMxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi8kJykuc2V0RGVzY1xuICAsIGhhcyA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNldC10by1zdHJpbmctdGFnLmpzXG4gKiogbW9kdWxlIGlkID0gMzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBzdG9yZSAgPSByZXF1aXJlKCcuLyQuc2hhcmVkJykoJ3drcycpXG4gICwgdWlkICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpXG4gICwgU3ltYm9sID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLlN5bWJvbDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFN5bWJvbCAmJiBTeW1ib2xbbmFtZV0gfHwgKFN5bWJvbCB8fCB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC53a3MuanNcbiAqKiBtb2R1bGUgaWQgPSAzM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zaGFyZWQuanNcbiAqKiBtb2R1bGUgaWQgPSAzNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC51aWQuanNcbiAqKiBtb2R1bGUgaWQgPSAzNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgJGV4cG9ydCAgICAgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCB0b09iamVjdCAgICA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuLyQuaXMtYXJyYXktaXRlcicpXG4gICwgdG9MZW5ndGggICAgPSByZXF1aXJlKCcuLyQudG8tbGVuZ3RoJylcbiAgLCBnZXRJdGVyRm4gICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgQXJyYXkuZnJvbShpdGVyKTsgfSksICdBcnJheScsIHtcbiAgLy8gMjIuMS4yLjEgQXJyYXkuZnJvbShhcnJheUxpa2UsIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICBmcm9tOiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcbiAgICB2YXIgTyAgICAgICA9IHRvT2JqZWN0KGFycmF5TGlrZSlcbiAgICAgICwgQyAgICAgICA9IHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXlcbiAgICAgICwgJCQgICAgICA9IGFyZ3VtZW50c1xuICAgICAgLCAkJGxlbiAgID0gJCQubGVuZ3RoXG4gICAgICAsIG1hcGZuICAgPSAkJGxlbiA+IDEgPyAkJFsxXSA6IHVuZGVmaW5lZFxuICAgICAgLCBtYXBwaW5nID0gbWFwZm4gIT09IHVuZGVmaW5lZFxuICAgICAgLCBpbmRleCAgID0gMFxuICAgICAgLCBpdGVyRm4gID0gZ2V0SXRlckZuKE8pXG4gICAgICAsIGxlbmd0aCwgcmVzdWx0LCBzdGVwLCBpdGVyYXRvcjtcbiAgICBpZihtYXBwaW5nKW1hcGZuID0gY3R4KG1hcGZuLCAkJGxlbiA+IDIgPyAkJFsyXSA6IHVuZGVmaW5lZCwgMik7XG4gICAgLy8gaWYgb2JqZWN0IGlzbid0IGl0ZXJhYmxlIG9yIGl0J3MgYXJyYXkgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yIC0gdXNlIHNpbXBsZSBjYXNlXG4gICAgaWYoaXRlckZuICE9IHVuZGVmaW5lZCAmJiAhKEMgPT0gQXJyYXkgJiYgaXNBcnJheUl0ZXIoaXRlckZuKSkpe1xuICAgICAgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoTyksIHJlc3VsdCA9IG5ldyBDOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IGNhbGwoaXRlcmF0b3IsIG1hcGZuLCBbc3RlcC52YWx1ZSwgaW5kZXhdLCB0cnVlKSA6IHN0ZXAudmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICAgIGZvcihyZXN1bHQgPSBuZXcgQyhsZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gbWFwZm4oT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQubGVuZ3RoID0gaW5kZXg7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDM2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2goZSl7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZihyZXQgIT09IHVuZGVmaW5lZClhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNhbGwuanNcbiAqKiBtb2R1bGUgaWQgPSAzN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYW4tb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gMzhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDM5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIElURVJBVE9SICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b1tJVEVSQVRPUl0gPT09IGl0KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1hcnJheS1pdGVyLmpzXG4gKiogbW9kdWxlIGlkID0gNDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWxlbmd0aC5qc1xuICoqIG1vZHVsZSBpZCA9IDQxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgIT0gdW5kZWZpbmVkKXJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzXG4gKiogbW9kdWxlIGlkID0gNDJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgVEFHID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXG4gIC8vIEVTMyB3cm9uZyBoZXJlXG4gICwgQVJHID0gY29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1RBR10pID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNsYXNzb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvZi5qc1xuICoqIG1vZHVsZSBpZCA9IDQ0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgSVRFUkFUT1IgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtJVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYywgc2tpcENsb3Npbmcpe1xuICBpZighc2tpcENsb3NpbmcgJiYgIVNBRkVfQ0xPU0lORylyZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciAgPSBbN11cbiAgICAgICwgaXRlciA9IGFycltJVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyBzYWZlID0gdHJ1ZTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7Q2xhc3N9IFNtb290aFNjcm9sbGJhclxuICovXG5cbmltcG9ydCB7IHNiTGlzdCB9IGZyb20gJy4vc2hhcmVkLyc7XG5pbXBvcnQge1xuICAgIGRlYm91bmNlLFxuICAgIGZpbmRDaGlsZCxcbiAgICBzZXRTdHlsZVxufSBmcm9tICcuL3V0aWxzLyc7XG5cbi8qKlxuICogQGNvbnN0cnVjdG9yXG4gKiBDcmVhdGUgc2Nyb2xsYmFyIGluc3RhbmNlXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXI6IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdOiBvcHRpb25zXG4gKi9cbmV4cG9ydCBjbGFzcyBTbW9vdGhTY3JvbGxiYXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbnRhaW5lciwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIC8vIG1ha2UgY29udGFpbmVyIGZvY3VzYWJsZVxuICAgICAgICBjb250YWluZXIuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcxJyk7XG5cbiAgICAgICAgLy8gcmVzZXQgc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsTGVmdCA9IDA7XG5cbiAgICAgICAgc2V0U3R5bGUoY29udGFpbmVyLCB7XG4gICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICBvdXRsaW5lOiAnbm9uZSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdHJhY2tYID0gZmluZENoaWxkKGNvbnRhaW5lciwgJ3Njcm9sbGJhci10cmFjay14Jyk7XG4gICAgICAgIGNvbnN0IHRyYWNrWSA9IGZpbmRDaGlsZChjb250YWluZXIsICdzY3JvbGxiYXItdHJhY2steScpO1xuXG4gICAgICAgIC8vIHJlYWRvbmx5IHByb3BlcnRpZXNcbiAgICAgICAgdGhpcy5fX3JlYWRvbmx5KCd0YXJnZXRzJywgT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICBjb250YWluZXIsXG4gICAgICAgICAgICBjb250ZW50OiBmaW5kQ2hpbGQoY29udGFpbmVyLCAnc2Nyb2xsLWNvbnRlbnQnKSxcbiAgICAgICAgICAgIHhBeGlzOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgICAgICB0cmFjazogdHJhY2tYLFxuICAgICAgICAgICAgICAgIHRodW1iOiBmaW5kQ2hpbGQodHJhY2tYLCAnc2Nyb2xsYmFyLXRodW1iLXgnKVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICB5QXhpczogT2JqZWN0LmZyZWV6ZSh7XG4gICAgICAgICAgICAgICAgdHJhY2s6IHRyYWNrWSxcbiAgICAgICAgICAgICAgICB0aHVtYjogZmluZENoaWxkKHRyYWNrWSwgJ3Njcm9sbGJhci10aHVtYi15JylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pKVxuICAgICAgICAuX19yZWFkb25seSgnb2Zmc2V0Jywge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDBcbiAgICAgICAgfSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ2xpbWl0Jywge1xuICAgICAgICAgICAgeDogSW5maW5pdHksXG4gICAgICAgICAgICB5OiBJbmZpbml0eVxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnbW92ZW1lbnQnLCB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgndGh1bWJTaXplJywge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICByZWFsWDogMCxcbiAgICAgICAgICAgIHJlYWxZOiAwXG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdib3VuZGluZycsIHtcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgbGVmdDogMFxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnY2hpbGRyZW4nLCBbXSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ3BhcmVudHMnLCBbXSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ3NpemUnLCB0aGlzLmdldFNpemUoKSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ2lzTmVzdGVkU2Nyb2xsYmFyJywgZmFsc2UpO1xuXG4gICAgICAgIC8vIG5vbi1lbm11cmFibGUgcHJvcGVydGllc1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICAgICBfX3VwZGF0ZVRocm90dGxlOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGRlYm91bmNlKDo6dGhpcy51cGRhdGUpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX19oaWRlVHJhY2tUaHJvdHRsZToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBkZWJvdW5jZSg6OnRoaXMuaGlkZVRyYWNrLCAzMDAsIGZhbHNlKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9fbGlzdGVuZXJzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX19oYW5kbGVyczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBbXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9fY2hpbGRyZW46IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogW11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX3RpbWVySUQ6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZToge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWNjZXNzb3JzXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDoge1xuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Lnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNjcm9sbExlZnQ6IHtcbiAgICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9mZnNldC54O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fX2luaXRPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9faW5pdFNjcm9sbGJhcigpO1xuXG4gICAgICAgIC8vIHN0b3JhZ2VcbiAgICAgICAgc2JMaXN0LnNldChjb250YWluZXIsIHRoaXMpO1xuICAgIH1cbn1cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanNcbiAqKiBtb2R1bGUgaWQgPSA0N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9mcmVlemVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDQ4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZnJlZXplJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmZyZWV6ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDQ5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuNSBPYmplY3QuZnJlZXplKE8pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2ZyZWV6ZScsIGZ1bmN0aW9uKCRmcmVlemUpe1xuICByZXR1cm4gZnVuY3Rpb24gZnJlZXplKGl0KXtcbiAgICByZXR1cm4gJGZyZWV6ZSAmJiBpc09iamVjdChpdCkgPyAkZnJlZXplKGl0KSA6IGl0O1xuICB9O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5mcmVlemUuanNcbiAqKiBtb2R1bGUgaWQgPSA1MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllc1wiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhULCBEKXtcbiAgcmV0dXJuICQuc2V0RGVzY3MoVCwgRCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9zYl9saXN0JztcbmV4cG9ydCAqIGZyb20gJy4vc2VsZWN0b3JzJztcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lc1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqLCBkZWZhdWx0cykge1xuICB2YXIga2V5cyA9IF9PYmplY3QkZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG5cbiAgICB2YXIgdmFsdWUgPSBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cywga2V5KTtcblxuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb25maWd1cmFibGUgJiYgb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgX09iamVjdCRkZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9kZWZhdWx0cy5qc1xuICoqIG1vZHVsZSBpZCA9IDU0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICByZXR1cm4gJC5nZXROYW1lcyhpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qc1xuICoqIG1vZHVsZSBpZCA9IDU2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxucmVxdWlyZSgnLi8kLm9iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlOYW1lcycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiByZXF1aXJlKCcuLyQuZ2V0LW5hbWVzJykuZ2V0O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpXG4gICwgZ2V0TmFtZXMgID0gcmVxdWlyZSgnLi8kJykuZ2V0TmFtZXNcbiAgLCB0b1N0cmluZyAgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24oaXQpe1xuICB0cnkge1xuICAgIHJldHVybiBnZXROYW1lcyhpdCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICBpZih3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJylyZXR1cm4gZ2V0V2luZG93TmFtZXMoaXQpO1xuICByZXR1cm4gZ2V0TmFtZXModG9JT2JqZWN0KGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2V0LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWlvYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA1OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuLyQuY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDYwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gNjFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgcmV0dXJuICQuZ2V0RGVzYyhpdCwga2V5KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ipe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDYzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzXG4gKiogbW9kdWxlIGlkID0gNjRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2Mpe1xuICByZXR1cm4gJC5zZXREZXNjKGl0LCBrZXksIGRlc2MpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDY1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqLCBkZWZhdWx0cykge1xuICB2YXIgbmV3T2JqID0gZGVmYXVsdHMoe30sIG9iaik7XG4gIGRlbGV0ZSBuZXdPYmpbXCJkZWZhdWx0XCJdO1xuICByZXR1cm4gbmV3T2JqO1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1leHBvcnQtd2lsZGNhcmQuanNcbiAqKiBtb2R1bGUgaWQgPSA2NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtNYXB9IHNiTGlzdFxuICovXG5cbmNvbnN0IHNiTGlzdCA9IG5ldyBNYXAoKTtcblxuY29uc3Qgb3JpZ2luU2V0ID0gOjpzYkxpc3Quc2V0O1xuY29uc3Qgb3JpZ2luRGVsZXRlID0gOjpzYkxpc3QuZGVsZXRlO1xuXG5zYkxpc3QudXBkYXRlID0gKCkgPT4ge1xuICAgIHNiTGlzdC5mb3JFYWNoKChzYikgPT4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgc2IuX191cGRhdGVUcmVlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLy8gcGF0Y2ggI3NldCwjZGVsZXRlIHdpdGggI3VwZGF0ZSBtZXRob2RcbnNiTGlzdC5kZWxldGUgPSAoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IHJlcyA9IG9yaWdpbkRlbGV0ZSguLi5hcmdzKTtcbiAgICBzYkxpc3QudXBkYXRlKCk7XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuc2JMaXN0LnNldCA9ICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgcmVzID0gb3JpZ2luU2V0KC4uLmFyZ3MpO1xuICAgIHNiTGlzdC51cGRhdGUoKTtcblxuICAgIHJldHVybiByZXM7XG59O1xuXG5leHBvcnQgeyBzYkxpc3QgfTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zaGFyZWQvc2JfbGlzdC5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9tYXBcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvbWFwLmpzXG4gKiogbW9kdWxlIGlkID0gNjhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5tYXAnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3Lm1hcC50by1qc29uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvJC5jb3JlJykuTWFwO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9mbi9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA2OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBJdGVyYXRvcnMuQXJyYXk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qc1xuICoqIG1vZHVsZSBpZCA9IDcxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgYWRkVG9VbnNjb3BhYmxlcyA9IHJlcXVpcmUoJy4vJC5hZGQtdG8tdW5zY29wYWJsZXMnKVxuICAsIHN0ZXAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1zdGVwJylcbiAgLCBJdGVyYXRvcnMgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgdG9JT2JqZWN0ICAgICAgICA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgdGhpcy5fdCA9IHRvSU9iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICB0aGlzLl9rID0ga2luZDsgICAgICAgICAgICAgICAgLy8ga2luZFxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBraW5kICA9IHRoaXMuX2tcbiAgICAsIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XG4gICAgdGhpcy5fdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3RlcCgxKTtcbiAgfVxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcbiAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuYWRkVG9VbnNjb3BhYmxlcygna2V5cycpO1xuYWRkVG9VbnNjb3BhYmxlcygndmFsdWVzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCdlbnRyaWVzJyk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gNzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXsgLyogZW1wdHkgKi8gfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFkZC10by11bnNjb3BhYmxlcy5qc1xuICoqIG1vZHVsZSBpZCA9IDczXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1zdGVwLmpzXG4gKiogbW9kdWxlIGlkID0gNzRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnTWFwJywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIE1hcCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTsgfTtcbn0sIHtcbiAgLy8gMjMuMS4zLjYgTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xuICAgIHZhciBlbnRyeSA9IHN0cm9uZy5nZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xuICB9LFxuICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCBrZXkgPT09IDAgPyAwIDoga2V5LCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZywgdHJ1ZSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm1hcC5qc1xuICoqIG1vZHVsZSBpZCA9IDc1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBoaWRlICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgcmVkZWZpbmVBbGwgID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lLWFsbCcpXG4gICwgY3R4ICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgc3RyaWN0TmV3ICAgID0gcmVxdWlyZSgnLi8kLnN0cmljdC1uZXcnKVxuICAsIGRlZmluZWQgICAgICA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJylcbiAgLCBmb3JPZiAgICAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCAkaXRlckRlZmluZSAgPSByZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKVxuICAsIHN0ZXAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLXN0ZXAnKVxuICAsIElEICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKSgnaWQnKVxuICAsICRoYXMgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIGlzT2JqZWN0ICAgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIHNldFNwZWNpZXMgICA9IHJlcXVpcmUoJy4vJC5zZXQtc3BlY2llcycpXG4gICwgREVTQ1JJUFRPUlMgID0gcmVxdWlyZSgnLi8kLmRlc2NyaXB0b3JzJylcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgU0laRSAgICAgICAgID0gREVTQ1JJUFRPUlMgPyAnX3MnIDogJ3NpemUnXG4gICwgaWQgICAgICAgICAgID0gMDtcblxudmFyIGZhc3RLZXkgPSBmdW5jdGlvbihpdCwgY3JlYXRlKXtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZighaXNPYmplY3QoaXQpKXJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCcgPyBpdCA6ICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmKCEkaGFzKGl0LCBJRCkpe1xuICAgIC8vIGNhbid0IHNldCBpZCB0byBmcm96ZW4gb2JqZWN0XG4gICAgaWYoIWlzRXh0ZW5zaWJsZShpdCkpcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBpZFxuICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBvYmplY3QgaWRcbiAgICBoaWRlKGl0LCBJRCwgKytpZCk7XG4gIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcbiAgfSByZXR1cm4gJ08nICsgaXRbSURdO1xufTtcblxudmFyIGdldEVudHJ5ID0gZnVuY3Rpb24odGhhdCwga2V5KXtcbiAgLy8gZmFzdCBjYXNlXG4gIHZhciBpbmRleCA9IGZhc3RLZXkoa2V5KSwgZW50cnk7XG4gIGlmKGluZGV4ICE9PSAnRicpcmV0dXJuIHRoYXQuX2lbaW5kZXhdO1xuICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcbiAgZm9yKGVudHJ5ID0gdGhhdC5fZjsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgaWYoZW50cnkuayA9PSBrZXkpcmV0dXJuIGVudHJ5O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Q29uc3RydWN0b3I6IGZ1bmN0aW9uKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpe1xuICAgIHZhciBDID0gd3JhcHBlcihmdW5jdGlvbih0aGF0LCBpdGVyYWJsZSl7XG4gICAgICBzdHJpY3ROZXcodGhhdCwgQywgTkFNRSk7XG4gICAgICB0aGF0Ll9pID0gJC5jcmVhdGUobnVsbCk7IC8vIGluZGV4XG4gICAgICB0aGF0Ll9mID0gdW5kZWZpbmVkOyAgICAgIC8vIGZpcnN0IGVudHJ5XG4gICAgICB0aGF0Ll9sID0gdW5kZWZpbmVkOyAgICAgIC8vIGxhc3QgZW50cnlcbiAgICAgIHRoYXRbU0laRV0gPSAwOyAgICAgICAgICAgLy8gc2l6ZVxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpe1xuICAgICAgICBmb3IodmFyIHRoYXQgPSB0aGlzLCBkYXRhID0gdGhhdC5faSwgZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZihlbnRyeS5wKWVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5fZiA9IHRoYXQuX2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoYXRbU0laRV0gPSAwO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy4zIE1hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgICAsIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcbiAgICAgICAgaWYoZW50cnkpe1xuICAgICAgICAgIHZhciBuZXh0ID0gZW50cnkublxuICAgICAgICAgICAgLCBwcmV2ID0gZW50cnkucDtcbiAgICAgICAgICBkZWxldGUgdGhhdC5faVtlbnRyeS5pXTtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZihwcmV2KXByZXYubiA9IG5leHQ7XG4gICAgICAgICAgaWYobmV4dCluZXh0LnAgPSBwcmV2O1xuICAgICAgICAgIGlmKHRoYXQuX2YgPT0gZW50cnkpdGhhdC5fZiA9IG5leHQ7XG4gICAgICAgICAgaWYodGhhdC5fbCA9PSBlbnRyeSl0aGF0Ll9sID0gcHJldjtcbiAgICAgICAgICB0aGF0W1NJWkVdLS07XG4gICAgICAgIH0gcmV0dXJuICEhZW50cnk7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMi4zLjYgU2V0LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICAvLyAyMy4xLjMuNSBNYXAucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIGZvckVhY2g6IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkLCAzKVxuICAgICAgICAgICwgZW50cnk7XG4gICAgICAgIHdoaWxlKGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhpcy5fZil7XG4gICAgICAgICAgZihlbnRyeS52LCBlbnRyeS5rLCB0aGlzKTtcbiAgICAgICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy43IE1hcC5wcm90b3R5cGUuaGFzKGtleSlcbiAgICAgIC8vIDIzLjIuMy43IFNldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcbiAgICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZihERVNDUklQVE9SUykkLnNldERlc2MoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZGVmaW5lZCh0aGlzW1NJWkVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQztcbiAgfSxcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpXG4gICAgICAsIHByZXYsIGluZGV4O1xuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxuICAgIGlmKGVudHJ5KXtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQuX2wgPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0Ll9sLCAgICAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmKCF0aGF0Ll9mKXRoYXQuX2YgPSBlbnRyeTtcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XG4gICAgICB0aGF0W1NJWkVdKys7XG4gICAgICAvLyBhZGQgdG8gaW5kZXhcbiAgICAgIGlmKGluZGV4ICE9PSAnRicpdGhhdC5faVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIHNldFN0cm9uZzogZnVuY3Rpb24oQywgTkFNRSwgSVNfTUFQKXtcbiAgICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cbiAgICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXG4gICAgJGl0ZXJEZWZpbmUoQywgTkFNRSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICAgICAgdGhpcy5fdCA9IGl0ZXJhdGVkOyAgLy8gdGFyZ2V0XG4gICAgICB0aGlzLl9rID0ga2luZDsgICAgICAvLyBraW5kXG4gICAgICB0aGlzLl9sID0gdW5kZWZpbmVkOyAvLyBwcmV2aW91c1xuICAgIH0sIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICwga2luZCAgPSB0aGF0Ll9rXG4gICAgICAgICwgZW50cnkgPSB0aGF0Ll9sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XG4gICAgICBpZighdGhhdC5fdCB8fCAhKHRoYXQuX2wgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoYXQuX3QuX2YpKXtcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cbiAgICAgICAgdGhhdC5fdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XG4gICAgICB9XG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xuICAgICAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcblxuICAgIC8vIGFkZCBbQEBzcGVjaWVzXSwgMjMuMS4yLjIsIDIzLjIuMi4yXG4gICAgc2V0U3BlY2llcyhOQU1FKTtcbiAgfVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24tc3Ryb25nLmpzXG4gKiogbW9kdWxlIGlkID0gNzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XG4gIGZvcih2YXIga2V5IGluIHNyYylyZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLWFsbC5qc1xuICoqIG1vZHVsZSBpZCA9IDc3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XG4gIGlmKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpdGhyb3cgVHlwZUVycm9yKG5hbWUgKyBcIjogdXNlIHRoZSAnbmV3JyBvcGVyYXRvciFcIik7XG4gIHJldHVybiBpdDtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zdHJpY3QtbmV3LmpzXG4gKiogbW9kdWxlIGlkID0gNzhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuLyQuaXMtYXJyYXktaXRlcicpXG4gICwgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vJC50by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldEl0ZXJGbihpdGVyYWJsZSlcbiAgICAsIGYgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxuICAgICwgaW5kZXggID0gMFxuICAgICwgbGVuZ3RoLCBzdGVwLCBpdGVyYXRvcjtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYoaXNBcnJheUl0ZXIoaXRlckZuKSlmb3IobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgIGVudHJpZXMgPyBmKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKSA6IGYoaXRlcmFibGVbaW5kZXhdKTtcbiAgfSBlbHNlIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyApe1xuICAgIGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZm9yLW9mLmpzXG4gKiogbW9kdWxlIGlkID0gNzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIFNQRUNJRVMgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSBjb3JlW0tFWV07XG4gIGlmKERFU0NSSVBUT1JTICYmIEMgJiYgIUNbU1BFQ0lFU10pJC5zZXREZXNjKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtc3BlY2llcy5qc1xuICoqIG1vZHVsZSBpZCA9IDgwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGdsb2JhbCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCBmYWlscyAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5mYWlscycpXG4gICwgaGlkZSAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgcmVkZWZpbmVBbGwgICAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUtYWxsJylcbiAgLCBmb3JPZiAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHN0cmljdE5ldyAgICAgID0gcmVxdWlyZSgnLi8kLnN0cmljdC1uZXcnKVxuICAsIGlzT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIERFU0NSSVBUT1JTICAgID0gcmVxdWlyZSgnLi8kLmRlc2NyaXB0b3JzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSwgd3JhcHBlciwgbWV0aG9kcywgY29tbW9uLCBJU19NQVAsIElTX1dFQUspe1xuICB2YXIgQmFzZSAgPSBnbG9iYWxbTkFNRV1cbiAgICAsIEMgICAgID0gQmFzZVxuICAgICwgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnXG4gICAgLCBwcm90byA9IEMgJiYgQy5wcm90b3R5cGVcbiAgICAsIE8gICAgID0ge307XG4gIGlmKCFERVNDUklQVE9SUyB8fCB0eXBlb2YgQyAhPSAnZnVuY3Rpb24nIHx8ICEoSVNfV0VBSyB8fCBwcm90by5mb3JFYWNoICYmICFmYWlscyhmdW5jdGlvbigpe1xuICAgIG5ldyBDKCkuZW50cmllcygpLm5leHQoKTtcbiAgfSkpKXtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVkZWZpbmVBbGwoQy5wcm90b3R5cGUsIG1ldGhvZHMpO1xuICB9IGVsc2Uge1xuICAgIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRhcmdldCwgaXRlcmFibGUpe1xuICAgICAgc3RyaWN0TmV3KHRhcmdldCwgQywgTkFNRSk7XG4gICAgICB0YXJnZXQuX2MgPSBuZXcgQmFzZTtcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0YXJnZXRbQURERVJdLCB0YXJnZXQpO1xuICAgIH0pO1xuICAgICQuZWFjaC5jYWxsKCdhZGQsY2xlYXIsZGVsZXRlLGZvckVhY2gsZ2V0LGhhcyxzZXQsa2V5cyx2YWx1ZXMsZW50cmllcycuc3BsaXQoJywnKSxmdW5jdGlvbihLRVkpe1xuICAgICAgdmFyIElTX0FEREVSID0gS0VZID09ICdhZGQnIHx8IEtFWSA9PSAnc2V0JztcbiAgICAgIGlmKEtFWSBpbiBwcm90byAmJiAhKElTX1dFQUsgJiYgS0VZID09ICdjbGVhcicpKWhpZGUoQy5wcm90b3R5cGUsIEtFWSwgZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIGlmKCFJU19BRERFUiAmJiBJU19XRUFLICYmICFpc09iamVjdChhKSlyZXR1cm4gS0VZID09ICdnZXQnID8gdW5kZWZpbmVkIDogZmFsc2U7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9jW0tFWV0oYSA9PT0gMCA/IDAgOiBhLCBiKTtcbiAgICAgICAgcmV0dXJuIElTX0FEREVSID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmKCdzaXplJyBpbiBwcm90bykkLnNldERlc2MoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fYy5zaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GLCBPKTtcblxuICBpZighSVNfV0VBSyljb21tb24uc2V0U3Ryb25nKEMsIE5BTUUsIElTX01BUCk7XG5cbiAgcmV0dXJuIEM7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDgxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGV4cG9ydCAgPSByZXF1aXJlKCcuLyQuZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5QLCAnTWFwJywge3RvSlNPTjogcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdNYXAnKX0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDgyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgZm9yT2YgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIGNsYXNzb2YgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpe1xuICAgIGlmKGNsYXNzb2YodGhpcykgIT0gTkFNRSl0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBmb3JPZih0aGlzLCBmYWxzZSwgYXJyLnB1c2gsIGFycik7XG4gICAgcmV0dXJuIGFycjtcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXRvLWpzb24uanNcbiAqKiBtb2R1bGUgaWQgPSA4M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtTdHJpbmd9IHNlbGVjdG9yc1xuICovXG5cbmV4cG9ydCBjb25zdCBzZWxlY3RvcnMgPSAnc2Nyb2xsYmFyLCBbc2Nyb2xsYmFyXSwgW2RhdGEtc2Nyb2xsYmFyXSc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc2hhcmVkL3NlbGVjdG9ycy5qc1xuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vZGVib3VuY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9pc19vbmVfb2YnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfc3R5bGUnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfZGVsdGEnO1xuZXhwb3J0ICogZnJvbSAnLi9maW5kX2NoaWxkJztcbmV4cG9ydCAqIGZyb20gJy4vYnVpbGRfY3VydmUnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfdG91Y2hfaWQnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9zaXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9waWNrX2luX3JhbmdlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3BvaW50ZXJfZGF0YSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBkZWJvdW5jZVxuICovXG5cbi8vIGRlYm91bmNlIHRpbWVycyByZXNldCB3YWl0XG5jb25zdCBSRVNFVF9XQUlUID0gMTAwO1xuXG4vKipcbiAqIENhbGwgZm4gaWYgaXQgaXNuJ3QgYmUgY2FsbGVkIGluIGEgcGVyaW9kXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbd2FpdF06IGRlYm91bmNlIHdhaXQsIGRlZmF1bHQgaXMgUkVTVF9XQUlUXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtpbW1lZGlhdGVdOiB3aGV0aGVyIHRvIHJ1biB0YXNrIGF0IGxlYWRpbmcsIGRlZmF1bHQgaXMgdHJ1ZVxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5leHBvcnQgbGV0IGRlYm91bmNlID0gKGZuLCB3YWl0ID0gUkVTRVRfV0FJVCwgaW1tZWRpYXRlID0gdHJ1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIGxldCB0aW1lcjtcblxuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICBpZiAoIXRpbWVyICYmIGltbWVkaWF0ZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBmbiguLi5hcmdzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aW1lciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGZuKC4uLmFyZ3MpO1xuICAgICAgICB9LCB3YWl0KTtcbiAgICB9O1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9kZWJvdW5jZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGlzT25lT2ZcbiAqL1xuXG4vKipcbiAqIENoZWNrIGlmIGBhYCBpcyBvbmUgb2YgYFsuLi5iXWBcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5leHBvcnQgbGV0IGlzT25lT2YgPSAoYSwgYiA9IFtdKSA9PiB7XG4gICAgcmV0dXJuIGIuc29tZSh2ID0+IGEgPT09IHYpO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9pc19vbmVfb2YuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBzZXRTdHlsZVxuICovXG5cbmNvbnN0IFZFTkRPUl9QUkVGSVggPSBbXG4gICAgJ3dlYmtpdCcsXG4gICAgJ21veicsXG4gICAgJ21zJyxcbiAgICAnbydcbl07XG5cbmNvbnN0IFJFID0gbmV3IFJlZ0V4cChgXi0oPyEoPzoke1ZFTkRPUl9QUkVGSVguam9pbignfCcpfSktKWApO1xuXG5sZXQgYXV0b1ByZWZpeCA9IChzdHlsZXMpID0+IHtcbiAgICBjb25zdCByZXMgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBpZiAoIVJFLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgIHJlc1twcm9wXSA9IHN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbCA9IHN0eWxlc1twcm9wXTtcblxuICAgICAgICBwcm9wID0gcHJvcC5yZXBsYWNlKC9eLS8sICcnKTtcbiAgICAgICAgcmVzW3Byb3BdID0gdmFsO1xuXG4gICAgICAgIFZFTkRPUl9QUkVGSVguZm9yRWFjaCgocHJlZml4KSA9PiB7XG4gICAgICAgICAgICByZXNbYC0ke3ByZWZpeH0tJHtwcm9wfWBdID0gdmFsO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogc2V0IGNzcyBzdHlsZSBmb3IgdGFyZ2V0IGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGVzOiBjc3Mgc3R5bGVzIHRvIGFwcGx5XG4gKi9cbmV4cG9ydCBsZXQgc2V0U3R5bGUgPSAoZWxlbSwgc3R5bGVzKSA9PiB7XG4gICAgc3R5bGVzID0gYXV0b1ByZWZpeChzdHlsZXMpO1xuXG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGxldCBjc3NQcm9wID0gcHJvcC5yZXBsYWNlKC9eLS8sICcnKS5yZXBsYWNlKC8tKFthLXpdKS9nLCAobSwgJDEpID0+ICQxLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICBlbGVtLnN0eWxlW2Nzc1Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9zZXRfc3R5bGUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXREZWx0YVxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cbmNvbnN0IERFTFRBX1NDQUxFID0ge1xuICAgIFNUQU5EQVJEOiAxLFxuICAgIE9USEVSUzogLTNcbn07XG5cbmNvbnN0IERFTFRBX01PREUgPSBbMS4wLCAyOC4wLCA1MDAuMF07XG5cbmxldCBnZXREZWx0YU1vZGUgPSAobW9kZSkgPT4gREVMVEFfTU9ERVttb2RlXSB8fCBERUxUQV9NT0RFWzBdO1xuXG4vKipcbiAqIE5vcm1hbGl6aW5nIHdoZWVsIGRlbHRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKi9cbmV4cG9ydCBsZXQgZ2V0RGVsdGEgPSAoZXZ0KSA9PiB7XG4gICAgLy8gZ2V0IG9yaWdpbmFsIERPTSBldmVudFxuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGlmICgnZGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgY29uc3QgbW9kZSA9IGdldERlbHRhTW9kZShldnQuZGVsdGFNb2RlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogZXZ0LmRlbHRhWCAvIERFTFRBX1NDQUxFLlNUQU5EQVJEICogbW9kZSxcbiAgICAgICAgICAgIHk6IGV2dC5kZWx0YVkgLyBERUxUQV9TQ0FMRS5TVEFOREFSRCAqIG1vZGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoJ3doZWVsRGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGV2dC53aGVlbERlbHRhWCAvIERFTFRBX1NDQUxFLk9USEVSUyxcbiAgICAgICAgICAgIHk6IGV2dC53aGVlbERlbHRhWSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIGllIHdpdGggdG91Y2hwYWRcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiBldnQud2hlZWxEZWx0YSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgIH07XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X2RlbHRhLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0T3JpZ2luYWxFdmVudFxuICovXG5cbi8qKlxuICogR2V0IG9yaWdpbmFsIERPTSBldmVudFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge0V2ZW50T2JqZWN0fVxuICovXG5leHBvcnQgbGV0IGdldE9yaWdpbmFsRXZlbnQgPSAoZXZ0KSA9PiB7XG4gICAgcmV0dXJuIGV2dC5vcmlnaW5hbEV2ZW50IHx8IGV2dDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X29yaWdpbmFsX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZmluZENoaWxkXG4gKi9cblxuLyoqXG4gKiBGaW5kIGVsZW1lbnQgd2l0aCBzcGVjaWZpYyBjbGFzcyBuYW1lIHdpdGhpbiBjaGlsZHJlbiwgbGlrZSBzZWxlY3RvciAnPidcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHBhcmVudEVsZW1cbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcbiAqXG4gKiBAcmV0dXJuIHtFbGVtZW50fTogZmlyc3QgbWF0Y2hlZCBjaGlsZFxuICovXG5leHBvcnQgbGV0IGZpbmRDaGlsZCA9IChwYXJlbnRFbGVtLCBjbGFzc05hbWUpID0+IHtcbiAgICBsZXQgY2hpbGRyZW4gPSBwYXJlbnRFbGVtLmNoaWxkcmVuO1xuXG4gICAgaWYgKCFjaGlsZHJlbikgcmV0dXJuIG51bGw7XG5cbiAgICBmb3IgKGxldCBlbGVtIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChlbGVtLmNsYXNzTmFtZS5tYXRjaChjbGFzc05hbWUpKSByZXR1cm4gZWxlbTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZmluZF9jaGlsZC5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3InKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIGdldCAgICAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5nZXRJdGVyYXRvciA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldChpdCk7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgcmV0dXJuIGFuT2JqZWN0KGl0ZXJGbi5jYWxsKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGJ1aWxkQ3VydmVcbiAqL1xuXG4vKipcbiAqIEJ1aWxkIHF1YWRyYXRpYyBlYXNpbmcgY3VydmVcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYmVnaW5cbiAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvblxuICpcbiAqIEByZXR1cm4ge0FycmF5fTogcG9pbnRzXG4gKi9cbmV4cG9ydCBsZXQgYnVpbGRDdXJ2ZSA9IChkaXN0YW5jZSwgZHVyYXRpb24pID0+IHtcbiAgICBsZXQgcmVzID0gW107XG5cbiAgICBpZiAoZHVyYXRpb24gPD0gMCkgcmV0dXJuIHJlcztcblxuICAgIGNvbnN0IHQgPSBNYXRoLnJvdW5kKGR1cmF0aW9uIC8gMTAwMCAqIDYwKTtcbiAgICBjb25zdCBhID0gLWRpc3RhbmNlIC8gdCoqMjtcbiAgICBjb25zdCBiID0gLTIgKiBhICogdDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdDsgaSsrKSB7XG4gICAgICAgIHJlcy5wdXNoKGEgKiBpKioyICsgYiAqIGkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2J1aWxkX2N1cnZlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0VG91Y2hJRFxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQsIGdldFBvaW50ZXJEYXRhIF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuaW1wb3J0IHsgZ2V0UG9pbnRlckRhdGEgfSBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuXG4vKipcbiAqIEdldCB0b3VjaCBpZGVudGlmaWVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKlxuICogQHJldHVybiB7TnVtYmVyfTogdG91Y2ggaWRcbiAqL1xuZXhwb3J0IGxldCBnZXRUb3VjaElEID0gKGV2dCkgPT4ge1xuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGxldCBkYXRhID0gZ2V0UG9pbnRlckRhdGEoZXZ0KTtcblxuICAgIHJldHVybiBkYXRhLmlkZW50aWZpZXI7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF90b3VjaF9pZC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldFBvaW50ZXJEYXRhXG4gKiBAZGVwZW5kZW5jaWVzIFsgZ2V0T3JpZ2luYWxFdmVudCBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcblxuLyoqXG4gKiBHZXQgcG9pbnRlci90b3VjaCBkYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gZXZ0OiBldmVudCBvYmplY3RcbiAqL1xuZXhwb3J0IGxldCBnZXRQb2ludGVyRGF0YSA9IChldnQpID0+IHtcbiAgICAvLyBpZiBpcyB0b3VjaCBldmVudCwgcmV0dXJuIGxhc3QgaXRlbSBpbiB0b3VjaExpc3RcbiAgICAvLyBlbHNlIHJldHVybiBvcmlnaW5hbCBldmVudFxuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIHJldHVybiBldnQudG91Y2hlcyA/IGV2dC50b3VjaGVzW2V2dC50b3VjaGVzLmxlbmd0aCAtIDFdIDogZXZ0O1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF9wb2ludGVyX2RhdGEuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXRQb3NpdGlvblxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQsIGdldFBvaW50ZXJEYXRhIF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuaW1wb3J0IHsgZ2V0UG9pbnRlckRhdGEgfSBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuXG4vKipcbiAqIEdldCBwb2ludGVyL2ZpbmdlciBwb3NpdGlvblxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKlxuICogQHJldHVybiB7T2JqZWN0fTogcG9zaXRpb257eCwgeX1cbiAqL1xuZXhwb3J0IGxldCBnZXRQb3NpdGlvbiA9IChldnQpID0+IHtcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICBsZXQgZGF0YSA9IGdldFBvaW50ZXJEYXRhKGV2dCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBkYXRhLmNsaWVudFgsXG4gICAgICAgIHk6IGRhdGEuY2xpZW50WVxuICAgIH07XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X3Bvc2l0aW9uLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gcGlja0luUmFuZ2VcbiAqL1xuXG4vKipcbiAqIFBpY2sgdmFsdWUgaW4gcmFuZ2UgW21pbiwgbWF4XVxuICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gKiBAcGFyYW0ge051bWJlcn0gW21pbl1cbiAqIEBwYXJhbSB7TnVtYmVyfSBbbWF4XVxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0IGxldCBwaWNrSW5SYW5nZSA9ICh2YWx1ZSwgbWluID0gMCwgbWF4ID0gMCkgPT4gTWF0aC5tYXgobWluLCBNYXRoLm1pbih2YWx1ZSwgbWF4KSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9waWNrX2luX3JhbmdlLmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi91cGRhdGUnO1xuZXhwb3J0ICogZnJvbSAnLi9kZXN0cm95JztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3NpemUnO1xuZXhwb3J0ICogZnJvbSAnLi9saXN0ZW5lcic7XG5leHBvcnQgKiBmcm9tICcuL3Njcm9sbF90byc7XG5leHBvcnQgKiBmcm9tICcuL2lzX3Zpc2libGUnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9wb3NpdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL3RvZ2dsZV90cmFjayc7XG5leHBvcnQgKiBmcm9tICcuL21hbmFnZV9ldmVudHMnO1xuZXhwb3J0ICogZnJvbSAnLi9jbGVhcl9tb3ZlbWVudCc7XG5leHBvcnQgKiBmcm9tICcuL2luZmluaXRlX3Njcm9sbCc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9jb250ZW50X2VsZW0nO1xuZXhwb3J0ICogZnJvbSAnLi9zY3JvbGxfaW50b192aWV3JztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gdXBkYXRlXG4gKi9cblxuaW1wb3J0IHsgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFVwZGF0ZSBzY3JvbGxiYXJzIGFwcGVhcmFuY2VcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGFzeW5jOiB1cGRhdGUgYXN5bmNocm9ub3VzXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oYXN5bmMgPSB0cnVlKSB7XG4gICAgbGV0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fX3VwZGF0ZUJvdW5kaW5nKCk7XG5cbiAgICAgICAgbGV0IHNpemUgPSB0aGlzLmdldFNpemUoKTtcblxuICAgICAgICB0aGlzLl9fcmVhZG9ubHkoJ3NpemUnLCBzaXplKTtcblxuICAgICAgICBsZXQgbmV3TGltaXQgPSB7XG4gICAgICAgICAgICB4OiBzaXplLmNvbnRlbnQud2lkdGggLSBzaXplLmNvbnRhaW5lci53aWR0aCxcbiAgICAgICAgICAgIHk6IHNpemUuY29udGVudC5oZWlnaHQgLSBzaXplLmNvbnRhaW5lci5oZWlnaHRcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5saW1pdCAmJlxuICAgICAgICAgICAgbmV3TGltaXQueCA9PT0gdGhpcy5saW1pdC54ICYmXG4gICAgICAgICAgICBuZXdMaW1pdC55ID09PSB0aGlzLmxpbWl0LnkpIHJldHVybjtcblxuICAgICAgICBjb25zdCB7IHRhcmdldHMsIG9wdGlvbnMgfSA9IHRoaXM7XG5cbiAgICAgICAgbGV0IHRodW1iU2l6ZSA9IHtcbiAgICAgICAgICAgIC8vIHJlYWwgdGh1bWIgc2l6ZXNcbiAgICAgICAgICAgIHJlYWxYOiBzaXplLmNvbnRhaW5lci53aWR0aCAvIHNpemUuY29udGVudC53aWR0aCAqIHNpemUuY29udGFpbmVyLndpZHRoLFxuICAgICAgICAgICAgcmVhbFk6IHNpemUuY29udGFpbmVyLmhlaWdodCAvIHNpemUuY29udGVudC5oZWlnaHQgKiBzaXplLmNvbnRhaW5lci5oZWlnaHRcbiAgICAgICAgfTtcblxuICAgICAgICAvLyByZW5kZXJlZCB0aHVtYiBzaXplc1xuICAgICAgICB0aHVtYlNpemUueCA9IE1hdGgubWF4KHRodW1iU2l6ZS5yZWFsWCwgb3B0aW9ucy50aHVtYk1pblNpemUpO1xuICAgICAgICB0aHVtYlNpemUueSA9IE1hdGgubWF4KHRodW1iU2l6ZS5yZWFsWSwgb3B0aW9ucy50aHVtYk1pblNpemUpO1xuXG4gICAgICAgIHRoaXMuX19yZWFkb25seSgnbGltaXQnLCBuZXdMaW1pdClcbiAgICAgICAgICAgIC5fX3JlYWRvbmx5KCd0aHVtYlNpemUnLCB0aHVtYlNpemUpO1xuXG4gICAgICAgIGNvbnN0IHsgeEF4aXMsIHlBeGlzIH0gPSB0YXJnZXRzO1xuXG4gICAgICAgIC8vIGhpZGUgc2Nyb2xsYmFyIGlmIGNvbnRlbnQgc2l6ZSBsZXNzIHRoYW4gY29udGFpbmVyXG4gICAgICAgIHNldFN0eWxlKHhBeGlzLnRyYWNrLCB7XG4gICAgICAgICAgICAnZGlzcGxheSc6IHNpemUuY29udGVudC53aWR0aCA8PSBzaXplLmNvbnRhaW5lci53aWR0aCA/ICdub25lJyA6ICdibG9jaydcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFN0eWxlKHlBeGlzLnRyYWNrLCB7XG4gICAgICAgICAgICAnZGlzcGxheSc6IHNpemUuY29udGVudC5oZWlnaHQgPD0gc2l6ZS5jb250YWluZXIuaGVpZ2h0ID8gJ25vbmUnIDogJ2Jsb2NrJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyB1c2UgcGVyY2VudGFnZSB2YWx1ZSBmb3IgdGh1bWJcbiAgICAgICAgc2V0U3R5bGUoeEF4aXMudGh1bWIsIHtcbiAgICAgICAgICAgICd3aWR0aCc6IGAke3RodW1iU2l6ZS54fXB4YFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0U3R5bGUoeUF4aXMudGh1bWIsIHtcbiAgICAgICAgICAgICdoZWlnaHQnOiBgJHt0aHVtYlNpemUueX1weGBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gcmUtcG9zaXRpb25pbmdcbiAgICAgICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0IH0gPSB0aGlzO1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKE1hdGgubWluKG9mZnNldC54LCBsaW1pdC54KSwgTWF0aC5taW4ob2Zmc2V0LnksIGxpbWl0LnkpKTtcbiAgICAgICAgdGhpcy5fX3NldFRodW1iUG9zaXRpb24oKTtcbiAgICB9O1xuXG4gICAgaWYgKGFzeW5jKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgIH1cbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy91cGRhdGUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBkZXN0cm95XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHNiTGlzdCB9IGZyb20gJy4uL3NoYXJlZCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFJlbW92ZSBhbGwgc2Nyb2xsYmFyIGxpc3RlbmVycyBhbmQgZXZlbnQgaGFuZGxlcnNcbiAqIFJlc2V0XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgX19saXN0ZW5lcnMsIF9faGFuZGxlcnMsIHRhcmdldHMgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBjb250YWluZXIsIGNvbnRlbnQgfSA9IHRhcmdldHM7XG5cbiAgICBfX2hhbmRsZXJzLmZvckVhY2goKHsgZXZ0LCBlbGVtLCBmbiB9KSA9PiB7XG4gICAgICAgIGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGZuKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2Nyb2xsVG8oMCwgMCwgMzAwLCAoKSA9PiB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX190aW1lcklELnJlbmRlcik7XG4gICAgICAgIF9faGFuZGxlcnMubGVuZ3RoID0gX19saXN0ZW5lcnMubGVuZ3RoID0gMDtcblxuICAgICAgICAvLyByZXNldCBzY3JvbGwgcG9zaXRpb25cbiAgICAgICAgc2V0U3R5bGUoY29udGFpbmVyLCB7XG4gICAgICAgICAgICBvdmVyZmxvdzogJydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxMZWZ0ID0gMDtcblxuICAgICAgICAvLyByZXNldCBjb250ZW50XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gWy4uLmNvbnRlbnQuY2hpbGRyZW5dO1xuXG4gICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKChlbCkgPT4gY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGZvcm0gc2JMaXN0XG4gICAgICAgIHNiTGlzdC5kZWxldGUoY29udGFpbmVyKTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9kZXN0cm95LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gZ2V0U2l6ZVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBHZXQgY29udGFpbmVyIGFuZCBjb250ZW50IHNpemVcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9OiBhbiBvYmplY3QgY29udGFpbnMgY29udGFpbmVyIGFuZCBjb250ZW50J3Mgd2lkdGggYW5kIGhlaWdodFxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy50YXJnZXRzLmNvbnRhaW5lcjtcbiAgICBsZXQgY29udGVudCA9IHRoaXMudGFyZ2V0cy5jb250ZW50O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udGFpbmVyOiB7XG4gICAgICAgICAgICAvLyByZXF1aXJlcyBgb3ZlcmZsb3c6IGhpZGRlbmBcbiAgICAgICAgICAgIHdpZHRoOiBjb250YWluZXIuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNvbnRhaW5lci5jbGllbnRIZWlnaHRcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgLy8gYm9yZGVyIHdpZHRoIHNob3VsZCBiZSBpbmNsdWRlZFxuICAgICAgICAgICAgd2lkdGg6IGNvbnRlbnQub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNvbnRlbnQub2Zmc2V0SGVpZ2h0XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2dldF9zaXplLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gYWRkTGlzdGVuZXJcbiAqICAgICAgICAgICAge0Z1bmN0aW9ufSByZW1vdmVMaXN0ZW5lclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBBZGQgc2Nyb2xsaW5nIGxpc3RlbmVyXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2I6IGxpc3RlbmVyXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbihjYikge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIHRoaXMuX19saXN0ZW5lcnMucHVzaChjYik7XG59O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFJlbW92ZSBzcGVjaWZpYyBsaXN0ZW5lciBmcm9tIGFsbCBsaXN0ZW5lcnNcbiAqIEBwYXJhbSB7dHlwZX0gcGFyYW06IGRlc2NyaXB0aW9uXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihjYikge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIHRoaXMuX19saXN0ZW5lcnMuc29tZSgoZm4sIGlkeCwgYWxsKSA9PiB7XG4gICAgICAgIHJldHVybiBmbiA9PT0gY2IgJiYgYWxsLnNwbGljZShpZHgsIDEpO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2xpc3RlbmVyLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2Nyb2xsVG9cbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSwgYnVpbGRDdXJ2ZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTY3JvbGxpbmcgc2Nyb2xsYmFyIHRvIHBvc2l0aW9uIHdpdGggdHJhbnNpdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeF06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB4IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeV06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB5IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbZHVyYXRpb25dOiB0cmFuc2l0aW9uIGR1cmF0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdOiBjYWxsYmFja1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNjcm9sbFRvID0gZnVuY3Rpb24oeCA9IHRoaXMub2Zmc2V0LngsIHkgPSB0aGlzLm9mZnNldC55LCBkdXJhdGlvbiA9IDAsIGNiID0gbnVsbCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBsaW1pdCxcbiAgICAgICAgX190aW1lcklEXG4gICAgfSA9IHRoaXM7XG5cbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZShfX3RpbWVySUQuc2Nyb2xsVG8pO1xuICAgIGNiID0gdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nID8gY2IgOiAoKSA9PiB7fTtcblxuICAgIGlmIChvcHRpb25zLnJlbmRlckJ5UGl4ZWxzKSB7XG4gICAgICAgIC8vIGVuc3VyZSByZXNvbHZlZCB3aXRoIGludGVnZXJcbiAgICAgICAgeCA9IE1hdGgucm91bmQoeCk7XG4gICAgICAgIHkgPSBNYXRoLnJvdW5kKHkpO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXJ0WCA9IG9mZnNldC54O1xuICAgIGNvbnN0IHN0YXJ0WSA9IG9mZnNldC55O1xuXG4gICAgY29uc3QgZGlzWCA9IHBpY2tJblJhbmdlKHgsIDAsIGxpbWl0LngpIC0gc3RhcnRYO1xuICAgIGNvbnN0IGRpc1kgPSBwaWNrSW5SYW5nZSh5LCAwLCBsaW1pdC55KSAtIHN0YXJ0WTtcblxuICAgIGNvbnN0IGN1cnZlWCA9IGJ1aWxkQ3VydmUoZGlzWCwgZHVyYXRpb24pO1xuICAgIGNvbnN0IGN1cnZlWSA9IGJ1aWxkQ3VydmUoZGlzWSwgZHVyYXRpb24pO1xuXG4gICAgbGV0IGZyYW1lID0gMCwgdG90YWxGcmFtZSA9IGN1cnZlWC5sZW5ndGg7XG5cbiAgICBsZXQgc2Nyb2xsID0gKCkgPT4ge1xuICAgICAgICBpZiAoZnJhbWUgPT09IHRvdGFsRnJhbWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNiKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHN0YXJ0WCArIGN1cnZlWFtmcmFtZV0sIHN0YXJ0WSArIGN1cnZlWVtmcmFtZV0pO1xuXG4gICAgICAgIGZyYW1lKys7XG5cbiAgICAgICAgX190aW1lcklELnNjcm9sbFRvID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbCk7XG4gICAgfTtcblxuICAgIHNjcm9sbCgpO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3Njcm9sbF90by5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGlzVmlzaWJsZVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBDaGVjayBpZiBhbiBlbGVtZW50IGlzIHZpc2libGVcbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSB0YXJnZXQgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0IGVsZW1lbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuaXNWaXNpYmxlID0gZnVuY3Rpb24oZWxlbSkge1xuICAgIGNvbnN0IHsgYm91bmRpbmcgfSA9IHRoaXM7XG5cbiAgICBsZXQgdGFyZ2V0Qm91bmRpbmcgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgLy8gY2hlY2sgb3ZlcmxhcHBpbmdcbiAgICBsZXQgdG9wID0gTWF0aC5tYXgoYm91bmRpbmcudG9wLCB0YXJnZXRCb3VuZGluZy50b3ApO1xuICAgIGxldCBsZWZ0ID0gTWF0aC5tYXgoYm91bmRpbmcubGVmdCwgdGFyZ2V0Qm91bmRpbmcubGVmdCk7XG4gICAgbGV0IHJpZ2h0ID0gTWF0aC5taW4oYm91bmRpbmcucmlnaHQsIHRhcmdldEJvdW5kaW5nLnJpZ2h0KTtcbiAgICBsZXQgYm90dG9tID0gTWF0aC5taW4oYm91bmRpbmcuYm90dG9tLCB0YXJnZXRCb3VuZGluZy5ib3R0b20pO1xuXG4gICAgcmV0dXJuIHRvcCA8PSBib3R0b20gJiYgbGVmdCA8PSByaWdodDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9pc192aXNpYmxlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2V0T3B0aW9uc1xuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTZXQgc2Nyb2xsYmFyIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zID0ge30pIHtcbiAgICBsZXQgcmVzID0ge307XG5cbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KHByb3ApIHx8IG9wdGlvbnNbcHJvcF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgIHJlc1twcm9wXSA9IG9wdGlvbnNbcHJvcF07XG4gICAgfSk7XG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgcmVzKTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9zZXRfb3B0aW9ucy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSAxMDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5PYmplY3QuYXNzaWduO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gMTA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjMuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuLyQuZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLm9iamVjdC1hc3NpZ24nKX0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gMTEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLW9iamVjdCcpXG4gICwgSU9iamVjdCAgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpO1xuXG4vLyBzaG91bGQgd29yayB3aXRoIHN5bWJvbHMgYW5kIHNob3VsZCBoYXZlIGRldGVybWluaXN0aWMgcHJvcGVydHkgb3JkZXIgKFY4IGJ1Zylcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXtcbiAgdmFyIGEgPSBPYmplY3QuYXNzaWduXG4gICAgLCBBID0ge31cbiAgICAsIEIgPSB7fVxuICAgICwgUyA9IFN5bWJvbCgpXG4gICAgLCBLID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0JztcbiAgQVtTXSA9IDc7XG4gIEsuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24oayl7IEJba10gPSBrOyB9KTtcbiAgcmV0dXJuIGEoe30sIEEpW1NdICE9IDcgfHwgT2JqZWN0LmtleXMoYSh7fSwgQikpLmpvaW4oJycpICE9IEs7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgdmFyIFQgICAgID0gdG9PYmplY3QodGFyZ2V0KVxuICAgICwgJCQgICAgPSBhcmd1bWVudHNcbiAgICAsICQkbGVuID0gJCQubGVuZ3RoXG4gICAgLCBpbmRleCA9IDFcbiAgICAsIGdldEtleXMgICAgPSAkLmdldEtleXNcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHNcbiAgICAsIGlzRW51bSAgICAgPSAkLmlzRW51bTtcbiAgd2hpbGUoJCRsZW4gPiBpbmRleCl7XG4gICAgdmFyIFMgICAgICA9IElPYmplY3QoJCRbaW5kZXgrK10pXG4gICAgICAsIGtleXMgICA9IGdldFN5bWJvbHMgPyBnZXRLZXlzKFMpLmNvbmNhdChnZXRTeW1ib2xzKFMpKSA6IGdldEtleXMoUylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaiAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUobGVuZ3RoID4gailpZihpc0VudW0uY2FsbChTLCBrZXkgPSBrZXlzW2orK10pKVRba2V5XSA9IFNba2V5XTtcbiAgfVxuICByZXR1cm4gVDtcbn0gOiBPYmplY3QuYXNzaWduO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LWFzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDExMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2V0UG9zaXRpb25cbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSwgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogU2V0IHNjcm9sbGJhciBwb3NpdGlvbiB3aXRob3V0IHRyYW5zaXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3hdOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0gW3ldOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geSBheGlzXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRob3V0Q2FsbGJhY2tzXTogZGlzYWJsZSBjYWxsYmFjayBmdW5jdGlvbnMgdGVtcG9yYXJpbHlcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHggPSB0aGlzLm9mZnNldC54LCB5ID0gdGhpcy5vZmZzZXQueSwgd2l0aG91dENhbGxiYWNrcyA9IGZhbHNlKSB7XG4gICAgdGhpcy5fX3VwZGF0ZVRocm90dGxlKCk7XG5cbiAgICBjb25zdCBzdGF0dXMgPSB7fTtcbiAgICBjb25zdCB7IG9wdGlvbnMsIG9mZnNldCwgbGltaXQsIHRhcmdldHMsIF9fbGlzdGVuZXJzIH0gPSB0aGlzO1xuXG4gICAgaWYgKG9wdGlvbnMucmVuZGVyQnlQaXhlbHMpIHtcbiAgICAgICAgLy8gZW5zdXJlIHJlc29sdmVkIHdpdGggaW50ZWdlclxuICAgICAgICB4ID0gTWF0aC5yb3VuZCh4KTtcbiAgICAgICAgeSA9IE1hdGgucm91bmQoeSk7XG4gICAgfVxuXG4gICAgaWYgKE1hdGguYWJzKHggLSBvZmZzZXQueCkgPiAxKSB0aGlzLnNob3dUcmFjaygneCcpO1xuICAgIGlmIChNYXRoLmFicyh5IC0gb2Zmc2V0LnkpID4gMSkgdGhpcy5zaG93VHJhY2soJ3knKTtcblxuICAgIHggPSBwaWNrSW5SYW5nZSh4LCAwLCBsaW1pdC54KTtcbiAgICB5ID0gcGlja0luUmFuZ2UoeSwgMCwgbGltaXQueSk7XG5cbiAgICB0aGlzLl9faGlkZVRyYWNrVGhyb3R0bGUoKTtcblxuICAgIGlmICh4ID09PSBvZmZzZXQueCAmJiB5ID09PSBvZmZzZXQueSkgcmV0dXJuO1xuXG4gICAgc3RhdHVzLmRpcmVjdGlvbiA9IHtcbiAgICAgICAgeDogeCA9PT0gb2Zmc2V0LnggPyAnbm9uZScgOiAoeCA+IG9mZnNldC54ID8gJ3JpZ2h0JyA6ICdsZWZ0JyksXG4gICAgICAgIHk6IHkgPT09IG9mZnNldC55ID8gJ25vbmUnIDogKHkgPiBvZmZzZXQueSA/ICdkb3duJyA6ICd1cCcpXG4gICAgfTtcblxuICAgIHN0YXR1cy5saW1pdCA9IHsgLi4ubGltaXQgfTtcblxuICAgIG9mZnNldC54ID0geDtcbiAgICBvZmZzZXQueSA9IHk7XG4gICAgc3RhdHVzLm9mZnNldCA9IHsgLi4ub2Zmc2V0IH07XG5cbiAgICAvLyByZXNldCB0aHVtYiBwb3NpdGlvbiBhZnRlciBvZmZzZXQgdXBkYXRlXG4gICAgdGhpcy5fX3NldFRodW1iUG9zaXRpb24oKTtcblxuICAgIHNldFN0eWxlKHRhcmdldHMuY29udGVudCwge1xuICAgICAgICAnLXRyYW5zZm9ybSc6IGB0cmFuc2xhdGUzZCgkey14fXB4LCAkey15fXB4LCAwKWBcbiAgICB9KTtcblxuICAgIC8vIGludm9rZSBhbGwgbGlzdGVuZXJzXG4gICAgaWYgKHdpdGhvdXRDYWxsYmFja3MpIHJldHVybjtcbiAgICBfX2xpc3RlbmVycy5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgZm4oc3RhdHVzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvc2V0X3Bvc2l0aW9uLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGFzc2lnbiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnblwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX09iamVjdCRhc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9leHRlbmRzLmpzXG4gKiogbW9kdWxlIGlkID0gMTEzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzaG93VHJhY2tcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBoaWRlVHJhY2tcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIHRvZ2dsZVRyYWNrKGFjdGlvbiA9ICdzaG93Jykge1xuICAgIGNvbnN0IG1ldGhvZCA9IGFjdGlvbiA9PT0gJ3Nob3cnID8gJ2FkZCcgOiAncmVtb3ZlJztcblxuICAgIC8qKlxuICAgICAqIHRvZ2dsZSBzY3JvbGxiYXIgdHJhY2sgb24gZ2l2ZW4gZGlyZWN0aW9uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uOiB3aGljaCBkaXJlY3Rpb24gb2YgdHJhY2tzIHRvIHNob3cvaGlkZSwgZGVmYXVsdCBpcyAnYm90aCdcbiAgICAgKi9cbiAgICByZXR1cm4gZnVuY3Rpb24oZGlyZWN0aW9uID0gJ2JvdGgnKSB7XG4gICAgICAgIGNvbnN0IHsgY29udGFpbmVyLCB4QXhpcywgeUF4aXMgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgICAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdFttZXRob2RdKCdzY3JvbGxpbmcnKTtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnYm90aCcpIHtcbiAgICAgICAgICAgIHhBeGlzLnRyYWNrLmNsYXNzTGlzdFttZXRob2RdKCdzaG93Jyk7XG4gICAgICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3RbbWV0aG9kXSgnc2hvdycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3gnKSB7XG4gICAgICAgICAgICB4QXhpcy50cmFjay5jbGFzc0xpc3RbbWV0aG9kXSgnc2hvdycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3knKSB7XG4gICAgICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3RbbWV0aG9kXSgnc2hvdycpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc2hvd1RyYWNrID0gdG9nZ2xlVHJhY2soJ3Nob3cnKTtcblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuaGlkZVRyYWNrID0gdG9nZ2xlVHJhY2soJ2hpZGUnKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3RvZ2dsZV90cmFjay5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHVucmVnaXN0ZXJFdmVudHNcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIG1hdGNoQWxsUnVsZXMoc3RyLCBydWxlcykge1xuICAgIHJldHVybiAhIXJ1bGVzLmxlbmd0aCAmJiBydWxlcy5ldmVyeShyZWdleCA9PiBzdHIubWF0Y2gocmVnZXgpKTtcbn07XG5cbmZ1bmN0aW9uIG1hbmFnZUV2ZW50cyhzaG91bGRVbnJlZ2lzdGVyKSB7XG4gICAgc2hvdWxkVW5yZWdpc3RlciA9ICEhc2hvdWxkVW5yZWdpc3RlcjtcblxuICAgIGxldCBtZXRob2QgPSBzaG91bGRVbnJlZ2lzdGVyID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2FkZEV2ZW50TGlzdGVuZXInO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKC4uLnJ1bGVzKSB7XG4gICAgICAgIHRoaXMuX19oYW5kbGVycy5mb3JFYWNoKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgICBsZXQgeyBlbGVtLCBldnQsIGZuLCBoYXNSZWdpc3RlcmVkIH0gPSBoYW5kbGVyO1xuXG4gICAgICAgICAgICAvLyBzaG91bGRVbnJlZ2lzdGVyID0gaGFzUmVnaXN0ZXJlZCA9IGZhbHNlOiByZWdpc3RlciBldmVudFxuICAgICAgICAgICAgLy8gc2hvdWxkVW5yZWdpc3RlciA9IGhhc1JlZ2lzdGVyZWQgPSB0cnVlOiB1bnJlZ2lzdGVyIGV2ZW50XG4gICAgICAgICAgICBpZiAoc2hvdWxkVW5yZWdpc3RlciAhPT0gaGFzUmVnaXN0ZXJlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAobWF0Y2hBbGxSdWxlcyhldnQsIHJ1bGVzKSkge1xuICAgICAgICAgICAgICAgIGVsZW1bbWV0aG9kXShldnQsIGZuKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmhhc1JlZ2lzdGVyZWQgPSAhaGFzUmVnaXN0ZXJlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn07XG5cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUudW5yZWdpc3RlckV2ZW50cyA9IG1hbmFnZUV2ZW50cyh0cnVlKTtcblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUucmVnaXN0ZXJFdmVudHMgPSBtYW5hZ2VFdmVudHMoZmFsc2UpO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvbWFuYWdlX2V2ZW50cy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGNsZWFyTW92ZW1lbnR8c3RvcFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTdG9wIHNjcm9sbGJhciByaWdodCBhd2F5XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuY2xlYXJNb3ZlbWVudCA9IFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubW92ZW1lbnQueCA9IHRoaXMubW92ZW1lbnQueSA9IDA7XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fX3RpbWVySUQuc2Nyb2xsVG8pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2NsZWFyX21vdmVtZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gaW5maW5pdGVTY3JvbGxcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogQ3JlYXRlIGluZmluaXRlIHNjcm9sbCBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiOiBpbmZpbml0ZSBzY3JvbGwgYWN0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW3RocmVzaG9sZF06IGluZmluaXRlIHNjcm9sbCB0aHJlc2hvbGQodG8gYm90dG9tKSwgZGVmYXVsdCBpcyA1MChweClcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5pbmZpbml0ZVNjcm9sbCA9IGZ1bmN0aW9uKGNiLCB0aHJlc2hvbGQgPSA1MCkge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIGxldCBsYXN0T2Zmc2V0ID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGxldCBlbnRlcmVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmFkZExpc3RlbmVyKChzdGF0dXMpID0+IHtcbiAgICAgICAgbGV0IHsgb2Zmc2V0LCBsaW1pdCB9ID0gc3RhdHVzO1xuXG4gICAgICAgIGlmIChsaW1pdC55IC0gb2Zmc2V0LnkgPD0gdGhyZXNob2xkICYmIG9mZnNldC55ID4gbGFzdE9mZnNldC55ICYmICFlbnRlcmVkKSB7XG4gICAgICAgICAgICBlbnRlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gY2Ioc3RhdHVzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGltaXQueSAtIG9mZnNldC55ID4gdGhyZXNob2xkKSB7XG4gICAgICAgICAgICBlbnRlcmVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsYXN0T2Zmc2V0ID0gb2Zmc2V0O1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2luZmluaXRlX3Njcm9sbC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGdldENvbnRlbnRFbGVtXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIEdldCBzY3JvbGwgY29udGVudCBlbGVtZW50XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuZ2V0Q29udGVudEVsZW0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50YXJnZXRzLmNvbnRlbnQ7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvZ2V0X2NvbnRlbnRfZWxlbS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNjcm9sbEludG9WaWV3XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFNjcm9sbCB0YXJnZXQgZWxlbWVudCBpbnRvIHZpc2libGUgYXJlYSBvZiBzY3JvbGxiYXIuXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gdGFyZ2V0ICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0gIHtCb29sZWFufSBvcHRpb25zLm9ubHlTY3JvbGxJZk5lZWRlZCAgd2hldGhlciBzY3JvbGwgY29udGFpbmVyIHdoZW4gdGFyZ2V0IGVsZW1lbnQgaXMgdmlzaWJsZVxuICogQHBhcmFtICB7TnVtYmVyfSAgb3B0aW9ucy5vZmZzZXRUb3AgICAgICAgICAgIHNjcm9sbGluZyBzdG9wIG9mZnNldCB0byB0b3BcbiAqIEBwYXJhbSAge051bWJlcn0gIG9wdGlvbnMub2Zmc2V0TGVmdCAgICAgICAgICBzY3JvbGxpbmcgc3RvcCBvZmZzZXQgdG8gbGVmdFxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24oZWxlbSxcbntcbiAgICBvbmx5U2Nyb2xsSWZOZWVkZWQgPSBmYWxzZSxcbiAgICBvZmZzZXRUb3AgPSAwLFxuICAgIG9mZnNldExlZnQgPSAwXG59ID0ge30pIHtcbiAgICBjb25zdCB7IHRhcmdldHMsIGJvdW5kaW5nIH0gPSB0aGlzO1xuXG4gICAgaWYgKCFlbGVtIHx8ICF0YXJnZXRzLmNvbnRhaW5lci5jb250YWlucyhlbGVtKSkgcmV0dXJuO1xuXG4gICAgbGV0IHRhcmdldEJvdW5kaW5nID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIGlmIChvbmx5U2Nyb2xsSWZOZWVkZWQgJiYgdGhpcy5pc1Zpc2libGUoZWxlbSkpIHJldHVybjtcblxuICAgIHRoaXMuX19zZXRNb3ZlbWVudChcbiAgICAgICAgdGFyZ2V0Qm91bmRpbmcubGVmdCAtIGJvdW5kaW5nLmxlZnQgLSBvZmZzZXRMZWZ0LFxuICAgICAgICB0YXJnZXRCb3VuZGluZy50b3AgLSBib3VuZGluZy50b3AgLSBvZmZzZXRUb3BcbiAgICApO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3Njcm9sbF9pbnRvX3ZpZXcuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlbmRlcic7XG5leHBvcnQgKiBmcm9tICcuL2FkZF9tb3ZlbWVudCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9tb3ZlbWVudCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19yZW5kZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIG5leHRUaWNrKG9wdGlvbnMsIGN1cnJlbnQsIG1vdmVtZW50KSB7XG4gICAgY29uc3QgeyBmcmljdGlvbiwgcmVuZGVyQnlQaXhlbHMgfSA9IG9wdGlvbnM7XG5cbiAgICBpZiAoTWF0aC5hYnMobW92ZW1lbnQpIDwgMSkge1xuICAgICAgICBsZXQgbmV4dCA9IGN1cnJlbnQgKyBtb3ZlbWVudDtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbW92ZW1lbnQ6IDAsXG4gICAgICAgICAgICBwb3NpdGlvbjogbW92ZW1lbnQgPiAwID8gTWF0aC5jZWlsKG5leHQpIDogTWF0aC5mbG9vcihuZXh0KVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGxldCBuZXh0TW92ZW1lbnQgPSBtb3ZlbWVudCAqICgxIC0gZnJpY3Rpb24gLyAxMDApO1xuXG4gICAgaWYgKHJlbmRlckJ5UGl4ZWxzKSB7XG4gICAgICAgIG5leHRNb3ZlbWVudCB8PSAwO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIG1vdmVtZW50OiBuZXh0TW92ZW1lbnQsXG4gICAgICAgIHBvc2l0aW9uOiBjdXJyZW50ICsgbW92ZW1lbnQgLSBuZXh0TW92ZW1lbnRcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gX19yZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG1vdmVtZW50LFxuICAgICAgICBfX3RpbWVySURcbiAgICB9ID0gdGhpcztcblxuICAgIGlmIChtb3ZlbWVudC54IHx8IG1vdmVtZW50LnkpIHtcbiAgICAgICAgbGV0IG5leHRYID0gbmV4dFRpY2sob3B0aW9ucywgb2Zmc2V0LngsIG1vdmVtZW50LngpO1xuICAgICAgICBsZXQgbmV4dFkgPSBuZXh0VGljayhvcHRpb25zLCBvZmZzZXQueSwgbW92ZW1lbnQueSk7XG5cbiAgICAgICAgbW92ZW1lbnQueCA9IG5leHRYLm1vdmVtZW50O1xuICAgICAgICBtb3ZlbWVudC55ID0gbmV4dFkubW92ZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihuZXh0WC5wb3NpdGlvbiwgbmV4dFkucG9zaXRpb24pO1xuICAgIH1cblxuICAgIF9fdGltZXJJRC5yZW5kZXIgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpczo6X19yZW5kZXIpO1xuXG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVuZGVyJywge1xuICAgIHZhbHVlOiBfX3JlbmRlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9yZW5kZXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZE1vdmVtZW50XG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZE1vdmVtZW50KGRlbHRhWCA9IDAsIGRlbHRhWSA9IDApIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG1vdmVtZW50XG4gICAgfSA9IHRoaXM7XG5cbiAgICB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcblxuICAgIGlmIChvcHRpb25zLnJlbmRlckJ5UGl4ZWxzKSB7XG4gICAgICAgIC8vIGVuc3VyZSByZXNvbHZlZCB3aXRoIGludGVnZXJcbiAgICAgICAgZGVsdGFYID0gTWF0aC5yb3VuZChkZWx0YVgpO1xuICAgICAgICBkZWx0YVkgPSBNYXRoLnJvdW5kKGRlbHRhWSk7XG4gICAgfVxuXG4gICAgbGV0IHggPSBtb3ZlbWVudC54ICsgZGVsdGFYO1xuICAgIGxldCB5ID0gbW92ZW1lbnQueSArIGRlbHRhWTtcblxuICAgIGlmIChvcHRpb25zLmNvbnRpbnVvdXNTY3JvbGxpbmcpIHtcbiAgICAgICAgbW92ZW1lbnQueCA9IHg7XG4gICAgICAgIG1vdmVtZW50LnkgPSB5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBsaW1pdCA9IHRoaXMuX19nZXREZWx0YUxpbWl0KCk7XG5cbiAgICAgICAgbW92ZW1lbnQueCA9IHBpY2tJblJhbmdlKHgsIC4uLmxpbWl0LngpO1xuICAgICAgICBtb3ZlbWVudC55ID0gcGlja0luUmFuZ2UoeSwgLi4ubGltaXQueSk7XG4gICAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2FkZE1vdmVtZW50Jywge1xuICAgIHZhbHVlOiBfX2FkZE1vdmVtZW50LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL2FkZF9tb3ZlbWVudC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2V0TW92ZW1lbnRcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fc2V0TW92ZW1lbnQoZGVsdGFYID0gMCwgZGVsdGFZID0gMCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgbW92ZW1lbnRcbiAgICB9ID0gdGhpcztcblxuICAgIHRoaXMuX191cGRhdGVUaHJvdHRsZSgpO1xuXG4gICAgbGV0IGxpbWl0ID0gdGhpcy5fX2dldERlbHRhTGltaXQoKTtcblxuICAgIGlmIChvcHRpb25zLnJlbmRlckJ5UGl4ZWxzKSB7XG4gICAgICAgIC8vIGVuc3VyZSByZXNvbHZlZCB3aXRoIGludGVnZXJcbiAgICAgICAgZGVsdGFYID0gTWF0aC5yb3VuZChkZWx0YVgpO1xuICAgICAgICBkZWx0YVkgPSBNYXRoLnJvdW5kKGRlbHRhWSk7XG4gICAgfVxuXG4gICAgbW92ZW1lbnQueCA9IHBpY2tJblJhbmdlKGRlbHRhWCwgLi4ubGltaXQueCk7XG4gICAgbW92ZW1lbnQueSA9IHBpY2tJblJhbmdlKGRlbHRhWSwgLi4ubGltaXQueSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fc2V0TW92ZW1lbnQnLCB7XG4gICAgdmFsdWU6IF9fc2V0TW92ZW1lbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9yZW5kZXIvc2V0X21vdmVtZW50LmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9kcmFnJztcbmV4cG9ydCAqIGZyb20gJy4vdG91Y2gnO1xuZXhwb3J0ICogZnJvbSAnLi9tb3VzZSc7XG5leHBvcnQgKiBmcm9tICcuL3doZWVsJztcbmV4cG9ydCAqIGZyb20gJy4vcmVzaXplJztcbmV4cG9ydCAqIGZyb20gJy4vc2VsZWN0JztcbmV4cG9ydCAqIGZyb20gJy4va2V5Ym9hcmQnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fZHJhZ0hhbmRsZXJcbiAqL1xuXG4gaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG4gaW1wb3J0IHsgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy8nO1xuXG4gZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbiBsZXQgX19kcmFnSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCBjb250ZW50IH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBsZXQgaXNEcmFnID0gZmFsc2U7XG4gICAgbGV0IGFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcbiAgICBsZXQgcGFkZGluZyA9IHVuZGVmaW5lZDtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX19pc0RyYWcnLCB7XG4gICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0RyYWc7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBsZXQgc2Nyb2xsID0gKHsgeCwgeSB9KSA9PiB7XG4gICAgICAgIGlmICgheCAmJiAheSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCB7IHNwZWVkIH0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KHggKiBzcGVlZCwgeSAqIHNwZWVkKTtcblxuICAgICAgICBhbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgc2Nyb2xsKHsgeCwgeSB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdkcmFnc3RhcnQnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9fZXZlbnRGcm9tQ2hpbGRTY3JvbGxiYXIoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIGlzRHJhZyA9IHRydWU7XG4gICAgICAgIHBhZGRpbmcgPSBldnQudGFyZ2V0LmNsaWVudEhlaWdodDtcblxuICAgICAgICBzZXRTdHlsZShjb250ZW50LCB7XG4gICAgICAgICAgICAncG9pbnRlci1ldmVudHMnOiAnYXV0bydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgdGhpcy5fX3VwZGF0ZUJvdW5kaW5nKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoZG9jdW1lbnQsICdkcmFnb3ZlciBtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRHJhZyB8fCB0aGlzLl9fZXZlbnRGcm9tQ2hpbGRTY3JvbGxiYXIoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBkaXIgPSB0aGlzLl9fZ2V0UG9pbnRlclRyZW5kKGV2dCwgcGFkZGluZyk7XG5cbiAgICAgICAgc2Nyb2xsKGRpcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoZG9jdW1lbnQsICdkcmFnZW5kIG1vdXNldXAgdG91Y2hlbmQgYmx1cicsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19ldmVudEZyb21DaGlsZFNjcm9sbGJhcihldnQpKSByZXR1cm47XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XG4gICAgICAgIGlzRHJhZyA9IGZhbHNlO1xuICAgIH0pO1xuIH07XG5cbiBPYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fZHJhZ0hhbmRsZXInLCB7XG4gICAgIHZhbHVlOiBfX2RyYWdIYW5kbGVyLFxuICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gfSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvZHJhZy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fdG91Y2hIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQge1xuICAgIGdldE9yaWdpbmFsRXZlbnQsXG4gICAgZ2V0UG9zaXRpb24sXG4gICAgZ2V0VG91Y2hJRFxufSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFRvdWNoIGV2ZW50IGhhbmRsZXJzIGJ1aWxkZXJcbiAqL1xubGV0IF9fdG91Y2hIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGxldCBsYXN0VG91Y2hUaW1lLCBsYXN0VG91Y2hJRDtcbiAgICBsZXQgbW92ZVZlbG9jaXR5ID0ge30sIGxhc3RUb3VjaFBvcyA9IHt9LCB0b3VjaFJlY29yZHMgPSB7fTtcblxuICAgIGxldCB1cGRhdGVSZWNvcmRzID0gKGV2dCkgPT4ge1xuICAgICAgICBjb25zdCB0b3VjaExpc3QgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCkudG91Y2hlcztcblxuICAgICAgICBPYmplY3Qua2V5cyh0b3VjaExpc3QpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgLy8gcmVjb3JkIGFsbCB0b3VjaGVzIHRoYXQgd2lsbCBiZSByZXN0b3JlZFxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2xlbmd0aCcpIHJldHVybjtcblxuICAgICAgICAgICAgY29uc3QgdG91Y2ggPSB0b3VjaExpc3Rba2V5XTtcblxuICAgICAgICAgICAgdG91Y2hSZWNvcmRzW3RvdWNoLmlkZW50aWZpZXJdID0gZ2V0UG9zaXRpb24odG91Y2gpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3RvdWNoc3RhcnQnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faXNEcmFnKSByZXR1cm47XG5cbiAgICAgICAgdXBkYXRlUmVjb3JkcyhldnQpO1xuXG4gICAgICAgIGxhc3RUb3VjaFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBsYXN0VG91Y2hJRCA9IGdldFRvdWNoSUQoZXZ0KTtcbiAgICAgICAgbGFzdFRvdWNoUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICAvLyBzdG9wIHNjcm9sbGluZ1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgbW92ZVZlbG9jaXR5LnggPSBtb3ZlVmVsb2NpdHkueSA9IDA7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAndG91Y2htb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lzRHJhZykgcmV0dXJuO1xuXG4gICAgICAgIHVwZGF0ZVJlY29yZHMoZXZ0KTtcblxuICAgICAgICBjb25zdCB0b3VjaElEID0gZ2V0VG91Y2hJRChldnQpO1xuICAgICAgICBjb25zdCB7IG9mZnNldCB9ID0gdGhpcztcblxuICAgICAgICBpZiAobGFzdFRvdWNoSUQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gcmVzZXQgbGFzdCB0b3VjaCBpbmZvIGZyb20gcmVjb3Jkc1xuICAgICAgICAgICAgbGFzdFRvdWNoSUQgPSB0b3VjaElEO1xuXG4gICAgICAgICAgICAvLyBkb24ndCBuZWVkIGVycm9yIGhhbmRsZXJcbiAgICAgICAgICAgIGxhc3RUb3VjaFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgbGFzdFRvdWNoUG9zID0gdG91Y2hSZWNvcmRzW3RvdWNoSURdO1xuICAgICAgICB9IGVsc2UgaWYgKHRvdWNoSUQgIT09IGxhc3RUb3VjaElEKSB7XG4gICAgICAgICAgICAvLyBwcmV2ZW50IG11bHRpLXRvdWNoIGJvdW5jaW5nXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxhc3RUb3VjaFBvcykgcmV0dXJuO1xuXG4gICAgICAgIGxldCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBsYXN0VG91Y2hUaW1lO1xuICAgICAgICBsZXQgeyB4OiBsYXN0WCwgeTogbGFzdFkgfSA9IGxhc3RUb3VjaFBvcztcbiAgICAgICAgbGV0IHsgeDogY3VyWCwgeTogY3VyWSB9ID0gbGFzdFRvdWNoUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uIHx8IDE7IC8vIGZpeCBJbmZpbml0eSBlcnJvclxuXG4gICAgICAgIG1vdmVWZWxvY2l0eS54ID0gKGxhc3RYIC0gY3VyWCkgLyBkdXJhdGlvbjtcbiAgICAgICAgbW92ZVZlbG9jaXR5LnkgPSAobGFzdFkgLSBjdXJZKSAvIGR1cmF0aW9uO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGludW91c1Njcm9sbGluZyAmJlxuICAgICAgICAgICAgdGhpcy5fX3Njcm9sbE9udG9FZGdlKGxhc3RYIC0gY3VyWCwgbGFzdFkgLSBjdXJZKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24obGFzdFggLSBjdXJYICsgb2Zmc2V0LngsIGxhc3RZIC0gY3VyWSArIG9mZnNldC55KTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICd0b3VjaGVuZCcsICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pc0RyYWcpIHJldHVybjtcblxuICAgICAgICAvLyByZWxlYXNlIGN1cnJlbnQgdG91Y2hcbiAgICAgICAgZGVsZXRlIHRvdWNoUmVjb3Jkc1tsYXN0VG91Y2hJRF07XG4gICAgICAgIGxhc3RUb3VjaElEID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCB7IHgsIHkgfSA9IG1vdmVWZWxvY2l0eTtcblxuICAgICAgICB4ICo9IDFlMztcbiAgICAgICAgeSAqPSAxZTM7XG5cbiAgICAgICAgY29uc3QgeyBzcGVlZCB9ID0gdGhpcy5vcHRpb25zO1xuXG4gICAgICAgIHRoaXMuX19zZXRNb3ZlbWVudChcbiAgICAgICAgICAgIE1hdGguYWJzKHgpID4gMTAgPyB4ICogc3BlZWQgOiAwLFxuICAgICAgICAgICAgTWF0aC5hYnMoeSkgPiAxMCA/IHkgKiBzcGVlZCA6IDBcbiAgICAgICAgKTtcblxuICAgICAgICBtb3ZlVmVsb2NpdHkueCA9IG1vdmVWZWxvY2l0eS55ID0gMDtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX190b3VjaEhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fdG91Y2hIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvdG91Y2guanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX21vdXNlSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgaXNPbmVPZiwgZ2V0UG9zaXRpb24gfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIE1vdXNlIGV2ZW50IGhhbmRsZXJzIGJ1aWxkZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uXG4gKi9cbmxldCBfX21vdXNlSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCB4QXhpcywgeUF4aXMgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGxldCBpc01vdXNlRG93biwgaXNNb3VzZU1vdmluZywgc3RhcnRPZmZzZXRUb1RodW1iLCBzdGFydFRyYWNrRGlyZWN0aW9uLCBjb250YWluZXJSZWN0O1xuXG4gICAgbGV0IGdldFRyYWNrRGlyID0gKGVsZW0pID0+IHtcbiAgICAgICAgaWYgKGlzT25lT2YoZWxlbSwgW3hBeGlzLnRyYWNrLCB4QXhpcy50aHVtYl0pKSByZXR1cm4gJ3gnO1xuICAgICAgICBpZiAoaXNPbmVPZihlbGVtLCBbeUF4aXMudHJhY2ssIHlBeGlzLnRodW1iXSkpIHJldHVybiAneSc7XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdjbGljaycsIChldnQpID0+IHtcbiAgICAgICAgaWYgKGlzTW91c2VNb3ZpbmcgfHwgIWlzT25lT2YoZXZ0LnRhcmdldCwgW3hBeGlzLnRyYWNrLCB5QXhpcy50cmFja10pKSByZXR1cm47XG5cbiAgICAgICAgbGV0IHRyYWNrID0gZXZ0LnRhcmdldDtcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IGdldFRyYWNrRGlyKHRyYWNrKTtcbiAgICAgICAgbGV0IHJlY3QgPSB0cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IGNsaWNrUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICBjb25zdCB7IHNpemUsIG9mZnNldCwgdGh1bWJTaXplIH0gPSB0aGlzO1xuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICd4Jykge1xuICAgICAgICAgICAgbGV0IGNsaWNrT2Zmc2V0ID0gKGNsaWNrUG9zLnggLSByZWN0LmxlZnQgLSB0aHVtYlNpemUueCAvIDIpIC8gKHNpemUuY29udGFpbmVyLndpZHRoIC0gKHRodW1iU2l6ZS54IC0gdGh1bWJTaXplLnJlYWxYKSk7XG4gICAgICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoY2xpY2tPZmZzZXQgKiBzaXplLmNvbnRlbnQud2lkdGggLSBvZmZzZXQueCwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgY2xpY2tPZmZzZXQgPSAoY2xpY2tQb3MueSAtIHJlY3QudG9wIC0gdGh1bWJTaXplLnkgLyAyKSAvIChzaXplLmNvbnRhaW5lci5oZWlnaHQgLSAodGh1bWJTaXplLnkgLSB0aHVtYlNpemUucmVhbFkpKTtcbiAgICAgICAgICAgIHRoaXMuX19zZXRNb3ZlbWVudCgwLCBjbGlja09mZnNldCAqIHNpemUuY29udGVudC5oZWlnaHQgLSBvZmZzZXQueSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdtb3VzZWRvd24nLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNPbmVPZihldnQudGFyZ2V0LCBbeEF4aXMudGh1bWIsIHlBeGlzLnRodW1iXSkpIHJldHVybjtcblxuICAgICAgICBpc01vdXNlRG93biA9IHRydWU7XG5cbiAgICAgICAgbGV0IGN1cnNvclBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG4gICAgICAgIGxldCB0aHVtYlJlY3QgPSBldnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIHN0YXJ0VHJhY2tEaXJlY3Rpb24gPSBnZXRUcmFja0RpcihldnQudGFyZ2V0KTtcblxuICAgICAgICAvLyBwb2ludGVyIG9mZnNldCB0byB0aHVtYlxuICAgICAgICBzdGFydE9mZnNldFRvVGh1bWIgPSB7XG4gICAgICAgICAgICB4OiBjdXJzb3JQb3MueCAtIHRodW1iUmVjdC5sZWZ0LFxuICAgICAgICAgICAgeTogY3Vyc29yUG9zLnkgLSB0aHVtYlJlY3QudG9wXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gY29udGFpbmVyIGJvdW5kaW5nIHJlY3RhbmdsZVxuICAgICAgICBjb250YWluZXJSZWN0ID0gdGhpcy50YXJnZXRzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNNb3VzZURvd24pIHJldHVybjtcblxuICAgICAgICBpc01vdXNlTW92aW5nID0gdHJ1ZTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IHsgc2l6ZSwgb2Zmc2V0IH0gPSB0aGlzO1xuICAgICAgICBsZXQgY3Vyc29yUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICBpZiAoc3RhcnRUcmFja0RpcmVjdGlvbiA9PT0gJ3gnKSB7XG4gICAgICAgICAgICAvLyBnZXQgcGVyY2VudGFnZSBvZiBwb2ludGVyIHBvc2l0aW9uIGluIHRyYWNrXG4gICAgICAgICAgICAvLyB0aGVuIHRyYW5mb3JtIHRvIHB4XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgICAgIChjdXJzb3JQb3MueCAtIHN0YXJ0T2Zmc2V0VG9UaHVtYi54IC0gY29udGFpbmVyUmVjdC5sZWZ0KSAvIChjb250YWluZXJSZWN0LnJpZ2h0IC0gY29udGFpbmVyUmVjdC5sZWZ0KSAqIHNpemUuY29udGVudC53aWR0aCxcbiAgICAgICAgICAgICAgICBvZmZzZXQueVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG9uJ3QgbmVlZCBlYXNpbmdcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgIG9mZnNldC54LFxuICAgICAgICAgICAgKGN1cnNvclBvcy55IC0gc3RhcnRPZmZzZXRUb1RodW1iLnkgLSBjb250YWluZXJSZWN0LnRvcCkgLyAoY29udGFpbmVyUmVjdC5ib3R0b20gLSBjb250YWluZXJSZWN0LnRvcCkgKiBzaXplLmNvbnRlbnQuaGVpZ2h0XG4gICAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyByZWxlYXNlIG1vdXNlbW92ZSBzcHkgb24gd2luZG93IGxvc3QgZm9jdXNcbiAgICB0aGlzLl9fYWRkRXZlbnQod2luZG93LCAnbW91c2V1cCBibHVyJywgKCkgPT4ge1xuICAgICAgICBpc01vdXNlRG93biA9IGlzTW91c2VNb3ZpbmcgPSBmYWxzZTtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19tb3VzZUhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fbW91c2VIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvbW91c2UuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3doZWVsSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0RGVsdGEgfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLy8gaXMgc3RhbmRhcmQgYHdoZWVsYCBldmVudCBzdXBwb3J0ZWQgY2hlY2tcbmNvbnN0IFdIRUVMX0VWRU5UID0gJ29ud2hlZWwnIGluIHdpbmRvdyA/ICd3aGVlbCcgOiAnbW91c2V3aGVlbCc7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBXaGVlbCBldmVudCBoYW5kbGVyIGJ1aWxkZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uXG4gKlxuICogQHJldHVybiB7RnVuY3Rpb259OiBldmVudCBoYW5kbGVyXG4gKi9cbmxldCBfX3doZWVsSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCBXSEVFTF9FVkVOVCwgKGV2dCkgPT4ge1xuICAgICAgICBjb25zdCB7IG9wdGlvbnMgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHsgeCwgeSB9ID0gZ2V0RGVsdGEoZXZ0KTtcblxuICAgICAgICBpZiAob3B0aW9ucy5jb250aW51b3VzU2Nyb2xsaW5nICYmIHRoaXMuX19zY3JvbGxPbnRvRWRnZSh4LCB5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX191cGRhdGVUaHJvdHRsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5fX2FkZE1vdmVtZW50KHggKiBvcHRpb25zLnNwZWVkLCB5ICogb3B0aW9ucy5zcGVlZCk7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fd2hlZWxIYW5kbGVyJywge1xuICAgIHZhbHVlOiBfX3doZWVsSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3doZWVsLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19yZXNpemVIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogV2hlZWwgZXZlbnQgaGFuZGxlciBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufTogZXZlbnQgaGFuZGxlclxuICovXG5sZXQgX19yZXNpemVIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fX2FkZEV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuX191cGRhdGVUaHJvdHRsZSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVzaXplSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19yZXNpemVIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvcmVzaXplLmpzXG4gKiovIiwiLyoqXHJcbiAqIEBtb2R1bGVcclxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2VsZWN0SGFuZGxlclxyXG4gKi9cclxuXHJcbiBpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcclxuIGltcG9ydCB7IHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMvJztcclxuXHJcbiBleHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcclxuXHJcbi8vIHRvZG86IHNlbGVjdCBoYW5kbGVyIGZvciB0b3VjaCBzY3JlZW5cclxuIGxldCBfX3NlbGVjdEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGxldCBpc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IHsgY29udGFpbmVyLCBjb250ZW50IH0gPSB0aGlzLnRhcmdldHM7XHJcblxyXG4gICAgbGV0IHNjcm9sbCA9ICh7IHgsIHkgfSkgPT4ge1xyXG4gICAgICAgIGlmICgheCAmJiAheSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgeyBzcGVlZCB9ID0gdGhpcy5vcHRpb25zO1xyXG5cclxuICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoeCAqIHNwZWVkLCB5ICogc3BlZWQpO1xyXG5cclxuICAgICAgICBhbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICAgICAgICBzY3JvbGwoeyB4LCB5IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgc2V0U2VsZWN0ID0gKHZhbHVlID0gJycpID0+IHtcclxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgJy11c2VyLXNlbGVjdCc6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgaWYgKCFpc1NlbGVjdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XHJcblxyXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX19nZXRQb2ludGVyVHJlbmQoZXZ0KTtcclxuXHJcbiAgICAgICAgc2Nyb2xsKGRpcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGVudCwgJ3NlbGVjdHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9fZXZlbnRGcm9tQ2hpbGRTY3JvbGxiYXIoZXZ0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0U2VsZWN0KCdub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcclxuICAgICAgICBpc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIGJsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcclxuICAgICAgICBzZXRTZWxlY3QoKTtcclxuXHJcbiAgICAgICAgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gdGVtcCBwYXRjaCBmb3IgdG91Y2ggZGV2aWNlc1xyXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3Njcm9sbCcsIChldnQpID0+IHtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xyXG4gICAgfSk7XHJcbiB9O1xyXG5cclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZWxlY3RIYW5kbGVyJywge1xyXG4gICAgIHZhbHVlOiBfX3NlbGVjdEhhbmRsZXIsXHJcbiAgICAgd3JpdGFibGU6IHRydWUsXHJcbiAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiB9KTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3NlbGVjdC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fa2V5Ym9hcmRIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIEtleXByZXNzIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqL1xubGV0IF9fa2V5Ym9hcmRIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyB0YXJnZXRzLCBvcHRpb25zIH0gPSB0aGlzO1xuXG4gICAgbGV0IGdldEtleURlbHRhID0gKGtleUNvZGUpID0+IHtcbiAgICAgICAgLy8ga2V5IG1hcHMgW2RlbHRhWCwgZGVsdGFZLCB1c2VTZXRNZXRob2RdXG4gICAgICAgIGxldCB7IHNpemUsIG9mZnNldCwgbGltaXQsIG1vdmVtZW50IH0gPSB0aGlzOyAvLyBuZWVkIHJlYWwgdGltZSBkYXRhXG5cbiAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XG4gICAgICAgICAgICBjYXNlIDMyOiAvLyBzcGFjZVxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgMjAwXTtcbiAgICAgICAgICAgIGNhc2UgMzM6IC8vIHBhZ2VVcFxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgLXNpemUuY29udGFpbmVyLmhlaWdodCArIDQwXTtcbiAgICAgICAgICAgIGNhc2UgMzQ6IC8vIHBhZ2VEb3duXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCBzaXplLmNvbnRhaW5lci5oZWlnaHQgLSA0MF07XG4gICAgICAgICAgICBjYXNlIDM1OiAvLyBlbmRcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIE1hdGguYWJzKG1vdmVtZW50LnkpICsgbGltaXQueSAtIG9mZnNldC55XTtcbiAgICAgICAgICAgIGNhc2UgMzY6IC8vIGhvbWVcbiAgICAgICAgICAgICAgICByZXR1cm4gWzAsIC1NYXRoLmFicyhtb3ZlbWVudC55KSAtIG9mZnNldC55XTtcbiAgICAgICAgICAgIGNhc2UgMzc6IC8vIGxlZnRcbiAgICAgICAgICAgICAgICByZXR1cm4gWy00MCwgMF07XG4gICAgICAgICAgICBjYXNlIDM4OiAvLyB1cFxuICAgICAgICAgICAgICAgIHJldHVybiBbMCwgLTQwXTtcbiAgICAgICAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XG4gICAgICAgICAgICAgICAgcmV0dXJuIFs0MCwgMF07XG4gICAgICAgICAgICBjYXNlIDQwOiAvLyBkb3duXG4gICAgICAgICAgICAgICAgcmV0dXJuIFswLCA0MF07XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0YXJnZXRzO1xuXG4gICAgbGV0IGlzRm9jdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICBpc0ZvY3VzZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgIGlzRm9jdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2tleWRvd24nLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNGb2N1c2VkKSByZXR1cm47XG5cbiAgICAgICAgZXZ0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgICAgIGxldCBkZWx0YSA9IGdldEtleURlbHRhKGV2dC5rZXlDb2RlIHx8IGV2dC53aGljaCk7XG5cbiAgICAgICAgaWYgKCFkZWx0YSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IFt4LCB5XSA9IGRlbHRhO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNvbnRpbnVvdXNTY3JvbGxpbmcgJiYgdGhpcy5fX3Njcm9sbE9udG9FZGdlKHgsIHkpKSB7XG4gICAgICAgICAgICBjb250YWluZXIuYmx1cigpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50c1swXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fX3VwZGF0ZVRocm90dGxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCB7IHNwZWVkIH0gPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHRoaXMuX19hZGRNb3ZlbWVudCh4ICogc3BlZWQsIHkgKiBzcGVlZCk7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fa2V5Ym9hcmRIYW5kbGVyJywge1xuICAgIHZhbHVlOiBfX2tleWJvYXJkSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2tleWJvYXJkLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfZ2V0SXRlcmF0b3IgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvclwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfaXNJdGVyYWJsZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvaXMtaXRlcmFibGVcIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcbiAgICB2YXIgX24gPSB0cnVlO1xuICAgIHZhciBfZCA9IGZhbHNlO1xuICAgIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaSA9IF9nZXRJdGVyYXRvcihhcnIpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuXG4gICAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kID0gdHJ1ZTtcbiAgICAgIF9lID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kKSB0aHJvdyBfZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2FycjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9IGVsc2UgaWYgKF9pc0l0ZXJhYmxlKE9iamVjdChhcnIpKSkge1xuICAgICAgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG4gICAgfVxuICB9O1xufSkoKTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvc2xpY2VkLXRvLWFycmF5LmpzXG4gKiogbW9kdWxlIGlkID0gMTMyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vaXMtaXRlcmFibGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvaXMtaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMzNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5pcy1pdGVyYWJsZScpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NvcmUtanMvbGlicmFyeS9mbi9pcy1pdGVyYWJsZS5qc1xuICoqIG1vZHVsZSBpZCA9IDEzNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5jb3JlJykuaXNJdGVyYWJsZSA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8gPSBPYmplY3QoaXQpO1xuICByZXR1cm4gT1tJVEVSQVRPUl0gIT09IHVuZGVmaW5lZFxuICAgIHx8ICdAQGl0ZXJhdG9yJyBpbiBPXG4gICAgfHwgSXRlcmF0b3JzLmhhc093blByb3BlcnR5KGNsYXNzb2YoTykpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmlzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTM1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlYWRvbmx5JztcbmV4cG9ydCAqIGZyb20gJy4vYWRkX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vdXBkYXRlX3RyZWUnO1xuZXhwb3J0ICogZnJvbSAnLi9pbml0X29wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbml0X3Njcm9sbGJhcic7XG5leHBvcnQgKiBmcm9tICcuL2dldF9kZWx0YV9saW1pdCc7XG5leHBvcnQgKiBmcm9tICcuL3VwZGF0ZV9ib3VuZGluZyc7XG5leHBvcnQgKiBmcm9tICcuL3Njcm9sbF9vbnRvX2VkZ2UnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9pbnRlcl90cmVuZCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF90aHVtYl9wb3NpdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL2V2ZW50X2Zyb21fY2hpbGRfc2Nyb2xsYmFyJztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3JlYWRvbmx5XG4gKiBAZGVwZW5kZW5jaWVzIFsgU21vb3RoU2Nyb2xsYmFyIF1cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIGNyZWF0ZSByZWFkb25seSBwcm9wZXJ0eVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FueX0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gX19yZWFkb25seShwcm9wLCB2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcCwge1xuICAgICAgICB2YWx1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVhZG9ubHknLCB7XG4gICAgdmFsdWU6IF9fcmVhZG9ubHksXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9yZWFkb25seS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fYWRkRXZlbnRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fYWRkRXZlbnQoZWxlbSwgZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgaWYgKCFlbGVtIHx8IHR5cGVvZiBlbGVtLmFkZEV2ZW50TGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IGVsZW0gdG8gYmUgYSBET00gZWxlbWVudCwgYnV0IGdvdCAke2VsZW19YCk7XG4gICAgfVxuXG4gICAgbGV0IGZuID0gKGV2dCwgLi4uYXJncykgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgZGVmYXVsdCBwcmV2ZW50ZWQgZXZlbnRzIG9yIHVzZXIgaWdub3JlZCBldmVudHNcbiAgICAgICAgaWYgKCghZXZ0LnR5cGUubWF0Y2goL2RyYWcvKSAmJiBldnQuZGVmYXVsdFByZXZlbnRlZCkpIHJldHVybjtcblxuICAgICAgICBoYW5kbGVyKGV2dCwgLi4uYXJncyk7XG4gICAgfTtcblxuICAgIGV2ZW50cy5zcGxpdCgvXFxzKy9nKS5mb3JFYWNoKChldnQpID0+IHtcbiAgICAgICAgdGhpcy5fX2hhbmRsZXJzLnB1c2goeyBldnQsIGVsZW0sIGZuLCBoYXNSZWdpc3RlcmVkOiB0cnVlIH0pO1xuXG4gICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZuKTtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19hZGRFdmVudCcsIHtcbiAgICB2YWx1ZTogX19hZGRFdmVudCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9hZGRfZXZlbnQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3VwZGF0ZVRyZWVcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IHNiTGlzdCwgc2VsZWN0b3JzIH0gZnJvbSAnLi4vc2hhcmVkLyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX3VwZGF0ZVRyZWUoKSB7XG4gICAgbGV0IHsgY29udGFpbmVyLCBjb250ZW50IH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICB0aGlzLl9fcmVhZG9ubHkoJ2NoaWxkcmVuJywgWy4uLmNvbnRlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpXSk7XG4gICAgdGhpcy5fX3JlYWRvbmx5KCdpc05lc3RlZFNjcm9sbGJhcicsIGZhbHNlKTtcblxuICAgIGNvbnN0IHBhcmVudHMgPSBbXTtcblxuICAgIHdoaWxlIChjb250YWluZXIpIHtcbiAgICAgICAgY29udGFpbmVyID0gY29udGFpbmVyLnBhcmVudEVsZW1lbnQ7XG5cbiAgICAgICAgaWYgKHNiTGlzdC5oYXMoY29udGFpbmVyKSkge1xuICAgICAgICAgICAgdGhpcy5fX3JlYWRvbmx5KCdpc05lc3RlZFNjcm9sbGJhcicsIHRydWUpO1xuICAgICAgICAgICAgcGFyZW50cy5wdXNoKGNvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fcmVhZG9ubHkoJ3BhcmVudHMnLCBwYXJlbnRzKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX191cGRhdGVUcmVlJywge1xuICAgIHZhbHVlOiBfX3VwZGF0ZVRyZWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy91cGRhdGVfdHJlZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9faW5pdE9wdGlvbnNcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9faW5pdE9wdGlvbnModXNlclByZWZlcmVuY2UpIHtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBzcGVlZDogMSwgICAgICAgICAgICAgICAgICAgLy8gc2Nyb2xsIHNwZWVkIHNjYWxlXG4gICAgICAgIGZyaWN0aW9uOiAxMCwgICAgICAgICAgICAgICAvLyBmcmljdGlvbiBmYWN0b3IsIHBlcmNlbnRcbiAgICAgICAgaWdub3JlRXZlbnRzOiBbXSwgICAgICAgICAgIC8vIGV2ZW50cyBuYW1lcyB0byBiZSBpZ25vcmVkXG4gICAgICAgIHRodW1iTWluU2l6ZTogMjAsICAgICAgICAgICAvLyBtaW4gc2l6ZSBmb3Igc2Nyb2xsYmFyIHRodW1iXG4gICAgICAgIHJlbmRlckJ5UGl4ZWxzOiB0cnVlLCAgICAgICAvLyByZW5kZXJpbmcgYnkgaW50ZWdlciBwaXhlbHNcbiAgICAgICAgY29udGludW91c1Njcm9sbGluZzogJ2F1dG8nIC8vIGFsbG93IHVwZXIgc2Nyb2xsYWJsZSBjb250ZW50IHRvIHNjcm9sbCB3aGVuIHJlYWNoaW5nIGVkZ2VcbiAgICB9O1xuXG4gICAgY29uc3QgbGltaXQgPSB7XG4gICAgICAgIGZyaWN0aW9uOiBbMCwgMTAwXSxcbiAgICAgICAgc3BlZWQ6IFswLCBJbmZpbml0eV0sXG4gICAgICAgIHRodW1iTWluU2l6ZTogWzAsIEluZmluaXR5XVxuICAgIH07XG5cbiAgICBsZXQgZ2V0U2Nyb2xsTW9kZSA9IChtb2RlID0gJ2F1dG8nKSA9PiB7XG4gICAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICAgICAgY2FzZSAnYXV0byc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNOZXN0ZWRTY3JvbGxiYXI7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAhIW1vZGU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb3B0aW9uQWNjZXNzb3JzID0ge1xuICAgICAgICAvLyBkZXByZWNhdGVkXG4gICAgICAgIHNldCBpZ25vcmVFdmVudHModikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdgb3B0aW9ucy5pZ25vcmVFdmVudHNgIHBhcmFtZXRlciBpcyBkZXByZWNhdGVkLCB1c2UgYGluc3RhbmNlI3VucmVnaXN0ZXJFdmVudHMoKWAgbWV0aG9kIGluc3RlYWQuIGh0dHBzOi8vZ2l0aHViLmNvbS9pZGlvdFd1L3Ntb290aC1zY3JvbGxiYXIvd2lraS9JbnN0YW5jZS1NZXRob2RzI2luc3RhbmNldW5yZWdpc3RlcmV2ZW50cy1yZWdleC0tcmVnZXgtcmVnZXgtLScpO1xuICAgICAgICB9LFxuICAgICAgICBnZXQgcmVuZGVyQnlQaXhlbHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5yZW5kZXJCeVBpeGVscztcbiAgICAgICAgfSxcbiAgICAgICAgc2V0IHJlbmRlckJ5UGl4ZWxzKHYpIHtcbiAgICAgICAgICAgIG9wdGlvbnMucmVuZGVyQnlQaXhlbHMgPSAhIXY7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCBjb250aW51b3VzU2Nyb2xsaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFNjcm9sbE1vZGUob3B0aW9ucy5jb250aW51b3VzU2Nyb2xsaW5nKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0IGNvbnRpbnVvdXNTY3JvbGxpbmcodikge1xuICAgICAgICAgICAgaWYgKHYgPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuY29udGludW91c1Njcm9sbGluZyA9IHY7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuY29udGludW91c1Njcm9sbGluZyA9ICEhdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKVxuICAgICAgICAuZmlsdGVyKChwcm9wKSA9PiAhb3B0aW9uQWNjZXNzb3JzLmhhc093blByb3BlcnR5KHByb3ApKVxuICAgICAgICAuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9wdGlvbkFjY2Vzc29ycywgcHJvcCwge1xuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9uc1twcm9wXTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldCh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KHYpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IFxcYG9wdGlvbnMuJHtwcm9wfVxcYCB0byBiZSBhIG51bWJlciwgYnV0IGdvdCAke3R5cGVvZiB2fWApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uc1twcm9wXSA9IHBpY2tJblJhbmdlKHYsIC4uLmxpbWl0W3Byb3BdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICB0aGlzLl9fcmVhZG9ubHkoJ29wdGlvbnMnLCBvcHRpb25BY2Nlc3NvcnMpO1xuICAgIHRoaXMuc2V0T3B0aW9ucyh1c2VyUHJlZmVyZW5jZSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19faW5pdE9wdGlvbnMnLCB7XG4gICAgdmFsdWU6IF9faW5pdE9wdGlvbnMsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5pdF9vcHRpb25zLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19pbml0U2Nyb2xsYmFyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBpbml0aWFsaXplIHNjcm9sbGJhclxuICpcbiAqIFRoaXMgbWV0aG9kIHdpbGwgYXR0YWNoIHNldmVyYWwgbGlzdGVuZXJzIHRvIGVsZW1lbnRzXG4gKiBhbmQgY3JlYXRlIGEgZGVzdHJveSBtZXRob2QgdG8gcmVtb3ZlIGxpc3RlbmVyc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb246IGFzIGlzIGV4cGxhaW5lZCBpbiBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBfX2luaXRTY3JvbGxiYXIoKSB7XG4gICAgdGhpcy51cGRhdGUoKTsgLy8gaW5pdGlhbGl6ZSB0aHVtYiBwb3NpdGlvblxuXG4gICAgdGhpcy5fX2tleWJvYXJkSGFuZGxlcigpO1xuICAgIHRoaXMuX19yZXNpemVIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3NlbGVjdEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fbW91c2VIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3RvdWNoSGFuZGxlcigpO1xuICAgIHRoaXMuX193aGVlbEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fZHJhZ0hhbmRsZXIoKTtcblxuICAgIHRoaXMuX19yZW5kZXIoKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19pbml0U2Nyb2xsYmFyJywge1xuICAgIHZhbHVlOiBfX2luaXRTY3JvbGxiYXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9pbml0X3Njcm9sbGJhci5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fZ2V0RGVsdGFMaW1pdFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19nZXREZWx0YUxpbWl0KCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBsaW1pdFxuICAgIH0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogWy1vZmZzZXQueCwgbGltaXQueCAtIG9mZnNldC54XSxcbiAgICAgICAgeTogWy1vZmZzZXQueSwgbGltaXQueSAtIG9mZnNldC55XVxuICAgIH07XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fZ2V0RGVsdGFMaW1pdCcsIHtcbiAgICB2YWx1ZTogX19nZXREZWx0YUxpbWl0LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2dldF9kZWx0YV9saW1pdC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fdXBkYXRlQm91bmRpbmdcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fdXBkYXRlQm91bmRpbmcoKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcbiAgICBjb25zdCB7IHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCB9ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHsgaW5uZXJIZWlnaHQsIGlubmVyV2lkdGggfSA9IHdpbmRvdztcblxuICAgIHRoaXMuX19yZWFkb25seSgnYm91bmRpbmcnLCB7XG4gICAgICAgIHRvcDogTWF0aC5tYXgodG9wLCAwKSxcbiAgICAgICAgcmlnaHQ6IE1hdGgubWluKHJpZ2h0LCBpbm5lcldpZHRoKSxcbiAgICAgICAgYm90dG9tOiBNYXRoLm1pbihib3R0b20sIGlubmVySGVpZ2h0KSxcbiAgICAgICAgbGVmdDpNYXRoLm1heChsZWZ0LCAwKVxuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3VwZGF0ZUJvdW5kaW5nJywge1xuICAgIHZhbHVlOiBfX3VwZGF0ZUJvdW5kaW5nLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2JvdW5kaW5nLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19zY3JvbGxPbnRvRWRnZVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19zY3JvbGxPbnRvRWRnZShkZWx0YVgsIGRlbHRhWSkge1xuICAgIGNvbnN0IHsgb2Zmc2V0LCBsaW1pdCB9ID0gdGhpcztcblxuICAgIGxldCBkZXN0WCA9IHBpY2tJblJhbmdlKGRlbHRhWCArIG9mZnNldC54LCAwLCBsaW1pdC54KTtcbiAgICBsZXQgZGVzdFkgPSBwaWNrSW5SYW5nZShkZWx0YVkgKyBvZmZzZXQueSwgMCwgbGltaXQueSk7XG5cbiAgICBpZiAoZGVzdFggPT09IG9mZnNldC54ICYmIGRlc3RZID09PSBvZmZzZXQueSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fc2Nyb2xsT250b0VkZ2UnLCB7XG4gICAgdmFsdWU6IF9fc2Nyb2xsT250b0VkZ2UsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvc2Nyb2xsX29udG9fZWRnZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fZ2V0UG9pbnRlclRyZW5kXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXRQb3NpdGlvbiB9IGZyb20gJy4uL3V0aWxzLyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2dldFBvaW50ZXJUcmVuZChldnQsIHBhZGRpbmcgPSAwKSB7XG4gICAgY29uc3QgeyB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQgfSA9IHRoaXMuYm91bmRpbmc7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgY29uc3QgcmVzID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGlmICh4ID09PSAwICYmIHkgPT09IDApIHJldHVybiByZXM7XG5cbiAgICBpZiAoeCA+IHJpZ2h0IC0gcGFkZGluZykge1xuICAgICAgICByZXMueCA9ICh4IC0gcmlnaHQgKyBwYWRkaW5nKTtcbiAgICB9IGVsc2UgaWYgKHggPCBsZWZ0ICsgcGFkZGluZykge1xuICAgICAgICByZXMueCA9ICh4IC0gbGVmdCAtIHBhZGRpbmcpO1xuICAgIH1cblxuICAgIGlmICh5ID4gYm90dG9tIC0gcGFkZGluZykge1xuICAgICAgICByZXMueSA9ICh5IC0gYm90dG9tICsgcGFkZGluZyk7XG4gICAgfSBlbHNlIGlmICh5IDwgdG9wICsgcGFkZGluZykge1xuICAgICAgICByZXMueSA9ICh5IC0gdG9wIC0gcGFkZGluZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19nZXRQb2ludGVyVHJlbmQnLCB7XG4gICAgdmFsdWU6IF9fZ2V0UG9pbnRlclRyZW5kLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2dldF9wb2ludGVyX3RyZW5kLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19zZXRUaHVtYlBvc2l0aW9uXG4gKi9cblxuaW1wb3J0IHsgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBTZXQgdGh1bWIgcG9zaXRpb24gaW4gdHJhY2tcbiAqL1xuZnVuY3Rpb24gX19zZXRUaHVtYlBvc2l0aW9uKCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0cywgc2l6ZSwgb2Zmc2V0LCB0aHVtYlNpemUgfSA9IHRoaXM7XG5cbiAgICBsZXQgdGh1bWJQb3NpdGlvblggPSBvZmZzZXQueCAvIHNpemUuY29udGVudC53aWR0aCAqIChzaXplLmNvbnRhaW5lci53aWR0aCAtICh0aHVtYlNpemUueCAtIHRodW1iU2l6ZS5yZWFsWCkpO1xuICAgIGxldCB0aHVtYlBvc2l0aW9uWSA9IG9mZnNldC55IC8gc2l6ZS5jb250ZW50LmhlaWdodCAqIChzaXplLmNvbnRhaW5lci5oZWlnaHQgLSAodGh1bWJTaXplLnkgLSB0aHVtYlNpemUucmVhbFkpKTtcblxuICAgIHNldFN0eWxlKHRhcmdldHMueEF4aXMudGh1bWIsIHtcbiAgICAgICAgJy10cmFuc2Zvcm0nOiAgYHRyYW5zbGF0ZTNkKCR7dGh1bWJQb3NpdGlvblh9cHgsIDAsIDApYFxuICAgIH0pO1xuXG4gICAgc2V0U3R5bGUodGFyZ2V0cy55QXhpcy50aHVtYiwge1xuICAgICAgICAnLXRyYW5zZm9ybSc6IGB0cmFuc2xhdGUzZCgwLCAke3RodW1iUG9zaXRpb25ZfXB4LCAwKWBcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZXRUaHVtYlBvc2l0aW9uJywge1xuICAgIHZhbHVlOiBfX3NldFRodW1iUG9zaXRpb24sXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9zZXRfdGh1bWJfcG9zaXRpb24uanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2V2ZW50RnJvbUNoaWxkU2Nyb2xsYmFyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2V2ZW50RnJvbUNoaWxkU2Nyb2xsYmFyKHsgdGFyZ2V0IH0gPSB7fSkge1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLnNvbWUoKHNiKSA9PiBzYi5jb250YWlucyh0YXJnZXQpKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19ldmVudEZyb21DaGlsZFNjcm9sbGJhcicsIHtcbiAgICB2YWx1ZTogX19ldmVudEZyb21DaGlsZFNjcm9sbGJhcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9ldmVudF9mcm9tX2NoaWxkX3Njcm9sbGJhci5qc1xuICoqLyIsImltcG9ydCBTY3JvbGxiYXIgZnJvbSAnLi4vLi4vc3JjLyc7XG5cbmNvbnN0IERQUiA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuXG5jb25zdCBzaXplID0ge1xuICAgIHdpZHRoOiAyNTAsXG4gICAgaGVpZ2h0OiAxNTBcbn07XG5cbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3Jyk7XG5jb25zdCBzY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50JykpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5jb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgc2Nyb2xsYmFyLm9wdGlvbnMpO1xuXG5jYW52YXMud2lkdGggPSBzaXplLndpZHRoICogRFBSO1xuY2FudmFzLmhlaWdodCA9IHNpemUuaGVpZ2h0ICogRFBSO1xuY3R4LnNjYWxlKERQUiwgRFBSKTtcblxuY3R4LnN0cm9rZVN0eWxlID0gJyM5NGE2YjcnO1xuY3R4LmZpbGxTdHlsZSA9ICcjYWJjJztcblxubGV0IHNob3VsZFVwZGF0ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoIXNob3VsZFVwZGF0ZSkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgfVxuXG4gICAgbGV0IGRvdHMgPSBjYWxjRG90cygpO1xuXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG5cbiAgICBsZXQgc2NhbGVYID0gKHNpemUud2lkdGggLyBkb3RzLmxlbmd0aCkgKiAob3B0aW9ucy5zcGVlZCAvIDIwICsgMC41KTtcbiAgICBkb3RzLmZvckVhY2goKFt4LCB5XSkgPT4ge1xuICAgICAgICBjdHgubGluZVRvKHggKiBzY2FsZVgsIHkpO1xuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgbGV0IFt4LCB5XSA9IGRvdHNbZG90cy5sZW5ndGggLSAxXTtcbiAgICBjdHgubGluZVRvKHggKiBzY2FsZVgsIHkpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBzaG91bGRVcGRhdGUgPSBmYWxzZTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xufTtcblxucmVuZGVyKCk7XG5cbmZ1bmN0aW9uIGNhbGNEb3RzKCkge1xuICAgIGxldCB7XG4gICAgICAgIHNwZWVkLFxuICAgICAgICBmcmljdGlvblxuICAgIH0gPSBvcHRpb25zO1xuXG4gICAgbGV0IGRvdHMgPSBbXTtcblxuICAgIGxldCB4ID0gMDtcbiAgICBsZXQgeSA9IChzcGVlZCAvIDIwICsgMC41KSAqIHNpemUuaGVpZ2h0O1xuXG4gICAgd2hpbGUoeSA+IDAuMSkge1xuICAgICAgICBkb3RzLnB1c2goW3gsIHldKTtcblxuICAgICAgICB5ICo9ICgxIC0gZnJpY3Rpb24gLyAxMDApO1xuICAgICAgICB4Kys7XG4gICAgfVxuXG4gICAgZG90cy5wdXNoKFt4LCAwXSk7XG5cbiAgICByZXR1cm4gZG90cztcbn07XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ZXJzaW9uJykudGV4dENvbnRlbnQgPSBgdiR7U2Nyb2xsYmFyLnZlcnNpb259YDtcblxuWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcHRpb25zJyldLmZvckVhY2goKGVsKSA9PiB7XG4gICAgY29uc3QgcHJvcCA9IGVsLm5hbWU7XG4gICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAub3B0aW9uLSR7cHJvcH1gKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IG9wdGlvbnNbcHJvcF0gPSBwYXJzZUZsb2F0KGVsLnZhbHVlKTtcbiAgICAgICAgc2Nyb2xsYmFyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgfSk7XG59KTtcblxuY29uc3QgaW5uZXJTY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbm5lci1zY3JvbGxiYXInKSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250aW51b3VzJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICBpbm5lclNjcm9sbGJhci5zZXRPcHRpb25zKHtcbiAgICAgICAgY29udGludW91c1Njcm9sbGluZzogdGFyZ2V0LmNoZWNrZWRcbiAgICB9KTtcbn0pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjcmVuZGVyQnlQaXhlbHMnKS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoeyB0YXJnZXQgfSkgPT4ge1xuICAgIFNjcm9sbGJhci5nZXRBbGwoKS5mb3JFYWNoKChzKSA9PiB7XG4gICAgICAgIHMuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICByZW5kZXJCeVBpeGVsczogdGFyZ2V0LmNoZWNrZWRcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxucmVuZGVyKCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9wcmV2aWV3LmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==