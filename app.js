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
	
	__webpack_require__(141);

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
	                handler.apply(this, [].slice.call(arguments));
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
	
	    fillText('k: ' + k.toFixed(2), [size.width / 2, 0], {
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
	        duration = current - lastTime,
	        velocity = (offset - lastOffset) / duration;
	
	    if (!duration || offset === lastOffset) return;
	
	    if (duration > 50) {
	        reduceAmount += duration - 1;
	    }
	
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
	addEvent([].slice.call(document.querySelectorAll('.chart-type')), 'change', function () {
	    if (this.checked) {
	        chartType = this.value;
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
	
	var _shared = __webpack_require__(102);
	
	__webpack_require__(104);
	
	__webpack_require__(160);
	
	__webpack_require__(116);
	
	__webpack_require__(128);
	
	exports['default'] = _smooth_scrollbar.SmoothScrollbar;
	
	_smooth_scrollbar.SmoothScrollbar.version = '4.1.0';
	
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
	
	var _shared = __webpack_require__(102);
	
	var _utils = __webpack_require__(77);
	
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
/* 58 */,
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @export {Map} sbList
	 */
	
	"use strict";
	
	var _Map = __webpack_require__(60)["default"];
	
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
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(61), __esModule: true };

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(62);
	__webpack_require__(19);
	__webpack_require__(63);
	__webpack_require__(68);
	__webpack_require__(75);
	module.exports = __webpack_require__(10).Map;

/***/ },
/* 62 */
/***/ function(module, exports) {



/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(64);
	var Iterators = __webpack_require__(30);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(65)
	  , step             = __webpack_require__(66)
	  , Iterators        = __webpack_require__(30)
	  , toIObject        = __webpack_require__(67);
	
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
/* 65 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 66 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(55)
	  , defined = __webpack_require__(6);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(69);
	
	// 23.1 Map Objects
	__webpack_require__(74)('Map', function(get){
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
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $            = __webpack_require__(26)
	  , hide         = __webpack_require__(25)
	  , redefineAll  = __webpack_require__(70)
	  , ctx          = __webpack_require__(11)
	  , strictNew    = __webpack_require__(71)
	  , defined      = __webpack_require__(6)
	  , forOf        = __webpack_require__(72)
	  , $iterDefine  = __webpack_require__(22)
	  , step         = __webpack_require__(66)
	  , ID           = __webpack_require__(35)('id')
	  , $has         = __webpack_require__(29)
	  , isObject     = __webpack_require__(39)
	  , setSpecies   = __webpack_require__(73)
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
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var redefine = __webpack_require__(24);
	module.exports = function(target, src){
	  for(var key in src)redefine(target, key, src[key]);
	  return target;
	};

/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};

/***/ },
/* 72 */
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
/* 73 */
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
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(26)
	  , global         = __webpack_require__(9)
	  , $export        = __webpack_require__(8)
	  , fails          = __webpack_require__(13)
	  , hide           = __webpack_require__(25)
	  , redefineAll    = __webpack_require__(70)
	  , forOf          = __webpack_require__(72)
	  , strictNew      = __webpack_require__(71)
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
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(8);
	
	$export($export.P, 'Map', {toJSON: __webpack_require__(76)('Map')});

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var forOf   = __webpack_require__(72)
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
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(78)['default'];
	
	var _interopExportWildcard = __webpack_require__(88)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _debounce = __webpack_require__(89);
	
	_defaults(exports, _interopExportWildcard(_debounce, _defaults));
	
	var _set_style = __webpack_require__(90);
	
	_defaults(exports, _interopExportWildcard(_set_style, _defaults));
	
	var _get_delta = __webpack_require__(91);
	
	_defaults(exports, _interopExportWildcard(_get_delta, _defaults));
	
	var _find_child = __webpack_require__(93);
	
	_defaults(exports, _interopExportWildcard(_find_child, _defaults));
	
	var _build_curve = __webpack_require__(97);
	
	_defaults(exports, _interopExportWildcard(_build_curve, _defaults));
	
	var _get_touch_id = __webpack_require__(98);
	
	_defaults(exports, _interopExportWildcard(_get_touch_id, _defaults));
	
	var _get_position = __webpack_require__(100);
	
	_defaults(exports, _interopExportWildcard(_get_position, _defaults));
	
	var _pick_in_range = __webpack_require__(101);
	
	_defaults(exports, _interopExportWildcard(_pick_in_range, _defaults));
	
	var _get_pointer_data = __webpack_require__(99);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_data, _defaults));
	
	var _get_original_event = __webpack_require__(92);
	
	_defaults(exports, _interopExportWildcard(_get_original_event, _defaults));

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$getOwnPropertyNames = __webpack_require__(79)["default"];
	
	var _Object$getOwnPropertyDescriptor = __webpack_require__(83)["default"];
	
	var _Object$defineProperty = __webpack_require__(86)["default"];
	
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
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(80), __esModule: true };

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	__webpack_require__(81);
	module.exports = function getOwnPropertyNames(it){
	  return $.getNames(it);
	};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 Object.getOwnPropertyNames(O)
	__webpack_require__(7)('getOwnPropertyNames', function(){
	  return __webpack_require__(82).get;
	});

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(67)
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
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(84), __esModule: true };

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	__webpack_require__(85);
	module.exports = function getOwnPropertyDescriptor(it, key){
	  return $.getDesc(it, key);
	};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	var toIObject = __webpack_require__(67);
	
	__webpack_require__(7)('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
	  return function getOwnPropertyDescriptor(it, key){
	    return $getOwnPropertyDescriptor(toIObject(it), key);
	  };
	});

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(87), __esModule: true };

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(26);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 88 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj, defaults) {
	  var newObj = defaults({}, obj);
	  delete newObj["default"];
	  return newObj;
	};
	
	exports.__esModule = true;

/***/ },
/* 89 */
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
/* 90 */
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
	        var cssProp = prop.replace(/-([a-z])/g, function (m, $1) {
	            return $1.toUpperCase();
	        });
	        elem.style[cssProp] = styles[prop];
	    });
	};
	exports.setStyle = setStyle;

/***/ },
/* 91 */
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
	
	var _get_original_event = __webpack_require__(92);
	
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
/* 92 */
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
/* 93 */
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
	
	var _getIterator = __webpack_require__(94)["default"];
	
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
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(95), __esModule: true };

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(63);
	__webpack_require__(19);
	module.exports = __webpack_require__(96);

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(38)
	  , get      = __webpack_require__(42);
	module.exports = __webpack_require__(10).getIterator = function(it){
	  var iterFn = get(it);
	  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};

/***/ },
/* 97 */
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
/* 98 */
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
	
	var _get_original_event = __webpack_require__(92);
	
	var _get_pointer_data = __webpack_require__(99);
	
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
/* 99 */
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
	
	var _get_original_event = __webpack_require__(92);
	
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
/* 100 */
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
	
	var _get_original_event = __webpack_require__(92);
	
	var _get_pointer_data = __webpack_require__(99);
	
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
/* 101 */
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
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(78)['default'];
	
	var _interopExportWildcard = __webpack_require__(88)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _sb_list = __webpack_require__(59);
	
	_defaults(exports, _interopExportWildcard(_sb_list, _defaults));
	
	var _options = __webpack_require__(142);
	
	_defaults(exports, _interopExportWildcard(_options, _defaults));
	
	var _selectors = __webpack_require__(103);
	
	_defaults(exports, _interopExportWildcard(_selectors, _defaults));

/***/ },
/* 103 */
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
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(78)['default'];
	
	var _interopExportWildcard = __webpack_require__(88)['default'];
	
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
	
	var _utils = __webpack_require__(77);
	
	var _shared = __webpack_require__(102);
	
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
	
	var _utils = __webpack_require__(77);
	
	var _shared = __webpack_require__(102);
	
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
	
	var _defaults = __webpack_require__(78)['default'];
	
	var _interopExportWildcard = __webpack_require__(88)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _drag = __webpack_require__(117);
	
	_defaults(exports, _interopExportWildcard(_drag, _defaults));
	
	var _touch = __webpack_require__(118);
	
	_defaults(exports, _interopExportWildcard(_touch, _defaults));
	
	var _mouse = __webpack_require__(119);
	
	_defaults(exports, _interopExportWildcard(_mouse, _defaults));
	
	var _wheel = __webpack_require__(120);
	
	_defaults(exports, _interopExportWildcard(_wheel, _defaults));
	
	var _resize = __webpack_require__(121);
	
	_defaults(exports, _interopExportWildcard(_resize, _defaults));
	
	var _select = __webpack_require__(122);
	
	_defaults(exports, _interopExportWildcard(_select, _defaults));
	
	var _keyboard = __webpack_require__(123);
	
	_defaults(exports, _interopExportWildcard(_keyboard, _defaults));

/***/ },
/* 117 */
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
/* 118 */
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
	
	        if (Math.abs(destX - offset.x) < 1 && Math.abs(destY - offset.y) < 1) {
	            return _this.__updateThrottle();
	        }
	
	        evt.preventDefault();
	
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
/* 119 */
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
/* 120 */
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
/* 121 */
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
/* 122 */
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __keyboardHandler
	 */
	
	'use strict';
	
	var _slicedToArray = __webpack_require__(124)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(77);
	
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
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _getIterator = __webpack_require__(94)["default"];
	
	var _isIterable = __webpack_require__(125)["default"];
	
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
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(126), __esModule: true };

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(63);
	__webpack_require__(19);
	module.exports = __webpack_require__(127);

/***/ },
/* 127 */
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
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(78)['default'];
	
	var _interopExportWildcard = __webpack_require__(88)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _readonly = __webpack_require__(130);
	
	_defaults(exports, _interopExportWildcard(_readonly, _defaults));
	
	var _add_event = __webpack_require__(131);
	
	_defaults(exports, _interopExportWildcard(_add_event, _defaults));
	
	var _ignore_event = __webpack_require__(132);
	
	_defaults(exports, _interopExportWildcard(_ignore_event, _defaults));
	
	var _init_scrollbar = __webpack_require__(135);
	
	_defaults(exports, _interopExportWildcard(_init_scrollbar, _defaults));
	
	var _get_delta_limit = __webpack_require__(159);
	
	_defaults(exports, _interopExportWildcard(_get_delta_limit, _defaults));
	
	var _update_children = __webpack_require__(137);
	
	_defaults(exports, _interopExportWildcard(_update_children, _defaults));
	
	var _update_bounding = __webpack_require__(138);
	
	_defaults(exports, _interopExportWildcard(_update_bounding, _defaults));
	
	var _get_pointer_trend = __webpack_require__(143);
	
	_defaults(exports, _interopExportWildcard(_get_pointer_trend, _defaults));
	
	var _set_thumb_position = __webpack_require__(140);
	
	_defaults(exports, _interopExportWildcard(_set_thumb_position, _defaults));

/***/ },
/* 129 */,
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __readonly
	 * @dependencies [ SmoothScrollbar ]
	 */
	
	'use strict';
	
	var _Object$defineProperty = __webpack_require__(86)['default'];
	
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
/* 131 */
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
/* 132 */
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
	
	var _utilsIndex = __webpack_require__(77);
	
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
/* 133 */,
/* 134 */,
/* 135 */
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
/* 136 */,
/* 137 */
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
	
	var _sharedSelectors = __webpack_require__(103);
	
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
/* 138 */
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
	
	var _sharedSelectors = __webpack_require__(103);
	
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
/* 139 */,
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @module
	 * @prototype {Function} __setThumbPosition
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _utilsIndex = __webpack_require__(77);
	
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
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = __webpack_require__(124)['default'];
	
	var _toConsumableArray = __webpack_require__(16)['default'];
	
	var _Object$assign = __webpack_require__(51)['default'];
	
	var _interopRequireDefault = __webpack_require__(14)['default'];
	
	var _src = __webpack_require__(15);
	
	var _src2 = _interopRequireDefault(_src);
	
	var _srcShared = __webpack_require__(102);
	
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

/***/ },
/* 142 */
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
	
	var _utils = __webpack_require__(77);
	
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
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */
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
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _defaults = __webpack_require__(78)['default'];
	
	var _interopExportWildcard = __webpack_require__(88)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _render = __webpack_require__(161);
	
	_defaults(exports, _interopExportWildcard(_render, _defaults));
	
	var _add_movement = __webpack_require__(162);
	
	_defaults(exports, _interopExportWildcard(_add_movement, _defaults));
	
	var _set_movement = __webpack_require__(163);
	
	_defaults(exports, _interopExportWildcard(_set_movement, _defaults));

