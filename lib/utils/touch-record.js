'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TouchRecord = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _getPosition = require('./get-position');

var _getTouchId = require('./get-touch-id');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module
 * @export {Class} TouchRecord
 */

var TouchRecord = exports.TouchRecord = function () {
    function TouchRecord() {
        (0, _classCallCheck3.default)(this, TouchRecord);

        this.init();
        this.lastRecord = {};
    }

    (0, _createClass3.default)(TouchRecord, [{
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


            if (!which) return (0, _extends3.default)({}, lastRecord);

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