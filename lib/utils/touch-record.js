'use strict';

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

var _getTouchId = require('./get-touch-id');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TouchRecord = exports.TouchRecord = function () {
    function TouchRecord() {
        _classCallCheck(this, TouchRecord);

        this.init();
        this.lastRecord = {};
    }

    _createClass(TouchRecord, [{
        key: 'init',
        value: function init() {
            this.velocity = { x: 0, y: 0 };
            this.activeID = undefined;
            this.updateTime = undefined;
            this.activeScrollbar = null;
        }
    }, {
        key: 'isActiveTouch',
        value: function isActiveTouch(eventOrID) {
            if (this.activeID === undefined) return true;

            var id = typeof eventOrID === 'number' ? eventOrID : (0, _getTouchId.getTouchID)(eventOrID);

            return this.activeID === id;
        }
    }, {
        key: 'isActiveScrollbar',
        value: function isActiveScrollbar(scrollbar) {
            return this.activeScrollbar === scrollbar;
        }
    }, {
        key: 'hasActiveScrollbar',
        value: function hasActiveScrollbar() {
            return !!this.activeScrollbar;
        }
    }, {
        key: 'setActiveScrollbar',
        value: function setActiveScrollbar(scrollbar) {
            this.activeScrollbar = scrollbar;
        }
    }, {
        key: 'getVelocity',
        value: function getVelocity() {
            return this.velocity;
        }
    }, {
        key: 'release',
        value: function release(id) {
            if (this.isActiveTouch(id)) this.init();
        }
    }, {
        key: 'start',
        value: function start(evt) {
            this.init();
            this.update(evt);
            this.activeID = (0, _getTouchId.getTouchID)(evt);

            return this.activeID;
        }
    }, {
        key: 'update',
        value: function update(evt) {
            if (!this.isActiveTouch(evt)) {
                return { x: 0, y: 0 };
            }

            var now = Date.now();
            var position = (0, _getPosition.getPosition)(evt);

            if (!this.lastRecord) {
                this.lastRecord = position;
            }

            var velocity = this.velocity;
            var lastRecord = this.lastRecord;


            var delta = {
                // natural scrolling
                x: -(position.x - lastRecord.x),
                y: -(position.y - lastRecord.y)
            };

            if (this.updateTime !== undefined) {
                var duration = now - this.updateTime + 1;
                var vx = delta.x / duration * 1000;
                var vy = delta.y / duration * 1000;

                velocity.x = vx * 0.8 + velocity.x * 0.2;
                velocity.y = vy * 0.8 + velocity.y * 0.2;
            }

            this.updateTime = now;
            this.lastRecord = position;

            return delta;
        }
    }, {
        key: 'getLastRecord',
        value: function getLastRecord() {
            var which = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
            var lastRecord = this.lastRecord;


            if (!which) return _extends({}, lastRecord);

            if (!lastRecord.hasOwnProperty(which)) return 0;

            return lastRecord[which];
        }
    }, {
        key: 'updatedRecently',
        value: function updatedRecently() {
            return Date.now() - (this.updateTime || 0) < 30;
        }
    }]);

    return TouchRecord;
}();