/***/ },
/* 161 */
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
/* 162 */
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
	
	var _utils = __webpack_require__(77);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __addMovement() {
	    var deltaX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	    var deltaY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var options = this.options;
	    var movement = this.movement;
	
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
/* 163 */
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
	
	var _utils = __webpack_require__(77);
	
	var _smooth_scrollbar = __webpack_require__(46);
	
	exports.SmoothScrollbar = _smooth_scrollbar.SmoothScrollbar;
	
	function __setMovement() {
	    var deltaX = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	    var deltaY = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var options = this.options;
	    var movement = this.movement;
	
	    var limit = this.__getDeltaLimit();
	
	    movement.x = _utils.pickInRange.apply(undefined, [deltaX * options.speed].concat(_toConsumableArray(limit.x)));
	    movement.y = _utils.pickInRange.apply(undefined, [deltaY * options.speed].concat(_toConsumableArray(limit.y)));
	};
	
	Object.defineProperty(_smooth_scrollbar.SmoothScrollbar.prototype, '__setMovement', {
	    value: __setMovement,
	    writable: true,
	    configurable: true
	});

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjNkYmRlYzU1ODAzMmU5NDdhZjgiLCJ3ZWJwYWNrOi8vLy4vdGVzdC9zY3JpcHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qva2V5cy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1vYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LXNhcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmV4cG9ydC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvcmUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jdHguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZmFpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1yZXF1aXJlLWRlZmF1bHQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW50ZWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnJlZGVmaW5lLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGlkZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucHJvcGVydHktZGVzYy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlc2NyaXB0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaGFzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlcmF0b3JzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnNoYXJlZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnVpZC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItY2FsbC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlzLWFycmF5LWl0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY2xhc3NvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvZi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItZGV0ZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9zbW9vdGhfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2NsYXNzLWNhbGwtY2hlY2suanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2ZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQub2JqZWN0LWFzc2lnbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlvYmplY3QuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9zYl9saXN0LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1zdGVwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW9iamVjdC5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS1hbGwuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zdHJpY3QtbmV3LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZm9yLW9mLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXNwZWNpZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdldC1uYW1lcy5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1leHBvcnQtd2lsZGNhcmQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2RlYm91bmNlLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9zZXRfc3R5bGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2dldF9kZWx0YS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X29yaWdpbmFsX2V2ZW50LmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9maW5kX2NoaWxkLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9idWlsZF9jdXJ2ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZ2V0X3RvdWNoX2lkLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfcG9pbnRlcl9kYXRhLmpzIiwid2VicGFjazovLy8uL3NyYy91dGlscy9nZXRfcG9zaXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL3BpY2tfaW5fcmFuZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NoYXJlZC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2hhcmVkL3NlbGVjdG9ycy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy91cGRhdGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvZGVzdHJveS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfc2l6ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9saXN0ZW5lci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9zY3JvbGxfdG8uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvc2V0X3Bvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL2V4dGVuZHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvdG9nZ2xlX3RyYWNrLmpzIiwid2VicGFjazovLy8uL3NyYy9hcGlzL2luZmluaXRlX3Njcm9sbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9nZXRfY29udGVudF9lbGVtLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9kcmFnLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvdG91Y2guanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V2ZW50cy9tb3VzZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXZlbnRzL3doZWVsLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvcmVzaXplLmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMvc2VsZWN0LmpzIiwid2VicGFjazovLy8uL3NyYy9ldmVudHMva2V5Ym9hcmQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvc2xpY2VkLXRvLWFycmF5LmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlLmpzIiwid2VicGFjazovLy8uL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9pcy1pdGVyYWJsZS5qcyIsIndlYnBhY2s6Ly8vLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmlzLWl0ZXJhYmxlLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ludGVybmFscy9yZWFkb25seS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2FkZF9ldmVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2lnbm9yZV9ldmVudC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2luaXRfc2Nyb2xsYmFyLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2NoaWxkcmVuLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2JvdW5kaW5nLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvc2V0X3RodW1iX3Bvc2l0aW9uLmpzIiwid2VicGFjazovLy8uL3Rlc3Qvc2NyaXB0cy9wcmV2aWV3LmpzIiwid2VicGFjazovLy8uL3NyYy9zaGFyZWQvb3B0aW9ucy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW50ZXJuYWxzL2dldF9wb2ludGVyX3RyZW5kLmpzIiwid2VicGFjazovLy8uL3NyYy9pbnRlcm5hbHMvZ2V0X2RlbHRhX2xpbWl0LmpzIiwid2VicGFjazovLy8uL3NyYy9yZW5kZXIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9yZW5kZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9hZGRfbW92ZW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlci9zZXRfbW92ZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7OztxQkN0Q08sQ0FBVzs7cUJBQ1gsR0FBVyxFOzs7Ozs7Ozs7Ozs7Z0NDREksRUFBWTs7OztBQUVsQyxLQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7QUFDcEMsS0FBTSxjQUFjLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQzs7QUFFaEMsS0FBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuRCxLQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQy9DLEtBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0MsS0FBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztB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QUFlLEVBQUU7QUFDOUQsVUFBSyxFQUFFLGFBQWE7QUFDcEIsYUFBUSxFQUFFLElBQUk7QUFDZCxpQkFBWSxFQUFFLElBQUk7RUFDckIsQ0FBQyxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tDQ3JCMEIsRUFBVzs7NkNBQ1AsRUFBcUI7O1NBRTVDLGVBQWU7O0FBRXhCLFVBQVMsYUFBYSxHQUF5QjtTQUF4QixNQUFNLHlEQUFHLENBQUM7U0FBRSxNQUFNLHlEQUFHLENBQUM7U0FFckMsT0FBTyxHQUVQLElBQUksQ0FGSixPQUFPO1NBQ1AsUUFBUSxHQUNSLElBQUksQ0FESixRQUFROztBQUdaLFNBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7QUFFbkMsYUFBUSxDQUFDLENBQUMsR0FBRyxxQ0FBWSxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssNEJBQUssS0FBSyxDQUFDLENBQUMsR0FBQyxDQUFDO0FBQzdELGFBQVEsQ0FBQyxDQUFDLEdBQUcscUNBQVksTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLDRCQUFLLEtBQUssQ0FBQyxDQUFDLEdBQUMsQ0FBQztFQUNoRSxDQUFDOztBQUVGLE9BQU0sQ0FBQyxjQUFjLENBQUMsa0NBQWdCLFNBQVMsRUFBRSxlQUFlLEVBQUU7QUFDOUQsVUFBSyxFQUFFLGFBQWE7QUFDcEIsYUFBUSxFQUFFLElBQUk7QUFDZCxpQkFBWSxFQUFFLElBQUk7RUFDckIsQ0FBQyxDIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgZjNkYmRlYzU1ODAzMmU5NDdhZjhcbiAqKi8iLCJpbXBvcnQgJy4vbW9uaXRvcic7XG5pbXBvcnQgJy4vcHJldmlldyc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi90ZXN0L3NjcmlwdHMvaW5kZXguanNcbiAqKi8iLCJpbXBvcnQgU2Nyb2xsYmFyIGZyb20gJy4uLy4uL3NyYy8nO1xuXG5jb25zdCBEUFIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbmNvbnN0IFRJTUVfUkFOR0VfTUFYID0gMjAgKiAxZTM7XG5cbmNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpO1xuY29uc3QgdGh1bWIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGh1bWInKTtcbmNvbnN0IHRyYWNrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RyYWNrJyk7XG5jb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnQnKTtcbmNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5sZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5kaXYuaW5uZXJIVE1MID0gQXJyYXkoMTAxKS5qb2luKCc8cD5Mb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRXhwZWRpdGEgZWFxdWUgZGViaXRpcywgZG9sb3JlbSBkb2xvcmlidXMsIHZvbHVwdGF0aWJ1cyBtaW5pbWEgaWxsbyBlc3QsIGF0cXVlIGFsaXF1aWQgaXBzdW0gbmVjZXNzaXRhdGlidXMgY3VtcXVlIHZlcml0YXRpcyBiZWF0YWUsIHJhdGlvbmUgcmVwdWRpYW5kYWUgcXVvcyEgT21uaXMgaGljLCBhbmltaS48L3A+Jyk7XG5cbmNvbnRlbnQuYXBwZW5kQ2hpbGQoZGl2KTtcblxuU2Nyb2xsYmFyLmluaXRBbGwoKTtcblxuY29uc3Qgc2Nyb2xsYmFyID0gU2Nyb2xsYmFyLmdldChjb250ZW50KTtcblxubGV0IGNoYXJ0VHlwZSA9ICdvZmZzZXQnO1xuXG5sZXQgdGh1bWJXaWR0aCA9IDBcbmxldCBlbmRPZmZzZXQgPSAwO1xuXG5sZXQgdGltZVJhbmdlID0gNSAqIDFlMztcblxubGV0IHJlY29yZHMgPSBbXTtcbmxldCBzaXplID0ge1xuICAgIHdpZHRoOiAzMDAsXG4gICAgaGVpZ2h0OiAyMDBcbn07XG5cbmxldCBzaG91bGRVcGRhdGUgPSB0cnVlO1xuXG5sZXQgdGFuZ2VudFBvaW50ID0gbnVsbDtcbmxldCB0YW5nZW50UG9pbnRQcmUgPSBudWxsO1xuXG5sZXQgaG92ZXJMb2NrZWQgPSBmYWxzZTtcbmxldCBob3ZlclBvaW50ZXJYID0gdW5kZWZpbmVkO1xubGV0IHBvaW50ZXJEb3duT25UcmFjayA9IHVuZGVmaW5lZDtcbmxldCBob3ZlclByZWNpc2lvbiA9ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50ID8gNSA6IDE7XG5cbmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiBEUFI7XG5jYW52YXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKiBEUFI7XG5jdHguc2NhbGUoRFBSLCBEUFIpO1xuXG5mdW5jdGlvbiBhZGRFdmVudChlbGVtcywgZXZ0cywgaGFuZGxlcikge1xuICAgIGV2dHMuc3BsaXQoL1xccysvKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgW10uY29uY2F0KGVsZW1zKS5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICAgICAgICAgICAgICBzaG91bGRVcGRhdGUgPSB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gc2xpY2VSZWNvcmQoKSB7XG4gICAgbGV0IGVuZElkeCA9IE1hdGguZmxvb3IocmVjb3Jkcy5sZW5ndGggKiAoMSAtIGVuZE9mZnNldCkpO1xuICAgIGxldCBsYXN0ID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCBkcm9wSWR4ID0gMDtcblxuICAgIGxldCByZXN1bHQgPSByZWNvcmRzLmZpbHRlcihmdW5jdGlvbihwdCwgaWR4KSB7XG4gICAgICAgIGlmIChsYXN0LnRpbWUgLSBwdC50aW1lID4gVElNRV9SQU5HRV9NQVgpIHtcbiAgICAgICAgICAgIGRyb3BJZHgrKztcbiAgICAgICAgICAgIGVuZElkeC0tO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVuZCA9IHJlY29yZHNbZW5kSWR4IC0gMV07XG5cbiAgICAgICAgcmV0dXJuIGVuZC50aW1lIC0gcHQudGltZSA8PSB0aW1lUmFuZ2UgJiYgaWR4IDw9IGVuZElkeDtcbiAgICB9KTtcblxuICAgIHJlY29yZHMuc3BsaWNlKDAsIGRyb3BJZHgpO1xuICAgIHRodW1iV2lkdGggPSByZXN1bHQubGVuZ3RoID8gcmVzdWx0Lmxlbmd0aCAvIHJlY29yZHMubGVuZ3RoIDogMTtcblxuICAgIHRodW1iLnN0eWxlLndpZHRoID0gdGh1bWJXaWR0aCAqIDEwMCArICclJztcbiAgICB0aHVtYi5zdHlsZS5yaWdodCA9IGVuZE9mZnNldCAqIDEwMCArICclJztcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5mdW5jdGlvbiBnZXRMaW1pdChwb2ludHMpIHtcbiAgICByZXR1cm4gcG9pbnRzLnJlZHVjZShmdW5jdGlvbihwcmUsIGN1cikge1xuICAgICAgICBsZXQgdmFsID0gY3VyW2NoYXJ0VHlwZV07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtYXg6IE1hdGgubWF4KHByZS5tYXgsIHZhbCksXG4gICAgICAgICAgICBtaW46IE1hdGgubWluKHByZS5taW4sIHZhbClcbiAgICAgICAgfTtcbiAgICB9LCB7IG1heDogLUluZmluaXR5LCBtaW46IEluZmluaXR5IH0pO1xufTtcblxuZnVuY3Rpb24gYXNzaWduUHJvcHMocHJvcHMpIHtcbiAgICBpZiAoIXByb3BzKSByZXR1cm47XG5cbiAgICBPYmplY3Qua2V5cyhwcm9wcykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGN0eFtuYW1lXSA9IHByb3BzW25hbWVdO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZHJhd0xpbmUocDAsIHAxLCBvcHRpb25zKSB7XG4gICAgbGV0IHgwID0gcDBbMF0sXG4gICAgICAgIHkwID0gcDBbMV0sXG4gICAgICAgIHgxID0gcDFbMF0sXG4gICAgICAgIHkxID0gcDFbMV07XG5cbiAgICBhc3NpZ25Qcm9wcyhvcHRpb25zLnByb3BzKTtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAtMSwgMCwgc2l6ZS5oZWlnaHQpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc2V0TGluZURhc2gob3B0aW9ucy5kYXNoZWQgPyBvcHRpb25zLmRhc2hlZCA6IFtdKTtcbiAgICBjdHgubW92ZVRvKHgwLCB5MCk7XG4gICAgY3R4LmxpbmVUbyh4MSwgeTEpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKVxufTtcblxuZnVuY3Rpb24gYWRqdXN0VGV4dChjb250ZW50LCBwLCBvcHRpb25zKSB7XG4gICAgbGV0IHggPSBwWzBdLFxuICAgICAgICB5ID0gcFsxXTtcblxuICAgIGxldCB3aWR0aCA9IGN0eC5tZWFzdXJlVGV4dChjb250ZW50KS53aWR0aDtcblxuICAgIGlmICh4ICsgd2lkdGggPiBzaXplLndpZHRoKSB7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICAgIH0gZWxzZSBpZiAoeCAtIHdpZHRoIDwgMCkge1xuICAgICAgICBjdHgudGV4dEFsaWduID0gJ2xlZnQnO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSBvcHRpb25zLnRleHRBbGlnbjtcbiAgICB9XG5cbiAgICBjdHguZmlsbFRleHQoY29udGVudCwgeCwgLXkpO1xufTtcblxuZnVuY3Rpb24gZmlsbFRleHQoY29udGVudCwgcCwgb3B0aW9ucykge1xuICAgIGFzc2lnblByb3BzKG9wdGlvbnMucHJvcHMpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIDEsIDAsIHNpemUuaGVpZ2h0KTtcbiAgICBhZGp1c3RUZXh0KGNvbnRlbnQsIHAsIG9wdGlvbnMpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG59O1xuXG5mdW5jdGlvbiBkcmF3TWFpbigpIHtcbiAgICBsZXQgcG9pbnRzID0gc2xpY2VSZWNvcmQoKTtcbiAgICBpZiAoIXBvaW50cy5sZW5ndGgpIHJldHVybjtcblxuICAgIGxldCBsaW1pdCA9IGdldExpbWl0KHBvaW50cyk7XG5cbiAgICBsZXQgc3RhcnQgPSBwb2ludHNbMF07XG4gICAgbGV0IGVuZCA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV07XG5cbiAgICBsZXQgdG90YWxYID0gdGh1bWJXaWR0aCA9PT0gMSA/IHRpbWVSYW5nZSA6IGVuZC50aW1lIC0gc3RhcnQudGltZTtcbiAgICBsZXQgdG90YWxZID0gKGxpbWl0Lm1heCAtIGxpbWl0Lm1pbikgfHwgMTtcblxuICAgIGxldCBncmQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgc2l6ZS5oZWlnaHQsIDAsIDApO1xuICAgIGdyZC5hZGRDb2xvclN0b3AoMCwgJ3JnYigxNzAsIDIxNSwgMjU1KScpO1xuICAgIGdyZC5hZGRDb2xvclN0b3AoMSwgJ3JnYmEoMTcwLCAyMTUsIDI1NSwgMC4yKScpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBzaXplLmhlaWdodCk7XG5cbiAgICBjdHgubGluZVdpZHRoID0gMTtcbiAgICBjdHguZmlsbFN0eWxlID0gZ3JkO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZ2IoNjQsIDE2NSwgMjU1KSc7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5tb3ZlVG8oMCwgMCk7XG5cbiAgICBsZXQgbGFzdFBvaW50ID0gcG9pbnRzLnJlZHVjZShmdW5jdGlvbihwcmUsIGN1ciwgaWR4KSB7XG4gICAgICAgIGxldCB0aW1lID0gY3VyLnRpbWUsXG4gICAgICAgICAgICB2YWx1ZSA9IGN1cltjaGFydFR5cGVdO1xuICAgICAgICBsZXQgeCA9ICh0aW1lIC0gc3RhcnQudGltZSkgLyB0b3RhbFggKiBzaXplLndpZHRoLFxuICAgICAgICAgICAgeSA9ICh2YWx1ZSAtIGxpbWl0Lm1pbikgLyB0b3RhbFkgKiAoc2l6ZS5oZWlnaHQgLSAyMCk7XG5cbiAgICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcblxuICAgICAgICBpZiAoaG92ZXJQb2ludGVyWCAmJiBNYXRoLmFicyhob3ZlclBvaW50ZXJYIC0geCkgPCBob3ZlclByZWNpc2lvbikge1xuICAgICAgICAgICAgdGFuZ2VudFBvaW50ID0ge1xuICAgICAgICAgICAgICAgIGNvb3JkOiBbeCwgeV0sXG4gICAgICAgICAgICAgICAgcG9pbnQ6IGN1clxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGFuZ2VudFBvaW50UHJlID0ge1xuICAgICAgICAgICAgICAgIGNvb3JkOiBwcmUsXG4gICAgICAgICAgICAgICAgcG9pbnQ6IHBvaW50c1tpZHggLSAxXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbeCwgeV07XG4gICAgfSwgW10pO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5saW5lVG8obGFzdFBvaW50WzBdLCAwKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgZHJhd0xpbmUoWzAsIGxhc3RQb2ludFsxXV0sIGxhc3RQb2ludCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgc3Ryb2tlU3R5bGU6ICcjZjYwJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmaWxsVGV4dCgn4oaZJyArIGxpbWl0Lm1pbi50b0ZpeGVkKDIpLCBbMCwgMF0sIHtcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGZpbGxTdHlsZTogJyMwMDAnLFxuICAgICAgICAgICAgdGV4dEFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJzEycHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGZpbGxUZXh0KGVuZFtjaGFydFR5cGVdLnRvRml4ZWQoMiksIGxhc3RQb2ludCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnI2Y2MCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJzE2cHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZHJhd1RhbmdlbnRMaW5lKCkge1xuICAgIGxldCBjb29yZCA9IHRhbmdlbnRQb2ludC5jb29yZCxcbiAgICAgICAgY29vcmRQcmUgPSB0YW5nZW50UG9pbnRQcmUuY29vcmQ7XG5cbiAgICBsZXQgayA9IChjb29yZFsxXSAtIGNvb3JkUHJlWzFdKSAvIChjb29yZFswXSAtIGNvb3JkUHJlWzBdKSB8fCAwO1xuICAgIGxldCBiID0gY29vcmRbMV0gLSBrICogY29vcmRbMF07XG5cbiAgICBkcmF3TGluZShbMCwgYl0sIFtzaXplLndpZHRoLCBrICogc2l6ZS53aWR0aCArIGJdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBsaW5lV2lkdGg6IDEsXG4gICAgICAgICAgICBzdHJva2VTdHlsZTogJyNmMDAnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZpbGxUZXh0KCdrOiAnICsgay50b0ZpeGVkKDIpLCBbc2l6ZS53aWR0aCAvIDIsIDBdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAgICAgICB0ZXh0QmFzZWxpbmU6ICdib3R0b20nLFxuICAgICAgICAgICAgZm9udDogJ2JvbGQgMTJweCBzYW5zLXNlcmlmJ1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5mdW5jdGlvbiBkcmF3SG92ZXIoKSB7XG4gICAgaWYgKCF0YW5nZW50UG9pbnQpIHJldHVybjtcblxuICAgIGRyYXdUYW5nZW50TGluZSgpO1xuXG4gICAgbGV0IGNvb3JkID0gdGFuZ2VudFBvaW50LmNvb3JkLFxuICAgICAgICBwb2ludCA9IHRhbmdlbnRQb2ludC5wb2ludDtcblxuICAgIGxldCBjb29yZFN0eWxlID0ge1xuICAgICAgICBkYXNoZWQ6IFs4LCA0XSxcbiAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMSxcbiAgICAgICAgICAgIHN0cm9rZVN0eWxlOiAncmdiKDY0LCAxNjUsIDI1NSknXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZHJhd0xpbmUoWzAsIGNvb3JkWzFdXSwgW3NpemUud2lkdGgsIGNvb3JkWzFdXSwgY29vcmRTdHlsZSk7XG4gICAgZHJhd0xpbmUoW2Nvb3JkWzBdLCAwXSwgW2Nvb3JkWzBdLCBzaXplLmhlaWdodF0sIGNvb3JkU3R5bGUpO1xuXG4gICAgbGV0IGRhdGUgPSBuZXcgRGF0ZShwb2ludC50aW1lICsgcG9pbnQucmVkdWNlKTtcblxuICAgIGxldCBwb2ludEluZm8gPSBbXG4gICAgICAgICcoJyxcbiAgICAgICAgZGF0ZS5nZXRNaW51dGVzKCksXG4gICAgICAgICc6JyxcbiAgICAgICAgZGF0ZS5nZXRTZWNvbmRzKCksXG4gICAgICAgICcuJyxcbiAgICAgICAgZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSxcbiAgICAgICAgJywgJyxcbiAgICAgICAgcG9pbnRbY2hhcnRUeXBlXS50b0ZpeGVkKDIpLFxuICAgICAgICAnKSdcbiAgICBdLmpvaW4oJycpO1xuXG4gICAgZmlsbFRleHQocG9pbnRJbmZvLCBjb29yZCwge1xuICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgZmlsbFN0eWxlOiAnIzAwMCcsXG4gICAgICAgICAgICB0ZXh0QWxpZ246ICdsZWZ0JyxcbiAgICAgICAgICAgIHRleHRCYXNlbGluZTogJ2JvdHRvbScsXG4gICAgICAgICAgICBmb250OiAnYm9sZCAxMnB4IHNhbnMtc2VyaWYnXG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICBpZiAoIXNob3VsZFVwZGF0ZSkgcmV0dXJuIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcblxuICAgIGZpbGxUZXh0KGNoYXJ0VHlwZS50b1VwcGVyQ2FzZSgpLCBbMCwgc2l6ZS5oZWlnaHRdLCB7XG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjAwJyxcbiAgICAgICAgICAgIHRleHRBbGlnbjogJ2xlZnQnLFxuICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAndG9wJyxcbiAgICAgICAgICAgIGZvbnQ6ICdib2xkIDE0cHggc2Fucy1zZXJpZidcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZHJhd01haW4oKTtcbiAgICBkcmF3SG92ZXIoKTtcblxuICAgIGlmIChob3ZlckxvY2tlZCkge1xuICAgICAgICBmaWxsVGV4dCgnTE9DS0VEJywgW3NpemUud2lkdGgsIHNpemUuaGVpZ2h0XSwge1xuICAgICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgICAgICBmaWxsU3R5bGU6ICcjZjAwJyxcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdyaWdodCcsXG4gICAgICAgICAgICAgICAgdGV4dEJhc2VsaW5lOiAndG9wJyxcbiAgICAgICAgICAgICAgICBmb250OiAnYm9sZCAxNHB4IHNhbnMtc2VyaWYnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGN0eC5yZXN0b3JlKCk7XG5cbiAgICBzaG91bGRVcGRhdGUgPSBmYWxzZTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xufTtcblxucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbmxldCBsYXN0VGltZSA9IERhdGUubm93KCksXG4gICAgbGFzdE9mZnNldCA9IDAsXG4gICAgcmVkdWNlQW1vdW50ID0gMDtcblxuc2Nyb2xsYmFyLmFkZExpc3RlbmVyKGZ1bmN0aW9uKCkge1xuICAgIGxldCBjdXJyZW50ID0gRGF0ZS5ub3coKSxcbiAgICAgICAgb2Zmc2V0ID0gc2Nyb2xsYmFyLm9mZnNldC55LFxuICAgICAgICBkdXJhdGlvbiA9IGN1cnJlbnQgLSBsYXN0VGltZSxcbiAgICAgICAgdmVsb2NpdHkgPSAob2Zmc2V0IC0gbGFzdE9mZnNldCkgLyBkdXJhdGlvbjtcblxuICAgIGlmICghZHVyYXRpb24gfHwgb2Zmc2V0ID09PSBsYXN0T2Zmc2V0KSByZXR1cm47XG5cbiAgICBpZiAoZHVyYXRpb24gPiA1MCkge1xuICAgICAgICByZWR1Y2VBbW91bnQgKz0gKGR1cmF0aW9uIC0gMSk7XG4gICAgfVxuXG4gICAgbGFzdFRpbWUgPSBjdXJyZW50O1xuICAgIGxhc3RPZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICByZWNvcmRzLnB1c2goe1xuICAgICAgICB0aW1lOiBjdXJyZW50IC0gcmVkdWNlQW1vdW50LFxuICAgICAgICByZWR1Y2U6IHJlZHVjZUFtb3VudCxcbiAgICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICAgIHNwZWVkOiBNYXRoLmFicyh2ZWxvY2l0eSlcbiAgICB9KTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IHRydWU7XG59KTtcblxuZnVuY3Rpb24gZ2V0UG9pbnRlcihlKSB7XG4gICAgcmV0dXJuIGUudG91Y2hlcyA/IGUudG91Y2hlc1tlLnRvdWNoZXMubGVuZ3RoIC0gMV0gOiBlO1xufTtcblxuLy8gcmFuZ2VcbmxldCBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkdXJhdGlvbicpO1xubGV0IGxhYmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2R1cmF0aW9uLXZhbHVlJyk7XG5pbnB1dC5tYXggPSBUSU1FX1JBTkdFX01BWCAvIDFlMztcbmlucHV0Lm1pbiA9IDE7XG5pbnB1dC52YWx1ZSA9IHRpbWVSYW5nZSAvIDFlMztcbmxhYmVsLnRleHRDb250ZW50ID0gaW5wdXQudmFsdWUgKyAncyc7XG5cbmFkZEV2ZW50KGlucHV0LCAnaW5wdXQnLCBmdW5jdGlvbihlKSB7XG4gICAgbGV0IHN0YXJ0ID0gcmVjb3Jkc1swXTtcbiAgICBsZXQgZW5kID0gcmVjb3Jkc1tyZWNvcmRzLmxlbmd0aCAtIDFdO1xuICAgIGxldCB2YWwgPSBwYXJzZUZsb2F0KGUudGFyZ2V0LnZhbHVlKTtcbiAgICBsYWJlbC50ZXh0Q29udGVudCA9IHZhbCArICdzJztcbiAgICB0aW1lUmFuZ2UgPSB2YWwgKiAxZTM7XG4gICAgZW5kT2Zmc2V0ID0gTWF0aC5taW4oZW5kT2Zmc2V0LCBNYXRoLm1heCgwLCAxIC0gdGltZVJhbmdlIC8gKGVuZC50aW1lIC0gc3RhcnQudGltZSkpKTtcbn0pO1xuXG5hZGRFdmVudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQnKSwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgcmVjb3Jkcy5sZW5ndGggPSBlbmRPZmZzZXQgPSByZWR1Y2VBbW91bnQgPSAwO1xuICAgIGhvdmVyTG9ja2VkID0gZmFsc2U7XG4gICAgaG92ZXJQb2ludGVyWCA9IHVuZGVmaW5lZDtcbiAgICB0YW5nZW50UG9pbnQgPSBudWxsO1xuICAgIHRhbmdlbnRQb2ludFByZSA9IG51bGw7XG4gICAgc2xpY2VSZWNvcmQoKTtcbn0pO1xuXG4vLyBob3ZlclxuYWRkRXZlbnQoY2FudmFzLCAnbW91c2Vtb3ZlIHRvdWNobW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoaG92ZXJMb2NrZWQgfHwgcG9pbnRlckRvd25PblRyYWNrKSByZXR1cm47XG5cbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG5cbiAgICBob3ZlclBvaW50ZXJYID0gcG9pbnRlci5jbGllbnRYIC0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XG59KTtcblxuZnVuY3Rpb24gcmVzZXRIb3ZlcigpIHtcbiAgICBob3ZlclBvaW50ZXJYID0gMDtcbiAgICB0YW5nZW50UG9pbnQgPSBudWxsO1xuICAgIHRhbmdlbnRQb2ludFByZSA9IG51bGw7XG59O1xuXG5hZGRFdmVudChbY2FudmFzLCB3aW5kb3ddLCAnbW91c2VsZWF2ZSB0b3VjaGVuZCcsIGZ1bmN0aW9uKCkge1xuICAgIGlmIChob3ZlckxvY2tlZCkgcmV0dXJuO1xuICAgIHJlc2V0SG92ZXIoKTtcbn0pO1xuXG5hZGRFdmVudChjYW52YXMsICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIGhvdmVyTG9ja2VkID0gIWhvdmVyTG9ja2VkO1xuXG4gICAgaWYgKCFob3ZlckxvY2tlZCkgcmVzZXRIb3ZlcigpO1xufSk7XG5cbi8vIHRyYWNrXG5hZGRFdmVudCh0aHVtYiwgJ21vdXNlZG93biB0b3VjaHN0YXJ0JywgZnVuY3Rpb24oZSkge1xuICAgIGxldCBwb2ludGVyID0gZ2V0UG9pbnRlcihlKTtcbiAgICBwb2ludGVyRG93bk9uVHJhY2sgPSBwb2ludGVyLmNsaWVudFg7XG59KTtcblxuYWRkRXZlbnQod2luZG93LCAnbW91c2Vtb3ZlIHRvdWNobW92ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoIXBvaW50ZXJEb3duT25UcmFjaykgcmV0dXJuO1xuXG4gICAgbGV0IHBvaW50ZXIgPSBnZXRQb2ludGVyKGUpO1xuICAgIGxldCBtb3ZlZCA9IChwb2ludGVyLmNsaWVudFggLSBwb2ludGVyRG93bk9uVHJhY2spIC8gc2l6ZS53aWR0aDtcblxuICAgIHBvaW50ZXJEb3duT25UcmFjayA9IHBvaW50ZXIuY2xpZW50WDtcbiAgICBlbmRPZmZzZXQgPSBNYXRoLm1pbigxIC0gdGh1bWJXaWR0aCwgTWF0aC5tYXgoMCwgZW5kT2Zmc2V0IC0gbW92ZWQpKTtcbn0pO1xuXG5hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIHRvdWNoZW5kIGJsdXInLCBmdW5jdGlvbihlKSB7XG4gICAgcG9pbnRlckRvd25PblRyYWNrID0gdW5kZWZpbmVkO1xufSk7XG5cbmFkZEV2ZW50KHRodW1iLCAnY2xpY2sgdG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xufSk7XG5cbmFkZEV2ZW50KHRyYWNrLCAnY2xpY2sgdG91Y2hzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICBsZXQgcG9pbnRlciA9IGdldFBvaW50ZXIoZSk7XG4gICAgbGV0IHJlY3QgPSB0cmFjay5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBsZXQgb2Zmc2V0ID0gKHBvaW50ZXIuY2xpZW50WCAtIHJlY3QubGVmdCkgLyByZWN0LndpZHRoO1xuICAgIGVuZE9mZnNldCA9IE1hdGgubWluKDEgLSB0aHVtYldpZHRoLCBNYXRoLm1heCgwLCAxIC0gKG9mZnNldCArIHRodW1iV2lkdGggLyAyKSkpO1xufSk7XG5cbi8vIHN3aXRjaCBjaGFydFxuYWRkRXZlbnQoXG4gICAgW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hhcnQtdHlwZScpKSxcbiAgICAnY2hhbmdlJyxcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCkge1xuICAgICAgICAgICAgY2hhcnRUeXBlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cbik7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9tb25pdG9yLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmtleXMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5PYmplY3Qua2V5cztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9rZXlzLmpzXG4gKiogbW9kdWxlIGlkID0gM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2tleXMnLCBmdW5jdGlvbigka2V5cyl7XG4gIHJldHVybiBmdW5jdGlvbiBrZXlzKGl0KXtcbiAgICByZXR1cm4gJGtleXModG9PYmplY3QoaXQpKTtcbiAgfTtcbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmtleXMuanNcbiAqKiBtb2R1bGUgaWQgPSA0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZWZpbmVkLmpzXG4gKiogbW9kdWxlIGlkID0gNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgZmFpbHMgICA9IHJlcXVpcmUoJy4vJC5mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVksIGV4ZWMpe1xuICB2YXIgZm4gID0gKGNvcmUuT2JqZWN0IHx8IHt9KVtLRVldIHx8IE9iamVjdFtLRVldXG4gICAgLCBleHAgPSB7fTtcbiAgZXhwW0tFWV0gPSBleGVjKGZuKTtcbiAgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiBmYWlscyhmdW5jdGlvbigpeyBmbigxKTsgfSksICdPYmplY3QnLCBleHApO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3Qtc2FwLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgSVNfV1JBUCAgID0gdHlwZSAmICRleHBvcnQuV1xuICAgICwgZXhwb3J0cyAgID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSlcbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGtleSwgb3duLCBvdXQ7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbihDKXtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24ocGFyYW0pe1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEMgPyBuZXcgQyhwYXJhbSkgOiBDKHBhcmFtKTtcbiAgICAgIH07XG4gICAgICBGW1BST1RPVFlQRV0gPSBDW1BST1RPVFlQRV07XG4gICAgICByZXR1cm4gRjtcbiAgICAvLyBtYWtlIHN0YXRpYyB2ZXJzaW9ucyBmb3IgcHJvdG90eXBlIG1ldGhvZHNcbiAgICB9KShvdXQpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgaWYoSVNfUFJPVE8pKGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pKVtrZXldID0gb3V0O1xuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7IC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAvLyB3cmFwXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZXhwb3J0LmpzXG4gKiogbW9kdWxlIGlkID0gOFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qc1xuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzEuMi42J307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb3JlLmpzXG4gKiogbW9kdWxlIGlkID0gMTBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qc1xuICoqIG1vZHVsZSBpZCA9IDExXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmZhaWxzLmpzXG4gKiogbW9kdWxlIGlkID0gMTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtZGVmYXVsdC5qc1xuICoqIG1vZHVsZSBpZCA9IDE0XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2VsZWN0b3JzLCBzYkxpc3QgfSBmcm9tICcuL3NoYXJlZCc7XG5cbmltcG9ydCAnLi9hcGlzLyc7XG5pbXBvcnQgJy4vcmVuZGVyLyc7XG5pbXBvcnQgJy4vZXZlbnRzLyc7XG5pbXBvcnQgJy4vaW50ZXJuYWxzLyc7XG5cbmV4cG9ydCBkZWZhdWx0IFNtb290aFNjcm9sbGJhcjtcblxuU21vb3RoU2Nyb2xsYmFyLnZlcnNpb24gPSAnPCU9IHZlcnNpb24gJT4nO1xuXG4vKipcbiAqIGluaXQgc2Nyb2xsYmFyIG9uIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uczogc2Nyb2xsYmFyIG9wdGlvbnNcbiAqXG4gKiBAcmV0dXJuIHtTY3JvbGxiYXJ9IHNjcm9sbGJhciBpbnN0YW5jZVxuICovXG5TbW9vdGhTY3JvbGxiYXIuaW5pdCA9IChlbGVtLCBvcHRpb25zKSA9PiB7XG4gICAgaWYgKCFlbGVtIHx8IGVsZW0ubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0IGVsZW1lbnQgdG8gYmUgRE9NIEVsZW1lbnQsIGJ1dCBnb3QgJHt0eXBlb2YgZWxlbX1gKTtcbiAgICB9XG5cbiAgICBpZiAoc2JMaXN0LmhhcyhlbGVtKSkgcmV0dXJuIHNiTGlzdC5nZXQoZWxlbSk7XG5cbiAgICBlbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS1zY3JvbGxiYXInLCAnJyk7XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi5lbGVtLmNoaWxkcmVuXTtcblxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgZGl2LmlubmVySFRNTCA9IGBcbiAgICAgICAgPGFydGljbGUgY2xhc3M9XCJzY3JvbGwtY29udGVudFwiPjwvYXJ0aWNsZT5cbiAgICAgICAgPGFzaWRlIGNsYXNzPVwic2Nyb2xsYmFyLXRyYWNrIHNjcm9sbGJhci10cmFjay14XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsYmFyLXRodW1iIHNjcm9sbGJhci10aHVtYi14XCI+PC9kaXY+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICAgIDxhc2lkZSBjbGFzcz1cInNjcm9sbGJhci10cmFjayBzY3JvbGxiYXItdHJhY2steVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbGJhci10aHVtYiBzY3JvbGxiYXItdGh1bWIteVwiPjwvZGl2PlxuICAgICAgICA8L2FzaWRlPlxuICAgIGA7XG5cbiAgICBjb25zdCBzY3JvbGxDb250ZW50ID0gZGl2LnF1ZXJ5U2VsZWN0b3IoJy5zY3JvbGwtY29udGVudCcpO1xuXG4gICAgWy4uLmRpdi5jaGlsZHJlbl0uZm9yRWFjaCgoZWwpID0+IGVsZW0uYXBwZW5kQ2hpbGQoZWwpKTtcblxuICAgIGNoaWxkcmVuLmZvckVhY2goKGVsKSA9PiBzY3JvbGxDb250ZW50LmFwcGVuZENoaWxkKGVsKSk7XG5cbiAgICByZXR1cm4gbmV3IFNtb290aFNjcm9sbGJhcihlbGVtLCBvcHRpb25zKTtcbn07XG5cbi8qKlxuICogaW5pdCBzY3JvbGxiYXJzIG9uIHByZS1kZWZpbmVkIHNlbGVjdG9yc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zOiBzY3JvbGxiYXIgb3B0aW9uc1xuICpcbiAqIEByZXR1cm4ge0FycmF5fSBhIGNvbGxlY3Rpb24gb2Ygc2Nyb2xsYmFyIGluc3RhbmNlc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuaW5pdEFsbCA9IChvcHRpb25zKSA9PiB7XG4gICAgcmV0dXJuIFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyldLm1hcCgoZWwpID0+IHtcbiAgICAgICAgcmV0dXJuIFNtb290aFNjcm9sbGJhci5pbml0KGVsLCBvcHRpb25zKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogY2hlY2sgaWYgc2Nyb2xsYmFyIGV4aXN0cyBvbiBnaXZlbiBlbGVtZW50XG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmhhcyA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIHNiTGlzdC5oYXMoZWxlbSk7XG59O1xuXG4vKipcbiAqIGdldCBzY3JvbGxiYXIgaW5zdGFuY2UgdGhyb3VnaCBnaXZlbiBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtOiB0YXJnZXQgc2Nyb2xsYmFyIGNvbnRhaW5lclxuICpcbiAqIEByZXR1cm4ge1Njcm9sbGJhcn1cbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmdldCA9IChlbGVtKSA9PiB7XG4gICAgcmV0dXJuIHNiTGlzdC5nZXQoZWxlbSk7XG59O1xuXG4vKipcbiAqIGdldCBhbGwgc2Nyb2xsYmFyIGluc3RhbmNlc1xuICpcbiAqIEByZXR1cm4ge0FycmF5fSBhIGNvbGxlY3Rpb24gb2Ygc2Nyb2xsYmFyc1xuICovXG5TbW9vdGhTY3JvbGxiYXIuZ2V0QWxsID0gKCkgPT4ge1xuICAgIHJldHVybiBbLi4uc2JMaXN0LnZhbHVlcygpXTtcbn07XG5cbi8qKlxuICogZGVzdHJveSBzY3JvbGxiYXIgb24gZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbTogdGFyZ2V0IHNjcm9sbGJhciBjb250YWluZXJcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmRlc3Ryb3kgPSAoZWxlbSkgPT4ge1xuICAgIHJldHVybiBTbW9vdGhTY3JvbGxiYXIuaGFzKGVsZW0pICYmIFNtb290aFNjcm9sbGJhci5nZXQoZWxlbSkuZGVzdHJveSgpO1xufTtcblxuLyoqXG4gKiBkZXN0cm95IGFsbCBzY3JvbGxiYXJzIGluIHNjcm9sbGJhciBpbnN0YW5jZXNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLmRlc3Ryb3lBbGwgPSAoKSA9PiB7XG4gICAgc2JMaXN0LmZvckVhY2goKHNiKSA9PiB7XG4gICAgICAgIHNiLmRlc3Ryb3koKTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9BcnJheSRmcm9tID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9hcnJheS9mcm9tXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIF9BcnJheSRmcm9tKGFycik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3RvLWNvbnN1bWFibGUtYXJyYXkuanNcbiAqKiBtb2R1bGUgaWQgPSAxNlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb21cIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LmFycmF5LmZyb20nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kLmNvcmUnKS5BcnJheS5mcm9tO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qc1xuICoqIG1vZHVsZSBpZCA9IDE4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgJGF0ICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBpbmRleCA9IHRoaXMuX2lcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4ge3ZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWV9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4ge3ZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2V9O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSAxOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zdHJpbmctYXQuanNcbiAqKiBtb2R1bGUgaWQgPSAyMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnRvLWludGVnZXIuanNcbiAqKiBtb2R1bGUgaWQgPSAyMVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi8kLmxpYnJhcnknKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgcmVkZWZpbmUgICAgICAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgSXRlcmF0b3JzICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNyZWF0ZScpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuLyQuc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIGdldFByb3RvICAgICAgID0gcmVxdWlyZSgnLi8kJykuZ2V0UHJvdG9cbiAgLCBJVEVSQVRPUiAgICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEJVR0dZICAgICAgICAgID0gIShbXS5rZXlzICYmICduZXh0JyBpbiBbXS5rZXlzKCkpIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgLCBGRl9JVEVSQVRPUiAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEtFWVMgICAgICAgICAgID0gJ2tleXMnXG4gICwgVkFMVUVTICAgICAgICAgPSAndmFsdWVzJztcblxudmFyIHJldHVyblRoaXMgPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihCYXNlLCBOQU1FLCBDb25zdHJ1Y3RvciwgbmV4dCwgREVGQVVMVCwgSVNfU0VULCBGT1JDRUQpe1xuICAkaXRlckNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihraW5kKXtcbiAgICBpZighQlVHR1kgJiYga2luZCBpbiBwcm90bylyZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoKGtpbmQpe1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgICAgICAgID0gTkFNRSArICcgSXRlcmF0b3InXG4gICAgLCBERUZfVkFMVUVTID0gREVGQVVMVCA9PSBWQUxVRVNcbiAgICAsIFZBTFVFU19CVUcgPSBmYWxzZVxuICAgICwgcHJvdG8gICAgICA9IEJhc2UucHJvdG90eXBlXG4gICAgLCAkbmF0aXZlICAgID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdXG4gICAgLCAkZGVmYXVsdCAgID0gJG5hdGl2ZSB8fCBnZXRNZXRob2QoREVGQVVMVClcbiAgICAsIG1ldGhvZHMsIGtleTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZigkbmF0aXZlKXtcbiAgICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90bygkZGVmYXVsdC5jYWxsKG5ldyBCYXNlKSk7XG4gICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgIC8vIEZGIGZpeFxuICAgIGlmKCFMSUJSQVJZICYmIGhhcyhwcm90bywgRkZfSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICAvLyBmaXggQXJyYXkje3ZhbHVlcywgQEBpdGVyYXRvcn0ubmFtZSBpbiBWOCAvIEZGXG4gICAgaWYoREVGX1ZBTFVFUyAmJiAkbmF0aXZlLm5hbWUgIT09IFZBTFVFUyl7XG4gICAgICBWQUxVRVNfQlVHID0gdHJ1ZTtcbiAgICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gICAgfVxuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZigoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSl7XG4gICAgaGlkZShwcm90bywgSVRFUkFUT1IsICRkZWZhdWx0KTtcbiAgfVxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9ICRkZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSByZXR1cm5UaGlzO1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiAgREVGX1ZBTFVFUyAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogICAgSVNfU0VUICAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKVxuICAgIH07XG4gICAgaWYoRk9SQ0VEKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWRlZmluZS5qc1xuICoqIG1vZHVsZSBpZCA9IDIyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQubGlicmFyeS5qc1xuICoqIG1vZHVsZSBpZCA9IDIzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5oaWRlJyk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQucmVkZWZpbmUuanNcbiAqKiBtb2R1bGUgaWQgPSAyNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuLyQucHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oaWRlLmpzXG4gKiogbW9kdWxlIGlkID0gMjVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkT2JqZWN0ID0gT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogICAgICRPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICAkT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBpc0VudW06ICAgICB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxcbiAgZ2V0RGVzYzogICAgJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgICRPYmplY3QuZGVmaW5lUHJvcGVydHksXG4gIHNldERlc2NzOiAgICRPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgJE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXG4gIGdldFN5bWJvbHM6ICRPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBlYWNoOiAgICAgICBbXS5mb3JFYWNoXG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmpzXG4gKiogbW9kdWxlIGlkID0gMjZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5wcm9wZXJ0eS1kZXNjLmpzXG4gKiogbW9kdWxlIGlkID0gMjdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vJC5mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5kZXNjcmlwdG9ycy5qc1xuICoqIG1vZHVsZSBpZCA9IDI4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5oYXMuanNcbiAqKiBtb2R1bGUgaWQgPSAyOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyYXRvcnMuanNcbiAqKiBtb2R1bGUgaWQgPSAzMFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBkZXNjcmlwdG9yICAgICA9IHJlcXVpcmUoJy4vJC5wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vJC5zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5oaWRlJykoSXRlcmF0b3JQcm90b3R5cGUsIHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gJC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHtuZXh0OiBkZXNjcmlwdG9yKDEsIG5leHQpfSk7XG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNyZWF0ZS5qc1xuICoqIG1vZHVsZSBpZCA9IDMxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi8kJykuc2V0RGVzY1xuICAsIGhhcyA9IHJlcXVpcmUoJy4vJC5oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtdG8tc3RyaW5nLXRhZy5qc1xuICoqIG1vZHVsZSBpZCA9IDMyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgc3RvcmUgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICA9IHJlcXVpcmUoJy4vJC51aWQnKVxuICAsIFN5bWJvbCA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKS5TeW1ib2w7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBTeW1ib2wgJiYgU3ltYm9sW25hbWVdIHx8IChTeW1ib2wgfHwgdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLndrcy5qc1xuICoqIG1vZHVsZSBpZCA9IDMzXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kLmdsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zaGFyZWQuanNcbiAqKiBtb2R1bGUgaWQgPSAzNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudWlkLmpzXG4gKiogbW9kdWxlIGlkID0gMzVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsICRleHBvcnQgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuLyQudG8tb2JqZWN0JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi8kLmlzLWFycmF5LWl0ZXInKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XG4gICAgdmFyIE8gICAgICAgPSB0b09iamVjdChhcnJheUxpa2UpXG4gICAgICAsIEMgICAgICAgPSB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5XG4gICAgICAsICQkICAgICAgPSBhcmd1bWVudHNcbiAgICAgICwgJCRsZW4gICA9ICQkLmxlbmd0aFxuICAgICAgLCBtYXBmbiAgID0gJCRsZW4gPiAxID8gJCRbMV0gOiB1bmRlZmluZWRcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgaXRlckZuICA9IGdldEl0ZXJGbihPKVxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYobWFwcGluZyltYXBmbiA9IGN0eChtYXBmbiwgJCRsZW4gPiAyID8gJCRbMl0gOiB1bmRlZmluZWQsIDIpO1xuICAgIC8vIGlmIG9iamVjdCBpc24ndCBpdGVyYWJsZSBvciBpdCdzIGFycmF5IHdpdGggZGVmYXVsdCBpdGVyYXRvciAtIHVzZSBzaW1wbGUgY2FzZVxuICAgIGlmKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKXtcbiAgICAgIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKE8pLCByZXN1bHQgPSBuZXcgQzsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgICBmb3IocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5mcm9tLmpzXG4gKiogbW9kdWxlIGlkID0gMzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhbk9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgfSBjYXRjaChlKXtcbiAgICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICAgIGlmKHJldCAhPT0gdW5kZWZpbmVkKWFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pdGVyLWNhbGwuanNcbiAqKiBtb2R1bGUgaWQgPSAzN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFuLW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDM4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXMtb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gMzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3JcbnZhciBJdGVyYXRvcnMgID0gcmVxdWlyZSgnLi8kLml0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1hcnJheS1pdGVyLmpzXG4gKiogbW9kdWxlIGlkID0gNDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vJC50by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1sZW5ndGguanNcbiAqKiBtb2R1bGUgaWQgPSA0MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vJC5jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZClyZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanNcbiAqKiBtb2R1bGUgaWQgPSA0MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLy8gRVMzIHdyb25nIGhlcmVcbiAgLCBBUkcgPSBjb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbVEFHXSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNsYXNzb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2YuanNcbiAqKiBtb2R1bGUgaWQgPSA0NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIElURVJBVE9SICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMsIHNraXBDbG9zaW5nKXtcbiAgaWYoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgc2FmZSA9IHRydWU7IH07XG4gICAgYXJyW0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuaXRlci1kZXRlY3QuanNcbiAqKiBtb2R1bGUgaWQgPSA0NVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtDbGFzc30gU21vb3RoU2Nyb2xsYmFyXG4gKi9cblxuaW1wb3J0IHsgREVGQVVMVF9PUFRJT05TLCBzYkxpc3QgfSBmcm9tICcuL3NoYXJlZC8nO1xuaW1wb3J0IHtcbiAgICBkZWJvdW5jZSxcbiAgICBmaW5kQ2hpbGQsXG4gICAgc2V0U3R5bGVcbn0gZnJvbSAnLi91dGlscy8nO1xuXG4vKipcbiAqIEBjb25zdHJ1Y3RvclxuICogQ3JlYXRlIHNjcm9sbGJhciBpbnN0YW5jZVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyOiB0YXJnZXQgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXTogb3B0aW9uc1xuICovXG5leHBvcnQgY2xhc3MgU21vb3RoU2Nyb2xsYmFyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb250YWluZXIsIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzYkxpc3Quc2V0KGNvbnRhaW5lciwgdGhpcyk7XG5cbiAgICAgICAgLy8gbWFrZSBjb250YWluZXIgZm9jdXNhYmxlXG4gICAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJzEnKTtcblxuICAgICAgICAvLyByZXNldCBzY3JvbGwgcG9zaXRpb25cbiAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxMZWZ0ID0gMDtcblxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgIG91dGxpbmU6ICdub25lJ1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB0cmFja1ggPSBmaW5kQ2hpbGQoY29udGFpbmVyLCAnc2Nyb2xsYmFyLXRyYWNrLXgnKTtcbiAgICAgICAgY29uc3QgdHJhY2tZID0gZmluZENoaWxkKGNvbnRhaW5lciwgJ3Njcm9sbGJhci10cmFjay15Jyk7XG5cbiAgICAgICAgLy8gcmVhZG9ubHkgcHJvcGVydGllc1xuICAgICAgICB0aGlzLl9fcmVhZG9ubHkoJ3RhcmdldHMnLCBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgIGNvbnRhaW5lcixcbiAgICAgICAgICAgIGNvbnRlbnQ6IGZpbmRDaGlsZChjb250YWluZXIsICdzY3JvbGwtY29udGVudCcpLFxuICAgICAgICAgICAgeEF4aXM6IE9iamVjdC5mcmVlemUoe1xuICAgICAgICAgICAgICAgIHRyYWNrOiB0cmFja1gsXG4gICAgICAgICAgICAgICAgdGh1bWI6IGZpbmRDaGlsZCh0cmFja1gsICdzY3JvbGxiYXItdGh1bWIteCcpXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHlBeGlzOiBPYmplY3QuZnJlZXplKHtcbiAgICAgICAgICAgICAgICB0cmFjazogdHJhY2tZLFxuICAgICAgICAgICAgICAgIHRodW1iOiBmaW5kQ2hpbGQodHJhY2tZLCAnc2Nyb2xsYmFyLXRodW1iLXknKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSkpXG4gICAgICAgIC5fX3JlYWRvbmx5KCdvZmZzZXQnLCB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMFxuICAgICAgICB9KVxuICAgICAgICAuX19yZWFkb25seSgnbGltaXQnLCB7XG4gICAgICAgICAgICB4OiBJbmZpbml0eSxcbiAgICAgICAgICAgIHk6IEluZmluaXR5XG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdtb3ZlbWVudCcsIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH0pXG4gICAgICAgIC5fX3JlYWRvbmx5KCdzaXplJywgdGhpcy5nZXRTaXplKCkpXG4gICAgICAgIC5fX3JlYWRvbmx5KCdvcHRpb25zJywgT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9PUFRJT05TKSk7XG5cbiAgICAgICAgLy8gbm9uLWVubXVyYWJsZSBwcm9wZXJ0aWVzXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgIF9fdXBkYXRlVGhyb3R0bGU6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogZGVib3VuY2UoOjp0aGlzLnVwZGF0ZSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX2xpc3RlbmVyczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBbXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9faGFuZGxlcnM6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogW11cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfX2NoaWxkcmVuOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX190aW1lcklEOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHt9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fX2luaXRTY3JvbGxiYXIoKTtcbiAgICB9XG59XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvc21vb3RoX3Njcm9sbGJhci5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzXG4gKiogbW9kdWxlIGlkID0gNDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9mcmVlemUuanNcbiAqKiBtb2R1bGUgaWQgPSA0OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmZyZWV6ZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLk9iamVjdC5mcmVlemU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZnJlZXplLmpzXG4gKiogbW9kdWxlIGlkID0gNDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDE5LjEuMi41IE9iamVjdC5mcmVlemUoTylcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKTtcblxucmVxdWlyZSgnLi8kLm9iamVjdC1zYXAnKSgnZnJlZXplJywgZnVuY3Rpb24oJGZyZWV6ZSl7XG4gIHJldHVybiBmdW5jdGlvbiBmcmVlemUoaXQpe1xuICAgIHJldHVybiAkZnJlZXplICYmIGlzT2JqZWN0KGl0KSA/ICRmcmVlemUoaXQpIDogaXQ7XG4gIH07XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5mcmVlemUuanNcbiAqKiBtb2R1bGUgaWQgPSA1MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9hc3NpZ25cIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnbi5qc1xuICoqIG1vZHVsZSBpZCA9IDUxXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LmFzc2lnbjtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSA1MlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiwgJ09iamVjdCcsIHthc3NpZ246IHJlcXVpcmUoJy4vJC5vYmplY3QtYXNzaWduJyl9KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24uanNcbiAqKiBtb2R1bGUgaWQgPSA1M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vJC50by1vYmplY3QnKVxuICAsIElPYmplY3QgID0gcmVxdWlyZSgnLi8kLmlvYmplY3QnKTtcblxuLy8gc2hvdWxkIHdvcmsgd2l0aCBzeW1ib2xzIGFuZCBzaG91bGQgaGF2ZSBkZXRlcm1pbmlzdGljIHByb3BlcnR5IG9yZGVyIChWOCBidWcpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHZhciBhID0gT2JqZWN0LmFzc2lnblxuICAgICwgQSA9IHt9XG4gICAgLCBCID0ge31cbiAgICAsIFMgPSBTeW1ib2woKVxuICAgICwgSyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG4gIEFbU10gPSA3O1xuICBLLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyBCW2tdID0gazsgfSk7XG4gIHJldHVybiBhKHt9LCBBKVtTXSAhPSA3IHx8IE9iamVjdC5rZXlzKGEoe30sIEIpKS5qb2luKCcnKSAhPSBLO1xufSkgPyBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2UpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHZhciBUICAgICA9IHRvT2JqZWN0KHRhcmdldClcbiAgICAsICQkICAgID0gYXJndW1lbnRzXG4gICAgLCAkJGxlbiA9ICQkLmxlbmd0aFxuICAgICwgaW5kZXggPSAxXG4gICAgLCBnZXRLZXlzICAgID0gJC5nZXRLZXlzXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzXG4gICAgLCBpc0VudW0gICAgID0gJC5pc0VudW07XG4gIHdoaWxlKCQkbGVuID4gaW5kZXgpe1xuICAgIHZhciBTICAgICAgPSBJT2JqZWN0KCQkW2luZGV4KytdKVxuICAgICAgLCBrZXlzICAgPSBnZXRTeW1ib2xzID8gZ2V0S2V5cyhTKS5jb25jYXQoZ2V0U3ltYm9scyhTKSkgOiBnZXRLZXlzKFMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGogICAgICA9IDBcbiAgICAgICwga2V5O1xuICAgIHdoaWxlKGxlbmd0aCA+IGopaWYoaXNFbnVtLmNhbGwoUywga2V5ID0ga2V5c1tqKytdKSlUW2tleV0gPSBTW2tleV07XG4gIH1cbiAgcmV0dXJuIFQ7XG59IDogT2JqZWN0LmFzc2lnbjtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5vYmplY3QtYXNzaWduLmpzXG4gKiogbW9kdWxlIGlkID0gNTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pb2JqZWN0LmpzXG4gKiogbW9kdWxlIGlkID0gNTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnRpZXNcIiksIF9fZXNNb2R1bGU6IHRydWUgfTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0aWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoVCwgRCl7XG4gIHJldHVybiAkLnNldERlc2NzKFQsIEQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydGllcy5qc1xuICoqIG1vZHVsZSBpZCA9IDU3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge01hcH0gc2JMaXN0XG4gKi9cblxuY29uc3Qgc2JMaXN0ID0gbmV3IE1hcCgpO1xuXG5jb25zdCBvcmlnaW5TZXQgPSA6OnNiTGlzdC5zZXQ7XG5cbnNiTGlzdC51cGRhdGUgPSAoKSA9PiB7XG4gICAgc2JMaXN0LmZvckVhY2goKHNiKSA9PiB7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgICAgICBzYi5fX3VwZGF0ZUNoaWxkcmVuKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLy8gcGF0Y2ggI3NldCB3aXRoICN1cGRhdGUgbWV0aG9kXG5zYkxpc3Quc2V0ID0gKC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCByZXMgPSBvcmlnaW5TZXQoLi4uYXJncyk7XG4gICAgc2JMaXN0LnVwZGF0ZSgpO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbmV4cG9ydCB7IHNiTGlzdCB9O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9zYl9saXN0LmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL21hcFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA2MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy8kLmNvcmUnKS5NYXA7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9tYXAuanNcbiAqKiBtb2R1bGUgaWQgPSA2MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcmF0b3JzJyk7XG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuSFRNTENvbGxlY3Rpb24gPSBJdGVyYXRvcnMuQXJyYXk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanNcbiAqKiBtb2R1bGUgaWQgPSA2M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuLyQuYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSXRlcmF0b3JzICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwga2luZCAgPSB0aGlzLl9rXG4gICAgLCBpbmRleCA9IHRoaXMuX2krKztcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA2NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmFkZC10by11bnNjb3BhYmxlcy5qc1xuICoqIG1vZHVsZSBpZCA9IDY1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLml0ZXItc3RlcC5qc1xuICoqIG1vZHVsZSBpZCA9IDY2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQudG8taW9iamVjdC5qc1xuICoqIG1vZHVsZSBpZCA9IDY3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XG5cbi8vIDIzLjEgTWFwIE9iamVjdHNcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ01hcCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBNYXAoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcbiAgfSxcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzXG4gKiogbW9kdWxlIGlkID0gNjhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGhpZGUgICAgICAgICA9IHJlcXVpcmUoJy4vJC5oaWRlJylcbiAgLCByZWRlZmluZUFsbCAgPSByZXF1aXJlKCcuLyQucmVkZWZpbmUtYWxsJylcbiAgLCBjdHggICAgICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBzdHJpY3ROZXcgICAgPSByZXF1aXJlKCcuLyQuc3RyaWN0LW5ldycpXG4gICwgZGVmaW5lZCAgICAgID0gcmVxdWlyZSgnLi8kLmRlZmluZWQnKVxuICAsIGZvck9mICAgICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsICRpdGVyRGVmaW5lICA9IHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpXG4gICwgc3RlcCAgICAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXItc3RlcCcpXG4gICwgSUQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpKCdpZCcpXG4gICwgJGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhhcycpXG4gICwgaXNPYmplY3QgICAgID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgc2V0U3BlY2llcyAgID0gcmVxdWlyZSgnLi8kLnNldC1zcGVjaWVzJylcbiAgLCBERVNDUklQVE9SUyAgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBTSVpFICAgICAgICAgPSBERVNDUklQVE9SUyA/ICdfcycgOiAnc2l6ZSdcbiAgLCBpZCAgICAgICAgICAgPSAwO1xuXG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYoISRoYXMoaXQsIElEKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxuICAgIGhpZGUoaXQsIElELCArK2lkKTtcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XG59O1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbih0aGF0LCBrZXkpe1xuICAvLyBmYXN0IGNhc2VcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcbiAgaWYoaW5kZXggIT09ICdGJylyZXR1cm4gdGhhdC5faVtpbmRleF07XG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxuICBmb3IoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0aGF0LCBDLCBOQU1FKTtcbiAgICAgIHRoYXQuX2kgPSAkLmNyZWF0ZShudWxsKTsgLy8gaW5kZXhcbiAgICAgIHRoYXQuX2YgPSB1bmRlZmluZWQ7ICAgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgICAgLy8gbGFzdCBlbnRyeVxuICAgICAgdGhhdFtTSVpFXSA9IDA7ICAgICAgICAgICAvLyBzaXplXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XG4gICAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0Ll9pLCBlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKGVudHJ5LnApZW50cnkucCA9IGVudHJ5LnAubiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGF0Ll9mID0gdGhhdC5fbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhhdFtTSVpFXSA9IDA7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgICAgICBpZihlbnRyeSl7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXG4gICAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xuICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9pW2VudHJ5LmldO1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XG4gICAgICAgICAgaWYodGhhdC5fZiA9PSBlbnRyeSl0aGF0Ll9mID0gbmV4dDtcbiAgICAgICAgICBpZih0aGF0Ll9sID09IGVudHJ5KXRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzLl9mKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKERFU0NSSVBUT1JTKSQuc2V0RGVzYyhDLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBkZWZpbmVkKHRoaXNbU0laRV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcbiAgICAgICwgcHJldiwgaW5kZXg7XG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XG4gICAgaWYoZW50cnkpe1xuICAgICAgZW50cnkudiA9IHZhbHVlO1xuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5fbCA9IGVudHJ5ID0ge1xuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxuICAgICAgICB2OiB2YWx1ZSwgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgICAgcDogcHJldiA9IHRoYXQuX2wsICAgICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XG4gICAgICAgIHI6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSByZW1vdmVkXG4gICAgICB9O1xuICAgICAgaWYoIXRoYXQuX2YpdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcbiAgICAgIHRoYXRbU0laRV0rKztcbiAgICAgIC8vIGFkZCB0byBpbmRleFxuICAgICAgaWYoaW5kZXggIT09ICdGJyl0aGF0Ll9pW2luZGV4XSA9IGVudHJ5O1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcbiAgc2V0U3Ryb25nOiBmdW5jdGlvbihDLCBOQU1FLCBJU19NQVApe1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICAgICB0aGlzLl90ID0gaXRlcmF0ZWQ7ICAvLyB0YXJnZXRcbiAgICAgIHRoaXMuX2sgPSBraW5kOyAgICAgIC8vIGtpbmRcbiAgICAgIHRoaXMuX2wgPSB1bmRlZmluZWQ7IC8vIHByZXZpb3VzXG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgLCBraW5kICA9IHRoYXQuX2tcbiAgICAgICAgLCBlbnRyeSA9IHRoYXQuX2w7XG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmKCF0aGF0Ll90IHx8ICEodGhhdC5fbCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhhdC5fdC5fZikpe1xuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxuICAgICAgICB0aGF0Ll90ID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gc3RlcCgxKTtcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcbiAgICAgIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgZW50cnkuayk7XG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xuICAgICAgcmV0dXJuIHN0ZXAoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTtcbiAgICB9LCBJU19NQVAgPyAnZW50cmllcycgOiAndmFsdWVzJyAsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmNvbGxlY3Rpb24tc3Ryb25nLmpzXG4gKiogbW9kdWxlIGlkID0gNjlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vJC5yZWRlZmluZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XG4gIGZvcih2YXIga2V5IGluIHNyYylyZWRlZmluZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5yZWRlZmluZS1hbGwuanNcbiAqKiBtb2R1bGUgaWQgPSA3MFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUpe1xuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKXRocm93IFR5cGVFcnJvcihuYW1lICsgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xuICByZXR1cm4gaXQ7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLnN0cmljdC1uZXcuanNcbiAqKiBtb2R1bGUgaWQgPSA3MVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vJC5pcy1hcnJheS1pdGVyJylcbiAgLCBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi8kLnRvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQpe1xuICB2YXIgaXRlckZuID0gZ2V0SXRlckZuKGl0ZXJhYmxlKVxuICAgICwgZiAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yO1xuICBpZih0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ZXJhYmxlICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIC8vIGZhc3QgY2FzZSBmb3IgYXJyYXlzIHdpdGggZGVmYXVsdCBpdGVyYXRvclxuICBpZihpc0FycmF5SXRlcihpdGVyRm4pKWZvcihsZW5ndGggPSB0b0xlbmd0aChpdGVyYWJsZS5sZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICB9IGVsc2UgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7ICl7XG4gICAgY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gIH1cbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuZm9yLW9mLmpzXG4gKiogbW9kdWxlIGlkID0gNzJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLyQuZGVzY3JpcHRvcnMnKVxuICAsIFNQRUNJRVMgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSBjb3JlW0tFWV07XG4gIGlmKERFU0NSSVBUT1JTICYmIEMgJiYgIUNbU1BFQ0lFU10pJC5zZXREZXNjKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuc2V0LXNwZWNpZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA3M1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBnbG9iYWwgICAgICAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi8kLmV4cG9ydCcpXG4gICwgZmFpbHMgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZmFpbHMnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmhpZGUnKVxuICAsIHJlZGVmaW5lQWxsICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmaW5lLWFsbCcpXG4gICwgZm9yT2YgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBzdHJpY3ROZXcgICAgICA9IHJlcXVpcmUoJy4vJC5zdHJpY3QtbmV3JylcbiAgLCBpc09iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi8kLnNldC10by1zdHJpbmctdGFnJylcbiAgLCBERVNDUklQVE9SUyAgICA9IHJlcXVpcmUoJy4vJC5kZXNjcmlwdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gZ2xvYmFsW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBpZighREVTQ1JJUFRPUlMgfHwgdHlwZW9mIEMgIT0gJ2Z1bmN0aW9uJyB8fCAhKElTX1dFQUsgfHwgcHJvdG8uZm9yRWFjaCAmJiAhZmFpbHMoZnVuY3Rpb24oKXtcbiAgICBuZXcgQygpLmVudHJpZXMoKS5uZXh0KCk7XG4gIH0pKSl7XG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcbiAgICBDID0gY29tbW9uLmdldENvbnN0cnVjdG9yKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbih0YXJnZXQsIGl0ZXJhYmxlKXtcbiAgICAgIHN0cmljdE5ldyh0YXJnZXQsIEMsIE5BTUUpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2U7XG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGFyZ2V0W0FEREVSXSwgdGFyZ2V0KTtcbiAgICB9KTtcbiAgICAkLmVhY2guY2FsbCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMnLnNwbGl0KCcsJyksZnVuY3Rpb24oS0VZKXtcbiAgICAgIHZhciBJU19BRERFUiA9IEtFWSA9PSAnYWRkJyB8fCBLRVkgPT0gJ3NldCc7XG4gICAgICBpZihLRVkgaW4gcHJvdG8gJiYgIShJU19XRUFLICYmIEtFWSA9PSAnY2xlYXInKSloaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICBpZighSVNfQURERVIgJiYgSVNfV0VBSyAmJiAhaXNPYmplY3QoYSkpcmV0dXJuIEtFWSA9PSAnZ2V0JyA/IHVuZGVmaW5lZCA6IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBJU19BRERFUiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZignc2l6ZScgaW4gcHJvdG8pJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Muc2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNldFRvU3RyaW5nVGFnKEMsIE5BTUUpO1xuXG4gIE9bTkFNRV0gPSBDO1xuICAkZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiwgTyk7XG5cbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldFN0cm9uZyhDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzXG4gKiogbW9kdWxlIGlkID0gNzRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZXhwb3J0ICA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAsICdNYXAnLCB7dG9KU09OOiByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi10by1qc29uJykoJ01hcCcpfSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDc1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgZm9yT2YgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIGNsYXNzb2YgPSByZXF1aXJlKCcuLyQuY2xhc3NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpe1xuICAgIGlmKGNsYXNzb2YodGhpcykgIT0gTkFNRSl0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHZhciBhcnIgPSBbXTtcbiAgICBmb3JPZih0aGlzLCBmYWxzZSwgYXJyLnB1c2gsIGFycik7XG4gICAgcmV0dXJuIGFycjtcbiAgfTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29sbGVjdGlvbi10by1qc29uLmpzXG4gKiogbW9kdWxlIGlkID0gNzZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImV4cG9ydCAqIGZyb20gJy4vZGVib3VuY2UnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfc3R5bGUnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfZGVsdGEnO1xuZXhwb3J0ICogZnJvbSAnLi9maW5kX2NoaWxkJztcbmV4cG9ydCAqIGZyb20gJy4vYnVpbGRfY3VydmUnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfdG91Y2hfaWQnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9zaXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9waWNrX2luX3JhbmdlJztcbmV4cG9ydCAqIGZyb20gJy4vZ2V0X3BvaW50ZXJfZGF0YSc7XG5leHBvcnQgKiBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvaW5kZXguanNcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkZ2V0T3duUHJvcGVydHlOYW1lcyA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktbmFtZXNcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX09iamVjdCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX09iamVjdCRkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKG9iaiwgZGVmYXVsdHMpIHtcbiAgdmFyIGtleXMgPSBfT2JqZWN0JGdldE93blByb3BlcnR5TmFtZXMoZGVmYXVsdHMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuXG4gICAgdmFyIHZhbHVlID0gX09iamVjdCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmYXVsdHMsIGtleSk7XG5cbiAgICBpZiAodmFsdWUgJiYgdmFsdWUuY29uZmlndXJhYmxlICYmIG9ialtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIF9PYmplY3QkZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvZGVmYXVsdHMuanNcbiAqKiBtb2R1bGUgaWQgPSA3OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gNzlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgcmV0dXJuICQuZ2V0TmFtZXMoaXQpO1xufTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gODBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG5yZXF1aXJlKCcuLyQub2JqZWN0LXNhcCcpKCdnZXRPd25Qcm9wZXJ0eU5hbWVzJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vJC5nZXQtbmFtZXMnKS5nZXQ7XG59KTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzXG4gKiogbW9kdWxlIGlkID0gODFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpXG4gICwgZ2V0TmFtZXMgID0gcmVxdWlyZSgnLi8kJykuZ2V0TmFtZXNcbiAgLCB0b1N0cmluZyAgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24oaXQpe1xuICB0cnkge1xuICAgIHJldHVybiBnZXROYW1lcyhpdCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICBpZih3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJylyZXR1cm4gZ2V0V2luZG93TmFtZXMoaXQpO1xuICByZXR1cm4gZ2V0TmFtZXModG9JT2JqZWN0KGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdldC1uYW1lcy5qc1xuICoqIG1vZHVsZSBpZCA9IDgyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gODNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgcmV0dXJuICQuZ2V0RGVzYyhpdCwga2V5KTtcbn07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gODRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuLyQudG8taW9iamVjdCcpO1xuXG5yZXF1aXJlKCcuLyQub2JqZWN0LXNhcCcpKCdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3InLCBmdW5jdGlvbigkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgICByZXR1cm4gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0b0lPYmplY3QoaXQpLCBrZXkpO1xuICB9O1xufSk7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9+L2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gODVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanNcbiAqKiBtb2R1bGUgaWQgPSA4NlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYyl7XG4gIHJldHVybiAkLnNldERlc2MoaXQsIGtleSwgZGVzYyk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qc1xuICoqIG1vZHVsZSBpZCA9IDg3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqLCBkZWZhdWx0cykge1xuICB2YXIgbmV3T2JqID0gZGVmYXVsdHMoe30sIG9iaik7XG4gIGRlbGV0ZSBuZXdPYmpbXCJkZWZhdWx0XCJdO1xuICByZXR1cm4gbmV3T2JqO1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW50ZXJvcC1leHBvcnQtd2lsZGNhcmQuanNcbiAqKiBtb2R1bGUgaWQgPSA4OFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZGVib3VuY2VcbiAqL1xuXG4vLyBkZWJvdW5jZSB0aW1lcnMgcmVzZXQgd2FpdFxuY29uc3QgUkVTRVRfV0FJVCA9IDEwMDtcblxuLyoqXG4gKiBDYWxsIGZuIGlmIGl0IGlzbid0IGJlIGNhbGxlZCBpbiBhIHBlcmlvZFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge051bWJlcn0gW3dhaXRdOiBkZWJvdW5jZSB3YWl0LCBkZWZhdWx0IGlzIFJFU1RfV0FJVFxuICogQHBhcmFtIHtCb29sZWFufSBbaW1tZWRpYXRlXTogd2hldGhlciB0byBydW4gdGFzayBhdCBsZWFkaW5nLCBkZWZhdWx0IGlzIHRydWVcbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0IGxldCBkZWJvdW5jZSA9IChmbiwgd2FpdCA9IFJFU0VUX1dBSVQsIGltbWVkaWF0ZSA9IHRydWUpID0+IHtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICBsZXQgdGltZXI7XG5cbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKCF0aW1lciAmJiBpbW1lZGlhdGUpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gZm4oLi4uYXJncykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGltZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBmbiguLi5hcmdzKTtcbiAgICAgICAgfSwgd2FpdCk7XG4gICAgfTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZGVib3VuY2UuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBzZXRTdHlsZVxuICovXG5cbmNvbnN0IFZFTkRPUl9QUkVGSVggPSBbXG4gICAgJ3dlYmtpdCcsXG4gICAgJ21veicsXG4gICAgJ21zJyxcbiAgICAnbydcbl07XG5cbmNvbnN0IFJFID0gbmV3IFJlZ0V4cChgXi0oPyEoPzoke1ZFTkRPUl9QUkVGSVguam9pbignfCcpfSktKWApO1xuXG5sZXQgYXV0b1ByZWZpeCA9IChzdHlsZXMpID0+IHtcbiAgICBjb25zdCByZXMgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBpZiAoIVJFLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgIHJlc1twcm9wXSA9IHN0eWxlc1twcm9wXTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbCA9IHN0eWxlc1twcm9wXTtcblxuICAgICAgICBwcm9wID0gcHJvcC5yZXBsYWNlKC9eLS8sICcnKTtcbiAgICAgICAgcmVzW3Byb3BdID0gdmFsO1xuXG4gICAgICAgIFZFTkRPUl9QUkVGSVguZm9yRWFjaCgocHJlZml4KSA9PiB7XG4gICAgICAgICAgICByZXNbYC0ke3ByZWZpeH0tJHtwcm9wfWBdID0gdmFsO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbi8qKlxuICogc2V0IGNzcyBzdHlsZSBmb3IgdGFyZ2V0IGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW06IHRhcmdldCBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGVzOiBjc3Mgc3R5bGVzIHRvIGFwcGx5XG4gKi9cbmV4cG9ydCBsZXQgc2V0U3R5bGUgPSAoZWxlbSwgc3R5bGVzKSA9PiB7XG4gICAgc3R5bGVzID0gYXV0b1ByZWZpeChzdHlsZXMpO1xuXG4gICAgT2JqZWN0LmtleXMoc3R5bGVzKS5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICAgIGxldCBjc3NQcm9wID0gcHJvcC5yZXBsYWNlKC8tKFthLXpdKS9nLCAobSwgJDEpID0+ICQxLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICBlbGVtLnN0eWxlW2Nzc1Byb3BdID0gc3R5bGVzW3Byb3BdO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9zZXRfc3R5bGUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXREZWx0YVxuICogQGRlcGVuZGVuY2llcyBbIGdldE9yaWdpbmFsRXZlbnQgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5cbmNvbnN0IERFTFRBX1NDQUxFID0ge1xuICAgIFNUQU5EQVJEOiAxLFxuICAgIE9USEVSUzogLTNcbn07XG5cbmNvbnN0IERFTFRBX01PREUgPSBbMS4wLCAyOC4wLCA1MDAuMF07XG5cbmxldCBnZXREZWx0YU1vZGUgPSAobW9kZSkgPT4gREVMVEFfTU9ERVttb2RlXSB8fCBERUxUQV9NT0RFWzBdO1xuXG4vKipcbiAqIE5vcm1hbGl6aW5nIHdoZWVsIGRlbHRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGV2dDogZXZlbnQgb2JqZWN0XG4gKi9cbmV4cG9ydCBsZXQgZ2V0RGVsdGEgPSAoZXZ0KSA9PiB7XG4gICAgLy8gZ2V0IG9yaWdpbmFsIERPTSBldmVudFxuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGlmICgnZGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgY29uc3QgbW9kZSA9IGdldERlbHRhTW9kZShldnQuZGVsdGFNb2RlKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogZXZ0LmRlbHRhWCAvIERFTFRBX1NDQUxFLlNUQU5EQVJEICogbW9kZSxcbiAgICAgICAgICAgIHk6IGV2dC5kZWx0YVkgLyBERUxUQV9TQ0FMRS5TVEFOREFSRCAqIG1vZGVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoJ3doZWVsRGVsdGFYJyBpbiBldnQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IGV2dC53aGVlbERlbHRhWCAvIERFTFRBX1NDQUxFLk9USEVSUyxcbiAgICAgICAgICAgIHk6IGV2dC53aGVlbERlbHRhWSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIGllIHdpdGggdG91Y2hwYWRcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiBldnQud2hlZWxEZWx0YSAvIERFTFRBX1NDQUxFLk9USEVSU1xuICAgIH07XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X2RlbHRhLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0T3JpZ2luYWxFdmVudFxuICovXG5cbi8qKlxuICogR2V0IG9yaWdpbmFsIERPTSBldmVudFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICpcbiAqIEByZXR1cm4ge0V2ZW50T2JqZWN0fVxuICovXG5leHBvcnQgbGV0IGdldE9yaWdpbmFsRXZlbnQgPSAoZXZ0KSA9PiB7XG4gICAgcmV0dXJuIGV2dC5vcmlnaW5hbEV2ZW50IHx8IGV2dDtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X29yaWdpbmFsX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZmluZENoaWxkXG4gKi9cblxuLyoqXG4gKiBGaW5kIGVsZW1lbnQgd2l0aCBzcGVjaWZpYyBjbGFzcyBuYW1lIHdpdGhpbiBjaGlsZHJlblxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gcGFyZW50RWxlbVxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZVxuICpcbiAqIEByZXR1cm4ge0VsZW1lbnR9OiBmaXJzdCBtYXRjaGVkIGNoaWxkXG4gKi9cbmV4cG9ydCBsZXQgZmluZENoaWxkID0gKHBhcmVudEVsZW0sIGNsYXNzTmFtZSkgPT4ge1xuICAgIGxldCBjaGlsZHJlbiA9IHBhcmVudEVsZW0uY2hpbGRyZW47XG5cbiAgICBpZiAoIWNoaWxkcmVuKSByZXR1cm4gbnVsbDtcblxuICAgIGZvciAobGV0IGVsZW0gb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGVsZW0uY2xhc3NOYW1lLm1hdGNoKGNsYXNzTmFtZSkpIHJldHVybiBlbGVtO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9maW5kX2NoaWxkLmpzXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3IuanNcbiAqKiBtb2R1bGUgaWQgPSA5NFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwicmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvcicpO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzXG4gKiogbW9kdWxlIGlkID0gOTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKVxuICAsIGdldCAgICAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5nZXRJdGVyYXRvciA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldChpdCk7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgcmV0dXJuIGFuT2JqZWN0KGl0ZXJGbi5jYWxsKGl0KSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci5qc1xuICoqIG1vZHVsZSBpZCA9IDk2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBidWlsZEN1cnZlXG4gKi9cblxuLyoqXG4gKiBCdWlsZCBxdWFkcmF0aWMgZWFzaW5nIGN1cnZlXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGJlZ2luXG4gKiBAcGFyYW0ge051bWJlcn0gZHVyYXRpb25cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX06IHBvaW50c1xuICovXG5leHBvcnQgbGV0IGJ1aWxkQ3VydmUgPSAoZGlzdGFuY2UsIGR1cmF0aW9uKSA9PiB7XG4gICAgbGV0IHJlcyA9IFtdO1xuXG4gICAgY29uc3QgdCA9IE1hdGguZmxvb3IoZHVyYXRpb24gLyAxMDAwICogNjApO1xuICAgIGNvbnN0IGEgPSAtZGlzdGFuY2UgLyB0KioyO1xuICAgIGNvbnN0IGIgPSAtMiAqIGEgKiB0O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gdDsgaSsrKSB7XG4gICAgICAgIHJlcy5wdXNoKGRpc3RhbmNlID8gKGEgKiBpKioyICsgYiAqIGkpIDogMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvYnVpbGRfY3VydmUuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBnZXRUb3VjaElEXG4gKiBAZGVwZW5kZW5jaWVzIFsgZ2V0T3JpZ2luYWxFdmVudCwgZ2V0UG9pbnRlckRhdGEgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5pbXBvcnQgeyBnZXRQb2ludGVyRGF0YSB9IGZyb20gJy4vZ2V0X3BvaW50ZXJfZGF0YSc7XG5cbi8qKlxuICogR2V0IHRvdWNoIGlkZW50aWZpZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZXZ0OiBldmVudCBvYmplY3RcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9OiB0b3VjaCBpZFxuICovXG5leHBvcnQgbGV0IGdldFRvdWNoSUQgPSAoZXZ0KSA9PiB7XG4gICAgZXZ0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgbGV0IGRhdGEgPSBnZXRQb2ludGVyRGF0YShldnQpO1xuXG4gICAgcmV0dXJuIGRhdGEuaWRlbnRpZmllcjtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X3RvdWNoX2lkLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAZXhwb3J0IHtGdW5jdGlvbn0gZ2V0UG9pbnRlckRhdGFcbiAqIEBkZXBlbmRlbmNpZXMgWyBnZXRPcmlnaW5hbEV2ZW50IF1cbiAqL1xuXG5pbXBvcnQgeyBnZXRPcmlnaW5hbEV2ZW50IH0gZnJvbSAnLi9nZXRfb3JpZ2luYWxfZXZlbnQnO1xuXG4vKipcbiAqIEdldCBwb2ludGVyL3RvdWNoIGRhdGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBldnQ6IGV2ZW50IG9iamVjdFxuICovXG5leHBvcnQgbGV0IGdldFBvaW50ZXJEYXRhID0gKGV2dCkgPT4ge1xuICAgIC8vIGlmIGlzIHRvdWNoIGV2ZW50LCByZXR1cm4gbGFzdCBpdGVtIGluIHRvdWNoTGlzdFxuICAgIC8vIGVsc2UgcmV0dXJuIG9yaWdpbmFsIGV2ZW50XG4gICAgZXZ0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgcmV0dXJuIGV2dC50b3VjaGVzID8gZXZ0LnRvdWNoZXNbZXZ0LnRvdWNoZXMubGVuZ3RoIC0gMV0gOiBldnQ7XG59O1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvdXRpbHMvZ2V0X3BvaW50ZXJfZGF0YS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7RnVuY3Rpb259IGdldFBvc2l0aW9uXG4gKiBAZGVwZW5kZW5jaWVzIFsgZ2V0T3JpZ2luYWxFdmVudCwgZ2V0UG9pbnRlckRhdGEgXVxuICovXG5cbmltcG9ydCB7IGdldE9yaWdpbmFsRXZlbnQgfSBmcm9tICcuL2dldF9vcmlnaW5hbF9ldmVudCc7XG5pbXBvcnQgeyBnZXRQb2ludGVyRGF0YSB9IGZyb20gJy4vZ2V0X3BvaW50ZXJfZGF0YSc7XG5cbi8qKlxuICogR2V0IHBvaW50ZXIvZmluZ2VyIHBvc2l0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gZXZ0OiBldmVudCBvYmplY3RcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9OiBwb3NpdGlvbnt4LCB5fVxuICovXG5leHBvcnQgbGV0IGdldFBvc2l0aW9uID0gKGV2dCkgPT4ge1xuICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgIGxldCBkYXRhID0gZ2V0UG9pbnRlckRhdGEoZXZ0KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGRhdGEuY2xpZW50WCxcbiAgICAgICAgeTogZGF0YS5jbGllbnRZXG4gICAgfTtcbn07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy9nZXRfcG9zaXRpb24uanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBleHBvcnQge0Z1bmN0aW9ufSBwaWNrSW5SYW5nZVxuICovXG5cbi8qKlxuICogUGljayB2YWx1ZSBpbiByYW5nZSBbbWluLCBtYXhdXG4gKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbbWluXVxuICogQHBhcmFtIHtOdW1iZXJ9IFttYXhdXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5leHBvcnQgbGV0IHBpY2tJblJhbmdlID0gKHZhbHVlLCBtaW4gPSAwLCBtYXggPSAwKSA9PiBNYXRoLm1heChtaW4sIE1hdGgubWluKHZhbHVlLCBtYXgpKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3V0aWxzL3BpY2tfaW5fcmFuZ2UuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3NiX2xpc3QnO1xuZXhwb3J0ICogZnJvbSAnLi9vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vc2VsZWN0b3JzJztcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQGV4cG9ydCB7U3RyaW5nfSBzZWxlY3RvcnNcbiAqL1xuXG5leHBvcnQgY29uc3Qgc2VsZWN0b3JzID0gJ3Njcm9sbGJhciwgW3Njcm9sbGJhcl0sIFtkYXRhLXNjcm9sbGJhcl0nO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3NoYXJlZC9zZWxlY3RvcnMuanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3VwZGF0ZSc7XG5leHBvcnQgKiBmcm9tICcuL2Rlc3Ryb3knO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfc2l6ZSc7XG5leHBvcnQgKiBmcm9tICcuL2xpc3RlbmVyJztcbmV4cG9ydCAqIGZyb20gJy4vc2Nyb2xsX3RvJztcbmV4cG9ydCAqIGZyb20gJy4vc2V0X29wdGlvbnMnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfcG9zaXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi90b2dnbGVfdHJhY2snO1xuZXhwb3J0ICogZnJvbSAnLi9pbmZpbml0ZV9zY3JvbGwnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfY29udGVudF9lbGVtJztcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gdXBkYXRlXG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UsIHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFVwZGF0ZSBzY3JvbGxiYXJzIGFwcGVhcmFuY2VcbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGFzeW5jOiB1cGRhdGUgYXN5bmNocm9ub3VzXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oYXN5bmMgPSB0cnVlKSB7XG4gICAgbGV0IHVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fX3VwZGF0ZUJvdW5kaW5nKCk7XG5cbiAgICAgICAgbGV0IHNpemUgPSB0aGlzLmdldFNpemUoKTtcblxuICAgICAgICB0aGlzLl9fcmVhZG9ubHkoJ3NpemUnLCBzaXplKTtcblxuICAgICAgICBsZXQgbmV3TGltaXQgPSB7XG4gICAgICAgICAgICB4OiBzaXplLmNvbnRlbnQud2lkdGggLSBzaXplLmNvbnRhaW5lci53aWR0aCxcbiAgICAgICAgICAgIHk6IHNpemUuY29udGVudC5oZWlnaHQgLSBzaXplLmNvbnRhaW5lci5oZWlnaHRcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5saW1pdCAmJlxuICAgICAgICAgICAgbmV3TGltaXQueCA9PT0gdGhpcy5saW1pdC54ICYmXG4gICAgICAgICAgICBuZXdMaW1pdC55ID09PSB0aGlzLmxpbWl0LnkpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9fcmVhZG9ubHkoJ2xpbWl0JywgbmV3TGltaXQpO1xuXG4gICAgICAgIGxldCB7IHhBeGlzLCB5QXhpcyB9ID0gdGhpcy50YXJnZXRzO1xuXG4gICAgICAgIC8vIGhpZGUgc2Nyb2xsYmFyIGlmIGNvbnRlbnQgc2l6ZSBsZXNzIHRoYW4gY29udGFpbmVyXG4gICAgICAgIHNldFN0eWxlKHhBeGlzLnRyYWNrLCB7XG4gICAgICAgICAgICAnZGlzcGxheSc6IHNpemUuY29udGVudC53aWR0aCA8PSBzaXplLmNvbnRhaW5lci53aWR0aCA/ICdub25lJyA6ICdibG9jaydcbiAgICAgICAgfSk7XG4gICAgICAgIHNldFN0eWxlKHlBeGlzLnRyYWNrLCB7XG4gICAgICAgICAgICAnZGlzcGxheSc6IHNpemUuY29udGVudC5oZWlnaHQgPD0gc2l6ZS5jb250YWluZXIuaGVpZ2h0ID8gJ25vbmUnIDogJ2Jsb2NrJ1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyB1c2UgcGVyY2VudGFnZSB2YWx1ZSBmb3IgdGh1bWJcbiAgICAgICAgc2V0U3R5bGUoeEF4aXMudGh1bWIsIHtcbiAgICAgICAgICAgICd3aWR0aCc6IGAke3BpY2tJblJhbmdlKHNpemUuY29udGFpbmVyLndpZHRoIC8gc2l6ZS5jb250ZW50LndpZHRoLCAwLCAxKSAqIDEwMH0lYFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0U3R5bGUoeUF4aXMudGh1bWIsIHtcbiAgICAgICAgICAgICdoZWlnaHQnOiBgJHtwaWNrSW5SYW5nZShzaXplLmNvbnRhaW5lci5oZWlnaHQgLyBzaXplLmNvbnRlbnQuaGVpZ2h0LCAwLCAxKSAqIDEwMH0lYFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLl9fc2V0VGh1bWJQb3NpdGlvbigpO1xuICAgIH07XG5cbiAgICBpZiAoYXN5bmMpIHtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdXBkYXRlKCk7XG4gICAgfVxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3VwZGF0ZS5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGRlc3Ryb3lcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgc2JMaXN0IH0gZnJvbSAnLi4vc2hhcmVkJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogUmVtb3ZlIGFsbCBzY3JvbGxiYXIgbGlzdGVuZXJzIGFuZCBldmVudCBoYW5kbGVyc1xuICogUmVzZXRcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBfX2xpc3RlbmVycywgX19oYW5kbGVycywgdGFyZ2V0cyB9ID0gdGhpcztcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgY29udGVudCB9ID0gdGFyZ2V0cztcblxuICAgIF9faGFuZGxlcnMuZm9yRWFjaCgoeyBldnQsIGVsZW0sIGhhbmRsZXIgfSkgPT4ge1xuICAgICAgICBlbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZ0LCBoYW5kbGVyKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2Nyb2xsVG8oMCwgMCwgMzAwLCAoKSA9PiB7XG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX190aW1lcklELnNjcm9sbEFuaW1hdGlvbik7XG4gICAgICAgIF9faGFuZGxlcnMubGVuZ3RoID0gX19saXN0ZW5lcnMubGVuZ3RoID0gMDtcblxuICAgICAgICAvLyByZXNldCBzY3JvbGwgcG9zaXRpb25cbiAgICAgICAgc2V0U3R5bGUoY29udGFpbmVyLCB7XG4gICAgICAgICAgICBvdmVyZmxvdzogJydcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCA9IGNvbnRhaW5lci5zY3JvbGxMZWZ0ID0gMDtcblxuICAgICAgICAvLyByZXNldCBjb250ZW50XG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gWy4uLmNvbnRlbnQuY2hpbGRyZW5dO1xuXG4gICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcblxuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKChlbCkgPT4gY29udGFpbmVyLmFwcGVuZENoaWxkKGVsKSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGZvcm0gc2JMaXN0XG4gICAgICAgIHNiTGlzdC5kZWxldGUoY29udGFpbmVyKTtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9kZXN0cm95LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gZ2V0U2l6ZVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBHZXQgY29udGFpbmVyIGFuZCBjb250ZW50IHNpemVcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9OiBhbiBvYmplY3QgY29udGFpbnMgY29udGFpbmVyIGFuZCBjb250ZW50J3Mgd2lkdGggYW5kIGhlaWdodFxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmdldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgY29udGFpbmVyID0gdGhpcy50YXJnZXRzLmNvbnRhaW5lcjtcbiAgICBsZXQgY29udGVudCA9IHRoaXMudGFyZ2V0cy5jb250ZW50O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udGFpbmVyOiB7XG4gICAgICAgICAgICAvLyByZXF1aXJlcyBgb3ZlcmZsb3c6IGhpZGRlbmBcbiAgICAgICAgICAgIHdpZHRoOiBjb250YWluZXIuY2xpZW50V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNvbnRhaW5lci5jbGllbnRIZWlnaHRcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgLy8gYm9yZGVyIHdpZHRoIHNob3VsZCBiZSBpbmNsdWRlZFxuICAgICAgICAgICAgd2lkdGg6IGNvbnRlbnQub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGNvbnRlbnQub2Zmc2V0SGVpZ2h0XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2dldF9zaXplLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gYWRkTGlzdGVuZXJcbiAqICAgICAgICAgICAge0Z1bmN0aW9ufSByZW1vdmVMaXN0ZW5lclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBBZGQgc2Nyb2xsaW5nIGxpc3RlbmVyXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2I6IGxpc3RlbmVyXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbihjYikge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIHRoaXMuX19saXN0ZW5lcnMucHVzaChjYik7XG59O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFJlbW92ZSBzcGVjaWZpYyBsaXN0ZW5lciBmcm9tIGFsbCBsaXN0ZW5lcnNcbiAqIEBwYXJhbSB7dHlwZX0gcGFyYW06IGRlc2NyaXB0aW9uXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihjYikge1xuICAgIGlmICh0eXBlb2YgY2IgIT09ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgIHRoaXMuX19saXN0ZW5lcnMuc29tZSgoZm4sIGlkeCwgYWxsKSA9PiB7XG4gICAgICAgIHJldHVybiBmbiA9PT0gY2IgJiYgYWxsLnNwbGljZShpZHgsIDEpO1xuICAgIH0pO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2xpc3RlbmVyLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gc2Nyb2xsVG9cbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSwgYnVpbGRDdXJ2ZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBTY3JvbGxpbmcgc2Nyb2xsYmFyIHRvIHBvc2l0aW9uIHdpdGggdHJhbnNpdGlvblxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeF06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB4IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbeV06IHNjcm9sbGJhciBwb3NpdGlvbiBpbiB5IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbZHVyYXRpb25dOiB0cmFuc2l0aW9uIGR1cmF0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdOiBjYWxsYmFja1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNjcm9sbFRvID0gZnVuY3Rpb24oeCA9IHRoaXMub2Zmc2V0LngsIHkgPSB0aGlzLm9mZnNldC55LCBkdXJhdGlvbiA9IDAsIGNiID0gbnVsbCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgb2Zmc2V0LFxuICAgICAgICBsaW1pdCxcbiAgICAgICAgdmVsb2NpdHksXG4gICAgICAgIF9fdGltZXJJRFxuICAgIH0gPSB0aGlzO1xuXG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoX190aW1lcklELnNjcm9sbFRvKTtcbiAgICBjYiA9IHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJyA/IGNiIDogKCkgPT4ge307XG5cbiAgICBjb25zdCBzdGFydFggPSBvZmZzZXQueDtcbiAgICBjb25zdCBzdGFydFkgPSBvZmZzZXQueTtcblxuICAgIGNvbnN0IGRpc1ggPSBwaWNrSW5SYW5nZSh4LCAwLCBsaW1pdC54KSAtIHN0YXJ0WDtcbiAgICBjb25zdCBkaXNZID0gcGlja0luUmFuZ2UoeSwgMCwgbGltaXQueSkgLSBzdGFydFk7XG5cbiAgICBjb25zdCBjdXJ2ZVggPSBidWlsZEN1cnZlKGRpc1gsIGR1cmF0aW9uKTtcbiAgICBjb25zdCBjdXJ2ZVkgPSBidWlsZEN1cnZlKGRpc1ksIGR1cmF0aW9uKTtcblxuICAgIGxldCBmcmFtZSA9IDAsIHRvdGFsRnJhbWUgPSBjdXJ2ZVgubGVuZ3RoO1xuXG4gICAgbGV0IHNjcm9sbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKGZyYW1lID09PSB0b3RhbEZyYW1lKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHgsIHkpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjYih0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihzdGFydFggKyBjdXJ2ZVhbZnJhbWVdLCBzdGFydFkgKyBjdXJ2ZVlbZnJhbWVdKTtcblxuICAgICAgICBmcmFtZSsrO1xuXG4gICAgICAgIF9fdGltZXJJRC5zY3JvbGxUbyA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShzY3JvbGwpO1xuICAgIH07XG5cbiAgICBzY3JvbGwoKTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9zY3JvbGxfdG8uanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzZXRPcHRpb25zXG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgT1BUSU9OX0xJTUlUIH0gZnJvbSAnLi4vc2hhcmVkLyc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogU2V0IHNjcm9sbGJhciBvcHRpb25zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucyA9IHt9KSB7XG4gICAgT2JqZWN0LmtleXMob3B0aW9ucykuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICBpZiAoaXNOYU4ocGFyc2VGbG9hdChvcHRpb25zW3Byb3BdKSkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zW3Byb3BdO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFPUFRJT05fTElNSVQuaGFzT3duUHJvcGVydHkocHJvcCkpIHJldHVybjtcblxuICAgICAgICBvcHRpb25zW3Byb3BdID0gcGlja0luUmFuZ2Uob3B0aW9uc1twcm9wXSwgLi4uT1BUSU9OX0xJTUlUW3Byb3BdKTtcbiAgICB9KTtcblxuICAgIE9iamVjdC5hc3NpZ24odGhpcy5vcHRpb25zLCBvcHRpb25zKTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9zZXRfb3B0aW9ucy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IHNldFBvc2l0aW9uXG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UsIHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIFNldCBzY3JvbGxiYXIgcG9zaXRpb24gd2l0aG91dCB0cmFuc2l0aW9uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFt4XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHggYXhpc1xuICogQHBhcmFtIHtOdW1iZXJ9IFt5XTogc2Nyb2xsYmFyIHBvc2l0aW9uIGluIHkgYXhpc1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCA9IHRoaXMub2Zmc2V0LngsIHkgPSB0aGlzLm9mZnNldC55KSB7XG4gICAgdGhpcy5fX3VwZGF0ZVRocm90dGxlKCk7XG5cbiAgICBjb25zdCBzdGF0dXMgPSB7fTtcbiAgICBjb25zdCB7IG9mZnNldCwgbGltaXQsIHRhcmdldHMsIF9fbGlzdGVuZXJzIH0gPSB0aGlzO1xuXG4gICAgaWYgKE1hdGguYWJzKHggLSBvZmZzZXQueCkgPiAxKSB0aGlzLnNob3dUcmFjaygneCcpO1xuICAgIGlmIChNYXRoLmFicyh5IC0gb2Zmc2V0LnkpID4gMSkgdGhpcy5zaG93VHJhY2soJ3knKTtcblxuICAgIHggPSBwaWNrSW5SYW5nZSh4LCAwLCBsaW1pdC54KTtcbiAgICB5ID0gcGlja0luUmFuZ2UoeSwgMCwgbGltaXQueSk7XG5cbiAgICB0aGlzLmhpZGVUcmFjaygpO1xuXG4gICAgaWYgKHggPT09IG9mZnNldC54ICYmIHkgPT09IG9mZnNldC55KSByZXR1cm47XG5cbiAgICBzdGF0dXMuZGlyZWN0aW9uID0ge1xuICAgICAgICB4OiB4ID09PSBvZmZzZXQueCA/ICdub25lJyA6ICh4ID4gb2Zmc2V0LnggPyAncmlnaHQnIDogJ2xlZnQnKSxcbiAgICAgICAgeTogeSA9PT0gb2Zmc2V0LnkgPyAnbm9uZScgOiAoeSA+IG9mZnNldC55ID8gJ2Rvd24nIDogJ3VwJylcbiAgICB9O1xuXG4gICAgc3RhdHVzLmxpbWl0ID0geyAuLi5saW1pdCB9O1xuXG4gICAgb2Zmc2V0LnggPSB4O1xuICAgIG9mZnNldC55ID0geTtcbiAgICBzdGF0dXMub2Zmc2V0ID0geyAuLi5vZmZzZXQgfTtcblxuICAgIC8vIHJlc2V0IHRodW1iIHBvc2l0aW9uIGFmdGVyIG9mZnNldCB1cGRhdGVcbiAgICB0aGlzLl9fc2V0VGh1bWJQb3NpdGlvbigpO1xuXG4gICAgc2V0U3R5bGUodGFyZ2V0cy5jb250ZW50LCB7XG4gICAgICAgICctdHJhbnNmb3JtJzogYHRyYW5zbGF0ZTNkKCR7LXh9cHgsICR7LXl9cHgsIDApYFxuICAgIH0pO1xuXG4gICAgLy8gaW52b2tlIGFsbCBsaXN0ZW5lcnNcbiAgICBfX2xpc3RlbmVycy5mb3JFYWNoKChmbikgPT4ge1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgZm4oc3RhdHVzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2FwaXMvc2V0X3Bvc2l0aW9uLmpzXG4gKiovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGFzc2lnbiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2Fzc2lnblwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gX09iamVjdCRhc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvaGVscGVycy9leHRlbmRzLmpzXG4gKiogbW9kdWxlIGlkID0gMTEyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBzaG93VHJhY2tcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBoaWRlVHJhY2tcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGFwaVxuICogc2hvdyBzY3JvbGxiYXIgdHJhY2sgb24gZ2l2ZW4gZGlyZWN0aW9uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvbjogd2hpY2ggZGlyZWN0aW9uIG9mIHRyYWNrcyB0byBzaG93LCBkZWZhdWx0IGlzICdib3RoJ1xuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLnNob3dUcmFjayA9IGZ1bmN0aW9uKGRpcmVjdGlvbiA9ICdib3RoJykge1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCB4QXhpcywgeUF4aXMgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzY3JvbGxpbmcnKTtcblxuICAgIGlmIChkaXJlY3Rpb24gPT09ICdib3RoJykge1xuICAgICAgICB4QXhpcy50cmFjay5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgICAgIHlBeGlzLnRyYWNrLmNsYXNzTGlzdC5hZGQoJ3Nob3cnKTtcbiAgICB9XG5cbiAgICBpZiAoZGlyZWN0aW9uID09PSAneCcpIHtcbiAgICAgICAgeEF4aXMudHJhY2suY2xhc3NMaXN0LmFkZCgnc2hvdycpO1xuICAgIH1cblxuICAgIGlmIChkaXJlY3Rpb24gPT09ICd5Jykge1xuICAgICAgICB5QXhpcy50cmFjay5jbGFzc0xpc3QuYWRkKCdzaG93Jyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBoaWRlIHRyYWNrIHdpdGggMzAwbXMgZGVib3VuY2VcbiAqL1xuU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZS5oaWRlVHJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IHRhcmdldHMsIF9fdGltZXJJRCB9ID0gdGhpcztcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgeEF4aXMsIHlBeGlzIH0gPSB0YXJnZXRzO1xuXG4gICAgY2xlYXJUaW1lb3V0KF9fdGltZXJJRC50cmFjayk7XG5cbiAgICBfX3RpbWVySUQudHJhY2sgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbGluZycpO1xuICAgICAgICB4QXhpcy50cmFjay5jbGFzc0xpc3QucmVtb3ZlKCdzaG93Jyk7XG4gICAgICAgIHlBeGlzLnRyYWNrLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKTtcbiAgICB9LCAzMDApO1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL3RvZ2dsZV90cmFjay5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IGluZmluaXRlU2Nyb2xsXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBhcGlcbiAqIENyZWF0ZSBpbmZpbml0ZSBzY3JvbGwgbGlzdGVuZXJcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYjogaW5maW5pdGUgc2Nyb2xsIGFjdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IFt0aHJlc2hvbGRdOiBpbmZpbml0ZSBzY3JvbGwgdGhyZXNob2xkKHRvIGJvdHRvbSksIGRlZmF1bHQgaXMgNTAocHgpXG4gKi9cblNtb290aFNjcm9sbGJhci5wcm90b3R5cGUuaW5maW5pdGVTY3JvbGwgPSBmdW5jdGlvbihjYiwgdGhyZXNob2xkID0gNTApIHtcbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICBsZXQgbGFzdE9mZnNldCA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMFxuICAgIH07XG5cbiAgICBsZXQgZW50ZXJlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5hZGRMaXN0ZW5lcigoc3RhdHVzKSA9PiB7XG4gICAgICAgIGxldCB7IG9mZnNldCwgbGltaXQgfSA9IHN0YXR1cztcblxuICAgICAgICBpZiAobGltaXQueSAtIG9mZnNldC55IDw9IHRocmVzaG9sZCAmJiBvZmZzZXQueSA+IGxhc3RPZmZzZXQueSAmJiAhZW50ZXJlZCkge1xuICAgICAgICAgICAgZW50ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGNiKHN0YXR1cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpbWl0LnkgLSBvZmZzZXQueSA+IHRocmVzaG9sZCkge1xuICAgICAgICAgICAgZW50ZXJlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdE9mZnNldCA9IG9mZnNldDtcbiAgICB9KTtcbn07XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvYXBpcy9pbmZpbml0ZV9zY3JvbGwuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBnZXRDb250ZW50RWxlbVxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAYXBpXG4gKiBHZXQgc2Nyb2xsIGNvbnRlbnQgZWxlbWVudFxuICovXG5TbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLmdldENvbnRlbnRFbGVtID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGFyZ2V0cy5jb250ZW50O1xufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9hcGlzL2dldF9jb250ZW50X2VsZW0uanNcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL2RyYWcnO1xuZXhwb3J0ICogZnJvbSAnLi90b3VjaCc7XG5leHBvcnQgKiBmcm9tICcuL21vdXNlJztcbmV4cG9ydCAqIGZyb20gJy4vd2hlZWwnO1xuZXhwb3J0ICogZnJvbSAnLi9yZXNpemUnO1xuZXhwb3J0ICogZnJvbSAnLi9zZWxlY3QnO1xuZXhwb3J0ICogZnJvbSAnLi9rZXlib2FyZCc7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2luZGV4LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19kcmFnSGFuZGxlclxuICovXG5cbiBpbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbiBpbXBvcnQge1xuICAgIGdldE9yaWdpbmFsRXZlbnQsXG4gICAgZ2V0UG9zaXRpb24sXG4gICAgZ2V0VG91Y2hJRCxcbiAgICBwaWNrSW5SYW5nZSxcbiAgICBzZXRTdHlsZVxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbiBleHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuIGxldCBfX2RyYWdIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIsIGNvbnRlbnQgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGxldCBpc0RyYWcgPSBmYWxzZTtcbiAgICBsZXQgYW5pbWF0aW9uID0gdW5kZWZpbmVkO1xuICAgIGxldCB0YXJnZXRIZWlnaHQgPSB1bmRlZmluZWQ7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19faXNEcmFnJywge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNEcmFnO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgbGV0IHNjcm9sbCA9ICh7IHgsIHkgfSkgPT4ge1xuICAgICAgICBpZiAoIXggJiYgIXkpIHJldHVybjtcblxuICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoeCwgeSk7XG5cbiAgICAgICAgYW5pbWF0aW9uID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIHNjcm9sbCh7IHgsIHkgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQoZG9jdW1lbnQsICdkcmFnb3ZlciBtb3VzZW1vdmUgdG91Y2htb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRHJhZyB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBkaXIgPSB0aGlzLl9fZ2V0UG9pbnRlclRyZW5kKGV2dCwgdGFyZ2V0SGVpZ2h0KTtcblxuICAgICAgICBzY3JvbGwoZGlyKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdkcmFnc3RhcnQnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIHNldFN0eWxlKGNvbnRlbnQsIHtcbiAgICAgICAgICAgICdwb2ludGVyLWV2ZW50cyc6ICdhdXRvJ1xuICAgICAgICB9KTtcblxuICAgICAgICB0YXJnZXRIZWlnaHQgPSBldnQudGFyZ2V0LmNsaWVudEhlaWdodDtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgICAgdGhpcy5fX3VwZGF0ZUJvdW5kaW5nKCk7XG4gICAgICAgIGlzRHJhZyA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5fX2FkZEV2ZW50KGRvY3VtZW50LCAnZHJhZ2VuZCBtb3VzZXVwIHRvdWNoZW5kIGJsdXInLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgICBpc0RyYWcgPSBmYWxzZTtcbiAgICB9KTtcbiB9O1xuXG4gT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2RyYWdIYW5kbGVyJywge1xuICAgICB2YWx1ZTogX19kcmFnSGFuZGxlcixcbiAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuIH0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL2RyYWcuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3RvdWNoSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHtcbiAgICBnZXRPcmlnaW5hbEV2ZW50LFxuICAgIGdldFBvc2l0aW9uLFxuICAgIGdldFRvdWNoSUQsXG4gICAgcGlja0luUmFuZ2Vcbn0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuY29uc3QgRUFTSU5HX0RVUkFUSU9OID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvYW5kcm9pZC9pKSA/IDE1MDAgOiA3NTA7XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBUb3VjaCBldmVudCBoYW5kbGVycyBidWlsZGVyXG4gKi9cbmxldCBfX3RvdWNoSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG5cbiAgICBsZXQgbGFzdFRvdWNoVGltZSwgbGFzdFRvdWNoSUQ7XG4gICAgbGV0IG1vdmVWZWxvY2l0eSA9IHt9LCBsYXN0VG91Y2hQb3MgPSB7fSwgdG91Y2hSZWNvcmRzID0ge307XG5cbiAgICBsZXQgdXBkYXRlUmVjb3JkcyA9IChldnQpID0+IHtcbiAgICAgICAgY29uc3QgdG91Y2hMaXN0ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpLnRvdWNoZXM7XG5cbiAgICAgICAgT2JqZWN0LmtleXModG91Y2hMaXN0KS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIC8vIHJlY29yZCBhbGwgdG91Y2hlcyB0aGF0IHdpbGwgYmUgcmVzdG9yZWRcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdsZW5ndGgnKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHRvdWNoID0gdG91Y2hMaXN0W2tleV07XG5cbiAgICAgICAgICAgIHRvdWNoUmVjb3Jkc1t0b3VjaC5pZGVudGlmaWVyXSA9IGdldFBvc2l0aW9uKHRvdWNoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICd0b3VjaHN0YXJ0JywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fX2lzRHJhZykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHsgbW92ZW1lbnQgfSA9IHRoaXM7XG5cbiAgICAgICAgdXBkYXRlUmVjb3JkcyhldnQpO1xuXG4gICAgICAgIGxhc3RUb3VjaFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICBsYXN0VG91Y2hJRCA9IGdldFRvdWNoSUQoZXZ0KTtcbiAgICAgICAgbGFzdFRvdWNoUG9zID0gZ2V0UG9zaXRpb24oZXZ0KTtcblxuICAgICAgICAvLyBzdG9wIHNjcm9sbGluZ1xuICAgICAgICBtb3ZlbWVudC54ID0gbW92ZW1lbnQueSA9IDA7XG4gICAgICAgIG1vdmVWZWxvY2l0eS54ID0gbW92ZVZlbG9jaXR5LnkgPSAwO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3RvdWNobW92ZScsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpIHx8IHRoaXMuX19pc0RyYWcpIHJldHVybjtcblxuICAgICAgICB1cGRhdGVSZWNvcmRzKGV2dCk7XG5cbiAgICAgICAgY29uc3QgdG91Y2hJRCA9IGdldFRvdWNoSUQoZXZ0KTtcbiAgICAgICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0IH0gPSB0aGlzO1xuXG4gICAgICAgIGlmIChsYXN0VG91Y2hJRCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyByZXNldCBsYXN0IHRvdWNoIGluZm8gZnJvbSByZWNvcmRzXG4gICAgICAgICAgICBsYXN0VG91Y2hJRCA9IHRvdWNoSUQ7XG5cbiAgICAgICAgICAgIC8vIGRvbid0IG5lZWQgZXJyb3IgaGFuZGxlclxuICAgICAgICAgICAgbGFzdFRvdWNoVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBsYXN0VG91Y2hQb3MgPSB0b3VjaFJlY29yZHNbdG91Y2hJRF07XG4gICAgICAgIH0gZWxzZSBpZiAodG91Y2hJRCAhPT0gbGFzdFRvdWNoSUQpIHtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgbXVsdGktdG91Y2ggYm91bmNpbmdcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGFzdFRvdWNoUG9zKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIGxhc3RUb3VjaFRpbWU7XG4gICAgICAgIGxldCB7IHg6IGxhc3RYLCB5OiBsYXN0WSB9ID0gbGFzdFRvdWNoUG9zO1xuICAgICAgICBsZXQgeyB4OiBjdXJYLCB5OiBjdXJZIH0gPSBsYXN0VG91Y2hQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgMTsgLy8gZml4IEluZmluaXR5IGVycm9yXG5cbiAgICAgICAgbW92ZVZlbG9jaXR5LnggPSAobGFzdFggLSBjdXJYKSAvIGR1cmF0aW9uO1xuICAgICAgICBtb3ZlVmVsb2NpdHkueSA9IChsYXN0WSAtIGN1clkpIC8gZHVyYXRpb247XG5cbiAgICAgICAgbGV0IGRlc3RYID0gcGlja0luUmFuZ2UobGFzdFggLSBjdXJYICsgb2Zmc2V0LngsIDAsIGxpbWl0LngpO1xuICAgICAgICBsZXQgZGVzdFkgPSBwaWNrSW5SYW5nZShsYXN0WSAtIGN1clkgKyBvZmZzZXQueSwgMCwgbGltaXQueSk7XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGRlc3RYIC0gb2Zmc2V0LngpIDwgMSAmJiBNYXRoLmFicyhkZXN0WSAtIG9mZnNldC55KSA8IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9fdXBkYXRlVGhyb3R0bGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oZGVzdFgsIGRlc3RZKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICd0b3VjaGVuZCcsIChldnQpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX19pZ25vcmVFdmVudChldnQpIHx8IHRoaXMuX19pc0RyYWcpIHJldHVybjtcblxuICAgICAgICAvLyByZWxlYXNlIGN1cnJlbnQgdG91Y2hcbiAgICAgICAgZGVsZXRlIHRvdWNoUmVjb3Jkc1tsYXN0VG91Y2hJRF07XG4gICAgICAgIGxhc3RUb3VjaElEID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGxldCB7IHgsIHkgfSA9IG1vdmVWZWxvY2l0eTtcblxuICAgICAgICB0aGlzLl9fc2V0TW92ZW1lbnQoXG4gICAgICAgICAgICB4ID8geCAvIE1hdGguYWJzKHgpICogTWF0aC5zcXJ0KE1hdGguYWJzKHgpICogMWUzKSAqIDIwIDogMCxcbiAgICAgICAgICAgIHkgPyB5IC8gTWF0aC5hYnMoeSkgKiBNYXRoLnNxcnQoTWF0aC5hYnMoeSkgKiAxZTMpICogMjAgOiAwXG4gICAgICAgICk7XG5cbiAgICAgICAgbW92ZVZlbG9jaXR5LnggPSBtb3ZlVmVsb2NpdHkueSA9IDA7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fdG91Y2hIYW5kbGVyJywge1xuICAgIHZhbHVlOiBfX3RvdWNoSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3RvdWNoLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19tb3VzZUhhbmRsZXJcbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IGdldFBvc2l0aW9uLCBnZXRUb3VjaElELCBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBNb3VzZSBldmVudCBoYW5kbGVycyBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICovXG5sZXQgX19tb3VzZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGxldCBpc01vdXNlRG93biwgaXNNb3VzZU1vdmUsIHN0YXJ0T2Zmc2V0VG9UaHVtYiwgc3RhcnRUcmFja0RpcmVjdGlvbiwgY29udGFpbmVyUmVjdDtcblxuICAgIGxldCBnZXRUcmFja0RpciA9IChjbGFzc05hbWUpID0+IHtcbiAgICAgICAgbGV0IG1hdGNoZXMgPSBjbGFzc05hbWUubWF0Y2goL3Njcm9sbGJhclxcLSg/OnRyYWNrfHRodW1iKVxcLShbeHldKS8pO1xuXG4gICAgICAgIHJldHVybiBtYXRjaGVzICYmIG1hdGNoZXNbMV07XG4gICAgfTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdjbGljaycsIChldnQpID0+IHtcbiAgICAgICAgaWYgKGlzTW91c2VNb3ZlIHx8ICEvc2Nyb2xsYmFyLXRyYWNrLy50ZXN0KGV2dC50YXJnZXQuY2xhc3NOYW1lKSB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCB0cmFjayA9IGV2dC50YXJnZXQ7XG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBnZXRUcmFja0Rpcih0cmFjay5jbGFzc05hbWUpO1xuICAgICAgICBsZXQgcmVjdCA9IHRyYWNrLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgY2xpY2tQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgICAgIGNvbnN0IHsgc2l6ZSwgb2Zmc2V0IH0gPSB0aGlzO1xuXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICd4Jykge1xuICAgICAgICAgICAgLy8gdXNlIHBlcmNlbnRhZ2UgdmFsdWVcbiAgICAgICAgICAgIGxldCB0aHVtYlNpemUgPSBwaWNrSW5SYW5nZShzaXplLmNvbnRhaW5lci53aWR0aCAvIHNpemUuY29udGVudC53aWR0aCwgMCwgMSk7XG4gICAgICAgICAgICBsZXQgY2xpY2tPZmZzZXQgPSAoY2xpY2tQb3MueCAtIHJlY3QubGVmdCkgLyBzaXplLmNvbnRhaW5lci53aWR0aDtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX19zZXRNb3ZlbWVudChcbiAgICAgICAgICAgICAgICAoY2xpY2tPZmZzZXQgLSB0aHVtYlNpemUgLyAyKSAqIHNpemUuY29udGVudC53aWR0aCAtIG9mZnNldC54LFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGh1bWJTaXplID0gcGlja0luUmFuZ2Uoc2l6ZS5jb250YWluZXIuaGVpZ2h0IC8gc2l6ZS5jb250ZW50LmhlaWdodCwgMCwgMSk7XG4gICAgICAgIGxldCBjbGlja09mZnNldCA9IChjbGlja1Bvcy55IC0gcmVjdC50b3ApIC8gc2l6ZS5jb250YWluZXIuaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuX19zZXRNb3ZlbWVudChcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAoY2xpY2tPZmZzZXQgLSB0aHVtYlNpemUgLyAyKSAqIHNpemUuY29udGVudC5oZWlnaHQgLSBvZmZzZXQueVxuICAgICAgICApO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ21vdXNlZG93bicsIChldnQpID0+IHtcbiAgICAgICAgaWYgKCEvc2Nyb2xsYmFyLXRodW1iLy50ZXN0KGV2dC50YXJnZXQuY2xhc3NOYW1lKSB8fCB0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkgcmV0dXJuO1xuICAgICAgICBpc01vdXNlRG93biA9IHRydWU7XG5cbiAgICAgICAgbGV0IGN1cnNvclBvcyA9IGdldFBvc2l0aW9uKGV2dCk7XG4gICAgICAgIGxldCB0aHVtYlJlY3QgPSBldnQudGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIHN0YXJ0VHJhY2tEaXJlY3Rpb24gPSBnZXRUcmFja0RpcihldnQudGFyZ2V0LmNsYXNzTmFtZSk7XG5cbiAgICAgICAgLy8gcG9pbnRlciBvZmZzZXQgdG8gdGh1bWJcbiAgICAgICAgc3RhcnRPZmZzZXRUb1RodW1iID0ge1xuICAgICAgICAgICAgeDogY3Vyc29yUG9zLnggLSB0aHVtYlJlY3QubGVmdCxcbiAgICAgICAgICAgIHk6IGN1cnNvclBvcy55IC0gdGh1bWJSZWN0LnRvcFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGNvbnRhaW5lciBib3VuZGluZyByZWN0YW5nbGVcbiAgICAgICAgY29udGFpbmVyUmVjdCA9IHRoaXMudGFyZ2V0cy5jb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9fYWRkRXZlbnQod2luZG93LCAnbW91c2Vtb3ZlJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzTW91c2VEb3duKSByZXR1cm47XG5cbiAgICAgICAgaXNNb3VzZU1vdmUgPSB0cnVlO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBsZXQgeyBzaXplLCBvZmZzZXQgfSA9IHRoaXM7XG4gICAgICAgIGxldCBjdXJzb3JQb3MgPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgICAgIGlmIChzdGFydFRyYWNrRGlyZWN0aW9uID09PSAneCcpIHtcbiAgICAgICAgICAgIC8vIGdldCBwZXJjZW50YWdlIG9mIHBvaW50ZXIgcG9zaXRpb24gaW4gdHJhY2tcbiAgICAgICAgICAgIC8vIHRoZW4gdHJhbmZvcm0gdG8gcHhcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zaXRpb24oXG4gICAgICAgICAgICAgICAgKGN1cnNvclBvcy54IC0gc3RhcnRPZmZzZXRUb1RodW1iLnggLSBjb250YWluZXJSZWN0LmxlZnQpIC8gKGNvbnRhaW5lclJlY3QucmlnaHQgLSBjb250YWluZXJSZWN0LmxlZnQpICogc2l6ZS5jb250ZW50LndpZHRoLFxuICAgICAgICAgICAgICAgIG9mZnNldC55XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkb24ndCBuZWVkIGVhc2luZ1xuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKFxuICAgICAgICAgICAgb2Zmc2V0LngsXG4gICAgICAgICAgICAoY3Vyc29yUG9zLnkgLSBzdGFydE9mZnNldFRvVGh1bWIueSAtIGNvbnRhaW5lclJlY3QudG9wKSAvIChjb250YWluZXJSZWN0LmJvdHRvbSAtIGNvbnRhaW5lclJlY3QudG9wKSAqIHNpemUuY29udGVudC5oZWlnaHRcbiAgICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIHJlbGVhc2UgbW91c2Vtb3ZlIHNweSBvbiB3aW5kb3cgbG9zdCBmb2N1c1xuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIGJsdXInLCAoKSA9PiB7XG4gICAgICAgIGlzTW91c2VEb3duID0gaXNNb3VzZU1vdmUgPSBmYWxzZTtcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19tb3VzZUhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fbW91c2VIYW5kbGVyLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9ldmVudHMvbW91c2UuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3doZWVsSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0RGVsdGEgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vLyBpcyBzdGFuZGFyZCBgd2hlZWxgIGV2ZW50IHN1cHBvcnRlZCBjaGVja1xuY29uc3QgV0hFRUxfRVZFTlQgPSAnb253aGVlbCcgaW4gd2luZG93ID8gJ3doZWVsJyA6ICdtb3VzZXdoZWVsJztcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fd2hlZWxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsIFdIRUVMX0VWRU5ULCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmIChldnQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgY29uc3QgeyBvZmZzZXQsIGxpbWl0IH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBkZWx0YSA9IGdldERlbHRhKGV2dCk7XG5cbiAgICAgICAgdGhpcy5fX2FkZE1vdmVtZW50KGRlbHRhLngsIGRlbHRhLnkpO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3doZWVsSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX193aGVlbEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy93aGVlbC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fcmVzaXplSGFuZGxlclxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIFdoZWVsIGV2ZW50IGhhbmRsZXIgYnVpbGRlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn06IGV2ZW50IGhhbmRsZXJcbiAqL1xubGV0IF9fcmVzaXplSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLl9fdXBkYXRlVGhyb3R0bGUpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3Jlc2l6ZUhhbmRsZXInLCB7XG4gICAgdmFsdWU6IF9fcmVzaXplSGFuZGxlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3Jlc2l6ZS5qc1xuICoqLyIsIi8qKlxyXG4gKiBAbW9kdWxlXHJcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3NlbGVjdEhhbmRsZXJcclxuICovXHJcblxyXG4gaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XHJcbiBpbXBvcnQge1xyXG4gICAgZ2V0T3JpZ2luYWxFdmVudCxcclxuICAgIGdldFBvc2l0aW9uLFxyXG4gICAgZ2V0VG91Y2hJRCxcclxuICAgIHBpY2tJblJhbmdlLFxyXG4gICAgc2V0U3R5bGVcclxufSBmcm9tICcuLi91dGlscy9pbmRleCc7XHJcblxyXG4gZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XHJcblxyXG4vLyB0b2RvOiBzZWxlY3QgaGFuZGxlciBmb3IgdG91Y2ggc2NyZWVuXHJcbiBsZXQgX19zZWxlY3RIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBsZXQgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgbGV0IGFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgY29udGVudCB9ID0gdGhpcy50YXJnZXRzO1xyXG5cclxuICAgIGxldCBzY3JvbGwgPSAoeyB4LCB5IH0pID0+IHtcclxuICAgICAgICBpZiAoIXggJiYgIXkpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5fX3NldE1vdmVtZW50KHgsIHkpO1xyXG5cclxuICAgICAgICBhbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICAgICAgICBzY3JvbGwoeyB4LCB5IH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBsZXQgc2V0U2VsZWN0ID0gKHZhbHVlID0gJycpID0+IHtcclxuICAgICAgICBzZXRTdHlsZShjb250YWluZXIsIHtcclxuICAgICAgICAgICAgJy11c2VyLXNlbGVjdCc6IHZhbHVlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZW1vdmUnLCAoZXZ0KSA9PiB7XHJcbiAgICAgICAgaWYgKCFpc1NlbGVjdGVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbik7XHJcblxyXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX19nZXRQb2ludGVyVHJlbmQoZXZ0KTtcclxuXHJcbiAgICAgICAgc2Nyb2xsKGRpcik7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9fYWRkRXZlbnQoY29udGVudCwgJ3NlbGVjdHN0YXJ0JywgKGV2dCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLl9faWdub3JlRXZlbnQoZXZ0KSkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0U2VsZWN0KCdub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xyXG5cclxuICAgICAgICB0aGlzLl9fdXBkYXRlQm91bmRpbmcoKTtcclxuICAgICAgICBpc1NlbGVjdGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX19hZGRFdmVudCh3aW5kb3csICdtb3VzZXVwIGJsdXInLCAoKSA9PiB7XHJcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcclxuICAgICAgICBzZXRTZWxlY3QoKTtcclxuXHJcbiAgICAgICAgaXNTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gdGVtcCBwYXRjaCBmb3IgdG91Y2ggZGV2aWNlc1xyXG4gICAgdGhpcy5fX2FkZEV2ZW50KGNvbnRhaW5lciwgJ3Njcm9sbCcsIChldnQpID0+IHtcclxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gY29udGFpbmVyLnNjcm9sbExlZnQgPSAwO1xyXG4gICAgfSk7XHJcbiB9O1xyXG5cclxuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZWxlY3RIYW5kbGVyJywge1xyXG4gICAgIHZhbHVlOiBfX3NlbGVjdEhhbmRsZXIsXHJcbiAgICAgd3JpdGFibGU6IHRydWUsXHJcbiAgICAgY29uZmlndXJhYmxlOiB0cnVlXHJcbiB9KTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZXZlbnRzL3NlbGVjdC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fa2V5Ym9hcmRIYW5kbGVyXG4gKi9cblxuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCwgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy9pbmRleCc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbi8vIGtleSBtYXBzIFtkZWx0YVgsIGRlbHRhWV1cbmNvbnN0IEtFWU1BUFMgPSB7XG4gICAgMzI6IFswLCA1XSwgICAvLyBzcGFjZVxuICAgIDM3OiBbLTEsIDBdLCAgLy8gbGVmdFxuICAgIDM4OiBbMCwgLTFdLCAgLy8gdXBcbiAgICAzOTogWzEsIDBdLCAgIC8vIHJpZ2h0XG4gICAgNDA6IFswLCAxXSAgICAvLyBkb3duXG59O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogS2V5cHJlc3MgZXZlbnQgaGFuZGxlciBidWlsZGVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvblxuICovXG5sZXQgX19rZXlib2FyZEhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy50YXJnZXRzO1xuICAgIGxldCBpc0ZvY3VzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdmb2N1cycsICgpID0+IHtcbiAgICAgICAgaXNGb2N1c2VkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdibHVyJywgKCkgPT4ge1xuICAgICAgICBpc0ZvY3VzZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX19hZGRFdmVudChjb250YWluZXIsICdrZXlkb3duJywgKGV2dCkgPT4ge1xuICAgICAgICBpZiAoIWlzRm9jdXNlZCkgcmV0dXJuO1xuXG4gICAgICAgIGV2dCA9IGdldE9yaWdpbmFsRXZlbnQoZXZ0KTtcblxuICAgICAgICBjb25zdCBrZXlDb2RlID0gZXZ0LmtleUNvZGUgfHwgZXZ0LndoaWNoO1xuXG4gICAgICAgIGlmICghS0VZTUFQUy5oYXNPd25Qcm9wZXJ0eShrZXlDb2RlKSkgcmV0dXJuO1xuXG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHsgc3BlZWQgfSA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgY29uc3QgW3gsIHldID0gS0VZTUFQU1trZXlDb2RlXTtcblxuICAgICAgICB0aGlzLl9fYWRkTW92ZW1lbnQoeCAqIDQwLCB5ICogNDApO1xuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2tleWJvYXJkSGFuZGxlcicsIHtcbiAgICB2YWx1ZTogX19rZXlib2FyZEhhbmRsZXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2V2ZW50cy9rZXlib2FyZC5qc1xuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2dldEl0ZXJhdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3JcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgX2lzSXRlcmFibGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkge1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2kgPSBfZ2V0SXRlcmF0b3IoYXJyKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBfZCA9IHRydWU7XG4gICAgICBfZSA9IGVycjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIF9hcnI7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfSBlbHNlIGlmIChfaXNJdGVyYWJsZShPYmplY3QoYXJyKSkpIHtcbiAgICAgIHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9oZWxwZXJzL3NsaWNlZC10by1hcnJheS5qc1xuICoqIG1vZHVsZSBpZCA9IDEyNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vYmFiZWwtcnVudGltZS9jb3JlLWpzL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTI1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJyZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL2NvcmUuaXMtaXRlcmFibGUnKTtcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9iYWJlbC1ydW50aW1lL34vY29yZS1qcy9saWJyYXJ5L2ZuL2lzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTI2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi8kLmNsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vJC5pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmNvcmUnKS5pc0l0ZXJhYmxlID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTyA9IE9iamVjdChpdCk7XG4gIHJldHVybiBPW0lURVJBVE9SXSAhPT0gdW5kZWZpbmVkXG4gICAgfHwgJ0BAaXRlcmF0b3InIGluIE9cbiAgICB8fCBJdGVyYXRvcnMuaGFzT3duUHJvcGVydHkoY2xhc3NvZihPKSk7XG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2JhYmVsLXJ1bnRpbWUvfi9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmlzLWl0ZXJhYmxlLmpzXG4gKiogbW9kdWxlIGlkID0gMTI3XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJleHBvcnQgKiBmcm9tICcuL3JlYWRvbmx5JztcbmV4cG9ydCAqIGZyb20gJy4vYWRkX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaWdub3JlX2V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vaW5pdF9zY3JvbGxiYXInO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfZGVsdGFfbGltaXQnO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfY2hpbGRyZW4nO1xuZXhwb3J0ICogZnJvbSAnLi91cGRhdGVfYm91bmRpbmcnO1xuZXhwb3J0ICogZnJvbSAnLi9nZXRfcG9pbnRlcl90cmVuZCc7XG5leHBvcnQgKiBmcm9tICcuL3NldF90aHVtYl9wb3NpdGlvbic7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaW5kZXguanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX3JlYWRvbmx5XG4gKiBAZGVwZW5kZW5jaWVzIFsgU21vb3RoU2Nyb2xsYmFyIF1cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cblxuLyoqXG4gKiBAbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIGNyZWF0ZSByZWFkb25seSBwcm9wZXJ0eVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge0FueX0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gX19yZWFkb25seShwcm9wLCB2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgcHJvcCwge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3JlYWRvbmx5Jywge1xuICAgIHZhbHVlOiBfX3JlYWRvbmx5LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvcmVhZG9ubHkuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZEV2ZW50XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZEV2ZW50KGVsZW0sIGV2ZW50cywgZm4pIHtcbiAgICBpZiAoIWVsZW0gfHwgdHlwZW9mIGVsZW0uYWRkRXZlbnRMaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBleHBlY3QgZWxlbSB0byBiZSBhIERPTSBlbGVtZW50LCBidXQgZ290ICR7ZWxlbX1gKTtcbiAgICB9XG5cbiAgICBldmVudHMuc3BsaXQoL1xccysvZykuZm9yRWFjaCgoZXZ0KSA9PiB7XG4gICAgICAgIHRoaXMuX19oYW5kbGVycy5wdXNoKHsgZXZ0LCBlbGVtLCBmbiB9KTtcblxuICAgICAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZ0LCBmbik7XG4gICAgfSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fYWRkRXZlbnQnLCB7XG4gICAgdmFsdWU6IF9fYWRkRXZlbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvYWRkX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19pZ25vcmVFdmVudFxuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgZ2V0T3JpZ2luYWxFdmVudCB9IGZyb20gJy4uL3V0aWxzL2luZGV4JztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9faWdub3JlRXZlbnQoZXZ0ID0ge30pIHtcbiAgICBjb25zdCB7IHRhcmdldCB9ID0gZ2V0T3JpZ2luYWxFdmVudChldnQpO1xuXG4gICAgaWYgKCF0YXJnZXQgfHwgdGFyZ2V0ID09PSB3aW5kb3cgfHwgIXRoaXMuY2hpbGRyZW4pIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiAoIWV2dC50eXBlLm1hdGNoKC9kcmFnLykgJiYgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpfHxcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5zb21lKChzYikgPT4gc2IuY29udGFpbnModGFyZ2V0KSk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19faWdub3JlRXZlbnQnLCB7XG4gICAgdmFsdWU6IF9faWdub3JlRXZlbnQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvaWdub3JlX2V2ZW50LmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19pbml0U2Nyb2xsYmFyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5cbi8qKlxuICogQG1ldGhvZFxuICogQGludGVybmFsXG4gKiBpbml0aWFsaXplIHNjcm9sbGJhclxuICpcbiAqIFRoaXMgbWV0aG9kIHdpbGwgYXR0YWNoIHNldmVyYWwgbGlzdGVuZXJzIHRvIGVsZW1lbnRzXG4gKiBhbmQgY3JlYXRlIGEgZGVzdHJveSBtZXRob2QgdG8gcmVtb3ZlIGxpc3RlbmVyc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb246IGFzIGlzIGV4cGxhaW5lZCBpbiBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBfX2luaXRTY3JvbGxiYXIoKSB7XG4gICAgdGhpcy51cGRhdGUoKTsgLy8gaW5pdGlhbGl6ZSB0aHVtYiBwb3NpdGlvblxuXG4gICAgdGhpcy5fX2tleWJvYXJkSGFuZGxlcigpO1xuICAgIHRoaXMuX19yZXNpemVIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3NlbGVjdEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fbW91c2VIYW5kbGVyKCk7XG4gICAgdGhpcy5fX3RvdWNoSGFuZGxlcigpO1xuICAgIHRoaXMuX193aGVlbEhhbmRsZXIoKTtcbiAgICB0aGlzLl9fZHJhZ0hhbmRsZXIoKTtcblxuICAgIHRoaXMuX19yZW5kZXIoKTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19pbml0U2Nyb2xsYmFyJywge1xuICAgIHZhbHVlOiBfX2luaXRTY3JvbGxiYXIsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9pbml0X3Njcm9sbGJhci5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fdXBkYXRlQ2hpbGRyZW5cbiAqL1xuXG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcbmltcG9ydCB7IHNlbGVjdG9ycyB9IGZyb20gJy4uL3NoYXJlZC9zZWxlY3RvcnMnO1xuXG5leHBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfTtcblxuZnVuY3Rpb24gX191cGRhdGVDaGlsZHJlbigpIHtcbiAgICB0aGlzLl9fcmVhZG9ubHkoJ2NoaWxkcmVuJywgWy4uLnRoaXMudGFyZ2V0cy5jb250ZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKV0pO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3VwZGF0ZUNoaWxkcmVuJywge1xuICAgIHZhbHVlOiBfX3VwZGF0ZUNoaWxkcmVuLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvdXBkYXRlX2NoaWxkcmVuLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX191cGRhdGVCb3VuZGluZ1xuICovXG5cbmltcG9ydCB7IFNtb290aFNjcm9sbGJhciB9IGZyb20gJy4uL3Ntb290aF9zY3JvbGxiYXInO1xuaW1wb3J0IHsgc2VsZWN0b3JzIH0gZnJvbSAnLi4vc2hhcmVkL3NlbGVjdG9ycyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX3VwZGF0ZUJvdW5kaW5nKCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnRhcmdldHM7XG4gICAgY29uc3QgeyB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQgfSA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB7IGlubmVySGVpZ2h0LCBpbm5lcldpZHRoIH0gPSB3aW5kb3c7XG5cbiAgICB0aGlzLl9fcmVhZG9ubHkoJ2JvdW5kaW5nJywge1xuICAgICAgICB0b3A6IE1hdGgubWF4KHRvcCwgMCksXG4gICAgICAgIHJpZ2h0OiBNYXRoLm1pbihyaWdodCwgaW5uZXJXaWR0aCksXG4gICAgICAgIGJvdHRvbTogTWF0aC5taW4oYm90dG9tLCBpbm5lckhlaWdodCksXG4gICAgICAgIGxlZnQ6TWF0aC5tYXgobGVmdCwgMClcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX191cGRhdGVCb3VuZGluZycsIHtcbiAgICB2YWx1ZTogX191cGRhdGVCb3VuZGluZyxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZV9ib3VuZGluZy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2V0VGh1bWJQb3NpdGlvblxuICovXG5cbmltcG9ydCB7IHNldFN0eWxlIH0gZnJvbSAnLi4vdXRpbHMvaW5kZXgnO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG4vKipcbiAqIEBtZXRob2RcbiAqIEBpbnRlcm5hbFxuICogU2V0IHRodW1iIHBvc2l0aW9uIGluIHRyYWNrXG4gKi9cbmZ1bmN0aW9uIF9fc2V0VGh1bWJQb3NpdGlvbigpIHtcbiAgICBsZXQgeyB4LCB5IH0gPSB0aGlzLm9mZnNldDtcbiAgICBsZXQgeyB4QXhpcywgeUF4aXMgfSA9IHRoaXMudGFyZ2V0cztcblxuICAgIGxldCBzdHlsZVggPSBgdHJhbnNsYXRlM2QoJHt4IC8gdGhpcy5zaXplLmNvbnRlbnQud2lkdGggKiB0aGlzLnNpemUuY29udGFpbmVyLndpZHRofXB4LCAwLCAwKWA7XG4gICAgbGV0IHN0eWxlWSA9IGB0cmFuc2xhdGUzZCgwLCAke3kgLyB0aGlzLnNpemUuY29udGVudC5oZWlnaHQgKiB0aGlzLnNpemUuY29udGFpbmVyLmhlaWdodH1weCwgMClgO1xuXG4gICAgc2V0U3R5bGUoeEF4aXMudGh1bWIsIHtcbiAgICAgICAgJy13ZWJraXQtdHJhbnNmb3JtJzogc3R5bGVYLFxuICAgICAgICAndHJhbnNmb3JtJzogc3R5bGVYXG4gICAgfSk7XG5cbiAgICBzZXRTdHlsZSh5QXhpcy50aHVtYiwge1xuICAgICAgICAnLXdlYmtpdC10cmFuc2Zvcm0nOiBzdHlsZVksXG4gICAgICAgICd0cmFuc2Zvcm0nOiBzdHlsZVlcbiAgICB9KTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19zZXRUaHVtYlBvc2l0aW9uJywge1xuICAgIHZhbHVlOiBfX3NldFRodW1iUG9zaXRpb24sXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2ludGVybmFscy9zZXRfdGh1bWJfcG9zaXRpb24uanNcbiAqKi8iLCJpbXBvcnQgU2Nyb2xsYmFyIGZyb20gJy4uLy4uL3NyYy8nO1xuaW1wb3J0IHsgREVGQVVMVF9PUFRJT05TIH0gZnJvbSAnLi4vLi4vc3JjL3NoYXJlZC8nO1xuXG5jb25zdCBEUFIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbmNvbnN0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMpO1xuXG5jb25zdCBzaXplID0ge1xuICAgIHdpZHRoOiAyNTAsXG4gICAgaGVpZ2h0OiAxNTBcbn07XG5cbmNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmV2aWV3Jyk7XG5jb25zdCBzY3JvbGxiYXIgPSBTY3JvbGxiYXIuZ2V0KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50JykpO1xuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbmNhbnZhcy53aWR0aCA9IHNpemUud2lkdGggKiBEUFI7XG5jYW52YXMuaGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKiBEUFI7XG5jdHguc2NhbGUoRFBSLCBEUFIpO1xuXG5jdHguc3Ryb2tlU3R5bGUgPSAnIzk0YTZiNyc7XG5jdHguZmlsbFN0eWxlID0gJyNhYmMnO1xuXG5sZXQgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIGlmICghc2hvdWxkVXBkYXRlKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICB9XG5cbiAgICBsZXQgZG90cyA9IGNhbGNEb3RzKCk7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0KTtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2Zvcm0oMSwgMCwgMCwgLTEsIDAsIHNpemUuaGVpZ2h0KTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCAwKTtcblxuICAgIGxldCBzY2FsZVggPSAoc2l6ZS53aWR0aCAvIGRvdHMubGVuZ3RoKSAqIChvcHRpb25zLnNwZWVkIC8gMjAgKyAwLjUpO1xuICAgIGRvdHMuZm9yRWFjaCgoW3gsIHldKSA9PiB7XG4gICAgICAgIGN0eC5saW5lVG8oeCAqIHNjYWxlWCwgeSk7XG4gICAgfSk7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICBsZXQgW3gsIHldID0gZG90c1tkb3RzLmxlbmd0aCAtIDFdO1xuICAgIGN0eC5saW5lVG8oeCAqIHNjYWxlWCwgeSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIHNob3VsZFVwZGF0ZSA9IGZhbHNlO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG59O1xuXG5yZW5kZXIoKTtcblxuZnVuY3Rpb24gY2FsY0RvdHMoKSB7XG4gICAgbGV0IHtcbiAgICAgICAgc3BlZWQsXG4gICAgICAgIGZyaWN0b25cbiAgICB9ID0gb3B0aW9ucztcblxuICAgIGxldCBkb3RzID0gW107XG5cbiAgICBsZXQgeCA9IDA7XG4gICAgbGV0IHkgPSAoc3BlZWQgLyAyMCArIDAuNSkgKiBzaXplLmhlaWdodDtcblxuICAgIHdoaWxlKHkgPiAwLjEpIHtcbiAgICAgICAgZG90cy5wdXNoKFt4LCB5XSk7XG5cbiAgICAgICAgeSAqPSAoMSAtIGZyaWN0b24gLyAxMDApO1xuICAgICAgICB4Kys7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvdHM7XG59O1xuXG5bLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm9wdGlvbnMnKV0uZm9yRWFjaCgoZWwpID0+IHtcbiAgICBjb25zdCBwcm9wID0gZWwubmFtZTtcbiAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5vcHRpb24tJHtwcm9wfWApO1xuXG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKSA9PiB7XG4gICAgICAgIGxhYmVsLnRleHRDb250ZW50ID0gb3B0aW9uc1twcm9wXSA9IHBhcnNlRmxvYXQoZWwudmFsdWUpO1xuICAgICAgICBzY3JvbGxiYXIuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgc2hvdWxkVXBkYXRlID0gdHJ1ZTtcbiAgICB9KTtcbn0pO1xuXG5yZW5kZXIoKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3Rlc3Qvc2NyaXB0cy9wcmV2aWV3LmpzXG4gKiovIiwiZXhwb3J0IGNvbnN0IERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgICBzcGVlZDogMSwgLy8gc2Nyb2xsIHNwZWVkIHNjYWxlXG4gICAgZnJpY3RvbjogMTAgLy8gZnJpY3RvbiBmYWN0b3IsIHBlcmNlbnRcbn07XG5cbmV4cG9ydCBjb25zdCBPUFRJT05fTElNSVQgPSB7XG4gICAgZnJpY3RvbjogWzEsIDk5XSxcbiAgICBzcGVlZDogWzAsIEluZmluaXR5XVxufTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9zaGFyZWQvb3B0aW9ucy5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fZ2V0UG9pbnRlclRyZW5kXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5pbXBvcnQgeyBnZXRQb3NpdGlvbiB9IGZyb20gJy4uL3V0aWxzLyc7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2dldFBvaW50ZXJUcmVuZChldnQsIGVkZ2UgPSAwKSB7XG4gICAgY29uc3QgeyB0b3AsIHJpZ2h0LCBib3R0b20sIGxlZnQgfSA9IHRoaXMuYm91bmRpbmc7XG4gICAgY29uc3QgeyB4LCB5IH0gPSBnZXRQb3NpdGlvbihldnQpO1xuXG4gICAgY29uc3QgcmVzID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgfTtcblxuICAgIGlmICh4ID09PSAwICYmIHkgPT09IDApIHJldHVybiByZXM7XG5cbiAgICBpZiAoeCA+IHJpZ2h0IC0gZWRnZSkge1xuICAgICAgICByZXMueCA9ICh4IC0gcmlnaHQgKyBlZGdlKTtcbiAgICB9IGVsc2UgaWYgKHggPCBsZWZ0ICsgZWRnZSkge1xuICAgICAgICByZXMueCA9ICh4IC0gbGVmdCAtIGVkZ2UpO1xuICAgIH1cblxuICAgIGlmICh5ID4gYm90dG9tIC0gZWRnZSkge1xuICAgICAgICByZXMueSA9ICh5IC0gYm90dG9tICsgZWRnZSk7XG4gICAgfSBlbHNlIGlmICh5IDwgdG9wICsgZWRnZSkge1xuICAgICAgICByZXMueSA9ICh5IC0gdG9wIC0gZWRnZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19nZXRQb2ludGVyVHJlbmQnLCB7XG4gICAgdmFsdWU6IF9fZ2V0UG9pbnRlclRyZW5kLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW50ZXJuYWxzL2dldF9wb2ludGVyX3RyZW5kLmpzXG4gKiovIiwiLyoqXG4gKiBAbW9kdWxlXG4gKiBAcHJvdG90eXBlIHtGdW5jdGlvbn0gX19nZXREZWx0YUxpbWl0XG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2dldERlbHRhTGltaXQoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvZmZzZXQsXG4gICAgICAgIGxpbWl0XG4gICAgfSA9IHRoaXM7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB4OiBbLW9mZnNldC54LCBsaW1pdC54IC0gb2Zmc2V0LnhdLFxuICAgICAgICB5OiBbLW9mZnNldC55LCBsaW1pdC55IC0gb2Zmc2V0LnldXG4gICAgfTtcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTbW9vdGhTY3JvbGxiYXIucHJvdG90eXBlLCAnX19nZXREZWx0YUxpbWl0Jywge1xuICAgIHZhbHVlOiBfX2dldERlbHRhTGltaXQsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG59KTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9pbnRlcm5hbHMvZ2V0X2RlbHRhX2xpbWl0LmpzXG4gKiovIiwiZXhwb3J0ICogZnJvbSAnLi9yZW5kZXInO1xuZXhwb3J0ICogZnJvbSAnLi9hZGRfbW92ZW1lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9zZXRfbW92ZW1lbnQnO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9pbmRleC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fcmVuZGVyXG4gKi9cblxuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBuZXh0VGljayhvcHRpb25zLCBjdXJyZW50LCBtb3ZlbWVudCkge1xuICAgIGNvbnN0IHsgZnJpY3RvbiB9ID0gb3B0aW9ucztcblxuICAgIGlmIChNYXRoLmFicyhtb3ZlbWVudCkgPCAxKSB7XG4gICAgICAgIGxldCBuZXh0ID0gY3VycmVudCArIG1vdmVtZW50O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtb3ZlbWVudDogMCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBjdXJyZW50ID4gbmV4dCA/IE1hdGguY2VpbChuZXh0KSA6IE1hdGguZmxvb3IobmV4dClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgcSA9IDEgLSBmcmljdG9uIC8gMTAwO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbW92ZW1lbnQ6IG1vdmVtZW50ICogcSxcbiAgICAgICAgcG9zaXRpb246IGN1cnJlbnQgKyBtb3ZlbWVudCAqICgxIC0gcSlcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gX19yZW5kZXIoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICBvcHRpb25zLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIG1vdmVtZW50LFxuICAgICAgICBfX3RpbWVySURcbiAgICB9ID0gdGhpcztcblxuICAgIGlmIChtb3ZlbWVudC54IHx8IG1vdmVtZW50LnkpIHtcbiAgICAgICAgbGV0IG5leHRYID0gbmV4dFRpY2sob3B0aW9ucywgb2Zmc2V0LngsIG1vdmVtZW50LngpO1xuICAgICAgICBsZXQgbmV4dFkgPSBuZXh0VGljayhvcHRpb25zLCBvZmZzZXQueSwgbW92ZW1lbnQueSk7XG5cbiAgICAgICAgbW92ZW1lbnQueCA9IG5leHRYLm1vdmVtZW50O1xuICAgICAgICBtb3ZlbWVudC55ID0gbmV4dFkubW92ZW1lbnQ7XG5cbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbihuZXh0WC5wb3NpdGlvbiwgbmV4dFkucG9zaXRpb24pO1xuICAgIH1cblxuICAgIF9fdGltZXJJRC5zY3JvbGxBbmltYXRpb24gPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpczo6X19yZW5kZXIpO1xuXG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU21vb3RoU2Nyb2xsYmFyLnByb3RvdHlwZSwgJ19fcmVuZGVyJywge1xuICAgIHZhbHVlOiBfX3JlbmRlcixcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWVcbn0pO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL3JlbmRlci9yZW5kZXIuanNcbiAqKi8iLCIvKipcbiAqIEBtb2R1bGVcbiAqIEBwcm90b3R5cGUge0Z1bmN0aW9ufSBfX2FkZE1vdmVtZW50XG4gKi9cblxuaW1wb3J0IHsgcGlja0luUmFuZ2UgfSBmcm9tICcuLi91dGlscy8nO1xuaW1wb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH0gZnJvbSAnLi4vc21vb3RoX3Njcm9sbGJhcic7XG5cbmV4cG9ydCB7IFNtb290aFNjcm9sbGJhciB9O1xuXG5mdW5jdGlvbiBfX2FkZE1vdmVtZW50KGRlbHRhWCA9IDAsIGRlbHRhWSA9IDApIHtcbiAgICBjb25zdCB7XG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIG1vdmVtZW50XG4gICAgfSA9IHRoaXM7XG5cbiAgICBsZXQgbGltaXQgPSB0aGlzLl9fZ2V0RGVsdGFMaW1pdCgpO1xuXG4gICAgbW92ZW1lbnQueCA9IHBpY2tJblJhbmdlKG1vdmVtZW50LnggKyBkZWx0YVggKiBvcHRpb25zLnNwZWVkLCAuLi5saW1pdC54KTtcbiAgICBtb3ZlbWVudC55ID0gcGlja0luUmFuZ2UobW92ZW1lbnQueSArIGRlbHRhWSAqIG9wdGlvbnMuc3BlZWQsIC4uLmxpbWl0LnkpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX2FkZE1vdmVtZW50Jywge1xuICAgIHZhbHVlOiBfX2FkZE1vdmVtZW50LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL2FkZF9tb3ZlbWVudC5qc1xuICoqLyIsIi8qKlxuICogQG1vZHVsZVxuICogQHByb3RvdHlwZSB7RnVuY3Rpb259IF9fc2V0TW92ZW1lbnRcbiAqL1xuXG5pbXBvcnQgeyBwaWNrSW5SYW5nZSB9IGZyb20gJy4uL3V0aWxzLyc7XG5pbXBvcnQgeyBTbW9vdGhTY3JvbGxiYXIgfSBmcm9tICcuLi9zbW9vdGhfc2Nyb2xsYmFyJztcblxuZXhwb3J0IHsgU21vb3RoU2Nyb2xsYmFyIH07XG5cbmZ1bmN0aW9uIF9fc2V0TW92ZW1lbnQoZGVsdGFYID0gMCwgZGVsdGFZID0gMCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgbW92ZW1lbnRcbiAgICB9ID0gdGhpcztcblxuICAgIGxldCBsaW1pdCA9IHRoaXMuX19nZXREZWx0YUxpbWl0KCk7XG5cbiAgICBtb3ZlbWVudC54ID0gcGlja0luUmFuZ2UoZGVsdGFYICogb3B0aW9ucy5zcGVlZCwgLi4ubGltaXQueCk7XG4gICAgbW92ZW1lbnQueSA9IHBpY2tJblJhbmdlKGRlbHRhWSAqIG9wdGlvbnMuc3BlZWQsIC4uLmxpbWl0LnkpO1xufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNtb290aFNjcm9sbGJhci5wcm90b3R5cGUsICdfX3NldE1vdmVtZW50Jywge1xuICAgIHZhbHVlOiBfX3NldE1vdmVtZW50LFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxufSk7XG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvcmVuZGVyL3NldF9tb3ZlbWVudC5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=