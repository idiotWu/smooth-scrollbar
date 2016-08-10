'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _buildCurve = require('./build-curve.js');

(0, _keys2.default)(_buildCurve).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _buildCurve[key];
    }
  });
});

var _debounce = require('./debounce.js');

(0, _keys2.default)(_debounce).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _debounce[key];
    }
  });
});

var _findChild = require('./find-child.js');

(0, _keys2.default)(_findChild).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _findChild[key];
    }
  });
});

var _getDelta = require('./get-delta.js');

(0, _keys2.default)(_getDelta).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _getDelta[key];
    }
  });
});

var _getPointerData = require('./get-pointer-data.js');

(0, _keys2.default)(_getPointerData).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _getPointerData[key];
    }
  });
});

var _getPosition = require('./get-position.js');

(0, _keys2.default)(_getPosition).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _getPosition[key];
    }
  });
});

var _getTouchId = require('./get-touch-id.js');

(0, _keys2.default)(_getTouchId).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _getTouchId[key];
    }
  });
});

var _isOneOf = require('./is-one-of.js');

(0, _keys2.default)(_isOneOf).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _isOneOf[key];
    }
  });
});

var _pickInRange = require('./pick-in-range.js');

(0, _keys2.default)(_pickInRange).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _pickInRange[key];
    }
  });
});

var _setStyle = require('./set-style.js');

(0, _keys2.default)(_setStyle).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _setStyle[key];
    }
  });
});

var _touchRecord = require('./touch-record.js');

(0, _keys2.default)(_touchRecord).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _touchRecord[key];
    }
  });
});
