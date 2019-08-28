"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chain = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var to = function to(promise) {
  return promise.then(function (data) {
    return [null, data];
  })["catch"](function (err) {
    return [err, null];
  });
};

var chain =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(funcs, filter) {
    var ret, idx, promise, _ref2, _ref3, res, err;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof funcs == 'array')) {
              _context.next = 20;
              break;
            }

            ret = null;
            _context.t0 = _regenerator["default"].keys(funcs);

          case 3:
            if ((_context.t1 = _context.t0()).done) {
              _context.next = 18;
              break;
            }

            idx = _context.t1.value;
            promise = funcs[idx];

            if (filter && typeof filter == 'function') {
              ret = filter(ret);
            }

            _context.next = 9;
            return to(promise(ret));

          case 9:
            _ref2 = _context.sent;
            _ref3 = (0, _slicedToArray2["default"])(_ref2, 2);
            res = _ref3[0];
            err = _ref3[1];

            if (!err) {
              _context.next = 15;
              break;
            }

            throw err;

          case 15:
            ret = res;
            _context.next = 3;
            break;

          case 18:
            _context.next = 21;
            break;

          case 20:
            throw TypeError('Wrong params');

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function chain(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.chain = chain;