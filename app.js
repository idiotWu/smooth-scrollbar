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
	
	    fillText('↙' + limit.min.toFixed(2), [0, 0], {
	        props: {
	            fillStyle: '#000',
	            textAlign: 'left',
	            textBaseline: 'bottom',
	            font: '12px sans-serif'
	        }
	    });
	    fillText(end[chartType].toFixed(2), lastPoint, {
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
	
	    fillText('dy/dx: ' + realK.toFixed(2), [size.width / 2, 0], {
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
	
	    var pointInfo = ['(', date.getMinutes(), ':', date.getSeconds(), '.', date.getMilliseconds(), ', ', point[chartType].toFixed(2), ')'].join('');
	
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
	    if (!records.length) return;
	    var start = records[0];
	    var end = records[records.length - 1];
	    var val = parseFloat(e.target.value);
	    label.textContent = val + 's';
	    timeRange = val * 1e3;
	    endOffset = Math.min(endOffset, Math.max(0, 1 - timeRange / (end.time - start.time)));
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
	
	var _shared = __webpack_require__(58);
	
	__webpack_require__(104);
	
	__webpack_require__(116);
	
	__webpack_require__(120);
	
	__webpack_require__(132);
	
	exports['default'] = _smooth_scrollbar.SmoothScrollbar;
	
	_smooth_scrollbar.SmoothScrollbar.version = '4.1.3';
	
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
	
	var _Object$assign = __webpack_require__(51)['default'];
	
	var _Object$defineProperties = __webpack_require__(56)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _shared = __webpack_require__(58);
	
	var _utils = __webpack_require__(90);
	
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
	    }).__readonly('size', this.getSize()).__readonly('options', _Object$assign({}, _shared.DEFAULT_OPTIONS));
	
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
	
	    this.setOptions(options);
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

	__webpack_require__(53);
	module.exports = __webpack_require__(10).Object.assign;

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(8);
	
	$export($export.S + $export.F, 'Object', {assign: __webpack_require__(54)});

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.1 Object.assign(target, source, ...)
	var $        = __webpack_require__(26)
	  , toObject = __webpack_require__(5)
	  , IObject  = __webpack_require__(55);
	
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
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(44);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(57), __esModule: true };

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	module.exports = function defineProperties(T, D){
	  return $.setDescs(T, D);
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(59)['default'];
	
	var _interopExportWildcard = __webpack_require__(70)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _sb_list = __webpack_require__(71);
	
	_defaults(exports, _interopExportWildcard(_sb_list, _defaults));
	
	var _options = __webpack_require__(88);
	
	_defaults(exports, _interopExportWildcard(_options, _defaults));
	
	var _selectors = __webpack_require__(89);
	
	_defaults(exports, _interopExportWildcard(_selectors, _defaults));

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$getOwnPropertyNames = __webpack_require__(60)["default"];
	
	var _Object$getOwnPropertyDescriptor = __webpack_require__(65)["default"];
	
	var _Object$defineProperty = __webpack_require__(68)["default"];
	
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
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(61), __esModule: true };

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	__webpack_require__(62);
	module.exports = function getOwnPropertyNames(it){
	  return $.getNames(it);
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 Object.getOwnPropertyNames(O)
	__webpack_require__(7)('getOwnPropertyNames', function(){
	  return __webpack_require__(63).get;
	});

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(64)
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
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(55)
	  , defined = __webpack_require__(6);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(66), __esModule: true };

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	__webpack_require__(67);
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $.getDesc(it, key);
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject = __webpack_require__(64);
	
	__webpack_require__(7)('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(69), __esModule: true };

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 70 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj, defaults) {
	  var newObj = defaults({}, obj);
	  delete newObj["default"];
	  return newObj;
	};
	
	exports.__esModule = true;

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Map} sbList
	 */
	
	"use strict";
	
	var _Map = __webpack_require__(72)["default"];
	
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
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(73), __esModule: true };

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(74);
	__webpack_require__(19);
	__webpack_require__(75);
	__webpack_require__(79);
	__webpack_require__(86);
	module.exports = __webpack_require__(10).Map;

/***/ },
/* 74 */
/***/ function(module, exports) {



/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(76);
	var Iterators = __webpack_require__(30);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(77)
	  , step             = __webpack_require__(78)
	  , Iterators        = __webpack_require__(30)
	  , toIObject        = __webpack_require__(64);
	
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
/* 77 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 78 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(80);
	
	// 23.1 Map Objects
	__webpack_require__(85)('Map', function(get){
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
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $            = __webpack_require__(26)
	  , hide         = __webpack_require__(25)
	  , redefineAll  = __webpack_require__(81)
	  , ctx          = __webpack_require__(11)
	  , strictNew    = __webpack_require__(82)
	  , defined      = __webpack_require__(6)
	  , forOf        = __webpack_require__(83)
	  , $iterDefine  = __webpack_require__(22)
	  , step         = __webpack_require__(78)
	  , ID           = __webpack_require__(35)('id')
	  , $has         = __webpack_require__(29)
	  , isObject     = __webpack_require__(39)
	  , setSpecies   = __webpack_require__(84)
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
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var redefine = __webpack_require__(24);
	module.exports = function(target, src){
	  for(var key in src)redefine(target, key, src[key]);
	  return target;
	};

/***/ },
/* 82 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};

/***/ },
/* 83 */
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
/* 84 */
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
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(26)
	  , global         = __webpack_require__(9)
	  , $export        = __webpack_require__(8)
	  , fails          = __webpack_require__(13)
	  , hide           = __webpack_require__(25)
	  , redefineAll    = __webpack_require__(81)
	  , forOf          = __webpack_require__(83)
	  , strictNew      = __webpack_require__(82)
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
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(8);
	
	$export($export.P, 'Map', {toJSON: __webpack_require__(87)('Map')});

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var forOf   = __webpack_require__(83)
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
/* 88 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var DEFAULT_OPTIONS = {
	    speed: 1, // scroll speed scale
	    fricton: 10 // fricton factor, percent
	};
	
	exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
	var OPTION_LIMIT = {
	    fricton: [1, 99],
	    speed: [0, Infinity]
	};
	exports.OPTION_LIMIT = OPTION_LIMIT;

/***/ },
/* 89 */
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
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(59)['default'];
	
	var _interopExportWildcard = __webpack_require__(70)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _debounce = __webpack_require__(91);
	
	_defaults(exports, _interopExportWildcard(_debounce, _defaults));
	
	var _set_style = __webpack_require__(92);
	
	_defaults(exports, _interopExportWildcard(_set_style, _defaults));
	
	var _get_delta = __webpack_require__(93);
	
	_defaults(exports, _interopExportWildcard(_get_delta, _defaults));
	
	var _find_child = __webpack_require__(95);
	
	_defaults(exports, _interopExportWildcard(_find_child, _defaults));
	
	var _build_curve = __webpack_require__(99);
	
	_defaults(exports, _interopExportWildcard(_build_curve, _defaults));
	
	var _get_touch_id = __webpack_require__(100);
	
	_defaults(exports, _interopExportWildcard(_get_touch_id, _defaults));
	
	var _get_position = __webpack_require__(102);
	
	_defaults(exports, _interopExportWildcard(_get_position, _defaults));
	
	var _pick_in_range = __webpack_require__(103);
	
	_defaults(exports, _interopExportWildcard(_pick_in_range, _defaults));
	
	var _get_pointer_data = __webpack_require__(101);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_data, _defaults));
	
	var _get_original_event = __webpack_require__(94);
	
	_defaults(exports, _interopExportWildcard(_get_original_event, _defaults));

/***/ },
/* 91 */
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
/* 92 */
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
/* 93 */
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
	
	var _get_original_event = __webpack_require__(94);
	
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
/* 94 */
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
/* 95 */
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
	
	var _getIterator = __webpack_require__(96)["default"];
	
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
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(97), __esModule: true };

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(75);
	__webpack_require__(19);
	module.exports = __webpack_require__(98);

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(38)
	  , get      = __webpack_require__(42);
	module.exports = __webpack_require__(10).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ },
/* 99 */
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
	
	  var t = Math.floor(duration / 1000 * 60);
	  var a = -distance / Math.pow(t, 2);
	  var b = -2 * a * t;
	
	  for (var i = 0; i <= t; i++) {
	    res.push(distance ? a * Math.pow(i, 2) + b * i : 0);
	  }
	
	  return res;
	};
	exports.buildCurve = buildCurve;

/***/ },
/* 100 */
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
	
	var _get_original_event = __webpack_require__(94);
	
	var _get_pointer_data = __webpack_require__(101);
	
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
/* 101 */
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
	
	var _get_original_event = __webpack_require__(94);
	
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
/* 102 */
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
	
	var _get_original_event = __webpack_require__(94);
	
	var _get_pointer_data = __webpack_require__(101);
	
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
/* 103 */
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
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(59)['default'];
	
	var _interopExportWildcard = __webpack_require__(70)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _update = __webpack_require__(105);
	
	_defaults(exports, _interopExportWildcard(_update, _defaults));
	
	var _destroy = __webpack_require__(106);
	
	_defaults(exports, _interopExportWildcard(_destroy, _defaults));
	
	var _get_size = __webpack_require__(107);
	
	_defaults(exports, _interopExportWildcard(_get_size, _defaults));
	
	var _listener = __webpack_require__(108);
	
	_defaults(exports, _interopExportWildcard(_listener, _defaults));
	
	var _scroll_to = __webpack_require__(109);
	
	_defaults(exports, _interopExportWildcard(_scroll_to, _defaults));
	
	var _set_options = __webpack_require__(110);
	
	_defaults(exports, _interopExportWildcard(_set_options, _defaults));
	
	var _set_position = __webpack_require__(111);
	
	_defaults(exports, _interopExportWildcard(_set_position, _defaults));
	
	var _toggle_track = __webpack_require__(113);
	
	_defaults(exports, _interopExportWildcard(_toggle_track, _defaults));
	
	var _infinite_scroll = __webpack_require__(114);
	
	_defaults(exports, _interopExportWildcard(_infinite_scroll, _defaults));
	
	var _get_content_elem = __webpack_require__(115);
	
	_defaults(exports, _interopExportWildcard(_get_content_elem, _defaults));

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} update
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(90);
	
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
	
	        _this.__setThumbPosition();
	    };
	
	    if (async) {
	        requestAnimationFrame(update);
	    } else {
	        update();
	    }
	};

/***/ },
/* 106 */
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
	
	var _utils = __webpack_require__(90);
	
	var _shared = __webpack_require__(58);
	
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
/* 107 */
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
/* 108 */
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
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} scrollTo
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(90);
	
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
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} setOptions
	 */
	
	'use strict';
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$keys = __webpack_require__(2)['default'];
	
	var _Object$assign = __webpack_require__(51)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utils = __webpack_require__(90);
	
	var _shared = __webpack_require__(58);
	
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
	
	    _Object$keys(options).forEach(function (prop) {
	        if (isNaN(parseFloat(options[prop]))) {
	            delete options[prop];
	            return;
	        }
	
	        if (!_shared.OPTION_LIMIT.hasOwnProperty(prop)) return;
	
	        options[prop] = _utils.pickInRange.apply(undefined, [options[prop]].concat(_toConsumableArray(_shared.OPTION_LIMIT[prop])));
	    });
	
	    _Object$assign(this.options, options);
	};

/***/ },
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
	
	var _utilsIndex = __webpack_require__(90);
	
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
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$assign = __webpack_require__(51)["default"];
	
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
	
	var _defaults = __webpack_require__(59)['default'];
	
	var _interopExportWildcard = __webpack_require__(70)['default'];
	
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
	
	var _utils = __webpack_require__(90);
	
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
	
	var _utils = __webpack_require__(90);
	
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
	
	var _defaults = __webpack_require__(59)['default'];
	
	var _interopExportWildcard = __webpack_require__(70)['default'];
	
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
	
	var _utilsIndex = __webpack_require__(90);
	
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
	
	var _Object$keys = __webpack_require__(2)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(90);
	
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
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(90);
	
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
	            // use percentage value
	            var _thumbSize = (0, _utilsIndex.pickInRange)(size.container.width / size.content.width, 0, 1);
	            var _clickOffset = (clickPos.x - rect.left) / size.container.width;
	
	            return _this.__setMovement((_clickOffset - _thumbSize / 2) * size.content.width - offset.x, 0);
	        }
	
	        var thumbSize = (0, _utilsIndex.pickInRange)(size.container.height / size.content.height, 0, 1);
	        var clickOffset = (clickPos.y - rect.top) / size.container.height;
	
	        _this.__setMovement(0, (clickOffset - thumbSize / 2) * size.content.height - offset.y);
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
	
	var _utilsIndex = __webpack_require__(90);
	
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
	        if (evt.defaultPrevented) return;
	
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
	
	var _utilsIndex = __webpack_require__(90);
	
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
	
	var _utilsIndex = __webpack_require__(90);
	
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
	        if (!isFocused) return;
	
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
	
	var _getIterator = __webpack_require__(96)["default"];
	
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

	__webpack_require__(75);
	__webpack_require__(19);
	module.exports = __webpack_require__(131);

