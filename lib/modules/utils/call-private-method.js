'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callPrivateMethod = callPrivateMethod;

var _getPrivateMethod = require('./get-private-method');

/**
 * Invoke private method
 * @param {string} name
 * @param {...any} [args] - Arguments passed to method
 * @return {any} - The result of execution
 */
function callPrivateMethod(name) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return _getPrivateMethod.getPrivateMethod.call(this, name).apply(undefined, args);
};