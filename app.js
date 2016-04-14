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
	
	__webpack_require__(145);
	
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
	
	__webpack_require__(118);
	
	__webpack_require__(122);
	
	__webpack_require__(134);
	
	exports['default'] = _smooth_scrollbar.SmoothScrollbar;
	
	_smooth_scrollbar.SmoothScrollbar.version = '5.3.0';
	
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
	    }).__readonly('bounding', {
	        top: 0,
	        right: 0,
	        bottom: 0,
	        left: 0
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
	
	var _is_visible = __webpack_require__(146);
	
	_defaults(exports, _interopExportWildcard(_is_visible, _defaults));
	
	var _set_options = __webpack_require__(105);
	
	_defaults(exports, _interopExportWildcard(_set_options, _defaults));
	
	var _set_position = __webpack_require__(111);
	
	_defaults(exports, _interopExportWildcard(_set_position, _defaults));
	
	var _toggle_track = __webpack_require__(113);
	
	_defaults(exports, _interopExportWildcard(_toggle_track, _defaults));
	
	var _clear_movement = __webpack_require__(114);
	
	_defaults(exports, _interopExportWildcard(_clear_movement, _defaults));
	
	var _infinite_scroll = __webpack_require__(115);
	
	_defaults(exports, _interopExportWildcard(_infinite_scroll, _defaults));
	
	var _get_content_elem = __webpack_require__(116);
	
	_defaults(exports, _interopExportWildcard(_get_content_elem, _defaults));
	
	var _scroll_into_view = __webpack_require__(117);
	
	_defaults(exports, _interopExportWildcard(_scroll_into_view, _defaults));

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
/* 110 */,
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} setPosition
	 */
	
	'use strict';
	
	var _extends = __webpack_require__(112)['default'];
	
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
/* 112 */
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
/* 113 */
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
/* 114 */
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
/* 115 */
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
/* 116 */
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
/* 117 */
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
	    var movement = this.movement;
	
	    if (!elem || !targets.container.contains(elem)) return;
	
	    var targetBounding = elem.getBoundingClientRect();
	
	    if (onlyScrollIfNeeded && this.isVisible(elem)) return;
	
	    this.__setMovement(targetBounding.left - bounding.left - offsetLeft, targetBounding.top - bounding.top - offsetTop, true);
	};

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _render = __webpack_require__(119);
	
	_defaults(exports, _interopExportWildcard(_render, _defaults));
	
	var _add_movement = __webpack_require__(120);
	
	_defaults(exports, _interopExportWildcard(_add_movement, _defaults));
	
	var _set_movement = __webpack_require__(121);
	
	_defaults(exports, _interopExportWildcard(_set_movement, _defaults));

/***/ },
/* 119 */
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
/* 120 */
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
/* 121 */
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
	    var ignoreSpeed = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	    var options = this.options;
	    var movement = this.movement;
	
	    this.__updateThrottle();
	
	    var limit = this.__getDeltaLimit();
	    var speed = ignoreSpeed ? 1 : options.speed;
	
	    movement.x = _utils.pickInRange.apply(undefined, [deltaX * speed].concat(_toConsumableArray(limit.x)));
	    movement.y = _utils.pickInRange.apply(undefined, [deltaY * speed].concat(_toConsumableArray(limit.y)));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__setMovement', {
	    value: __setMovement,
	    writable: true,
	    configurable: true
	});

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _drag = __webpack_require__(123);
	
	_defaults(exports, _interopExportWildcard(_drag, _defaults));
	
	var _touch = __webpack_require__(124);
	
	_defaults(exports, _interopExportWildcard(_touch, _defaults));
	
	var _mouse = __webpack_require__(125);
	
	_defaults(exports, _interopExportWildcard(_mouse, _defaults));
	
	var _wheel = __webpack_require__(126);
	
	_defaults(exports, _interopExportWildcard(_wheel, _defaults));
	
	var _resize = __webpack_require__(127);
	
	_defaults(exports, _interopExportWildcard(_resize, _defaults));
	
	var _select = __webpack_require__(128);
	
	_defaults(exports, _interopExportWildcard(_select, _defaults));
	
	var _keyboard = __webpack_require__(129);
	
	_defaults(exports, _interopExportWildcard(_keyboard, _defaults));

/***/ },
/* 123 */
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
/* 124 */
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
	
	        updateRecords(evt);
	
	        lastTouchTime = Date.now();
	        lastTouchID = (0, _utilsIndex.getTouchID)(evt);
	        lastTouchPos = (0, _utilsIndex.getPosition)(evt);
	
	        // stop scrolling
	        _this.stop();
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
/* 125 */
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
	            _this.__setMovement(clickOffset * size.content.width - offset.x, 0, true);
	        } else {
	            var clickOffset = (clickPos.y - rect.top - thumbSize.y / 2) / (size.container.height - (thumbSize.y - thumbSize.realY));
	            _this.__setMovement(0, clickOffset * size.content.height - offset.y, true);
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
/* 126 */
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
/* 127 */
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
/* 128 */
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
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __keyboardHandler
	 */
	
	'use strict';
	
	var _slicedToArray = __webpack_require__(130)['default'];
	
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
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _getIterator = __webpack_require__(91)["default"];
	
	var _isIterable = __webpack_require__(131)["default"];
	
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
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(132), __esModule: true };

/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(71);
	__webpack_require__(19);
	module.exports = __webpack_require__(133);

/***/ },
/* 133 */
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
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(54)['default'];
	
	var _interopExportWildcard = __webpack_require__(66)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _readonly = __webpack_require__(135);
	
	_defaults(exports, _interopExportWildcard(_readonly, _defaults));
	
	var _add_event = __webpack_require__(136);
	
	_defaults(exports, _interopExportWildcard(_add_event, _defaults));
	
	var _init_options = __webpack_require__(137);
	
	_defaults(exports, _interopExportWildcard(_init_options, _defaults));
	
	var _ignore_event = __webpack_require__(138);
	
	_defaults(exports, _interopExportWildcard(_ignore_event, _defaults));
	
	var _init_scrollbar = __webpack_require__(139);
	
	_defaults(exports, _interopExportWildcard(_init_scrollbar, _defaults));
	
	var _get_delta_limit = __webpack_require__(140);
	
	_defaults(exports, _interopExportWildcard(_get_delta_limit, _defaults));
	
	var _update_children = __webpack_require__(141);
	
	_defaults(exports, _interopExportWildcard(_update_children, _defaults));
	
	var _update_bounding = __webpack_require__(142);
	
	_defaults(exports, _interopExportWildcard(_update_bounding, _defaults));
	
	var _get_pointer_trend = __webpack_require__(143);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_trend, _defaults));
	
	var _set_thumb_position = __webpack_require__(144);
	
	_defaults(exports, _interopExportWildcard(_set_thumb_position, _defaults));

/***/ },
/* 135 */
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
/* 136 */
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
/* 137 */
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
/* 138 */
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
/* 139 */
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
/* 140 */
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
/* 141 */
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
/* 142 */
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
/* 143 */
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
/* 144 */
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
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = __webpack_require__(130)['default'];
	
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