/***/ },
/* 131 */
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
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(59)['default'];
	
	var _interopExportWildcard = __webpack_require__(70)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _readonly = __webpack_require__(133);
	
	_defaults(exports, _interopExportWildcard(_readonly, _defaults));
	
	var _add_event = __webpack_require__(134);
	
	_defaults(exports, _interopExportWildcard(_add_event, _defaults));
	
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
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __readonly
	 * @dependencies [ SmoothScrollbar ]
	 */
	
	'use strict';
	
	var _Object$defineProperty = __webpack_require__(68)['default'];
	
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
	 * @prototype {Function} __ignoreEvent
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	var _utilsIndex = __webpack_require__(90);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __ignoreEvent() {
	    var evt = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    var _getOriginalEvent = (0, _utilsIndex.getOriginalEvent)(evt);
	
	    var target = _getOriginalEvent.target;
	
	    if (!target || target === window || !this.children) return false;
	
	    return !evt.type.match(/drag/) && evt.defaultPrevented || this.children.some(function (sb) {
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
	
	var _sharedSelectors = __webpack_require__(89);
	
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
	
	var _sharedSelectors = __webpack_require__(89);
	
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
	
	var _utils = __webpack_require__(90);
	
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
	
	var _utilsIndex = __webpack_require__(90);
	
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
	
	var _slicedToArray = __webpack_require__(128)['default'];
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$assign = __webpack_require__(51)['default'];
	
	var _interopRequireDefault = __webpack_require__(14)['default'];
	
	var _src = __webpack_require__(15);
	
	var _src2 = _interopRequireDefault(_src);
	
	var _srcShared = __webpack_require__(58);
	
	var DPR = window.devicePixelRatio;
	var options = _Object$assign({}, _srcShared.DEFAULT_OPTIONS);
	
	var size = {
	    width: 250,
	    height: 150
	};
	
	var canvas = document.getElementById('preview');
	var scrollbar = _src2['default'].get(document.getElementById('content'));
	var ctx = canvas.getContext('2d');
	
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDdmYjgwZTBhZGRjMjJlNTdlYjUiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9zY3JpcHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LXNhcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jdHguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZmFpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1yZXF1aXJlLWRlZmF1bHQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGlkZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlc2NyaXB0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGFzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVpZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LWFzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlvYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2V0LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1leHBvcnQtd2lsZGNhcmQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9zYl9saXN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1zdGVwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLWFsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mb3Itb2YuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtc3BlY2llcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm1hcC50by1qc29uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzIiwid2VicGFjazovLy8uL3NyYy9zaGFyZWQvb3B0aW9ucy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2hhcmVkL3NlbGVjdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2RlYm91bmNlLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9zZXRfc3R5bGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9kZWx0YS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X29yaWdpbmFsX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9maW5kX2NoaWxkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9idWlsZF9jdXJ2ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X3RvdWNoX2lkLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfcG9pbnRlcl9kYXRhLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfcG9zaXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL3BpY2tfaW5fcmFuZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvdXBkYXRlLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2Rlc3Ryb3kuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvZ2V0X3NpemUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvbGlzdGVuZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2Nyb2xsX3RvLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3NldF9vcHRpb25zLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3NldF9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9leHRlbmRzLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL3RvZ2dsZV90cmFjay5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9pbmZpbml0ZV9zY3JvbGwuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvZ2V0X2NvbnRlbnRfZWxlbS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcmVuZGVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9yZW5kZXIvcmVuZGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9yZW5kZXIvYWRkX21vdmVtZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9yZW5kZXIvc2V0X21vdmVtZW50LmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9kcmFnLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvdG91Y2guanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9tb3VzZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3doZWVsLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvcmVzaXplLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvc2VsZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMva2V5Ym9hcmQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvc2xpY2VkLXRvLWFycmF5LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9pcy1pdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmlzLWl0ZXJhYmxlLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9yZWFkb25seS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2FkZF9ldmVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2lnbm9yZV9ldmVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2luaXRfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvZ2V0X2RlbHRhX2xpbWl0LmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2NoaWxkcmVuLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2JvdW5kaW5nLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvZ2V0X3BvaW50ZXJfdHJlbmQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9zZXRfdGh1bWJfcG9zaXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9zY3JpcHRzL3ByZXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztxQkN0Q08sQ0FBVzs7cUJBQ1gsR0FBVyxFOzs7Ozs7Ozs7Ozs7Z0NDREksRUFBWTs7OztBQUVsQyxLQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7QUFDcEMsS0FBTSxjQUFjLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQzs7QUFFaEMsS0FBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuRCxLQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9DLEtBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0MsS0FBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztB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QUNQLE9BQU8sQ0FEUCxPQUFPOztBQUdYLFNBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFZCxTQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDVixTQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpDLFlBQU0sQ0FBQyxHQUFHLEdBQUcsRUFBRTtBQUNYLGFBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFbEIsVUFBQyxJQUFLLENBQUMsR0FBRyxPQUFPLEdBQUcsR0FBSSxDQUFDO0FBQ3pCLFVBQUMsRUFBRSxDQUFDO01BQ1A7O0FBRUQsWUFBTyxJQUFJLENBQUM7RUFDZixDQUFDOztBQUVGLDhCQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsR0FBRSxPQUFPLENBQUMsVUFBQyxFQUFFLEVBQUs7QUFDdkQsU0FBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztBQUNyQixTQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxjQUFZLElBQUksQ0FBRyxDQUFDOztBQUV4RCxPQUFFLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDL0IsY0FBSyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6RCxrQkFBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5QixxQkFBWSxHQUFHLElBQUksQ0FBQztNQUN2QixDQUFDLENBQUM7RUFDTixDQUFDLENBQUM7O0FBRUgsT0FBTSxFQUFFLEMiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA0N2ZiODBlMGFkZGMyMmU1N2ViNVxuICoqLyIsImltcG9ydCAnLi9tb25pdG9yJztcbmltcG9ydCAnLi9wcmV2aWV3JztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9pbmRleC5qc1xuICoqLyIsImltcG9ydCBTY3JvbGxiYXIgZnJvbSAnLi4vLi4vc3JjLyc7XG5cbmNvbnN0IERQUiA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuY29uc3QgVElNRV9SQU5HRV9NQVggPSAyMCAqIDFlMztcblxuY29uc3QgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50Jyk7XG5jb25zdCB0aHVtYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aHVtYicpO1xuY29uc3QgdHJhY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndHJhY2snKTtcbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydCcpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbmRpdi5pbm5lckhUTUwgPSBBcnJheSgxMDEpLmpvaW4oJzxwPkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBFeHBlZGl0YSBlYXF1ZSBkZWJpdGlzLCBkb2xvcmVtIGRvbG9yaWJ1cywgdm9sdXB0YXRpYnVzIG1pbmltYSBpbGxvIGVzdCwgYXRxdWUgYWxpcXVpZCBpcHN1bSBuZWNlc3NpdGF0aWJ1cyBjdW1xdWUgdmVyaXRhdGlzIGJlYXRhZSwgcmF0aW9uZSByZXB1ZGlhbmRhZSBxdW9zISBPbW5pcyBoaWMsIGFuaW1pLjwvcD4nKTtcblxuY29udGVudC5hcHBlbmRDaGlsZChkaXYpO1xuXG5TY3JvbGxiYXIuaW5pdEFsbCgpO1xuXG5jb25zdCBzY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGNvbnRlbnQpO1xuXG5sZXQgY2hhcnRUeXBlID0gJ29mZnNldCc7XG5cbmxldCB0aHVtYldpZHRoID0gMDtcbmxldCBlbmRPZmZzZXQgPSAwO1xuXG5sZXQgdGltZVJhbmdlID0gNSAqIDFlMztcblxubGV0IHJlY29yZHMgPSBbXTtcbmxldCBzaXplID0ge1xuICAgIHdpZHRoOiAzMDAsXG4gICAgaGVpZ2h0OiAyMDBcbn07XG5cbmxldCBzaG91bGRVcGRhdGUgPSB0cnVlO1xuXG5sZXQgdGFuZ2VudFBvaW50ID0gbnVsbDtcbmxldCB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xuXG5sZXQgaG92ZXJMb2NrZWQgPSBmYWxzZTtcbmxldCBob3ZlclBvaW50ZXJYID0gdW5kZWZpbmVkO1xubGV0IHBvaW50ZXJEb3duT25UcmFjayA9IHVuZGVmaW5lZDtcbmxldCBob3ZlclByZWNpc2lvbiA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50ID8gNSA6IDE7XG5cbmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiBEUFI7XG5jYW52YXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKiBEUFI7XG5jdHguc2NhbGUoRFBSLCBEUFIpO1xuXG5mdW5jdGlvbiBhZGRFdmVudChlbGVtcywgZXZ0cywgaGFuZGxlcikge1xuICAgIGV2dHMuc3BsaXQoL1xccysvKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIFtdLmNvbmNhdChlbGVtcykuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBzbGljZVJlY29yZCgpIHtcbiAgICBsZXQgZW5kSWR4ID0gTWF0aC5mbG9vcihyZWNvcmRzLmxlbmd0aCAqICgxIC0gZW5kT2Zmc2V0KSk7XG4gICAgbGV0IGxhc3QgPSByZWNvcmRzW3JlY29yZHMubGVuZ3RoIC0gMV07XG4gICAgbGV0IGRyb3BJZHggPSAwO1xuXG4gICAgbGV0IHJlc3VsdCA9IHJlY29yZHMuZmlsdGVyKChwdCwgaWR4KSA9PiB7XG4gICAgICAgIGlmIChsYXN0LnRpbWUgLSBwdC50aW1lID4gVElNRV9SQU5HRV9NQVgpIHtcbiAgICAgICAgICAgIGRyb3BJZHgrKztcbiAgICAgICAgICAgIGVuZElkeC0tO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVuZCA9IHJlY29yZHNbZW5kSWR4IC0gMV07XG5cbiAgICAgICAgcmV0dXJuIGVuZC50aW1lIC0gcHQudGltZSA8PSB0aW1lUmFuZ2UgJiYgaWR4IDw9IGVuZElkeDtcbiAgICB9KTtcblxuICAgIHJlY29yZHMuc3BsaWNlKDAsIGRyb3BJZHgpO1xuICAgIHRodW1iV2lkdGggPSByZXN1bHQubGVuZ3RoID8gcmVzdWx0Lmxlbmd0aCAvIHJlY29yZHMubGVuZ3RoIDogMTtcblxuICAgIHRodW1iLnN0eWxlLndpZHRoID0gdGh1bWJXaWR0aCAqIDEwMCArICclJztcbiAgICB0aHVtYi5zdHlsZS5yaWdodCA9IGVuZE9mZnNldCAqIDEwMCArICclJztcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5mdW5jdGlvbiBnZXRMaW1pdChwb2ludHMpIHtcbiAgICByZXR1cm4gcG9pbnRzLnJlZHVjZSgocHJlLCBjdXIpID0+IHtcbiAgICAgICAgbGV0IHZhbCA9IGN1cltjaGFydFR5cGVdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbWF4OiBNYXRoLm1heChwcmUubWF4LCB2YWwpLFxuICAgICAgICAgICAgbWluOiBNYXRoLm1pbihwcmUubWluLCB2YWwpXG4gICAgICAgIH07XG4gICAgfSwgeyBtYXg6IC1JbmZpbml0eSwgbWluOiBJbmZpbml0eSB9KTtcbn07XG5cbmZ1bmN0aW9uIGFzc2lnblByb3BzKHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcykgcmV0dXJuO1xuXG4gICAgT2JqZWN0LmtleXMocHJvcHMpLmZvckVhY2goKG5hbWUpID0+IHtcbiAgICAgICAgY3R4W25hbWVdID0gcHJvcHNbbmFtZV07XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBkcmF3TGluZShwMCwgcDEsIG9wdGlvbnMpIHtcbiAgICBsZXQgeDAgPSBwMFswXSxcbiAgICAgICAgeTAgPSBwMFsxXSxcbiAgICAgICAgeDEgPSBwMVswXSxcbiAgICAgICAgeTEgPSBwMVsxXTtcblxuICAgIGFzc2lnblByb3BzKG9wdGlvbnMucHJvcHMpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zZXRMaW5lRGFzaChvcHRpb25zLmRhc2hlZCA/IG9wdGlvbnMuZGFzaGVkIDogW10pO1xuICAgIGN0eC5tb3ZlVG8oeDAsIHkwKTtcbiAgICBjdHgubGluZVRvKHgxLCB5MSk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xufTtcblxuZnVuY3Rpb24gYWRqdXN0VGV4dChjb250ZW50LCBwLCBvcHRpb25zKSB7XG4gICAgbGV0IHggPSBwWzBdLFxuICAgICAgICB5ID0gcFsxXTtcblxuICAgIGxldCB3aWR0aCA9IGN0eC5tZWFzdXJlVGV4dChjb250ZW50KS53aWR0aDtcblxuICAgIGlmICh4ICsgd2lkdGggPiBzaXplLndpZHRoKSB7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICAgIH0gZWxzZSBpZiAoeCAtIHdpZHRoIDwgMCkge1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBvcHRpb25zLnRleHRBbGlnbjtcbiAgICB9XG5cbiAgICBjdHguZmlsbFRleHQoY29udGVudCwgeCwgLXkpO1xufTtcblxuZnVuY3Rpb24gZmlsbFRleHQoY29udGVudCwgcCwgb3B0aW9ucykge1xuICAgIGFzc2lnblByb3BzKG9wdGlvbnMucHJvcHMpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIHNpemUuaGVpZ2h0KTtcbiAgICBhZGp1c3RUZXh0KGNvbnRlbnQsIHAsIG9wdGlvbnMpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG59O1xuXG5mdW5jdGlvbiBkcmF3TWFpbigpIHtcbiAgICBsZXQgcG9pbnRzID0gc2xpY2VSZWNvcmQoKTtcbiAgICBpZiAoIXBvaW50cy5sZW5ndGgpIHJldHVybjtcblxuICAgIGxldCBsaW1pdCA9IGdldExpbWl0KHBvaW50cyk7XG5cbiAgICBsZXQgc3RhcnQgPSBwb2ludHNbMF07XG4gICAgbGV0IGVuZCA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV07XG5cbiAgICBsZXQgdG90YWxYID0gdGh1bWJXaWR0aCA9PT0gMSA/IHRpbWVSYW5nZSA6IGVuZC50aW1lIC0gc3RhcnQudGltZTtcbiAgICBsZXQgdG90YWxZID0gKGxpbWl0Lm1heCAtIGxpbWl0Lm1pbikgfHwgMTtcblxuICAgIGxldCBncmQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgc2l6ZS5oZWlnaHQsIDAsIDApO1xuICAgIGdyZC5hZGRDb2xvclN0b3AoMCwgJ3JnYigxNzAsIDIxNSwgMjU1KScpO1xuICAgIGdyZC5hZGRDb2xvclN0b3AoMSwgJ3JnYmEoMTcwLCAyMTUsIDI1NSwgMC4yKScpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG5cbiAgICBjdHgubGluZVdpZHRoID0gMTtcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZ2IoNjQsIDE2NSwgMjU1KSc7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG5cbiAgICBsZXQgbGFzdFBvaW50ID0gcG9pbnRzLnJlZHVjZSgocHJlLCBjdXIsIGlkeCkgPT4ge1xuICAgICAgICBsZXQgdGltZSA9IGN1ci50aW1lLFxuICAgICAgICAgICAgdmFsdWUgPSBjdXJbY2hhcnRUeXBlXTtcbiAgICAgICAgbGV0IHggPSAodGltZSAtIHN0YXJ0LnRpbWUpIC8gdG90YWxYICogc2l6ZS53aWR0aCxcbiAgICAgICAgICAgIHkgPSAodmFsdWUgLSBsaW1pdC5taW4pIC8gdG90YWxZICogKHNpemUuaGVpZ2h0IC0gMjApO1xuXG4gICAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG5cbiAgICAgICAgaWYgKGhvdmVyUG9pbnRlclggJiYgTWF0aC5hYnMoaG92ZXJQb2ludGVyWCAtIHgpIDwgaG92ZXJQcmVjaXNpb24pIHtcbiAgICAgICAgICAgIHRhbmdlbnRQb2ludCA9IHtcbiAgICAgICAgICAgICAgICBjb29yZDogW3gsIHldLFxuICAgICAgICAgICAgICAgIHBvaW50OiBjdXJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRhbmdlbnRQb2ludFByZSA9IHtcbiAgICAgICAgICAgICAgICBjb29yZDogcHJlLFxuICAgICAgICAgICAgICAgIHBvaW50OiBwb2ludHNbaWR4IC0gMV1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3gsIHldO1xuICAgIH0sIFtdKTtcblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHgubGluZVRvKGxhc3RQb2ludFswXSwgMCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIGRyYXdMaW5lKFswLCBsYXN0UG9pbnRbMV1dLCBsYXN0UG9pbnQsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAnI2Y2MCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZmlsbFRleHQoJ+KGmScgKyBsaW1pdC5taW4udG9GaXhlZCgyKSwgWzAsIDBdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjMDAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICcxMnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmaWxsVGV4dChlbmRbY2hhcnRUeXBlXS50b0ZpeGVkKDIpLCBsYXN0UG9pbnQsIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmNjAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAncmlnaHQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICcxNnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdUYW5nZW50TGluZSgpIHtcbiAgICBsZXQgY29vcmQgPSB0YW5nZW50UG9pbnQuY29vcmQsXG4gICAgICAgIGNvb3JkUHJlID0gdGFuZ2VudFBvaW50UHJlLmNvb3JkO1xuXG4gICAgbGV0IGsgPSAoY29vcmRbMV0gLSBjb29yZFByZVsxXSkgLyAoY29vcmRbMF0gLSBjb29yZFByZVswXSkgfHwgMDtcbiAgICBsZXQgYiA9IGNvb3JkWzFdIC0gayAqIGNvb3JkWzBdO1xuXG4gICAgZHJhd0xpbmUoWzAsIGJdLCBbc2l6ZS53aWR0aCwgayAqIHNpemUud2lkdGggKyBiXSwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGU6ICcjZjAwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgcmVhbEsgPSAodGFuZ2VudFBvaW50LnBvaW50W2NoYXJ0VHlwZV0gLSB0YW5nZW50UG9pbnRQcmUucG9pbnRbY2hhcnRUeXBlXSkgL1xuICAgICAgICAgICAgICAgICh0YW5nZW50UG9pbnQucG9pbnQudGltZSAtIHRhbmdlbnRQb2ludFByZS5wb2ludC50aW1lKTtcblxuICAgIGZpbGxUZXh0KCdkeS9keDogJyArIHJlYWxLLnRvRml4ZWQoMiksIFtzaXplLndpZHRoIC8gMiwgMF0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBmb250OiAnYm9sZCAxMnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIGRyYXdIb3ZlcigpIHtcbiAgICBpZiAoIXRhbmdlbnRQb2ludCkgcmV0dXJuO1xuXG4gICAgZHJhd1RhbmdlbnRMaW5lKCk7XG5cbiAgICBsZXQgY29vcmQgPSB0YW5nZW50UG9pbnQuY29vcmQsXG4gICAgICAgIHBvaW50ID0gdGFuZ2VudFBvaW50LnBvaW50O1xuXG4gICAgbGV0IGNvb3JkU3R5bGUgPSB7XG4gICAgICAgIGRhc2hlZDogWzgsIDRdLFxuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgICAgICAgc3Ryb2tlU3R5bGU6ICdyZ2IoNjQsIDE2NSwgMjU1KSdcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkcmF3TGluZShbMCwgY29vcmRbMV1dLCBbc2l6ZS53aWR0aCwgY29vcmRbMV1dLCBjb29yZFN0eWxlKTtcbiAgICBkcmF3TGluZShbY29vcmRbMF0sIDBdLCBbY29vcmRbMF0sIHNpemUuaGVpZ2h0XSwgY29vcmRTdHlsZSk7XG5cbiAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHBvaW50LnRpbWUgKyBwb2ludC5yZWR1Y2UpO1xuXG4gICAgbGV0IHBvaW50SW5mbyA9IFtcbiAgICAgICAgJygnLFxuICAgICAgICBkYXRlLmdldE1pbnV0ZXMoKSxcbiAgICAgICAgJzonLFxuICAgICAgICBkYXRlLmdldFNlY29uZHMoKSxcbiAgICAgICAgJy4nLFxuICAgICAgICBkYXRlLmdldE1pbGxpc2Vjb25kcygpLFxuICAgICAgICAnLCAnLFxuICAgICAgICBwb2ludFtjaGFydFR5cGVdLnRvRml4ZWQoMiksXG4gICAgICAgICcpJ1xuICAgIF0uam9pbignJyk7XG5cbiAgICBmaWxsVGV4dChwb2ludEluZm8sIGNvb3JkLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjMDAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAnYm90dG9tJyxcbiAgICAgICAgICAgIGZvbnQ6ICdib2xkIDEycHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghc2hvdWxkVXBkYXRlKSByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQpO1xuXG4gICAgZmlsbFRleHQoY2hhcnRUeXBlLnRvVXBwZXJDYXNlKCksIFswLCBzaXplLmhlaWdodF0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnLFxuICAgICAgICAgICAgZm9udDogJ2JvbGQgMTRweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkcmF3TWFpbigpO1xuICAgIGRyYXdIb3ZlcigpO1xuXG4gICAgaWYgKGhvdmVyTG9ja2VkKSB7XG4gICAgICAgIGZpbGxUZXh0KCdMT0NLRUQnLCBbc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHRdLCB7XG4gICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgIGZpbGxTdHlsZTogJyNmMDAnLFxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICd0b3AnLFxuICAgICAgICAgICAgICAgIGZvbnQ6ICdib2xkIDE0cHggc2Fucy1zZXJpZidcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59O1xuXG5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxubGV0IGxhc3RUaW1lID0gRGF0ZS5ub3coKSxcbiAgICBsYXN0T2Zmc2V0ID0gMCxcbiAgICByZWR1Y2VBbW91bnQgPSAwO1xuXG5zY3JvbGxiYXIuYWRkTGlzdGVuZXIoKCkgPT4ge1xuICAgIGxldCBjdXJyZW50ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgb2Zmc2V0ID0gc2Nyb2xsYmFyLm9mZnNldC55LFxuICAgICAgICBkdXJhdGlvbiA9IGN1cnJlbnQgLSBsYXN0VGltZTtcblxuICAgIGlmICghZHVyYXRpb24gfHwgb2Zmc2V0ID09PSBsYXN0T2Zmc2V0KSByZXR1cm47XG5cbiAgICBpZiAoZHVyYXRpb24gPiA1MCkge1xuICAgICAgICByZWR1Y2VBbW91bnQgKz0gKGR1cmF0aW9uIC0gMSk7XG4gICAgICAgIGR1cmF0aW9uIC09IChkdXJhdGlvbiAtIDEpO1xuICAgIH1cblxuICAgIGxldCB2ZWxvY2l0eSA9IChvZmZzZXQgLSBsYXN0T2Zmc2V0KSAvIGR1cmF0aW9uO1xuICAgIGxhc3RUaW1lID0gY3VycmVudDtcbiAgICBsYXN0T2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgcmVjb3Jkcy5wdXNoKHtcbiAgICAgICAgdGltZTogY3VycmVudCAtIHJlZHVjZUFtb3VudCxcbiAgICAgICAgcmVkdWNlOiByZWR1Y2VBbW91bnQsXG4gICAgICAgIG9mZnNldDogb2Zmc2V0LFxuICAgICAgICBzcGVlZDogTWF0aC5hYnModmVsb2NpdHkpXG4gICAgfSk7XG5cbiAgICBzaG91bGRVcGRhdGUgPSB0cnVlO1xufSk7XG5cbmZ1bmN0aW9uIGdldFBvaW50ZXIoZSkge1xuICAgIHJldHVybiBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbZS50b3VjaGVzLmxlbmd0aCAtIDFdIDogZTtcbn07XG5cbi8vIHJhbmdlXG5sZXQgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZHVyYXRpb24nKTtcbmxldCBsYWJlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkdXJhdGlvbi12YWx1ZScpO1xuaW5wdXQubWF4ID0gVElNRV9SQU5HRV9NQVggLyAxZTM7XG5pbnB1dC5taW4gPSAxO1xuaW5wdXQudmFsdWUgPSB0aW1lUmFuZ2UgLyAxZTM7XG5sYWJlbC50ZXh0Q29udGVudCA9IGlucHV0LnZhbHVlICsgJ3MnO1xuXG5hZGRFdmVudChpbnB1dCwgJ2lucHV0JywgKGUpID0+IHtcbiAgICBpZiAoIXJlY29yZHMubGVuZ3RoKSByZXR1cm47XG4gICAgbGV0IHN0YXJ0ID0gcmVjb3Jkc1swXTtcbiAgICBsZXQgZW5kID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCB2YWwgPSBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKTtcbiAgICBsYWJlbC50ZXh0Q29udGVudCA9IHZhbCArICdzJztcbiAgICB0aW1lUmFuZ2UgPSB2YWwgKiAxZTM7XG4gICAgZW5kT2Zmc2V0ID0gTWF0aC5taW4oZW5kT2Zmc2V0LCBNYXRoLm1heCgwLCAxIC0gdGltZVJhbmdlIC8gKGVuZC50aW1lIC0gc3RhcnQudGltZSkpKTtcbn0pO1xuXG5hZGRFdmVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQnKSwgJ2NsaWNrJywgKCkgPT4ge1xuICAgIHJlY29yZHMubGVuZ3RoID0gZW5kT2Zmc2V0ID0gcmVkdWNlQW1vdW50ID0gMDtcbiAgICBob3ZlckxvY2tlZCA9IGZhbHNlO1xuICAgIGhvdmVyUG9pbnRlclggPSB1bmRlZmluZWQ7XG4gICAgdGFuZ2VudFBvaW50ID0gbnVsbDtcbiAgICB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xuICAgIHNsaWNlUmVjb3JkKCk7XG59KTtcblxuLy8gaG92ZXJcbmFkZEV2ZW50KGNhbnZhcywgJ21vdXNlbW92ZSB0b3VjaG1vdmUnLCAoZSkgPT4ge1xuICAgIGlmIChob3ZlckxvY2tlZCB8fCBwb2ludGVyRG93bk9uVHJhY2spIHJldHVybjtcblxuICAgIGxldCBwb2ludGVyID0gZ2V0UG9pbnRlcihlKTtcblxuICAgIGhvdmVyUG9pbnRlclggPSBwb2ludGVyLmNsaWVudFggLSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcbn0pO1xuXG5mdW5jdGlvbiByZXNldEhvdmVyKCkge1xuICAgIGhvdmVyUG9pbnRlclggPSAwO1xuICAgIHRhbmdlbnRQb2ludCA9IG51bGw7XG4gICAgdGFuZ2VudFBvaW50UHJlID0gbnVsbDtcbn07XG5cbmFkZEV2ZW50KFtjYW52YXMsIHdpbmRvd10sICdtb3VzZWxlYXZlIHRvdWNoZW5kJywgKCkgPT4ge1xuICAgIGlmIChob3ZlckxvY2tlZCkgcmV0dXJuO1xuICAgIHJlc2V0SG92ZXIoKTtcbn0pO1xuXG5hZGRFdmVudChjYW52YXMsICdjbGljaycsICgpID0+IHtcbiAgICBob3ZlckxvY2tlZCA9ICFob3ZlckxvY2tlZDtcblxuICAgIGlmICghaG92ZXJMb2NrZWQpIHJlc2V0SG92ZXIoKTtcbn0pO1xuXG4vLyB0cmFja1xuYWRkRXZlbnQodGh1bWIsICdtb3VzZWRvd24gdG91Y2hzdGFydCcsIChlKSA9PiB7XG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuICAgIHBvaW50ZXJEb3duT25UcmFjayA9IHBvaW50ZXIuY2xpZW50WDtcbn0pO1xuXG5hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGUpID0+IHtcbiAgICBpZiAoIXBvaW50ZXJEb3duT25UcmFjaykgcmV0dXJuO1xuXG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuICAgIGxldCBtb3ZlZCA9IChwb2ludGVyLmNsaWVudFggLSBwb2ludGVyRG93bk9uVHJhY2spIC8gc2l6ZS53aWR0aDtcblxuICAgIHBvaW50ZXJEb3duT25UcmFjayA9IHBvaW50ZXIuY2xpZW50WDtcbiAgICBlbmRPZmZzZXQgPSBNYXRoLm1pbigxIC0gdGh1bWJXaWR0aCwgTWF0aC5tYXgoMCwgZW5kT2Zmc2V0IC0gbW92ZWQpKTtcbn0pO1xuXG5hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIHRvdWNoZW5kIGJsdXInLCAoZSkgPT4ge1xuICAgIHBvaW50ZXJEb3duT25UcmFjayA9IHVuZGVmaW5lZDtcbn0pO1xuXG5hZGRFdmVudCh0aHVtYiwgJ2NsaWNrIHRvdWNoc3RhcnQnLCAoZSkgPT4ge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG59KTtcblxuYWRkRXZlbnQodHJhY2ssICdjbGljayB0b3VjaHN0YXJ0JywgKGUpID0+IHtcbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG4gICAgbGV0IHJlY3QgPSB0cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBsZXQgb2Zmc2V0ID0gKHBvaW50ZXIuY2xpZW50WCAtIHJlY3QubGVmdCkgLyByZWN0LndpZHRoO1xuICAgIGVuZE9mZnNldCA9IE1hdGgubWluKDEgLSB0aHVtYldpZHRoLCBNYXRoLm1heCgwLCAxIC0gKG9mZnNldCArIHRodW1iV2lkdGggLyAyKSkpO1xufSk7XG5cbi8vIHN3aXRjaCBjaGFydFxuYWRkRXZlbnQoXG4gICAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hhcnQtdHlwZScpKSxcbiAgICAnY2hhbmdlJyxcbiAgICAoeyB0YXJnZXQgfSkgPT4ge1xuICAgICAgICBpZiAodGFyZ2V0LmNoZWNrZWQpIHtcbiAgICAgICAgICAgIGNoYXJ0VHlwZSA9IHRhcmdldC52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbik7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmtleXMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5PYmplY3Qua2V5cztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2tleXMnLCBmdW5jdGlvbigka2V5cyl7XG4gIHJldHVybiBmdW5jdGlvbiBrZXlzKGl0KXtcbiAgICByZXR1cm4gJGtleXModG9PYmplY3QoaXQpKTtcbiAgfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanNcbiAqKiBtb2R1bGUgaWQgPSA0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgZmFpbHMgICA9IHJlcXVpcmUoJy4vJC5mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVksIGV4ZWMpe1xuICB2YXIgZm4gID0gKGNvcmUuT2JqZWN0IHx8IHt9KVtLRVldIHx8IE9iamVjdFtLRVldXG4gICAgLCBleHAgPSB7fTtcbiAgZXhwW0tFWV0gPSBleGVjKGZuKTtcbiAgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiBmYWlscyhmdW5jdGlvbigpeyBmbigxKTsgfSksICdPYmplY3QnLCBleHApO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3Qtc2FwLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgSVNfV1JBUCAgID0gdHlwZSAmICRleHBvcnQuV1xuICAgICwgZXhwb3J0cyAgID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSlcbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGtleSwgb3duLCBvdXQ7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbihDKXtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24ocGFyYW0pe1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEMgPyBuZXcgQyhwYXJhbSkgOiBDKHBhcmFtKTtcbiAgICAgIH07XG4gICAgICBGW1BST1RPVFlQRV0gPSBDW1BST1RPVFlQRV07XG4gICAgICByZXR1cm4gRjtcbiAgICAvLyBtYWtlIHN0YXRpYyB2ZXJzaW9ucyBmb3IgcHJvdG90eXBlIG1ldGhvZHNcbiAgICB9KShvdXQpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgaWYoSVNfUFJPVE8pKGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pKVtrZXldID0gb3V0O1xuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7IC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAvLyB3cmFwXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZXhwb3J0LmpzXG4gKiogbW9kdWxlIGlkID0gOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qc1xuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzEuMi42J307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzXG4gKiogbW9kdWxlIGlkID0gMTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qc1xuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZhaWxzLmpzXG4gKiogbW9kdWxlIGlkID0gMTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtZGVmYXVsdC5qc1xuICoqIG1vZHVsZSBpZCA9IDE0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2VsZWN0b3JzLCBzYkxpc3QgfSBmcm9tICcuL3NoYXJlZCc7XG5cbmltcG9ydCAnLi9hcGlzLyc7XG5pbXBvcnQgJy4vcmVuZGVyLyc7XG5pbXBvcnQgJy4vZXZlbnRzLyc7XG5pbXBvcnQgJy4vaW50ZXJuYWxzLyc7XG5cbmV4cG9ydCBkZWZhdWx0IFNtb290aFNjcm9sbGJhcjtcblxuU21vb3RoU2Nyb2xsYmFyLnZlcnNpb24gPSAnPCU9IHZlcnNpb24gJT4nO1xuXG4vKipcbiAqIGluaXQgc2Nyb2xsYmFyIG9uIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uczogc2Nyb2xsYmFyIG9wdGlvbnNcbiAqXG4gKiBAcmV0dXJuIHtTY3JvbGxiYXJ9IHNjcm9sbGJhciBpbnN0YW5jZVxuICovXG5TbW9vdGhTY3JvbGxiYXIuaW5pdCA9IChlbGVtLCBvcHRpb25zKSA9PiB7XG4gICAgaWYgKCFlbGVtIHx8IGVsZW0ubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IGVsZW1lbnQgdG8gYmUgRE9NIEVsZW1lbnQsIGJ1dCBnb3QgJHt0eXBlb2YgZWxlbX1gKTtcbiAgICB9XG5cbiAgICBpZiAoc2JMaXN0LmhhcyhlbGVtKSkgcmV0dXJuIHNiTGlzdC5nZXQoZWxlbSk7XG5cbiAgICBlbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxiYXInLCAnJyk7XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi5lbGVtLmNoaWxkcmVuXTtcblxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgZGl2LmlubmVySFRNTCA9IGBcbiAgICAgICAgPGFydGljbGUgY2xhc3M9XCJzY3JvbGwtY29udGVudFwiPjwvYXJ0aWNsZT5cbiAgICAgICAgPGFzaWRlIGNsYXNzPVwic2Nyb2xsYmFyLXRyYWNrIHNjcm9sbGJhci10cmFjay14XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsYmFyLXRodW1iIHNjcm9sbGJhci10aHVtYi14XCI+PC9kaXY+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICAgIDxhc2lkZSBjbGFzcz1cInNjcm9sbGJhci10cmFjayBzY3JvbGxiYXItdHJhY2steVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbGJhci10aHVtYiBzY3JvbGxiYXItdGh1bWIteVwiPjwvZGl2PlxuICAgICAgICA8L2FzaWRlPlxuICAgIGA7XG5cbiAgICBjb25zdCBzY3JvbGxDb250ZW50ID0gZGl2LnF1ZXJ5U2VsZWN0b3IoJy5zY3JvbGwtY29udGVudCcpO1xuXG4gICAgWy4uLmRpdi5jaGlsZHJlbl0uZm9yRWFjaCgoZWwpID0+IGVsZW0uYXBwZW5kQ2hpbGQoZWwpKTtcblxuICAgIGNoaWxkcmVuLmZvckVhY2goKGVsKSA9PiBzY3JvbGxDb250ZW50LmFwcGVuZENoaWxkKGVsKSk7XG5cbiAgICByZXR1cm4gbmV3IFNtb290aFNjcm9sbGJhcihlbGVtLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogaW5pdCBzY3JvbGxiYXJzIG9uIHByZS1kZWZpbmVkIHNlbGVjdG9yc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zOiBzY3JvbGxiYXIgb3B0aW9uc1xuICpcbiAqIEByZXR1cm4ge0FycmF5fSBhIGNvbGxlY3Rpb24gb2Ygc2Nyb2xsYmFyIGluc3RhbmNlc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuaW5pdEFsbCA9IChvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyldLm1hcCgoZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIFNtb290aFNjcm9sbGJhci5pbml0KGVsLCBvcHRpb25zKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogY2hlY2sgaWYgc2Nyb2xsYmFyIGV4aXN0cyBvbiBnaXZlbiBlbGVtZW50XG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmhhcyA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIHNiTGlzdC5oYXMoZWxlbSk7XG59O1xuXG4vKipcbiAqIGdldCBzY3JvbGxiYXIgaW5zdGFuY2UgdGhyb3VnaCBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtOiB0YXJnZXQgc2Nyb2xsYmFyIGNvbnRhaW5lclxuICpcbiAqIEByZXR1cm4ge1Njcm9sbGJhcn1cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmdldCA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIHNiTGlzdC5nZXQoZWxlbSk7XG59O1xuXG4vKipcbiAqIGdldCBhbGwgc2Nyb2xsYmFyIGluc3RhbmNlc1xuICpcbiAqIEByZXR1cm4ge0FycmF5fSBhIGNvbGxlY3Rpb24gb2Ygc2Nyb2xsYmFyc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuZ2V0QWxsID0gKCkgPT4ge1xuICAgIHJldHVybiBbLi4uc2JMaXN0LnZhbHVlcygpXTtcbn07XG5cbi8qKlxuICogZGVzdHJveSBzY3JvbGxiYXIgb24gZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbTogdGFyZ2V0IHNjcm9sbGJhciBjb250YWluZXJcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmRlc3Ryb3kgPSAoZWxlbSkgPT4ge1xuICAgIHJldHVybiBTbW9vdGhTY3JvbGxiYXIuaGFzKGVsZW0pICYmIFNtb290aFNjcm9sbGJhci5nZXQoZWxlbSkuZGVzdHJveSgpO1xufTtcblxuLyoqXG4gKiBkZXN0cm95IGFsbCBzY3JvbGxiYXJzIGluIHNjcm9sbGJhciBpbnN0YW5jZXNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmRlc3Ryb3lBbGwgPSAoKSA9PiB7XG4gICAgc2JMaXN0LmZvckVhY2goKHNiKSA9PiB7XG4gICAgICAgIHNiLmRlc3Ryb3koKTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9BcnJheSRmcm9tID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIF9BcnJheSRmcm9tKGFycik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanNcbiAqKiBtb2R1bGUgaWQgPSAxNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb21cIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LmFycmF5LmZyb20nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5BcnJheS5mcm9tO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgJGF0ICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBpbmRleCA9IHRoaXMuX2lcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4ge3ZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWV9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4ge3ZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2V9O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSAxOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zdHJpbmctYXQuanNcbiAqKiBtb2R1bGUgaWQgPSAyMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWludGVnZXIuanNcbiAqKiBtb2R1bGUgaWQgPSAyMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi8kLmxpYnJhcnknKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgcmVkZWZpbmUgICAgICAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgSXRlcmF0b3JzICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNyZWF0ZScpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIGdldFByb3RvICAgICAgID0gcmVxdWlyZSgnLi8kJykuZ2V0UHJvdG9cbiAgLCBJVEVSQVRPUiAgICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEJVR0dZICAgICAgICAgID0gIShbXS5rZXlzICYmICduZXh0JyBpbiBbXS5rZXlzKCkpIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgLCBGRl9JVEVSQVRPUiAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEtFWVMgICAgICAgICAgID0gJ2tleXMnXG4gICwgVkFMVUVTICAgICAgICAgPSAndmFsdWVzJztcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRUQpe1xuICAkaXRlckNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihraW5kKXtcbiAgICBpZighQlVHR1kgJiYga2luZCBpbiBwcm90bylyZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoKGtpbmQpe1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgICAgICAgID0gTkFNRSArICcgSXRlcmF0b3InXG4gICAgLCBERUZfVkFMVUVTID0gREVGQVVMVCA9PSBWQUxVRVNcbiAgICAsIFZBTFVFU19CVUcgPSBmYWxzZVxuICAgICwgcHJvdG8gICAgICA9IEJhc2UucHJvdG90eXBlXG4gICAgLCAkbmF0aXZlICAgID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCAkZGVmYXVsdCAgID0gJG5hdGl2ZSB8fCBnZXRNZXRob2QoREVGQVVMVClcbiAgICAsIG1ldGhvZHMsIGtleTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZigkbmF0aXZlKXtcbiAgICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90bygkZGVmYXVsdC5jYWxsKG5ldyBCYXNlKSk7XG4gICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgIC8vIEZGIGZpeFxuICAgIGlmKCFMSUJSQVJZICYmIGhhcyhwcm90bywgRkZfSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gICAgaWYoREVGX1ZBTFVFUyAmJiAkbmF0aXZlLm5hbWUgIT09IFZBTFVFUyl7XG4gICAgICBWQUxVRVNfQlVHID0gdHJ1ZTtcbiAgICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gICAgfVxuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZigoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSl7XG4gICAgaGlkZShwcm90bywgSVRFUkFUT1IsICRkZWZhdWx0KTtcbiAgfVxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9ICRkZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSByZXR1cm5UaGlzO1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiAgREVGX1ZBTFVFUyAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogICAgSVNfU0VUICAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKVxuICAgIH07XG4gICAgaWYoRk9SQ0VEKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWRlZmluZS5qc1xuICoqIG1vZHVsZSBpZCA9IDIyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qc1xuICoqIG1vZHVsZSBpZCA9IDIzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5oaWRlJyk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucmVkZWZpbmUuanNcbiAqKiBtb2R1bGUgaWQgPSAyNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuLyQucHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oaWRlLmpzXG4gKiogbW9kdWxlIGlkID0gMjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkT2JqZWN0ID0gT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogICAgICRPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICAkT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBpc0VudW06ICAgICB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxcbiAgZ2V0RGVzYzogICAgJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgICRPYmplY3QuZGVmaW5lUHJvcGVydHksXG4gIHNldERlc2NzOiAgICRPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgJE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXG4gIGdldFN5bWJvbHM6ICRPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBlYWNoOiAgICAgICBbXS5mb3JFYWNoXG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzXG4gKiogbW9kdWxlIGlkID0gMjZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5wcm9wZXJ0eS1kZXNjLmpzXG4gKiogbW9kdWxlIGlkID0gMjdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vJC5mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZXNjcmlwdG9ycy5qc1xuICoqIG1vZHVsZSBpZCA9IDI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oYXMuanNcbiAqKiBtb2R1bGUgaWQgPSAyOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyYXRvcnMuanNcbiAqKiBtb2R1bGUgaWQgPSAzMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBkZXNjcmlwdG9yICAgICA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vJC5zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5oaWRlJykoSXRlcmF0b3JQcm90b3R5cGUsIHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gJC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHtuZXh0OiBkZXNjcmlwdG9yKDEsIG5leHQpfSk7XG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNyZWF0ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDMxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi8kJykuc2V0RGVzY1xuICAsIGhhcyA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qc1xuICoqIG1vZHVsZSBpZCA9IDMyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgc3RvcmUgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICA9IHJlcXVpcmUoJy4vJC51aWQnKVxuICAsIFN5bWJvbCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKS5TeW1ib2w7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBTeW1ib2wgJiYgU3ltYm9sW25hbWVdIHx8IChTeW1ib2wgfHwgdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qc1xuICoqIG1vZHVsZSBpZCA9IDMzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zaGFyZWQuanNcbiAqKiBtb2R1bGUgaWQgPSAzNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudWlkLmpzXG4gKiogbW9kdWxlIGlkID0gMzVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsICRleHBvcnQgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi8kLmlzLWFycmF5LWl0ZXInKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XG4gICAgdmFyIE8gICAgICAgPSB0b09iamVjdChhcnJheUxpa2UpXG4gICAgICAsIEMgICAgICAgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5XG4gICAgICAsICQkICAgICAgPSBhcmd1bWVudHNcbiAgICAgICwgJCRsZW4gICA9ICQkLmxlbmd0aFxuICAgICAgLCBtYXBmbiAgID0gJCRsZW4gPiAxID8gJCRbMV0gOiB1bmRlZmluZWRcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgaXRlckZuICA9IGdldEl0ZXJGbihPKVxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYobWFwcGluZyltYXBmbiA9IGN0eChtYXBmbiwgJCRsZW4gPiAyID8gJCRbMl0gOiB1bmRlZmluZWQsIDIpO1xuICAgIC8vIGlmIG9iamVjdCBpc24ndCBpdGVyYWJsZSBvciBpdCdzIGFycmF5IHdpdGggZGVmYXVsdCBpdGVyYXRvciAtIHVzZSBzaW1wbGUgY2FzZVxuICAgIGlmKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKXtcbiAgICAgIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKE8pLCByZXN1bHQgPSBuZXcgQzsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgICBmb3IocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5mcm9tLmpzXG4gKiogbW9kdWxlIGlkID0gMzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhbk9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgfSBjYXRjaChlKXtcbiAgICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNhbGwuanNcbiAqKiBtb2R1bGUgaWQgPSAzN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDM4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXMtb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gMzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3JcbnZhciBJdGVyYXRvcnMgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1hcnJheS1pdGVyLmpzXG4gKiogbW9kdWxlIGlkID0gNDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanNcbiAqKiBtb2R1bGUgaWQgPSA0MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZClyZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanNcbiAqKiBtb2R1bGUgaWQgPSA0MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLy8gRVMzIHdyb25nIGhlcmVcbiAgLCBBUkcgPSBjb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbVEFHXSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNsYXNzb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIElURVJBVE9SICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMsIHNraXBDbG9zaW5nKXtcbiAgaWYoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgc2FmZSA9IHRydWU7IH07XG4gICAgYXJyW0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1kZXRlY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA0NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtDbGFzc30gU21vb3RoU2Nyb2xsYmFyXG4gKi9cblxuaW1wb3J0IHsgREVGQVVMVF9PUFRJT05TLCBzYkxpc3QgfSBmcm9tICcuL3NoYXJlZC8nO1xuaW1wb3J0IHtcbiAgICBkZWJvdW5jZSxcbiAgICBmaW5kQ2hpbGQsXG4gICAgc2V0U3R5bGVcbn0gZnJvbSAnLi91dGlscy8nO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQ3JlYXRlIHNjcm9sbGJhciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyOiB0YXJnZXQgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXTogb3B0aW9uc1xuICovXG5leHBvcnQgY2xhc3MgU21vb3RoU2Nyb2xsYmFyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXIsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzYkxpc3Quc2V0KGNvbnRhaW5lciwgdGhpcyk7XG5cbiAgICAgICAgLy8gbWFrZSBjb250YWluZXIgZm9jdXNhYmxlXG4gICAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzEnKTtcblxuICAgICAgICAvLyByZXNldCBzY3JvbGwgcG9zaXRpb25cbiAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxMZWZ0ID0gMDtcblxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgIG91dGxpbmU6ICdub25lJ1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0cmFja1ggPSBmaW5kQ2hpbGQoY29udGFpbmVyLCAnc2Nyb2xsYmFyLXRyYWNrLXgnKTtcbiAgICAgICAgY29uc3QgdHJhY2tZID0gZmluZENoaWxkKGNvbnRhaW5lciwgJ3Njcm9sbGJhci10cmFjay15Jyk7XG5cbiAgICAgICAgLy8gcmVhZG9ubHkgcHJvcGVydGllc1xuICAgICAgICB0aGlzLl9fcmVhZG9ubHkoJ3RhcmdldHMnLCBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgICAgIGNvbnRlbnQ6IGZpbmRDaGlsZChjb250YWluZXIsICdzY3JvbGwtY29udGVudCcpLFxuICAgICAgICAgICAgeEF4aXM6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgICAgICAgIHRyYWNrOiB0cmFja1gsXG4gICAgICAgICAgICAgICAgdGh1bWI6IGZpbmRDaGlsZCh0cmFja1gsICdzY3JvbGxiYXItdGh1bWIteCcpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHlBeGlzOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgICAgICB0cmFjazogdHJhY2tZLFxuICAgICAgICAgICAgICAgIHRodW1iOiBmaW5kQ2hpbGQodHJhY2tZLCAnc2Nyb2xsYmFyLXRodW1iLXknKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSkpXG4gICAgICAgIC5fX3JlYWRvbmx5KCdvZmZzZXQnLCB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnbGltaXQnLCB7XG4gICAgICAgICAgICB4OiBJbmZpbml0eSxcbiAgICAgICAgICAgIHk6IEluZmluaXR5XG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdtb3ZlbWVudCcsIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdzaXplJywgdGhpcy5nZXRTaXplKCkpXG4gICAgICAgIC5fX3JlYWRvbmx5KCdvcHRpb25zJywgT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TKSk7XG5cbiAgICAgICAgLy8gbm9uLWVubXVyYWJsZSBwcm9wZXJ0aWVzXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIF9fdXBkYXRlVGhyb3R0bGU6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogZGVib3VuY2UoOjp0aGlzLnVwZGF0ZSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX2xpc3RlbmVyczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBbXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9faGFuZGxlcnM6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogW11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX2NoaWxkcmVuOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX190aW1lcklEOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fX2luaXRTY3JvbGxiYXIoKTtcbiAgICB9XG59XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc21vb3RoX3Njcm9sbGJhci5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzXG4gKiogbW9kdWxlIGlkID0gNDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9mcmVlemUuanNcbiAqKiBtb2R1bGUgaWQgPSA0OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLk9iamVjdC5mcmVlemU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplLmpzXG4gKiogbW9kdWxlIGlkID0gNDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDE5LjEuMi41IE9iamVjdC5mcmVlemUoTylcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKTtcblxucmVxdWlyZSgnLi8kLm9iamVjdC1zYXAnKSgnZnJlZXplJywgZnVuY3Rpb24oJGZyZWV6ZSl7XG4gIHJldHVybiBmdW5jdGlvbiBmcmVlemUoaXQpe1xuICAgIHJldHVybiAkZnJlZXplICYmIGlzT2JqZWN0KGl0KSA/ICRmcmVlemUoaXQpIDogaXQ7XG4gIH07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5mcmVlemUuanNcbiAqKiBtb2R1bGUgaWQgPSA1MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9hc3NpZ25cIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDUxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmFzc2lnbjtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSA1MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiwgJ09iamVjdCcsIHthc3NpZ246IHJlcXVpcmUoJy4vJC5vYmplY3QtYXNzaWduJyl9KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSA1M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIElPYmplY3QgID0gcmVxdWlyZSgnLi8kLmlvYmplY3QnKTtcblxuLy8gc2hvdWxkIHdvcmsgd2l0aCBzeW1ib2xzIGFuZCBzaG91bGQgaGF2ZSBkZXRlcm1pbmlzdGljIHByb3BlcnR5IG9yZGVyIChWOCBidWcpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHZhciBhID0gT2JqZWN0LmFzc2lnblxuICAgICwgQSA9IHt9XG4gICAgLCBCID0ge31cbiAgICAsIFMgPSBTeW1ib2woKVxuICAgICwgSyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG4gIEFbU10gPSA3O1xuICBLLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyBCW2tdID0gazsgfSk7XG4gIHJldHVybiBhKHt9LCBBKVtTXSAhPSA3IHx8IE9iamVjdC5rZXlzKGEoe30sIEIpKS5qb2luKCcnKSAhPSBLO1xufSkgPyBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2UpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHZhciBUICAgICA9IHRvT2JqZWN0KHRhcmdldClcbiAgICAsICQkICAgID0gYXJndW1lbnRzXG4gICAgLCAkJGxlbiA9ICQkLmxlbmd0aFxuICAgICwgaW5kZXggPSAxXG4gICAgLCBnZXRLZXlzICAgID0gJC5nZXRLZXlzXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzXG4gICAgLCBpc0VudW0gICAgID0gJC5pc0VudW07XG4gIHdoaWxlKCQkbGVuID4gaW5kZXgpe1xuICAgIHZhciBTICAgICAgPSBJT2JqZWN0KCQkW2luZGV4KytdKVxuICAgICAgLCBrZXlzICAgPSBnZXRTeW1ib2xzID8gZ2V0S2V5cyhTKS5jb25jYXQoZ2V0U3ltYm9scyhTKSkgOiBnZXRLZXlzKFMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGogICAgICA9IDBcbiAgICAgICwga2V5O1xuICAgIHdoaWxlKGxlbmd0aCA+IGopaWYoaXNFbnVtLmNhbGwoUywga2V5ID0ga2V5c1tqKytdKSlUW2tleV0gPSBTW2tleV07XG4gIH1cbiAgcmV0dXJuIFQ7XG59IDogT2JqZWN0LmFzc2lnbjtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3QtYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gNTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoVCwgRCl7XG4gIHJldHVybiAkLnNldERlc2NzKFQsIEQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qc1xuICoqIG1vZHVsZSBpZCA9IDU3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3NiX2xpc3QnO1xuZXhwb3J0ICogZnJvbSAnLi9vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vc2VsZWN0b3JzJztcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9pbmRleC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1uYW1lc1wiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqLCBkZWZhdWx0cykge1xuICB2YXIga2V5cyA9IF9PYmplY3QkZ2V0T3duUHJvcGVydHlOYW1lcyhkZWZhdWx0cyk7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG5cbiAgICB2YXIgdmFsdWUgPSBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvcihkZWZhdWx0cywga2V5KTtcblxuICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb25maWd1cmFibGUgJiYgb2JqW2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgX09iamVjdCRkZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9kZWZhdWx0cy5qc1xuICoqIG1vZHVsZSBpZCA9IDU5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA2MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICByZXR1cm4gJC5nZXROYW1lcyhpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA2MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5TmFtZXMnLCBmdW5jdGlvbigpe1xuICByZXR1cm4gcmVxdWlyZSgnLi8kLmdldC1uYW1lcycpLmdldDtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktbmFtZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA2MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZmFsbGJhY2sgZm9yIElFMTEgYnVnZ3kgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgd2l0aCBpZnJhbWUgYW5kIHdpbmRvd1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0JylcbiAgLCBnZXROYW1lcyAgPSByZXF1aXJlKCcuLyQnKS5nZXROYW1lc1xuICAsIHRvU3RyaW5nICA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG52YXIgZ2V0V2luZG93TmFtZXMgPSBmdW5jdGlvbihpdCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdldE5hbWVzKGl0KTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIGlmKHdpbmRvd05hbWVzICYmIHRvU3RyaW5nLmNhbGwoaXQpID09ICdbb2JqZWN0IFdpbmRvd10nKXJldHVybiBnZXRXaW5kb3dOYW1lcyhpdCk7XG4gIHJldHVybiBnZXROYW1lcyh0b0lPYmplY3QoaXQpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZ2V0LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNjNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNjRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICByZXR1cm4gJC5nZXREZXNjKGl0LCBrZXkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ipe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2N1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDY4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhpdCwga2V5LCBkZXNjKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzXG4gKiogbW9kdWxlIGlkID0gNjlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gIHZhciBuZXdPYmogPSBkZWZhdWx0cyh7fSwgb2JqKTtcbiAgZGVsZXRlIG5ld09ialtcImRlZmF1bHRcIl07XG4gIHJldHVybiBuZXdPYmo7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLWV4cG9ydC13aWxkY2FyZC5qc1xuICoqIG1vZHVsZSBpZCA9IDcwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge01hcH0gc2JMaXN0XG4gKi9cblxuY29uc3Qgc2JMaXN0ID0gbmV3IE1hcCgpO1xuXG5jb25zdCBvcmlnaW5TZXQgPSA6OnNiTGlzdC5zZXQ7XG5cbnNiTGlzdC51cGRhdGUgPSAoKSA9PiB7XG4gICAgc2JMaXN0LmZvckVhY2goKHNiKSA9PiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBzYi5fX3VwZGF0ZUNoaWxkcmVuKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLy8gcGF0Y2ggI3NldCB3aXRoICN1cGRhdGUgbWV0aG9kXG5zYkxpc3Quc2V0ID0gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCByZXMgPSBvcmlnaW5TZXQoLi4uYXJncyk7XG4gICAgc2JMaXN0LnVwZGF0ZSgpO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbmV4cG9ydCB7IHNiTGlzdCB9O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9zYl9saXN0LmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL21hcFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA3MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy8kLmNvcmUnKS5NYXA7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA3M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBJdGVyYXRvcnMuQXJyYXk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSA3NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLyQuYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSXRlcmF0b3JzICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwga2luZCAgPSB0aGlzLl9rXG4gICAgLCBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA3NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFkZC10by11bnNjb3BhYmxlcy5qc1xuICoqIG1vZHVsZSBpZCA9IDc3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItc3RlcC5qc1xuICoqIG1vZHVsZSBpZCA9IDc4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XG5cbi8vIDIzLjEgTWFwIE9iamVjdHNcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ01hcCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBNYXAoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcbiAgfSxcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzXG4gKiogbW9kdWxlIGlkID0gNzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGhpZGUgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCByZWRlZmluZUFsbCAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUtYWxsJylcbiAgLCBjdHggICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBzdHJpY3ROZXcgICAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpXG4gICwgZGVmaW5lZCAgICAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKVxuICAsIGZvck9mICAgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsICRpdGVyRGVmaW5lICA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpXG4gICwgc3RlcCAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSUQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpKCdpZCcpXG4gICwgJGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgaXNPYmplY3QgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgc2V0U3BlY2llcyAgID0gcmVxdWlyZSgnLi8kLnNldC1zcGVjaWVzJylcbiAgLCBERVNDUklQVE9SUyAgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBTSVpFICAgICAgICAgPSBERVNDUklQVE9SUyA/ICdfcycgOiAnc2l6ZSdcbiAgLCBpZCAgICAgICAgICAgPSAwO1xuXG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYoISRoYXMoaXQsIElEKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxuICAgIGhpZGUoaXQsIElELCArK2lkKTtcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XG59O1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbih0aGF0LCBrZXkpe1xuICAvLyBmYXN0IGNhc2VcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcbiAgaWYoaW5kZXggIT09ICdGJylyZXR1cm4gdGhhdC5faVtpbmRleF07XG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxuICBmb3IoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0aGF0LCBDLCBOQU1FKTtcbiAgICAgIHRoYXQuX2kgPSAkLmNyZWF0ZShudWxsKTsgLy8gaW5kZXhcbiAgICAgIHRoYXQuX2YgPSB1bmRlZmluZWQ7ICAgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgICAgLy8gbGFzdCBlbnRyeVxuICAgICAgdGhhdFtTSVpFXSA9IDA7ICAgICAgICAgICAvLyBzaXplXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XG4gICAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0Ll9pLCBlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKGVudHJ5LnApZW50cnkucCA9IGVudHJ5LnAubiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGF0Ll9mID0gdGhhdC5fbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhhdFtTSVpFXSA9IDA7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgICAgICBpZihlbnRyeSl7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXG4gICAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xuICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9pW2VudHJ5LmldO1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XG4gICAgICAgICAgaWYodGhhdC5fZiA9PSBlbnRyeSl0aGF0Ll9mID0gbmV4dDtcbiAgICAgICAgICBpZih0aGF0Ll9sID09IGVudHJ5KXRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzLl9mKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKERFU0NSSVBUT1JTKSQuc2V0RGVzYyhDLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBkZWZpbmVkKHRoaXNbU0laRV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcbiAgICAgICwgcHJldiwgaW5kZXg7XG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XG4gICAgaWYoZW50cnkpe1xuICAgICAgZW50cnkudiA9IHZhbHVlO1xuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5fbCA9IGVudHJ5ID0ge1xuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxuICAgICAgICB2OiB2YWx1ZSwgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgICAgcDogcHJldiA9IHRoYXQuX2wsICAgICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XG4gICAgICAgIHI6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSByZW1vdmVkXG4gICAgICB9O1xuICAgICAgaWYoIXRoYXQuX2YpdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcbiAgICAgIHRoYXRbU0laRV0rKztcbiAgICAgIC8vIGFkZCB0byBpbmRleFxuICAgICAgaWYoaW5kZXggIT09ICdGJyl0aGF0Ll9pW2luZGV4XSA9IGVudHJ5O1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcbiAgc2V0U3Ryb25nOiBmdW5jdGlvbihDLCBOQU1FLCBJU19NQVApe1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICAgICB0aGlzLl90ID0gaXRlcmF0ZWQ7ICAvLyB0YXJnZXRcbiAgICAgIHRoaXMuX2sgPSBraW5kOyAgICAgIC8vIGtpbmRcbiAgICAgIHRoaXMuX2wgPSB1bmRlZmluZWQ7IC8vIHByZXZpb3VzXG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgLCBraW5kICA9IHRoYXQuX2tcbiAgICAgICAgLCBlbnRyeSA9IHRoYXQuX2w7XG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmKCF0aGF0Ll90IHx8ICEodGhhdC5fbCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhhdC5fdC5fZikpe1xuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxuICAgICAgICB0aGF0Ll90ID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gc3RlcCgxKTtcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcbiAgICAgIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgZW50cnkuayk7XG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xuICAgICAgcmV0dXJuIHN0ZXAoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTtcbiAgICB9LCBJU19NQVAgPyAnZW50cmllcycgOiAndmFsdWVzJyAsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24tc3Ryb25nLmpzXG4gKiogbW9kdWxlIGlkID0gODBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XG4gIGZvcih2YXIga2V5IGluIHNyYylyZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS1hbGwuanNcbiAqKiBtb2R1bGUgaWQgPSA4MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUpe1xuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKXRocm93IFR5cGVFcnJvcihuYW1lICsgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanNcbiAqKiBtb2R1bGUgaWQgPSA4MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vJC5pcy1hcnJheS1pdGVyJylcbiAgLCBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQpe1xuICB2YXIgaXRlckZuID0gZ2V0SXRlckZuKGl0ZXJhYmxlKVxuICAgICwgZiAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yO1xuICBpZih0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ZXJhYmxlICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIC8vIGZhc3QgY2FzZSBmb3IgYXJyYXlzIHdpdGggZGVmYXVsdCBpdGVyYXRvclxuICBpZihpc0FycmF5SXRlcihpdGVyRm4pKWZvcihsZW5ndGggPSB0b0xlbmd0aChpdGVyYWJsZS5sZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICB9IGVsc2UgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7ICl7XG4gICAgY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZm9yLW9mLmpzXG4gKiogbW9kdWxlIGlkID0gODNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIFNQRUNJRVMgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSBjb3JlW0tFWV07XG4gIGlmKERFU0NSSVBUT1JTICYmIEMgJiYgIUNbU1BFQ0lFU10pJC5zZXREZXNjKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXNwZWNpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA4NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBnbG9iYWwgICAgICAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgZmFpbHMgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZmFpbHMnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIHJlZGVmaW5lQWxsICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lLWFsbCcpXG4gICwgZm9yT2YgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBzdHJpY3ROZXcgICAgICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBpc09iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi8kLnNldC10by1zdHJpbmctdGFnJylcbiAgLCBERVNDUklQVE9SUyAgICA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gZ2xvYmFsW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBpZighREVTQ1JJUFRPUlMgfHwgdHlwZW9mIEMgIT0gJ2Z1bmN0aW9uJyB8fCAhKElTX1dFQUsgfHwgcHJvdG8uZm9yRWFjaCAmJiAhZmFpbHMoZnVuY3Rpb24oKXtcbiAgICBuZXcgQygpLmVudHJpZXMoKS5uZXh0KCk7XG4gIH0pKSl7XG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcbiAgICBDID0gY29tbW9uLmdldENvbnN0cnVjdG9yKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbih0YXJnZXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0YXJnZXQsIEMsIE5BTUUpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2U7XG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGFyZ2V0W0FEREVSXSwgdGFyZ2V0KTtcbiAgICB9KTtcbiAgICAkLmVhY2guY2FsbCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMnLnNwbGl0KCcsJyksZnVuY3Rpb24oS0VZKXtcbiAgICAgIHZhciBJU19BRERFUiA9IEtFWSA9PSAnYWRkJyB8fCBLRVkgPT0gJ3NldCc7XG4gICAgICBpZihLRVkgaW4gcHJvdG8gJiYgIShJU19XRUFLICYmIEtFWSA9PSAnY2xlYXInKSloaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICBpZighSVNfQURERVIgJiYgSVNfV0VBSyAmJiAhaXNPYmplY3QoYSkpcmV0dXJuIEtFWSA9PSAnZ2V0JyA/IHVuZGVmaW5lZCA6IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBJU19BRERFUiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZignc2l6ZScgaW4gcHJvdG8pJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Muc2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNldFRvU3RyaW5nVGFnKEMsIE5BTUUpO1xuXG4gIE9bTkFNRV0gPSBDO1xuICAkZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiwgTyk7XG5cbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldFN0cm9uZyhDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gODVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZXhwb3J0ICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAsICdNYXAnLCB7dG9KU09OOiByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ01hcCcpfSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDg2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgZm9yT2YgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIGNsYXNzb2YgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpe1xuICAgIGlmKGNsYXNzb2YodGhpcykgIT0gTkFNRSl0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBmb3JPZih0aGlzLCBmYWxzZSwgYXJyLnB1c2gsIGFycik7XG4gICAgcmV0dXJuIGFycjtcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzXG4gKiogbW9kdWxlIGlkID0gODdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImV4cG9ydCBjb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gICAgc3BlZWQ6IDEsIC8vIHNjcm9sbCBzcGVlZCBzY2FsZVxuICAgIGZyaWN0b246IDEwIC8vIGZyaWN0b24gZmFjdG9yLCBwZXJjZW50XG59O1xuXG5leHBvcnQgY29uc3QgT1BUSU9OX0xJTUlUID0ge1xuICAgIGZyaWN0b246IFsxLCA5OV0sXG4gICAgc3BlZWQ6IFswLCBJbmZpbml0eV1cbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc2hhcmVkL29wdGlvbnMuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge1N0cmluZ30gc2VsZWN0b3JzXG4gKi9cblxuZXhwb3J0IGNvbnN0IHNlbGVjdG9ycyA9ICdzY3JvbGxiYXIsIFtzY3JvbGxiYXJdLCBbZGF0YS1zY3JvbGxiYXJdJztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zaGFyZWQvc2VsZWN0b3JzLmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9kZWJvdW5jZSc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9zdHlsZSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9kZWx0YSc7XG5leHBvcnQgKiBmcm9tICcuL2ZpbmRfY2hpbGQnO1xuZXhwb3J0ICogZnJvbSAnLi9idWlsZF9jdXJ2ZSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF90b3VjaF9pZCc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9wb3NpdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL3BpY2tfaW5fcmFuZ2UnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9pbnRlcl9kYXRhJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGRlYm91bmNlXG4gKi9cblxuLy8gZGVib3VuY2UgdGltZXJzIHJlc2V0IHdhaXRcbmNvbnN0IFJFU0VUX1dBSVQgPSAxMDA7XG5cbi8qKlxuICogQ2FsbCBmbiBpZiBpdCBpc24ndCBiZSBjYWxsZWQgaW4gYSBwZXJpb2RcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtOdW1iZXJ9IFt3YWl0XTogZGVib3VuY2Ugd2FpdCwgZGVmYXVsdCBpcyBSRVNUX1dBSVRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ltbWVkaWF0ZV06IHdoZXRoZXIgdG8gcnVuIHRhc2sgYXQgbGVhZGluZywgZGVmYXVsdCBpcyB0cnVlXG4gKlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmV4cG9ydCBsZXQgZGVib3VuY2UgPSAoZm4sIHdhaXQgPSBSRVNFVF9XQUlULCBpbW1lZGlhdGUgPSB0cnVlKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgbGV0IHRpbWVyO1xuXG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICAgIGlmICghdGltZXIgJiYgaW1tZWRpYXRlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGZuKC4uLmFyZ3MpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRpbWVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZm4oLi4uYXJncyk7XG4gICAgICAgIH0sIHdhaXQpO1xuICAgIH07XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2RlYm91bmNlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gc2V0U3R5bGVcbiAqL1xuXG5jb25zdCBWRU5ET1JfUFJFRklYID0gW1xuICAgICd3ZWJraXQnLFxuICAgICdtb3onLFxuICAgICdtcycsXG4gICAgJ28nXG5dO1xuXG5jb25zdCBSRSA9IG5ldyBSZWdFeHAoYF4tKD8hKD86JHtWRU5ET1JfUFJFRklYLmpvaW4oJ3wnKX0pLSlgKTtcblxubGV0IGF1dG9QcmVmaXggPSAoc3R5bGVzKSA9PiB7XG4gICAgY29uc3QgcmVzID0ge307XG5cbiAgICBPYmplY3Qua2V5cyhzdHlsZXMpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgaWYgKCFSRS50ZXN0KHByb3ApKSB7XG4gICAgICAgICAgICByZXNbcHJvcF0gPSBzdHlsZXNbcHJvcF07XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2YWwgPSBzdHlsZXNbcHJvcF07XG5cbiAgICAgICAgcHJvcCA9IHByb3AucmVwbGFjZSgvXi0vLCAnJyk7XG4gICAgICAgIHJlc1twcm9wXSA9IHZhbDtcblxuICAgICAgICBWRU5ET1JfUFJFRklYLmZvckVhY2goKHByZWZpeCkgPT4ge1xuICAgICAgICAgICAgcmVzW2AtJHtwcmVmaXh9LSR7cHJvcH1gXSA9IHZhbDtcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiByZXM7XG59O1xuXG4vKipcbiAqIHNldCBjc3Mgc3R5bGUgZm9yIHRhcmdldCBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtOiB0YXJnZXQgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlczogY3NzIHN0eWxlcyB0byBhcHBseVxuICovXG5leHBvcnQgbGV0IHNldFN0eWxlID0gKGVsZW0sIHN0eWxlcykgPT4ge1xuICAgIHN0eWxlcyA9IGF1dG9QcmVmaXgoc3R5bGVzKTtcblxuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBsZXQgY3NzUHJvcCA9IHByb3AucmVwbGFjZSgvXi0vLCAnJykucmVwbGFjZSgvLShbYS16XSkvZywgKG0sICQxKSA9PiAkMS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgZWxlbS5zdHlsZVtjc3NQcm9wXSA9IHN0eWxlc1twcm9wXTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvc2V0X3N0eWxlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0RGVsdGFcbiAqIEBkZXBlbmRlbmNpZXMgWyBnZXRPcmlnaW5hbEV2ZW50IF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuXG5jb25zdCBERUxUQV9TQ0FMRSA9IHtcbiAgICBTVEFOREFSRDogMSxcbiAgICBPVEhFUlM6IC0zXG59O1xuXG5jb25zdCBERUxUQV9NT0RFID0gWzEuMCwgMjguMCwgNTAwLjBdO1xuXG5sZXQgZ2V0RGVsdGFNb2RlID0gKG1vZGUpID0+IERFTFRBX01PREVbbW9kZV0gfHwgREVMVEFfTU9ERVswXTtcblxuLyoqXG4gKiBOb3JtYWxpemluZyB3aGVlbCBkZWx0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICovXG5leHBvcnQgbGV0IGdldERlbHRhID0gKGV2dCkgPT4ge1xuICAgIC8vIGdldCBvcmlnaW5hbCBET00gZXZlbnRcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICBpZiAoJ2RlbHRhWCcgaW4gZXZ0KSB7XG4gICAgICAgIGNvbnN0IG1vZGUgPSBnZXREZWx0YU1vZGUoZXZ0LmRlbHRhTW9kZSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGV2dC5kZWx0YVggLyBERUxUQV9TQ0FMRS5TVEFOREFSRCAqIG1vZGUsXG4gICAgICAgICAgICB5OiBldnQuZGVsdGFZIC8gREVMVEFfU0NBTEUuU1RBTkRBUkQgKiBtb2RlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCd3aGVlbERlbHRhWCcgaW4gZXZ0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBldnQud2hlZWxEZWx0YVggLyBERUxUQV9TQ0FMRS5PVEhFUlMsXG4gICAgICAgICAgICB5OiBldnQud2hlZWxEZWx0YVkgLyBERUxUQV9TQ0FMRS5PVEhFUlNcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBpZSB3aXRoIHRvdWNocGFkXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogZXZ0LndoZWVsRGVsdGEgLyBERUxUQV9TQ0FMRS5PVEhFUlNcbiAgICB9O1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF9kZWx0YS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldE9yaWdpbmFsRXZlbnRcbiAqL1xuXG4vKipcbiAqIEdldCBvcmlnaW5hbCBET00gZXZlbnRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZXZ0OiBldmVudCBvYmplY3RcbiAqXG4gKiBAcmV0dXJuIHtFdmVudE9iamVjdH1cbiAqL1xuZXhwb3J0IGxldCBnZXRPcmlnaW5hbEV2ZW50ID0gKGV2dCkgPT4ge1xuICAgIHJldHVybiBldnQub3JpZ2luYWxFdmVudCB8fCBldnQ7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF9vcmlnaW5hbF9ldmVudC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGZpbmRDaGlsZFxuICovXG5cbi8qKlxuICogRmluZCBlbGVtZW50IHdpdGggc3BlY2lmaWMgY2xhc3MgbmFtZSB3aXRoaW4gY2hpbGRyZW5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHBhcmVudEVsZW1cbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcbiAqXG4gKiBAcmV0dXJuIHtFbGVtZW50fTogZmlyc3QgbWF0Y2hlZCBjaGlsZFxuICovXG5leHBvcnQgbGV0IGZpbmRDaGlsZCA9IChwYXJlbnRFbGVtLCBjbGFzc05hbWUpID0+IHtcbiAgICBsZXQgY2hpbGRyZW4gPSBwYXJlbnRFbGVtLmNoaWxkcmVuO1xuXG4gICAgaWYgKCFjaGlsZHJlbikgcmV0dXJuIG51bGw7XG5cbiAgICBmb3IgKGxldCBlbGVtIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgIGlmIChlbGVtLmNsYXNzTmFtZS5tYXRjaChjbGFzc05hbWUpKSByZXR1cm4gZWxlbTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZmluZF9jaGlsZC5qc1xuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3InKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDk3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0JylcbiAgLCBnZXQgICAgICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5jb3JlJykuZ2V0SXRlcmF0b3IgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBpdGVyRm4gPSBnZXQoaXQpO1xuICBpZih0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIHJldHVybiBhbk9iamVjdChpdGVyRm4uY2FsbChpdCkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA5OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gYnVpbGRDdXJ2ZVxuICovXG5cbi8qKlxuICogQnVpbGQgcXVhZHJhdGljIGVhc2luZyBjdXJ2ZVxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBiZWdpblxuICogQHBhcmFtIHtOdW1iZXJ9IGR1cmF0aW9uXG4gKlxuICogQHJldHVybiB7QXJyYXl9OiBwb2ludHNcbiAqL1xuZXhwb3J0IGxldCBidWlsZEN1cnZlID0gKGRpc3RhbmNlLCBkdXJhdGlvbikgPT4ge1xuICAgIGxldCByZXMgPSBbXTtcblxuICAgIGNvbnN0IHQgPSBNYXRoLmZsb29yKGR1cmF0aW9uIC8gMTAwMCAqIDYwKTtcbiAgICBjb25zdCBhID0gLWRpc3RhbmNlIC8gdCoqMjtcbiAgICBjb25zdCBiID0gLTIgKiBhICogdDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDw9IHQ7IGkrKykge1xuICAgICAgICByZXMucHVzaChkaXN0YW5jZSA/IChhICogaSoqMiArIGIgKiBpKSA6IDApO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2J1aWxkX2N1cnZlLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0VG91Y2hJRFxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQsIGdldFBvaW50ZXJEYXRhIF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuaW1wb3J0IHsgZ2V0UG9pbnRlckRhdGEgfSBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuXG4vKipcbiAqIEdldCB0b3VjaCBpZGVudGlmaWVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKlxuICogQHJldHVybiB7TnVtYmVyfTogdG91Y2ggaWRcbiAqL1xuZXhwb3J0IGxldCBnZXRUb3VjaElEID0gKGV2dCkgPT4ge1xuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGxldCBkYXRhID0gZ2V0UG9pbnRlckRhdGEoZXZ0KTtcblxuICAgIHJldHVybiBkYXRhLmlkZW50aWZpZXI7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF90b3VjaF9pZC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldFBvaW50ZXJEYXRhXG4gKiBAZGVwZW5kZW5jaWVzIFsgZ2V0T3JpZ2luYWxFdmVudCBdXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4vZ2V0X29yaWdpbmFsX2V2ZW50JztcblxuLyoqXG4gKiBHZXQgcG9pbnRlci90b3VjaCBkYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gZXZ0OiBldmVudCBvYmplY3RcbiAqL1xuZXhwb3J0IGxldCBnZXRQb2ludGVyRGF0YSA9IChldnQpID0+IHtcbiAgICAvLyBpZiBpcyB0b3VjaCBldmVudCwgcmV0dXJuIGxhc3QgaXRlbSBpbiB0b3VjaExpc3RcbiAgICAvLyBlbHNlIHJldHVybiBvcmlnaW5hbCBldmVudFxuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIHJldHVybiBldnQudG91Y2hlcyA/IGV2dC50b3VjaGVzW2V2dC50b3VjaGVzLmxlbmd0aCAtIDFdIDogZXZ0O1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL2dldF9wb2ludGVyX2RhdGEuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXRQb3NpdGlvblxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQsIGdldFBvaW50ZXJEYXRhIF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuaW1wb3J0IHsgZ2V0UG9pbnRlckRhdGEgfSBmcm9tICcuL2dldF9wb2ludGVyX2RhdGEnO1xuXG4vKipcbiAqIEdldCBwb2ludGVyL2ZpbmdlciBwb3NpdGlvblxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKlxuICogQHJldHVybiB7T2JqZWN0fTogcG9zaXRpb257eCwgeX1cbiAqL1xuZXhwb3J0IGxldCBnZXRQb3NpdGlvbiA9IChldnQpID0+IHtcbiAgICBldnQgPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICBsZXQgZGF0YSA9IGdldFBvaW50ZXJEYXRhKGV2dCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBkYXRhLmNsaWVudFgsXG4gICAgICAgIHk6IGRhdGEuY2xpZW50WVxuICAgIH07XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X3Bvc2l0aW9uLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gcGlja0luUmFuZ2VcbiAqL1xuXG4vKipcbiAqIFBpY2sgdmFsdWUgaW4gcmFuZ2UgW21pbiwgbWF4XVxuICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gKiBAcGFyYW0ge051bWJlcn0gW21pbl1cbiAqIEBwYXJhbSB7TnVtYmVyfSBbbWF4XVxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZXhwb3J0IGxldCBwaWNrSW5SYW5nZSA9ICh2YWx1ZSwgbWluID0gMCwgbWF4ID0gMCkgPT4gTWF0aC5tYXgobWluLCBNYXRoLm1pbih2YWx1ZSwgbWF4KSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9waWNrX2luX3JhbmdlLmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi91cGRhdGUnO1xuZXhwb3J0ICogZnJvbSAnLi9kZXN0cm95JztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3NpemUnO1xuZXhwb3J0ICogZnJvbSAnLi9saXN0ZW5lcic7XG5leHBvcnQgKiBmcm9tICcuL3Njcm9sbF90byc7XG5leHBvcnQgKiBmcm9tICcuL3NldF9vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vc2V0X3Bvc2l0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vdG9nZ2xlX3RyYWNrJztcbmV4cG9ydCAqIGZyb20gJy4vaW5maW5pdGVfc2Nyb2xsJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X2NvbnRlbnRfZWxlbSc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHVwZGF0ZVxuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlLCBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBVcGRhdGUgc2Nyb2xsYmFycyBhcHBlYXJhbmNlXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBhc3luYzogdXBkYXRlIGFzeW5jaHJvbm91c1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKGFzeW5jID0gdHJ1ZSkge1xuICAgIGxldCB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX191cGRhdGVCb3VuZGluZygpO1xuXG4gICAgICAgIGxldCBzaXplID0gdGhpcy5nZXRTaXplKCk7XG5cbiAgICAgICAgdGhpcy5fX3JlYWRvbmx5KCdzaXplJywgc2l6ZSk7XG5cbiAgICAgICAgbGV0IG5ld0xpbWl0ID0ge1xuICAgICAgICAgICAgeDogc2l6ZS5jb250ZW50LndpZHRoIC0gc2l6ZS5jb250YWluZXIud2lkdGgsXG4gICAgICAgICAgICB5OiBzaXplLmNvbnRlbnQuaGVpZ2h0IC0gc2l6ZS5jb250YWluZXIuaGVpZ2h0XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMubGltaXQgJiZcbiAgICAgICAgICAgIG5ld0xpbWl0LnggPT09IHRoaXMubGltaXQueCAmJlxuICAgICAgICAgICAgbmV3TGltaXQueSA9PT0gdGhpcy5saW1pdC55KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5fX3JlYWRvbmx5KCdsaW1pdCcsIG5ld0xpbWl0KTtcblxuICAgICAgICBsZXQgeyB4QXhpcywgeUF4aXMgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgICAgICAvLyBoaWRlIHNjcm9sbGJhciBpZiBjb250ZW50IHNpemUgbGVzcyB0aGFuIGNvbnRhaW5lclxuICAgICAgICBzZXRTdHlsZSh4QXhpcy50cmFjaywge1xuICAgICAgICAgICAgJ2Rpc3BsYXknOiBzaXplLmNvbnRlbnQud2lkdGggPD0gc2l6ZS5jb250YWluZXIud2lkdGggPyAnbm9uZScgOiAnYmxvY2snXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRTdHlsZSh5QXhpcy50cmFjaywge1xuICAgICAgICAgICAgJ2Rpc3BsYXknOiBzaXplLmNvbnRlbnQuaGVpZ2h0IDw9IHNpemUuY29udGFpbmVyLmhlaWdodCA/ICdub25lJyA6ICdibG9jaydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gdXNlIHBlcmNlbnRhZ2UgdmFsdWUgZm9yIHRodW1iXG4gICAgICAgIHNldFN0eWxlKHhBeGlzLnRodW1iLCB7XG4gICAgICAgICAgICAnd2lkdGgnOiBgJHtwaWNrSW5SYW5nZShzaXplLmNvbnRhaW5lci53aWR0aCAvIHNpemUuY29udGVudC53aWR0aCwgMCwgMSkgKiAxMDB9JWBcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFN0eWxlKHlBeGlzLnRodW1iLCB7XG4gICAgICAgICAgICAnaGVpZ2h0JzogYCR7cGlja0luUmFuZ2Uoc2l6ZS5jb250YWluZXIuaGVpZ2h0IC8gc2l6ZS5jb250ZW50LmhlaWdodCwgMCwgMSkgKiAxMDB9JWBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5fX3NldFRodW1iUG9zaXRpb24oKTtcbiAgICB9O1xuXG4gICAgaWYgKGFzeW5jKSB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgIH1cbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy91cGRhdGUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBkZXN0cm95XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IHNiTGlzdCB9IGZyb20gJy4uL3NoYXJlZCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFJlbW92ZSBhbGwgc2Nyb2xsYmFyIGxpc3RlbmVycyBhbmQgZXZlbnQgaGFuZGxlcnNcbiAqIFJlc2V0XG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgX19saXN0ZW5lcnMsIF9faGFuZGxlcnMsIHRhcmdldHMgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBjb250YWluZXIsIGNvbnRlbnQgfSA9IHRhcmdldHM7XG5cbiAgICBfX2hhbmRsZXJzLmZvckVhY2goKHsgZXZ0LCBlbGVtLCBoYW5kbGVyIH0pID0+IHtcbiAgICAgICAgZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyKGV2dCwgaGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLnNjcm9sbFRvKDAsIDAsIDMwMCwgKCkgPT4ge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9fdGltZXJJRC5zY3JvbGxBbmltYXRpb24pO1xuICAgICAgICBfX2hhbmRsZXJzLmxlbmd0aCA9IF9fbGlzdGVuZXJzLmxlbmd0aCA9IDA7XG5cbiAgICAgICAgLy8gcmVzZXQgc2Nyb2xsIHBvc2l0aW9uXG4gICAgICAgIHNldFN0eWxlKGNvbnRhaW5lciwge1xuICAgICAgICAgICAgb3ZlcmZsb3c6ICcnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsTGVmdCA9IDA7XG5cbiAgICAgICAgLy8gcmVzZXQgY29udGVudFxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi5jb250ZW50LmNoaWxkcmVuXTtcblxuICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cbiAgICAgICAgY2hpbGRyZW4uZm9yRWFjaCgoZWwpID0+IGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbCkpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBmb3JtIHNiTGlzdFxuICAgICAgICBzYkxpc3QuZGVsZXRlKGNvbnRhaW5lcik7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvZGVzdHJveS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGdldFNpemVcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogR2V0IGNvbnRhaW5lciBhbmQgY29udGVudCBzaXplXG4gKlxuICogQHJldHVybiB7T2JqZWN0fTogYW4gb2JqZWN0IGNvbnRhaW5zIGNvbnRhaW5lciBhbmQgY29udGVudCdzIHdpZHRoIGFuZCBoZWlnaHRcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5nZXRTaXplID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IHRoaXMudGFyZ2V0cy5jb250YWluZXI7XG4gICAgbGV0IGNvbnRlbnQgPSB0aGlzLnRhcmdldHMuY29udGVudDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnRhaW5lcjoge1xuICAgICAgICAgICAgLy8gcmVxdWlyZXMgYG92ZXJmbG93OiBoaWRkZW5gXG4gICAgICAgICAgICB3aWR0aDogY29udGFpbmVyLmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBjb250YWluZXIuY2xpZW50SGVpZ2h0XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgIC8vIGJvcmRlciB3aWR0aCBzaG91bGQgYmUgaW5jbHVkZWRcbiAgICAgICAgICAgIHdpZHRoOiBjb250ZW50Lm9mZnNldFdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBjb250ZW50Lm9mZnNldEhlaWdodFxuICAgICAgICB9XG4gICAgfTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9nZXRfc2l6ZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGFkZExpc3RlbmVyXG4gKiAgICAgICAgICAgIHtGdW5jdGlvbn0gcmVtb3ZlTGlzdGVuZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogQWRkIHNjcm9sbGluZyBsaXN0ZW5lclxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiOiBsaXN0ZW5lclxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24oY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICB0aGlzLl9fbGlzdGVuZXJzLnB1c2goY2IpO1xufTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBSZW1vdmUgc3BlY2lmaWMgbGlzdGVuZXIgZnJvbSBhbGwgbGlzdGVuZXJzXG4gKiBAcGFyYW0ge3R5cGV9IHBhcmFtOiBkZXNjcmlwdGlvblxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oY2IpIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICB0aGlzLl9fbGlzdGVuZXJzLnNvbWUoKGZuLCBpZHgsIGFsbCkgPT4ge1xuICAgICAgICByZXR1cm4gZm4gPT09IGNiICYmIGFsbC5zcGxpY2UoaWR4LCAxKTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9saXN0ZW5lci5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNjcm9sbFRvXG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UsIGJ1aWxkQ3VydmUgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogU2Nyb2xsaW5nIHNjcm9sbGJhciB0byBwb3NpdGlvbiB3aXRoIHRyYW5zaXRpb25cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW3hdOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0gW3ldOiBzY3JvbGxiYXIgcG9zaXRpb24gaW4geSBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0gW2R1cmF0aW9uXTogdHJhbnNpdGlvbiBkdXJhdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXTogY2FsbGJhY2tcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uKHggPSB0aGlzLm9mZnNldC54LCB5ID0gdGhpcy5vZmZzZXQueSwgZHVyYXRpb24gPSAwLCBjYiA9IG51bGwpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG9mZnNldCxcbiAgICAgICAgbGltaXQsXG4gICAgICAgIHZlbG9jaXR5LFxuICAgICAgICBfX3RpbWVySURcbiAgICB9ID0gdGhpcztcblxuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKF9fdGltZXJJRC5zY3JvbGxUbyk7XG4gICAgY2IgPSB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicgPyBjYiA6ICgpID0+IHt9O1xuXG4gICAgY29uc3Qgc3RhcnRYID0gb2Zmc2V0Lng7XG4gICAgY29uc3Qgc3RhcnRZID0gb2Zmc2V0Lnk7XG5cbiAgICBjb25zdCBkaXNYID0gcGlja0luUmFuZ2UoeCwgMCwgbGltaXQueCkgLSBzdGFydFg7XG4gICAgY29uc3QgZGlzWSA9IHBpY2tJblJhbmdlKHksIDAsIGxpbWl0LnkpIC0gc3RhcnRZO1xuXG4gICAgY29uc3QgY3VydmVYID0gYnVpbGRDdXJ2ZShkaXNYLCBkdXJhdGlvbik7XG4gICAgY29uc3QgY3VydmVZID0gYnVpbGRDdXJ2ZShkaXNZLCBkdXJhdGlvbik7XG5cbiAgICBsZXQgZnJhbWUgPSAwLCB0b3RhbEZyYW1lID0gY3VydmVYLmxlbmd0aDtcblxuICAgIGxldCBzY3JvbGwgPSAoKSA9PiB7XG4gICAgICAgIGlmIChmcmFtZSA9PT0gdG90YWxGcmFtZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2IodGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oc3RhcnRYICsgY3VydmVYW2ZyYW1lXSwgc3RhcnRZICsgY3VydmVZW2ZyYW1lXSk7XG5cbiAgICAgICAgZnJhbWUrKztcblxuICAgICAgICBfX3RpbWVySUQuc2Nyb2xsVG8gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2Nyb2xsKTtcbiAgICB9O1xuXG4gICAgc2Nyb2xsKCk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvc2Nyb2xsX3RvLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2V0T3B0aW9uc1xuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcbmltcG9ydCB7IE9QVElPTl9MSU1JVCB9IGZyb20gJy4uL3NoYXJlZC8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFNldCBzY3JvbGxiYXIgb3B0aW9uc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdGlvbnMgPSB7fSkge1xuICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQob3B0aW9uc1twcm9wXSkpKSB7XG4gICAgICAgICAgICBkZWxldGUgb3B0aW9uc1twcm9wXTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghT1BUSU9OX0xJTUlULmhhc093blByb3BlcnR5KHByb3ApKSByZXR1cm47XG5cbiAgICAgICAgb3B0aW9uc1twcm9wXSA9IHBpY2tJblJhbmdlKG9wdGlvbnNbcHJvcF0sIC4uLk9QVElPTl9MSU1JVFtwcm9wXSk7XG4gICAgfSk7XG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvc2V0X29wdGlvbnMuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzZXRQb3NpdGlvblxuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlLCBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTZXQgc2Nyb2xsYmFyIHBvc2l0aW9uIHdpdGhvdXQgdHJhbnNpdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeF06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB4IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeV06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB5IGF4aXNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHggPSB0aGlzLm9mZnNldC54LCB5ID0gdGhpcy5vZmZzZXQueSkge1xuICAgIHRoaXMuX191cGRhdGVUaHJvdHRsZSgpO1xuXG4gICAgY29uc3Qgc3RhdHVzID0ge307XG4gICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0LCB0YXJnZXRzLCBfX2xpc3RlbmVycyB9ID0gdGhpcztcblxuICAgIGlmIChNYXRoLmFicyh4IC0gb2Zmc2V0LngpID4gMSkgdGhpcy5zaG93VHJhY2soJ3gnKTtcbiAgICBpZiAoTWF0aC5hYnMoeSAtIG9mZnNldC55KSA+IDEpIHRoaXMuc2hvd1RyYWNrKCd5Jyk7XG5cbiAgICB4ID0gcGlja0luUmFuZ2UoeCwgMCwgbGltaXQueCk7XG4gICAgeSA9IHBpY2tJblJhbmdlKHksIDAsIGxpbWl0LnkpO1xuXG4gICAgdGhpcy5oaWRlVHJhY2soKTtcblxuICAgIGlmICh4ID09PSBvZmZzZXQueCAmJiB5ID09PSBvZmZzZXQueSkgcmV0dXJuO1xuXG4gICAgc3RhdHVzLmRpcmVjdGlvbiA9IHtcbiAgICAgICAgeDogeCA9PT0gb2Zmc2V0LnggPyAnbm9uZScgOiAoeCA+IG9mZnNldC54ID8gJ3JpZ2h0JyA6ICdsZWZ0JyksXG4gICAgICAgIHk6IHkgPT09IG9mZnNldC55ID8gJ25vbmUnIDogKHkgPiBvZmZzZXQueSA/ICdkb3duJyA6ICd1cCcpXG4gICAgfTtcblxuICAgIHN0YXR1cy5saW1pdCA9IHsgLi4ubGltaXQgfTtcblxuICAgIG9mZnNldC54ID0geDtcbiAgICBvZmZzZXQueSA9IHk7XG4gICAgc3RhdHVzLm9mZnNldCA9IHsgLi4ub2Zmc2V0IH07XG5cbiAgICAvLyByZXNldCB0aHVtYiBwb3NpdGlvbiBhZnRlciBvZmZzZXQgdXBkYXRlXG4gICAgdGhpcy5fX3NldFRodW1iUG9zaXRpb24oKTtcblxuICAgIHNldFN0eWxlKHRhcmdldHMuY29udGVudCwge1xuICAgICAgICAnLXRyYW5zZm9ybSc6IGB0cmFuc2xhdGUzZCgkey14fXB4LCAkey15fXB4LCAwKWBcbiAgICB9KTtcblxuICAgIC8vIGludm9rZSBhbGwgbGlzdGVuZXJzXG4gICAgX19saXN0ZW5lcnMuZm9yRWFjaCgoZm4pID0+IHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGZuKHN0YXR1cyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3NldF9wb3NpdGlvbi5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRhc3NpZ24gPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9hc3NpZ25cIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IF9PYmplY3QkYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuXG4gICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvZXh0ZW5kcy5qc1xuICoqIG1vZHVsZSBpZCA9IDExMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2hvd1RyYWNrXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gaGlkZVRyYWNrXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIHNob3cgc2Nyb2xsYmFyIHRyYWNrIG9uIGdpdmVuIGRpcmVjdGlvblxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb246IHdoaWNoIGRpcmVjdGlvbiBvZiB0cmFja3MgdG8gc2hvdywgZGVmYXVsdCBpcyAnYm90aCdcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zaG93VHJhY2sgPSBmdW5jdGlvbihkaXJlY3Rpb24gPSAnYm90aCcpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgeEF4aXMsIHlBeGlzIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBkaXJlY3Rpb24gPSBkaXJlY3Rpb24udG9Mb3dlckNhc2UoKTtcbiAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc2Nyb2xsaW5nJyk7XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSAnYm90aCcpIHtcbiAgICAgICAgeEF4aXMudHJhY2suY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgfVxuXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3gnKSB7XG4gICAgICAgIHhBeGlzLnRyYWNrLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSAneScpIHtcbiAgICAgICAgeUF4aXMudHJhY2suY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogaGlkZSB0cmFjayB3aXRoIDMwMG1zIGRlYm91bmNlXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuaGlkZVRyYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyB0YXJnZXRzLCBfX3RpbWVySUQgfSA9IHRoaXM7XG4gICAgY29uc3QgeyBjb250YWluZXIsIHhBeGlzLCB5QXhpcyB9ID0gdGFyZ2V0cztcblxuICAgIGNsZWFyVGltZW91dChfX3RpbWVySUQudHJhY2spO1xuXG4gICAgX190aW1lcklELnRyYWNrID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdzY3JvbGxpbmcnKTtcbiAgICAgICAgeEF4aXMudHJhY2suY2xhc3NMaXN0LnJlbW92ZSgnc2hvdycpO1xuICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgfSwgMzAwKTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy90b2dnbGVfdHJhY2suanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBpbmZpbml0ZVNjcm9sbFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBDcmVhdGUgaW5maW5pdGUgc2Nyb2xsIGxpc3RlbmVyXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2I6IGluZmluaXRlIHNjcm9sbCBhY3Rpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbdGhyZXNob2xkXTogaW5maW5pdGUgc2Nyb2xsIHRocmVzaG9sZCh0byBib3R0b20pLCBkZWZhdWx0IGlzIDUwKHB4KVxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmluZmluaXRlU2Nyb2xsID0gZnVuY3Rpb24oY2IsIHRocmVzaG9sZCA9IDUwKSB7XG4gICAgaWYgKHR5cGVvZiBjYiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgbGV0IGxhc3RPZmZzZXQgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgbGV0IGVudGVyZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuYWRkTGlzdGVuZXIoKHN0YXR1cykgPT4ge1xuICAgICAgICBsZXQgeyBvZmZzZXQsIGxpbWl0IH0gPSBzdGF0dXM7XG5cbiAgICAgICAgaWYgKGxpbWl0LnkgLSBvZmZzZXQueSA8PSB0aHJlc2hvbGQgJiYgb2Zmc2V0LnkgPiBsYXN0T2Zmc2V0LnkgJiYgIWVudGVyZWQpIHtcbiAgICAgICAgICAgIGVudGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBjYihzdGF0dXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaW1pdC55IC0gb2Zmc2V0LnkgPiB0aHJlc2hvbGQpIHtcbiAgICAgICAgICAgIGVudGVyZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RPZmZzZXQgPSBvZmZzZXQ7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvaW5maW5pdGVfc2Nyb2xsLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gZ2V0Q29udGVudEVsZW1cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogR2V0IHNjcm9sbCBjb250ZW50IGVsZW1lbnRcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5nZXRDb250ZW50RWxlbSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRhcmdldHMuY29udGVudDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9nZXRfY29udGVudF9lbGVtLmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9yZW5kZXInO1xuZXhwb3J0ICogZnJvbSAnLi9hZGRfbW92ZW1lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfbW92ZW1lbnQnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fcmVuZGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBuZXh0VGljayhvcHRpb25zLCBjdXJyZW50LCBtb3ZlbWVudCkge1xuICAgIGNvbnN0IHsgZnJpY3RvbiB9ID0gb3B0aW9ucztcblxuICAgIGlmIChNYXRoLmFicyhtb3ZlbWVudCkgPCAxKSB7XG4gICAgICAgIGxldCBuZXh0ID0gY3VycmVudCArIG1vdmVtZW50O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtb3ZlbWVudDogMCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBjdXJyZW50ID4gbmV4dCA/IE1hdGguY2VpbChuZXh0KSA6IE1hdGguZmxvb3IobmV4dClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgcSA9IDEgLSBmcmljdG9uIC8gMTAwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbW92ZW1lbnQ6IG1vdmVtZW50ICogcSxcbiAgICAgICAgcG9zaXRpb246IGN1cnJlbnQgKyBtb3ZlbWVudCAqICgxIC0gcSlcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gX19yZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG1vdmVtZW50LFxuICAgICAgICBfX3RpbWVySURcbiAgICB9ID0gdGhpcztcblxuICAgIGlmIChtb3ZlbWVudC54IHx8IG1vdmVtZW50LnkpIHtcbiAgICAgICAgbGV0IG5leHRYID0gbmV4dFRpY2sob3B0aW9ucywgb2Zmc2V0LngsIG1vdmVtZW50LngpO1xuICAgICAgICBsZXQgbmV4dFkgPSBuZXh0VGljayhvcHRpb25zLCBvZmZzZXQueSwgbW92ZW1lbnQueSk7XG5cbiAgICAgICAgbW92ZW1lbnQueCA9IG5leHRYLm1vdmVtZW50O1xuICAgICAgICBtb3ZlbWVudC55ID0gbmV4dFkubW92ZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihuZXh0WC5wb3NpdGlvbiwgbmV4dFkucG9zaXRpb24pO1xuICAgIH1cblxuICAgIF9fdGltZXJJRC5zY3JvbGxBbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpczo6X19yZW5kZXIpO1xuXG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVuZGVyJywge1xuICAgIHZhbHVlOiBfX3JlbmRlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9yZW5kZXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZE1vdmVtZW50XG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZE1vdmVtZW50KGRlbHRhWCA9IDAsIGRlbHRhWSA9IDApIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG1vdmVtZW50XG4gICAgfSA9IHRoaXM7XG5cbiAgICB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcblxuICAgIGxldCBsaW1pdCA9IHRoaXMuX19nZXREZWx0YUxpbWl0KCk7XG5cbiAgICBtb3ZlbWVudC54ID0gcGlja0luUmFuZ2UobW92ZW1lbnQueCArIGRlbHRhWCAqIG9wdGlvbnMuc3BlZWQsIC4uLmxpbWl0LngpO1xuICAgIG1vdmVtZW50LnkgPSBwaWNrSW5SYW5nZShtb3ZlbWVudC55ICsgZGVsdGFZICogb3B0aW9ucy5zcGVlZCwgLi4ubGltaXQueSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fYWRkTW92ZW1lbnQnLCB7XG4gICAgdmFsdWU6IF9fYWRkTW92ZW1lbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9yZW5kZXIvYWRkX21vdmVtZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19zZXRNb3ZlbWVudFxuICovXG5cbmltcG9ydCB7IHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvJztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19zZXRNb3ZlbWVudChkZWx0YVggPSAwLCBkZWx0YVkgPSAwKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBtb3ZlbWVudFxuICAgIH0gPSB0aGlzO1xuXG4gICAgdGhpcy5fX3VwZGF0ZVRocm90dGxlKCk7XG5cbiAgICBsZXQgbGltaXQgPSB0aGlzLl9fZ2V0RGVsdGFMaW1pdCgpO1xuXG4gICAgbW92ZW1lbnQueCA9IHBpY2tJblJhbmdlKGRlbHRhWCAqIG9wdGlvbnMuc3BlZWQsIC4uLmxpbWl0LngpO1xuICAgIG1vdmVtZW50LnkgPSBwaWNrSW5SYW5nZShkZWx0YVkgKiBvcHRpb25zLnNwZWVkLCAuLi5saW1pdC55KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZXRNb3ZlbWVudCcsIHtcbiAgICB2YWx1ZTogX19zZXRNb3ZlbWVudCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9zZXRfbW92ZW1lbnQuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL2RyYWcnO1xuZXhwb3J0ICogZnJvbSAnLi90b3VjaCc7XG5leHBvcnQgKiBmcm9tICcuL21vdXNlJztcbmV4cG9ydCAqIGZyb20gJy4vd2hlZWwnO1xuZXhwb3J0ICogZnJvbSAnLi9yZXNpemUnO1xuZXhwb3J0ICogZnJvbSAnLi9zZWxlY3QnO1xuZXhwb3J0ICogZnJvbSAnLi9rZXlib2FyZCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19kcmFnSGFuZGxlclxuICovXG5cbiBpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbiBpbXBvcnQge1xuICAgIGdldE9yaWdpbmFsRXZlbnQsXG4gICAgZ2V0UG9zaXRpb24sXG4gICAgZ2V0VG91Y2hJRCxcbiAgICBwaWNrSW5SYW5nZSxcbiAgICBzZXRTdHlsZVxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbiBleHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuIGxldCBfX2RyYWdIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIsIGNvbnRlbnQgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGxldCBpc0RyYWcgPSBmYWxzZTtcbiAgICBsZXQgYW5pbWF0aW9uID0gdW5kZWZpbmVkO1xuICAgIGxldCB0YXJnZXRIZWlnaHQgPSB1bmRlZmluZWQ7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19faXNEcmFnJywge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNEcmFnO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgbGV0IHNjcm9sbCA9ICh7IHgsIHkgfSkgPT4ge1xuICAgICAgICBpZiAoIXggJiYgIXkpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoeCwgeSk7XG5cbiAgICAgICAgYW5pbWF0aW9uID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHNjcm9sbCh7IHgsIHkgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoZG9jdW1lbnQsICdkcmFnb3ZlciBtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRHJhZyB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBkaXIgPSB0aGlzLl9fZ2V0UG9pbnRlclRyZW5kKGV2dCwgdGFyZ2V0SGVpZ2h0KTtcblxuICAgICAgICBzY3JvbGwoZGlyKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdkcmFnc3RhcnQnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIHNldFN0eWxlKGNvbnRlbnQsIHtcbiAgICAgICAgICAgICdwb2ludGVyLWV2ZW50cyc6ICdhdXRvJ1xuICAgICAgICB9KTtcblxuICAgICAgICB0YXJnZXRIZWlnaHQgPSBldnQudGFyZ2V0LmNsaWVudEhlaWdodDtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgdGhpcy5fX3VwZGF0ZUJvdW5kaW5nKCk7XG4gICAgICAgIGlzRHJhZyA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5fX2FkZEV2ZW50KGRvY3VtZW50LCAnZHJhZ2VuZCBtb3VzZXVwIHRvdWNoZW5kIGJsdXInLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICBpc0RyYWcgPSBmYWxzZTtcbiAgICB9KTtcbiB9O1xuXG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2RyYWdIYW5kbGVyJywge1xuICAgICB2YWx1ZTogX19kcmFnSGFuZGxlcixcbiAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuIH0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2RyYWcuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3RvdWNoSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHtcbiAgICBnZXRPcmlnaW5hbEV2ZW50LFxuICAgIGdldFBvc2l0aW9uLFxuICAgIGdldFRvdWNoSUQsXG4gICAgcGlja0luUmFuZ2Vcbn0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuY29uc3QgRUFTSU5HX0RVUkFUSU9OID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvYW5kcm9pZC9pKSA/IDE1MDAgOiA3NTA7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBUb3VjaCBldmVudCBoYW5kbGVycyBidWlsZGVyXG4gKi9cbmxldCBfX3RvdWNoSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBsZXQgbGFzdFRvdWNoVGltZSwgbGFzdFRvdWNoSUQ7XG4gICAgbGV0IG1vdmVWZWxvY2l0eSA9IHt9LCBsYXN0VG91Y2hQb3MgPSB7fSwgdG91Y2hSZWNvcmRzID0ge307XG5cbiAgICBsZXQgdXBkYXRlUmVjb3JkcyA9IChldnQpID0+IHtcbiAgICAgICAgY29uc3QgdG91Y2hMaXN0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpLnRvdWNoZXM7XG5cbiAgICAgICAgT2JqZWN0LmtleXModG91Y2hMaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIC8vIHJlY29yZCBhbGwgdG91Y2hlcyB0aGF0IHdpbGwgYmUgcmVzdG9yZWRcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdsZW5ndGgnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gdG91Y2hMaXN0W2tleV07XG5cbiAgICAgICAgICAgIHRvdWNoUmVjb3Jkc1t0b3VjaC5pZGVudGlmaWVyXSA9IGdldFBvc2l0aW9uKHRvdWNoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICd0b3VjaHN0YXJ0JywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lzRHJhZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHsgbW92ZW1lbnQgfSA9IHRoaXM7XG5cbiAgICAgICAgdXBkYXRlUmVjb3JkcyhldnQpO1xuXG4gICAgICAgIGxhc3RUb3VjaFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBsYXN0VG91Y2hJRCA9IGdldFRvdWNoSUQoZXZ0KTtcbiAgICAgICAgbGFzdFRvdWNoUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICAvLyBzdG9wIHNjcm9sbGluZ1xuICAgICAgICBtb3ZlbWVudC54ID0gbW92ZW1lbnQueSA9IDA7XG4gICAgICAgIG1vdmVWZWxvY2l0eS54ID0gbW92ZVZlbG9jaXR5LnkgPSAwO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3RvdWNobW92ZScsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpIHx8IHRoaXMuX19pc0RyYWcpIHJldHVybjtcblxuICAgICAgICB1cGRhdGVSZWNvcmRzKGV2dCk7XG5cbiAgICAgICAgY29uc3QgdG91Y2hJRCA9IGdldFRvdWNoSUQoZXZ0KTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0IH0gPSB0aGlzO1xuXG4gICAgICAgIGlmIChsYXN0VG91Y2hJRCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyByZXNldCBsYXN0IHRvdWNoIGluZm8gZnJvbSByZWNvcmRzXG4gICAgICAgICAgICBsYXN0VG91Y2hJRCA9IHRvdWNoSUQ7XG5cbiAgICAgICAgICAgIC8vIGRvbid0IG5lZWQgZXJyb3IgaGFuZGxlclxuICAgICAgICAgICAgbGFzdFRvdWNoVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBsYXN0VG91Y2hQb3MgPSB0b3VjaFJlY29yZHNbdG91Y2hJRF07XG4gICAgICAgIH0gZWxzZSBpZiAodG91Y2hJRCAhPT0gbGFzdFRvdWNoSUQpIHtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgbXVsdGktdG91Y2ggYm91bmNpbmdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGFzdFRvdWNoUG9zKSByZXR1cm47XG5cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIGxhc3RUb3VjaFRpbWU7XG4gICAgICAgIGxldCB7IHg6IGxhc3RYLCB5OiBsYXN0WSB9ID0gbGFzdFRvdWNoUG9zO1xuICAgICAgICBsZXQgeyB4OiBjdXJYLCB5OiBjdXJZIH0gPSBsYXN0VG91Y2hQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMTsgLy8gZml4IEluZmluaXR5IGVycm9yXG5cbiAgICAgICAgbW92ZVZlbG9jaXR5LnggPSAobGFzdFggLSBjdXJYKSAvIGR1cmF0aW9uO1xuICAgICAgICBtb3ZlVmVsb2NpdHkueSA9IChsYXN0WSAtIGN1clkpIC8gZHVyYXRpb247XG5cbiAgICAgICAgbGV0IGRlc3RYID0gcGlja0luUmFuZ2UobGFzdFggLSBjdXJYICsgb2Zmc2V0LngsIDAsIGxpbWl0LngpO1xuICAgICAgICBsZXQgZGVzdFkgPSBwaWNrSW5SYW5nZShsYXN0WSAtIGN1clkgKyBvZmZzZXQueSwgMCwgbGltaXQueSk7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihkZXN0WCwgZGVzdFkpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3RvdWNoZW5kJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lnbm9yZUV2ZW50KGV2dCkgfHwgdGhpcy5fX2lzRHJhZykgcmV0dXJuO1xuXG4gICAgICAgIC8vIHJlbGVhc2UgY3VycmVudCB0b3VjaFxuICAgICAgICBkZWxldGUgdG91Y2hSZWNvcmRzW2xhc3RUb3VjaElEXTtcbiAgICAgICAgbGFzdFRvdWNoSUQgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgbGV0IHsgeCwgeSB9ID0gbW92ZVZlbG9jaXR5O1xuXG4gICAgICAgIHRoaXMuX19zZXRNb3ZlbWVudChcbiAgICAgICAgICAgIHggPyB4IC8gTWF0aC5hYnMoeCkgKiBNYXRoLnNxcnQoTWF0aC5hYnMoeCkgKiAxZTMpICogMjAgOiAwLFxuICAgICAgICAgICAgeSA/IHkgLyBNYXRoLmFicyh5KSAqIE1hdGguc3FydChNYXRoLmFicyh5KSAqIDFlMykgKiAyMCA6IDBcbiAgICAgICAgKTtcblxuICAgICAgICBtb3ZlVmVsb2NpdHkueCA9IG1vdmVWZWxvY2l0eS55ID0gMDtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX190b3VjaEhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fdG91Y2hIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvdG91Y2guanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX21vdXNlSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0UG9zaXRpb24sIGdldFRvdWNoSUQsIHBpY2tJblJhbmdlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIE1vdXNlIGV2ZW50IGhhbmRsZXJzIGJ1aWxkZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uXG4gKi9cbmxldCBfX21vdXNlSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG4gICAgbGV0IGlzTW91c2VEb3duLCBpc01vdXNlTW92ZSwgc3RhcnRPZmZzZXRUb1RodW1iLCBzdGFydFRyYWNrRGlyZWN0aW9uLCBjb250YWluZXJSZWN0O1xuXG4gICAgbGV0IGdldFRyYWNrRGlyID0gKGNsYXNzTmFtZSkgPT4ge1xuICAgICAgICBsZXQgbWF0Y2hlcyA9IGNsYXNzTmFtZS5tYXRjaCgvc2Nyb2xsYmFyXFwtKD86dHJhY2t8dGh1bWIpXFwtKFt4eV0pLyk7XG5cbiAgICAgICAgcmV0dXJuIG1hdGNoZXMgJiYgbWF0Y2hlc1sxXTtcbiAgICB9O1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2NsaWNrJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoaXNNb3VzZU1vdmUgfHwgIS9zY3JvbGxiYXItdHJhY2svLnRlc3QoZXZ0LnRhcmdldC5jbGFzc05hbWUpIHx8IHRoaXMuX19pZ25vcmVFdmVudChldnQpKSByZXR1cm47XG5cbiAgICAgICAgbGV0IHRyYWNrID0gZXZ0LnRhcmdldDtcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IGdldFRyYWNrRGlyKHRyYWNrLmNsYXNzTmFtZSk7XG4gICAgICAgIGxldCByZWN0ID0gdHJhY2suZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCBjbGlja1BvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICAgICAgY29uc3QgeyBzaXplLCBvZmZzZXQgfSA9IHRoaXM7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3gnKSB7XG4gICAgICAgICAgICAvLyB1c2UgcGVyY2VudGFnZSB2YWx1ZVxuICAgICAgICAgICAgbGV0IHRodW1iU2l6ZSA9IHBpY2tJblJhbmdlKHNpemUuY29udGFpbmVyLndpZHRoIC8gc2l6ZS5jb250ZW50LndpZHRoLCAwLCAxKTtcbiAgICAgICAgICAgIGxldCBjbGlja09mZnNldCA9IChjbGlja1Bvcy54IC0gcmVjdC5sZWZ0KSAvIHNpemUuY29udGFpbmVyLndpZHRoO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fX3NldE1vdmVtZW50KFxuICAgICAgICAgICAgICAgIChjbGlja09mZnNldCAtIHRodW1iU2l6ZSAvIDIpICogc2l6ZS5jb250ZW50LndpZHRoIC0gb2Zmc2V0LngsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aHVtYlNpemUgPSBwaWNrSW5SYW5nZShzaXplLmNvbnRhaW5lci5oZWlnaHQgLyBzaXplLmNvbnRlbnQuaGVpZ2h0LCAwLCAxKTtcbiAgICAgICAgbGV0IGNsaWNrT2Zmc2V0ID0gKGNsaWNrUG9zLnkgLSByZWN0LnRvcCkgLyBzaXplLmNvbnRhaW5lci5oZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIChjbGlja09mZnNldCAtIHRodW1iU2l6ZSAvIDIpICogc2l6ZS5jb250ZW50LmhlaWdodCAtIG9mZnNldC55XG4gICAgICAgICk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAnbW91c2Vkb3duJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIS9zY3JvbGxiYXItdGh1bWIvLnRlc3QoZXZ0LnRhcmdldC5jbGFzc05hbWUpIHx8IHRoaXMuX19pZ25vcmVFdmVudChldnQpKSByZXR1cm47XG4gICAgICAgIGlzTW91c2VEb3duID0gdHJ1ZTtcblxuICAgICAgICBsZXQgY3Vyc29yUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcbiAgICAgICAgbGV0IHRodW1iUmVjdCA9IGV2dC50YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgc3RhcnRUcmFja0RpcmVjdGlvbiA9IGdldFRyYWNrRGlyKGV2dC50YXJnZXQuY2xhc3NOYW1lKTtcblxuICAgICAgICAvLyBwb2ludGVyIG9mZnNldCB0byB0aHVtYlxuICAgICAgICBzdGFydE9mZnNldFRvVGh1bWIgPSB7XG4gICAgICAgICAgICB4OiBjdXJzb3JQb3MueCAtIHRodW1iUmVjdC5sZWZ0LFxuICAgICAgICAgICAgeTogY3Vyc29yUG9zLnkgLSB0aHVtYlJlY3QudG9wXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gY29udGFpbmVyIGJvdW5kaW5nIHJlY3RhbmdsZVxuICAgICAgICBjb250YWluZXJSZWN0ID0gdGhpcy50YXJnZXRzLmNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNNb3VzZURvd24pIHJldHVybjtcblxuICAgICAgICBpc01vdXNlTW92ZSA9IHRydWU7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGxldCB7IHNpemUsIG9mZnNldCB9ID0gdGhpcztcbiAgICAgICAgbGV0IGN1cnNvclBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICAgICAgaWYgKHN0YXJ0VHJhY2tEaXJlY3Rpb24gPT09ICd4Jykge1xuICAgICAgICAgICAgLy8gZ2V0IHBlcmNlbnRhZ2Ugb2YgcG9pbnRlciBwb3NpdGlvbiBpbiB0cmFja1xuICAgICAgICAgICAgLy8gdGhlbiB0cmFuZm9ybSB0byBweFxuICAgICAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAoY3Vyc29yUG9zLnggLSBzdGFydE9mZnNldFRvVGh1bWIueCAtIGNvbnRhaW5lclJlY3QubGVmdCkgLyAoY29udGFpbmVyUmVjdC5yaWdodCAtIGNvbnRhaW5lclJlY3QubGVmdCkgKiBzaXplLmNvbnRlbnQud2lkdGgsXG4gICAgICAgICAgICAgICAgb2Zmc2V0LnlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvbid0IG5lZWQgZWFzaW5nXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oXG4gICAgICAgICAgICBvZmZzZXQueCxcbiAgICAgICAgICAgIChjdXJzb3JQb3MueSAtIHN0YXJ0T2Zmc2V0VG9UaHVtYi55IC0gY29udGFpbmVyUmVjdC50b3ApIC8gKGNvbnRhaW5lclJlY3QuYm90dG9tIC0gY29udGFpbmVyUmVjdC50b3ApICogc2l6ZS5jb250ZW50LmhlaWdodFxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gcmVsZWFzZSBtb3VzZW1vdmUgc3B5IG9uIHdpbmRvdyBsb3N0IGZvY3VzXG4gICAgdGhpcy5fX2FkZEV2ZW50KHdpbmRvdywgJ21vdXNldXAgYmx1cicsICgpID0+IHtcbiAgICAgICAgaXNNb3VzZURvd24gPSBpc01vdXNlTW92ZSA9IGZhbHNlO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX21vdXNlSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19tb3VzZUhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9tb3VzZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fd2hlZWxIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXREZWx0YSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8vIGlzIHN0YW5kYXJkIGB3aGVlbGAgZXZlbnQgc3VwcG9ydGVkIGNoZWNrXG5jb25zdCBXSEVFTF9FVkVOVCA9ICdvbndoZWVsJyBpbiB3aW5kb3cgPyAnd2hlZWwnIDogJ21vdXNld2hlZWwnO1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogV2hlZWwgZXZlbnQgaGFuZGxlciBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufTogZXZlbnQgaGFuZGxlclxuICovXG5sZXQgX193aGVlbEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgV0hFRUxfRVZFTlQsIChldnQpID0+IHtcbiAgICAgICAgaWYgKGV2dC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBjb25zdCB7IG9mZnNldCwgbGltaXQgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGRlbHRhID0gZ2V0RGVsdGEoZXZ0KTtcblxuICAgICAgICB0aGlzLl9fYWRkTW92ZW1lbnQoZGVsdGEueCwgZGVsdGEueSk7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fd2hlZWxIYW5kbGVyJywge1xuICAgIHZhbHVlOiBfX3doZWVsSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3doZWVsLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19yZXNpemVIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogV2hlZWwgZXZlbnQgaGFuZGxlciBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufTogZXZlbnQgaGFuZGxlclxuICovXG5sZXQgX19yZXNpemVIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fX2FkZEV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuX191cGRhdGVUaHJvdHRsZSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVzaXplSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19yZXNpemVIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvcmVzaXplLmpzXG4gKiovIiwiLyoqXHJcbiAqIEBtb2R1bGVcclxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2VsZWN0SGFuZGxlclxyXG4gKi9cclxuXHJcbiBpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcclxuIGltcG9ydCB7XHJcbiAgICBnZXRPcmlnaW5hbEV2ZW50LFxyXG4gICAgZ2V0UG9zaXRpb24sXHJcbiAgICBnZXRUb3VjaElELFxyXG4gICAgcGlja0luUmFuZ2UsXHJcbiAgICBzZXRTdHlsZVxyXG59IGZyb20gJy4uL3V0aWxzL2luZGV4JztcclxuXHJcbiBleHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcclxuXHJcbi8vIHRvZG86IHNlbGVjdCBoYW5kbGVyIGZvciB0b3VjaCBzY3JlZW5cclxuIGxldCBfX3NlbGVjdEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcclxuICAgIGxldCBpc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICBsZXQgYW5pbWF0aW9uID0gdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IHsgY29udGFpbmVyLCBjb250ZW50IH0gPSB0aGlzLnRhcmdldHM7XHJcblxyXG4gICAgbGV0IHNjcm9sbCA9ICh7IHgsIHkgfSkgPT4ge1xyXG4gICAgICAgIGlmICgheCAmJiAheSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoeCwgeSk7XHJcblxyXG4gICAgICAgIGFuaW1hdGlvbiA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHNjcm9sbCh7IHgsIHkgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxldCBzZXRTZWxlY3QgPSAodmFsdWUgPSAnJykgPT4ge1xyXG4gICAgICAgIHNldFN0eWxlKGNvbnRhaW5lciwge1xyXG4gICAgICAgICAgICAnLXVzZXItc2VsZWN0JzogdmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fX2FkZEV2ZW50KHdpbmRvdywgJ21vdXNlbW92ZScsIChldnQpID0+IHtcclxuICAgICAgICBpZiAoIWlzU2VsZWN0ZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcclxuXHJcbiAgICAgICAgY29uc3QgZGlyID0gdGhpcy5fX2dldFBvaW50ZXJUcmVuZChldnQpO1xyXG5cclxuICAgICAgICBzY3JvbGwoZGlyKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudChjb250ZW50LCAnc2VsZWN0c3RhcnQnLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTZWxlY3QoJ25vbmUnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMuX191cGRhdGVCb3VuZGluZygpO1xyXG4gICAgICAgIGlzU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fX2FkZEV2ZW50KHdpbmRvdywgJ21vdXNldXAgYmx1cicsICgpID0+IHtcclxuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xyXG4gICAgICAgIHNldFNlbGVjdCgpO1xyXG5cclxuICAgICAgICBpc1NlbGVjdGVkID0gZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyB0ZW1wIHBhdGNoIGZvciB0b3VjaCBkZXZpY2VzXHJcbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGFpbmVyLCAnc2Nyb2xsJywgKGV2dCkgPT4ge1xyXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBjb250YWluZXIuc2Nyb2xsTGVmdCA9IDA7XHJcbiAgICB9KTtcclxuIH07XHJcblxyXG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3NlbGVjdEhhbmRsZXInLCB7XHJcbiAgICAgdmFsdWU6IF9fc2VsZWN0SGFuZGxlcixcclxuICAgICB3cml0YWJsZTogdHJ1ZSxcclxuICAgICBjb25maWd1cmFibGU6IHRydWVcclxuIH0pO1xyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvc2VsZWN0LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19rZXlib2FyZEhhbmRsZXJcbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50LCBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLy8ga2V5IG1hcHMgW2RlbHRhWCwgZGVsdGFZXVxuY29uc3QgS0VZTUFQUyA9IHtcbiAgICAzMjogWzAsIDVdLCAgIC8vIHNwYWNlXG4gICAgMzc6IFstMSwgMF0sICAvLyBsZWZ0XG4gICAgMzg6IFswLCAtMV0sICAvLyB1cFxuICAgIDM5OiBbMSwgMF0sICAgLy8gcmlnaHRcbiAgICA0MDogWzAsIDFdICAgIC8vIGRvd25cbn07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBLZXlwcmVzcyBldmVudCBoYW5kbGVyIGJ1aWxkZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uXG4gKi9cbmxldCBfX2tleWJvYXJkSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG4gICAgbGV0IGlzRm9jdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgICBpc0ZvY3VzZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgIGlzRm9jdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ2tleWRvd24nLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICghaXNGb2N1c2VkKSByZXR1cm47XG5cbiAgICAgICAgZXZ0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgICAgIGNvbnN0IGtleUNvZGUgPSBldnQua2V5Q29kZSB8fCBldnQud2hpY2g7XG5cbiAgICAgICAgaWYgKCFLRVlNQVBTLmhhc093blByb3BlcnR5KGtleUNvZGUpKSByZXR1cm47XG5cbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgeyBzcGVlZCB9ID0gdGhpcy5vcHRpb25zO1xuICAgICAgICBjb25zdCBbeCwgeV0gPSBLRVlNQVBTW2tleUNvZGVdO1xuXG4gICAgICAgIHRoaXMuX19hZGRNb3ZlbWVudCh4ICogNDAsIHkgKiA0MCk7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fa2V5Ym9hcmRIYW5kbGVyJywge1xuICAgIHZhbHVlOiBfX2tleWJvYXJkSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2tleWJvYXJkLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfZ2V0SXRlcmF0b3IgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvclwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfaXNJdGVyYWJsZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvaXMtaXRlcmFibGVcIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7XG4gICAgdmFyIF9hcnIgPSBbXTtcbiAgICB2YXIgX24gPSB0cnVlO1xuICAgIHZhciBfZCA9IGZhbHNlO1xuICAgIHZhciBfZSA9IHVuZGVmaW5lZDtcblxuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBfaSA9IF9nZXRJdGVyYXRvcihhcnIpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuXG4gICAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kID0gdHJ1ZTtcbiAgICAgIF9lID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kKSB0aHJvdyBfZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2FycjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9IGVsc2UgaWYgKF9pc0l0ZXJhYmxlKE9iamVjdChhcnIpKSkge1xuICAgICAgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG4gICAgfVxuICB9O1xufSkoKTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvc2xpY2VkLXRvLWFycmF5LmpzXG4gKiogbW9kdWxlIGlkID0gMTI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vaXMtaXRlcmFibGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvaXMtaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMjlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5pcy1pdGVyYWJsZScpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vaXMtaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMzBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjbGFzc29mICAgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuY29yZScpLmlzSXRlcmFibGUgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPID0gT2JqZWN0KGl0KTtcbiAgcmV0dXJuIE9bSVRFUkFUT1JdICE9PSB1bmRlZmluZWRcbiAgICB8fCAnQEBpdGVyYXRvcicgaW4gT1xuICAgIHx8IEl0ZXJhdG9ycy5oYXNPd25Qcm9wZXJ0eShjbGFzc29mKE8pKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSAxMzFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vcmVhZG9ubHknO1xuZXhwb3J0ICogZnJvbSAnLi9hZGRfZXZlbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9pZ25vcmVfZXZlbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9pbml0X3Njcm9sbGJhcic7XG5leHBvcnQgKiBmcm9tICcuL2dldF9kZWx0YV9saW1pdCc7XG5leHBvcnQgKiBmcm9tICcuL3VwZGF0ZV9jaGlsZHJlbic7XG5leHBvcnQgKiBmcm9tICcuL3VwZGF0ZV9ib3VuZGluZyc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9wb2ludGVyX3RyZW5kJztcbmV4cG9ydCAqIGZyb20gJy4vc2V0X3RodW1iX3Bvc2l0aW9uJztcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fcmVhZG9ubHlcbiAqIEBkZXBlbmRlbmNpZXMgWyBTbW9vdGhTY3JvbGxiYXIgXVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogY3JlYXRlIHJlYWRvbmx5IHByb3BlcnR5XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7QW55fSB2YWx1ZVxuICovXG5mdW5jdGlvbiBfX3JlYWRvbmx5KHByb3AsIHZhbHVlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wLCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVhZG9ubHknLCB7XG4gICAgdmFsdWU6IF9fcmVhZG9ubHksXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9yZWFkb25seS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fYWRkRXZlbnRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fYWRkRXZlbnQoZWxlbSwgZXZlbnRzLCBmbikge1xuICAgIGlmICghZWxlbSB8fCB0eXBlb2YgZWxlbS5hZGRFdmVudExpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGV4cGVjdCBlbGVtIHRvIGJlIGEgRE9NIGVsZW1lbnQsIGJ1dCBnb3QgJHtlbGVtfWApO1xuICAgIH1cblxuICAgIGV2ZW50cy5zcGxpdCgvXFxzKy9nKS5mb3JFYWNoKChldnQpID0+IHtcbiAgICAgICAgdGhpcy5fX2hhbmRsZXJzLnB1c2goeyBldnQsIGVsZW0sIGZuIH0pO1xuXG4gICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihldnQsIGZuKTtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19hZGRFdmVudCcsIHtcbiAgICB2YWx1ZTogX19hZGRFdmVudCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9hZGRfZXZlbnQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2lnbm9yZUV2ZW50XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX19pZ25vcmVFdmVudChldnQgPSB7fSkge1xuICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBnZXRPcmlnaW5hbEV2ZW50KGV2dCk7XG5cbiAgICBpZiAoIXRhcmdldCB8fCB0YXJnZXQgPT09IHdpbmRvdyB8fCAhdGhpcy5jaGlsZHJlbikgcmV0dXJuIGZhbHNlO1xuXG4gICAgcmV0dXJuICghZXZ0LnR5cGUubWF0Y2goL2RyYWcvKSAmJiBldnQuZGVmYXVsdFByZXZlbnRlZCl8fFxuICAgICAgICB0aGlzLmNoaWxkcmVuLnNvbWUoKHNiKSA9PiBzYi5jb250YWlucyh0YXJnZXQpKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19pZ25vcmVFdmVudCcsIHtcbiAgICB2YWx1ZTogX19pZ25vcmVFdmVudCxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9pZ25vcmVfZXZlbnQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2luaXRTY3JvbGxiYXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIGluaXRpYWxpemUgc2Nyb2xsYmFyXG4gKlxuICogVGhpcyBtZXRob2Qgd2lsbCBhdHRhY2ggc2V2ZXJhbCBsaXN0ZW5lcnMgdG8gZWxlbWVudHNcbiAqIGFuZCBjcmVhdGUgYSBkZXN0cm95IG1ldGhvZCB0byByZW1vdmUgbGlzdGVuZXJzXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbjogYXMgaXMgZXhwbGFpbmVkIGluIGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIF9faW5pdFNjcm9sbGJhcigpIHtcbiAgICB0aGlzLnVwZGF0ZSgpOyAvLyBpbml0aWFsaXplIHRodW1iIHBvc2l0aW9uXG5cbiAgICB0aGlzLl9fa2V5Ym9hcmRIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3Jlc2l6ZUhhbmRsZXIoKTtcbiAgICB0aGlzLl9fc2VsZWN0SGFuZGxlcigpO1xuICAgIHRoaXMuX19tb3VzZUhhbmRsZXIoKTtcbiAgICB0aGlzLl9fdG91Y2hIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3doZWVsSGFuZGxlcigpO1xuICAgIHRoaXMuX19kcmFnSGFuZGxlcigpO1xuXG4gICAgdGhpcy5fX3JlbmRlcigpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2luaXRTY3JvbGxiYXInLCB7XG4gICAgdmFsdWU6IF9faW5pdFNjcm9sbGJhcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2luaXRfc2Nyb2xsYmFyLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19nZXREZWx0YUxpbWl0XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2dldERlbHRhTGltaXQoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvZmZzZXQsXG4gICAgICAgIGxpbWl0XG4gICAgfSA9IHRoaXM7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBbLW9mZnNldC54LCBsaW1pdC54IC0gb2Zmc2V0LnhdLFxuICAgICAgICB5OiBbLW9mZnNldC55LCBsaW1pdC55IC0gb2Zmc2V0LnldXG4gICAgfTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19nZXREZWx0YUxpbWl0Jywge1xuICAgIHZhbHVlOiBfX2dldERlbHRhTGltaXQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvZ2V0X2RlbHRhX2xpbWl0LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX191cGRhdGVDaGlsZHJlblxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2VsZWN0b3JzIH0gZnJvbSAnLi4vc2hhcmVkL3NlbGVjdG9ycyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX3VwZGF0ZUNoaWxkcmVuKCkge1xuICAgIHRoaXMuX19yZWFkb25seSgnY2hpbGRyZW4nLCBbLi4udGhpcy50YXJnZXRzLmNvbnRlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpXSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fdXBkYXRlQ2hpbGRyZW4nLCB7XG4gICAgdmFsdWU6IF9fdXBkYXRlQ2hpbGRyZW4sXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy91cGRhdGVfY2hpbGRyZW4uanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3VwZGF0ZUJvdW5kaW5nXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBzZWxlY3RvcnMgfSBmcm9tICcuLi9zaGFyZWQvc2VsZWN0b3JzJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fdXBkYXRlQm91bmRpbmcoKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcbiAgICBjb25zdCB7IHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCB9ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHsgaW5uZXJIZWlnaHQsIGlubmVyV2lkdGggfSA9IHdpbmRvdztcblxuICAgIHRoaXMuX19yZWFkb25seSgnYm91bmRpbmcnLCB7XG4gICAgICAgIHRvcDogTWF0aC5tYXgodG9wLCAwKSxcbiAgICAgICAgcmlnaHQ6IE1hdGgubWluKHJpZ2h0LCBpbm5lcldpZHRoKSxcbiAgICAgICAgYm90dG9tOiBNYXRoLm1pbihib3R0b20sIGlubmVySGVpZ2h0KSxcbiAgICAgICAgbGVmdDpNYXRoLm1heChsZWZ0LCAwKVxuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3VwZGF0ZUJvdW5kaW5nJywge1xuICAgIHZhbHVlOiBfX3VwZGF0ZUJvdW5kaW5nLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2JvdW5kaW5nLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19nZXRQb2ludGVyVHJlbmRcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IGdldFBvc2l0aW9uIH0gZnJvbSAnLi4vdXRpbHMvJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fZ2V0UG9pbnRlclRyZW5kKGV2dCwgZWRnZSA9IDApIHtcbiAgICBjb25zdCB7IHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdCB9ID0gdGhpcy5ib3VuZGluZztcbiAgICBjb25zdCB7IHgsIHkgfSA9IGdldFBvc2l0aW9uKGV2dCk7XG5cbiAgICBjb25zdCByZXMgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDBcbiAgICB9O1xuXG4gICAgaWYgKHggPT09IDAgJiYgeSA9PT0gMCkgcmV0dXJuIHJlcztcblxuICAgIGlmICh4ID4gcmlnaHQgLSBlZGdlKSB7XG4gICAgICAgIHJlcy54ID0gKHggLSByaWdodCArIGVkZ2UpO1xuICAgIH0gZWxzZSBpZiAoeCA8IGxlZnQgKyBlZGdlKSB7XG4gICAgICAgIHJlcy54ID0gKHggLSBsZWZ0IC0gZWRnZSk7XG4gICAgfVxuXG4gICAgaWYgKHkgPiBib3R0b20gLSBlZGdlKSB7XG4gICAgICAgIHJlcy55ID0gKHkgLSBib3R0b20gKyBlZGdlKTtcbiAgICB9IGVsc2UgaWYgKHkgPCB0b3AgKyBlZGdlKSB7XG4gICAgICAgIHJlcy55ID0gKHkgLSB0b3AgLSBlZGdlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2dldFBvaW50ZXJUcmVuZCcsIHtcbiAgICB2YWx1ZTogX19nZXRQb2ludGVyVHJlbmQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvZ2V0X3BvaW50ZXJfdHJlbmQuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3NldFRodW1iUG9zaXRpb25cbiAqL1xuXG5pbXBvcnQgeyBzZXRTdHlsZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFNldCB0aHVtYiBwb3NpdGlvbiBpbiB0cmFja1xuICovXG5mdW5jdGlvbiBfX3NldFRodW1iUG9zaXRpb24oKSB7XG4gICAgbGV0IHsgeCwgeSB9ID0gdGhpcy5vZmZzZXQ7XG4gICAgbGV0IHsgeEF4aXMsIHlBeGlzIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBsZXQgc3R5bGVYID0gYHRyYW5zbGF0ZTNkKCR7eCAvIHRoaXMuc2l6ZS5jb250ZW50LndpZHRoICogdGhpcy5zaXplLmNvbnRhaW5lci53aWR0aH1weCwgMCwgMClgO1xuICAgIGxldCBzdHlsZVkgPSBgdHJhbnNsYXRlM2QoMCwgJHt5IC8gdGhpcy5zaXplLmNvbnRlbnQuaGVpZ2h0ICogdGhpcy5zaXplLmNvbnRhaW5lci5oZWlnaHR9cHgsIDApYDtcblxuICAgIHNldFN0eWxlKHhBeGlzLnRodW1iLCB7XG4gICAgICAgICctd2Via2l0LXRyYW5zZm9ybSc6IHN0eWxlWCxcbiAgICAgICAgJ3RyYW5zZm9ybSc6IHN0eWxlWFxuICAgIH0pO1xuXG4gICAgc2V0U3R5bGUoeUF4aXMudGh1bWIsIHtcbiAgICAgICAgJy13ZWJraXQtdHJhbnNmb3JtJzogc3R5bGVZLFxuICAgICAgICAndHJhbnNmb3JtJzogc3R5bGVZXG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fc2V0VGh1bWJQb3NpdGlvbicsIHtcbiAgICB2YWx1ZTogX19zZXRUaHVtYlBvc2l0aW9uLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvc2V0X3RodW1iX3Bvc2l0aW9uLmpzXG4gKiovIiwiaW1wb3J0IFNjcm9sbGJhciBmcm9tICcuLi8uLi9zcmMvJztcbmltcG9ydCB7IERFRkFVTFRfT1BUSU9OUyB9IGZyb20gJy4uLy4uL3NyYy9zaGFyZWQvJztcblxuY29uc3QgRFBSID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG5jb25zdCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TKTtcblxuY29uc3Qgc2l6ZSA9IHtcbiAgICB3aWR0aDogMjUwLFxuICAgIGhlaWdodDogMTUwXG59O1xuXG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJldmlldycpO1xuY29uc3Qgc2Nyb2xsYmFyID0gU2Nyb2xsYmFyLmdldChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpKTtcbmNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5jYW52YXMud2lkdGggPSBzaXplLndpZHRoICogRFBSO1xuY2FudmFzLmhlaWdodCA9IHNpemUuaGVpZ2h0ICogRFBSO1xuY3R4LnNjYWxlKERQUiwgRFBSKTtcblxuY3R4LnN0cm9rZVN0eWxlID0gJyM5NGE2YjcnO1xuY3R4LmZpbGxTdHlsZSA9ICcjYWJjJztcblxubGV0IHNob3VsZFVwZGF0ZSA9IHRydWU7XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoIXNob3VsZFVwZGF0ZSkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgfVxuXG4gICAgbGV0IGRvdHMgPSBjYWxjRG90cygpO1xuXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG5cbiAgICBsZXQgc2NhbGVYID0gKHNpemUud2lkdGggLyBkb3RzLmxlbmd0aCkgKiAob3B0aW9ucy5zcGVlZCAvIDIwICsgMC41KTtcbiAgICBkb3RzLmZvckVhY2goKFt4LCB5XSkgPT4ge1xuICAgICAgICBjdHgubGluZVRvKHggKiBzY2FsZVgsIHkpO1xuICAgIH0pO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgbGV0IFt4LCB5XSA9IGRvdHNbZG90cy5sZW5ndGggLSAxXTtcbiAgICBjdHgubGluZVRvKHggKiBzY2FsZVgsIHkpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBzaG91bGRVcGRhdGUgPSBmYWxzZTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xufTtcblxucmVuZGVyKCk7XG5cbmZ1bmN0aW9uIGNhbGNEb3RzKCkge1xuICAgIGxldCB7XG4gICAgICAgIHNwZWVkLFxuICAgICAgICBmcmljdG9uXG4gICAgfSA9IG9wdGlvbnM7XG5cbiAgICBsZXQgZG90cyA9IFtdO1xuXG4gICAgbGV0IHggPSAwO1xuICAgIGxldCB5ID0gKHNwZWVkIC8gMjAgKyAwLjUpICogc2l6ZS5oZWlnaHQ7XG5cbiAgICB3aGlsZSh5ID4gMC4xKSB7XG4gICAgICAgIGRvdHMucHVzaChbeCwgeV0pO1xuXG4gICAgICAgIHkgKj0gKDEgLSBmcmljdG9uIC8gMTAwKTtcbiAgICAgICAgeCsrO1xuICAgIH1cblxuICAgIHJldHVybiBkb3RzO1xufTtcblxuWy4uLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vcHRpb25zJyldLmZvckVhY2goKGVsKSA9PiB7XG4gICAgY29uc3QgcHJvcCA9IGVsLm5hbWU7XG4gICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAub3B0aW9uLSR7cHJvcH1gKTtcblxuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgKCkgPT4ge1xuICAgICAgICBsYWJlbC50ZXh0Q29udGVudCA9IG9wdGlvbnNbcHJvcF0gPSBwYXJzZUZsb2F0KGVsLnZhbHVlKTtcbiAgICAgICAgc2Nyb2xsYmFyLnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG4gICAgfSk7XG59KTtcblxucmVuZGVyKCk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L3NjcmlwdHMvcHJldmlldy5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=