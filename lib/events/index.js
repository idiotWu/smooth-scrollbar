'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _drag = require('./drag.js');

Object.keys(_drag).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _drag[key];
    }
  });
});

var _keyboard = require('./keyboard.js');

Object.keys(_keyboard).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _keyboard[key];
    }
  });
});

var _mouse = require('./mouse.js');

Object.keys(_mouse).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _mouse[key];
    }
  });
});

var _resize = require('./resize.js');

Object.keys(_resize).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _resize[key];
    }
  });
});

var _select = require('./select.js');

Object.keys(_select).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _select[key];
    }
  });
});

var _touch = require('./touch.js');

Object.keys(_touch).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _touch[key];
    }
  });
});

var _wheel = require('./wheel.js');

Object.keys(_wheel).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _wheel[key];
    }
  });
});