/***/ },
/* 146 */
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

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDgxODJkYjExNTVmYTU4OWE2OTgiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9zY3JpcHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2ludGVyb3AtcmVxdWlyZS1kZWZhdWx0LmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LXNhcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jdHguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZmFpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGlkZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlc2NyaXB0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGFzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVpZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2hhcmVkL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2RlZmF1bHRzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5nZXQtbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1leHBvcnQtd2lsZGNhcmQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9zYl9saXN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1zdGVwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLWFsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mb3Itb2YuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtc3BlY2llcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzIiwid2VicGFjazovLy8uL3NyYy9zaGFyZWQvc2VsZWN0b3JzLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZGVib3VuY2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL3NldF9zdHlsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X2RlbHRhLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfb3JpZ2luYWxfZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2ZpbmRfY2hpbGQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3IuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2J1aWxkX2N1cnZlLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfdG91Y2hfaWQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9wb2ludGVyX2RhdGEuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvcGlja19pbl9yYW5nZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy91cGRhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvZGVzdHJveS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfc2l6ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9saXN0ZW5lci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9zY3JvbGxfdG8uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1hc3NpZ24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X3Bvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2V4dGVuZHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvdG9nZ2xlX3RyYWNrLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2NsZWFyX21vdmVtZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2luZmluaXRlX3Njcm9sbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfY29udGVudF9lbGVtLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3Njcm9sbF9pbnRvX3ZpZXcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVuZGVyL3JlbmRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVuZGVyL2FkZF9tb3ZlbWVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVuZGVyL3NldF9tb3ZlbWVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvZHJhZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3RvdWNoLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvbW91c2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy93aGVlbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3Jlc2l6ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3NlbGVjdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL2tleWJvYXJkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3NsaWNlZC10by1hcnJheS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9pcy1pdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vaXMtaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5pcy1pdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvcmVhZG9ubHkuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9hZGRfZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pbml0X29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pZ25vcmVfZXZlbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9pbml0X3Njcm9sbGJhci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2dldF9kZWx0YV9saW1pdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZV9jaGlsZHJlbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZV9ib3VuZGluZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2dldF9wb2ludGVyX3RyZW5kLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvc2V0X3RodW1iX3Bvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9wcmV2aWV3LmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2lzX3Zpc2libGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7O3FCQ3RDTyxDQUFXOztxQkFDWCxHQUFXOztnQ0FDSSxFQUFZOzs7O0FBQ2xDLE9BQU0sQ0FBQyxTQUFTLG1CQUFZLEM7Ozs7OztBQ0g1Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDJCOzs7Ozs7Ozs7Ozs7Z0NDUnNCLEVBQVk7Ozs7QUFFbEMsS0FBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO0FBQ3BDLEtBQU0sY0FBYyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUM7O0FB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ekMsQyIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIGQ4MTgyZGIxMTU1ZmE1ODlhNjk4XG4gKiovIiwiaW1wb3J0ICcuL21vbml0b3InO1xuaW1wb3J0ICcuL3ByZXZpZXcnO1xuaW1wb3J0IFNjcm9sbGJhciBmcm9tICcuLi8uLi9zcmMvJztcbndpbmRvdy5TY3JvbGxiYXIgPSBTY3JvbGxiYXI7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L3NjcmlwdHMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1yZXF1aXJlLWRlZmF1bHQuanNcbiAqKiBtb2R1bGUgaWQgPSAxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgU2Nyb2xsYmFyIGZyb20gJy4uLy4uL3NyYy8nO1xuXG5jb25zdCBEUFIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbmNvbnN0IFRJTUVfUkFOR0VfTUFYID0gMjAgKiAxZTM7XG5cbmNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpO1xuY29uc3QgdGh1bWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWInKTtcbmNvbnN0IHRyYWNrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RyYWNrJyk7XG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnQnKTtcbmNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5sZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5kaXYuaW5uZXJIVE1MID0gQXJyYXkoMTAxKS5qb2luKCc8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRXhwZWRpdGEgZWFxdWUgZGViaXRpcywgZG9sb3JlbSBkb2xvcmlidXMsIHZvbHVwdGF0aWJ1cyBtaW5pbWEgaWxsbyBlc3QsIGF0cXVlIGFsaXF1aWQgaXBzdW0gbmVjZXNzaXRhdGlidXMgY3VtcXVlIHZlcml0YXRpcyBiZWF0YWUsIHJhdGlvbmUgcmVwdWRpYW5kYWUgcXVvcyEgT21uaXMgaGljLCBhbmltaS48L3A+Jyk7XG5cbmNvbnRlbnQuYXBwZW5kQ2hpbGQoZGl2KTtcblxuU2Nyb2xsYmFyLmluaXRBbGwoKTtcblxuY29uc3Qgc2Nyb2xsYmFyID0gU2Nyb2xsYmFyLmdldChjb250ZW50KTtcblxubGV0IGNoYXJ0VHlwZSA9ICdvZmZzZXQnO1xuXG5sZXQgdGh1bWJXaWR0aCA9IDA7XG5sZXQgZW5kT2Zmc2V0ID0gMDtcblxubGV0IHRpbWVSYW5nZSA9IDUgKiAxZTM7XG5cbmxldCByZWNvcmRzID0gW107XG5sZXQgc2l6ZSA9IHtcbiAgICB3aWR0aDogMzAwLFxuICAgIGhlaWdodDogMjAwXG59O1xuXG5sZXQgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcblxubGV0IHRhbmdlbnRQb2ludCA9IG51bGw7XG5sZXQgdGFuZ2VudFBvaW50UHJlID0gbnVsbDtcblxubGV0IGhvdmVyTG9ja2VkID0gZmFsc2U7XG5sZXQgaG92ZXJQb2ludGVyWCA9IHVuZGVmaW5lZDtcbmxldCBwb2ludGVyRG93bk9uVHJhY2sgPSB1bmRlZmluZWQ7XG5sZXQgaG92ZXJQcmVjaXNpb24gPSAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudCA/IDUgOiAxO1xuXG5jYW52YXMud2lkdGggPSBzaXplLndpZHRoICogRFBSO1xuY2FudmFzLmhlaWdodCA9IHNpemUuaGVpZ2h0ICogRFBSO1xuY3R4LnNjYWxlKERQUiwgRFBSKTtcblxuZnVuY3Rpb24gbm90YXRpb24obnVtID0gMCkge1xuICAgIGlmICghbnVtIHx8IE1hdGguYWJzKG51bSkgPiAxMCoqLTIpIHJldHVybiBudW0udG9GaXhlZCgyKTtcblxuICAgIGxldCBleHAgPSAtMztcblxuICAgIHdoaWxlICghKG51bSAvIDEwKipleHApKSB7XG4gICAgICAgIGlmIChleHAgPCAtMTApIHtcbiAgICAgICAgICAgIHJldHVybiBudW0gPiAwID8gJ0luZmluaXR5JyA6ICctSW5maW5pdHknO1xuICAgICAgICB9XG5cbiAgICAgICAgZXhwLS07XG4gICAgfVxuXG4gICAgcmV0dXJuIChudW0gKiAxMCoqLWV4cCkudG9GaXhlZCgyKSArICdlJyArIGV4cDtcbn07XG5cbmZ1bmN0aW9uIGFkZEV2ZW50KGVsZW1zLCBldnRzLCBoYW5kbGVyKSB7XG4gICAgZXZ0cy5zcGxpdCgvXFxzKy8pLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgW10uY29uY2F0KGVsZW1zKS5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIoLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIHNsaWNlUmVjb3JkKCkge1xuICAgIGxldCBlbmRJZHggPSBNYXRoLmZsb29yKHJlY29yZHMubGVuZ3RoICogKDEgLSBlbmRPZmZzZXQpKTtcbiAgICBsZXQgbGFzdCA9IHJlY29yZHNbcmVjb3Jkcy5sZW5ndGggLSAxXTtcbiAgICBsZXQgZHJvcElkeCA9IDA7XG5cbiAgICBsZXQgcmVzdWx0ID0gcmVjb3Jkcy5maWx0ZXIoKHB0LCBpZHgpID0+IHtcbiAgICAgICAgaWYgKGxhc3QudGltZSAtIHB0LnRpbWUgPiBUSU1FX1JBTkdFX01BWCkge1xuICAgICAgICAgICAgZHJvcElkeCsrO1xuICAgICAgICAgICAgZW5kSWR4LS07XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZW5kID0gcmVjb3Jkc1tlbmRJZHggLSAxXTtcblxuICAgICAgICByZXR1cm4gZW5kLnRpbWUgLSBwdC50aW1lIDw9IHRpbWVSYW5nZSAmJiBpZHggPD0gZW5kSWR4O1xuICAgIH0pO1xuXG4gICAgcmVjb3Jkcy5zcGxpY2UoMCwgZHJvcElkeCk7XG4gICAgdGh1bWJXaWR0aCA9IHJlc3VsdC5sZW5ndGggPyByZXN1bHQubGVuZ3RoIC8gcmVjb3Jkcy5sZW5ndGggOiAxO1xuXG4gICAgdGh1bWIuc3R5bGUud2lkdGggPSB0aHVtYldpZHRoICogMTAwICsgJyUnO1xuICAgIHRodW1iLnN0eWxlLnJpZ2h0ID0gZW5kT2Zmc2V0ICogMTAwICsgJyUnO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmZ1bmN0aW9uIGdldExpbWl0KHBvaW50cykge1xuICAgIHJldHVybiBwb2ludHMucmVkdWNlKChwcmUsIGN1cikgPT4ge1xuICAgICAgICBsZXQgdmFsID0gY3VyW2NoYXJ0VHlwZV07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtYXg6IE1hdGgubWF4KHByZS5tYXgsIHZhbCksXG4gICAgICAgICAgICBtaW46IE1hdGgubWluKHByZS5taW4sIHZhbClcbiAgICAgICAgfTtcbiAgICB9LCB7IG1heDogLUluZmluaXR5LCBtaW46IEluZmluaXR5IH0pO1xufTtcblxuZnVuY3Rpb24gYXNzaWduUHJvcHMocHJvcHMpIHtcbiAgICBpZiAoIXByb3BzKSByZXR1cm47XG5cbiAgICBPYmplY3Qua2V5cyhwcm9wcykuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBjdHhbbmFtZV0gPSBwcm9wc1tuYW1lXTtcbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdMaW5lKHAwLCBwMSwgb3B0aW9ucykge1xuICAgIGxldCB4MCA9IHAwWzBdLFxuICAgICAgICB5MCA9IHAwWzFdLFxuICAgICAgICB4MSA9IHAxWzBdLFxuICAgICAgICB5MSA9IHAxWzFdO1xuXG4gICAgYXNzaWduUHJvcHMob3B0aW9ucy5wcm9wcyk7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2Zvcm0oMSwgMCwgMCwgLTEsIDAsIHNpemUuaGVpZ2h0KTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnNldExpbmVEYXNoKG9wdGlvbnMuZGFzaGVkID8gb3B0aW9ucy5kYXNoZWQgOiBbXSk7XG4gICAgY3R4Lm1vdmVUbyh4MCwgeTApO1xuICAgIGN0eC5saW5lVG8oeDEsIHkxKTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG59O1xuXG5mdW5jdGlvbiBhZGp1c3RUZXh0KGNvbnRlbnQsIHAsIG9wdGlvbnMpIHtcbiAgICBsZXQgeCA9IHBbMF0sXG4gICAgICAgIHkgPSBwWzFdO1xuXG4gICAgbGV0IHdpZHRoID0gY3R4Lm1lYXN1cmVUZXh0KGNvbnRlbnQpLndpZHRoO1xuXG4gICAgaWYgKHggKyB3aWR0aCA+IHNpemUud2lkdGgpIHtcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9ICdyaWdodCc7XG4gICAgfSBlbHNlIGlmICh4IC0gd2lkdGggPCAwKSB7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAnbGVmdCc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY3R4LnRleHRBbGlnbiA9IG9wdGlvbnMudGV4dEFsaWduO1xuICAgIH1cblxuICAgIGN0eC5maWxsVGV4dChjb250ZW50LCB4LCAteSk7XG59O1xuXG5mdW5jdGlvbiBmaWxsVGV4dChjb250ZW50LCBwLCBvcHRpb25zKSB7XG4gICAgYXNzaWduUHJvcHMob3B0aW9ucy5wcm9wcyk7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2Zvcm0oMSwgMCwgMCwgMSwgMCwgc2l6ZS5oZWlnaHQpO1xuICAgIGFkanVzdFRleHQoY29udGVudCwgcCwgb3B0aW9ucyk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdNYWluKCkge1xuICAgIGxldCBwb2ludHMgPSBzbGljZVJlY29yZCgpO1xuICAgIGlmICghcG9pbnRzLmxlbmd0aCkgcmV0dXJuO1xuXG4gICAgbGV0IGxpbWl0ID0gZ2V0TGltaXQocG9pbnRzKTtcblxuICAgIGxldCBzdGFydCA9IHBvaW50c1swXTtcbiAgICBsZXQgZW5kID0gcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXTtcblxuICAgIGxldCB0b3RhbFggPSB0aHVtYldpZHRoID09PSAxID8gdGltZVJhbmdlIDogZW5kLnRpbWUgLSBzdGFydC50aW1lO1xuICAgIGxldCB0b3RhbFkgPSAobGltaXQubWF4IC0gbGltaXQubWluKSB8fCAxO1xuXG4gICAgbGV0IGdyZCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCBzaXplLmhlaWdodCwgMCwgMCk7XG4gICAgZ3JkLmFkZENvbG9yU3RvcCgwLCAncmdiKDE3MCwgMjE1LCAyNTUpJyk7XG4gICAgZ3JkLmFkZENvbG9yU3RvcCgxLCAncmdiYSgxNzAsIDIxNSwgMjU1LCAwLjIpJyk7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2Zvcm0oMSwgMCwgMCwgLTEsIDAsIHNpemUuaGVpZ2h0KTtcblxuICAgIGN0eC5saW5lV2lkdGggPSAxO1xuICAgIGN0eC5maWxsU3R5bGUgPSBncmQ7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JnYig2NCwgMTY1LCAyNTUpJztcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCAwKTtcblxuICAgIGxldCBsYXN0UG9pbnQgPSBwb2ludHMucmVkdWNlKChwcmUsIGN1ciwgaWR4KSA9PiB7XG4gICAgICAgIGxldCB0aW1lID0gY3VyLnRpbWUsXG4gICAgICAgICAgICB2YWx1ZSA9IGN1cltjaGFydFR5cGVdO1xuICAgICAgICBsZXQgeCA9ICh0aW1lIC0gc3RhcnQudGltZSkgLyB0b3RhbFggKiBzaXplLndpZHRoLFxuICAgICAgICAgICAgeSA9ICh2YWx1ZSAtIGxpbWl0Lm1pbikgLyB0b3RhbFkgKiAoc2l6ZS5oZWlnaHQgLSAyMCk7XG5cbiAgICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcblxuICAgICAgICBpZiAoaG92ZXJQb2ludGVyWCAmJiBNYXRoLmFicyhob3ZlclBvaW50ZXJYIC0geCkgPCBob3ZlclByZWNpc2lvbikge1xuICAgICAgICAgICAgdGFuZ2VudFBvaW50ID0ge1xuICAgICAgICAgICAgICAgIGNvb3JkOiBbeCwgeV0sXG4gICAgICAgICAgICAgICAgcG9pbnQ6IGN1clxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGFuZ2VudFBvaW50UHJlID0ge1xuICAgICAgICAgICAgICAgIGNvb3JkOiBwcmUsXG4gICAgICAgICAgICAgICAgcG9pbnQ6IHBvaW50c1tpZHggLSAxXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbeCwgeV07XG4gICAgfSwgW10pO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5saW5lVG8obGFzdFBvaW50WzBdLCAwKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgZHJhd0xpbmUoWzAsIGxhc3RQb2ludFsxXV0sIGxhc3RQb2ludCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc3Ryb2tlU3R5bGU6ICcjZjYwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmaWxsVGV4dCgn4oaZJyArIG5vdGF0aW9uKGxpbWl0Lm1pbiksIFswLCAwXSwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzAwMCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBmb250OiAnMTJweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZmlsbFRleHQobm90YXRpb24oZW5kW2NoYXJ0VHlwZV0pLCBsYXN0UG9pbnQsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmNjAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAncmlnaHQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICcxNnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdUYW5nZW50TGluZSgpIHtcbiAgICBsZXQgY29vcmQgPSB0YW5nZW50UG9pbnQuY29vcmQsXG4gICAgICAgIGNvb3JkUHJlID0gdGFuZ2VudFBvaW50UHJlLmNvb3JkO1xuXG4gICAgbGV0IGsgPSAoY29vcmRbMV0gLSBjb29yZFByZVsxXSkgLyAoY29vcmRbMF0gLSBjb29yZFByZVswXSkgfHwgMDtcbiAgICBsZXQgYiA9IGNvb3JkWzFdIC0gayAqIGNvb3JkWzBdO1xuXG4gICAgZHJhd0xpbmUoWzAsIGJdLCBbc2l6ZS53aWR0aCwgayAqIHNpemUud2lkdGggKyBiXSwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGU6ICcjZjAwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgcmVhbEsgPSAodGFuZ2VudFBvaW50LnBvaW50W2NoYXJ0VHlwZV0gLSB0YW5nZW50UG9pbnRQcmUucG9pbnRbY2hhcnRUeXBlXSkgL1xuICAgICAgICAgICAgICAgICh0YW5nZW50UG9pbnQucG9pbnQudGltZSAtIHRhbmdlbnRQb2ludFByZS5wb2ludC50aW1lKTtcblxuICAgIGZpbGxUZXh0KCdkeS9keDogJyArIG5vdGF0aW9uKHJlYWxLKSwgW3NpemUud2lkdGggLyAyLCAwXSwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2YwMCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICdib2xkIDEycHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZHJhd0hvdmVyKCkge1xuICAgIGlmICghdGFuZ2VudFBvaW50KSByZXR1cm47XG5cbiAgICBkcmF3VGFuZ2VudExpbmUoKTtcblxuICAgIGxldCBjb29yZCA9IHRhbmdlbnRQb2ludC5jb29yZCxcbiAgICAgICAgcG9pbnQgPSB0YW5nZW50UG9pbnQucG9pbnQ7XG5cbiAgICBsZXQgY29vcmRTdHlsZSA9IHtcbiAgICAgICAgZGFzaGVkOiBbOCwgNF0sXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBsaW5lV2lkdGg6IDEsXG4gICAgICAgICAgICBzdHJva2VTdHlsZTogJ3JnYig2NCwgMTY1LCAyNTUpJ1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRyYXdMaW5lKFswLCBjb29yZFsxXV0sIFtzaXplLndpZHRoLCBjb29yZFsxXV0sIGNvb3JkU3R5bGUpO1xuICAgIGRyYXdMaW5lKFtjb29yZFswXSwgMF0sIFtjb29yZFswXSwgc2l6ZS5oZWlnaHRdLCBjb29yZFN0eWxlKTtcblxuICAgIGxldCBkYXRlID0gbmV3IERhdGUocG9pbnQudGltZSArIHBvaW50LnJlZHVjZSk7XG5cbiAgICBsZXQgcG9pbnRJbmZvID0gW1xuICAgICAgICAnKCcsXG4gICAgICAgIGRhdGUuZ2V0TWludXRlcygpLFxuICAgICAgICAnOicsXG4gICAgICAgIGRhdGUuZ2V0U2Vjb25kcygpLFxuICAgICAgICAnLicsXG4gICAgICAgIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCksXG4gICAgICAgICcsICcsXG4gICAgICAgIG5vdGF0aW9uKHBvaW50W2NoYXJ0VHlwZV0pLFxuICAgICAgICAnKSdcbiAgICBdLmpvaW4oJycpO1xuXG4gICAgZmlsbFRleHQocG9pbnRJbmZvLCBjb29yZCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzAwMCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBmb250OiAnYm9sZCAxMnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoIXNob3VsZFVwZGF0ZSkgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcblxuICAgIGZpbGxUZXh0KGNoYXJ0VHlwZS50b1VwcGVyQ2FzZSgpLCBbMCwgc2l6ZS5oZWlnaHRdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAndG9wJyxcbiAgICAgICAgICAgIGZvbnQ6ICdib2xkIDE0cHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZHJhd01haW4oKTtcbiAgICBkcmF3SG92ZXIoKTtcblxuICAgIGlmIChob3ZlckxvY2tlZCkge1xuICAgICAgICBmaWxsVGV4dCgnTE9DS0VEJywgW3NpemUud2lkdGgsIHNpemUuaGVpZ2h0XSwge1xuICAgICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjAwJyxcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAndG9wJyxcbiAgICAgICAgICAgICAgICBmb250OiAnYm9sZCAxNHB4IHNhbnMtc2VyaWYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBzaG91bGRVcGRhdGUgPSBmYWxzZTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xufTtcblxucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbmxldCBsYXN0VGltZSA9IERhdGUubm93KCksXG4gICAgbGFzdE9mZnNldCA9IDAsXG4gICAgcmVkdWNlQW1vdW50ID0gMDtcblxuc2Nyb2xsYmFyLmFkZExpc3RlbmVyKCgpID0+IHtcbiAgICBsZXQgY3VycmVudCA9IERhdGUubm93KCksXG4gICAgICAgIG9mZnNldCA9IHNjcm9sbGJhci5vZmZzZXQueSxcbiAgICAgICAgZHVyYXRpb24gPSBjdXJyZW50IC0gbGFzdFRpbWU7XG5cbiAgICBpZiAoIWR1cmF0aW9uIHx8IG9mZnNldCA9PT0gbGFzdE9mZnNldCkgcmV0dXJuO1xuXG4gICAgaWYgKGR1cmF0aW9uID4gNTApIHtcbiAgICAgICAgcmVkdWNlQW1vdW50ICs9IChkdXJhdGlvbiAtIDEpO1xuICAgICAgICBkdXJhdGlvbiAtPSAoZHVyYXRpb24gLSAxKTtcbiAgICB9XG5cbiAgICBsZXQgdmVsb2NpdHkgPSAob2Zmc2V0IC0gbGFzdE9mZnNldCkgLyBkdXJhdGlvbjtcbiAgICBsYXN0VGltZSA9IGN1cnJlbnQ7XG4gICAgbGFzdE9mZnNldCA9IG9mZnNldDtcblxuICAgIHJlY29yZHMucHVzaCh7XG4gICAgICAgIHRpbWU6IGN1cnJlbnQgLSByZWR1Y2VBbW91bnQsXG4gICAgICAgIHJlZHVjZTogcmVkdWNlQW1vdW50LFxuICAgICAgICBvZmZzZXQ6IG9mZnNldCxcbiAgICAgICAgc3BlZWQ6IE1hdGguYWJzKHZlbG9jaXR5KVxuICAgIH0pO1xuXG4gICAgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcbn0pO1xuXG5mdW5jdGlvbiBnZXRQb2ludGVyKGUpIHtcbiAgICByZXR1cm4gZS50b3VjaGVzID8gZS50b3VjaGVzW2UudG91Y2hlcy5sZW5ndGggLSAxXSA6IGU7XG59O1xuXG4vLyByYW5nZVxubGV0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R1cmF0aW9uJyk7XG5sZXQgbGFiZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHVyYXRpb24tdmFsdWUnKTtcbmlucHV0Lm1heCA9IFRJTUVfUkFOR0VfTUFYIC8gMWUzO1xuaW5wdXQubWluID0gMTtcbmlucHV0LnZhbHVlID0gdGltZVJhbmdlIC8gMWUzO1xubGFiZWwudGV4dENvbnRlbnQgPSBpbnB1dC52YWx1ZSArICdzJztcblxuYWRkRXZlbnQoaW5wdXQsICdpbnB1dCcsIChlKSA9PiB7XG4gICAgbGV0IHN0YXJ0ID0gcmVjb3Jkc1swXTtcbiAgICBsZXQgZW5kID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCB2YWwgPSBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKTtcbiAgICBsYWJlbC50ZXh0Q29udGVudCA9IHZhbCArICdzJztcbiAgICB0aW1lUmFuZ2UgPSB2YWwgKiAxZTM7XG5cbiAgICBpZiAoZW5kKSB7XG4gICAgICAgIGVuZE9mZnNldCA9IE1hdGgubWluKGVuZE9mZnNldCwgTWF0aC5tYXgoMCwgMSAtIHRpbWVSYW5nZSAvIChlbmQudGltZSAtIHN0YXJ0LnRpbWUpKSk7XG4gICAgfVxufSk7XG5cbmFkZEV2ZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpLCAnY2xpY2snLCAoKSA9PiB7XG4gICAgcmVjb3Jkcy5sZW5ndGggPSBlbmRPZmZzZXQgPSByZWR1Y2VBbW91bnQgPSAwO1xuICAgIGhvdmVyTG9ja2VkID0gZmFsc2U7XG4gICAgaG92ZXJQb2ludGVyWCA9IHVuZGVmaW5lZDtcbiAgICB0YW5nZW50UG9pbnQgPSBudWxsO1xuICAgIHRhbmdlbnRQb2ludFByZSA9IG51bGw7XG4gICAgc2xpY2VSZWNvcmQoKTtcbn0pO1xuXG4vLyBob3ZlclxuYWRkRXZlbnQoY2FudmFzLCAnbW91c2Vtb3ZlIHRvdWNobW92ZScsIChlKSA9PiB7XG4gICAgaWYgKGhvdmVyTG9ja2VkIHx8IHBvaW50ZXJEb3duT25UcmFjaykgcmV0dXJuO1xuXG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuXG4gICAgaG92ZXJQb2ludGVyWCA9IHBvaW50ZXIuY2xpZW50WCAtIGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xufSk7XG5cbmZ1bmN0aW9uIHJlc2V0SG92ZXIoKSB7XG4gICAgaG92ZXJQb2ludGVyWCA9IDA7XG4gICAgdGFuZ2VudFBvaW50ID0gbnVsbDtcbiAgICB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xufTtcblxuYWRkRXZlbnQoW2NhbnZhcywgd2luZG93XSwgJ21vdXNlbGVhdmUgdG91Y2hlbmQnLCAoKSA9PiB7XG4gICAgaWYgKGhvdmVyTG9ja2VkKSByZXR1cm47XG4gICAgcmVzZXRIb3ZlcigpO1xufSk7XG5cbmFkZEV2ZW50KGNhbnZhcywgJ2NsaWNrJywgKCkgPT4ge1xuICAgIGhvdmVyTG9ja2VkID0gIWhvdmVyTG9ja2VkO1xuXG4gICAgaWYgKCFob3ZlckxvY2tlZCkgcmVzZXRIb3ZlcigpO1xufSk7XG5cbi8vIHRyYWNrXG5hZGRFdmVudCh0aHVtYiwgJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgKGUpID0+IHtcbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG4gICAgcG9pbnRlckRvd25PblRyYWNrID0gcG9pbnRlci5jbGllbnRYO1xufSk7XG5cbmFkZEV2ZW50KHdpbmRvdywgJ21vdXNlbW92ZSB0b3VjaG1vdmUnLCAoZSkgPT4ge1xuICAgIGlmICghcG9pbnRlckRvd25PblRyYWNrKSByZXR1cm47XG5cbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG4gICAgbGV0IG1vdmVkID0gKHBvaW50ZXIuY2xpZW50WCAtIHBvaW50ZXJEb3duT25UcmFjaykgLyBzaXplLndpZHRoO1xuXG4gICAgcG9pbnRlckRvd25PblRyYWNrID0gcG9pbnRlci5jbGllbnRYO1xuICAgIGVuZE9mZnNldCA9IE1hdGgubWluKDEgLSB0aHVtYldpZHRoLCBNYXRoLm1heCgwLCBlbmRPZmZzZXQgLSBtb3ZlZCkpO1xufSk7XG5cbmFkZEV2ZW50KHdpbmRvdywgJ21vdXNldXAgdG91Y2hlbmQgYmx1cicsIChlKSA9PiB7XG4gICAgcG9pbnRlckRvd25PblRyYWNrID0gdW5kZWZpbmVkO1xufSk7XG5cbmFkZEV2ZW50KHRodW1iLCAnY2xpY2sgdG91Y2hzdGFydCcsIChlKSA9PiB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbn0pO1xuXG5hZGRFdmVudCh0cmFjaywgJ2NsaWNrIHRvdWNoc3RhcnQnLCAoZSkgPT4ge1xuICAgIGxldCBwb2ludGVyID0gZ2V0UG9pbnRlcihlKTtcbiAgICBsZXQgcmVjdCA9IHRyYWNrLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCBvZmZzZXQgPSAocG9pbnRlci5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHJlY3Qud2lkdGg7XG4gICAgZW5kT2Zmc2V0ID0gTWF0aC5taW4oMSAtIHRodW1iV2lkdGgsIE1hdGgubWF4KDAsIDEgLSAob2Zmc2V0ICsgdGh1bWJXaWR0aCAvIDIpKSk7XG59KTtcblxuLy8gc3dpdGNoIGNoYXJ0XG5hZGRFdmVudChcbiAgICBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jaGFydC10eXBlJykpLFxuICAgICdjaGFuZ2UnLFxuICAgICh7IHRhcmdldCB9KSA9PiB7XG4gICAgICAgIGlmICh0YXJnZXQuY2hlY2tlZCkge1xuICAgICAgICAgICAgY2hhcnRUeXBlID0gdGFyZ2V0LnZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9zY3JpcHRzL21vbml0b3IuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2tleXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2tleXMuanNcbiAqKiBtb2R1bGUgaWQgPSAzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3Qua2V5cycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLk9iamVjdC5rZXlzO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2tleXMuanNcbiAqKiBtb2R1bGUgaWQgPSA0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuMTQgT2JqZWN0LmtleXMoTylcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKTtcblxucmVxdWlyZSgnLi8kLm9iamVjdC1zYXAnKSgna2V5cycsIGZ1bmN0aW9uKCRrZXlzKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGtleXMoaXQpe1xuICAgIHJldHVybiAka2V5cyh0b09iamVjdChpdCkpO1xuICB9O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Qua2V5cy5qc1xuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8tb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlZmluZWQuanNcbiAqKiBtb2R1bGUgaWQgPSA3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBtb3N0IE9iamVjdCBtZXRob2RzIGJ5IEVTNiBzaG91bGQgYWNjZXB0IHByaW1pdGl2ZXNcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgY29yZSAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCBmYWlscyAgID0gcmVxdWlyZSgnLi8kLmZhaWxzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEtFWSwgZXhlYyl7XG4gIHZhciBmbiAgPSAoY29yZS5PYmplY3QgfHwge30pW0tFWV0gfHwgT2JqZWN0W0tFWV1cbiAgICAsIGV4cCA9IHt9O1xuICBleHBbS0VZXSA9IGV4ZWMoZm4pO1xuICAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIGZhaWxzKGZ1bmN0aW9uKCl7IGZuKDEpOyB9KSwgJ09iamVjdCcsIGV4cCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1zYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgY29yZSAgICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsIGN0eCAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCBJU19XUkFQICAgPSB0eXBlICYgJGV4cG9ydC5XXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgdGFyZ2V0ICAgID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXVxuICAgICwga2V5LCBvd24sIG91dDtcbiAgaWYoSVNfR0xPQkFMKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiBrZXkgaW4gdGFyZ2V0O1xuICAgIGlmKG93biAmJiBrZXkgaW4gZXhwb3J0cyljb250aW51ZTtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IG93biA/IHRhcmdldFtrZXldIDogc291cmNlW2tleV07XG4gICAgLy8gcHJldmVudCBnbG9iYWwgcG9sbHV0aW9uIGZvciBuYW1lc3BhY2VzXG4gICAgZXhwb3J0c1trZXldID0gSVNfR0xPQkFMICYmIHR5cGVvZiB0YXJnZXRba2V5XSAhPSAnZnVuY3Rpb24nID8gc291cmNlW2tleV1cbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIDogSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpXG4gICAgLy8gd3JhcCBnbG9iYWwgY29uc3RydWN0b3JzIGZvciBwcmV2ZW50IGNoYW5nZSB0aGVtIGluIGxpYnJhcnlcbiAgICA6IElTX1dSQVAgJiYgdGFyZ2V0W2tleV0gPT0gb3V0ID8gKGZ1bmN0aW9uKEMpe1xuICAgICAgdmFyIEYgPSBmdW5jdGlvbihwYXJhbSl7XG4gICAgICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgQyA/IG5ldyBDKHBhcmFtKSA6IEMocGFyYW0pO1xuICAgICAgfTtcbiAgICAgIEZbUFJPVE9UWVBFXSA9IENbUFJPVE9UWVBFXTtcbiAgICAgIHJldHVybiBGO1xuICAgIC8vIG1ha2Ugc3RhdGljIHZlcnNpb25zIGZvciBwcm90b3R5cGUgbWV0aG9kc1xuICAgIH0pKG91dCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICBpZihJU19QUk9UTykoZXhwb3J0c1tQUk9UT1RZUEVdIHx8IChleHBvcnRzW1BST1RPVFlQRV0gPSB7fSkpW2tleV0gPSBvdXQ7XG4gIH1cbn07XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7IC8vIHdyYXBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5leHBvcnQuanNcbiAqKiBtb2R1bGUgaWQgPSA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2xvYmFsLmpzXG4gKiogbW9kdWxlIGlkID0gMTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzEuMi42J307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qc1xuICoqIG1vZHVsZSBpZCA9IDEyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gMTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZhaWxzLmpzXG4gKiogbW9kdWxlIGlkID0gMTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZWxlY3RvcnMsIHNiTGlzdCB9IGZyb20gJy4vc2hhcmVkJztcblxuaW1wb3J0ICcuL2FwaXMvJztcbmltcG9ydCAnLi9yZW5kZXIvJztcbmltcG9ydCAnLi9ldmVudHMvJztcbmltcG9ydCAnLi9pbnRlcm5hbHMvJztcblxuZXhwb3J0IGRlZmF1bHQgU21vb3RoU2Nyb2xsYmFyO1xuXG5TbW9vdGhTY3JvbGxiYXIudmVyc2lvbiA9ICc8JT0gdmVyc2lvbiAlPic7XG5cbi8qKlxuICogaW5pdCBzY3JvbGxiYXIgb24gZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbTogdGFyZ2V0IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zOiBzY3JvbGxiYXIgb3B0aW9uc1xuICpcbiAqIEByZXR1cm4ge1Njcm9sbGJhcn0gc2Nyb2xsYmFyIGluc3RhbmNlXG4gKi9cblNtb290aFNjcm9sbGJhci5pbml0ID0gKGVsZW0sIG9wdGlvbnMpID0+IHtcbiAgICBpZiAoIWVsZW0gfHwgZWxlbS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3QgZWxlbWVudCB0byBiZSBET00gRWxlbWVudCwgYnV0IGdvdCAke3R5cGVvZiBlbGVtfWApO1xuICAgIH1cblxuICAgIGlmIChzYkxpc3QuaGFzKGVsZW0pKSByZXR1cm4gc2JMaXN0LmdldChlbGVtKTtcblxuICAgIGVsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXNjcm9sbGJhcicsICcnKTtcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gWy4uLmVsZW0uY2hpbGRyZW5dO1xuXG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICBkaXYuaW5uZXJIVE1MID0gYFxuICAgICAgICA8YXJ0aWNsZSBjbGFzcz1cInNjcm9sbC1jb250ZW50XCI+PC9hcnRpY2xlPlxuICAgICAgICA8YXNpZGUgY2xhc3M9XCJzY3JvbGxiYXItdHJhY2sgc2Nyb2xsYmFyLXRyYWNrLXhcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzY3JvbGxiYXItdGh1bWIgc2Nyb2xsYmFyLXRodW1iLXhcIj48L2Rpdj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICAgICAgPGFzaWRlIGNsYXNzPVwic2Nyb2xsYmFyLXRyYWNrIHNjcm9sbGJhci10cmFjay15XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsYmFyLXRodW1iIHNjcm9sbGJhci10aHVtYi15XCI+PC9kaXY+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgYDtcblxuICAgIGNvbnN0IHNjcm9sbENvbnRlbnQgPSBkaXYucXVlcnlTZWxlY3RvcignLnNjcm9sbC1jb250ZW50Jyk7XG5cbiAgICBbLi4uZGl2LmNoaWxkcmVuXS5mb3JFYWNoKChlbCkgPT4gZWxlbS5hcHBlbmRDaGlsZChlbCkpO1xuXG4gICAgY2hpbGRyZW4uZm9yRWFjaCgoZWwpID0+IHNjcm9sbENvbnRlbnQuYXBwZW5kQ2hpbGQoZWwpKTtcblxuICAgIHJldHVybiBuZXcgU21vb3RoU2Nyb2xsYmFyKGVsZW0sIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBpbml0IHNjcm9sbGJhcnMgb24gcHJlLWRlZmluZWQgc2VsZWN0b3JzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnM6IHNjcm9sbGJhciBvcHRpb25zXG4gKlxuICogQHJldHVybiB7QXJyYXl9IGEgY29sbGVjdGlvbiBvZiBzY3JvbGxiYXIgaW5zdGFuY2VzXG4gKi9cblNtb290aFNjcm9sbGJhci5pbml0QWxsID0gKG9wdGlvbnMpID0+IHtcbiAgICByZXR1cm4gWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKV0ubWFwKChlbCkgPT4ge1xuICAgICAgICByZXR1cm4gU21vb3RoU2Nyb2xsYmFyLmluaXQoZWwsIG9wdGlvbnMpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBjaGVjayBpZiBzY3JvbGxiYXIgZXhpc3RzIG9uIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5TbW9vdGhTY3JvbGxiYXIuaGFzID0gKGVsZW0pID0+IHtcbiAgICByZXR1cm4gc2JMaXN0LmhhcyhlbGVtKTtcbn07XG5cbi8qKlxuICogZ2V0IHNjcm9sbGJhciBpbnN0YW5jZSB0aHJvdWdoIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBzY3JvbGxiYXIgY29udGFpbmVyXG4gKlxuICogQHJldHVybiB7U2Nyb2xsYmFyfVxuICovXG5TbW9vdGhTY3JvbGxiYXIuZ2V0ID0gKGVsZW0pID0+IHtcbiAgICByZXR1cm4gc2JMaXN0LmdldChlbGVtKTtcbn07XG5cbi8qKlxuICogZ2V0IGFsbCBzY3JvbGxiYXIgaW5zdGFuY2VzXG4gKlxuICogQHJldHVybiB7QXJyYXl9IGEgY29sbGVjdGlvbiBvZiBzY3JvbGxiYXJzXG4gKi9cblNtb290aFNjcm9sbGJhci5nZXRBbGwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFsuLi5zYkxpc3QudmFsdWVzKCldO1xufTtcblxuLyoqXG4gKiBkZXN0cm95IHNjcm9sbGJhciBvbiBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtOiB0YXJnZXQgc2Nyb2xsYmFyIGNvbnRhaW5lclxuICovXG5TbW9vdGhTY3JvbGxiYXIuZGVzdHJveSA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIFNtb290aFNjcm9sbGJhci5oYXMoZWxlbSkgJiYgU21vb3RoU2Nyb2xsYmFyLmdldChlbGVtKS5kZXN0cm95KCk7XG59O1xuXG4vKipcbiAqIGRlc3Ryb3kgYWxsIHNjcm9sbGJhcnMgaW4gc2Nyb2xsYmFyIGluc3RhbmNlc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuZGVzdHJveUFsbCA9ICgpID0+IHtcbiAgICBzYkxpc3QuZm9yRWFjaCgoc2IpID0+IHtcbiAgICAgICAgc2IuZGVzdHJveSgpO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX0FycmF5JGZyb20gPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2FycmF5L2Zyb21cIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIGFycjJbaV0gPSBhcnJbaV07XG5cbiAgICByZXR1cm4gYXJyMjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gX0FycmF5JGZyb20oYXJyKTtcbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvdG8tY29uc3VtYWJsZS1hcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDE2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tLmpzXG4gKiogbW9kdWxlIGlkID0gMTdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLkFycmF5LmZyb207XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9hcnJheS9mcm9tLmpzXG4gKiogbW9kdWxlIGlkID0gMThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XG4gIHRoaXMuX3QgPSBTdHJpbmcoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGluZGV4ID0gdGhpcy5faVxuICAgICwgcG9pbnQ7XG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiB7dmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZX07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7dmFsdWU6IHBvaW50LCBkb25lOiBmYWxzZX07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDE5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi8kLnRvLWludGVnZXInKVxuICAsIGRlZmluZWQgICA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xuICByZXR1cm4gZnVuY3Rpb24odGhhdCwgcG9zKXtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gdG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmluZy1hdC5qc1xuICoqIG1vZHVsZSBpZCA9IDIwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qc1xuICoqIG1vZHVsZSBpZCA9IDIxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSAgICAgICAgPSByZXF1aXJlKCcuLyQubGlicmFyeScpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCByZWRlZmluZSAgICAgICA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZScpXG4gICwgaGlkZSAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGFzJylcbiAgLCBJdGVyYXRvcnMgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsICRpdGVyQ3JlYXRlICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY3JlYXRlJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vJC5zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgZ2V0UHJvdG8gICAgICAgPSByZXF1aXJlKCcuLyQnKS5nZXRQcm90b1xuICAsIElURVJBVE9SICAgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgQlVHR1kgICAgICAgICAgPSAhKFtdLmtleXMgJiYgJ25leHQnIGluIFtdLmtleXMoKSkgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxuICAsIEZGX0lURVJBVE9SICAgID0gJ0BAaXRlcmF0b3InXG4gICwgS0VZUyAgICAgICAgICAgPSAna2V5cydcbiAgLCBWQUxVRVMgICAgICAgICA9ICd2YWx1ZXMnO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFRCl7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uKGtpbmQpe1xuICAgIGlmKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKXJldHVybiBwcm90b1traW5kXTtcbiAgICBzd2l0Y2goa2luZCl7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyAgICAgICAgPSBOQU1FICsgJyBJdGVyYXRvcidcbiAgICAsIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFU1xuICAgICwgVkFMVUVTX0JVRyA9IGZhbHNlXG4gICAgLCBwcm90byAgICAgID0gQmFzZS5wcm90b3R5cGVcbiAgICAsICRuYXRpdmUgICAgPSBwcm90b1tJVEVSQVRPUl0gfHwgcHJvdG9bRkZfSVRFUkFUT1JdIHx8IERFRkFVTFQgJiYgcHJvdG9bREVGQVVMVF1cbiAgICAsICRkZWZhdWx0ICAgPSAkbmF0aXZlIHx8IGdldE1ldGhvZChERUZBVUxUKVxuICAgICwgbWV0aG9kcywga2V5O1xuICAvLyBGaXggbmF0aXZlXG4gIGlmKCRuYXRpdmUpe1xuICAgIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvKCRkZWZhdWx0LmNhbGwobmV3IEJhc2UpKTtcbiAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgLy8gRkYgZml4XG4gICAgaWYoIUxJQlJBUlkgJiYgaGFzKHByb3RvLCBGRl9JVEVSQVRPUikpaGlkZShJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IsIHJldHVyblRoaXMpO1xuICAgIC8vIGZpeCBBcnJheSN7dmFsdWVzLCBAQGl0ZXJhdG9yfS5uYW1lIGluIFY4IC8gRkZcbiAgICBpZihERUZfVkFMVUVTICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKXtcbiAgICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICAgJGRlZmF1bHQgPSBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuICRuYXRpdmUuY2FsbCh0aGlzKTsgfTtcbiAgICB9XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCghTElCUkFSWSB8fCBGT1JDRUQpICYmIChCVUdHWSB8fCBWQUxVRVNfQlVHIHx8ICFwcm90b1tJVEVSQVRPUl0pKXtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9IHJldHVyblRoaXM7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6ICBERUZfVkFMVUVTICA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKFZBTFVFUyksXG4gICAgICBrZXlzOiAgICBJU19TRVQgICAgICA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKEtFWVMpLFxuICAgICAgZW50cmllczogIURFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZCgnZW50cmllcycpXG4gICAgfTtcbiAgICBpZihGT1JDRUQpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSlyZWRlZmluZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIChCVUdHWSB8fCBWQUxVRVNfQlVHKSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbiAgcmV0dXJuIG1ldGhvZHM7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzXG4gKiogbW9kdWxlIGlkID0gMjJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5saWJyYXJ5LmpzXG4gKiogbW9kdWxlIGlkID0gMjNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmhpZGUnKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS5qc1xuICoqIG1vZHVsZSBpZCA9IDI0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhpZGUuanNcbiAqKiBtb2R1bGUgaWQgPSAyNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICRPYmplY3QgPSBPYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAgICAgJE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgICRPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIGlzRW51bTogICAgIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICBnZXREZXNjOiAgICAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICAkT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogJE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGVhY2g6ICAgICAgIFtdLmZvckVhY2hcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuanNcbiAqKiBtb2R1bGUgaWQgPSAyNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnByb3BlcnR5LWRlc2MuanNcbiAqKiBtb2R1bGUgaWQgPSAyN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi8kLmZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlc2NyaXB0b3JzLmpzXG4gKiogbW9kdWxlIGlkID0gMjhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmhhcy5qc1xuICoqIG1vZHVsZSBpZCA9IDI5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXJhdG9ycy5qc1xuICoqIG1vZHVsZSBpZCA9IDMwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGRlc2NyaXB0b3IgICAgID0gcmVxdWlyZSgnLi8kLnByb3BlcnR5LWRlc2MnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi8kLnNldC10by1zdHJpbmctdGFnJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLmhpZGUnKShJdGVyYXRvclByb3RvdHlwZSwgcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpLCBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpe1xuICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwge25leHQ6IGRlc2NyaXB0b3IoMSwgbmV4dCl9KTtcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItY3JlYXRlLmpzXG4gKiogbW9kdWxlIGlkID0gMzFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBkZWYgPSByZXF1aXJlKCcuLyQnKS5zZXREZXNjXG4gICwgaGFzID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgVEFHID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xuICBpZihpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKWRlZihpdCwgVEFHLCB7Y29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnfSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNldC10by1zdHJpbmctdGFnLmpzXG4gKiogbW9kdWxlIGlkID0gMzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBzdG9yZSAgPSByZXF1aXJlKCcuLyQuc2hhcmVkJykoJ3drcycpXG4gICwgdWlkICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpXG4gICwgU3ltYm9sID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpLlN5bWJvbDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFN5bWJvbCAmJiBTeW1ib2xbbmFtZV0gfHwgKFN5bWJvbCB8fCB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQud2tzLmpzXG4gKiogbW9kdWxlIGlkID0gMzNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJ1xuICAsIHN0b3JlICA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB7fSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNoYXJlZC5qc1xuICoqIG1vZHVsZSBpZCA9IDM0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC51aWQuanNcbiAqKiBtb2R1bGUgaWQgPSAzNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgJGV4cG9ydCAgICAgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCB0b09iamVjdCAgICA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuLyQuaXMtYXJyYXktaXRlcicpXG4gICwgdG9MZW5ndGggICAgPSByZXF1aXJlKCcuLyQudG8tbGVuZ3RoJylcbiAgLCBnZXRJdGVyRm4gICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgQXJyYXkuZnJvbShpdGVyKTsgfSksICdBcnJheScsIHtcbiAgLy8gMjIuMS4yLjEgQXJyYXkuZnJvbShhcnJheUxpa2UsIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICBmcm9tOiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcbiAgICB2YXIgTyAgICAgICA9IHRvT2JqZWN0KGFycmF5TGlrZSlcbiAgICAgICwgQyAgICAgICA9IHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXlcbiAgICAgICwgJCQgICAgICA9IGFyZ3VtZW50c1xuICAgICAgLCAkJGxlbiAgID0gJCQubGVuZ3RoXG4gICAgICAsIG1hcGZuICAgPSAkJGxlbiA+IDEgPyAkJFsxXSA6IHVuZGVmaW5lZFxuICAgICAgLCBtYXBwaW5nID0gbWFwZm4gIT09IHVuZGVmaW5lZFxuICAgICAgLCBpbmRleCAgID0gMFxuICAgICAgLCBpdGVyRm4gID0gZ2V0SXRlckZuKE8pXG4gICAgICAsIGxlbmd0aCwgcmVzdWx0LCBzdGVwLCBpdGVyYXRvcjtcbiAgICBpZihtYXBwaW5nKW1hcGZuID0gY3R4KG1hcGZuLCAkJGxlbiA+IDIgPyAkJFsyXSA6IHVuZGVmaW5lZCwgMik7XG4gICAgLy8gaWYgb2JqZWN0IGlzbid0IGl0ZXJhYmxlIG9yIGl0J3MgYXJyYXkgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yIC0gdXNlIHNpbXBsZSBjYXNlXG4gICAgaWYoaXRlckZuICE9IHVuZGVmaW5lZCAmJiAhKEMgPT0gQXJyYXkgJiYgaXNBcnJheUl0ZXIoaXRlckZuKSkpe1xuICAgICAgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoTyksIHJlc3VsdCA9IG5ldyBDOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IGNhbGwoaXRlcmF0b3IsIG1hcGZuLCBbc3RlcC52YWx1ZSwgaW5kZXhdLCB0cnVlKSA6IHN0ZXAudmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKTtcbiAgICAgIGZvcihyZXN1bHQgPSBuZXcgQyhsZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gbWFwZm4oT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQubGVuZ3RoID0gaW5kZXg7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5LmZyb20uanNcbiAqKiBtb2R1bGUgaWQgPSAzNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoKGUpe1xuICAgIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gICAgaWYocmV0ICE9PSB1bmRlZmluZWQpYW5PYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItY2FsbC5qc1xuICoqIG1vZHVsZSBpZCA9IDM3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYW4tb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gMzhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1vYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSAzOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxudmFyIEl0ZXJhdG9ycyAgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJylcbiAgLCBJVEVSQVRPUiAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCAhPT0gdW5kZWZpbmVkICYmIChJdGVyYXRvcnMuQXJyYXkgPT09IGl0IHx8IEFycmF5UHJvdG9bSVRFUkFUT1JdID09PSBpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanNcbiAqKiBtb2R1bGUgaWQgPSA0MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi8kLnRvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWxlbmd0aC5qc1xuICoqIG1vZHVsZSBpZCA9IDQxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgIT0gdW5kZWZpbmVkKXJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qc1xuICoqIG1vZHVsZSBpZCA9IDQyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKVxuICAvLyBFUzMgd3JvbmcgaGVyZVxuICAsIEFSRyA9IGNvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gKE8gPSBPYmplY3QoaXQpKVtUQUddKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY2xhc3NvZi5qc1xuICoqIG1vZHVsZSBpZCA9IDQzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvZi5qc1xuICoqIG1vZHVsZSBpZCA9IDQ0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgSVRFUkFUT1IgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtJVEVSQVRPUl0oKTtcbiAgcml0ZXJbJ3JldHVybiddID0gZnVuY3Rpb24oKXsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24oKXsgdGhyb3cgMjsgfSk7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYywgc2tpcENsb3Npbmcpe1xuICBpZighc2tpcENsb3NpbmcgJiYgIVNBRkVfQ0xPU0lORylyZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciAgPSBbN11cbiAgICAgICwgaXRlciA9IGFycltJVEVSQVRPUl0oKTtcbiAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpeyBzYWZlID0gdHJ1ZTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWRldGVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDQ1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0NsYXNzfSBTbW9vdGhTY3JvbGxiYXJcbiAqL1xuXG5pbXBvcnQgeyBzYkxpc3QgfSBmcm9tICcuL3NoYXJlZC8nO1xuaW1wb3J0IHtcbiAgICBkZWJvdW5jZSxcbiAgICBmaW5kQ2hpbGQsXG4gICAgc2V0U3R5bGVcbn0gZnJvbSAnLi91dGlscy8nO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQ3JlYXRlIHNjcm9sbGJhciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyOiB0YXJnZXQgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXTogb3B0aW9uc1xuICovXG5leHBvcnQgY2xhc3MgU21vb3RoU2Nyb2xsYmFyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXIsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzYkxpc3Quc2V0KGNvbnRhaW5lciwgdGhpcyk7XG5cbiAgICAgICAgLy8gbWFrZSBjb250YWluZXIgZm9jdXNhYmxlXG4gICAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzEnKTtcblxuICAgICAgICAvLyByZXNldCBzY3JvbGwgcG9zaXRpb25cbiAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxMZWZ0ID0gMDtcblxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgIG91dGxpbmU6ICdub25lJ1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0cmFja1ggPSBmaW5kQ2hpbGQoY29udGFpbmVyLCAnc2Nyb2xsYmFyLXRyYWNrLXgnKTtcbiAgICAgICAgY29uc3QgdHJhY2tZID0gZmluZENoaWxkKGNvbnRhaW5lciwgJ3Njcm9sbGJhci10cmFjay15Jyk7XG5cbiAgICAgICAgLy8gcmVhZG9ubHkgcHJvcGVydGllc1xuICAgICAgICB0aGlzLl9fcmVhZG9ubHkoJ3RhcmdldHMnLCBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgICAgIGNvbnRlbnQ6IGZpbmRDaGlsZChjb250YWluZXIsICdzY3JvbGwtY29udGVudCcpLFxuICAgICAgICAgICAgeEF4aXM6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgICAgICAgIHRyYWNrOiB0cmFja1gsXG4gICAgICAgICAgICAgICAgdGh1bWI6IGZpbmRDaGlsZCh0cmFja1gsICdzY3JvbGxiYXItdGh1bWIteCcpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHlBeGlzOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgICAgICB0cmFjazogdHJhY2tZLFxuICAgICAgICAgICAgICAgIHRodW1iOiBmaW5kQ2hpbGQodHJhY2tZLCAnc2Nyb2xsYmFyLXRodW1iLXknKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSkpXG4gICAgICAgIC5fX3JlYWRvbmx5KCdvZmZzZXQnLCB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnbGltaXQnLCB7XG4gICAgICAgICAgICB4OiBJbmZpbml0eSxcbiAgICAgICAgICAgIHk6IEluZmluaXR5XG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdtb3ZlbWVudCcsIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCd0aHVtYlNpemUnLCB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgIHJlYWxYOiAwLFxuICAgICAgICAgICAgcmVhbFk6IDBcbiAgICAgICAgfSlcbiAgICAgICAgLl9fcmVhZG9ubHkoJ2JvdW5kaW5nJywge1xuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICBsZWZ0OiAwXG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdzaXplJywgdGhpcy5nZXRTaXplKCkpO1xuXG4gICAgICAgIC8vIG5vbi1lbm11cmFibGUgcHJvcGVydGllc1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgICAgICBfX3VwZGF0ZVRocm90dGxlOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGRlYm91bmNlKDo6dGhpcy51cGRhdGUpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX19saXN0ZW5lcnM6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogW11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX2hhbmRsZXJzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX19jaGlsZHJlbjoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBbXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9fdGltZXJJRDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiB7fVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBhY2Nlc3NvcnNcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiB7XG4gICAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vZmZzZXQueTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2Nyb2xsTGVmdDoge1xuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub2Zmc2V0Lng7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9faW5pdE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX19pbml0U2Nyb2xsYmFyKCk7XG4gICAgfVxufVxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3Ntb290aF9zY3JvbGxiYXIuanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY2xhc3MtY2FsbC1jaGVjay5qc1xuICoqIG1vZHVsZSBpZCA9IDQ3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZnJlZXplLmpzXG4gKiogbW9kdWxlIGlkID0gNDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5mcmVlemUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5PYmplY3QuZnJlZXplO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDQ5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuNSBPYmplY3QuZnJlZXplKE8pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2ZyZWV6ZScsIGZ1bmN0aW9uKCRmcmVlemUpe1xuICByZXR1cm4gZnVuY3Rpb24gZnJlZXplKGl0KXtcbiAgICByZXR1cm4gJGZyZWV6ZSAmJiBpc09iamVjdChpdCkgPyAkZnJlZXplKGl0KSA6IGl0O1xuICB9O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZnJlZXplLmpzXG4gKiogbW9kdWxlIGlkID0gNTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoVCwgRCl7XG4gIHJldHVybiAkLnNldERlc2NzKFQsIEQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qc1xuICoqIG1vZHVsZSBpZCA9IDUyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3NiX2xpc3QnO1xuZXhwb3J0ICogZnJvbSAnLi9zZWxlY3RvcnMnO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc2hhcmVkL2luZGV4LmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGdldE93blByb3BlcnR5TmFtZXMgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIF9PYmplY3QkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIF9PYmplY3QkZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gIHZhciBrZXlzID0gX09iamVjdCRnZXRPd25Qcm9wZXJ0eU5hbWVzKGRlZmF1bHRzKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcblxuICAgIHZhciB2YWx1ZSA9IF9PYmplY3QkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGRlZmF1bHRzLCBrZXkpO1xuXG4gICAgaWYgKHZhbHVlICYmIHZhbHVlLmNvbmZpZ3VyYWJsZSAmJiBvYmpba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBfT2JqZWN0JGRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2RlZmF1bHRzLmpzXG4gKiogbW9kdWxlIGlkID0gNTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lc1wiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qc1xuICoqIG1vZHVsZSBpZCA9IDU1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktbmFtZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIHJldHVybiAkLmdldE5hbWVzKGl0KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qc1xuICoqIG1vZHVsZSBpZCA9IDU2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxucmVxdWlyZSgnLi8kLm9iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlOYW1lcycsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiByZXF1aXJlKCcuLyQuZ2V0LW5hbWVzJykuZ2V0O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qc1xuICoqIG1vZHVsZSBpZCA9IDU3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLWlvYmplY3QnKVxuICAsIGdldE5hbWVzICA9IHJlcXVpcmUoJy4vJCcpLmdldE5hbWVzXG4gICwgdG9TdHJpbmcgID0ge30udG9TdHJpbmc7XG5cbnZhciB3aW5kb3dOYW1lcyA9IHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uKGl0KXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ2V0TmFtZXMoaXQpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5nZXQgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgaWYod2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScpcmV0dXJuIGdldFdpbmRvd05hbWVzKGl0KTtcbiAgcmV0dXJuIGdldE5hbWVzKHRvSU9iamVjdChpdCkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5nZXQtbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA1OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vJC5pb2JqZWN0JylcbiAgLCBkZWZpbmVkID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWlvYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA1OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuLyQuY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlvYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA2MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDYxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHJldHVybiAkLmdldERlc2MoaXQsIGtleSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDYyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLWlvYmplY3QnKTtcblxucmVxdWlyZSgnLi8kLm9iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgZnVuY3Rpb24oJGdldE93blByb3BlcnR5RGVzY3JpcHRvcil7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gICAgcmV0dXJuICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG9JT2JqZWN0KGl0KSwga2V5KTtcbiAgfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDYzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzXG4gKiogbW9kdWxlIGlkID0gNjRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2Mpe1xuICByZXR1cm4gJC5zZXREZXNjKGl0LCBrZXksIGRlc2MpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanNcbiAqKiBtb2R1bGUgaWQgPSA2NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKG9iaiwgZGVmYXVsdHMpIHtcbiAgdmFyIG5ld09iaiA9IGRlZmF1bHRzKHt9LCBvYmopO1xuICBkZWxldGUgbmV3T2JqW1wiZGVmYXVsdFwiXTtcbiAgcmV0dXJuIG5ld09iajtcbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2ludGVyb3AtZXhwb3J0LXdpbGRjYXJkLmpzXG4gKiogbW9kdWxlIGlkID0gNjZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7TWFwfSBzYkxpc3RcbiAqL1xuXG5jb25zdCBzYkxpc3QgPSBuZXcgTWFwKCk7XG5cbmNvbnN0IG9yaWdpblNldCA9IDo6c2JMaXN0LnNldDtcblxuc2JMaXN0LnVwZGF0ZSA9ICgpID0+IHtcbiAgICBzYkxpc3QuZm9yRWFjaCgoc2IpID0+IHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHNiLl9fdXBkYXRlQ2hpbGRyZW4oKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vLyBwYXRjaCAjc2V0IHdpdGggI3VwZGF0ZSBtZXRob2RcbnNiTGlzdC5zZXQgPSAoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IHJlcyA9IG9yaWdpblNldCguLi5hcmdzKTtcbiAgICBzYkxpc3QudXBkYXRlKCk7XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuZXhwb3J0IHsgc2JMaXN0IH07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc2hhcmVkL3NiX2xpc3QuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vbWFwXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL21hcC5qc1xuICoqIG1vZHVsZSBpZCA9IDY4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYubWFwJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNy5tYXAudG8tanNvbicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzLyQuY29yZScpLk1hcDtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL21hcC5qc1xuICoqIG1vZHVsZSBpZCA9IDY5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuL2VzNi5hcnJheS5pdGVyYXRvcicpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbkl0ZXJhdG9ycy5Ob2RlTGlzdCA9IEl0ZXJhdG9ycy5IVE1MQ29sbGVjdGlvbiA9IEl0ZXJhdG9ycy5BcnJheTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qc1xuICoqIG1vZHVsZSBpZCA9IDcxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgYWRkVG9VbnNjb3BhYmxlcyA9IHJlcXVpcmUoJy4vJC5hZGQtdG8tdW5zY29wYWJsZXMnKVxuICAsIHN0ZXAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1zdGVwJylcbiAgLCBJdGVyYXRvcnMgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgdG9JT2JqZWN0ICAgICAgICA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgdGhpcy5fdCA9IHRvSU9iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICB0aGlzLl9rID0ga2luZDsgICAgICAgICAgICAgICAgLy8ga2luZFxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBraW5kICA9IHRoaXMuX2tcbiAgICAsIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XG4gICAgdGhpcy5fdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3RlcCgxKTtcbiAgfVxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcbiAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuYWRkVG9VbnNjb3BhYmxlcygna2V5cycpO1xuYWRkVG9VbnNjb3BhYmxlcygndmFsdWVzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCdlbnRyaWVzJyk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDcyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYWRkLXRvLXVuc2NvcGFibGVzLmpzXG4gKiogbW9kdWxlIGlkID0gNzNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9uZSwgdmFsdWUpe1xuICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1zdGVwLmpzXG4gKiogbW9kdWxlIGlkID0gNzRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnTWFwJywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIE1hcCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTsgfTtcbn0sIHtcbiAgLy8gMjMuMS4zLjYgTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xuICAgIHZhciBlbnRyeSA9IHN0cm9uZy5nZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xuICB9LFxuICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCBrZXkgPT09IDAgPyAwIDoga2V5LCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZywgdHJ1ZSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA3NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgaGlkZSAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIHJlZGVmaW5lQWxsICA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZS1hbGwnKVxuICAsIGN0eCAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIHN0cmljdE5ldyAgICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBkZWZpbmVkICAgICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpXG4gICwgZm9yT2YgICAgICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgJGl0ZXJEZWZpbmUgID0gcmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJylcbiAgLCBzdGVwICAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1zdGVwJylcbiAgLCBJRCAgICAgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykoJ2lkJylcbiAgLCAkaGFzICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGFzJylcbiAgLCBpc09iamVjdCAgICAgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCBzZXRTcGVjaWVzICAgPSByZXF1aXJlKCcuLyQuc2V0LXNwZWNpZXMnKVxuICAsIERFU0NSSVBUT1JTICA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpXG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBpc09iamVjdFxuICAsIFNJWkUgICAgICAgICA9IERFU0NSSVBUT1JTID8gJ19zJyA6ICdzaXplJ1xuICAsIGlkICAgICAgICAgICA9IDA7XG5cbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24oaXQsIGNyZWF0ZSl7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZighJGhhcyhpdCwgSUQpKXtcbiAgICAvLyBjYW4ndCBzZXQgaWQgdG8gZnJvemVuIG9iamVjdFxuICAgIGlmKCFpc0V4dGVuc2libGUoaXQpKXJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgaWRcbiAgICBpZighY3JlYXRlKXJldHVybiAnRSc7XG4gICAgLy8gYWRkIG1pc3Npbmcgb2JqZWN0IGlkXG4gICAgaGlkZShpdCwgSUQsICsraWQpO1xuICAvLyByZXR1cm4gb2JqZWN0IGlkIHdpdGggcHJlZml4XG4gIH0gcmV0dXJuICdPJyArIGl0W0lEXTtcbn07XG5cbnZhciBnZXRFbnRyeSA9IGZ1bmN0aW9uKHRoYXQsIGtleSl7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xuICBpZihpbmRleCAhPT0gJ0YnKXJldHVybiB0aGF0Ll9pW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvcihlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgIGlmKGVudHJ5LmsgPT0ga2V5KXJldHVybiBlbnRyeTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKXtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGhhdCwgaXRlcmFibGUpe1xuICAgICAgc3RyaWN0TmV3KHRoYXQsIEMsIE5BTUUpO1xuICAgICAgdGhhdC5faSA9ICQuY3JlYXRlKG51bGwpOyAvLyBpbmRleFxuICAgICAgdGhhdC5fZiA9IHVuZGVmaW5lZDsgICAgICAvLyBmaXJzdCBlbnRyeVxuICAgICAgdGhhdC5fbCA9IHVuZGVmaW5lZDsgICAgICAvLyBsYXN0IGVudHJ5XG4gICAgICB0aGF0W1NJWkVdID0gMDsgICAgICAgICAgIC8vIHNpemVcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgfSk7XG4gICAgcmVkZWZpbmVBbGwoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKXtcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXQuX2ksIGVudHJ5ID0gdGhhdC5fZjsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGRlbGV0ZSBkYXRhW2VudHJ5LmldO1xuICAgICAgICB9XG4gICAgICAgIHRoYXQuX2YgPSB0aGF0Ll9sID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGF0W1NJWkVdID0gMDtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XG4gICAgICAgIGlmKGVudHJ5KXtcbiAgICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XG4gICAgICAgICAgZGVsZXRlIHRoYXQuX2lbZW50cnkuaV07XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYocHJldilwcmV2Lm4gPSBuZXh0O1xuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZih0aGF0Ll9mID09IGVudHJ5KXRoYXQuX2YgPSBuZXh0O1xuICAgICAgICAgIGlmKHRoYXQuX2wgPT0gZW50cnkpdGhhdC5fbCA9IHByZXY7XG4gICAgICAgICAgdGhhdFtTSVpFXS0tO1xuICAgICAgICB9IHJldHVybiAhIWVudHJ5O1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCwgMylcbiAgICAgICAgICAsIGVudHJ5O1xuICAgICAgICB3aGlsZShlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXMuX2Ype1xuICAgICAgICAgIGYoZW50cnkudiwgZW50cnkuaywgdGhpcyk7XG4gICAgICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XG4gICAgICAgIHJldHVybiAhIWdldEVudHJ5KHRoaXMsIGtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYoREVTQ1JJUFRPUlMpJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGRlZmluZWQodGhpc1tTSVpFXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XG4gICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KVxuICAgICAgLCBwcmV2LCBpbmRleDtcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcbiAgICBpZihlbnRyeSl7XG4gICAgICBlbnRyeS52ID0gdmFsdWU7XG4gICAgLy8gY3JlYXRlIG5ldyBlbnRyeVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGF0Ll9sID0gZW50cnkgPSB7XG4gICAgICAgIGk6IGluZGV4ID0gZmFzdEtleShrZXksIHRydWUpLCAvLyA8LSBpbmRleFxuICAgICAgICBrOiBrZXksICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0ga2V5XG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxuICAgICAgICBwOiBwcmV2ID0gdGhhdC5fbCwgICAgICAgICAgICAgLy8gPC0gcHJldmlvdXMgZW50cnlcbiAgICAgICAgbjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgIC8vIDwtIG5leHQgZW50cnlcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcbiAgICAgIH07XG4gICAgICBpZighdGhhdC5fZil0aGF0Ll9mID0gZW50cnk7XG4gICAgICBpZihwcmV2KXByZXYubiA9IGVudHJ5O1xuICAgICAgdGhhdFtTSVpFXSsrO1xuICAgICAgLy8gYWRkIHRvIGluZGV4XG4gICAgICBpZihpbmRleCAhPT0gJ0YnKXRoYXQuX2lbaW5kZXhdID0gZW50cnk7XG4gICAgfSByZXR1cm4gdGhhdDtcbiAgfSxcbiAgZ2V0RW50cnk6IGdldEVudHJ5LFxuICBzZXRTdHJvbmc6IGZ1bmN0aW9uKEMsIE5BTUUsIElTX01BUCl7XG4gICAgLy8gYWRkIC5rZXlzLCAudmFsdWVzLCAuZW50cmllcywgW0BAaXRlcmF0b3JdXG4gICAgLy8gMjMuMS4zLjQsIDIzLjEuMy44LCAyMy4xLjMuMTEsIDIzLjEuMy4xMiwgMjMuMi4zLjUsIDIzLjIuMy44LCAyMy4yLjMuMTAsIDIzLjIuMy4xMVxuICAgICRpdGVyRGVmaW5lKEMsIE5BTUUsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgICAgIHRoaXMuX3QgPSBpdGVyYXRlZDsgIC8vIHRhcmdldFxuICAgICAgdGhpcy5fayA9IGtpbmQ7ICAgICAgLy8ga2luZFxuICAgICAgdGhpcy5fbCA9IHVuZGVmaW5lZDsgLy8gcHJldmlvdXNcbiAgICB9LCBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAsIGtpbmQgID0gdGhhdC5fa1xuICAgICAgICAsIGVudHJ5ID0gdGhhdC5fbDtcbiAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XG4gICAgICAvLyBnZXQgbmV4dCBlbnRyeVxuICAgICAgaWYoIXRoYXQuX3QgfHwgISh0aGF0Ll9sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGF0Ll90Ll9mKSl7XG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXG4gICAgICAgIHRoYXQuX3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBzdGVwKDEpO1xuICAgICAgfVxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxuICAgICAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBlbnRyeS5rKTtcbiAgICAgIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgZW50cnkudik7XG4gICAgICByZXR1cm4gc3RlcCgwLCBbZW50cnkuaywgZW50cnkudl0pO1xuICAgIH0sIElTX01BUCA/ICdlbnRyaWVzJyA6ICd2YWx1ZXMnICwgIUlTX01BUCwgdHJ1ZSk7XG5cbiAgICAvLyBhZGQgW0BAc3BlY2llc10sIDIzLjEuMi4yLCAyMy4yLjIuMlxuICAgIHNldFNwZWNpZXMoTkFNRSk7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanNcbiAqKiBtb2R1bGUgaWQgPSA3NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgc3JjKXtcbiAgZm9yKHZhciBrZXkgaW4gc3JjKXJlZGVmaW5lKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLWFsbC5qc1xuICoqIG1vZHVsZSBpZCA9IDc3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XG4gIGlmKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpdGhyb3cgVHlwZUVycm9yKG5hbWUgKyBcIjogdXNlIHRoZSAnbmV3JyBvcGVyYXRvciFcIik7XG4gIHJldHVybiBpdDtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaWN0LW5ldy5qc1xuICoqIG1vZHVsZSBpZCA9IDc4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY3R4ICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi8kLmlzLWFycmF5LWl0ZXInKVxuICAsIGFuT2JqZWN0ICAgID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpXG4gICwgdG9MZW5ndGggICAgPSByZXF1aXJlKCcuLyQudG8tbGVuZ3RoJylcbiAgLCBnZXRJdGVyRm4gICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XG4gIHZhciBpdGVyRm4gPSBnZXRJdGVyRm4oaXRlcmFibGUpXG4gICAgLCBmICAgICAgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGxlbmd0aCwgc3RlcCwgaXRlcmF0b3I7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXRlcmFibGUgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgLy8gZmFzdCBjYXNlIGZvciBhcnJheXMgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yXG4gIGlmKGlzQXJyYXlJdGVyKGl0ZXJGbikpZm9yKGxlbmd0aCA9IHRvTGVuZ3RoKGl0ZXJhYmxlLmxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICBlbnRyaWVzID8gZihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSkgOiBmKGl0ZXJhYmxlW2luZGV4XSk7XG4gIH0gZWxzZSBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChpdGVyYWJsZSk7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgKXtcbiAgICBjYWxsKGl0ZXJhdG9yLCBmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKTtcbiAgfVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mb3Itb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA3OVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNvcmUgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsICQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpXG4gICwgU1BFQ0lFUyAgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVkpe1xuICB2YXIgQyA9IGNvcmVbS0VZXTtcbiAgaWYoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSkkLnNldERlc2MoQywgU1BFQ0lFUywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9XG4gIH0pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtc3BlY2llcy5qc1xuICoqIG1vZHVsZSBpZCA9IDgwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGdsb2JhbCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCBmYWlscyAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5mYWlscycpXG4gICwgaGlkZSAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaGlkZScpXG4gICwgcmVkZWZpbmVBbGwgICAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUtYWxsJylcbiAgLCBmb3JPZiAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHN0cmljdE5ldyAgICAgID0gcmVxdWlyZSgnLi8kLnN0cmljdC1uZXcnKVxuICAsIGlzT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIERFU0NSSVBUT1JTICAgID0gcmVxdWlyZSgnLi8kLmRlc2NyaXB0b3JzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSwgd3JhcHBlciwgbWV0aG9kcywgY29tbW9uLCBJU19NQVAsIElTX1dFQUspe1xuICB2YXIgQmFzZSAgPSBnbG9iYWxbTkFNRV1cbiAgICAsIEMgICAgID0gQmFzZVxuICAgICwgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnXG4gICAgLCBwcm90byA9IEMgJiYgQy5wcm90b3R5cGVcbiAgICAsIE8gICAgID0ge307XG4gIGlmKCFERVNDUklQVE9SUyB8fCB0eXBlb2YgQyAhPSAnZnVuY3Rpb24nIHx8ICEoSVNfV0VBSyB8fCBwcm90by5mb3JFYWNoICYmICFmYWlscyhmdW5jdGlvbigpe1xuICAgIG5ldyBDKCkuZW50cmllcygpLm5leHQoKTtcbiAgfSkpKXtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVkZWZpbmVBbGwoQy5wcm90b3R5cGUsIG1ldGhvZHMpO1xuICB9IGVsc2Uge1xuICAgIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRhcmdldCwgaXRlcmFibGUpe1xuICAgICAgc3RyaWN0TmV3KHRhcmdldCwgQywgTkFNRSk7XG4gICAgICB0YXJnZXQuX2MgPSBuZXcgQmFzZTtcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0YXJnZXRbQURERVJdLCB0YXJnZXQpO1xuICAgIH0pO1xuICAgICQuZWFjaC5jYWxsKCdhZGQsY2xlYXIsZGVsZXRlLGZvckVhY2gsZ2V0LGhhcyxzZXQsa2V5cyx2YWx1ZXMsZW50cmllcycuc3BsaXQoJywnKSxmdW5jdGlvbihLRVkpe1xuICAgICAgdmFyIElTX0FEREVSID0gS0VZID09ICdhZGQnIHx8IEtFWSA9PSAnc2V0JztcbiAgICAgIGlmKEtFWSBpbiBwcm90byAmJiAhKElTX1dFQUsgJiYgS0VZID09ICdjbGVhcicpKWhpZGUoQy5wcm90b3R5cGUsIEtFWSwgZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIGlmKCFJU19BRERFUiAmJiBJU19XRUFLICYmICFpc09iamVjdChhKSlyZXR1cm4gS0VZID09ICdnZXQnID8gdW5kZWZpbmVkIDogZmFsc2U7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9jW0tFWV0oYSA9PT0gMCA/IDAgOiBhLCBiKTtcbiAgICAgICAgcmV0dXJuIElTX0FEREVSID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmKCdzaXplJyBpbiBwcm90bykkLnNldERlc2MoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fYy5zaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GLCBPKTtcblxuICBpZighSVNfV0VBSyljb21tb24uc2V0U3Ryb25nKEMsIE5BTUUsIElTX01BUCk7XG5cbiAgcmV0dXJuIEM7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24uanNcbiAqKiBtb2R1bGUgaWQgPSA4MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyICRleHBvcnQgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUCwgJ01hcCcsIHt0b0pTT046IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXRvLWpzb24nKSgnTWFwJyl9KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzXG4gKiogbW9kdWxlIGlkID0gODJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciBmb3JPZiAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgY2xhc3NvZiA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUpe1xuICByZXR1cm4gZnVuY3Rpb24gdG9KU09OKCl7XG4gICAgaWYoY2xhc3NvZih0aGlzKSAhPSBOQU1FKXRocm93IFR5cGVFcnJvcihOQU1FICsgXCIjdG9KU09OIGlzbid0IGdlbmVyaWNcIik7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvck9mKHRoaXMsIGZhbHNlLCBhcnIucHVzaCwgYXJyKTtcbiAgICByZXR1cm4gYXJyO1xuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXRvLWpzb24uanNcbiAqKiBtb2R1bGUgaWQgPSA4M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtTdHJpbmd9IHNlbGVjdG9yc1xuICovXG5cbmV4cG9ydCBjb25zdCBzZWxlY3RvcnMgPSAnc2Nyb2xsYmFyLCBbc2Nyb2xsYmFyXSwgW2RhdGEtc2Nyb2xsYmFyXSc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc2hhcmVkL3NlbGVjdG9ycy5qc1xuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vZGVib3VuY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfc3R5bGUnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfZGVsdGEnO1xuZXhwb3J0ICogZnJvbSAnLi9maW5kX2NoaWxkJztcbmV4cG9ydCAqIGZyb20gJy4vYnVpbGRfY3VydmUnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfdG91Y2hfaWQnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9zaXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9waWNrX2luX3JhbmdlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3BvaW50ZXJfZGF0YSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBkZWJvdW5jZVxuICovXG5cbi8vIGRlYm91bmNlIHRpbWVycyByZXNldCB3YWl0XG5jb25zdCBSRVNFVF9XQUlUID0gMTAwO1xuXG4vKipcbiAqIENhbGwgZm4gaWYgaXQgaXNuJ3QgYmUgY2FsbGVkIGluIGEgcGVyaW9kXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbd2FpdF06IGRlYm91bmNlIHdhaXQsIGRlZmF1bHQgaXMgUkVTVF9XQUlUXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtpbW1lZGlhdGVdOiB3aGV0aGVyIHRvIHJ1biB0YXNrIGF0IGxlYWRpbmcsIGRlZmF1bHQgaXMgdHJ1ZVxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5leHBvcnQgbGV0IGRlYm91bmNlID0gKGZuLCB3YWl0ID0gUkVTRVRfV0FJVCwgaW1tZWRpYXRlID0gdHJ1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIGxldCB0aW1lcjtcblxuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgICBpZiAoIXRpbWVyICYmIGltbWVkaWF0ZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBmbiguLi5hcmdzKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aW1lciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGZuKC4uLmFyZ3MpO1xuICAgICAgICB9LCB3YWl0KTtcbiAgICB9O1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9kZWJvdW5jZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IHNldFN0eWxlXG4gKi9cblxuY29uc3QgVkVORE9SX1BSRUZJWCA9IFtcbiAgICAnd2Via2l0JyxcbiAgICAnbW96JyxcbiAgICAnbXMnLFxuICAgICdvJ1xuXTtcblxuY29uc3QgUkUgPSBuZXcgUmVnRXhwKGBeLSg/ISg/OiR7VkVORE9SX1BSRUZJWC5qb2luKCd8Jyl9KS0pYCk7XG5cbmxldCBhdXRvUHJlZml4ID0gKHN0eWxlcykgPT4ge1xuICAgIGNvbnN0IHJlcyA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGlmICghUkUudGVzdChwcm9wKSkge1xuICAgICAgICAgICAgcmVzW3Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdmFsID0gc3R5bGVzW3Byb3BdO1xuXG4gICAgICAgIHByb3AgPSBwcm9wLnJlcGxhY2UoL14tLywgJycpO1xuICAgICAgICByZXNbcHJvcF0gPSB2YWw7XG5cbiAgICAgICAgVkVORE9SX1BSRUZJWC5mb3JFYWNoKChwcmVmaXgpID0+IHtcbiAgICAgICAgICAgIHJlc1tgLSR7cHJlZml4fS0ke3Byb3B9YF0gPSB2YWw7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuLyoqXG4gKiBzZXQgY3NzIHN0eWxlIGZvciB0YXJnZXQgZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbTogdGFyZ2V0IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdHlsZXM6IGNzcyBzdHlsZXMgdG8gYXBwbHlcbiAqL1xuZXhwb3J0IGxldCBzZXRTdHlsZSA9IChlbGVtLCBzdHlsZXMpID0+IHtcbiAgICBzdHlsZXMgPSBhdXRvUHJlZml4KHN0eWxlcyk7XG5cbiAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgbGV0IGNzc1Byb3AgPSBwcm9wLnJlcGxhY2UoL14tLywgJycpLnJlcGxhY2UoLy0oW2Etel0pL2csIChtLCAkMSkgPT4gJDEudG9VcHBlckNhc2UoKSk7XG4gICAgICAgIGVsZW0uc3R5bGVbY3NzUHJvcF0gPSBzdHlsZXNbcHJvcF07XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL3NldF9zdHlsZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldERlbHRhXG4gKiBAZGVwZW5kZW5jaWVzIFsgZ2V0T3JpZ2luYWxFdmVudCBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcblxuY29uc3QgREVMVEFfU0NBTEUgPSB7XG4gICAgU1RBTkRBUkQ6IDEsXG4gICAgT1RIRVJTOiAtM1xufTtcblxuY29uc3QgREVMVEFfTU9ERSA9IFsxLjAsIDI4LjAsIDUwMC4wXTtcblxubGV0IGdldERlbHRhTW9kZSA9IChtb2RlKSA9PiBERUxUQV9NT0RFW21vZGVdIHx8IERFTFRBX01PREVbMF07XG5cbi8qKlxuICogTm9ybWFsaXppbmcgd2hlZWwgZGVsdGFcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZXZ0OiBldmVudCBvYmplY3RcbiAqL1xuZXhwb3J0IGxldCBnZXREZWx0YSA9IChldnQpID0+IHtcbiAgICAvLyBnZXQgb3JpZ2luYWwgRE9NIGV2ZW50XG4gICAgZXZ0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgaWYgKCdkZWx0YVgnIGluIGV2dCkge1xuICAgICAgICBjb25zdCBtb2RlID0gZ2V0RGVsdGFNb2RlKGV2dC5kZWx0YU1vZGUpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBldnQuZGVsdGFYIC8gREVMVEFfU0NBTEUuU1RBTkRBUkQgKiBtb2RlLFxuICAgICAgICAgICAgeTogZXZ0LmRlbHRhWSAvIERFTFRBX1NDQUxFLlNUQU5EQVJEICogbW9kZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmICgnd2hlZWxEZWx0YVgnIGluIGV2dCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogZXZ0LndoZWVsRGVsdGFYIC8gREVMVEFfU0NBTEUuT1RIRVJTLFxuICAgICAgICAgICAgeTogZXZ0LndoZWVsRGVsdGFZIC8gREVMVEFfU0NBTEUuT1RIRVJTXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gaWUgd2l0aCB0b3VjaHBhZFxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IGV2dC53aGVlbERlbHRhIC8gREVMVEFfU0NBTEUuT1RIRVJTXG4gICAgfTtcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9nZXRfZGVsdGEuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXRPcmlnaW5hbEV2ZW50XG4gKi9cblxuLyoqXG4gKiBHZXQgb3JpZ2luYWwgRE9NIGV2ZW50XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKlxuICogQHJldHVybiB7RXZlbnRPYmplY3R9XG4gKi9cbmV4cG9ydCBsZXQgZ2V0T3JpZ2luYWxFdmVudCA9IChldnQpID0+IHtcbiAgICByZXR1cm4gZXZ0Lm9yaWdpbmFsRXZlbnQgfHwgZXZ0O1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9nZXRfb3JpZ2luYWxfZXZlbnQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBmaW5kQ2hpbGRcbiAqL1xuXG4vKipcbiAqIEZpbmQgZWxlbWVudCB3aXRoIHNwZWNpZmljIGNsYXNzIG5hbWUgd2l0aGluIGNoaWxkcmVuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBwYXJlbnRFbGVtXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lXG4gKlxuICogQHJldHVybiB7RWxlbWVudH06IGZpcnN0IG1hdGNoZWQgY2hpbGRcbiAqL1xuZXhwb3J0IGxldCBmaW5kQ2hpbGQgPSAocGFyZW50RWxlbSwgY2xhc3NOYW1lKSA9PiB7XG4gICAgbGV0IGNoaWxkcmVuID0gcGFyZW50RWxlbS5jaGlsZHJlbjtcblxuICAgIGlmICghY2hpbGRyZW4pIHJldHVybiBudWxsO1xuXG4gICAgZm9yIChsZXQgZWxlbSBvZiBjaGlsZHJlbikge1xuICAgICAgICBpZiAoZWxlbS5jbGFzc05hbWUubWF0Y2goY2xhc3NOYW1lKSkgcmV0dXJuIGVsZW07XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2ZpbmRfY2hpbGQuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDkxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yJyk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA5MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFuLW9iamVjdCcpXG4gICwgZ2V0ICAgICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuY29yZScpLmdldEl0ZXJhdG9yID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaXRlckZuID0gZ2V0KGl0KTtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICByZXR1cm4gYW5PYmplY3QoaXRlckZuLmNhbGwoaXQpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGJ1aWxkQ3VydmVcbiAqL1xuXG4vKipcbiAqIEJ1aWxkIHF1YWRyYXRpYyBlYXNpbmcgY3VydmVcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYmVnaW5cbiAqIEBwYXJhbSB7TnVtYmVyfSBkdXJhdGlvblxuICpcbiAqIEByZXR1cm4ge0FycmF5fTogcG9pbnRzXG4gKi9cbmV4cG9ydCBsZXQgYnVpbGRDdXJ2ZSA9IChkaXN0YW5jZSwgZHVyYXRpb24pID0+IHtcbiAgICBsZXQgcmVzID0gW107XG5cbiAgICBpZiAoZHVyYXRpb24gPD0gMCkgcmV0dXJuIHJlcztcblxuICAgIGNvbnN0IHQgPSBNYXRoLnJvdW5kKGR1cmF0aW9uIC8gMTAwMCAqIDYwKTtcbiAgICBjb25zdCBhID0gLWRpc3RhbmNlIC8gdCoqMjtcbiAgICBjb25zdCBiID0gLTIgKiBhICogdDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdDsgaSsrKSB7XG4gICAgICAgIHJlcy5wdXNoKGEgKiBpKioyICsgYiAqIGkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2J1aWxkX2N1cnZlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0VG91Y2hJRFxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQsIGdldFBvaW50ZXJEYXRhIF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuaW1wb3J0IHsgZ2V0UG9pbnRlckRhdGEgfSBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuXG4vKipcbiAqIEdldCB0b3VjaCBpZGVudGlmaWVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKlxuICogQHJldHVybiB7TnVtYmVyfTogdG91Y2ggaWRcbiAqL1xuZXhwb3J0IGxldCBnZXRUb3VjaElEID0gKGV2dCkgPT4ge1xuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGxldCBkYXRhID0gZ2V0UG9pbnRlckRhdGEoZXZ0KTtcblxuICAgIHJldHVybiBkYXRhLmlkZW50aWZpZXI7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF90b3VjaF9pZC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldFBvaW50ZXJEYXRhXG4gKiBAZGVwZW5kZW5jaWVzIFsgZ2V0T3JpZ2luYWxFdmVudCBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcblxuLyoqXG4gKiBHZXQgcG9pbnRlci90b3VjaCBkYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gZXZ0OiBldmVudCBvYmplY3RcbiAqL1xuZXhwb3J0IGxldCBnZXRQb2ludGVyRGF0YSA9IChldnQpID0+IHtcbiAgICAvLyBpZiBpcyB0b3VjaCBldmVudCwgcmV0dXJuIGxhc3QgaXRlbSBpbiB0b3VjaExpc3RcbiAgICAvLyBlbHNlIHJldHVybiBvcmlnaW5hbCBldmVudFxuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIHJldHVybiBldnQudG91Y2hlcyA/IGV2dC50b3VjaGVzW2V2dC50b3VjaGVzLmxlbmd0aCAtIDFdIDogZXZ0O1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF9wb2ludGVyX2RhdGEuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXRQb3NpdGlvblxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQsIGdldFBvaW50ZXJEYXRhIF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuaW1wb3J0IHsgZ2V0UG9pbnRlckRhdGEgfSBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuXG4vKipcbiAqIEdldCBwb2ludGVyL2ZpbmdlciBwb3NpdGlvblxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKlxuICogQHJldHVybiB7T2JqZWN0fTogcG9zaXRpb257eCwgeX1cbiAqL1xuZXhwb3J0IGxldCBnZXRQb3NpdGlvbiA9IChldnQpID0+IHtcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICBsZXQgZGF0YSA9IGdldFBvaW50ZXJEYXRhKGV2dCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBkYXRhLmNsaWVudFgsXG4gICAgICAgIHk6IGRhdGEuY2xpZW50WVxuICAgIH07XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X3Bvc2l0aW9uLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gcGlja0luUmFuZ2VcbiAqL1xuXG4vKipcbiAqIFBpY2sgdmFsdWUgaW4gcmFuZ2UgW21pbiwgbWF4XVxuICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gKiBAcGFyYW0ge051bWJlcn0gW21pbl1cbiAqIEBwYXJhbSB7TnVtYmVyfSBbbWF4XVxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0IGxldCBwaWNrSW5SYW5nZSA9ICh2YWx1ZSwgbWluID0gMCwgbWF4ID0gMCkgPT4gTWF0aC5tYXgobWluLCBNYXRoLm1pbih2YWx1ZSwgbWF4KSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9waWNrX2luX3JhbmdlLmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi91cGRhdGUnO1xuZXhwb3J0ICogZnJvbSAnLi9kZXN0cm95JztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3NpemUnO1xuZXhwb3J0ICogZnJvbSAnLi9saXN0ZW5lcic7XG5leHBvcnQgKiBmcm9tICcuL3Njcm9sbF90byc7XG5leHBvcnQgKiBmcm9tICcuL2lzX3Zpc2libGUnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9wb3NpdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL3RvZ2dsZV90cmFjayc7XG5leHBvcnQgKiBmcm9tICcuL2NsZWFyX21vdmVtZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5maW5pdGVfc2Nyb2xsJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X2NvbnRlbnRfZWxlbSc7XG5leHBvcnQgKiBmcm9tICcuL3Njcm9sbF9pbnRvX3ZpZXcnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSB1cGRhdGVcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSwgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogVXBkYXRlIHNjcm9sbGJhcnMgYXBwZWFyYW5jZVxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gYXN5bmM6IHVwZGF0ZSBhc3luY2hyb25vdXNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbihhc3luYyA9IHRydWUpIHtcbiAgICBsZXQgdXBkYXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcblxuICAgICAgICBsZXQgc2l6ZSA9IHRoaXMuZ2V0U2l6ZSgpO1xuXG4gICAgICAgIHRoaXMuX19yZWFkb25seSgnc2l6ZScsIHNpemUpO1xuXG4gICAgICAgIGxldCBuZXdMaW1pdCA9IHtcbiAgICAgICAgICAgIHg6IHNpemUuY29udGVudC53aWR0aCAtIHNpemUuY29udGFpbmVyLndpZHRoLFxuICAgICAgICAgICAgeTogc2l6ZS5jb250ZW50LmhlaWdodCAtIHNpemUuY29udGFpbmVyLmhlaWdodFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLmxpbWl0ICYmXG4gICAgICAgICAgICBuZXdMaW1pdC54ID09PSB0aGlzLmxpbWl0LnggJiZcbiAgICAgICAgICAgIG5ld0xpbWl0LnkgPT09IHRoaXMubGltaXQueSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHsgdGFyZ2V0cywgb3B0aW9ucyB9ID0gdGhpcztcblxuICAgICAgICBsZXQgdGh1bWJTaXplID0ge1xuICAgICAgICAgICAgLy8gcmVhbCB0aHVtYiBzaXplc1xuICAgICAgICAgICAgcmVhbFg6IHNpemUuY29udGFpbmVyLndpZHRoIC8gc2l6ZS5jb250ZW50LndpZHRoICogc2l6ZS5jb250YWluZXIud2lkdGgsXG4gICAgICAgICAgICByZWFsWTogc2l6ZS5jb250YWluZXIuaGVpZ2h0IC8gc2l6ZS5jb250ZW50LmhlaWdodCAqIHNpemUuY29udGFpbmVyLmhlaWdodFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHJlbmRlcmVkIHRodW1iIHNpemVzXG4gICAgICAgIHRodW1iU2l6ZS54ID0gTWF0aC5tYXgodGh1bWJTaXplLnJlYWxYLCBvcHRpb25zLnRodW1iTWluU2l6ZSk7XG4gICAgICAgIHRodW1iU2l6ZS55ID0gTWF0aC5tYXgodGh1bWJTaXplLnJlYWxZLCBvcHRpb25zLnRodW1iTWluU2l6ZSk7XG5cbiAgICAgICAgdGhpcy5fX3JlYWRvbmx5KCdsaW1pdCcsIG5ld0xpbWl0KVxuICAgICAgICAgICAgLl9fcmVhZG9ubHkoJ3RodW1iU2l6ZScsIHRodW1iU2l6ZSk7XG5cbiAgICAgICAgY29uc3QgeyB4QXhpcywgeUF4aXMgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgICAgICAvLyBoaWRlIHNjcm9sbGJhciBpZiBjb250ZW50IHNpemUgbGVzcyB0aGFuIGNvbnRhaW5lclxuICAgICAgICBzZXRTdHlsZSh4QXhpcy50cmFjaywge1xuICAgICAgICAgICAgJ2Rpc3BsYXknOiBzaXplLmNvbnRlbnQud2lkdGggPD0gc2l6ZS5jb250YWluZXIud2lkdGggPyAnbm9uZScgOiAnYmxvY2snXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRTdHlsZSh5QXhpcy50cmFjaywge1xuICAgICAgICAgICAgJ2Rpc3BsYXknOiBzaXplLmNvbnRlbnQuaGVpZ2h0IDw9IHNpemUuY29udGFpbmVyLmhlaWdodCA/ICdub25lJyA6ICdibG9jaydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gdXNlIHBlcmNlbnRhZ2UgdmFsdWUgZm9yIHRodW1iXG4gICAgICAgIHNldFN0eWxlKHhBeGlzLnRodW1iLCB7XG4gICAgICAgICAgICAnd2lkdGgnOiBgJHt0aHVtYlNpemUueH1weGBcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFN0eWxlKHlBeGlzLnRodW1iLCB7XG4gICAgICAgICAgICAnaGVpZ2h0JzogYCR7dGh1bWJTaXplLnl9cHhgXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHJlLXBvc2l0aW9uaW5nXG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0LCBsaW1pdCB9ID0gdGhpcztcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihNYXRoLm1pbihvZmZzZXQueCwgbGltaXQueCksIE1hdGgubWluKG9mZnNldC55LCBsaW1pdC55KSk7XG4gICAgICAgIHRoaXMuX19zZXRUaHVtYlBvc2l0aW9uKCk7XG4gICAgfTtcblxuICAgIGlmIChhc3luYykge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1cGRhdGUoKTtcbiAgICB9XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvdXBkYXRlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gZGVzdHJveVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBzYkxpc3QgfSBmcm9tICcuLi9zaGFyZWQnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBSZW1vdmUgYWxsIHNjcm9sbGJhciBsaXN0ZW5lcnMgYW5kIGV2ZW50IGhhbmRsZXJzXG4gKiBSZXNldFxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IF9fbGlzdGVuZXJzLCBfX2hhbmRsZXJzLCB0YXJnZXRzIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCBjb250ZW50IH0gPSB0YXJnZXRzO1xuXG4gICAgX19oYW5kbGVycy5mb3JFYWNoKCh7IGV2dCwgZWxlbSwgaGFuZGxlciB9KSA9PiB7XG4gICAgICAgIGVsZW0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGhhbmRsZXIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5zY3JvbGxUbygwLCAwLCAzMDAsICgpID0+IHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fX3RpbWVySUQucmVuZGVyKTtcbiAgICAgICAgX19oYW5kbGVycy5sZW5ndGggPSBfX2xpc3RlbmVycy5sZW5ndGggPSAwO1xuXG4gICAgICAgIC8vIHJlc2V0IHNjcm9sbCBwb3NpdGlvblxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcbiAgICAgICAgICAgIG92ZXJmbG93OiAnJ1xuICAgICAgICB9KTtcblxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xuXG4gICAgICAgIC8vIHJlc2V0IGNvbnRlbnRcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBbLi4uY29udGVudC5jaGlsZHJlbl07XG5cbiAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goKGVsKSA9PiBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWwpKTtcblxuICAgICAgICAvLyByZW1vdmUgZm9ybSBzYkxpc3RcbiAgICAgICAgc2JMaXN0LmRlbGV0ZShjb250YWluZXIpO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2Rlc3Ryb3kuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBnZXRTaXplXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIEdldCBjb250YWluZXIgYW5kIGNvbnRlbnQgc2l6ZVxuICpcbiAqIEByZXR1cm4ge09iamVjdH06IGFuIG9iamVjdCBjb250YWlucyBjb250YWluZXIgYW5kIGNvbnRlbnQncyB3aWR0aCBhbmQgaGVpZ2h0XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuZ2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBjb250YWluZXIgPSB0aGlzLnRhcmdldHMuY29udGFpbmVyO1xuICAgIGxldCBjb250ZW50ID0gdGhpcy50YXJnZXRzLmNvbnRlbnQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb250YWluZXI6IHtcbiAgICAgICAgICAgIC8vIHJlcXVpcmVzIGBvdmVyZmxvdzogaGlkZGVuYFxuICAgICAgICAgICAgd2lkdGg6IGNvbnRhaW5lci5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogY29udGFpbmVyLmNsaWVudEhlaWdodFxuICAgICAgICB9LFxuICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAvLyBib3JkZXIgd2lkdGggc2hvdWxkIGJlIGluY2x1ZGVkXG4gICAgICAgICAgICB3aWR0aDogY29udGVudC5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogY29udGVudC5vZmZzZXRIZWlnaHRcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvZ2V0X3NpemUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBhZGRMaXN0ZW5lclxuICogICAgICAgICAgICB7RnVuY3Rpb259IHJlbW92ZUxpc3RlbmVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIEFkZCBzY3JvbGxpbmcgbGlzdGVuZXJcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYjogbGlzdGVuZXJcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgdGhpcy5fX2xpc3RlbmVycy5wdXNoKGNiKTtcbn07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogUmVtb3ZlIHNwZWNpZmljIGxpc3RlbmVyIGZyb20gYWxsIGxpc3RlbmVyc1xuICogQHBhcmFtIHt0eXBlfSBwYXJhbTogZGVzY3JpcHRpb25cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKGNiKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgdGhpcy5fX2xpc3RlbmVycy5zb21lKChmbiwgaWR4LCBhbGwpID0+IHtcbiAgICAgICAgcmV0dXJuIGZuID09PSBjYiAmJiBhbGwuc3BsaWNlKGlkeCwgMSk7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvbGlzdGVuZXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzY3JvbGxUb1xuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlLCBidWlsZEN1cnZlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFNjcm9sbGluZyBzY3JvbGxiYXIgdG8gcG9zaXRpb24gd2l0aCB0cmFuc2l0aW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt4XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHggYXhpc1xuICogQHBhcmFtIHtOdW1iZXJ9IFt5XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHkgYXhpc1xuICogQHBhcmFtIHtOdW1iZXJ9IFtkdXJhdGlvbl06IHRyYW5zaXRpb24gZHVyYXRpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl06IGNhbGxiYWNrXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc2Nyb2xsVG8gPSBmdW5jdGlvbih4ID0gdGhpcy5vZmZzZXQueCwgeSA9IHRoaXMub2Zmc2V0LnksIGR1cmF0aW9uID0gMCwgY2IgPSBudWxsKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIGxpbWl0LFxuICAgICAgICB2ZWxvY2l0eSxcbiAgICAgICAgX190aW1lcklEXG4gICAgfSA9IHRoaXM7XG5cbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZShfX3RpbWVySUQuc2Nyb2xsVG8pO1xuICAgIGNiID0gdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nID8gY2IgOiAoKSA9PiB7fTtcblxuICAgIGNvbnN0IHN0YXJ0WCA9IG9mZnNldC54O1xuICAgIGNvbnN0IHN0YXJ0WSA9IG9mZnNldC55O1xuXG4gICAgY29uc3QgZGlzWCA9IHBpY2tJblJhbmdlKHgsIDAsIGxpbWl0LngpIC0gc3RhcnRYO1xuICAgIGNvbnN0IGRpc1kgPSBwaWNrSW5SYW5nZSh5LCAwLCBsaW1pdC55KSAtIHN0YXJ0WTtcblxuICAgIGNvbnN0IGN1cnZlWCA9IGJ1aWxkQ3VydmUoZGlzWCwgZHVyYXRpb24pO1xuICAgIGNvbnN0IGN1cnZlWSA9IGJ1aWxkQ3VydmUoZGlzWSwgZHVyYXRpb24pO1xuXG4gICAgbGV0IGZyYW1lID0gMCwgdG90YWxGcmFtZSA9IGN1cnZlWC5sZW5ndGg7XG5cbiAgICBsZXQgc2Nyb2xsID0gKCkgPT4ge1xuICAgICAgICBpZiAoZnJhbWUgPT09IHRvdGFsRnJhbWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNiKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHN0YXJ0WCArIGN1cnZlWFtmcmFtZV0sIHN0YXJ0WSArIGN1cnZlWVtmcmFtZV0pO1xuXG4gICAgICAgIGZyYW1lKys7XG5cbiAgICAgICAgX190aW1lcklELnNjcm9sbFRvID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNjcm9sbCk7XG4gICAgfTtcblxuICAgIHNjcm9sbCgpO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3Njcm9sbF90by5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNldE9wdGlvbnNcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5pbXBvcnQgeyBPUFRJT05fTElNSVQgfSBmcm9tICcuLi9zaGFyZWQvJztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTZXQgc2Nyb2xsYmFyIG9wdGlvbnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zID0ge30pIHtcbiAgICBsZXQgcmVzID0ge307XG5cbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KHByb3ApIHx8IG9wdGlvbnNbcHJvcF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgIHJlc1twcm9wXSA9IG9wdGlvbnNbcHJvcF07XG4gICAgfSk7XG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgcmVzKTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9zZXRfb3B0aW9ucy5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSAxMDZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5PYmplY3QuYXNzaWduO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDEwN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiwgJ09iamVjdCcsIHthc3NpZ246IHJlcXVpcmUoJy4vJC5vYmplY3QtYXNzaWduJyl9KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSAxMDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBJT2JqZWN0ICA9IHJlcXVpcmUoJy4vJC5pb2JqZWN0Jyk7XG5cbi8vIHNob3VsZCB3b3JrIHdpdGggc3ltYm9scyBhbmQgc2hvdWxkIGhhdmUgZGV0ZXJtaW5pc3RpYyBwcm9wZXJ0eSBvcmRlciAoVjggYnVnKVxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuZmFpbHMnKShmdW5jdGlvbigpe1xuICB2YXIgYSA9IE9iamVjdC5hc3NpZ25cbiAgICAsIEEgPSB7fVxuICAgICwgQiA9IHt9XG4gICAgLCBTID0gU3ltYm9sKClcbiAgICAsIEsgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnO1xuICBBW1NdID0gNztcbiAgSy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbihrKXsgQltrXSA9IGs7IH0pO1xuICByZXR1cm4gYSh7fSwgQSlbU10gIT0gNyB8fCBPYmplY3Qua2V5cyhhKHt9LCBCKSkuam9pbignJykgIT0gSztcbn0pID8gZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICB2YXIgVCAgICAgPSB0b09iamVjdCh0YXJnZXQpXG4gICAgLCAkJCAgICA9IGFyZ3VtZW50c1xuICAgICwgJCRsZW4gPSAkJC5sZW5ndGhcbiAgICAsIGluZGV4ID0gMVxuICAgICwgZ2V0S2V5cyAgICA9ICQuZ2V0S2V5c1xuICAgICwgZ2V0U3ltYm9scyA9ICQuZ2V0U3ltYm9sc1xuICAgICwgaXNFbnVtICAgICA9ICQuaXNFbnVtO1xuICB3aGlsZSgkJGxlbiA+IGluZGV4KXtcbiAgICB2YXIgUyAgICAgID0gSU9iamVjdCgkJFtpbmRleCsrXSlcbiAgICAgICwga2V5cyAgID0gZ2V0U3ltYm9scyA/IGdldEtleXMoUykuY29uY2F0KGdldFN5bWJvbHMoUykpIDogZ2V0S2V5cyhTKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBqICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShsZW5ndGggPiBqKWlmKGlzRW51bS5jYWxsKFMsIGtleSA9IGtleXNbaisrXSkpVFtrZXldID0gU1trZXldO1xuICB9XG4gIHJldHVybiBUO1xufSA6IE9iamVjdC5hc3NpZ247XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LWFzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDEwOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2V0UG9zaXRpb25cbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSwgc2V0U3R5bGUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogU2V0IHNjcm9sbGJhciBwb3NpdGlvbiB3aXRob3V0IHRyYW5zaXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3hdOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0gW3ldOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geSBheGlzXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRob3V0Q2FsbGJhY2tzXTogZGlzYWJsZSBjYWxsYmFjayBmdW5jdGlvbnMgdGVtcG9yYXJpbHlcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHggPSB0aGlzLm9mZnNldC54LCB5ID0gdGhpcy5vZmZzZXQueSwgd2l0aG91dENhbGxiYWNrcyA9IGZhbHNlKSB7XG4gICAgdGhpcy5fX3VwZGF0ZVRocm90dGxlKCk7XG5cbiAgICBjb25zdCBzdGF0dXMgPSB7fTtcbiAgICBjb25zdCB7IG9mZnNldCwgbGltaXQsIHRhcmdldHMsIF9fbGlzdGVuZXJzIH0gPSB0aGlzO1xuXG4gICAgaWYgKE1hdGguYWJzKHggLSBvZmZzZXQueCkgPiAxKSB0aGlzLnNob3dUcmFjaygneCcpO1xuICAgIGlmIChNYXRoLmFicyh5IC0gb2Zmc2V0LnkpID4gMSkgdGhpcy5zaG93VHJhY2soJ3knKTtcblxuICAgIHggPSBwaWNrSW5SYW5nZSh4LCAwLCBsaW1pdC54KTtcbiAgICB5ID0gcGlja0luUmFuZ2UoeSwgMCwgbGltaXQueSk7XG5cbiAgICB0aGlzLmhpZGVUcmFjaygpO1xuXG4gICAgaWYgKHggPT09IG9mZnNldC54ICYmIHkgPT09IG9mZnNldC55KSByZXR1cm47XG5cbiAgICBzdGF0dXMuZGlyZWN0aW9uID0ge1xuICAgICAgICB4OiB4ID09PSBvZmZzZXQueCA/ICdub25lJyA6ICh4ID4gb2Zmc2V0LnggPyAncmlnaHQnIDogJ2xlZnQnKSxcbiAgICAgICAgeTogeSA9PT0gb2Zmc2V0LnkgPyAnbm9uZScgOiAoeSA+IG9mZnNldC55ID8gJ2Rvd24nIDogJ3VwJylcbiAgICB9O1xuXG4gICAgc3RhdHVzLmxpbWl0ID0geyAuLi5saW1pdCB9O1xuXG4gICAgb2Zmc2V0LnggPSB4O1xuICAgIG9mZnNldC55ID0geTtcbiAgICBzdGF0dXMub2Zmc2V0ID0geyAuLi5vZmZzZXQgfTtcblxuICAgIC8vIHJlc2V0IHRodW1iIHBvc2l0aW9uIGFmdGVyIG9mZnNldCB1cGRhdGVcbiAgICB0aGlzLl9fc2V0VGh1bWJQb3NpdGlvbigpO1xuXG4gICAgc2V0U3R5bGUodGFyZ2V0cy5jb250ZW50LCB7XG4gICAgICAgICctdHJhbnNmb3JtJzogYHRyYW5zbGF0ZTNkKCR7LXh9cHgsICR7LXl9cHgsIDApYFxuICAgIH0pO1xuXG4gICAgLy8gaW52b2tlIGFsbCBsaXN0ZW5lcnNcbiAgICBpZiAod2l0aG91dENhbGxiYWNrcykgcmV0dXJuO1xuICAgIF9fbGlzdGVuZXJzLmZvckVhY2goKGZuKSA9PiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBmbihzdGF0dXMpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9zZXRfcG9zaXRpb24uanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkYXNzaWduID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBfT2JqZWN0JGFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2V4dGVuZHMuanNcbiAqKiBtb2R1bGUgaWQgPSAxMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNob3dUcmFja1xuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGhpZGVUcmFja1xuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBzaG93IHNjcm9sbGJhciB0cmFjayBvbiBnaXZlbiBkaXJlY3Rpb25cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uOiB3aGljaCBkaXJlY3Rpb24gb2YgdHJhY2tzIHRvIHNob3csIGRlZmF1bHQgaXMgJ2JvdGgnXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc2hvd1RyYWNrID0gZnVuY3Rpb24oZGlyZWN0aW9uID0gJ2JvdGgnKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIsIHhBeGlzLCB5QXhpcyB9ID0gdGhpcy50YXJnZXRzO1xuXG4gICAgZGlyZWN0aW9uID0gZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCk7XG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGluZycpO1xuXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2JvdGgnKSB7XG4gICAgICAgIHhBeGlzLnRyYWNrLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICAgICAgeUF4aXMudHJhY2suY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gPT09ICd4Jykge1xuICAgICAgICB4QXhpcy50cmFjay5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3knKSB7XG4gICAgICAgIHlBeGlzLnRyYWNrLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIGhpZGUgdHJhY2sgd2l0aCAzMDBtcyBkZWJvdW5jZVxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmhpZGVUcmFjayA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0cywgX190aW1lcklEIH0gPSB0aGlzO1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCB4QXhpcywgeUF4aXMgfSA9IHRhcmdldHM7XG5cbiAgICBjbGVhclRpbWVvdXQoX190aW1lcklELnRyYWNrKTtcblxuICAgIF9fdGltZXJJRC50cmFjayA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsaW5nJyk7XG4gICAgICAgIHhBeGlzLnRyYWNrLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICAgICAgeUF4aXMudHJhY2suY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgIH0sIDMwMCk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvdG9nZ2xlX3RyYWNrLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gY2xlYXJNb3ZlbWVudHxzdG9wXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFN0b3Agc2Nyb2xsYmFyIHJpZ2h0IGF3YXlcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5jbGVhck1vdmVtZW50ID0gU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5tb3ZlbWVudC54ID0gdGhpcy5tb3ZlbWVudC55ID0gMDtcbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9fdGltZXJJRC5zY3JvbGxUbyk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvY2xlYXJfbW92ZW1lbnQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBpbmZpbml0ZVNjcm9sbFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBDcmVhdGUgaW5maW5pdGUgc2Nyb2xsIGxpc3RlbmVyXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2I6IGluZmluaXRlIHNjcm9sbCBhY3Rpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbdGhyZXNob2xkXTogaW5maW5pdGUgc2Nyb2xsIHRocmVzaG9sZCh0byBib3R0b20pLCBkZWZhdWx0IGlzIDUwKHB4KVxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmluZmluaXRlU2Nyb2xsID0gZnVuY3Rpb24oY2IsIHRocmVzaG9sZCA9IDUwKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgbGV0IGxhc3RPZmZzZXQgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgbGV0IGVudGVyZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuYWRkTGlzdGVuZXIoKHN0YXR1cykgPT4ge1xuICAgICAgICBsZXQgeyBvZmZzZXQsIGxpbWl0IH0gPSBzdGF0dXM7XG5cbiAgICAgICAgaWYgKGxpbWl0LnkgLSBvZmZzZXQueSA8PSB0aHJlc2hvbGQgJiYgb2Zmc2V0LnkgPiBsYXN0T2Zmc2V0LnkgJiYgIWVudGVyZWQpIHtcbiAgICAgICAgICAgIGVudGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBjYihzdGF0dXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaW1pdC55IC0gb2Zmc2V0LnkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGVudGVyZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RPZmZzZXQgPSBvZmZzZXQ7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvaW5maW5pdGVfc2Nyb2xsLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gZ2V0Q29udGVudEVsZW1cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogR2V0IHNjcm9sbCBjb250ZW50IGVsZW1lbnRcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5nZXRDb250ZW50RWxlbSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldHMuY29udGVudDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9nZXRfY29udGVudF9lbGVtLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2Nyb2xsSW50b1ZpZXdcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogU2Nyb2xsIHRhcmdldCBlbGVtZW50IGludG8gdmlzaWJsZSBhcmVhIG9mIHNjcm9sbGJhci5cbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSB0YXJnZXQgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0IGVsZW1lbnRcbiAqIEBwYXJhbSAge0Jvb2xlYW59IG9wdGlvbnMub25seVNjcm9sbElmTmVlZGVkICB3aGV0aGVyIHNjcm9sbCBjb250YWluZXIgd2hlbiB0YXJnZXQgZWxlbWVudCBpcyB2aXNpYmxlXG4gKiBAcGFyYW0gIHtOdW1iZXJ9ICBvcHRpb25zLm9mZnNldFRvcCAgICAgICAgICAgc2Nyb2xsaW5nIHN0b3Agb2Zmc2V0IHRvIHRvcFxuICogQHBhcmFtICB7TnVtYmVyfSAgb3B0aW9ucy5vZmZzZXRMZWZ0ICAgICAgICAgIHNjcm9sbGluZyBzdG9wIG9mZnNldCB0byBsZWZ0XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc2Nyb2xsSW50b1ZpZXcgPSBmdW5jdGlvbihlbGVtLFxue1xuICAgIG9ubHlTY3JvbGxJZk5lZWRlZCA9IGZhbHNlLFxuICAgIG9mZnNldFRvcCA9IDAsXG4gICAgb2Zmc2V0TGVmdCA9IDBcbn0gPSB7fSkge1xuICAgIGNvbnN0IHsgdGFyZ2V0cywgYm91bmRpbmcsIG1vdmVtZW50IH0gPSB0aGlzO1xuXG4gICAgaWYgKCFlbGVtIHx8ICF0YXJnZXRzLmNvbnRhaW5lci5jb250YWlucyhlbGVtKSkgcmV0dXJuO1xuXG4gICAgbGV0IHRhcmdldEJvdW5kaW5nID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIGlmIChvbmx5U2Nyb2xsSWZOZWVkZWQgJiYgdGhpcy5pc1Zpc2libGUoZWxlbSkpIHJldHVybjtcblxuICAgIHRoaXMuX19zZXRNb3ZlbWVudChcbiAgICAgICAgdGFyZ2V0Qm91bmRpbmcubGVmdCAtIGJvdW5kaW5nLmxlZnQgLSBvZmZzZXRMZWZ0LFxuICAgICAgICB0YXJnZXRCb3VuZGluZy50b3AgLSBib3VuZGluZy50b3AgLSBvZmZzZXRUb3AsXG4gICAgICAgIHRydWVcbiAgICApO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3Njcm9sbF9pbnRvX3ZpZXcuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlbmRlcic7XG5leHBvcnQgKiBmcm9tICcuL2FkZF9tb3ZlbWVudCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9tb3ZlbWVudCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19yZW5kZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIG5leHRUaWNrKG9wdGlvbnMsIGN1cnJlbnQsIG1vdmVtZW50KSB7XG4gICAgY29uc3QgeyBmcmljdGlvbiB9ID0gb3B0aW9ucztcblxuICAgIGlmIChNYXRoLmFicyhtb3ZlbWVudCkgPCAxKSB7XG4gICAgICAgIGxldCBuZXh0ID0gY3VycmVudCArIG1vdmVtZW50O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtb3ZlbWVudDogMCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBjdXJyZW50ID4gbmV4dCA/IE1hdGguY2VpbChuZXh0KSA6IE1hdGguZmxvb3IobmV4dClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgcSA9IDEgLSBmcmljdGlvbiAvIDEwMDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG1vdmVtZW50OiBtb3ZlbWVudCAqIHEsXG4gICAgICAgIHBvc2l0aW9uOiBjdXJyZW50ICsgbW92ZW1lbnQgKiAoMSAtIHEpXG4gICAgfTtcbn07XG5cbmZ1bmN0aW9uIF9fcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBtb3ZlbWVudCxcbiAgICAgICAgX190aW1lcklEXG4gICAgfSA9IHRoaXM7XG5cbiAgICBpZiAobW92ZW1lbnQueCB8fCBtb3ZlbWVudC55KSB7XG4gICAgICAgIGxldCBuZXh0WCA9IG5leHRUaWNrKG9wdGlvbnMsIG9mZnNldC54LCBtb3ZlbWVudC54KTtcbiAgICAgICAgbGV0IG5leHRZID0gbmV4dFRpY2sob3B0aW9ucywgb2Zmc2V0LnksIG1vdmVtZW50LnkpO1xuXG4gICAgICAgIG1vdmVtZW50LnggPSBuZXh0WC5tb3ZlbWVudDtcbiAgICAgICAgbW92ZW1lbnQueSA9IG5leHRZLm1vdmVtZW50O1xuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24obmV4dFgucG9zaXRpb24sIG5leHRZLnBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBfX3RpbWVySUQucmVuZGVyID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXM6Ol9fcmVuZGVyKTtcblxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3JlbmRlcicsIHtcbiAgICB2YWx1ZTogX19yZW5kZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9yZW5kZXIvcmVuZGVyLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19hZGRNb3ZlbWVudFxuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19hZGRNb3ZlbWVudChkZWx0YVggPSAwLCBkZWx0YVkgPSAwKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBtb3ZlbWVudFxuICAgIH0gPSB0aGlzO1xuXG4gICAgdGhpcy5fX3VwZGF0ZVRocm90dGxlKCk7XG5cbiAgICBsZXQgeCA9IG1vdmVtZW50LnggKyBkZWx0YVggKiBvcHRpb25zLnNwZWVkO1xuICAgIGxldCB5ID0gbW92ZW1lbnQueSArIGRlbHRhWSAqIG9wdGlvbnMuc3BlZWQ7XG5cbiAgICBpZiAob3B0aW9ucy5jb250aW51b3VzU2Nyb2xsaW5nKSB7XG4gICAgICAgIG1vdmVtZW50LnggPSB4O1xuICAgICAgICBtb3ZlbWVudC55ID0geTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgbGltaXQgPSB0aGlzLl9fZ2V0RGVsdGFMaW1pdCgpO1xuXG4gICAgICAgIG1vdmVtZW50LnggPSBwaWNrSW5SYW5nZSh4LCAuLi5saW1pdC54KTtcbiAgICAgICAgbW92ZW1lbnQueSA9IHBpY2tJblJhbmdlKHksIC4uLmxpbWl0LnkpO1xuICAgIH1cbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19hZGRNb3ZlbWVudCcsIHtcbiAgICB2YWx1ZTogX19hZGRNb3ZlbWVudCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9hZGRfbW92ZW1lbnQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3NldE1vdmVtZW50XG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX3NldE1vdmVtZW50KGRlbHRhWCA9IDAsIGRlbHRhWSA9IDAsIGlnbm9yZVNwZWVkID0gZmFsc2UpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG1vdmVtZW50XG4gICAgfSA9IHRoaXM7XG5cbiAgICB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcblxuICAgIGxldCBsaW1pdCA9IHRoaXMuX19nZXREZWx0YUxpbWl0KCk7XG4gICAgbGV0IHNwZWVkID0gaWdub3JlU3BlZWQgPyAxIDogb3B0aW9ucy5zcGVlZDtcblxuICAgIG1vdmVtZW50LnggPSBwaWNrSW5SYW5nZShkZWx0YVggKiBzcGVlZCwgLi4ubGltaXQueCk7XG4gICAgbW92ZW1lbnQueSA9IHBpY2tJblJhbmdlKGRlbHRhWSAqIHNwZWVkLCAuLi5saW1pdC55KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZXRNb3ZlbWVudCcsIHtcbiAgICB2YWx1ZTogX19zZXRNb3ZlbWVudCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9zZXRfbW92ZW1lbnQuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL2RyYWcnO1xuZXhwb3J0ICogZnJvbSAnLi90b3VjaCc7XG5leHBvcnQgKiBmcm9tICcuL21vdXNlJztcbmV4cG9ydCAqIGZyb20gJy4vd2hlZWwnO1xuZXhwb3J0ICogZnJvbSAnLi9yZXNpemUnO1xuZXhwb3J0ICogZnJvbSAnLi9zZWxlY3QnO1xuZXhwb3J0ICogZnJvbSAnLi9rZXlib2FyZCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19kcmFnSGFuZGxlclxuICovXG5cbiBpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbiBpbXBvcnQge1xuICAgIGdldE9yaWdpbmFsRXZlbnQsXG4gICAgZ2V0UG9zaXRpb24sXG4gICAgZ2V0VG91Y2hJRCxcbiAgICBwaWNrSW5SYW5nZSxcbiAgICBzZXRTdHlsZVxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbiBleHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuIGxldCBfX2RyYWdIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIsIGNvbnRlbnQgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGxldCBpc0RyYWcgPSBmYWxzZTtcbiAgICBsZXQgYW5pbWF0aW9uID0gdW5kZWZpbmVkO1xuICAgIGxldCB0YXJnZXRIZWlnaHQgPSB1bmRlZmluZWQ7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19faXNEcmFnJywge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNEcmFnO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgbGV0IHNjcm9sbCA9ICh7IHgsIHkgfSkgPT4ge1xuICAgICAgICBpZiAoIXggJiYgIXkpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoeCwgeSk7XG5cbiAgICAgICAgYW5pbWF0aW9uID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHNjcm9sbCh7IHgsIHkgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoZG9jdW1lbnQsICdkcmFnb3ZlciBtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRHJhZyB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBkaXIgPSB0aGlzLl9fZ2V0UG9pbnRlclRyZW5kKGV2dCwgdGFyZ2V0SGVpZ2h0KTtcblxuICAgICAgICBzY3JvbGwoZGlyKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdkcmFnc3RhcnQnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIHNldFN0eWxlKGNvbnRlbnQsIHtcbiAgICAgICAgICAgICdwb2ludGVyLWV2ZW50cyc6ICdhdXRvJ1xuICAgICAgICB9KTtcblxuICAgICAgICB0YXJnZXRIZWlnaHQgPSBldnQudGFyZ2V0LmNsaWVudEhlaWdodDtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgdGhpcy5fX3VwZGF0ZUJvdW5kaW5nKCk7XG4gICAgICAgIGlzRHJhZyA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5fX2FkZEV2ZW50KGRvY3VtZW50LCAnZHJhZ2VuZCBtb3VzZXVwIHRvdWNoZW5kIGJsdXInLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICBpc0RyYWcgPSBmYWxzZTtcbiAgICB9KTtcbiB9O1xuXG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2RyYWdIYW5kbGVyJywge1xuICAgICB2YWx1ZTogX19kcmFnSGFuZGxlcixcbiAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuIH0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2RyYWcuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3RvdWNoSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHtcbiAgICBnZXRPcmlnaW5hbEV2ZW50LFxuICAgIGdldFBvc2l0aW9uLFxuICAgIGdldFRvdWNoSUQsXG4gICAgcGlja0luUmFuZ2Vcbn0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuY29uc3QgRUFTSU5HX0RVUkFUSU9OID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvYW5kcm9pZC9pKSA/IDE1MDAgOiA3NTA7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBUb3VjaCBldmVudCBoYW5kbGVycyBidWlsZGVyXG4gKi9cbmxldCBfX3RvdWNoSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBsZXQgbGFzdFRvdWNoVGltZSwgbGFzdFRvdWNoSUQ7XG4gICAgbGV0IG1vdmVWZWxvY2l0eSA9IHt9LCBsYXN0VG91Y2hQb3MgPSB7fSwgdG91Y2hSZWNvcmRzID0ge307XG5cbiAgICBsZXQgdXBkYXRlUmVjb3JkcyA9IChldnQpID0+IHtcbiAgICAgICAgY29uc3QgdG91Y2hMaXN0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpLnRvdWNoZXM7XG5cbiAgICAgICAgT2JqZWN0LmtleXModG91Y2hMaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIC8vIHJlY29yZCBhbGwgdG91Y2hlcyB0aGF0IHdpbGwgYmUgcmVzdG9yZWRcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdsZW5ndGgnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gdG91Y2hMaXN0W2tleV07XG5cbiAgICAgICAgICAgIHRvdWNoUmVjb3Jkc1t0b3VjaC5pZGVudGlmaWVyXSA9IGdldFBvc2l0aW9uKHRvdWNoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICd0b3VjaHN0YXJ0JywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lzRHJhZykgcmV0dXJuO1xuXG4gICAgICAgIHVwZGF0ZVJlY29yZHMoZXZ0KTtcblxuICAgICAgICBsYXN0VG91Y2hUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGFzdFRvdWNoSUQgPSBnZXRUb3VjaElEKGV2dCk7XG4gICAgICAgIGxhc3RUb3VjaFBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICAgICAgLy8gc3RvcCBzY3JvbGxpbmdcbiAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIG1vdmVWZWxvY2l0eS54ID0gbW92ZVZlbG9jaXR5LnkgPSAwO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3RvdWNobW92ZScsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpIHx8IHRoaXMuX19pc0RyYWcpIHJldHVybjtcblxuICAgICAgICB1cGRhdGVSZWNvcmRzKGV2dCk7XG5cbiAgICAgICAgY29uc3QgdG91Y2hJRCA9IGdldFRvdWNoSUQoZXZ0KTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0IH0gPSB0aGlzO1xuXG4gICAgICAgIGlmIChsYXN0VG91Y2hJRCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyByZXNldCBsYXN0IHRvdWNoIGluZm8gZnJvbSByZWNvcmRzXG4gICAgICAgICAgICBsYXN0VG91Y2hJRCA9IHRvdWNoSUQ7XG5cbiAgICAgICAgICAgIC8vIGRvbid0IG5lZWQgZXJyb3IgaGFuZGxlclxuICAgICAgICAgICAgbGFzdFRvdWNoVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBsYXN0VG91Y2hQb3MgPSB0b3VjaFJlY29yZHNbdG91Y2hJRF07XG4gICAgICAgIH0gZWxzZSBpZiAodG91Y2hJRCAhPT0gbGFzdFRvdWNoSUQpIHtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgbXVsdGktdG91Y2ggYm91bmNpbmdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGFzdFRvdWNoUG9zKSByZXR1cm47XG5cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIGxhc3RUb3VjaFRpbWU7XG4gICAgICAgIGxldCB7IHg6IGxhc3RYLCB5OiBsYXN0WSB9ID0gbGFzdFRvdWNoUG9zO1xuICAgICAgICBsZXQgeyB4OiBjdXJYLCB5OiBjdXJZIH0gPSBsYXN0VG91Y2hQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMTsgLy8gZml4IEluZmluaXR5IGVycm9yXG5cbiAgICAgICAgbW92ZVZlbG9jaXR5LnggPSAobGFzdFggLSBjdXJYKSAvIGR1cmF0aW9uO1xuICAgICAgICBtb3ZlVmVsb2NpdHkueSA9IChsYXN0WSAtIGN1clkpIC8gZHVyYXRpb247XG5cbiAgICAgICAgbGV0IGRlc3RYID0gcGlja0luUmFuZ2UobGFzdFggLSBjdXJYICsgb2Zmc2V0LngsIDAsIGxpbWl0LngpO1xuICAgICAgICBsZXQgZGVzdFkgPSBwaWNrSW5SYW5nZShsYXN0WSAtIGN1clkgKyBvZmZzZXQueSwgMCwgbGltaXQueSk7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihkZXN0WCwgZGVzdFkpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3RvdWNoZW5kJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkgfHwgdGhpcy5fX2lzRHJhZykgcmV0dXJuO1xuXG4gICAgICAgIC8vIHJlbGVhc2UgY3VycmVudCB0b3VjaFxuICAgICAgICBkZWxldGUgdG91Y2hSZWNvcmRzW2xhc3RUb3VjaElEXTtcbiAgICAgICAgbGFzdFRvdWNoSUQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgbGV0IHsgeCwgeSB9ID0gbW92ZVZlbG9jaXR5O1xuXG4gICAgICAgIHRoaXMuX19zZXRNb3ZlbWVudChcbiAgICAgICAgICAgIHggPyB4IC8gTWF0aC5hYnMoeCkgKiBNYXRoLnNxcnQoTWF0aC5hYnMoeCkgKiAxZTMpICogMjAgOiAwLFxuICAgICAgICAgICAgeSA/IHkgLyBNYXRoLmFicyh5KSAqIE1hdGguc3FydChNYXRoLmFicyh5KSAqIDFlMykgKiAyMCA6IDBcbiAgICAgICAgKTtcblxuICAgICAgICBtb3ZlVmVsb2NpdHkueCA9IG1vdmVWZWxvY2l0eS55ID0gMDtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX190b3VjaEhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fdG91Y2hIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvdG91Y2guanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX21vdXNlSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0UG9zaXRpb24sIGdldFRvdWNoSUQsIHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBNb3VzZSBldmVudCBoYW5kbGVycyBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICovXG5sZXQgX19tb3VzZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGxldCBpc01vdXNlRG93biwgaXNNb3VzZU1vdmUsIHN0YXJ0T2Zmc2V0VG9UaHVtYiwgc3RhcnRUcmFja0RpcmVjdGlvbiwgY29udGFpbmVyUmVjdDtcblxuICAgIGxldCBnZXRUcmFja0RpciA9IChjbGFzc05hbWUpID0+IHtcbiAgICAgICAgbGV0IG1hdGNoZXMgPSBjbGFzc05hbWUubWF0Y2goL3Njcm9sbGJhclxcLSg/OnRyYWNrfHRodW1iKVxcLShbeHldKS8pO1xuXG4gICAgICAgIHJldHVybiBtYXRjaGVzICYmIG1hdGNoZXNbMV07XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdjbGljaycsIChldnQpID0+IHtcbiAgICAgICAgaWYgKGlzTW91c2VNb3ZlIHx8ICEvc2Nyb2xsYmFyLXRyYWNrLy50ZXN0KGV2dC50YXJnZXQuY2xhc3NOYW1lKSB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCB0cmFjayA9IGV2dC50YXJnZXQ7XG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBnZXRUcmFja0Rpcih0cmFjay5jbGFzc05hbWUpO1xuICAgICAgICBsZXQgcmVjdCA9IHRyYWNrLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgY2xpY2tQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuICAgICAgICBsZXQgZGVsdGFMaW1pdCA9IHRoaXMuX19nZXREZWx0YUxpbWl0KCk7XG5cbiAgICAgICAgY29uc3QgeyBzaXplLCBvZmZzZXQsIHRodW1iU2l6ZSB9ID0gdGhpcztcblxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAneCcpIHtcbiAgICAgICAgICAgIGxldCBjbGlja09mZnNldCA9IChjbGlja1Bvcy54IC0gcmVjdC5sZWZ0IC0gdGh1bWJTaXplLnggLyAyKSAvIChzaXplLmNvbnRhaW5lci53aWR0aCAtICh0aHVtYlNpemUueCAtIHRodW1iU2l6ZS5yZWFsWCkpO1xuICAgICAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KFxuICAgICAgICAgICAgICAgIGNsaWNrT2Zmc2V0ICogc2l6ZS5jb250ZW50LndpZHRoIC0gb2Zmc2V0LngsXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNsaWNrT2Zmc2V0ID0gKGNsaWNrUG9zLnkgLSByZWN0LnRvcCAtIHRodW1iU2l6ZS55IC8gMikgLyAoc2l6ZS5jb250YWluZXIuaGVpZ2h0IC0gKHRodW1iU2l6ZS55IC0gdGh1bWJTaXplLnJlYWxZKSk7XG4gICAgICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoXG4gICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICBjbGlja09mZnNldCAqIHNpemUuY29udGVudC5oZWlnaHQgLSBvZmZzZXQueSxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAnbW91c2Vkb3duJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIS9zY3JvbGxiYXItdGh1bWIvLnRlc3QoZXZ0LnRhcmdldC5jbGFzc05hbWUpIHx8IHRoaXMuX19pZ25vcmVFdmVudChldnQpKSByZXR1cm47XG4gICAgICAgIGlzTW91c2VEb3duID0gdHJ1ZTtcblxuICAgICAgICBsZXQgY3Vyc29yUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcbiAgICAgICAgbGV0IHRodW1iUmVjdCA9IGV2dC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgc3RhcnRUcmFja0RpcmVjdGlvbiA9IGdldFRyYWNrRGlyKGV2dC50YXJnZXQuY2xhc3NOYW1lKTtcblxuICAgICAgICAvLyBwb2ludGVyIG9mZnNldCB0byB0aHVtYlxuICAgICAgICBzdGFydE9mZnNldFRvVGh1bWIgPSB7XG4gICAgICAgICAgICB4OiBjdXJzb3JQb3MueCAtIHRodW1iUmVjdC5sZWZ0LFxuICAgICAgICAgICAgeTogY3Vyc29yUG9zLnkgLSB0aHVtYlJlY3QudG9wXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gY29udGFpbmVyIGJvdW5kaW5nIHJlY3RhbmdsZVxuICAgICAgICBjb250YWluZXJSZWN0ID0gdGhpcy50YXJnZXRzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNNb3VzZURvd24pIHJldHVybjtcblxuICAgICAgICBpc01vdXNlTW92ZSA9IHRydWU7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCB7IHNpemUsIG9mZnNldCB9ID0gdGhpcztcbiAgICAgICAgbGV0IGN1cnNvclBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0VHJhY2tEaXJlY3Rpb24gPT09ICd4Jykge1xuICAgICAgICAgICAgLy8gZ2V0IHBlcmNlbnRhZ2Ugb2YgcG9pbnRlciBwb3NpdGlvbiBpbiB0cmFja1xuICAgICAgICAgICAgLy8gdGhlbiB0cmFuZm9ybSB0byBweFxuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAoY3Vyc29yUG9zLnggLSBzdGFydE9mZnNldFRvVGh1bWIueCAtIGNvbnRhaW5lclJlY3QubGVmdCkgLyAoY29udGFpbmVyUmVjdC5yaWdodCAtIGNvbnRhaW5lclJlY3QubGVmdCkgKiBzaXplLmNvbnRlbnQud2lkdGgsXG4gICAgICAgICAgICAgICAgb2Zmc2V0LnlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvbid0IG5lZWQgZWFzaW5nXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oXG4gICAgICAgICAgICBvZmZzZXQueCxcbiAgICAgICAgICAgIChjdXJzb3JQb3MueSAtIHN0YXJ0T2Zmc2V0VG9UaHVtYi55IC0gY29udGFpbmVyUmVjdC50b3ApIC8gKGNvbnRhaW5lclJlY3QuYm90dG9tIC0gY29udGFpbmVyUmVjdC50b3ApICogc2l6ZS5jb250ZW50LmhlaWdodFxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gcmVsZWFzZSBtb3VzZW1vdmUgc3B5IG9uIHdpbmRvdyBsb3N0IGZvY3VzXG4gICAgdGhpcy5fX2FkZEV2ZW50KHdpbmRvdywgJ21vdXNldXAgYmx1cicsICgpID0+IHtcbiAgICAgICAgaXNNb3VzZURvd24gPSBpc01vdXNlTW92ZSA9IGZhbHNlO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX21vdXNlSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19tb3VzZUhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9tb3VzZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fd2hlZWxIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXREZWx0YSwgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vLyBpcyBzdGFuZGFyZCBgd2hlZWxgIGV2ZW50IHN1cHBvcnRlZCBjaGVja1xuY29uc3QgV0hFRUxfRVZFTlQgPSAnb253aGVlbCcgaW4gd2luZG93ID8gJ3doZWVsJyA6ICdtb3VzZXdoZWVsJztcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fd2hlZWxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsIFdIRUVMX0VWRU5ULCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0LCB0cnVlKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHsgb2Zmc2V0LCBsaW1pdCwgb3B0aW9ucyB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgZGVsdGEgPSBnZXREZWx0YShldnQpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmNvbnRpbnVvdXNTY3JvbGxpbmcpIHtcbiAgICAgICAgICAgIGxldCBkZXN0WCA9IHBpY2tJblJhbmdlKGRlbHRhLnggKyBvZmZzZXQueCwgMCwgbGltaXQueCk7XG4gICAgICAgICAgICBsZXQgZGVzdFkgPSBwaWNrSW5SYW5nZShkZWx0YS55ICsgb2Zmc2V0LnksIDAsIGxpbWl0LnkpO1xuXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZGVzdFggLSBvZmZzZXQueCkgPCAxICYmIE1hdGguYWJzKGRlc3RZIC0gb2Zmc2V0LnkpIDwgMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgdGhpcy5fX2FkZE1vdmVtZW50KGRlbHRhLngsIGRlbHRhLnkpO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3doZWVsSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX193aGVlbEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy93aGVlbC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fcmVzaXplSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fcmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLl9fdXBkYXRlVGhyb3R0bGUpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3Jlc2l6ZUhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fcmVzaXplSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3Jlc2l6ZS5qc1xuICoqLyIsIi8qKlxyXG4gKiBAbW9kdWxlXHJcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3NlbGVjdEhhbmRsZXJcclxuICovXHJcblxyXG4gaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XHJcbiBpbXBvcnQge1xyXG4gICAgZ2V0T3JpZ2luYWxFdmVudCxcclxuICAgIGdldFBvc2l0aW9uLFxyXG4gICAgZ2V0VG91Y2hJRCxcclxuICAgIHBpY2tJblJhbmdlLFxyXG4gICAgc2V0U3R5bGVcclxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XHJcblxyXG4gZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XHJcblxyXG4vLyB0b2RvOiBzZWxlY3QgaGFuZGxlciBmb3IgdG91Y2ggc2NyZWVuXHJcbiBsZXQgX19zZWxlY3RIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgY29udGVudCB9ID0gdGhpcy50YXJnZXRzO1xyXG5cclxuICAgIGxldCBzY3JvbGwgPSAoeyB4LCB5IH0pID0+IHtcclxuICAgICAgICBpZiAoIXggJiYgIXkpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KHgsIHkpO1xyXG5cclxuICAgICAgICBhbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICAgICAgICBzY3JvbGwoeyB4LCB5IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgc2V0U2VsZWN0ID0gKHZhbHVlID0gJycpID0+IHtcclxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgJy11c2VyLXNlbGVjdCc6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgaWYgKCFpc1NlbGVjdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XHJcblxyXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX19nZXRQb2ludGVyVHJlbmQoZXZ0KTtcclxuXHJcbiAgICAgICAgc2Nyb2xsKGRpcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGVudCwgJ3NlbGVjdHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0U2VsZWN0KCdub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcclxuICAgICAgICBpc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIGJsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcclxuICAgICAgICBzZXRTZWxlY3QoKTtcclxuXHJcbiAgICAgICAgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gdGVtcCBwYXRjaCBmb3IgdG91Y2ggZGV2aWNlc1xyXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3Njcm9sbCcsIChldnQpID0+IHtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xyXG4gICAgfSk7XHJcbiB9O1xyXG5cclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZWxlY3RIYW5kbGVyJywge1xyXG4gICAgIHZhbHVlOiBfX3NlbGVjdEhhbmRsZXIsXHJcbiAgICAgd3JpdGFibGU6IHRydWUsXHJcbiAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiB9KTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3NlbGVjdC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fa2V5Ym9hcmRIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCwgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8vIGtleSBtYXBzIFtkZWx0YVgsIGRlbHRhWV1cbmNvbnN0IEtFWU1BUFMgPSB7XG4gICAgMzI6IFswLCA1XSwgICAvLyBzcGFjZVxuICAgIDM3OiBbLTEsIDBdLCAgLy8gbGVmdFxuICAgIDM4OiBbMCwgLTFdLCAgLy8gdXBcbiAgICAzOTogWzEsIDBdLCAgIC8vIHJpZ2h0XG4gICAgNDA6IFswLCAxXSAgICAvLyBkb3duXG59O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogS2V5cHJlc3MgZXZlbnQgaGFuZGxlciBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICovXG5sZXQgX19rZXlib2FyZEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGxldCBpc0ZvY3VzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdmb2N1cycsICgpID0+IHtcbiAgICAgICAgaXNGb2N1c2VkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdibHVyJywgKCkgPT4ge1xuICAgICAgICBpc0ZvY3VzZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdrZXlkb3duJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRm9jdXNlZCB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgICAgICBjb25zdCBrZXlDb2RlID0gZXZ0LmtleUNvZGUgfHwgZXZ0LndoaWNoO1xuXG4gICAgICAgIGlmICghS0VZTUFQUy5oYXNPd25Qcm9wZXJ0eShrZXlDb2RlKSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHsgc3BlZWQgfSA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgY29uc3QgW3gsIHldID0gS0VZTUFQU1trZXlDb2RlXTtcblxuICAgICAgICB0aGlzLl9fYWRkTW92ZW1lbnQoeCAqIDQwLCB5ICogNDApO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2tleWJvYXJkSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19rZXlib2FyZEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9rZXlib2FyZC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2dldEl0ZXJhdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3JcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX2lzSXRlcmFibGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkge1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2kgPSBfZ2V0SXRlcmF0b3IoYXJyKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZCA9IHRydWU7XG4gICAgICBfZSA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9hcnI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSBlbHNlIGlmIChfaXNJdGVyYWJsZShPYmplY3QoYXJyKSkpIHtcbiAgICAgIHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3NsaWNlZC10by1hcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDEzMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTMxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUnKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTMyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5pc0l0ZXJhYmxlID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTyA9IE9iamVjdChpdCk7XG4gIHJldHVybiBPW0lURVJBVE9SXSAhPT0gdW5kZWZpbmVkXG4gICAgfHwgJ0BAaXRlcmF0b3InIGluIE9cbiAgICB8fCBJdGVyYXRvcnMuaGFzT3duUHJvcGVydHkoY2xhc3NvZihPKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmlzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTMzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlYWRvbmx5JztcbmV4cG9ydCAqIGZyb20gJy4vYWRkX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5pdF9vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vaWdub3JlX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5pdF9zY3JvbGxiYXInO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfZGVsdGFfbGltaXQnO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfY2hpbGRyZW4nO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfYm91bmRpbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9pbnRlcl90cmVuZCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF90aHVtYl9wb3NpdGlvbic7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3JlYWRvbmx5XG4gKiBAZGVwZW5kZW5jaWVzIFsgU21vb3RoU2Nyb2xsYmFyIF1cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIGNyZWF0ZSByZWFkb25seSBwcm9wZXJ0eVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FueX0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gX19yZWFkb25seShwcm9wLCB2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcCwge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3JlYWRvbmx5Jywge1xuICAgIHZhbHVlOiBfX3JlYWRvbmx5LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvcmVhZG9ubHkuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZEV2ZW50XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZEV2ZW50KGVsZW0sIGV2ZW50cywgZm4pIHtcbiAgICBpZiAoIWVsZW0gfHwgdHlwZW9mIGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3QgZWxlbSB0byBiZSBhIERPTSBlbGVtZW50LCBidXQgZ290ICR7ZWxlbX1gKTtcbiAgICB9XG5cbiAgICBldmVudHMuc3BsaXQoL1xccysvZykuZm9yRWFjaCgoZXZ0KSA9PiB7XG4gICAgICAgIHRoaXMuX19oYW5kbGVycy5wdXNoKHsgZXZ0LCBlbGVtLCBmbiB9KTtcblxuICAgICAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmbik7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fYWRkRXZlbnQnLCB7XG4gICAgdmFsdWU6IF9fYWRkRXZlbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvYWRkX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19pbml0T3B0aW9uc1xuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19pbml0T3B0aW9ucyh1c2VyUHJlZmVyZW5jZSkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIHNwZWVkOiAxLCAgICAgICAgICAgICAgICAgIC8vIHNjcm9sbCBzcGVlZCBzY2FsZVxuICAgICAgICBmcmljdGlvbjogMTAsICAgICAgICAgICAgICAvLyBmcmljdGlvbiBmYWN0b3IsIHBlcmNlbnRcbiAgICAgICAgaWdub3JlRXZlbnRzOiBbXSwgICAgICAgICAgLy8gZXZlbnRzIG5hbWVzIHRvIGJlIGlnbm9yZWRcbiAgICAgICAgdGh1bWJNaW5TaXplOiAyMCwgICAgICAgICAgLy8gbWluIHNpemUgZm9yIHNjcm9sbGJhciB0aHVtYlxuICAgICAgICBjb250aW51b3VzU2Nyb2xsaW5nOiBmYWxzZSAvLyBhbGxvdyB1cGVyIHNjcm9sbGFibGUgY29udGVudCB0byBzY3JvbGwgd2hlbiByZWFjaGluZyBlZGdlXG4gICAgfTtcblxuICAgIGNvbnN0IGxpbWl0ID0ge1xuICAgICAgICBmcmljdGlvbjogWzEsIDk5XSxcbiAgICAgICAgc3BlZWQ6IFswLCBJbmZpbml0eV0sXG4gICAgICAgIHRodW1iTWluU2l6ZTogWzAsIEluZmluaXR5XVxuICAgIH07XG5cbiAgICBjb25zdCBvcHRpb25BY2Nlc3NvcnMgPSB7XG4gICAgICAgIGdldCBpZ25vcmVFdmVudHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5pZ25vcmVFdmVudHM7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCBpZ25vcmVFdmVudHModikge1xuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHYpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IFxcYG9wdGlvbnMuaWdub3JlRXZlbnRzXFxgIHRvIGJlIGEgbnVtYmVyLCBidXQgZ290ICR7dHlwZW9mIHZ9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMuaWdub3JlRXZlbnRzID0gdjtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0IGNvbnRpbnVvdXNTY3JvbGxpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5jb250aW51b3VzU2Nyb2xsaW5nO1xuICAgICAgICB9LFxuICAgICAgICBzZXQgY29udGludW91c1Njcm9sbGluZyh2KSB7XG4gICAgICAgICAgICBvcHRpb25zLmNvbnRpbnVvdXNTY3JvbGxpbmcgPSAhIXY7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgT2JqZWN0LmtleXMob3B0aW9ucylcbiAgICAgICAgLmZpbHRlcigocHJvcCkgPT4gIW9wdGlvbkFjY2Vzc29ycy5oYXNPd25Qcm9wZXJ0eShwcm9wKSlcbiAgICAgICAgLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvcHRpb25BY2Nlc3NvcnMsIHByb3AsIHtcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnNbcHJvcF07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzZXQodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdCh2KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdCBcXGBvcHRpb25zLiR7cHJvcH1cXGAgdG8gYmUgYSBudW1iZXIsIGJ1dCBnb3QgJHt0eXBlb2Ygdn1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnNbcHJvcF0gPSBwaWNrSW5SYW5nZSh2LCAuLi5saW1pdFtwcm9wXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgdGhpcy5fX3JlYWRvbmx5KCdvcHRpb25zJywgb3B0aW9uQWNjZXNzb3JzKTtcbiAgICB0aGlzLnNldE9wdGlvbnModXNlclByZWZlcmVuY2UpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2luaXRPcHRpb25zJywge1xuICAgIHZhbHVlOiBfX2luaXRPcHRpb25zLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2luaXRfb3B0aW9ucy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9faWdub3JlRXZlbnRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19pZ25vcmVFdmVudChldnQgPSB7fSwgYWxsb3dDaGlsZCA9IGZhbHNlKSB7XG4gICAgY29uc3QgeyB0YXJnZXQgfSA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIHJldHVybiAoIWV2dC50eXBlLm1hdGNoKC9kcmFnLykgJiYgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHx8XG4gICAgICAgIHRoaXMub3B0aW9ucy5pZ25vcmVFdmVudHMuc29tZShydWxlID0+IGV2dC50eXBlLm1hdGNoKHJ1bGUpKSB8fFxuICAgICAgICAoYWxsb3dDaGlsZCA/IGZhbHNlIDogdGhpcy5jaGlsZHJlbi5zb21lKChzYikgPT4gc2IuY29udGFpbnModGFyZ2V0KSkpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2lnbm9yZUV2ZW50Jywge1xuICAgIHZhbHVlOiBfX2lnbm9yZUV2ZW50LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2lnbm9yZV9ldmVudC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9faW5pdFNjcm9sbGJhclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogaW5pdGlhbGl6ZSBzY3JvbGxiYXJcbiAqXG4gKiBUaGlzIG1ldGhvZCB3aWxsIGF0dGFjaCBzZXZlcmFsIGxpc3RlbmVycyB0byBlbGVtZW50c1xuICogYW5kIGNyZWF0ZSBhIGRlc3Ryb3kgbWV0aG9kIHRvIHJlbW92ZSBsaXN0ZW5lcnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uOiBhcyBpcyBleHBsYWluZWQgaW4gY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gX19pbml0U2Nyb2xsYmFyKCkge1xuICAgIHRoaXMudXBkYXRlKCk7IC8vIGluaXRpYWxpemUgdGh1bWIgcG9zaXRpb25cblxuICAgIHRoaXMuX19rZXlib2FyZEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fcmVzaXplSGFuZGxlcigpO1xuICAgIHRoaXMuX19zZWxlY3RIYW5kbGVyKCk7XG4gICAgdGhpcy5fX21vdXNlSGFuZGxlcigpO1xuICAgIHRoaXMuX190b3VjaEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fd2hlZWxIYW5kbGVyKCk7XG4gICAgdGhpcy5fX2RyYWdIYW5kbGVyKCk7XG5cbiAgICB0aGlzLl9fcmVuZGVyKCk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19faW5pdFNjcm9sbGJhcicsIHtcbiAgICB2YWx1ZTogX19pbml0U2Nyb2xsYmFyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5pdF9zY3JvbGxiYXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2dldERlbHRhTGltaXRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fZ2V0RGVsdGFMaW1pdCgpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgbGltaXRcbiAgICB9ID0gdGhpcztcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IFstb2Zmc2V0LngsIGxpbWl0LnggLSBvZmZzZXQueF0sXG4gICAgICAgIHk6IFstb2Zmc2V0LnksIGxpbWl0LnkgLSBvZmZzZXQueV1cbiAgICB9O1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2dldERlbHRhTGltaXQnLCB7XG4gICAgdmFsdWU6IF9fZ2V0RGVsdGFMaW1pdCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9nZXRfZGVsdGFfbGltaXQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3VwZGF0ZUNoaWxkcmVuXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZWxlY3RvcnMgfSBmcm9tICcuLi9zaGFyZWQvc2VsZWN0b3JzJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fdXBkYXRlQ2hpbGRyZW4oKSB7XG4gICAgdGhpcy5fX3JlYWRvbmx5KCdjaGlsZHJlbicsIFsuLi50aGlzLnRhcmdldHMuY29udGVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyldKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX191cGRhdGVDaGlsZHJlbicsIHtcbiAgICB2YWx1ZTogX191cGRhdGVDaGlsZHJlbixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZV9jaGlsZHJlbi5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fdXBkYXRlQm91bmRpbmdcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IHNlbGVjdG9ycyB9IGZyb20gJy4uL3NoYXJlZC9zZWxlY3RvcnMnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX191cGRhdGVCb3VuZGluZygpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGNvbnN0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IH0gPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgeyBpbm5lckhlaWdodCwgaW5uZXJXaWR0aCB9ID0gd2luZG93O1xuXG4gICAgdGhpcy5fX3JlYWRvbmx5KCdib3VuZGluZycsIHtcbiAgICAgICAgdG9wOiBNYXRoLm1heCh0b3AsIDApLFxuICAgICAgICByaWdodDogTWF0aC5taW4ocmlnaHQsIGlubmVyV2lkdGgpLFxuICAgICAgICBib3R0b206IE1hdGgubWluKGJvdHRvbSwgaW5uZXJIZWlnaHQpLFxuICAgICAgICBsZWZ0Ok1hdGgubWF4KGxlZnQsIDApXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fdXBkYXRlQm91bmRpbmcnLCB7XG4gICAgdmFsdWU6IF9fdXBkYXRlQm91bmRpbmcsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy91cGRhdGVfYm91bmRpbmcuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2dldFBvaW50ZXJUcmVuZFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0UG9zaXRpb24gfSBmcm9tICcuLi91dGlscy8nO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19nZXRQb2ludGVyVHJlbmQoZXZ0LCBlZGdlID0gMCkge1xuICAgIGNvbnN0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0IH0gPSB0aGlzLmJvdW5kaW5nO1xuICAgIGNvbnN0IHsgeCwgeSB9ID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgIGNvbnN0IHJlcyA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBpZiAoeCA9PT0gMCAmJiB5ID09PSAwKSByZXR1cm4gcmVzO1xuXG4gICAgaWYgKHggPiByaWdodCAtIGVkZ2UpIHtcbiAgICAgICAgcmVzLnggPSAoeCAtIHJpZ2h0ICsgZWRnZSk7XG4gICAgfSBlbHNlIGlmICh4IDwgbGVmdCArIGVkZ2UpIHtcbiAgICAgICAgcmVzLnggPSAoeCAtIGxlZnQgLSBlZGdlKTtcbiAgICB9XG5cbiAgICBpZiAoeSA+IGJvdHRvbSAtIGVkZ2UpIHtcbiAgICAgICAgcmVzLnkgPSAoeSAtIGJvdHRvbSArIGVkZ2UpO1xuICAgIH0gZWxzZSBpZiAoeSA8IHRvcCArIGVkZ2UpIHtcbiAgICAgICAgcmVzLnkgPSAoeSAtIHRvcCAtIGVkZ2UpO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fZ2V0UG9pbnRlclRyZW5kJywge1xuICAgIHZhbHVlOiBfX2dldFBvaW50ZXJUcmVuZCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9nZXRfcG9pbnRlcl90cmVuZC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2V0VGh1bWJQb3NpdGlvblxuICovXG5cbmltcG9ydCB7IHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogU2V0IHRodW1iIHBvc2l0aW9uIGluIHRyYWNrXG4gKi9cbmZ1bmN0aW9uIF9fc2V0VGh1bWJQb3NpdGlvbigpIHtcbiAgICBjb25zdCB7IHRhcmdldHMsIHNpemUsIG9mZnNldCwgdGh1bWJTaXplIH0gPSB0aGlzO1xuXG4gICAgbGV0IHRodW1iUG9zaXRpb25YID0gb2Zmc2V0LnggLyBzaXplLmNvbnRlbnQud2lkdGggKiAoc2l6ZS5jb250YWluZXIud2lkdGggLSAodGh1bWJTaXplLnggLSB0aHVtYlNpemUucmVhbFgpKTtcbiAgICBsZXQgdGh1bWJQb3NpdGlvblkgPSBvZmZzZXQueSAvIHNpemUuY29udGVudC5oZWlnaHQgKiAoc2l6ZS5jb250YWluZXIuaGVpZ2h0IC0gKHRodW1iU2l6ZS55IC0gdGh1bWJTaXplLnJlYWxZKSk7XG5cbiAgICBzZXRTdHlsZSh0YXJnZXRzLnhBeGlzLnRodW1iLCB7XG4gICAgICAgICctdHJhbnNmb3JtJzogIGB0cmFuc2xhdGUzZCgke3RodW1iUG9zaXRpb25YfXB4LCAwLCAwKWBcbiAgICB9KTtcblxuICAgIHNldFN0eWxlKHRhcmdldHMueUF4aXMudGh1bWIsIHtcbiAgICAgICAgJy10cmFuc2Zvcm0nOiBgdHJhbnNsYXRlM2QoMCwgJHt0aHVtYlBvc2l0aW9uWX1weCwgMClgXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fc2V0VGh1bWJQb3NpdGlvbicsIHtcbiAgICB2YWx1ZTogX19zZXRUaHVtYlBvc2l0aW9uLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvc2V0X3RodW1iX3Bvc2l0aW9uLmpzXG4gKiovIiwiaW1wb3J0IFNjcm9sbGJhciBmcm9tICcuLi8uLi9zcmMvJztcblxuY29uc3QgRFBSID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5cbmNvbnN0IHNpemUgPSB7XG4gICAgd2lkdGg6IDI1MCxcbiAgICBoZWlnaHQ6IDE1MFxufTtcblxuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByZXZpZXcnKTtcbmNvbnN0IHNjcm9sbGJhciA9IFNjcm9sbGJhci5nZXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKSk7XG5jb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbmNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBzY3JvbGxiYXIub3B0aW9ucyk7XG5cbmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiBEUFI7XG5jYW52YXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKiBEUFI7XG5jdHguc2NhbGUoRFBSLCBEUFIpO1xuXG5jdHguc3Ryb2tlU3R5bGUgPSAnIzk0YTZiNyc7XG5jdHguZmlsbFN0eWxlID0gJyNhYmMnO1xuXG5sZXQgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICB9XG5cbiAgICBsZXQgZG90cyA9IGNhbGNEb3RzKCk7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2Zvcm0oMSwgMCwgMCwgLTEsIDAsIHNpemUuaGVpZ2h0KTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCAwKTtcblxuICAgIGxldCBzY2FsZVggPSAoc2l6ZS53aWR0aCAvIGRvdHMubGVuZ3RoKSAqIChvcHRpb25zLnNwZWVkIC8gMjAgKyAwLjUpO1xuICAgIGRvdHMuZm9yRWFjaCgoW3gsIHldKSA9PiB7XG4gICAgICAgIGN0eC5saW5lVG8oeCAqIHNjYWxlWCwgeSk7XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICBsZXQgW3gsIHldID0gZG90c1tkb3RzLmxlbmd0aCAtIDFdO1xuICAgIGN0eC5saW5lVG8oeCAqIHNjYWxlWCwgeSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59O1xuXG5yZW5kZXIoKTtcblxuZnVuY3Rpb24gY2FsY0RvdHMoKSB7XG4gICAgbGV0IHtcbiAgICAgICAgc3BlZWQsXG4gICAgICAgIGZyaWN0aW9uXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBsZXQgZG90cyA9IFtdO1xuXG4gICAgbGV0IHggPSAwO1xuICAgIGxldCB5ID0gKHNwZWVkIC8gMjAgKyAwLjUpICogc2l6ZS5oZWlnaHQ7XG5cbiAgICB3aGlsZSh5ID4gMC4xKSB7XG4gICAgICAgIGRvdHMucHVzaChbeCwgeV0pO1xuXG4gICAgICAgIHkgKj0gKDEgLSBmcmljdGlvbiAvIDEwMCk7XG4gICAgICAgIHgrKztcbiAgICB9XG5cbiAgICByZXR1cm4gZG90cztcbn07XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN2ZXJzaW9uJykudGV4dENvbnRlbnQgPSBgdiR7U2Nyb2xsYmFyLnZlcnNpb259YDtcblxuWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcHRpb25zJyldLmZvckVhY2goKGVsKSA9PiB7XG4gICAgY29uc3QgcHJvcCA9IGVsLm5hbWU7XG4gICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAub3B0aW9uLSR7cHJvcH1gKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IG9wdGlvbnNbcHJvcF0gPSBwYXJzZUZsb2F0KGVsLnZhbHVlKTtcbiAgICAgICAgc2Nyb2xsYmFyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgfSk7XG59KTtcblxuY29uc3QgaW5uZXJTY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbm5lci1zY3JvbGxiYXInKSk7XG5cbmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjb250aW51b3VzJykuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICBpbm5lclNjcm9sbGJhci5zZXRPcHRpb25zKHtcbiAgICAgICAgY29udGludW91c1Njcm9sbGluZzogdGFyZ2V0LmNoZWNrZWRcbiAgICB9KTtcbn0pO1xuXG5yZW5kZXIoKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vdGVzdC9zY3JpcHRzL3ByZXZpZXcuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBpc1Zpc2libGVcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogQ2hlY2sgaWYgYW4gZWxlbWVudCBpcyB2aXNpYmxlXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gdGFyZ2V0ICAgICAgICAgICAgICAgICAgICAgIHRhcmdldCBlbGVtZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmlzVmlzaWJsZSA9IGZ1bmN0aW9uKGVsZW0pIHtcbiAgICBjb25zdCB7IGJvdW5kaW5nIH0gPSB0aGlzO1xuXG4gICAgbGV0IHRhcmdldEJvdW5kaW5nID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIC8vIGNoZWNrIG92ZXJsYXBwaW5nXG4gICAgbGV0IHRvcCA9IE1hdGgubWF4KGJvdW5kaW5nLnRvcCwgdGFyZ2V0Qm91bmRpbmcudG9wKTtcbiAgICBsZXQgbGVmdCA9IE1hdGgubWF4KGJvdW5kaW5nLmxlZnQsIHRhcmdldEJvdW5kaW5nLmxlZnQpO1xuICAgIGxldCByaWdodCA9IE1hdGgubWluKGJvdW5kaW5nLnJpZ2h0LCB0YXJnZXRCb3VuZGluZy5yaWdodCk7XG4gICAgbGV0IGJvdHRvbSA9IE1hdGgubWluKGJvdW5kaW5nLmJvdHRvbSwgdGFyZ2V0Qm91bmRpbmcuYm90dG9tKTtcblxuICAgIHJldHVybiB0b3AgPD0gYm90dG9tICYmIGxlZnQgPD0gcmlnaHQ7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvaXNfdmlzaWJsZS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=