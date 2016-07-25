'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _buildCurve = require('./build-curve.js');

Object.keys(_buildCurve).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _buildCurve[key];
    }
  });
});

var _debounce = require('./debounce.js');

Object.keys(_debounce).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _debounce[key];
    }
  });
});

var _findChild = require('./find-child.js');

Object.keys(_findChild).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _findChild[key];
    }
  });
});

var _getDelta = require('./get-delta.js');

Object.keys(_getDelta).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _getDelta[key];
    }
  });
});

var _getPointerData = require('./get-pointer-data.js');

Object.keys(_getPointerData).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _getPointerData[key];
    }
  });
});

var _getPosition = require('./get-position.js');

Object.keys(_getPosition).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _getPosition[key];
    }
  });
});

var _getTouchId = require('./get-touch-id.js');

Object.keys(_getTouchId).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _getTouchId[key];
    }
  });
});

var _isOneOf = require('./is-one-of.js');

Object.keys(_isOneOf).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _isOneOf[key];
    }
  });
});

var _pickInRange = require('./pick-in-range.js');

Object.keys(_pickInRange).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _pickInRange[key];
    }
  });
});

var _setStyle = require('./set-style.js');

Object.keys(_setStyle).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _setStyle[key];
    }
  });
});

var _touchRecord = require('./touch-record.js');

Object.keys(_touchRecord).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _touchRecord[key];
    }
  });
});
