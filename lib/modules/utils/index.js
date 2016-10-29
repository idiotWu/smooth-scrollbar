'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _callPrivateMethod = require('./call-private-method.js');

(0, _keys2.default)(_callPrivateMethod).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _callPrivateMethod[key];
    }
  });
});

var _definePrivateMethod = require('./define-private-method.js');

(0, _keys2.default)(_definePrivateMethod).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _definePrivateMethod[key];
    }
  });
});

var _getPrivateMethod = require('./get-private-method.js');

(0, _keys2.default)(_getPrivateMethod).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _getPrivateMethod[key];
    }
  });
});

var _getPrivateProp = require('./get-private-prop.js');

(0, _keys2.default)(_getPrivateProp).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _getPrivateProp[key];
    }
  });
});

var _setPrivateProp = require('./set-private-prop.js');

(0, _keys2.default)(_setPrivateProp).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  (0, _defineProperty2.default)(exports, key, {
    enumerable: true,
    get: function get() {
      return _setPrivateProp[key];
    }
  });
});
