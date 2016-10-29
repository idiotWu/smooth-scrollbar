'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _addEvent = require('./add-event.js');

(0, _keys2.default)(_addEvent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _addEvent[key];
    }
  });
});

var _getPointerOffset = require('./get-pointer-offset.js');

(0, _keys2.default)(_getPointerOffset).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _getPointerOffset[key];
    }
  });
});

var _updateBounding = require('./update-bounding.js');

(0, _keys2.default)(_updateBounding).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _updateBounding[key];
    }
  });
});

var _updateThumbPosition = require('./update-thumb-position.js');

(0, _keys2.default)(_updateThumbPosition).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _updateThumbPosition[key];
    }
  });
});
