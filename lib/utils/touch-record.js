'use strict';

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TouchRecord = undefined;

var _extends = _assign2.default || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; (0, _defineProperty2.default)(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @module
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @export {Class} TouchRecord
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _getPosition = require('./get-position');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return (0, _from2.default)(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tracker = function () {
    function Tracker(touch) {
        _classCallCheck(this, Tracker);

        this.updateTime = Date.now();
        this.delta = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.lastPosition = (0, _getPosition.getPosition)(touch);
    }

    _createClass(Tracker, [{
        key: 'update',
        value: function update(touch) {
            var velocity = this.velocity;
            var updateTime = this.updateTime;
            var lastPosition = this.lastPosition;


            var now = Date.now();
            var position = (0, _getPosition.getPosition)(touch);

            var delta = {
                x: -(position.x - lastPosition.x),
                y: -(position.y - lastPosition.y)
            };

            var duration = now - updateTime || 16;
            var vx = delta.x / duration * 1e3;
            var vy = delta.y / duration * 1e3;
            velocity.x = vx * 0.8 + velocity.x * 0.2;
            velocity.y = vy * 0.8 + velocity.y * 0.2;

            this.delta = delta;
            this.updateTime = now;
            this.lastPosition = position;
        }
    }]);

    return Tracker;
}();

var TouchRecord = exports.TouchRecord = function () {
    function TouchRecord() {
        _classCallCheck(this, TouchRecord);

        this.touchList = {};
        this.lastTouch = null;
        this.activeTouchID = undefined;
    }

    _createClass(TouchRecord, [{
        key: '__add',
        value: function __add(touch) {
            if (this.__has(touch)) return null;

            var tracker = new Tracker(touch);

            this.touchList[touch.identifier] = tracker;

            return tracker;
        }
    }, {
        key: '__renew',
        value: function __renew(touch) {
            if (!this.__has(touch)) return null;

            var tracker = this.touchList[touch.identifier];

            tracker.update(touch);

            return tracker;
        }
    }, {
        key: '__delete',
        value: function __delete(touch) {
            return delete this.touchList[touch.identifier];
        }
    }, {
        key: '__has',
        value: function __has(touch) {
            return this.touchList.hasOwnProperty(touch.identifier);
        }
    }, {
        key: '__setActiveID',
        value: function __setActiveID(touches) {
            this.activeTouchID = touches[touches.length - 1].identifier;
            this.lastTouch = this.touchList[this.activeTouchID];
        }
    }, {
        key: '__getActiveTracker',
        value: function __getActiveTracker() {
            var touchList = this.touchList;
            var activeTouchID = this.activeTouchID;


            return touchList[activeTouchID];
        }
    }, {
        key: 'isActive',
        value: function isActive() {
            return this.activeTouchID !== undefined;
        }
    }, {
        key: 'getDelta',
        value: function getDelta() {
            var tracker = this.__getActiveTracker();

            if (!tracker) {
                return this.__primitiveValue;
            }

            return _extends({}, tracker.delta);
        }
    }, {
        key: 'getVelocity',
        value: function getVelocity() {
            var tracker = this.__getActiveTracker();

            if (!tracker) {
                return this.__primitiveValue;
            }

            return _extends({}, tracker.velocity);
        }
    }, {
        key: 'getLastPosition',
        value: function getLastPosition() {
            var coord = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            var tracker = this.__getActiveTracker() || this.lastTouch;

            var position = tracker ? tracker.lastPosition : this.__primitiveValue;

            if (!coord) return _extends({}, position);

            if (!position.hasOwnProperty(coord)) return 0;

            return position[coord];
        }
    }, {
        key: 'updatedRecently',
        value: function updatedRecently() {
            var tracker = this.__getActiveTracker();

            return tracker && Date.now() - tracker.updateTime < 30;
        }
    }, {
        key: 'track',
        value: function track(evt) {
            var _this = this;

            var targetTouches = evt.targetTouches;


            [].concat(_toConsumableArray(targetTouches)).forEach(function (touch) {
                _this.__add(touch);
            });

            return this.touchList;
        }
    }, {
        key: 'update',
        value: function update(evt) {
            var _this2 = this;

            var touches = evt.touches;
            var changedTouches = evt.changedTouches;


            [].concat(_toConsumableArray(touches)).forEach(function (touch) {
                _this2.__renew(touch);
            });

            this.__setActiveID(changedTouches);

            return this.touchList;
        }
    }, {
        key: 'release',
        value: function release(evt) {
            var _this3 = this;

            this.activeTouchID = undefined;

            [].concat(_toConsumableArray(evt.changedTouches)).forEach(function (touch) {
                _this3.__delete(touch);
            });

            return this.touchList;
        }
    }, {
        key: '__primitiveValue',
        get: function get() {
            return { x: 0, y: 0 };
        }
    }]);

    return TouchRecord;
}();