/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally. This also holds a reference to known-good
// functions.
var $Array = Array;
var ArrayPrototype = $Array.prototype;
var $Object = Object;
var ObjectPrototype = $Object.prototype;
var $Function = Function;
var FunctionPrototype = $Function.prototype;
var $String = String;
var StringPrototype = $String.prototype;
var $Number = Number;
var NumberPrototype = $Number.prototype;
var array_slice = ArrayPrototype.slice;
var array_splice = ArrayPrototype.splice;
var array_push = ArrayPrototype.push;
var array_unshift = ArrayPrototype.unshift;
var array_concat = ArrayPrototype.concat;
var array_join = ArrayPrototype.join;
var call = FunctionPrototype.call;
var apply = FunctionPrototype.apply;
var max = Math.max;
var min = Math.min;

// Having a toString local variable name breaks in Opera so use to_string.
var to_string = ObjectPrototype.toString;

/* global Symbol */
/* eslint-disable one-var-declaration-per-line, no-redeclare */
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, constructorRegex = /^\s*class /, isES6ClassFn = function isES6ClassFn(value) { try { var fnStr = fnToStr.call(value); var singleStripped = fnStr.replace(/\/\/.*\n/g, ''); var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, ''); var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' '); return constructorRegex.test(spaceStripped); } catch (e) { return false; /* not a function */ } }, tryFunctionObject = function tryFunctionObject(value) { try { if (isES6ClassFn(value)) { return false; } fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]', isCallable = function isCallable(value) { if (!value) { return false; } if (typeof value !== 'function' && typeof value !== 'object') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } if (isES6ClassFn(value)) { return false; } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };

var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };
/* eslint-enable one-var-declaration-per-line, no-redeclare */

/* inlined from http://npmjs.com/define-properties */
var supportsDescriptors = $Object.defineProperty && (function () {
    try {
        var obj = {};
        $Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
        for (var _ in obj) { return false; }
        return obj.x === obj;
    } catch (e) { /* this is ES3 */
        return false;
    }
}());
var defineProperties = (function (has) {
  // Define configurable, writable, and non-enumerable props
  // if they don't exist.
  var defineProperty;
  if (supportsDescriptors) {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          $Object.defineProperty(object, name, {
              configurable: true,
              enumerable: false,
              writable: true,
              value: method
          });
      };
  } else {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          object[name] = method;
      };
  }
  return function defineProperties(object, map, forceAssign) {
      for (var name in map) {
          if (has.call(map, name)) {
            defineProperty(object, name, map[name], forceAssign);
          }
      }
  };
}(ObjectPrototype.hasOwnProperty));

//
// Util
// ======
//

/* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
var isPrimitive = function isPrimitive(input) {
    var type = typeof input;
    return input === null || (type !== 'object' && type !== 'function');
};

var isActualNaN = $Number.isNaN || function (x) { return x !== x; };

var ES = {
    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
    ToInteger: function ToInteger(num) {
        var n = +num;
        if (isActualNaN(n)) {
            n = 0;
        } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        return n;
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
    ToPrimitive: function ToPrimitive(input) {
        var val, valueOf, toStr;
        if (isPrimitive(input)) {
            return input;
        }
        valueOf = input.valueOf;
        if (isCallable(valueOf)) {
            val = valueOf.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        toStr = input.toString;
        if (isCallable(toStr)) {
            val = toStr.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError();
    },

    // ES5 9.9
    // http://es5.github.com/#x9.9
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
    ToObject: function (o) {
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert " + o + ' to object');
        }
        return $Object(o);
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
    ToUint32: function ToUint32(x) {
        return x >>> 0;
    }
};

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

var Empty = function Empty() {};

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isCallable(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound;
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = apply.call(
                    target,
                    this,
                    array_concat.call(args, array_slice.call(arguments))
                );
                if ($Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return apply.call(
                    target,
                    that,
                    array_concat.call(args, array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            array_push.call(boundArgs, '$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        bound = $Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// use it in defining shortcuts.
var owns = call.bind(ObjectPrototype.hasOwnProperty);
var toStr = call.bind(ObjectPrototype.toString);
var arraySlice = call.bind(array_slice);
var arraySliceApply = apply.bind(array_slice);
var strSlice = call.bind(StringPrototype.slice);
var strSplit = call.bind(StringPrototype.split);
var strIndexOf = call.bind(StringPrototype.indexOf);
var pushCall = call.bind(array_push);
var isEnum = call.bind(ObjectPrototype.propertyIsEnumerable);
var arraySort = call.bind(ArrayPrototype.sort);

//
// Array
// =====
//

var isArray = $Array.isArray || function isArray(obj) {
    return toStr(obj) === '[object Array]';
};

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) === undefined but should be "1"
var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
defineProperties(ArrayPrototype, {
    unshift: function () {
        array_unshift.apply(this, arguments);
        return this.length;
    }
}, hasUnshiftReturnValueBug);

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties($Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = $Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    var threwException = false;
    if (method) {
        try {
            method.call('foo', function (_, __, context) {
                if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
            });

            method.call([1], function () {
                'use strict';

                properlyBoxesStrict = typeof this === 'string';
            }, 'x');
        } catch (e) {
            threwException = true;
        }
    }
    return !!method && !threwException && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(callbackfn/*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var i = -1;
        var length = ES.ToUint32(self.length);
        var T;
        if (arguments.length > 1) {
          T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.forEach callback must be a function');
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                if (typeof T === 'undefined') {
                    callbackfn(self[i], i, object);
                } else {
                    callbackfn.call(T, self[i], i, object);
                }
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
defineProperties(ArrayPrototype, {
    map: function map(callbackfn/*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var result = $Array(length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.map callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                if (typeof T === 'undefined') {
                    result[i] = callbackfn(self[i], i, object);
                } else {
                    result[i] = callbackfn.call(T, self[i], i, object);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.map));

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
defineProperties(ArrayPrototype, {
    filter: function filter(callbackfn/*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var result = [];
        var value;
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.filter callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                    pushCall(result, value);
                }
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.filter));

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
defineProperties(ArrayPrototype, {
    every: function every(callbackfn/*, thisArg*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.every callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return false;
            }
        }
        return true;
    }
}, !properlyBoxesContext(ArrayPrototype.every));

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
defineProperties(ArrayPrototype, {
    some: function some(callbackfn/*, thisArg */) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);
        var T;
        if (arguments.length > 1) {
            T = arguments[1];
        }

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.some callback must be a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                return true;
            }
        }
        return false;
    }
}, !properlyBoxesContext(ArrayPrototype.some));

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
var reduceCoercesToObject = false;
if (ArrayPrototype.reduce) {
    reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduce: function reduce(callbackfn/*, initialValue*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduce callback must be a function');
        }

        // no value to return if no initial value and an empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduce of empty array with no initial value');
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError('reduce of empty array with no initial value');
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        }

        return result;
    }
}, !reduceCoercesToObject);

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
var reduceRightCoercesToObject = false;
if (ArrayPrototype.reduceRight) {
    reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
}
defineProperties(ArrayPrototype, {
    reduceRight: function reduceRight(callbackfn/*, initial*/) {
        var object = ES.ToObject(this);
        var self = splitString && isString(this) ? strSplit(this, '') : object;
        var length = ES.ToUint32(self.length);

        // If no callback function or if callback is not a callable function
        if (!isCallable(callbackfn)) {
            throw new TypeError('Array.prototype.reduceRight callback must be a function');
        }

        // no value to return if no initial value, empty array
        if (length === 0 && arguments.length === 1) {
            throw new TypeError('reduceRight of empty array with no initial value');
        }

        var result;
        var i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError('reduceRight of empty array with no initial value');
                }
            } while (true);
        }

        if (i < 0) {
            return result;
        }

        do {
            if (i in self) {
                result = callbackfn(result, self[i], i, object);
            }
        } while (i--);

        return result;
    }
}, !reduceRightCoercesToObject);

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = ArrayPrototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(searchElement/*, fromIndex */) {
        var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
        var length = ES.ToUint32(self.length);

        if (length === 0) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = ES.ToInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === searchElement) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
var hasFirefox2LastIndexOfBug = ArrayPrototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
defineProperties(ArrayPrototype, {
    lastIndexOf: function lastIndexOf(searchElement/*, fromIndex */) {
        var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
        var length = ES.ToUint32(self.length);

        if (length === 0) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = min(i, ES.ToInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && searchElement === self[i]) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2LastIndexOfBug);

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
var spliceNoopReturnsEmptyArray = (function () {
    var a = [1, 2];
    var result = a.splice();
    return a.length === 2 && isArray(result) && result.length === 0;
}());
defineProperties(ArrayPrototype, {
    // Safari 5.0 bug where .splice() returns undefined
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) {
            return [];
        } else {
            return array_splice.apply(this, arguments);
        }
    }
}, !spliceNoopReturnsEmptyArray);

var spliceWorksWithEmptyObject = (function () {
    var obj = {};
    ArrayPrototype.splice.call(obj, 0, 0, 1);
    return obj.length === 1;
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) { return []; }
        var args = arguments;
        this.length = max(ES.ToInteger(this.length), 0);
        if (arguments.length > 0 && typeof deleteCount !== 'number') {
            args = arraySlice(arguments);
            if (args.length < 2) {
                pushCall(args, this.length - start);
            } else {
                args[1] = ES.ToInteger(deleteCount);
            }
        }
        return array_splice.apply(this, args);
    }
}, !spliceWorksWithEmptyObject);
var spliceWorksWithLargeSparseArrays = (function () {
    // Per https://github.com/es-shims/es5-shim/issues/295
    // Safari 7/8 breaks with sparse arrays of size 1e5 or greater
    var arr = new $Array(1e5);
    // note: the index MUST be 8 or larger or the test will false pass
    arr[8] = 'x';
    arr.splice(1, 1);
    // note: this test must be defined *after* the indexOf shim
    // per https://github.com/es-shims/es5-shim/issues/313
    return arr.indexOf('x') === 7;
}());
var spliceWorksWithSmallSparseArrays = (function () {
    // Per https://github.com/es-shims/es5-shim/issues/295
    // Opera 12.15 breaks on this, no idea why.
    var n = 256;
    var arr = [];
    arr[n] = 'a';
    arr.splice(n + 1, 0, 'b');
    return arr[n] === 'a';
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        var O = ES.ToObject(this);
        var A = [];
        var len = ES.ToUint32(O.length);
        var relativeStart = ES.ToInteger(start);
        var actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);
        var actualDeleteCount = min(max(ES.ToInteger(deleteCount), 0), len - actualStart);

        var k = 0;
        var from;
        while (k < actualDeleteCount) {
            from = $String(actualStart + k);
            if (owns(O, from)) {
                A[k] = O[from];
            }
            k += 1;
        }

        var items = arraySlice(arguments, 2);
        var itemCount = items.length;
        var to;
        if (itemCount < actualDeleteCount) {
            k = actualStart;
            var maxK = len - actualDeleteCount;
            while (k < maxK) {
                from = $String(k + actualDeleteCount);
                to = $String(k + itemCount);
                if (owns(O, from)) {
                    O[to] = O[from];
                } else {
                    delete O[to];
                }
                k += 1;
            }
            k = len;
            var minK = len - actualDeleteCount + itemCount;
            while (k > minK) {
                delete O[k - 1];
                k -= 1;
            }
        } else if (itemCount > actualDeleteCount) {
            k = len - actualDeleteCount;
            while (k > actualStart) {
                from = $String(k + actualDeleteCount - 1);
                to = $String(k + itemCount - 1);
                if (owns(O, from)) {
                    O[to] = O[from];
                } else {
                    delete O[to];
                }
                k -= 1;
            }
        }
        k = actualStart;
        for (var i = 0; i < items.length; ++i) {
            O[k] = items[i];
            k += 1;
        }
        O.length = len - actualDeleteCount + itemCount;

        return A;
    }
}, !spliceWorksWithLargeSparseArrays || !spliceWorksWithSmallSparseArrays);

var originalJoin = ArrayPrototype.join;
var hasStringJoinBug;
try {
    hasStringJoinBug = Array.prototype.join.call('123', ',') !== '1,2,3';
} catch (e) {
    hasStringJoinBug = true;
}
if (hasStringJoinBug) {
    defineProperties(ArrayPrototype, {
        join: function join(separator) {
            var sep = typeof separator === 'undefined' ? ',' : separator;
            return originalJoin.call(isString(this) ? strSplit(this, '') : this, sep);
        }
    }, hasStringJoinBug);
}

var hasJoinUndefinedBug = [1, 2].join(undefined) !== '1,2';
if (hasJoinUndefinedBug) {
    defineProperties(ArrayPrototype, {
        join: function join(separator) {
            var sep = typeof separator === 'undefined' ? ',' : separator;
            return originalJoin.call(this, sep);
        }
    }, hasJoinUndefinedBug);
}

var pushShim = function push(item) {
    var O = ES.ToObject(this);
    var n = ES.ToUint32(O.length);
    var i = 0;
    while (i < arguments.length) {
        O[n + i] = arguments[i];
        i += 1;
    }
    O.length = n + i;
    return n + i;
};

var pushIsNotGeneric = (function () {
    var obj = {};
    var result = Array.prototype.push.call(obj, undefined);
    return result !== 1 || obj.length !== 1 || typeof obj[0] !== 'undefined' || !owns(obj, 0);
}());
defineProperties(ArrayPrototype, {
    push: function push(item) {
        if (isArray(this)) {
            return array_push.apply(this, arguments);
        }
        return pushShim.apply(this, arguments);
    }
}, pushIsNotGeneric);

// This fixes a very weird bug in Opera 10.6 when pushing `undefined
var pushUndefinedIsWeird = (function () {
    var arr = [];
    var result = arr.push(undefined);
    return result !== 1 || arr.length !== 1 || typeof arr[0] !== 'undefined' || !owns(arr, 0);
}());
defineProperties(ArrayPrototype, { push: pushShim }, pushUndefinedIsWeird);

// ES5 15.2.3.14
// http://es5.github.io/#x15.4.4.10
// Fix boxed string bug
defineProperties(ArrayPrototype, {
    slice: function (start, end) {
        var arr = isString(this) ? strSplit(this, '') : this;
        return arraySliceApply(arr, arguments);
    }
}, splitString);

var sortIgnoresNonFunctions = (function () {
    try {
        [1, 2].sort(null);
        [1, 2].sort({});
        return true;
    } catch (e) { /**/ }
    return false;
}());
var sortThrowsOnRegex = (function () {
    // this is a problem in Firefox 4, in which `typeof /a/ === 'function'`
    try {
        [1, 2].sort(/a/);
        return false;
    } catch (e) { /**/ }
    return true;
}());
var sortIgnoresUndefined = (function () {
    // applies in IE 8, for one.
    try {
        [1, 2].sort(undefined);
        return true;
    } catch (e) { /**/ }
    return false;
}());
defineProperties(ArrayPrototype, {
    sort: function sort(compareFn) {
        if (typeof compareFn === 'undefined') {
            return arraySort(this);
        }
        if (!isCallable(compareFn)) {
            throw new TypeError('Array.prototype.sort callback must be a function');
        }
        return arraySort(this, compareFn);
    }
}, sortIgnoresNonFunctions || !sortIgnoresUndefined || !sortThrowsOnRegex);

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString');
var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
var hasStringEnumBug = !owns('x', '0');
var equalsConstructorPrototype = function (o) {
    var ctor = o.constructor;
    return ctor && ctor.prototype === o;
};
var blacklistedKeys = {
    $window: true,
    $console: true,
    $parent: true,
    $self: true,
    $frame: true,
    $frames: true,
    $frameElement: true,
    $webkitIndexedDB: true,
    $webkitStorageInfo: true,
    $external: true
};
var hasAutomationEqualityBug = (function () {
    /* globals window */
    if (typeof window === 'undefined') { return false; }
    for (var k in window) {
        try {
            if (!blacklistedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
                equalsConstructorPrototype(window[k]);
            }
        } catch (e) {
            return true;
        }
    }
    return false;
}());
var equalsConstructorPrototypeIfNotBuggy = function (object) {
    if (typeof window === 'undefined' || !hasAutomationEqualityBug) { return equalsConstructorPrototype(object); }
    try {
        return equalsConstructorPrototype(object);
    } catch (e) {
        return false;
    }
};
var dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
];
var dontEnumsLength = dontEnums.length;

// taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
// can be replaced with require('is-arguments') if we ever use a build process instead
var isStandardArguments = function isArguments(value) {
    return toStr(value) === '[object Arguments]';
};
var isLegacyArguments = function isArguments(value) {
    return value !== null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        !isArray(value) &&
        isCallable(value.callee);
};
var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;

defineProperties($Object, {
    keys: function keys(object) {
        var isFn = isCallable(object);
        var isArgs = isArguments(object);
        var isObject = object !== null && typeof object === 'object';
        var isStr = isObject && isString(object);

        if (!isObject && !isFn && !isArgs) {
            throw new TypeError('Object.keys called on a non-object');
        }

        var theKeys = [];
        var skipProto = hasProtoEnumBug && isFn;
        if ((isStr && hasStringEnumBug) || isArgs) {
            for (var i = 0; i < object.length; ++i) {
                pushCall(theKeys, $String(i));
            }
        }

        if (!isArgs) {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && owns(object, name)) {
                    pushCall(theKeys, $String(name));
                }
            }
        }

        if (hasDontEnumBug) {
            var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    pushCall(theKeys, dontEnum);
                }
            }
        }
        return theKeys;
    }
});

var keysWorksWithArguments = $Object.keys && (function () {
    // Safari 5.0 bug
    return $Object.keys(arguments).length === 2;
}(1, 2));
var keysHasArgumentsLengthBug = $Object.keys && (function () {
    var argKeys = $Object.keys(arguments);
    return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
}(1));
var originalKeys = $Object.keys;
defineProperties($Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(arraySlice(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments || keysHasArgumentsLengthBug);

//
// Date
// ====
//

var hasNegativeMonthYearBug = new Date(-3509827329600292).getUTCMonth() !== 0;
var aNegativeTestDate = new Date(-1509842289600292);
var aPositiveTestDate = new Date(1449662400000);
var hasToUTCStringFormatBug = aNegativeTestDate.toUTCString() !== 'Mon, 01 Jan -45875 11:59:59 GMT';
var hasToDateStringFormatBug;
var hasToStringFormatBug;
var timeZoneOffset = aNegativeTestDate.getTimezoneOffset();
if (timeZoneOffset < -720) {
    hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Tue Jan 02 -45875';
    hasToStringFormatBug = !(/^Thu Dec 10 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
} else {
    hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Mon Jan 01 -45875';
    hasToStringFormatBug = !(/^Wed Dec 09 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
}

var originalGetFullYear = call.bind(Date.prototype.getFullYear);
var originalGetMonth = call.bind(Date.prototype.getMonth);
var originalGetDate = call.bind(Date.prototype.getDate);
var originalGetUTCFullYear = call.bind(Date.prototype.getUTCFullYear);
var originalGetUTCMonth = call.bind(Date.prototype.getUTCMonth);
var originalGetUTCDate = call.bind(Date.prototype.getUTCDate);
var originalGetUTCDay = call.bind(Date.prototype.getUTCDay);
var originalGetUTCHours = call.bind(Date.prototype.getUTCHours);
var originalGetUTCMinutes = call.bind(Date.prototype.getUTCMinutes);
var originalGetUTCSeconds = call.bind(Date.prototype.getUTCSeconds);
var originalGetUTCMilliseconds = call.bind(Date.prototype.getUTCMilliseconds);
var dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var daysInMonth = function daysInMonth(month, year) {
    return originalGetDate(new Date(year, month, 0));
};

defineProperties(Date.prototype, {
    getFullYear: function getFullYear() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var year = originalGetFullYear(this);
        if (year < 0 && originalGetMonth(this) > 11) {
            return year + 1;
        }
        return year;
    },
    getMonth: function getMonth() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var year = originalGetFullYear(this);
        var month = originalGetMonth(this);
        if (year < 0 && month > 11) {
            return 0;
        }
        return month;
    },
    getDate: function getDate() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var year = originalGetFullYear(this);
        var month = originalGetMonth(this);
        var date = originalGetDate(this);
        if (year < 0 && month > 11) {
            if (month === 12) {
                return date;
            }
            var days = daysInMonth(0, year + 1);
            return (days - date) + 1;
        }
        return date;
    },
    getUTCFullYear: function getUTCFullYear() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var year = originalGetUTCFullYear(this);
        if (year < 0 && originalGetUTCMonth(this) > 11) {
            return year + 1;
        }
        return year;
    },
    getUTCMonth: function getUTCMonth() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var year = originalGetUTCFullYear(this);
        var month = originalGetUTCMonth(this);
        if (year < 0 && month > 11) {
            return 0;
        }
        return month;
    },
    getUTCDate: function getUTCDate() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var year = originalGetUTCFullYear(this);
        var month = originalGetUTCMonth(this);
        var date = originalGetUTCDate(this);
        if (year < 0 && month > 11) {
            if (month === 12) {
                return date;
            }
            var days = daysInMonth(0, year + 1);
            return (days - date) + 1;
        }
        return date;
    }
}, hasNegativeMonthYearBug);

defineProperties(Date.prototype, {
    toUTCString: function toUTCString() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var day = originalGetUTCDay(this);
        var date = originalGetUTCDate(this);
        var month = originalGetUTCMonth(this);
        var year = originalGetUTCFullYear(this);
        var hour = originalGetUTCHours(this);
        var minute = originalGetUTCMinutes(this);
        var second = originalGetUTCSeconds(this);
        return dayName[day] + ', ' +
            (date < 10 ? '0' + date : date) + ' ' +
            monthName[month] + ' ' +
            year + ' ' +
            (hour < 10 ? '0' + hour : hour) + ':' +
            (minute < 10 ? '0' + minute : minute) + ':' +
            (second < 10 ? '0' + second : second) + ' GMT';
    }
}, hasNegativeMonthYearBug || hasToUTCStringFormatBug);

// Opera 12 has `,`
defineProperties(Date.prototype, {
    toDateString: function toDateString() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var day = this.getDay();
        var date = this.getDate();
        var month = this.getMonth();
        var year = this.getFullYear();
        return dayName[day] + ' ' +
            monthName[month] + ' ' +
            (date < 10 ? '0' + date : date) + ' ' +
            year;
    }
}, hasNegativeMonthYearBug || hasToDateStringFormatBug);

// can't use defineProperties here because of toString enumeration issue in IE <= 8
if (hasNegativeMonthYearBug || hasToStringFormatBug) {
    Date.prototype.toString = function toString() {
        if (!this || !(this instanceof Date)) {
            throw new TypeError('this is not a Date object.');
        }
        var day = this.getDay();
        var date = this.getDate();
        var month = this.getMonth();
        var year = this.getFullYear();
        var hour = this.getHours();
        var minute = this.getMinutes();
        var second = this.getSeconds();
        var timezoneOffset = this.getTimezoneOffset();
        var hoursOffset = Math.floor(Math.abs(timezoneOffset) / 60);
        var minutesOffset = Math.floor(Math.abs(timezoneOffset) % 60);
        return dayName[day] + ' ' +
            monthName[month] + ' ' +
            (date < 10 ? '0' + date : date) + ' ' +
            year + ' ' +
            (hour < 10 ? '0' + hour : hour) + ':' +
            (minute < 10 ? '0' + minute : minute) + ':' +
            (second < 10 ? '0' + second : second) + ' GMT' +
            (timezoneOffset > 0 ? '-' : '+') +
            (hoursOffset < 10 ? '0' + hoursOffset : hoursOffset) +
            (minutesOffset < 10 ? '0' + minutesOffset : minutesOffset);
    };
    if (supportsDescriptors) {
        $Object.defineProperty(Date.prototype, 'toString', {
            configurable: true,
            enumerable: false,
            writable: true
        });
    }
}

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000;
var negativeYearString = '-000001';
var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;
var hasSafari51DateBug = Date.prototype.toISOString && new Date(-1).toISOString() !== '1969-12-31T23:59:59.999Z';

var getTime = call.bind(Date.prototype.getTime);

defineProperties(Date.prototype, {
    toISOString: function toISOString() {
        if (!isFinite(this) || !isFinite(getTime(this))) {
            // Adope Photoshop requires the second check.
            throw new RangeError('Date.prototype.toISOString called on non-finite value.');
        }

        var year = originalGetUTCFullYear(this);

        var month = originalGetUTCMonth(this);
        // see https://github.com/es-shims/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        var result = [month + 1, originalGetUTCDate(this), originalGetUTCHours(this), originalGetUTCMinutes(this), originalGetUTCSeconds(this)];
        year = (
            (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
            strSlice('00000' + Math.abs(year), (0 <= year && year <= 9999) ? -4 : -6)
        );

        for (var i = 0; i < result.length; ++i) {
          // pad months, days, hours, minutes, and seconds to have two digits.
          result[i] = strSlice('00' + result[i], -2);
        }
        // pad milliseconds to have three digits.
        return (
            year + '-' + arraySlice(result, 0, 2).join('-') +
            'T' + arraySlice(result, 2).join(':') + '.' +
            strSlice('000' + originalGetUTCMilliseconds(this), -3) + 'Z'
        );
    }
}, hasNegativeDateBug || hasSafari51DateBug);

// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = (function () {
    try {
        return Date.prototype.toJSON &&
            new Date(NaN).toJSON() === null &&
            new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
            Date.prototype.toJSON.call({ // generic
                toISOString: function () { return true; }
            });
    } catch (e) {
        return false;
    }
}());
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be ES.ToPrimitive(O, hint Number).
        var O = $Object(this);
        var tv = ES.ToPrimitive(O);
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === 'number' && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        var toISO = O.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (!isCallable(toISO)) {
            throw new TypeError('toISOString property is not callable');
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(O);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
if (doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    /* global Date: true */
    /* eslint-disable no-undef */
    var maxSafeUnsigned32Bit = Math.pow(2, 31) - 1;
    var hasSafariSignedIntBug = isActualNaN(new Date(1970, 0, 1, 0, 0, 0, maxSafeUnsigned32Bit + 1).getTime());
    /* eslint-disable no-implicit-globals */
    Date = (function (NativeDate) {
    /* eslint-enable no-implicit-globals */
    /* eslint-enable no-undef */
        // Date.length === 7
        var DateShim = function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            var date;
            if (this instanceof NativeDate) {
                var seconds = s;
                var millis = ms;
                if (hasSafariSignedIntBug && length >= 7 && ms > maxSafeUnsigned32Bit) {
                    // work around a Safari 8/9 bug where it treats the seconds as signed
                    var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                    var sToShift = Math.floor(msToShift / 1e3);
                    seconds += sToShift;
                    millis -= sToShift * 1e3;
                }
                date = length === 1 && $String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(DateShim.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, seconds, millis) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, seconds) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y instanceof NativeDate ? +Y : Y) :
                                  new NativeDate();
            } else {
                date = NativeDate.apply(this, arguments);
            }
            if (!isPrimitive(date)) {
              // Prevent mixups with unfixed Date object
              defineProperties(date, { constructor: DateShim }, true);
            }
            return date;
        };

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp('^' +
            '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                                      // 6-digit extended year
            '(?:-(\\d{2})' + // optional month capture
            '(?:-(\\d{2})' + // optional day capture
            '(?:' + // capture hours:minutes:seconds.milliseconds
                'T(\\d{2})' + // hours capture
                ':(\\d{2})' + // minutes capture
                '(?:' + // optional :seconds.milliseconds
                    ':(\\d{2})' + // seconds capture
                    '(?:(\\.\\d{1,}))?' + // milliseconds capture
                ')?' +
            '(' + // capture UTC offset component
                'Z|' + // UTC capture
                '(?:' + // offset specifier +/-hours:minutes
                    '([-+])' + // sign capture
                    '(\\d{2})' + // hours offset capture
                    ':(\\d{2})' + // minutes offset capture
                ')' +
            ')?)?)?)?' +
        '$');

        var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

        var dayFromMonth = function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        };

        var toUTC = function toUTC(t) {
            var s = 0;
            var ms = t;
            if (hasSafariSignedIntBug && ms > maxSafeUnsigned32Bit) {
                // work around a Safari 8/9 bug where it treats the seconds as signed
                var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                var sToShift = Math.floor(msToShift / 1e3);
                s += sToShift;
                ms -= sToShift * 1e3;
            }
            return $Number(new NativeDate(1970, 0, 1, 0, 0, s, ms));
        };

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            if (owns(NativeDate, key)) {
                DateShim[key] = NativeDate[key];
            }
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        defineProperties(DateShim, {
            now: NativeDate.now,
            UTC: NativeDate.UTC
        }, true);
        DateShim.prototype = NativeDate.prototype;
        defineProperties(DateShim.prototype, {
            constructor: DateShim
        }, true);

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        var parseShim = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = $Number(match[1]),
                    month = $Number(match[2] || 1) - 1,
                    day = $Number(match[3] || 1) - 1,
                    hour = $Number(match[4] || 0),
                    minute = $Number(match[5] || 0),
                    second = $Number(match[6] || 0),
                    millisecond = Math.floor($Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    isLocalTime = Boolean(match[4] && !match[8]),
                    signOffset = match[9] === '-' ? 1 : -1,
                    hourOffset = $Number(match[10] || 0),
                    minuteOffset = $Number(match[11] || 0),
                    result;
                var hasMinutesOrSecondsOrMilliseconds = minute > 0 || second > 0 || millisecond > 0;
                if (
                    hour < (hasMinutesOrSecondsOrMilliseconds ? 24 : 25) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (dayFromMonth(year, month + 1) - dayFromMonth(year, month))
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };
        defineProperties(DateShim, { parse: parseShim });

        return DateShim;
    }(Date));
    /* global Date: false */
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
var hasToFixedBugs = NumberPrototype.toFixed && (
  (0.00008).toFixed(3) !== '0.000' ||
  (0.9).toFixed(0) !== '1' ||
  (1.255).toFixed(2) !== '1.25' ||
  (1000000000000000128).toFixed(0) !== '1000000000000000128'
);

var toFixedHelpers = {
  base: 1e7,
  size: 6,
  data: [0, 0, 0, 0, 0, 0],
  multiply: function multiply(n, c) {
      var i = -1;
      var c2 = c;
      while (++i < toFixedHelpers.size) {
          c2 += n * toFixedHelpers.data[i];
          toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
          c2 = Math.floor(c2 / toFixedHelpers.base);
      }
  },
  divide: function divide(n) {
      var i = toFixedHelpers.size;
      var c = 0;
      while (--i >= 0) {
          c += toFixedHelpers.data[i];
          toFixedHelpers.data[i] = Math.floor(c / n);
          c = (c % n) * toFixedHelpers.base;
      }
  },
  numToString: function numToString() {
      var i = toFixedHelpers.size;
      var s = '';
      while (--i >= 0) {
          if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
              var t = $String(toFixedHelpers.data[i]);
              if (s === '') {
                  s = t;
              } else {
                  s += strSlice('0000000', 0, 7 - t.length) + t;
              }
          }
      }
      return s;
  },
  pow: function pow(x, n, acc) {
      return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
  },
  log: function log(x) {
      var n = 0;
      var x2 = x;
      while (x2 >= 4096) {
          n += 12;
          x2 /= 4096;
      }
      while (x2 >= 2) {
          n += 1;
          x2 /= 2;
      }
      return n;
  }
};

var toFixedShim = function toFixed(fractionDigits) {
    var f, x, s, m, e, z, j, k;

    // Test for NaN and round fractionDigits down
    f = $Number(fractionDigits);
    f = isActualNaN(f) ? 0 : Math.floor(f);

    if (f < 0 || f > 20) {
        throw new RangeError('Number.toFixed called with invalid number of decimals');
    }

    x = $Number(this);

    if (isActualNaN(x)) {
        return 'NaN';
    }

    // If it is too big or small, return the string value of the number
    if (x <= -1e21 || x >= 1e21) {
        return $String(x);
    }

    s = '';

    if (x < 0) {
        s = '-';
        x = -x;
    }

    m = '0';

    if (x > 1e-21) {
        // 1e-21 < x < 1e21
        // -70 < log2(x) < 70
        e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
        z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
        z *= 0x10000000000000; // Math.pow(2, 52);
        e = 52 - e;

        // -18 < e < 122
        // x = z / 2 ^ e
        if (e > 0) {
            toFixedHelpers.multiply(0, z);
            j = f;

            while (j >= 7) {
                toFixedHelpers.multiply(1e7, 0);
                j -= 7;
            }

            toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
            j = e - 1;

            while (j >= 23) {
                toFixedHelpers.divide(1 << 23);
                j -= 23;
            }

            toFixedHelpers.divide(1 << j);
            toFixedHelpers.multiply(1, 1);
            toFixedHelpers.divide(2);
            m = toFixedHelpers.numToString();
        } else {
            toFixedHelpers.multiply(0, z);
            toFixedHelpers.multiply(1 << (-e), 0);
            m = toFixedHelpers.numToString() + strSlice('0.00000000000000000000', 2, 2 + f);
        }
    }

    if (f > 0) {
        k = m.length;

        if (k <= f) {
            m = s + strSlice('0.0000000000000000000', 0, f - k + 2) + m;
        } else {
            m = s + strSlice(m, 0, k - f) + '.' + strSlice(m, k - f);
        }
    } else {
        m = s + m;
    }

    return m;
};
defineProperties(NumberPrototype, { toFixed: toFixedShim }, hasToFixedBugs);

var hasToPrecisionUndefinedBug = (function () {
    try {
        return 1.0.toPrecision(undefined) === '1';
    } catch (e) {
        return true;
    }
}());
var originalToPrecision = NumberPrototype.toPrecision;
defineProperties(NumberPrototype, {
    toPrecision: function toPrecision(precision) {
        return typeof precision === 'undefined' ? originalToPrecision.call(this) : originalToPrecision.call(this, precision);
    }
}, hasToPrecisionUndefinedBug);

//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === 't' ||
    'test'.split(/(?:)/, -1).length !== 4 ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group
        var maxSafe32BitInt = Math.pow(2, 32) - 1;

        StringPrototype.split = function (separator, limit) {
            var string = String(this);
            if (typeof separator === 'undefined' && limit === 0) {
                return [];
            }

            // If `separator` is not a regex, use native split
            if (!isRegex(separator)) {
                return strSplit(this, separator, limit);
            }

            var output = [];
            var flags = (separator.ignoreCase ? 'i' : '') +
                        (separator.multiline ? 'm' : '') +
                        (separator.unicode ? 'u' : '') + // in ES6
                        (separator.sticky ? 'y' : ''), // Firefox 3+ and ES6
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator2, match, lastIndex, lastLength;
            var separatorCopy = new RegExp(separator.source, flags + 'g');
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // maxSafe32BitInt
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : ES.ToUint32(limit);
            match = separatorCopy.exec(string);
            while (match) {
                // `separatorCopy.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    pushCall(output, strSlice(string, lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        /* eslint-disable no-loop-func */
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (typeof arguments[i] === 'undefined') {
                                    match[i] = void 0;
                                }
                            }
                        });
                        /* eslint-enable no-loop-func */
                    }
                    if (match.length > 1 && match.index < string.length) {
                        array_push.apply(output, arraySlice(match, 1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= splitLimit) {
                        break;
                    }
                }
                if (separatorCopy.lastIndex === match.index) {
                    separatorCopy.lastIndex++; // Avoid an infinite loop
                }
                match = separatorCopy.exec(string);
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separatorCopy.test('')) {
                    pushCall(output, '');
                }
            } else {
                pushCall(output, strSlice(string, lastLastIndex));
            }
            return output.length > splitLimit ? arraySlice(output, 0, splitLimit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ('0'.split(void 0, 0).length) {
    StringPrototype.split = function split(separator, limit) {
        if (typeof separator === 'undefined' && limit === 0) { return []; }
        return strSplit(this, separator, limit);
    };
}

var str_replace = StringPrototype.replace;
var replaceReportsGroupsCorrectly = (function () {
    var groups = [];
    'x'.replace(/x(.)?/g, function (match, group) {
        pushCall(groups, group);
    });
    return groups.length === 1 && typeof groups[0] === 'undefined';
}());

if (!replaceReportsGroupsCorrectly) {
    StringPrototype.replace = function replace(searchValue, replaceValue) {
        var isFn = isCallable(replaceValue);
        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
        if (!isFn || !hasCapturingGroups) {
            return str_replace.call(this, searchValue, replaceValue);
        } else {
            var wrappedReplaceValue = function (match) {
                var length = arguments.length;
                var originalLastIndex = searchValue.lastIndex;
                searchValue.lastIndex = 0;
                var args = searchValue.exec(match) || [];
                searchValue.lastIndex = originalLastIndex;
                pushCall(args, arguments[length - 2], arguments[length - 1]);
                return replaceValue.apply(this, args);
            };
            return str_replace.call(this, searchValue, wrappedReplaceValue);
        }
    };
}

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
var string_substr = StringPrototype.substr;
var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
defineProperties(StringPrototype, {
    substr: function substr(start, length) {
        var normalizedStart = start;
        if (start < 0) {
            normalizedStart = max(this.length + start, 0);
        }
        return string_substr.call(this, normalizedStart, length);
    }
}, hasNegativeSubstrBug);

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
    '\u2029\uFEFF';
var zeroWidth = '\u200b';
var wsRegexChars = '[' + ws + ']';
var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
defineProperties(StringPrototype, {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    trim: function trim() {
        if (typeof this === 'undefined' || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
        }
        return $String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
    }
}, hasTrimWhitespaceBug);
var trim = call.bind(String.prototype.trim);

var hasLastIndexBug = StringPrototype.lastIndexOf && 'abcあい'.lastIndexOf('あい', 2) !== -1;
defineProperties(StringPrototype, {
    lastIndexOf: function lastIndexOf(searchString) {
        if (typeof this === 'undefined' || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
        }
        var S = $String(this);
        var searchStr = $String(searchString);
        var numPos = arguments.length > 1 ? $Number(arguments[1]) : NaN;
        var pos = isActualNaN(numPos) ? Infinity : ES.ToInteger(numPos);
        var start = min(max(pos, 0), S.length);
        var searchLen = searchStr.length;
        var k = start + searchLen;
        while (k > 0) {
            k = max(0, k - searchLen);
            var index = strIndexOf(strSlice(S, k, start + searchLen), searchStr);
            if (index !== -1) {
                return k + index;
            }
        }
        return -1;
    }
}, hasLastIndexBug);

var originalLastIndexOf = StringPrototype.lastIndexOf;
defineProperties(StringPrototype, {
    lastIndexOf: function lastIndexOf(searchString) {
        return originalLastIndexOf.apply(this, arguments);
    }
}, StringPrototype.lastIndexOf.length !== 1);

// ES-5 15.1.2.2
/* eslint-disable radix */
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
/* eslint-enable radix */
    /* global parseInt: true */
    parseInt = (function (origParseInt) {
        var hexRegex = /^[\-+]?0[xX]/;
        return function parseInt(str, radix) {
            var string = trim(str);
            var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);
            return origParseInt(string, defaultedRadix);
        };
    }(parseInt));
}

// https://es5.github.io/#x15.1.2.3
if (1 / parseFloat('-0') !== -Infinity) {
    /* global parseFloat: true */
    parseFloat = (function (origParseFloat) {
        return function parseFloat(string) {
            var inputString = trim(string);
            var result = origParseFloat(inputString);
            return result === 0 && strSlice(inputString, 0, 1) === '-' ? -0 : result;
        };
    }(parseFloat));
}

if (String(new RangeError('test')) !== 'RangeError: test') {
    var errorToStringShim = function toString() {
        if (typeof this === 'undefined' || this === null) {
            throw new TypeError("can't convert " + this + ' to object');
        }
        var name = this.name;
        if (typeof name === 'undefined') {
            name = 'Error';
        } else if (typeof name !== 'string') {
            name = $String(name);
        }
        var msg = this.message;
        if (typeof msg === 'undefined') {
            msg = '';
        } else if (typeof msg !== 'string') {
            msg = $String(msg);
        }
        if (!name) {
            return msg;
        }
        if (!msg) {
            return name;
        }
        return name + ': ' + msg;
    };
    // can't use defineProperties here because of toString enumeration issue in IE <= 8
    Error.prototype.toString = errorToStringShim;
}

if (supportsDescriptors) {
    var ensureNonEnumerable = function (obj, prop) {
        if (isEnum(obj, prop)) {
            var desc = Object.getOwnPropertyDescriptor(obj, prop);
            desc.enumerable = false;
            Object.defineProperty(obj, prop, desc);
        }
    };
    ensureNonEnumerable(Error.prototype, 'message');
    if (Error.prototype.message !== '') {
      Error.prototype.message = '';
    }
    ensureNonEnumerable(Error.prototype, 'name');
}

if (String(/a/mig) !== '/a/gim') {
    var regexToString = function toString() {
        var str = '/' + this.source + '/';
        if (this.global) {
            str += 'g';
        }
        if (this.ignoreCase) {
            str += 'i';
        }
        if (this.multiline) {
            str += 'm';
        }
        return str;
    };
    // can't use defineProperties here because of toString enumeration issue in IE <= 8
    RegExp.prototype.toString = regexToString;
}

}));

/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    var call = Function.call;
    var prototypeOfObject = Object.prototype;
    var owns = call.bind(prototypeOfObject.hasOwnProperty);
    var isEnumerable = call.bind(prototypeOfObject.propertyIsEnumerable);
    var toStr = call.bind(prototypeOfObject.toString);

    // If JS engine supports accessors creating shortcuts.
    var defineGetter;
    var defineSetter;
    var lookupGetter;
    var lookupSetter;
    var supportsAccessors = owns(prototypeOfObject, '__defineGetter__');
    if (supportsAccessors) {
        /* eslint-disable no-underscore-dangle, no-restricted-properties */
        defineGetter = call.bind(prototypeOfObject.__defineGetter__);
        defineSetter = call.bind(prototypeOfObject.__defineSetter__);
        lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
        lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
        /* eslint-enable no-underscore-dangle, no-restricted-properties */
    }

    var isPrimitive = function isPrimitive(o) {
        return o == null || (typeof o !== 'object' && typeof o !== 'function');
    };

    // ES5 15.2.3.2
    // http://es5.github.com/#x15.2.3.2
    if (!Object.getPrototypeOf) {
        // https://github.com/es-shims/es5-shim/issues#issue/2
        // http://ejohn.org/blog/objectgetprototypeof/
        // recommended by fschaefer on github
        //
        // sure, and webreflection says ^_^
        // ... this will nerever possibly return null
        // ... Opera Mini breaks here with infinite loops
        Object.getPrototypeOf = function getPrototypeOf(object) {
            // eslint-disable-next-line no-proto
            var proto = object.__proto__;
            if (proto || proto === null) {
                return proto;
            } else if (toStr(object.constructor) === '[object Function]') {
                return object.constructor.prototype;
            } else if (object instanceof Object) {
                return prototypeOfObject;
            } else {
                // Correctly return null for Objects created with `Object.create(null)`
                // (shammed or native) or `{ __proto__: null}`.  Also returns null for
                // cross-realm objects on browsers that lack `__proto__` support (like
                // IE <11), but that's the best we can do.
                return null;
            }
        };
    }

    // ES5 15.2.3.3
    // http://es5.github.com/#x15.2.3.3

    var doesGetOwnPropertyDescriptorWork = function doesGetOwnPropertyDescriptorWork(object) {
        try {
            object.sentinel = 0;
            return Object.getOwnPropertyDescriptor(object, 'sentinel').value === 0;
        } catch (exception) {
            return false;
        }
    };

    // check whether getOwnPropertyDescriptor works if it's given. Otherwise, shim partially.
    if (Object.defineProperty) {
        var getOwnPropertyDescriptorWorksOnObject = doesGetOwnPropertyDescriptorWork({});
        var getOwnPropertyDescriptorWorksOnDom = typeof document === 'undefined' ||
            doesGetOwnPropertyDescriptorWork(document.createElement('div'));
        if (!getOwnPropertyDescriptorWorksOnDom || !getOwnPropertyDescriptorWorksOnObject) {
            var getOwnPropertyDescriptorFallback = Object.getOwnPropertyDescriptor;
        }
    }

    if (!Object.getOwnPropertyDescriptor || getOwnPropertyDescriptorFallback) {
        var ERR_NON_OBJECT = 'Object.getOwnPropertyDescriptor called on a non-object: ';

        /* eslint-disable no-proto */
        Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor(object, property) {
            if (isPrimitive(object)) {
                throw new TypeError(ERR_NON_OBJECT + object);
            }

            // make a valiant attempt to use the real getOwnPropertyDescriptor
            // for I8's DOM elements.
            if (getOwnPropertyDescriptorFallback) {
                try {
                    return getOwnPropertyDescriptorFallback.call(Object, object, property);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            var descriptor;

            // If object does not owns property return undefined immediately.
            if (!owns(object, property)) {
                return descriptor;
            }

            // If object has a property then it's for sure `configurable`, and
            // probably `enumerable`. Detect enumerability though.
            descriptor = {
                enumerable: isEnumerable(object, property),
                configurable: true
            };

            // If JS engine supports accessor properties then property may be a
            // getter or setter.
            if (supportsAccessors) {
                // Unfortunately `__lookupGetter__` will return a getter even
                // if object has own non getter property along with a same named
                // inherited getter. To avoid misbehavior we temporary remove
                // `__proto__` so that `__lookupGetter__` will return getter only
                // if it's owned by an object.
                var prototype = object.__proto__;
                var notPrototypeOfObject = object !== prototypeOfObject;
                // avoid recursion problem, breaking in Opera Mini when
                // Object.getOwnPropertyDescriptor(Object.prototype, 'toString')
                // or any other Object.prototype accessor
                if (notPrototypeOfObject) {
                    object.__proto__ = prototypeOfObject;
                }

                var getter = lookupGetter(object, property);
                var setter = lookupSetter(object, property);

                if (notPrototypeOfObject) {
                    // Once we have getter and setter we can put values back.
                    object.__proto__ = prototype;
                }

                if (getter || setter) {
                    if (getter) {
                        descriptor.get = getter;
                    }
                    if (setter) {
                        descriptor.set = setter;
                    }
                    // If it was accessor property we're done and return here
                    // in order to avoid adding `value` to the descriptor.
                    return descriptor;
                }
            }

            // If we got this far we know that object has an own property that is
            // not an accessor so we set it as a value and return descriptor.
            descriptor.value = object[property];
            descriptor.writable = true;
            return descriptor;
        };
        /* eslint-enable no-proto */
    }

    // ES5 15.2.3.4
    // http://es5.github.com/#x15.2.3.4
    if (!Object.getOwnPropertyNames) {
        Object.getOwnPropertyNames = function getOwnPropertyNames(object) {
            return Object.keys(object);
        };
    }

    // ES5 15.2.3.5
    // http://es5.github.com/#x15.2.3.5
    if (!Object.create) {

        // Contributed by Brandon Benvie, October, 2012
        var createEmpty;
        var supportsProto = !({ __proto__: null } instanceof Object);
        // the following produces false positives
        // in Opera Mini => not a reliable check
        // Object.prototype.__proto__ === null

        // Check for document.domain and active x support
        // No need to use active x approach when document.domain is not set
        // see https://github.com/es-shims/es5-shim/issues/150
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
        /* global ActiveXObject */
        var shouldUseActiveX = function shouldUseActiveX() {
            // return early if document.domain not set
            if (!document.domain) {
                return false;
            }

            try {
                return !!new ActiveXObject('htmlfile');
            } catch (exception) {
                return false;
            }
        };

        // This supports IE8 when document.domain is used
        // see https://github.com/es-shims/es5-shim/issues/150
        // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
        var getEmptyViaActiveX = function getEmptyViaActiveX() {
            var empty;
            var xDoc;

            xDoc = new ActiveXObject('htmlfile');

            var script = 'script';
            xDoc.write('<' + script + '></' + script + '>');
            xDoc.close();

            empty = xDoc.parentWindow.Object.prototype;
            xDoc = null;

            return empty;
        };

        // The original implementation using an iframe
        // before the activex approach was added
        // see https://github.com/es-shims/es5-shim/issues/150
        var getEmptyViaIFrame = function getEmptyViaIFrame() {
            var iframe = document.createElement('iframe');
            var parent = document.body || document.documentElement;
            var empty;

            iframe.style.display = 'none';
            parent.appendChild(iframe);
            // eslint-disable-next-line no-script-url
            iframe.src = 'javascript:';

            empty = iframe.contentWindow.Object.prototype;
            parent.removeChild(iframe);
            iframe = null;

            return empty;
        };

        /* global document */
        if (supportsProto || typeof document === 'undefined') {
            createEmpty = function () {
                return { __proto__: null };
            };
        } else {
            // In old IE __proto__ can't be used to manually set `null`, nor does
            // any other method exist to make an object that inherits from nothing,
            // aside from Object.prototype itself. Instead, create a new global
            // object and *steal* its Object.prototype and strip it bare. This is
            // used as the prototype to create nullary objects.
            createEmpty = function () {
                // Determine which approach to use
                // see https://github.com/es-shims/es5-shim/issues/150
                var empty = shouldUseActiveX() ? getEmptyViaActiveX() : getEmptyViaIFrame();

                delete empty.constructor;
                delete empty.hasOwnProperty;
                delete empty.propertyIsEnumerable;
                delete empty.isPrototypeOf;
                delete empty.toLocaleString;
                delete empty.toString;
                delete empty.valueOf;

                var Empty = function Empty() {};
                Empty.prototype = empty;
                // short-circuit future calls
                createEmpty = function () {
                    return new Empty();
                };
                return new Empty();
            };
        }

        Object.create = function create(prototype, properties) {

            var object;
            var Type = function Type() {}; // An empty constructor.

            if (prototype === null) {
                object = createEmpty();
            } else {
                if (prototype !== null && isPrimitive(prototype)) {
                    // In the native implementation `parent` can be `null`
                    // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                    // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                    // like they are in modern browsers. Using `Object.create` on DOM elements
                    // is...err...probably inappropriate, but the native version allows for it.
                    throw new TypeError('Object prototype may only be an Object or null'); // same msg as Chrome
                }
                Type.prototype = prototype;
                object = new Type();
                // IE has no built-in implementation of `Object.getPrototypeOf`
                // neither `__proto__`, but this manually setting `__proto__` will
                // guarantee that `Object.getPrototypeOf` will work as expected with
                // objects created using `Object.create`
                // eslint-disable-next-line no-proto
                object.__proto__ = prototype;
            }

            if (properties !== void 0) {
                Object.defineProperties(object, properties);
            }

            return object;
        };
    }

    // ES5 15.2.3.6
    // http://es5.github.com/#x15.2.3.6

    // Patch for WebKit and IE8 standard mode
    // Designed by hax <hax.github.com>
    // related issue: https://github.com/es-shims/es5-shim/issues#issue/5
    // IE8 Reference:
    //     http://msdn.microsoft.com/en-us/library/dd282900.aspx
    //     http://msdn.microsoft.com/en-us/library/dd229916.aspx
    // WebKit Bugs:
    //     https://bugs.webkit.org/show_bug.cgi?id=36423

    var doesDefinePropertyWork = function doesDefinePropertyWork(object) {
        try {
            Object.defineProperty(object, 'sentinel', {});
            return 'sentinel' in object;
        } catch (exception) {
            return false;
        }
    };

    // check whether defineProperty works if it's given. Otherwise,
    // shim partially.
    if (Object.defineProperty) {
        var definePropertyWorksOnObject = doesDefinePropertyWork({});
        var definePropertyWorksOnDom = typeof document === 'undefined' ||
            doesDefinePropertyWork(document.createElement('div'));
        if (!definePropertyWorksOnObject || !definePropertyWorksOnDom) {
            var definePropertyFallback = Object.defineProperty,
                definePropertiesFallback = Object.defineProperties;
        }
    }

    if (!Object.defineProperty || definePropertyFallback) {
        var ERR_NON_OBJECT_DESCRIPTOR = 'Property description must be an object: ';
        var ERR_NON_OBJECT_TARGET = 'Object.defineProperty called on non-object: ';
        var ERR_ACCESSORS_NOT_SUPPORTED = 'getters & setters can not be defined on this javascript engine';

        Object.defineProperty = function defineProperty(object, property, descriptor) {
            if (isPrimitive(object)) {
                throw new TypeError(ERR_NON_OBJECT_TARGET + object);
            }
            if (isPrimitive(descriptor)) {
                throw new TypeError(ERR_NON_OBJECT_DESCRIPTOR + descriptor);
            }
            // make a valiant attempt to use the real defineProperty
            // for I8's DOM elements.
            if (definePropertyFallback) {
                try {
                    return definePropertyFallback.call(Object, object, property, descriptor);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            // If it's a data property.
            if ('value' in descriptor) {
                // fail silently if 'writable', 'enumerable', or 'configurable'
                // are requested but not supported
                /*
                // alternate approach:
                if ( // can't implement these features; allow false but not true
                    ('writable' in descriptor && !descriptor.writable) ||
                    ('enumerable' in descriptor && !descriptor.enumerable) ||
                    ('configurable' in descriptor && !descriptor.configurable)
                ))
                    throw new RangeError(
                        'This implementation of Object.defineProperty does not support configurable, enumerable, or writable.'
                    );
                */

                if (supportsAccessors && (lookupGetter(object, property) || lookupSetter(object, property))) {
                    // As accessors are supported only on engines implementing
                    // `__proto__` we can safely override `__proto__` while defining
                    // a property to make sure that we don't hit an inherited
                    // accessor.
                    /* eslint-disable no-proto */
                    var prototype = object.__proto__;
                    object.__proto__ = prototypeOfObject;
                    // Deleting a property anyway since getter / setter may be
                    // defined on object itself.
                    delete object[property];
                    object[property] = descriptor.value;
                    // Setting original `__proto__` back now.
                    object.__proto__ = prototype;
                    /* eslint-enable no-proto */
                } else {
                    object[property] = descriptor.value;
                }
            } else {
                var hasGetter = 'get' in descriptor;
                var hasSetter = 'set' in descriptor;
                if (!supportsAccessors && (hasGetter || hasSetter)) {
                    throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
                }
                // If we got that far then getters and setters can be defined !!
                if (hasGetter) {
                    defineGetter(object, property, descriptor.get);
                }
                if (hasSetter) {
                    defineSetter(object, property, descriptor.set);
                }
            }
            return object;
        };
    }

    // ES5 15.2.3.7
    // http://es5.github.com/#x15.2.3.7
    if (!Object.defineProperties || definePropertiesFallback) {
        Object.defineProperties = function defineProperties(object, properties) {
            // make a valiant attempt to use the real defineProperties
            if (definePropertiesFallback) {
                try {
                    return definePropertiesFallback.call(Object, object, properties);
                } catch (exception) {
                    // try the shim if the real one doesn't work
                }
            }

            Object.keys(properties).forEach(function (property) {
                if (property !== '__proto__') {
                    Object.defineProperty(object, property, properties[property]);
                }
            });
            return object;
        };
    }

    // ES5 15.2.3.8
    // http://es5.github.com/#x15.2.3.8
    if (!Object.seal) {
        Object.seal = function seal(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.seal can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // ES5 15.2.3.9
    // http://es5.github.com/#x15.2.3.9
    if (!Object.freeze) {
        Object.freeze = function freeze(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.freeze can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // detect a Rhino bug and patch it
    try {
        Object.freeze(function () {});
    } catch (exception) {
        Object.freeze = (function (freezeObject) {
            return function freeze(object) {
                if (typeof object === 'function') {
                    return object;
                } else {
                    return freezeObject(object);
                }
            };
        }(Object.freeze));
    }

    // ES5 15.2.3.10
    // http://es5.github.com/#x15.2.3.10
    if (!Object.preventExtensions) {
        Object.preventExtensions = function preventExtensions(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.preventExtensions can only be called on Objects.');
            }
            // this is misleading and breaks feature-detection, but
            // allows "securable" code to "gracefully" degrade to working
            // but insecure code.
            return object;
        };
    }

    // ES5 15.2.3.11
    // http://es5.github.com/#x15.2.3.11
    if (!Object.isSealed) {
        Object.isSealed = function isSealed(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.isSealed can only be called on Objects.');
            }
            return false;
        };
    }

    // ES5 15.2.3.12
    // http://es5.github.com/#x15.2.3.12
    if (!Object.isFrozen) {
        Object.isFrozen = function isFrozen(object) {
            if (Object(object) !== object) {
                throw new TypeError('Object.isFrozen can only be called on Objects.');
            }
            return false;
        };
    }

    // ES5 15.2.3.13
    // http://es5.github.com/#x15.2.3.13
    if (!Object.isExtensible) {
        Object.isExtensible = function isExtensible(object) {
            // 1. If Type(O) is not Object throw a TypeError exception.
            if (Object(object) !== object) {
                throw new TypeError('Object.isExtensible can only be called on Objects.');
            }
            // 2. Return the Boolean value of the [[Extensible]] internal property of O.
            var name = '';
            while (owns(object, name)) {
                name += '?';
            }
            object[name] = true;
            var returnValue = owns(object, name);
            delete object[name];
            return returnValue;
        };
    }

}));
/*!
 * jQuery JavaScript Library v3.6.0
 * https://jquery.com/
 *
 * Includes Sizzle.js
 * https://sizzlejs.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2021-03-02T17:08Z
 */
( function( global, factory ) {

	"use strict";

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
} )( typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
// throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
// arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
// enough that all such attempts are guarded in a try block.
"use strict";

var arr = [];

var getProto = Object.getPrototypeOf;

var slice = arr.slice;

var flat = arr.flat ? function( array ) {
	return arr.flat.call( array );
} : function( array ) {
	return arr.concat.apply( [], array );
};


var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var fnToString = hasOwn.toString;

var ObjectFunctionString = fnToString.call( Object );

var support = {};

var isFunction = function isFunction( obj ) {

		// Support: Chrome <=57, Firefox <=52
		// In some browsers, typeof returns "function" for HTML <object> elements
		// (i.e., `typeof document.createElement( "object" ) === "function"`).
		// We don't want to classify *any* DOM node as a function.
		// Support: QtWeb <=3.8.5, WebKit <=534.34, wkhtmltopdf tool <=0.12.5
		// Plus for old WebKit, typeof returns "function" for HTML collections
		// (e.g., `typeof document.getElementsByTagName("div") === "function"`). (gh-4756)
		return typeof obj === "function" && typeof obj.nodeType !== "number" &&
			typeof obj.item !== "function";
	};


var isWindow = function isWindow( obj ) {
		return obj != null && obj === obj.window;
	};


var document = window.document;



	var preservedScriptAttributes = {
		type: true,
		src: true,
		nonce: true,
		noModule: true
	};

	function DOMEval( code, node, doc ) {
		doc = doc || document;

		var i, val,
			script = doc.createElement( "script" );

		script.text = code;
		if ( node ) {
			for ( i in preservedScriptAttributes ) {

				// Support: Firefox 64+, Edge 18+
				// Some browsers don't support the "nonce" property on scripts.
				// On the other hand, just using `getAttribute` is not enough as
				// the `nonce` attribute is reset to an empty string whenever it
				// becomes browsing-context connected.
				// See https://github.com/whatwg/html/issues/2369
				// See https://html.spec.whatwg.org/#nonce-attributes
				// The `node.getAttribute` check was added for the sake of
				// `jQuery.globalEval` so that it can fake a nonce-containing node
				// via an object.
				val = node[ i ] || node.getAttribute && node.getAttribute( i );
				if ( val ) {
					script.setAttribute( i, val );
				}
			}
		}
		doc.head.appendChild( script ).parentNode.removeChild( script );
	}


function toType( obj ) {
	if ( obj == null ) {
		return obj + "";
	}

	// Support: Android <=2.3 only (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ toString.call( obj ) ] || "object" :
		typeof obj;
}
/* global Symbol */
// Defining this global in .eslintrc.json would create a danger of using the global
// unguarded in another place, it seems safer to define global only for this module



var
	version = "3.6.0",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {

		// Return all the elements in a clean array
		if ( num == null ) {
			return slice.call( this );
		}

		// Return just the one element from the set
		return num < 0 ? this[ num + this.length ] : this[ num ];
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	even: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return ( i + 1 ) % 2;
		} ) );
	},

	odd: function() {
		return this.pushStack( jQuery.grep( this, function( _elem, i ) {
			return i % 2;
		} ) );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction( target ) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				copy = options[ name ];

				// Prevent Object.prototype pollution
				// Prevent never-ending loop
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = Array.isArray( copy ) ) ) ) {
					src = target[ name ];

					// Ensure proper type for the source value
					if ( copyIsArray && !Array.isArray( src ) ) {
						clone = [];
					} else if ( !copyIsArray && !jQuery.isPlainObject( src ) ) {
						clone = {};
					} else {
						clone = src;
					}
					copyIsArray = false;

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isPlainObject: function( obj ) {
		var proto, Ctor;

		// Detect obvious negatives
		// Use toString instead of jQuery.type to catch host objects
		if ( !obj || toString.call( obj ) !== "[object Object]" ) {
			return false;
		}

		proto = getProto( obj );

		// Objects with no prototype (e.g., `Object.create( null )`) are plain
		if ( !proto ) {
			return true;
		}

		// Objects with prototype are plain iff they were constructed by a global Object function
		Ctor = hasOwn.call( proto, "constructor" ) && proto.constructor;
		return typeof Ctor === "function" && fnToString.call( Ctor ) === ObjectFunctionString;
	},

	isEmptyObject: function( obj ) {
		var name;

		for ( name in obj ) {
			return false;
		}
		return true;
	},

	// Evaluates a script in a provided context; falls back to the global one
	// if not specified.
	globalEval: function( code, options, doc ) {
		DOMEval( code, { nonce: options && options.nonce }, doc );
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
						[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// Support: Android <=4.0 only, PhantomJS 1 only
	// push.apply(_, arraylike) throws on ancient WebKit
	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return flat( ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
}

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( _i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

function isArrayLike( obj ) {

	// Support: real iOS 8.2 only (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = toType( obj );

	if ( isFunction( obj ) || isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.3.6
 * https://sizzlejs.com/
 *
 * Copyright JS Foundation and other contributors
 * Released under the MIT license
 * https://js.foundation/
 *
 * Date: 2021-02-16
 */
( function( window ) {
var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	nonnativeSelectorCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// Instance methods
	hasOwn = ( {} ).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	pushNative = arr.push,
	push = arr.push,
	slice = arr.slice,

	// Use a stripped-down indexOf as it's faster than native
	// https://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[ i ] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|" +
		"ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// https://www.w3.org/TR/css-syntax-3/#ident-token-diagram
	identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace +
		"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +

		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +

		// "Attribute values must be CSS identifiers [capture 5]
		// or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" +
		whitespace + "*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +

		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +

		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +

		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" +
		whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace +
		"*" ),
	rdescend = new RegExp( whitespace + "|>" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" +
			whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" +
			whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),

		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace +
			"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace +
			"*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rhtml = /HTML$/i,
	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g" ),
	funescape = function( escape, nonHex ) {
		var high = "0x" + escape.slice( 1 ) - 0x10000;

		return nonHex ?

			// Strip the backslash prefix from a non-hex escape sequence
			nonHex :

			// Replace a hexadecimal escape sequence with the encoded Unicode code point
			// Support: IE <=11+
			// For values outside the Basic Multilingual Plane (BMP), manually construct a
			// surrogate pair
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" +
				ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	},

	inDisabledFieldset = addCombinator(
		function( elem ) {
			return elem.disabled === true && elem.nodeName.toLowerCase() === "fieldset";
		},
		{ dir: "parentNode", next: "legend" }
	);

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		( arr = slice.call( preferredDoc.childNodes ) ),
		preferredDoc.childNodes
	);

	// Support: Android<4.0
	// Detect silently failing push.apply
	// eslint-disable-next-line no-unused-expressions
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			pushNative.apply( target, slice.call( els ) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;

			// Can't trust NodeList.length
			while ( ( target[ j++ ] = els[ i++ ] ) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {
		setDocument( context );
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && ( match = rquickExpr.exec( selector ) ) ) {

				// ID selector
				if ( ( m = match[ 1 ] ) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( ( elem = context.getElementById( m ) ) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && ( elem = newContext.getElementById( m ) ) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[ 2 ] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( ( m = match[ 3 ] ) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!nonnativeSelectorCache[ selector + " " ] &&
				( !rbuggyQSA || !rbuggyQSA.test( selector ) ) &&

				// Support: IE 8 only
				// Exclude object elements
				( nodeType !== 1 || context.nodeName.toLowerCase() !== "object" ) ) {

				newSelector = selector;
				newContext = context;

				// qSA considers elements outside a scoping root when evaluating child or
				// descendant combinators, which is not what we want.
				// In such cases, we work around the behavior by prefixing every selector in the
				// list with an ID selector referencing the scope context.
				// The technique has to be used as well when a leading combinator is used
				// as such selectors are not recognized by querySelectorAll.
				// Thanks to Andrew Dupont for this technique.
				if ( nodeType === 1 &&
					( rdescend.test( selector ) || rcombinators.test( selector ) ) ) {

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;

					// We can use :scope instead of the ID hack if the browser
					// supports it & if we're not changing the context.
					if ( newContext !== context || !support.scope ) {

						// Capture the context ID, setting it first if necessary
						if ( ( nid = context.getAttribute( "id" ) ) ) {
							nid = nid.replace( rcssescape, fcssescape );
						} else {
							context.setAttribute( "id", ( nid = expando ) );
						}
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					while ( i-- ) {
						groups[ i ] = ( nid ? "#" + nid : ":scope" ) + " " +
							toSelector( groups[ i ] );
					}
					newSelector = groups.join( "," );
				}

				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch ( qsaError ) {
					nonnativeSelectorCache( selector, true );
				} finally {
					if ( nid === expando ) {
						context.removeAttribute( "id" );
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {

		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {

			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return ( cache[ key + " " ] = value );
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created element and returns a boolean result
 */
function assert( fn ) {
	var el = document.createElement( "fieldset" );

	try {
		return !!fn( el );
	} catch ( e ) {
		return false;
	} finally {

		// Remove from its parent by default
		if ( el.parentNode ) {
			el.parentNode.removeChild( el );
		}

		// release memory in IE
		el = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split( "|" ),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[ i ] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			a.sourceIndex - b.sourceIndex;

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( ( cur = cur.nextSibling ) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return ( name === "input" || name === "button" ) && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for :enabled/:disabled
 * @param {Boolean} disabled true for :disabled; false for :enabled
 */
function createDisabledPseudo( disabled ) {

	// Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
	return function( elem ) {

		// Only certain elements can match :enabled or :disabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
		// https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
		if ( "form" in elem ) {

			// Check for inherited disabledness on relevant non-disabled elements:
			// * listed form-associated elements in a disabled fieldset
			//   https://html.spec.whatwg.org/multipage/forms.html#category-listed
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
			// * option elements in a disabled optgroup
			//   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
			// All such elements have a "form" property.
			if ( elem.parentNode && elem.disabled === false ) {

				// Option elements defer to a parent optgroup if present
				if ( "label" in elem ) {
					if ( "label" in elem.parentNode ) {
						return elem.parentNode.disabled === disabled;
					} else {
						return elem.disabled === disabled;
					}
				}

				// Support: IE 6 - 11
				// Use the isDisabled shortcut property to check for disabled fieldset ancestors
				return elem.isDisabled === disabled ||

					// Where there is no isDisabled, check manually
					/* jshint -W018 */
					elem.isDisabled !== !disabled &&
					inDisabledFieldset( elem ) === disabled;
			}

			return elem.disabled === disabled;

		// Try to winnow out elements that can't be disabled before trusting the disabled property.
		// Some victims get caught in our net (label, legend, menu, track), but it shouldn't
		// even exist on them, let alone have a boolean value.
		} else if ( "label" in elem ) {
			return elem.disabled === disabled;
		}

		// Remaining elements are neither :enabled nor :disabled
		return false;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction( function( argument ) {
		argument = +argument;
		return markFunction( function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ ( j = matchIndexes[ i ] ) ] ) {
					seed[ j ] = !( matches[ j ] = seed[ j ] );
				}
			}
		} );
	} );
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	var namespace = elem && elem.namespaceURI,
		docElem = elem && ( elem.ownerDocument || elem ).documentElement;

	// Support: IE <=8
	// Assume HTML when documentElement doesn't yet exist, such as inside loading iframes
	// https://bugs.jquery.com/ticket/4833
	return !rhtml.test( namespace || docElem && docElem.nodeName || "HTML" );
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, subWindow,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( doc == document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9 - 11+, Edge 12 - 18+
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( preferredDoc != document &&
		( subWindow = document.defaultView ) && subWindow.top !== subWindow ) {

		// Support: IE 11, Edge
		if ( subWindow.addEventListener ) {
			subWindow.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( subWindow.attachEvent ) {
			subWindow.attachEvent( "onunload", unloadHandler );
		}
	}

	// Support: IE 8 - 11+, Edge 12 - 18+, Chrome <=16 - 25 only, Firefox <=3.6 - 31 only,
	// Safari 4 - 5 only, Opera <=11.6 - 12.x only
	// IE/Edge & older browsers don't support the :scope pseudo-class.
	// Support: Safari 6.0 only
	// Safari 6.0 supports :scope but it's an alias of :root there.
	support.scope = assert( function( el ) {
		docElem.appendChild( el ).appendChild( document.createElement( "div" ) );
		return typeof el.querySelectorAll !== "undefined" &&
			!el.querySelectorAll( ":scope fieldset div" ).length;
	} );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert( function( el ) {
		el.className = "i";
		return !el.getAttribute( "className" );
	} );

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert( function( el ) {
		el.appendChild( document.createComment( "" ) );
		return !el.getElementsByTagName( "*" ).length;
	} );

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programmatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert( function( el ) {
		docElem.appendChild( el ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	} );

	// ID filter and find
	if ( support.getById ) {
		Expr.filter[ "ID" ] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute( "id" ) === attrId;
			};
		};
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var elem = context.getElementById( id );
				return elem ? [ elem ] : [];
			}
		};
	} else {
		Expr.filter[ "ID" ] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode( "id" );
				return node && node.value === attrId;
			};
		};

		// Support: IE 6 - 7 only
		// getElementById is not reliable as a find shortcut
		Expr.find[ "ID" ] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var node, i, elems,
					elem = context.getElementById( id );

				if ( elem ) {

					// Verify the id attribute
					node = elem.getAttributeNode( "id" );
					if ( node && node.value === id ) {
						return [ elem ];
					}

					// Fall back on getElementsByName
					elems = context.getElementsByName( id );
					i = 0;
					while ( ( elem = elems[ i++ ] ) ) {
						node = elem.getAttributeNode( "id" );
						if ( node && node.value === id ) {
							return [ elem ];
						}
					}
				}

				return [];
			}
		};
	}

	// Tag
	Expr.find[ "TAG" ] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,

				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( ( elem = results[ i++ ] ) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find[ "CLASS" ] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See https://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( ( support.qsa = rnative.test( document.querySelectorAll ) ) ) {

		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert( function( el ) {

			var input;

			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// https://bugs.jquery.com/ticket/12359
			docElem.appendChild( el ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( el.querySelectorAll( "[msallowcapture^='']" ).length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !el.querySelectorAll( "[selected]" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !el.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push( "~=" );
			}

			// Support: IE 11+, Edge 15 - 18+
			// IE 11/Edge don't find elements on a `[name='']` query in some cases.
			// Adding a temporary attribute to the document before the selection works
			// around the issue.
			// Interestingly, IE 10 & older don't seem to have the issue.
			input = document.createElement( "input" );
			input.setAttribute( "name", "" );
			el.appendChild( input );
			if ( !el.querySelectorAll( "[name='']" ).length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*name" + whitespace + "*=" +
					whitespace + "*(?:''|\"\")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !el.querySelectorAll( ":checked" ).length ) {
				rbuggyQSA.push( ":checked" );
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibling-combinator selector` fails
			if ( !el.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push( ".#.+[+~]" );
			}

			// Support: Firefox <=3.6 - 5 only
			// Old Firefox doesn't throw on a badly-escaped identifier.
			el.querySelectorAll( "\\\f" );
			rbuggyQSA.push( "[\\r\\n\\f]" );
		} );

		assert( function( el ) {
			el.innerHTML = "<a href='' disabled='disabled'></a>" +
				"<select disabled='disabled'><option/></select>";

			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement( "input" );
			input.setAttribute( "type", "hidden" );
			el.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( el.querySelectorAll( "[name=d]" ).length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( el.querySelectorAll( ":enabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: IE9-11+
			// IE's :disabled selector does not pick up the children of disabled fieldsets
			docElem.appendChild( el ).disabled = true;
			if ( el.querySelectorAll( ":disabled" ).length !== 2 ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Support: Opera 10 - 11 only
			// Opera 10-11 does not throw on post-comma invalid pseudos
			el.querySelectorAll( "*,:x" );
			rbuggyQSA.push( ",.*:" );
		} );
	}

	if ( ( support.matchesSelector = rnative.test( ( matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector ) ) ) ) {

		assert( function( el ) {

			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( el, "*" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( el, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		} );
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join( "|" ) );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join( "|" ) );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			) );
		} :
		function( a, b ) {
			if ( b ) {
				while ( ( b = b.parentNode ) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		// Support: IE 11+, Edge 17 - 18+
		// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
		// two documents; shallow comparisons work.
		// eslint-disable-next-line eqeqeq
		compare = ( a.ownerDocument || a ) == ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			( !support.sortDetached && b.compareDocumentPosition( a ) === compare ) ) {

			// Choose the first element that is related to our preferred document
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( a == document || a.ownerDocument == preferredDoc &&
				contains( preferredDoc, a ) ) {
				return -1;
			}

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			// eslint-disable-next-line eqeqeq
			if ( b == document || b.ownerDocument == preferredDoc &&
				contains( preferredDoc, b ) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {

			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			return a == document ? -1 :
				b == document ? 1 :
				/* eslint-enable eqeqeq */
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( ( cur = cur.parentNode ) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( ( cur = cur.parentNode ) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[ i ] === bp[ i ] ) {
			i++;
		}

		return i ?

			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[ i ], bp[ i ] ) :

			// Otherwise nodes in our document sort first
			// Support: IE 11+, Edge 17 - 18+
			// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
			// two documents; shallow comparisons work.
			/* eslint-disable eqeqeq */
			ap[ i ] == preferredDoc ? -1 :
			bp[ i ] == preferredDoc ? 1 :
			/* eslint-enable eqeqeq */
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	setDocument( elem );

	if ( support.matchesSelector && documentIsHTML &&
		!nonnativeSelectorCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||

				// As well, disconnected nodes are said to be in a document
				// fragment in IE 9
				elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch ( e ) {
			nonnativeSelectorCache( expr, true );
		}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( context.ownerDocument || context ) != document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {

	// Set document vars if needed
	// Support: IE 11+, Edge 17 - 18+
	// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
	// two documents; shallow comparisons work.
	// eslint-disable-next-line eqeqeq
	if ( ( elem.ownerDocument || elem ) != document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],

		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			( val = elem.getAttributeNode( name ) ) && val.specified ?
				val.value :
				null;
};

Sizzle.escape = function( sel ) {
	return ( sel + "" ).replace( rcssescape, fcssescape );
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( ( elem = results[ i++ ] ) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {

		// If no nodeType, this is expected to be an array
		while ( ( node = elem[ i++ ] ) ) {

			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {

		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {

			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}

	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[ 1 ] = match[ 1 ].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[ 3 ] = ( match[ 3 ] || match[ 4 ] ||
				match[ 5 ] || "" ).replace( runescape, funescape );

			if ( match[ 2 ] === "~=" ) {
				match[ 3 ] = " " + match[ 3 ] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {

			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[ 1 ] = match[ 1 ].toLowerCase();

			if ( match[ 1 ].slice( 0, 3 ) === "nth" ) {

				// nth-* requires argument
				if ( !match[ 3 ] ) {
					Sizzle.error( match[ 0 ] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[ 4 ] = +( match[ 4 ] ?
					match[ 5 ] + ( match[ 6 ] || 1 ) :
					2 * ( match[ 3 ] === "even" || match[ 3 ] === "odd" ) );
				match[ 5 ] = +( ( match[ 7 ] + match[ 8 ] ) || match[ 3 ] === "odd" );

				// other types prohibit arguments
			} else if ( match[ 3 ] ) {
				Sizzle.error( match[ 0 ] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[ 6 ] && match[ 2 ];

			if ( matchExpr[ "CHILD" ].test( match[ 0 ] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[ 3 ] ) {
				match[ 2 ] = match[ 4 ] || match[ 5 ] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&

				// Get excess from tokenize (recursively)
				( excess = tokenize( unquoted, true ) ) &&

				// advance to the next closing parenthesis
				( excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length ) ) {

				// excess is a negative index
				match[ 0 ] = match[ 0 ].slice( 0, excess );
				match[ 2 ] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() {
					return true;
				} :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				( pattern = new RegExp( "(^|" + whitespace +
					")" + className + "(" + whitespace + "|$)" ) ) && classCache(
						className, function( elem ) {
							return pattern.test(
								typeof elem.className === "string" && elem.className ||
								typeof elem.getAttribute !== "undefined" &&
									elem.getAttribute( "class" ) ||
								""
							);
				} );
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				/* eslint-disable max-len */

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
				/* eslint-enable max-len */

			};
		},

		"CHILD": function( type, what, _argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, _context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( ( node = node[ dir ] ) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}

								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || ( node[ expando ] = {} );

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								( outerCache[ node.uniqueID ] = {} );

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( ( node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								( diff = nodeIndex = 0 ) || start.pop() ) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {

							// Use previously-cached element index if available
							if ( useCache ) {

								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || ( node[ expando ] = {} );

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									( outerCache[ node.uniqueID ] = {} );

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {

								// Use the same loop as above to seek `elem` from the start
								while ( ( node = ++nodeIndex && node && node[ dir ] ||
									( diff = nodeIndex = 0 ) || start.pop() ) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] ||
												( node[ expando ] = {} );

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												( outerCache[ node.uniqueID ] = {} );

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {

			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction( function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[ i ] );
							seed[ idx ] = !( matches[ idx ] = matched[ i ] );
						}
					} ) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {

		// Potentially complex pseudos
		"not": markFunction( function( selector ) {

			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction( function( seed, matches, _context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( ( elem = unmatched[ i ] ) ) {
							seed[ i ] = !( matches[ i ] = elem );
						}
					}
				} ) :
				function( elem, _context, xml ) {
					input[ 0 ] = elem;
					matcher( input, null, xml, results );

					// Don't keep the element (issue #299)
					input[ 0 ] = null;
					return !results.pop();
				};
		} ),

		"has": markFunction( function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		} ),

		"contains": markFunction( function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || getText( elem ) ).indexOf( text ) > -1;
			};
		} ),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {

			// lang value must be a valid identifier
			if ( !ridentifier.test( lang || "" ) ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( ( elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute( "xml:lang" ) || elem.getAttribute( "lang" ) ) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( ( elem = elem.parentNode ) && elem.nodeType === 1 );
				return false;
			};
		} ),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement &&
				( !document.hasFocus || document.hasFocus() ) &&
				!!( elem.type || elem.href || ~elem.tabIndex );
		},

		// Boolean properties
		"enabled": createDisabledPseudo( false ),
		"disabled": createDisabledPseudo( true ),

		"checked": function( elem ) {

			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return ( nodeName === "input" && !!elem.checked ) ||
				( nodeName === "option" && !!elem.selected );
		},

		"selected": function( elem ) {

			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				// eslint-disable-next-line no-unused-expressions
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {

			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos[ "empty" ]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( ( attr = elem.getAttribute( "type" ) ) == null ||
					attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo( function() {
			return [ 0 ];
		} ),

		"last": createPositionalPseudo( function( _matchIndexes, length ) {
			return [ length - 1 ];
		} ),

		"eq": createPositionalPseudo( function( _matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		} ),

		"even": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"odd": createPositionalPseudo( function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"lt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ?
				argument + length :
				argument > length ?
					length :
					argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} ),

		"gt": createPositionalPseudo( function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		} )
	}
};

Expr.pseudos[ "nth" ] = Expr.pseudos[ "eq" ];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || ( match = rcomma.exec( soFar ) ) ) {
			if ( match ) {

				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[ 0 ].length ) || soFar;
			}
			groups.push( ( tokens = [] ) );
		}

		matched = false;

		// Combinators
		if ( ( match = rcombinators.exec( soFar ) ) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,

				// Cast descendant combinators to space
				type: match[ 0 ].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( ( match = matchExpr[ type ].exec( soFar ) ) && ( !preFilters[ type ] ||
				( match = preFilters[ type ]( match ) ) ) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :

			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[ i ].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		skip = combinator.next,
		key = skip || dir,
		checkNonElements = base && key === "parentNode",
		doneName = done++;

	return combinator.first ?

		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( ( elem = elem[ dir ] ) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
			return false;
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( ( elem = elem[ dir ] ) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || ( elem[ expando ] = {} );

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] ||
							( outerCache[ elem.uniqueID ] = {} );

						if ( skip && skip === elem.nodeName.toLowerCase() ) {
							elem = elem[ dir ] || elem;
						} else if ( ( oldCache = uniqueCache[ key ] ) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return ( newCache[ 2 ] = oldCache[ 2 ] );
						} else {

							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ key ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( ( newCache[ 2 ] = matcher( elem, context, xml ) ) ) {
								return true;
							}
						}
					}
				}
			}
			return false;
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[ i ]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[ 0 ];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[ i ], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( ( elem = unmatched[ i ] ) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction( function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts(
				selector || "*",
				context.nodeType ? [ context ] : context,
				[]
			),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?

				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( ( elem = temp[ i ] ) ) {
					matcherOut[ postMap[ i ] ] = !( matcherIn[ postMap[ i ] ] = elem );
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {

					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( ( elem = matcherOut[ i ] ) ) {

							// Restore matcherIn since elem is not yet a final match
							temp.push( ( matcherIn[ i ] = elem ) );
						}
					}
					postFinder( null, ( matcherOut = [] ), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( ( elem = matcherOut[ i ] ) &&
						( temp = postFinder ? indexOf( seed, elem ) : preMap[ i ] ) > -1 ) {

						seed[ temp ] = !( results[ temp ] = elem );
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	} );
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[ 0 ].type ],
		implicitRelative = leadingRelative || Expr.relative[ " " ],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				( checkContext = context ).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );

			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( ( matcher = Expr.relative[ tokens[ i ].type ] ) ) {
			matchers = [ addCombinator( elementMatcher( matchers ), matcher ) ];
		} else {
			matcher = Expr.filter[ tokens[ i ].type ].apply( null, tokens[ i ].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {

				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[ j ].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(

					// If the preceding token was a descendant combinator, insert an implicit any-element `*`
					tokens
						.slice( 0, i - 1 )
						.concat( { value: tokens[ i - 2 ].type === " " ? "*" : "" } )
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( ( tokens = tokens.slice( j ) ) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,

				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find[ "TAG" ]( "*", outermost ),

				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = ( dirruns += contextBackup == null ? 1 : Math.random() || 0.1 ),
				len = elems.length;

			if ( outermost ) {

				// Support: IE 11+, Edge 17 - 18+
				// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
				// two documents; shallow comparisons work.
				// eslint-disable-next-line eqeqeq
				outermostContext = context == document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && ( elem = elems[ i ] ) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;

					// Support: IE 11+, Edge 17 - 18+
					// IE/Edge sometimes throw a "Permission denied" error when strict-comparing
					// two documents; shallow comparisons work.
					// eslint-disable-next-line eqeqeq
					if ( !context && elem.ownerDocument != document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( ( matcher = elementMatchers[ j++ ] ) ) {
						if ( matcher( elem, context || document, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {

					// They will have gone through all possible matchers
					if ( ( elem = !matcher && elem ) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( ( matcher = setMatchers[ j++ ] ) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {

					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !( unmatched[ i ] || setMatched[ i ] ) ) {
								setMatched[ i ] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {

		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[ i ] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache(
			selector,
			matcherFromGroupMatchers( elementMatchers, setMatchers )
		);

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( ( selector = compiled.selector || selector ) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[ 0 ] = match[ 0 ].slice( 0 );
		if ( tokens.length > 2 && ( token = tokens[ 0 ] ).type === "ID" &&
			context.nodeType === 9 && documentIsHTML && Expr.relative[ tokens[ 1 ].type ] ) {

			context = ( Expr.find[ "ID" ]( token.matches[ 0 ]
				.replace( runescape, funescape ), context ) || [] )[ 0 ];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr[ "needsContext" ].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[ i ];

			// Abort if we hit a combinator
			if ( Expr.relative[ ( type = token.type ) ] ) {
				break;
			}
			if ( ( find = Expr.find[ type ] ) ) {

				// Search, expanding context for leading sibling combinators
				if ( ( seed = find(
					token.matches[ 0 ].replace( runescape, funescape ),
					rsibling.test( tokens[ 0 ].type ) && testContext( context.parentNode ) ||
						context
				) ) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split( "" ).sort( sortOrder ).join( "" ) === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert( function( el ) {

	// Should return 1, but returns 4 (following)
	return el.compareDocumentPosition( document.createElement( "fieldset" ) ) & 1;
} );

// Support: IE<8
// Prevent attribute/property "interpolation"
// https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert( function( el ) {
	el.innerHTML = "<a href='#'></a>";
	return el.firstChild.getAttribute( "href" ) === "#";
} ) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	} );
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert( function( el ) {
	el.innerHTML = "<input/>";
	el.firstChild.setAttribute( "value", "" );
	return el.firstChild.getAttribute( "value" ) === "";
} ) ) {
	addHandle( "value", function( elem, _name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	} );
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert( function( el ) {
	return el.getAttribute( "disabled" ) == null;
} ) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
				( val = elem.getAttributeNode( name ) ) && val.specified ?
					val.value :
					null;
		}
	} );
}

return Sizzle;

} )( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;

// Deprecated
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;
jQuery.escapeSelector = Sizzle.escape;




var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;



function nodeName( elem, name ) {

	return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

}
var rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );



// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			return !!qualifier.call( elem, i, elem ) !== not;
		} );
	}

	// Single element
	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );
	}

	// Arraylike of elements (jQuery, arguments, Array)
	if ( typeof qualifier !== "string" ) {
		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	// Filtered directly for both simple and complex selectors
	return jQuery.filter( qualifier, elements, not );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	if ( elems.length === 1 && elem.nodeType === 1 ) {
		return jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [];
	}

	return jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
		return elem.nodeType === 1;
	} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i, ret,
			len = this.length,
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		ret = this.pushStack( [] );

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		return len > 1 ? jQuery.uniqueSort( ret ) : ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	// Shortcut simple #id case for speed
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Method init() accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[ 0 ] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					if ( elem ) {

						// Inject the element directly into the jQuery object
						this[ 0 ] = elem;
						this.length = 1;
					}
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( isFunction( selector ) ) {
			return root.ready !== undefined ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter( function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			targets = typeof selectors !== "string" && jQuery( selectors );

		// Positional selectors never match, since there's no _selection_ context
		if ( !rneedsContext.test( selectors ) ) {
			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( targets ?
						targets.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, _i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, _i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, _i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		if ( elem.contentDocument != null &&

			// Support: IE 11+
			// <object> elements with no `data` attribute has an object
			// `contentDocument` with a `null` prototype.
			getProto( elem.contentDocument ) ) {

			return elem.contentDocument;
		}

		// Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
		// Treat the template element as a regular one in browsers that
		// don't support it.
		if ( nodeName( elem, "template" ) ) {
			elem = elem.content || elem;
		}

		return jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.uniqueSort( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
} );
var rnothtmlwhite = ( /[^\x20\t\r\n\f]+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnothtmlwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = locked || options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && toType( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = queue = [];
				if ( !memory && !firing ) {
					list = memory = "";
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


function Identity( v ) {
	return v;
}
function Thrower( ex ) {
	throw ex;
}

function adoptValue( value, resolve, reject, noValue ) {
	var method;

	try {

		// Check for promise aspect first to privilege synchronous behavior
		if ( value && isFunction( ( method = value.promise ) ) ) {
			method.call( value ).done( resolve ).fail( reject );

		// Other thenables
		} else if ( value && isFunction( ( method = value.then ) ) ) {
			method.call( value, resolve, reject );

		// Other non-thenables
		} else {

			// Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
			// * false: [ value ].slice( 0 ) => resolve( value )
			// * true: [ value ].slice( 1 ) => resolve()
			resolve.apply( undefined, [ value ].slice( noValue ) );
		}

	// For Promises/A+, convert exceptions into rejections
	// Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
	// Deferred#then to conditionally suppress rejection.
	} catch ( value ) {

		// Support: Android 4.0 only
		// Strict mode functions invoked without .call/.apply get global-object context
		reject.apply( undefined, [ value ] );
	}
}

jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, callbacks,
				// ... .then handlers, argument index, [final state]
				[ "notify", "progress", jQuery.Callbacks( "memory" ),
					jQuery.Callbacks( "memory" ), 2 ],
				[ "resolve", "done", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 0, "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ),
					jQuery.Callbacks( "once memory" ), 1, "rejected" ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				"catch": function( fn ) {
					return promise.then( null, fn );
				},

				// Keep pipe for back-compat
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;

					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( _i, tuple ) {

							// Map tuples (progress, done, fail) to arguments (done, fail, progress)
							var fn = isFunction( fns[ tuple[ 4 ] ] ) && fns[ tuple[ 4 ] ];

							// deferred.progress(function() { bind to newDefer or newDefer.notify })
							// deferred.done(function() { bind to newDefer or newDefer.resolve })
							// deferred.fail(function() { bind to newDefer or newDefer.reject })
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},
				then: function( onFulfilled, onRejected, onProgress ) {
					var maxDepth = 0;
					function resolve( depth, deferred, handler, special ) {
						return function() {
							var that = this,
								args = arguments,
								mightThrow = function() {
									var returned, then;

									// Support: Promises/A+ section 2.3.3.3.3
									// https://promisesaplus.com/#point-59
									// Ignore double-resolution attempts
									if ( depth < maxDepth ) {
										return;
									}

									returned = handler.apply( that, args );

									// Support: Promises/A+ section 2.3.1
									// https://promisesaplus.com/#point-48
									if ( returned === deferred.promise() ) {
										throw new TypeError( "Thenable self-resolution" );
									}

									// Support: Promises/A+ sections 2.3.3.1, 3.5
									// https://promisesaplus.com/#point-54
									// https://promisesaplus.com/#point-75
									// Retrieve `then` only once
									then = returned &&

										// Support: Promises/A+ section 2.3.4
										// https://promisesaplus.com/#point-64
										// Only check objects and functions for thenability
										( typeof returned === "object" ||
											typeof returned === "function" ) &&
										returned.then;

									// Handle a returned thenable
									if ( isFunction( then ) ) {

										// Special processors (notify) just wait for resolution
										if ( special ) {
											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special )
											);

										// Normal processors (resolve) also hook into progress
										} else {

											// ...and disregard older resolution values
											maxDepth++;

											then.call(
												returned,
												resolve( maxDepth, deferred, Identity, special ),
												resolve( maxDepth, deferred, Thrower, special ),
												resolve( maxDepth, deferred, Identity,
													deferred.notifyWith )
											);
										}

									// Handle all other returned values
									} else {

										// Only substitute handlers pass on context
										// and multiple values (non-spec behavior)
										if ( handler !== Identity ) {
											that = undefined;
											args = [ returned ];
										}

										// Process the value(s)
										// Default process is resolve
										( special || deferred.resolveWith )( that, args );
									}
								},

								// Only normal processors (resolve) catch and reject exceptions
								process = special ?
									mightThrow :
									function() {
										try {
											mightThrow();
										} catch ( e ) {

											if ( jQuery.Deferred.exceptionHook ) {
												jQuery.Deferred.exceptionHook( e,
													process.stackTrace );
											}

											// Support: Promises/A+ section 2.3.3.3.4.1
											// https://promisesaplus.com/#point-61
											// Ignore post-resolution exceptions
											if ( depth + 1 >= maxDepth ) {

												// Only substitute handlers pass on context
												// and multiple values (non-spec behavior)
												if ( handler !== Thrower ) {
													that = undefined;
													args = [ e ];
												}

												deferred.rejectWith( that, args );
											}
										}
									};

							// Support: Promises/A+ section 2.3.3.3.1
							// https://promisesaplus.com/#point-57
							// Re-resolve promises immediately to dodge false rejection from
							// subsequent errors
							if ( depth ) {
								process();
							} else {

								// Call an optional hook to record the stack, in case of exception
								// since it's otherwise lost when execution goes async
								if ( jQuery.Deferred.getStackHook ) {
									process.stackTrace = jQuery.Deferred.getStackHook();
								}
								window.setTimeout( process );
							}
						};
					}

					return jQuery.Deferred( function( newDefer ) {

						// progress_handlers.add( ... )
						tuples[ 0 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onProgress ) ?
									onProgress :
									Identity,
								newDefer.notifyWith
							)
						);

						// fulfilled_handlers.add( ... )
						tuples[ 1 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onFulfilled ) ?
									onFulfilled :
									Identity
							)
						);

						// rejected_handlers.add( ... )
						tuples[ 2 ][ 3 ].add(
							resolve(
								0,
								newDefer,
								isFunction( onRejected ) ?
									onRejected :
									Thrower
							)
						);
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 5 ];

			// promise.progress = list.add
			// promise.done = list.add
			// promise.fail = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(
					function() {

						// state = "resolved" (i.e., fulfilled)
						// state = "rejected"
						state = stateString;
					},

					// rejected_callbacks.disable
					// fulfilled_callbacks.disable
					tuples[ 3 - i ][ 2 ].disable,

					// rejected_handlers.disable
					// fulfilled_handlers.disable
					tuples[ 3 - i ][ 3 ].disable,

					// progress_callbacks.lock
					tuples[ 0 ][ 2 ].lock,

					// progress_handlers.lock
					tuples[ 0 ][ 3 ].lock
				);
			}

			// progress_handlers.fire
			// fulfilled_handlers.fire
			// rejected_handlers.fire
			list.add( tuple[ 3 ].fire );

			// deferred.notify = function() { deferred.notifyWith(...) }
			// deferred.resolve = function() { deferred.resolveWith(...) }
			// deferred.reject = function() { deferred.rejectWith(...) }
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? undefined : this, arguments );
				return this;
			};

			// deferred.notifyWith = list.fireWith
			// deferred.resolveWith = list.fireWith
			// deferred.rejectWith = list.fireWith
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( singleValue ) {
		var

			// count of uncompleted subordinates
			remaining = arguments.length,

			// count of unprocessed arguments
			i = remaining,

			// subordinate fulfillment data
			resolveContexts = Array( i ),
			resolveValues = slice.call( arguments ),

			// the primary Deferred
			primary = jQuery.Deferred(),

			// subordinate callback factory
			updateFunc = function( i ) {
				return function( value ) {
					resolveContexts[ i ] = this;
					resolveValues[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( !( --remaining ) ) {
						primary.resolveWith( resolveContexts, resolveValues );
					}
				};
			};

		// Single- and empty arguments are adopted like Promise.resolve
		if ( remaining <= 1 ) {
			adoptValue( singleValue, primary.done( updateFunc( i ) ).resolve, primary.reject,
				!remaining );

			// Use .then() to unwrap secondary thenables (cf. gh-3000)
			if ( primary.state() === "pending" ||
				isFunction( resolveValues[ i ] && resolveValues[ i ].then ) ) {

				return primary.then();
			}
		}

		// Multiple arguments are aggregated like Promise.all array elements
		while ( i-- ) {
			adoptValue( resolveValues[ i ], updateFunc( i ), primary.reject );
		}

		return primary.promise();
	}
} );


// These usually indicate a programmer mistake during development,
// warn about them ASAP rather than swallowing them by default.
var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

jQuery.Deferred.exceptionHook = function( error, stack ) {

	// Support: IE 8 - 9 only
	// Console exists when dev tools are open, which can happen at any time
	if ( window.console && window.console.warn && error && rerrorNames.test( error.name ) ) {
		window.console.warn( "jQuery.Deferred exception: " + error.message, error.stack, stack );
	}
};




jQuery.readyException = function( error ) {
	window.setTimeout( function() {
		throw error;
	} );
};




// The deferred used on DOM ready
var readyList = jQuery.Deferred();

jQuery.fn.ready = function( fn ) {

	readyList
		.then( fn )

		// Wrap jQuery.readyException in a function so that the lookup
		// happens at the time of error handling instead of callback
		// registration.
		.catch( function( error ) {
			jQuery.readyException( error );
		} );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );
	}
} );

jQuery.ready.then = readyList.then;

// The ready event handler and self cleanup method
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed );
	window.removeEventListener( "load", completed );
	jQuery.ready();
}

// Catch cases where $(document).ready() is called
// after the browser event has already occurred.
// Support: IE <=9 - 10 only
// Older IE sometimes signals "interactive" too soon
if ( document.readyState === "complete" ||
	( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

	// Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout( jQuery.ready );

} else {

	// Use the handy event callback
	document.addEventListener( "DOMContentLoaded", completed );

	// A fallback to window.onload, that will always work
	window.addEventListener( "load", completed );
}




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( toType( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, _key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn(
					elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	if ( chainable ) {
		return elems;
	}

	// Gets
	if ( bulk ) {
		return fn.call( elems );
	}

	return len ? fn( elems[ 0 ], key ) : emptyGet;
};


// Matches dashed string for camelizing
var rmsPrefix = /^-ms-/,
	rdashAlpha = /-([a-z])/g;

// Used by camelCase as callback to replace()
function fcamelCase( _all, letter ) {
	return letter.toUpperCase();
}

// Convert dashed to camelCase; used by the css and data modules
// Support: IE <=9 - 11, Edge 12 - 15
// Microsoft forgot to hump their vendor prefix (#9572)
function camelCase( string ) {
	return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
}
var acceptData = function( owner ) {

	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};




function Data() {
	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;

Data.prototype = {

	cache: function( owner ) {

		// Check if the owner object already has a cache
		var value = owner[ this.expando ];

		// If not, create one
		if ( !value ) {
			value = {};

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( acceptData( owner ) ) {

				// If it is a node unlikely to be stringify-ed or looped over
				// use plain assignment
				if ( owner.nodeType ) {
					owner[ this.expando ] = value;

				// Otherwise secure it in a non-enumerable property
				// configurable must be true to allow the property to be
				// deleted when data is removed
				} else {
					Object.defineProperty( owner, this.expando, {
						value: value,
						configurable: true
					} );
				}
			}
		}

		return value;
	},
	set: function( owner, data, value ) {
		var prop,
			cache = this.cache( owner );

		// Handle: [ owner, key, value ] args
		// Always use camelCase key (gh-2257)
		if ( typeof data === "string" ) {
			cache[ camelCase( data ) ] = value;

		// Handle: [ owner, { properties } ] args
		} else {

			// Copy the properties one-by-one to the cache object
			for ( prop in data ) {
				cache[ camelCase( prop ) ] = data[ prop ];
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		return key === undefined ?
			this.cache( owner ) :

			// Always use camelCase key (gh-2257)
			owner[ this.expando ] && owner[ this.expando ][ camelCase( key ) ];
	},
	access: function( owner, key, value ) {

		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				( ( key && typeof key === "string" ) && value === undefined ) ) {

			return this.get( owner, key );
		}

		// When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i,
			cache = owner[ this.expando ];

		if ( cache === undefined ) {
			return;
		}

		if ( key !== undefined ) {

			// Support array or space separated string of keys
			if ( Array.isArray( key ) ) {

				// If key is an array of keys...
				// We always set camelCase keys, so remove that.
				key = key.map( camelCase );
			} else {
				key = camelCase( key );

				// If a key with the spaces exists, use it.
				// Otherwise, create an array by matching non-whitespace
				key = key in cache ?
					[ key ] :
					( key.match( rnothtmlwhite ) || [] );
			}

			i = key.length;

			while ( i-- ) {
				delete cache[ key[ i ] ];
			}
		}

		// Remove the expando if there's no more data
		if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

			// Support: Chrome <=35 - 45
			// Webkit & Blink performance suffers when deleting properties
			// from DOM nodes, so set to undefined instead
			// https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
			if ( owner.nodeType ) {
				owner[ this.expando ] = undefined;
			} else {
				delete owner[ this.expando ];
			}
		}
	},
	hasData: function( owner ) {
		var cache = owner[ this.expando ];
		return cache !== undefined && !jQuery.isEmptyObject( cache );
	}
};
var dataPriv = new Data();

var dataUser = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /[A-Z]/g;

function getData( data ) {
	if ( data === "true" ) {
		return true;
	}

	if ( data === "false" ) {
		return false;
	}

	if ( data === "null" ) {
		return null;
	}

	// Only convert to a number if it doesn't change the string
	if ( data === +data + "" ) {
		return +data;
	}

	if ( rbrace.test( data ) ) {
		return JSON.parse( data );
	}

	return data;
}

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = getData( data );
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			dataUser.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend( {
	hasData: function( elem ) {
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return dataUser.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = dataUser.get( elem );

				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE 11 only
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				dataUser.set( this, key );
			} );
		}

		return access( this, function( value ) {
			var data;

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {

				// Attempt to get data from the cache
				// The key will always be camelCased in Data
				data = dataUser.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each( function() {

				// We always store the camelCased key
				dataUser.set( this, key, value );
			} );
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each( function() {
			dataUser.remove( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = dataPriv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || Array.isArray( data ) ) {
					queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				dataPriv.remove( elem, [ type + "queue", key ] );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var documentElement = document.documentElement;



	var isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem );
		},
		composed = { composed: true };

	// Support: IE 9 - 11+, Edge 12 - 18+, iOS 10.0 - 10.2 only
	// Check attachment across shadow DOM boundaries when possible (gh-3504)
	// Support: iOS 10.0-10.2 only
	// Early iOS 10 versions support `attachShadow` but not `getRootNode`,
	// leading to errors. We need to check for `getRootNode`.
	if ( documentElement.getRootNode ) {
		isAttached = function( elem ) {
			return jQuery.contains( elem.ownerDocument, elem ) ||
				elem.getRootNode( composed ) === elem.ownerDocument;
		};
	}
var isHiddenWithinTree = function( elem, el ) {

		// isHiddenWithinTree might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;

		// Inline style trumps all
		return elem.style.display === "none" ||
			elem.style.display === "" &&

			// Otherwise, check computed style
			// Support: Firefox <=43 - 45
			// Disconnected elements can have computed display: none, so first confirm that elem is
			// in the document.
			isAttached( elem ) &&

			jQuery.css( elem, "display" ) === "none";
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted, scale,
		maxIterations = 20,
		currentValue = tween ?
			function() {
				return tween.cur();
			} :
			function() {
				return jQuery.css( elem, prop, "" );
			},
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = elem.nodeType &&
			( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Support: Firefox <=54
		// Halve the iteration target value to prevent interference from CSS upper bounds (gh-2144)
		initial = initial / 2;

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		while ( maxIterations-- ) {

			// Evaluate and update our best guess (doubling guesses that zero out).
			// Finish if the scale equals or crosses 1 (making the old*new product non-positive).
			jQuery.style( elem, prop, initialInUnit + unit );
			if ( ( 1 - scale ) * ( 1 - ( scale = currentValue() / initial || 0.5 ) ) <= 0 ) {
				maxIterations = 0;
			}
			initialInUnit = initialInUnit / scale;

		}

		initialInUnit = initialInUnit * 2;
		jQuery.style( elem, prop, initialInUnit + unit );

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


var defaultDisplayMap = {};

function getDefaultDisplay( elem ) {
	var temp,
		doc = elem.ownerDocument,
		nodeName = elem.nodeName,
		display = defaultDisplayMap[ nodeName ];

	if ( display ) {
		return display;
	}

	temp = doc.body.appendChild( doc.createElement( nodeName ) );
	display = jQuery.css( temp, "display" );

	temp.parentNode.removeChild( temp );

	if ( display === "none" ) {
		display = "block";
	}
	defaultDisplayMap[ nodeName ] = display;

	return display;
}

function showHide( elements, show ) {
	var display, elem,
		values = [],
		index = 0,
		length = elements.length;

	// Determine new display value for elements that need to change
	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		display = elem.style.display;
		if ( show ) {

			// Since we force visibility upon cascade-hidden elements, an immediate (and slow)
			// check is required in this first loop unless we have a nonempty display value (either
			// inline or about-to-be-restored)
			if ( display === "none" ) {
				values[ index ] = dataPriv.get( elem, "display" ) || null;
				if ( !values[ index ] ) {
					elem.style.display = "";
				}
			}
			if ( elem.style.display === "" && isHiddenWithinTree( elem ) ) {
				values[ index ] = getDefaultDisplay( elem );
			}
		} else {
			if ( display !== "none" ) {
				values[ index ] = "none";

				// Remember what we're overwriting
				dataPriv.set( elem, "display", display );
			}
		}
	}

	// Set the display of the elements in a second loop to avoid constant reflow
	for ( index = 0; index < length; index++ ) {
		if ( values[ index ] != null ) {
			elements[ index ].style.display = values[ index ];
		}
	}

	return elements;
}

jQuery.fn.extend( {
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHiddenWithinTree( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]*)/i );

var rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );



( function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Android 4.0 - 4.3 only
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Android <=4.1 only
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE <=11 only
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// Support: IE <=9 only
	// IE <=9 replaces <option> tags with their contents when inserted outside of
	// the select element.
	div.innerHTML = "<option></option>";
	support.option = !!div.lastChild;
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {

	// XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead: [ 1, "<table>", "</table>" ],
	col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	_default: [ 0, "", "" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: IE <=9 only
if ( !support.option ) {
	wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
}


function getAll( context, tag ) {

	// Support: IE <=9 - 11 only
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret;

	if ( typeof context.getElementsByTagName !== "undefined" ) {
		ret = context.getElementsByTagName( tag || "*" );

	} else if ( typeof context.querySelectorAll !== "undefined" ) {
		ret = context.querySelectorAll( tag || "*" );

	} else {
		ret = [];
	}

	if ( tag === undefined || tag && nodeName( context, tag ) ) {
		return jQuery.merge( [ context ], ret );
	}

	return ret;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		dataPriv.set(
			elems[ i ],
			"globalEval",
			!refElements || dataPriv.get( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/;

function buildFragment( elems, context, scripts, selection, ignored ) {
	var elem, tmp, tag, wrap, attached, j,
		fragment = context.createDocumentFragment(),
		nodes = [],
		i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( toType( elem ) === "object" ) {

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;
				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Support: Android <=4.0 only, PhantomJS 1 only
				// push.apply(_, arraylike) throws on ancient WebKit
				jQuery.merge( nodes, tmp.childNodes );

				// Remember the top-level container
				tmp = fragment.firstChild;

				// Ensure the created nodes are orphaned (#12392)
				tmp.textContent = "";
			}
		}
	}

	// Remove wrapper from fragment
	fragment.textContent = "";

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}
			continue;
		}

		attached = isAttached( elem );

		// Append to fragment
		tmp = getAll( fragment.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( attached ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	return fragment;
}


var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE <=9 - 11+
// focus() and blur() are asynchronous, except when they are no-op.
// So expect focus to be synchronous when the element is already active,
// and blur to be synchronous when the element is not already active.
// (focus and blur are always synchronous in other supported browsers,
// this just defines when we can count on it).
function expectSync( elem, type ) {
	return ( elem === safeActiveElement() ) === ( type === "focus" );
}

// Support: IE <=9 only
// Accessing document.activeElement can throw unexpectedly
// https://bugs.jquery.com/ticket/13393
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.get( elem );

		// Only attach events to objects that accept data
		if ( !acceptData( elem ) ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Ensure that invalid selectors throw exceptions at attach time
		// Evaluate against documentElement in case elem is a non-element node (e.g., document)
		if ( selector ) {
			jQuery.find.matchesSelector( documentElement, selector );
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = Object.create( null );
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnothtmlwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove data and the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( nativeEvent ) {

		var i, j, ret, matched, handleObj, handlerQueue,
			args = new Array( arguments.length ),

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( nativeEvent ),

			handlers = (
				dataPriv.get( this, "events" ) || Object.create( null )
			)[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;

		for ( i = 1; i < arguments.length; i++ ) {
			args[ i ] = arguments[ i ];
		}

		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// If the event is namespaced, then each handler is only invoked if it is
				// specially universal or its namespaces are a superset of the event's.
				if ( !event.rnamespace || handleObj.namespace === false ||
					event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, handleObj, sel, matchedHandlers, matchedSelectors,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		if ( delegateCount &&

			// Support: IE <=9
			// Black-hole SVG <use> instance trees (trac-13180)
			cur.nodeType &&

			// Support: Firefox <=42
			// Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
			// https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
			// Support: IE 11 only
			// ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
			!( event.type === "click" && event.button >= 1 ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && !( event.type === "click" && cur.disabled === true ) ) {
					matchedHandlers = [];
					matchedSelectors = {};
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matchedSelectors[ sel ] === undefined ) {
							matchedSelectors[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matchedSelectors[ sel ] ) {
							matchedHandlers.push( handleObj );
						}
					}
					if ( matchedHandlers.length ) {
						handlerQueue.push( { elem: cur, handlers: matchedHandlers } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		cur = this;
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: cur, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	addProp: function( name, hook ) {
		Object.defineProperty( jQuery.Event.prototype, name, {
			enumerable: true,
			configurable: true,

			get: isFunction( hook ) ?
				function() {
					if ( this.originalEvent ) {
						return hook( this.originalEvent );
					}
				} :
				function() {
					if ( this.originalEvent ) {
						return this.originalEvent[ name ];
					}
				},

			set: function( value ) {
				Object.defineProperty( this, name, {
					enumerable: true,
					configurable: true,
					writable: true,
					value: value
				} );
			}
		} );
	},

	fix: function( originalEvent ) {
		return originalEvent[ jQuery.expando ] ?
			originalEvent :
			new jQuery.Event( originalEvent );
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {

			// Utilize native event to ensure correct state for checkable inputs
			setup: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Claim the first handler
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					// dataPriv.set( el, "click", ... )
					leverageNative( el, "click", returnTrue );
				}

				// Return false to allow normal processing in the caller
				return false;
			},
			trigger: function( data ) {

				// For mutual compressibility with _default, replace `this` access with a local var.
				// `|| data` is dead code meant only to preserve the variable through minification.
				var el = this || data;

				// Force setup before triggering a click
				if ( rcheckableType.test( el.type ) &&
					el.click && nodeName( el, "input" ) ) {

					leverageNative( el, "click" );
				}

				// Return non-false to allow normal event-path propagation
				return true;
			},

			// For cross-browser consistency, suppress native .click() on links
			// Also prevent it if we're currently inside a leveraged native-event stack
			_default: function( event ) {
				var target = event.target;
				return rcheckableType.test( target.type ) &&
					target.click && nodeName( target, "input" ) &&
					dataPriv.get( target, "click" ) ||
					nodeName( target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	}
};

// Ensure the presence of an event listener that handles manually-triggered
// synthetic events by interrupting progress until reinvoked in response to
// *native* events that it fires directly, ensuring that state changes have
// already occurred before other listeners are invoked.
function leverageNative( el, type, expectSync ) {

	// Missing expectSync indicates a trigger call, which must force setup through jQuery.event.add
	if ( !expectSync ) {
		if ( dataPriv.get( el, type ) === undefined ) {
			jQuery.event.add( el, type, returnTrue );
		}
		return;
	}

	// Register the controller as a special universal handler for all event namespaces
	dataPriv.set( el, type, false );
	jQuery.event.add( el, type, {
		namespace: false,
		handler: function( event ) {
			var notAsync, result,
				saved = dataPriv.get( this, type );

			if ( ( event.isTrigger & 1 ) && this[ type ] ) {

				// Interrupt processing of the outer synthetic .trigger()ed event
				// Saved data should be false in such cases, but might be a leftover capture object
				// from an async native handler (gh-4350)
				if ( !saved.length ) {

					// Store arguments for use when handling the inner native event
					// There will always be at least one argument (an event object), so this array
					// will not be confused with a leftover capture object.
					saved = slice.call( arguments );
					dataPriv.set( this, type, saved );

					// Trigger the native event and capture its result
					// Support: IE <=9 - 11+
					// focus() and blur() are asynchronous
					notAsync = expectSync( this, type );
					this[ type ]();
					result = dataPriv.get( this, type );
					if ( saved !== result || notAsync ) {
						dataPriv.set( this, type, false );
					} else {
						result = {};
					}
					if ( saved !== result ) {

						// Cancel the outer synthetic event
						event.stopImmediatePropagation();
						event.preventDefault();

						// Support: Chrome 86+
						// In Chrome, if an element having a focusout handler is blurred by
						// clicking outside of it, it invokes the handler synchronously. If
						// that handler calls `.remove()` on the element, the data is cleared,
						// leaving `result` undefined. We need to guard against this.
						return result && result.value;
					}

				// If this is an inner synthetic event for an event with a bubbling surrogate
				// (focus or blur), assume that the surrogate already propagated from triggering the
				// native event and prevent that from happening again here.
				// This technically gets the ordering wrong w.r.t. to `.trigger()` (in which the
				// bubbling surrogate propagates *after* the non-bubbling base), but that seems
				// less bad than duplication.
				} else if ( ( jQuery.event.special[ type ] || {} ).delegateType ) {
					event.stopPropagation();
				}

			// If this is a native event triggered above, everything is now in order
			// Fire an inner synthetic event with the original arguments
			} else if ( saved.length ) {

				// ...and capture the result
				dataPriv.set( this, type, {
					value: jQuery.event.trigger(

						// Support: IE <=9 - 11+
						// Extend with the prototype to reset the above stopImmediatePropagation()
						jQuery.extend( saved[ 0 ], jQuery.Event.prototype ),
						saved.slice( 1 ),
						this
					)
				} );

				// Abort handling of the native event
				event.stopImmediatePropagation();
			}
		}
	} );
}

jQuery.removeEvent = function( elem, type, handle ) {

	// This "if" is needed for plain objects
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle );
	}
};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: Android <=2.3 only
				src.returnValue === false ?
			returnTrue :
			returnFalse;

		// Create target properties
		// Support: Safari <=6 - 7 only
		// Target should not be a text node (#504, #13143)
		this.target = ( src.target && src.target.nodeType === 3 ) ?
			src.target.parentNode :
			src.target;

		this.currentTarget = src.currentTarget;
		this.relatedTarget = src.relatedTarget;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || Date.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,
	isSimulated: false,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && !this.isSimulated ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && !this.isSimulated ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Includes all common event props including KeyEvent and MouseEvent specific props
jQuery.each( {
	altKey: true,
	bubbles: true,
	cancelable: true,
	changedTouches: true,
	ctrlKey: true,
	detail: true,
	eventPhase: true,
	metaKey: true,
	pageX: true,
	pageY: true,
	shiftKey: true,
	view: true,
	"char": true,
	code: true,
	charCode: true,
	key: true,
	keyCode: true,
	button: true,
	buttons: true,
	clientX: true,
	clientY: true,
	offsetX: true,
	offsetY: true,
	pointerId: true,
	pointerType: true,
	screenX: true,
	screenY: true,
	targetTouches: true,
	toElement: true,
	touches: true,
	which: true
}, jQuery.event.addProp );

jQuery.each( { focus: "focusin", blur: "focusout" }, function( type, delegateType ) {
	jQuery.event.special[ type ] = {

		// Utilize native event if possible so blur/focus sequence is correct
		setup: function() {

			// Claim the first handler
			// dataPriv.set( this, "focus", ... )
			// dataPriv.set( this, "blur", ... )
			leverageNative( this, type, expectSync );

			// Return false to allow normal processing in the caller
			return false;
		},
		trigger: function() {

			// Force setup before trigger
			leverageNative( this, type );

			// Return non-false to allow normal event-path propagation
			return true;
		},

		// Suppress native focus or blur as it's already being fired
		// in leverageNative.
		_default: function() {
			return true;
		},

		delegateType: delegateType
	};
} );

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://bugs.chromium.org/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	}
} );


var

	// Support: IE <=10 - 11, Edge 12 - 13 only
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

// Prefer a tbody over its parent table for containing new rows
function manipulationTarget( elem, content ) {
	if ( nodeName( elem, "table" ) &&
		nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ) {

		return jQuery( elem ).children( "tbody" )[ 0 ] || elem;
	}

	return elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	if ( ( elem.type || "" ).slice( 0, 5 ) === "true/" ) {
		elem.type = elem.type.slice( 5 );
	} else {
		elem.removeAttribute( "type" );
	}

	return elem;
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.get( src );
		events = pdataOld.events;

		if ( events ) {
			dataPriv.remove( dest, "handle events" );

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = flat( args );

	var fragment, first, scripts, hasScripts, node, doc,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		valueIsFunction = isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( valueIsFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( valueIsFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android <=4.0 only, PhantomJS 1 only
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!dataPriv.access( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src && ( node.type || "" ).toLowerCase()  !== "module" ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl && !node.noModule ) {
								jQuery._evalUrl( node.src, {
									nonce: node.nonce || node.getAttribute( "nonce" )
								}, doc );
							}
						} else {
							DOMEval( node.textContent.replace( rcleanScript, "" ), node, doc );
						}
					}
				}
			}
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && isAttached( node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = isAttached( elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems ) {
		var data, elem, type,
			special = jQuery.event.special,
			i = 0;

		for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
			if ( acceptData( elem ) ) {
				if ( ( data = elem[ dataPriv.expando ] ) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataPriv.expando ] = undefined;
				}
				if ( elem[ dataUser.expando ] ) {

					// Support: Chrome <=35 - 45+
					// Assign undefined instead of using delete, see Data#remove
					elem[ dataUser.expando ] = undefined;
				}
			}
		}
	}
} );

jQuery.fn.extend( {
	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: Android <=4.0 only, PhantomJS 1 only
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );
var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {

		// Support: IE <=11 only, Firefox <=30 (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

var swap = function( elem, options, callback ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.call( elem );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var rboxStyle = new RegExp( cssExpand.join( "|" ), "i" );



( function() {

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests() {

		// This is a singleton, we need to execute it only once
		if ( !div ) {
			return;
		}

		container.style.cssText = "position:absolute;left:-11111px;width:60px;" +
			"margin-top:1px;padding:0;border:0";
		div.style.cssText =
			"position:relative;display:block;box-sizing:border-box;overflow:scroll;" +
			"margin:auto;border:1px;padding:1px;" +
			"width:60%;top:1%";
		documentElement.appendChild( container ).appendChild( div );

		var divStyle = window.getComputedStyle( div );
		pixelPositionVal = divStyle.top !== "1%";

		// Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
		reliableMarginLeftVal = roundPixelMeasures( divStyle.marginLeft ) === 12;

		// Support: Android 4.0 - 4.3 only, Safari <=9.1 - 10.1, iOS <=7.0 - 9.3
		// Some styles come back with percentage values, even though they shouldn't
		div.style.right = "60%";
		pixelBoxStylesVal = roundPixelMeasures( divStyle.right ) === 36;

		// Support: IE 9 - 11 only
		// Detect misreporting of content dimensions for box-sizing:border-box elements
		boxSizingReliableVal = roundPixelMeasures( divStyle.width ) === 36;

		// Support: IE 9 only
		// Detect overflow:scroll screwiness (gh-3699)
		// Support: Chrome <=64
		// Don't get tricked when zoom affects offsetWidth (gh-4029)
		div.style.position = "absolute";
		scrollboxSizeVal = roundPixelMeasures( div.offsetWidth / 3 ) === 12;

		documentElement.removeChild( container );

		// Nullify the div so it wouldn't be stored in the memory and
		// it will also be a sign that checks already performed
		div = null;
	}

	function roundPixelMeasures( measure ) {
		return Math.round( parseFloat( measure ) );
	}

	var pixelPositionVal, boxSizingReliableVal, scrollboxSizeVal, pixelBoxStylesVal,
		reliableTrDimensionsVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	// Support: IE <=9 - 11 only
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	jQuery.extend( support, {
		boxSizingReliable: function() {
			computeStyleTests();
			return boxSizingReliableVal;
		},
		pixelBoxStyles: function() {
			computeStyleTests();
			return pixelBoxStylesVal;
		},
		pixelPosition: function() {
			computeStyleTests();
			return pixelPositionVal;
		},
		reliableMarginLeft: function() {
			computeStyleTests();
			return reliableMarginLeftVal;
		},
		scrollboxSize: function() {
			computeStyleTests();
			return scrollboxSizeVal;
		},

		// Support: IE 9 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Behavior in IE 9 is more subtle than in newer versions & it passes
		// some versions of this test; make sure not to make it pass there!
		//
		// Support: Firefox 70+
		// Only Firefox includes border widths
		// in computed dimensions. (gh-4529)
		reliableTrDimensions: function() {
			var table, tr, trChild, trStyle;
			if ( reliableTrDimensionsVal == null ) {
				table = document.createElement( "table" );
				tr = document.createElement( "tr" );
				trChild = document.createElement( "div" );

				table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
				tr.style.cssText = "border:1px solid";

				// Support: Chrome 86+
				// Height set through cssText does not get applied.
				// Computed height then comes back as 0.
				tr.style.height = "1px";
				trChild.style.height = "9px";

				// Support: Android 8 Chrome 86+
				// In our bodyBackground.html iframe,
				// display for all div elements is set to "inline",
				// which causes a problem only in Android 8 Chrome 86.
				// Ensuring the div is display: block
				// gets around this issue.
				trChild.style.display = "block";

				documentElement
					.appendChild( table )
					.appendChild( tr )
					.appendChild( trChild );

				trStyle = window.getComputedStyle( tr );
				reliableTrDimensionsVal = ( parseInt( trStyle.height, 10 ) +
					parseInt( trStyle.borderTopWidth, 10 ) +
					parseInt( trStyle.borderBottomWidth, 10 ) ) === tr.offsetHeight;

				documentElement.removeChild( table );
			}
			return reliableTrDimensionsVal;
		}
	} );
} )();


function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,

		// Support: Firefox 51+
		// Retrieving style before computed somehow
		// fixes an issue with getting wrong values
		// on detached elements
		style = elem.style;

	computed = computed || getStyles( elem );

	// getPropertyValue is needed for:
	//   .css('filter') (IE 9 only, #12537)
	//   .css('--customProperty) (#3144)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];

		if ( ret === "" && !isAttached( elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// A tribute to the "awesome hack by Dean Edwards"
		// Android Browser returns percentage for some values,
		// but width seems to be reliably pixels.
		// This is against the CSSOM draft spec:
		// https://drafts.csswg.org/cssom/#resolved-values
		if ( !support.pixelBoxStyles() && rnumnonpx.test( ret ) && rboxStyle.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?

		// Support: IE <=9 - 11 only
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var cssPrefixes = [ "Webkit", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style,
	vendorProps = {};

// Return a vendor-prefixed property or undefined
function vendorPropName( name ) {

	// Check for vendor prefixed names
	var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

// Return a potentially-mapped jQuery.cssProps or vendor prefixed property
function finalPropName( name ) {
	var final = jQuery.cssProps[ name ] || vendorProps[ name ];

	if ( final ) {
		return final;
	}
	if ( name in emptyStyle ) {
		return name;
	}
	return vendorProps[ name ] = vendorPropName( name ) || name;
}


var

	// Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rcustomProp = /^--/,
	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	};

function setPositiveNumber( _elem, value, subtract ) {

	// Any relative (+/-) values have already been
	// normalized at this point
	var matches = rcssNum.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
		value;
}

function boxModelAdjustment( elem, dimension, box, isBorderBox, styles, computedVal ) {
	var i = dimension === "width" ? 1 : 0,
		extra = 0,
		delta = 0;

	// Adjustment may not be necessary
	if ( box === ( isBorderBox ? "border" : "content" ) ) {
		return 0;
	}

	for ( ; i < 4; i += 2 ) {

		// Both box models exclude margin
		if ( box === "margin" ) {
			delta += jQuery.css( elem, box + cssExpand[ i ], true, styles );
		}

		// If we get here with a content-box, we're seeking "padding" or "border" or "margin"
		if ( !isBorderBox ) {

			// Add padding
			delta += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// For "border" or "margin", add border
			if ( box !== "padding" ) {
				delta += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );

			// But still keep track of it otherwise
			} else {
				extra += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}

		// If we get here with a border-box (content + padding + border), we're seeking "content" or
		// "padding" or "margin"
		} else {

			// For "content", subtract padding
			if ( box === "content" ) {
				delta -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// For "content" or "padding", subtract border
			if ( box !== "margin" ) {
				delta -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	// Account for positive content-box scroll gutter when requested by providing computedVal
	if ( !isBorderBox && computedVal >= 0 ) {

		// offsetWidth/offsetHeight is a rounded sum of content, padding, scroll gutter, and border
		// Assuming integer scroll gutter, subtract the rest and round down
		delta += Math.max( 0, Math.ceil(
			elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
			computedVal -
			delta -
			extra -
			0.5

		// If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
		// Use an explicit zero to avoid NaN (gh-3964)
		) ) || 0;
	}

	return delta;
}

function getWidthOrHeight( elem, dimension, extra ) {

	// Start with computed style
	var styles = getStyles( elem ),

		// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-4322).
		// Fake content-box until we know it's needed to know the true value.
		boxSizingNeeded = !support.boxSizingReliable() || extra,
		isBorderBox = boxSizingNeeded &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
		valueIsBorderBox = isBorderBox,

		val = curCSS( elem, dimension, styles ),
		offsetProp = "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 );

	// Support: Firefox <=54
	// Return a confounding non-pixel value or feign ignorance, as appropriate.
	if ( rnumnonpx.test( val ) ) {
		if ( !extra ) {
			return val;
		}
		val = "auto";
	}


	// Support: IE 9 - 11 only
	// Use offsetWidth/offsetHeight for when box sizing is unreliable.
	// In those cases, the computed value can be trusted to be border-box.
	if ( ( !support.boxSizingReliable() && isBorderBox ||

		// Support: IE 10 - 11+, Edge 15 - 18+
		// IE/Edge misreport `getComputedStyle` of table rows with width/height
		// set in CSS while `offset*` properties report correct values.
		// Interestingly, in some cases IE 9 doesn't suffer from this issue.
		!support.reliableTrDimensions() && nodeName( elem, "tr" ) ||

		// Fall back to offsetWidth/offsetHeight when value is "auto"
		// This happens for inline elements with no explicit setting (gh-3571)
		val === "auto" ||

		// Support: Android <=4.1 - 4.3 only
		// Also use offsetWidth/offsetHeight for misreported inline dimensions (gh-3602)
		!parseFloat( val ) && jQuery.css( elem, "display", false, styles ) === "inline" ) &&

		// Make sure the element is visible & connected
		elem.getClientRects().length ) {

		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Where available, offsetWidth/offsetHeight approximate border box dimensions.
		// Where not available (e.g., SVG), assume unreliable box-sizing and interpret the
		// retrieved value as a content box dimension.
		valueIsBorderBox = offsetProp in elem;
		if ( valueIsBorderBox ) {
			val = elem[ offsetProp ];
		}
	}

	// Normalize "" and auto
	val = parseFloat( val ) || 0;

	// Adjust for the element's box model
	return ( val +
		boxModelAdjustment(
			elem,
			dimension,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles,

			// Provide the current computed size to request scroll gutter calculation (gh-3589)
			val
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"gridArea": true,
		"gridColumn": true,
		"gridColumnEnd": true,
		"gridColumnStart": true,
		"gridRow": true,
		"gridRowEnd": true,
		"gridRowStart": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name ),
			style = elem.style;

		// Make sure that we're working with the right name. We don't
		// want to query the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			// The isCustomProp check can be removed in jQuery 4.0 when we only auto-append
			// "px" to a few hardcoded values.
			if ( type === "number" && !isCustomProp ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				if ( isCustomProp ) {
					style.setProperty( name, value );
				} else {
					style[ name ] = value;
				}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = camelCase( name ),
			isCustomProp = rcustomProp.test( name );

		// Make sure that we're working with the right name. We don't
		// want to modify the value if it is a CSS custom property
		// since they are user-defined.
		if ( !isCustomProp ) {
			name = finalPropName( origName );
		}

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}

		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( _i, dimension ) {
	jQuery.cssHooks[ dimension ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&

					// Support: Safari 8+
					// Table columns in Safari have non-zero offsetWidth & zero
					// getBoundingClientRect().width unless display is changed.
					// Support: IE <=11 only
					// Running getBoundingClientRect on a disconnected node
					// in IE throws an error.
					( !elem.getClientRects().length || !elem.getBoundingClientRect().width ) ?
					swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, dimension, extra );
					} ) :
					getWidthOrHeight( elem, dimension, extra );
			}
		},

		set: function( elem, value, extra ) {
			var matches,
				styles = getStyles( elem ),

				// Only read styles.position if the test has a chance to fail
				// to avoid forcing a reflow.
				scrollboxSizeBuggy = !support.scrollboxSize() &&
					styles.position === "absolute",

				// To avoid forcing a reflow, only fetch boxSizing if we need it (gh-3991)
				boxSizingNeeded = scrollboxSizeBuggy || extra,
				isBorderBox = boxSizingNeeded &&
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
				subtract = extra ?
					boxModelAdjustment(
						elem,
						dimension,
						extra,
						isBorderBox,
						styles
					) :
					0;

			// Account for unreliable border-box dimensions by comparing offset* to computed and
			// faking a content-box to get border and padding (gh-3699)
			if ( isBorderBox && scrollboxSizeBuggy ) {
				subtract -= Math.ceil(
					elem[ "offset" + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ) ] -
					parseFloat( styles[ dimension ] ) -
					boxModelAdjustment( elem, dimension, "border", false, styles ) -
					0.5
				);
			}

			// Convert to pixels if value adjustment is needed
			if ( subtract && ( matches = rcssNum.exec( value ) ) &&
				( matches[ 3 ] || "px" ) !== "px" ) {

				elem.style[ dimension ] = value;
				value = jQuery.css( elem, dimension );
			}

			return setPositiveNumber( elem, value, subtract );
		}
	};
} );

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
				elem.getBoundingClientRect().left -
					swap( elem, { marginLeft: 0 }, function() {
						return elem.getBoundingClientRect().left;
					} )
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( prefix !== "margin" ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( Array.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 && (
				jQuery.cssHooks[ tween.prop ] ||
					tween.elem.style[ finalPropName( tween.prop ) ] != null ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9 only
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, inProgress,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

function schedule() {
	if ( inProgress ) {
		if ( document.hidden === false && window.requestAnimationFrame ) {
			window.requestAnimationFrame( schedule );
		} else {
			window.setTimeout( schedule, jQuery.fx.interval );
		}

		jQuery.fx.tick();
	}
}

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = Date.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
		isBox = "width" in props || "height" in props,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHiddenWithinTree( elem ),
		dataShow = dataPriv.get( elem, "fxshow" );

	// Queue-skipping animations hijack the fx hooks
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// Ensure the complete handler is called before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// Detect show/hide animations
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.test( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// Pretend to be hidden if this is a "show" and
				// there is still data from a stopped show/hide
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;

				// Ignore all other no-op show/hide data
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	// Bail out if this is a no-op like .hide().hide()
	propTween = !jQuery.isEmptyObject( props );
	if ( !propTween && jQuery.isEmptyObject( orig ) ) {
		return;
	}

	// Restrict "overflow" and "display" styles during box animations
	if ( isBox && elem.nodeType === 1 ) {

		// Support: IE <=9 - 11, Edge 12 - 15
		// Record all 3 overflow attributes because IE does not infer the shorthand
		// from identically-valued overflowX and overflowY and Edge just mirrors
		// the overflowX value there.
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Identify a display type, preferring old show/hide data over the CSS cascade
		restoreDisplay = dataShow && dataShow.display;
		if ( restoreDisplay == null ) {
			restoreDisplay = dataPriv.get( elem, "display" );
		}
		display = jQuery.css( elem, "display" );
		if ( display === "none" ) {
			if ( restoreDisplay ) {
				display = restoreDisplay;
			} else {

				// Get nonempty value(s) by temporarily forcing visibility
				showHide( [ elem ], true );
				restoreDisplay = elem.style.display || restoreDisplay;
				display = jQuery.css( elem, "display" );
				showHide( [ elem ] );
			}
		}

		// Animate inline elements as inline-block
		if ( display === "inline" || display === "inline-block" && restoreDisplay != null ) {
			if ( jQuery.css( elem, "float" ) === "none" ) {

				// Restore the original display value at the end of pure show/hide animations
				if ( !propTween ) {
					anim.done( function() {
						style.display = restoreDisplay;
					} );
					if ( restoreDisplay == null ) {
						display = style.display;
						restoreDisplay = display === "none" ? "" : display;
					}
				}
				style.display = "inline-block";
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always( function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		} );
	}

	// Implement show/hide animations
	propTween = false;
	for ( prop in orig ) {

		// General show/hide setup for this element animation
		if ( !propTween ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", { display: restoreDisplay } );
			}

			// Store hidden/visible for toggle so `.stop().toggle()` "reverses"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}

			// Show elements before animating them
			if ( hidden ) {
				showHide( [ elem ], true );
			}

			/* eslint-disable no-loop-func */

			anim.done( function() {

				/* eslint-enable no-loop-func */

				// The final step of a "hide" animation is actually hiding the element
				if ( !hidden ) {
					showHide( [ elem ] );
				}
				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
		}

		// Per-property setup
		propTween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );
		if ( !( prop in dataShow ) ) {
			dataShow[ prop ] = propTween.start;
			if ( hidden ) {
				propTween.end = propTween.start;
				propTween.start = 0;
			}
		}
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( Array.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// Don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3 only
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			// If there's more to do, yield
			if ( percent < 1 && length ) {
				return remaining;
			}

			// If this was an empty animation, synthesize a final progress notification
			if ( !length ) {
				deferred.notifyWith( elem, [ animation, 1, 0 ] );
			}

			// Resolve the animation and report its conclusion
			deferred.resolveWith( elem, [ animation ] );
			return false;
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
					animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					result.stop.bind( result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	// Attach callbacks from options
	animation
		.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	return animation;
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnothtmlwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !isFunction( easing ) && easing
	};

	// Go to the end state if fx are off
	if ( jQuery.fx.off ) {
		opt.duration = 0;

	} else {
		if ( typeof opt.duration !== "number" ) {
			if ( opt.duration in jQuery.fx.speeds ) {
				opt.duration = jQuery.fx.speeds[ opt.duration ];

			} else {
				opt.duration = jQuery.fx.speeds._default;
			}
		}
	}

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHiddenWithinTree ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || dataPriv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};

		doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = dataPriv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = dataPriv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( _i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = Date.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Run the timer and safely remove it when done (allowing for external removal)
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	jQuery.fx.start();
};

jQuery.fx.interval = 13;
jQuery.fx.start = function() {
	if ( inProgress ) {
		return;
	}

	inProgress = true;
	schedule();
};

jQuery.fx.stop = function() {
	inProgress = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: Android <=4.3 only
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE <=11 only
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: IE <=11 only
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
} )();


var boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// Attribute hooks are determined by the lowercase version
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			hooks = jQuery.attrHooks[ name.toLowerCase() ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name,
			i = 0,

			// Attribute names can contain non-HTML whitespace characters
			// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
			attrNames = value && value.match( rnothtmlwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				elem.removeAttribute( name );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( _i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle,
			lowercaseName = name.toLowerCase();

		if ( !isXML ) {

			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ lowercaseName ];
			attrHandle[ lowercaseName ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				lowercaseName :
				null;
			attrHandle[ lowercaseName ] = handle;
		}
		return ret;
	};
} );




var rfocusable = /^(?:input|select|textarea|button)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each( function() {
			delete this[ jQuery.propFix[ name ] || name ];
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// Support: IE <=9 - 11 only
				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				if ( tabindex ) {
					return parseInt( tabindex, 10 );
				}

				if (
					rfocusable.test( elem.nodeName ) ||
					rclickable.test( elem.nodeName ) &&
					elem.href
				) {
					return 0;
				}

				return -1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Support: IE <=11 only
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
// eslint rule "no-unused-expressions" is disabled for this code
// since it considers such accessions noop
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		},
		set: function( elem ) {

			/* eslint no-unused-expressions: "off" */

			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );




	// Strip and collapse whitespace according to HTML spec
	// https://infra.spec.whatwg.org/#strip-and-collapse-ascii-whitespace
	function stripAndCollapse( value ) {
		var tokens = value.match( rnothtmlwhite ) || [];
		return tokens.join( " " );
	}


function getClass( elem ) {
	return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function classesToArray( value ) {
	if ( Array.isArray( value ) ) {
		return value;
	}
	if ( typeof value === "string" ) {
		return value.match( rnothtmlwhite ) || [];
	}
	return [];
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		classes = classesToArray( value );

		if ( classes.length ) {
			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = stripAndCollapse( cur );
					if ( curValue !== finalValue ) {
						elem.setAttribute( "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isValidValue = type === "string" || Array.isArray( value );

		if ( typeof stateVal === "boolean" && isValidValue ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( isValidValue ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = classesToArray( value );

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// Store className if set
					dataPriv.set( this, "__className__", className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				if ( this.setAttribute ) {
					this.setAttribute( "class",
						className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
					);
				}
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + stripAndCollapse( getClass( elem ) ) + " " ).indexOf( className ) > -1 ) {
				return true;
			}
		}

		return false;
	}
} );




var rreturn = /\r/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, valueIsFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				// Handle most common string cases
				if ( typeof ret === "string" ) {
					return ret.replace( rreturn, "" );
				}

				// Handle cases where value is null/undef or number
				return ret == null ? "" : ret;
			}

			return;
		}

		valueIsFunction = isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( valueIsFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( Array.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {

				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE <=10 - 11 only
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					stripAndCollapse( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option, i,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one",
					values = one ? null : [],
					max = one ? index + 1 : options.length;

				if ( index < 0 ) {
					i = max;

				} else {
					i = one ? index : 0;
				}

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// Support: IE <=9 only
					// IE8-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							!option.disabled &&
							( !option.parentNode.disabled ||
								!nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					/* eslint-disable no-cond-assign */

					if ( option.selected =
						jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
					) {
						optionSet = true;
					}

					/* eslint-enable no-cond-assign */
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( Array.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




// Return jQuery for attributes-only inclusion


support.focusin = "onfocusin" in window;


var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	stopPropagationCallback = function( e ) {
		e.stopPropagation();
	};

jQuery.extend( jQuery.event, {

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special, lastElement,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = lastElement = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {
			lastElement = cur;
			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( dataPriv.get( cur, "events" ) || Object.create( null ) )[ event.type ] &&
				dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( ( !special._default ||
				special._default.apply( eventPath.pop(), data ) === false ) &&
				acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && isFunction( elem[ type ] ) && !isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;

					if ( event.isPropagationStopped() ) {
						lastElement.addEventListener( type, stopPropagationCallback );
					}

					elem[ type ]();

					if ( event.isPropagationStopped() ) {
						lastElement.removeEventListener( type, stopPropagationCallback );
					}

					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	// Piggyback on a donor event to simulate a different one
	// Used only for `focus(in | out)` events
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true
			}
		);

		jQuery.event.trigger( e, null, elem );
	}

} );

jQuery.fn.extend( {

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


// Support: Firefox <=44
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome <=48 - 49, Safari <=9.0 - 9.1
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://bugs.chromium.org/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {

				// Handle: regular nodes (via `this.ownerDocument`), window
				// (via `this.document`) & document (via `this`).
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this.document || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	} );
}
var location = window.location;

var nonce = { guid: Date.now() };

var rquery = ( /\?/ );



// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, parserErrorElem;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE 9 - 11 only
	// IE throws on parseFromString with invalid input.
	try {
		xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
	} catch ( e ) {}

	parserErrorElem = xml && xml.getElementsByTagName( "parsererror" )[ 0 ];
	if ( !xml || parserErrorElem ) {
		jQuery.error( "Invalid XML: " + (
			parserErrorElem ?
				jQuery.map( parserErrorElem.childNodes, function( el ) {
					return el.textContent;
				} ).join( "\n" ) :
				data
		) );
	}
	return xml;
};


var
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( Array.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && toType( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, valueOrFunction ) {

			// If value is a function, invoke it and use its return value
			var value = isFunction( valueOrFunction ) ?
				valueOrFunction() :
				valueOrFunction;

			s[ s.length ] = encodeURIComponent( key ) + "=" +
				encodeURIComponent( value == null ? "" : value );
		};

	if ( a == null ) {
		return "";
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( Array.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} ).filter( function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} ).map( function( _i, elem ) {
			var val = jQuery( this ).val();

			if ( val == null ) {
				return null;
			}

			if ( Array.isArray( val ) ) {
				return jQuery.map( val, function( val ) {
					return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
				} );
			}

			return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


var
	r20 = /%20/g,
	rhash = /#.*$/,
	rantiCache = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Anchor tag for parsing the document origin
	originAnchor = document.createElement( "a" );

originAnchor.href = location.href;

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnothtmlwhite ) || [];

		if ( isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType[ 0 ] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s.throws ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: location.href,
		type: "GET",
		isLocal: rlocalProtocol.test( location.protocol ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",

		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": JSON.parse,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,

			// URL without anti-cache param
			cacheURL,

			// Response headers
			responseHeadersString,
			responseHeaders,

			// timeout handle
			timeoutTimer,

			// Url cleanup var
			urlAnchor,

			// Request state (becomes false upon send and true upon completion)
			completed,

			// To know if global events are to be dispatched
			fireGlobals,

			// Loop variable
			i,

			// uncached part of the url
			uncached,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( completed ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() + " " ] =
									( responseHeaders[ match[ 1 ].toLowerCase() + " " ] || [] )
										.concat( match[ 2 ] );
							}
						}
						match = responseHeaders[ key.toLowerCase() + " " ];
					}
					return match == null ? null : match.join( ", " );
				},

				// Raw string
				getAllResponseHeaders: function() {
					return completed ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					if ( completed == null ) {
						name = requestHeadersNames[ name.toLowerCase() ] =
							requestHeadersNames[ name.toLowerCase() ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( completed == null ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( completed ) {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						} else {

							// Lazy-add the new callbacks in a way that preserves old ones
							for ( code in map ) {
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR );

		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || location.href ) + "" )
			.replace( rprotocol, location.protocol + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = ( s.dataType || "*" ).toLowerCase().match( rnothtmlwhite ) || [ "" ];

		// A cross-domain request is in order when the origin doesn't match the current origin.
		if ( s.crossDomain == null ) {
			urlAnchor = document.createElement( "a" );

			// Support: IE <=8 - 11, Edge 12 - 15
			// IE throws exception on accessing the href property if url is malformed,
			// e.g. http://example.com:80x/
			try {
				urlAnchor.href = s.url;

				// Support: IE <=8 - 11 only
				// Anchor's host property isn't correctly set when s.url is relative
				urlAnchor.href = urlAnchor.href;
				s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
					urlAnchor.protocol + "//" + urlAnchor.host;
			} catch ( e ) {

				// If there is an error parsing the URL, assume it is crossDomain,
				// it can be rejected by the transport if it is invalid
				s.crossDomain = true;
			}
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( completed ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		// Remove hash to simplify url manipulation
		cacheURL = s.url.replace( rhash, "" );

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// Remember the hash so we can put it back
			uncached = s.url.slice( cacheURL.length );

			// If data is available and should be processed, append data to url
			if ( s.data && ( s.processData || typeof s.data === "string" ) ) {
				cacheURL += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data;

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add or update anti-cache param if needed
			if ( s.cache === false ) {
				cacheURL = cacheURL.replace( rantiCache, "$1" );
				uncached = ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ( nonce.guid++ ) +
					uncached;
			}

			// Put hash and anti-cache on the URL that will be requested (gh-1732)
			s.url = cacheURL + uncached;

		// Change '%20' to '+' if this is encoded form body content (gh-2658)
		} else if ( s.data && s.processData &&
			( s.contentType || "" ).indexOf( "application/x-www-form-urlencoded" ) === 0 ) {
			s.data = s.data.replace( r20, "+" );
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || completed ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		completeDeferred.add( s.complete );
		jqXHR.done( s.success );
		jqXHR.fail( s.error );

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( completed ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				completed = false;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Rethrow post-completion exceptions
				if ( completed ) {
					throw e;
				}

				// Propagate others as results
				done( -1, e );
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Ignore repeat invocations
			if ( completed ) {
				return;
			}

			completed = true;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Use a noop converter for missing script but not if jsonp
			if ( !isSuccess &&
				jQuery.inArray( "script", s.dataTypes ) > -1 &&
				jQuery.inArray( "json", s.dataTypes ) < 0 ) {
				s.converters[ "text script" ] = function() {};
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( _i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// Shift arguments if data argument was omitted
		if ( isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );

jQuery.ajaxPrefilter( function( s ) {
	var i;
	for ( i in s.headers ) {
		if ( i.toLowerCase() === "content-type" ) {
			s.contentType = s.headers[ i ] || "";
		}
	}
} );


jQuery._evalUrl = function( url, options, doc ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,

		// Only evaluate the response if it is successful (gh-4126)
		// dataFilter is not invoked for failure responses, so using it instead
		// of the default converter is kludgy but it works.
		converters: {
			"text script": function() {}
		},
		dataFilter: function( response ) {
			jQuery.globalEval( response, options, doc );
		}
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		var wrap;

		if ( this[ 0 ] ) {
			if ( isFunction( html ) ) {
				html = html.call( this[ 0 ] );
			}

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var htmlIsFunction = isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( htmlIsFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function( selector ) {
		this.parent( selector ).not( "body" ).each( function() {
			jQuery( this ).replaceWith( this.childNodes );
		} );
		return this;
	}
} );


jQuery.expr.pseudos.hidden = function( elem ) {
	return !jQuery.expr.pseudos.visible( elem );
};
jQuery.expr.pseudos.visible = function( elem ) {
	return !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length );
};




jQuery.ajaxSettings.xhr = function() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
};

var xhrSuccessStatus = {

		// File protocol always yields status code 0, assume 200
		0: 200,

		// Support: IE <=9 only
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport( function( options ) {
	var callback, errorCallback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr();

				xhr.open(
					options.type,
					options.url,
					options.async,
					options.username,
					options.password
				);

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
					headers[ "X-Requested-With" ] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							callback = errorCallback = xhr.onload =
								xhr.onerror = xhr.onabort = xhr.ontimeout =
									xhr.onreadystatechange = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {

								// Support: IE <=9 only
								// On a manual native abort, IE9 throws
								// errors on any property access that is not readyState
								if ( typeof xhr.status !== "number" ) {
									complete( 0, "error" );
								} else {
									complete(

										// File: protocol always yields status 0; see #8605, #14207
										xhr.status,
										xhr.statusText
									);
								}
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,

									// Support: IE <=9 only
									// IE9 has no XHR2 but throws on binary (trac-11426)
									// For XHR2 non-text, let the caller handle it (gh-2498)
									( xhr.responseType || "text" ) !== "text"  ||
									typeof xhr.responseText !== "string" ?
										{ binary: xhr.response } :
										{ text: xhr.responseText },
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				errorCallback = xhr.onerror = xhr.ontimeout = callback( "error" );

				// Support: IE 9 only
				// Use onreadystatechange to replace onabort
				// to handle uncaught aborts
				if ( xhr.onabort !== undefined ) {
					xhr.onabort = errorCallback;
				} else {
					xhr.onreadystatechange = function() {

						// Check readyState before timeout as it changes
						if ( xhr.readyState === 4 ) {

							// Allow onerror to be called first,
							// but that will not handle a native abort
							// Also, save errorCallback to a variable
							// as xhr.onerror cannot be accessed
							window.setTimeout( function() {
								if ( callback ) {
									errorCallback();
								}
							} );
						}
					};
				}

				// Create the abort callback
				callback = callback( "abort" );

				try {

					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {

					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter( function( s ) {
	if ( s.crossDomain ) {
		s.contents.script = false;
	}
} );

// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain or forced-by-attrs requests
	if ( s.crossDomain || s.scriptAttrs ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery( "<script>" )
					.attr( s.scriptAttrs || {} )
					.prop( { charset: s.scriptCharset, src: s.url } )
					.on( "load error", callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					} );

				// Use native DOM manipulation to avoid our domManip AJAX trickery
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce.guid++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// Force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// Make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// Save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// Support: Safari 8 only
// In Safari 8 documents created via document.implementation.createHTMLDocument
// collapse sibling forms: the second one becomes a child of the first one.
// Because of that, this security measure has to be disabled in Safari 8.
// https://bugs.webkit.org/show_bug.cgi?id=137337
support.createHTMLDocument = ( function() {
	var body = document.implementation.createHTMLDocument( "" ).body;
	body.innerHTML = "<form></form><form></form>";
	return body.childNodes.length === 2;
} )();


// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( typeof data !== "string" ) {
		return [];
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}

	var base, parsed, scripts;

	if ( !context ) {

		// Stop scripts or inline event handlers from being executed immediately
		// by using document.implementation
		if ( support.createHTMLDocument ) {
			context = document.implementation.createHTMLDocument( "" );

			// Set the base href for the created document
			// so any parsed elements with URLs
			// are based on the document's URL (gh-2965)
			base = context.createElement( "base" );
			base.href = document.location.href;
			context.head.appendChild( base );
		} else {
			context = document;
		}
	}

	parsed = rsingleTag.exec( data );
	scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = stripAndCollapse( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




jQuery.expr.pseudos.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};




jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {

	// offset() relates an element's border box to the document origin
	offset: function( options ) {

		// Preserve chaining for setter
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var rect, win,
			elem = this[ 0 ];

		if ( !elem ) {
			return;
		}

		// Return zeros for disconnected and hidden (display: none) elements (gh-2310)
		// Support: IE <=11 only
		// Running getBoundingClientRect on a
		// disconnected node in IE throws an error
		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// position() relates an element's margin box to its offset parent's padding box
	// This corresponds to the behavior of CSS absolute positioning
	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset, doc,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// position:fixed elements are offset from the viewport, which itself always has zero offset
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// Assume position:fixed implies availability of getBoundingClientRect
			offset = elem.getBoundingClientRect();

		} else {
			offset = this.offset();

			// Account for the *real* offset parent, which can be the document or its root element
			// when a statically positioned element is identified
			doc = elem.ownerDocument;
			offsetParent = elem.offsetParent || doc.documentElement;
			while ( offsetParent &&
				( offsetParent === doc.body || offsetParent === doc.documentElement ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) {

				offsetParent = offsetParent.parentNode;
			}
			if ( offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 ) {

				// Incorporate borders into its offset, since they are outside its content origin
				parentOffset = jQuery( offsetParent ).offset();
				parentOffset.top += jQuery.css( offsetParent, "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent, "borderLeftWidth", true );
			}
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {

			// Coalesce documents and windows
			var win;
			if ( isWindow( elem ) ) {
				win = elem;
			} else if ( elem.nodeType === 9 ) {
				win = elem.defaultView;
			}

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : win.pageXOffset,
					top ? val : win.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length );
	};
} );

// Support: Safari <=7 - 9.1, Chrome <=37 - 49
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( _i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( {
		padding: "inner" + name,
		content: type,
		"": "outer" + name
	}, function( defaultExtra, funcName ) {

		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( isWindow( elem ) ) {

					// $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
					return funcName.indexOf( "outer" ) === 0 ?
						elem[ "inner" + name ] :
						elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable );
		};
	} );
} );


jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( _i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	},

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );

jQuery.each(
	( "blur focus focusin focusout resize scroll click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup contextmenu" ).split( " " ),
	function( _i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	}
);




// Support: Android <=4.0 only
// Make sure we trim BOM and NBSP
var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

// Bind a function to a context, optionally partially applying any
// arguments.
// jQuery.proxy is deprecated to promote standards (specifically Function#bind)
// However, it is not slated for removal any time soon
jQuery.proxy = function( fn, context ) {
	var tmp, args, proxy;

	if ( typeof context === "string" ) {
		tmp = fn[ context ];
		context = fn;
		fn = tmp;
	}

	// Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if ( !isFunction( fn ) ) {
		return undefined;
	}

	// Simulated bind
	args = slice.call( arguments, 2 );
	proxy = function() {
		return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	};

	// Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid = fn.guid = fn.guid || jQuery.guid++;

	return proxy;
};

jQuery.holdReady = function( hold ) {
	if ( hold ) {
		jQuery.readyWait++;
	} else {
		jQuery.ready( true );
	}
};
jQuery.isArray = Array.isArray;
jQuery.parseJSON = JSON.parse;
jQuery.nodeName = nodeName;
jQuery.isFunction = isFunction;
jQuery.isWindow = isWindow;
jQuery.camelCase = camelCase;
jQuery.type = toType;

jQuery.now = Date.now;

jQuery.isNumeric = function( obj ) {

	// As of jQuery 3.0, isNumeric is limited to
	// strings and numbers (primitives or objects)
	// that can be coerced to finite numbers (gh-2662)
	var type = jQuery.type( obj );
	return ( type === "number" || type === "string" ) &&

		// parseFloat NaNs numeric-cast false positives ("")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		!isNaN( obj - parseFloat( obj ) );
};

jQuery.trim = function( text ) {
	return text == null ?
		"" :
		( text + "" ).replace( rtrim, "" );
};



// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}




var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === "undefined" ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;
} );

//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
  // This accumulates the arguments passed into an array, after a given index.
  var restArgs = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0);
      var rest = Array(length);
      var index;
      for (index = 0; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArgs(function(obj, method, args) {
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArgs(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArgs(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArgs(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArgs(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArgs(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArgs(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArgs(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArgs(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArgs(function(func, wait, args) {
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArgs = restArgs;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
      length = keys.length,
      results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArgs(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

   // Return a copy of the object without the blacklisted properties.
  _.omit = restArgs(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b !== 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, prop, fallback) {
    var value = object == null ? void 0 : object[prop];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}());

;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

/* Modified for sessionStorage support and EDGE bug */
/**
 * Simple localStorage with Cookie Fallback
 * v.1.0.0
 *
 * USAGE:
 * ----------------------------------------
 * Set New / Modify:
 *   store('my_key', 'some_value');
 *
 * Retrieve:
 *   store('my_key');
 *
 * Delete / Remove:
 *   store('my_key', null);
 */

(function() {
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = store;
        }
        exports.store = store;
    } else {
        window.store = store;
    }

    function store(key, value, options) {
        options = options || {};

        var lsSupport = false;
        var storage = options.useSession ? 'sessionStorage' : 'localStorage';

        if (!options.useCookies) {
            // localstorage & sessionstorage falls with error in EDGE for local files
            try {
                lsSupport = Boolean(window[storage]);
            } catch (e) {
                lsSupport = false;
            }
        }

        // If value is detected, set new or modify store
        if (typeof value !== "undefined" && value !== null) {
            // Convert object values to JSON
            if ( typeof value === 'object' ) {
                value = JSON.stringify(value);
            }
            // Set the store
            if (lsSupport) { // Native support
                window[storage].setItem(key, value);
            } else { // Use Cookie
                createCookie(key, value, options.expires || 30);
            }
        }

        // No value supplied, return value
        if (typeof value === "undefined") {
            // Get value
            if (lsSupport) { // Native support
                data = window[storage].getItem(key);
            } else { // Use cookie
                data = readCookie(key);
            }

            // Try to parse JSON...
            try {
                data = JSON.parse(data);
            }
            catch(e) {
                data = data;
            }

            return data;

        }

        // Null specified, remove store
        if (value === null) {
            if (lsSupport) { // Native support
                window[storage].removeItem(key);
            } else { // Use cookie
                createCookie(key, '', -1);
            }
        }

        /**
         * Creates new cookie or removes cookie with negative expiration
         * @param  key       The key or identifier for the store
         * @param  value     Contents of the store
         * @param  exp       Expiration - creation defaults to 30 days
         */

        function createCookie(key, value, exp) {
            var date = new Date();
            date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
            document.cookie = key + "=" + value + expires + "; path=/";
        }

        /**
         * Returns contents of cookie
         * @param  key       The key or identifier for the store
         */

        function readCookie(key) {
            var nameEQ = key + "=";
            var ca = document.cookie.split(';');
            for (var i = 0, max = ca.length; i < max; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }

    };
}());

 

/*! highlight.js v9.12.0 | BSD3 License | git.io/hljslicense */
!function(e){var t="object"==typeof window&&window||"object"==typeof self&&self;"undefined"!=typeof exports?e(exports):t&&(t.hljs=e({}),"function"==typeof define&&define.amd&&define([],function(){return t.hljs}))}(function(e){function t(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function r(e){return e.nodeName.toLowerCase()}function a(e,t){var r=e&&e.exec(t);return r&&0===r.index}function n(e){return E.test(e)}function i(e){var t,r,a,i,s=e.className+" ";if(s+=e.parentNode?e.parentNode.className:"",r=M.exec(s))return w(r[1])?r[1]:"no-highlight";for(s=s.split(/\s+/),t=0,a=s.length;a>t;t++)if(i=s[t],n(i)||w(i))return i}function s(e){var t,r={},a=Array.prototype.slice.call(arguments,1);for(t in e)r[t]=e[t];return a.forEach(function(e){for(t in e)r[t]=e[t]}),r}function c(e){var t=[];return function a(e,n){for(var i=e.firstChild;i;i=i.nextSibling)3===i.nodeType?n+=i.nodeValue.length:1===i.nodeType&&(t.push({event:"start",offset:n,node:i}),n=a(i,n),r(i).match(/br|hr|img|input/)||t.push({event:"stop",offset:n,node:i}));return n}(e,0),t}function o(e,a,n){function i(){return e.length&&a.length?e[0].offset!==a[0].offset?e[0].offset<a[0].offset?e:a:"start"===a[0].event?e:a:e.length?e:a}function s(e){function a(e){return" "+e.nodeName+'="'+t(e.value).replace('"',"&quot;")+'"'}u+="<"+r(e)+N.map.call(e.attributes,a).join("")+">"}function c(e){u+="</"+r(e)+">"}function o(e){("start"===e.event?s:c)(e.node)}for(var l=0,u="",d=[];e.length||a.length;){var b=i();if(u+=t(n.substring(l,b[0].offset)),l=b[0].offset,b===e){d.reverse().forEach(c);do o(b.splice(0,1)[0]),b=i();while(b===e&&b.length&&b[0].offset===l);d.reverse().forEach(s)}else"start"===b[0].event?d.push(b[0].node):d.pop(),o(b.splice(0,1)[0])}return u+t(n.substr(l))}function l(e){return e.v&&!e.cached_variants&&(e.cached_variants=e.v.map(function(t){return s(e,{v:null},t)})),e.cached_variants||e.eW&&[s(e)]||[e]}function u(e){function t(e){return e&&e.source||e}function r(r,a){return new RegExp(t(r),"m"+(e.cI?"i":"")+(a?"g":""))}function a(n,i){if(!n.compiled){if(n.compiled=!0,n.k=n.k||n.bK,n.k){var s={},c=function(t,r){e.cI&&(r=r.toLowerCase()),r.split(" ").forEach(function(e){var r=e.split("|");s[r[0]]=[t,r[1]?Number(r[1]):1]})};"string"==typeof n.k?c("keyword",n.k):k(n.k).forEach(function(e){c(e,n.k[e])}),n.k=s}n.lR=r(n.l||/\w+/,!0),i&&(n.bK&&(n.b="\\b("+n.bK.split(" ").join("|")+")\\b"),n.b||(n.b=/\B|\b/),n.bR=r(n.b),n.e||n.eW||(n.e=/\B|\b/),n.e&&(n.eR=r(n.e)),n.tE=t(n.e)||"",n.eW&&i.tE&&(n.tE+=(n.e?"|":"")+i.tE)),n.i&&(n.iR=r(n.i)),null==n.r&&(n.r=1),n.c||(n.c=[]),n.c=Array.prototype.concat.apply([],n.c.map(function(e){return l("self"===e?n:e)})),n.c.forEach(function(e){a(e,n)}),n.starts&&a(n.starts,i);var o=n.c.map(function(e){return e.bK?"\\.?("+e.b+")\\.?":e.b}).concat([n.tE,n.i]).map(t).filter(Boolean);n.t=o.length?r(o.join("|"),!0):{exec:function(){return null}}}}a(e)}function d(e,r,n,i){function s(e,t){var r,n;for(r=0,n=t.c.length;n>r;r++)if(a(t.c[r].bR,e))return t.c[r]}function c(e,t){if(a(e.eR,t)){for(;e.endsParent&&e.parent;)e=e.parent;return e}return e.eW?c(e.parent,t):void 0}function o(e,t){return!n&&a(t.iR,e)}function l(e,t){var r=v.cI?t[0].toLowerCase():t[0];return e.k.hasOwnProperty(r)&&e.k[r]}function p(e,t,r,a){var n=a?"":L.classPrefix,i='<span class="'+n,s=r?"":R;return i+=e+'">',i+t+s}function m(){var e,r,a,n;if(!N.k)return t(E);for(n="",r=0,N.lR.lastIndex=0,a=N.lR.exec(E);a;)n+=t(E.substring(r,a.index)),e=l(N,a),e?(M+=e[1],n+=p(e[0],t(a[0]))):n+=t(a[0]),r=N.lR.lastIndex,a=N.lR.exec(E);return n+t(E.substr(r))}function f(){var e="string"==typeof N.sL;if(e&&!x[N.sL])return t(E);var r=e?d(N.sL,E,!0,k[N.sL]):b(E,N.sL.length?N.sL:void 0);return N.r>0&&(M+=r.r),e&&(k[N.sL]=r.top),p(r.language,r.value,!1,!0)}function g(){C+=null!=N.sL?f():m(),E=""}function _(e){C+=e.cN?p(e.cN,"",!0):"",N=Object.create(e,{parent:{value:N}})}function h(e,t){if(E+=e,null==t)return g(),0;var r=s(t,N);if(r)return r.skip?E+=t:(r.eB&&(E+=t),g(),r.rB||r.eB||(E=t)),_(r,t),r.rB?0:t.length;var a=c(N,t);if(a){var n=N;n.skip?E+=t:(n.rE||n.eE||(E+=t),g(),n.eE&&(E=t));do N.cN&&(C+=R),N.skip||(M+=N.r),N=N.parent;while(N!==a.parent);return a.starts&&_(a.starts,""),n.rE?0:t.length}if(o(t,N))throw new Error('Illegal lexeme "'+t+'" for mode "'+(N.cN||"<unnamed>")+'"');return E+=t,t.length||1}var v=w(e);if(!v)throw new Error('Unknown language: "'+e+'"');u(v);var y,N=i||v,k={},C="";for(y=N;y!==v;y=y.parent)y.cN&&(C=p(y.cN,"",!0)+C);var E="",M=0;try{for(var B,S,$=0;;){if(N.t.lastIndex=$,B=N.t.exec(r),!B)break;S=h(r.substring($,B.index),B[0]),$=B.index+S}for(h(r.substr($)),y=N;y.parent;y=y.parent)y.cN&&(C+=R);return{r:M,value:C,language:e,top:N}}catch(A){if(A.message&&-1!==A.message.indexOf("Illegal"))return{r:0,value:t(r)};throw A}}function b(e,r){r=r||L.languages||k(x);var a={r:0,value:t(e)},n=a;return r.filter(w).forEach(function(t){var r=d(t,e,!1);r.language=t,r.r>n.r&&(n=r),r.r>a.r&&(n=a,a=r)}),n.language&&(a.second_best=n),a}function p(e){return L.tabReplace||L.useBR?e.replace(B,function(e,t){return L.useBR&&"\n"===e?"<br>":L.tabReplace?t.replace(/\t/g,L.tabReplace):""}):e}function m(e,t,r){var a=t?C[t]:r,n=[e.trim()];return e.match(/\bhljs\b/)||n.push("hljs"),-1===e.indexOf(a)&&n.push(a),n.join(" ").trim()}function f(e){var t,r,a,s,l,u=i(e);n(u)||(L.useBR?(t=document.createElementNS("http://www.w3.org/1999/xhtml","div"),t.innerHTML=e.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):t=e,l=t.textContent,a=u?d(u,l,!0):b(l),r=c(t),r.length&&(s=document.createElementNS("http://www.w3.org/1999/xhtml","div"),s.innerHTML=a.value,a.value=o(r,c(s),l)),a.value=p(a.value),e.innerHTML=a.value,e.className=m(e.className,u,a.language),e.result={language:a.language,re:a.r},a.second_best&&(e.second_best={language:a.second_best.language,re:a.second_best.r}))}function g(e){L=s(L,e)}function _(){if(!_.called){_.called=!0;var e=document.querySelectorAll("pre code");N.forEach.call(e,f)}}function h(){addEventListener("DOMContentLoaded",_,!1),addEventListener("load",_,!1)}function v(t,r){var a=x[t]=r(e);a.aliases&&a.aliases.forEach(function(e){C[e]=t})}function y(){return k(x)}function w(e){return e=(e||"").toLowerCase(),x[e]||x[C[e]]}var N=[],k=Object.keys,x={},C={},E=/^(no-?highlight|plain|text)$/i,M=/\blang(?:uage)?-([\w-]+)\b/i,B=/((^(<[^>]+>|\t|)+|(?:\n)))/gm,R="</span>",L={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0};return e.highlight=d,e.highlightAuto=b,e.fixMarkup=p,e.highlightBlock=f,e.configure=g,e.initHighlighting=_,e.initHighlightingOnLoad=h,e.registerLanguage=v,e.listLanguages=y,e.getLanguage=w,e.inherit=s,e.IR="[a-zA-Z]\\w*",e.UIR="[a-zA-Z_]\\w*",e.NR="\\b\\d+(\\.\\d+)?",e.CNR="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",e.BNR="\\b(0b[01]+)",e.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",e.BE={b:"\\\\[\\s\\S]",r:0},e.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[e.BE]},e.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[e.BE]},e.PWM={b:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},e.C=function(t,r,a){var n=e.inherit({cN:"comment",b:t,e:r,c:[]},a||{});return n.c.push(e.PWM),n.c.push({cN:"doctag",b:"(?:TODO|FIXME|NOTE|BUG|XXX):",r:0}),n},e.CLCM=e.C("//","$"),e.CBCM=e.C("/\\*","\\*/"),e.HCM=e.C("#","$"),e.NM={cN:"number",b:e.NR,r:0},e.CNM={cN:"number",b:e.CNR,r:0},e.BNM={cN:"number",b:e.BNR,r:0},e.CSSNM={cN:"number",b:e.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0},e.RM={cN:"regexp",b:/\//,e:/\/[gimuy]*/,i:/\n/,c:[e.BE,{b:/\[/,e:/\]/,r:0,c:[e.BE]}]},e.TM={cN:"title",b:e.IR,r:0},e.UTM={cN:"title",b:e.UIR,r:0},e.METHOD_GUARD={b:"\\.\\s*"+e.UIR,r:0},e.registerLanguage("apache",function(e){var t={cN:"number",b:"[\\$%]\\d+"};return{aliases:["apacheconf"],cI:!0,c:[e.HCM,{cN:"section",b:"</?",e:">"},{cN:"attribute",b:/\w+/,r:0,k:{nomarkup:"order deny allow setenv rewriterule rewriteengine rewritecond documentroot sethandler errordocument loadmodule options header listen serverroot servername"},starts:{e:/$/,r:0,k:{literal:"on off all"},c:[{cN:"meta",b:"\\s\\[",e:"\\]$"},{cN:"variable",b:"[\\$%]\\{",e:"\\}",c:["self",t]},t,e.QSM]}}],i:/\S/}}),e.registerLanguage("bash",function(e){var t={cN:"variable",v:[{b:/\$[\w\d#@][\w\d_]*/},{b:/\$\{(.*?)}/}]},r={cN:"string",b:/"/,e:/"/,c:[e.BE,t,{cN:"variable",b:/\$\(/,e:/\)/,c:[e.BE]}]},a={cN:"string",b:/'/,e:/'/};return{aliases:["sh","zsh"],l:/\b-?[a-z\._]+\b/,k:{keyword:"if then else elif fi for while in do done case esac function",literal:"true false",built_in:"break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",_:"-ne -eq -lt -gt -f -d -e -s -l -a"},c:[{cN:"meta",b:/^#![^\n]+sh\s*$/,r:10},{cN:"function",b:/\w[\w\d_]*\s*\(\s*\)\s*\{/,rB:!0,c:[e.inherit(e.TM,{b:/\w[\w\d_]*/})],r:0},e.HCM,r,a,t]}}),e.registerLanguage("coffeescript",function(e){var t={keyword:"in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super yield import export from as default await then unless until loop of by when and or is isnt not",literal:"true false null undefined yes no on off",built_in:"npm require console print module global window document"},r="[A-Za-z$_][0-9A-Za-z$_]*",a={cN:"subst",b:/#\{/,e:/}/,k:t},n=[e.BNM,e.inherit(e.CNM,{starts:{e:"(\\s*/)?",r:0}}),{cN:"string",v:[{b:/'''/,e:/'''/,c:[e.BE]},{b:/'/,e:/'/,c:[e.BE]},{b:/"""/,e:/"""/,c:[e.BE,a]},{b:/"/,e:/"/,c:[e.BE,a]}]},{cN:"regexp",v:[{b:"///",e:"///",c:[a,e.HCM]},{b:"//[gim]*",r:0},{b:/\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/}]},{b:"@"+r},{sL:"javascript",eB:!0,eE:!0,v:[{b:"```",e:"```"},{b:"`",e:"`"}]}];a.c=n;var i=e.inherit(e.TM,{b:r}),s="(\\(.*\\))?\\s*\\B[-=]>",c={cN:"params",b:"\\([^\\(]",rB:!0,c:[{b:/\(/,e:/\)/,k:t,c:["self"].concat(n)}]};return{aliases:["coffee","cson","iced"],k:t,i:/\/\*/,c:n.concat([e.C("###","###"),e.HCM,{cN:"function",b:"^\\s*"+r+"\\s*=\\s*"+s,e:"[-=]>",rB:!0,c:[i,c]},{b:/[:\(,=]\s*/,r:0,c:[{cN:"function",b:s,e:"[-=]>",rB:!0,c:[c]}]},{cN:"class",bK:"class",e:"$",i:/[:="\[\]]/,c:[{bK:"extends",eW:!0,i:/[:="\[\]]/,c:[i]},i]},{b:r+":",e:":",rB:!0,rE:!0,r:0}])}}),e.registerLanguage("cpp",function(e){var t={cN:"keyword",b:"\\b[a-z\\d_]*_t\\b"},r={cN:"string",v:[{b:'(u8?|U)?L?"',e:'"',i:"\\n",c:[e.BE]},{b:'(u8?|U)?R"',e:'"',c:[e.BE]},{b:"'\\\\?.",e:"'",i:"."}]},a={cN:"number",v:[{b:"\\b(0b[01']+)"},{b:"(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)"},{b:"(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)"}],r:0},n={cN:"meta",b:/#\s*[a-z]+\b/,e:/$/,k:{"meta-keyword":"if else elif endif define undef warning error line pragma ifdef ifndef include"},c:[{b:/\\\n/,r:0},e.inherit(r,{cN:"meta-string"}),{cN:"meta-string",b:/<[^\n>]*>/,e:/$/,i:"\\n"},e.CLCM,e.CBCM]},i=e.IR+"\\s*\\(",s={keyword:"int float while private char catch import module export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignof constexpr decltype noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong new throw return and or not",built_in:"std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr",literal:"true false nullptr NULL"},c=[t,e.CLCM,e.CBCM,a,r];return{aliases:["c","cc","h","c++","h++","hpp"],k:s,i:"</",c:c.concat([n,{b:"\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",e:">",k:s,c:["self",t]},{b:e.IR+"::",k:s},{v:[{b:/=/,e:/;/},{b:/\(/,e:/\)/},{bK:"new throw return else",e:/;/}],k:s,c:c.concat([{b:/\(/,e:/\)/,k:s,c:c.concat(["self"]),r:0}]),r:0},{cN:"function",b:"("+e.IR+"[\\*&\\s]+)+"+i,rB:!0,e:/[{;=]/,eE:!0,k:s,i:/[^\w\s\*&]/,c:[{b:i,rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,k:s,r:0,c:[e.CLCM,e.CBCM,r,a,t]},e.CLCM,e.CBCM,n]},{cN:"class",bK:"class struct",e:/[{;:]/,c:[{b:/</,e:/>/,c:["self"]},e.TM]}]),exports:{preprocessor:n,strings:r,k:s}}}),e.registerLanguage("cs",function(e){var t={keyword:"abstract as base bool break byte case catch char checked const continue decimal default delegate do double enum event explicit extern finally fixed float for foreach goto if implicit in int interface internal is lock long nameof object operator out override params private protected public readonly ref sbyte sealed short sizeof stackalloc static string struct switch this try typeof uint ulong unchecked unsafe ushort using virtual void volatile while add alias ascending async await by descending dynamic equals from get global group into join let on orderby partial remove select set value var where yield",literal:"null false true"},r={cN:"string",b:'@"',e:'"',c:[{b:'""'}]},a=e.inherit(r,{i:/\n/}),n={cN:"subst",b:"{",e:"}",k:t},i=e.inherit(n,{i:/\n/}),s={cN:"string",b:/\$"/,e:'"',i:/\n/,c:[{b:"{{"},{b:"}}"},e.BE,i]},c={cN:"string",b:/\$@"/,e:'"',c:[{b:"{{"},{b:"}}"},{b:'""'},n]},o=e.inherit(c,{i:/\n/,c:[{b:"{{"},{b:"}}"},{b:'""'},i]});n.c=[c,s,r,e.ASM,e.QSM,e.CNM,e.CBCM],i.c=[o,s,a,e.ASM,e.QSM,e.CNM,e.inherit(e.CBCM,{i:/\n/})];var l={v:[c,s,r,e.ASM,e.QSM]},u=e.IR+"(<"+e.IR+"(\\s*,\\s*"+e.IR+")*>)?(\\[\\])?";return{aliases:["csharp"],k:t,i:/::/,c:[e.C("///","$",{rB:!0,c:[{cN:"doctag",v:[{b:"///",r:0},{b:"<!--|-->"},{b:"</?",e:">"}]}]}),e.CLCM,e.CBCM,{cN:"meta",b:"#",e:"$",k:{"meta-keyword":"if else elif endif define undef warning error line region endregion pragma checksum"}},l,e.CNM,{bK:"class interface",e:/[{;=]/,i:/[^\s:]/,c:[e.TM,e.CLCM,e.CBCM]},{bK:"namespace",e:/[{;=]/,i:/[^\s:]/,c:[e.inherit(e.TM,{b:"[a-zA-Z](\\.?\\w)*"}),e.CLCM,e.CBCM]},{cN:"meta",b:"^\\s*\\[",eB:!0,e:"\\]",eE:!0,c:[{cN:"meta-string",b:/"/,e:/"/}]},{bK:"new return throw await else",r:0},{cN:"function",b:"("+u+"\\s+)+"+e.IR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:t,c:[{b:e.IR+"\\s*\\(",rB:!0,c:[e.TM],r:0},{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,k:t,r:0,c:[l,e.CNM,e.CBCM]},e.CLCM,e.CBCM]}]}}),e.registerLanguage("css",function(e){var t="[a-zA-Z-][a-zA-Z0-9_-]*",r={b:/[A-Z\_\.\-]+\s*:/,rB:!0,e:";",eW:!0,c:[{cN:"attribute",b:/\S/,e:":",eE:!0,starts:{eW:!0,eE:!0,c:[{b:/[\w-]+\(/,rB:!0,c:[{cN:"built_in",b:/[\w-]+/},{b:/\(/,e:/\)/,c:[e.ASM,e.QSM]}]},e.CSSNM,e.QSM,e.ASM,e.CBCM,{cN:"number",b:"#[0-9A-Fa-f]+"},{cN:"meta",b:"!important"}]}}]};return{cI:!0,i:/[=\/|'\$]/,c:[e.CBCM,{cN:"selector-id",b:/#[A-Za-z0-9_-]+/},{cN:"selector-class",b:/\.[A-Za-z0-9_-]+/},{cN:"selector-attr",b:/\[/,e:/\]/,i:"$"},{cN:"selector-pseudo",b:/:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/},{b:"@(font-face|page)",l:"[a-z-]+",k:"font-face page"},{b:"@",e:"[{;]",i:/:/,c:[{cN:"keyword",b:/\w+/},{b:/\s/,eW:!0,eE:!0,r:0,c:[e.ASM,e.QSM,e.CSSNM]}]},{cN:"selector-tag",b:t,r:0},{b:"{",e:"}",i:/\S/,c:[e.CBCM,r]}]}}),e.registerLanguage("diff",function(e){return{aliases:["patch"],c:[{cN:"meta",r:10,v:[{b:/^@@ +\-\d+,\d+ +\+\d+,\d+ +@@$/},{b:/^\*\*\* +\d+,\d+ +\*\*\*\*$/},{b:/^\-\-\- +\d+,\d+ +\-\-\-\-$/}]},{cN:"comment",v:[{b:/Index: /,e:/$/},{b:/={3,}/,e:/$/},{b:/^\-{3}/,e:/$/},{b:/^\*{3} /,e:/$/},{b:/^\+{3}/,e:/$/},{b:/\*{5}/,e:/\*{5}$/}]},{cN:"addition",b:"^\\+",e:"$"},{cN:"deletion",b:"^\\-",e:"$"},{cN:"addition",b:"^\\!",e:"$"}]}}),e.registerLanguage("http",function(e){var t="HTTP/[0-9\\.]+";return{aliases:["https"],i:"\\S",c:[{b:"^"+t,e:"$",c:[{cN:"number",b:"\\b\\d{3}\\b"}]},{b:"^[A-Z]+ (.*?) "+t+"$",rB:!0,e:"$",c:[{cN:"string",b:" ",e:" ",eB:!0,eE:!0},{b:t},{cN:"keyword",b:"[A-Z]+"}]},{cN:"attribute",b:"^\\w",e:": ",eE:!0,i:"\\n|\\s|=",starts:{e:"$",r:0}},{b:"\\n\\n",starts:{sL:[],eW:!0}}]}}),e.registerLanguage("ini",function(e){var t={cN:"string",c:[e.BE],v:[{b:"'''",e:"'''",r:10},{b:'"""',e:'"""',r:10},{b:'"',e:'"'},{b:"'",e:"'"}]};return{aliases:["toml"],cI:!0,i:/\S/,c:[e.C(";","$"),e.HCM,{cN:"section",b:/^\s*\[+/,e:/\]+/},{b:/^[a-z0-9\[\]_-]+\s*=\s*/,e:"$",rB:!0,c:[{cN:"attr",b:/[a-z0-9\[\]_-]+/},{b:/=/,eW:!0,r:0,c:[{cN:"literal",b:/\bon|off|true|false|yes|no\b/},{cN:"variable",v:[{b:/\$[\w\d"][\w\d_]*/},{b:/\$\{(.*?)}/}]},t,{cN:"number",b:/([\+\-]+)?[\d]+_[\d_]+/},e.NM]}]}]}}),e.registerLanguage("java",function(e){var t="[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*",r=t+"(<"+t+"(\\s*,\\s*"+t+")*>)?",a="false synchronized int abstract float private char boolean static null if const for true while long strictfp finally protected import native final void enum else break transient catch instanceof byte super volatile case assert short package default double public try this switch continue throws protected public private module requires exports do",n="\\b(0[bB]([01]+[01_]+[01]+|[01]+)|0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)|(([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?|\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))([eE][-+]?\\d+)?)[lLfF]?",i={cN:"number",b:n,r:0};return{aliases:["jsp"],k:a,i:/<\/|#/,c:[e.C("/\\*\\*","\\*/",{r:0,c:[{b:/\w+@/,r:0},{cN:"doctag",b:"@[A-Za-z]+"}]}),e.CLCM,e.CBCM,e.ASM,e.QSM,{cN:"class",bK:"class interface",e:/[{;=]/,eE:!0,k:"class interface",i:/[:"\[\]]/,c:[{bK:"extends implements"},e.UTM]},{bK:"new throw return else",r:0},{cN:"function",b:"("+r+"\\s+)+"+e.UIR+"\\s*\\(",rB:!0,e:/[{;=]/,eE:!0,k:a,c:[{b:e.UIR+"\\s*\\(",rB:!0,r:0,c:[e.UTM]},{cN:"params",b:/\(/,e:/\)/,k:a,r:0,c:[e.ASM,e.QSM,e.CNM,e.CBCM]},e.CLCM,e.CBCM]},i,{cN:"meta",b:"@[A-Za-z]+"}]}}),e.registerLanguage("javascript",function(e){var t="[A-Za-z$_][0-9A-Za-z$_]*",r={keyword:"in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await static import from as",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"},a={cN:"number",v:[{b:"\\b(0[bB][01]+)"},{b:"\\b(0[oO][0-7]+)"},{b:e.CNR}],r:0},n={cN:"subst",b:"\\$\\{",e:"\\}",k:r,c:[]},i={cN:"string",b:"`",e:"`",c:[e.BE,n]};n.c=[e.ASM,e.QSM,i,a,e.RM];var s=n.c.concat([e.CBCM,e.CLCM]);return{aliases:["js","jsx"],k:r,c:[{cN:"meta",r:10,b:/^\s*['"]use (strict|asm)['"]/},{cN:"meta",b:/^#!/,e:/$/},e.ASM,e.QSM,i,e.CLCM,e.CBCM,a,{b:/[{,]\s*/,r:0,c:[{b:t+"\\s*:",rB:!0,r:0,c:[{cN:"attr",b:t,r:0}]}]},{b:"("+e.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[e.CLCM,e.CBCM,e.RM,{cN:"function",b:"(\\(.*?\\)|"+t+")\\s*=>",rB:!0,e:"\\s*=>",c:[{cN:"params",v:[{b:t},{b:/\(\s*\)/},{b:/\(/,e:/\)/,eB:!0,eE:!0,k:r,c:s}]}]},{b:/</,e:/(\/\w+|\w+\/)>/,sL:"xml",c:[{b:/<\w+\s*\/>/,skip:!0},{b:/<\w+/,e:/(\/\w+|\w+\/)>/,skip:!0,c:[{b:/<\w+\s*\/>/,skip:!0},"self"]}]}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[e.inherit(e.TM,{b:t}),{cN:"params",b:/\(/,e:/\)/,eB:!0,eE:!0,c:s}],i:/\[|%/},{b:/\$[(.]/},e.METHOD_GUARD,{cN:"class",bK:"class",e:/[{;=]/,eE:!0,i:/[:"\[\]]/,c:[{bK:"extends"},e.UTM]},{bK:"constructor",e:/\{/,eE:!0}],i:/#(?!!)/}}),e.registerLanguage("json",function(e){var t={literal:"true false null"},r=[e.QSM,e.CNM],a={e:",",eW:!0,eE:!0,c:r,k:t},n={b:"{",e:"}",c:[{cN:"attr",b:/"/,e:/"/,c:[e.BE],i:"\\n"},e.inherit(a,{b:/:/})],i:"\\S"},i={b:"\\[",e:"\\]",c:[e.inherit(a)],i:"\\S"};return r.splice(r.length,0,n,i),{c:r,k:t,i:"\\S"}}),e.registerLanguage("makefile",function(e){var t={cN:"variable",v:[{b:"\\$\\("+e.UIR+"\\)",c:[e.BE]},{b:/\$[@%<?\^\+\*]/}]},r={cN:"string",b:/"/,e:/"/,c:[e.BE,t]},a={cN:"variable",b:/\$\([\w-]+\s/,e:/\)/,k:{built_in:"subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value"},c:[t]},n={b:"^"+e.UIR+"\\s*[:+?]?=",i:"\\n",rB:!0,c:[{b:"^"+e.UIR,e:"[:+?]?=",eE:!0}]},i={cN:"meta",b:/^\.PHONY:/,e:/$/,k:{"meta-keyword":".PHONY"},l:/[\.\w]+/},s={cN:"section",b:/^[^\s]+:/,e:/$/,c:[t]};return{aliases:["mk","mak"],k:"define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath",l:/[\w-]+/,c:[e.HCM,t,r,a,n,i,s]}}),e.registerLanguage("xml",function(e){var t="[A-Za-z0-9\\._:-]+",r={eW:!0,i:/</,r:0,c:[{cN:"attr",b:t,r:0},{b:/=\s*/,r:0,c:[{cN:"string",endsParent:!0,v:[{b:/"/,e:/"/},{b:/'/,e:/'/},{b:/[^\s"'=<>`]+/}]}]}]};return{aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist"],cI:!0,c:[{cN:"meta",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},e.C("<!--","-->",{r:10}),{b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{b:/<\?(php)?/,e:/\?>/,sL:"php",c:[{b:"/\\*",e:"\\*/",skip:!0}]},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{name:"style"},c:[r],starts:{e:"</style>",rE:!0,sL:["css","xml"]}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{name:"script"},c:[r],starts:{e:"</script>",rE:!0,sL:["actionscript","javascript","handlebars","xml"]}},{cN:"meta",v:[{b:/<\?xml/,e:/\?>/,r:10},{b:/<\?\w+/,e:/\?>/}]},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"name",b:/[^\/><\s]+/,r:0},r]}]}}),e.registerLanguage("markdown",function(e){return{aliases:["md","mkdown","mkd"],c:[{cN:"section",v:[{b:"^#{1,6}",e:"$"},{b:"^.+?\\n[=-]{2,}$"}]},{b:"<",e:">",sL:"xml",r:0},{cN:"bullet",b:"^([*+-]|(\\d+\\.))\\s+"},{cN:"strong",b:"[*_]{2}.+?[*_]{2}"},{cN:"emphasis",v:[{b:"\\*.+?\\*"},{b:"_.+?_",r:0}]},{cN:"quote",b:"^>\\s+",e:"$"},{cN:"code",v:[{b:"^```w*s*$",e:"^```s*$"},{b:"`.+?`"},{b:"^( {4}|	)",e:"$",r:0}]},{b:"^[-\\*]{3,}",e:"$"},{b:"\\[.+?\\][\\(\\[].*?[\\)\\]]",rB:!0,c:[{cN:"string",b:"\\[",e:"\\]",eB:!0,rE:!0,r:0},{cN:"link",b:"\\]\\(",e:"\\)",eB:!0,eE:!0},{cN:"symbol",b:"\\]\\[",e:"\\]",eB:!0,eE:!0}],r:10},{b:/^\[[^\n]+\]:/,rB:!0,c:[{cN:"symbol",b:/\[/,e:/\]/,eB:!0,eE:!0},{cN:"link",b:/:\s*/,e:/$/,eB:!0}]}]}}),e.registerLanguage("nginx",function(e){var t={cN:"variable",v:[{b:/\$\d+/},{b:/\$\{/,e:/}/},{b:"[\\$\\@]"+e.UIR}]},r={eW:!0,l:"[a-z/_]+",k:{literal:"on off yes no true false none blocked debug info notice warn error crit select break last permanent redirect kqueue rtsig epoll poll /dev/poll"},r:0,i:"=>",c:[e.HCM,{cN:"string",c:[e.BE,t],v:[{b:/"/,e:/"/},{b:/'/,e:/'/}]},{b:"([a-z]+):/",e:"\\s",eW:!0,eE:!0,c:[t]},{cN:"regexp",c:[e.BE,t],v:[{b:"\\s\\^",e:"\\s|{|;",rE:!0},{b:"~\\*?\\s+",e:"\\s|{|;",rE:!0},{b:"\\*(\\.[a-z\\-]+)+"},{b:"([a-z\\-]+\\.)+\\*"}]},{cN:"number",b:"\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}(:\\d{1,5})?\\b"},{cN:"number",b:"\\b\\d+[kKmMgGdshdwy]*\\b",r:0},t]};return{aliases:["nginxconf"],c:[e.HCM,{b:e.UIR+"\\s+{",rB:!0,e:"{",c:[{cN:"section",b:e.UIR}],r:0},{b:e.UIR+"\\s",e:";|{",rB:!0,c:[{cN:"attribute",b:e.UIR,starts:r}],r:0}],i:"[^\\s\\}]"}}),e.registerLanguage("objectivec",function(e){var t={cN:"built_in",b:"\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"},r={keyword:"int float while char export sizeof typedef const struct for union unsigned long volatile static bool mutable if do return goto void enum else break extern asm case short default double register explicit signed typename this switch continue wchar_t inline readonly assign readwrite self @synchronized id typeof nonatomic super unichar IBOutlet IBAction strong weak copy in out inout bycopy byref oneway __strong __weak __block __autoreleasing @private @protected @public @try @property @end @throw @catch @finally @autoreleasepool @synthesize @dynamic @selector @optional @required @encode @package @import @defs @compatibility_alias __bridge __bridge_transfer __bridge_retained __bridge_retain __covariant __contravariant __kindof _Nonnull _Nullable _Null_unspecified __FUNCTION__ __PRETTY_FUNCTION__ __attribute__ getter setter retain unsafe_unretained nonnull nullable null_unspecified null_resettable class instancetype NS_DESIGNATED_INITIALIZER NS_UNAVAILABLE NS_REQUIRES_SUPER NS_RETURNS_INNER_POINTER NS_INLINE NS_AVAILABLE NS_DEPRECATED NS_ENUM NS_OPTIONS NS_SWIFT_UNAVAILABLE NS_ASSUME_NONNULL_BEGIN NS_ASSUME_NONNULL_END NS_REFINED_FOR_SWIFT NS_SWIFT_NAME NS_SWIFT_NOTHROW NS_DURING NS_HANDLER NS_ENDHANDLER NS_VALUERETURN NS_VOIDRETURN",literal:"false true FALSE TRUE nil YES NO NULL",built_in:"BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once"},a=/[a-zA-Z@][a-zA-Z0-9_]*/,n="@interface @class @protocol @implementation";return{aliases:["mm","objc","obj-c"],k:r,l:a,i:"</",c:[t,e.CLCM,e.CBCM,e.CNM,e.QSM,{cN:"string",v:[{b:'@"',e:'"',i:"\\n",c:[e.BE]},{b:"'",e:"[^\\\\]'",i:"[^\\\\][^']"}]},{cN:"meta",b:"#",e:"$",c:[{cN:"meta-string",v:[{b:'"',e:'"'},{b:"<",e:">"}]}]},{cN:"class",b:"("+n.split(" ").join("|")+")\\b",e:"({|$)",eE:!0,k:n,l:a,c:[e.UTM]},{b:"\\."+e.UIR,r:0}]}}),e.registerLanguage("perl",function(e){var t="getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qqfileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent shutdown dump chomp connect getsockname die socketpair close flock exists index shmgetsub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedirioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when",r={cN:"subst",b:"[$@]\\{",e:"\\}",k:t},a={b:"->{",e:"}"},n={v:[{b:/\$\d/},{b:/[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/},{b:/[\$%@][^\s\w{]/,r:0}]},i=[e.BE,r,n],s=[n,e.HCM,e.C("^\\=\\w","\\=cut",{eW:!0}),a,{cN:"string",c:i,v:[{b:"q[qwxr]?\\s*\\(",e:"\\)",r:5},{b:"q[qwxr]?\\s*\\[",e:"\\]",r:5},{b:"q[qwxr]?\\s*\\{",e:"\\}",r:5},{b:"q[qwxr]?\\s*\\|",e:"\\|",r:5},{b:"q[qwxr]?\\s*\\<",e:"\\>",r:5},{b:"qw\\s+q",e:"q",r:5},{b:"'",e:"'",c:[e.BE]},{b:'"',e:'"'},{b:"`",e:"`",c:[e.BE]},{b:"{\\w+}",c:[],r:0},{b:"-?\\w+\\s*\\=\\>",c:[],r:0}]},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{b:"(\\/\\/|"+e.RSR+"|\\b(split|return|print|reverse|grep)\\b)\\s*",k:"split return print reverse grep",r:0,c:[e.HCM,{cN:"regexp",b:"(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*",r:10},{cN:"regexp",b:"(m|qr)?/",e:"/[a-z]*",c:[e.BE],r:0}]},{cN:"function",bK:"sub",e:"(\\s*\\(.*?\\))?[;{]",eE:!0,r:5,c:[e.TM]},{b:"-\\w\\b",r:0},{b:"^__DATA__$",e:"^__END__$",sL:"mojolicious",c:[{b:"^@@.*",e:"$",cN:"comment"}]}];return r.c=s,a.c=s,{aliases:["pl","pm"],l:/[\w\.]+/,k:t,c:s}}),e.registerLanguage("php",function(e){var t={b:"\\$+[a-zA-Z_-ÿ][a-zA-Z0-9_-ÿ]*"},r={cN:"meta",b:/<\?(php)?|\?>/},a={cN:"string",c:[e.BE,r],v:[{b:'b"',e:'"'},{b:"b'",e:"'"},e.inherit(e.ASM,{i:null}),e.inherit(e.QSM,{i:null})]},n={v:[e.BNM,e.CNM]};return{aliases:["php3","php4","php5","php6"],cI:!0,k:"and include_once list abstract global private echo interface as static endswitch array null if endwhile or const for endforeach self var while isset public protected exit foreach throw elseif include __FILE__ empty require_once do xor return parent clone use __CLASS__ __LINE__ else break print eval new catch __METHOD__ case exception default die require __FUNCTION__ enddeclare final try switch continue endfor endif declare unset true false trait goto instanceof insteadof __DIR__ __NAMESPACE__ yield finally",c:[e.HCM,e.C("//","$",{c:[r]}),e.C("/\\*","\\*/",{c:[{cN:"doctag",b:"@[A-Za-z]+"}]}),e.C("__halt_compiler.+?;",!1,{eW:!0,k:"__halt_compiler",l:e.UIR}),{cN:"string",b:/<<<['"]?\w+['"]?$/,e:/^\w+;?$/,c:[e.BE,{cN:"subst",v:[{b:/\$\w+/},{b:/\{\$/,e:/\}/}]}]},r,{cN:"keyword",b:/\$this\b/},t,{b:/(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/},{cN:"function",bK:"function",e:/[;{]/,eE:!0,i:"\\$|\\[|%",c:[e.UTM,{cN:"params",b:"\\(",e:"\\)",c:["self",t,e.CBCM,a,n]}]},{cN:"class",bK:"class interface",e:"{",eE:!0,i:/[:\(\$"]/,c:[{bK:"extends implements"},e.UTM]},{bK:"namespace",e:";",i:/[\.']/,c:[e.UTM]},{bK:"use",e:";",c:[e.UTM]},{b:"=>"},a,n]}}),e.registerLanguage("python",function(e){var t={keyword:"and elif is global as in if from raise for except finally print import pass return exec else break not with class assert yield try while continue del or def lambda async await nonlocal|10 None True False",built_in:"Ellipsis NotImplemented"},r={cN:"meta",b:/^(>>>|\.\.\.) /},a={cN:"subst",b:/\{/,e:/\}/,k:t,i:/#/},n={cN:"string",c:[e.BE],v:[{b:/(u|b)?r?'''/,e:/'''/,c:[r],r:10},{b:/(u|b)?r?"""/,e:/"""/,c:[r],r:10},{b:/(fr|rf|f)'''/,e:/'''/,c:[r,a]},{b:/(fr|rf|f)"""/,e:/"""/,c:[r,a]},{b:/(u|r|ur)'/,e:/'/,r:10},{b:/(u|r|ur)"/,e:/"/,r:10},{b:/(b|br)'/,e:/'/},{b:/(b|br)"/,e:/"/},{b:/(fr|rf|f)'/,e:/'/,c:[a]},{b:/(fr|rf|f)"/,e:/"/,c:[a]},e.ASM,e.QSM]},i={cN:"number",r:0,v:[{b:e.BNR+"[lLjJ]?"},{b:"\\b(0o[0-7]+)[lLjJ]?"},{b:e.CNR+"[lLjJ]?"}]},s={cN:"params",b:/\(/,e:/\)/,c:["self",r,i,n]};return a.c=[n,i,r],{aliases:["py","gyp"],k:t,i:/(<\/|->|\?)|=>/,c:[r,i,n,e.HCM,{v:[{cN:"function",bK:"def"},{cN:"class",bK:"class"}],e:/:/,i:/[${=;\n,]/,c:[e.UTM,s,{b:/->/,eW:!0,k:"None"}]},{cN:"meta",b:/^[\t ]*@/,e:/$/},{b:/\b(print|exec)\(/}]}}),e.registerLanguage("ruby",function(e){
var t="[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?",r={keyword:"and then defined module in return redo if BEGIN retry end for self when next until do begin unless END rescue else break undef not super class case require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor",literal:"true false nil"},a={cN:"doctag",b:"@[A-Za-z]+"},n={b:"#<",e:">"},i=[e.C("#","$",{c:[a]}),e.C("^\\=begin","^\\=end",{c:[a],r:10}),e.C("^__END__","\\n$")],s={cN:"subst",b:"#\\{",e:"}",k:r},c={cN:"string",c:[e.BE,s],v:[{b:/'/,e:/'/},{b:/"/,e:/"/},{b:/`/,e:/`/},{b:"%[qQwWx]?\\(",e:"\\)"},{b:"%[qQwWx]?\\[",e:"\\]"},{b:"%[qQwWx]?{",e:"}"},{b:"%[qQwWx]?<",e:">"},{b:"%[qQwWx]?/",e:"/"},{b:"%[qQwWx]?%",e:"%"},{b:"%[qQwWx]?-",e:"-"},{b:"%[qQwWx]?\\|",e:"\\|"},{b:/\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/},{b:/<<(-?)\w+$/,e:/^\s*\w+$/}]},o={cN:"params",b:"\\(",e:"\\)",endsParent:!0,k:r},l=[c,n,{cN:"class",bK:"class module",e:"$|;",i:/=/,c:[e.inherit(e.TM,{b:"[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?"}),{b:"<\\s*",c:[{b:"("+e.IR+"::)?"+e.IR}]}].concat(i)},{cN:"function",bK:"def",e:"$|;",c:[e.inherit(e.TM,{b:t}),o].concat(i)},{b:e.IR+"::"},{cN:"symbol",b:e.UIR+"(\\!|\\?)?:",r:0},{cN:"symbol",b:":(?!\\s)",c:[c,{b:t}],r:0},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{b:"(\\$\\W)|((\\$|\\@\\@?)(\\w+))"},{cN:"params",b:/\|/,e:/\|/,k:r},{b:"("+e.RSR+"|unless)\\s*",k:"unless",c:[n,{cN:"regexp",c:[e.BE,s],i:/\n/,v:[{b:"/",e:"/[a-z]*"},{b:"%r{",e:"}[a-z]*"},{b:"%r\\(",e:"\\)[a-z]*"},{b:"%r!",e:"![a-z]*"},{b:"%r\\[",e:"\\][a-z]*"}]}].concat(i),r:0}].concat(i);s.c=l,o.c=l;var u="[>?]>",d="[\\w#]+\\(\\w+\\):\\d+:\\d+>",b="(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>",p=[{b:/^\s*=>/,starts:{e:"$",c:l}},{cN:"meta",b:"^("+u+"|"+d+"|"+b+")",starts:{e:"$",c:l}}];return{aliases:["rb","gemspec","podspec","thor","irb"],k:r,i:/\/\*/,c:i.concat(p).concat(l)}}),e.registerLanguage("shell",function(e){return{aliases:["console"],c:[{cN:"meta",b:"^\\s{0,3}[\\w\\d\\[\\]()@-]*[>%$#]",starts:{e:"$",sL:"bash"}}]}}),e.registerLanguage("sql",function(e){var t=e.C("--","$");return{cI:!0,i:/[<>{}*#]/,c:[{bK:"begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke comment",e:/;/,eW:!0,l:/[\w\.]+/,k:{keyword:"abort abs absolute acc acce accep accept access accessed accessible account acos action activate add addtime admin administer advanced advise aes_decrypt aes_encrypt after agent aggregate ali alia alias allocate allow alter always analyze ancillary and any anydata anydataset anyschema anytype apply archive archived archivelog are as asc ascii asin assembly assertion associate asynchronous at atan atn2 attr attri attrib attribu attribut attribute attributes audit authenticated authentication authid authors auto autoallocate autodblink autoextend automatic availability avg backup badfile basicfile before begin beginning benchmark between bfile bfile_base big bigfile bin binary_double binary_float binlog bit_and bit_count bit_length bit_or bit_xor bitmap blob_base block blocksize body both bound buffer_cache buffer_pool build bulk by byte byteordermark bytes cache caching call calling cancel capacity cascade cascaded case cast catalog category ceil ceiling chain change changed char_base char_length character_length characters characterset charindex charset charsetform charsetid check checksum checksum_agg child choose chr chunk class cleanup clear client clob clob_base clone close cluster_id cluster_probability cluster_set clustering coalesce coercibility col collate collation collect colu colum column column_value columns columns_updated comment commit compact compatibility compiled complete composite_limit compound compress compute concat concat_ws concurrent confirm conn connec connect connect_by_iscycle connect_by_isleaf connect_by_root connect_time connection consider consistent constant constraint constraints constructor container content contents context contributors controlfile conv convert convert_tz corr corr_k corr_s corresponding corruption cos cost count count_big counted covar_pop covar_samp cpu_per_call cpu_per_session crc32 create creation critical cross cube cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime customdatum cycle data database databases datafile datafiles datalength date_add date_cache date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts day day_to_second dayname dayofmonth dayofweek dayofyear days db_role_change dbtimezone ddl deallocate declare decode decompose decrement decrypt deduplicate def defa defau defaul default defaults deferred defi defin define degrees delayed delegate delete delete_all delimited demand dense_rank depth dequeue des_decrypt des_encrypt des_key_file desc descr descri describ describe descriptor deterministic diagnostics difference dimension direct_load directory disable disable_all disallow disassociate discardfile disconnect diskgroup distinct distinctrow distribute distributed div do document domain dotnet double downgrade drop dumpfile duplicate duration each edition editionable editions element ellipsis else elsif elt empty enable enable_all enclosed encode encoding encrypt end end-exec endian enforced engine engines enqueue enterprise entityescaping eomonth error errors escaped evalname evaluate event eventdata events except exception exceptions exchange exclude excluding execu execut execute exempt exists exit exp expire explain export export_set extended extent external external_1 external_2 externally extract failed failed_login_attempts failover failure far fast feature_set feature_value fetch field fields file file_name_convert filesystem_like_logging final finish first first_value fixed flash_cache flashback floor flush following follows for forall force form forma format found found_rows freelist freelists freepools fresh from from_base64 from_days ftp full function general generated get get_format get_lock getdate getutcdate global global_name globally go goto grant grants greatest group group_concat group_id grouping grouping_id groups gtid_subtract guarantee guard handler hash hashkeys having hea head headi headin heading heap help hex hierarchy high high_priority hosts hour http id ident_current ident_incr ident_seed identified identity idle_time if ifnull ignore iif ilike ilm immediate import in include including increment index indexes indexing indextype indicator indices inet6_aton inet6_ntoa inet_aton inet_ntoa infile initial initialized initially initrans inmemory inner innodb input insert install instance instantiable instr interface interleaved intersect into invalidate invisible is is_free_lock is_ipv4 is_ipv4_compat is_not is_not_null is_used_lock isdate isnull isolation iterate java join json json_exists keep keep_duplicates key keys kill language large last last_day last_insert_id last_value lax lcase lead leading least leaves left len lenght length less level levels library like like2 like4 likec limit lines link list listagg little ln load load_file lob lobs local localtime localtimestamp locate locator lock locked log log10 log2 logfile logfiles logging logical logical_reads_per_call logoff logon logs long loop low low_priority lower lpad lrtrim ltrim main make_set makedate maketime managed management manual map mapping mask master master_pos_wait match matched materialized max maxextents maximize maxinstances maxlen maxlogfiles maxloghistory maxlogmembers maxsize maxtrans md5 measures median medium member memcompress memory merge microsecond mid migration min minextents minimum mining minus minute minvalue missing mod mode model modification modify module monitoring month months mount move movement multiset mutex name name_const names nan national native natural nav nchar nclob nested never new newline next nextval no no_write_to_binlog noarchivelog noaudit nobadfile nocheck nocompress nocopy nocycle nodelay nodiscardfile noentityescaping noguarantee nokeep nologfile nomapping nomaxvalue nominimize nominvalue nomonitoring none noneditionable nonschema noorder nopr nopro noprom nopromp noprompt norely noresetlogs noreverse normal norowdependencies noschemacheck noswitch not nothing notice notrim novalidate now nowait nth_value nullif nulls num numb numbe nvarchar nvarchar2 object ocicoll ocidate ocidatetime ociduration ociinterval ociloblocator ocinumber ociref ocirefcursor ocirowid ocistring ocitype oct octet_length of off offline offset oid oidindex old on online only opaque open operations operator optimal optimize option optionally or oracle oracle_date oradata ord ordaudio orddicom orddoc order ordimage ordinality ordvideo organization orlany orlvary out outer outfile outline output over overflow overriding package pad parallel parallel_enable parameters parent parse partial partition partitions pascal passing password password_grace_time password_lock_time password_reuse_max password_reuse_time password_verify_function patch path patindex pctincrease pctthreshold pctused pctversion percent percent_rank percentile_cont percentile_disc performance period period_add period_diff permanent physical pi pipe pipelined pivot pluggable plugin policy position post_transaction pow power pragma prebuilt precedes preceding precision prediction prediction_cost prediction_details prediction_probability prediction_set prepare present preserve prior priority private private_sga privileges procedural procedure procedure_analyze processlist profiles project prompt protection public publishingservername purge quarter query quick quiesce quota quotename radians raise rand range rank raw read reads readsize rebuild record records recover recovery recursive recycle redo reduced ref reference referenced references referencing refresh regexp_like register regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy reject rekey relational relative relaylog release release_lock relies_on relocate rely rem remainder rename repair repeat replace replicate replication required reset resetlogs resize resource respect restore restricted result result_cache resumable resume retention return returning returns reuse reverse revoke right rlike role roles rollback rolling rollup round row row_count rowdependencies rowid rownum rows rtrim rules safe salt sample save savepoint sb1 sb2 sb4 scan schema schemacheck scn scope scroll sdo_georaster sdo_topo_geometry search sec_to_time second section securefile security seed segment select self sequence sequential serializable server servererror session session_user sessions_per_user set sets settings sha sha1 sha2 share shared shared_pool short show shrink shutdown si_averagecolor si_colorhistogram si_featurelist si_positionalcolor si_stillimage si_texture siblings sid sign sin size size_t sizes skip slave sleep smalldatetimefromparts smallfile snapshot some soname sort soundex source space sparse spfile split sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_small_result sql_variant_property sqlcode sqldata sqlerror sqlname sqlstate sqrt square standalone standby start starting startup statement static statistics stats_binomial_test stats_crosstab stats_ks_test stats_mode stats_mw_test stats_one_way_anova stats_t_test_ stats_t_test_indep stats_t_test_one stats_t_test_paired stats_wsr_test status std stddev stddev_pop stddev_samp stdev stop storage store stored str str_to_date straight_join strcmp strict string struct stuff style subdate subpartition subpartitions substitutable substr substring subtime subtring_index subtype success sum suspend switch switchoffset switchover sync synchronous synonym sys sys_xmlagg sysasm sysaux sysdate sysdatetimeoffset sysdba sysoper system system_user sysutcdatetime table tables tablespace tan tdo template temporary terminated tertiary_weights test than then thread through tier ties time time_format time_zone timediff timefromparts timeout timestamp timestampadd timestampdiff timezone_abbr timezone_minute timezone_region to to_base64 to_date to_days to_seconds todatetimeoffset trace tracking transaction transactional translate translation treat trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse type ub1 ub2 ub4 ucase unarchived unbounded uncompress under undo unhex unicode uniform uninstall union unique unix_timestamp unknown unlimited unlock unpivot unrecoverable unsafe unsigned until untrusted unusable unused update updated upgrade upped upper upsert url urowid usable usage use use_stored_outlines user user_data user_resources users using utc_date utc_timestamp uuid uuid_short validate validate_password_strength validation valist value values var var_samp varcharc vari varia variab variabl variable variables variance varp varraw varrawc varray verify version versions view virtual visible void wait wallet warning warnings week weekday weekofyear wellformed when whene whenev wheneve whenever where while whitespace with within without work wrapped xdb xml xmlagg xmlattributes xmlcast xmlcolattval xmlelement xmlexists xmlforest xmlindex xmlnamespaces xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltype xor year year_to_month years yearweek",literal:"true false null",built_in:"array bigint binary bit blob boolean char character date dec decimal float int int8 integer interval number numeric real record serial serial8 smallint text varchar varying void"},c:[{cN:"string",b:"'",e:"'",c:[e.BE,{b:"''"}]},{cN:"string",b:'"',e:'"',c:[e.BE,{b:'""'}]},{cN:"string",b:"`",e:"`",c:[e.BE]},e.CNM,e.CBCM,t]},e.CBCM,t]}}),e});
(function(){'use strict';var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}}
    function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})};
    function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};window.Promise||(window.Promise=n,window.Promise.resolve=u,window.Promise.reject=t,window.Promise.race=x,window.Promise.all=w,window.Promise.prototype.then=n.prototype.c,window.Promise.prototype["catch"]=n.prototype.g);}());

(function(){function l(a,b){document.addEventListener?a.addEventListener("scroll",b,!1):a.attachEvent("scroll",b)}function m(a){document.body?a():document.addEventListener?document.addEventListener("DOMContentLoaded",function c(){document.removeEventListener("DOMContentLoaded",c);a()}):document.attachEvent("onreadystatechange",function k(){if("interactive"==document.readyState||"complete"==document.readyState)document.detachEvent("onreadystatechange",k),a()})};function v(a){this.a=document.createElement("div");this.a.setAttribute("aria-hidden","true");this.a.appendChild(document.createTextNode(a));this.b=document.createElement("span");this.c=document.createElement("span");this.h=document.createElement("span");this.f=document.createElement("span");this.g=-1;this.b.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.c.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";
    this.f.style.cssText="max-width:none;display:inline-block;position:absolute;height:100%;width:100%;overflow:scroll;font-size:16px;";this.h.style.cssText="display:inline-block;width:200%;height:200%;font-size:16px;max-width:none;";this.b.appendChild(this.h);this.c.appendChild(this.f);this.a.appendChild(this.b);this.a.appendChild(this.c)}
    function w(a,b){a.a.style.cssText="max-width:none;min-width:20px;min-height:20px;display:inline-block;overflow:hidden;position:absolute;width:auto;margin:0;padding:0;top:-999px;left:-999px;white-space:nowrap;font:"+b+";"}function y(a){var b=a.a.offsetWidth,c=b+100;a.f.style.width=c+"px";a.c.scrollLeft=c;a.b.scrollLeft=a.b.scrollWidth+100;return a.g!==b?(a.g=b,!0):!1}function z(a,b){function c(){var a=k;y(a)&&null!==a.a.parentNode&&b(a.g)}var k=a;l(a.b,c);l(a.c,c);y(a)};function A(a,b){var c=b||{};this.family=a;this.style=c.style||"normal";this.weight=c.weight||"normal";this.stretch=c.stretch||"normal"}var B=null,C=null,G=!!window.FontFace;function H(){if(null===C){var a=document.createElement("div");try{a.style.font="condensed 100px sans-serif"}catch(b){}C=""!==a.style.font}return C}function I(a,b){return[a.style,a.weight,H()?a.stretch:"","100px",b].join(" ")}
    A.prototype.load=function(a,b){var c=this,k=a||"BESbswy",x=b||3E3,D=(new Date).getTime();return new Promise(function(a,b){if(G){var J=new Promise(function(a,b){function e(){(new Date).getTime()-D>=x?b():document.fonts.load(I(c,c.family),k).then(function(c){1<=c.length?a():setTimeout(e,25)},function(){b()})}e()}),K=new Promise(function(a,c){setTimeout(c,x)});Promise.race([K,J]).then(function(){a(c)},function(){b(c)})}else m(function(){function q(){var b;if(b=-1!=f&&-1!=g||-1!=f&&-1!=h||-1!=g&&-1!=
            h)(b=f!=g&&f!=h&&g!=h)||(null===B&&(b=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent),B=!!b&&(536>parseInt(b[1],10)||536===parseInt(b[1],10)&&11>=parseInt(b[2],10))),b=B&&(f==r&&g==r&&h==r||f==t&&g==t&&h==t||f==u&&g==u&&h==u)),b=!b;b&&(null!==d.parentNode&&d.parentNode.removeChild(d),clearTimeout(F),a(c))}function E(){if((new Date).getTime()-D>=x)null!==d.parentNode&&d.parentNode.removeChild(d),b(c);else{var a=document.hidden;if(!0===a||void 0===a)f=e.a.offsetWidth,g=n.a.offsetWidth,
        h=p.a.offsetWidth,q();F=setTimeout(E,50)}}var e=new v(k),n=new v(k),p=new v(k),f=-1,g=-1,h=-1,r=-1,t=-1,u=-1,d=document.createElement("div"),F=0;d.dir="ltr";w(e,I(c,"sans-serif"));w(n,I(c,"serif"));w(p,I(c,"monospace"));d.appendChild(e.a);d.appendChild(n.a);d.appendChild(p.a);document.body.appendChild(d);r=e.a.offsetWidth;t=n.a.offsetWidth;u=p.a.offsetWidth;E();z(e,function(a){f=a;q()});w(e,I(c,'"'+c.family+'",sans-serif'));z(n,function(a){g=a;q()});w(n,I(c,'"'+c.family+'",serif'));z(p,function(a){h=
        a;q()});w(p,I(c,'"'+c.family+'",monospace'))})})};window.FontFaceObserver=A;window.FontFaceObserver.prototype.check=window.FontFaceObserver.prototype.load=A.prototype.load;"undefined"!==typeof module&&(module.exports=window.FontFaceObserver);}());
/*!
 * Fuse.js v3.1.0 - Lightweight fuzzy-search (http://fusejs.io)
 *
 * Copyright (c) 2012-2017 Kirollos Risk (http://kiro.me)
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */
(function webpackUniversalModuleDefinition(root, factory) {
    if(typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if(typeof define === 'function' && define.amd)
        define("Fuse", [], factory);
    else if(typeof exports === 'object')
        exports["Fuse"] = factory();
    else
        root["Fuse"] = factory();
})(this, function() {
    return /******/ (function(modules) { // webpackBootstrap
        /******/ 	// The module cache
        /******/ 	var installedModules = {};
        /******/
        /******/ 	// The require function
        /******/ 	function __webpack_require__(moduleId) {
            /******/
            /******/ 		// Check if module is in cache
            /******/ 		if(installedModules[moduleId]) {
                /******/ 			return installedModules[moduleId].exports;
                /******/ 		}
            /******/ 		// Create a new module (and put it into the cache)
            /******/ 		var module = installedModules[moduleId] = {
                /******/ 			i: moduleId,
                /******/ 			l: false,
                /******/ 			exports: {}
                /******/ 		};
            /******/
            /******/ 		// Execute the module function
            /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            /******/
            /******/ 		// Flag the module as loaded
            /******/ 		module.l = true;
            /******/
            /******/ 		// Return the exports of the module
            /******/ 		return module.exports;
            /******/ 	}
        /******/
        /******/
        /******/ 	// expose the modules object (__webpack_modules__)
        /******/ 	__webpack_require__.m = modules;
        /******/
        /******/ 	// expose the module cache
        /******/ 	__webpack_require__.c = installedModules;
        /******/
        /******/ 	// identity function for calling harmony imports with the correct context
        /******/ 	__webpack_require__.i = function(value) { return value; };
        /******/
        /******/ 	// define getter function for harmony exports
        /******/ 	__webpack_require__.d = function(exports, name, getter) {
            /******/ 		if(!__webpack_require__.o(exports, name)) {
                /******/ 			Object.defineProperty(exports, name, {
                    /******/ 				configurable: false,
                    /******/ 				enumerable: true,
                    /******/ 				get: getter
                    /******/ 			});
                /******/ 		}
            /******/ 	};
        /******/
        /******/ 	// getDefaultExport function for compatibility with non-harmony modules
        /******/ 	__webpack_require__.n = function(module) {
            /******/ 		var getter = module && module.__esModule ?
                /******/ 			function getDefault() { return module['default']; } :
                /******/ 			function getModuleExports() { return module; };
            /******/ 		__webpack_require__.d(getter, 'a', getter);
            /******/ 		return getter;
            /******/ 	};
        /******/
        /******/ 	// Object.prototype.hasOwnProperty.call
        /******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
        /******/
        /******/ 	// __webpack_public_path__
        /******/ 	__webpack_require__.p = "";
        /******/
        /******/ 	// Load entry module and return exports
        /******/ 	return __webpack_require__(__webpack_require__.s = 8);
        /******/ })
    /************************************************************************/
    /******/ ([
        /* 0 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            module.exports = function (obj) {
                return Object.prototype.toString.call(obj) === '[object Array]';
            };

            /***/ }),
        /* 1 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

            var bitapRegexSearch = __webpack_require__(5);
            var bitapSearch = __webpack_require__(7);
            var patternAlphabet = __webpack_require__(4);

            var Bitap = function () {
                function Bitap(pattern, _ref) {
                    var _ref$location = _ref.location,
                        location = _ref$location === undefined ? 0 : _ref$location,
                        _ref$distance = _ref.distance,
                        distance = _ref$distance === undefined ? 100 : _ref$distance,
                        _ref$threshold = _ref.threshold,
                        threshold = _ref$threshold === undefined ? 0.6 : _ref$threshold,
                        _ref$maxPatternLength = _ref.maxPatternLength,
                        maxPatternLength = _ref$maxPatternLength === undefined ? 32 : _ref$maxPatternLength,
                        _ref$isCaseSensitive = _ref.isCaseSensitive,
                        isCaseSensitive = _ref$isCaseSensitive === undefined ? false : _ref$isCaseSensitive,
                        _ref$tokenSeparator = _ref.tokenSeparator,
                        tokenSeparator = _ref$tokenSeparator === undefined ? / +/g : _ref$tokenSeparator,
                        _ref$findAllMatches = _ref.findAllMatches,
                        findAllMatches = _ref$findAllMatches === undefined ? false : _ref$findAllMatches,
                        _ref$minMatchCharLeng = _ref.minMatchCharLength,
                        minMatchCharLength = _ref$minMatchCharLeng === undefined ? 1 : _ref$minMatchCharLeng;

                    _classCallCheck(this, Bitap);

                    this.options = {
                        location: location,
                        distance: distance,
                        threshold: threshold,
                        maxPatternLength: maxPatternLength,
                        isCaseSensitive: isCaseSensitive,
                        tokenSeparator: tokenSeparator,
                        findAllMatches: findAllMatches,
                        minMatchCharLength: minMatchCharLength
                    };

                    this.pattern = this.options.isCaseSensitive ? pattern : pattern.toLowerCase();

                    if (this.pattern.length <= maxPatternLength) {
                        this.patternAlphabet = patternAlphabet(this.pattern);
                    }
                }

                _createClass(Bitap, [{
                    key: 'search',
                    value: function search(text) {
                        if (!this.options.isCaseSensitive) {
                            text = text.toLowerCase();
                        }

                        // Exact match
                        if (this.pattern === text) {
                            return {
                                isMatch: true,
                                score: 0,
                                matchedIndices: [[0, text.length - 1]]
                            };
                        }

                        // When pattern length is greater than the machine word length, just do a a regex comparison
                        var _options = this.options,
                            maxPatternLength = _options.maxPatternLength,
                            tokenSeparator = _options.tokenSeparator;

                        if (this.pattern.length > maxPatternLength) {
                            return bitapRegexSearch(text, this.pattern, tokenSeparator);
                        }

                        // Otherwise, use Bitap algorithm
                        var _options2 = this.options,
                            location = _options2.location,
                            distance = _options2.distance,
                            threshold = _options2.threshold,
                            findAllMatches = _options2.findAllMatches,
                            minMatchCharLength = _options2.minMatchCharLength;

                        return bitapSearch(text, this.pattern, this.patternAlphabet, {
                            location: location,
                            distance: distance,
                            threshold: threshold,
                            findAllMatches: findAllMatches,
                            minMatchCharLength: minMatchCharLength
                        });
                    }
                }]);

                return Bitap;
            }();

// let x = new Bitap("od mn war", {})
// let result = x.search("Old Man's War")
// console.log(result)

            module.exports = Bitap;

            /***/ }),
        /* 2 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var isArray = __webpack_require__(0);

            var deepValue = function deepValue(obj, path, list) {
                if (!path) {
                    // If there's no path left, we've gotten to the object we care about.
                    list.push(obj);
                } else {
                    var dotIndex = path.indexOf('.');
                    var firstSegment = path;
                    var remaining = null;

                    if (dotIndex !== -1) {
                        firstSegment = path.slice(0, dotIndex);
                        remaining = path.slice(dotIndex + 1);
                    }

                    var value = obj[firstSegment];

                    if (value !== null && value !== undefined) {
                        if (!remaining && (typeof value === 'string' || typeof value === 'number')) {
                            list.push(value.toString());
                        } else if (isArray(value)) {
                            // Search each item in the array.
                            for (var i = 0, len = value.length; i < len; i += 1) {
                                deepValue(value[i], remaining, list);
                            }
                        } else if (remaining) {
                            // An object. Recurse further.
                            deepValue(value, remaining, list);
                        }
                    }
                }

                return list;
            };

            module.exports = function (obj, path) {
                return deepValue(obj, path, []);
            };

            /***/ }),
        /* 3 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            module.exports = function () {
                var matchmask = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                var minMatchCharLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

                var matchedIndices = [];
                var start = -1;
                var end = -1;
                var i = 0;

                for (var len = matchmask.length; i < len; i += 1) {
                    var match = matchmask[i];
                    if (match && start === -1) {
                        start = i;
                    } else if (!match && start !== -1) {
                        end = i - 1;
                        if (end - start + 1 >= minMatchCharLength) {
                            matchedIndices.push([start, end]);
                        }
                        start = -1;
                    }
                }

                // (i-1 - start) + 1 => i - start
                if (matchmask[i - 1] && i - start >= minMatchCharLength) {
                    matchedIndices.push([start, i - 1]);
                }

                return matchedIndices;
            };

            /***/ }),
        /* 4 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            module.exports = function (pattern) {
                var mask = {};
                var len = pattern.length;

                for (var i = 0; i < len; i += 1) {
                    mask[pattern.charAt(i)] = 0;
                }

                for (var _i = 0; _i < len; _i += 1) {
                    mask[pattern.charAt(_i)] |= 1 << len - _i - 1;
                }

                return mask;
            };

            /***/ }),
        /* 5 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var SPECIAL_CHARS_REGEX = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

            module.exports = function (text, pattern) {
                var tokenSeparator = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : / +/g;

                var regex = new RegExp(pattern.replace(SPECIAL_CHARS_REGEX, '\\$&').replace(tokenSeparator, '|'));
                var matches = text.match(regex);
                var isMatch = !!matches;
                var matchedIndices = [];

                if (isMatch) {
                    for (var i = 0, matchesLen = matches.length; i < matchesLen; i += 1) {
                        var match = matches[i];
                        matchedIndices.push([text.indexOf(match), match.length - 1]);
                    }
                }

                return {
                    // TODO: revisit this score
                    score: isMatch ? 0.5 : 1,
                    isMatch: isMatch,
                    matchedIndices: matchedIndices
                };
            };

            /***/ }),
        /* 6 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            module.exports = function (pattern, _ref) {
                var _ref$errors = _ref.errors,
                    errors = _ref$errors === undefined ? 0 : _ref$errors,
                    _ref$currentLocation = _ref.currentLocation,
                    currentLocation = _ref$currentLocation === undefined ? 0 : _ref$currentLocation,
                    _ref$expectedLocation = _ref.expectedLocation,
                    expectedLocation = _ref$expectedLocation === undefined ? 0 : _ref$expectedLocation,
                    _ref$distance = _ref.distance,
                    distance = _ref$distance === undefined ? 100 : _ref$distance;

                var accuracy = errors / pattern.length;
                var proximity = Math.abs(expectedLocation - currentLocation);

                if (!distance) {
                    // Dodge divide by zero error.
                    return proximity ? 1.0 : accuracy;
                }

                return accuracy + proximity / distance;
            };

            /***/ }),
        /* 7 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var bitapScore = __webpack_require__(6);
            var matchedIndices = __webpack_require__(3);

            module.exports = function (text, pattern, patternAlphabet, _ref) {
                var _ref$location = _ref.location,
                    location = _ref$location === undefined ? 0 : _ref$location,
                    _ref$distance = _ref.distance,
                    distance = _ref$distance === undefined ? 100 : _ref$distance,
                    _ref$threshold = _ref.threshold,
                    threshold = _ref$threshold === undefined ? 0.6 : _ref$threshold,
                    _ref$findAllMatches = _ref.findAllMatches,
                    findAllMatches = _ref$findAllMatches === undefined ? false : _ref$findAllMatches,
                    _ref$minMatchCharLeng = _ref.minMatchCharLength,
                    minMatchCharLength = _ref$minMatchCharLeng === undefined ? 1 : _ref$minMatchCharLeng;

                var expectedLocation = location;
                // Set starting location at beginning text and initialize the alphabet.
                var textLen = text.length;
                // Highest score beyond which we give up.
                var currentThreshold = threshold;
                // Is there a nearby exact match? (speedup)
                var bestLocation = text.indexOf(pattern, expectedLocation);

                var patternLen = pattern.length;

                // a mask of the matches
                var matchMask = [];
                for (var i = 0; i < textLen; i += 1) {
                    matchMask[i] = 0;
                }

                if (bestLocation !== -1) {
                    var score = bitapScore(pattern, {
                        errors: 0,
                        currentLocation: bestLocation,
                        expectedLocation: expectedLocation,
                        distance: distance
                    });
                    currentThreshold = Math.min(score, currentThreshold);

                    // What about in the other direction? (speed up)
                    bestLocation = text.lastIndexOf(pattern, expectedLocation + patternLen);

                    if (bestLocation !== -1) {
                        var _score = bitapScore(pattern, {
                            errors: 0,
                            currentLocation: bestLocation,
                            expectedLocation: expectedLocation,
                            distance: distance
                        });
                        currentThreshold = Math.min(_score, currentThreshold);
                    }
                }

                // Reset the best location
                bestLocation = -1;

                var lastBitArr = [];
                var finalScore = 1;
                var binMax = patternLen + textLen;

                var mask = 1 << patternLen - 1;

                for (var _i = 0; _i < patternLen; _i += 1) {
                    // Scan for the best match; each iteration allows for one more error.
                    // Run a binary search to determine how far from the match location we can stray
                    // at this error level.
                    var binMin = 0;
                    var binMid = binMax;

                    while (binMin < binMid) {
                        var _score3 = bitapScore(pattern, {
                            errors: _i,
                            currentLocation: expectedLocation + binMid,
                            expectedLocation: expectedLocation,
                            distance: distance
                        });

                        if (_score3 <= currentThreshold) {
                            binMin = binMid;
                        } else {
                            binMax = binMid;
                        }

                        binMid = Math.floor((binMax - binMin) / 2 + binMin);
                    }

                    // Use the result from this iteration as the maximum for the next.
                    binMax = binMid;

                    var start = Math.max(1, expectedLocation - binMid + 1);
                    var finish = findAllMatches ? textLen : Math.min(expectedLocation + binMid, textLen) + patternLen;

                    // Initialize the bit array
                    var bitArr = Array(finish + 2);

                    bitArr[finish + 1] = (1 << _i) - 1;

                    for (var j = finish; j >= start; j -= 1) {
                        var currentLocation = j - 1;
                        var charMatch = patternAlphabet[text.charAt(currentLocation)];

                        if (charMatch) {
                            matchMask[currentLocation] = 1;
                        }

                        // First pass: exact match
                        bitArr[j] = (bitArr[j + 1] << 1 | 1) & charMatch;

                        // Subsequent passes: fuzzy match
                        if (_i !== 0) {
                            bitArr[j] |= (lastBitArr[j + 1] | lastBitArr[j]) << 1 | 1 | lastBitArr[j + 1];
                        }

                        if (bitArr[j] & mask) {
                            finalScore = bitapScore(pattern, {
                                errors: _i,
                                currentLocation: currentLocation,
                                expectedLocation: expectedLocation,
                                distance: distance
                            });

                            // This match will almost certainly be better than any existing match.
                            // But check anyway.
                            if (finalScore <= currentThreshold) {
                                // Indeed it is
                                currentThreshold = finalScore;
                                bestLocation = currentLocation;

                                // Already passed `loc`, downhill from here on in.
                                if (bestLocation <= expectedLocation) {
                                    break;
                                }

                                // When passing `bestLocation`, don't exceed our current distance from `expectedLocation`.
                                start = Math.max(1, 2 * expectedLocation - bestLocation);
                            }
                        }
                    }

                    // No hope for a (better) match at greater error levels.
                    var _score2 = bitapScore(pattern, {
                        errors: _i + 1,
                        currentLocation: expectedLocation,
                        expectedLocation: expectedLocation,
                        distance: distance
                    });

                    if (_score2 > currentThreshold) {
                        break;
                    }

                    lastBitArr = bitArr;
                }

                // Count exact matches (those with a score of 0) to be "almost" exact
                return {
                    isMatch: bestLocation >= 0,
                    score: finalScore === 0 ? 0.001 : finalScore,
                    matchedIndices: matchedIndices(matchMask, minMatchCharLength)
                };
            };

            /***/ }),
        /* 8 */
        /***/ (function(module, exports, __webpack_require__) {

            "use strict";


            var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

            function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

            var Bitap = __webpack_require__(1);
            var deepValue = __webpack_require__(2);
            var isArray = __webpack_require__(0);

            var Fuse = function () {
                function Fuse(list, _ref) {
                    var _ref$location = _ref.location,
                        location = _ref$location === undefined ? 0 : _ref$location,
                        _ref$distance = _ref.distance,
                        distance = _ref$distance === undefined ? 100 : _ref$distance,
                        _ref$threshold = _ref.threshold,
                        threshold = _ref$threshold === undefined ? 0.6 : _ref$threshold,
                        _ref$maxPatternLength = _ref.maxPatternLength,
                        maxPatternLength = _ref$maxPatternLength === undefined ? 32 : _ref$maxPatternLength,
                        _ref$caseSensitive = _ref.caseSensitive,
                        caseSensitive = _ref$caseSensitive === undefined ? false : _ref$caseSensitive,
                        _ref$tokenSeparator = _ref.tokenSeparator,
                        tokenSeparator = _ref$tokenSeparator === undefined ? / +/g : _ref$tokenSeparator,
                        _ref$findAllMatches = _ref.findAllMatches,
                        findAllMatches = _ref$findAllMatches === undefined ? false : _ref$findAllMatches,
                        _ref$minMatchCharLeng = _ref.minMatchCharLength,
                        minMatchCharLength = _ref$minMatchCharLeng === undefined ? 1 : _ref$minMatchCharLeng,
                        _ref$id = _ref.id,
                        id = _ref$id === undefined ? null : _ref$id,
                        _ref$keys = _ref.keys,
                        keys = _ref$keys === undefined ? [] : _ref$keys,
                        _ref$shouldSort = _ref.shouldSort,
                        shouldSort = _ref$shouldSort === undefined ? true : _ref$shouldSort,
                        _ref$getFn = _ref.getFn,
                        getFn = _ref$getFn === undefined ? deepValue : _ref$getFn,
                        _ref$sortFn = _ref.sortFn,
                        sortFn = _ref$sortFn === undefined ? function (a, b) {
                            return a.score - b.score;
                        } : _ref$sortFn,
                        _ref$tokenize = _ref.tokenize,
                        tokenize = _ref$tokenize === undefined ? false : _ref$tokenize,
                        _ref$matchAllTokens = _ref.matchAllTokens,
                        matchAllTokens = _ref$matchAllTokens === undefined ? false : _ref$matchAllTokens,
                        _ref$includeMatches = _ref.includeMatches,
                        includeMatches = _ref$includeMatches === undefined ? false : _ref$includeMatches,
                        _ref$includeScore = _ref.includeScore,
                        includeScore = _ref$includeScore === undefined ? false : _ref$includeScore,
                        _ref$verbose = _ref.verbose,
                        verbose = _ref$verbose === undefined ? false : _ref$verbose;

                    _classCallCheck(this, Fuse);

                    this.options = {
                        location: location,
                        distance: distance,
                        threshold: threshold,
                        maxPatternLength: maxPatternLength,
                        isCaseSensitive: caseSensitive,
                        tokenSeparator: tokenSeparator,
                        findAllMatches: findAllMatches,
                        minMatchCharLength: minMatchCharLength,
                        id: id,
                        keys: keys,
                        includeMatches: includeMatches,
                        includeScore: includeScore,
                        shouldSort: shouldSort,
                        getFn: getFn,
                        sortFn: sortFn,
                        verbose: verbose,
                        tokenize: tokenize,
                        matchAllTokens: matchAllTokens
                    };

                    this.setCollection(list);
                }

                _createClass(Fuse, [{
                    key: 'setCollection',
                    value: function setCollection(list) {
                        this.list = list;
                        return list;
                    }
                }, {
                    key: 'search',
                    value: function search(pattern) {
                        this._log('---------\nSearch pattern: "' + pattern + '"');

                        var _prepareSearchers2 = this._prepareSearchers(pattern),
                            tokenSearchers = _prepareSearchers2.tokenSearchers,
                            fullSearcher = _prepareSearchers2.fullSearcher;

                        var _search2 = this._search(tokenSearchers, fullSearcher),
                            weights = _search2.weights,
                            results = _search2.results;

                        this._computeScore(weights, results);

                        if (this.options.shouldSort) {
                            this._sort(results);
                        }

                        return this._format(results);
                    }
                }, {
                    key: '_prepareSearchers',
                    value: function _prepareSearchers() {
                        var pattern = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

                        var tokenSearchers = [];

                        if (this.options.tokenize) {
                            // Tokenize on the separator
                            var tokens = pattern.split(this.options.tokenSeparator);
                            for (var i = 0, len = tokens.length; i < len; i += 1) {
                                tokenSearchers.push(new Bitap(tokens[i], this.options));
                            }
                        }

                        var fullSearcher = new Bitap(pattern, this.options);

                        return { tokenSearchers: tokenSearchers, fullSearcher: fullSearcher };
                    }
                }, {
                    key: '_search',
                    value: function _search() {
                        var tokenSearchers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
                        var fullSearcher = arguments[1];

                        var list = this.list;
                        var resultMap = {};
                        var results = [];

                        // Check the first item in the list, if it's a string, then we assume
                        // that every item in the list is also a string, and thus it's a flattened array.
                        if (typeof list[0] === 'string') {
                            // Iterate over every item
                            for (var i = 0, len = list.length; i < len; i += 1) {
                                this._analyze({
                                    key: '',
                                    value: list[i],
                                    record: i,
                                    index: i
                                }, {
                                    resultMap: resultMap,
                                    results: results,
                                    tokenSearchers: tokenSearchers,
                                    fullSearcher: fullSearcher
                                });
                            }

                            return { weights: null, results: results };
                        }

                        // Otherwise, the first item is an Object (hopefully), and thus the searching
                        // is done on the values of the keys of each item.
                        var weights = {};
                        for (var _i = 0, _len = list.length; _i < _len; _i += 1) {
                            var item = list[_i];
                            // Iterate over every key
                            for (var j = 0, keysLen = this.options.keys.length; j < keysLen; j += 1) {
                                var key = this.options.keys[j];
                                if (typeof key !== 'string') {
                                    weights[key.name] = {
                                        weight: 1 - key.weight || 1
                                    };
                                    if (key.weight <= 0 || key.weight > 1) {
                                        throw new Error('Key weight has to be > 0 and <= 1');
                                    }
                                    key = key.name;
                                } else {
                                    weights[key] = {
                                        weight: 1
                                    };
                                }

                                this._analyze({
                                    key: key,
                                    value: this.options.getFn(item, key),
                                    record: item,
                                    index: _i
                                }, {
                                    resultMap: resultMap,
                                    results: results,
                                    tokenSearchers: tokenSearchers,
                                    fullSearcher: fullSearcher
                                });
                            }
                        }

                        return { weights: weights, results: results };
                    }
                }, {
                    key: '_analyze',
                    value: function _analyze(_ref2, _ref3) {
                        var key = _ref2.key,
                            _ref2$arrayIndex = _ref2.arrayIndex,
                            arrayIndex = _ref2$arrayIndex === undefined ? -1 : _ref2$arrayIndex,
                            value = _ref2.value,
                            record = _ref2.record,
                            index = _ref2.index;
                        var _ref3$tokenSearchers = _ref3.tokenSearchers,
                            tokenSearchers = _ref3$tokenSearchers === undefined ? [] : _ref3$tokenSearchers,
                            _ref3$fullSearcher = _ref3.fullSearcher,
                            fullSearcher = _ref3$fullSearcher === undefined ? [] : _ref3$fullSearcher,
                            _ref3$resultMap = _ref3.resultMap,
                            resultMap = _ref3$resultMap === undefined ? {} : _ref3$resultMap,
                            _ref3$results = _ref3.results,
                            results = _ref3$results === undefined ? [] : _ref3$results;

                        // Check if the texvaluet can be searched
                        if (value === undefined || value === null) {
                            return;
                        }

                        var exists = false;
                        var averageScore = -1;
                        var numTextMatches = 0;

                        if (typeof value === 'string') {
                            this._log('\nKey: ' + (key === '' ? '-' : key));

                            var mainSearchResult = fullSearcher.search(value);
                            this._log('Full text: "' + value + '", score: ' + mainSearchResult.score);

                            if (this.options.tokenize) {
                                var words = value.split(this.options.tokenSeparator);
                                var scores = [];

                                for (var i = 0; i < tokenSearchers.length; i += 1) {
                                    var tokenSearcher = tokenSearchers[i];

                                    this._log('\nPattern: "' + tokenSearcher.pattern + '"');

                                    // let tokenScores = []
                                    var hasMatchInText = false;

                                    for (var j = 0; j < words.length; j += 1) {
                                        var word = words[j];
                                        var tokenSearchResult = tokenSearcher.search(word);
                                        var obj = {};
                                        if (tokenSearchResult.isMatch) {
                                            obj[word] = tokenSearchResult.score;
                                            exists = true;
                                            hasMatchInText = true;
                                            scores.push(tokenSearchResult.score);
                                        } else {
                                            obj[word] = 1;
                                            if (!this.options.matchAllTokens) {
                                                scores.push(1);
                                            }
                                        }
                                        this._log('Token: "' + word + '", score: ' + obj[word]);
                                        // tokenScores.push(obj)
                                    }

                                    if (hasMatchInText) {
                                        numTextMatches += 1;
                                    }
                                }

                                averageScore = scores[0];
                                var scoresLen = scores.length;
                                for (var _i2 = 1; _i2 < scoresLen; _i2 += 1) {
                                    averageScore += scores[_i2];
                                }
                                averageScore = averageScore / scoresLen;

                                this._log('Token score average:', averageScore);
                            }

                            var finalScore = mainSearchResult.score;
                            if (averageScore > -1) {
                                finalScore = (finalScore + averageScore) / 2;
                            }

                            this._log('Score average:', finalScore);

                            var checkTextMatches = this.options.tokenize && this.options.matchAllTokens ? numTextMatches >= tokenSearchers.length : true;

                            this._log('\nCheck Matches: ' + checkTextMatches);

                            // If a match is found, add the item to <rawResults>, including its score
                            if ((exists || mainSearchResult.isMatch) && checkTextMatches) {
                                // Check if the item already exists in our results
                                var existingResult = resultMap[index];
                                if (existingResult) {
                                    // Use the lowest score
                                    // existingResult.score, bitapResult.score
                                    existingResult.output.push({
                                        key: key,
                                        arrayIndex: arrayIndex,
                                        value: value,
                                        score: finalScore,
                                        matchedIndices: mainSearchResult.matchedIndices
                                    });
                                } else {
                                    // Add it to the raw result list
                                    resultMap[index] = {
                                        item: record,
                                        output: [{
                                            key: key,
                                            arrayIndex: arrayIndex,
                                            value: value,
                                            score: finalScore,
                                            matchedIndices: mainSearchResult.matchedIndices
                                        }]
                                    };

                                    results.push(resultMap[index]);
                                }
                            }
                        } else if (isArray(value)) {
                            for (var _i3 = 0, len = value.length; _i3 < len; _i3 += 1) {
                                this._analyze({
                                    key: key,
                                    arrayIndex: _i3,
                                    value: value[_i3],
                                    record: record,
                                    index: index
                                }, {
                                    resultMap: resultMap,
                                    results: results,
                                    tokenSearchers: tokenSearchers,
                                    fullSearcher: fullSearcher
                                });
                            }
                        }
                    }
                }, {
                    key: '_computeScore',
                    value: function _computeScore(weights, results) {
                        this._log('\n\nComputing score:\n');

                        for (var i = 0, len = results.length; i < len; i += 1) {
                            var output = results[i].output;
                            var scoreLen = output.length;

                            var totalScore = 0;
                            var bestScore = 1;

                            for (var j = 0; j < scoreLen; j += 1) {
                                var score = output[j].score;
                                var weight = weights ? weights[output[j].key].weight : 1;
                                var nScore = score * weight;

                                if (weight !== 1) {
                                    bestScore = Math.min(bestScore, nScore);
                                } else {
                                    output[j].nScore = nScore;
                                    totalScore += nScore;
                                }
                            }

                            results[i].score = bestScore === 1 ? totalScore / scoreLen : bestScore;

                            this._log(results[i]);
                        }
                    }
                }, {
                    key: '_sort',
                    value: function _sort(results) {
                        this._log('\n\nSorting....');
                        results.sort(this.options.sortFn);
                    }
                }, {
                    key: '_format',
                    value: function _format(results) {
                        var finalOutput = [];

                        this._log('\n\nOutput:\n\n', JSON.stringify(results));

                        var transformers = [];

                        if (this.options.includeMatches) {
                            transformers.push(function (result, data) {
                                var output = result.output;
                                data.matches = [];

                                for (var i = 0, len = output.length; i < len; i += 1) {
                                    var item = output[i];

                                    if (item.matchedIndices.length === 0) {
                                        continue;
                                    }

                                    var obj = {
                                        indices: item.matchedIndices,
                                        value: item.value
                                    };
                                    if (item.key) {
                                        obj.key = item.key;
                                    }
                                    if (item.hasOwnProperty('arrayIndex') && item.arrayIndex > -1) {
                                        obj.arrayIndex = item.arrayIndex;
                                    }
                                    data.matches.push(obj);
                                }
                            });
                        }

                        if (this.options.includeScore) {
                            transformers.push(function (result, data) {
                                data.score = result.score;
                            });
                        }

                        for (var i = 0, len = results.length; i < len; i += 1) {
                            var result = results[i];

                            if (this.options.id) {
                                result.item = this.options.getFn(result.item, this.options.id)[0];
                            }

                            if (!transformers.length) {
                                finalOutput.push(result.item);
                                continue;
                            }

                            var data = {
                                item: result.item
                            };

                            for (var j = 0, _len2 = transformers.length; j < _len2; j += 1) {
                                transformers[j](result, data);
                            }

                            finalOutput.push(data);
                        }

                        return finalOutput;
                    }
                }, {
                    key: '_log',
                    value: function _log() {
                        if (this.options.verbose) {
                            var _console;

                            (_console = console).log.apply(_console, arguments);
                        }
                    }
                }]);

                return Fuse;
            }();

            module.exports = Fuse;

            /***/ })
        /******/ ]);
});
//# sourceMappingURL=fuse.js.map
var AllInOneMenuTemplate = '<%var chunks = ["<div class=\'cont all-in-one-toc\'><h1 class=\'heading1\'>" + localization.TableOfContents + "</h1>"],    markup;function htmlTreeBuilder(items) {    if (items.length) {        chunks.push("<ul class=\'contents contents_all-in-one\'>");    }    items.forEach(function (item) {        if (!item.hidden) {            chunks.push("<li class=\'contents__item\'>");            chunks.push("<a href=\'");            chunks.push(item.url.match(/([\\w_]+\\.htm[l]?)/i)[1]);            chunks.push("\'>");            chunks.push(item.text);            chunks.push("</a>");            if (item.children) {                htmlTreeBuilder(item.children);            }            chunks.push("</li>");        }    });    if (items.length) {        chunks.push("</ul>");    }}htmlTreeBuilder(menu);chunks.push("</div>");markup = chunks.join("");%><%= markup %>';
var AsideTemplate = '<div class="aside ">    <div class="aside__inner">        <div class="aside__search search hidden-xs hidden-sm">            <div class="search__wrapper">                <input  class="search__field js_search_text" id="serch-text"                        placeholder="<%= localization.SearchLabel %>" type="text" />                <button class="search__btn js_search" id="search-button"></button>                <button class="search__clear is-hidden js_search_clear"></button>            </div>        </div>        <div class="selector-mobile js_selector_mobile_versions"></div>        <div class="selector-mobile js_selector_mobile_langs"></div>        <div class="aside__menu js_tabs_viewport">            <div class="js-menu-content">                <div class="js_menu"></div>            </div><!--            <div id="tab-names" class="b-tab__content js-tab-content">                <div class="b-index js_index_literals"></div>            </div>-->            <div class="js-search-content js_not_default">                <div class="search-results js_search_result_wrapper"></div>            </div>        </div>    </div></div>';
var BottomLinksTemplate = '<div class="bottom-links">    <!--<div class="feedback">        <div class="feedback__heading">Feedback</div>        <div class="feedback__text">            Was this article helpful?        </div>        <div>            <button class="button" type="button">Yes</button>            <button class="button" type="button">No</button>        </div>    </div>-->    <% if ((localization.ArticleIdText && localization.ArticleIdText.trim() && serviceInfo.id) ||            (localization.LastReviewText && localization.LastReviewText.trim() && serviceInfo.reviewDate)) { %>        <div class="bottom-links__service-info">            <% if (serviceInfo.id) { %>                <%= localization.ArticleIdText %> <%= serviceInfo.id + serviceInfo.separator %>            <% } %>            <% if (serviceInfo.reviewDate) { %>                <%= localization.LastReviewText %> <%= serviceInfo.reviewDate %>            <% } %>        </div>    <% } %>    <div class="bottom-links__link">        <%= homeBtnHtml %>    </div></div>';
var ContainerTemplate = '<div class="main js_container">    <header class="header-wrapper js_header_placeholder"></header>    <div class="content js_main">        <div class="container">            <div class="row">                <div class="col-lg-4 col-md-5 col-xs-20 menu-box js_aside_placeholder"></div>                <div class="col-md-1 hidden-xs hidden-sm js_prev_btn_placeholder"></div>                <div class="col-lg-14 col-md-13 col-xs-20 js_content"></div>                <div class="col-md-1 hidden-xs hidden-sm js_next_btn_placeholder"></div>                <div class="col-lg-16 col-md-15 col-xs-20 align-flex-end">                    <footer class="js_footer_placeholder"></footer>                </div>            </div>        </div>    </div>    <aside class="mobile-search-results is-hidden g-scrollable js_scrollable js_mobile_search_result js_mobile_aside"></aside></div><div class="tooltip js_tooltip" data-id="">    <div class="tooltip__content js_tooltip_content"></div></div><% if (localization.RequestConsent && localization.CookiePolicyText && localization.CookiePolicyButton) { %>    <div class="cookie-policy js_cookie_policy">        <div class="cookie-policy__inner">            <%= localization.CookiePolicyText %>        </div>        <div class="cookie-policy__btn-wrapper">            <button type="button" class="cookie-policy__btn js_cookie_policy_btn"><%= localization.CookiePolicyButton %></button>        </div>    </div><% } %>';
var CustomStylesTemplate = '<style>    html {        color: <%= customization.ContentColorMain %>;    }    a {        color: <%= customization.LinkColor %>    }    a:hover {        color: <%= customization.LinkColorHover %>    }    a:visited {        color: <%= customization.LinkColorVisited %>    }    .page-title {        color: <%= customization.TitleColor %>;    }    /*.tablename,    .picturename,    .examplebodytext,    .examplebodytextblue2015,    .bottom-links__service-info,    .search-results__total,    .footer {        color: <%= customization.ContentColorSecondary %>;    }*/    .attentionbody,    .attentionbodytextindent,    .attentioncontinue1,    .attentioncontinue2,    .attentioncontinue3 {        color: <%= customization.AttentionBlockColor %>;    }    .warningbody,    .warningbodytextindent,    .warningcontinue1,    .warningcontinue2,    .warningcontinue3 {        color: <%= customization.WarningBlockColor %>;        border-color: <%= customization.WarningBlockBorder %>;        background: <%= customization.WarningBlockBackground %>;    }    .example-wrapper {        background: <%= customization.ExampleBlockBackground %> !important;    }    .exampleheading,    .examplebodytext,    .exampleheadingblue2015,    .examplebodytextblue2015 {        color: <%= customization.ExampleBlockColor %>;    }    mark {        background: <%= customization.SearchHighlightBackground %>;        color: <%= customization.SearchHighlightColor %>;    }    /* icons */    <% if (customization.IconsX1) { %>        .logo {            background-image: url(<%= customization.IconsX1.Logo %>);        }        .top-bar__icon_print {            background-image: url(<%= customization.IconsX1.PrintGray %>);        }        .top-bar__icon_support {            background-image: url(<%= customization.IconsX1.SupportGray %>);        }        .top-bar__icon_feedback {            background-image: url(<%= customization.IconsX1.EmailGray %>);        }        .search__btn:after {            background-image: url(<%= customization.IconsX1.SearchGray %>);        }        .header__search-btn {            background-image: url(<%= customization.IconsX1.SearchGreen %>);        }        .contents__toggle {            background-image: url(<%= customization.IconsX1.Expand %>);        }        .contents__toggle.is-toggled {            background-image: url(<%= customization.IconsX1.Collapse %>);        }        .nav-btn__link-next {            background-image: url(<%= customization.IconsX1.PathNext %>);        }        .nav-btn__link-prev {            background-image: url(<%= customization.IconsX1.PathPrev %>);        }        .hyperlinktemplate,        .namedhyperlinktemplate {            background-image: url(<%= customization.IconsX1.Externallink %>);        }        a.popuponclicktemplate:after,        a.glossaryhtmllinktemplate:after,        a.popuponclickcontexthelptemplate:after,        .expandingblocktemplate,        .expandingblocktemplatemac {            background-image: url(<%= customization.IconsX1.Expandblock %>);        }        [dir="rtl"] a.popuponclicktemplate:after,        [dir="rtl"] a.glossaryhtmllinktemplate:after,        [dir="rtl"] a.popuponclickcontexthelptemplate:after,        [dir="rtl"] .expandingblocktemplate:after,        [dir="rtl"] .expandingblocktemplatemac:after {            background-image: url(<%= customization.IconsX1.ExpandblockRtl %>);        }        .expandingblockclose:after {            background-image: url(<%= customization.IconsX1.Expandblockclose %>);        }        .header__mobile-menu-btn {            background-image: url(<%= customization.IconsX1.ContentsMobile %>);        }        .header__mobile-menu-btn.is-active {            background-image: url(<%= customization.IconsX1.GoBackGreen %>);        }    <% } %>    <% if (customization.IconsX2) { %>        @media only screen and (-webkit-min-device-pixel-ratio: 1.5) {            .logo {                background-image: url(<%= customization.IconsX2.Logo %>);            }            .top-bar__icon_print {                background-image: url(<%= customization.IconsX2.PrintGray %>);            }            .top-bar__icon_support {                background-image: url(<%= customization.IconsX2.SupportGray %>);            }            .top-bar__icon_feedback {                background-image: url(<%= customization.IconsX2.EmailGray %>);            }            .search__btn:after {                background-image: url(<%= customization.IconsX2.SearchGray %>);            }            .header__search-btn {                background-image: url(<%= customization.IconsX2.SearchGreen %>);            }            .contents__toggle {                background-image: url(<%= customization.IconsX2.Expand %>);            }            .contents__toggle.is-toggled {                background-image: url(<%= customization.IconsX2.Collapse %>);            }            .nav-btn__link-next {                background-image: url(<%= customization.IconsX2.PathNext %>);            }            .nav-btn__link-prev {                background-image: url(<%= customization.IconsX2.PathPrev %>);            }            .hyperlinktemplate,            .namedhyperlinktemplate {                background-image: url(<%= customization.IconsX2.Externallink %>);            }            a.popuponclicktemplate:after,            a.glossaryhtmllinktemplate:after,            a.popuponclickcontexthelptemplate:after,            .expandingblocktemplate,            .expandingblocktemplatemac {                background-image: url(<%= customization.IconsX2.Expandblock %>);            }            [dir="rtl"] a.popuponclicktemplate:after,            [dir="rtl"] a.glossaryhtmllinktemplate:after,            [dir="rtl"] a.popuponclickcontexthelptemplate:after,            [dir="rtl"] .expandingblocktemplate:after,            [dir="rtl"] .expandingblocktemplatemac:after {                background-image: url(<%= customization.IconsX2.ExpandblockRtl %>);            }            .expandingblockclose:after {                background-image: url(<%= customization.IconsX2.Expandblockclose %>);            }            .header__mobile-menu-btn {                background-image: url(<%= customization.IconsX2.ContentsMobile %>);            }            .header__mobile-menu-btn.is-active {                background-image: url(<%= customization.IconsX2.GoBackGreen %>);            }        }    <% } %></style>';
var FooterTemplate = '<div class="footer footer_inner">    <!--<div class="container">-->        <div class="row">            <div class="col-xs-20">                <div class="footer__divider"></div>            </div>            <div class="col-md-10 col-xs-20">                <div class="footer__text">                    <%= localization.FooterCopyrightText %>                </div>            </div>            <div class="col-md-10 col-xs-20">                <div class="footer__links">                    <% if ( localization.FooterPrivacyPolicyLink && localization.FooterPrivacyPolicyLink.trim() &&                            localization.FooterPrivacyPolicyText && localization.FooterPrivacyPolicyText.trim() &&                            (!customization.FooterPrivacyPolicyLink || !customization.FooterPrivacyPolicyLink.Hidden)) { %>                        <span class="footer__links-item">                            <% if (customization.FooterPrivacyPolicyLink && customization.FooterPrivacyPolicyLink.Disabled) { %>                                <span class="footer__link">                                    <%= localization.FooterPrivacyPolicyText %>                                </span>                            <% } else { %>                                <a class="footer__link" target="blank" href="<%= localization.FooterPrivacyPolicyLink %>">                                    <%= localization.FooterPrivacyPolicyText %>                                </a>                            <% } %>                        </span>                    <% } %>                    <% if ( localization.FooterLegalText && localization.FooterLegalText.trim() &&                            (!customization.FooterLegalLink || !customization.FooterLegalLink.Hidden)) { %>                        <span class="footer__links-item">                            <% if (customization.FooterLegalLink && customization.FooterLegalLink.Disabled) { %>                                <span class="footer__link">                                    <%= localization.FooterLegalText %>                                </span>                            <% } else { %>                                <a href="javascript: void(0);" onclick="javascript: Cookiebot.renew()">                                    <%= localization.FooterLegalText %>                                </a>                            <% } %>                        </span>                    <% } %>                </div>            </div>        </div>    <!--</div>--></div>';
var HeaderTemplate = '<div class="header header_inner-help">    <div class="container">        <div class="row">            <div class="col-md-10 col-xs-20">                <button class="header__mobile-menu-btn js_burger" type="button"></button>                <div class="header__title hidden-xs hidden-sm">                    <% if ((!customization.HeaderLogoLink || !customization.HeaderLogoLink.Hidden) && localization.HeaderTitle) { %>                        <% if ((customization.HeaderLogoLink && customization.HeaderLogoLink.Disabled) || isOffline) { %>                    <span class="header__title-link">                        <% } else { %>                        <a href="<%= localization.HeaderLogoLink %>" class="header__title-link">                            <% } %>                            <% var index = localization.HeaderTitle.indexOf(" ") %>                            <%= localization.HeaderTitle.slice(0, index) %>                            <div class="header__title-big header__title-big_inner-help">                                <%= localization.HeaderTitle.slice(index, localization.HeaderTitle.length) %>                            </div>                            <%= (customization.HeaderLogoLink && customization.HeaderLogoLink.Disabled) ? "</span>" : "</a>" %>                            <% } %>                </div>                <div class="header__title header__title_product"><%= titlePreffix %> <%= title %></div>                <div class="header__search">                    <button class="header__search-btn js_mobile_search_button" type="button"></button>                    <input type="search" class="header__search-input is-hidden js_mobile_search_input"                           placeholder="<%= localization.SearchPlaceholder %>"/>                    <button class="header__clear-btn is-hidden js_mobile_search_clear" type="button"></button>                </div>            </div>            <div class="col-md-10 hidden-xs hidden-sm">                <div class="header__logo">                    <% if (!customization.FooterLogoLink || !customization.FooterLogoLink.Hidden) { %>                        <% if (customization.FooterLogoLink && customization.FooterLogoLink.Disabled) { %>                            <span class="logo"></span>                        <% } else { %>                            <a href="<%= localization.FooterLogoLink %>" class="logo"                               title="<%= localization.FooterLogoTitle %>"></a>                        <% } %>                    <% } %>                </div>            </div>        </div>    </div></div><div class="top-bar hidden-xs hidden-sm">    <div class="container">        <div class="row">            <div class="col-lg-5 col-md-6">                <div class="top-bar__product-box">                    <div class="top-bar__product js_product_logo"></div>                    <h1 class="top-bar__title js_title">                        <% if (titlePreffix && titlePreffix.trim() ) { %>                            <span class="top-bar__title-small"><%= titlePreffix %></span>                        <% } %>                        <%= title %>                    </h1>                </div>            </div>            <div class="col-lg-15 col-md-14">                <div class="top-bar__links-box">                    <div class="top-bar__links">                        <% if ( localization.PrintButtonText && localization.PrintButtonText.trim() && !customization.PrintButtonHidden) { %>                            <% if (isAllInOne) { %>                                <a class="top-bar__link top-bar__link_print" href="javascript:print();">                                    <span class="top-bar__icon top-bar__icon_print"></span><%= localization.PrintButtonText %>                                </a>                            <% } else { %>                                <div class="dropdown js_dropdown">                                    <a class="top-bar__link top-bar__link_print js_dropdown_btn" href="#">                                        <span class="top-bar__icon top-bar__icon_print"></span><%= localization.PrintButtonText %>                                        <span class="top-bar__triangle"></span>                                    </a>                                    <ul class="dropdown__list js_dropdown_list">                                        <li class="dropdown__item">                                            <a class="dropdown__link" href="javascript:print();">                                                <%= localization.PrintPageText %>                                            </a>                                        </li>                                        <li class="dropdown__item">                                            <a class="dropdown__link js_print_section" href=""                                               target="_blank" rel="noopener noreferrer">                                                <%= localization.PrintSectionText %>                                            </a>                                        </li>                                        <li class="dropdown__item">                                            <a class="dropdown__link js_print_all"                                               href="<%= isMacProject ? "pgs/" : "" %>all-in-one.htm"                                               target="_blank" rel="noopener noreferrer">                                                <%= localization.PrintAllText %>                                            </a>                                        </li>                                    </ul>                                </div>                            <% } %>                        <% } %>                        <% if ( localization.SupportButtonText && localization.SupportButtonText.trim() &&                                localization.SupportButtonLink && localization.SupportButtonLink.trim() &&                                (!customization.SupportButtonLink || !customization.SupportButtonLink.Hidden)) { %>                            <% if (customization.SupportButtonLink && customization.SupportButtonLink.Disabled) { %>                                <span class="top-bar__link top-bar__link_support">                                    <span class="top-bar__icon top-bar__icon_support"></span><%= localization.SupportButtonText %>                                </span>                            <% } else { %>                                <a class="top-bar__link top-bar__link_support"                                   href="<%= localization.SupportButtonLink %>" target="blank">                                    <span class="top-bar__icon top-bar__icon_support"></span><%= localization.SupportButtonText %>                                </a>                            <% } %>                        <% } %>                        <% if ( localization.SendLinkButtonText && localization.SendLinkButtonText.trim() &&                                (!customization.SendLinkButton || !customization.SendLinkButton.Hidden)) { %>                            <% if (customization.SendLinkButton && customization.SendLinkButton.Disabled) { %>                                <span class="top-bar__link top-bar__link_feedback">                                    <span class="top-bar__icon top-bar__icon_feedback"></span><%= localization.SendLinkButtonText %>                                </span>                            <% } else { %>                                <a class="top-bar__link top-bar__link_feedback js_feedback_link" href="">                                    <span class="top-bar__icon top-bar__icon_feedback"></span><%= localization.SendLinkButtonText %>                                </a>                            <% } %>                        <% } %>                        <% if (pdfOptions && pdfOptions.pdfName && pdfOptions.pdfName.trim()){ %>                            <% if (localization.SaveAsPdfButtonText && localization.SaveAsPdfButtonText.trim() &&                                    (!customization.SaveAsPdfButton || !customization.SaveAsPdfButton.Hidden)) { %>                                <% if (customization.SaveAsPdfButton && customization.SaveAsPdfButton.Disabled) { %>                                    <span class="top-bar__link top-bar__link_pdf">                                    <span class="top-bar__icon top-bar__icon_save-as-pdf"></span><%= localization.SaveAsPdfButtonText %>                                </span>                                <% } else { %>                                    <a class="top-bar__link top-bar__link_pdf js_pdf_link" href="<%=pdfOptions.pdfName.trim()%>">                                        <span class="top-bar__icon top-bar__icon_save-as-pdf"></span><%= localization.SaveAsPdfButtonText %>                                    </a>                                <% } %>                                                            <% } %>                                                    <% } %>                    </div>                    <% if (!customization.HideLangsSelector) { %>                        <div class="top-bar__langs">                            <span class="top-bar__versions js_header_versions_list"></span>                            <span class="js_header_lang_list"></span>                        </div>                    <% } %>                </div>            </div>        </div>    </div></div>';
var IndexLiteralsTemplate = '<ul class="b-index__list"><%    var result,        html = [];    for (var i= 0, item; i < index.length; i++ ) {        item = index[i];        if ( item.nested) {            html.push( "<li class=\'b-index__item js_menu_item b-index__item--nested\'>" );        } else {            html.push( "<li class=\'b-index__item js_menu_item\'>" );        }        if ( item["class"] === "indexlink" ) {            html.push( "<a class=\'b-index__link js_menu_link\' href=\'");            html.push( item.href );            html.push( "\'>" );            html.push( item.text );            html.push( "</a>" )        } else if ( item["class"] === "indexheading" ) {            html.push( "<span class=\'b-index__header\'>" );            html.push( item.text );            html.push( "</span>" )        } else {            html.push( "<span class=\'b-index__subheader\'>" );            html.push( item.text );            html.push( "</span>" )        }        html.push( "</li>" );    }    result = html.join("");%><%= result %></ul>';
var LangListTemplate = '<div class="dropdown dropdown_right js_dropdown">    <a class="dropdown__btn js_dropdown_btn">        <%= currentLang.name %>        <span class="dropdown__arrow"></span>    </a>    <ul class="dropdown__list js_dropdown_list">        <% _.each( langs, function( lang ) {%>            <% var dir = lang.dirname || lang.id %>            <% if (lang.id !== currentLang.id ) { %>                <li class="dropdown__item">                    <% if ( isMac ) { %>                        <a class="dropdown__link js_lang_item" data-lang-id="<%= dir %>" href="../../<%= dir %>/pgs">                            <%= lang.name %>                        </a>                    <% } else { %>                        <a class="dropdown__link js_lang_item" data-lang-id="<%= dir %>" href="../<%= dir %>">                            <%= lang.name %>                        </a>                    <% } %>                </li>            <% } %>        <% }) %>    </ul></div>';
var MenuTemplate = '<%var chunks = [],    isMac = isMacProject,    markup;function htmlTreeBuilder( items, opened ) {    if (items.length) {        chunks.push( "<ul class=\'contents js_contents_level\'" );        chunks.push( !opened ? " style=\'display:none\' ": "" );        chunks.push( ">" );    }    for (var i = 0, item; i < items.length; i++) {        item = items[i];        if ( !item.hidden ) {            if ( item.isActive ) {                chunks.push( "<li class=\'contents__item js_menu_item is-active\'>" );            } else {                chunks.push( "<li class=\'contents__item js_menu_item\'>" );            }            if ( item.children ) {                chunks.push( "<button class=\'contents__toggle js_contents_toggle" );                chunks.push( item.childIsActive || item.isActive ? " is-toggled" : "" );                chunks.push( "\' href=\'#\'></button>" );            }            chunks.push( "<a class=\'contents__item-link js_menu_link\' href=\'" );            chunks.push( (isMac ? "index.htm#" : "") + item.url );            chunks.push( "\'>" );            chunks.push( item.text );            chunks.push( "</a>" );            if ( item.children ) {                htmlTreeBuilder( item.children, item.childIsActive || item.isActive );            }        }    }    if (items.length) {        chunks.push( "</ul>" );    }}htmlTreeBuilder( menu, true );markup = chunks.join("");%><%= markup %>';
var MobileSearchResultsTemplate = '<%if (!isInit){%>    <div class="mobile-search-results__total">        <% if ( resultsCount > 0) { %>            <%= localization.FoundTextBegin %> <%= resultsCount %> <%= localization.FoundTextEnd %>        <% } else { %>            <%= localization.NothingFoundText %>        <%}%>    </div>    <div class="mobile-search-results__content">        <%if ( found ){%>            <ul class="mobile-search-results__list">                <%_.each(results, function( page ){%>                    <li class="mobile-search-result">                        <% var link = isMacProject ? "index.htm#" + page.link : page.link %>                        <a class="mobile-search-result__title" href="<%= link %>"><%= page.title %></a>                        <%_.each( page.texts, function( text ){%>                            <p class="mobile-search-result__content"><%= text %></p>                        <%})%>                    </li>                <%})%>            </ul>        <%}%>    </div><%}%>';
var NextLinkTemplate = '<div class="nav-btn">    <% if (nextPage && nextPage.url) { %>        <% var link = isMacProject ? "index.htm#" + nextPage.url : nextPage.url %>        <a class="nav-btn__link-next js_next_link"           href="<%= link %>"           title="<%= nextPage.text %>"></a>    <% } else { %>        <span class="nav-btn__link-next-inactive"></span>    <% } %></div>';
var PageTitleTemplate = '<div class="page-title">    <div class="page-title__text">        <%= titleHtml %>    </div></div>';
var PrevLinkTemplate = '<div class="nav-btn">    <% if (prevPage && prevPage.url) { %>        <% var link = isMacProject ? "index.htm#" + prevPage.url : prevPage.url %>        <a class="nav-btn__link-prev js_prev_link"           href="<%= link %>"           title="<%= prevPage.text %>"></a>    <% } else { %>        <span class="nav-btn__link-prev-inactive"></span>    <% } %></div>';
var SearchResultsTemplate = '<%if (!isInit){%>    <div class="search-results__header">        <div class="search-results__total">            <%= localization.FoundTextBegin %> <%= resultsCount %> <%= localization.FoundTextEnd %>        </div>    </div>    <%if ( found ){%>        <div class="search-results__content">            <ul class="search-results__list">                <%_.each(results, function( page ){%>                    <li class="search-result">                        <% var link = isMacProject ? "index.htm#" + page.link : page.link %>                        <a class="search-result__title" href="<%= link %>"><%= page.title %></a>                        <%_.each( page.texts, function( text ){%>                            <p class="search-result__content"><%= text %></p>                        <%})%>                    </li>                <%})%>            </ul>        </div>    <%}%><%}%>';
var VersionsTemplate = '<div class="dropdown dropdown_right js_dropdown">    <a class="dropdown__btn js_dropdown_btn">        <%= currentVersion.label %>        <span class="dropdown__arrow"></span>    </a>    <ul class="dropdown__list js_dropdown_list">        <% _.each(versions, function(version)  {%>            <% if (version.url !== currentVersion.url) { %>                <li class="dropdown__item">                    <a class="dropdown__link js_version_item"                       data-version-url="<%= version.url %>" href="../../<%= version.url %>">                        <%= version.label %>                    </a>                </li>            <% } %>        <% }) %>    </ul></div>';
var LangsLocalization = {"en-US":"English","id-ID":"Bahasa Indonesia","cs-CZ":"Čeština &#x202A;(Česká republika)","da-DK":"Dansk &#x202A;(Danmark)","de-DE":"Deutsch","et-EE":"Eesti","es-ES":"Español &#x202A;(España)","es-MX":"Español &#x202A;(México)","fr-CA":"Français &#x202A;(Canadien)","fr-FR":"Français","it-IT":"Italiano","lv-LV":"Latviešu","lt-LT":"Lietuvių","hu-HU":"Magyar &#x202A;(Magyarország)","nl-NL":"Nederlands &#x202A;(Nederland)","nb-NO":"Norsk, bokmål &#x202A;(Norge)","pl-PL":"Polski &#x202A;(Polska)","pt-BR":"Português &#x202A;(Brasil)","pt-PT":"Português &#x202A;(Portugal)","ro-RO":"Română &#x202A;(România)","sr-Latn":"Srpski","fi-FI":"Suomi &#x202A;(Suomi)","sv-SE":"Svenska &#x202A;(Sverige)","vi-VN":"Tiếng Việt &#x202A;(Việt Nam)","tr-TR":"Türkçe &#x202A;(Türkiye)","el-GR":"Ελληνικά &#x202A;(Ελλάδα)","bg-BG":"Български","kk-KZ":"Қазақ","ru-RU":"Русский","sr-Cyrl":"Српски","uk-UA":"Українська","ar-AE":"العربية (الإمارات العربية المتحدة&#x202B;)","fa-IR":"فارسى (ایران&#x202B;)","hi-IN":"हिंदी &#x202A;(भारत)","th-TH":"ไทย &#x202A;(ไทย)","ko-KR":"한국어 &#x202A;(대한민국)","ja-JP":"日本語&#x202A;(日本)","zh-Hans":"简体中文","zh-Hant":"繁體中文","zh-Hant-TW":"繁體中文(台灣)","zh-Hant-HK":"繁體中文(香港)"};
var Page=new Array();
Page.push(new Array("Использование Kaspersky Scan Engine GUI","В этом разделе описан пользовательский графический интерфейс (GUI), предоставляемый Kaspersky Scan Engine.","В зависимости от роли пользователь Kaspersky Scan Engine GUI может выполнять следующие действия:","Изменять настройки Kaspersky Scan Engine.","Следить за работой Kaspersky Scan Engine.","Просматривать служебные события и события с результатами сканирования.","Сохранять служебные события и события с результатами сканирования в файл."," Использование Kaspersky Scan Engine GUI ","179683.htm"));
Page.push(new Array("Логирование","Этот раздел содержит информацию о том, как настроить и включить логирование Kaspersky Scan Engine."," Логирование ","179684.htm"));
Page.push(new Array("Лицензирование","Этот раздел содержит информацию о том, как активировать Kaspersky Scan Engine.","Режимы лицензирования","Kaspersky Scan Engine поддерживает следующие режимы лицензирования:","Режим лицензирования оффлайн\nВ этом режиме система лицензирования Kaspersky Scan Engine использует файл ключа для активации Kaspersky Scan Engine. \nВам не нужно подключение к интернету, чтобы использовать этот режим. Однако необходимо регулярно обновлять файл ключа, чтобы избежать лицензионных ограничений. ","Режим лицензирования онлайн\nВ этом режиме система лицензирования Kaspersky Scan Engine использует код активации. \nДля использования этого режима у вас должно быть стабильное подключение к интернету. При необходимости Kaspersky Scan Engine подключится к серверам \"Лаборатории Касперского\" и автоматически обновит код активации.  "," Лицензирование ","179686.htm"));
Page.push(new Array("Вход в Kaspersky Scan Engine","При попытке получить доступ к Kaspersky Scan Engine GUI отображается страница аутентификации. Вы не можете пользоваться Kaspersky Scan Engine GUI без авторизации.","Внизу страницы вы можете найти текущую версию Kaspersky Scan Engine.","Страница аутентификации","На странице аутентификации вам необходимо указать имя пользователя и пароль и нажать Sign in. После авторизации откроется панель управления Kaspersky Scan Engine.","После установки Kaspersky Scan Engine создается предварительно заданная учетная запись admin. Пароль по умолчанию для этой учетной записи – KAVAdmin!1. Мы рекомендуем вам сменить пароль после первого входа в систему. Если вы изменили исходный пароль и забыли его, вы можете сбросить его до пароля по умолчанию.","После неактивности в течение 2 часов сессия закрывается, и вам нужно снова войти в систему, чтобы продолжить пользоваться Kaspersky Scan Engine GUI.","После нескольких неудачных попыток входа в учетную запись Kaspersky Scan Engine временно блокирует ее. Чтобы получить доступ к заблокированной учетной записи, обратитесь к администратору и попросите сбросить пароль."," Вход в Kaspersky Scan Engine ","179694.htm"));
Page.push(new Array("Панель управления Kaspersky Scan Engine","В этом разделе описана панель управления Kaspersky Scan Engine. Она открывается, когда вы нажимаете Dashboard в Kaspersky Scan Engine GUI.","Вся информация отображается в часовом формате UTC. Вы можете переключиться на местное время на странице User.","Панель управления Kaspersky Scan Engine","На панели управления Kaspersky Scan Engine отображается следующая информация.","Информация о Kaspersky Scan Engine:","Текущее состояние Kaspersky Scan Engine.\n\n\nОтображается, работает ли Kaspersky Anti-Virus Engine. ","Результат инициализации Kaspersky Anti-Virus Engine.\n\n\nЭтот результат отображается, если инициализация Kaspersky Anti-Virus Engine завершилась неудачно. ","Версия KAV SDK.","Имя хоста компьютера, на котором был инициализирован Kaspersky Scan Engine.","Информация о лицензии:","Информация об используемом лицензионном ключе или коде активации:","Лицензионный ключ или код активации действителен.","Срок действия лицензионного ключа или кода активации скоро истечет. Обратитесь к своему техническому специалисту по работе с клиентами, чтобы приобрести новый лицензионный ключ или получить новый код активации.","Срок действия лицензионного ключа или кода активации истек. Замените текущий лицензионный ключ или код активации новым.","Срок действия лицензии.","Информация об антивирусных базах:","Дата последнего обновления антивирусных баз.","Результат последней попытки обновления антивирусных баз.","Версия антивирусных баз.","Текущее состояние антивирусных баз.","Отображается одно из следующих состояний антивирусных баз:","Базы обновлены.","Устарели. Необходимо запустить обновление баз.","Базы критически устарели. Необходимо как можно скорее проверить интернет-подключение и запустить обновление антивирусных баз.","Информация о KSN:","Текущий статус KSN (доступен ли KSN-сервер, на который Kaspersky Scan Engine передает данные).","Дата последнего обновления KSN.","Эта информация отображается, только если включен KSN.","Эта информация обновляется каждые несколько секунд.","На панели управления Kaspersky Scan Engine также есть таблица со служебными событиями. В таблицу включена следующая информация о каждом событии:","Date — дата и время события.","Hostname — имя хоста компьютера, на котором работает Kaspersky Scan Engine.","Initiator — инициатор события.\nЕсли вы обновили Kaspersky Scan Engine с версии 2.0 до более новой, в столбце Initiator не будет отображаться информация об инициаторе событий, произошедших до обновления. ","Module — модуль Kaspersky Scan Engine, обработавший событие.","Severity — уровень критичности события. Чем выше уровень, тем важнее событие. ","Details — дополнительная информация о событии.","Первоначальный вид таблицы содержит до 50 последних служебных событий. Вы можете прокрутить ее вниз, чтобы просмотреть другие служебные события. В таблице вы можете сделать следующее:","Выбрать период времени, в течение которого будут собираться результаты сканирования и отображаться в таблице.","Выбранный вами период времени будет сохраняться после обновления веб-страницы.","Задать фильтр для отображения данных.","Вы можете выбрать один или несколько модулей для передачи событий:","Updater\n\n\n\n\nСобытия этого модуля связаны с обновлением антивирусных баз. ","Licensing\n\n\n\n\nСобытия из этого модуля связаны с лицензированием. ","Scan engine\n\n\n\n\nСобытия из этого модуля связаны с ошибками, возникшими при сканировании объектов. ","Service\n\n\n\n\nСобытия из этого модуля могут поступать либо от HTTP Daemon, либо от плагина ICAP. ","Audit\n\n\n\n\nСобытия из этого модуля связаны с функционалом аудита системы. ","Вы можете выбрать одно или несколько имен хостов компьютеров, на которых экземпляры Kaspersky Scan Engine собирают служебные события.","Вы также можете указать критичность отображаемых событий.","Установленный вами фильтр будет сохраняться после обновления веб-страницы.","Сохраните содержимое таблицы в файл, нажав кнопку Export.","Обновите содержимое таблицы вручную, нажав кнопку Refresh.","На панели управления Kaspersky Scan Engine также есть несколько кнопок, с помощью которых вы можете сделать следующее:","Restart — перезапустить Kaspersky Scan Engine.","Update — запустить обновление антивирусных баз.","Update from scratch","– загрузка антивирусных баз с нуля.","Это происходит следующим образом:","Kaspersky Scan Engine останавливает работу.","Антивирусные базы удаляются.","Антивирусные базы загружаются с сервера обновлений.","Kaspersky Scan Engine возобновляет работу.","Change — перейти к форме, позволяющей изменить файл ключа или код активации (кнопка появляется, когда срок действия лицензии истек)."," Панель управления Kaspersky Scan Engine ","179695.htm"));
Page.push(new Array("Страница результатов сканирования Kaspersky Scan Engine (Scan results)","На странице Scan results отображается информация о событиях с результатами проверки, сгенерированными Kaspersky Scan Engine.","Вся информация отображается в часовом формате UTC. Вы можете переключиться на местное время на странице User.","На странице Scan results есть следующие таблицы:","Таблица со статистикой об объектах, проверенных всеми экземплярами Kaspersky Scan Engine в кластере.","Таблица со статистикой об объектах, проверенных текущим экземпляром Kaspersky Scan Engine.","В обеих таблицах отображается следующая информация:","Total — количество объектов, просканированных Kaspersky Scan Engine.","Detections / Total — соотношение между обнаруженными объектами и всеми проверенными объектами.","Malware — количество объектов, определенных как вредоносные.","Adware, etc. — количество объектов, определенных как легальная программа, которая может быть использована злоумышленниками для повреждения компьютеров или данных","Clean — количество безопасных объектов.","Таблица с результатами сканирования для каждого объекта, проверенного Kaspersky Anti-Virus Engine.","Будет отображаться следующая информация:","Date — дата и время получения результата сканирования.","Hostname — имя хоста компьютера, на котором Kaspersky Scan Engine выполнял сканирование.","Client — IP-адрес клиента HTTP или ICAP, отправившего объект на проверку.","Danger level () — уровень опасности проверяемого объекта.","Info — имя отсканированного файла или URL-адрес.","Scan result","— категория проверяемого объекта:","Название угрозы или легальной программы, которая может быть использована злоумышленниками.","Action — обнаружено действие, выполненное после обнаружения угрозы или легальной программы, которая может быть использована злоумышленниками:","Disinfected — проверенный объект вылечен.","Deleted — проверенный объект удален.","Skipped — проверенный объект пропущен.","Эта информация отображается, если Kaspersky Scan Engine работает в режиме HTTP, проверяемый объект не является URL-адресом и вы не выбрали \"Skip\" в параметре \"Action on detected objects setting\" на странице настроек сканирования.","Details","— дополнительная информация о проверяемом объекте:","Версия антивирусных баз Kaspersky Scan Engine. ","MD5-хеш проверяемого объекта (если файл проверялся).","SHA256-хеш проверяемого объекта (если файл проверялся).","Вы можете сделать следующее:","Выбрать период времени, в течение которого будут собираться результаты сканирования и отображаться в таблице.","Для этого нажмите на ссылку Date.","Этот параметр сохраняется и не сбрасывается до значения по умолчанию при обновлении страницы.","Задать фильтр для отображения данных.","Для этого нажмите на значок Danger level ().","Выберите типы объектов, которые вы хотите отобразить, установив соответствующие флажки:","Безопасные объекты (Clean).","Объекты высокого уровня опасности (High).","Объекты среднего уровня опасности (Medium).","Объекты низкого уровня опасности (Low).","Этот параметр сохраняется и не сбрасывается до значения по умолчанию при обновлении страницы.","Выберите, какие имена хостов будут отображаться.","Для этого нажмите на ссылку Hostname.","Нажмите кнопку Export, чтобы сохранить содержимое таблицы в файл.","Нажмите кнопку Refresh, чтобы обновить содержимое таблицы вручную.","Первоначальный вид таблицы содержит до 50 последних результатов сканирования. Вы можете прокрутить ее вниз, чтобы просмотреть другие результаты сканирования.","В правом верхнем углу страницы Scan results вы можете нажать кнопку Reset statistics, чтобы очистить статистику служебных событий и событий с результатами проверки."," Страница результатов сканирования Kaspersky Scan Engine (Scan results) ","179696.htm"));
Page.push(new Array("Страницы настроек Kaspersky Scan Engine (Settings)","В этом разделе описаны веб-страницы, содержащие параметры Kaspersky Scan Engine разных типов.","Если вы измените какие-либо настройки на странице Settings при использовании определенного профиля настроек в текущем экземпляре Kaspersky Scan Engine, вам будет предложено прекратить использование этого профиля настроек для этого экземпляра. Если вы согласны, экземпляр будет использовать свои собственные пользовательские настройки, а имя профиля настроек или настроек для этого экземпляра будет отображаться как Custom в таблице Hosts. Это касается большинства изменений на странице Settings, за исключением изменений в разделах License и Password, а также в настройках подключения в разделе Service."," Страницы настроек Kaspersky Scan Engine (Settings) ","179697.htm"));
Page.push(new Array("Настройки службы (Service)","В этом разделе описан раздел Service на странице Settings.","Настройки службы (Service)","Если Kaspersky Scan Engine инициализируется в режиме HTTP, вы можете указать следующие параметры:","Protocol — выберите HTTP, HTTPS или сокет домена UNIX.","Адрес, который Kaspersky Anti-Virus Engine будет использовать для получения объектов для проверки.","Это может быть либо UNIX-сокет, либо IP-адрес и порт.","Private key path — путь к файлу закрытого ключа для подключения по протоколу HTTPS (TLS).","Это может быть как абсолютный, так и относительный путь. Относительный путь рассчитывается относительно бинарного файла kavhttpd.","Вы должны указать этот параметр, если выбран протокол HTTPS.","При настройке этого параметра в таблице со служебными событиями Kaspersky Scan Engine может появиться следующее сообщение: \"our private key has a low security level. Please check the permissions for the file <path>.\" В этом случае вы должны настроить доступ к файлу закрытого ключа, чтобы только пользователь root и учетная запись пользователя, под которой запущена служба, могли иметь разрешение на чтение.","Certificate — путь к файлу сертификата для подключения по протоколу HTTPS (TLS).","Это может быть как абсолютный, так и относительный путь. Относительный путь рассчитывается относительно бинарного файла kavhttpd.","Вы должны указать этот параметр, если выбран протокол HTTPS.","Keep-alive connection — указывает, нужно ли использовать Keep-Alive.","Connection timeout — время, в течение которого неактивное соединение должно оставаться открытым (в миллисекундах) в ожидании нового запроса от HTTP-клиента.","Диапазон возможных значений от 0 до 18000. Если для этого параметра установлено значение 0, ограничение по времени для подключения отсутствует.","Maximum requests per connection — максимальное количество запросов на одно подключение до его закрытия.","Диапазон возможных значений от 0 до 1000. Если для этого параметра установлено значение 0, количество запросов на одно подключение не ограничено.","В разделе","Locations where remote scanning is allowed",", вы можете указать пути к местам, в которых разрешено сканирование, когда HTTP-клиент отправляет запросы на сканирование через TCP-сокет с удаленного компьютера. Сканирование в других местах расположения запрещено. Эти пути находятся в файловой системе компьютера, на котором установлен сервер Kaspersky Scan Engine. Ограничение области сканирования предотвращает проверку всей файловой системы сервера Kaspersky Scan Engine по команде извне.","Не рекомендуется использовать ссылки в качестве путей из соображений безопасности. Вместо этого используйте абсолютные пути.","Kaspersky Scan Engine не добавляет и не удаляет объекты в директориях, указанных в разделе Locations where remote scanning is allowed. HTTP-клиент должен отправить объекты для сканирования, а затем удалить их после сканирования.","Возможные значения:","Абсолютный путь до директории.\n\n\nЭто значение позволяет сканировать файлы, расположенные внутри этой директории и всех ее поддиректорий. \n\n\nДиректория должна быть расположена на том же компьютере, что и Kaspersky Scan Engine, или на удаленном жестком диске, который смонтирован на этом компьютере.  \n\n\nПуть должен начинаться с корневой директории файловой системы компьютера, на котором установлен Kaspersky Scan Engine. \n\n\nСлужба kavhttpd должна иметь права на чтение файлов в этой директории и всех ее поддиректориях. ","Абсолютный путь до файла.\n\n\nПозволяет сканировать определенный файл. \n\n\nФайл должен быть расположен на том же компьютере, что и Kaspersky Scan Engine, или на удаленном жестком диске, который смонтирован на этом компьютере.  \n\n\nПуть должен начинаться с корневой директории файловой системы компьютера, на котором установлен Kaspersky Scan Engine. \n\n\nСлужба kavhttpd должна иметь права на чтение этого файла. ","/ (косая черта с наклоном вправо).\n\n\nПозволяет сканировать все файлы файловой системы. ","Cross-origin resource sharing","— указывает список источников (IP-адреса или имена хостов с протоколом), которым должен быть предоставлен доступ к службе kavhttpd.","Возможные значения:","IP-адрес или имя хоста с указанием протокола. ","*\n\n\nЭто значение позволяет любому источнику получить доступ к службе kavhttpd.\n","Пустое значение.","Этот параметр хранится в элементе CORS файла конфигурации режима HTTP.","В Windows рекомендуется указывать полный путь к файлу. В частности, настоятельно рекомендуется указывать полные пути к сертификату (Certificate) и файлу ключа (Private key path).","Если Kaspersky Scan Engine инициализируется в режиме ICAP, вы можете установить следующие параметры:","Port number — указывает порт, который Kaspersky Scan Engine будет использовать, чтобы получать ICAP-запросы с содержимым для проверки.","Send code 204 — указывает, должен ли Kaspersky Anti-Virus Engine отправлять код 204.","Request mode address — адрес, который kavicapd использует для обработки запросов в режиме запроса.","Значение по умолчанию: req.","Kaspersky Scan Engine включает в URL-адрес значение параметра Request mode address, например:","icap://icap-server.example.com:1344/req","Не используйте одно и то же значение для параметров Request mode address и Response mode address.","Response mode address — адрес, который kavicapd использует для обработки запросов в режиме ответа.","Значение по умолчанию: resp.","Kaspersky Scan Engine включает в URL-адрес значение параметра Response mode address, например:","icap://icap-server.example.com:1344/resp","Keep-alive connection — указывает, нужно ли использовать Keep-Alive.","Use Keep-alive unconditionally — указывает, всегда ли Kaspersky Scan Engine использует постоянное соединение Keep-Alive, даже если клиенты ICAP не запрашивают его.","Connection timeout — время, в течение которого неактивное соединение должно оставаться открытым (в миллисекундах) в ожидании нового запроса от ICAP-клиента.","Диапазон возможных значений от 1 до 10000.","Maximum requests per connection — максимальное количество запросов на одно подключение до его закрытия.","Диапазон возможных значений от 1 до 1000.","Partial mode","— позволяет сканировать файлы целиком, но отправлять их пользователю по частям до завершения проверки.","Возможные настройки для режима отправки по частям:","Delay — указывает интервал (в секундах) между началом приема объекта и началом отправки его первого фрагмента.","Chunk size — определяет размер фрагментов объекта, передаваемых в период между началом приема объекта и окончанием проверки.","Prevent re-downloading — запрещает повторное скачивание заблокированных файлов браузером после разрыва соединения.","Maximum cache size — максимальный размер кеша в КБ для заблокированных URL-адресов.\n\n\nЭто максимальный объем ОЗУ, выделяемый для кеширования заблокированных URL-адресов. \n\n\nДиапазон возможных значений от 1 до 100000. \n\n\nЗначение по умолчанию: 5000. ","Lifetime for blocked URLs — время жизни заблокированных URL-адресов, сохраненных в кеше (в секундах).\n\n\nДиапазон возможных значений от 1 до 604800 (неделя). \n\n\nЗначение по умолчанию: 1800. ","Дополнительные заголовки:","User name HTTP header — имя HTTP-заголовка, в котором имя пользователя HTTP-клиента передается в службу ICAP.","ICAP-служба запишет это значение в журналы.","По умолчанию задано значение X-Client-Username.","IP address HTTP header — имя HTTP-заголовка, в котором IP-адрес HTTP-клиента передается в службу ICAP.","ICAP-служба запишет это значение в журналы.","По умолчанию задано значение X-Client-IP.","Detected object name HTTP header — имя поля заголовка, содержащего название обнаруженной угрозы.","ICAP-служба запишет это значение в журналы.","По умолчанию значение этого параметра пустое.","Database version name HTTP header — название поля заголовка, содержащего информацию о версии антивирусных баз, используемых Kaspersky Scan Engine для проверки объектов.","Send X-Include","— указывает, включает ли Kaspersky Scan Engine заголовок","X-Include","в свой ответ на запрос OPTIONS от ICAP-клиента. Чтобы включить отправку заголовка","X-Include",", установите один или оба следующих флажка:","Request user name HTTP header — значение, указанное в параметре User name HTTP header. Если параметр User name HTTP header пуст, флажок Request user name HTTP header будет снят.","Request IP address HTTP header — значение, указанное в параметре IP address HTTP header. Если параметр IP address HTTP header пуст, флажок Request IP address HTTP header будет снят.","Если ни один из этих элементов не выбран, Kaspersky Scan Engine не будет включать заголовок X-Include в ответы.","Send X-Infection-Found header — указывает, включает ли Kaspersky Scan Engine заголовок X-Infection-Found в свой ответ ICAP-клиенту.","По умолчанию Kaspersky Scan Engine не включает в ответы заголовок X-Infection-Found.","Send X-Violations-Found header — указывает, включает ли Kaspersky Scan Engine заголовок X-Violations-Found в свой ответ ICAP-клиенту.","По умолчанию Kaspersky Scan Engine не включает в ответы заголовок X-Violations-Found.","Send X-Response-Info header — указывает, включает ли Kaspersky Scan Engine заголовок X-Response-Info в свой ответ ICAP-клиенту.","По умолчанию Kaspersky Scan Engine не включает в ответы заголовок X-Response-Info.","Send X-Response-Desc header — указывает, включает ли Kaspersky Scan Engine заголовок X-Response-Desc в свой ответ ICAP-клиенту.","По умолчанию Kaspersky Scan Engine не включает в ответы заголовок X-Response-Desc.","Action on signal","– действие, которое должно выполняться при получении сигналов","SIGUSR1","и","SIGUSR2",".","В раскрывающихся списках SIGUSR1 signal и SIGUSR2 signal вы можете выбрать следующие действия для обоих сигналов:","Update and reload the anti-virus database — обновление и перезагрузка баз с помощью встроенного функционала Kaspersky Scan Engine. ","Reload the anti-virus database without updating — перезагрузка баз без обновления.\n\n\nПредполагается, что файлы в папке с базами уже обновлены и должны быть перезагружены. ","Close log files in syslog format, then reopen them — закрытие всех открытых файлов журналов в формате syslog и последующее их открытие для записи журналов в конец этих файлов.\n\n\nЕсли файлы отсутствуют, плагин ICAP создаст их. Этот параметр позволяет выполнять ротацию журналов с помощью утилиты logrotate в режиме по умолчанию или с использованием директивы create. ","Для любого режима вы можете указать следующие параметры в разделе Maximum values:","Sessions — максимальное количество сеансов.\nЗначение по умолчанию: 10. \nНе рекомендуется указывать значение, превышающее количество TCP-соединений, которые ваш HTTP-клиент может одновременно поддерживать с Kaspersky Scan Engine. ","Connections — максимальное количество активных TCP-соединений, которые KAV HTTP может поддерживать одновременно.\nЗначение по умолчанию: 100. ","Threads — максимальное количество потоков сканирования. Вы можете использовать до 256 таких потоков. \nЗначение по умолчанию: 8. ","Processes — максимальное количество процессов проверки. Вы можете использовать до 256 таких процессов. \nЗначение по умолчанию: 4. ","При применении новых настроек службы Kaspersky Anti-Virus Engine перезагружается."," Настройки службы (Service) ","179698.htm"));
Page.push(new Array("Настройки сканирования (Scanning)","В этом разделе описан раздел Scanning на странице Settings.","Если при загрузке веб-страницы произошла ошибка и настройки стали недоступны, перезагрузите страницу.","Раздел Scanning содержит следующие параметры:","Enable reputation checking — указывает, нужно ли использовать Kaspersky Security Network (KSN).","Если этот переключатель находится в положении Вкл. и Пользовательское соглашение с конечным пользователем (EULA) для KSN не принято, оно будет отображаться, и вы должны принять его, чтобы использовать KSN.","Enable Phishing Protection — указывает, включена или выключена защита от фишинга.","Object scan timeout — время ожидания в миллисекундах, необходимое для проверки отдельного объекта.","Heuristic analysis level","— раскрывающийся список содержит уровни эвристического анализа.","Уровень может быть одним из следующих:","Disabled","Low","Medium","High","Actions on detected objects","— выполняются после обнаружения угрозы или легальной программы, которая может быть использована злоумышленниками.","Этот параметр доступен, если Kaspersky Anti-Virus Engine инициализирован в режиме HTTP. Вы можете выбрать одно из следующих действий:","Disinfect and delete if cannot be disinfected (Вылечить или удалить, если вылечить невозможно).","Disinfect and skip if cannot be disinfected (Вылечить или пропустить, если вылечить невозможно).","Delete (Удалить).","Вышеуказанные действия будут выполнены только в том случае, если Kaspersky Anti-Virus Engine обнаружит угрозу при обработке запроса scanfile. Во всех остальных случаях Kaspersky Scan Engine отправляет уведомление только в том случае, если указанные действия могут быть применены к обнаруженному объекту.","Skip (Пропустить).","Size limit for the received file — определяет максимальный размер (в килобайтах) файла, который Kaspersky Scan Engine может проверить. Если для этого параметра установлено значение 0, Kaspersky Scan Engine сканирует файлы любого размера. Максимальное значение этого параметра 1073741824.","Maximum depth — указывает максимальную глубину распаковки вложенных архивов при сканировании.","Этот параметр доступен только в том случае, если в блоке Types of files to scan установлен флажок Archives.","В разделе","Types of files to scan","вы найдете флажки для следующих параметров:","Packed objects — указывает, нужно ли проверять упакованные объекты.","Archives — указывает, нужно ли проверять архивы.","Email databases — указывает, нужно ли проверять базы данных почтовых клиентов.","Emails — указывает, нужно ли проверять сообщения электронной почты.","Macros in Microsoft Office documents — указывает, нужно ли сканировать макросы и документы Microsoft Office.","Типы объектов, которые необходимо проверить в режиме REQMOD.","Этот параметр доступен, если Kaspersky Anti-Virus Engine инициализирован в режиме ICAP. Вы можете выбрать один из следующих типов объектов:","URLs","Files","Типы объектов, которые необходимо проверить в режиме RESPMOD.","Этот параметр доступен, если Kaspersky Anti-Virus Engine инициализирован в режиме ICAP. Вы можете выбрать один из следующих типов объектов:","URLs","Files","Форматы объектов, которые не нужно проверять.","По ссылке Exclusions by file formats открывается окно File formats to exclude.","Типы объектов, которые не нужно проверять.","Этот параметр доступен, если Kaspersky Anti-Virus Engine инициализирован в режиме ICAP. Чтобы указать исключения по типу объекта:","Нажмите на ссылку Exclusions by Content-Type.\n\n\nОткроется окно Object types to exclude. ","Установите типы объектов, которые не нужно проверять.\n\n\nKaspersky Scan Engine сопоставляет HTTP-заголовок Content-Type со значениями этого правила исключения. Если HTTP-заголовок Content-Type содержит указанное значение, ICAP-плагин не проверяет этот объект. ","Нажмите Add, если вам нужно добавить еще одно правило исключения.","Нажмите Apply, чтобы применить этот параметр.","Чтобы применить этот параметр, включите функцию предварительного просмотра на прокси-сервере.","URL-адреса, которые нельзя сканировать","Этот параметр доступен, если Kaspersky Anti-Virus Engine инициализирован в режиме ICAP. Чтобы указать исключения по URL-адресу:","Нажмите на ссылку Exclusions by URL.\n\n\nОткроется окно Exclusion rules for URLs. ","Установите URL-адреса, которые нужно пропустить.\n\n\nKaspersky Scan Engine пропустит эти URL-адреса. Указанные URL-адреса не должны включать компоненты схемы, запроса и фрагмента.  \n\n\nДопускается использование масок. Вы можете использовать подстановочный знак * для обозначения любой последовательности символов полного имени домена, начиная с третьего уровня и выше. Например, *.domain.com. Это значение включает все поддомены domain.com. Подстановочные знаки звездочки (*) и вопросительного знака (?) можно использовать в компоненте пути URL-адреса для обозначения любой последовательности символов или одного символа соответственно. Например, domain.com/test/page/*.  ","Нажмите Add, если вам нужно добавить еще одно правило исключения.","Нажмите Apply, чтобы применить этот параметр.","Чтобы применить этот параметр, включите функцию предварительного просмотра на прокси-сервере.","Максимальный размер объекта, который можно просканировать","Этот параметр доступен, если Kaspersky Anti-Virus Engine инициализирован в режиме ICAP. Чтобы указать исключения по размеру объекта:","Нажмите на переключатель Skip large objects.","Установите максимальный размер объекта, который можно просканировать, в килобайтах (КБ).\n\n\nЕсли задан этот параметр, Kaspersky Scan Engine ожидает получения превью и сравнивает значение Content-Length HTTP-заголовка со значением этого параметра, а также проверяет фактический размер объекта. Если значение заголовка или фактический размер объекта больше указанного, ICAP-плагин не проверяет объект. Это относится как к запросам, сделанным в режиме предварительной проверки, так и к обычным запросам. ","Чтобы применить этот параметр, включите функцию предварительного просмотра на прокси-сервере.","При применении новых настроек сканирования Kaspersky Scan Engine перезагружается."," Настройки сканирования (Scanning) ","179699.htm"));
Page.push(new Array("Настройки обновления (Update)","В этом разделе описан раздел Update на странице Settings.","Если при загрузке веб-страницы произошла ошибка и настройки стали недоступны, перезагрузите страницу.","Раздел Update содержит следующие параметры:","Enable automatic updates — указывает, должен ли Kaspersky Anti-Virus Engine периодически обновлять антивирусные базы.","Automatic update period — продолжительность (в минутах) автоматического обновления антивирусных баз.\nВы можете установить этот интервал, только если антивирусные базы обновляются автоматически. \nМы рекомендуем установить этот интервал на 30 минут. Мы не рекомендуем указывать меньшее значение: оно не приведет к увеличению коэффициента обнаружения, но может стать причиной нестабильности работы Kaspersky Scan Engine. ","Update from Kaspersky servers — указывает, должен ли KAV Engine использовать только серверы \"Лаборатории Касперского\".","Custom sources — веб-адреса пользовательского источника обновлений.\nНастройка этих веб-адресов (и нажатие на кнопку Add source) является обязательной, если KAV Engine должен использовать только пользовательские источники обновлений. \nЕсли Kaspersky Scan Engine должен использовать TLS при подключении к пользовательскому источнику обновлений, вы должны указать протокол https:// в адресе этого пользовательского источника обновлений. ","Use Kaspersky servers if custom sources are unavailable — установите этот флажок, если вы хотите, чтобы Kaspersky Scan Engine использовал этот параметр.","Переключатель Back up the anti-virus database в положении On указывает на то, что KAV Engine будет выполнять резервное копирование антивирусных баз. По умолчанию этот параметр включен."," Настройки обновления (Update) ","179701.htm"));
Page.push(new Array("Настройки лицензирования (License)","В этом разделе описан раздел License на странице Settings.","Если при загрузке веб-страницы произошла ошибка и настройки стали недоступны, перезагрузите страницу.","Когда Kaspersky Scan Engine работает в кластере, состоящем из нескольких экземпляров, импортированная лицензия будет применена ко всем экземплярам этого кластера.","В разделе License отображается следующая информация:","Key file",":","Имя файла ключа.\n\n\nЭто имя доступно в режиме простого лицензирования, т. е. если Kaspersky Scan Engine использует файл ключа. ","Код активации.\n\n\nДоступен в режиме лицензирования онлайн, то есть если Kaspersky Scan Engine использует код активации. ","Expiration date.","Дата истечения срока действия лицензии.","Веб-страница лицензирования","Чтобы заменить текущий файл ключа или код активации на новый:","Нажмите кнопку Change.","Запустится мастер замены лицензии.","Укажите новый режим лицензирования.","Чтобы указать простой режим лицензирования, выберите параметр Key file.","Чтобы указать режим лицензирования онлайн, выберите параметр Activation code.","Укажите новый файл ключа или код активации в зависимости от выбранного вами режима лицензирования.","Нажмите Activate.","Страница замены лицензии"," Настройки лицензирования (License) ","179702.htm"));
Page.push(new Array("Настройки логирования (Logging)","В этом разделе описывается раздел Logging на странице Settings .","Если при загрузке веб-страницы произошла ошибка и настройки стали недоступны, перезагрузите страницу.","Раздел Logging состоит из двух подразделов: Syslog и Log files.","В разделе Syslog можно сделать следующее:","Запустить или остановить логирование системного журнала.\nЕсли вы разрешаете отправку сообщений системного журнала, учтите, что эти сообщения будут содержать конфиденциальные данные, такие как личные данные, определенные GDPR, данные конфигурации продукта и информацию о лицензировании. ","Указать параметры логирования системного журнала.\nНастройки для режимов HTTP и ICAP различаются. ","Чтобы добавить и настроить адрес назначения для сообщений системного журнала в режиме HTTP или ICAP:","Выберите типы событий, которые будут регистрироваться в указанное место назначения.","Когда включено логирование системного журнала, события аудита не могут быть полностью исключены из сообщений системного журнала.","Укажите формат сообщений системного журнала.","CEF\n\n\nФормат журналов CEF различается в режимах HTTP и ICAP. ","RAW\n\n\nФормат журналов RAW различается в режимах HTTP и ICAP. ","Выберите место назначения, которое будет использоваться для логирования журналов:","демон syslog","файл\n\n\nУкажите путь к директории, в которой будет создан файл журнала. Это может быть абсолютный или относительный путь к директории, в которой находится исполняемый файл службы (kavhttpd для режима HTTP и kavicapd для режима ICAP). ","удаленный системный журнал\n\n\nУкажите значение %PROTOCOL%%IP%:%PORT%, где %PROTOCOL% – это сетевой протокол (используйте tcp:// или udp:// для этого значения), %IP% – это IPv4-адрес, на который приходят сообщения системного журнала, а %PORT% – это порт, который принимает сообщения системного журнала. ","В разделе Log files можно сделать следующее:","Запустить или остановить отладочное логирование.\nЕсли вы включаете отладочное логирование, учтите, что сообщения журналов будут содержать конфиденциальные данные, такие как личные данные, определенные GDPR, данные конфигурации продукта и информацию о лицензировании. ","Экспортировать журналы.\nЭто действие доступно, если остановлено отладочное логирование. ","Удалить журналы.\nКнопка доступна, если остановлено отладочное логирование. ","В разделе Log files также есть:","Log directory — путь к директории, в которой будут храниться файлы журнала.","Вы не можете изменить этот параметр с помощью Kaspersky Scan Engine GUI. Вы должны отредактировать соответствующий файл конфигурации. В зависимости от режима, который вы выбрали в файле конфигурации Kaspersky Scan Engine, укажите путь в httpdkavlog.ini или icapdkavlog.conf для режимов HTTP и ICAP соответственно.","Log size (MB) — текущий размер журнала в мегабайтах."," Настройки логирования (Logging) ","179703.htm"));
Page.push(new Array("Настройки прокси (Proxy)","В этом разделе описан раздел Proxy на странице Settings.","Если при загрузке веб-страницы произошла ошибка и настройки стали недоступны, перезагрузите страницу.","Раздел Proxy содержит следующие параметры:","Use proxy server — указывает, должен ли Kaspersky Anti-Virus Engine использовать прокси-сервер.","Proxy address — IP-адрес или хост прокси-сервера.\nЭтот параметр доступен, если используется прокси-сервер. ","Port — порт прокси-сервера.\nЭтот параметр доступен, если используется прокси-сервер. ","User name (optional) — логин для прокси-сервера.\nЭтот параметр доступен, если используется прокси-сервер. Логин скрыт, а вместо символов отображаются звездочки. Логин прокси-сервера хранится в зашифрованном виде. ","Password (optional) — пароль для прокси-сервера.\nЭтот параметр доступен, если используется прокси-сервер. Пароль скрыт, а вместо символов отображаются звездочки. Пароль прокси-сервера хранится в зашифрованном виде. "," Настройки прокси (Proxy) ","179704.htm"));
Page.push(new Array("Смена пароля","Чтобы изменить пароль для доступа к Kaspersky Scan Engine GUI:","Нажмите кнопку с настройками текущего пользователя () на нижней панели, а затем нажмите Profile.","Ваш профиль откроется справа.","Заполните поля:","Current password — укажите текущий пароль.","New password — укажите новый пароль.","Confirm new password — подтвердите новый пароль.","Все пароли скрыты, а вместо символов отображаются звездочки.","Нажмите Save.","После смены пароля все сеансы активной учетной записи, кроме текущего, будут закрыты.","Требования к паролю","Пароль для доступа к Kaspersky Scan Engine GUI должен соответствовать следующим требованиям:","Пароль должен содержать только символы ASCII: буквы, цифры и следующие специальные символы:\n! \" # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _ ` { | } ~ ","Пароль должен содержать хотя бы одну строчную букву латинского алфавита.","Пароль должен содержать хотя бы одну заглавную букву латинского алфавита.","Пароль должен содержать хотя бы одну цифру.","Пароль должен содержать хотя бы один специальный символ (!, #, @ и другие).","Длина пароля должна быть от 6 до 16 символов включительно."," Смена пароля ","179705.htm"));
Page.push(new Array("Использование нижней панели","В этом разделе описана нижняя панель Kaspersky Scan Engine GUI. Нижняя панель находится в нижнем левом углу каждой страницы Kaspersky Scan Engine GUI.","На нижней панели есть кнопка с настройками текущего пользователя (). Нажав на нее, вы можете выбрать одно из следующих действий:","Изменить пароль и другие параметры текущего профиля пользователя.","Выйти.","Открыть страницу документации Kaspersky Scan Engine, на которой описывается текущая страница Kaspersky Scan Engine GUI.","Посмотреть текущую версию Kaspersky Scan Engine."," Использование нижней панели ","179706.htm"));
Page.push(new Array("Сценарии использования Kaspersky Scan Engine","В этом разделе описаны распространенные сценарии использования Kaspersky Scan Engine."," Сценарии использования Kaspersky Scan Engine ","179824.htm"));
Page.push(new Array("Редактирование файла конфигурации Kaspersky Scan Engine вручную","В этом разделе описан файл конфигурации Kaspersky Scan Engine.","Файл конфигурации Kaspersky Scan Engine представляет собой XML-файл с именем klScanEngineUI.xml. Он находится в поддиректории etc директории установки Kaspersky Scan Engine.","В таблице ниже описаны элементы файла конфигурации Kaspersky Scan Engine.","Элементы файла конфигурации Scan Engine","Элемент","Описание","EULA/Common","Указывает, принято ли Пользовательское соглашение с конечным пользователем (EULA) для Kaspersky Scan Engine:","accepted\n\n\n\n\nПользовательское соглашение для Kaspersky Scan Engine принято.\n","rejected\n\n\n\n\nПользовательское соглашение для Kaspersky Scan Engine не принято.\n","EULA/KSN","Указывает, принято ли Пользовательское соглашение с конечным пользователем для Kaspersky Scan Network (KSN):","accepted\n\n\n\n\nПользовательское соглашение для KSN принято.\n","rejected\n\n\n\n\nПользовательское соглашение для KSN не принято.\n","ServerSettings/EnableUI","Указывает, должна ли быть включена веб-служба, реализующая Kaspersky Scan Engine GUI:","0 (или false)\n\n\n\n\nВеб-служба не будет инициализирована. \n\n\n\n\nВ этом случае все параметры в элементах ServerSettings и DatabaseSettings ни на что не влияют. ","1 (или true)\n\n\n\n\nБудет сделана попытка инициализировать веб-службу. ","ServerSettings/Mode","Режим Kaspersky Scan Engine:","httpd\n\n\n\n\nKaspersky Anti-Virus Engine будет инициализирован как HTTPD.\n","icap\n\n\n\n\nKaspersky Anti-Virus Engine будет инициализирован как ICAP-плагин.\n","ServerSettings/ConnectionString","IP-адрес (или хост) и порт, на котором будет доступен Kaspersky Scan Engine GUI.","Вы должны получить доступ к Kaspersky Scan Engine GUI с компьютера, на котором установлен Kaspersky Scan Engine. В этом случае вам также будет доступна документация Kaspersky Scan Engine.","ServerSettings/SSLCertificatePath","Путь к сертификату Kaspersky Scan Engine в формате PEM.","Это может быть как абсолютный, так и относительный путь. Относительный путь рассчитывается относительно бинарного файла Kaspersky Scan Engine.","ServerSettings/SSLPrivatePath","Путь к закрытому ключу Kaspersky Scan Engine в формате PEM.","Это может быть как абсолютный, так и относительный путь. Относительный путь рассчитывается относительно бинарного файла Kaspersky Scan Engine.","ServerSettings/TemplatesPath","Путь к директории, в которой хранятся шаблоны Kaspersky Scan Engine GUI.","Это может быть как абсолютный, так и относительный путь. Относительный путь рассчитывается относительно бинарного файла Kaspersky Scan Engine.","DatabaseSettings/ConnectionString","IP-адрес и порт, по которому доступна база данных, используемая Kaspersky Scan Engine для хранения данных.","DatabaseSettings/User","Зашифрованное имя пользователя для аутентификации в базе данных, которую Kaspersky Scan Engine использует для хранения данных. Имя пользователя должно быть зашифровано с помощью утилиты kav_encrypt.","DatabaseSettings/Password","Зашифрованный пароль для аутентификации в базе данных, которую Kaspersky Scan Engine использует для хранения данных. Пароль должен быть зашифрован с помощью утилиты kav_encrypt.","Ниже приведен пример файла конфигурации Kaspersky Scan Engine.","<Settings>","<EULA>","<Common>rejected</Common>","<KSN>rejected</KSN>","</EULA>","<ServerSettings>","<EnableUI>true</EnableUI>","<Mode>httpd</Mode>","<ConnectionString>127.0.0.1:9443</ConnectionString>","<SSLCertificatePath>../ssl/cert.pem</SSLCertificatePath>","<SSLPrivatePath>../ssl/priv.pem</SSLPrivatePath>","<TemplatesPath>../httpsrv/templates/</TemplatesPath>","</ServerSettings>","<DatabaseSettings>","<ConnectionString>10.65.81.3:8443</ConnectionString>","<User>=a3Afasd+</User>","<Password>=df2AfBB1</Password>","</DatabaseSettings>","</Settings>"," Редактирование файла конфигурации Kaspersky Scan Engine вручную ","179825.htm"));
Page.push(new Array("Проверка возможностей обнаружения вирусов","В этом разделе объясняется, как проверить правильность обнаружения вредоносных объектов Kaspersky Scan Engine."," Проверка возможностей обнаружения вирусов ","179826.htm"));
Page.push(new Array("Повышение производительности Kaspersky Scan Engine","Kaspersky Scan Engine поддерживает многопоточность. Эта функция позволяет использовать Kaspersky Scan Engine в высоконагруженных системах.","В этом разделе описаны рекомендации по повышению производительности Kaspersky Scan Engine.","Общие рекомендации по повышению производительности","Для достижения оптимальной производительности:","Используйте количество процессов сканирования, равное количеству ядер ЦП и двум потокам на процесс.","Включите Keep-Alive для соединений ICAP и HTTP.","Рекомендации по повышению производительности Kaspersky Scan Engine в режиме HTTP","В следующем списке представлен рекомендуемый порядок настройки Kaspersky Scan Engine для максимальной производительности:","Укажите необходимое количество процессов и потоков сканирования в параметрах ScannersCount и ThreadsCount соответственно.\n Потоки обрабатывают задачи сканирования из очереди сканирования. Длина очереди сканирования указывается в параметре QueueLen файла конфигурации режима HTTP. ","В параметре MaxHTTPSessionsNum укажите максимальное количество активных TCP-соединений с Kaspersky Scan Engine.\nПри работе Kaspersky Scan Engine в среде с высокой нагрузкой рекомендуется устанавливать значение этого параметра больше, чем значение ThreadsCount, чтобы очередь сканирования заполнялась быстрее и потоки сканирования не простаивали. Обратите внимание, что Kaspersky Scan Engine загружает файлы в системную память во время проверки. Чем больше активных сеансов у Kaspersky Scan Engine, тем больше памяти он потребляет. Вы можете ограничить максимально допустимый размер заголовков и тел HTTP-сообщений, отправляемых в KAV HTTPD, указав их максимальный размер в параметре MaxTCPFileSize. ","В параметре MaxIncomingConnectionsNum укажите предполагаемое количество ожидающих TCP-соединений с Kaspersky Scan Engine. Обратите внимание, что это значение передается в системную функцию listen(2) и может быть изменено в зависимости от операционной системы.","Рекомендуется установить значение MaxIncomingConnectionsNum в несколько раз больше, чем значение MaxHTTPSessionsNum. Таким образом, ожидающие соединения будут помещены в очередь соединений, и задачи сканирования от этих клиентов не будут потеряны.","Использование TLS значительно снижает производительность Kaspersky Scan Engine. Для достижения наилучших результатов используйте TLS 1.3, так как он является наиболее производительным.","Рекомендации по повышению производительности Kaspersky Scan Engine в режиме ICAP","Укажите необходимое количество процессов и потоков сканирования в параметрах ScannersCount и ThreadsCount соответственно."," Повышение производительности Kaspersky Scan Engine ","179827.htm"));
Page.push(new Array("Использование утилиты управления паролями","В этом разделе описано, как использовать утилиту kl_access_util. С помощью этой утилиты можно делать следующее:","Сбросить пароль учетной записи admin. После сброса вы можете изменить пароль в Kaspersky Scan Engine GUI.","Установить токен API, используемый для аутентификации.","Утилита kl_access_util запускается из командной строки следующим образом:","./kl_access_util [-r] | [-n <token-name> -t <token-value>] | [-v] | [-h]","В таблице ниже описаны параметры kl_access_util.","Параметры kl_access_util","Параметр","Описание","-r","или","--reset_default_user","Устанавливает пароль для учетной записи администратора по умолчанию KAVAdmin!1.","-n <token-name>","или","--access-token-name <token-name>","Задает имя токена API, используемого для аутентификации.","Если токен с указанным именем уже существует, Kaspersky Scan Engine обновляет этот токен (заменяет старое значение на новое, указанное в параметрах -t или --access-token).","Если токена с указанным именем нет, Kaspersky Scan Engine создает новый токен с указанным именем и значением.","Объедините этот параметр только с -t или --access-token.","-t <token-value>","или","--access-token <token-value>","Указывает значение токена API, используемого для аутентификации. Значение присваивается токену с именем, указанным в -n или --access-token-name. Это может быть как существующий токен, который обновляет утилита, так и новый токен (см. описание параметра -n).","Значение должно быть уникальным и содержать от 4 до 100 символов ASCII. Должна быть как минимум одна заглавная и одна строчная буква латинского алфавита, одна цифра и один из следующих специальных символов: -._ ~ + /).","При создании или обновлении токена утилита шифрует значение токена.","Объединяйте этот параметр только с -n или --access-token-name.","-v","или","--version","Выводит версию Kaspersky Scan Engine в командной строке.","-h","или","--help","Выводит справочную информацию об утилите kl_access_util в командной строке."," Использование утилиты управления паролями ","179831.htm"));
Page.push(new Array("Активация Kaspersky Scan Engine в режиме лицензирования оффлайн","В этом разделе описано, как активировать Kaspersky Scan Engine в режиме оффлайн после установки Kaspersky Scan Engine.","Вы можете активировать Kaspersky Scan Engine на странице настроек лицензирования в Kaspersky Scan Engine GUI.","Для активации Kaspersky Scan Engine в режиме лицензирования оффлайн вам потребуется файл ключа. Файл ключа предоставляет ваш персональный технический менеджер (ПТМ).","Чтобы активировать Kaspersky Scan Engine в оффлайн-режиме, выполните следующее.","Откройте файл конфигурации, соответствующий выбранному вами режиму:","Если вы используете Kaspersky Scan Engine в режиме HTTP, откройте файл конфигурации kavhttpd.xml.","Если вы используете Kaspersky Scan Engine в режиме ICAP, откройте файл конфигурации kavicapd.xml.","Выполните одно из следующих действий.","Скопируйте файл ключа в директорию, указанную в элементе","LicensePath","файла конфигурации.","Список других директорий, в которых Kaspersky Scan Engine автоматически выполняет поиск файла ключа, есть в описании элемента LicensePath:","В kavhttpd.xml (режим HTTP): DirectorySettings > LicensePath.","В kavicapd.xml (режим ICAP): SDKSettings > LicensePath.","Если вы хотите сохранить файл ключа в другой директории, укажите путь к этой директории в элементе LicensePath файла конфигурации и скопируйте туда файл appinfo.kli. Файл appinfo.kli находится в директории /bin пакета распространения.","В элементе LicensingMode файла конфигурации укажите 1.","Сохраните файл конфигурации.","Перезагрузите службу Kaspersky Scan Engine.","В режиме HTTP перезапустите службу kavhttpd.","В режиме ICAP перезапустите службу kavicapd.","Если активация прошла успешно, Kaspersky Scan Engine запустится в обычном режиме, и вы сможете обновить антивирусные базы. В противном случае Kaspersky Scan Engine вернет ошибку в командную строку."," Активация Kaspersky Scan Engine в режиме лицензирования оффлайн ","179852.htm"));
Page.push(new Array("Активация Kaspersky Scan Engine в режиме лицензирования онлайн","В этом разделе описано, как активировать Kaspersky Scan Engine в режиме онлайн после установки Kaspersky Scan Engine.","Вы можете активировать Kaspersky Scan Engine на странице настроек лицензии в Kaspersky Scan Engine GUI.","Для активации Kaspersky Scan Engine в режиме лицензирования онлайн вам потребуется код активации. Код активации предоставляется вашим персональным техническим менеджером (ПТМ).","Ваш компьютер должен быть подключен к интернету, чтобы активировать Kaspersky Scan Engine в режиме лицензирования онлайн. При использовании режима лицензирования онлайн Kaspersky Scan Engine передает в \"Лабораторию Касперского\" информацию об установленной копии Kaspersky Scan Engine и коде активации. Смотрите также полный список данных, которые передаются в \"Лабораторию Касперского\" в режиме лицензирования онлайн.","Чтобы активировать Kaspersky Scan Engine в режиме лицензирования онлайн:","Создайте текстовый файл с именем license.","Скопируйте в него код активации.","Убедитесь, что формат кода активации правильный. Правильный формат – XXXXX-XXXXX-XXXXX-XXXXX, где X – это число (0–9) или заглавная буква латинского алфавита (A–Z), за исключением \"I\" и \"O\".","В файле не должно быть других символов.","Сохраните файл.","Откройте файл конфигурации, соответствующий режиму работы Kaspersky Scan Engine:","Если вы используете Kaspersky Scan Engine в режиме HTTP, откройте файл конфигурации kavhttpd.xml.","Если вы используете Kaspersky Scan Engine в режиме ICAP, откройте файл конфигурации kavicapd.xml.","Выполните одно из следующих действий.","Скопируйте файл лицензии в директорию, указанную в элементе","LicensePath","файла конфигурации.","Список других директорий, в которых Kaspersky Scan Engine автоматически выполняет поиск файла лицензии, есть в описании элемента LicensePath:","В kavhttpd.xml (режим HTTP): DirectorySettings > LicensePath.","В kavicapd.xml (режим ICAP): SDKSettings > LicensePath.","Если вы хотите сохранить файл лицензии в другой директории, укажите к ней путь в элементе LicensePath и скопируйте файл appinfo.kli в эту директорию. Файл appinfo.kli находится в директории /bin пакета распространения.","В элементе LicensingMode файла конфигурации укажите 2.","Сохраните файл конфигурации.","Перезагрузите службу Kaspersky Scan Engine.","В режиме HTTP перезапустите службу kavhttpd.","В режиме ICAP перезапустите службу kavicapd.","Если активация прошла успешно, Kaspersky Scan Engine запустится в обычном режиме, и вы сможете обновить антивирусные базы. В противном случае Kaspersky Scan Engine вернет ошибку в командную строку.","После успешной активации в режиме лицензирования онлайн информация о лицензировании синхронизируется с серверами \"Лаборатории Касперского\". Эту синхронизацию нужна, например, для изменения даты истечения срока действия кода активации (что устраняет необходимость в новой онлайн-активации) или для изменения доступных функций.","Синхронизация происходит автоматически один раз в день. Максимальное время без подключения к интернету – от 15 до 30 дней.","Чтобы синхронизировать лицензионную информацию с серверами \"Лаборатории Касперского\", ваш компьютер должен быть подключен к интернету."," Активация Kaspersky Scan Engine в режиме лицензирования онлайн ","179855.htm"));
Page.push(new Array("Лицензионные ограничения","Жизненный цикл лицензий в режимах лицензирования оффлайн и онлайн одинаков. Kaspersky Scan Engine можно использовать до определенного момента, который называется датой окончания срока действия. Kaspersky Scan Engine использует файл ключа или код активации для определения даты окончания срока действия.","По истечении действия файла ключа или кода активации вы можете использовать Kaspersky Scan Engine только с лицензионными ограничениями.","Лицензионные ограничения","Kaspersky Scan Engine может иметь следующие лицензионные ограничения:","Если время, полученное от KSN, по крайней мере на один день позже даты истечения срока действия вашего файла ключа или кода активации, Kaspersky Scan Engine будет работать, но вы не сможете выполнить проверку репутации файлов и URL-адресов. Убедитесь, что выключены Enable reputation checking и Enable Phishing Protection (см. Settings -> Scanning в Kaspersky Scan Engine GUI), иначе вы не сможете запустить службы kavhttpd и kavicapd.","Если дата выпуска антивирусных баз превышает срок действия вашего файла ключа или кода активации, Kaspersky Scan Engine не будет обновлять антивирусные базы.","Снятие лицензионных ограничений в режиме лицензирования онлайн","Чтобы снять лицензионные ограничения, вы можете сделать следующее.","Если ваша копия Kaspersky Scan Engine не была подключена к интернету в течение последних 15 дней и более, причина лицензионных ограничений, скорее всего, в устаревшей лицензионной информации. Чтобы снять лицензионные ограничения, разрешите Kaspersky Scan Engine выходить в интернет.\nЧтобы избежать этой проблемы, убедитесь, что Kaspersky Scan Engine имеет постоянный доступ в интернет. ","Если срок действия вашего кода активации истек, получите новый код и активируйте с его помощью Kaspersky Scan Engine. Чтобы активировать Kaspersky Scan Engine с новым кодом, ваша копия Kaspersky Scan Engine должна быть подключена к интернету.","Если другие варианты невозможны, используйте более раннюю версию антивирусных баз для инициализации Kaspersky Scan Engine. Этот метод не снимает ограничений, накладываемых на функцию проверки репутации файлов и URL-адресов.","Снятие лицензионных ограничений в режиме лицензирования оффлайн","Чтобы снять лицензионные ограничения, получите новый файл ключа и активируйте с его помощью Kaspersky Scan Engine."," Лицензионные ограничения ","179860.htm"));
Page.push(new Array("Начало работы с Kaspersky Scan Engine в режиме HTTP","Этот раздел содержит информацию о том, как начать пользоваться Kaspersky Scan Engine в режиме HTTP.","Перед тем как вы начнете использовать Kaspersky Scan Engine, мы настоятельно рекомендуем вам ограничить доступ к файлам Kaspersky Scan Engine, в том числе к журналам, с помощью встроенных инструментов вашей операционной системы. Эта мера поможет обезопасить вашу информацию.","Чтобы начать пользоваться Kaspersky Scan Engine в режиме HTTP:","Установите Kaspersky Scan Engine.","Kaspersky Scan Engine запускается автоматически после завершения установки.","При необходимости настройте Kaspersky Scan Engine для использования в режиме HTTP.","Например, вы можете настроить Format Recognizer для увеличения скорости работы Kaspersky Scan Engine в режиме HTTP.","При необходимости настройте файл модуля systemd для управления Kaspersky Scan Engine в режиме HTTP.","При необходимости настройте логирование.","Обратите внимание, что логирование снижает производительность Kaspersky Scan Engine. Обычно включать логирование нужно только во время интеграции или для отладки.","Обновите антивирусные базы или настройте периодичность обновления.","Чтобы отслеживать процесс обновления и убедиться, что вы получаете последние обновления, отправьте HTTP-запрос на адрес /api/v3.0/update/status.","Проверьте возможности обнаружения Kaspersky Scan Engine.","Сделайте запрос в Kaspersky Scan Engine:","Запустите пример HTTP-клиента из командной строки для проверки файлов.","Используйте REST-подобный протокол для выполнения HTTP-запросов.","Используйте исходный код примера HTTP-клиента в качестве примера для создания собственного клиента."," Начало работы с Kaspersky Scan Engine в режиме HTTP ","179865.htm"));
Page.push(new Array("Настройка Format Recognizer для использования в режиме HTTP","Format Recognizer – это компонент, который можно использовать в Kaspersky Scan Engine для распознавания и пропуска файлов определенных форматов в процессе сканирования. Пропуск файлов увеличивает скорость обработки Kaspersky Scan Engine в режиме HTTP.","Включение Format Recognizer","Чтобы включить Format Recognizer:","В файле конфигурации режима HTTP найдите раздел FormatRecognizerSettings.\nЕсли этот раздел отсутствует, добавьте его вручную следующим образом: \n\n<FormatRecognizerSettings>\n...\n</FormatRecognizerSettings> \n\n\n\n ","В этом разделе в списке FormatsToSkipScanning укажите, какие форматы файлов не должны проверяться Kaspersky Scan Engine:\n\n<FormatRecognizerSettings>\n<FormatsToSkipScanning>\n<KAV_FF_GENERAL_TXT/>\n...\n<KAV_FF_AUDIO_WMA/>\n</FormatsToSkipScanning>\n</FormatRecognizerSettings>\n\n\n\n ","Чтобы изменения вступили в силу, перезапустите службу kavhttpd с помощью следующей команды:\nservice kavhttpd restart ","Format Recognizer начнет распознавать и пропускать файлы форматов, указанных в списке FormatsToSkipScanning. Kaspersky Scan Engine не сканирует пропущенные файлы, что увеличивает скорость их обработки.","Выключение Format Recognizer","Чтобы выключить Format Recognizer:","В файле конфигурации режима HTTP удалите раздел FormatRecognizerSettings или оставьте список FormatsToSkipScanning пустым.","Чтобы изменения вступили в силу, перезапустите службу kavhttpd с помощью следующей команды:\nservice kavhttpd restart "," Настройка Format Recognizer для использования в режиме HTTP ","179868.htm"));
Page.push(new Array("Настройка очереди подключений в режиме HTTP","Очередь подключений содержит ожидающие подключения к Kaspersky Scan Engine. Настраивая очередь подключений, вы можете влиять на производительность Kaspersky Scan Engine в режиме HTTP. В этом разделе объясняется, как настроить очередь подключений.","Три параметра позволяют настроить очередь подключений: MaxHTTPSessionsNum, MaxIncomingConnectionsNum и ThreadsCount. Эти параметры можно задать в файле конфигурации режима HTTP.","MaxHTTPSessionsNum","Этот параметр указывает максимальное количество активных TCP-соединений, которые Kaspersky Scan Engine может поддерживать одновременно. Когда TCP-соединение с клиентом закрывается, Kaspersky Scan Engine может принять другое соединение вместо него.","MaxIncomingConnectionsNum","Этот параметр указывает максимальное количество ожидающих TCP-соединений с Kaspersky Scan Engine. Если количество ожидающих соединений достигает MaxIncomingConnectionsNum, дополнительные соединения могут быть прерваны.","ThreadsCount","Этот параметр указывает максимальное количество одновременно работающих сканирующих программных потоков. Когда сканирующий поток завершает задачу сканирования, он берет другую из очереди сканирования.","Примеры настройки очереди подключений","Эти примеры показывают, как вы можете использовать очередь соединений, чтобы повлиять на поведение Kaspersky Scan Engine.","Kaspersky Scan Engine без очереди на подключение.\nРассмотрим следующий пример: значение MaxIncomingConnectionsNum равно 16, значение ThreadsCount равно 16, а значение MaxHTTPSessionsNum равно 50. В этом примере Kaspersky Scan Engine может принимать только 16 подключений одновременно, но, поскольку MaxHTTPSessionsNum равен 50, их задачи проверки принимаются немедленно. Дополнительные соединения могут быть прерваны. Шестнадцати потоков сканирования обычно достаточно для быстрой обработки задач сканирования от 16 клиентов, поэтому очередь на сканирование будет небольшой. ","Kaspersky Scan Engine с очередью подключений.\nРассмотрим следующий пример: значение MaxIncomingConnectionsNum равно 100, значение ThreadsCount равно 16, а значение MaxHTTPSessionsNum равно 50. В этом примере Kaspersky Scan Engine может принимать 50 подключений одновременно. Kaspersky Scan Engine запускает обработку задач сканирования от некоторых из клиентов в 16 потоках сканирования, а остальные задачи сканирования формируют очередь сканирования. Другие ожидающие соединения формируют очередь соединений и ждут, пока их не примут. Дополнительные соединения могут быть прерваны. "," Настройка очереди подключений в режиме HTTP ","179869.htm"));
Page.push(new Array("Настройка тайм-аута сеанса","На тайм-аут сеанса влияют параметры SessionTimeout и TimeoutMs файла конфигурации режима HTTP и заголовок запроса X-KAV-Timeout. В этом разделе объясняется, как настроить тайм-аут сеанса работы Kaspersky Scan Engine в режиме HTTP с использованием этих значений.","SessionTimeout","Этот параметр файла конфигурации задает максимальное время, которое Kaspersky Scan Engine может потратить на получение запроса на сканирование объекта и на обработку этого запроса (операции сканирования) в миллисекундах. Тайм-аут действует для всех объектов, отправляемых в Kaspersky Scan Engine.","Рассмотрим следующий пример: для параметра SessionTimeout установлено значение 4000 (четыре секунды), а запрос не содержит заголовка X-KAV-Timeout. Kaspersky Scan Engine тратит одну секунду на получение запроса. Затем Kaspersky Scan Engine тратит на сканирование оставшиеся три секунды.","X-KAV-Timeout","В этом заголовке задается время, которое Kaspersky Scan Engine может потратить на операцию сканирования (в миллисекундах), независимо от значения параметра SessionTimeout.","Диапазон значений этого параметра от 0 до 4294967295 (32-разрядное целое положительное число).","Рассмотрим следующий пример: значение SessionTimeout установлено на 4000 (четыре секунды), а значение X-KAV-Timeout установлено на 10000 (10 секунд). Kaspersky Scan Engine тратит одну секунду на получение запроса. Затем Kaspersky Scan Engine тратит на сканирование 10 секунд (значение X-KAV-Timeout).","Если SessionTimeout превышен во время приема запроса, сеанс закрывается независимо от значения X-KAV-Timeout.","Рассмотрим следующий пример: значение SessionTimeout установлено на 4000 (четыре секунды), а значение X-KAV-Timeout установлено на 10000 (10 секунд). Kaspersky Scan Engine тратит четыре секунды на получение запроса, и сеанс закрывается из-за превышения SessionTimeout.","Вы можете выбрать значение X-KAV-Timeout в зависимости от размера файлов, которые хотите просканировать. Например, Kaspersky Scan Engine может потребовать 10 секунд для сканирования большого файла или 0,1 секунды для сканирования небольшого файла.","TimeoutMs","По умолчанию Kaspersky Scan Engine поддерживает постоянные соединения Keep-Alive, поэтому он может обрабатывать несколько объектов один за другим, используя одно и то же соединение.","Для каждого нового объекта Kaspersky Scan Engine запускает новый SessionTimeout. После того как Kaspersky Scan Engine отправит результаты сканирования, соединение будет оставаться открытым в течение всего времени, указанного в параметре TimeoutMs, даже если время ожидания SessionTimeout уже истекло. Если новый объект был получен до истечения срока действия TimeoutMs, начинается новый SessionTimeout, пока то же соединение остается открытым.","Если поддержка постоянных соединений Keep-Alive выключена, Kaspersky Scan Engine закрывает соединение по истечении времени SessionTimeout."," Настройка тайм-аута сеанса ","179870.htm"));
Page.push(new Array("Изменение переменных в файле модуля режима HTTP","Вы можете настроить Kaspersky Scan Engine, изменив одну или несколько переменных в файле модуля %distr_kit%/etc/kavhttpd.service.","Изменение пути к PID-файлу Kaspersky Scan Engine","Вы можете изменить эту переменную, если хотите создать PID-файл Kaspersky Scan Engine в директории, отличной от /var/run/kavhttpd.pid.","В следующем примере показано, как эта переменная устанавливается в файле модуля:","PIDFile=/var/run/kavhttpd.pid","Изменение переменных среды","Вы должны изменить эти переменные среды, если Kaspersky Scan Engine находится не в директории /opt/kaspersky/ScanEngine.","В файле модуля используются следующие переменные среды:","SDKPATH – указывает директорию, в которой находится Kaspersky Scan Engine. В следующем примере показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=SDKPATH=/opt/kaspersky/ScanEngine\n\n\n\n ","KL_PLUGINS_PATH – указывает путь к директории, в которой находятся файлы плагина PPL, используемые Kaspersky Scan Engine. В следующем примере показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=KL_PLUGINS_PATH=/ppl\n\n\n\n ","LD_LIBRARY_PATH – указывает путь к директории, в которой находятся общие библиотеки, используемые Kaspersky Scan Engine. В следующем блоке показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=LD_LIBRARY_PATH=/lib:/ppl\n\n\n\n ","Изменение путей в команде, выполняемой при запуске kavhttpd","Вы должны изменить пути в команде, выполняемой при запуске kavhttpd, если вы помещаете исполняемый файл kavhttpd или файл конфигурации режима HTTP в директории, отличные от указанных в файле модуля, или если вы хотите создать PID-файл Kaspersky Scan Engine в директории, отличной от /var/run/kavhttpd.pid.","В следующем примере показано, как эта команда устанавливается в файле модуля:","ExecStart=/bin/sh -c 'cd ${SDKPATH}/bin; ./kavhttpd -c /etc/kavhttpd.xml -p /var/run/kavhttpd.pid'","Включение и выключение мониторинга в команде, выполняемой при запуске kavhttpd","Вы можете включить или выключить мониторинг, добавив или удалив параметр \"-w\" в команде, выполняемой при запуске kavhttpd.","В следующем примере показано, как включить мониторинг в файле модуля:","ExecStart=/bin/sh -c 'cd ${SDKPATH}/bin; ./kavhttpd -c /etc/kavhttpd.xml -p /var/run/kavhttpd.pid -w'"," Изменение переменных в файле модуля режима HTTP ","179872.htm"));
Page.push(new Array("Настройка обновления в режиме HTTP","Этот раздел содержит информацию о том, как настроить обновления Kaspersky Scan Engine.","Указание настроек обновления","Kaspersky Scan Engine использует настройки обновления, хранящиеся в файле конфигурации режима HTTP. Установите необходимые настройки обновления в kavhttpd.xml перед запуском Kaspersky Scan Engine.","Указание пользовательских источников обновления антивирусных баз","Kaspersky Scan Engine обновляет антивирусные базы из источников обновления. В качестве источника обновления антивирусных баз, используемого Kaspersky Scan Engine, можно указать как значение по умолчанию, так и пользовательское значение. Источниками обновления по умолчанию являются серверы обновления \"Лаборатории Касперского\".","Можно использовать источники обновления по умолчанию, пользовательские источники обновления или оба.","Чтобы указать пользовательские источники обновления:","Укажите пользовательские источники обновления в элементе UpdateSources файла конфигурации kavhttpd.xml. Используйте отдельный элемент Source для каждого источника.\nЧтобы использовать локальную директорию, укажите абсолютный путь. Чтобы использовать сетевой источник, укажите URL-адрес, включая протокол. Поддерживаются протоколы HTTP и FTP. \nВ следующем примере показаны два источника обновления: \n\n<UpdateSources>\n<Source>httpd://example.com/update/source1</Source>\n<Source>httpd://example.com/update/source2</Source>\n</UpdateSources>\n\n\n\n ","Если вы хотите использовать только пользовательские источники, то в файле kavhttpd.xml установите параметр UseOnlyCustomSources в значение 1.\nЕсли в UseOnlyCustomSources указан 0, то Kaspersky Scan Engine использует как источники обновлений по умолчанию, так и пользовательские источники. В этом случае Kaspersky Scan Engine сначала ищет обновления в пользовательских источниках обновления. ","Параметры, указанные вами, будут использоваться после начала или перезапуска службы kavhttpd.","Настройка резервного копирования антивирусных баз","Резервное копирование антивирусных баз защищает Kaspersky Scan Engine от возможных неисправностей, вызванных процессом обновления антивирусных баз.","По умолчанию резервное копирование антивирусных баз включено. Kaspersky Scan Engine автоматически создает резервные копии антивирусных баз во время обновлений. Убедитесь, что ваш жесткий диск имеет достаточно свободного места для полной копии антивирусных баз.","Чтобы выключить резервное копирование антивирусных баз,","установите параметр DisableBackup в файле kavhttpd.xml в значение 1.","Настройки, указанные вами, будут использоваться после начала или перезапуска службы kavhttpd.","Создание подключений к источникам обновления","Для подключения к источникам обновлений Kaspersky Scan Engine использует параметры подключения, указанные в kavhttpd.xml.","Автоматические обновления антивирусных баз","Если вы хотите обновлять антивирусные базы через регулярные промежутки времени, используйте автоматические обновления.","По умолчанию автоматические обновления выключены.","Для настройки автоматических обновлений:","Установите параметр UpdatePeriodMinutes в файле kavhttpd.xml в значение с требуемым интервалом обновления (в минутах).","Перезапустите службу kavhttpd.","Kaspersky Scan Engine будет выполнять обновления автоматически.","Вы также можете обновить базы вручную."," Настройка обновления в режиме HTTP ","179873.htm"));
Page.push(new Array("Выполнение запросов в режиме HTTP по протоколу KAV версии 3","Этот раздел содержит информацию о том, как отправлять HTTP-запросы к Kaspersky Scan Engine, используя протокол KAV версии 3."," Выполнение запросов в режиме HTTP по протоколу KAV версии 3 ","179875.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме HTTP вручную","Вы можете запустить службу kavhttpd вручную, запустив бинарный файл kavhttpd.","При ручном запуске службы kavhttpd доступны следующие параметры:","Варианты запуска бинарного файла kavhttpd","Параметр","Описание","-c <path>","Необязательный параметр.","Задает путь к файлу конфигурации режима HTTP.","Путь может быть абсолютным или относительным. Относительный путь указывается относительно текущей рабочей директории.","Путь к файлу конфигурации по умолчанию – ./kavhttpd.xml.","-p <path>","Необязательный параметр.","Задает путь к PID-файлу.","Путь может быть абсолютным или относительным. Относительный путь указывается относительно текущей рабочей директории.","-w","Необязательный параметр.","Запускает службу kavhttpd в сторожевом режиме.","В этом режиме служба kavhttpd автоматически перезапускается при зависании или сбое.","-n","Необязательный параметр.","Включает режим nodaemon для службы kavhttpd.","При указании этого параметра служба kavhttpd запускается с высоким приоритетом.","-v","Необязательный параметр.","Показывает версию Kaspersky Scan Engine.","-h","Необязательный параметр.","Показывает справочную информацию."," Запуск Kaspersky Scan Engine в режиме HTTP вручную ","179876.htm"));
Page.push(new Array("Настройка логирования в режиме HTTP","В этом разделе описано, как настроить логирование в режиме HTTP вручную без использования Kaspersky Scan Engine GUI.","Смотрите также подробные инструкции по включению логирования.","Настройка логирования","Чтобы настроить логирование, измените параметры в файле конфигурации логирования httpdkavlog.ini (далее – файл конфигурации логирования), расположенном в директории %service_dir%/bin. Файл конфигурации состоит из нескольких разделов.","Раздел DebugLogging","LogLevel","– указывает уровень логирования.","Возможные значения:","0\n\n\nВыключает логирование. Это значение по умолчанию.\n","1\n\n\nВключает режим полного логирования. Используйте этот режим для отладки.\n\n\n\nЕсли вы включите режим полного логирования, учтите, что сообщения журнала будут содержать конфиденциальные данные.\n\n\n\nKaspersky Scan Engine в режиме HTTP не удаляет автоматически файлы логов предыдущих инициализаций. При необходимости вы можете удалить эти файлы логов вручную.\n","LogFolder – указывает путь к директории, в которой хранятся файлы журналов.","Путь может быть абсолютным или относительным. Относительный путь вычисляется относительно директории, содержащей бинарный файл kavhttpd.","Раздел SyslogLogging","Приведенные ниже настройки доступны только для операционных систем Linux.","SyslogEnabled","– указывает, отправляет ли Kaspersky Scan Engine сообщения системного журнала.","Возможные значения:","0\n\n\nВыключает отправку сообщений системного журнала. \n","1\n\n\nВключает отправку сообщений системного журнала.\n\n\n\nЕсли вы разрешаете отправку сообщений системного журнала, учтите, что эти сообщения будут содержать конфиденциальные данные, такие как личные данные, определенные GDPR, данные конфигурации продукта и информацию о лицензировании.\n","Раздел SyslogDestination","Этот элемент содержит группу настроек, определяющих формат журналов. Если необходимо записывать журналы в разные места, вы можете указать несколько элементов SyslogDestination. В этом случае значения подэлементов SyslogTarget должны различаться.","Если SyslogEnabled (см. выше) имеет значение 1, вы должны включить хотя бы один элемент SyslogDestination.","SyslogFormat","– указывает формат сообщений системного журнала.","Возможные значения:","cef – указывает формат cef сообщений системного журнала.","raw – указывает формат raw сообщений системного журнала. Значение raw используется, когда значение, указанное в этом элементе, не является cef или raw, или если в этом элементе не указано значение, или если файл конфигурации логирования не содержит параметр SyslogFormat.","SyslogTarget","– задает адрес назначения для сообщений системного журнала.","Возможные значения:","%PROTOCOL%%IP%:%PORT%",", где:","%PROTOCOL% – сетевой протокол (используйте tcp:// или udp:// для этого значения). ","%IP% – IPv4-адрес, который получает сообщения системного журнала. ","%PORT% – порт, который получает сообщения системного журнала.","Если вы не укажете протокол, как описано выше, Kaspersky Scan Engine будет использовать протокол UDP.","localhost – указывает, что сообщения системного журнала перенаправляются в syslogd.","Путь к директории, в которой хранятся файлы с сообщениями системного журнала. Путь должен начинаться с /var/log/kaspersky.","Директория содержит файл httpd_kav_syslog.log. Файлы с сообщениями системного журнала, созданные предыдущими сеансами, не удаляются. Если в директории есть старый файл, Kaspersky Scan Engine записывает в этот файл новую информацию, не удаляя старые данные.","SyslogEvents","– определяет события, которые необходимо зарегистрировать.","Допускается указывать несколько значений SyslogEvents. Каждое из этих значений устанавливает тип события, которое будет зарегистрировано в местоположении, указанном в атрибуте SyslogTarget. Если вы указываете несколько значений для одного места назначения, разделите их символом точки с запятой (;).","Возможные значения:","Audit – указывает события аудита системы.","Init – указывает события инициализации службы. ","Deinit – указывает события деинициализации службы и сторожевые события. ","Update – указывает события обновления и перезагрузки антивирусных баз.","License – указывает события, связанные с лицензией.","Engine - указывает события антивирусного движка. Эти события могут часто публиковаться.","ScanResultClean – указывает события завершения сканирования, когда сканируемый объект считается безопасным.","ScanResultDetect – указывает события завершения сканирования при обнаружении угрозы.","ScanResultOther – указывает события завершения сканирования, когда объект не сканировался.","Если элемент SyslogDestination не содержит дочернего элемента SyslogEvents, регистрируются все события HTTP.","Если настройки SyslogDestination неверны, логирование в указанное место назначения будет выключено.","Когда логирование системного журнала включено, также включается аудит системы. Если ни один из элементов SyslogEvents не содержит события Audit, настройки аудита системы устанавливаются следующим образом: для SyslogFormat задано значение raw, для SyslogTarget задано значение localhost, а для SyslogEvents задано значение audit.","Kaspersky Scan Engine может вести логи отладки и отправлять сообщения системного журнала одновременно или по отдельности.","Структура файла конфигурации логирования","Ниже приведен пример файла конфигурации логирования:","[DebugLogging]","LogLevel=0","LogFolder=logs","[SyslogLogging]","SyslogEnabled=0","[SyslogDestination]","SyslogFormat=raw","SyslogTarget=localhost","SyslogEvents=audit;init;deinit;update;license;engine","[SyslogDestination]","SyslogFormat=cef","SyslogTarget=/var/log/kaspersky/kse_udp_lic_events","SyslogEvents=license;update"," Настройка логирования в режиме HTTP ","179879.htm"));
Page.push(new Array("Мониторинг Kaspersky Scan Engine в режиме HTTP","Когда мониторинг включен, служба kavhttpd автоматически перезапускается в случае зависания или сбоя.","Если логирование включено вместе с мониторингом, процесс мониторинга записывает сообщения журнала в отдельный файл.","Чтобы включить мониторинг:","Установите параметр -w в команде запуска в файле модуля systemd для службы kavhttpd.","Перезапустите Kaspersky Scan Engine, выполнив следующую команду: \n\nservice kavhttpd restart\n\n\n\n ","Смотрите также информацию о редактировании файла модуля."," Мониторинг Kaspersky Scan Engine в режиме HTTP ","179880.htm"));
Page.push(new Array("Использование прокси-сервера","Kaspersky Scan Engine может использовать прокси-сервер для подключения к облачным службам \"Лаборатории Касперского\".","Если в файле конфигурации режима HTTP указан прокси-сервер, Kaspersky Scan Engine выполняет следующие действия:","Kaspersky Scan Engine пытается установить прямое соединение с местом назначения.\nОбратите внимание, что это происходит, даже если указан прокси-сервер. ","Если установить прямое соединение не удается, Kaspersky Scan Engine пытается установить соединение с помощью указанного прокси-сервера.","Если не удается установить соединение с прокси-сервером, Kaspersky Scan Engine использует только офлайн-технологии.\nОбратите внимание, что это также происходит, когда проблемы с сетью не позволяют установить соединение с прокси-сервером. В этом случае Kaspersky Scan Engine через определенные промежутки времени пытается установить соединение с прокси-сервером. Если соединение установлено до истечения определенного времени, Kaspersky Scan Engine использует онлайн-технологии. \n ","Чтобы использовать новые настройки прокси-сервера, необходимо перезапустить Kaspersky Scan Engine.","Kaspersky Scan Engine не выводит информацию об использовании онлайн- и офлайн-технологий в командную строку. Вы должны проанализировать файлы логов, чтобы получить эту информацию.","Смотрите также информацию о включении логирования и указании прокси-сервера."," Использование прокси-сервера ","179881.htm"));
Page.push(new Array("Обновление антивирусных баз в режиме HTTP","В конфигурации по умолчанию Kaspersky Scan Engine использует антивирусные базы из директории ./bin/bases. Вы можете обновить антивирусные базы, отправив сигнал или HTTP-запрос в Kaspersky Scan Engine.","При обновлении антивирусных баз Kaspersky Scan Engine передает в \"Лабораторию Касперского\" зашифрованную строку user agent. Вы также можете посмотреть полный список данных, которые передаются в \"Лабораторию Касперского\" при обновлении.","Обновление антивирусных баз по запросу","Если вы хотите обновить антивирусные базы вручную, используйте обновление по запросу.","Чтобы обновить антивирусные базы по запросу с помощью сигналов:","Перед запуском службы kavhttpd укажите настройку обновления в kavhttpd.xml.","Запустите службу kavhttpd.","Отправьте сигнал SIGUSR2 службе kavhttpd.\nЕсли клиент и Kaspersky Scan Engine установлены и работают на одном компьютере, вы можете отправить HTTP-запрос на адрес /api/v3.0/update/start для обновления антивирусных баз. Если вы пошлете этот запрос c другого компьютера, Kaspersky Scan Engine вернет ошибку 405 Method Not Allowed. Если обновление антивирусных баз было успешно начато, ответ HTTP будет содержать следующий объект JSON: \n\n{\n\"status\": \"update started\"\n} \n\n\n\n \nЧтобы узнать, как отслеживать статус обновления антивирусных баз, см. подраздел \"Получение статуса обновления антивирусных баз\" ниже. ","Чтобы обновить антивирусные базы по запросу с помощью примера HTTP-клиента,","вызовите пример HTTP-клиента с параметром -d:","kavhttp_client -j -d","Чтобы обновить антивирусные базы по запросу в Windows,","вызовите пример HTTP-клиента с параметром -d:","kavhttp_client.exe -j -d","Смотрите также подробную информацию о планировании автоматического обновления.","Получение статуса обновления антивирусных баз","Если вы хотите получить статус обновления антивирусных баз, отправьте GET-запрос по адресу /api/v3.0/update/status или по адресу /api/v3.1/update/status.","Вы можете отправить этот запрос, только если клиент и Kaspersky Scan Engine установлены и работают на одном компьютере.","Когда Kaspersky Scan Engine получает запрос, он возвращает ответ в следующем формате:","{","\"status\": \"%UPDATE_STATUS%\",","\"progress\": \"%UPDATE_PROGRESS%\",","\"last_update_result\": \"%UPDATE_RESULT%\",","\"last_update_time\": \"%UPDATE_TIME%\",","}","Здесь:","status","– текущий статус обновления. Статус может иметь следующие значения:","\"in progress\"","\"not started\"","progress – прогресс обновления антивирусных баз в процентах.","Этот элемент включается в ответ только в том случае, если обновление выполняется в данный момент (то есть если элемент status имеет значение \"in progress\").","last_update_result","– результат последнего обновления. Статус может иметь следующие значения:","\"success\"","\"all components are up to date\"","\"invalid update sources\"","\"not all components are updated\"","\"download error\"","\"error while updating\"","\"error %ERROR_CODE% occurred\", где %ERROR_CODE% – это код ошибки, полученный от Kaspersky Scan Engine","Этот элемент включается в ответ только в том случае, если обновление не выполняется в данный момент (то есть если элемент status имеет значение \"not started\").","last_update_time – это дата и время последнего обновления в следующем формате: %hh%:%mm%:%ss% %DD%.%MM%.%YYYY%.","Этот элемент включается в ответ только в том случае, если обновление не выполняется в данный момент (то есть если элемент status имеет значение \"not started\").","Дополнительные поля в протоколе KAV версии 3.1","Если вы отправите GET-запрос на адрес /api/v3.1/update/status, вы сможете получить дополнительную информацию о процессе обновления антивирусных баз. Некоторые обновления базы данных можно использовать только после перезагрузки операционной системы или перезапуска Kaspersky Scan Engine. В этом случае ответ имеет расширенный формат:","{","\"status\": \"%UPDATE_STATUS%\",","\"progress\": \"%UPDATE_PROGRESS%\",","\"last_update_result\": \"%UPDATE_RESULT%\",","\"last_update_time\": \"%UPDATE_TIME%\",","\"action_needed\": \"%ACTION_NEEDED%\",","\"action_apply_period\": \"%APPLY_PERIOD%\"","}","Здесь:","%ACTION_NEEDED%","– действие, которое необходимо выполнить, прежде чем вы сможете применить обновления. Статус может иметь следующие значения:","Product restart needed\n\n\nЭто означает, что вы должны перезапустить Kaspersky Scan Engine.\n","OS reboot needed\n\n\nЭто означает, что вы должны перезагрузить операционную систему, в которой работает Kaspersky Scan Engine.\n","%APPLY_PERIOD% – рекомендуемый период (в часах) для выполнения действия, указанного в %ACTION_NEEDED%.","Это действие не выполняется автоматически, вы должны выполнить его самостоятельно."," Обновление антивирусных баз в режиме HTTP ","179882.htm"));
Page.push(new Array("Использование примера HTTP-клиента","В этом разделе объясняется, как использовать пример HTTP-клиента из командной строки. Пример HTTP-клиента находится в %service_dir%/bin.","В этом разделе объясняется, как использовать исполняемый файл примера HTTP-клиента. Объяснение реализации примера HTTP-клиента выходит за рамки данной документации. Исходный код примера HTTP-клиента находится в директории /samples/kavhttp пакета распространения Kaspersky Scan Engine.","О примере HTTP-клиента","Пример HTTP-клиента – это консольное приложение, демонстрирующее, как реализовать клиент для Kaspersky Scan Engine в режиме HTTP. Вы также можете использовать его для сканирования файлов из консоли.","Пример HTTP-клиента отправляет HTTP-запросы к Kaspersky Scan Engine. Он поддерживает TCP-соединения (Windows и Linux) и соединения через UNIX-сокеты (только Linux), а также может передавать пути к файлам или их содержимое в Kaspersky Scan Engine.","Когда Kaspersky Scan Engine завершает сканирование файлов, он отправляет ответ примеру HTTP-клиента. Пример HTTP-клиента выводит результат сканирования в стандартный вывод."," Использование примера HTTP-клиента ","179883.htm"));
Page.push(new Array("Синтаксис и параметры для HTTP-клиента","Вы можете указать один или несколько параметров для примера HTTP-клиента.","Options","В примере HTTP-клиента доступны следующие параметры:","Параметры для запуска примера HTTP-клиента","Параметр","Описание","-s","Задает адрес Kaspersky Scan Engine или путь к Unix-сокету. Строку подключения можно указывать в кавычках или без них. Если этот параметр не указан, используется Unix-сокет по умолчанию /tmp/.kavhttpd.","UNIX-сокеты поддерживаются только в системах Linux.","-t","Задает время ожидания обработки запроса в миллисекундах.","-u","Задает URL-адрес для сканирования.","Одновременно можно указать только один URL-адрес.","-i","Задает IP-адрес (IPv4 или IPv6) узла, на который ссылается URL-адрес. Этот параметр можно использовать только с -u .","Указание IP-адреса увеличивает коэффициент обнаружения Kaspersky Scan Engine.","-f","Включает режим сканирования файлов.","-c","Задает контекст задачи сканирования. Если указан этот параметр, запрос должен иметь заголовок X-KAV-ObjectURL, содержащий значение параметра, без кавычек.","--req","Задает путь к файлу с заголовками запросов, которые были получены из HTTP-трафика для проверяемого объекта.","--resp","Задает путь к файлу с заголовками ответов, которые были получены из HTTP-трафика для проверяемого объекта.","-b","Показывает дату выпуска антивирусных баз. Вы можете использовать этот параметр, чтобы проверить, запущен ли kavhttpd. Может использоваться с параметрами -s, -t и -j.","-v","Показывает текущую версию KAV SDK Вы можете использовать этот параметр, чтобы проверить, запущен ли kavhttpd. Может использоваться с параметрами -s, -t и -j.","-l","Показывает информацию о текущем файле ключа. Вы можете использовать этот параметр, чтобы проверить, запущен ли kavhttpd. Может использоваться с параметрами -s, -t и -j.","-h","Показывает справочную информацию.","-j","Выполняет HTTP-запрос в формате JSON.","-d","Выполняет HTTP-запрос на запуск обновления антивирусных баз. Может использоваться с параметрами -s, -t и -j.","-p","Показывает статус процесса обновления антивирусных баз. Может использоваться с параметрами -s, -t и -j.","‑‑getstat","Получает накопленную статистику. Может использоваться с параметрами -s, -t и -j.","‑‑clearstat","Очищает накопленную статистику. Может использоваться с параметрами -s, -t и -j.","-o","При выполнении HTTP-запроса в формате JSON пропускает объекты с результатом сканирования CLEAN из массива subObjectsScanResults в ответном сообщении. Может использоваться только с параметром -j.","--cipher","Задает набор шифров, который должен использоваться для обмена с kavhttpd.","В TLS 1.2 поддерживаются следующие наборы шифров:","ECDHE-ECDSA-AES256-GCM-SHA384","ECDHE-ECDSA-AES256-SHA384","ECDHE-ECDSA-AES128-GCM-SHA256","ECDHE-ECDSA-AES128-SHA256","ECDHE-RSA-AES256-GCM-SHA384","ECDHE-RSA-AES256-SHA384","ECDHE-RSA-AES128-GCM-SHA256","ECDHE-RSA-AES128-SHA256","ECDHE-RSA-CHACHA20-POLY1305","DHE-RSA-AES256-GCM-SHA384","DHE-RSA-AES256-SHA256","DHE-RSA-AES128-SHA256","DHE-RSA-CHACHA20-POLY1305","В TLS 1.3 поддерживаются следующие наборы шифров:","TLS_AES_256_GCM_SHA384","TLS_CHACHA20_POLY1305_SHA256","TLS_AES_128_GCM_SHA256","По умолчанию используется следующее значение: ECDHE-ECDSA-AES256-GCM-SHA384.","‑-check‑period","Проверяет, соответствует ли срок действия сертификата текущей дате в зависимости от часового пояса.","По умолчанию проверка не выполняется.","‑-check‑subject","Проверяет, совпадает ли имя субъекта сертификата (поля SubjectAltNames и Common Name) с доменным именем сервера.","--check‑chain","Проверяет сертификат по пути сертификации.","--ca-path","Задает полный путь к директории, в которой хранятся сертификаты CA. Сертификат из указанной директории используется для проверки действительности сертификата TLS и его конфигурации.","Если этот параметр не указан, HTTP-клиент использует следующие пути:","/etc/pki/tls/certs","/etc/ssl/certs","Чтобы использовать параметр --ca-path, подготовьте директорию, содержащую сертификаты, как описано в примерах синтаксиса.","--ca-cert","Задает полный путь к директории, в которой хранится пакет CA. Пакетный файл используется для проверки действительности сертификата TLS и его конфигурации.","Если этот параметр не указан в операционной системе Linux, HTTP-клиент использует один из следующих файлов (в зависимости от того, какой из них будет найден первым):","/etc/ssl/certs/ca-certificates.crt","/etc/pki/tls/certs/ca-bundle.crt","/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem","/etc/ssl/ca-bundle.pem","‑‑repeat‑timeout REPEAT_TIMEOUT","Указывает, что сканирование объектов будет повторяться не менее REPEAT_TIMEOUT секунд.","Если аргумент не указан, все объекты будут просканированы один раз. В противном случае сканирование будет выполняться не менее указанного количества секунд.","--quiet","Результаты сканирования не отображаются.","‑‑threads THREADS (=1)","Задает количество потоков для параллельного сканирования файлов.","-m [ ‑‑measure ]","Измеряет и отображает следующее:","Время сканирования в формате %H:%M:%S.%ms.","Накопленная статистика сканирования до и после сканирования.","--auth-field","Указывает имя поля заголовка запроса, используемого для аутентификации.","Если не указано иное, по умолчанию используется имя Authorization.","--access-token","Указывает значение токена API, используемого для аутентификации.","Объедините эту опцию с --auth-field.","--add-bearer-prefix","Добавляет префикс Bearer к значению токена API, указанному в --access-token.","Объедините эту опцию с --access-token.","Тип соединения","Пример HTTP-клиента поддерживает два типа соединения:","TCP-соединение\nЧтобы использовать TCP-соединение, укажите IP-адрес в параметре -s в следующем формате: \"ip_addr:port\". ","Соединение через UNIX-сокет (только для Linux)\nЧтобы использовать UNIX-сокет, укажите путь к сокету в параметре -s. \nЭтот параметр используется по умолчанию. Файл сокета по умолчанию /tmp/.kavhttpd. ","Тайм-аут","Пример HTTP-клиента использует значение, указанное в параметре -t, для определения тайм-аута сканирования, аналогично заголовку X-KAV-Timeout.","Значение тайм-аута по умолчанию 2000.","Если в этом параметре указано 0, тайм-аут бесконечен.","Режим сканирования","Пример HTTP-клиента поддерживает два режима проверки, которые можно указать с помощью параметра -f:","режим сканирования файлов (-f).\nВ этом режиме пример HTTP-клиента передает пути к файлам в Kaspersky Scan Engine, который читает файлы и проверяет их. \nЧтобы отправить запрос на сканирование на удаленный компьютер через TCP-сокет, вы должны указать пути к файлам, которые вы хотите сканировать, или директориям, которые содержат эти файлы. Вам не нужно этого делать, если пример HTTP-клиента и Kaspersky Scan Engine находятся на одном компьютере. ","режим сканирования памяти (по умолчанию).\nВ этом режиме пример HTTP-клиента передает содержимое файла в Kaspersky Scan Engine, который сканирует содержимое. \nИспользуйте только режим очистки KAV_SKIP с режимом сканирования памяти. Kaspersky Scan Engine не может лечить или удалять файлы в этом режиме. ","Контекст задачи сканирования","Kaspersky Scan Engine использует контекст задачи сканирования для повышения коэффициента обнаружения. Использование этого параметра не влияет на производительность сканирования.","Рекомендуется использовать контекст задачи сканирования при интеграции типа gateway.","Используйте следующий формат для контекста:","Если объект для сканирования был получен из Интернета, укажите URL источника, включая протокол,\nПример: http://example.com \nПоддерживаются протоколы HTTP, HTTPS и FTP. Если исходный URL-адрес неизвестен, рекомендуется использовать http://example.com в качестве контекста задачи сканирования. ","Если объект для проверки был получен по электронной почте, укажите адрес отправителя. Используйте следующий формат: [from:%sender_address%].\nПример: [from:example@example.com] ","Если объект получен по электронной почте, но адрес отправителя неизвестен, рекомендуется использовать [from:test@relay.example] в качестве контекста задачи сканирования.","Контекст задачи сканирования применим только к сканированию файлов. Если вы укажете контекст задачи сканирования для URL-адреса, он будет проигнорирован.","Заголовки запросов и ответов","Указание заголовков запросов и ответов, собранных из HTTP-трафика, относящегося к проверяемому объекту, повышает коэффициент обнаружения. Рекомендуется использовать заголовки запроса и ответа при интеграции  типа gateway.","Информационные сообщения","Параметры -b, -v и -l можно использовать только вместе с параметрами -s, -j и -t. Если вы используете их с любым другим параметром, kavhttp_client вернет ошибку.","Вы можете использовать параметры -b, -v и -l, чтобы проверить, запущен ли kavhttpd.","Сканирование файлов","Вы можете указать один или несколько файлов для сканирования, разделив их пробелом. В зависимости от режима сканирования, пример HTTP-клиента затем передает пути к этим файлам или их содержимому в Kaspersky Scan Engine.","Также вы можете указать директорию, в которой хранятся файлы. Все файлы, находящиеся внутри этой директории и всех вложенных в нее директорий, будут просканированы.","Используйте следующий синтаксис для сканирования файлов в режиме сканирования файлов:","./kavhttp_client [-s <ip:port | unix-socket>] [-t <timeout>] [-c <context>] [--req <req_file>] [--resp <resp_file>] -f <file1> [<file2>...]","Используйте следующий синтаксис для сканирования содержимого файлов в режиме сканирования памяти:","./kavhttp_client [-s <ip:port | unix-socket>] [-t <timeout>] [-c <context>] [--req <req_file>] [--resp <resp_file>] <file1> [<file2>...]","Сканирование URL-адресов","Вы можете указать URL-адрес для сканирования. Если URL-адрес содержит пробелы или табуляции, заключите URL-адрес в кавычки или используйте URL-кодирование. Аналогичным образом, если URL-адрес содержит кавычки (\"), используйте URL-кодирование.","Одновременное сканирование нескольких URL-адресов не поддерживается. Если вы укажете более одного URL-адреса, будет сканироваться только первый.","Файлы не могут быть просканированы, если указан параметр -u. Параметры -u и -f нельзя использовать вместе.","Используйте следующий синтаксис для сканирования URL-адреса:","./kavhttp_client [-s <IP:port | unix-socket>] [-t <timeout>] [-i <IP>] -u <URL>"," Синтаксис и параметры для HTTP-клиента ","179884.htm"));
Page.push(new Array("Примеры синтаксиса","В этом разделе приведены примеры использования HTTP-клиента из командной строки.","Сканирование файлов и URL-адресов","Использовать UNIX-сокет по умолчанию для сканирования одного файла, передав его содержимое:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client eicar.txt","Использовать UNIX-сокет по умолчанию для сканирования одного файла, передав путь к файлу:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f eicar.txt","Подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать два файла, передав их содержимое:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -s 192.0.2.42:9999 eicar.txt test.sh","Подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать два файла, передав их содержимое с 10-секундным тайм-аутом:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -s 192.0.2.42:9999 -t 10000 eicar.txt test.sh","Подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать файл, передав путь к нему:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s 192.0.2.42:9999 /mnt/to_scan/eicar.txt","Подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать URL-адрес:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -s 192.0.2.42:9999 -u http://example.com","Подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать URL-адрес с IP-адресом хоста, на который ссылается URL-адрес:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -s 192.0.2.42:9999 -i 233.252.0.1 -u http://bug.qainfo.ru/TesT/Aphish_w","Подключиться к Kaspersky Scan Engine через TCP-сокет и запросить дату выпуска антивирусных баз:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client –b -s 192.0.2.42:9999","Сканирование файлов и URL-адресов после авторизации с помощью токена API","Авторизоваться с помощью токена API, подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать файл, передав путь к файлу:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://192.0.2.42:443/mnt/to_scan/eicar.txt --auth-field --access-token Ab345-KAV","Авторизоваться с помощью токена API, подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать URL-адрес:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -s https://192.0.2.42:443 -u http://example.com --auth-field --access-token Ab345-KAV","Авторизоваться с помощью токена API и схемы аутентификации Bearer, подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать файл, передав путь к файлу:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://192.0.2.42:443 /mnt/to_scan/eicar.txt --auth-field --add-bearer-prefix --access-token Ab345-KAV","Авторизоваться с помощью токена API и схемы аутентификации Bearer, подключиться к Kaspersky Scan Engine через TCP-сокет и просканировать URL-адрес:","user@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -s https://192.0.2.42:443 -u http://example.com -auth-field --add-bearer-prefix --access-token Ab345-KAV","Сканирование файлов и URL-адресов и проверка сертификата TLS","В Linux, чтобы использовать параметр --ca-path, подготовьте директорию, содержащую сертификаты:","openssl rehash /mnt/your-cert-dir/","В Windows, чтобы использовать параметр --ca-path, вы должны назвать файлы сертификатов в директории поиска следующим образом: <hash>.0, <hash>.1, <hash>.2 и т. д., где <hash> – это хеш файла (например, d93f38c8.0).","Чтобы получить хеш файла, используйте следующую команду:","openssl.exe x509 -hash -noout -in \"full path to the certificate file\"","Просканировать файл и указать полный путь к пакету сертификатов:","В Windows:\n\n%service_dir%\\bin\\kavhttp_client -f -s https://127.0.0.1:443 C:\\eicar.txt -j --ca-cert C:\\your-cert-dir\\CertificateFile.cert\n\n\n\n ","В Linux:\n\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://127.0.0.1:443 /mnt/to_scan/eicar.txt --ca-cert /mnt/your-cert-dir/CertificateFile.cert\n\n\n\n ","Просканировать URL-адрес и указать путь к папке, содержащей файл сертификата:","В Windows:\n\n%service_dir%\\bin\\kavhttp_client -s https://127.0.0.1:443 –u https://example.com -j --ca-path C:\\your-cert-dir\\\n\n\n\n ","В Linux:\n\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -s https://127.0.0.1:443 –u https://example.com --ca-path /mnt/your-cert-dir/\n\n\n\n ","Просканировать файл и указать параметры проверки сертификата:","В Windows:\n\n%service_dir%\\bin\\kavhttp_client -f -s https://127.0.0.1:443 C:\\eicar.txt -j --check-period\n%service_dir%\\bin\\kavhttp_client -f -s https://127.0.0.1:443 C:\\eicar.txt -j --check-subject\n%service_dir%\\bin\\kavhttp_client -f -s https://127.0.0.1:443 C:\\eicar.txt -j --check-chain\n\n\n\n ","В Linux:\n\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://127.0.0.1:443 /mnt/to_scan/eicar.txt --check-period\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://127.0.0.1:443 /mnt/to_scan/eicar.txt --check-subject\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://127.0.0.1:443 /mnt/to_scan/eicar.txt --check-chain\n\n\n\n ","Просканировать файл и указать параметры проверки сертификата одной командой:","В Windows:\n\n%service_dir%\\bin\\kavhttp_client -f -s https://127.0.0.1:443 C:\\eicar.txt -j --check-period --check-subject --check-chain --ca-path C:\\your-cert-dir\\\n\n\n\n ","В Linux:\n\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://127.0.0.1:443 /mnt/to_scan/eicar.txt --check-period --check-subject --check-chain --ca-path /mnt/your-cert-dir/\n\n\n\n ","Просканировать файл и проверить пакет сертификатов и файл сертификата:","В Windows:\n\n%service_dir%\\bin\\kavhttp_client -f -s https://127.0.0.1:443 C:\\eicar.txt -j --ca-path C:\\your-cert-dir\\ --ca-cert C:\\your-cert-dir\\CertificateFile.cert\n\n\n\n ","В Linux:\n\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s https://127.0.0.1:443 /mnt/to_scan/eicar.txt --ca-path /mnt/your-cert-dir/ --ca-cert /mnt/your-cert-dir/CertificateFile.cert\n\n\n\n "," Примеры синтаксиса ","179885.htm"));
Page.push(new Array("Результаты сканирования для HTTP-клиента","Для каждого просканированного файла пример HTTP-клиента выводит результат сканирования, в котором указывается, считается ли просканированный объект незараженным или вредоносным.","Возможны следующие результаты сканирования:","CLEAN","Просканированный объект считается незараженным.","DETECT","Просканированный объект считается вредоносным. За результатом сканирования следует имя обнаруженного объекта или тип обнаруженного URL-адреса.","Kaspersky Scan Engine обнаруживает URL-адреса следующих типов:","Вредоносные URL-адреса. При обнаружении такого URL-адреса Kaspersky Scan Engine возвращает DETECT MALICIOUS_URL. Приоритет этого типа – 1 (высший приоритет).","Фишинговые URL-адреса. При обнаружении такого URL-адреса Kaspersky Scan Engine возвращает DETECT PHISHING_URL. Приоритет этого типа – 2.","URL-адреса рекламного ПО. При обнаружении такого URL-адреса Kaspersky Scan Engine возвращает DETECT ADWARE_URL. Приоритет этого типа – 3.\n\n\nURL-адрес этого типа может быть обнаружен только при включенной облачной защите. ","URL-адреса, ведущие к легальным программам, которые могут быть использованы злоумышленниками для нанесения вреда компьютеру или данным пользователя При обнаружении такого URL-адреса Kaspersky Scan Engine возвращает DETECT RISKWARE_URL. Приоритет этого типа – 4 (низший приоритет).\n\n\nURL-адрес этого типа может быть обнаружен только при включенной облачной защите. ","URL-адрес может принадлежать одновременно нескольким типам. В этом случае Kaspersky Scan Engine возвращает результат проверки DETECT с наивысшим приоритетом.","DISINFECTED","Просканированный объект успешно вылечен.","DELETED","Просканированный объект удален.","Если просканированный объект содержит макросы, к результату проверки этого файла добавляется \"AND CONTAINS OFFICE MACRO\".","Ниже приведен образец вывода, создаваемого примером HTTP-клиента:","./kavhttp_client test.sh service.sh eicar.txt","Server address: /tmp/.kavhttpd","Network timeout: 2000","Scan mode: scanmemory","Scan file: test.sh","CLEAN","Scan file: service.sh","CLEAN","Scan file: eicar.txt","DETECT EICAR-Test-File","Если операция сканирования завершилась неудачно, результат сканирования будет содержать один из следующих кодов ошибки:","NON_SCANNED\nУказанный объект не просканирован. Причина этого также указывается.\n","SERVER_ERROR\nПроизошла ошибка в Kaspersky Scan Engine.\n","CONNECTION_CLOSED\nKaspersky Scan Engine прервал подключение.\n","CLIENT_TIMEOUT\nПревышен тайм-аут операции. Это происходит, когда превышен тайм-аут клиента.\n","CONNECTION_FAILED\nНе удалось установить соединение с Kaspersky Scan Engine.\n","HTTP_ERROR\nКод состояния HTTP, полученный от сервера, отличается от 200. Также предоставляется код состояния HTTP и его описание.\n"," Результаты сканирования для HTTP-клиента ","179886.htm"));
Page.push(new Array("Сообщения об ошибках подключения HTTP-клиента","При возникновении ошибки подключения HTTP-клиент выводит сообщение об ошибке на консоль.","Invalid response \nСоединение было прервано, когда клиент ждал ответа от сервера. После этой ошибки клиент завершает работу.\n","За Invalid response следует CONNECTION_CLOSED\nСоединение было прервано, когда клиент передавал файл для сканирования на сервер. ","За Invalid response следует CLIENT_TIMEOUT\nПревышен тайм-аут клиента (определенный параметром -t). ","HTTP_ERROR 408 Request Timeout\nПревышен тайм-аут обработки (определенный параметром SessionTimeout).\n"," Сообщения об ошибках подключения HTTP-клиента ","179887.htm"));
Page.push(new Array("Сборка исполняемых файлов для службы HTTP и клиента HTTP","Вы можете скомпилировать службу kavehttpd и пример HTTP-клиента из исходного кода, расположенного в директории %service_dir%/samples/kavhttp/.","Требования к установленному ПО","Чтобы скомпилировать службу kavehttpd и пример HTTP-клиента, вы должны установить на свой компьютер следующее программное обеспечение:","Boost 1.72.0 или более поздней версии. Исходные файлы службы kavehttpd динамически связываются с Boost, для чего требуется пакет boost-devel.\nБиблиотеки Boost должны компилироваться статически. Вы можете найти список необходимых библиотек Boost в %service_dir%/samples/kavhttp/Makefile. ","Библиотека OpenSSL. Рекомендуется установить пакет openssl-devel.","Библиотеки PostgreSQL с 6.4.4 по 7 (не включительно). Рекомендуется установить пакет libpqxx-devel.","Набор компиляторов GNU (GCC) 7.3.0 или более поздней версии. Используйте одну и ту же версию GCC для компиляции Boost и службы kavhttpd.","Компиляция Kaspersky Scan Engine и примера HTTP-клиента в Linux","Чтобы скомпилировать Kaspersky Scan Engine и пример HTTP-клиента в Linux:","Перейдите в директорию %service_dir%/samples/kavhttp/.","Запустите make.\nСкомпилированные исполняемые файлы клиента будут помещены в директорию %service_dir%/bin. Скомпилированные исполняемые файлы службы будут помещены в директорию %service_dir%/opt/kaspersky/ScanEngine/sdk8l3/bin/. ","В следующем примере демонстрируется сборка исполняемых файлов:","user@computer:/opt/kaspersky/ScanEngine# cd ./samples/kavhttp/","user@computer:/opt/kaspersky/ScanEngine/samples/kavhttp/# make","Kaspersky Scan Engine и пример HTTP-клиента в Windows","Чтобы скомпилировать Kaspersky Scan Engine и пример HTTP-клиента в Windows:","Перейдите в папку %service_dir%/samples/kavhttp/http_service/windows.","Сделайте следующее:","Если вы хотите скомпилировать службу kavehttpd, откройте файл kavhttpd.vcxproj в Microsoft Visual Studio 2017 и более поздних версий.","Если вы хотите скомпилировать пример HTTP-клиента, откройте файл kavhttp_client.vcxproj в Microsoft Visual Studio 2017 и более поздних версиях.","В Solution Explorer нажмите правой кнопкой мыши на проект и выберите пункт Properties.","В открывшемся окне свойств в дереве навигации слева выберите Configuration Properties > Linker > Input. Для свойства Additional Dependencies добавьте пути к библиотекам Boost, OpenSSL и PostgreSQL.","В навигационном дереве слева выберите Configuration Properties > С/C++. Для свойства Additional Include Directories добавьте заголовки библиотек Boost, OpenSSL и PostgreSQL.","В Solution Explorer нажмите правой кнопкой мыши на проект и выберите пункт Build.","Если вы используете Kaspersky Scan Engine GUI и планируете изменить предоставленные двоичные файлы, сначала получите предварительное одобрение на все изменения у своего персонального технического менеджера (ПТМ)."," Сборка исполняемых файлов для службы HTTP и клиента HTTP ","179888.htm"));
Page.push(new Array("Начало работы с Kaspersky Scan Engine в режиме ICAP","Этот раздел содержит информацию о том, как запустить Kaspersky Scan Engine в режиме ICAP.","Перед тем как вы начнете использовать Kaspersky Scan Engine, мы настоятельно рекомендуем вам ограничить доступ к файлам Kaspersky Scan Engine, в том числе к журналам, с помощью встроенных инструментов вашей операционной системы. Этот шаг поможет сделать вашу информацию более безопасной.","Чтобы начать пользоваться Kaspersky Scan Engine в режиме ICAP","Установите Kaspersky Scan Engine.\nKaspersky Scan Engine запускается автоматически после завершения установки. ","При необходимости настройте Kaspersky Scan Engine для использования в режиме ICAP.","Если вы настраиваете режим ICAP вручную (без использования инсталлятора) и используете режим лицензирования офлайн, вы должны поместить файл лицензии в директорию, указанную в элементе LicensePath файла конфигурации. Если вы используете режим лицензирования онлайн, вам необходимо указать код активации. Смотрите также подробную информацию о режимах лицензирования онлайн и офлайн.","При необходимости настройте правила службы.","При необходимости настройте логирование.\nОбратите внимание, что логирование снижает производительность Kaspersky Scan Engine. Обычно включать логирование нужно только во время интеграции или для отладки. ","При необходимости настройте переменные среды.","Обновите антивирусные базы или настройте периодичность обновления.","Проверьте возможности обнаружения Kaspersky Scan Engine.","Запустите Kaspersky Scan Engine в режиме ICAP."," Начало работы с Kaspersky Scan Engine в режиме ICAP  ","179890.htm"));
Page.push(new Array("Настройка правил сервиса","Эти правила определяют поведение Kaspersky Scan Engine в режиме ICAP. Они перечислены в файле конфигурации, расположенном в директории /opt/kaspersky/ScanEngine/icap_data/. Расположение этого файла указывается в параметре RulesFilePath файла конфигурации режима ICAP. Пример файла конфигурации kavicapd_gui_rules.conf включен в пакет распространения.","Каждое правило, указанное в файле конфигурации, должно быть помещено в отдельную строку.","Синтаксис правила","Правило службы kavicapd состоит из трех частей:","Режим ICAP","Возможные значения:","REQ\n\n\nРежим модификации запросов (REQMOD).\n","RESP\n\n\nРежим модификации ответов (RESPMOD).\n","ANY\n\n\nЛюбой из режимов, перечисленных выше.\n","Результат сканирования","Возможные значения перечислены ниже.","Возможные значения:","NON_SCANNED\n\n\nОбъект не просканирован.\n","FAILED\n\n\nОшибка сканирования.\n","PHISHING\n\n\nОбнаружен фишинговый веб-адрес.\n","DETECT\n\n\nПроверяемый объект или URL-адрес заражены.\n","MACRO\n\n\nОбнаружен документ Microsoft Office, содержащий макрос.\n","CLEAN\n\n\nПроверяемый объект безопасен (не заражен).\n","Ответ Kaspersky Scan Engine в режиме ICAP","Возможные значения:","SET_RESP=<response_template>\n\n\nKaspersky Scan Engine отправляет HTML-шаблон ответа с указанным именем на прокси-сервер.\n","EXEC_CMD=<script>\n\n\nKaspersky Scan Engine запускает скрипт с указанным именем.\n","NONE\n\n\nKaspersky Scan Engine не изменяет проверяемый объект.\n","Если ответ Kaspersky Scan Engine не указан в правиле, используется значение по умолчанию NONE.","Чтение результатов сканирования","В режиме ICAP Kaspersky Scan Engine проверяет как HTTP-трафик, так и веб-адреса, запрашиваемые пользователями. Результаты проверки ранжируются по степени серьезности, причем наиболее серьезному результату присваивается рейтинг 1. В следующем списке показано ранжирование поддерживаемых результатов сканирования по степени серьезности:","PHISHING","DETECT","MACRO","NON_SCANNED","FAILED","CLEAN","Если сканирования трафика и URL-адресов дают разные результаты, в качестве итогового результата сканирования выбирается результат с наивысшим уровнем критичности. Если оба результата проверки – DETECT, то итоговый результат проверки также будет DETECT, а имя обнаруженного объекта, возвращаемое Kaspersky Scan Engine, берется из результата проверки URL-адреса. Результаты проверки, используемые в правилах службы, являются итоговыми результатами проверки.","Примеры правил","Ниже приведены несколько примеров правил, которые вы можете указать:","RESP DETECT SET_RESP=detect_resp EXEC_CMD=admin_notify","RESP FAILED SET_RESP=err_resp","REQ FAILED EXEC_CMD=admin_notify","REQ CLEAN"," Настройка правил сервиса ","179893.htm"));
Page.push(new Array("Работа с шаблонами ответов и скриптами","Правила позволяют указать шаблоны ответов, которые будут возвращаться вместо заблокированных веб-страниц, а также скрипты, которые могут выполняться при обнаружении, например скрипт уведомления системного администратора.","Пакет распространения Kaspersky Scan Engine содержит образцы шаблонов ответов и пример скрипта, отправляющего информацию об инциденте в syslog.","Работа с шаблонами ответов","Kaspersky Scan Engine поставляется со следующими образцами шаблонов ответов, расположенными в директории /opt/kaspersky/ScanEngine/icap_data/templates:","detect_req \nЭтот шаблон возвращается, когда в режиме изменения запроса (REQMOD) обнаруживается угроза или тип легальной программы, которая может быть использована злоумышленниками для повреждения компьютера или личных данных пользователя. \n","detect_res \nЭтот шаблон возвращается, когда в режиме изменения ответа (RESPMOD) обнаруживается угроза или тип легальной программы, которая может быть использована злоумышленниками для повреждения компьютера или личных данных пользователя.\n","macro_req\nЭтот шаблон возвращается, когда в режиме REQMOD обнаруживается файл документа Microsoft Office, содержащий макрос.\n","macro_resp\nЭтот шаблон возвращается, когда в режиме RESPMOD обнаруживается файл документа Microsoft Office, содержащий макрос.\n","Вы можете создавать собственные шаблоны ответов и настраивать Kaspersky Scan Engine возвращать их вместе с измененным сообщением. Подобно образцам шаблонов ответов, пользовательские шаблоны ответов могут использовать контекст обнаружения, который предоставляет пользователю дополнительную информацию. Дополнительную информацию о контексте обнаружения см. в подразделе \"Использование контекста обнаружения в шаблонах ответов и скриптах\" ниже.","Несмотря на то что Kaspersky Scan Engine возвращает шаблоны ответов вместо заблокированных веб-страниц, некоторые браузеры могут не отображать эти шаблоны, вместо этого возвращая код состояния HTTP 403 Forbidden.","Работа со скриптами","Kaspersky Scan Engine поставляется со скриптом send_syslog, расположенным в директории /opt/kaspersky/ScanEngine/icap_data/scripts.","Скрипт send_syslog отображает сообщение об обнаруженном объекте и перенаправляет его в утилиту логирования logger.","Вы можете создавать собственные скрипты оболочки и настраивать Kaspersky Scan Engine выполнять их при обнаружении. Подобно примеру скрипта, пользовательские скрипты могут использовать контекст обнаружения, который предоставляет пользователю дополнительную информацию. Дополнительную информацию о контексте обнаружения см. в подразделе \"Использование контекста обнаружения в шаблонах ответов и скриптах\" ниже.","Пользовательские скрипты выполняются в параллельных потоках. Максимальное количество потоков сканирования – 100.","Использование контекста обнаружения в шаблонах ответов и скриптах","Шаблоны ответов и скрипты поддерживают контекст обнаружения. При отображении шаблона ответа контекстные переменные заменяются значениями, возвращаемыми Kaspersky Scan Engine. Чтобы использовать контекст обнаружения в скрипте, используйте контекстные переменные как переменные среды.","В контексте обнаружения поддерживаются следующие переменные:","_VirusName_ – имя обнаруженного объекта.","_DateTime_ – дата и время инцидента (в формате YYYY-MM-DD HH:MM:MS).","_ICAPDVersion_ – версия плагина ICAP. ","_URL_ – запрошенный URL-адрес.","Вы можете использовать контекст обнаружения в собственных шаблонах ответов и скриптах."," Работа с шаблонами ответов и скриптами ","179895.htm"));
Page.push(new Array("Настройка логирования в режиме ICAP","В этом разделе описано, как настроить логирование в режиме ICAP вручную без использования Kaspersky Scan Engine GUI.","В режиме ICAP Kaspersky Scan Engine может записывать свою активность. Параметры логирования задаются в файле конфигурации icapdkavlog.conf (далее – файл конфигурации логирования), расположенном в директории /opt/kaspersky/ScanEngine/bin.","Вы можете изменить параметры логирования после запуска службы kavicapd.","См. также подробные инструкции, как включить логирование.","Элементы файла конфигурации логирования","Logging – корневой элемент файла. Этот элемент имеет два дочерних элемента: DebugLogging и SyslogLogging.","Раздел DebugLogging","DebugLogging – это родительский элемент, который содержит параметры журналов, которые записываются непосредственно в файлы журналов и могут помочь идентифицировать сбои в работе службы.","Этот элемент имеет следующие дочерние элементы.","Level","– указывает уровень логирования.","Возможные значения:","none или non \n\n\nЛогирование выключено. ","debug или dbg\n\n\nУровень отладки. На этом уровне логирования Kaspersky Scan Engine регистрирует информацию, которая может помочь в выявлении проблем, например об изменении состояния соединения с прокси-сервером или возвращаемых значениях функций Kaspersky Scan Engine. ","Если вы включите уровень отладки журнала, учтите, что сообщения журнала будут содержать конфиденциальные данные.","Значение по умолчанию: none.","Target – родительский элемент для параметров, указывающих, куда должны записываться журналы.","File","– указывает, что журналы записываются непосредственно в файлы журналов. Он также определяет свойства файлов журнала.","Этот элемент имеет следующие атрибуты:","size_limit – указывает максимально возможный размер файла журнала в мегабайтах (МБ).\n\n\nЕсли значение этого атрибута равно 0, размер файла журнала не ограничен. \n\n\nЗначение по умолчанию: 0. ","folder – указывает директорию, в которой хранятся файлы журнала.\n\n\nПуть может быть абсолютным или относительным. Относительный путь определяется относительно директории, в которой расположен исполняемый файл kavicapd.  \n\n\nЗначение по умолчанию: ./logs. ","clear_folder – указывает, должен ли Kaspersky Scan Engine удалять старые журналы при инициализации.\n\n\nKaspersky Scan Engine удаляет старые файлы журналов, только если значение этого параметра равно 1, yes, true, on или enabled. Если значение этого параметра равно 0, no, false, off или disabled, Kaspersky Scan Engine не удаляет старые файлы журналов. Обратите внимание, что Kaspersky Scan Engine проверяет этот параметр и удаляет журналы при запуске службы. Если значение этого параметра равно 1, yes, true, on или enabled, когда служба уже запущена, файлы журнала не удаляются до перезапуска службы.  \n\n\nЗначение по умолчанию: 0. ","Сгенерированные файлы журналов имеют следующие имена: icapdkav_<pid>_<date_time>_<log_number>.log, где <pid> – это PID процесса, <date_time> – локальная системная дата в формате YYYY-MM-DDhhmmss, а <log_number> – номер журнала (этот параметр добавляется к имени файла, только если файл журнала icapdkav_<pid>_<date_time>.log уже существует).","Раздел SyslogLogging","SyslogLogging","– это родительский элемент, который содержит настройки для журналов, которые перенаправляются в","syslogd",".","Этот элемент имеет следующие дочерние элементы:","SyslogEnabled","– указывает, отправляет ли Kaspersky Scan Engine сообщения системного журнала.","Возможные значения:","0, false, no, off или disabled\n\n\n\n\nВыключает отправку сообщений системного журнала. ","Любое другое значение\n\n\n\n\nВключает отправку сообщений системного журнала. ","Если вы разрешаете отправку сообщений системного журнала, учтите, что эти сообщения будут содержать конфиденциальные данные, такие как личные данные, определенные GDPR, данные конфигурации продукта и информацию о лицензировании.","Syslog","определяет параметры, относящиеся к сообщениям системного журнала.","Этот элемент имеет следующие атрибуты:","destination","– задает адрес назначения для сообщений системного журнала.","Возможны следующие адреса назначения сканирования:","IP-адрес. В этом случае укажите значение %PROTOCOL%%IP%:%PORT%, где %PROTOCOL% – это сетевой протокол (используйте tcp:// или udp:// для этого значения), %IP% – это IPv4-адрес, на который приходят сообщения системного журнала, %PORT% – это порт, который принимает сообщения системного журнала. Если вы не укажете протокол, как описано выше, KAV SDK будет использовать протокол UDP.","Демон syslog. В этом случае укажите значение localhost для перенаправления сообщения syslog демону syslog.","Файл журнала. В этом случае укажите путь к директории, в которой будет создан файл журнала. Путь должен начинаться с /var/log/kaspersky. Файл журнала с сообщениями системного журнала, созданный в ходе предыдущих сеансов, не удаляется, и ICAP-плагин добавляет в этот файл новую информацию.","Если необходимо записывать журналы в разные места, вы можете указать несколько элементов Syslog. В этом случае значения атрибута destination этих элементов должны различаться.","format","– указывает формат сообщений системного журнала.","Возможные значения:","cef – указывает формат CEF сообщений системного журнала.","raw – указывает формат RAW сообщений системного журнала. Значение raw используется, когда значение, указанное в этом элементе, не является cef или raw, или если в этом элементе не указано значение, или если файл конфигурации логирования не содержит параметр SyslogFormat.","Syslog может иметь следующий дочерний элемент:","LoggedEvent","– определяет события, которые необходимо зарегистрировать.","Допускается указывать несколько значений LoggedEvent. Каждое из этих значений устанавливает тип события, которое будет зарегистрировано в местоположении, указанном в атрибуте destination.","Возможные значения:","Audit – указывает события аудита системы.","Init – указывает события инициализации службы. ","Deinit – указывает события деинициализации службы и сторожевые события. ","Update – указывает события обновления и перезагрузки антивирусных баз.","License – указывает события, связанные с лицензией.","Engine - указывает события антивирусного движка. Эти события могут часто публиковаться.","ScanResultClean – указывает события завершения сканирования, когда сканируемый объект считается безопасным.","ScanResultDetect – указывает события завершения сканирования при обнаружении угрозы.","ScanResultOther – указывает события завершения сканирования, когда объект не сканировался.","Если элемент Syslog не содержит дочернего элемента LoggedEvent, регистрируются все события ICAP.","Если настройки Syslog неверны, логирование в указанное место назначения будет выключено.","Когда логирование системного журнала включено, также включается аудит системы. Если ни один из элементов SyslogEvents не содержит события Audit, настройки аудита системы устанавливаются следующим образом: для SyslogFormat задано значение raw, для SyslogTarget задано значение localhost, а для SyslogEvents задано значение audit.","Kaspersky Scan Engine может вести логи отладки и отправлять сообщения системного журнала одновременно или по отдельности.","Структура файла конфигурации логирования","Ниже приведен пример файла конфигурации логирования:","<?xml version=\"1.0\"?>","<Logging>","<DebugLogging>","<Level>debug</Level>","<File size_limit=\"10\" folder=\"./logs/scanevents\" clear_folder=\"1\"/>","</DebugLogging>","<SyslogLogging>","<SyslogEnabled>1</SyslogEnabled>","<Syslog destination=\"udp://192.168.1.1\" format=\"cef\">","<LoggedEvent>ScanResultClean</LoggedEvent>","<LoggedEvent>ScanResultDetect</LoggedEvent>","</Syslog>","<Syslog destination=\"localhost\" format=\"raw\">","<LoggedEvent>ScanResultOther</LoggedEvent>","</Syslog>","<Syslog destination=\"/opt/kav/sdk8l3/logs\" format=\"raw\">","<LoggedEvent>Audit</LoggedEvent>","<LoggedEvent>Engine</LoggedEvent>","</Syslog>","</SyslogLogging>","</Logging>"," Настройка логирования в режиме ICAP ","179896.htm"));
Page.push(new Array("Указание путей к плагинам и библиотекам","Прежде чем служба kavicapd будет готова к запуску, необходимо указать следующие пути:","Путь к плагину\nПуть к директории с файлами плагина PPL. ","Путь к библиотеке\nПуть к директории с общими библиотеками. ","Пути к плагинам и общим библиотекам можно указать, экспортировав переменные среды KL_PLUGINS_PATH и LD_LIBRARY_PATH соответственно.","Переменные KL_PLUGINS_PATH и LD_LIBRARY_PATH можно экспортировать вручную или автоматически с помощью файла модуля ICAP systemd. Вы также можете использовать сценарий оболочки kavicapd.sh, который экспортирует KL_PLUGINS_PATH и LD_LIBRARY_PATH и запускает службу kavicapd.","Указание пути к плагинам и библиотекам вручную","Этот метод требует экспорта переменных каждый раз перед запуском службы kavicapd в новом сеансе (переменные существуют только во время текущего сеанса оболочки).","В следующем примере показано, как экспортировать переменные вручную:","[user@host ~]$ export KL_PLUGINS_PATH=\"/opt/kaspersky/ScanEngine/ppl\"","[user@host ~]$ export LD_LIBRARY_PATH=\"/opt/kaspersky/ScanEngine/lib:${KL_PLUGINS_PATH}:${LD_LIBRARY_PATH}\"","Указание пути к плагинам и библиотекам с помощью скрипта kavicapd.sh","Вы можете изменить kavicapd.sh так, чтобы он экспортировал переменные автоматически.","Чтобы экспортировать переменные с помощью скрипта kavicapd.sh:","Откройте kavicapd.sh для редактирования и найдите следующие строки:\n\nSDK_PATH=$PWD/../../../..\nKL_PLUGINS_PATH=$SDK_PATH/ppl\nLD_LIBRARY_PATH=$SDK_PATH/lib:$KL_PLUGINS_PATH:$LD_LIBRARY_PATH \n\n\n\n ","Измените значения SDKPATH, KL_PLUGINS_PATH и LD_LIBRARY_PATH, чтобы они указывали на расположение директорий KAV SDK, плагина и библиотек соответственно.","Скрипт kavicapd.sh при запуске экспортирует переменные."," Указание путей к плагинам и библиотекам ","179897.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме ICAP вручную","Вы можете запустить службу kavicapd, запустив бинарный файл kavicapd вручную.","Перед запуском файла убедитесь, что пути к директориям, содержащим плагины и библиотеки, указаны правильно.","При ручном запуске службы kavicapd доступны следующие параметры:","Варианты запуска бинарного файла kavicapd","Параметр","Описание","-c <path>","Обязательный параметр.","Задает путь к файлу конфигурации режима ICAP.","Путь может быть абсолютным или относительным. Относительный путь указывается относительно текущей рабочей директории.","-p <path>","Обязательный параметр.","Задает путь к PID-файлу.","Путь может быть абсолютным или относительным. Относительный путь указывается относительно текущей рабочей директории.","-w","Необязательный параметр.","Запускает службу kavicapd в сторожевом режиме.","В этом режиме служба kavicapd автоматически перезапускается при зависании или сбое.","Если вы запустите бинарный файл kavicapd без указания каких-либо параметров, отобразится список поддерживаемых параметров."," Запуск Kaspersky Scan Engine в режиме ICAP вручную ","179900.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме ICAP с помощью сценария оболочки kavicapd","Вы можете запустить службу kavicapd, выполнив сценарий оболочки /opt/kaspersky/ScanEngine/bin/kavicapd.sh вручную. Перед запуском сценария убедитесь, что пути к директориям, содержащим плагины и библиотеки, указаны правильно."," Запуск Kaspersky Scan Engine в режиме ICAP с помощью сценария оболочки kavicapd  ","179901.htm"));
Page.push(new Array("Обновление антивирусных баз в режиме ICAP","В режиме ICAP Kaspersky Scan Engine поддерживает несколько способов обновления антивирусных баз.","При обновлении антивирусных баз KAV SDK передает в \"Лабораторию Касперского\" зашифрованную строку user agent. Вы также можете посмотреть полный список данных, которые передаются в \"Лабораторию Касперского\" при обновлении.","Для обновления антивирусных баз выполните одно из следующих действий.","Настройте автоматическое обновление баз в разделе UpdateSettings файла конфигурации режима ICAP.","Отправьте сигнал SIGUSR2 службе kavicapd. \nKaspersky Scan Engine должен быть настроен на обновление баз по этому сигналу. ","При использовании одного из этих методов Kaspersky Scan Engine автоматически загружает более новую версию баз."," Обновление антивирусных баз в режиме ICAP ","179902.htm"));
Page.push(new Array("Проверка возможностей обнаружения в режиме ICAP","Этот раздел содержит информацию о том, как проверить работу Kaspersky Scan Engine в режиме ICAP.","Проверка корректности обнаружения Kaspersky Scan Engine вредоносных и фишинговых URL-адресов","Чтобы убедиться, что Kaspersky Scan Engine обнаруживает вредоносные URL-адреса корректно:","Убедитесь, что директория с шаблонами ответов содержит шаблон по умолчанию detect_req.","Настройте Kaspersky Scan Engine. Задайте значение параметра RulesFilePath для директории, которая содержит kavicapd_gui_rules.conf, образец файла правил службы, включенный в пакет распространения. ","Запустите службу kavicapd.","Создайте файл .txt со следующим содержимым:\n\nREQMOD icap://icap-server.example.com/req ICAP/1.0\nHost: icap-server.example.com\nEncapsulated: req-hdr=0, null-body=110\n \nGET /TesT/Wmuf_w HTTP/1.1\nHost: www.bug.qainfo.ru\nAccept: text/html, text/plain\nAccept-Encoding: compress\n \n\n\n\n \nУбедитесь, что каждая строка заканчивается на CRLF, как того требует RFC 2616. Также убедитесь, что файл заканчивается пустой строкой (строкой, состоящей из символов CRLF). \nЭто сообщение запроса REQMOD GET ICAP.  \nВ сообщении запрашивается тестовая страница без реального вредоносного контента. ","Сохраните файл с соответствующим именем. В следующем примере этот файл называется icap_reqmod_malicious_detect.txt.","Отправьте сообщение на порт, который использует служба kavicapd (по умолчанию порт 1344).\nКонкретный способ отправки зависит от операционной системы, которую вы используете. В этом примере показано, как отправить сообщение, используя netcat: \n\n cat icap_reqmod_malicious_detect_.txt | nc localhost 1344\n\n\n\n \nСлужба kavicapd ответит измененными заголовками сообщений и сообщением с информацией о заблокированном URL-адресе. ","Убедитесь, что тестовая веб-страница была заблокирована.\nКогда веб-страница заблокирована, служба kavicapd возвращает HTML-шаблон ответа detect_req. Шаблон ответа содержит следующую информацию о заблокированной веб-странице: \n\nMode: REQMOD\nObject name:\nDate: 2017-May-31 14:13:29.295710\nICAPD version: KL ICAP Service v1.0 (KAV SDK v8.5.1.83)\nKAV SDK Version: KAV SDK v8.5.1.83\nURL: http://bug.qainfo.ru/TesT/Wmuf_w\n\n\n\n \n \n ","Создайте файл .txt со следующим содержимым:\n\nREQMOD icap://icap-server.example.com/req ICAP/1.0\nHost: icap-server.example.com\nEncapsulated: req-hdr=0, null-body=110\n \nGET /TesT/Aphish_w HTTP/1.1\nHost: www.bug.qainfo.ru\nAccept: text/html, text/plain\nAccept-Encoding: compress\n\n\n\n ","Сохраните файл с соответствующим именем. В следующем примере этот файл называется icap_reqmod_phishing_detect.txt.","Отправьте сообщение на порт, который использует служба kavicapd.\n\ncat icap_reqmod_phishing_detect_.txt | nc localhost 1344\n\n\n\n ","Убедитесь, что тестовая веб-страница была заблокирована.\nКогда веб-страница заблокирована, служба kavicapd возвращает HTML-шаблон ответа detect_req. Шаблон ответа содержит следующую информацию о заблокированной веб-странице: \n\nMode: REQMOD\nObject name:\nDate: 2017-May-31 14:13:29.295710\nICAPD version: KL ICAP Service v1.0 (KAV SDK v8.5.1.83)\nKAV SDK Version: KAV SDK v8.5.1.83\nURL: http://bug.qainfo.ru/TesT/Aphish_w\n\n\n\n ","Проверка корректности обнаружения Kaspersky Scan Engine вредоносного содержимого в HTTP-трафике","Чтобы убедиться, что Kaspersky Scan Engine обнаруживает вредоносный контент в HTTP-трафике корректно:","Убедитесь, что директория с шаблонами ответов содержит шаблон по умолчанию detect_req.","Настройте Kaspersky Scan Engine. Задайте значение параметра RulesFilePath для директории, которая содержит kavicapd_gui_rules.conf, образец файла правил службы, включенный в пакет распространения. ","Запустите службу kavicapd.","Создайте файл .txt со следующим содержимым:\n\nREQMOD icap://icap-server.example.com/req?arg=87 ICAP/1.0\nHost: icap-server.example.com\nEncapsulated: req-hdr=0, req-body=155\n \nPOST /origin-resource/form.pl HTTP/1.1\nHost: www.origin-server.example.com\nAccept: text/html, text/plain\nAccept-Encoding: compress\nPragma: no-cache\n \n44\nX5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*\n0\n\n\n\n \nУбедитесь, что каждая строка заканчивается на CRLF, как того требует RFC 2616. \nЭто сообщение запроса REQMOD POST ICAP.  \nОно содержит стандартный файл для тестирования антивируса (EICAR). Стандартный файл для тестирования антивируса (EICAR) не является вирусом и часто используется для тестирования антивирусного программного обеспечения. ","Сохраните файл с соответствующим именем. В следующем примере этот файл называется icap_reqmod_detect.txt.","Отправьте сообщение на порт, который использует служба kavicapd (по умолчанию порт 1344).\nКонкретный способ отправки зависит от операционной системы, которую вы используете. В этом примере показано, как отправить сообщение, используя netcat: \n\ncat icap_reqmod_detect.txt | nc localhost 1344\n\n\n\n \nСлужба kavicapd ответит измененными заголовками сообщений и сообщением с информацией об обнаруженном объекте. ","Убедитесь, что стандартный файл для тестирования антивируса (EICAR) был обнаружен.\nПри обнаружении файла EICAR служба kavicapd возвращает HTML-шаблон ответа detect_req. Шаблон ответа содержит следующую информацию об обнаруженном объекте: \n\nMode: REQMOD\nObject name: EICAR-Test-File\nDate: 2017-May-31 14:17:12.077704\nICAPD version: KL ICAP Service v1.0 (KAV SDK v8.5.1.83)\nKAV SDK Version: KAV SDK v8.5.1.83\nURL: www.origin-server.example.com/origin-resource/form.pl\n\n\n\n \n ","Тестирование корректности проверки репутации файлов и URL","Чтобы убедиться, что проверка репутации файлов и URL-адресов выполняется корректно:","Запросите тестовый файл KSN у своего персонального технического менеджера. Этот файл не является вредоносным и используется только для тестирования корректности проверки репутации файлов и URL-адресов.","Убедитесь, что директория с шаблонами ответов содержит шаблон по умолчанию detect_req.","Настройте Kaspersky Scan Engine",".","Задайте значение параметра RulesFilePath для директории, которая содержит kavicapd_gui_rules.conf, образец файла правил службы, включенный в пакет распространения.","Убедитесь, что для параметра UseKSN установлено значение 0.","Запустите службу kavicapd.","Создайте файл .txt со следующим содержимым:","REQMOD icap://icap-server.example.com/req?arg=87 ICAP/1.0","Host: icap-server.example.com","Encapsulated: req-hdr=0, req-body=155","POST /origin-resource/form.pl HTTP/1.1","Host: www.origin-server.example.com","Accept: text/html, text/plain","Accept-Encoding: compress","Pragma: no-cache","Под содержимым, которое вы добавили в файл .txt, вставьте новую строку.","Под этой строкой вставьте содержимое тестового файла KSN.","Убедитесь, что каждая строка заканчивается на CRLF, как того требует RFC 2616.","Сохраните файл с соответствующим именем. В следующем примере этот файл называется icap_reqmod_detect_ksn.txt.","Отправьте сообщение на порт, который использует служба kavicapd (по умолчанию порт 1344).","Конкретный способ отправки зависит от операционной системы, которую вы используете. В этом примере показано, как отправить сообщение, используя утилиту netcat:","cat icap_reqmod_detect_ksn.txt | nc localhost 1344","Убедитесь, что тестовый файл KSN не обнаружен.","Установите значение параметра UseKSN в файле конфигурации режима ICAP равным 1.","Перезапустите службу kavicapd.","Снова отправьте icap_reqmod_detect_ksn.txt службе kavicapd.","Убедитесь, что тестовый файл KSN обнаружен."," Проверка возможностей обнаружения в режиме ICAP ","179903.htm"));
Page.push(new Array("Использование Kaspersky Scan Engine в режиме ICAP со Squid","Squid – это кеширующий и перенаправляющий прокси-сервер для Windows и UNIX-подобных систем. Вы можете использовать Kaspersky Scan Engine в режиме ICAP для проверки трафика, проходящего через прокси-сервер Squid.","Требования к установленному ПО","Операционная система Ubuntu 18.04 или более поздней версии.","Squid 4.5 или более поздняя версия.","Настройка Squid для работы с Kaspersky Scan Engine","Чтобы Kaspersky Scan Engine работал со Squid в режиме ICAP, вы должны указать Kaspersky Scan Engine как службу ICAP в файле конфигурации Squid (squid.conf).","В Squid ICAP-служба определяется в следующем формате: icap_service id vectoring_point [options] uri.","Чтобы указать Kaspersky Scan Engine как службу ICAP:","Откройте squid.conf для редактирования.","Определите обязательные параметры","id",",","vectoring_point","и","uri",":","Установите id равным любому подходящему идентификатору. Например, srv_kl_resp для режима REQMOD и srv_kl_req для режима RESPMOD.","Установите для","vectoring_point","соответствующее значение","*_precache",":","Для режима REQMOD укажите reqmod_precache.","Для режима RESPMOD укажите respmod_precache.","Укажите в качестве","uri","расположение Kaspersky Scan Engine:","Для режима REQMOD URI должен иметь следующий формат: icap://servername:port/req.","Для режима RESPMOD URI должен иметь следующий формат: icap://servername:port/resp.","Добавьте следующие строки в конец файла конфигурации Squid:","icap_enable on","adaptation_send_username on","adaptation_send_client_ip on","icap_service srv_kl_resp respmod_precache 0 icap://localhost:1344/resp","icap_service srv_kl_req reqmod_precache 0 icap://localhost:1344/req","adaptation_access srv_kl_resp allow all","adaptation_access srv_kl_req allow all","icap_service_failure_limit -1","icap_service_revival_delay 30","icap_preview_enable off","В приведенном выше примере srv_kl_resp и srv_kl_req – примеры id; respmod_precache и reqmod_precache – значения vectoring_point; 0 – значение параметра Squid bypass, а vectoring_point и icap://127.0.0.1:1344/req – примеры uri.","Вы можете использовать 127.0.0.1 в uri, только если Kaspersky Scan Engine установлен на том же компьютере, что и Squid.","Сохраните и закройте squid.conf.","Перезапустите службу squid.","service squid restart","Настройка Squid для работы с Kaspersky Scan Engine и включение сканирования SSL","По умолчанию Kaspersky Scan Engine не может проверять SSL/TLS-трафик, но вы можете настроить Squid расшифровывать его с помощью функции SSL Bumping.","Чтобы настроить Squid для работы с Kaspersky Scan Engine и включить SSL Bumping:","Установите пакеты, необходимые для компиляции и настройки Squid:","apt-get install build-essential openssl libssl-dev pkg-config","Загрузите исходный код Squid 4.5 или более поздней версии.","Распакуйте архив с исходным кодом Squid в требуемую директорию.","Перейдите в эту директорию.","Скомпилируйте Squid:","./configure --with-default-user=proxy --with-openssl --enable-ssl-crtd","make all","make install","Параметры --with-openssl и --enable-ssl-crtd необходимы, чтобы включить SSL Bumping.","Установите правильное время и дату на сервере, на котором работает Squid. Время и дата проверяются каждый раз, когда клиент пытается проверить сертификат этого сервера.","Настройте OpenSSL:","Найдите файл конфигурации OpenSSL по умолчанию openssl.cnf. Расположение этого файла зависит от вашей операционной системы, но обычно это /etc/ssl/openssl.cnf.","Откройте openssl.cnf для редактирования.","Добавьте следующую строку в раздел [v3_ca] файла конфигурации:\n\n\nkeyUsage = cRLSign, keyCertSign ","Сохраните и закройте файл openssl.cnf.","Подготовьте среду для хранения SSL-сертификатов:","Создайте директорию для хранения SSL-сертификатов:\n\n\nmkdir /usr/local/squid/etc/ssl_cert -p ","Измените пользователя и группу, которым принадлежит эта директория, на proxy:\n\n\nchown proxy:proxy /usr/local/squid/etc/ssl_cert -R ","Измените разрешения для этой директории:\n\n\nchmod 700 /usr/local/squid/etc/ssl_cert -R ","Перейдите во вновь созданную директорию:","cd /usr/local/squid/etc/ssl_cert","Сгенерируйте новый самозаверяющий SSL-сертификат и закрытый ключ для сервера Squid:","openssl req -new -newkey rsa:2048 -sha256 -days 365 -nodes -x509 -extensions v3_ca -keyout squid_ca.pem -out squid_ca.pem","Преобразуйте созданный сертификат в формат DER:","openssl x509 -in squid_ca.pem -outform DER -out squid_ca.der","Экспортируйте сгенерированный сертификат на клиентские компьютеры и установите его на них как сертификат центра сертификации. Способ выполнения этого действия зависит от браузера и операционной системы клиента.","Создайте новую базу данных SSL для сервера Squid:","/usr/local/squid/libexec/security_file_certgen -c -s /usr/local/squid/var/logs/ssl_db -M 4MB","Измените пользователя и группу, которым принадлежит эта директория, на proxy:","chown proxy:proxy /usr/local/squid/var/logs/ssl_db -R","Настройте Squid:","Найдите файл конфигурации Squid по умолчанию squid.conf. Расположение этого файла зависит от вашей операционной системы, но обычно это /usr/local/squid/etc/squid.conf.","Откройте squid.conf и внесите следующие правки:","Найдите следующую строку:\n\n\nhttp_port 3128 ","Замените его строкой:\n\n\nhttp_port 3128 ssl-bump cert=/usr/local/squid/etc/ssl_cert/squid_ca.pem generate-host-certificates=on dynamic_cert_mem_cache_size=4MB \n\n\nЭта строка включает SSL Bumping на порту 3128. ","Добавьте следующий раздел:\n\n\nacl step1 at_step SslBump1 \n\n\nssl_bump peek step1 \n\n\nssl_bump bump all \n\n\nsslcrtd_program /usr/local/squid/libexec/security_file_certgen -s /usr/local/squid/var/logs/ssl_db -M 4MB ","Укажите Kaspersky Scan Engine в качестве службы ICAP в файле конфигурации Squid, как описано выше в подразделе \"Настройка Squid для работы с Kaspersky Scan Engine\".","Сохраните и закройте squid.conf.","Измените пользователя и группу, которым принадлежит директория /usr/local/squid, на proxy:","chown -R proxy:proxy /usr/local/squid","Запустите Squid и инициализируйте кеш Squid:","/usr/local/squid/sbin/squid -z","Ниже приведен пример части файла конфигурации Squid: В этом примере Squid использует Kaspersky Scan Engine в режиме ICAP для проверки HTTP-сообщений как в режиме REQMOD, так и в режиме RESPMOD.","# SSL bumping configuration","acl step1 at_step SslBump1","ssl_bump peek step1","ssl_bump bump all","http_port 3128 ssl-bump cert=/usr/local/squid/etc/ssl_cert/squid_ca.pem generate-hostcertificates=on dynamic_cert_mem_cache_size=4MB","sslcrtd_program /usr/local/squid/libexec/security_file_certgen -s /usr/local/squid/var/logs/ssl_db -M 4MB","# ICAP configuration","icap_enable on","adaptation_send_username on","adaptation_send_client_ip on","icap_service srv_kl_resp respmod_precache 0 icap://localhost:1344/resp","icap_service srv_kl_req reqmod_precache 0 icap://localhost:1344/req","adaptation_access srv_kl_resp allow all","adaptation_access srv_kl_req allow all","icap_service_failure_limit -1","icap_service_revival_delay 30","icap_preview_enable off"," Использование Kaspersky Scan Engine в режиме ICAP со Squid ","179904.htm"));
Page.push(new Array("Сборка исполняемых файлов Kaspersky Scan Engine, используемых в режиме ICAP","Вы можете скомпилировать службу kavicapd из исходного кода, расположенного в директории %service_dir%/samples/kavicap/.","Требования к установленному ПО","Чтобы скомпилировать службу kavicapd, вы должны установить на свой компьютер следующее программное обеспечение:","Boost 1.72.0 или более поздней версии. Исходные файлы службы kavicapd статически связываются с Boost, для чего требуется пакет boost-static.x86_64.","Библиотека GNU C и стандартная библиотека GNU C++ со статическими библиотеками.","Библиотека OpenSSL (последняя версия) Рекомендуется установить пакет openssl-devel.","Библиотеки PostgreSQL с 6.4.4 по 7 (не включительно). Рекомендуется установить пакет libpqxx-devel.","Динамическая библиотека Brotli.","Вам также понадобится набор компиляторов GNU (GCC) 7.3.0 или более поздней версии. Используйте одну и ту же версию GCC для компиляции Boost и службы kavicapd.","Чтобы скомпилировать Kaspersky Scan Engine для работы в режиме ICAP:","Перейдите в директорию %service_dir%/samples/kavicap/.","Запустите gmake."," Сборка исполняемых файлов Kaspersky Scan Engine, используемых в режиме ICAP ","179905.htm"));
Page.push(new Array("Пользовательские данные, записываемые в лог","Когда Kaspersky Scan Engine запускает диагностическое логирование, некоторые пользовательские данные могут храниться локально в файлах журнала, созданных Kaspersky Scan Engine. Данные добавляются в файлы журнала без каких-либо изменений. Kaspersky Scan Engine не редактирует и не изменяет эти данные и не отправляет их куда-либо иным образом. Регистрируемые данные хранятся локально на вашем компьютере с запущенной копией Kaspersky Scan Engine в месте, указанном в файле kave.ini.","Если для вас важна защита регистрируемых данных, вы должны реализовать метод защиты самостоятельно. Например, вы можете разрешить доступ к регистрируемым данным только определенным учетным записям пользователей.","Следующие типы пользовательских данных записываются в текстовом формате в файлы журнала:","Пути к сканируемым объектам.","Проверенные URL-адреса.","Адреса проверяемых модулей памяти.","Содержание строки user agent Kaspersky Scan Engine:","Версия формата строки user agent.","Идентификатор Kaspersky Scan Engine.","Режим лицензирования.","Идентификатор лицензии.","Обновление идентификатора сеанса.","Полная версия Kaspersky Scan Engine: мажорная версия, минорная версия, сборка, редакция и пакет исправлений.","Если Kaspersky Scan Engine использует прокси-сервер для подключения к интернету, он также может регистрировать следующую информацию:","IP-адрес прокси-сервера (IPv4 или IPv6) или имя хоста.","Порт прокси-сервера.","Имя пользователя для аутентификации прокси.","Kaspersky Scan Engine не регистрирует пароли для аутентификации прокси."," Пользовательские данные, записываемые в лог ","179925.htm"));
Page.push(new Array("Файл конфигурации логирования","В этом разделе описаны свойства файла конфигурации логирования kave.ini. Файл конфигурации логирования kave.ini определяет параметры логирования Kaspersky Anti-Virus Engine. Логирование настраивается отдельно для служб kavhttpd и kavicapd.","Параметры логирования для служб kavicapd/kavhttpd и Kaspersky Anti-Virus Engine синхронизируются при запуске и перезапуске службы klScanEngineUI. Kaspersky Scan Engine устанавливает уровень логирования (WriteLog) и директорию журнала (LogsFolder) в kave.ini такими же, как указано в разделе DebugLogging файла icapdkavlog.conf (для режима ICAP) или httpdkavlog.ini (для режима HTTP).","В следующей таблице описаны свойства файла конфигурации логирования kave.ini.","Свойства файла конфигурации логирования","Свойство","Описание","Append","Указывает, будут ли предыдущие файлы журналов сохраняться или удаляться при каждой инициализации Kaspersky Scan Engine.","Возможные значения:","0\n\n\n\n\nАвтоматически удалять существующие файлы журналов.\n\n\n\n\n\nСуществующие файлы журналов в директории журналов автоматически удаляются при инициализации Kaspersky Scan Engine.\n","1\n\n\n\n\nСохранять существующие файлы журналов.\n\n\n\n\n\nKaspersky Scan Engine записывает данные логирования в новые файлы журнала, каждый из которых соответствует определенному процессу. При выборе этого параметра Kaspersky Scan Engine не добавляет информацию в существующий журнал.\n","SizeLimit","Только для платформ Windows. На Unix-подобных платформах этот параметр игнорируется, даже если он указан в kave.ini.","Устанавливает максимально возможный размер файла журнала в мегабайтах.","Возможные значения:","Любое положительное целое число в диапазоне от 0 до 4095.","Особые случаи:","0\n\n\n\n\nНет ограничений на размер файла журнала. Файлы журнала могут расти бесконечно. ","Установка лимита на ненулевое значение автоматически включает режим добавления независимо от значения, указанного для свойства Append.","WriteLog","Уровень логирования.","Рекомендуемые значения:","0\n\n\n\n\nЛогирование выключено. ","9\n\n\n\n\nУровень отладки. ","Не рекомендуется использовать другие значения.","LogsFolder","Путь к директории журналов.","Не заключайте путь в кавычки и не используйте escape-последовательность для пробелов.","Возможные значения:","Относительный путь","Путь рассчитывается относительно директории, в которой находится файл конфигурации логирования kave.ini.","Если вы укажете несуществующую директорию, файлы журнала будут созданы в директории, содержащей двоичный файл используемой службы (kavhttpd в режиме HTTP и kavicapd в режиме ICAP).","Абсолютный путь","Если вы укажете несуществующую директорию, файлы журнала будут созданы в директории, содержащей двоичный файл используемой службы (kavhttpd в режиме HTTP и kavicapd в режиме ICAP).","Локальный путь","Директория, содержащая kave.ini. Локальный путь можно указать, установив для параметра LogsFolder значение \".\" (без кавычек) или оставив его пустым.","Полный пользовательский путь для файлов журнала не должен превышать ограничение в 260 символов, применяемое макросом MAX_PATH. Это целое число не включает дополнительные ограничения длины, такие как символ конца строки, используемый в C-строках, и другие ограничения, налагаемые платформами: например, когда файловая система сохраняет дополнительное короткое имя в формате 8.3 с исходным именем файла, чтобы поддерживать совместимость с предыдущими версиями.","Syslog","Это свойство указывает, отправляет ли Kaspersky Scan Engine данные журнала демону syslog.","При использовании демона syslog вы можете записывать данные логирования в файлы журнала, другие программы или перенаправлять их на другой хост в соответствии с настройками файла конфигурации для демона syslog.","Возможные значения:","0\n\n\n\n\nНе отправлять сообщения системного журнала демону syslog. Данные журнала записываются непосредственно в место, указанное в параметре LogsFolder. ","1\n\n\n\n\nПеренаправить данные логирования демону syslog. В этом случае данные журнала хранятся в месте, указанном в файле конфигурации демона syslog. Значение параметра LogsFolder игнорируется. ","Перед перенаправлением данных логирования демону syslog убедитесь, что демон syslog настроен для логирования отладки. Добавьте следующую строку в файл конфигурации syslog.conf:*.=debug -/var/log/debugФайл конфигурации syslog обычно находится в /etc/syslog.conf и управляет выводом демона syslogd.","Замечания","В некоторых случаях персональный технический менеджер (ПТМ) может попросить вас включить расширенное логирование. Расширенное логирование может помочь специалистам \"Лаборатории Касперского\" исследовать сложные проблемы.","Чтобы включить расширенное логирование:","Откройте файл kave.ini (при необходимости создайте новый в папке с бинарным файлом kavehost).","В разделе Logging добавьте параметр BssLogsFolder и укажите место для хранения файлов с расширенными данными журнала.\nЭто местоположение должно отличаться от вашего стандартного местоположения данных логирования, указанного в LogsFolder. ","Примеры","В следующем примере приводится пример файла конфигурации для каждой из целевых платформ.","Следующий пример файла конфигурации может использоваться на UNIX-подобной платформе.","[LOGGING]","WriteLog=9","Append=0","LogsFolder=./logs","Syslog=0"," Файл конфигурации логирования ","179926.htm"));
Page.push(new Array("Включение логирования вручную","В этом разделе описывается, как включить логирование вручную.","Вы можете отдельно включить логирование для Kaspersky Anti-Virus Engine","Логирование значительно снижает производительность Kaspersky Scan Engine. Рекомендуется использовать логирование только для отладки.","Включение логирования Kaspersky Anti-Virus Engine","По умолчанию Kaspersky Scan Engine не логирует события KAV Engine.","Чтобы включить логирование в Kaspersky Anti-Virus Engine:","Создайте файл с именем kave.ini в поддиректории ppl директории установки.","Добавьте в kave.ini следующие строки:","[LOGGING]","WriteLog=9","При необходимости укажите другие параметры.","Сохраните и закройте kave.ini.","Перезагрузите службу Kaspersky Scan Engine.","В режиме HTTP перезапустите службу kavhttpd.","В режиме ICAP перезапустите службу kavicapd.","Параметры логирования для служб kavicapd/kavhttpd и Kaspersky Anti-Virus Engine синхронизируются при запуске и перезапуске службы klScanEngineUI. Kaspersky Scan Engine устанавливает уровень логирования (WriteLog) и директорию журнала (LogsFolder) в kave.ini такими же, как указано в разделе DebugLogging файла icapdkavlog.conf (для режима ICAP) или httpdkavlog.ini (для режима HTTP).","Включение логирования в режиме HTTP","По умолчанию логирование в режиме HTTP выключено. Kaspersky Scan Engine проверяет наличие файла конфигурации логирования httpdkavlog.ini при запуске службы kavhttpd. Если этот файл существует, Kaspersky Scan Engine считывает из него параметры.","Чтобы включить логирование для службы kavhttpd:","Создайте файл с именем httpdkavlog.ini в директории, где находится бинарный файл kavhttpd.","Установите значение элемента <LogLevel> равным 1.","При необходимости укажите остальные параметры.","Сохраните и закройте httpdkavlog.ini.","Перезапустите службу kavhttpd.","Включение логирования в режиме ICAP","По умолчанию логирование в режиме ICAP выключено. Kaspersky Scan Engine проверяет файл конфигурации логирования icapdkavlog.conf при запуске службы kavicapd.","Чтобы включить логирование для службы kavicapd:","Откройте файл конфигурации логирования icapdkavlog.conf.","Укажите debug или dbg в элементе <Level>.","При необходимости укажите другие параметры.","Сохраните и закройте icapdkavlog.conf.","Перезапустите службу kavicapd.","Включение логирования в Kaspersky Scan Engine GUI","Чтобы включить логирование Kaspersky Scan Engine GUI:","Включите логирование в файле конфигурации, соответствующем выбранному режиму Kaspersky Scan Engine (HTTP или ICAP).","Если используется режим HTTP, включите логирование в файле конфигурации логирования httpdkavlog.ini.","Если используется режим ICAP, включите логирование в файле конфигурации логирования icapdkavlog.conf.","В Kaspersky Scan Engine GUI перейдите в раздел Settings → Logging и включите логирование.","Вы можете включить или выключить логирование в Kaspersky Scan Engine GUI без перезапуска службы kavicapd или kavhttpd."," Включение логирования вручную ","179928.htm"));
Page.push(new Array("Данные, передаваемые в \"Лабораторию Касперского\" при обновлении","Во время обновления Kaspersky Scan Engine передает в \"Лабораторию Касперского\" зашифрованную строку user agent.","Цель предоставления данных: расчет статистики использования продуктов \"Лаборатории Касперского\" и статистики обновлений.","Регион обработки данных: Москва, Россия.","Метод защиты данных: безопасное шифрование.","В строке user agent передается следующая информация:","Версия формата строки user agent.","Идентификатор Kaspersky Scan Engine. ","Режим лицензирования.","Идентификатор лицензии.","Обновление идентификатора сеанса.","Полная версия Kaspersky Scan Engine: мажорная версия, минорная версия, сборка, редакция и пакет исправлений.","Срок хранения:","Пока обрабатываются статистические данные: 24 часа.","После обработки статистических данных:","Идентификатор лицензии: неограниченно хранятся только первые 1000 идентификаторов.","Остальные параметры хранятся бессрочно. Не являются личными данными.","Смотрите также подробную информацию о предоставлении данных."," Данные, передаваемые в &quot;Лабораторию Касперского&quot; при обновлении ","180001.htm"));
Page.push(new Array("Данные, передаваемые в \"Лабораторию Касперского\" в режиме лицензирования онлайн","В режиме лицензирования онлайн Kaspersky Scan Engine автоматически обновляет информацию о лицензировании раз в день. При обновлении информации о лицензировании Kaspersky Scan Engine передает в \"Лабораторию Касперского\" информацию об установленной копии Kaspersky Scan Engine и коде активации. Эта информация необходима для онлайн-активации.","Передается следующая информация:","Код активации, предоставленный во время онлайн-активации.","Идентификатор Kaspersky Scan Engine.","Идентификатор региональных настроек, используемый Kaspersky Scan Engine. ","Полная версия Kaspersky Scan Engine: мажорная версия, минорная версия, сборка, редакция и пакет исправлений.","Системная дата и время.","Уникальный идентификатор установки Kaspersky Scan Engine.","Текущий статус кода активации (активен или заблокирован).","Срок действия кода активации.","Функциональность, доступная с этим кодом активации.","Статус ограничений активаций (если он относится к коду активации).","Смотрите также подробную информацию о предоставлении данных."," Данные, передаваемые в &quot;Лабораторию Касперского&quot; в режиме лицензирования онлайн ","180002.htm"));
Page.push(new Array("Защита от угроз","Kaspersky Scan Engine помогает защитить вашу сеть и данные, обнаруживая вредоносные программы и легальные программы, которые могут быть использованы злоумышленниками.","Прежде чем приступить к работе с Kaspersky Scan Engine, определитесь со своим вариантом использования в следующем порядке.","Решите, какие данные вы хотите сканировать:","Данные, загруженные в вашу сеть вашими пользователями.","Данные, созданные внутри вашей организации, например документы.","Данные, загруженные из источников за пределами вашей сети. Это может предотвратить атаки на цепочку поставок.","Вы также можете использовать Kaspersky Scan Engine для добавления функций сканирования в свои программы и службы безопасности. Kaspersky Scan Engine проверяет объекты любого формата, в том числе упакованные.","Решите, какой режим лучше для вашей среды – HTTP или ICAP.","Решите, где вы хотите развернуть Kaspersky Scan Engine.","Решите, как вы получите доступ к результатам сканирования:","В Kaspersky Scan Engine GUI. ","В клиентском приложении.","Решите, какие функции Kaspersky Scan Engine вы будете использовать:","Решите, хотите ли вы использовать Kaspersky Security Network (KSN) для проверки репутации файлов и URL-адресов.","Решите, какой уровень эвристики вы хотите использовать.","Решите, какие действия должен выполнять Kaspersky Scan Engine после обнаружения вредоносных или легальных программ, которые могут быть использованы злоумышленниками.","Решите, хотите ли вы сканировать упакованные исполняемые файлы.","Решите, хотите ли вы проверять архивы.","Решите, хотите ли вы сканировать электронную почту.","Решите, хотите ли вы сканировать почтовые базы.","После определения варианта использования Kaspersky Scan Engine переходите к разделу Начало работы с Kaspersky Scan Engine.","Ниже приведены инструкции по выполнению типовых задач, которые Kaspersky Scan Engine выполняет в режиме HTTP и ICAP.","Сканирование файлов с помощью примера HTTP-клиента (режим HTTP)","В этой инструкции предполагается, что вы уже установили и настроили Kaspersky Scan Engine с помощью файла конфигурации или графического интерфейса.","Для сканирования файлов в Kaspersky Scan Engine:","Запустите службу kavhttpd.","Запустите пример HTTP-клиента. Клиент находится в директории /bin/kavhttp_client пакета распространения.","Передайте файлы, которые вы хотите просканировать, в пример HTTP-клиента:","Проверять файлы размером более 4 мегабайт (МБ) в режиме сканирования файлов. Используйте параметр -f и передайте локальные пути к файлам примеру HTTP-клиента.\n\n\nВ приведенном ниже примере показано, как сканировать два файла в режиме сканирования файлов: ","./kavhttp_client -f /usr/dir1/example1.zip /usr/dir2/example2.iso","Проверять файлы размером менее 4 МБ в режиме сканирования памяти. Передайте пути (сетевые или локальные) к примеру HTTP-клиента. Для этого используйте параметр -s.\n\n\nВ приведенном ниже примере показано, как сканировать файл в режиме сканирования памяти: ","./kavhttp_client -s 192.0.2.0:888 /usr/dir/example.txt","Просмотрите результаты проверки.","Сканирование трафика, проходящего через прокси-сервер (режим ICAP)","Эта инструкция предполагает, что вы уже установили и настроили Kaspersky Scan Engine с помощью файла конфигурации или Kaspersky Scan Engine GUI.","Чтобы проверить трафик, проходящий через прокси-сервер:","Настройте свой прокси-сервер для работы с Kaspersky Scan Engine (см. пример использования Kaspersky Scan Engine в режиме ICAP со Squid).","Создайте шаблон ответа, который вы хотите отобразить, или сценарий, который будет выполняться при обнаружении вредоносных или легальных программ, которые могут быть использованы злоумышленниками.","Настройте правила службы ICAP на случай, когда Kaspersky Scan Engine обнаруживает вредоносные или легальные программы, которые могут быть использованы злоумышленниками. Вы можете сделать это вручную или с помощью графического интерфейса.","Запустите службу kavicapd.","Kaspersky Scan Engine будет автоматически обнаруживать вредоносные или легальные программы, которые могут быть использованы злоумышленниками, а затем обрабатывать их в соответствии с правилами службы ICAP."," Защита от угроз ","180130.htm"));
Page.push(new Array("Веб-защита от вредоносных и фишинговых сайтов","В этом разделе описаны распространенные сценарии использования Kaspersky Scan Engine для проверки веб-сайтов.","В инструкциях в этом разделе предполагается, что вы уже установили Kaspersky Scan Engine.","Сканирование URL-адресов (режим HTTP)","Чтобы просканировать URL-адрес с помощью Kaspersky Scan Engine:","В элементе","ServerSettings > Flags","файла конфигурации","kavhttpd.xml укажите нужные настройки:","KAV_SHT_ENGINE_KSN – Для проверки репутации веб-сайтов с помощью KSN.","KAV_SHT_ENGINE_WMUF – Для обнаружения вредоносных веб-сайтов.","KAV_SHT_ENGINE_APUF – Для обнаружения фишинговых веб-сайтов.","Вы также можете задать настройки с помощью Kaspersky Scan Engine GUI.","Запустите службу kavhttpd.","Отправьте URL-адрес, который вы хотите проверить, службе kavhttpd.","Например, вы можете использовать пример HTTP-клиента %service_dir%/bin/kavhttp_client для этой цели следующим образом:","./kavhttp_client -u http://example.com","Также вы можете отправить HTTP-запрос POST в службу kavhttpd.","Просмотрите результаты проверки.","Вы можете заблокировать URL-адреса, для которых возвращается результат DETECT.","Проверка URL-адресов, запрашиваемых пользователями через прокси-сервер (режим ICAP)","Чтобы проверить URL-адреса, которые проходят через прокси-сервер:","В файле конфигурации kavicapd.xml укажите нужные параметры:","В элементе SDKSettings > ScanningMode укажите KAV_O_M_PHISHING для обнаружения фишинговых сайтов.","В элементе KSNSettings > UseKSN укажите 1 для проверки репутации сайтов с помощью KSN.","Вы также можете задать настройки с помощью Kaspersky Scan Engine GUI.","Настройте свой прокси-сервер для работы с Kaspersky Scan Engine (см. пример использования Kaspersky Scan Engine в режиме ICAP со Squid).","Создайте шаблон ответа, если вы хотите отображать его вместо фишинговых веб-страниц.","Создайте правила службы ICAP для случаев, когда Kaspersky Scan Engine возвращает результаты проверки PHISHING и DETECT.","Вы можете сделать это вручную или с помощью Kaspersky Scan Engine GUI.","Запустите службу kavicapd.","Kaspersky Scan Engine будет автоматически проверять URL-адреса и обрабатывать их в соответствии с правилами службы ICAP."," Веб-защита от вредоносных и фишинговых сайтов ","180131.htm"));
Page.push(new Array("Проверка репутации файлов и URL-адресов в KSN","В этом разделе описаны распространенные сценарии, в которых вы можете использовать Kaspersky Scan Engine вместе с Kaspersky Security Network (KSN) для проверки файлов и веб-сайтов.","В инструкциях в этом разделе предполагается, что вы уже установили Kaspersky Scan Engine.","Проверка файлов и сайтов с проверкой репутации (режим HTTP)","Чтобы проверить файлы и сайты с помощью проверки репутации:","В элементе ServerSettings > Flags файла конфигурации kavhttpd.xml укажите параметр KAV_SHT_ENGINE_KSN.\nВы также можете использовать Kaspersky Scan Engine GUI, чтобы включить проверку репутации. ","Запустите службу kavhttpd.","Отправьте URL-адреса и файлы, которые вы хотите проверить, в службу kavhttpd.\nНапример, вы можете использовать пример HTTP-клиента %service_dir%/bin/kavhttp_client. \nТакже вы можете отправлять HTTP-запросы POST в службу kavhttpd. ","Просмотрите результаты проверки.\nРезультаты проверки будут зависеть от репутации URL-адресов и файлов. ","Проверка URL-адресов, запрашиваемых пользователями через прокси-сервер (режим ICAP)","Чтобы проверить URL-адреса, которые проходят через прокси-сервер:","В элементе KSNSettings > UseKSN файла конфигурации kavicapd.xml укажите 1 для проверки репутации файлов и сайтов с помощью KSN.\nВы также можете включить проверку репутации с помощью Kaspersky Scan Engine GUI. ","Настройте свой прокси-сервер для работы с Kaspersky Scan Engine (см. пример использования Kaspersky Scan Engine в режиме ICAP со Squid).","Создайте правила службы ICAP для результатов проверки, возвращаемых Kaspersky Scan Engine.\nВы можете создавать правила вручную или с помощью Kaspersky Scan Engine GUI. ","Запустите службу kavicapd.","Kaspersky Scan Engine будет возвращать результаты проверки файлов и URL-адресов на основе их репутации в KSN и отвечать в соответствии с заданными вами правилами службы ICAP."," Проверка репутации файлов и URL-адресов в KSN ","180133.htm"));
Page.push(new Array("О стандартном тестовом файле антивируса EICAR","Поскольку использование реальных вредоносных программ в тестовых целях недопустимо, необходим файл, который не содержит вредоносного кода и может быть безопасно передан, но должен быть обнаружен антивирусным программным обеспечением как вредоносный объект или, более конкретно, как тестовый файл.","Европейский институт компьютерных антивирусных исследований (EICAR) распространяет такой файл для проверки работы антивируса. Он известен как \"Стандартный файл для тестирования антивируса (EICAR)\" и может быть загружен с официального сайта EICAR.","Чтобы загрузить тестовый файл или прочитать о нем подробнее, перейдите по этой ссылке: https://www.eicar.org/?page_id=3950.","Если на вашем компьютере уже установлено антивирусное программное обеспечение, отключите его перед загрузкой тестового файла.","Стандартный файл для тестирования антивируса (EICAR) содержит строку ASCII, которая при интерпретации командным процессором выводит текстовое сообщение и возвращает в командную строку.","Kaspersky Scan Engine обнаружит этот тестовый файл, пометит его как зараженный и выполнит действие, указанное в параметрах проверки."," О стандартном тестовом файле антивируса EICAR ","180178.htm"));
Page.push(new Array("Проверка возможностей обнаружения в режиме HTTP","Этот раздел содержит информацию о том, как проверить работу Kaspersky Scan Engine в режиме HTTP.","Проверка корректности обнаружения вредоносных файлов Kaspersky Scan Engine","Чтобы убедиться, что Kaspersky Scan Engine обнаруживает вредоносный файл корректно:","Запустите kavhttpd.","Запустите свой HTTP-клиент.","Отсканируйте тестовый файл EICAR с помощью вашего HTTP-клиента в режиме сканирования файлов.\nВ следующем примере показано, как это сделать с помощью примера HTTP-клиента: \n\n./kavhttp_client -f eicar.txt\n\n\n\n ","Убедитесь, что тестовый файл EICAR обнаружен.","Проверка корректности обнаружения Kaspersky Scan Engine вредоносных файлов в системной памяти","Чтобы убедиться, что Kaspersky Scan Engine обнаруживает вредоносные файлы в системной памяти корректно:","Запустите kavhttpd.","Запустите свой HTTP-клиент.","Просканируйте содержимое тестового файла EICAR с помощью вашего HTTP-клиента в режиме сканирования памяти.\nВ следующем примере показано, как это сделать с помощью примера HTTP-клиента: \n\n./kavhttp_client eicar.txt\n\n\n\n ","Убедитесь, что тестовый файл EICAR обнаружен.","Проверка корректности обнаружения Kaspersky Scan Engine вредоносных и фишинговых URL-адресов","Чтобы убедиться, что Kaspersky Scan Engine обнаруживает вредоносные и фишинговые URL-адреса корректно:","Запустите kavhttpd.","Запустите свой HTTP-клиент.","Чтобы убедиться, что Kaspersky Scan Engine корректно определяет вредоносные URL-адреса, просканируйте http://bug.qainfo.ru/TesT/Wmuf_w с помощью своего HTTP-клиента.\nЭтот URL-адрес не является вредоносным. \"Лаборатория Касперского\" использует этот URL-адрес для проверки возможностей обнаружения антивирусных программ. \nВ следующем примере показано, как это сделать с помощью примера HTTP-клиента: \n\n./kavhttp_client -u http://bug.qainfo.ru/TesT/Wmuf_w\n\n\n\n ","Убедитесь, что URL-адрес обнаружен.","Чтобы убедиться, что Kaspersky Scan Engine корректно определяет фишинговые URL-адреса, просканируйте http://bug.qainfo.ru/TesT/Aphish_w с помощью своего HTTP-клиента.\nЭтот URL-адрес не является фишинговым. \"Лаборатория Касперского\" использует этот URL-адрес для проверки возможностей обнаружения антивирусных программ. \nВ следующем примере показано, как это сделать с помощью примера HTTP-клиента: \n\n./kavhttp_client -u http://bug.qainfo.ru/TesT/Aphish_w\n\n\n\n ","Убедитесь, что URL-адрес обнаружен.","Тестирование корректности проверки репутации файлов и URL","Чтобы убедиться, что проверка репутации файлов и URL-адресов выполняется корректно:","Запросите тестовый файл KSN у своего персонального технического менеджера. Этот файл не является вредоносным и используется только для тестирования корректности проверки репутации файлов и URL-адресов.","Убедитесь, что флаг KAV_SHT_ENGINE_KSN не указан в элементе Flags файла конфигурации режима HTTP.","Запустите kavhttpd.","Запустите свой HTTP-клиент.","Просканируйте тестовый файл KSN с помощью своего HTTP-клиента в режиме сканирования файлов.","Убедитесь, что тестовый файл KSN не обнаружен.","Укажите флаг KAV_SHT_ENGINE_KSN в элементе Flags файла конфигурации режима HTTP.","Перезапустите службу kavhttpd.","Повторно просканируйте тестовый файл KSN с помощью своего HTTP-клиента в режиме сканирования файлов.","Убедитесь, что тестовый файл KSN обнаружен."," Проверка возможностей обнаружения в режиме HTTP ","180193.htm"));
Page.push(new Array("Распознаваемые форматы файлов","Эта группа констант определяет форматы файлов, распознаваемые программой Format Recognizer. Вы можете настроить Format Recognizer для использования в режиме HTTP, а также в режиме ICAP.","Текстовые форматы","KAV_FF_GENERAL_TXT","KAV_FF_GENERAL_CSV","KAV_FF_GENERAL_HTML","KAV_FF_GENERAL_HTML_STRICT","KAV_FF_TEXT_REG","Форматы мультимедиа","KAV_FF_VIDEO_FLV","KAV_FF_VIDEO_F4V","KAV_FF_VIDEO_AVI","KAV_FF_VIDEO_3GPP","KAV_FF_VIDEO_DIVX","KAV_FF_VIDEO_MKV","KAV_FF_VIDEO_MOV","KAV_FF_VIDEO_ASF","KAV_FF_VIDEO_RM","KAV_FF_VIDEO_VOB","KAV_FF_VIDEO_BIK","KAV_FF_VIDEO_RTMP","KAV_FF_AUDIO_MP3","KAV_FF_AUDIO_FLAC","KAV_FF_AUDIO_APE","KAV_FF_AUDIO_OGG","KAV_FF_AUDIO_AAC","KAV_FF_AUDIO_WMA","KAV_FF_AUDIO_AC3","KAV_FF_AUDIO_WAV","KAV_FF_AUDIO_MKA","KAV_FF_AUDIO_RA","KAV_FF_AUDIO_MIDI","KAV_FF_AUDIO_CDA","KAV_FF_IMAGE_JPEG","KAV_FF_IMAGE_GIF","KAV_FF_IMAGE_PNG","KAV_FF_IMAGE_BMP","KAV_FF_IMAGE_TIFF","KAV_FF_IMAGE_EMF","KAV_FF_IMAGE_EPS","KAV_FF_IMAGE_PSD","KAV_FF_IMAGE_CDR","KAV_FF_MULTIMEDIA_SWF","Форматы исполняемых файлов","Формат","Описание","Операционная система","Расширения","KAV_FF_EXECUTABLE_WIN32PE_EXE","32-разрядные исполняемые файлы (только exe)","32-разрядные системы Windows","exe","KAV_FF_EXECUTABLE_WIN32PE_EXEUI","Исполняемые файлы программ с пользовательским интерфейсом и исполняемые файлы для подсистемы Microsoft POSIX","32-разрядные системы Windows","exe","KAV_FF_EXECUTABLE_WIN32PE_DLL","Динамические библиотеки","32-разрядные системы Windows","dll, ocx, scr","KAV_FF_EXECUTABLE_WIN32PE_RESOURCE","Библиотеки ресурсов","32-разрядные системы Windows","dll","KAV_FF_EXECUTABLE_WIN32PE_NET","KAV_FF_EXECUTABLE_WIN32PE_ILONLY","Исполняемые файлы, содержащие только Common Intermediate Language (CIL)","32-разрядные системы Windows","exe, dll, ocx, scr","KAV_FF_EXECUTABLE_WIN32PE_ILLIBRARY","Библиотеки Common Intermediate Language","32-разрядные системы Windows","exe, dll, ocx, scr","KAV_FF_EXECUTABLE_WIN32PE","32-разрядные исполняемые файлы","32-разрядные системы Windows","exe, dll, ocx, scr","KAV_FF_EXECUTABLE_WIN32PE_SYS","Системные файлы","32-разрядные системы Windows","sys","KAV_FF_EXECUTABLE_WIN32PE_NET_RESOURCE_WITH_POSSIBLE_TRIVIAL_CODE","Библиотеки ресурсов .NET (могут содержать тривиальный код)","32-разрядные системы Windows","dll","KAV_FF_EXECUTABLE_DOS","Исполняемые файлы, не основанные на Win32 или Win64 API","16-разрядные системы Windows, DOS, OS/2","exe, dll","KAV_FF_EXECUTABLE_DOS_NE_RESOURCE","Библиотеки ресурсов NE","16-разрядные системы Windows, DOS, OS/2","exe, dll","KAV_FF_EXECUTABLE_COM","KAV_FF_EXECUTABLE_JAVA","KAV_FF_EXECUTABLE_ELF","KAV_FF_EXECUTABLE_JS","KAV_FF_EXECUTABLE_VBS","KAV_FF_EXECUTABLE_BAT","KAV_FF_EXECUTABLE_MSI","KAV_FF_EXECUTABLE_DEB","KAV_FF_EXECUTABLE_RPM","KAV_FF_EXECUTABLE_SCRIPTS","KAV_FF_EXECUTABLE_MACHO","KAV_FF_EXECUTABLE_DEX","KAV_FF_EXECUTABLE_APK","KAV_FF_EXECUTABLE_PYC","KAV_FF_EXECUTABLE_APPLE_SCRIPT","KAV_FF_EXECUTABLE_WINDOWS_SHELLLINK","Форматы офисных приложений","KAV_FF_OFFICE_OPENXML","KAV_FF_OFFICE_MSOFFICE_MACRO","KAV_FF_OFFICE_MSOFFICE","KAV_FF_OFFICE_RTF","KAV_FF_OFFICE_PDF","KAV_FF_OFFICE_MSG","KAV_FF_OFFICE_EML","KAV_FF_OFFICE_VSD","KAV_FF_OFFICE_VDX","KAV_FF_OFFICE_XPS","KAV_FF_OFFICE_ONE","KAV_FF_OFFICE_ONEPKG","KAV_FF_OFFICE_XSN","KAV_FF_OFFICE_ODT","KAV_FF_OFFICE_ODS","KAV_FF_OFFICE_ODP","KAV_FF_OFFICE_SXW","KAV_FF_MSOFFICE_DOC","KAV_FF_MSOFFICE_DOT","KAV_FF_MSOFFICE_DOCX","KAV_FF_MSOFFICE_DOTX","KAV_FF_MSOFFICE_DOCM","KAV_FF_MSOFFICE_DOTM","KAV_FF_MSOFFICE_XLS","KAV_FF_MSOFFICE_XLSX","KAV_FF_MSOFFICE_XLTX","KAV_FF_MSOFFICE_XLSM","KAV_FF_MSOFFICE_XLTM","KAV_FF_MSOFFICE_XLAM","KAV_FF_MSOFFICE_XLSB","KAV_FF_MSOFFICE_PPT","KAV_FF_MSOFFICE_PPTX","KAV_FF_MSOFFICE_POTX","KAV_FF_MSOFFICE_PPTM","KAV_FF_MSOFFICE_POTM","KAV_FF_MSOFFICE_PPSX","KAV_FF_MSOFFICE_PPSM","KAV_FF_MSOFFICE_PUB","KAV_FF_MSOFFICE_SCRAP","Файлы баз данных","KAV_FF_DATABASE_MDB","KAV_FF_DATABASE_ACCDB","KAV_FF_DATABASE_ACCDC","Файлы архивов","KAV_FF_ARCHIVE_ZIP","KAV_FF_ARCHIVE_7Z","KAV_FF_ARCHIVE_RAR","KAV_FF_ARCHIVE_ISO","KAV_FF_ARCHIVE_CAB","KAV_FF_ARCHIVE_JAR","KAV_FF_ARCHIVE_BZIP2","KAV_FF_ARCHIVE_GZIP","KAV_FF_ARCHIVE_ARJ","KAV_FF_ARCHIVE_DMG","KAV_FF_ARCHIVE_XAR","KAV_FF_ARCHIVE_TAR","KAV_FF_ARCHIVE_ACE","Файлы веб-архивов","KAV_FF_TEXT_CHM","KAV_FF_TEXT_MHT","Прочее","KAV_FF_CRYPTO_CAT"," Распознаваемые форматы файлов ","180222.htm"));
Page.push(new Array("Правила ICAP (ICAP rules)","В этом разделе описана страница ICAP rules Kaspersky Scan Engine GUI. На странице ICAP rules вы можете добавлять, удалять и редактировать правила ICAP. Вы можете создать столько правил ICAP, сколько захотите.","Эта страница доступна, если Kaspersky Scan Engine инициализирован в режиме ICAP.","Страница правил ICAP","Если при загрузке веб-страницы произошла ошибка и настройки стали недоступны, перезагрузите страницу.","Когда вы открываете страницу ICAP rules, Kaspersky Scan Engine считывает следующие данные, которые необходимо использовать при редактировании правил ICAP:","Имена шаблонов ответов, которые хранятся в директории, указанной в элементе ResponsesPath файла конфигурации плагина ICAP.","Имена скриптов, которые хранятся в директории, указанной в элементе CmdPath файла конфигурации плагина ICAP.","Одно правило ICAP содержит следующие поля:","Режим ICAP, соответствующий правилу.","Вы можете выбрать один из следующих режимов ICAP:","Request mode","Response mode","Any","Результат сканирования, после которого активируется правило.","Вы можете выбрать один из следующих результатов сканирования:","Detected","Not scanned","Failed","Macro","Phishing","Any","Clean","Шаблон ответа.","Этот шаблон ответа используется на заблокированной веб-странице после активации правила.","После загрузки веб-страницы ICAP rules вы можете выбрать один из шаблонов ответов, которые будет получать Kaspersky Scan Engine. В правиле ICAP вы можете указать либо шаблон ответа, либо скрипт для выполнения, но не то и другое вместе.","Вы можете оставить это поле пустым.","Скрипт для выполнения.","Выполняется после активации правила.","После загрузки веб-страницы ICAP rules вы можете выбрать один из скриптов, которые будет получать Kaspersky Scan Engine. В правиле ICAP вы можете указать либо шаблон ответа, либо скрипт для выполнения, но не то и другое вместе.","Вы можете оставить это поле пустым.","Kaspersky Scan Engine не обрабатывает правила, в которых для параметра Scan result задано значение Any, а для Action — None. Вы должны избегать использовать эти правила (см. таблицу ниже).","Недопустимые правила ICAP","Режим ICAP","Результат сканирования","Действие","Response mode","Any","None","Request mode","Any","None","Any","Any","None"," Правила ICAP (ICAP rules) ","180283.htm"));
Page.push(new Array("Начало работы с Kaspersky Scan Engine","Этот раздел содержит информацию о том, как легко и быстро начать пользоваться Kaspersky Scan Engine."," Начало работы с Kaspersky Scan Engine ","180558.htm"));
Page.push(new Array("Ручная установка (Linux)","В этом разделе описано, как запустить Kaspersky Scan Engine на системах Linux.","Перед установкой и настройкой Kaspersky Scan Engine вам необходимо указать региональные настройки компьютера, на котором установлен Kaspersky Scan Engine. Используйте следующие команды.","LC_ALL=en_US.utf8","export LC_ALL","Чтобы установить Kaspersky Scan Engine вручную:","Убедитесь, что у вас есть права администратора.","Создайте директорию /opt/kaspersky/ScanEngine. В этом справочном документе эта директория называется %service_dir%.","Распакуйте содержимое пакета распространения в директорию %service_dir% на вашем компьютере.","Распакуйте объекты из пакета распространения KAV SDK (далее","%SDK_kit%",") следующим образом:","Объекты из %SDK_kit%/bin/bases в %service_dir%/bin/bases.","Объекты из %SDK_kit%/include в %service_dir%/include.","Объекты из %SDK_kit%/lib в %service_dir%/lib.","Объекты из % %SDK_kit%/ppl в %service_dir%/ppl.","Файл %SDK_kit%/tools/kavsigner в %service_dir%/tools.","Файл% %SDK_kit%/tools/integrity_check_sdk.xml в %service_dir%.","Только пользователи с правами администратора должны иметь доступ к объектам из %SDK_kit%. Для совместимости с Kaspersky Scan Engine используйте KAV SDK версии 8.9.2.595 или более поздней версии.","Ознакомьтесь с Пользовательским соглашением (End User License Agreement, EULA) для Kaspersky Scan Engine. Пользовательское соглашение находится по адресу %service_dir%/doc/license.txt.","Если вы согласны с условиями Пользовательского соглашения, переходите к следующему шагу. Если вы отклоняете условия Пользовательского соглашения, отмените установку.","Откройте файл %service_dir%/etc/klScanEngineUI.xml.","Примите условия Пользовательского соглашения с конечным пользователем. В файле klScanEngineUI.xml замените <Common>rejected</Common> на <Common>accepted</Common>.","Если вы хотите использовать Kaspersky Security Network (KSN), ознакомьтесь с Пользовательским соглашением для KSN и Политикой конфиденциальности. Это Пользовательское соглашение также находится по адресу %service_dir%/doc/ksn_license.txt и содержит ссылку на Политику конфиденциальности.","Если вы согласны с условиями Пользовательского соглашения для KSN и Политикой конфиденциальности, переходите к следующему шагу. Если вы отклоняете условия Пользовательского соглашения для KSN или Политику конфиденциальности, перейдите к шагу 10.","Примите Пользовательское соглашение для KSN. Измените <KSN>rejected</KSN> на <KSN>accepted</KSN> в klScanEngineUI.xml.","Сохраните и закройте %service_dir%/etc/klScanEngineUI.xml.","Создайте символьную ссылку на %service_dir%/etc/klScanEngineUI.xml из директории /etc/:","ln -s %service_dir%/etc/klScanEngineUI.xml /etc/klScanEngineUI.xml","Если вы хотите использовать Kaspersky Scan Engine GUI, прочтите подраздел \"Включение Kaspersky Scan Engine GUI\" ниже.","Создайте символьную ссылку на соответствующий файл конфигурации Kaspersky Scan Engine из директории","/etc/",":","Для режима HTTP скопируйте файл %service_dir%/etc/kavhttpd.xml в директорию /etc/.","Для режима ICAP скопируйте файл %service_dir%/etc/kavicapd.xml в директорию /etc/.","Например, в режиме HTTP вы должны выполнить следующую команду:","ln -s %service_dir%/etc/kavhttpd.xml /etc/kavhttpd.xml","Если вы не используете Kaspersky Scan Engine GUI и требуется подключение через прокси-сервер, вы должны указать зашифрованное имя пользователя и пароль для прокси-сервера. Чтобы зашифровать имя пользователя и пароль:","Создайте ключ шифрования следующим образом:\n\n\nopenssl rand -out %service_dir%/httpsrv/kl_scanengine_db.key 512 ","Предоставьте право на чтение только владельцу, выполнив следующую команду:\n\n\nchmod 400 %service_dir%/httpsrv/kl_scanengine_db.key ","Чтобы зашифровать учетные данные, используйте утилиту kav_encrypt. Эта утилита также автоматически записывает зашифрованные имя пользователя и пароль в файл конфигурации kavhttpd.xml (для режима HTTP) или kavicapd.xml (для режима ICAP). Утилита находится в директории %service_dir%/tools/.\n\n\nЗапустите утилиту kav_encrypt со следующими параметрами: \n\n\n-m <httpd | icap> -p <user_name:password> ","В","/etc/systemd/system/multi-user.target.wants/","создайте символьные ссылки на следующие файлы:","В режиме ICAP создайте символьную ссылку на /opt/kaspersky/ScanEngine/etc/kavicapd.service с помощью следующей команды:","ln -s /opt/kaspersky/ScanEngine/etc/kavicapd.service /etc/systemd/system/kavicapd.service","Для режима HTTP создайте символьную ссылку на /opt/kaspersky/ScanEngine/etc/kavhttpd.service с помощью следующей команды:","ln -s /opt/kaspersky/ScanEngine/etc/kavhttpd.service /etc/systemd/system/kavhttpd.service","Зарегистрируйте Kaspersky Scan Engine в системе с помощью следующих команд:","systemctl daemon-reload","systemctl enable kavhttpd","systemctl enable kavicapd","Запустите зарегистрированные службы Kaspersky Scan Engine:","Для режима ICAP запустите:","service kavicapd start","Для режима HTTP запустите:","service kavhttpd start","Перейдите к следующим шагам, как описано в разделе \"Начало работы\" в режиме HTTP или ICAP.","Активируйте Kaspersky Scan Engine в режиме лицензирования офлайн или в режиме лицензирования онлайн.","После установки Kaspersky Scan Engine вы можете в любой момент проверить целостность его компонентов с помощью утилиты проверки целостности.","Включение Kaspersky Scan Engine GUI","Чтобы включить Kaspersky Scan Engine GUI:","Убедитесь, что у вас есть права администратора.","Выполните одно из следующих действий.","Если вы ранее не устанавливали экземпляр Kaspersky Scan Engine GUI или не хотите добавлять новый экземпляр в существующий кластер, выполните действия, описанные в разделе Подготовка к установке Kaspersky Scan Engine GUI.","Если у вас уже есть экземпляр Kaspersky Scan Engine GUI и вы хотите добавить новый экземпляр в тот же кластер, перейдите к шагу 4.","На компьютере, на котором установлен PostgreSQL, выполните перечисленные ниже действия от имени пользователя, который может создавать новых пользователей и базы данных. Для выполнения этих действий вы можете использовать утилиту psql или pgAdmin.","Убедитесь, что пользователь, выполняющий запросы к базе данных, имеет доступ к директории, содержащей таблицы tables.sql, а также имеет доступ на чтение к самому tables.sql.","Создайте нового пользователя PostgreSQL с именем scanengine:\n\n\nCREATE USER scanengine; ","Задайте пароль для пользователя scanengine:\n\n\nALTER USER scanengine WITH PASSWORD '%PASSWORD%'; ","Используя PostgreSQL, создайте базу данных под названием kavebase:\n\n\nCREATE DATABASE kavebase OWNER scanengine; ","В базе данных kavebase выполните запросы, описанные в %service_dir%/samples/tables.sql.\n\n\npsql -d kavebase -a -f tables.sql ","Откройте /etc/klScanEngineUI.xml.","В элементе <Mode> укажите режим работы Kaspersky Scan Engine:","Для режима HTTP:","<Mode>httpd</Mode>","Для режима ICAP:","<Mode>icap</Mode>","Измените <EnableUI>false</EnableUI> на <EnableUI>true</EnableUI>.","В элементе <ConnectionString> укажите адрес веб-службы Kaspersky Scan Engine GUI в формате %IP%:%port%.","Например:","<ConnectionString>198.51.100.0:443</ConnectionString>","Укажите SSL-сертификат для установки в веб-службе Kaspersky Scan Engine GUI.","Если у вас уже есть SSL-сертификат, который вы хотите установить в веб-службе Kaspersky Scan Engine GUI, укажите пути к вашему сертификату и вашему закрытому ключу:","В элементе <SSLCertificatePath> укажите путь к вашему сертификату SSL.","В элементе <SSLPrivateKeyPath> укажите путь к вашему закрытому ключу.","Если у вас нет SSL-сертификата, который вы хотите установить в веб-службе Kaspersky Scan Engine GUI, сгенерируйте новый. Запустите утилиту %service_dir%/tools/openssl следующим образом:","/opt/kaspersky/ScanEngine/tools/openssl req -x509 -nodes -days 1825 -subj /C=RU/CN=\"%ConnectionString%\" -newkey rsa:4096 -extensions EXT -config \"/opt/kaspersky/ScanEngine/tools/openssl.cnf\" -keyout \"/opt/kaspersky/ScanEngine/httpsrv/kl_scanengine_private.pem\" -out \"/opt/kaspersky/ScanEngine/httpsrv/kl_scanengine_cert.pem\"","Здесь %ConnectionString% – это значение, указанное в элементе %ConnectionString%. Рекомендуется использовать значения rsa:4096 или rsa:3072 с параметром -newkey. Минимальное поддерживаемое значение – rsa:2048.","Вы должны настроить доступ к файлу закрытого ключа для Kaspersky Scan Engine GUI, чтобы только пользователь root и учетная запись пользователя, под которой запущена служба, могли иметь разрешение на чтение.","Создайте ключ шифрования следующим образом:","openssl rand -out %service_dir%/httpsrv/kl_scanengine_db.key 512","Предоставьте право на чтение только владельцу, выполнив следующую команду:","chmod 400 %service_dir%/httpsrv/kl_scanengine_db.key","В элементе DatabaseSettings > ConnectionString укажите адрес новой или существующей базы данных kavebase, к которой вы хотите подключиться, используя формат %IP%:%port%.","Сохраните и закройте /etc/klScanEngineUI.xml.","Зашифруйте имя пользователя и пароль пользователя, который будет использоваться для доступа к базе данных kavebase:","Если вы никогда раньше не устанавливали экземпляр Kaspersky Scan Engine с графическим интерфейсом пользователя или не хотите добавлять новый экземпляр в существующий кластер, зашифруйте имя и пароль пользователя, указанного на шаге 3. ","Если у вас уже есть экземпляр Kaspersky Scan Engine с графическим интерфейсом пользователя и вы хотите добавить новый экземпляр в тот же кластер, зашифруйте имя и пароль пользователя, который используется для доступа к базе данных kavebase кластера.","Чтобы зашифровать учетные данные, используйте утилиту kav_encrypt. Эта утилита также автоматически записывает зашифрованные имя пользователя и пароль в /etc/klScanEngineUI.xml. Утилита находится в директории %service_dir%/tools/.","Запустите утилиту kav_encrypt со следующими параметрами:","-d '%username%:%password%'","В /etc/systemd/system/multi-user.target.wants/ создайте символьную ссылку на /opt/kaspersky/ScanEngine/etc/klScanEngineUI.service с помощью следующей команды:","ln -s /opt/kaspersky/ScanEngine/etc/klScanEngineUI.service /etc/systemd/system/klScanEngineUI.service","Зарегистрируйте Kaspersky Scan Engine в системе с помощью следующих команд:","systemctl daemon-reload","systemctl enable klScanEngineUI","Запустите зарегистрированную службу Kaspersky Scan Engine:","service klScanEngineUI start"," Ручная установка (Linux) ","180652.htm"));
Page.push(new Array("Удаление вручную (Linux)","В этом разделе описано, как удалить Kaspersky Scan Engine вручную.","Удаление Kaspersky Scan Engine 2.1 и более поздней версии вручную","Чтобы вручную удалить Kaspersky Scan Engine 2.1 и более поздней версии:","Убедитесь, что у вас есть права администратора.","Остановите Kaspersky Scan Engine:","Если вы использовали Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\nservice kavicapd stop ","Если вы использовали Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\nservice kavhttpd stop ","Если вы использовали Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\nservice klScanEngineUI stop ","Удалитье Kaspersky Scan Engine из списка служб.","Если вы использовали Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\nsystemctl disable kavicapd ","Если вы использовали Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\nsystemctl disable kavhttpd ","Если вы использовали Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\nsystemctl disable klScanEngineUI ","Удалите символьные ссылки на файлы конфигурации Kaspersky Scan Engine.","Если вы использовали Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\nrm /etc/kavicapd.xml ","Если вы использовали Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\nrm /etc/kavhttpd.xml ","Если вы использовали Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\nrm /etc/klScanEngineUI.xml ","Если вы использовали Kaspersky Scan Engine GUI, откройте базу данных PostgreSQL, а затем удалите базу данных kavebase и пользователя базы данных.","Пропустите этот шаг, если хотите использовать базу данных позже или если удаляемый экземпляр Kaspersky Scan Engine входит в состав кластера, содержащего другие экземпляры.","Чтобы удалить базу данных kavebase, выполните следующую команду:","DROP DATABASE kavebase;","Чтобы удалить пользователя базы данных, выполните следующую команду:","DROP ROLE %user_name%;","Здесь %user_name% – имя пользователя базы данных, созданного при установке Kaspersky Scan Engine.","Например, чтобы удалить пользователя базы данных scanengine по умолчанию, выполните следующую команду:","DROP ROLE scanengine;","Только суперпользователь может удалить базу данных и ее пользователя.","Удалите директорию /opt/kaspersky/ScanEngine:","rm –rf /opt/kaspersky/ScanEngine","Удалите директорию с временными файлами Kaspersky Scan Engine.","rm –rf %temp_dir%","Здесь %temp_dir% – временная директория.","Удаление Kaspersky Scan Engine 2.0 вручную","Чтобы удалить Kaspersky Scan Engine 2.0 вручную:","Убедитесь, что у вас есть права администратора.","Остановите Kaspersky Scan Engine:","Если вы используете Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\n/etc/init.d/kavicapd stop ","Если вы используете Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\n/etc/init.d/kavhttpd stop ","Если вы используете Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\n /etc/init.d/klScanEngineUI stop ","Удалите исполняемый файл и файл конфигурации.","Если вы используете Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\nrm /etc/init.d/kavicapd /etc/kavicapd.xml ","Если вы используете Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\nrm /etc/init.d/kavhttpd /etc/kavhttpd.xml ","Если вы используете Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\nrm /etc/init.d/klScanEngineUI /etc/klScanEngineUI.xml ","Если вы использовали Kaspersky Scan Engine GUI, откройте базу данных PostgreSQL и удалите базу данных kavebase и пользователя базы данных.","Пропустите этот шаг, если хотите использовать базу данных позже или если удаляемый экземпляр Kaspersky Scan Engine входит в состав кластера, содержащего другие экземпляры.","Чтобы удалить базу данных kavebase, выполните следующую команду:","DROP DATABASE kavebase;","Чтобы удалить пользователя scanengine, выполните следующую команду:","DROP ROLE scanengine;","Удалите директорию /opt/kaspersky/ScanEngine:","rm –rf /opt/kaspersky/ScanEngine","Удалите директорию с временными файлами Kaspersky Scan Engine.","rm –rf %temp_dir%","Здесь %temp_dir% – временная директория."," Удаление вручную (Linux) ","180699.htm"));
Page.push(new Array("Статистика, передаваемая в KSN","Вы можете отправить набор статистики в KSN.","Этот набор статистики включает следующее:","Информация об используемой версии Kaspersky Scan Engine.","Информация о версии операционной системы отправителя статистики.","Идентификатор обладателя лицензии.","Информация об обнаруженных объектах.","Смотрите также подробную информацию о предоставлении данных."," Статистика, передаваемая в KSN ","180772.htm"));
Page.push(new Array("Выполнение запросов в режиме HTTP по протоколу KAV версий 1 и 2","Этот раздел содержит информацию о том, как отправлять HTTP-запросы к Kaspersky Scan Engine, используя протокол KAV версий 1 и 2."," Выполнение запросов в режиме HTTP по протоколу KAV версий 1 и 2 ","181038.htm"));
Page.push(new Array("Повышение коэффициента обнаружения","Когда выполняется HTTP-запрос на сканирование файла или блока памяти, есть два способа увеличить коэффициент обнаружения, указав необязательный контекст задачи сканирования:","Укажите источник объекта для сканирования в поле","url","тела запроса POST:","Если объект для сканирования был получен из Интернета, укажите веб-адрес источника, включая протокол, например:\n\n\nhttp://example.com \n\n\nПоддерживаются протоколы HTTP, HTTPS и FTP. \n\n\nЕсли URL-адрес неизвестен, рекомендуется использовать http://example.com в качестве контекста задачи сканирования. ","Если объект для сканирования был получен по электронной почте, укажите адрес отправителя в следующем формате: [from:%sender_address%], например:\n\n\n[from:example@example.com] \n\n\nЕсли адрес отправителя неизвестен, рекомендуется использовать [from: test@relay.example] в качестве контекста задачи сканирования. ","Ниже приведен пример HTTP-запроса на сканирование локального файла, полученного из Интернета. Обратите внимание на использование поля url для указания веб-адреса источника:","POST /api/v3.0/scanfile HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 22","{","\"timeout\": \"10000\",","\"object\": \"\\/home\\/user\\/eicar\",","\"url\": \"http:\\/\\/example.com\"","}","Ответ такой же, как в примере HTTP-запроса на сканирование локального файла.","Предоставьте заголовки запроса и ответа, собранные из HTTP-трафика, связанного с объектом для сканирования, в полях requestHeaders и responseHeaders тела запроса POST.","Обратите внимание, что вы можете комбинировать два типа контекста задачи сканирования для дальнейшего повышения коэффициента обнаружения. В приведенном ниже примере заголовки запроса и ответа указаны вместе с веб-адресом источника.","POST /api/v3.0/scanfile HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 22","{","\"object\": \"\\/home\\/user\\/eicars.tar\",","\"requestHeaders\": \": authority: example.com\\r\\n: method: GET\\r\\n path:\\/ \\r\\n:scheme: https\\r\\naccept: text\\/html,application\\/xhtml+xml,application\\/xml;q=0.9,image\\/webp,image\\/apng,*\\/*;q=0.8\\r\\naccept-encoding: gzip, deflate, br\\r\\naccept-language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,mt;q=0.6\\r\\ncache-control: no-cache\\r\\npragma: no-cache\\r\\nupgrade-insecure-requests: 1\\r\\nuser-agent: Mozilla\\/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/71.0.3578.98 Safari\\/537.36\",","\"responseHeaders\": \"accept-ranges: bytes\\r\\ncache-control: max-age=604800\\r\\ncontent-type: text\\/html; charset=UTF-8\\r\\ndate: Thu, 31 Jan 2019 18:51:11 GMT\\r\\netag: \\\"1541025663\\\"\\r\\nexpires: Thu, 07 Feb 2019 18:51:11 GMT\\r\\nlast-modified: Fri, 09 Aug 2013 23:54:35 GMT\\r\\nserver: ECS (dca\\/532C)\\r\\nstatus: 200\\r\\nvary: Accept-Encoding\\r\\nx-cache: HIT\",","\"url\": \"http:\\/\\/example.com\"","}","На успешно обработанный запрос будет получен следующий ответ:","HTTP/1.0 200 Ok","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 15:46:29 GMT","Content-Length: 75","{","\"object\": \\/home\\/user\\/eicars.tar\",","\"scanResult\": \"DETECT\",","\"detectionName\": \"multiple\",","\"subObjectsScanResults\": [","{","\"object\": \"\\/home\\/user\\/eicars.tar\\/\\/eicar1\",","\"scanResult\": \"DETECT\",","\"detectionName\": \"EICAR-Test-File\"","},","{","\"object\": \"\\/home\\/user\\/eicars.tar\\/\\/eicar2\",","\"scanResult\": \"DETECT\",","\"detectionName\": \"EICAR-Test-File\"","}","]","}"," Повышение коэффициента обнаружения ","181065.htm"));
Page.push(new Array("Заголовки запросов","HTTP-запрос к Kaspersky Scan Engine методом POST должен содержать заголовок Content-Length.","При отправке HTTP-запроса вы можете задать три заголовка запроса, специфичные для Kaspersky Scan Engine:","X-KAV-ProtocolVersion","Этот заголовок определяет используемую версию протокола KAV. Этот заголовок является обязательным.","X-KAV-Timeout","Этот заголовок указывает тайм-аут операции сканирования в миллисекундах (но не тайм-аут сеанса). Этот заголовок не является обязательным.","Этот заголовок принимает значения от 0 до 4294967295 (32-разрядное целое положительное число). Задайте значение в зависимости от характеристик проверяемого объекта (например, его размера, является ли он составным или нет; Kaspersky Scan Engine дольше проверяет большой составной объект).","Смотрите также подробную информацию о тайм-ауте сканирования и тайм-ауте сеанса.","X-KAV-ObjectURL","Этот заголовок содержит контекст задачи проверки, который Kaspersky Scan Engine использует для повышения коэффициента обнаружения. Этот заголовок не является обязательным.","Использование этого заголовка не влияет на производительность сканирования.","Мы рекомендуем вам использовать контекст задачи сканирования при интеграции типа gateway.","Используйте следующий формат для контекста:","Если объект для сканирования был получен из Интернета, укажите веб-адрес источника, включая протокол, например:\n\n\nhttp://example.com \n\n\nПоддерживаются протоколы HTTP, HTTPS и FTP. \n\n\nЕсли URL-адрес неизвестен, мы рекомендуем использовать http://example.com в качестве контекста задачи сканирования. ","Если объект для сканирования был получен по электронной почте, укажите адрес отправителя в следующем формате: [from:%sender_address%], например:\n\n\n[from:example@example.com] \n\n\nЕсли адрес отправителя неизвестен, рекомендуется использовать [from: test@relay.example] в качестве контекста задачи сканирования. ","Контекст задачи сканирования применим только к проверке файлов и памяти. Если вы укажете контекст задачи сканирования для URL-адреса, он будет проигнорирован.","X-KAV-HostIP","Этот заголовок указывает IP-адрес хоста, на котором размещен URL-адрес для сканирования. Добавление его в запрос увеличивает коэффициент обнаружения."," Заголовки запросов ","181073.htm"));
Page.push(new Array("Пример HTTP-запроса на сканирование локального файла","Ниже приведен пример HTTP-запроса на сканирование локального файла:","POST /scanfile HTTP/1.0","Content-Length: 35","X-KAV-ProtocolVersion: 1","X-KAV-Timeout: 10","* Full path to the EICAR test file *","Если файл для сканирования большой, вы можете указать заголовок X-KAV-Timeout.","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD","Content-Length: 32","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","DETECT EICAR-Test-File"," Пример HTTP-запроса на сканирование локального файла ","181074.htm"));
Page.push(new Array("Пример HTTP-запроса на сканирование части оперативной памяти","Ниже приведен пример HTTP-запроса на сканирование блока оперативной памяти:","POST /scanmemory HTTP/1.0","Content-Length: 35","X-KAV-ProtocolVersion: 1","X-KAV-Timeout: 10","* Содержание тестового файла EICAR *","Если файл для сканирования большой, вы можете указать заголовок X-KAV-Timeout.","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD","Content-Length: 64","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","DETECT EICAR-Test-File","Вы также можете сделать составной запрос на сканирование."," Пример HTTP-запроса на сканирование части оперативной памяти ","181076.htm"));
Page.push(new Array("Пример составного HTTP-запроса на сканирование блока памяти","В Kaspersky Scan Engine составной HTTP-запрос – это HTTP-запрос, содержащий заголовки запроса или ответа, полученные из HTTP-трафика, связанного со сканируемым объектом. Вы можете отправлять составные HTTP-запросы, чтобы повысить коэффициент обнаружения.","Kaspersky Scan Engine не поддерживает составные HTTP-запросы, как определено в RFC 1341.","Для выполнения составных HTTP-запросов используйте протокол KAV версии 2, указав его в заголовке запроса X-KAV-ProtocolVersion.","Тело составного HTTP-запроса должно состоять не более чем из трех частей. Эти части содержат следующие данные:","Заголовки запроса (необязательно).\nЭта часть должна начинаться со строки Request headers, за которой следует символ \\r\\n. За этими символами должны следовать заголовки запросов из HTTP-трафика, относящегося к сканируемому объекту. ","Заголовки ответа (необязательно).\nЭта часть должна начинаться со строки Response headers, за которой следует символ \\r\\n. За этими символами должны следовать заголовки ответов из HTTP-трафика, относящегося к сканируемому объекту. ","Объект для сканирования.\nЭта часть может содержать полный путь к файлу для сканирования (если запрос был послан к /scanfile) или строку (если запрос был послан к /scanmemory). ","В следующем примере показан составной HTTP-запрос для сканирования блока памяти:","POST /scanmemory HTTP/1.0","Content-Length: 753","X-KAV-ProtocolVersion: 2","X-KAV-Timeout: 10","X-KAV-ObjectURL: http://example.com","Content-Type: multipart/mixed; boundary=gc0p4Jq0M2Yt08jU534c0p","--gc0p4Jq0M2Yt08jU534c0p","Заголовки запросов","GET /files/test.exe HTTP/1.1","Host: source.example.com","Accept: application/octet-stream","Referer: http://malicious.example.com/","Host: source.example.com","Connection: Keep-Alive","--gc0p4Jq0M2Yt08jU534c0p","Заголовки ответов","HTTP/1.1 200 OK","Content-Type: application/octet-stream","Content-Length: 21541","Date: Mon, 25 Sep 2017 11:01:54 GMT","Last-Modified: Fri, 28 Sep 2017 03:15:02 GMT","--gc0p4Jq0M2Yt08jU534c0p","* Содержание тестового файла EICAR *","--gc0p4Jq0M2Yt08jU534c0p--","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Fri, 28 Sep 2017 03:15:02 GMT","Server: KAVHTTPD","Content-Length: 64","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 2","DETECT EICAR-Test-File"," Пример составного HTTP-запроса на сканирование блока памяти ","181078.htm"));
Page.push(new Array("Пример HTTP-запроса на проверку URL-адреса","Ниже приведен пример HTTP-запроса на проверку URL-адреса:","POST /checkurl HTTP/1.0","Content-Length: 27","X-KAV-ProtocolVersion: 1","X-KAV-Timeout: 15","* Фишинговый URL-адрес для проверки *","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:22 GMT","Server: KAVHTTPD","Content-Length: 110","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","DETECT PHISHING_URL"," Пример HTTP-запроса на проверку URL-адреса ","181080.htm"));
Page.push(new Array("Пример HTTP-запроса на получение даты выпуска текущей антивирусной базы","Ниже приведен пример HTTP-запроса на получение даты выпуска текущей антивирусной базы:","GET /basesdate HTTP/1.0","Host: example.com","X-KAV-ProtocolVersion: 1","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 15:03:21 GMT","Server: KAVHTTPD","Content-Length: 40","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","database version: 9.02.2014 15:03 GMT"," Пример HTTP-запроса на получение даты выпуска текущей антивирусной базы ","181082.htm"));
Page.push(new Array("Пример HTTP-запроса для получения текущей версии KAV SDK","Ниже приведен пример HTTP-запроса на получение версии библиотеки KAV SDK, на которой основана текущая версия Kaspersky Scan Engine:","GET /version HTTP/1.0","Host: example.com","X-KAV-ProtocolVersion: 1","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD","Content-Length: 27","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","KAV SDK version: 8.8.0.80"," Пример HTTP-запроса для получения текущей версии KAV SDK ","181084.htm"));
Page.push(new Array("Пример HTTP-запроса на получение лицензионной информации","Ниже приведен пример HTTP-запроса на получение лицензионной информации:","GET /licenseinfo HTTP/1.0","Host: example.com","X-KAV-ProtocolVersion: 1","Ниже приведен пример ответа на запрос, который содержит лицензионную информацию, если вы используете режим лицензирования офлайн:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD","Content-Length: 65","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","key file name: EXAMPLE.key","license expiration date: 05.12.2020","Ниже приведен пример ответа на запрос, который содержит лицензионную информацию, если вы используете режим лицензирования онлайн. В этом примере срок действия лицензионного билета истек.","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD","Content-Length: 185","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","activation code: EXMPL-*****-*****-12345","license expiration date: 05.12.2020","The license ticket has expired. Computer must be connected to the Internet to update the license ticket."," Пример HTTP-запроса на получение лицензионной информации ","181086.htm"));
Page.push(new Array("Пример HTTP-запроса на получение обобщенной статистики","Ниже приведен пример HTTP-запроса на получение обобщенной статистики:","GET /getstatistics HTTP/1.0","Host: example.com","X-KAV-ProtocolVersion: 1","Описание статистики, возвращаемой в HTTP-ответе, смотрите в примере выполнения этого запроса в протоколе KAV версии 3."," Пример HTTP-запроса на получение обобщенной статистики ","181088.htm"));
Page.push(new Array("Пример HTTP-запроса на удаление обобщенной статистики","Ниже приведен пример HTTP-запроса на удаление обобщенной статистики:","POST /clearstatistics HTTP/1.0","User-Agent: KAV HTTP Client","Content-Length: 0","X-KAV-ProtocolVersion: 1","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD","Content-Length: 0","Connection: close","X-KAV-ProtocolVersion: 1"," Пример HTTP-запроса на удаление обобщенной статистики ","181090.htm"));
Page.push(new Array("О протоколе KAV","Клиентское приложение использует протокол KAV для взаимодействия с Kaspersky Scan Engine посредством HTTP-запросов. Текущая версия протокола KAV – 3, но также поддерживаются версии 1 и 2.","Выберите версию протокола, которая лучше всего подходит для вашего решения:","Протоколу KAV версии 3\nВ версии 3 протокола тела сообщений запроса и сообщений ответа имеют формат JSON. Версия 3 поддерживает больше методов API, чем версии 1 и 2.\n\nЭто рекомендуемая версия протокола.\n\nОбратите внимание, что в системах Windows используется только протокол KAV версии 3.\n","Протокол KAV версии 1 и 2\nВ версиях 1 и 2 протокола тело запроса и тело ответа имеют формат простого текста.\n\nИспользуйте эти версии протокола, если для вашего решения необходим простой текстовый формат.\n"," О протоколе KAV ","181167.htm"));
Page.push(new Array("Поддерживаемые методы API в протоколе KAV версии 3","В следующей таблице перечислены методы API, которые Kaspersky Scan Engine поддерживает в режиме HTTP при использовании протокола KAV версии 3. Формат запросов не зависит от того, использует ли клиент TCP или UNIX-сокеты для взаимодействия с Kaspersky Scan Engine.","Методы API, поддерживаемые в режиме HTTP в протоколе KAV версии 3","Метод API","Метод HTTP","Формат","Описание","/api/v3.0/scanfile","/api/v3.1/scanfile","POST","Формат запроса","Сканирует файл.","Используйте метод API /api/v3.1/scanfile, чтобы получить дополнительную информацию о процессе сканирования.","/api/v3.0/scanmemory","/api/v3.1/scanmemory","POST","Формат запроса","Сканирует блок системной памяти.","Используйте метод API /api/v3.1/scanmemory, чтобы получить дополнительную информацию о процессе сканирования.","При сканировании системной памяти используйте только режим очистки KAV_SKIP. Kaspersky Scan Engine не может лечить или удалять файлы в этом режиме.","/api/v3.0/checkurl","POST","Формат запроса","Проверяет URL-адрес.","/api/v3.0/basesdate","GET","Формат запроса","Получает дату выпуска антивирусных баз. Вы можете использовать этот метод, чтобы проверить, запущен ли kavhttpd.","/api/v3.0/version","GET","Формат запроса","Получает текущую версию KAV SDK. Вы можете использовать этот метод, чтобы проверить, запущен ли kavhttpd.","/api/v3.0/licenseinfo","GET","Формат запроса","Получает информацию о текущем файле ключа или коде активации. Вы можете использовать этот метод, чтобы проверить, запущен ли kavhttpd.","/api/v3.0/getstatistics","GET","Формат запроса","Получает накопленную статистику.","/api/v3.0/clearstatistics","POST","Формат запроса","Очищает накопленную статистику.","/api/v3.0/update/start","POST","Формат запроса","Обновляет антивирусные базы.","/api/v3.0/update/status","/api/v3.1/update/status","GET","Формат запроса","Получает статус процесса обновления базы данных.","Воспользуйтесь методом API /api/v3.1/update/status, чтобы получить более подробную информацию о процессе обновления антивирусных баз.","/api/v3.1/ksninfo","GET","Формат запроса","Получает информацию о KSN."," Поддерживаемые методы API в протоколе KAV версии 3 ","181169.htm"));
Page.push(new Array("Поддерживаемые методы API в протоколе KAV версий 1 и 2","Помимо использования протокола KAV версии 3, вы можете отправлять POST- и GET-запросы к Kaspersky Scan Engine с помощью протокола KAV версий 1 и 2.","В следующей таблице перечислены методы API, которые Kaspersky Scan Engine поддерживает в режиме HTTP при использовании протокола KAV версий 1 и 2.","Методы API, поддерживаемые в режиме HTTP в протоколе KAV версий 1 и 2","Метод API","Метод HTTP","Описание","/scanfile","POST","Сканирует файл.","/scanmemory","POST","Сканирует блок системной памяти.","При сканировании системной памяти используйте только режим очистки KAV_SKIP. Kaspersky Scan Engine не может лечить или удалять файлы в этом режиме.","/checkurl","POST","Проверяет URL-адрес.","/basesdate","GET","Получает дату выпуска антивирусных баз. Вы можете использовать этот метод, чтобы проверить, запущен ли kavhttpd.","/version","GET","Получает текущую версию KAV SDK. Вы можете использовать этот метод, чтобы проверить, запущен ли kavhttpd.","/licenseinfo","GET","Получает информацию о текущем файле ключа или коде активации. Вы можете использовать этот метод, чтобы проверить, запущен ли kavhttpd.","/getstatistics","GET","Получает накопленную статистику.","/clearstatistics","POST","Очищает накопленную статистику."," Поддерживаемые методы API в протоколе KAV версий 1 и 2 ","181170.htm"));
Page.push(new Array("Использование утилиты шифрования","Утилита kav_encrypt позволяет зашифровать имена пользователей и пароли, хранящиеся в kavhttpd.xml, kavicapd.xml и klScanEngineUI.xml.","Утилита запускается из командной строки следующим образом:","./kav_encrypt [-m <httpd | icap> -p <user_name:password>] | [-d <user_name:password>] | [-h]","В таблице ниже описаны параметры kav_encrypt.","Параметры kav_encrypt","Параметр","Описание","-m <httpd | icap>","--mode <httpd | icap>","Указывает режим работы Kaspersky Scan Engine.","Возможные значения:","httpd\n\n\n\n\nРежим HTTP \n","icap\n\n\n\n\nРежим ICAP\n\n\n\n\n\nТолько для систем Linux.\n","-p <user_name:password>","--proxy <user_name:password>","Указывает имя пользователя и пароль прокси-сервера, который Kaspersky Scan Engine использует для доступа в интернет.","Этот параметр необходимо использовать вместе с параметром -m.","-d <user_name:password>","--database <user_name:password>","Указывает имя и пароль пользователя, владеющего базой данных kavebase.","-h","--help","Печатает справочную информацию об утилите kav_encrypt в командной строке."," Использование утилиты шифрования ","181814.htm"));
Page.push(new Array("Получение накопленной статистики в режиме ICAP","В режиме ICAP Kaspersky Scan Engine собирает информацию об использовании и формирует статистику на основе этих данных. Эта статистика хранится на вашем жестком диске. Вы можете просматривать статистику, чтобы отслеживать тенденции в данных, запрашиваемых из вашей сети. Например, вы можете проверить, не пытаются ли пользователи в вашей сети скачивать много вредоносных файлов.","Чтобы просмотреть накопленную статистику:","Откройте директорию, указанную в элементе TempPath файла конфигурации.","Найдите файл report.json и откройте его.","Ниже приведен пример файла report.json.","{","\"statistics\": {","\"total_requests\": 3,","\"infected_requests\": 3,","\"not_scanned_requests\": 0,","\"error_requests\": 0,","\"engine_errors\": 1,","\"processed_data\": 204,","\"infected_data\": 0,","\"processed_urls\": 1,","\"infected_urls\": 1","}","}","Здесь statistics – это объект, содержащий следующую накопленную статистику:","total_requests – общее количество полученных запросов в режимах RESPMOD и REQMOD.","infected_requests – количество запросов, на которые Kaspersky Scan Engine вернул результаты DETECT, PHISHING или MACRO.","not_scanned_requests","– количество допустимых запросов на сканирование, которые не были обработаны.","Возможные причины:","Объект слишком большой или слишком маленький.","Объект представляет собой зашифрованный архив.","Kaspersky Scan Engine настроен пропускать объекты формата, к которому он принадлежит. ","error_requests – количество неверных ICAP-запросов, полученных Kaspersky Scan Engine.","engine_errors – количество запросов, на которые Kaspersky Scan Engine вернул результат FAILED.","processed_data – размер всех просканированных файлов в байтах.","Сюда входят объекты, проверенные в режиме RESPMOD, и объекты в POST-запросах, которые были проверены в режиме REQMOD.","infected_data – размер всех данных в байтах, на которые Kaspersky Scan Engine вернул результат DETECT, PHISHING или MACRO.","Сюда входят объекты, проверенные в режиме RESPMOD, и объекты в POST-запросах, которые были проверены в режиме REQMOD.","processed_urls – количество проверенных URL-адресов.","infected_urls – количество URL-адресов, на которые Kaspersky Scan Engine вернул результат DETECT или PHISHING.","Сброс статистики","Вы можете сбросить накопленную статистику в любой момент.","Чтобы сбросить накопленную статистику:","Откройте директорию, указанную в элементе TempPath файла конфигурации.","Найдите файл report.json и удалите его.","Сервис kavicapd создаст новый файл report.json со значением всей статистики 0."," Получение накопленной статистики в режиме ICAP ","182615.htm"));
Page.push(new Array("Поиск и устранение неисправностей","В этом разделе представлена информация, полезная при решении проблем, которые могут возникнуть при использовании Kaspersky Scan Engine.","Если вы столкнулись с проблемой, не упомянутой в этом разделе, включите логирование, повторите действия, которые предшествовали проблеме, а затем отправьте журналы и файлы конфигурации вашему техническому менеджеру по работе с клиентами.","Проблема: Kaspersky Scan Engine не запускается после перезагрузки системы и не может быть запущен с помощью systemctl","Причина этой проблемы может заключаться в том, что директория /opt/ находится на смонтированном устройстве. Когда Kaspersky Scan Engine инициализируется после перезагрузки, устройство еще не смонтировано, и операционная система не может найти файлы модулей systemd для Kaspersky Scan Engine.","Чтобы решить эту проблему, попробуйте следующие действия:","Отключите службы Kaspersky Scan Engine:","systemctl disable klScanEngineUI","Для режима HTTP:\n\n\nsystemctl disable kavhttpd ","Для режима ICAP:\n\n\nsystemctl disable kavicapd ","Удалите символьные ссылки на файлы конфигурации Kaspersky Scan Engine.","rm /etc/klScanEngineUI.xml /etc/kavhttpd.xml /etc/kavicapd.xml","Скопируйте файлы модуля Kaspersky Scan Engine в","/etc/systemd/system/",":","cp /opt/kaspersky/ScanEngine/etc/klScanEngineUI.service /etc/systemd/system/klScanEngineUI.service","Для режима HTTP:\n\n\ncp /opt/kaspersky/ScanEngine/etc/kavhttpd.service /etc/systemd/system/kavhttpd.service ","Для режима ICAP:\n\n\ncp /opt/kaspersky/ScanEngine/etc/kavicapd.service /etc/systemd/system/kavicapd.service ","Скопируйте файлы конфигурации Kaspersky Scan Engine в /etc/:","cp /opt/kaspersky/ScanEngine/etc/klScanEngineUI.xml /etc/klScanEngineUI.xml","Для режима HTTP:\n\n\ncp /opt/kaspersky/ScanEngine/etc/kavhttpd.xml /etc/kavhttpd.xml ","Для режима ICAP:\n\n\ncp /opt/kaspersky/ScanEngine/etc/kavicapd.xml /etc/kavicapd.xml ","Перезагрузите systemd:","systemctl daemon-reload","Включите запуск служб Kaspersky Scan Engine при загрузке системы:","systemctl enable klScanEngineUI","Для режима HTTP:\n\n\nsystemctl enable kavhttpd ","Для режима ICAP:\n\n\nsystemctl enable kavicapd ","Запустите службы Kaspersky Scan Engine:","service klScanEngineUI start","Для режима HTTP:\n\n\nservice kavhttpd start ","Для режима ICAP:\n\n\nservice kavicapd start ","Проблема: Kaspersky Scan Engine не запускается и не печатает журналы","Проблема может заключаться в том, что Kaspersky Scan Engine не может найти klScanEngineUI.xml, либо файл поврежден и Kaspersky Scan Engine не может его прочитать.","Чтобы найти решение этой проблемы, проверьте файлы журналов, которые создаются в поддиректории /tmp/ директории установки Kaspersky Scan Engine.","Проблема: произошла ошибка при загрузке данных через Kaspersky Scan Engine GUI (панель управления или страница результатов проверки)","Причина возникновения проблемы – Kaspersky Scan Engine не может подключиться к базе данных kavebase или прочитать из нее данные.","Чтобы решить эту проблему, попробуйте следующие действия:","Проверьте, запущен ли экземпляр PostgreSQL.","Проверьте, доступен ли экземпляр PostgreSQL из вашего экземпляра Kaspersky Scan Engine.","Проверьте, сохраняется ли база данных kavebase в экземпляре PostgreSQL.\nЕсли нет, создайте базу данных kavebase, как описано в разделе \"Ручная установка (Linux)\". ","Проверьте, сохраняется ли пользователь базы данных scanengine в экземпляре PostgreSQL.\nЕсли нет, создайте пользователя базы данных scanengine, как описано в разделе \"Ручная установка (Linux)\". ","Проблема: Kaspersky Scan Engine GUI не отображается в браузере","Чтобы решить эту проблему, попробуйте следующие действия:","Убедитесь, что запущены экземпляр Kaspersky Scan Engine и служба klScanEngineUI.","Убедитесь, что вы используете поддерживаемый браузер.","Убедитесь, что файл конфигурации klScanEngineUI.xml содержит следующее:","В поле ServerSettings > EnableUI указано значение true.","Элемент","ServerSettings > ConnectionString","содержит один из следующих IP-адресов:","127.0.0.1\n\n\n\n\nВ этом случае Kaspersky Scan Engine GUI доступен с того же компьютера, на котором установлен Kaspersky Scan Engine.\n","Сетевой IP-адрес\n\n\n\n\nВ этом случае Kaspersky Scan Engine GUI доступен по сети. \n\n\n\n\nУбедитесь, что брандмауэр не блокирует доступ к компьютеру, на котором установлен Kaspersky Scan Engine. ","Проблема: ошибка ненадежного соединения при подключении к Kaspersky Scan Engine GUI","SSL-сертификаты, сгенерированные при установке Kaspersky Scan Engine, являются самозаверяющими, поэтому используемый вами браузер сообщает о ненадежном соединении.","Чтобы решить эту проблему, попробуйте следующее:","Рекомендуется: используйте другие сертификаты, которым доверяет ваша инфраструктура.","Если вы не можете использовать другие сертификаты, можно добавить изначально сгенерированные сертификаты в качестве доверенных для вашего браузера или операционной системы.","Проблема: произошла ошибка при сохранении параметров в Kaspersky Scan Engine GUI","Проверьте правильность указанных вами параметров.","Проверьте статус службы","kavhttpd","или","kavicapd",", выполнив одну из команд:","service kavhttpd status","service kavicapd status","Проблема: произошла ошибка при удалении базы данных во время деинсталляции, к базе данных kavebase обращаются другие пользователи","Возможная причина: кто-то еще подключен к базе данных kavebase (например, с помощью pgAdmin).","Решение: выполните следующий запрос к kavebase:","SELECT *, pg_terminate_backend(pid)","FROM pg_stat_activity","WHERE pid <> pg_backend_pid()","AND datname = 'kavebase';","Проблема: psql не распознается как внутренняя или внешняя команда","Эта проблема может возникнуть в Windows. Чтобы решить эту проблему, добавьте директорию bin PostgreSQL в переменную среды PATH.","В Windows выполните следующие действия.","Перейдите в  Control Panel -> System and Security -> System -> Advanced system settings -> Environment variables....\nОткроется диалоговое окно Environment variables. ","В списке системных переменных (нижняя половина диалогового окна) выберите Path и нажмите кнопку Edit.","Нажмите кнопку New и введите путь к директории bin PostgreSQL (например, C:\\Program Files\\PostgreSQL\\13\\bin).","Сохраните изменения, нажав кнопку ОК во всех диалоговых окнах.","Проблема: для аутентификации SCRAM требуется libpq версии 10 или выше","Эта проблема может возникнуть при установке Kaspersky Scan Engine, если вы используете PostgreSQL 13 и значение password_encryption отличается от md5.","Чтобы решить эту проблему, сделайте следующее.","В файле конфигурации postgresql.conf установите для параметра password_encryption значение md5. \nСохраните изменения. ","Перезагрузите PostgreSQL:\n\nsystemctl restart postgresql-13\n\n\n\n ","Обновите пароль пользователя базы данных с правами администратора (например, пользователя postgres), который будет использоваться при установке Kaspersky Scan Engine:\n\nalter user postgres with password '%PASSWORD%';\n\n\n\n ","Убедитесь, что метод аутентификации установлен на md5 в файле pg_hba.conf.","Повторите установку Kaspersky Scan Engine.","Проблема: в Kaspersky Scan Engine GUI не отображаются события (панель управления или страница результатов проверки)","Эта проблема может возникнуть, если база данных kavebase повреждена.","Чтобы решить эту проблему, сделайте следующее.","Остановите следующие процессы:","klScanEngineUI","kavhttpd (режим HTTP) или kavicapd (режим ICAP)","Удалите базу данных kavebase, выполнив следующую команду:","DROP DATABASE kavebase;","Создайте новую базу данных kavebase, выполнив следующую команду:","CREATE DATABASE kavebase OWNER %owner%;","Здесь %owner% – это пользователь, созданный для работы с kavebase при установке Kaspersky Scan Engine.","Импортируйте файл tables.sql из директории %service_dir%/samples, выполнив следующую команду:","psql -d kavebase -a -f tables.sql","Перезапустите процессы, которые вы остановили на шаге 1.","После этой операции пароль admin для Kaspersky Scan Engine GUI будет восстановлен до значения по умолчанию, а все предыдущие события будут удалены."," Поиск и устранение неисправностей ","182962.htm"));
Page.push(new Array("Сканирование файлов через TCP-сокет в режиме сканирования файлов","Вы можете отправлять запросы на сканирование как в режиме scanmemory, так и в режиме scanfile. Запросы отправляются от клиента HTTP на удаленном компьютере на компьютер, на котором работает сервис kavhttpd.","В режиме scanmemory содержимое сканируемого объекта отправляется в запросе HTTP и сканируется в памяти системы компьютера, на котором работает kavhttpd.","В режиме scanfile HTTP-клиент отправляет в службу kavhttpd путь к объекту, который находится на том же компьютере, что и служба kavhttpd, или на удаленном жестком диске, который смонтирован на этом компьютере. kavhttpd считывает объект с жесткого диска и сканирует его.","Однако, когда Kaspersky Scan Engine получает запрос на сканирование от клиента на удаленном компьютере в режиме сканирования файлов, он сканирует только те файлы, которые размещены в местах, указанных в элементах <ScanningPath> файла конфигурации режима HTTP. Это ограничение необходимо для предотвращения случайного сканирования всей файловой системы удаленного компьютера.","Для сканирования файла с помощью TCP-сокета в режиме scanfile:","В элементе <ScanningPath> файла конфигурации укажите местоположение файла, который вы хотите сканировать.\nKaspersky Scan Engine не добавляет и не удаляет объекты в директориях, указанных в ScanningPath. HTTP-клиент должен отправить объекты для сканирования, а затем удалить их после сканирования. \nВ следующем примере показано, как указать директорию, содержащую файлы для сканирования: \n\n<ScanningPaths>\n<ScanningPath>/mnt/to_scan/</ScanningPath>\n</ScanningPaths>\n\n\n\n ","Подключитесь к Kaspersky Scan Engine на удаленном компьютере с помощью TCP-сокета и сканируйте файл в режиме scanfile. \nВ следующем примере показано, как проверить файл eicar.txt, расположенный в директории /mnt/to_scan/ на компьютере, на котором запущена служба kavhttpd: \n\nuser@computer:/opt/kaspersky/ScanEngine/bin# ./kavhttp_client -f -s 192.0.2.42:9999 /mnt/to_scan/eicar.txt\n\n\n\n \n "," Сканирование файлов через TCP-сокет в режиме сканирования файлов ","182976.htm"));
Page.push(new Array("Kaspersky Scan Engine GUI и SSL-сертификаты","SSL-сертификат и закрытый ключ, сгенерированные при установке Kaspersky Scan Engine, позволяют использовать Kaspersky Scan Engine GUI через HTTPS. Сертификат является самозаверяющим, поэтому используемый вами браузер сообщает вам о ненадежном соединении. Мы рекомендуем использовать сертификат, которому доверяют в вашей инфраструктуре. Однако если вы не можете использовать доверенный сертификат, можно добавить самозаверяющий сертификат в качестве доверенного для вашего браузера или операционной системы."," Kaspersky Scan Engine GUI и SSL-сертификаты ","182982.htm"));
Page.push(new Array("Генерация SSL-сертификатов для Kaspersky Scan Engine GUI","Kaspersky Scan Engine GUI использует SSL-сертификат для HTTPS-соединений. По умолчанию Kaspersky Scan Engine GUI использует самозаверяющий сертификат и закрытый ключ, которые генерируются при установке Kaspersky Scan Engine. Сгенерированный сертификат действителен в течение двух лет.","Мы рекомендуем вам сгенерировать сертификат, который будет доверенным в вашей инфраструктуре, и настроить Kaspersky Scan Engine GUI на использование его вместо самозаверяющего сертификата.","Перед внесением изменений создайте резервную копию существующего закрытого ключа, сертификата и файла конфигурации Kaspersky Scan Engine.","Чтобы сгенерировать доверенный сертификат для Kaspersky Scan Engine GUI, выполните следующее.","Создайте закрытый ключ и доверенный сертификат:","Создайте новую пару закрытого и открытого ключей.","Используйте открытый ключ для создания запроса на подпись сертификата SSL (CSR).","Подпишите CSR с помощью доверенного центра сертификации.\n\n\nЭто создает доверенный сертификат для закрытого ключа. ","Преобразуйте закрытый ключ и доверенный сертификат в формат PEM.","Скопируйте закрытый ключ и сертификат в директорию %service_dir%/httpsrv.","Вы должны настроить доступ к файлу закрытого ключа для Kaspersky Scan Engine GUI, чтобы только пользователь root и учетная запись пользователя, под которой запущена служба, могли иметь разрешение на чтение.","При необходимости отредактируйте элементы Settings > ServerSettings > SSLCertificatePath и Settings > ServerSettings > SSLPrivatePath файла конфигурации Kaspersky Scan Engine, чтобы они содержали пути к сертификату и закрытому ключу.","Редактирование файла конфигурации Kaspersky Scan Engine вручную.","Перезапустите Kaspersky Scan Engine."," Генерация SSL-сертификатов для Kaspersky Scan Engine GUI ","182983.htm"));
Page.push(new Array("Добавление самозаверяющего сертификата как доверенного для браузера (Linux)","В этом разделе показано, как добавить самозаверяющие сертификаты, созданные при установке Kaspersky Scan Engine, в доверенное хранилище. Это удалит предупреждения системы безопасности, создаваемые браузерами.","Информация в этом разделе применима к ситуации, когда пользователь получает доступ к Kaspersky Scan Engine GUI с того же компьютера, на котором он запущен. Если элемент Settings > ServerSettings > ConnectionString в файле конфигурации Kaspersky Scan Engine относится к внешнему интерфейсу, то сайт Kaspersky Scan Engine GUI не будет считаться доверенным, поскольку самозаверяющий сертификат может использоваться только с https: //127.0.0.1 и https://localhost.","Чтобы избежать потенциальных угроз безопасности, рекомендуется использовать доверенный сертификат, подписанный центром сертификации.","Как сделать самозаверяющий сертификат доверенным в браузере (Kaspersky Scan Engine GUI открывается в Mozilla Firefox)","Добавьте Kaspersky Scan Engine GUI в список доверенных сайтов Mozilla Firefox, чтобы браузер не показывал предупреждения о сертификате.","Как сделать самозаверяющий сертификат доверенным в браузере (Kaspersky Scan Engine GUI открывается в браузере для Linux)","Процедуры использования браузера для импорта сертификата как доверенного (в системах Linux) различаются в зависимости от используемого браузера и дистрибутива Linux. Но у них есть общие шаги: открыть форму настроек браузера и использовать форму для импорта сертификата в хранилище.","Чтобы вручную сделать самозаверяющий сертификат доверенным в браузере в Linux, необходимо выполнить следующее.","Создайте директорию /usr/local/share/ca-certificates/, если ее еще нет на вашем компьютере:\nmkdir /usr/local/share/ca-certificates/ ","Скопируйте корневой сертификат (файл .crt) в созданную директорию:\ncp <full_path_to_the_certificate> /usr/local/share/ca-certificates/ ","Обновите сертификаты:\nsudo update-ca-certificates \nЕсли у вас нет пакета корневых сертификатов, установите его с помощью диспетчера пакетов. ","Удаление сертификата из списка доверенных","После перенастройки или удаления Kaspersky Scan Engine старые сертификаты больше не используются в Kaspersky Scan Engine GUI. Вы можете удалить их из списка доверенных сертификатов.","В системе Linux процедура удаления выполняется аналогично добавлению сертификата: откройте список доверенных сертификатов и удалите те, которые вам не нужны."," Добавление самозаверяющего сертификата как доверенного для браузера (Linux) ","182984.htm"));
Page.push(new Array("Ручная установка (Windows)","В этом разделе описывается, как вручную установить Kaspersky Scan Engine на системах Windows.","Чтобы установить Kaspersky Scan Engine вручную:","Убедитесь, что у вас есть права администратора.","Создайте папку C:\\Program Files\\Kaspersky Lab\\ScanEngine. В этом справочном документе эта папка называется %service_dir%.","Распакуйте содержимое пакета распространения в папку %service_dir% на вашем компьютере.","Ознакомьтесь с Пользовательским соглашением (End User License Agreement, EULA) для Kaspersky Scan Engine. Пользовательское соглашение находится по адресу %service_dir%/doc/license.txt.","Если вы согласны с условиями Пользовательского соглашения, переходите к следующему шагу. Если вы отклоняете условия Пользовательского соглашения, отмените установку.","Откройте файл %service_dir%\\bin\\klScanEngineUI.xml.","Примите условия Пользовательского соглашения с конечным пользователем. В файле klScanEngineUI.xml замените <Common>rejected</Common> на <Common>accepted</Common>.","Если вы хотите использовать Kaspersky Security Network (KSN), ознакомьтесь с Пользовательским соглашением для KSN и Политикой конфиденциальности. Это Пользовательское соглашение также находится по адресу %service_dir%\\doc\\ksn_license.txt и содержит ссылку на Политику конфиденциальности.","Если вы согласны с условиями Пользовательского соглашения для KSN и Политикой конфиденциальности, переходите к следующему шагу. Если вы отклоняете условия Пользовательского соглашения для KSN или Политику конфиденциальности, перейдите к шагу 9.","Примите Пользовательское соглашение для KSN. Измените <KSN>rejected</KSN> на <KSN>accepted</KSN> в klScanEngineUI.xml.","Сохраните и закройте %service_dir%\\bin\\klScanEngineUI.xml.","Откройте файл %service_dir%\\bin\\kavhttpd.xml.","В элементах BasesPath и TempPath укажите полный путь к директории %service_dir%\\bin\\bases и к директории, содержащей временные файлы, используемые Kaspersky Scan Engine соответственно. Сохраните и закройте файл.","Если вы хотите, чтобы Kaspersky Scan Engine запускался автоматически при загрузке системы, выполните следующие действия:","В Windows откройте окно командной строки от имени администратора.","Выполните следующую команду:\n\n\nsc create \"Kaspersky ScanEngine\" binpath= \"%service_dir%\\bin\\kavhttpd.exe -c %service_dir%\\bin\\kavhttpd.xml\" start= auto DisplayName= \"Kaspersky ScanEngine\" ","Обратите внимание, что, если полный путь к файлу конфигурации содержит пробел, вы должны добавить кавычки (\") после косой черты (\\). Пример: C:\\Program Files\\Kaspersky Lab\\ScanEngine\\bin>sc create \"Kaspersky ScanEngine\" binpath= \"C:\\Program Files\\Kaspersky Lab\\ScanEngine\\bin\\kavhttpd.exe -c \\\"C:\\Program Files\\Kaspersky Lab\\ScanEngine\\bin\\kavhttpd.xml\\\"\"","Перейдите к разделу Начало работы с Kaspersky Scan Engine в режиме HTTP.","Включение Kaspersky Scan Engine GUI","Чтобы включить Kaspersky Scan Engine GUI:","Убедитесь, что у вас есть права администратора.","Установите и настройте PostgreSQL.","На компьютере, на котором установлен PostgreSQL, выполните перечисленные ниже действия от имени пользователя, который может создавать новых пользователей и базы данных. Для выполнения этих действий вы можете использовать утилиту psql или pgAdmin. Если вы используете утилиту psql, укажите пробел и имя пользователя после параметра","-U",".","Создайте нового пользователя PostgreSQL с именем scanengine:\n\n\nCREATE USER scanengine; ","Задайте пароль для пользователя scanengine:\n\n\nALTER USER scanengine WITH PASSWORD '%PASSWORD%'; ","Используя PostgreSQL, создайте базу данных под названием kavebase:\n\n\nCREATE DATABASE kavebase OWNER scanengine; ","В базе данных kavebase выполните запросы, описанные в %service_dir%\\samples\\tables.sql.\n\n\npsql -d kavebase -a -f tables.sql ","Откройте %service_dir%\\bin\\klScanEngineUI.xml.","Измените <EnableUI>false</EnableUI> на <EnableUI>true</EnableUI>.","В элементе <ConnectionString> укажите адрес веб-службы Kaspersky Scan Engine GUI в формате %IP%:%port%.","Например:","<ConnectionString>198.51.100.0:443</ConnectionString>","Укажите SSL-сертификат для установки в веб-службе Kaspersky Scan Engine GUI.","Если у вас уже есть SSL-сертификат, который вы хотите установить в веб-службе Kaspersky Scan Engine GUI, укажите пути к вашему сертификату и вашему закрытому ключу:","В элементе <SSLCertificatePath> укажите путь к вашему сертификату SSL.","В элементе <SSLPrivateKeyPath> укажите путь к вашему закрытому ключу.","Если у вас нет SSL-сертификата, который вы хотите установить в веб-службе Kaspersky Scan Engine GUI, сгенерируйте новый. Запустите утилиту %service_dir%\\tools\\openssl следующим образом:","%service_dir%\\tools\\openssl.exe req -x509 -nodes -days 1825 -subj /C=RU/CN=\"%ConnectionString%\" -newkey rsa:4096 -extensions EXT -config \"%service_dir%\\tools\\openssl.cnf\" -keyout \"%service_dir%\\httpsrv\\kl_scanengine_private.pem\" -out \"%service_dir%\\httpsrv\\kl_scanengine_cert.pem\"","Здесь %ConnectionString% – это значение, указанное в элементе %ConnectionString%. Рекомендуется использовать значения rsa:4096 или rsa:3072 с параметром -newkey. Минимальное поддерживаемое значение – rsa:2048.","Зашифруйте имя пользователя и пароль пользователя, указанного на шаге 3. Kaspersky Scan Engine будет использовать эти имя пользователя и пароль для подключения к базе данных kavebase.","Чтобы зашифровать учетные данные, используйте утилиту kav_encrypt. Эта утилита также автоматически записывает зашифрованные имя пользователя и пароль в klScanEngineUI.xml. Утилита находится в папке %service_dir%\\tools\\.","Запустите утилиту kav_encrypt со следующими параметрами:","-d %username%:%password%","В элементе DatabaseSettings > ConnectionString укажите адрес базы данных kavebase в формате %IP%:%port%.","Сохраните и закройте %service_dir%\\bin\\klScanEngineUI.xml.","Если вы хотите, чтобы Kaspersky Scan Engine GUI запускался автоматически при загрузке системы, выполните следующие действия:","Откройте окно командной строки от имени администратора.","Выполните следующую команду:\n\n\nsc create \"Kaspersky ScanEngine UI\" binpath= \"%service_dir%\\bin\\klScanEngineUI.exe --svc\" start= auto DisplayName= \"Kaspersky ScanEngine UI\" ","Запустите Kaspersky Scan Engine GUI:","sc start \"Kaspersky ScanEngine UI\""," Ручная установка (Windows) ","184719.htm"));
Page.push(new Array("Удаление вручную (Windows)","В этом разделе описано, как удалить Kaspersky Scan Engine вручную.","Чтобы удалить Kaspersky Scan Engine вручную:","Убедитесь, что у вас есть права администратора.","Остановите Kaspersky Scan Engine, выполните следующую команду:\nsc stop \"Kaspersky ScanEngine\" ","Если вы используете Kaspersky Scan Engine GUI, выполните следующую команду:\nsc stop \"Kaspersky ScanEngine UI\" ","Если вы добавили Kaspersky Scan Engine в список служб Windows, удалите его, выполнив следующую команду:\nsc delete \"Kaspersky ScanEngine\" ","Если вы использовали Kaspersky Scan Engine GUI и добавили его в список служб Windows, удалите его, выполнив следующую команду:\nsc delete \"Kaspersky ScanEngine UI\" ","Если вы используете Kaspersky Scan Engine GUI, откройте базу данных PostgreSQL и выполните следующий запрос:\nDROP DATABASE kavebase; \nЧтобы удалить пользователя scanengine, выполните следующую команду:  \nDROP ROLE scanengine; ","Удалите директорию %service_dir%. Можно сделать это либо с помощью проводника Windows, либо выполнив следующую команду:\ndel /F %service_dir% ","Удалите директорию с временными файлами Kaspersky Scan Engine. Можно сделать это либо с помощью проводника Windows, либо выполнив следующую команду:\ndel /F %temp_dir% \nЗдесь %temp_dir% – временная директория. "," Удаление вручную (Windows) ","184741.htm"));
Page.push(new Array("Подготовка к установке Kaspersky Scan Engine GUI","Kaspersky Scan Engine GUI использует объектно-реляционную систему управления базами данных (СУБД) PostgreSQL для хранения статистики сканирования, результатов сканирования, служебных событий и статуса службы. По этой причине, если вы хотите использовать Kaspersky Scan Engine GUI, вам нужно вначале установить PostgreSQL.","Вы можете использовать одну из двух интеграционных схем:","Установите Kaspersky Scan Engine на том же компьютере, что и PostgreSQL.","Установите Kaspersky Scan Engine на другом компьютере, с которого есть доступ к компьютеру с PostgreSQL."," Подготовка к установке Kaspersky Scan Engine GUI ","184775.htm"));
Page.push(new Array("Содержимое пакета распространения (Linux)","В этом разделе описывается состав пакета распространения Kaspersky Scan Engine для систем Linux.","Типы пакетов распространения","Kaspersky Scan Engine распространяется в следующих типах пакетов распространения:","в виде пакета RPM и набора дополнительных файлов;","в виде пакета DEB и набора дополнительных файлов;","в виде архива .tar.gz.\nЭтот тип пакета распространения можно использовать вместо пакета RPM или DEB. ","Пакет распространения RPM и DEB","Такой тип пакета распространения содержит следующие папки и файлы.","Состав пакета распространения (пакет RPM и DEB)","Путь","Описание","Doc_data/*","Файлы документации.","Kaspersky_Scan_Engine.htm","Офлайн-версия документации.","Kaspersky_ScanEngine-Linux-x86_64-%RELEASE_VERSION%-Release.rpm","(Пакет RPM)","Kaspersky_ScanEngine-Linux-x86_64-%RELEASE_VERSION%-Release.deb","(Пакет DEB)","Установочные пакеты.","Список файлов внутри этого пакета см. ниже в подразделе \"Файлы, содержащиеся в архиве .tgz\".","setup.sh","Скрипт установки.","ReleaseNotes.pdf","Примечания к выпуску.","Файлы, содержащиеся в архиве .tar.gz","Пакет распространения Kaspersky Scan Engine для Linux содержит следующие папки и директории.","Содержимое пакета распространения (архив .tar.gz)","Путь","Описание","/bin/appinfo.kli","Файл с информацией о приложении.","/bin/httpdkavlog.ini","Файл конфигурации, который содержит настройки логирования службы kavhttpd.","/bin/icapdkavlog.conf","Файл конфигурации, который содержит настройки логирования службы kavicapd.","/bin/kavhttpd","Исполняемый файл службы kavhttpd.","/bin/kavhttp_client","Исполняемый файл клиента kavhttpd.","/bin/kavhttpd.sh","Скрипт для запуска службы kavhttpd.","/bin/kavicapd","Исполняемый файл службы kavicapd.","/bin/kavicapd.sh","Скрипт для запуска службы kavicapd.","/bin/klScanEngineUI","Бинарный файл Kaspersky Scan Engine GUI.","/bin/libssp.so.0","Вспомогательная библиотека.","/doc/Doc_data/","Директория, которая содержит документацию Kaspersky Scan Engine.","/doc/Kaspersky_Scan_Engine.htm","Главная страница документации Kaspersky Scan Engine.","/doc/ksn_license.txt","Пользовательское соглашение для Kaspersky Security Network (KSN).","/doc/legal_notices.txt","Информация о стороннем коде.","/doc/license.txt","Пользовательское соглашение для Kaspersky Scan Engine.","/etc/kavhttpd.service","Файл модуля systemd для службы kavhttpd.","/etc/kavhttpd.xml","Пример файла конфигурации для службы kavhttpd.","/etc/kavicapd.service","Файл модуля systemd для службы kavicapd.","/etc/kavicapd.xml","Пример файла конфигурации для службы kavicapd.","/etc/klScanEngineUI.service","Файл модуля systemd для службы klScanEngineUI.","/etc/klScanEngineUI.xml","Файл конфигурации для Kaspersky Scan Engine GUI.","/httpsrv/templates/","Директория, которая содержит шаблоны для Kaspersky Scan Engine GUI.","/icap_data/kavicapd_gui_rules.conf","Конфигурационный файл, который содержит правила для службы kavicapd.","/icap_data/templates/detect_req","Шаблоны, которые используются в режиме модификации запросов (REQMOD).","/icap_data/templates/detect_resp","Шаблоны, которые используются в режиме модификации ответов (RESPMOD).","/icap_data/templates/macro_req","Шаблон ответа, используемый в режиме модификации запросов (REQMOD) для уведомления об обнаружении макроса.","/icap_data/templates/macro_resp","Шаблон ответа, используемый в режиме модификации ответов (RESPMOD) для уведомления об обнаружении макроса.","/icap_data/scripts/send_syslog","Скрипт, который выводит в терминал информацию о просканированных объектах и перенаправляет ее в утилиту логирования.","/install","Скрипт установки.","/integrity_check.xml","Файл манифеста со списком файлов программы для утилиты проверки целостности.","/integrity_checker","Утилита проверки целостности компонентов программы.","/gcc-version","Текстовый файл с версией GCC.","/platform","Текстовый файл с версией библиотеки GLIBC.","/ReleaseNotes.pdf","Примечания к выпуску.","/samples/common/","Библиотеки, используемые службой kavhttpd и kavicapd.","/samples/kavhttp/","Директория, которая содержит исходный код службы kavhttpd и образец клиента для нее.","/samples/kavicap/","Директория, которая содержит исходный код службы kavicapd.","/samples/migrate.sql","Файл, используемый для обновления базы данных kavebase до более новой версии.","/samples/tables.sql","Файл, содержащий SQL-запросы, которые необходимо выполнить после установки Kaspersky Scan Engine вручную.","/tools/kav_encrypt","Утилита для шифрования учетный данных прокси-серверов и базы данных Kaspersky Scan Engine.","/tools/kl_access_util","Утилита для восстановления пароля от учетной записи admin в графическом интерфейсе Kaspersky Scan Engine.","/tools/libssp.so.0","Вспомогательная библиотека.","/tools/openssl","Утилита OpenSSL.","/tools/openssl.cnf","Файл конфигурации для OpenSSL.","/uninstall","Скрипт удаления.","/version","Текстовый файл с версией продукта."," Содержимое пакета распространения (Linux) ","184793.htm"));
Page.push(new Array("Системные требования","В этом разделе описаны системные требования Kaspersky Scan Engine.","Поддерживаемые операционные системы","Kaspersky Scan Engine работает на 64-битной версии Linux® и на 64-битной версии Microsoft® Windows®.","Требования к установленному ПО","Kaspersky Scan Engine GUI может быть доступен с помощью следующих браузеров:","Google Chrome™ 60 и более поздние версии;","Microsoft Internet Explorer® 11 и более поздние версии;","Mozilla™ Firefox™ 55 и более поздние версии;","Microsoft Edge 38 и более поздние версии.","Kaspersky Scan Engine GUI работает при установленной PostgreSQL 10.7 или более поздней версии.","Пакет распространения Kaspersky Scan Engine не содержит исходного кода библиотек Boost и OpenSSL. Если вы хотите адаптировать HTTP-службу или ICAP-службу под свои нужды, отредактировав и пересобрав исходный код из пакета распространения Kaspersky Scan Engine, загрузите код библиотек Boost и OpenSSL с официальных сайтов и используйте в своей системе. Если вы внесете изменения в исходный код HTTP-службы или ICAP-службы и захотите использовать графический интерфейс Kaspersky Scan Engine, получите одобрение на изменения от вашего персонального технического менеджера, чтобы HTTP-служба или ICAP-служба по-прежнему работала с графическим интерфейсом Kaspersky Scan Engine.","Для сборки HTTPD-службы и ICAP-службы используйте следующее ПО:","Boost 1.72.0 или более поздней версии;","OpenSSL (последнюю версию);","GCC 7.3 или более позднюю версию;","Brotli (только для ICAP);","Библиотеки PostgreSQL с 6.4.4 по 7 (не включительно).\nМы рекомендуем вам установить пакет libpqxx-devel. ","Требования к аппаратуре","Kaspersky Scan Engine требует 1 ГБ свободного места на диске. Если вы планируете использовать Kaspersky Scan Engine GUI, вам нужно также выделить место для базы данных PostgreSQL, которая хранит служебные события. База данных PostgreSQL может храниться на том же компьютере, где установлено решение Kaspersky Scan Engine, либо на другом компьютере. Размер базы данных зависит от количества событий и может достигать нескольких гигабайт. В базе данных хранятся события, произошедшие за последние полгода.","В нижеследующей таблице приведены минимальные требования к процессору и ОЗУ для работы Kaspersky Scan Engine в зависимости от используемой операционной системы.","Операционная система","Требования к ОЗУ и процессору","64-битный Linux","1 ГБ ОЗУ","1 ГГц либо более быстрый 64-битный (x64) процессор","64-битная Windows 7 и более поздние версии","64-битная Windows Server 2008 R2 и более поздние версии","1 ГБ ОЗУ","1 ГГц либо более быстрый 64-битный (x64) процессор"," Системные требования ","184795.htm"));
Page.push(new Array("Архитектура Kaspersky Scan Engine","Kaspersky Scan Engine представляет собой реализацию HTTP-демона и ICAP-плагина, которые входят в Kaspersky Anti-Virus SDK.","Когда Kaspersky Scan Engine работает как HTTP Daemon, он работает в режиме HTTP. Когда Kaspersky Scan Engine работает как плагин ICAP, он работает в режиме ICAP.","Ниже приведены описания режимов.","Режим HTTP\nВ данном режиме Kaspersky Scan Engine работает как REST-подобная служба, которая получает HTTP-запросы от клиентских приложений, сканирует файлы и URL-адреса, переданные в этих запросах, и отправляет обратно HTTP-ответы с результатами сканирования.\n","Режим ICAP\nЭтот режим доступен только для операционных систем Linux.\n\nВ этом режиме Kaspersky Scan Engine работает как ICAP-сервер, который сканирует HTTP-трафик (проходящий через прокси-сервер) и URL-адреса, которые запрашивают пользователи, а также отфильтровывает веб-страницы с вредоносным контентом.\n","Kaspersky Scan Engine состоит из следующих компонентов:","Служба, обрабатывающая клиентские запросы. Эти службы разные в режимах HTTP и ICAP. ","Kaspersky Scan Engine GUI\nГрафический интерфейс, доступный через браузер. Его функционал реализован в исполняемом файле klScanEngineUI. ","Kaspersky Anti-Virus Engine\nИсполняемый файл, который сканирует переданные ему объекты. ","В кластеры можно добавить несколько экземпляров Kaspersky Scan Engine. Это упрощает настройку и дальнейшее управление экземплярами."," Архитектура Kaspersky Scan Engine ","184796.htm"));
Page.push(new Array("Основные функции Kaspersky Scan Engine","Решение Kaspersky Scan Engine может работать в одном из двух режимов:","Режим HTTP\nВ этом режиме Kaspersky Scan Engine работает как REST-подобная служба, которая получает HTTP-запросы от клиентских приложений, сканирует объекты, переданные в этих запросах, и отправляет обратно HTTP-ответы с результатами сканирования.\n","Режим ICAP\nЭтот режим доступен только для операционных систем Linux.\n\nВ этом режиме Kaspersky Scan Engine работает как ICAP-сервер, который сканирует HTTP-трафик, проходящий через прокси-сервер, и URL-адреса, запрашиваемые пользователями, а также блокирует веб-страницы, содержащие вредоносный контент.\n","Решение Kaspersky Scan Engine также включает в себя графический пользовательский интерфейс, который вам позволяет с легкостью настраивать поведение Kaspersky Scan Engine, просматривать его служебные события и результаты сканирования.","Сценарии использования:","Защита от угроз","Kaspersky Scan Engine может сканировать файлы и участки оперативной памяти, используя антивирусные базы \"Лаборатории Касперского\" и усовершенствованный эвристический модуль. Поддерживается сканирование сжатых исполняемых файлов, архивов, макросов Microsoft Office, электронных писем и почтовых баз.","Веб-фильтрация","Kaspersky Scan Engine может сканировать URL-адреса, явно заданные для проверки (в режиме HTTP), либо URL-адреса, которые запрашивают пользователи через прокси-сервер (в режиме ICAP). В режиме ICAP решение Kaspersky Scan Engine может подставлять заданную пользователем HTML-страницу вместо вредоносных веб-страниц.","Проверка репутации файлов и URL-адресов","Kaspersky Scan Engine может получать информацию о проверенных файлах и URL-адресах из Kaspersky Security Network (KSN).","Графический пользовательский интерфейс","Графический пользовательский интерфейс дает возможность настроить Kaspersky Scan Engine, проверить статус файла ключа или кода активации Kaspersky Scan Engine, просмотреть служебные события и результаты сканирования.","Ключевые функции:","Удостоенная наград антивирусная технология \"Лаборатории Касперского\" обеспечивает лучшие в своем классе коэффициенты обнаружения вредоносных программ и может мгновенно реагировать на возникающие угрозы.","Kaspersky Security Network предоставляет информацию о репутации файлов и интернет-ресурсов, что позволяет приложениям \"Лаборатории Касперского\" быстрее реагировать на угрозы, не дожидаясь обновления баз, и уменьшает вероятность ложного срабатывания.","Блокирует доступ к вредоносным, фишинговым и рекламным URL-адресам.","Определяет повторно упакованные объекты и объекты, упакованные при помощи \"серых\" архиваторов (часто используемых для сокрытия вредоносных программ от антивирусного ПО).","Использует усовершенствованный эвристический анализатор и технологии обнаружения, основанные на машинном обучении.","Очищает инфицированные файлы, архивы и закодированные объекты.","Использует обновляемое антивирусное ядро: технологии обнаружения и логика обработки данных могут обновляться или изменяться посредством обычного обновления антивирусных баз данных.","Kaspersky Scan Engine естественным образом поддерживает многопоточность и может выполнять несколько заданий одновременно. Вы можете настроить число сканирующих процессов и потоков для увеличения производительности Kaspersky Scan Engine.","Дополнительный фильтрующий слой представлен компонентом Format Recognizer. Вы можете использовать этот компонент для распознавания файлов и игнорирования файлов определенных форматов во время процесса сканирования. Поддерживаются десятки форматов, в том числе исполняемые, офисные файлы, медиафайлы и архивы.","Графический пользовательский интерфейс для управления и мониторинга:","Позволяет настраивать и управлять приложением.","Позволяет отслеживать статус работы приложения, статус используемого файла ключа или кода активации, а также число проверенных и обнаруженных объектов. ","Предоставляет панель управления с информацией обо всех проверенных объектах. Результаты сканирования могут быть сохранены в формате CSV. ","Простота в установке и конфигурации. После установки не требуется разработка дополнительного ПО, решение запустится в течение минут.","Составление отчетов:","Важные события приложения отсылаются в системный журнал в формате CEF. ","Все служебные события видны на панели управления графического интерфейса.","Возможности сопровождения продукта:","Антивирусные базы обновляются автоматически. В случае обнаружения поврежденных баз Kaspersky Scan Engine продолжает использовать старые неповрежденные. ","Простота отслеживания работы продукта с помощью графического интерфейса.","Возможность использования онлайн-активации. При онлайн-активации лицензионная информация для Kaspersky Scan Engine обновляется автоматически.","Отказоустойчивая архитектура.","В пакете распространения поставляется исходный код HTTP-клиента и ICAP-службы для возможности изменения.","Подробная документация и поддержка кроссплатформенности прикладного программного интерфейса (API). Схожие прикладные программные интерфейсы для версий под Linux/UNIX и Windows.","Возможность минимизировать внешний трафик путем создания локальных зеркал для антивирусных баз (нужны дополнительные программы).","Kaspersky Scan Engine поддерживает кластерную архитектуру. Эта функция позволяет делать следующее:","Централизованно управлять экземплярами: вы можете применить единые параметры к нескольким экземплярам в кластере.","Просматривать события службы из каждого экземпляра кластера.","Просматривать результаты сканирования со статистикой для каждого экземпляра кластера.","Просматривать информацию о статусе Kaspersky Scan Engine для каждого экземпляра кластера (текущий статус Kaspersky Scan Engine, версия, информация об антивирусных базах и так далее)."," Основные функции Kaspersky Scan Engine ","184797.htm"));
Page.push(new Array("Использование Kaspersky Scan Engine в режиме ICAP","В этом разделе описана работа Kaspersky Scan Engine в режиме ICAP.","Режим ICAP доступен только для операционных систем Linux."," Использование Kaspersky Scan Engine в режиме ICAP ","184798.htm"));
Page.push(new Array("Файл конфигурации режима HTTP","Файл конфигурации для режима HTTP (далее также файл конфигурации) представляет собой XML-файл, который определяет параметры Kaspersky Scan Engine.","Файл конфигурации режима HTTP (Linux)","Пакет распространения Kaspersky Scan Engine для Linux содержит файл конфигурации %distr_kit%/etc/kavhttpd.xml.","После установки Kaspersky Scan Engine скопируйте kavhttpd.xml в одно из мест расположения по вашему усмотрению:","Если вы скопируете kavhttpd.xml в директорию /etc/, Kaspersky Scan Engine найдет и обработает файл автоматически.","Если вы скопируете","kavhttpd.xml","в другое место расположения, вам нужно указать путь до него при запуске Kaspersky Scan Engine:","с помощью файла модуля systemd.","запустив Kaspersky Scan Engine из командной строки вручную.","Файл конфигурации режима HTTP (Windows)","Пакет распространения Kaspersky Scan Engine для Windows содержит файл конфигурации %distr_kit%\\bin\\kavhttpd.xml.","Рекомендуем указывать полные пути к файлам в kavhttpd.xml. В частности, настоятельно рекомендуется указывать полные пути к сертификату (элемент TlsCertificateFile) и файлу ключа (элемент TlsCertificateKeyFile).","Параметры файла конфигурации для режима HTTP","Большинство элементов файла конфигурации имеют значения по умолчанию, которые используются, если элемент не указан явно. Не указывайте в элементах файла конфигурации пустые значения, если возможность этого не указана в данной документации.","Файл конфигурации KAV HTTPD содержит следующие родительские элементы:","ServerSettings","KSNSettings","KAVScanningSettings","DirectorySettings","UseHTTPProxy","HTTPProxy","UpdateSettings","FormatRecognizerSettings","Структура файла конфигурации","Ниже приведен пример файла конфигурации:","<Configuration>","<ServerSettings>","<ConnectionString>/tmp/.kavhttpd</ConnectionString>","<MaxIncomingConnectionsNum>100</MaxIncomingConnectionsNum>","<MaxHTTPSessionsNum>50</MaxHTTPSessionsNum>","<MaxTCPFileSize>100</MaxTCPFileSize>","<SessionTimeout>1000</SessionTimeout>","<Flags>KAV_SHT_ENGINE_KSN | KAV_SHT_ENGINE_APUF</Flags>","<TlsCertificateKeyFile>opt/kaspersky/http_data/https_key.pem</TlsCertificateKeyFile>","<TlsCertificateFile>opt/kaspersky/http_data/https_cert.crt</TlsCertificateFile>","<CORS>","<AccessControlAllowOrigin>https://example.com</AccessControlAllowOrigin>","<AccessControlAllowOrigin>https://kaspersky.ru</AccessControlAllowOrigin>","</CORS>","<KeepAliveSettings>","<Enabled>1</Enabled>","<TimeoutMs>5000</TimeoutMs>","<MaxRequests>1000</MaxRequests>","</KeepAliveSettings>","<AuthSettings>","<UseAccessToken>0</UseAccessToken> <!--Enable or disable API-token authentication -->","<AuthRequestField>Authorization</AuthRequestField>","<UseBearerAuthScheme>1</UseBearerAuthScheme>","<AccessTokens>","<Token>","<Name>Unlimited key</Name>","<Value>JWXA529CU2q7Udv7r3ji6BEMsha-5yu0KqU3yvKtf-6I+TU2AEQACKAABIgpEIIM</Value>","<Description>Kaspersky Scan Engine Clients. Full access scope</Description>","<Enabled>1</Enabled>","</Token>","<Token>","<Name>Key for URL-scanning</Name>","<Value>MIIEpgIBAAKCAQEA2UT+I6-ftKvy3UqK0uy5-ahsMEB6ij3r7vdU7q2UC925AXWJ</Value>","<Description>Server access key. Only URL-scanning</Description>","<Enabled>0</Enabled>","</Token>","</AccessTokens>","</AuthSettings>","</ServerSettings>","<KSNSettings>","<UrlCheckTimeoutMs>20000</UrlCheckTimeoutMs>","<ObjectCheckOnDemandTimeoutMs>10000</ObjectCheckOnDemandTimeoutMs>","<CacheSizeKb>30720</CacheSizeKb>","</KSNSettings>","<KAVScanningSettings>","<ScannersCount>4</ScannersCount>","<ThreadsCount>8</ThreadsCount>","<QueueLen>1024</QueueLen>","<Flags>KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILBASES | KAV_O_M_MAILPLAIN | KAV_O_M_HEURISTIC_LEVEL_DETAIL</Flags>","<Mode>KAV_SKIP</Mode>","<MaxArchivesScanningDepth>0</MaxArchivesScanningDepth>","</KAVScanningSettings>","<DirectorySettings>","<BasesPath>/home/bases</BasesPath>","<TempPath>/home/temp</TempPath>","<LicensePath>/home/license</LicensePath>","<LicensingMode>1</LicensingMode>","<ScanningPaths>","<ScanningPath></ScanningPath>","</ScanningPaths>","</DirectorySettings>","<UseHTTPProxy>1</UseHTTPProxy>","<HTTPProxy>","<url>myproxy.mycompany.com</url>","<port>3128</port>","<User>doOTrypDTxpVJxUHYeKQTw==</User>","<pass>8mSHXFix3uL+RP9oNeKDZQ==</pass>","</HTTPProxy>","<UpdateSettings>","<DisableBackup>0</DisableBackup>","<UpdatePeriodMinutes>0</UpdatePeriodMinutes>","<UseOnlyCustomSources>0</UseOnlyCustomSources>","<UpdateSources>","<Source>[update source]</Source>","</UpdateSources>","<UpdatesCertFile></UpdatesCertFile>","<CertificateConfirmationAction>0</CertificateConfirmationAction>","<UseReducedBases>0</UseReducedBases>","</UpdateSettings>","<FormatRecognizerSettings>","<FormatsToSkipScanning>","<KAV_FF_GENERAL_TXT/>","<KAV_FF_GENERAL_CSV/>","<KAV_FF_AUDIO_WMA/>","</FormatsToSkipScanning>","</FormatRecognizerSettings>","</Configuration>"," Файл конфигурации режима HTTP ","184799.htm"));
Page.push(new Array("Kaspersky Scan Engine и режим HTTP","Протокол HTTP является стандартным протоколом для передачи данных в архитектуре \"клиент-сервер\". В режиме HTTP решение Kaspersky Scan Engine выступает как REST-подобная служба, которая получает от клиентов HTTP-запросы в формате JSON. Служба сканирует объекты, переданные в этих запросах, и отправляет обратно HTTP-ответы с результатами сканирования в формате JSON или простого текста.","Кроме того, пакет распространения Kaspersky Scan Engine включает в себя пример HTTP-клиента и его исходный код. Этот пример HTTP-клиента демонстрирует, как делать запросы в Kaspersky Scan Engine в режиме HTTP. Вы также можете использовать скомпилированный пример для сканирования файлов из командной строки.","Способы передачи данных","Поддерживаются два способа передачи данных между клиентами и Kaspersky Scan Engine:","TCP-соединение","UNIX-сокет\nТолько для систем Linux. ","Режимы сканирования","Kaspersky Scan Engine поддерживает следующие режимы сканирования:","scanfile\nВ этом режиме пример HTTP-клиента передает пути к файлам в Kaspersky Scan Engine, который читает файлы и проверяет их.\n","scanmemory\nВ этом режиме пример HTTP-клиента передает содержимое файла в Kaspersky Scan Engine, который проверяет содержимое. Максимальный размер объекта, отправляемого на сканирование в режиме сканирования памяти, ограничен системной памятью компьютера.\n","checkurl\nВ этом режиме пример HTTP-клиента передает URL-адреса в Kaspersky Scan Engine, который проверяет их на наличие вредоносных и фишинговых адресов.\n","Вы можете сканировать файлы и URL-адреса, отправляя HTTP-запросы по протоколу KAV версии 3 или протоколу KAV версии 1 и 2.","Авторизация по токену API","Kaspersky Scan Engine поддерживает авторизацию по токену API.","Если авторизация по токену API включена, HTTP-клиенты должны указывать токен API в заголовке запроса при отправке запросов в Kaspersky Scan Engine. Это поле заголовка запроса, используемое для отправки токена API, имеет пользовательское имя. Администратор Kaspersky Scan Engine может указать это имя в разделе Authorization Kaspersky Scan Engine GUI. Имя по умолчанию – Authorization.","Если вы включили авторизацию по токену API и служба kavhttpd не запущена, запуск klScanEngineUI также инициирует запуск службы kavhttpd.","Обычная процедура создания и использования токена API следующая:","Администратор Kaspersky Scan Engine создает токен в разделе Authorization Kaspersky Scan Engine GUI.","Администратор Kaspersky Scan Engine предоставляет токен пользователям, которые могут использовать его для доступа к службе kavhttpd.","При выполнении HTTP-запросов HTTP-клиент отправляет токен в качестве значения поля авторизации в заголовке запроса. Название поля авторизации в заголовке запроса должно совпадать с именем, указанным в параметрах Kaspersky Scan Engine (см. описание элемента Authorization header field в разделе Authorization).","В случае успешной авторизации Kaspersky Scan Engine предоставляет доступ к своим функциям.","Чтобы попробовать авторизацию по токену API и понять, как это работает, вы можете использовать HTTP-клиент, поставляемый с Kaspersky Scan Engine: настройте Kaspersky Scan Engine для авторизации запросов, создайте токен API, а затем используйте HTTP-клиент для отправки запроса, содержащего токен. Вы можете найти примеры таких запросов, отправленных по протоколу KAV версии 1 или 2 и версии 3.","По соображениям безопасности требуется HTTPS-соединение для отправки запросов, требующих авторизации.","Постоянные соединения Keep-Alive","По умолчанию Kaspersky Scan Engine поддерживает постоянные соединения Keep-Alive, поэтому он может обрабатывать несколько объектов один за другим, используя одно и то же соединение.","Чтобы открыть постоянное соединение Keep-Alive, HTTP-клиент должен добавить к запросу следующий заголовок:","Connection: Keep-Alive","Чтобы открыть соединение Keep-Alive, HTTP-клиент должен добавить к запросу следующий заголовок:","Connection: close"," Kaspersky Scan Engine и режим HTTP ","184921.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме HTTP с помощью файла модуля systemd (Linux)","Только для систем Linux.","Вы можете запустить Kaspersky Scan Engine в режиме HTTP, используя файл модуля kavhttpd.service для systemd. Файл модуля позволяет вам добавить службу kavhttpd в список запуска служб и управлять службой вручную из командной строки.","В этом разделе предполагается, что вы хотите добавить службу kavhttpd для всех пользователей. Для получения информации о том, как добавить службу и управлять ею от имени конкретного пользователя, обратитесь к официальной документации для systemd и systemctl.","Автоматический запуск Kaspersky Scan Engine","Чтобы Kaspersky Scan Engine запускался автоматически, добавьте kavhttpd в список запуска служб.","Чтобы добавить kavhttpd в список запуска служб:","Поместите файл модуля kavhttpd.service в директорию /etc/systemd/system/.","При необходимости отредактируйте файл модуля.","Перезагрузите systemd, выполнив следующую команду:\n\nsystemctl daemon-reload\n\n\n\n ","Убедитесь, что файл модуля kavhttpd.service установлен, выполнив следующую команду:\n\nsystemctl list-unit-files\n\n\n\n ","Включите запуск kavhttpd при старте системы, выполнив следующую команду:\n\nsystemctl enable kavhttpd.service\n\n\n\n ","Удаление Kaspersky Scan Engine из списка запуска служб","Чтобы удалить kavhttpd из списка запуска служб, выполните следующую команду:","systemctl disable kavhttpd.service","Управление Kaspersky Scan Engine с помощью systemd из терминала","Чтобы запустить kavhttpd без перезагрузки компьютера, выполните следующую команду:","systemctl start kavhttpd","После выполнения этой команды сценарий выводит сообщение [OK] и немедленно возвращает управление терминалу, но для запуска службы kavhttpd потребуется некоторое время.","Чтобы остановить kavhttpd без перезагрузки компьютера, выполните следующую команду:","systemctl stop kavhttpd","Чтобы перезагрузить антивирусные базы, выполните следующую команду:","systemctl reload kavhttpd"," Запуск Kaspersky Scan Engine в режиме HTTP с помощью файла модуля systemd (Linux) ","184956.htm"));
Page.push(new Array("О предоставлении данных","В пакет распространения KAV SDK (далее %SDK_kit%) входят файлы с информацией о процедуре предоставления данных, используемой в Kaspersky Scan Engine:","%SDK_kit%/doc/About data provision.txt – описывает процедуру предоставления данных для проверки репутации файлов и веб-адресов.","%SDK_kit%/doc/About data provision - online licensing.txt – описывает процедуру предоставления данных для режима лицензирования онлайн.","%SDK_kit%/doc/About data provision extended.txt – описывает процедуру предоставления данных при отправке статистической информации в KSN в Kaspersky Scan Engine для систем Windows."," О предоставлении данных ","185034.htm"));
Page.push(new Array("Работа с бинарным файлом klScanEngineUI","Вы можете запустить бинарный файл klScanEngineUI.exe вручную.","Работа с бинарным файлом klScanEngineUI в Linux","Синтаксис Linux:","./klScanEngineUI [[-c <path>] [-p <path>] | [-w] | [-n] | [-v] | [-h]]","В таблице ниже описаны параметры klScanEngineUI в Linux.","Параметры klScanEngineUI в Linux","Параметр","Описание","-c <path>","--config <path>","Необязательный параметр.","Задает путь к файлу конфигурации службы klScanEngineUI.","-p <path>","--pidfile <path>","Необязательный параметр.","Задает путь к PID-файлу.","-w","--watchdog","Необязательный параметр.","Запускает службу klScanEngineUI в сторожевом режиме.","В этом режиме klScanEngineUI перезагружается автоматически, если зависает или дает сбой.","-n","--no-daemon","Необязательный параметр.","Включает режим nodaemon для службы klScanEngineUI.","При указании этого параметра служба klScanEngineUI запускается с высоким приоритетом.","-v","--version","Необязательный параметр.","Показывает версию Kaspersky Scan Engine.","-h","--help","Необязательный параметр.","Показывает справочную информацию.","Работа с бинарным файлом klScanEngineUI в Windows","Синтаксис в Windows:","klScanEngineUI.exe [[--svc] | [--reg] | [--del] | [-v] | [-h]]","В таблице ниже описаны параметры klScanEngineUI в Windows.","Параметры klScanEngineUI в Windows","Параметр","Описание","--svc","Запускает службу.","--рег","Добавляет службу klScanEngineUI в список служб Windows.","Название сервиса и его отображаемое имя – Kaspersky ScanEngine UI.","--del","Удаляет службу klScanEngineUI из списка служб Windows.","-v","--version","Необязательный параметр.","Показывает версию Kaspersky Scan Engine.","-h","--help","Необязательный параметр.","Показывает справочную информацию."," Работа с бинарным файлом klScanEngineUI ","185278.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме HTTP с помощью скрипта BAT (Windows)","В состав пакета распространения Kaspersky Scan Engine входит скрипт BAT, позволяющий управлять службой kavhttpd и службой klScanEngineUI.","Этот скрипт не будет работать, если вы вручную добавили службу kavhttpd в список служб Windows.","Скрипт запускается из командной строки.","Синтаксис:","kl_control.bat start | stop | restart | status | help","В таблице ниже описаны параметры kl_control.bat. Если вы укажете более одной опции, скрипт выполнит первую и завершится.","Параметры kl_control.bat","Параметр","Описание","start","Запускает службу kavhttpd. Если включен Kaspersky Scan Engine GUI, также запускается служба klScanEngineUI.","stop","Останавливает службу kavhttpd. Если включен Kaspersky Scan Engine GUI, он также останавливает службу klScanEngineUI.","restart","Останавливает и перезапускает службу kavhttpd. Если Kaspersky Scan Engine GUI включен, он также останавливает и перезапускает службу klScanEngineUI.","status","Проверяет, запущены ли службы kavhttpd и klScanEngineUI.","help","Показывает справочную информацию.","Сценарий kl_control.bat выводит сообщение об ошибке, если при попытке остановить или запустить службу kavhttpd произошла ошибка. Если вы получили сообщение об ошибке, вы можете проверить состояние службы kavhttpd или службы klScanEngineUI с помощью диспетчера задач Windows."," Запуск Kaspersky Scan Engine в режиме HTTP с помощью скрипта BAT (Windows) ","186032.htm"));
Page.push(new Array("Логирование в режиме ICAP","В этом разделе объясняется, как работать с журналами в режиме ICAP."," Логирование в режиме ICAP ","186630.htm"));
Page.push(new Array("Формат логов CEF в режиме ICAP","Если Kaspersky Scan Engine настроен на запись сообщений системного журнала в формате CEF, записи журнала о событиях выглядят следующим образом:","CEF:0|Kaspersky|Scan Engine ICAP Service|%VERSION%|%EVENT_CLASS_ID%|%EVENT_NAME%|%SEVERITY%| msg=%EVENT_MSG% src=%CLIENT_IP% dvcpid=%ICAP_SERVER_PID% dvc=%HTTP_SERVICE_IP% dvchost=%HOSTNAME% cs2=%HTTP_USER_NAME% cs2Label=X-Client-Username cs3=%HTTP_USER_IP% cs3Label=X-Client-IP start=%EVENT_TIME% fileHash=%SCANNED_FILE_HASH% request=%SCANNED_URL% cs1=%SCAN_RESULT% cs1Label=Scan result cs4=%VIRUS_NAME% cs4Label=Virus name cs5=%SCANNED_FILE_SHA256_HASH% cs5Label=SHA256 cs6=%ICAP_MODE% cs6Label=ICAP mode cn1=%REQUEST_LENGTH% cn1Label=Request size flexString1=%SDK_VERSION% flexString1Label=Anti-Virus Engine version","Запись имеет следующие поля:","%VERSION%","Версия Kaspersky Scan Engine.","%EVENT_CLASS_ID%","Класс события. Возможные значения:","1\n\n\nСлужебное событие (не связанное со сканированием).\n","2\n\n\nСобытие, связанное с ошибками.\n","3\n\n\nСобытие, связанное со сканированием (например, результат сканирования).\n","%EVENT_NAME%","Название события. Возможные значения:","Initializing – инициализация Kaspersky Scan Engine.","Deinitializing – Kaspersky Scan Engine деинициализирован, произошло сторожевое событие или отсутствует процесс службы.","Update event — началось или завершилось обновление антивирусных баз.","License event – событие, связанное с лицензией.","Engine event — произошло событие антивирусного ядра.","Scan result clean – проверенный объект считается безопасным.","Scan result detect – обнаружена угроза.","Scan result other – объект не был просканирован.","Audit – произошло событие аудита системы.","%SEVERITY%","Уровень важности события. Чем выше уровень, тем важнее событие. Возможные значения:","3\n\n\nЭто значение указывается для событий аудита системы, информационный уровень.\n","5\n\n\nЭто значение указывается для служебных событий, когда начинается сканирование или если результат сканирования – CLEAN.\n","6\n\n\nЭто значение указывается для событий аудита системы, уровень предупреждения.\n","7\n\n\nЭто значение указывается для инициализации, деинициализации и ошибок.\n","8\n\n\nЭто значение указывается для событий аудита системы (критический уровень) и если результат сканирования отличен от CLEAN. Эти события считаются опасными.\n","%EVENT_MSG%","Описание события. Например, текст сообщения об ошибке.","%CLIENT_IP%","IP-адрес ICAP-клиента, отправившего запрос на сканирование в Kaspersky Scan Engine. Это поле отображается только в событиях результатов проверки (типы событий ScanResultClean, ScanResultDetect, ScanResultOther).","%ICAP_SERVER_PID%","PID Kaspersky Scan Engine.","%HTTP_SERVICE_IP%","IP-адрес, который Kaspersky Scan Engine использует для получения запросов на сканирование от клиентов. Это поле появляется только в том случае, если включено логирование системного журнала в формате CEF.","%HOSTNAME%","Имя хоста компьютера, на котором работает Kaspersky Scan Engine. Это поле появляется только в том случае, если включено логирование системного журнала в формате CEF.","%HTTP_USER_NAME%","Имя HTTP-клиента, указанное в пользовательском поле заголовка запроса. Имя этого поля заголовка запроса указывается в элементе HTTPUserNameICAPHeader файла конфигурации режима ICAP.","Поля cs2 (%HTTP_USER_NAME%) и cs2Label отображаются только в том случае, если значение %EVENT_CLASS_ID% равно 3 и если в файле конфигурации режима ICAP существует не пустой элемент HTTPUserNameICAPHeader. Если элемент HTTPUserNameICAPHeader не существует или пуст, поля cs2 (%HTTP_USER_NAME%) и cs2Label отсутствуют в сообщении системного журнала.","Если значение поля пользовательского заголовка пусто (имя HTTP-клиента не указано в запросе), значение cs2 (%HTTP_USER_NAME%) в сообщении системного журнала равно \"-\".","%HTTP_USER_IP%","IP-адрес HTTP-клиента, указанный в пользовательском поле заголовка запроса. Имя этого поля заголовка запроса указывается в элементе HTTPClientIpICAPHeader файла конфигурации режима ICAP.","Поля cs3 (%HTTP_USER_IP%) и cs3Label отображаются только в том случае, если значение %EVENT_CLASS_ID% равно 3 и если в файле конфигурации режима ICAP существует не пустой элемент HTTPClientIpICAPHeader. Если элемент HTTPClientIpICAPHeader не существует или пуст, поля cs3 (%HTTP_USER_IP%) и cs3Label отсутствуют в сообщении системного журнала.","Если значение поля пользовательского заголовка пусто (IP-адрес клиента HTTP не указан в запросе), значение cs3 (%HTTP_USER_IP%) в сообщении системного журнала равно \"-\".","%EVENT_TIME%","Время и дата события. Время и дата берутся с компьютера, на котором работает Kaspersky Scan Engine.","%SCANNED_FILE_HASH%","Хеш объекта, переданного на сканирование в Kaspersky Scan Engine. Это поле отображается только в событиях результатов проверки (типы событий ScanResultClean, ScanResultDetect, ScanResultOther).","%SCANNED_URL%","URL-адрес, переданный на проверку в Kaspersky Scan Engine. Это поле отображается только в событиях результатов проверки (типы событий ScanResultClean, ScanResultDetect, ScanResultOther).","%SCAN_RESULT%","Результат сканирования. Это поле отображается только в событиях результатов проверки (типы событий ScanResultClean, ScanResultDetect, ScanResultOther).","cs1Label=Scan result","Это поле появляется, только если значение %EVENT_CLASS_ID% равно 3.","%VIRUS_NAME%","Название угрозы или легальной программы, которая может быть использована злоумышленниками. Это поле отображается только в событиях результатов проверки (типы событий ScanResultClean, ScanResultDetect, ScanResultOther).","%SCANNED_FILE_SHA256_HASH%","SHA256-хеш объекта, переданного на проверку в Kaspersky Scan Engine. Это поле появляется только тогда, когда Kaspersky Scan Engine возвращает результат проверки.","%ICAP_MODE%","Указывает, в каком режиме Kaspersky Scan Engine проверял объект: REQMOD или RESPMOD. Это поле отображается только в событиях результатов проверки (типы событий ScanResultClean, ScanResultDetect, ScanResultOther).","%REQUEST_LENGTH%","Длина тела сообщения в байтах. Это поле отображается только в событиях результата проверки (типы событий ScanResultClean, ScanResultDetect, ScanResultOther) и только если проверяемый объект не является URL-адресом.","%SDK_VERSION%","Версия KAV SDK, на которой основан Kaspersky Scan Engine."," Формат логов CEF в режиме ICAP ","186631.htm"));
Page.push(new Array("Формат логов RAW в режиме ICAP","Если Kaspersky Scan Engine настроен на запись сообщений системного журнала в формате RAW, записи журнала о событиях выглядят следующим образом:","<%PRIORITY%>1 %TIMESTAMP% %ICAP_SERVICE_IP% KasperskyICAPServer %ICAP_SERVICE_PID% %MESSAGE_ID% [KL_ICAP@23668 icapMode=\"%ICAP_MODE%\" requestLength=\"%REQUEST_LENGTH%\" httpUserName=\"%HTTP_USER_NAME%\" httpUserIP=\"%HTTP_USER_IP%\" sha2=\"%SCANNED_FILE_SHA256_HASH%\" md5=\"%SCANNED_FILE_MD5_HASH%\" request=\"%SCANNED_URL%\"] BOM %MESSAGE%","Запись имеет следующие поля:","%PRIORITY%","Уровень важности события. Возможные значения:","163\n\n\nЭто значение указывается для ошибок.\n","165\n\n\nЭто значение указывается, если результат сканирования отличен от CLEAN.\n","166\n\n\nЭто значение указывается для служебных событий или если результат сканирования – CLEAN.\n","%TIMESTAMP%","Дата и время события в часовом поясе всемирного координированного времени (UTC).","%ICAP_SERVICE_IP%","IP-адрес компьютера, на котором работает Kaspersky Scan Engine.","%ICAP_SERVICE_PID%","PID Kaspersky Scan Engine.","%MESSAGE_ID%","Класс события. Возможные значения:","AUDIT_MESSAGE – событие аудита.","INIT_MESSAGE – KAV SDK инициализирован.","DEINIT_MESSAGE – KAV SDK деинициализирован, произошло сторожевое событие или отсутствует процесс службы.","UPDATE_MESSAGE — началось или завершилось обновление антивирусных баз.","LICENSE_MESSAGE – событие, связанное с лицензированием.","ENGINE_MESSAGE — произошло событие антивирусного ядра.","SCAN_RESULT_CLEAN_MESSAGE – проверенный объект считается безопасным.","SCAN_RESULT_DETECT_MESSAGE – обнаружена угроза.","SCAN_RESULT_OTHER_MESSAGE – объект не просканирован.","%ICAP_MODE%","Указывает, в каком режиме Kaspersky Scan Engine проверял объект: REQMOD или RESPMOD. Это поле появляется, только если значение %MESSAGE_ID% равно SCAN_RESULT_MESSAGE.","%REQUEST_LENGTH%","Длина тела HTTP-сообщения, сканируемого Kaspersky Scan Engine. Это поле появляется, только если значение %MESSAGE_ID% равно SCAN_RESULT_MESSAGE и проверяемый объект не является URL-адресом.","%HTTP_USER_NAME%","Имя HTTP-клиента, указанное в параметре HTTPUserNameICAPHeader файла конфигурации режима ICAP. Поле %HTTP_USER_NAME% отображается, только если значение %MESSAGE_ID% равно SCAN_RESULT_MESSAGE.","%HTTP_USER_IP%","IP-адрес HTTP-клиента, указанный в параметре HTTPClientIpICAPHeader файла конфигурации режима ICAP. Поле %HTTP_USER_IP% появляется, только если значение %MESSAGE_ID% равно SCAN_RESULT_MESSAGE.","%SCANNED_FILE_SHA256_HASH%","SHA256-хеш объекта, переданного на сканирование в Kaspersky Scan Engine. Это поле появляется только тогда, когда Kaspersky Scan Engine возвращает результат проверки.","%SCANNED_FILE_MD5_HASH%","MD5-хеш объекта, переданного на сканирование в Kaspersky Scan Engine. Это поле появляется только тогда, когда Kaspersky Scan Engine возвращает результат проверки.","%SCANNED_URL%","URL-адрес, проверенный KAV SDK. Поле %SCANNED_URL% отображается только в событиях результатов проверки (типы событий SCAN_RESULT_CLEAN_MESSAGE, SCAN_RESULT_DETECT_MESSAGE, SCAN_RESULT_OTHER_MESSAGE).","%MESSAGE%","Описание события. Например, текст сообщения об ошибке."," Формат логов RAW в режиме ICAP ","186652.htm"));
Page.push(new Array("Формат логов CEF в режиме HTTP","Если Kaspersky Scan Engine настроен на запись сообщений системного журнала в формате CEF, записи журнала о событиях выглядят следующим образом:","CEF:0|Kaspersky|Scan Engine HTTP Service|%VERSION%|%EVENT_CLASS_ID%|%EVENT_NAME%|%SEVERITY%| msg=%EVENT_MSG% src=%CLIENT_IP% dvcpid=%HTTP_SERVICE_PID% sproc=unix_socket dvc=%HTTP_SERVICE_IP% dvchost=%HOSTNAME% start=%EVENT_TIME% fileHash=%SCANNED_FILE_MD5_HASH% fname=%SCANNED_FILE_NAME% request=%SCANNED_URL% act=%ACTION_MADE% cs1=%SCAN_RESULT% cs1Label=Scan result cs2=%VIRUS_NAME% cs2Label=Virus name flexString1=%SDK_VERSION% flexString1Label=Anti-Virus Engine version","Запись имеет следующие поля:","%VERSION%","Версия Kaspersky Scan Engine.","%EVENT_CLASS_ID%","Класс события. Возможные значения:","1\n\n\nСлужебное событие (не связанное со сканированием).\n","2\n\n\nСобытие, связанное с ошибками.\n","3\n\n\nСобытие, связанное со сканированием (например, результат сканирования).\n","%EVENT_NAME%","Название события. Возможные значения:","Initializing – инициализация Kaspersky Scan Engine.","Deinitializing – деинициализация Kaspersky Scan Engine.","Service event – произошло служебное событие.","Service error – в службе kavhttpd произошла ошибка.","Core error – в Kaspersky Anti-Virus Engine произошла ошибка.","Scan result – Kaspersky Scan Engine завершил сканирование объекта.","Audit – произошло событие аудита системы.","%SEVERITY%","Уровень важности события. Чем выше уровень, тем важнее событие. Возможные значения:","3\n\n\nЭто значение указывается для событий аудита системы, информационный уровень.\n","5\n\n\nЭто значение указывается для служебных событий, когда начинается сканирование или если результат сканирования – CLEAN.\n","6\n\n\nЭто значение указывается для событий аудита системы, уровень предупреждения.\n","7\n\n\nЭто значение указывается для инициализации, деинициализации и ошибок.\n","8\n\n\nЭто значение указывается для событий аудита системы (критический уровень) и если результат сканирования отличен от CLEAN. Эти события считаются опасными.\n","%EVENT_MSG%","Описание события. Например, текст сообщения об ошибке.","%CLIENT_IP%","IP-адрес HTTP-клиента, отправившего запрос на сканирование в Kaspersky Scan Engine. Это поле появляется только в том случае, если запрос отправляется через TCP-сокет и связан со сканированием.","%HTTP_SERVICE_PID%","PID Kaspersky Scan Engine.","%HTTP_SERVICE_IP%","IP-адрес, который Kaspersky Scan Engine использует для получения запросов на сканирование от клиентов. Это поле появляется только в том случае, если Kaspersky Scan Engine получает запросы на сканирование через TCP-сокет.","%HOSTNAME%","Имя хоста компьютера, на котором работает Kaspersky Scan Engine. Это поле появляется только в том случае, если включено логирование системного журнала в формате CEF.","%EVENT_TIME%","Время и дата события. Время и дата берутся с компьютера, на котором работает Kaspersky Scan Engine.","sproc=unix_socket","Это поле появляется только в том случае, если Kaspersky Scan Engine получает запросы на сканирование через UNIX-сокет.","%SCANNED_FILE_MD5_HASH%","Хеш объекта, переданного на сканирование в Kaspersky Scan Engine. Это поле появляется только в том случае, если клиент отправил запрос на сканирование и Kaspersky Scan Engine завершил сканирование.","%SCANNED_FILE_NAME%","Имя сканируемого файла. Если клиент отправил запрос на сканирование части оперативной памяти, значение этого поля – MEMORY_BLOCK. Это поле появляется только в том случае, если клиент отправил запрос на сканирование и Kaspersky Scan Engine завершил сканирование.","%SCANNED_URL%","URL-адрес, указанный в заголовке X-KAV-ObjectURL запроса на сканирование. Это поле появляется только в том случае, если клиент отправил запрос на сканирование и Kaspersky Scan Engine завершил сканирование.","%ACTION_MADE%","Действие, которое было выполнено в отношении обнаруженной угрозы или легальной программы, которая может быть использована злоумышленниками. Это поле отображается только в событиях, содержащих результаты сканирования.","%SCAN_RESULT%","Результат сканирования. Это поле отображается только в событиях, содержащих результаты сканирования.","cs1Label=Scan result","Это поле отображается только в событиях, содержащих результаты сканирования.","%VIRUS_NAME%","Название обнаруженной угрозы или легальной программы, которая может быть использована злоумышленниками. Это поле появляется только в том случае, если была обнаружена угроза или легальная программа, которая может быть использована злоумышленниками.","cs2Label=Virus name","Это поле появляется только в том случае, если была обнаружена угроза или легальная программа, которая может быть использована злоумышленниками.","%SDK_VERSION%","Версия KAV SDK, на которой основан Kaspersky Scan Engine."," Формат логов CEF в режиме HTTP ","186767.htm"));
Page.push(new Array("Логирование в режиме HTTP","В этом разделе объясняется, как работать с журналами в режиме HTTP."," Логирование в режиме HTTP ","186768.htm"));
Page.push(new Array("Формат логов RAW в режиме HTTP","Если Kaspersky Scan Engine настроен на запись сообщений системного журнала в формате RAW, записи журнала о событиях выглядят следующим образом:","<%PRIORITY%>1 %TIMESTAMP% %HTTP_SERVICE_IP% KasperskyHTTPService %HTTP_SERVICE_PID% %MESSAGE_ID% - BOM %MESSAGE%\\n","Запись имеет следующие поля:","%PRIORITY%","Уровень критичности события. Возможные значения:","163\n\n\nЭто значение указывается для ошибок.\n","165\n\n\nЭто значение указывается, если результат сканирования отличен от CLEAN.\n","166\n\n\nЭто значение указывается для служебных событий или если результат сканирования – CLEAN.\n","%TIMESTAMP%","Дата и время события в часовом поясе всемирного координированного времени (UTC).","%HTTP_SERVICE_IP%","IP-адрес, который Kaspersky Scan Engine использует для получения запросов на сканирование от клиентов. Если Kaspersky Scan Engine получает запросы на сканирование через UNIX-сокет, в поле указывается имя хоста компьютера, на котором работает Kaspersky Scan Engine.","%HTTP_SERVICE_PID%","PID Kaspersky Scan Engine.","%MESSAGE_ID%","Класс события. Возможные значения:","AUDIT_MESSAGE\n\n\nСобытие аудита.\n","SERVICE_MESSAGE\n\n\nСлужебное событие.\n","ERROR_MESSAGE\n\n\nОшибка.\n","SCAN_RESULT_CLEAN_MESSAGE\n\n\nПросканированный объект считается безопасным.\n","SCAN_RESULT_DETECT_MESSAGE\n\n\nОбнаружена угроза.\n","SCAN_RESULT_OTHER_MESSAGE\n\n\nОбъект не просканирован.\n","%MESSAGE%","Описание события. Например, текст сообщения об ошибке."," Формат логов RAW в режиме HTTP ","186769.htm"));
Page.push(new Array("Добавление самозаверяющего сертификата как доверенного для браузера (Windows)","В этом разделе показано, как добавить самозаверяющие сертификаты, созданные при установке Kaspersky Scan Engine, в доверенное хранилище. Это удалит предупреждения системы безопасности, создаваемые браузерами.","Информация в этом разделе применима к ситуации, когда пользователь получает доступ к Kaspersky Scan Engine GUI с того же компьютера, на котором он запущен. Если элемент Settings > ServerSettings > ConnectionString в файле конфигурации Kaspersky Scan Engine относится к внешнему интерфейсу, то сайт Kaspersky Scan Engine GUI не будет считаться доверенным, поскольку самозаверяющий сертификат может использоваться только с https: //127.0.0.1 и https://localhost.","Чтобы избежать потенциальных угроз безопасности, рекомендуется использовать доверенный сертификат, подписанный центром сертификации.","Как сделать самозаверяющий сертификат доверенным в браузере (Kaspersky Scan Engine GUI открывается в Internet Explorer)","Чтобы сделать сертификат доверенным в браузере, необходимо последовательно выполнить следующие три процедуры.","Сохранить сертификат в локальный файл","Чтобы сохранить сертификат в локальный файл:","Откройте адрес https://127.0.0.1 или https://localhost в Internet Explorer.\nБраузер сообщает о проблеме с сертификатом безопасности веб-сайта. \n \nСообщение об ошибке сертификата ","Выберите ссылку Continue to this website (not recommended).\nВ адресной строке появляется сообщение Certificate Error. ","Нажмите Certificate Error.\nОткроется окно Untrusted Certificate. \n \nОкно Untrusted Certificate ","Выберите ссылку View certificates.\nОткроется окно Certificate с информацией о сертификате Kaspersky Scan Engine. \n \nОкно Certificate ","Выберите вкладку Details и нажмите Copy to File, чтобы создать локальную копию сертификата.\nЗапустится мастер экспорта сертификатов. \n \nМастер экспорта сертификатов ","Следуйте инструкциям мастера.\nПри экспорте сертификата используйте параметры мастера по умолчанию. ","Запустить процесс импорта сертификата","Чтобы запустить процесс импорта сертификата через консоль управления MMC:","Из поля Search перейдите к полю Run и введите mmc.\nТеперь вы можете запустить MMC от имени администратора. \n \nЗапуск MMC ","В открывшейся консоли MMC выберите File > Add/Remove Snap-in.\n \nВыбор Add/Remove Snap-in \nОткроется окно Add or Remove Snap-ins. ","В списке Available snap-ins выберите Certificates и нажмите Add.\n \nДобавление оснастки Certificates \nОткроется окно Certificates snap-in. ","Выберите пункт Computer account и нажмите Next.\n \nВыбор пункта Computer account \nВ открывшемся окне Select Computer нажмите Finish. \n \nВыбор опции Local computer ","На панели слева выберите Certificates (Local Computer) > Trusted Root Certification Authorities, нажмите правой кнопкой мыши на Certificates и выберите All Tasks > Import.\n \nВыбор действия Import \nЗапустится мастер импорта сертификатов. ","Импортировать сохраненный сертификат","Чтобы добавить сохраненный сертификат в хранилище доверенных корневых центров сертификации:","На странице приветствия мастера нажмите кнопку Next.\n \nМастер импорта сертификатов ","Нажмите кнопку Browse и выберите сертификат, который был сохранен в процедуре \"Сохранить сертификат в локальный файл\".\n \nИмпорт ранее сохраненного сертификата ","На следующей странице мастера импорта сертификатов нажмите кнопку Next.\n \nВыбор хранилища сертификатов ","На последней странице мастера импорта сертификатов нажмите Finish.\n \nЗавершение импорта сертификата ","Закройте консоль MMC и перезапустите браузер.\nПроблема безопасности (ненадежный сертификат) решена, см. рисунок ниже. \n \nИдентификация веб-сайта ","Как сделать самозаверяющий сертификат доверенным в браузере (Kaspersky Scan Engine GUI открывается в Google Chrome)","Чтобы сделать самозаверяющий сертификат для Kaspersky Scan Engine GUI доверенным при использовании Google Chrome:","Откройте адрес https://127.0.0.1 или https://localhost в Google Chrome.\nВ адресной строке отобразится предупреждение о том, что соединение с сайтом не защищено. ","Нажмите на сообщение Not secure.\nОткроется окно со сведениями о безопасности веб-сайта. ","Нажмите на Certificate, чтобы просмотреть информацию о сертификате (при наведении указателя мыши на Certificate появляется всплывающая подсказка Show certificate).","В открывшемся окне Certificate выберите вкладку Details и нажмите Copy to File, чтобы создать локальную копию сертификата.\nЗапустится мастер экспорта сертификатов. \n \nМастер экспорта сертификатов ","Следуйте инструкциям мастера.\nПри экспорте сертификата используйте параметры мастера по умолчанию. ","После сохранения сертификата на локальном диске откройте его и добавьте в хранилище доверенных корневых центров сертификации, как описано в процедуре для Internet Explorer.","Перезагрузите браузер.","Как сделать самозаверяющий сертификат доверенным в браузере (Kaspersky Scan Engine GUI открывается в Mozilla Firefox)","Добавьте Kaspersky Scan Engine GUI в список доверенных сайтов Mozilla Firefox, чтобы браузер не показывал предупреждения о сертификате.","Удаление сертификата из списка доверенных","После перенастройки или удаления Kaspersky Scan Engine старые сертификаты больше не используются в Kaspersky Scan Engine. Вы можете удалить их из списка доверенных сертификатов.","Чтобы удалить сертификат из списка доверенных, выполните следующие действия.","Откройте консоль управления сертификатами, выполнив следующую команду:\ncertmgr.msc ","На панели слева выберите Trusted Root Certification Authorities > Certificates.\n \nКонсоль управления сертификатами ","На панели результатов нажмите правой кнопкой мыши на добавленный сертификат и выберите Delete."," Добавление самозаверяющего сертификата как доверенного для браузера (Windows) ","186925.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме ICAP с помощью файла модуля systemd","Вы можете запустить Kaspersky Scan Engine в режиме ICAP, используя файл модуля kavicapd.service для systemd. Файл модуля позволяет вам добавить службу kavicapd в список запуска служб и управлять службой вручную из командной строки.","В этом разделе предполагается, что вы хотите добавить службу kavicapd для всех пользователей. Для получения информации о том, как добавить службу и управлять ею от имени конкретного пользователя, обратитесь к официальной документации для systemd и systemctl.","Автоматический запуск Kaspersky Scan Engine","Чтобы Kaspersky Scan Engine запускался автоматически, добавьте kavicapd в список запуска служб.","Чтобы добавить kavicapd в список запуска служб:","Поместите файл модуля kavicapd.service в директорию /etc/systemd/system/.","При необходимости отредактируйте файл модуля.","Перезагрузите systemd, выполнив следующую команду:\n\nsystemctl daemon-reload\n\n\n\n ","Убедитесь, что файл модуля kavicapd.service установлен, выполнив следующую команду:\n\nsystemctl list-unit-files\n\n\n\n ","Включите запуск kavicapd при старте системы, выполнив следующую команду:\n\nsystemctl enable kavicapd.service\n\n\n\n ","Получение состояния службы kavicapd.","Чтобы получить статус службы kavicapd, выполните следующую команду:","service kavicapd status","Удаление Kaspersky Scan Engine из списка запуска служб","Чтобы удалить kavicapd из списка запуска служб, выполните следующую команду:","systemctl disable kavicapd.service","Управление Kaspersky Scan Engine с помощью systemd из терминала","Чтобы запустить kavicapd без перезагрузки компьютера, выполните следующую команду:","systemctl start kavicapd","Чтобы остановить kavicapd без перезагрузки компьютера, выполните следующую команду:","systemctl stop kavicapd","Чтобы обновить антивирусные базы, выполните следующую команду:","systemctl reload kavicapd"," Запуск Kaspersky Scan Engine в режиме ICAP с помощью файла модуля systemd ","192397.htm"));
Page.push(new Array("Запуск службы klScanEngineUI с файловым модулем systemd (Linux)","Только для систем Linux.","Вы можете запустить Kaspersky Scan Engine GUI, используя файл модуля klScanEngineUI.service для systemd. Файл модуля позволяет вам добавить службу klScanEngineUI в список запуска служб и управлять службой вручную из командной строки.","В этом разделе предполагается, что вы хотите добавить службу klScanEngineUI для всех пользователей. Для получения информации о том, как добавить службу и управлять ею от имени конкретного пользователя, обратитесь к официальной документации для systemd и systemctl.","Автоматический запуск Kaspersky Scan Engine","Чтобы Kaspersky Scan Engine запускался автоматически, добавьте klScanEngineUI в список запуска служб.","Чтобы добавить klScanEngineUI в список запуска служб:","Поместите файл модуля klScanEngineUI.service в директорию /etc/systemd/system/.","При необходимости отредактируйте файл модуля.","Перезагрузите systemd, выполнив следующую команду:\n\nsystemctl daemon-reload\n\n\n\n ","Убедитесь, что файл модуля klScanEngineUI.service установлен, выполнив следующую команду:\n\nsystemctl list-unit-files\n\n\n\n ","Включите запуск klScanEngineUI при старте системы, выполнив следующую команду:\n\nsystemctl enable klScanEngineUI.service\n\n\n\n ","Удаление Kaspersky Scan Engine из списка запуска служб","Чтобы удалить klScanEngineUI из списка запуска служб, выполните следующую команду:","systemctl disable klScanEngineUI.service","Управление Kaspersky Scan Engine с помощью systemd из терминала","Чтобы запустить klScanEngineUI без перезагрузки компьютера, выполните следующую команду:","systemctl start klScanEngineUI","После выполнения этой команды сценарий печатает сообщение [OK] и немедленно возвращает управление терминалу, но для запуска службы klScanEngineUI потребуется некоторое время.","Чтобы остановить klScanEngineUI без перезагрузки компьютера, выполните следующую команду:","systemctl stop klScanEngineUI"," Запуск службы klScanEngineUI с файловым модулем systemd (Linux) ","192471.htm"));
Page.push(new Array("Изменение переменных в файле модуля режима ICAP","Вы можете настроить Kaspersky Scan Engine, изменив одну или несколько переменных в файле модуля %distr_kit%/etc/kavicapd.service.","Изменение пути к PID-файлу Kaspersky Scan Engine","Вы можете изменить эту переменную, если хотите создать PID-файл Kaspersky Scan Engine в директории, отличной от /var/run/kavicapd.pid.","В следующем примере показано, как эта переменная устанавливается в файле модуля:","PIDFile=/var/run/kavicapd.pid","Изменение переменных среды","Вы должны изменить эти переменные среды, если Kaspersky Scan Engine находится не в директории /opt/kaspersky/ScanEngine.","В файле модуля используются следующие переменные среды:","SDKPATH – указывает директорию, в которой находится Kaspersky Scan Engine. В следующем примере показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=SDKPATH=/opt/kaspersky/ScanEngine\n\n\n\n ","KL_PLUGINS_PATH – указывает путь к директории, в которой находятся файлы плагина PPL, используемые Kaspersky Scan Engine. В следующем примере показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=KL_PLUGINS_PATH=/ppl\n\n\n\n ","LD_LIBRARY_PATH – указывает путь к директории, в которой находятся общие библиотеки, используемые Kaspersky Scan Engine. В следующем блоке показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=LD_LIBRARY_PATH=/lib:/ppl\n\n\n\n ","Изменение путей в команде, выполняемой при запуске kavicapd","Вы должны изменить пути в команде, выполняемой при запуске kavicapd, если вы помещаете исполняемый файл kavicapd или файл конфигурации режима ICAP в директории, отличные от указанных в файле модуля, или если вы хотите создать PID-файл Kaspersky Scan Engine в директории, отличной от /var/run/kavicapd.pid.","В следующем примере показано, как эта команда устанавливается в файле модуля:","ExecStart=/bin/sh -c 'cd ${SDKPATH}/bin; ./kavicapd -c /etc/kavicapd.xml -p /var/run/kavicapd.pid'"," Изменение переменных в файле модуля режима ICAP ","192475.htm"));
Page.push(new Array("Изменение переменных в файле модуля klScanEngineUI (Linux)","Только для систем Linux.","Вы можете настроить Kaspersky Scan Engine, изменив одну или несколько переменных в файле модуля %distr_kit%/etc/klScanEngineUI.service.","Изменение пути к PID-файлу Kaspersky Scan Engine","Вы можете изменить эту переменную, если хотите создать PID-файл Kaspersky Scan Engine в директории, отличной от /var/run/klScanEngineUI.pid.","В следующем примере показано, как эта переменная устанавливается в файле модуля:","PIDFile=/var/run/klScanEngineUI.pid","Изменение переменных среды","Вы должны изменить эти переменные среды, если Kaspersky Scan Engine находится не в директории /opt/kaspersky/ScanEngine.","В файле модуля используются следующие переменные среды:","SDKPATH – указывает директорию, в которой находится Kaspersky Scan Engine. В следующем примере показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=SDKPATH=/opt/kaspersky/ScanEngine\n\n\n\n ","KL_PLUGINS_PATH – указывает путь к директории, в которой находятся файлы плагина PPL, используемые Kaspersky Scan Engine. В следующем примере показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=KL_PLUGINS_PATH=/ppl\n\n\n\n ","LD_LIBRARY_PATH – задает путь к директории, в которой находятся общие библиотеки, используемые Kaspersky Scan Engine. В следующем блоке показано, как эта переменная устанавливается в файле модуля:\n\nEnvironment=LD_LIBRARY_PATH=/lib:/ppl\n\n\n\n ","Изменение путей в команде, выполняемой при запуске klScanEngineUI","Вы должны изменить пути в команде, выполняемой при запуске klScanEngineUI, если вы поместили исполняемый файл klScanEngineUI или файл конфигурации klScanEngineUI в директории, отличные от указанных в модульном файле, или если вы хотите создать PID-файл Kaspersky Scan Engine в директории, отличной от /var/run/klScanEngineUI.pid.","В следующем примере показано, как эта команда устанавливается в файле модуля:","ExecStart=/bin/sh -c 'cd ${SDKPATH}/bin; ./klScanEngineUI -c /etc/klScanEngineUI.xml -p /var/run/klScanEngineUI.pid'"," Изменение переменных в файле модуля klScanEngineUI (Linux) ","192481.htm"));
Page.push(new Array("О Kaspersky Scan Engine","Kaspersky Scan Engine – это серверное защитное решение, которое обеспечивает антивирусную защиту, сканирование HTTP-трафика и проверку репутации файлов и URL-адресов для сторонних клиентских решений.","Kaspersky Scan Engine обеспечивает комплексную защиту широкого ряда устройств от вредоносных программ, троянцев, червей, руткитов, шпионского и рекламного программного обеспечения. Его можно использовать с различными продуктами и службами, в том числе с приложениями для персональных компьютеров, серверными решениями, прокси-серверами и почтовыми шлюзами.","Решение Kaspersky Scan Engine основано на комплекте Kaspersky Anti-Virus Software Development Kit 8 Level 3 (KAV SDK) и на ядре Kaspersky Anti-Virus Engine, удостоившемся наград, и поэтому использует новейшие методы определения и удаления вредоносного ПО различных типов.","Вы можете запросить документацию KAV SDK либо купить KAV SDK вместе с документацией у вашего персонального технического менеджера."," О Kaspersky Scan Engine ","192968.htm"));
Page.push(new Array("Технологии обнаружения Kaspersky Scan Engine","В этом разделе описаны технологии обнаружения, реализованные в Kaspersky Scan Engine.","Анализ сигнатур","Этот метод обнаружения основывается на поиске определенной строки в сканируемых файлах. Сигнатурный анализ также включает обнаружение, основанное на хеше всего вредоносного файла. Традиционные сигнатуры позволяют обнаруживать определенные объекты с высокой точностью. Другие технологии, основанные на использовании сигнатур, такие как структурные эвристические сигнатуры и SmartHash, могут обнаруживать неизвестное и полиморфное вредоносное ПО.","Сигнатурный анализ позволяет обнаруживать определенные атаки с высокой точностью и малой вероятностью ложного срабатывания. Однако этот метод обнаружения неэффективен против полиморфных вредоносных программ и различных версий одного и того же вредоносного ПО. Для высокой эффективности сигнатурного анализа также требуется частое обновление сигнатур.","Часто обновляемая обширная антивирусная база данных Kaspersky Scan Engine обеспечивает высочайший уровень защиты от известного вредоносного ПО, троянцев, червей, руткитов, шпионского и рекламного ПО.","Расширенная эвристика","При сканировании скрипта или исполняемого файла ядро Kaspersky Anti-Virus Engine эмулирует его запуск в безопасной искусственной среде. Если во время анализа поведения эмулируемого объекта обнаруживается подозрительное поведение, он считается вредоносным. Этот метод позволяет обнаруживать новое и неизвестное вредоносное ПО.","Компонент Kaspersky Scan Engine, представляющий собой эмулятор, эмулирует функциональную среду запуска для объекта, в том числе функции и различные подсистемы целевой операционной системы. Реальные функции и подсистемы во время эмуляции не используются.","Технологии машинного обучения","SmartHash – это запатентованный алгоритм \"Лаборатории Касперского\" для построения интеллектуальных хешей, учитывающих локализацию. Хеши, учитывающие локализацию, – это статические характеристики файлов, которые могут быть извлечены и разбиты на группы. Значения SmartHash можно вычислить для каждого файла, при этом различные файлы могут иметь одинаковое значение SmartHash, когда они функционируют подобным образом. Поэтому конкретное значение SmartHash идентифицирует целый кластер подобных файлов и позволяет эффективно обнаруживать неизвестные вредоносные программы на основе уже известных семейств. Технология SmartHash использует несколько уровней точности, что позволяет обнаруживать даже сильно полиморфные вредоносные программы. Вместе с этим она позволяет снизить вероятность ложного срабатывания.","Преимущества технологии SmartHash:","Хорошо справляется с новыми, избегающими обнаружение и полиморфными вредоносными программами.","Обнаружение в течение нескольких минут. ","Работа без подключения и с подключением к интернету.","Гибкая модель с несколькими уровнями схожести, что позволяет обнаруживать чистые и вредоносные файлы.","Устойчивая технология: математическая модель обновляется с помощью машинного обучения и постоянно пересматривается экспертами. Использование технологии SmartHash приводит к минимуму ложных срабатываний и высокому уровню обнаружения.","SmartHash онлайн также помогает свести к минимуму ложные срабатывания. Значение SmartHash, вычисленное на стороне клиента, можно сравнить с миллиардами известных чистых файлов в базе данных \"Лаборатории Касперского\" посредством глобальной сети Kaspersky Security Network.","\"Лаборатория Касперского\" использует машинное обучение для повышения качества обнаружения существующих технологий сканирования. Машинное обучение развертывается для автоматического анализа журналов запуска во внутренних песочницах. Во внутренних поведенческих системах-песочницах запускаются как известные вредоносные файлы, так и неизвестные файлы. Некоторые из этих песочниц имитируют пользовательские системы, на которых запущены стандартные продукты. Наиболее мощные песочницы используют возможности выборочного протоколирования, позволяя очень тонко настраивать обнаружение.","Роботы обрабатывают журналы песочниц по одной строке. Журналы выполнения с записями от новых вредоносных образцов изучаются с помощью машинного обучения, чтобы найти новые индикаторы обнаружения. Эти новые индикаторы обогащают математические модели методов обнаружения, не основанных на сигнатурах, равно как и эвристические поведенческие записи, создаваемые экспертами \"Лаборатории Касперского\".","Обработка сжатых исполняемых файлов и архивов","Kaspersky Scan Engine включает в себя технологию, позволяющую обнаруживать вирусы и другие объекты внутри сжатых исполняемых файлов и архивов. С помощью этой технологии можно безопасно вылечить или удалить инфицированные архивы и сжатые исполняемые файлы.","Kaspersky Scan Engine поддерживает примерно 4000 различных форматов сжатых исполняемых файлов и архивов.","Лечение архивов","Эта технология предназначена для лечения архивов. С помощью этой технологии успешно вылечиваются или удаляются инфицированные объекты внутри архивов (в зависимости от пользовательских настроек). Вам не нужно использовать другие архиваторы.","В настоящее время Kaspersky Anti-Virus Engine удаляет вирусы из архивов следующих форматов: ARJ, CAB, RAR и ZIP.","Kaspersky Security Network","Kaspersky Security Network (KSN) – это инфраструктура облачных служб, которая обеспечивает доступ к онлайновой базе знаний \"Лаборатории Касперского\", содержащей информацию о репутации файлов, веб-ресурсов и программ. Использование данных из Kaspersky Security Network обеспечивает более быстрое реагирование на угрозы, улучшает производительность некоторых компонентов защиты и уменьшает вероятность ложных срабатываний.","\"Лаборатория Касперского\" располагает серверы KSN в вычислительных центрах по всему миру, тем самым обеспечивая минимальное время отклика для облачных проверок. База данных KSN содержит терабайты информации; она постоянно обновляется аналитиками по безопасности, а также автоматическими методами.","При использовании KSN вы передаете в \"Лабораторию Касперского\" информацию об установленной копии Kaspersky Scan Engine и обнаруженных объектах. Эта информация не содержит персональной или конфиденциальной информации пользователя. \"Лаборатория Касперского\" защищает полученную информацию в соответствии с требованиями законодательства. Смотрите также полный список данных, которые передаются в \"Лабораторию Касперского\" при проверке репутации файлов и URL-адресов.","Kaspersky Scan Engine соответствует требованиям Общего регламента по защите данных (GDPR).","Обнаружение вредоносных и фишинговых URL-адресов","В Kaspersky Scan Engine входит автономная база данных вредоносных и фишинговых URL-адресов. Кроме того, вы можете проверять репутации сканируемых URL-адресов в Kaspersky Security Network."," Технологии обнаружения Kaspersky Scan Engine ","192970.htm"));
Page.push(new Array("Режим HTTP","При работе в режиме HTTP решение Kaspersky Scan Engine состоит из HTTP-службы kavhttpd, ядра Kaspersky Anti-Virus Engine и Kaspersky Scan Engine GUI.","Когда вы используете Kaspersky Scan Engine в режиме HTTP, взаимодействие между компонентами происходит в следующем порядке:","Файлы и URL-адреса для сканирования посылаются в kavhttpd в HTTP-запросах.","Вы можете переслать объекты в kavhttpd двумя способами:","используя HTTP-клиент, подобный примеру HTTP-клиента, включенному в пакет распространения;","посылая HTTP-запросы вручную.","Служба kavhttpd посылает объекты ядру Kaspersky Anti-Virus Engine.","Kaspersky Anti-Virus Engine сканирует объекты.","Если вы используете компонент проверки репутации файлов и URL-адресов, объекты также отправляются в KSN для проверки репутации.","После выполнения сканирования Kaspersky Anti-Virus Engine возвращает результат службе kavhttpd.","Служба kavhttpd посылает результаты сканирования HTTP-клиенту либо другому приложению, которое послало объекты на сканирование.","Если вы используете Kaspersky Scan Engine GUI, результаты сканирования отображаются на странице Scan results.","Нижеследующий рисунок отображает взаимодействие между компонентами Kaspersky Scan Engine.","Kaspersky Scan Engine в режиме HTTP"," Режим HTTP ","192971.htm"));
Page.push(new Array("Режим ICAP","При работе в режиме ICAP решение Kaspersky Scan Engine состоит из ICAP-сервера kavicapd, ядра Kaspersky Anti-Virus Engine и Kaspersky Scan Engine GUI.","Когда вы используете Kaspersky Scan Engine в режиме ICAP, взаимодействие между компонентами происходит в следующем порядке:","ICAP-клиент (например, прокси-сервер) посылает ICAP-запросы службе kavicapd. ","Служба kavicapd отправляет файлы ядру Kaspersky Anti-Virus Engine на сканирование.","Kaspersky Anti-Virus Engine сканирует содержимое HTTP-сообщений и URL-адреса, содержащиеся в этих ICAP-запросах. \nЕсли вы используете компонент проверки репутации файлов и URL-адресов, содержимое HTTP-сообщений и URL-адреса также отправляются в KSN для проверки репутации. ","После сканирования ядро Kaspersky Anti-Virus Engine возвращает результаты службе kavicapd.","Служба kavicapd отправляет ICAP-ответы с результатами сканирования ICAP-клиенту. \nЕсли вы используете Kaspersky Scan Engine GUI, результаты сканирования отображаются на странице Scan results. ","Kaspersky Scan Engine может работать одновременно с несколькими ICAP-клиентами.","Нижеследующий рисунок показывает пример взаимодействия между прокси-сервером и Kaspersky Scan Engine в режиме ICAP.","Kaspersky Scan Engine в режиме ICAP"," Режим ICAP ","192972.htm"));
Page.push(new Array("Содержимое пакета распространения (Windows)","Пакет распространения Kaspersky Scan Engine для Windows содержит следующие папки и файлы:","Содержимое пакета распространения (Windows)","Путь","Описание","\\bin\\appinfo.kli","Файл с информацией о приложении.","\\bin\\kavehost.exe","Исполняемый файл службы kavehost.","\\bin\\kavhttp_client.exe","Исполняемый файл клиента kavhttpd.","\\bin\\klScanEngineUI.exe","Бинарный файл Kaspersky Scan Engine GUI.","\\bin\\klScanEngineUI.xml","Файл конфигурации для Kaspersky Scan Engine GUI.","\\bin\\kavhttpd.exe","Исполняемый файл службы kavhttpd.","\\bin\\kavhttpd.xml","Пример файла конфигурации для службы kavhttpd.","\\bin\\httpdkavlog.ini","Файл конфигурации, который содержит настройки логирования службы kavhttpd.","\\bin\\bases\\","Папка, содержащая файлы антивирусных баз.","\\bin\\ossl\\","Библиотека OpenSSL.","\\bin\\x86\\","32-образы библиотек, которые используются эмуляторами.","\\bin\\*.dll","Динамические библиотеки, используемые Kaspersky Scan Engine.","\\bin\\*.ppl","Исполняемые модули Kaspersky Scan Engine.","\\doc\\Doc_data\\","Папка, которая содержит документацию Kaspersky Scan Engine.","\\doc\\About data provision.txt","Файл, который описывает процедуру предоставления данных для проверки репутации файлов и веб-адресов.","\\doc\\About data provision extended.txt","Файл, который описывает процедуру предоставления данных, когда вы отправляете статистическую информацию KSN в Kaspersky Scan Engine для Linux.","\\doc\\About data provision - online activation.txt","Файл, который описывает процедуру предоставления данных для режима лицензирования онлайн.","\\doc\\Kaspersky_Scan_Engine.html","Главная страница документации Kaspersky Scan Engine.","\\doc\\legal_notices.txt","Информация о стороннем коде.","\\doc\\license.txt","Пользовательское соглашение для Kaspersky Scan Engine.","\\doc\\ksn_license.txt","Пользовательское соглашение для Kaspersky Security Network (KSN).","\\httpsrv\\etc\\kavaccess","Файл, который содержит зашифрованные учетные данные для Kaspersky Scan Engine GUI.","\\httpsrv\\templates\\","Папка, которая содержит шаблоны для Kaspersky Scan Engine GUI.","\\include\\","Папка, которая содержит заголовочные файлы KAV SDK для разработки приложений.","\\runtime\\","Библиотеки Universal C Runtime (UCRT) C++ Runtime.","Эти файлы можно использовать, если в целевой системе эти библиотеки не установлены.","\\samples\\kavhttp\\","Папка, которая содержит исходный код службы kavhttpd и образец клиента для нее.","\\samples\\tables.sql","Файл, содержащий SQL-запросы, которые необходимо выполнить после установки Kaspersky Scan Engine вручную.","\\tools\\kav_encrypt.exe","Утилита для шифрования учетных данных прокси-серверов и базы данных Kaspersky Scan Engine.","\\tools\\kavsigner.exe","Утилита для подписи приложений.","\\tools\\kl_access_util.exe","Утилита для восстановления пароля от учетной записи admin в графическом интерфейсе Kaspersky Scan Engine.","\\tools\\openssl.exe","Утилита OpenSSL.","\\tools\\openssl.cnf","Файл конфигурации для OpenSSL.","\\tools\\msvcp80.dll","\\tools\\msvcr80.dll","\\tools\\Microsoft.VC80.CRT","Компоненты Microsoft Visual C++ Redistributable.","\\install.exe","Инсталлятор.","\\kl_control.bat","Скрипт для управления службами kavhttpd и klScanEngineUI.","\\uninstall.exe","Деинсталлятор.","\\ReleaseNotes.pdf","Примечания к выпуску.","\\version","Текстовый файл с версией продукта."," Содержимое пакета распространения (Windows) ","192973.htm"));
Page.push(new Array("Установка Kaspersky Scan Engine","Этот раздел содержит информацию о том, как установить Kaspersky Scan Engine."," Установка Kaspersky Scan Engine ","192974.htm"));
Page.push(new Array("Установка и настройка PostgreSQL (Linux)","Kaspersky Scan Engine GUI требует установленной СУБД PostgreSQL 10.7 или более поздней версии. Приведенная ниже процедура описывает установку и настройку PostgreSQL 10.7. Для более поздней версии СУБД процедура может отличаться от данной.","Чтобы установить и настроить PostgreSQL:","Загрузите и установите PostgreSQL.","Вы можете установить PostgreSQL одним из следующих способов:","Установите пакет, загруженный с веб-сайта PostgreSQL.\n\n\nЗайдите на сайт https://www.postgresql.org/download/, чтобы ознакомиться со списком поддерживаемых операционных систем и инструкциями по установке для каждой из них. ","Установите PostgreSQL из исходного кода.\n\n\nЗайдите на сайт https://www.postgresql.org/docs/10/installation.html для получения инструкций по установке. ","Откройте конфигурационный файл","postgresql.conf",". Расположение этого файла зависит от используемой операционной системы:","В дистрибутивах Linux, основанных на Debian, файл postgresql.conf находится в директории /etc/postgresql/10/main/.","В дистрибутивах Linux, основанных на Red Hat, файл postgresql.conf находится в директории /var/lib/pgsql/data/.","Если вы используете иную операционную систему, расположение файла postgresql.conf может быть другим.","Укажите IP-адрес, который решение Kaspersky Scan Engine должно использовать для соединения с PostgreSQL, в настройке listen_addresses конфигурационного файла postgresql.conf.","Укажите порт, который СУБД PostgreSQL должна прослушивать в ожидании соединений от Kaspersky Scan Engine, в настройке port конфигурационного файла postgresql.conf.","Сохраните и закройте postgresql.conf.","Откройте конфигурационный файл pg_hba.conf на редактирование. Этот файл расположен в той же директории, что и файл postgresql.conf.","Укажите, что СУБД PostgreSQL должна принимать пароли, зашифрованные по алгоритму MD5, для аутентификации всех ее клиентов:","Найдите следующую строку в файле pg_hba.conf:\n\n\nhost all all 127.0.0.1/32 peer ","Отредактируйте эту строку следующим образом:\n\n\nhost all all 127.0.0.1/32 md5 ","Если файл конфигурации pg_hba.conf не содержит строку host all all 127.0.0.1/32 peer, вам необходимо изменить строку host all all 127.0.0.1/32 ident.","Если PostgreSQL и Kaspersky Scan Engine установлены на разных компьютерах, добавьте следующую строку в файл pg_hba.conf:","host all all %IP%/32 md5","Здесь %IP% – IP-адрес компьютера, на котором установлено решение Kaspersky Scan Engine.","Сохраните и закройте файл pg_hba.conf.","Перезапустите PostgreSQL, выполнив следующую команду:","service postgresql restart","Задайте пароль для пользователя PostgreSQL, существующего по умолчанию.","При установке PostgreSQL создает суперпользователя postgres. По умолчанию для этого пользователя пароль не задан.","Чтобы задать пароль для пользователя postgres:","Из командной строки смените правильного пользователя на пользователя postgres:\n\n\nsu postgres ","Из-под учетной записи postgres запустите утилиту psql, выполнив следующую команду в командной строке:\n\n\npsql ","В psql измените пароль пользователя postgres с помощью следующей команды:\n\n\nalter user postgres with password '%PASSWORD%'; \n\n\nЗдесь %PASSWORD% – это новый пароль пользователя postgres. ","Закройте утилиту psql, выполнив следующую команду в psql:\n\n\n\\q ","Теперь вы можете установить Kaspersky Scan Engine GUI.","Чтобы установить Kaspersky Scan Engine GUI, вам нужен пользователь PostgreSQL с правами на создание новых баз данных и пользователей. Для этого вы можете использовать пользователя postgres или создать нового.","После установки PostgreSQL и задания пароля для пользователя postgres вы можете перейти к действиям, описанным в разделе Автоматическая установка (Linux) или Ручная установка (Linux).","Все данные хранятся в базе данных kavebase. Kaspersky Scan Engine не использует другие базы данных."," Установка и настройка PostgreSQL (Linux) ","192975.htm"));
Page.push(new Array("Установка и настройка PostgreSQL (Windows)","Чтобы установить и настроить PostgreSQL:","Загрузите и установите PostgreSQL.\nЗайдите на сайт https://www.enterprisedb.com/downloads/postgres-postgresql-downloads, чтобы просмотреть список поддерживаемых операционных систем и загрузить инсталлятор. ","Откройте конфигурационный файл postgresql.conf. Этот файл находится в папке %postgresql_dir%\\data. Здесь %postgresql_dir% (например, C:\\Program Files\\PostgreSQL\\11) это папка, в которую был установлен PostgreSQL.","Укажите IP-адрес, который решение Kaspersky Scan Engine должно использовать для соединения с PostgreSQL, в настройке listen_addresses конфигурационного файла postgresql.conf.","Укажите порт, который СУБД PostgreSQL должна прослушивать в ожидании соединений от Kaspersky Scan Engine, в настройке port конфигурационного файла postgresql.conf.","Для PostgreSQL версии 13 или более поздней найдите следующую строку в postgresql.conf:\npassword_encryption = md5 # md5 или scram-sha-256 \nЕсли метод шифрования пароля, указанный в этой строке, отличается от md5, замените его на md5. ","Сохраните и закройте postgresql.conf.","Откройте конфигурационный файл pg_hba.conf на редактирование. Этот файл расположен в той же папке, что и файл postgresql.conf.","Убедитесь, что для PostgreSQL требуются пароли, зашифрованные по алгоритму MD5, для аутентификации всех ее клиентов. Найдите следующую строку в файле pg_hba.conf:\nhost all all 127.0.0.1/32 md5 \nЕсли метод аутентификации, указанный в этой строке, отличается от md5, замените его на md5. ","Если PostgreSQL и Kaspersky Scan Engine установлены на разных компьютерах, добавьте следующую строку в файл pg_hba.conf:\nhost all all %IP%/32 md5 \nЗдесь %IP% – IP-адрес компьютера, на котором установлено решение Kaspersky Scan Engine. ","Сохраните и закройте файл pg_hba.conf.","Перезапустите PostgreSQL, выполнив следующие команды:\nsc stop postgresql-x64-11 \nsc start postgresql-x64-11 ","Если был выполнен шаг 5, вам необходимо обновить пароль суперпользователя на компьютере, на котором установлен PostgreSQL. Пользователь по умолчанию – postgres. Вы можете использовать утилиту psql или pgAdmin для выполнения этого действия. Если вы используете утилиту psql, укажите пробел и имя пользователя после параметра -U, как показано ниже: psql -U postgres\nОбновите пароль суперпользователя: \nALTER ROLE username WITH PASSWORD 'your password'; ","Теперь вы можете установить Kaspersky Scan Engine GUI.","Чтобы установить Kaspersky Scan Engine GUI, вам нужен пользователь PostgreSQL с правами на создание новых баз данных и пользователей. Для этого вы можете использовать пользователя postgres или создать нового.","После установки PostgreSQL вы можете перейти к разделу Установка с помощью установщика (Windows) или Установка вручную (Windows).","Все данные хранятся в базе данных kavebase. Kaspersky Scan Engine не использует другие базы данных."," Установка и настройка PostgreSQL (Windows) ","192976.htm"));
Page.push(new Array("Автоматическая установка (Linux)","В этом разделе описана установка Kaspersky Scan Engine с использованием инсталлятора. Вы можете использовать программу установки, если Kaspersky Scan Engine не установлен на вашем компьютере (папка /opt/kaspersky/ScanEngine отсутствует).","Если вы хотите использовать Kaspersky Scan Engine вместе с Kaspersky Scan Engine GUI, вам нужно установить PostgreSQL на компьютер, к которому у Kaspersky Scan Engine есть доступ. Kaspersky Scan Engine GUI не будет работать без PostgreSQL.","Перед установкой и настройкой Kaspersky Scan Engine вам необходимо указать региональные настройки компьютера, на котором установлен Kaspersky Scan Engine. Используйте следующие команды.","LC_ALL=en_US.utf8","export LC_ALL","Использование инсталлятора для установки Kaspersky Scan Engine:","В приведенной ниже процедуре описаны действия, которые необходимо выполнить, если вы хотите установить Kaspersky Scan Engine с помощью инсталлятора.","Для автоматической установки Kaspersky Scan Engine:","Убедитесь, что у вас есть права администратора.","Запустите утилиту install.","Ознакомьтесь с Пользовательским соглашением (End User License Agreement, EULA) для Kaspersky Scan Engine.","Если вы согласны с условиями Пользовательского соглашения, примите его. Если вы не согласны с условиями Пользовательского соглашения, прекратите установку.","Выберите, использовать ли Kaspersky Scan Engine GUI.","Если вы хотите использовать Kaspersky Scan Engine GUI, выполните следующие действия.","Убедитесь, что вы установили и настроили PostgreSQL.","Укажите IP-адрес и порт для соединения с PostgreSQL.","Выберите, следует ли добавить экземпляр продукта в существующий кластер или подключиться к существующей базе данных. \n\n\nЕсли вы решили добавить экземпляр продукта в существующий кластер, перейдите к следующему шагу. В противном случае перейдите к шагу f. ","Введите имя пользователя и пароль учетной записи пользователя PostgreSQL.\n\n\nПод этими учетными данными Kaspersky Scan Engine будет работать с базой данных. ","Продолжите процедуру с шага 6.","Введите учетные данные пользователя, у которого есть права на создание баз данных и пользователей. Учетные данные этого пользователя нигде не записываются. \n\n\nС помощью этой учетной записи Kaspersky Scan Engine создаст новую базу данных kavebase, в которой будут храниться данные Kaspersky Scan Engine, и нового пользователя PostgreSQL. С этого момента Kaspersky Scan Engine будет использовать этого пользователя для внесения изменения в базу данных. ","Задайте имя пользователя и пароль для новой учетной записи PostgreSQL.\n\n\nИнсталлятор создаст учетную запись, под которой Kaspersky Scan Engine будет работать с базой данных. Эта учетная запись будет иметь доступ только к базе данных kavebase. \n\n\nЭти учетные данные будут храниться в зашифрованном виде и доступны только для пользователя root. Поэтому, если вы запустите службу от имени пользователя без root-прав, отобразится сообщение об ошибке. Чтобы решить эту проблему, после завершения установки настройте доступ к файлу ключа шифрования kl_scanengine_db.key, хранящегося в директории httpsrv, чтобы учетная запись пользователя, под которой Kaspersky Scan Engine работал с базой данных, имела разрешение на чтение. ","Выберите режим, в котором будет работать Kaspersky Scan Engine.","Доступны следующие режимы:","HTTP","ICAP","Если вы выбрали режим HTTP, укажите IP-адрес и порт или UNIX-сокет, которые Kaspersky Scan Engine будет использовать для получения запросов на сканирование объектов.","Если вы выбрали режим ICAP, укажите порт, трафик с которого будет сканироваться решением Kaspersky Scan Engine.","Укажите, должно ли решение Kaspersky Scan Engine использовать Kaspersky Security Network (KSN).","Если вы хотите использовать KSN, ознакомьтесь с Пользовательским соглашением для KSN и Политикой конфиденциальности.","Если вы согласны с условиями Пользовательского соглашения и Политики конфиденциальности, примите их. Если вы не примете условия Пользовательского соглашения и Политики конфиденциальности, вы не сможете использовать KSN, но установка продолжится. Вы сможете включить KSN позже, используя Kaspersky Scan Engine GUI или файлы конфигурации Kaspersky Scan Engine (HTTP или ICAP).","Если вы хотите использовать Kaspersky Scan Engine GUI, при необходимости укажите порт, на котором он будет доступен.","Укажите, будет ли Kaspersky Scan Engine использовать прокси-сервер.","Если вы хотите использовать прокси-сервер, укажите настройки прокси.","Укажите директорию, где будут храниться временные файлы.","Если вы нажмете Enter, директория /tmp будет использоваться для хранения временных файлов.","Инсталлятор создаст поддиректорию scanengine в указанной вами директории. Kaspersky Scan Engine будет использовать эту поддиректорию для хранения временных файлов.","Начиная с Kaspersky Scan Engine версии 2.1, объекты KAV SDK поставляются отдельным пакетом. Укажите абсолютный путь к директории, в которой находится пакет KAV SDK. Вы также можете нажать Enter. В этом случае инсталлятор Kaspersky Scan Engine будет искать файлы KAV SDK в директории на один уровень выше, чем директория, в которой находится установщик.","Укажите режим лицензирования, который будет использоваться в Kaspersky Scan Engine.","Если вы хотите использовать режим лицензирования оффлайн, укажите файл ключа.","Если вы хотите использовать режим лицензирования онлайн, укажите код активации.","Проверьте указанные вами параметры и при необходимости откорректируйте их.","После того как вы укажете необходимые данные, Kaspersky Scan Engine будет установлен, а затем запущен. Информация об установке будет выведена на консоль.","После установки Kaspersky Scan Engine вы можете в любой момент проверить целостность его компонентов с помощью утилиты проверки целостности."," Автоматическая установка (Linux) ","192977.htm"));
Page.push(new Array("Автоматическая установка (Windows)","В этом разделе описана установка Kaspersky Scan Engine с использованием инсталлятора. Вы можете использовать инсталлятор, если Kaspersky Scan Engine не установлен на вашем компьютере.","Если вы хотите использовать Kaspersky Scan Engine GUI, вам нужно установить СУБД PostgreSQL на компьютер, к которому у Kaspersky Scan Engine есть доступ. Kaspersky Scan Engine GUI не будет работать без доступа к PostgreSQL.","Чтобы установить Kaspersky Scan Engine, используя инсталлятор:","Распакуйте содержимое пакета распространения в пустую папку на вашем компьютере.","Убедитесь, что у вас есть права администратора.","Запустите файл install.exe.","Ознакомьтесь с Пользовательским соглашением (End User License Agreement, EULA) для Kaspersky Scan Engine.","Если вы согласны с условиями Пользовательского соглашения, примите его. Если вы не согласны с условиями Пользовательского соглашения, прекратите установку.","Выберите, использовать ли Kaspersky Scan Engine GUI.","Если вы хотите использовать Kaspersky Scan Engine GUI, выполните следующие действия.","Убедитесь, что вы установили и настроили PostgreSQL.","Укажите IP-адрес и порт для соединения с PostgreSQL.","Введите учетные данные пользователя, у которого есть права на создание баз данных и пользователей. Учетные данные этого пользователя нигде не записываются. \n\n\nС помощью этой учетной записи Kaspersky Scan Engine создаст новую базу данных, которая будет называться kavebase, и нового пользователя PostgreSQL с именем scanengine. Учетная запись scanengine будет использоваться для внесения изменения в эту базу данных. ","Укажите IP-адрес и порт, которые Kaspersky Scan Engine будет использовать, чтобы получать запросы на сканирование объектов.","Укажите, должно ли решение Kaspersky Scan Engine использовать Kaspersky Security Network (KSN).","Если вы хотите использовать KSN, ознакомьтесь с Пользовательским соглашением для KSN и Политикой конфиденциальности.","Если вы согласны с условиями Пользовательского соглашения и Политики конфиденциальности, примите их. Если вы не примете условия Пользовательского соглашения и Политики конфиденциальности, вы не сможете использовать KSN, но установка продолжится. Вы можете включить KSN позже, используя Kaspersky Scan Engine GUI или файл конфигурации Kaspersky Scan Engine.","Если вы хотите использовать Kaspersky Scan Engine GUI, при необходимости укажите порт, на котором он будет доступен.","Укажите, будет ли Kaspersky Scan Engine использовать прокси-сервер.","Если вы хотите использовать прокси-сервер, укажите настройки прокси.","Укажите директорию, где будут храниться временные файлы.","Установочный скрипт создаст в ней поддиректорию scanengine, в которой будут создаваться временные файлы.","Укажите режим лицензирования, который будет использоваться в Kaspersky Scan Engine.","Если вы хотите использовать режим лицензирования оффлайн, укажите файл ключа.","Если вы хотите использовать режим лицензирования онлайн, укажите код активации.","Проверьте указанные вами параметры и при необходимости откорректируйте их.","После того как вы укажете все необходимые данные, скрипт install установит Kaspersky Scan Engine и запустит его. Решение Kaspersky Scan Engine будет установлено в папку C:\\Program Files\\Kaspersky Lab\\ScanEngine.","Информация об установке будет выведена на консоль."," Автоматическая установка (Windows) ","192978.htm"));
Page.push(new Array("Использование Kaspersky Scan Engine в режиме HTTP","Этот раздел содержит информацию о том, как использовать Kaspersky Scan Engine в режиме HTTP."," Использование Kaspersky Scan Engine в режиме HTTP ","192979.htm"));
Page.push(new Array("Настройка Kaspersky Scan Engine в режиме HTTP","Этот раздел содержит информацию о том, как настроить Kaspersky Scan Engine в режиме HTTP, не используя Kaspersky Scan Engine GUI."," Настройка Kaspersky Scan Engine в режиме HTTP ","192980.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме HTTP","Этот раздел содержит информацию о том, как запустить Kaspersky Scan Engine в режиме HTTP."," Запуск Kaspersky Scan Engine в режиме HTTP ","192981.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в качестве службы (Windows)","Если вы зарегистрировали kavehttpd как службу Windows, вы можете запустить ее из командной строки с помощью следующих команд:","Если вы установили Kaspersky Scan Engine с помощью инсталлятора или зарегистрировали kavehttpd как службу вручную:\nnet start \"Kaspersky ScanEngine\" ","Если вы зарегистрировали kavehttpd с помощью бинарного файла kavehttpd:\nnet start kavhttpd "," Запуск Kaspersky Scan Engine в качестве службы (Windows) ","192984.htm"));
Page.push(new Array("Выполнение запросов в режиме HTTP","Этот раздел содержит информацию о том, как совершать запросы в режиме HTTP."," Выполнение запросов в режиме HTTP ","192985.htm"));
Page.push(new Array("Kaspersky Scan Engine и режим ICAP","Протокол ICAP (Internet Content Adaptation Protocol) используется для коммуникации между прокси-серверами и поставщиками услуг. В режиме ICAP решение Kaspersky Scan Engine взаимодействует с прокси-серверами, совместимыми с протоколом ICAP. Kaspersky Scan Engine сканирует HTTP-трафик, который проходит через прокси-сервер, а также URL-адреса, запрашиваемые пользователями.","При запуске в режиме ICAP решение Kaspersky Scan Engine состоит из службы kavicapd, файлов конфигурации и библиотек. Ключевые функции:","Сканирование URL-адреса.","Kaspersky Scan Engine позволяет сканировать URL-адреса, которые запрашивает пользователь через прокси-сервер. Эта функция доступна как для режима REQMOD (проверяются объекты, передаваемые от пользователя через прокси-сервер), так и для режима RESPMOD (проверяются объекты, передаваемые пользователю с прокси-сервера).","Сканирование HTTP-трафика.","Kaspersky Scan Engine позволяет сканировать входящий и исходящий HTTP-трафик, который проходит через прокси-сервер. Эта функция доступна как для режима REQMOD (проверяются объекты, передаваемые от пользователя через прокси-сервер), так и для режима RESPMOD (проверяются объекты, передаваемые пользователю с прокси-сервера).","Поддерживается сканирование составных объектов (объектов, включающих в себя несколько файлов).","Поддержка кода состояния HTTP 204 No Content.","Служба kavicapd может быть настроена на возврат такого кода состояния, если сообщение, посланное клиентом, не требует модификации.","Управление поведением службы kavicapd с помощью настройки правил службы.","Режим отправки по частям.","Этот режим, также называемый Data Trickling, позволяет сканировать файлы целиком и посылать их пользователю по блокам до окончания сканирования. Плагин продолжает сканирование файлов и одновременно отправляет пользователю первые блоки файлов. Эта функция позволяет пользователям быстро получать отсканированные файлы большого размера.","Режим предварительной проверки.","В этом режиме ICAP-клиент посылает запрос ICAP-плагину, а ICAP-плагин выполняет предварительную проверку объекта с помощью правил исключений. Такие запросы позволяют не сканировать те объекты, которые заведомо не являются вредоносными.","Обновления ISTag.","Значение ISTag в заголовке ICAP-ответа Kaspersky Scan Engine обновляется каждый раз, когда происходит одно из следующих событий:","Инициализация Kaspersky Scan Engine.","Изменение страниц настроек Kaspersky Scan Engine.","Антивирусная база обновлена.","Постоянные соединения Keep-Alive","По умолчанию Kaspersky Scan Engine поддерживает постоянные соединения Keep-Alive, поэтому он может обрабатывать несколько объектов один за другим, используя одно и то же соединение.","Чтобы открыть постоянное соединение Keep-alive, запрос ICAP должен содержать поле Connection со значением Keep-Alive.","Чтобы закрыть соединение, ICAP-запрос должен содержать поле Connection со значением close."," Kaspersky Scan Engine и режим ICAP ","192987.htm"));
Page.push(new Array("Настройка Kaspersky Scan Engine в режиме ICAP","В этом разделе описано, как настроить Kaspersky Scan Engine в режиме ICAP вручную без использования Kaspersky Scan Engine GUI."," Настройка Kaspersky Scan Engine в режиме ICAP ","192988.htm"));
Page.push(new Array("Файл конфигурации режима ICAP","Файл конфигурации режима ICAP kavicapd.xml состоит из нескольких секций, в которых перечислены основные настройки службы kavicapd и KAV SDK.","Подготовка файла конфигурации режима ICAP после установки Kaspersky Scan Engine вручную","Если вы установили Kaspersky Scan Engine вручную, вам нужно скопировать файл конфигурации туда, где служба kavicapd сможет его найти. По умолчанию файл конфигурации находится в директории %distr_kit%/etc/kavicapd.xml.","После установки Kaspersky Scan Engine скопируйте kavicapd.xml в одну из директорий по вашему усмотрению:","Если вы скопируете kavicapd.xml в директорию /etc/, Kaspersky Scan Engine найдет и обработает файл автоматически.","Если вы копируете kavicapd.xml в другую директорию, вам нужно задать путь к ней во время запуска Kaspersky Scan Engine вручную.","Параметры файла конфигурации режима ICAP","Ниже перечислены секции файла конфигурации kavicapd.xml. Пример файла конфигурации находится в конце раздела.","Файл конфигурации режима ICAP содержит следующие родительские элементы:","SDKSettings","KSNSettings","UpdateSettings","ProxySettings","FormatRecognizerSettings","ICAPSettings","Некоторые секции файла конфигурации необязательны. Однако если секция присутствует в файле, все ее дочерние элементы должны находиться в файле. Элементы не должны содержать пустые значения.","Структура файла конфигурации","Ниже приведен пример файла конфигурации режима ICAP.","<Configuration>","<SDKSettings>","<ScannersCount>4</ScannersCount>","<ThreadsCount>8</ThreadsCount>","<QueueLen>1024</QueueLen>","<ScanTimeout>10000</ScanTimeout> <!-- 0 = unlimited -->","<LicensePath>/opt/kaspersky/ScanEngine/bin</LicensePath>","<BasesPath>/opt/kaspersky/ScanEngine/bin/bases</BasesPath>","<TempPath>/tmp/kavicapd</TempPath>","<LicensingMode>1</LicensingMode><!-- 1 = offline licensing mode; 2 - online licensing mode -->","<ScanningMode>KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILPLAIN | KAV_O_M_MAILBASES | KAV_O_M_HEURISTIC_LEVEL_SHALLOW</ScanningMode>","<MaxArchivesScanningDepth>0</MaxArchivesScanningDepth>","</SDKSettings>","<KSNSettings>","<UseKSN>0</UseKSN>","<ObjectCheckOnDemandTimeoutMs>10000</ObjectCheckOnDemandTimeoutMs>","<CacheSizeKb>30720</CacheSizeKb>","</KSNSettings>","<UpdateSettings>","<DisableBackup>0</DisableBackup>","<UpdatePeriodMinutes>30</UpdatePeriodMinutes> <!-- 0 = turn update off -->","<UseOnlyCustomSources>0</UseOnlyCustomSources>","<UpdateSources>","<!-- <Source></Source> -->","</UpdateSources>","<UpdatesCertFile></UpdatesCertFile>","<CertificateConfirmationAction>0</CertificateConfirmationAction>","<UseReducedBases>0</UseReducedBases>","</UpdateSettings>","<ProxySettings>","<UseProxy>0</UseProxy>","<Host>myproxy.mycompany.com</Host>","<port>3128</port>","<User>doOTrypDTxpVJxUHYeKQTw==</User>","<pass>8mSHXFix3uL+RP9oNeKDZQ==</pass>","</ProxySettings>","<FormatRecognizerSettings>","<FormatsToSkipScanning>","<KAV_FF_GENERAL_TXT/>","<KAV_FF_GENERAL_CSV/>","<KAV_FF_AUDIO_WMA/>","</FormatsToSkipScanning>","</FormatRecognizerSettings>","<ICAPSettings>","<port>1344</port>","<ReqModeAddress>req</ReqModeAddress>","<RespModeAddress>resp</RespModeAddress>","<MaxIcapSessionsCount>100</MaxIcapSessionsCount>","<ScanMaxFileSize>0</ScanMaxFileSize> <!-- 0 = unlimited -->","<RAMUsageLimit>0</RAMUsageLimit> <!-- 0 = unlimited -->","<Allow204>0</Allow204>","<KeepAliveSettings><!-- Support for processing multiple requests during one connection -->","<Enabled>1</Enabled>","<TimeoutMs>5000</TimeoutMs>","<MaxRequests>1000</MaxRequests>","</KeepAliveSettings>","<RequestingICAPHeaders>","<ICAPHeader>HTTPUserNameICAPHeader</ICAPHeader>","<ICAPHeader>HTTPClientIpICAPHeader</ICAPHeader>","</RequestingICAPHeaders>","<HTTPClientIpICAPHeader>X-Client-IP</HTTPClientIpICAPHeader>","<HTTPUserNameICAPHeader>X-Client-Username</HTTPUserNameICAPHeader>","<VirusNameICAPHeader></VirusNameICAPHeader>","<DatabaseVersionICAPHeader>X-AV-Database-time</DatabaseVersionICAPHeader>","<SendInfectionFoundICAPHeader>0</SendInfectionFoundICAPHeader>","<SendResponseInfoICAPHeader>0</SendResponseInfoICAPHeader>","<SendResponseDescICAPHeader>0</SendResponseDescICAPHeader>","<SendViolationsFoundICAPHeader>0</SendViolationsFoundICAPHeader>","<ScanInReqMode>All</ScanInReqMode>","<ScanInRespMode>Content</ScanInRespMode>","<RulesFilePath>/opt/kaspersky/ScanEngine/icap_data/kavicapd_gui_rules.conf</RulesFilePath>","<CmdPath>/opt/kaspersky/ScanEngine/icap_data/scripts</CmdPath>","<ResponsesPath>/opt/kaspersky/ScanEngine/icap_data/templates</ResponsesPath>","<TransferBeforeScanEnding Delay=\"10\" ChunkSize=\"4\" BlockedUrlCacheEnabled=\"1\" BlockedUrlCacheKb=\"5000\" BlockedUrlCacheTtlSec=\"1800\">0</TransferBeforeScanEnding>","<Exclusions>","<!-- Signs of highly likely uninfected resources. -->","<!-- Note: ContentSize - more or equal (use only once), ContentType - as is, RequestURL - masks can be used -->","<!--","<ContentSize>102400</ContentSize>","<ContentType>audio/mpeg</ContentType>","<ContentType>image/jpeg</ContentType>","<RequestURL>*.kaspersky.com/.*</RequestURL>","-->","</Exclusions>","<!-- Possible values: update, reload, reopen-log (reopens syslog format log files) -->","<USR1SignalAction>update</USR1SignalAction>","<USR2SignalAction>reopen-log</USR2SignalAction>","<!-- The path to the logging configuration file. Only this file will be used as the ICAP logging configuration file. If the LoggingConfigFilePath element has the empty value, the icapdkavlog.conf file located in the kavicapd binary file directory is used. -->","<LoggingConfigFilePath></LoggingConfigFilePath>","</ICAPSettings>","</Configuration>"," Файл конфигурации режима ICAP ","192989.htm"));
Page.push(new Array("Запуск Kaspersky Scan Engine в режиме ICAP","В этом разделе описано, как запустить Kaspersky Scan Engine в режиме ICAP."," Запуск Kaspersky Scan Engine в режиме ICAP ","192990.htm"));
Page.push(new Array("Удаление Kaspersky Scan Engine","В этом разделе описано, как удалить Kaspersky Scan Engine."," Удаление Kaspersky Scan Engine ","192993.htm"));
Page.push(new Array("Удаление с помощью деинсталлятора (Linux и Windows)","В этом разделе описано, как удалить Kaspersky Scan Engine с помощью исполняемого файла uninstall (Linux) или uninstall.exe (Windows).","Перед удалением Kaspersky Scan Engine убедитесь, что файлы из директории %service_dir% не задействованы ни в одном процессе.","Чтобы удалить Kaspersky Scan Engine:","Убедитесь, что у вас есть права администратора.","Перейдите в директорию, отличную от %service_dir%, и запустите uninstall оттуда, например с помощью командной строки.\nЕсли на компьютере запущен экземпляр Kaspersky Scan Engine, деинсталлятор остановит его. ","Выберите, удалить базу с данными Kaspersky Scan Engine или нет.\nДеинсталлятор пропускает этот шаг, если удаляемый экземпляр Kaspersky Scan Engine входит в состав кластера, содержащего другие экземпляры. Вы можете удалить базу данных при удалении последнего экземпляра Kaspersky Scan Engine в кластере. ","Если вы выбрали удаление, uninstall удалит следующее:","Базу, которая содержит данные Kaspersky Scan Engine.\nУстановка PostgreSQL не будет удалена, как и учетная запись пользователя базы данных PostgreSQL, созданная вами во время установки. Будет удалена только база данных Kaspersky Scan Engine kavebase. Если вы хотите переустановить Kaspersky Scan Engine, удалите учетную запись пользователя базы данных. \nЧтобы удалить учетную запись пользователя базы данных, выполните следующую команду: \nDROP ROLE \"%account_name%\"; \nЗдесь %account_name% – это имя учетной записи пользователя базы данных, которую вы создали во время установки. ","Директорию, в которую был установлен Kaspersky Scan Engine.","Директорию с временными файлами Kaspersky Scan Engine.","Службу Kaspersky Scan Engine (из списка служб)."," Удаление с помощью деинсталлятора (Linux и Windows) ","192994.htm"));
Page.push(new Array("Данные, передаваемые в \"Лабораторию Касперского\"","В этом разделе описаны данные, получаемые \"Лабораторией Касперского\" во время работы Kaspersky Scan Engine.","Полученная информация защищается \"Лабораторией Касперского\" в соответствии с установленными законом требованиями и действующими правилами \"Лаборатории Касперского\". Данные передаются по зашифрованным каналам связи."," Данные, передаваемые в &quot;Лабораторию Касперского&quot; ","192996.htm"));
Page.push(new Array("Данные, передаваемые в \"Лабораторию Касперского\" при проверке репутации файлов и URL-адресов","Когда вы используете функции проверку репутации файлов и URL-адресов, Kaspersky Scan Engine передает \"Лаборатории Касперского\" информацию об установленной копии Kaspersky Scan Engine и об обнаруженных объектах.","Передается следующая информация:","Идентификатор Kaspersky Scan Engine.","Полная версия Kaspersky Scan Engine: мажорная версия, минорная версия, сборка, редакция и пакет исправлений.","Идентификатор обладателя лицензии.","Хеш-суммы обрабатываемых файлов (MD5, SHA256).","Версию KSN.","Хеш-суммы имен обнаруженных объектов (MD5, SHA256).","Нормализованный URL-адрес.","Смотрите также подробную информацию о предоставлении данных."," Данные, передаваемые в &quot;Лабораторию Касперского&quot; при проверке репутации файлов и URL-адресов ","192997.htm"));
Page.push(new Array("Информация о стороннем коде","Информация о стороннем коде содержится в двух файлах с именем legal_notices.txt. Один из этих файлов хранится в поддиректории doc директории установки Kaspersky Scan Engine. Другой хранится в поддиректории doc установочной директории KAV SDK."," Информация о стороннем коде ","192998.htm"));
Page.push(new Array("Уведомления о товарных знаках","Зарегистрированные товарные знаки и знаки обслуживания являются собственностью их правообладателей.","Safari является товарным знаком Apple Inc.","Dell Technologies, Dell, EMC и другие товарные знаки являются товарными знаками Dell Inc. или ее дочерних компаний.","F5 является товарным знаком F5 Networks, Inc. в США и некоторых других странах.","Chrome, Google, Google Chrome – товарные знаки Google LLC.","Linux – товарный знак Linus Torvalds, зарегистрированный в США и в других странах.","Internet Explorer, Microsoft, Microsoft Edge, Visual Studio, Win32, Windows, Windows Server являются товарными знаками группы компаний Microsoft.","Firefox и Mozilla являются товарными знаками Mozilla Foundation в США и других странах.","Oracle и Solaris являются зарегистрированными товарными знаками Oracle и (или) ее дочерних компаний.","Red Hat – товарный знак Red Hat Inc. или ее дочерних предприятий, зарегистрированный в Соединенных Штатах Америки и в других странах.","Debian – зарегистрированный товарный знак Software in the Public Interest, Inc.","Splunk – товарный знак Splunk Inc., зарегистрированный в США и других странах.","UNIX – товарный знак, зарегистрированный в США и других странах, использование лицензировано X/Open Company Limited."," Уведомления о товарных знаках ","192999.htm"));
Page.push(new Array("Формат POST-запроса на сканирование","POST-запросы на сканирование объекта имеют следующий формат:","* Заголовки запроса *","* Тело запроса *","{","\"timeout\": \"%TIMEOUT%\",","\"omitCleanSubobjectResults\": %TO_OMIT_CLEAN_SUBOBJECT_RESULTS%,","\"url\": \"%URL%\",","\"hostIp\": \"%HOST_IP%\",","\"requestHeaders\": \"%REQUEST_HEADERS%\",","\"responseHeaders\": \"%RESPONSE_HEADERS%\",","\"object\": \"%OBJECT%\",","\"name\": \"%SCAN_OBJECT_NAME%\"","}","Здесь:","timeout – тайм-аут на сканирование объекта (в миллисекундах). Это поле не является обязательным.","omitCleanSubobjectResults – переменная логического типа, которая определяет, будут ли включены в массив subObjectsScanResults вложенные объекты с результатом сканирования CLEAN. Если указано значение true, такие объекты не будут включены в массив; если указано значение false, то такие объекты включаются в массив. Значение по умолчанию: true. Это поле не является обязательным.\nСмотрите также подробную информацию о структуре массива subObjectsScanResults. ","url – URL-адрес, который будет использован как контекст для запроса на сканирование. Это поле не является обязательным.\nЭто поле можно использовать для повышения коэффициента обнаружения. ","hostIp – IP-адрес хоста, на котором размещен просканированный URL-адрес. Это поле не является обязательным.\nЭто поле можно использовать для повышения коэффициента обнаружения. Вам необходимо включить KSN, чтобы использовать это поле. ","requestHeaders – заголовки HTTP-запроса, извлеченные из HTTP-трафика. Это поле не является обязательным.\nЭто поле можно использовать для повышения коэффициента обнаружения. ","responseHeaders – заголовки HTTP-ответа, извлеченные из HTTP-трафика. Это поле не является обязательным.\nЭто поле можно использовать для повышения коэффициента обнаружения. ","object – абсолютный путь до файла, который нужно просканировать (если запрос послан к /api/v3.0/scanfile), или строка, закодированная по алгоритму Base64 (если запрос послан к /api/v3.0/scanmemory). В этом поле можно указать только один объект. Это поле является обязательным для заполнения.","name – имя объекта для сканирования в режиме scanmemory (если запрос послан к /api/v3.1/scanmemory). Значение может быть от 1 до 300 символов Юникода. Это поле не является обязательным.","Специальные символы в теле запроса должны быть экранированы, как указано в Standard ECMA-404 (The JSON Interchange Syntax)."," Формат POST-запроса на сканирование ","193000.htm"));
Page.push(new Array("Формат ответа на POST-запрос на сканирование","Если POST-запрос был успешно обработан, тело ответа будет содержать JSON-объект со следующими полями:","{","\"object\": \"%SCAN_OBJECT%\",","\"scanResult\": \"%SCAN_RESULT%\",","\"detectionName\": \"%DETECTED_OBJECT%\",","\"name\": \"%SCAN_OBJECT_NAME%\",","\"containsOfficeMacro\": \"%IS_MACRO_CONTAINED%\",","\"subObjectsScanResults\": [","{","\"object\": \"%SCAN_FILE%\",","\"scanResult\": \"%SCAN_RESULT%\",","\"detectionName\": \"%DETECTED_OBJECT%\",","\"containsOfficeMacro\": \"%IS_MACRO_CONTAINED%\"","},","...","{","\"object\": \"%SCAN_FILE%\",","\"scanResult\": \"%SCAN_RESULT%\",","\"detectionName\": \"%DETECTED_OBJECT%\",","\"containsOfficeMacro\": \"%IS_MACRO_CONTAINED%\"","}","]","}","Здесь:","object – абсолютный путь до просканированного файла (если запрос был послан к /api/v3.0/scanfile) или строка \"memory\" (если запрос был послан к /api/v3.0/scanmemory).","scanResult","– результат сканирования веб-адреса. Может иметь следующие значения:","CLEAN","DETECT","DISINFECTED","DELETED","NON_SCANNED","SERVER_ERROR","Если запрос был послан к /api/v3.0/scanfile или к /api/v3.0/scanmemory, причина того, что объект не сканируется, может быть добавлена к результату NON_SCANNED. Например:","{","\"object\": \"\\/home\\/user\\/Documents\\/filestoscan\\/test.zip\",","\"scanResult\": \"NON_SCANNED (PASSWORD PROTECTED)\",","\"containsOfficeMacro\": \"false\"","}","Возможные значения:","NON_SCANNED (CANCELED)\n\n\nСканирование отменено.\n","NON_SCANNED (CORRUPTED)\n\n\nСканируемый объект поврежден. \n","NON_SCANNED (ACCESS DENIED)\n\n\nДоступ к объекту запрещен.\n","NON_SCANNED (SKIPPED)\n\n\nСканирование пропущено.\n","NON_SCANNED (PASSWORD PROTECTED)\n\n\nПроверяемый объект защищен паролем.\n","NON_SCANNED\n\n\nПричина, по которой объект не сканируется, не определена.\n","detectionName – имя обнаруженного вредоносного объекта в классификации \"Лаборатории Касперского\".","name – имя объекта, указанного в поле name тела запроса (если запрос был послан к /api/v3.1/scanmemory). Если сканируемый объект имеет вложенные подобъекты, элемент name указывается только в родительском объекте.","containsOfficeMacro – переменная логического типа, которая имеет значение true, если в просканированном объекте был обнаружен макрос, и false в противоположном случае.","subObjectsScanResults","– массив, состоящий из результатов сканирования подобъектов, вложенных в просканированный объект. Это поле и все вложенные в него поля будут добавлены в ответ, только если просканированный объект включает вложенные подобъекты.","subObjectsScanResults/object – путь до вложенного подобъекта. Обратите внимание, что путь к подобъекту отделен от пути к родительскому объекту двумя косыми чертами (//), например:\n\n\n/home/user/archive.tar//folder/subobject ","subObjectsScanResults/scanResult – результат сканирования вложенного подобъекта.","subObjectsScanResults/detectionName – имя обнаруженного вредоносного объекта в классификации \"Лаборатории Касперского\".","subObjectsScanResults/containsOfficeMacro – переменная логического типа, которая имеет значение true, если в просканированном подобъекте был обнаружен макрос, и false в противоположном случае.","Если POST-запрос был обработан с ошибкой, тело ответа будет содержать JSON-объект с единственным полем error:","{","\"error\": \"%СООБЩЕНИЕ ОБ ОШИБКЕ%\"","}","Здесь поле error содержит описание ошибки, которая произошла во время обработки запроса.","Дополнительные поля в протоколе KAV версии 3.1","Поле reason появляется только в том случае, если вы используете протокол KAV версии 3.1. В этом поле указывается причина, по которой объект не проверяется. Это поле появляется, если запрос был послан к /api/v3.1/scanfile или к /api/v3.1/scanmemory и если значение поля scanResult равно NON_SCANNED.","Возможные значения:","Canceled\nСканирование отменено.\n","Corrupted\nСканируемый объект поврежден. \n","Access denied\nДоступ к объекту запрещен.\n","Skipped\nСканирование пропущено. \n","Password protected\nПроверяемый объект защищен паролем.\n","Max depth exceeded\nПревышена максимальная глубина распаковки вложенных архивов при сканировании.\n"," Формат ответа на POST-запрос на сканирование ","193001.htm"));
Page.push(new Array("Пример HTTP-запроса на сканирование локального файла","Протокол версии 3.0","Ниже приведен пример HTTP-запроса на сканирование локального файла:","POST /api/v3.0/scanfile HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 22","{","\"timeout\": \"10000\",","\"object\": \"\\/home\\/user\\/eicar\"","}","В поле object можно указать только один объект.","Смотрите также описание всех возможных полей в теле запроса и рекомендации по увеличению коэффициента обнаружения.","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 15:46:29 GMT","Content-Length: 75","{","\"object\": \"\\/home\\/user\\/eicar\",","\"scanResult\": \"DETECT\",","\"detectionName\": \"EICAR-Test-File\"","}","Смотрите также описание всех возможных полей в теле ответа.","Протокол версии 3.1","Формат запроса такой же, но в ответе есть дополнительные поля."," Пример HTTP-запроса на сканирование локального файла ","193002.htm"));
Page.push(new Array("Пример HTTP-запроса на сканирование части оперативной памяти","Протокол версии 3.0","Ниже приведен пример HTTP-запроса на сканирование блока оперативной памяти:","POST /api/v3.0/scanmemory HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 105","{","\"timeout\": \"10000\",","\"object\": \"WDVPIVAlQEFQWzRcUFpYNTQoUF4pN0NDKTd9JEVJQ0FSLVNUQU5EQVJELUFOVElWSVJVUy1URVNULUZJTEUhJEgrSCo=\"","}","В поле object можно указать только один объект.","Смотрите также описание всех возможных полей в теле запроса и рекомендации по увеличению коэффициента обнаружения.","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 16:08:12 GMT","Content-Length: 72","{","\"object\": \"memory\",","\"scanResult\": \"DETECT\",","\"detectionName\": \"EICAR-Test-File\"","}","Смотрите также описание всех возможных полей в теле ответа.","Протокол версии 3.1","Формат запроса такой же, но в ответе есть дополнительные поля."," Пример HTTP-запроса на сканирование части оперативной памяти ","193003.htm"));
Page.push(new Array("Пример HTTP-запроса на проверку URL-адреса","Ниже приведен пример HTTP-запроса на проверку URL-адреса:","POST /api/v3.0/checkurl HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 50","{","\"timeout\": \"10000\",","\"url\": \"http:\\/\\/bug.qainfo.ru\\/TesT\\/Aphish_w\",","\"hostIp\": \"233.252.0.1\"","}","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 16:15:44 GMT","Content-Length: 104","{","\"url\": \"http:\\/\\/bug.qainfo.ru\\/TesT\\/Aphish_w\",","\"scanResult\": \"DETECT\",","\"detectionName\": \"PHISHING_URL\"","}","Здесь:","url – проверенный URL-адрес.","scanResult","– результат сканирования веб-адреса. Может иметь следующие значения:","CLEAN","DETECT","DISINFECTED","DELETED","NON_SCANNED","SERVER_ERROR","detectionName","– имя обнаруженного вредоносного объекта в классификации \"Лаборатории Касперского\". Статус может иметь следующие значения:","PHISHING_URL","MALICIOUS_URL","ADWARE_URL","RISKWARE_URL"," Пример HTTP-запроса на проверку URL-адреса ","193004.htm"));
Page.push(new Array("Пример HTTP-запроса на получение даты выпуска текущей антивирусной базы","Запрос на получение даты выпуска текущей антивирусной базы обычно посылается, чтобы убедиться, что база успешно обновилась до последней версии.","Ниже приведен пример HTTP-запроса на получение даты выпуска текущей антивирусной базы:","GET /api/v3.0/basesdate HTTP/1.0","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 19:03:18 GMT","Content-Length: 50","{","\"databaseVersion\": \"30.01.2019 18:38 GMT\"","}","Здесь databaseVersion содержит текущую версию антивирусных баз в следующем формате: DD.MM.YYYY hh:mm GMT."," Пример HTTP-запроса на получение даты выпуска текущей антивирусной базы ","193005.htm"));
Page.push(new Array("Пример HTTP-запроса для получения текущей версии KAV SDK","Ниже приведен пример HTTP-запроса на получение версии библиотеки KAV SDK, на которой основана текущая версия Kaspersky Scan Engine:","GET /api/v3.0/version HTTP/1.0","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 19:05:51 GMT","Content-Length: 36","{","\"KAVSDKVersion\": \"8.8.2.58\"","}","Здесь KAVSDKVersion содержит текущую версию KAV SDK в следующем формате: MajorVersion.MinorVersion.BuildNumber.Revision."," Пример HTTP-запроса для получения текущей версии KAV SDK ","193007.htm"));
Page.push(new Array("Пример HTTP-запроса на получение лицензионной информации","Ниже приведен пример HTTP-запроса на получение лицензионной информации:","GET /api/v3.0/licenseinfo HTTP/1.0","Ниже приведен пример ответа на запрос, который содержит лицензионную информацию, если вы используете режим лицензирования офлайн:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 19:04:30 GMT","Content-Length: 81","{","\"licenseName\": \"EXAMPLE.key\",","\"licenseExpirationDate\": \"05.12.2020\"","}","Здесь:","licenseName – имя используемого файла ключа.","licenseExpirationDate – дата, до которой действителен используемый файл ключа. Дата указана в следующем формате: DD.MM.YYYY.","Нижеприведенный блок показывает ответ на запрос, который содержит лицензионную информацию, если вы используете режим лицензирования онлайн. В этом примере срок действия лицензионного билета истек.","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD/1.0","Content-Length: 185","Connection: close","Content-Type: text/plain","{","\"activationCode\": \"EXMPL-*****-*****-12345\",","\"licenseExpirationDate\": \"05.12.2020\",","\"ticketExpired\": \"The license ticket has expired. Computer must be connected to the Internet to update the license ticket.\"","}","Здесь:","activationCode – используемый код активации.","licenseExpirationDate – дата, до которой действителен используемый код активации. Дата указана в следующем формате: DD.MM.YYYY.","ticketExpired – сообщение, которое будет включено в ответ, если истек срок действия лицензионного билета."," Пример HTTP-запроса на получение лицензионной информации ","193008.htm"));
Page.push(new Array("Пример HTTP-запроса на получение обобщенной статистики","Ниже приведен пример HTTP-запроса на получение обобщенной статистики:","GET /api/v3.0/getstatistics HTTP/1.0","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 19:07:54 GMT","Content-Length: 314","{","\"statistics\": {","\"total_requests\": 3,","\"infected_requests\": 3,","\"protected_requests\": 3,","\"error_requests\": 0,","\"engine_errors\": 0,","\"processed_data\": 204,","\"infected_data\": 204,","\"processed_urls\": 1,","\"infected_urls\": 1","}","}","Здесь statistics – это объект, содержащий следующую накопленную статистику:","total_requests – общее количество запросов на сканирование файла или блока памяти и проверки URL-адреса.","infected_requests – количество запросов, на которые Kaspersky Scan Engine вернул результат сканирования DETECT, DISINFECTED или DELETED.","protected_requests – количество запросов, на которые Kaspersky Scan Engine вернул результат сканирования DISINFECTED или DELETED.","error_requests – количество запросов, на которые Kaspersky Scan Engine вернул результат сканирования NON_SCANNED (ошибка сканирования связана со сканируемым объектом).","engine_errors – количество запросов, на которые Kaspersky Scan Engine вернул результат сканирования SERVER_ERROR (ошибка сканирования не связана со сканируемым объектом).","processed_data – размер всех просканированных файлов в байтах.","infected_data – размер всех просканированных файлов в байтах, отправленных в запросах, на которые Kaspersky Scan Engine вернул результат сканирования DETECT, DISINFECTED или DELETED.","processed_urls – количество проверенных URL-адресов.","infected_urls – количество URL-адресов, распознанных решением Kaspersky Scan Engine как вредоносные, фишинговые, рекламные или легальные программы, которые злоумышленники могут использовать для нанесения ущерба компьютеру и данным."," Пример HTTP-запроса на получение обобщенной статистики ","193009.htm"));
Page.push(new Array("Пример HTTP-запроса на удаление обобщенной статистики","Ниже приведен пример HTTP-запроса на удаление обобщенной статистики:","POST /api/v3.0/clearstatistics HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 2","{}","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 19:09:27 GMT","Content-Length: 27","{","\"error\": \"CLEARED\"","}"," Пример HTTP-запроса на удаление обобщенной статистики ","193010.htm"));
Page.push(new Array("Пример HTTP-запроса на обновление антивирусной базы","Этот запрос может быть выполнен, только если HTTP-клиент и Kaspersky Scan Engine установлены на одном компьютере. Если вы пошлете этот запрос с другого компьютера, Kaspersky Scan Engine вернет ошибку 405 Method Not Allowed.","Ниже приведен пример HTTP-запроса на обновление антивирусной базы:","POST /api/v3.0/update/start HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 2","{}","Ниже приведен пример ответа, который будет возвращен в случае, если обновление началось успешно:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 18:05:44 GMT","Content-Length: 26","{","\"status\": \"update started\"","}","Ниже приведен пример ответа, который будет возвращен в случае, если запрос был послан, когда обновление уже началось:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 18:05:44 GMT","Content-Length: 35","{","\"status\": \"update already launched\"","}","Ниже приведен пример ответа, который будет возвращен в случае, если во время запуска обновления произошла ошибка:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 18:05:44 GMT","Content-Length: 40","{","\"status\": \"error while launching update\"","}"," Пример HTTP-запроса на обновление антивирусной базы ","193011.htm"));
Page.push(new Array("Пример HTTP-запроса на получение статуса обновления антивирусной базы","Этот запрос может быть выполнен, только если HTTP-клиент и Kaspersky Scan Engine установлены на одном компьютере. Если вы пошлете этот запрос с другого компьютера, Kaspersky Scan Engine вернет ошибку 405 Method Not Allowed.","Протокол версии 3.0","Ниже приведен пример HTTP-запроса на получение статуса обновления антивирусной базы:","GET /api/v3.0/update/status HTTP/1.0","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 18:05:44 GMT","Content-Length: 116","{","\"status\": \"not started\",","\"last_update_result\": \"success\",","\"last_update_time\": \"21:03:53 30.01.2019\"","}","Смотрите также описание всех полей, которые могут быть включены в тело ответа.","Протокол версии 3.1","Формат запроса такой же, но в ответе есть дополнительные поля."," Пример HTTP-запроса на получение статуса обновления антивирусной базы ","193012.htm"));
Page.push(new Array("Пример HTTP-запроса на получение информации из KSN","В следующем примере показан HTTP-запрос:","GET /api/v3.1/ksninfo","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 02 Dec 2019 18:06:50 GMT","Content-Length: 190","{","\"ksnStatus\": \"Connected\",","\"whiteApplications\": %whiteApplications%,","\"malwareApplications\": %malwareApplications%,","\"blockedThreats\": %blockedThreats%,","\"region\": \"%ksnRegion%\",","\"responseTimestamp\": \"%responseTimestamp%\"","}","Если KSN выключен, тело ответа содержит объект JSON с одним полем ksnStatus:","{","\"ksnStatus\": \"KSN turned off\"","}"," Пример HTTP-запроса на получение информации из KSN ","193338.htm"));
Page.push(new Array("Установка Kaspersky Scan Engine на Linux","Этот раздел содержит информацию о том, как установить Kaspersky Scan Engine на операционную систему Linux."," Установка Kaspersky Scan Engine на Linux ","199729.htm"));
Page.push(new Array("Установка Kaspersky Scan Engine на Windows","Этот раздел содержит информацию о том, как установить Kaspersky Scan Engine на операционные системы Windows."," Установка Kaspersky Scan Engine на Windows ","199730.htm"));
Page.push(new Array("Удаление Kaspersky Scan Engine на Linux","Этот раздел содержит информацию о том, как удалить Kaspersky Scan Engine на операционных системах Linux."," Удаление Kaspersky Scan Engine на Linux ","199825.htm"));
Page.push(new Array("Удаление Kaspersky Scan Engine на Windows","Этот раздел содержит информацию о том, как удалить Kaspersky Scan Engine на операционных системах Windows."," Удаление Kaspersky Scan Engine на Windows ","199826.htm"));
Page.push(new Array("UseHTTPProxy","Указывает, использует ли Kaspersky Scan Engine прокси при соединении с интернетом.","Путь","UseHTTPProxy","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента UseHTTPProxy","Значение","Описание","0","Прокси не используется.","Это значение по умолчанию.","1","Используется прокси.","Пример","Ниже приведен пример элемента UseHTTPProxy.","<UseHTTPProxy>1</UseHTTPProxy>"," UseHTTPProxy ","200598.htm"));
Page.push(new Array("KSNSettings","Задает настройки Kaspersky Security Network (KSN).","Эта секция необязательна. Если она отсутствует в файле конфигурации, KSN не используется.","Используя KSN, вы выражаете согласие на передачу \"Лаборатории Касперского\" данных, которые описаны в файле About data provision.txt. Смотрите также подробную информацию о предоставлении данных.","Путь","KSNSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","UseKSN","ObjectCheckOnDemandTimeoutMs","CacheSizeKb","Пример","Ниже приведен пример элемента KSNSettings.","<KSNSettings>","<UseKSN>0</UseKSN>","<ObjectCheckOnDemandTimeoutMs>10000</ObjectCheckOnDemandTimeoutMs>","<CacheSizeKb>30720</CacheSizeKb>","</KSNSettings>"," KSNSettings ","200603.htm"));
Page.push(new Array("ProxySettings","Ниже перечислены параметры настройки прокси-сервера для Kaspersky Scan Engine. Kaspersky Scan Engine использует эти настройки, если у вас есть доступ к интернету.","Эта секция необязательна. Если она отсутствует в файле конфигурации, Kaspersky Scan Engine не использует прокси-сервер при подключении к интернету.","Путь","ProxySettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","UseProxy","Host","Port","User","Pass","Пример","Ниже приведен пример элемента ProxySettings.","<ProxySettings>","<UseProxy>0</UseProxy>","<Host>myproxy.mycompany.com</Host>","<port>3128</port>","<User>doOTrypDTxpVJxUHYeKQTw==</User>","<pass>8mSHXFix3uL+RP9oNeKDZQ==</pass>","</ProxySettings>"," ProxySettings ","200604.htm"));
Page.push(new Array("UpdateSettings","Следующие параметры определяют настройки обновления Kaspersky Scan Engine.","Эта секция необязательна. Если она отсутствует в файле конфигурации, обновление недоступно.","Путь","UpdateSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","DisableBackup","UpdatePeriodMinutes","UseOnlyCustomSources","UpdateSources","UpdatesCertFile","CertificateConfirmationAction","UseReducedBases","Пример","Ниже приведен пример элемента UpdateSettings.","<UpdateSettings>","<DisableBackup>0</DisableBackup>","<UpdatePeriodMinutes>30</UpdatePeriodMinutes> <!-- 0 = turn update off -->","<UseOnlyCustomSources>0</UseOnlyCustomSources>","<UpdateSources>","<!-- <Source></Source> -->","</UpdateSources>","<UpdatesCertFile></UpdatesCertFile>","<CertificateConfirmationAction>0</CertificateConfirmationAction>","<UseReducedBases>0</UseReducedBases>","</UpdateSettings>"," UpdateSettings ","200605.htm"));
Page.push(new Array("TlsCertificateKeyFile","Указывает путь к файлу закрытого ключа.","Путь","ServerSettings > TlsCertificateKeyFile","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Это может быть как абсолютный, так и относительный путь. Относительный путь рассчитывается относительно бинарного файла kavhttpd.","Этот элемент является обязательным, если элемент ConnectionString содержит протокол https://.","Пример","Ниже приведен пример этого элемента.","<TlsCertificateKeyFile>opt/kaspersky/http_data/https_key.pem</TlsCertificateKeyFile>"," TlsCertificateKeyFile ","200613.htm"));
Page.push(new Array("TlsCertificateFile","Указывает путь к файлу сертификата.","Путь","ServerSettings > TlsCertificateFile","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Это может быть как абсолютный, так и относительный путь. Относительный путь рассчитывается относительно бинарного файла kavhttpd.","Этот элемент является обязательным, если элемент ConnectionString содержит протокол https://.","Пример","Ниже приведен пример этого элемента.","<TlsCertificateFile>opt/kaspersky/http_data/https_cert.crt</TlsCertificateFile>"," TlsCertificateFile ","200614.htm"));
Page.push(new Array("UrlCheckTimeoutMs","Указывает максимальное время, в течение которого Kaspersky Scan Engine ожидает ответа от KSN при выполнении проверки репутации URL-адресов (в миллисекундах).","Путь","KSNSettings > UrlCheckTimeoutMs","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 20000.","Обратите внимание, что этот элемент устанавливает тайм-аут только на проверки репутации в KSN. В этот тайм-аут не входит время, необходимое для отправки запроса на сканирование и получения статуса репутации от KSN. Этот тайм-аут может быть превышен, если KSN обнаружит, что статус репутации просканированного файла — Danger.","Пример","Ниже приведен пример этого элемента.","<UrlCheckTimeoutMs>20000</UrlCheckTimeoutMs>"," UrlCheckTimeoutMs ","200623.htm"));
Page.push(new Array("ObjectCheckOnDemandTimeoutMs","Указывает тайм-аут на ожидание ответа от KSN при проверке репутации файлов (в миллисекундах).","Путь","KSNSettings > ObjectCheckOnDemandTimeoutMs","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 10000.","Обратите внимание, что этот элемент устанавливает тайм-аут только на проверки репутации в KSN. В этот тайм-аут не входит время, необходимое для отправки запроса на сканирование и получения статуса репутации от KSN. Этот тайм-аут может быть превышен, если KSN обнаружит, что статус репутации просканированного файла — Danger.","Пример","Ниже приведен пример этого элемента.","<ObjectCheckOnDemandTimeoutMs>10000</ObjectCheckOnDemandTimeoutMs>"," ObjectCheckOnDemandTimeoutMs ","200624.htm"));
Page.push(new Array("QueueLen","Указывает максимальную длину очереди задач сканирования.","Путь","KAVScanningSettings > QueueLen","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 1024.","Пример","Ниже приведен пример этого элемента.","<QueueLen>1024</QueueLen>"," QueueLen ","200631.htm"));
Page.push(new Array("TempPath","Указывает директорию, в которой находятся файлы, создаваемые во время работы Kaspersky Scan Engine.","Этот элемент является обязательным.","Путь","DirectorySettings > TempPath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть строкой. Путь до директории должен быть абсолютным.","Не удаляйте файлы из этой директории.","Пример","Ниже приведен пример этого элемента.","<TempPath>/home/temp</TempPath>"," TempPath ","200640.htm"));
Page.push(new Array("DisableBackup","Определяет, выключена ли функция резервного копирования базы данных.","Путь","UpdateSettings > DisableBackup","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента DisableBackup","Значение","Описание","0","Резервное копирование антивирусной базы включено.","Это значение по умолчанию.","1","Резервное копирование антивирусной базы выключено.","Пример","Ниже приведен пример этого элемента.","<DisableBackup>0</DisableBackup>"," DisableBackup ","200649.htm"));
Page.push(new Array("UpdatePeriodMinutes","Указывает интервал между автоматическими обновлениями (в минутах).","Путь","UpdateSettings > UpdatePeriodMinutes","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым положительным числом. Максимальное возможное значение: 44640.","Если этот параметр имеет значение 0, Kaspersky Scan Engine не выполняет автоматические обновления.","По умолчанию в файле конфигурации установлено значение 0.","Пример","Ниже приведен пример этого элемента.","<UpdatePeriodMinutes>0</UpdatePeriodMinutes>"," UpdatePeriodMinutes ","200650.htm"));
Page.push(new Array("UseOnlyCustomSources","Указывает, используются ли источники обновления по умолчанию.","Путь","UpdateSettings > UseOnlyCustomSources","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента UseOnlyCustomSources","Значение","Описание","0","Серверы обновлений \"Лаборатории Касперского\" используются вместе с пользовательскими источниками обновлений.","Это значение по умолчанию.","1","Используются только пользовательские источники обновлений.","Пример","Ниже приведен пример этого элемента.","<UseOnlyCustomSources>0</UseOnlyCustomSources>"," UseOnlyCustomSources ","200651.htm"));
Page.push(new Array("UpdatesCertFile","Путь к корневому сертификату в формате PEM, который будет использоваться для загрузки обновлений с пользовательских HTTPS-серверов обновлений.","Параметр необязателен.","Путь","UpdateSettings > UpdatesCertFile","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Вы можете указать абсолютный или относительный путь. Относительный путь определяется относительно расположения исполняемого файла kavhttpd.","Пример","Ниже приведен пример этого элемента.","<UpdatesCertFile></UpdatesCertFile>"," UpdatesCertFile ","200653.htm"));
Page.push(new Array("CertificateConfirmationAction","Указывает действие, которое необходимо предпринять, если сервер обновлений использует ненадежный сертификат.","Параметр необязателен.","Путь","UpdateSettings > CertificateConfirmationAction","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента CertificateConfirmationAction","Значение","Описание","0","Сервер обновлений использовать нельзя.","Это значение по умолчанию.","1","Сервер обновлений по-прежнему должен использоваться.","Пример","Ниже приведен пример этого элемента.","<CertificateConfirmationAction>0</CertificateConfirmationAction>"," CertificateConfirmationAction ","200654.htm"));
Page.push(new Array("UseReducedBases","Указывает параметр, который является одним из условий, определяющих, обновляется ли сокращенный набор баз.","Параметр необязателен.","Путь","UpdateSettings > UseReducedBases","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента UseReducedBases","Значение","Описание","0","Полный набор баз всегда обновляется.","Это значение по умолчанию.","1","Встроенные функции KAV SDK обновляют сокращенный набор баз, если соблюдены все условия обновления сокращенного набора баз. При несоблюдении хотя бы одного из условий принятия обновляется полный набор баз.","Пример","Ниже приведен пример этого элемента.","<UseReducedBases>0</UseReducedBases>"," UseReducedBases ","200655.htm"));
Page.push(new Array("ScannersCount","Указывает количество сканирующих процессов. Вы можете использовать до 256 таких процессов.","Путь","SDKSettings > ScannersCount","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 4.","Пример","Ниже приведен пример этого элемента.","<ScannersCount>4</ScannersCount>"," ScannersCount ","200690.htm"));
Page.push(new Array("ThreadsCount","Задает общее количество сканирующих потоков в каждом процессе. Вы можете использовать до 256 таких потоков.","Путь","SDKSettings > ThreadsCount","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 8.","Пример","Ниже приведен пример этого элемента.","<ThreadsCount>8</ThreadsCount>"," ThreadsCount ","200691.htm"));
Page.push(new Array("QueueLen","Задает размер очереди сканирующей задачи.","Путь","SDKSettings > QueueLen","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: 1024.","Пример","Ниже приведен пример этого элемента.","<QueueLen>1024</QueueLen>"," QueueLen ","200692.htm"));
Page.push(new Array("ScanTimeout","Задает тайм-аут сканирования (в миллисекундах).","Путь","SDKSettings > ScanTimeout","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: 10000 (10 секунд).","Пример","Ниже приведен пример этого элемента.","<ScanTimeout>10000</ScanTimeout> <!-- 0 = unlimited -->"," ScanTimeout ","200693.htm"));
Page.push(new Array("TempPath","Указывает абсолютный путь к директории, где хранятся временные файлы, создаваемые во время работы продукта.","Путь","SDKSettings > TempPath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: //tmp/kavicapd.","Не удаляйте файлы из этой директории.","Пример","Ниже приведен пример этого элемента.","<TempPath>/tmp/kavicapd</TempPath>"," TempPath ","200697.htm"));
Page.push(new Array("UseKSN","Параметр, который содержит значение логического типа, определяющее доступность KSN.","Путь","KSNSettings > UseKSN","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента UseKSN","Значение","Описание","0","KSN выключен.","Это значение по умолчанию.","1","KSN включен. Кроме того, флаг KAV_O_M_COMPOSITE_SCAN_KSN используется автоматически.","Пример","Ниже приведен пример этого элемента.","<UseKSN>0</UseKSN>"," UseKSN ","200698.htm"));
Page.push(new Array("ObjectCheckOnDemandTimeoutMs","Указывает тайм-аут в миллисекундах (мс) для проверки репутации файлов или URL-адресов в облаке KSN.","Путь","KSNSettings > ObjectCheckOnDemandTimeoutMs","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Недопустимое значение: 0.","Значение по умолчанию: 10000 (10 секунд).","Пример","Ниже приведен пример этого элемента.","<ObjectCheckOnDemandTimeoutMs>10000</ObjectCheckOnDemandTimeoutMs>"," ObjectCheckOnDemandTimeoutMs ","200702.htm"));
Page.push(new Array("CacheSizeKb","Указывает максимальный объем кеша статуса KSN в килобайтах (КБ).","Путь","KSNSettings > CacheSizeKb","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Kaspersky Scan Engine использует этот кеш, чтобы хранить информацию о репутации объектов, полученную от KSN.","Значение по умолчанию: 30720.","Пример","Ниже приведен пример этого элемента.","<CacheSizeKb>30720</CacheSizeKb>"," CacheSizeKb ","200703.htm"));
Page.push(new Array("UseProxy","Параметр, который содержит значение логического типа, определяющее, использует ли Kaspersky Scan Engine прокси-сервер при подключении к интернету.","Путь","ProxySettings > UseProxy","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента UseProxy","Значение","Описание","0","Прокси-сервер не используется.","Это значение по умолчанию.","1","Используется прокси-сервер.","Пример","Ниже приведен пример этого элемента.","<UseProxy>0</UseProxy>"," UseProxy ","200704.htm"));
Page.push(new Array("Host","Указывает IP-адрес прокси-сервера (IPv4 или IPv6) или его доменное имя.","Если прокси-сервер используется, этот параметр обязателен.","Путь","ProxySettings > Host","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Не указывайте протокол (http:// или https://) в этом параметре.","Пример","Ниже приведен пример этого элемента.","<Host>myproxy.mycompany.com</Host>"," Host ","200705.htm"));
Page.push(new Array("Port","Указывает номер порта прокси-сервера.","Путь","ProxySettings > Port","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: 3128.","Пример","Ниже приведен пример этого элемента.","<port>3128</port>"," Port ","200706.htm"));
Page.push(new Array("User","Зашифрованное имя пользователя, которое используется для аутентификации на прокси-сервере. Имя пользователя должно быть зашифровано с помощью утилиты kav_encrypt.","Если прокси-сервер используется, этот параметр обязателен.","Путь","ProxySettings > User","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Если параметры User и Pass не заполнены, используется анонимный прокси-сервер.","Пример","Ниже приведен пример этого элемента.","<User>doOTrypDTxpVJxUHYeKQTw==</User>"," User ","200707.htm"));
Page.push(new Array("Pass","Пароль, который используется при аутентификации на прокси-сервере. Значение должно быть зашифровано с помощью утилиты kav_encrypt.","Путь","ProxySettings > Pass","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Если параметры User и Pass не заполнены, используется анонимный прокси-сервер.","Пример","Ниже приведен пример этого элемента.","<pass>8mSHXFix3uL+RP9oNeKDZQ==</pass>"," Pass ","200708.htm"));
Page.push(new Array("DisableBackup","Параметр, который содержит значение логического типа, определяющее, включено ли резервное копирование антивирусных баз.","Путь","UpdateSettings > DisableBackup","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента DisableBackup","Значение","Описание","0","Резервное копирование антивирусной базы включено.","Это значение по умолчанию.","1","Резервное копирование антивирусной базы выключено.","Пример","Ниже приведен пример этого элемента.","<DisableBackup>0</DisableBackup>"," DisableBackup ","200709.htm"));
Page.push(new Array("UpdatePeriodMinutes","Указывает интервал в минутах между автоматическими обновлениями.","Путь","UpdateSettings > UpdatePeriodMinutes","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Максимальное возможное значение: 44640.","Если этот параметр имеет значение 0, Kaspersky Scan Engine не выполняет автоматические обновления.","Значение по умолчанию: 30.","Пример","Ниже приведен пример этого элемента.","<UpdatePeriodMinutes>30</UpdatePeriodMinutes> <!-- 0 = turn update off -->"," UpdatePeriodMinutes ","200710.htm"));
Page.push(new Array("UseOnlyCustomSources","Определяет, являются ли серверы обновлений \"Лаборатории Касперского\" источниками обновлений.","Путь","UpdateSettings > UseOnlyCustomSources","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента UseOnlyCustomSources","Значение","Описание","0","Серверы обновлений \"Лаборатории Касперского\" используются вместе с пользовательскими источниками обновлений.","Это значение по умолчанию.","1","Используются только пользовательские источники обновлений.","Пример","Ниже приведен пример этого элемента.","<UseOnlyCustomSources>0</UseOnlyCustomSources>"," UseOnlyCustomSources ","200711.htm"));
Page.push(new Array("UpdateSources","Содержит пользовательские источники обновлений.","Путь","UpdateSettings > UpdateSources","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","Source\nУказывает пользовательский источник обновлений.\n\nЕсли Kaspersky Scan Engine должен использовать TLS при подключении к пользовательскому источнику обновлений, вы должны указать протокол https:// в адресе этого пользовательского источника обновлений.\n","Пример","Ниже приведен пример этого элемента.","<UpdateSources>","<!-- <Source></Source> -->","</UpdateSources>"," UpdateSources ","200712.htm"));
Page.push(new Array("UpdatesCertFile","Путь к корневому сертификату в формате PEM, который будет использоваться для загрузки обновлений с пользовательских HTTPS-серверов обновлений.","Параметр необязателен.","Путь","UpdateSettings > UpdatesCertFile","Атрибуты","Этот элемент не имеет атрибутов.","Значения","Вы можете указать абсолютный или относительный путь. Относительный путь определяется относительно расположения исполняемого файла kavicapd.","Пример","Ниже приведен пример этого элемента.","<UpdatesCertFile></UpdatesCertFile>"," UpdatesCertFile ","200713.htm"));
Page.push(new Array("CertificateConfirmationAction","Действие, которое необходимо предпринять, если сервер обновлений использует ненадежный сертификат.","Параметр необязателен.","Путь","UpdateSettings > CertificateConfirmationAction","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента CertificateConfirmationAction","Значение","Описание","0","Сервер обновлений использовать нельзя.","Это значение по умолчанию.","1","Сервер обновлений по-прежнему должен использоваться.","Пример","Ниже приведен пример этого элемента.","<CertificateConfirmationAction>0</CertificateConfirmationAction>"," CertificateConfirmationAction ","200714.htm"));
Page.push(new Array("UseReducedBases","Указывает параметр, который является одним из условий, определяющих, обновляется ли сокращенный набор баз.","Параметр необязателен.","Путь","UpdateSettings > UseReducedBases","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента UseReducedBases","Значение","Описание","0","Полный набор баз всегда обновляется.","Это значение по умолчанию.","1","Встроенные функции KAV SDK обновляют сокращенный набор баз, если соблюдены все условия обновления сокращенного набора баз. При несоблюдении хотя бы одного из условий принятия обновляется полный набор баз.","Пример","Ниже приведен пример этого элемента.","<UseReducedBases>0</UseReducedBases>"," UseReducedBases ","200715.htm"));
Page.push(new Array("Port","Указывает номер порта Kaspersky Scan Engine.","Путь","ICAPSettings > Port","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: 1344.","Пример","Ниже приведен пример этого элемента.","<port>1344</port>"," Port ","200716.htm"));
Page.push(new Array("MaxIcapSessionsCount","Указывает максимальное число одновременных подключений к Kaspersky Scan Engine.","Путь","ICAPSettings > MaxIcapSessionsCount","Атрибуты","Этот элемент не имеет атрибутов.","Пример","Ниже приведен пример этого элемента.","<MaxIcapSessionsCount>100</MaxIcapSessionsCount>"," MaxIcapSessionsCount ","200717.htm"));
Page.push(new Array("ScanMaxFileSize","Указывает максимальный размер файла в килобайтах, который Kaspersky Scan Engine может обработать.","Путь","ICAPSettings > ScanMaxFileSize","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Если значение параметра равно 0, Kaspersky Scan Engine сканирует файлы любого размера.","Если указать значение параметра ContentSize, Kaspersky Scan Engine будет использовать его вместо значения ScanMaxFileSize. Это относится как к запросам, сделанным в режиме предварительной проверки, так и к обычным запросам.","Значение по умолчанию: 0.","Пример","Ниже приведен пример этого элемента.","<ScanMaxFileSize>0</ScanMaxFileSize> <!-- 0 = unlimited -->"," ScanMaxFileSize ","200719.htm"));
Page.push(new Array("Allow204","Параметр, который содержит значение логического типа, устанавливающее, посылает ли Kaspersky Scan Engine код состояния HTTP 204 No Content вместо измененных данных на прокси-сервер.","Путь","ICAPSettings > Allow204","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента Allow204","Значение","Описание","0","Kaspersky Scan Engine возвращает данные в неизменном виде.","1","Kaspersky Scan Engine вместо измененных данных возвращает код состояния HTTP 204 No Content.","Пример","Ниже приведен пример этого элемента.","<Allow204>0</Allow204>"," Allow204 ","200720.htm"));
Page.push(new Array("ScanInReqMode","Задает типы содержимого, которые Kaspersky Scan Engine должен сканировать в режиме REQMOD.","Этот элемент необязателен. Если он отсутствует в файле конфигурации, используется значение All.","Путь","ICAPSettings > ScanInReqMode","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента ScanInReqMode","Значение","Описание","Content","Kaspersky Scan Engine сканирует только тело HTTP-сообщения.","URL","Kaspersky Scan Engine сканирует только запрошенный URL-адрес.","All","Kaspersky Scan Engine сканирует и тело HTTP-сообщения, и запрошенный URL-адрес.","Это значение по умолчанию.","Пустое значение.","Kaspersky Scan Engine не сканирует HTTP-сообщения в режиме обработки исходящего трафика (REQMOD).","Пример","Ниже приведен пример этого элемента.","<ScanInReqMode>All</ScanInReqMode>"," ScanInReqMode ","200721.htm"));
Page.push(new Array("ScanInRespMode","Задает типы содержимого, которые Kaspersky Scan Engine должен сканировать в режиме модификации ответов (RESPMOD).","Этот элемент необязателен. Если он отсутствует в файле конфигурации, используется значение All.","Путь","ICAPSettings > ScanInRespMode","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента ScanInRespMode","Значение","Описание","Content","Kaspersky Scan Engine сканирует только тело HTTP-сообщения.","URL","Kaspersky Scan Engine сканирует только запрошенный URL-адрес.","All","Kaspersky Scan Engine сканирует и тело HTTP-сообщения, и запрошенный URL-адрес.","Это значение по умолчанию.","Пустое значение.","Kaspersky Scan Engine не сканирует HTTP-сообщения в режиме обработки входящего трафика (RESPMOD).","Пример","Ниже приведен пример этого элемента.","<ScanInRespMode>All</ScanInRespMode>"," ScanInRespMode ","200722.htm"));
Page.push(new Array("HTTPClientIpICAPHeader","Задает имя поля заголовка, в котором указан IP-адрес HTTP-клиента.","Имя поля должно состоять из символов, разрешенных для имен полей заголовков в соответствии с RFC 7230.","Этот элемент необязателен.","Путь","ICAPSettings > HTTPClientIpICAPHeader","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Параметр может иметь пустое значение.","Пример","Ниже приведен пример этого элемента.","<HTTPClientIpICAPHeader>X-Client-IP</HTTPClientIpICAPHeader>"," HTTPClientIpICAPHeader ","200726.htm"));
Page.push(new Array("HTTPUserNameICAPHeader","Задает имя поля заголовка, в котором указано имя HTTP-клиента.","Имя поля должно состоять из символов, разрешенных для имен полей заголовка в соответствии с RFC 7230.","Этот элемент необязателен.","Путь","ICAPSettings > HTTPUserNameICAPHeader","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Параметр может иметь пустое значение.","Пример","Ниже приведен пример этого элемента.","<HTTPUserNameICAPHeader>X-Client-Username</HTTPUserNameICAPHeader>"," HTTPUserNameICAPHeader ","200727.htm"));
Page.push(new Array("Exclusions","Задает правила для режима предварительной проверки объекта. Эта функция позволяет ICAP-клиенту отправлять ICAP-серверу запросы на предварительный просмотр, после чего ICAP-сервер может не сканировать объекты, которые заведомо не являются вредоносными.","Если указан хотя бы один из этих параметров, ICAP-плагин будет обрабатывать запросы в режиме предварительной проверки. Чтобы разрешить прокси-серверу отправлять запросы в этом режиме, измените его параметры соответствующим образом.","Обратите внимание, что, если включить режим предварительной проверки в плагине ICAP, но не на прокси-сервере, Kaspersky Scan Engine будет обрабатывать HTTP-запросы, как если бы режим предварительной проверки не был включен.","Путь","ICAPSettings > Exclusions","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","ContentSize","ContentType","RequestURL","Если для объекта выполняется хотя бы одно из описанных правил, ICAP-плагин возвращает код 204 независимо от значения параметра Allow204 файла kavicapd.xml. Если ни одно из правил не выполняется, ICAP-плагин возвращает код 100 и ждет, когда ICAP-клиент отправит объект.","Пример","Ниже приведен пример этого элемента.","<Exclusions>","<ContentSize>2048</ContentSize>","<ContentType>video/mp4</ContentType>","<RequestURL>example.com</RequestURL>","</Exclusions>"," Exclusions ","200729.htm"));
Page.push(new Array("LoggingConfigFilePath","Задает путь к файлу конфигурации логирования.","Путь","ICAPSettings > LoggingConfigFilePath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Вы можете использовать файл конфигурации логирования, расположенный в директории бинарного файла kavicapd, или поместить этот файл в любую другую директорию:","Чтобы использовать файл логирования, расположенный в директории бинарного файла kavicapd, оставьте значение элемента LoggingConfigFilePath пустым.","Чтобы поместить файл конфигурации логирования в любую другую директорию, укажите путь к этому файлу. Обратите внимание, что служба интерпретирует это значение как путь к файлу, а не как путь к директории. Также вы можете указать относительный путь к директории, в которой находится исполняемый файл kavicapd.","Пример","Ниже приведен пример этого элемента.","<!-- The path to the logging configuration file. Only this file will be used as the ICAP logging configuration file. If the LoggingConfigFilePath element has an empty value, the icapdkavlog.conf file located in the kavicapd binary file directory is used. -->","<LoggingConfigFilePath></LoggingConfigFilePath>"," LoggingConfigFilePath ","200730.htm"));
Page.push(new Array("ContentSize","Правило исключения для размера передаваемого объекта (КБ).","Вы можете установить этот параметр только один раз. Вы можете не указывать этот параметр.","Путь","ICAPSettings > Exclusions > ContentSize","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Если заголовок Content-Length присутствует в HTTP-запросе, ContentSize сравнивается с его значением. В противном случае ContentSize сравнивается с реальным размером объекта. Если какое-либо из этих значений больше или равно значению ContentSize, ICAP-плагин не проверяет этот объект. Это относится как к запросам, сделанным в режиме предварительной проверки, так и к обычным запросам.","Если указать значение параметра ContentSize, Kaspersky Scan Engine будет использовать его вместо значения ScanMaxFileSize.","Пример","Ниже приведен пример этого элемента.","<ContentSize>2048</ContentSize>"," ContentSize ","200813.htm"));
Page.push(new Array("ContentType","Правило исключения для типа объекта, который указан в поле Content-Type заголовка HTTP.","Вы можете устанавливать этот параметр более одного раза. ICAP-плагин учтет все указанные элементы. Вы можете не указывать этот параметр.","Путь","ICAPSettings > Exclusions > ContentType","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Если поле Content-Type содержит значение, которое указано в ContentType, ICAP-плагин не сканирует объект.","Пример","Ниже приведен пример этого элемента.","<ContentType>video/mp4</ContentType>"," ContentType ","200814.htm"));
Page.push(new Array("RequestURL","URL-адрес, который нужно пропустить.","Вы можете устанавливать этот параметр более одного раза. ICAP-плагин учтет все указанные элементы.","Путь","ICAPSettings > Exclusions > RequestURL","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Указанный URL-адрес не должен включать компоненты схемы, запроса и фрагмента. Если запрошенный URL-адрес совпадает хотя бы с одним из значений элемента RequestURL, ICAP-плагин не проверяет этот URL-адрес. Перед сравнением запрошенного веб-адреса со значением правила исключения из параметра RequestURL, ICAP-плагин применяет правила нормализации к этому веб-адресу.","Параметр RequestURL может содержать маски.","Вы можете использовать подстановочный знак * для обозначения любой последовательности символов полного имени домена, начиная с третьего уровня и выше. Например, *.domain.com. Это значение включает все поддомены domain.com.","Подстановочные знаки звездочки (*) и вопросительного знака (?) можно использовать в компоненте пути URL-адреса для обозначения любой последовательности символов или одного символа соответственно. Например, domain.com/test/page/*.","Пример","Ниже приведен пример этого элемента.","<RequestURL>example.com</RequestURL>"," RequestURL ","200815.htm"));
Page.push(new Array("ServerSettings","Указывает настройки сервера для KAV HTTPD.","Путь","ServerSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","ConnectionString","MaxIncomingConnectionsNum","MaxHTTPSessionsNum","MaxTCPFileSize","SessionTimeout","Flags","TlsCertificateKeyFile","TlsCertificateFile","CORS","KeepAliveSettings","AuthSettings","Пример","Ниже приведен пример элемента ServerSettings.","<ServerSettings>","<ConnectionString>/tmp/.kavhttpd</ConnectionString>","<MaxIncomingConnectionsNum>100</MaxIncomingConnectionsNum>","<MaxHTTPSessionsNum>50</MaxHTTPSessionsNum>","<MaxTCPFileSize>100</MaxTCPFileSize>","<SessionTimeout>1000</SessionTimeout>","<Flags>KAV_SHT_ENGINE_KSN | KAV_SHT_ENGINE_APUF</Flags>","<TlsCertificateKeyFile>opt/kaspersky/http_data/https_key.pem</TlsCertificateKeyFile>","<TlsCertificateFile>opt/kaspersky/http_data/https_cert.crt</TlsCertificateFile>","<CORS>","<AccessControlAllowOrigin>http://example.com</AccessControlAllowOrigin>","<AccessControlAllowOrigin>https://www.kaspersky.com</AccessControlAllowOrigin>","</CORS>","<KeepAliveSettings>","<Enabled>1</Enabled>","<TimeoutMs>5000</TimeoutMs>","<MaxRequests>1000</MaxRequests>","</KeepAliveSettings>","<AuthSettings>","<UseAccessToken>0</UseAccessToken> <!--Enable or disable API-token authentication -->","<AuthRequestField>Authorization</AuthRequestField>","<UseBearerAuthScheme>1</UseBearerAuthScheme>","<AccessTokens>","<Token>","<Name>Unlimited key</Name>","<Value>SldYQTUyOUNVMnE3VWR2N3Izamk2QkVNc2hhLTV5dTBLcVUzeXZLdGYtNkkrVFUyQUVRQUNLQUFCSWdwRUlJTQ==</Value>","<Description>Kaspersky Scan Engine Clients. Full access scope</Description>","<Enabled>1</Enabled>","</Token>","<Token>","<Name>Key for URL-scanning</Name>","<Value>XUmCkYURUdWQldFGIT3TlEQUQQwkBy2LLNaNMVtrkSQUR2kSNUZV=NT2zLRzQJycVW5VNhUVOdLVcUd3YeVFnT=h</Value>","<Description>Server access key. Only URL-scanning</Description>","<Enabled>0</Enabled>","</Token>","</AccessTokens>","</AuthSettings>","</ServerSettings>"," ServerSettings ","201021.htm"));
Page.push(new Array("KSNSettings","Указывает параметры KSN.","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","UrlCheckTimeoutMs","ObjectCheckOnDemandTimeoutMs","CacheSizeKb","Пример","Ниже приведен пример элемента KSNSettings.","<KSNSettings>","<UrlCheckTimeoutMs>20000</UrlCheckTimeoutMs>","<ObjectCheckOnDemandTimeoutMs>10000</ObjectCheckOnDemandTimeoutMs>","<CacheSizeKb>30720</CacheSizeKb>","</KSNSettings>"," KSNSettings ","201022.htm"));
Page.push(new Array("KAVScanningSettings","Указывает настройки сканирования для KAV SDK, который является частью Kaspersky Scan Engine.","Путь","KAVScanningSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","ScannersCount","ThreadsCount","QueueLen","Flags","Mode","MaxArchivesScanningDepth","Пример","Ниже приведен пример элемента KAVScanningSettings.","<KAVScanningSettings>","<ScannersCount>4</ScannersCount>","<ThreadsCount>8</ThreadsCount>","<QueueLen>1024</QueueLen>","<Flags>KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILBASES | KAV_O_M_MAILPLAIN | KAV_O_M_HEURISTIC_LEVEL_DETAIL</Flags>","<Mode>KAV_SKIP</Mode>","<MaxArchivesScanningDepth>0</MaxArchivesScanningDepth>","</KAVScanningSettings>"," KAVScanningSettings ","201023.htm"));
Page.push(new Array("DirectorySettings","Указывает настройки директорий для KAV SDK, который является частью Kaspersky Scan Engine.","Путь","DirectorySettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","BasesPath ","TempPath","LicensePath","LicensingMode","ScanningPaths","Пример","Ниже приведен пример элемента DirectorySettings.","<DirectorySettings>","<BasesPath>/home/bases</BasesPath>","<TempPath>/home/temp</TempPath>","<LicensePath>/home/license</LicensePath>","<LicensingMode>1</LicensingMode>","<ScanningPaths>","<ScanningPath></ScanningPath>","</ScanningPaths>","</DirectorySettings>"," DirectorySettings ","201024.htm"));
Page.push(new Array("UpdateSettings","Следующие параметры определяют настройки обновления Kaspersky Scan Engine.","Путь","UpdateSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","DisableBackup","UpdatePeriodMinutes","UseOnlyCustomSources","UpdateSources","UpdatesCertFile","CertificateConfirmationAction","UseReducedBases","Пример","Ниже приведен пример элемента UpdateSettings.","<UpdateSettings>","<DisableBackup>0</DisableBackup>","<UpdatePeriodMinutes>0</UpdatePeriodMinutes>","<UseOnlyCustomSources>0</UseOnlyCustomSources>","<UpdateSources>","<Source>[update source]</Source>","</UpdateSources>","<UpdatesCertFile></UpdatesCertFile>","<CertificateConfirmationAction>0</CertificateConfirmationAction>","<UseReducedBases>0</UseReducedBases>","</UpdateSettings>"," UpdateSettings ","201025.htm"));
Page.push(new Array("ConnectionString","Указывает IP-адрес и порт для Kaspersky Scan Engine посредством протокола (http:// или https://) или путь к UNIX-сокету, который используется Kaspersky Scan Engine. Значение этого элемента должно быть строкой.","Если вы хотите использовать протокол HTTPS, элементы TlsCertificateKeyFile и TlsCertificateFile являются обязательными.","Путь","ServerSettings > ConnectionString","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Обязательный параметр. Значение по умолчанию: /tmp/.kavhttpd в Linux и 127.0.0.1:9999 в Windows. Можно указать IP-адрес и порт для TCP-соединения в следующем формате: protocol://ip_addr:port.","Пример","Ниже приведен пример этого элемента.","<ConnectionString>/tmp/.kavhttpd</ConnectionString>"," ConnectionString ","201026.htm"));
Page.push(new Array("MaxIncomingConnectionsNum","Указывает максимальное количество ожидающих TCP-соединений с Kaspersky Scan Engine в режиме HTTP. Дополнительные соединения могут быть прерваны.","Путь","ServerSettings > MaxIncomingConnectionsNum","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 100.","Смотрите также примеры настройки очереди подключений в режиме HTTP.","Пример","Ниже приведен пример этого элемента.","<MaxIncomingConnectionsNum>100</MaxIncomingConnectionsNum>"," MaxIncomingConnectionsNum ","201027.htm"));
Page.push(new Array("MaxHTTPSessionsNum","Указывает максимальное количество активных TCP-соединений, которые Kaspersky Scan Engine может поддерживать одновременно.","Не рекомендуется указывать значение, превышающее количество TCP-соединений, которые ваш HTTP-клиент может одновременно поддерживать с Kaspersky Scan Engine.","Путь","ServerSettings > MaxHTTPSessionsNum","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым положительным числом. Значение по умолчанию: 10. Если вы установите MaxHTTPSessionsNum равным 0, будет использовано значение по умолчанию.","Смотрите также примеры настройки очереди подключений в режиме HTTP.","Пример","Ниже приведен пример этого элемента.","<MaxHTTPSessionsNum>50</MaxHTTPSessionsNum>"," MaxHTTPSessionsNum ","201028.htm"));
Page.push(new Array("MaxTCPFileSize","Указывает максимальный допустимый размер передаваемого в Kaspersky Scan Engine заголовка и тела HTTP-сообщения.","Путь","ServerSettings > MaxTCPFileSize","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым положительным числом. Рекомендуется выделять по крайней мере 100 КБ для заголовков сообщения.","Значение по умолчанию: 104857600 (100 МБ). Если вы установите MaxTCPFileSize равным 0, будет использовано значение по умолчанию.","Пример","Ниже приведен пример этого элемента.","<MaxTCPFileSize>100</MaxTCPFileSize>"," MaxTCPFileSize ","201029.htm"));
Page.push(new Array("SessionTimeout","Указывает тайм-аут на обработку запроса и отправку ответа (в миллисекундах).","Путь","ServerSettings > SessionTimeout","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым положительным числом. Значение по умолчанию: 1000. Если вы установите SessionTimeout равным 0, тайм-аут ожидания для обработки запроса и отправки ответа не ограничен. Смотрите также подробную информацию о настройке тайм-аута сеанса.","Пример","Ниже приведен пример этого элемента.","<SessionTimeout>1000</SessionTimeout>"," SessionTimeout ","201030.htm"));
Page.push(new Array("Flags","Указывает параметры инициализации Kaspersky Scan Engine. Параметры инициализации определяются комбинацией флагов, разделенных вертикальными чертами (|).","Путь","ServerSettings > Flags","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть строкой.","Возможные значения:","KAV_SHT_ENGINE_KLAV\nВключает антивирусный движок KLAV.\n\nЕсли вы указали этот флаг, указывать флаг KAV_SHT_ENGINE_KLAVEMU не обязательно. Движок KLAV автоматически включает эмулятор KLAV.\n","KAV_SHT_ENGINE_KLAVEMU\nВключает глубинный эвристический анализ (эмулятор KLAV). Укажите этот флаг, если вы хотите использовать эвристику.\n","KAV_SHT_ENGINE_WMUF\nВключает обнаружение вредоносных веб-адресов.\n","KAV_SHT_ENGINE_APUF\nВключает обнаружение фишинговых веб-адресов.\n","KAV_SHT_ENGINE_KSN\nВключает проверку репутации файлов и URL-адресов в Kaspersky Security Network (KSN).\n\nПеред установкой флага KAV_SHT_ENGINE_KSN убедитесь, что ваш файл ключа позволяет использовать эту функцию и что вы приняли условия Пользовательского соглашения для KSN.\n","KAV_SHT_ENGINE_STATISTIC_MAIL\nВключает передачу статистики в KSN в операционной системе Linux.\n\nПрежде чем указывать флаг KAV_SHT_ENGINE_STATISTIC_MAIL, убедитесь, что ваш файл ключа позволяет вам использовать эти функции.\n","KAV_SHT_ENGINE_STATISTIC\nВключает передачу статистики в KSN в операционной системе Windows.\n\nПрежде чем указывать флаг KAV_SHT_ENGINE_STATISTIC, убедитесь, что ваш файл ключа позволяет вам использовать эти функции.\n","Обратите внимание, что, указывая флаг KAV_SHT_ENGINE_KSN, KAV_SHT_ENGINE_STATISTIC_MAIL или KAV_SHT_ENGINE_STATISTIC, вы соглашаетесь передавать данные, описанные в соответствующем файле About data provision*.txt, в \"Лабораторию Касперского\". Смотрите также подробную информацию о предоставлении данных и статистику, отправленную в KSN.","Пример","Ниже приведен пример этого элемента.","<Flags>KAV_SHT_ENGINE_KSN | KAV_SHT_ENGINE_APUF</Flags>"," Flags ","201031.htm"));
Page.push(new Array("CacheSizeKb","Указывает максимальный размер кеша статуса KSN (в килобайтах). Kaspersky Scan Engine использует этот кеш, чтобы хранить информацию о репутации объектов, полученную от KSN.","Путь","KSNSettings > CacheSizeKb","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым положительным числом. Если значение параметра равно 0, кеш статуса KSN не используется. Максимальное возможное значение: 262143.","Значение по умолчанию: 30720.","Пример","Ниже приведен пример этого элемента.","<CacheSizeKb>30720</CacheSizeKb>"," CacheSizeKb ","201036.htm"));
Page.push(new Array("ScannersCount","Указывает количество сканирующих процессов. Вы можете использовать до 256 таких процессов.","Путь","KAVScanningSettings > ScannersCount","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 4.","Пример","Ниже приведен пример этого элемента.","<ScannersCount>4</ScannersCount>"," ScannersCount ","201037.htm"));
Page.push(new Array("ThreadsCount","Указывает количество одновременно работающих сканирующих программных потоков. Вы можете использовать до 256 таких потоков.","Путь","KAVScanningSettings > ThreadsCount","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым числом и не может равняться 0. Значение по умолчанию: 8.","Пример","Ниже приведен пример этого элемента.","<ThreadsCount>8</ThreadsCount>"," ThreadsCount ","201038.htm"));
Page.push(new Array("Flags","Указывает режим сканирования.","Путь","KAVScanningSettings > Flags","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Режимы сканирования определяются комбинацией флагов, разделенных вертикальными чертами (|). Значение этого элемента должно быть строкой.","Возможные значения:","KAV_O_M_PACKED\nВключает сканирование упакованных исполняемых файлов.\n","KAV_O_M_ARCHIVED\nВключает сканирование архивов.\n","KAV_O_M_MAILBASES\nВключает сканирование почтовых баз.\n","KAV_O_M_MAILPLAIN\nВключает сканирование электронной почты.\n","KAV_O_M_HEURISTIC_LEVEL_SHALLOW\nУстанавливает уровень сканирования расширенного эвристического анализатора в значение shallow (уровень Low в графическом интерфейсе пользователя).\n","KAV_O_M_HEURISTIC_LEVEL_MEDIUM\nУстанавливает уровень сканирования расширенного эвристического анализатора в значение medium (уровень Medium в графическом интерфейсе пользователя).\n","KAV_O_M_HEURISTIC_LEVEL_DETAIL\nУстанавливает уровень сканирования расширенного эвристического анализатора в значение detailed (уровень High в графическом интерфейсе пользователя).\n","KAV_O_M_MSOFFICE_MACRO\nВключает обнаружение макросов в файлах Microsoft Office.\n","Элемент Flags может быть пустым. В этом случае используется значение 0.","Значение по умолчанию: KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILBASES | KAV_O_M_MAILPLAIN | KAV_O_M_HEURISTIC_LEVEL_DETAIL.","Пример","Ниже приведен пример этого элемента.","<Flags>KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILBASES | KAV_O_M_MAILPLAIN | KAV_O_M_HEURISTIC_LEVEL_DETAIL</Flags>"," Flags ","201040.htm"));
Page.push(new Array("Mode","Указывает режим очистки.","Путь","KAVScanningSettings > Mode","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть строкой. Обязательный параметр.","Возможные значения:","KAV_SKIP\nЕсли во время сканирования объекта Kaspersky Scan Engine найдет угрозу, рекламную программу или легальную программу, которая может быть использована злоумышленником для нанесения вреда вашим данным, он не предпримет никаких действий над этим объектом. Зараженный объект будет пропущен.\n\nУкажите это значение, если вы хотите использовать режим сканирования памяти.\n","KAV_DELETE\nЕсли во время сканирования объекта Kaspersky Scan Engine найдет угрозу, рекламную программу или легальную программу, которая может быть использована злоумышленником для нанесения вреда вашим данным, он попробует удалить этот объект. Если удаление невозможно, Kaspersky Scan Engine перейдет к сканированию следующего объекта.\n","KAV_CLEAN_DELETE\nЕсли во время сканирования объекта Kaspersky Scan Engine найдет угрозу, рекламную программу или легальную программу, которая может быть использована злоумышленником для нанесения вреда вашим данным, он попробует вылечить этот объект. Если лечение невозможно, Kaspersky Scan Engine попробует удалить объект. Если удаление невозможно, Kaspersky Scan Engine перейдет к сканированию следующего объекта.\n\nВышеуказанные действия будут выполнены только в том случае, если Kaspersky Anti-Virus Engine обнаружит угрозу при обработке запроса scanfile. Во всех остальных случаях Kaspersky Scan Engine отправляет уведомление только в том случае, если указанные действия могут быть применены к обнаруженному объекту.\n","KAV_CLEAN_SKIP\nЕсли во время сканирования объекта Kaspersky Scan Engine найдет угрозу, рекламную программу или легальную программу, которая может быть использована злоумышленником для нанесения вреда вашим данным, он попробует вылечить этот объект. Если лечение невозможно, Kaspersky Scan Engine перейдет к сканированию следующего объекта.\n","Значение по умолчанию: KAV_SKIP.","Пример","Ниже приведен пример этого элемента.","<Mode>KAV_SKIP</Mode>"," Mode ","201041.htm"));
Page.push(new Array("BasesPath","Директория, в которой находится база данных.","Этот элемент является обязательным.","Путь","DirectorySettings > BasesPath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть строкой.","Обратите внимание, что в системах Windows необходимо указывать полный путь к директории, в которой расположена антивирусная база.","Пример","Ниже приведен пример этого элемента.","<BasesPath>/home/bases</BasesPath>"," BasesPath ","201042.htm"));
Page.push(new Array("LicensePath","Указывает директорию, в которой хранятся файлы с ID приложения, лицензией и ключом.","Этот элемент является обязательным.","Путь","DirectorySettings > LicensePath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть строкой. Kaspersky Scan Engine ищет эти файлы в следующих директориях:","Директория, указанная в LicensePath.","Директория, содержащая исполняемый файл kavhttpd.","Директория %service_dir%/ppl. Только для систем Linux.","Пример","Ниже приведен пример этого элемента.","<LicensePath>/home/license</LicensePath>"," LicensePath ","201044.htm"));
Page.push(new Array("LicensingMode","Указывает режим лицензирования, используемый в Kaspersky Scan Engine.","Путь","DirectorySettings > LicensingMode","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Возможные значения:","1 – Режим лицензирования офлайн.","2 – Режим лицензирования онлайн.","Значение по умолчанию: 1.","Пример","Ниже приведен пример этого элемента.","<LicensingMode>1</LicensingMode>"," LicensingMode ","201045.htm"));
Page.push(new Array("HTTPProxy","Указывает параметры прокси.","Путь","HTTPProxy","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","url – это адрес прокси. Значение этого элемента должно быть строкой.\nАдрес прокси-сервера может быть IPv4-адресом, IPv6-адресом или доменным именем. Не указывайте протокол (http:// или https://) в этом параметре. \nЕсли UseHTTPProxy имеет значение 1, этот параметр является обязательным. ","port – это порт прокси. Значение этого элемента должно быть целым числом и не может равняться 0.\nЗначение по умолчанию: 3128. ","user – это зашифрованное имя пользователя, используемое для аутентификации на прокси-сервере. Имя пользователя должно быть зашифровано с помощью утилиты kav_encrypt. Значение этого элемента должно быть строкой.\nЕсли UseHTTPProxy имеет значение 1, этот параметр является обязательным. ","pass – это зашифрованный пароль, который используется при аутентификации на прокси-сервере. Пароль должен быть зашифрован с помощью утилиты kav_encrypt. Значение этого элемента должно быть строкой.\nЕсли UseHTTPProxy имеет значение 1, этот параметр является обязательным. \n ","Пример","Ниже приведен пример элемента HTTPProxy.","<HTTPProxy>","<url>myproxy.mycompany.com</url>","<port>3128</port>","<User>doOTrypDTxpVJxUHYeKQTw==</User>","<pass>8mSHXFix3uL+RP9oNeKDZQ==</pass>","</HTTPProxy>"," HTTPProxy ","201047.htm"));
Page.push(new Array("UpdateSources","Содержит пользовательские источники обновлений.","Путь","UpdateSettings > UpdateSources","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","Source\nУказывает пользовательский источник обновлений. Значение этого элемента должно быть строкой.\n\nКаждый источник обновления указан внутри отдельного элемента <Source>. См. пример указания пользовательских источников обновления базы.\n\nЕсли Kaspersky Scan Engine должен использовать TLS при подключении к пользовательскому источнику обновлений, вы должны указать протокол https:// в адресе этого пользовательского источника обновлений.\n","Пример","Ниже приведен пример этого элемента.","<UpdateSources>","<Source>[update source]</Source>","</UpdateSources>"," UpdateSources ","201051.htm"));
Page.push(new Array("FormatRecognizerSettings","Указывает настройки Format Recognizer.","Путь","FormatRecognizerSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","FormatsToSkipScanning\nУказывает, какие форматы файлов решение Kaspersky Scan Engine не должно сканировать в режиме HTTP.\n\nЧтобы выключить функцию пропуска форматов, удалите элемент FormatRecognizerSettings из файла конфигурации или оставьте список FormatsToSkipScanning пустым.\n","Пример","Ниже приведен пример элемента FormatRecognizerSettings.","<FormatRecognizerSettings>","<FormatsToSkipScanning>","<KAV_FF_GENERAL_TXT/>","<KAV_FF_GENERAL_CSV/>","<KAV_FF_AUDIO_WMA/>","</FormatsToSkipScanning>","</FormatRecognizerSettings>"," FormatRecognizerSettings ","201055.htm"));
Page.push(new Array("ScanningPaths","Содержит пути к местам расположения, в которых разрешено сканирование, когда HTTP-клиент отправляет запросы на сканирование через TCP-сокет с удаленного компьютера. Сканирование в других местах расположения запрещено. Эти пути находятся в файловой системе компьютера, на котором установлен сервер Kaspersky Scan Engine. Ограничение области сканирования предотвращает проверку всей файловой системы сервера Kaspersky Scan Engine по команде извне.","Kaspersky Scan Engine по умолчанию проверяет объекты в режиме KAV_SKIP, что означает, что Kaspersky Scan Engine не добавляет и не удаляет объекты в директориях, указанных в ScanningPath. HTTP-клиент должен отправить объекты для сканирования, а затем удалить их после сканирования.","Если Kaspersky Scan Engine сканирует объекты в режиме KAV_DELETE, KAV_CLEAN_DELETE или KAV_CLEAN_SKIP, иногда директория, указанная в ScanningPaths, должна иметь права на запись с правами root.","Путь","DirectorySettings > ScanningPaths","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","ScanningPath","Указывает расположение, где разрешено сканирование по TCP-сокету в режиме сканирования файлов.","Не рекомендуется использовать ссылки в качестве путей из соображений безопасности. Вместо этого используйте абсолютные пути.","Возможные значения:","Абсолютный путь до директории.\n\n\nПозволяет сканировать файлы, расположенные внутри этой директории и всех ее поддиректорий. \n\n\nДиректория должна быть расположена на том же компьютере, что и Kaspersky Scan Engine, или на удаленном жестком диске, который смонтирован на этом компьютере. \n\n\nПуть должен начинаться с корневой директории файловой системы компьютера, на котором установлен Kaspersky Scan Engine. \n\n\nСлужба kavhttpd должна иметь права на чтение файлов в этой директории и всех ее поддиректориях. ","Абсолютный путь до файла.\n\n\nРазрешает сканирование указанного файла. \n\n\nФайл должен быть расположен на том же компьютере, что и Kaspersky Scan Engine, или на удаленном жестком диске, который смонтирован на этом компьютере. \n\n\nПуть должен начинаться с корневой директории файловой системы компьютера, на котором установлен Kaspersky Scan Engine. \n\n\nСлужба kavhttpd должна иметь права на чтение этого файла. ","/ (косая черта с наклоном вправо).\n\n\nРазрешает сканирование всех файлов. \n\n\nТолько для систем Linux. ","Каждое значение должно быть указано внутри отдельного элемента <ScanningPath>.","Пример","Ниже приведен пример этого элемента.","<ScanningPaths>","<ScanningPath></ScanningPath>","</ScanningPaths>"," ScanningPaths ","201076.htm"));
Page.push(new Array("SDKSettings","Указывает параметры KAV SDK.","Путь","SDKSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","ScannersCount","ThreadsCount","QueueLen","ScanTimeout","LicensePath","BasesPath","TempPath","ScanningMode","LicensingMode","MaxArchivesScanningDepth","Пример","Ниже приведен пример элемента SDKSettings.","<SDKSettings>","<ScannersCount>4</ScannersCount>","<ThreadsCount>8</ThreadsCount>","<QueueLen>1024</QueueLen>","<ScanTimeout>10000</ScanTimeout> <!-- 0 = unlimited -->","<LicensePath>/opt/kaspersky/ScanEngine/bin</LicensePath>","<BasesPath>/opt/kaspersky/ScanEngine/bin/bases</BasesPath>","<TempPath>/tmp/kavicapd</TempPath>","<LicensingMode>1</LicensingMode><!-- 1 = offline licensing mode; 2 - online licensing mode -->","<ScanningMode>KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILPLAIN | KAV_O_M_MAILBASES | KAV_O_M_HEURISTIC_LEVEL_SHALLOW</ScanningMode>","<MaxArchivesScanningDepth>0</MaxArchivesScanningDepth>","</SDKSettings>"," SDKSettings ","201103.htm"));
Page.push(new Array("LicensePath","Указывает абсолютный путь к директории, где хранятся файлы с ID приложения, лицензией и ключом.","Путь","SDKSettings > LicensePath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть строкой. Kaspersky Scan Engine ищет эти файлы в следующих директориях:","Директория, указанная в LicensePath.","Директория, содержащая исполняемый файл kavicapd.","Директория %service_dir%/ppl.","Пример","Ниже приведен пример этого элемента.","<LicensePath>/opt/kaspersky/ScanEngine/bin</LicensePath>"," LicensePath ","201118.htm"));
Page.push(new Array("BasesPath","Указывает абсолютный путь к директории, в которой расположены антивирусные базы.","Путь","SDKSettings > BasesPath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: /opt/kaspersky/ScanEngine/bin/bases.","Пример","Ниже приведен пример этого элемента.","<BasesPath>/opt/kaspersky/ScanEngine/bin/bases</BasesPath>"," BasesPath ","201120.htm"));
Page.push(new Array("ScanningMode","Указывает режим сканирования файла.","Путь","SDKSettings > ScanningMode","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Режим сканирования определяется комбинацией флагов, разделенных вертикальными чертами (|).","Этот элемент имеет следующие возможные значения.","Возможные значения элемента ScanningMode","Значение","Описание","KAV_O_M_PACKED","Включает сканирование упакованных исполняемых файлов.","KAV_O_M_ARCHIVED","Включает сканирование архивов.","KAV_O_M_MAILBASES","Сканирует файлы, которые содержат почтовые базы.","KAV_O_M_MAILPLAIN","Включает сканирование электронной почты.","KAV_O_M_HEURISTIC_LEVEL_SHALLOW","Устанавливает уровень сканирования расширенного эвристического анализатора в значение shallow (уровень Low в графическом интерфейсе пользователя).","KAV_O_M_HEURISTIC_LEVEL_MEDIUM","Устанавливает уровень сканирования расширенного эвристического анализатора в значение medium (уровень Medium в графическом интерфейсе пользователя).","KAV_O_M_HEURISTIC_LEVEL_DETAIL","Устанавливает уровень сканирования расширенного эвристического анализатора в значение detail (уровень High в графическом интерфейсе пользователя).","KAV_O_M_MSOFFICE_MACRO","Блокирует безопасные файлы документов Microsoft Office, содержащих макросы, и уведомляет пользователя.","KAV_O_M_PHISHING","Включает защиту от фишинга.","Значение по умолчанию: KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILPLAIN | KAV_O_M_MAILBASES | KAV_O_M_HEURISTIC_LEVEL_SHALLOW.","Пример","Ниже приведен пример этого элемента.","<ScanningMode>KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILPLAIN | KAV_O_M_MAILBASES | KAV_O_M_HEURISTIC_LEVEL_SHALLOW</ScanningMode>"," ScanningMode ","201123.htm"));
Page.push(new Array("LicensingMode","Указывает режим лицензирования, используемый в Kaspersky Scan Engine.","Путь","SDKSettings > LicensingMode","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Возможные значения:","1 – Режим лицензирования офлайн.","2 – Режим лицензирования онлайн.","Значение по умолчанию: 1."," LicensingMode ","201124.htm"));
Page.push(new Array("ICAPSettings","Указывает параметры ICAP для Kaspersky Scan Engine.","Путь","ICAPSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","Port","ReqModeAddress","RespModeAddress","MaxIcapSessionsCount","RAMUsageLimit","ScanMaxFileSize","Allow204","KeepAliveSettings","RequestingICAPHeaders","HTTPClientIpICAPHeader","HTTPUserNameICAPHeader","VirusNameICAPHeader","DatabaseVersionICAPHeader","SendInfectionFoundICAPHeader","SendResponseDescICAPHeader","SendResponseInfoICAPHeader","SendViolationsFoundICAPHeader","ScanInReqMode","ScanInRespMode","RulesFilePath","CmdPath","ResponsesPath","TransferBeforeScanEnding","Exclusions","USR1SignalAction","USR2SignalAction","LoggingConfigFilePath","Пример","Ниже приведен пример элемента ICAPSettings.","<ICAPSettings>","<port>1344</port>","<ReqModeAddress>req</ReqModeAddress>","<RespModeAddress>resp</RespModeAddress>","<MaxIcapSessionsCount>100</MaxIcapSessionsCount>","<ScanMaxFileSize>0</ScanMaxFileSize> <!-- 0 = unlimited -->","<RAMUsageLimit>0</RAMUsageLimit> <!-- 0 = unlimited -->","<Allow204>0</Allow204>","<KeepAliveSettings><!-- Support for processing multiple requests during one connection -->","<Enabled>1</Enabled>","<TimeoutMs>5000</TimeoutMs>","<MaxRequests>1000</MaxRequests>","</KeepAliveSettings>","<RequestingICAPHeaders>","<ICAPHeader>HTTPUserNameICAPHeader</ICAPHeader>","<ICAPHeader>HTTPClientIpICAPHeader</ICAPHeader>","</RequestingICAPHeaders>","<HTTPClientIpICAPHeader>X-Client-IP</HTTPClientIpICAPHeader>","<HTTPUserNameICAPHeader>X-Client-Username</HTTPUserNameICAPHeader>","<VirusNameICAPHeader></VirusNameICAPHeader>","<DatabaseVersionICAPHeader>X-AV-Database-time</DatabaseVersionICAPHeader>","<SendInfectionFoundICAPHeader>0</SendInfectionFoundICAPHeader>","<SendResponseDescICAPHeader>0</SendResponseDescICAPHeader>","<SendResponseInfoICAPHeader>0</SendResponseInfoICAPHeader>","<SendViolationsFoundICAPHeader>0</SendViolationsFoundICAPHeader>","<ScanInReqMode>All</ScanInReqMode>","<ScanInRespMode>Content</ScanInRespMode>","<RulesFilePath>/opt/kaspersky/ScanEngine/icap_data/kavicapd_gui_rules.conf</RulesFilePath>","<CmdPath>/opt/kaspersky/ScanEngine/icap_data/scripts</CmdPath>","<ResponsesPath>/opt/kaspersky/ScanEngine/icap_data/templates</ResponsesPath>","<TransferBeforeScanEnding Delay=\"10\" ChunkSize=\"4\" BlockedUrlCacheEnabled=\"1\" BlockedUrlCacheKb=\"5000\" BlockedUrlCacheTtlSec=\"1800\">0</TransferBeforeScanEnding>","<Exclusions>","<!-- Signs of highly likely uninfected resources. -->","<!-- Note: ContentSize - more or equal (use only once), ContentType - as is, RequestURL - masks can be used -->","<!--","<ContentSize>102400</ContentSize>","<ContentType>audio/mpeg</ContentType>","<ContentType>image/jpeg</ContentType>","<RequestURL>*.kaspersky.com/.*</RequestURL>","-->","</Exclusions>","<!-- Possible values: update, reload, reopen-log (reopens syslog format log files) -->","<USR1SignalAction>update</USR1SignalAction>","<USR2SignalAction>reopen-log</USR2SignalAction>","<!-- The path to the logging configuration file. Only this file will be used as the ICAP logging configuration file. If the LoggingConfigFilePath element has the empty value, the icapdkavlog.conf file located in the kavicapd binary file directory is used. -->","<LoggingConfigFilePath></LoggingConfigFilePath>","</ICAPSettings>"," ICAPSettings ","201129.htm"));
Page.push(new Array("RAMUsageLimit","Указывает максимальный объем системной памяти (в килобайтах), который выделен для Kaspersky Scan Engine.","Не рекомендуется использовать настройку RAMUsageLimit для машин с ограниченной производительностью процессора. Например, если Kaspersky Scan Engine запущен на виртуальной машине, а ресурсы процессора физического узла используются совместно с другими виртуальными машинами или процессами.","Эта величина позволяет контролировать использование памяти. Чрезмерное использование оперативной памяти может возникнуть, когда Kaspersky Scan Engine сканирует большие файлы или получает много результатов сканирования одновременно. Когда лимит RAMUsageLimit достигнут, Kaspersky Scan Engine заканчивает обработку объекта, который вызвал чрезмерное потребление памяти.","Путь","ICAPSettings > RAMUsageLimit","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Рекомендуемое значение RAMUsageLimit:","Не превышает размер ОЗУ.","В два раза больше максимального размера файла для сканирования больших файлов. Например, для сканирования файла размером 1 ГБ требуется около 2 ГБ ОЗУ.","Не менее 600 МБ, что в два раза больше размера антивирусных баз и библиотек Kaspersky Scan Engine (всего 300 МБ). Такой размер необходим из-за того, что объем системной памяти удваивается при перезагрузке базы данных.","Kaspersky Scan Engine также требует ресурсы памяти для всех своих компонентов.","Не устанавливайте значение параметра RAMUsageLimit меньше 7 МБ. Это минимальный объем памяти, который обеспечивает правильное функционирование продукта.","Если значение параметра равно 0, объем системной памяти, который может быть выделен для Kaspersky Scan Engine, не ограничен.","Значение по умолчанию: 0.","Если значение параметра равно 0, памяти может не хватить. Если Kaspersky Scan Engine использует слишком много системной памяти, операционная система может остановить службу.","Пример","Ниже приведен пример этого элемента.","<RAMUsageLimit>0</RAMUsageLimit> <!-- 0 = unlimited -->"," RAMUsageLimit ","201149.htm"));
Page.push(new Array("RulesFilePath","Задает абсолютный путь к файлу, который содержит правила настройки службы.","Путь","ICAPSettings > RulesFilePath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: /opt/kaspersky/ScanEngine/icap_data/kavicapd_gui_rules.conf.","Пример","Ниже приведен пример этого элемента.","<RulesFilePath>/opt/kaspersky/ScanEngine/icap_data/kavicapd_gui_rules.conf</RulesFilePath>"," RulesFilePath ","201153.htm"));
Page.push(new Array("CmdPath","Указывает абсолютный путь к директории, содержащей сценарии, которые будут выполнены при срабатывании соответствующих правил.","Путь","ICAPSettings > CmdPath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: /opt/kaspersky/ScanEngine/icap_data/scripts.","Пример","Ниже приведен пример этого элемента.","<CmdPath>/opt/kaspersky/ScanEngine/icap_data/scripts</CmdPath>"," CmdPath ","201154.htm"));
Page.push(new Array("ResponsesPath","Указывает абсолютный путь к директории, содержащей шаблоны ответов, которые будут получены при срабатывании соответствующих правил.","Путь","ICAPSettings > ResponsesPath","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение по умолчанию: /opt/kaspersky/ScanEngine/icap_data/templates.","Пример","Ниже приведен пример этого элемента.","<ResponsesPath>/opt/kaspersky/ScanEngine/icap_data/templates</ResponsesPath>"," ResponsesPath ","201155.htm"));
Page.push(new Array("USR1SignalAction","Указывает действие, которое должно быть выполнено при получении сигнала SIGUSR1.","Если этот параметр не указан в файле конфигурации, ICAP-служба обновляет базы при получении сигнала.","Путь","ICAPSettings > USR1SignalAction","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента USR1SignalAction","Значение","Описание","reload","Перезагружает антивирусную базу без ее обновления. Предполагается, что файлы в папке с базами уже обновлены и должны быть перезагружены.","update","Обновление и перезагрузка баз с помощью встроенного функционала Kaspersky Scan Engine.","reopen-log","Закрытие всех открытых файлов журналов в формате syslog и последующее их открытие для записи журналов в конец этих файлов. Если файлы пропущены, ICAP-плагин создаст их. Этот параметр позволяет выполнять ротацию журналов с помощью утилиты logrotate в режиме по умолчанию или с использованием директивы create.","Пример","Ниже приведен пример этого элемента.","<USR1SignalAction>update</USR1SignalAction>"," USR1SignalAction ","201163.htm"));
Page.push(new Array("USR2SignalAction","Указывает действие, которое должно быть выполнено при получении сигнала SIGUSR2.","Если этот параметр не указан в файле конфигурации, ICAP-служба обновляет базы при получении сигнала.","Путь","ICAPSettings > USR2SignalAction","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента USR2SignalAction","Значение","Описание","reload","Перезагружает антивирусную базу без ее обновления. Предполагается, что файлы в папке с базами уже обновлены и должны быть перезагружены.","update","Обновление и перезагрузка баз с помощью встроенного функционала Kaspersky Scan Engine.","reopen-log","Закрытие всех открытых файлов журналов в формате syslog и последующее их открытие для записи журналов в конец этих файлов. Если файлы пропущены, ICAP-плагин создаст их. Этот параметр позволяет выполнять ротацию журналов с помощью утилиты logrotate в режиме по умолчанию или с использованием директивы create.","Пример","Ниже приведен пример этого элемента.","<USR2SignalAction>reopen-log</USR2SignalAction>"," USR2SignalAction ","201164.htm"));
Page.push(new Array("TransferBeforeScanEnding","Задает режим отправки по частям (Data Trickling) для файлов, которые отправляются на прокси-сервер. Этот режим позволяет сканировать файлы целиком и отправлять их частями пользователю до завершения проверки. Передача объекта начинается через столько секунд после начала приема объекта, сколько указано в атрибуте Delay, и выполняется по фрагментам. Обратите внимание, что в секунду передается не более одного фрагмента. Эта функция не дает браузеру пользователя прервать соединение с прокси-сервером из-за тайм-аута.","Путь","ICAPSettings > TransferBeforeScanEnding","Атрибуты","Этот элемент имеет следующие атрибуты.","Атрибуты элемента TransferBeforeScanEnding","Атрибут","Описание","Delay","Интервал (в секундах) между началом приема объекта и началом отправки его первого фрагмента.","Необязательный атрибут. Диапазон возможных значений от 1 до 3600.","Значение по умолчанию: 10.","ChunkSize","Размер фрагментов, передаваемых в период между началом приема объекта и окончанием проверки. Поскольку фрагменты передаются не чаще одного в секунду, атрибут ChunkSize указывает максимальную скорость передачи (в килобайтах в секунду) до завершения сканирования. После этого, если объект безопасен, остальная часть объекта будет передаваться без ограничения скорости.","Необязательный атрибут. Диапазон возможных значений от 1 до 1024.","Значение по умолчанию: 4.","BlockedUrlCacheEnabled","Определяет, как обрабатывать попытки повторного скачивания из браузера пользователя в режиме отправки по частям. Эта функция не дает браузеру пользователя автоматически повторно скачивать заблокированные файлы. Функция запрета повторного скачивания работает только при включенной опции TransferBeforeScanEnding.","Вы можете указать одно из следующих значений для этого параметра:","0\n\n\n\n\nФункция запрета повторного скачивания выключена.\n","1\n\n\n\n\nФункция запрета повторного скачивания включена. Значение по умолчанию.\n","Если этот атрибут не указан, функция запрета повторного скачивания будет включена.","BlockedUrlCacheKb","Максимальный размер кеша в КБ для заблокированных URL-адресов. Это максимальный объем ОЗУ, выделяемый для кеширования заблокированных URL-адресов.","Диапазон возможных значений от 1 до 100000.","Значение по умолчанию: 5000.","Если этот атрибут не указан, используется значение по умолчанию.","BlockedUrlCacheTtlSec","Время жизни заблокированных URL-адресов, сохраненных в кеше (в секундах).","Диапазон возможных значений от 1 до 604800 (неделя).","Значение по умолчанию: 1800.","Если этот атрибут не указан, используется значение по умолчанию.","Выбирайте подходящие значения для атрибутов ChunkSize и Delay. Не рекомендуется указывать слишком большое значение ChunkSize и слишком маленькое значение Delay. Если не соблюдать эту рекомендацию, просканированный объект может быть отправлен почти целиком (без последнего фрагмента) задолго до окончания сканирования, и браузер пользователя прервет соединение.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента TransferBeforeScanEnding","Значение","Описание","0","Объект может быть отправлен только после окончания сканирования.","Значение по умолчанию.","1","Объект может быть отправлен до окончания сканирования.","Пример","Ниже приведен пример этого элемента.","<TransferBeforeScanEnding Delay=\"10\" ChunkSize=\"4\" BlockedURLCacheEnabled=\"1\" BlockedURLCacheKb=\"5000\" BlockedURLCacheTtlSec=\"1800\">1</TransferBeforeScanEnding>"," TransferBeforeScanEnding ","201208.htm"));
Page.push(new Array("VirusNameICAPHeader","Задает имя поля заголовка, в котором содержится имя обнаруженной угрозы или тип легальной программы, которая может быть использована злоумышленниками.","Имя поля должно состоять из символов, разрешенных для имен полей заголовка в соответствии с RFC 7230.","Поле заголовка будет содержать несколько имен, если в запросе, прошедшем через прокси-сервер для проверки, будет обнаружено более одного объекта. Несколько имен указываются в любом порядке и разделяются запятой (\",\").","Максимальный размер значения, которое может содержаться в поле заголовка, составляет 10 КБ (килобайт).","Этот элемент необязателен.","Путь","ICAPSettings > VirusNameICAPHeader","Атрибуты","Этот элемент не имеет атрибутов.","Значения","Параметр может иметь пустое значение. Если при проверке ничего не будет обнаружено, поле, указанное в элементе VirusNameICAPHeader, будет отсутствовать в заголовке ответа.","Пример","Ниже приведен пример этого элемента.","<VirusNameICAPHeader>X-Virus-ID</VirusNameICAPHeader>"," VirusNameICAPHeader ","201214.htm"));
Page.push(new Array("Настройки кластеров Kaspersky Scan Engine","На странице Cluster вы можете управлять экземплярами Kaspersky Scan Engine, входящими в состав кластера.","Добавление экземпляра Kaspersky Scan Engine в кластер","Вы можете добавить новый или ранее удаленный экземпляр Kaspersky Scan Engine в кластер одним из следующих способов:","Во время автоматической установки.","Во время установки вручную.","После установки, указав соответствующие параметры в элементах DatabaseSettings > ConnectionString, DatabaseSettings > User и DatabaseSettings > Password файла klScanEngineUI.xml. Изменения вступят в силу после перезапуска службы.","Содержимое страницы кластера","Страница Cluster содержит следующие вкладки:","Hosts","Settings profiles","Cluster settings","Hosts","На вкладке Hosts отображается постоянно обновляемая (каждые пять секунд) таблица кластерных экземпляров Kaspersky Scan Engine. В ней есть следующие столбцы:","Hostname — имя хоста компьютера, на котором инициализирован Kaspersky Scan Engine.","Status — результат инициализации.","Integration mode – режим работы экземпляра Kaspersky Scan Engine: HTTP или ICAP.","Anti-virus database version","— версия антивирусных баз Kaspersky Scan Engine.","Также этот столбец может содержать статус обновления со следующей информацией:","Обновление выполняется в данный момент.","Во время обновления произошла ошибка.","Settings profile – имя профиля настроек, который используется в экземпляре Kaspersky Scan Engine.","Если имя профиля настроек – Default, Kaspersky Scan Engine использует заданные настройки. Если указано имя Custom, Kaspersky Scan Engine использует собственные настройки пользователя и не использует никаких профилей настроек.","На этой вкладке нажмите на значок Options () слева от нужного вам экземпляра, а затем выберите любое из следующих действий:","Change profile settings – указывает, какой профиль настроек необходимо использовать.","Launch database update — обновление антивирусных баз Kaspersky Scan Engine.\nВы не можете запустить обновление, если оно уже запущено и если экземпляр Kaspersky Scan Engine деинициализирован. ","Enable logging — включает ведение журнала отладки в экземпляре Kaspersky Scan Engine.\nТакже вы можете отключить ведение журнала отладки. \nВы не сможете включить ведение журнала отладки, если экземпляр Kaspersky Scan Engine деинициализирован. ","Remove from cluster — удаляет экземпляр из кластера. Если экземпляр кластера не существует, может пройти до 5 минут, прежде чем он будет удален.\nВы не можете удалить экземпляр Kaspersky Scan Engine, который используется в данный момент. ","Settings profiles","На этой вкладке отображается список профилей настроек Kaspersky Scan Engine, созданных пользователем Kaspersky Scan Engine. Вы можете просмотреть следующую информацию для каждого профиля настроек:","Название профиля настроек.","Описание профиля настроек. \nОписания может не быть, если вы его не указали. ","Режим\nРежим Kaspersky Scan Engine (ICAP или HTTP), для которого создан профиль настроек. ","Список имен хостов экземпляров Kaspersky Scan Engine, использующих выбранный профиль настроек.\nДопускается, чтобы профиль не использовался ни одним из экземпляров Kaspersky Scan Engine. ","Вы можете добавить новый профиль настроек, а также отредактировать или удалить существующий.","Чтобы добавить новый профиль настроек:","Нажмите кнопку Add над списком всех профилей настроек.","Откроется мастер добавления нового профиля настроек.","На вкладке","Profile info","укажите следующие параметры:","Name — имя профиля настроек.\n\n\nЭтот параметр является обязательным. Имя должно отличаться от ранее созданных профилей и профилей, зарезервированных Kaspersky Scan Engine (Default и Custom), и должно содержать до 16 символов. ","Description — описание профиля настроек.\n\n\nЭта настройка необязательна. Описание должно содержать не более 256 символов. ","Service mode — режим работы экземпляра Kaspersky Scan Engine: HTTP или ICAP.\n\n\nЭтот параметр является обязательным. ","При необходимости установите флажок Use these host settings as base, чтобы настроить профиль с использованием параметров запущенного экземпляра Kaspersky Scan Engine.\n\n\nЕсли этот флажок не установлен, будут использоваться настройки по умолчанию в зависимости от режима работы (HTTP или ICAP). ","Нажмите Next.","В дальнейшем укажите параметры Kaspersky Scan Engine разных типов в зависимости от режима работы (HTTP или ICAP). Вы можете настроить большинство параметров, расположенных на странице","Settings",", за исключением параметров из разделов","License","и","Password",", а также параметров подключения в разделе","Service",":","На вкладке Service укажите параметры службы.","На вкладке Scanning укажите параметры проверки.","На вкладке Update укажите параметры обновления.","На вкладке ICAP rules укажите правила ICAP","На вкладке Logging укажите параметры логирования.","На вкладке Proxy укажите настройки прокси.","На вкладке Summary проверьте сводную информацию о профиле настроек.","Нажмите Save.","Вы также можете сохранять текущие изменения на каждом этапе процедуры.","Чтобы изменить существующий профиль настроек:","Найдите профиль настроек, который вы хотите отредактировать, а затем нажмите кнопку Edit над разделом с кратким описанием профиля.\nОткроется мастер редактирования профиля настроек. ","Отредактируйте нужные вам параметры.\nВы можете редактировать все те же параметры, что описаны выше в процедуре добавления нового профиля. ","Чтобы удалить существующий профиль настроек:","Нажмите на кнопку Delete () рядом с профилем настроек, который нужно удалить.","Нажмите Confirm, чтобы подтвердить действие.","После завершения процедуры удаления экземпляры, использующие настройки удаленного профиля, продолжат использовать их.","Cluster settings","На этой вкладке вы можете настроить Kaspersky Scan Engine на автоматическое удаление из кластера экземпляров, неактивных в течение определенного периода времени.","Экземпляр считается неактивным, если от него не было зарегистрировано никаких событий службы. После удаления экземпляра из кластера Kaspersky Scan Engine также удаляет все служебные события, связанные с ним. Kaspersky Scan Engine не удаляет события с результатами сканирования.","Чтобы настроить автоматическое удаление неактивных экземпляров кластера:","Активируйте переключатель Enable automatic removal.","Укажите период бездействия в часах.\nЧтобы не допустить случайного удаления экземпляра кластера, не устанавливайте период бездействия менее 24 часов. ","Нажмите Save.","Если ранее удаленный экземпляр становится активным, он может повторно подключиться к кластеру.","Чтобы повторно подключить экземпляр к кластеру:","Измените имя хоста экземпляра.","Перезагрузите службы Kaspersky Scan Engine.","Для режима HTTP перезапустите службу kavhttpd: \n\n\nsystemctl restart kavhttpd ","Для режима ICAP перезапустите службу kavicapd: \n\n\nsystemctl restart kavicapd ","Если вы используете Kaspersky Scan Engine GUI, перезапустите службу klScanEngineUI: \n\n\nsystemctl restart klScanEngineUI "," Настройки кластеров Kaspersky Scan Engine ","201264.htm"));
Page.push(new Array("Получение списка HTTP-методов, поддерживаемых службой","Когда Kaspersky Scan Engine работает в режиме HTTP, вы можете сделать запрос OPTIONS на все поддерживаемые методы API. Этот запрос позволяет получить информацию о методах HTTP, которые поддерживаются в сервисе kavhttpd.","Чтобы сделать запрос, укажите метод API для метода OPTIONS.","Ниже приведен пример запроса OPTIONS:","OPTIONS /api/v3.1/version HTTP/1.1","Ниже приведен пример ответа на запрос:","HTTP/1.1 200 OK","Date: Wed, 15 Jul 2020 10:15:44 GMT","Content-Length: 0","Allow: OPTIONS, GET","Здесь Allow – список методов HTTP, которые поддерживаются в этом методе API.","Если HTTP-запрос содержит поле Origin (поле, содержащее IP-адрес или имя хоста, инициирующего запрос) и если элемент AccessControlAllowOrigin определен в файле конфигурации режима HTTP, ответ будет содержать Access-Control-Allow-Origin и поля Access-Control-Allow-Methods вместо поля Allow. В этом случае поле Access-Control-Allow-Origin может содержать значения, описанные в разделе ServerSettings > CORS, а значение поля Access-Control-Allow-Methods аналогично значению поля Allow."," Получение списка HTTP-методов, поддерживаемых службой ","201538.htm"));
Page.push(new Array("CORS","Содержит настройки механизма совместного использования ресурсов между источниками.","Этот элемент необязателен.","Путь","ServerSettings > CORS","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","AccessControlAllowOrigin","Указывает список источников (IP-адреса или имена хостов с протоколом), которым должен быть предоставлен доступ к службе kavhttpd.","Возможные значения:","IP-адрес или имя хоста источника, включая протокол (http:// или https://), который инициирует запросы к службе kavhttpd","*\n\n\nЭто значение позволяет любому источнику получить доступ к службе kavhttpd.\n","Пустое значение.","Kaspersky Scan Engine в режиме HTTP может получить HTTP-запрос с полем заголовка Origin, в котором указан IP-адрес или имя хоста, инициирующего запрос. Если файл конфигурации режима HTTP содержит один или несколько элементов AccessControlAllowOrigin, значение поля заголовка Origin сопоставляется со значениями, определенными в этих элементах. Возможны следующие результаты сканирования:","Значение поля заголовка Origin совпадает по крайней мере с одним из значений элемента AccessControlAllowOrigin.\nВ этом случае значение поля заголовка Origin будет указано в поле Access-Control-Allow-Origin заголовка ответа.  ","Нет совпадений. \nВ этом случае Access-Control-Allow-Origin будет содержать значение https://scanengine.kaspersky.com. ","По крайней мере, один из элементов AccessControlAllowOrigin содержит значение *.\nВ этом случае поле заголовка ответа Access-Control-Allow-Origin будет содержать значение * независимо от значения поля заголовка Origin. ","Если в запросе отсутствует поле заголовка Origin, служба kavhttpd обрабатывает его стандартным образом.","Пример","Ниже приведен пример этого элемента.","<CORS>","<AccessControlAllowOrigin>http://example.com</AccessControlAllowOrigin>","<AccessControlAllowOrigin>https://www.kaspersky.com</AccessControlAllowOrigin>","</CORS>"," CORS ","201900.htm"));
Page.push(new Array("Рекомендации по безопасной интеграции","В этом разделе описаны рекомендуемые методы безопасной интеграции вашего продукта с Kaspersky Scan Engine.","Несоблюдение этих рекомендаций может привести к проблемам с безопасностью.","Использование кратчайшего административного расстояния","Настройте свою сеть так, чтобы административное расстояние между службой kavicapd и прокси-службой было как можно меньше."," Рекомендации по безопасной интеграции ","206407.htm"));
Page.push(new Array("Настройка Format Recognizer для использования в режиме ICAP","Format Recognizer – это компонент, который можно использовать в Kaspersky Scan Engine для распознавания и пропуска файлов определенных форматов в процессе сканирования. Пропуск файлов увеличивает скорость обработки Kaspersky Scan Engine.","Включение Format Recognizer","Чтобы включить Format Recognizer:","В файле конфигурации режима ICAP найдите раздел FormatRecognizerSettings.\nЕсли этот раздел отсутствует, добавьте его вручную следующим образом: \n\n<FormatRecognizerSettings>\n...\n</FormatRecognizerSettings> \n\n\n\n ","В этом разделе в списке FormatsToSkipScanning укажите, какие форматы файлов не должны проверяться Kaspersky Scan Engine:\n\n<FormatRecognizerSettings>\n<FormatsToSkipScanning>\n<KAV_FF_GENERAL_TXT/>\n...\n<KAV_FF_AUDIO_WMA/>\n</FormatsToSkipScanning>\n</FormatRecognizerSettings>\n\n\n\n ","Чтобы изменения вступили в силу, перезапустите службу kavicapd с помощью следующей команды:\nservice kavicapd restart ","Format Recognizer начнет распознавать и пропускать файлы форматов, указанных в списке FormatsToSkipScanning. Kaspersky Scan Engine не сканирует пропущенные файлы, что увеличивает скорость их обработки.","Выключение Format Recognizer","Чтобы выключить Format Recognizer:","В файле конфигурации режима ICAP удалите раздел FormatRecognizerSettings или оставьте список FormatsToSkipScanning пустым.","Чтобы изменения вступили в силу, перезапустите службу kavicapd с помощью следующей команды:\nservice kavicapd restart "," Настройка Format Recognizer для использования в режиме ICAP ","206590.htm"));
Page.push(new Array("Настройка Kaspersky Scan Engine","В этом разделе описаны общие настройки Kaspersky Scan Engine."," Настройка Kaspersky Scan Engine ","206592.htm"));
Page.push(new Array("FormatRecognizerSettings","Указывает настройки Format Recognizer.","Путь","FormatRecognizerSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","FormatsToSkipScanning\nУказывает, какие форматы файлов решение Kaspersky Scan Engine не должно сканировать в режиме ICAP.\n\nЧтобы выключить функцию пропуска форматов, удалите элемент FormatRecognizerSettings из файла конфигурации или оставьте список FormatsToSkipScanning пустым.\n","Пример","Ниже приведен пример элемента FormatRecognizerSettings.","<FormatRecognizerSettings>","<FormatsToSkipScanning>","<KAV_FF_GENERAL_TXT/>","<KAV_FF_GENERAL_CSV/>","<KAV_FF_AUDIO_WMA/>","</FormatsToSkipScanning>","</FormatRecognizerSettings>"," FormatRecognizerSettings ","206616.htm"));
Page.push(new Array("MaxArchivesScanningDepth","Указывает максимальную глубину распаковки вложенных архивов при сканировании. Этот параметр необязателен.","Путь","KAVScanningSettings > MaxArchivesScanningDepth","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым положительным числом.","Значение по умолчанию: 0.","Рекомендуемое значение: 5.","Пример","Ниже приведен пример этого элемента.","<MaxArchivesScanningDepth>0</MaxArchivesScanningDepth>"," MaxArchivesScanningDepth ","207145.htm"));
Page.push(new Array("MaxArchivesScanningDepth","Указывает максимальную глубину распаковки вложенных архивов при сканировании. Этот параметр необязателен.","Путь","SDKSettings > MaxArchivesScanningDepth","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Значение этого элемента должно быть целым положительным числом.","Значение по умолчанию: 0.","Рекомендуемое значение: 5.","Пример","Ниже приведен пример этого элемента.","<MaxArchivesScanningDepth>0</MaxArchivesScanningDepth>"," MaxArchivesScanningDepth ","207146.htm"));
Page.push(new Array("ReqModeAddress","Адрес, используемый kavicapd для обработки запросов в режиме запроса. Этот адрес является частью полного URL-адреса, как показано в примере ниже:","icap://icap-server.example.com:1344/req","В приведенном выше примере используется значение по умолчанию req. Вы можете указать другое значение в ReqModeAddress (например, avscan):","icap://icap-server.example.com:1344/avscan","Этот элемент необязателен.","Путь","ICAPSettings > ReqModeAddress","Атрибуты","Этот элемент не имеет атрибутов.","Значения","Значение должно соответствовать следующим требованиям:","Длина от 1 до 16 символов.","Допустимые символы:","Строчные и заглавные буквы латинского алфавита.","Специальные символы: _ и -. ","Значение по умолчанию: req.","Не используйте одно и то же значение для ReqModeAddress и RespModeAddress.","Пример","Ниже приведен пример этого элемента.","<ReqModeAddress>req</ReqModeAddress>"," ReqModeAddress ","207194.htm"));
Page.push(new Array("RespModeAddress","Адрес, используемый kavicapd для обработки ответов в режиме ответа. Этот адрес является частью полного URL-адреса, как показано в примере ниже:","icap://icap-server.example.com:1344/resp","В приведенном выше примере используется значение по умолчанию resp. Вы можете указать другое значение в RespModeAddress (например, avscan):","icap://icap-server.example.com:1344/avscan","Этот элемент необязателен.","Путь","ICAPSettings > RespModeAddress","Атрибуты","Этот элемент не имеет атрибутов.","Значения","Значение должно соответствовать следующим требованиям:","Длина от 1 до 16 символов.","Допустимые символы:","Строчные и заглавные буквы латинского алфавита.","Специальные символы: _ и -. ","Значение по умолчанию: resp.","Не используйте одно и то же значение для ReqModeAddress и RespModeAddress.","Пример","Ниже приведен пример этого элемента.","<RespModeAddress>resp</RespModeAddress>"," RespModeAddress ","207240.htm"));
Page.push(new Array("KeepAliveSettings","По умолчанию Kaspersky Scan Engine поддерживает Keep-Alive (постоянные соединения), поэтому ICAP-клиент может использовать одно и то же соединение для отправки нескольких запросов. С помощью KeepAliveSettings вы можете настроить поддержку Keep-Alive или даже отключить ее.","Путь","ICAPSettings > KeepAliveSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","Enabled","TimeoutMs","MaxRequests","UseAlways","Пример","Ниже приведен пример этого элемента.","<KeepAliveSettings>","<Enabled>1</Enabled>","<TimeoutMs>5000</TimeoutMs>","<MaxRequests>1000</MaxRequests>","</KeepAliveSettings>"," KeepAliveSettings ","207291.htm"));
Page.push(new Array("Enabled","Указывает, включена ли поддержка Keep-Alive.","Этот элемент необязателен.","Путь","ICAPSettings > KeepAliveSettings > Enabled","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Допустимые значения:","0 – поддержка Keep-Alive выключена.","1 – поддержка Keep-Alive включена.","Значение по умолчанию: 1.","Пример","Ниже приведен пример этого элемента.","<Enabled>1</Enabled>"," Enabled ","207292.htm"));
Page.push(new Array("TimeoutMs","Время, в течение которого неактивное соединение должно оставаться открытым (в миллисекундах) в ожидании нового запроса от ICAP-клиента.","Этот элемент необязателен.","Путь","ICAPSettings > KeepAliveSettings > TimeoutMs","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Допустимое значение – это целое число от 0 до 18000 (миллисекунд).","Если для TimeoutMs установлено значение 0, ограничение по времени для подключения отсутствует.","Значение по умолчанию: 5000.","Пример","Ниже приведен пример этого элемента.","<TimeoutMs>5000</TimeoutMs>"," TimeoutMs ","207298.htm"));
Page.push(new Array("MaxRequests","Максимальное количество запросов на одно подключение до его закрытия.","Этот элемент необязателен.","Путь","ICAPSettings > KeepAliveSettings > MaxRequests","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Допустимое значение – это целое число от 0 до 1000.","Если для MaxRequests установлено значение 0, количество запросов на одно подключение не ограничено.","Значение по умолчанию: 1000.","Пример","Ниже приведен пример этого элемента.","<MaxRequests>1000</MaxRequests>"," MaxRequests ","207303.htm"));
Page.push(new Array("Enabled","Указывает, включена ли поддержка Keep-Alive.","Этот элемент необязателен.","Путь","ServerSettings > KeepAliveSettings > Enabled","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Допустимые значения:","0 – поддержка Keep-Alive выключена.","1 – поддержка Keep-Alive включена.","Значение по умолчанию: 1.","Пример","Ниже приведен пример этого элемента.","<Enabled>1</Enabled>"," Enabled ","207346.htm"));
Page.push(new Array("KeepAliveSettings","По умолчанию Kaspersky Scan Engine поддерживает Keep-Alive (постоянные соединения), поэтому HTTP-клиент может использовать одно и то же соединение для отправки нескольких запросов. С помощью KeepAliveSettings вы можете настроить поддержку Keep-Alive или даже отключить ее.","Путь","ServerSettings > KeepAliveSettings","Атрибуты","Этот элемент не имеет атрибутов.","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","Enabled.","TimeoutMs.","MaxRequests.","Пример","Ниже приведен пример этого элемента.","<KeepAliveSettings>","<Enabled>1</Enabled>","<TimeoutMs>5000</TimeoutMs>","<MaxRequests>1000</MaxRequests>","</KeepAliveSettings>"," KeepAliveSettings ","207348.htm"));
Page.push(new Array("TimeoutMs","Время, в течение которого неактивное соединение должно оставаться открытым (в миллисекундах) в ожидании нового запроса от HTTP-клиента.","Этот элемент необязателен.","Путь","ServerSettings > KeepAliveSettings > TimeoutMs","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Допустимое значение – это целое число от 0 до 18000 (миллисекунд).","Если для TimeoutMs установлено значение 0, ограничение по времени для подключения отсутствует.","Значение по умолчанию: 5000.","Пример","Ниже приведен пример этого элемента.","<TimeoutMs>5000</TimeoutMs>"," TimeoutMs ","207350.htm"));
Page.push(new Array("MaxRequests","Максимальное количество запросов на одно подключение до его закрытия.","Этот элемент необязателен.","Путь","ServerSettings > KeepAliveSettings > MaxRequests","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Допустимое значение – это целое число от 0 до 1000.","Если для MaxRequests установлено значение 0, количество запросов на одно подключение не ограничено.","Значение по умолчанию: 1000.","Пример","Ниже приведен пример этого элемента.","<MaxRequests>1000</MaxRequests>"," MaxRequests ","207352.htm"));
Page.push(new Array("Использование инструмента проверки целостности","Kaspersky Scan Engine содержит различные бинарные модули в виде динамически подключаемых библиотек, исполняемых файлов, файлов конфигурации и файлов интерфейса. Хакер может заменить один или несколько исполняемых модулей или файлов другими файлами, содержащими вредоносный код. Чтобы предотвратить замену модулей и файлов, Kaspersky Scan Engine может проверять целостность компонентов программы.","Приложение проверяет модули и файлы на наличие несанкционированных изменений или повреждений. Если модуль или файл приложения имеют неверную хеш-сумму, они считаются поврежденными.","Приложение также проверяет целостность файла манифеста, содержащего список файлов программы, целостность которых имеет решающее значение для корректной работы компонентов программы.","Начиная с версии Kaspersky Scan Engine 2.1, объекты KAV SDK поставляются в виде отдельного пакета. По этой причине у Kaspersky Scan Engine есть два файла манифеста:","integrity_check.xml используется для проверки целостности файлов Kaspersky Scan Engine.","integrity_check_sdk.xml используется для проверки целостности файлов KAV SDK. Этот файл поставляется в пакете KAV SDK.","Целостность компонентов программы проверяется с помощью инструмента проверки целостности, расположенного в каталоге %service_dir%, где %service_dir% — это каталог Kaspersky Scan Engine.","Файлы манифеста integrity_check.xml и integrity_check_sdk.xml (начиная с версии Kaspersky Scan Engine 2.1) защищены криптографической подписью \"Лаборатории Касперского\". Файлы манифеста находятся в каталоге %service_dir%.","Для запуска утилиты проверки целостности требуются права учетной записи пользователя root.","Чтобы проверить целостность компонентов программы, выполните следующую команду:","integrity_checker [options]","По умолчанию инструмент использует файл integration_check.xml, расположенный в каталоге %service_dir%.","Чтобы проверить целостность компонентов программы с помощью файла манифеста, расположенного в каталоге, отличном от каталога по умолчанию, выполните следующую команду:","integrity_checker [options] %path%","Здесь %path% — это путь к файлу манифеста.","Вы можете запустить инструмент проверки целостности со следующими дополнительными параметрами:","--help — отобразить справку по настройкам инструмента.","--version — вывести версию инструмента.","--verbose — расширенный вывод выполненных действий и результатов. Если вы укажете этот параметр, вывод будет содержать как успешные, так и неуспешные результаты сканирования объектов, перечисленных в файле манифеста. Если вы не укажете этот параметр, будут предоставлены только те объекты, которые не прошли проверку.","--trace <filename> , где <filename> — это имя файла, используемого для регистрации событий, происходящих во время проверки. События будут регистрироваться на уровне DEBUG.","Результат проверки каждого файла манифеста отображается рядом с именем файла манифеста в следующем формате:","SUCCEEDED — целостность файлов подтверждена (код возврата 0).","FAILED — целостность файлов не подтверждена (код возврата не равен 0).","Если вы создаете исполняемые файлы для режима HTTP или ICAP из исходного кода, утилита проверки целостности всегда возвращает FAILED при проверке %service_dir%/bin/kavhttpd и %service_dir%/bin/kavhttp_client (режим HTTP) или %service_dir%/bin/kavicapd (режим ICAP)."," Использование инструмента проверки целостности ","209025.htm"));
Page.push(new Array("Что нового","В этом разделе описаны новые функции и улучшения последней версии Kaspersky Scan Engine.","Что нового в версии 2.1","Поддерживается многопользовательский режим работы с Kaspersky Scan Engine GUI. Для пользователей Kaspersky Scan Engine GUI доступны роли Администратор и Оператор.","Функциональность аудита системы. С помощью аудита системы намного проще контролировать работу Kaspersky Scan Engine и анализировать инциденты безопасности, когда они происходят.","Автоматическое обновление до более новой версии Kaspersky Scan Engine с помощью утилиты install.","Различные режимы работы экземпляров Kaspersky Scan Engine в кластере. Теперь экземпляры Kaspersky Scan Engine могут работать в разных режимах одновременно: когда одни экземпляры работают в режиме ICAP, другие работают в режиме HTTP.","Автоматическое удаление неактивных экземпляров кластера. Если эта функция включена, Kaspersky Scan Engine автоматически удаляет из кластера экземпляры, неактивные в течение заданного времени.","Аутентификация токена API. Если эта функция включена, Kaspersky Scan Engine предоставляет доступ к своим функциям только тем HTTP-клиентам, которые успешно прошли аутентификацию с помощью токена API.","Отдельные объекты KAV SDK. Начиная с версии Kaspersky Scan Engine 2.1, объекты KAV SDK поставляются в виде отдельного пакета.","X-","поля заголовка","ответа:","X-Infection-Found","X-Response-Desc","X-Response-Info","X-Violations-Found","X-Include","Пользовательское поле заголовка ответа содержит информацию о версии антивирусных баз, используемых Kaspersky Scan Engine для проверки объектов. Имя поля указано в DatabaseVersionICAPHeader.","Пределы значений изменены для следующих параметров:","KeepAliveSettings > TimeoutMs (режим HTTP)","KeepAliveSettings > MaxRequests (режим HTTP)","KeepAliveSettings > TimeoutMs (режим ICAP)","KeepAliveSettings > MaxRequests (режим ICAP)"," Что нового ","209374.htm"));
Page.push(new Array("Обновление вручную (Linux)","В этом разделе описано, как обновить Kaspersky Scan Engine вручную."," Обновление вручную (Linux) ","209771.htm"));
Page.push(new Array("HTTPS-соединения","Kaspersky Scan Engine в режиме HTTP поддерживает HTTPS для установления безопасного соединения.","Kaspersky Scan Engine не проверяет сертификат HTTP-клиента.","Kaspersky Scan Engine поддерживает следующие защищенные протоколы и наборы шифров:","Протокол TLS 1.3 и следующие наборы шифров:","TLS_AES_256_GCM_SHA384","TLS_CHACHA20_POLY1305_SHA256","TLS_AES_128_GCM_SHA256","Протокол TLS 1.2 и следующие наборы шифров:","TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384","TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384","TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256","TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256","TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384","TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384","TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256","TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256","TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256","TLS_DHE_RSA_WITH_AES_256_GCM_SHA384","TLS_DHE_RSA_WITH_AES_256_CBC_SHA256","TLS_DHE_RSA_WITH_AES_128_CBC_SHA256","TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256","Чтобы настроить HTTPS-соединение, вам необходимо указать следующие параметры в файле конфигурации режима HTTP:","Путь к файлу закрытого ключа (элемент ServerSettings > TlsCertificateKeyFile).","Путь к файлу сертификата (элемент ServerSettings > TlsCertificateFile).","Протокол https (элемент ServerSettings > ConnectionString).","Кроме того, вы можете настроить HTTPS-соединение с помощью Kaspersky Scan Engine GUI.","Ниже приведен пример того, как сгенерировать файлы закрытого ключа и сертификата.","Чтобы сгенерировать закрытый ключ и сертификат (Linux):","Перейдите в /opt/kaspersky/ScanEngine/tools.","Выполните следующую команду:","./openssl req -new -x509 -config openssl.cnf -newkey ec -pkeyopt ec_paramgen_curve:secp384r1 -nodes -days 3650 -subj \"/C=RU/CN=localhost\" -keyout kavhttpd.key -out kavhttpd.cert","В /opt/kaspersky/ScanEngine/tools создаются два файла:","kavhttpd.key – закрытый ключ.","kavhttpd.cert – сертификат.","Чтобы сгенерировать закрытый ключ и сертификат (Windows):","Перейдите в %service_dir%\\tools.","Выполните следующую команду:","openssl.exe req -new -x509 -config openssl.cnf -newkey ec -pkeyopt ec_paramgen_curve:secp384r1 -nodes -days 3650 -subj \"/C=RU/CN=localhost\" -keyout kavhttpd.key -out kavhttpd.cert","В %service_dir%\\tools создаются два файла:","kavhttpd.key – закрытый ключ.","kavhttpd.cert – сертификат."," HTTPS-соединения ","210245.htm"));
Page.push(new Array("Экземпляры и кластеры","Вы можете установить несколько экземпляров Kaspersky Scan Engine в своей инфраструктуре в режиме HTTP, ICAP или в обоих режимах. Если вам нужно несколько экземпляров, вы можете сгруппировать их в кластеры. Кластер – это набор экземпляров Kaspersky Scan Engine, использующих одну и ту же базу данных kavebase. Это позволяет пользователям получать доступ к Kaspersky Scan Engine GUI любого из установленных экземпляров и выполнять следующие действия:","Наблюдать за служебными событиями всех установленных экземпляров Kaspersky Scan Engine.","Наблюдать за результатами проверки всех установленных экземпляров Kaspersky Scan Engine.","Проверять информацию о каждом установленном экземпляре Kaspersky Scan Engine:","Статус экземпляра (включен или выключен).","Версия антивирусных баз.","Управлять настройками каждого установленного экземпляра Kaspersky Scan Engine:","Включать или выключать логирование.","Обновлять антивирусные базы.","Вы можете настроить несколько экземпляров Kaspersky Scan Engine одновременно с помощью профилей настройки. Профиль настроек – это набор параметров Kaspersky Scan Engine, которые можно применить к одному или нескольким экземплярам. Профили настроек создаются с помощью Kaspersky Scan Engine GUI.","В текущей версии Kaspersky Scan Engine отсутствует балансировщик для распределения запросов на сканирование между разными экземплярами Kaspersky Scan Engine. Если вы хотите распределять запросы на сканирование, вам необходимо использовать сторонний балансировщик.","Использование нескольких экземпляров Kaspersky Scan Engine"," Экземпляры и кластеры ","211897.htm"));
Page.push(new Array("Использование Kaspersky Scan Engine в режиме ICAP с Oracle Solaris Vscan","Вы можете настроить Kaspersky Scan Engine для работы с Oracle Solaris Vscan.","Чтобы настроить Kaspersky Scan Engine для работы с Oracle Solaris Vscan с помощью Kaspersky Scan Engine GUI:","Перейдите на страницу Settings > Service.","В поле Response mode address укажите avscan.","Сохраните изменения.","Чтобы настроить Kaspersky Scan Engine для работы с Oracle Solaris Vscan с помощью файла конфигурации режима ICAP:","Откройте kavicapd.xml для редактирования.","В элементе ICAPSettings > RespModeAddress укажите avscan.","Сохраните и закройте kavicapd.xml.","Перезапустите Kaspersky Scan Engine, выполнив следующую команду:\nservice kavicapd restart "," Использование Kaspersky Scan Engine в режиме ICAP с Oracle Solaris Vscan ","212974.htm"));
Page.push(new Array("Об обновлении","Благодаря регулярному обновлению антивирусных баз и обновляемых модулей Kaspersky Scan Engine будет поддерживать высокий уровень безопасности. Смотрите также рекомендации по обновлению антивирусных баз.","Для обновления антивирусных баз и модулей у вас должен быть действующий файл ключа или код активации Kaspersky Scan Engine.","При обновлении антивирусных баз и модулей Kaspersky Scan Engine передает в \"Лабораторию Касперского\" зашифрованную строку User-Agent. Вы также можете посмотреть полный список данных, которые передаются в \"Лабораторию Касперского\" при обновлении.","Kaspersky Scan Engine поддерживает следующие методы обновления:","Регулярное обновление с использованием встроенных функций Kaspersky Scan Engine.\nЭтот метод не требует установки дополнительного программного обеспечения. \nРекомендуется использовать этот метод. ","Обновление с помощью Updater SDK\nВы можете использовать Updater SDK для загрузки обновлений и создания зеркальных серверов для обновлений. \nUpdater SDK, включая документацию по Updater SDK API, поставляется в виде отдельного пакета. ","Обновление вручную\nНе рекомендуется использовать этот метод. ","Обновление с помощью встроенных функций Kaspersky Scan Engine","Чтобы настроить регулярное обновление с помощью встроенных функций Kaspersky Scan Engine:","Если вы используете Kaspersky Scan Engine в режиме HTTP, настройте обновление для режима HTTP.","Если вы используете Kaspersky Scan Engine в режиме ICAP, настройте обновление для режима ICAP.","Вы также можете настроить обновление в Kaspersky Scan Engine GUI.","Обновление с помощью Updater SDK","Updater SDK позволяет обновлять Kaspersky Scan Engine и создавать зеркала для хранения копий обновлений антивирусных баз и обновляемых модулей. Копии загружаются с серверов обновлений \"Лаборатории Касперского\". Эти зеркала могут быть развернуты в пределах локальной сети предприятия, чтобы можно было один раз восстановить обновления, а затем распространить их на несколько рабочих мест в локальной сети без необходимости каждый раз связываться с серверами обновлений \"Лаборатории Касперского\". Вы также можете использовать Updater SDK для загрузки обновленных антивирусных баз на компьютеры с установленным Kaspersky Scan Engine.","Дополнительные сведения об обновлении с помощью Updater SDK см. в документации к Updater SDK. Вы можете получить документацию Updater SDK у представителя \"Лаборатории Касперского\", предоставившего вам пакет распространения Kaspersky Scan Engine.","Обновление вручную","Не рекомендуется использовать этот метод.","Обновлять антивирусные базы вручную можно следующими способами:","В режиме HTTP по запросу.","Отправив сигнал SIGUSR2 в режиме ICAP.","Нажав кнопку Update на панели управления Kaspersky Scan Engine.","О процедуре обновления","Обновления доступны через серверы обновлений \"Лаборатории Касперского\", которые представляют собой выделенные серверы в интернете, которые обслуживаются \"Лабораторией Касперского\" и на которых установлены самые последние версии файлов, предоставленных \"Лабораторией Касперского\". Kaspersky Scan Engine также может загружать обновления с зеркальных серверов, созданных с помощью Updater SDK.","При получении обновлений из инфраструктуры \"Лаборатории Касперского\" данные передаются по защищенному каналу. Можно использовать протокол HTTPS (TLS). Используемый протокол выбирается инфраструктурой \"Лаборатории Касперского\".","В процессе обновления Kaspersky Scan Engine загружаются следующие данные:","Файлы определений вредоносных программ.\nВ определениях вредоносных программ хранятся данные сигнатур вредоносных программ. Компоненты сканирования Kaspersky Scan Engine используют эти определения для обнаружения. ","Обновления для обновляемых модулей.\nВ обновляемых модулях реализованы расширенные методы обнаружения в Kaspersky Scan Engine. ","Для выполнения обновлений используется техника дифференциальной загрузки. Kaspersky Scan Engine скачивает только ту часть файла, которая изменилась с момента последнего обновления.","Получение информации о текущих антивирусных базах","Вы можете получить информацию о текущих антивирусных базах следующими способами:","На панели управления Kaspersky Scan Engine.","Отправив HTTP-запрос (в режиме HTTP).","Из статуса службы kavicapd, который вызывается командой status (в режиме ICAP)."," Об обновлении ","218188.htm"));
Page.push(new Array("Резервное копирование и восстановление антивирусных баз","Проблемы с подключением во время загрузки обновлений Kaspersky Scan Engine могут повредить антивирусные базы. По этой причине в Kaspersky Scan Engine есть механизм их автоматического восстановления.","Вы можете настроить резервное копирование следующими способами:","Используйте переключатель Back up the anti-virus database в Kaspersky Scan Engine GUI. Чтобы включить резервное копирование, активируйте этот переключатель.","Укажите параметр DisableBackup в файле конфигурации kavhttpd.xml (режим HTTP). Чтобы включить резервное копирование, установите для этого параметра значение 0.","Укажите параметр DisableBackup в файле конфигурации kavicapd.xml (режим ICAP). Чтобы включить резервное копирование, установите для этого параметра значение 0.","Убедитесь, что ваш жесткий диск имеет достаточно свободного места для полной копии антивирусных баз.","Если KAV Engine не запускается с недавно обновленными антивирусными базами, Kaspersky Scan Engine автоматически восстанавливает предыдущую версию антивирусных баз из резервной копии при следующей инициализации.","После завершения восстановления антивирусных баз Kaspersky Scan Engine удаляет резервную копию. Если резервная копия не найдена, Kaspersky Scan Engine попытается выполнить инициализацию с использованием текущих антивирусных баз.","Когда проблемы с подключением будут решены, попробуйте выполнить обновление еще раз."," Резервное копирование и восстановление антивирусных баз ","218259.htm"));
Page.push(new Array("Использование сокращенного набора баз","Вы можете использовать сокращенный набор баз вместо полного набора баз. Сокращенный набор баз меньше по размеру, чем полный набор баз, и при использовании занимает меньше оперативной памяти. Чтобы обеспечить такой же коэффициент обнаружения, как и при использовании полного набора баз, вы должны использовать сокращенный набор баз вместе с KSN.","Сокращенный набор баз и KSN","Не рекомендуется использовать сокращенный набор баз без KSN, так как коэффициент обнаружения будет ниже, чем при использовании полного набора баз. В случае отсутствия связи с серверами KSN (например, когда нет доступа в интернет) рекомендуется перейти на полный набор баз.","Если вы загружаете базы на зеркальные серверы, всегда обновляйте как сокращенный, так и полный набор баз, чтобы полный набор баз был актуальным при переходе Kaspersky Scan Engine на него.","Переход на сокращенный набор баз с помощью встроенного функционала Kaspersky Scan Engine","В инструкции ниже показан сценарий перехода на сокращенный набор баз с использованием встроенного функционала Kaspersky Scan Engine.","Чтобы перейти на сокращенный набор баз:","Убедитесь, что текущая лицензия поддерживает использование KSN.","Включите KSN одним из следующих методов:","Флаг KAV_SHT_ENGINE_KSN в режиме HTTP.","Параметр UseKSN в разделе KSNSetting файла конфигурации режима ICAP в режиме ICAP.\n\n\nУбедитесь, что вы прочитали и приняли Пользовательское соглашение с конечным пользователем (EULA). Вы можете найти текст Пользовательского соглашения в /doc/ksn_license.txt. Чтобы принять Пользовательское соглашение, для параметра Settings > EULA > KSN в файле конфигурации klScanEngineUI.xml необходимо установить значение accepted. ","Включить переключатель Enable reputation checking в настройках сканирования в Kaspersky Scan Engine GUI.","Чтобы начать использовать сокращенный набор баз, в режимах HTTP и ICAP укажите 1 для параметра UseReducedBases файлов конфигурации kavhttpd.xml и kavicapd.xml. По умолчанию используется значение 0.","Перезапустите kavhttpd (в режиме HTTP) или kavicapd (в режиме ICAP).","Обратите внимание, что полный набор баз не удаляется и остается на жестком диске.","Переход на полный набор баз с помощью встроенного функционала Kaspersky Scan Engine","В приведенном ниже сценарии показано, как перейти на полный набор баз с помощью встроенных функций Kaspersky Scan Engine.","Чтобы перейти на полный набор баз:","Установите для параметра UseReducedBases значение 0 (см. UseReducedBases для режима HTTP или ICAP).","Перезапустите kavhttpd (в режиме HTTP) или kavicapd (в режиме ICAP).","Обратите внимание, что сокращенный набор баз не удаляется и остается на жестком диске.","Переход с полного набора баз на сокращенный набор баз и удаление полного набора баз","Чтобы переключиться с полного набора баз на сокращенный, а затем удалить полный набор баз, необходимо сделать следующее:","Выполните шаги с 1-го по 4-й из подраздела \"Переход на сокращенный набор баз с помощью встроенных функций Kaspersky Scan Engine\" (см. выше).","Нажмите Update from scratch на панели управления Kaspersky Scan Engine.","После этого будет загружен сокращенный набор баз."," Использование сокращенного набора баз ","218262.htm"));
Page.push(new Array("Рекомендации по обновлению антивирусных баз","Перечисленные здесь рекомендации помогут вам поддерживать высокий уровень безопасности в Kaspersky Scan Engine.","Избегайте использования устаревших или сильно устаревших антивирусных баз. Если Kaspersky Scan Engine устарел, максимальная защита не может быть гарантирована.","Не загружайте на постоянной основе обновления в пустую директорию","В некоторых случаях общедоступные серверы обновлений \"Лаборатории Касперского\" не содержат некоторых компонентов для обновления. Поэтому не рекомендуется регулярно обновлять базы с нуля (загружать антивирусные базы с сервера обновлений в пустую директорию). В противном случае Kaspersky Scan Engine может не запуститься или работать некорректно. Убедитесь, что целевая директория, в которую загружаются обновления, содержит существующие антивирусные базы. Если у вас возникли проблемы с обновлением существующих антивирусных баз, вы можете попробовать использовать антивирусные базы из пакета распространения.","Запланируйте ежедневное обновление","Вы должны запускать процедуру обновления и получать новые описания вредоносных программ и обновления для модулей не реже одного раза в час.","Эта мера снижает вероятность того, что KSN станет недоступным из-за просроченного файла ключа шифрования KSN.","Файл ключа шифрования KSN используется для защиты коммуникации между Kaspersky Scan Engine и серверами KSN. Этот файл обновляется во время регулярной процедуры обновления антивирусных баз. По умолчанию Kaspersky Scan Engine проверяет состояние файла ключа шифрования KSN при каждом обновлении, и, если срок действия текущего файла ключа шифрования KSN истек, во время обновления загружается новый ключ.","При рассмотрении обновлений необходимо использовать следующую классификацию ниже.","Классификация актуальности антивирусных баз","Антивирусные базы считаются","Время последнего обновления","Актуальны","Менее суток назад.","Устарели","Менее трех дней назад.","Чрезвычайно устарели","Больше недели назад.","Используйте сокращенный набор баз","Вы можете использовать сокращенный набор баз, если хотите уменьшить занимаемое Kaspersky Scan Engine пространство на жестком диске.","Используйте резервную копию антивирусных баз","Рекомендуем включить резервное копирование антивирусных баз. Если Kaspersky Scan Engine не может инициализироваться после обновления, он может восстановить антивирусные базы из резервной копии."," Рекомендации по обновлению антивирусных баз ","218298.htm"));
Page.push(new Array("Обновление с HTTPS-сервера","Эта функция доступна в Kaspersky Scan Engine, начиная с версии 2.0.","Вы можете настроить среду для получения обновлений с HTTPS-сервера.","Чтобы настроить обновление с HTTPS-сервера:","Создайте HTTPS-сервер как зеркало для хранения файлов антивирусных баз.","На HTTPS-сервере настройте Updater SDK (или утилиту keep-up-to-date) для выполнения обновления и распространения файлов антивирусных баз.","Вы должны использовать Updater SDK или утилиту keep-up-to-date на HTTPS-сервере. Невозможно создать или настроить зеркальный сервер с помощью Kaspersky Scan Engine. Вы можете получить Updater SDK у представителя \"Лаборатории Касперского\", который предоставил вам пакет распространения Kaspersky Scan Engine.","Настройте Kaspersky Scan Engine для загрузки обновлений с HTTPS-сервера на компьютерах, которые будут использовать HTTPS-сервер.","Для службы kavhttpd или kavicapd выполните следующие действия.","В элементе UpdateSettings > UpdatesCertFile файла конфигурации kavhttpd или kavicapd укажите локальный путь к корневому сертификату ключа, которым подписан TLS-сертификат вашего HTTPS-сервера.\n\n\nВы можете оставить значение этого элемента пустым. ","В элементе UpdateSettings > UpdateSources файла конфигурации kavhttpd или kavicapd укажите адрес HTTPS-сервера.","В элементе UpdateSettings > UseOnlyCustomSources файла конфигурации kavhttpd или kavicapd укажите 1.","В элементе UpdateSettings > CertificateConfirmationAction файла конфигурации kavhttpd или kavicapd укажите значение в соответствии с ожидаемым действием, если сервер обновлений использует недоверенный сертификат.","Перезапустите Kaspersky Scan Engine."," Обновление с HTTPS-сервера ","218349.htm"));
Page.push(new Array("Настройки пользователей (Users)","В этом разделе описан раздел Users на странице Settings.","Если при загрузке веб-страницы произошла ошибка и настройки стали недоступны, перезагрузите страницу.","В разделе Users отображается следующая информация:","Список существующих профилей пользователей.","Для каждого профиля пользователя отображается следующая информация:","Login — уникальное имя пользователя.","Full name — полное имя пользователя. Оно не обязательно должно быть уникальным.","Role","— роль пользователя.","Возможные значения:","Администратор","Оператор","Last login — время и дата последнего входа в систему.","Вы можете добавить новый профиль пользователя, а также отредактировать или удалить существующий.","Добавление нового профиля пользователя","Чтобы добавить новый профиль пользователя:","Нажмите на кнопку Add new user в правом верхнем углу списка пользователей.","Справа появится боковая панель User.","Заполните обязательные поля:","Login\n\n\nУникальное имя пользователя. Обязательное поле.\n","Full name\n\n\nПолное имя пользователя. Это поле необязательное.\n","Password\n\n\nПароль. Обязательное поле. Значение должно соответствовать требованиям к паролю.\n","Confirm password\n\n\nТо же, что и выше. Обязательное поле.\n","Role\n\n\nРоль пользователя. Обязательное поле.\n","Если вы хотите, чтобы Kaspersky Scan Engine отображал местную дату и время вместо даты и времени в формате UTC, активируйте переключатель Use local timezone. Это изменение повлияет только на пользователя, которого вы редактируете.","Нажмите Save.","Редактирование профиля пользователя","Вы не можете изменить роль пользователя для профиля, с которым вы работаете в данный момент.","Чтобы изменить профиль пользователя:","В строке с профилем пользователя, который вы хотите изменить, нажмите кнопку Edit ().\n Справа появится боковая панель User. ","Отредактируйте нужные вам параметры.\nКогда вы меняете логин или пароль профиля пользователя, Kaspersky Scan Engine GUI выходит из этого профиля. Когда вы меняете роль профиля пользователя, изменения вступают в силу при следующем входе в систему с этим профилем. ","Нажмите Save.","Удаление профиля пользователя","Вы не можете удалить профиль пользователя, с которым вы работаете в данный момент.","Чтобы удалить профиль пользователя:","В строке с профилем пользователя, который вы хотите изменить, нажмите кнопку Delete ().\nСправа появится боковая панель Delete user. ","Нажмите Confirm.\nКогда вы удаляете профиль пользователя, Kaspersky Scan Engine GUI выходит из этого профиля. "," Настройки пользователей (Users) ","219610.htm"));
Page.push(new Array("Роли пользователей","Функционал Kaspersky Scan Engine включает разграничение прав доступа для пользователей. Права доступа определяются ролями пользователей, назначенными каждому пользователю Kaspersky Scan Engine. Назначение роли пользователя с ограниченными правами доступа рядовым сотрудникам службы информационной безопасности позволяет им отслеживать и анализировать инциденты, но они не могут изменять конфигурацию Kaspersky Scan Engine.","В Kaspersky Scan Engine есть две роли пользователей:","Администратор имеет полный доступ к функциональности Kaspersky Scan Engine.","Оператор имеет ограниченный доступ к функциональности Kaspersky Scan Engine.","См. таблицу ниже для получения дополнительной информации о функциях, доступных для каждой роли пользователя.","Доступность функциональности Kaspersky Scan Engine для разных ролей пользователей","Kaspersky Scan Engine GUI","Администратор","Оператор","Мониторинг","Доступно","Доступно с ограничениями:","Следующие функции недоступны:","Перезапуск Kaspersky Scan Engine (кнопка Restart).","Обновление антивирусных баз (кнопка Update).","Удаление всех данных из антивирусных баз и получение новых данных (кнопка Update from scratch).","Смена файла ключа или кода активации (кнопка Change).","Ограниченный набор данных в таблице событий. Оператор может просматривать только события, связанные со сканированием, и события, инициированные им самим.","Результаты проверки","Доступно","Доступно с ограничениями.","Оператор не может сбросить результаты проверки (кнопка Reset statistics недоступна).","Настройки","Доступно","Недоступно","Кластер","Доступно","Недоступно"," Роли пользователей ","219850.htm"));
Page.push(new Array("Интеграция Kaspersky Scan Engine с другими решениями","Протокол ICAP дает возможность интегрировать Kaspersky Scan Engine с другими решениями. Поддержка большинства полей, описанных в спецификации ICAP, позволяет интегрировать Kaspersky Scan Engine практически с любым решением, поддерживающим обмен данными по протоколу ICAP. Например, вы можете интегрировать Kaspersky Scan Engine с решениями для управления передачей файлов (MFT), такими как Cleo EDI, Cleo MFT, прокси-серверами, решениями для сетевых хранилищ (NAS) и NextGen Web Firewall (NGWF).","В этом разделе документации описывается только небольшое количество интеграций. Для получения помощи по решениям, не описанным в документации, обратитесь к своему персональному техническому менеджеру."," Интеграция Kaspersky Scan Engine с другими решениями ","219958.htm"));
Page.push(new Array("Использование Kaspersky Scan Engine в режиме ICAP с Dell EMC Isilon","Вы можете настроить Kaspersky Scan Engine для работы с Dell EMC Isilon. Для удобства этот процесс разделен на несколько этапов.","Приведенная ниже инструкция применима к Dell EMC Isilon 9.1. Информацию об интерфейсах других версий см. в документации Dell EMC Isilon.","Шаг 1. Настройка Kaspersky Scan Engine","Чтобы настроить Kaspersky Scan Engine:","Разрешите Kaspersky Scan Engine отправлять код состояния HTTP","204 No Content",", выполнив одно из следующих действий:","Активируйте переключатель Send code 204 в Kaspersky Scan Engine GUI.","Задайте для элемента Allow204 значение 1 в файле конфигурации режима ICAP.","Включите проверку файлов в режиме RESPMOD, выполнив одно из следующих действий:","Установите для объектов, которые необходимо проверить в RESPMOD, значение Files в Kaspersky Scan Engine GUI.","Задайте для элемента ScanInRespMode значение Content в файле конфигурации режима ICAP.","Установите в качестве адреса, который Kaspersky Scan Engine будет использовать для обработки ответов в RESPMOD, значение","avscan",", выполнив любое из следующих действий:","Установите для поля Response mode address значение avscan в Kaspersky Scan Engine GUI.","Задайте для элемента RespModeAddress значение avscan в файле конфигурации режима ICAP.","Шаг 2. Настройка Dell EMC Isilon","Чтобы настроить Dell EMC Isilon:","В интерфейсе веб-администрирования Dell OneFS перейдите в раздел Data Protection > Antivirus > ICAP.","Вкладка ICAP","В области Servers нажмите Add Server.","Откроется диалоговое окно Add ICAP antivirus server.","В диалоговом окне","Add ICAP antivirus server","выполните следующие действия.","В поле Server URL введите адрес Kaspersky Scan Engine: icap://%KSE_IP%:1344/avscan. Здесь %KSE_IP% – это IPv4-адрес.","В поле Server name введите имя сервера, например KasperskyScanEngine.","Нажмите Add Server.","Диалоговое окно Add ICAP antivirus server.","В области","Settings","укажите следующее:","Действие при обнаружении. Например, вы можете выбрать Attempt to truncate file when threat is found.","При необходимости вы можете указать максимальный размер файлов для проверки. Значение по умолчанию: 2 ГБ.","При необходимости вы можете указать префиксы путей. Префиксы путей – это пути в файловой системе, которые запускают сканирование при добавлении к ним файлов.","При необходимости вы можете указать фильтры для имен объектов. Фильтры для имен объектов определяют объекты, которые следует или не следует проверять в режиме On-Access.","При необходимости вы можете включить настройки Enable scan of files on open, Enable file access when scanning fails и Enable scan of files on closed.","При необходимости настройте хранение отчета о проверке.","Нажмите Submit.","Диалоговое окно All scans","Нажмите Switch antivirus service.","Включите Switch ICAP antivirus.","Нажмите Confirm.","Расписание сканирования","Вы можете настроить расписание сканирования для регулярной проверки хранилища.","Чтобы настроить расписание сканирования:","В интерфейсе веб-администрирования Dell OneFS перейдите в раздел Data protection > Antivirus > ICAP > Policies.","Нажмите на кнопку Create an antivirus policy.","Откроется диалоговое окно Create a policy.","Диалоговое окно Create a policy.","Установите флажок Enable antivirus policy.","В текстовом поле Policy name укажите название политики.","Введите описание политики в текстовое поле Description.","Добавьте пути к директориям, которые вы хотите просканировать.","При необходимости вы можете установить ограничение на глубину рекурсии в разделе Recursion depth (не рекомендуется).","Укажите параметры политики воздействия:","При необходимости вы можете выбрать Enable force run of policy regardless of impact policy (не рекомендуется). ","Выберите политику воздействия DEFAULT из раскрывающегося списка Impact Policy.","Выберите вариант Scheduled.","Укажите параметры расписания:","Выберите интервал запуска политики.","Настройте политику для запуска в ожидаемое время.","Нажмите Submit.","Просмотр обнаруженных объектов","Чтобы просмотреть обнаруженные объекты, необходимо сделать следующее:","В интерфейсе веб-администрирования Dell OneFS перейдите в раздел Data Protection > Antivirus > ICAP > Detected Threats.","Список обнаруженных объектов","Это список файлов, которые были помещены в карантин или содержимое которых было удалено, а также имя обнаруженного объекта, путь к файлу, метод лечения, политика и метка времени.","Нажмите на кнопку View details рядом с обнаруженным объектом, чтобы просмотреть подробную информацию.","Чтобы восстановить файл из списка и разрешить пользователю доступ к нему:","Нажмите на раскрывающийся список More. ","Выберите Release file.","Рекомендации","Необходимо настроить как минимум одну копию Kaspersky Scan Engine, чтобы обеспечить проверку на вирусы для каждого кластера Isilon. В стандартной среде для работы с NAS-сервером требуется как минимум два экземпляра Kaspersky Scan Engine. Наличие только одного экземпляра может вызвать отказ в доступе к файлу, и в этом случае экземпляр не отвечает. Кластеры Isilon автоматически балансируют нагрузку между несколькими экземплярами Kaspersky Scan Engine.","Все экземпляры Kaspersky Scan Engine, зарегистрированные в кластере Isilon, должны иметь одинаковую конфигурацию."," Использование Kaspersky Scan Engine в режиме ICAP с Dell EMC Isilon ","219959.htm"));
Page.push(new Array("Интеграция с SIEM-решениями","В этом разделе объясняется, как интегрировать Kaspersky Scan Engine с SIEM-решениями, такими как Splunk, KUMA или ArcSight ESM.","Для интеграции с SIEM-решением Kaspersky Scan Engine должен отправлять в SIEM-решение события системного журнала в формате CEF или SYSLOG."," Интеграция с SIEM-решениями ","220775.htm"));
Page.push(new Array("Интеграция со Splunk","Чтобы интегрировать Kaspersky Scan Engine со Splunk:","Настройте Splunk.","Настройте Kaspersky Scan Engine.","После интеграции Kaspersky Scan Engine со Splunk вы можете искать информацию о событиях, которые Kaspersky Scan Engine отправлял в Splunk."," Интеграция со Splunk ","220777.htm"));
Page.push(new Array("Интеграция с KUMA","Чтобы интегрировать Kaspersky Scan Engine с KUMA:","Настройте KUMA.","Настройте Kaspersky Scan Engine.","После интеграции Kaspersky Scan Engine с KUMA вы можете искать информацию о событиях, которые Kaspersky Scan Engine отправлял в KUMA."," Интеграция с KUMA ","220778.htm"));
Page.push(new Array("Интеграция с ArcSight ESM","Чтобы интегрировать Kaspersky Scan Engine с ArcSight ESM:","Настройте ArcSight ESM.","Настройте Kaspersky Scan Engine.","После интеграции Kaspersky Scan Engine с ArcSight ESM вы можете искать информацию о событиях, которые Kaspersky Scan Engine отправлял в ArcSight ESM."," Интеграция с ArcSight ESM ","220779.htm"));
Page.push(new Array("Настройка Splunk","Для лучшего парсинга событий Kaspersky Scan Engine в формате CEF установите компонент CEF Extraction на свой экземпляр Splunk.","Чтобы настроить Splunk:","Откройте веб-интерфейс Splunk.","Перейдите в Settings > Data inputs.","Выберите Settings > Data inputs.","В разделе Local inputs найдите в списке элемент TCP и нажмите Add new.","Заполните открывшуюся форму:","Port. Укажите порт, на который Kaspersky Scan Engine должен отправлять журналы. Например, 9998.","Source name override. Укажите scanengine.","Добавление нового входа TCP","Нажмите Next.","В следующем окне в разделе","Select Source Type","укажите тип источника:","Укажите cefevents, если вы установили компонент CEF Extraction для Splunk.","Выбор cefevents","Укажите syslog, если вы не установили компонент CEF Extraction для Splunk.","Вы можете указать поля App Context и Index в соответствии с вашими потребностями. Например, вы можете указать индекс событий, отправляемых Kaspersky Scan Engine.","Нажмите Review, чтобы проверить параметры, а затем Submit.","После настройки Kaspersky Scan Engine вы можете проверить правильность конфигурации Splunk.","Чтобы проверить, правильно ли настроен Splunk:","В веб-интерфейсе Splunk откройте Search & Reporting.","Задайте параметры поиска следующим образом:","Если вы ранее указали cefevents в Source Type, введите следующую строку поиска:\n\n\nsource=\"scanengine\" sourcetype=\"cefevents\"  ","Если вы ранее указали syslog в Source Type, введите следующую строку поиска:\n\n\nsource=\"scanengine\" sourcetype=\"syslog\"  ","Time filter: укажите All time (real-time)","Запустите поиск.","Если Splunk настроен правильно, он будет отображать события, отправленные решением Kaspersky Scan Engine, в режиме реального времени.","События, отправленные решением Kaspersky Scan Engine"," Настройка Splunk ","220780.htm"));
Page.push(new Array("Поиск событий Kaspersky Scan Engine в Splunk","Поиск результатов сканирования объекта","Чтобы отобразить события, содержащие результаты сканирования объекта,","используйте следующий поисковый запрос:","source=\"scanengine\" \"Scan result\" msg=*scan* | eval cs2=coalesce(cs2,\"-\") | rename cs1 as \"Scan Result\", cs2 as \"Virus Name\", fname as \"Object\", src as \"Source Address\", fileHash as \"Object Hashsum\" |table _time, \"Object Hashsum\",Object,\"Scan Result\",\"Virus Name\",\"Source Address\"","Поиск результатов сканирования объекта","Поиск результатов сканирования URL-адресов","Чтобы отобразить события, содержащие результаты проверки URL-адреса,","используйте следующий поисковый запрос:","source=\"scanengine\" \"Scan result\" msg=URL* | rename cs1 as \"Scan Result\", request as \"Scanned URL\", src as \"Source Address\" | table _time, \"Scanned URL\", \"Scan Result\", \"Source Address\"","Поиск результатов сканирования URL-адресов"," Поиск событий Kaspersky Scan Engine в Splunk ","220782.htm"));
Page.push(new Array("Настройка KUMA","Чтобы KUMA получал события от Kaspersky Scan Engine, добавьте в KUMA новый Коллектор.","Настройте новый Коллектор следующим образом:","В настройках вкладки Transport установите для параметра Kind значение tcp.\n \nНастройки транспорта ","В настройках Event parsing установите для параметра Parsing method значение cef.\n \nНастройки парсинга событий ","Указанные выше параметры необходимы для интеграции Kaspersky Scan Engine и KUMA. Остальные параметры настройте согласно документации KUMA.","После завершения настройки KUMA вы можете настроить Kaspersky Scan Engine."," Настройка KUMA ","220785.htm"));
Page.push(new Array("Настройка Kaspersky Scan Engine для взаимодействия с SIEM","Чтобы настроить взаимодействие Kaspersky Scan Engine с SIEM-решением:","Откройте Kaspersky Scan Engine GUI.","Перейдите в Settings > Logging.","Включите","Syslog","и установите следующие параметры:","Format: CEF.","Target: Remote host.","Events: укажите типы событий, которые Kaspersky Scan Engine должен отправлять в SIEM-решение. Подробнее о типах событий см. в описании элемента LoggedEvent в разделе Настройка логирования в режиме ICAP.","IP-адрес и порт SIEM-решения.","Настройки системного журнала Kaspersky Scan Engine","Сохраните настройки."," Настройка Kaspersky Scan Engine для взаимодействия с SIEM ","220786.htm"));
Page.push(new Array("Поиск событий Kaspersky Scan Engine в KUMA","Поиск событий из Kaspersky Scan Engine версии 2.1","Чтобы найти в KUMA события, отправленные решением Kaspersky Scan Engine версии 2.1,","В KUMA перейдите на страницу Events.","Укажите параметры поискового запроса следующим образом.","Если Kaspersky Scan Engine работал в режиме ICAP:\n\n\nDeviceVendor = Kaspersky \n\n\nAND \n\n\nDeviceProduct = Scan Engine ICAP Service ","Поисковый запрос KUMA для Kaspersky Scan Engine в режиме ICAP","Если Kaspersky Scan Engine работает в режиме HTTP:\n\n\nDeviceVendor = Kaspersky \n\n\nAND \n\n\nDeviceProduct = Scan Engine HTTP Service ","Поисковый запрос KUMA для Kaspersky Scan Engine в режиме HTTP","Поиск событий из Kaspersky Scan Engine версии 2.0","Чтобы найти в KUMA события, отправленные решением Kaspersky Scan Engine версии 2.0,","В KUMA перейдите на страницу Events.","Укажите параметры поискового запроса следующим образом.","Если Kaspersky Scan Engine работал в режиме ICAP:\n\n\nDeviceVendor = Kaspersky Lab \n\n\nAND \n\n\nDeviceProduct = Kaspersky ICAP Server ","Если Kaspersky Scan Engine работает в режиме HTTP:\n\n\nDeviceVendor = Kaspersky Lab \n\n\nAND \n\n\nDeviceProduct = Kaspersky HTTP Service "," Поиск событий Kaspersky Scan Engine в KUMA ","220787.htm"));
Page.push(new Array("Настройка ArcSight ESM","Чтобы ArcSight ESM мог получать события от Kaspersky Scan Engine, должен быть установлен ArcSight SmartConnector типа Syslog Daemon. Вы можете установить ArcSight SmartConnector на любой компьютер, который может подключаться к Kaspersky Scan Engine и ArcSight ESM.","Чтобы установить ArcSight SmartConnector:","Запустите программу установки ArcSight SmartConnector.","Эта программа является компонентом HP ArcSight и не входит в состав Kaspersky Scan Engine.","Укажите директорию установки ArcSight SmartConnector (далее %ARCSIGHT_HOME%).","Выберите Don't create links.","После распаковки содержимого двоичного файла выберите Add a Connector.","Выбор Add a Connector","Если это окно не отображается, выполните следующую команду:","%ARCSIGHT_HOME%/current/bin/runagentsetup.sh","Выберите Syslog Daemon в качестве типа коннектора.","Укажите параметры коннектора в форме","Enter the parameter details","следующим образом:","Network port. Укажите порт, на который Kaspersky Scan Engine должен отправлять события обнаружения.\n\n\nУкажите этот же порт в параметрах Kaspersky Scan Engine Syslog. ","IP address. Укажите IP-адрес, на который Kaspersky Scan Engine должен отправлять события обнаружения.\n\n\nУкажите тот же IP-адрес в параметрах Kaspersky Scan Engine Syslog. \n\n\nВы можете указать (ALL), если хотите, чтобы Arcsight SmartConnector получал события со всех сетевых интерфейсов компьютера, на котором он работает. Обратите внимание, что вы не можете указать (ALL) в файле конфигурации Kaspersky Scan Engine. ","Protocol. Укажите Raw TCP.","Forwarder. Укажите false.","Определение параметров коннектора","Нажмите Next.","Укажите ArcSight Manager (encrypted) в качестве типа назначения.","Выбор типа назначения","Нажмите Next.","Укажите параметры назначения:","Manager Hostname. Укажите хост, на котором запущен ArcSight Manager.","Manager Port. Укажите хост, на котором доступен ArcSight Manager. Значение по умолчанию: 8443.","User. Укажите имя пользователя ArcSight ESM, у которого есть права на регистрацию коннектора.","Password. Укажите пароль пользователя ArcSight ESM.","AUP Master Destination. Укажите false.","Filter Out All Events. Укажите false.","Enable Demo CA. Укажите false.","Определение параметров назначения","Нажмите Next.","Укажите детали коннектора:","Имя (можно указать произвольное значение).","Местоположение (можно указать произвольное значение).","Расположение устройства, которое должно отправлять события на коннектор (можно указать произвольное значение или оставить его пустым).","Комментарий к коннектору (можно указать произвольное значение или оставить его пустым).","Нажмите Next.","Если параметры ArcSight Manager действительны, примите импорт сертификата из места назначения.","Если сертификат импортирован успешно, установите сервис ArcSight SmartConnector.","Если вы не запустите установку от имени пользователя root, отобразится следующее предупреждение:","Если вы не запускаете установку от имени пользователя root","Файл %ARCSIGHT_HOME%/current/logs/agent.log содержит сообщения о процессе установки.","Вы можете пропустить следующий шаг, описывающий, как указать параметры службы.","Если вы запускаете установку от имени пользователя root, выберите Install as a service.","Нажмите Next.","Укажите параметры службы.","Рекомендуется установить имя службы, указанное в Service Internal Name, таким же, как имя коннектора.","Определение параметров службы","Нажмите Next.","Чтобы запустить ArcSight SmartConnector, выполните следующую команду:","/etc/init.d/arc_$service_name start","В этой команде $service_name – это внутреннее имя службы.","После завершения настройки ArcSight ESM вы можете настроить Kaspersky Scan Engine."," Настройка ArcSight ESM ","220896.htm"));
Page.push(new Array("Поиск событий Kaspersky Scan Engine в ArcSight ESM","Поиск событий из Kaspersky Scan Engine версии 2.0","Чтобы найти в ArcSight ESM события, отправленные решением Kaspersky Scan Engine версии 2.0,","Укажите параметры поискового запроса следующим образом.","Если Kaspersky Scan Engine работал в режиме ICAP:\nDeviceVendor = Kaspersky Lab \nAND \nDeviceProduct = Kaspersky ICAP Server ","Определение параметров поискового запроса","Если Kaspersky Scan Engine работает в режиме HTTP:\nDeviceVendor = Kaspersky Lab \nAND \nDeviceProduct = Kaspersky HTTP Service ","Поиск событий из Kaspersky Scan Engine версии 2.1","Чтобы найти в ArcSight ESM события, отправленные решением Kaspersky Scan Engine версии 2.1,","Укажите параметры поискового запроса следующим образом.","Если Kaspersky Scan Engine работал в режиме ICAP:\nDeviceVendor = Kaspersky \nAND \nDeviceProduct = Scan Engine ICAP Service ","Если Kaspersky Scan Engine работает в режиме HTTP:\nDeviceVendor = Kaspersky \nAND \nDeviceProduct = Scan Engine HTTP Service "," Поиск событий Kaspersky Scan Engine в ArcSight ESM ","220898.htm"));
Page.push(new Array("Использование Kaspersky Scan Engine с F5 BIG-IP Application Security Manager","Вы можете настроить Kaspersky Scan Engine для работы с F5 BIG-IP® Application Security Manager ™ (далее ASM). Для удобства этот процесс разделен на несколько этапов.","Шаг 1. Настройка Kaspersky Scan Engine","Чтобы настроить Kaspersky Scan Engine, выполните любое из следующих действий:","В файле конфигурации режима ICAP установите для элемента VirusNameICAPHeader значение X-Virus-ID.","На странице Service Kaspersky Scan Engine GUI установите значение поля Detected object name HTTP header на X-Virus-ID.","Шаг 2. Настройка ASM","Чтобы настроить ASM:","Войдите в утилиту Configuration.","Перейдите в Security > Options > Application Security > Integrated Services > Anti-Virus Protection.","Антивирусная защита","В поле Server Host Name/IP Address укажите IP-адрес ICAP-сервера Kaspersky Scan Engine.","В поле Server Port Number укажите порт ICAP-сервера Kaspersky Scan Engine или оставьте значение по умолчанию 1344.","Установите флажок Guarantee Enforcement, если вы хотите, чтобы система выполняла проверку на вирусы, даже если это может замедлить работу вашего веб-приложения.","Нажмите Save.","Чтобы сразу же применить изменения политики безопасности, нажмите Apply Policy.","Перейдите в Security > Options > Application Security > Advanced Configuration > System Variables.","Настройте внутренние переменные:","В ASM 13.1.X–16.X:","Для параметра icap_uri введите /req в параметре Parameter Value. Это значение по умолчанию в ReqModeAddress.","Для параметра virus_header_name введите X-Virus-ID в параметре Parameter Value.","Выберите Update.","В ASM 11.X–13.0.X:","Для параметра icap_uri введите /req в параметре Parameter Value. Это значение по умолчанию в ReqModeAddress.","Для параметра virus_header_name введите X-Virus-ID.","Выберите Save.","Настройка блокировки обнаруженных объектов","Чтобы настроить блокировку обнаруженных объектов:","В ASM 13.1.X–16.X:","Войдите в утилиту Configuration.","Перейдите в Security > Application Security > Policy Building > Learning and Blocking Settings.","Установите режим просмотра Advanced.","Раскройте меню Antivirus (раскройте меню Antivirus Protection в версиях ниже 14.X) и установите флажки Alarm и Block для типа нарушения Virus Detected или оба.","Нажмите Save.","Чтобы сразу же активировать изменения политики безопасности, выберите Apply Policy.","В ASM 12.X:","Войдите в утилиту Configuration.","Перейдите в Security > Application Security > Policy Building > Learning and Blocking Settings.","Установите режим просмотра Advanced.","Раскройте меню Policy General Features и установите флажки Alarm и Block для типа нарушения Virus Detected.","Нажмите Save.","Чтобы сразу же применить изменения политики безопасности, нажмите Apply Policy.","В ASM 11.X:","Войдите в утилиту Configuration.","Перейдите в Security > Application Security > Blocking.","В разделе Violations List для параметра Negative Security Violations установите флажки Alarm и Block для типа нарушения Virus Detected.","Нажмите Save.","Чтобы сразу же активировать изменения политики безопасности, нажмите Apply Policy.","Настройка сканирования загружаемых файлов и вложений электронной почты","Чтобы настроить сканирование загружаемых файлов и вложений электронной почты:","Перейдите в Security > Application Security > Integrated Services > Anti-Virus Protection.","Выберите соответствующую политику безопасности из списка.","Установите флажок Inspect file uploads within HTTP requests.","Чтобы проверить вложения SOAP, переместите соответствующие XML-профили из списка Antivirus Protection Disabled в список Antivirus Protection Enabled.","Нажмите Save.","Чтобы сразу же применить изменения политики безопасности, нажмите Apply Policy.\n \nПрименить политику ","Просмотр обнаруженных объектов","Чтобы просмотреть отчеты об обнаруженных объектах:","Войдите в утилиту Configuration.","Перейдите в Security > Reporting > Application > Charts.","В списке диаграмм выберите Top Viruses Detected.\nСистема будет отображать обнаруженные вирусы с течением времени. "," Использование Kaspersky Scan Engine с F5 BIG-IP Application Security Manager ","221109.htm"));
Page.push(new Array("Аудит системы","Только для систем Linux.","Kaspersky Scan Engine включает функцию аудита системы. Если используется Kaspersky Scan Engine GUI, аудит системы включен по умолчанию и его нельзя выключить. Кроме того, когда вы включаете логирование системного журнала, Kaspersky Scan Engine также предлагает вам включить аудит системы.","С помощью аудита системы намного проще контролировать работу Kaspersky Scan Engine и анализировать инциденты безопасности, когда они происходят.","Для анализа инцидентов может потребоваться следующая информация:","Кто или что является инициатором события, связанного с инцидентом.","Какие действия предпринял инициатор и были ли они успешными.","Если инициатором является пользователь Kaspersky Scan Engine, то кто предоставил пользователю права доступа.","Как изменились параметры Kaspersky Scan Engine.","На панели управления Kaspersky Scan Engine вы можете найти информацию об инициаторах событий и детали событий.","Пользователи с ролью Оператор могут просматривать только события, связанные со сканированием, и события, инициированные ими самими. Пользователи с ролью Администратор могут просматривать информацию без ограничений. См. также подробную информацию о ролях пользователей.","Если вы не используете Kaspersky Scan Engine GUI, можно найти информацию о событиях в сообщениях системного журнала."," Аудит системы ","221141.htm"));
Page.push(new Array("Идентификация инициатора события","У каждого события в Kaspersky Scan Engine есть Initiator – кто-то или что-то, что явилось причиной события.","Вы можете найти информацию об инициаторе на панели управления Kaspersky Scan Engine в столбце Initiator таблицы событий. Если вы хотите отобразить события, вызванные определенным инициатором, можно использовать фильтр Initiator.","В столбце Initiator возможны следующие значения:","Имя пользователя (логин). Это значение означает, что пользователь инициировал событие через Kaspersky Scan Engine GUI. Например, вошел в систему или перезапустил Kaspersky Scan Engine, нажав на кнопку Restart.","Service Scan Engine. Это значение указывает, что Kaspersky Scan Engine инициировал событие самостоятельно или по команде пользователя. Например, Kaspersky Scan Engine может запускать обновление по расписанию или запускать обновление после нажатия пользователем кнопки Update. Нажатие на кнопку Update здесь – это событие, инициированное пользователем, а запуск обновления – это отдельное событие, инициированное Kaspersky Scan Engine.","IP address. Это значение указывает, что HTTP- или ICAP-клиент отправил запрос к Kaspersky Scan Engine API. Например, отправил файл на проверку.\nIP-адрес инициатора запроса на сканирование также отображается в столбце Client таблицы результатов сканирования. Вы можете найти эту таблицу на странице Scan results в Kaspersky Scan Engine GUI. ","Вы также можете найти информацию об инициаторе в сообщениях системного журнала."," Идентификация инициатора события ","221146.htm"));
Page.push(new Array("SendInfectionFoundICAPHeader","Указывает, включает ли Kaspersky Scan Engine заголовок X-Infection-Found в свой ответ ICAP-клиенту.","Этот элемент необязателен. Если он отсутствует в файле конфигурации, используется значение 0.","Путь","ICAPSettings > SendInfectionFoundICAPHeader","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента SendInfectionFoundICAPHeader","Значение","Описание","1","Включить заголовок X-Infection-Found в ответы ICAP-клиенту.","0","Не включать заголовок X-Infection-Found в ответы ICAP-клиенту.","Пример","Ниже приведен пример этого элемента.","<SendInfectionFoundICAPHeader>1</SendInfectionFoundICAPHeader>"," SendInfectionFoundICAPHeader ","221147.htm"));
Page.push(new Array("Получение подробной информации о событиях на панели управления","Вы можете найти подробную информацию о любом событии на панели управления Kaspersky Scan Engine в столбце Details таблицы событий.","Подробная информация включает в себя следующие данные:","Какие действия были предприняты.","Было ли действие успешным или нет.","Дополнительная информация, если есть.","С точки зрения безопасности наиболее важными являются события, содержащие информацию о следующих действиях:","Вход пользователя в Kaspersky Scan Engine GUI.","Попытка войти с неверными учетными данными.","Включение или выключение модуля сканирования.","Создание, изменение или удаление учетной записи пользователя.","Изменение настроек Kaspersky Scan Engine."," Получение подробной информации о событиях на панели управления ","221150.htm"));
Page.push(new Array("Заголовки ответов","X-Include","Kaspersky Scan Engine включает этот заголовок в свой ответ на запрос OPTIONS от ICAP-клиента при выполнении следующих условий:","Существует по крайней мере один элемент","ICAPHeader",", который содержит значение","HTTPUserNameICAPHeader","или","HTTPClientIpICAPHeader",":","Если HTTPUserNameICAPHeader указан в ICAPHeader, должен быть элемент HTTPUserNameICAPHeader, и он не должен быть пустым.","Если HTTPClientIpICAPHeader указан в ICAPHeader, должен быть элемент HTTPClientIpICAPHeader, и он не должен быть пустым.","Заголовок X-Include включает заголовки, указанные в HTTPUserNameICAPHeader и HTTPClientIpICAPHeader в виде списка, разделенного запятыми. Значения по умолчанию для этих заголовков – X-Client-Username и X-Client-IP соответственно. Ниже приведен пример заголовка X-Include:","X-Include: X-Client-IP, X-Client-Username","Заголовок X-Include также может включать только один из этих заголовков, например:","X-Include: X-Client-Username","RequestingICAPHeaders указывает, какие заголовки включены в X-Include.","X-Infection-Found","Этот заголовок содержит типы обнаруженных угроз или легитимных объектов, которые могут быть использованы злоумышленниками. Вы можете указать, будет ли Kaspersky Scan Engine включать этот заголовок в свой ответ в элементе SendInfectionFoundICAPHeader. Заголовок будет присутствовать только в том случае, если во время проверки обнаружена угроза или легитимный объект, который может быть использован злоумышленниками.","Заголовок имеет следующий формат:","X-Infection-Found: Type=0; Resolution=0; Threat={Threat_type};","Здесь {Threat_type} – это тип угрозы или легальной программы, которая может быть использована злоумышленниками. Если Kaspersky Scan Engine обнаруживает несколько объектов, все типы перечисляются через запятую (,).","В текущей версии Kaspersky Scan Engine значения Type и Resolution всегда равны 0.","X-Response-Desc","Этот заголовок содержит описания обнаруженных угроз или легитимных объектов, которые могут быть использованы злоумышленниками. Вы можете указать, включает ли Kaspersky Scan Engine этот заголовок в свой ответ в элементе SendResponseDescICAPHeader. Заголовок будет присутствовать только в том случае, если во время проверки обнаружена угроза или легитимный объект, который может быть использован злоумышленниками.","Заголовок имеет следующий формат:","X-Response-Desc: {Text}","Здесь {Text} может иметь следующие значения:","Значение","Описание","Trojan malicious object detected","Обнаружен троянец.","Malicious tool detected","Обнаружено вредоносное ПО.","Highly dangerous malicious object detected","Обнаружен особо опасный вредоносный объект, который не классифицируется ни по одному из доступных классов вредоносных программ.","Medium dangerous malicious object detected","Обнаружен вредоносный объект средней опасности, который не классифицируется ни по одному из доступных классов вредоносных программ.","Virware malicious object detected","Обнаружена программа, которая заражает другие файлы, добавляя к ним свой код, чтобы получить контроль над зараженными файлами при их открытии.","Malicious URL","Обнаружен вредоносный URL-адрес.","Phishing URL","Обнаружен фишинговый URL-адрес.","Malicious host","Обнаружен IP-адрес вредоносного хоста.","Adware URL","Обнаружен URL-адрес, ведущий к рекламному ПО.","Riskware URL","Обнаружен URL-адрес легальной программы, которая может быть использована злоумышленниками.","Adware host","Обнаружен IP-адрес рекламного ПО.","Riskware host","Обнаружен IP-адрес хоста, на котором хранится легальная программа, которая может быть использована злоумышленниками.","Detected legitimate software that can be used by intruders to damage your computer or personal data","Обнаружена программа, которая не имеет вредоносных функций, но может быть частью среды разработки вредоносных программ.","Detected an attempt of unauthorized use of pay-per-use Internet services which are commonly pornographic websites (pornodialer), or pornotools, or a pornodownloader","Обнаружена попытка несанкционированного использования платных интернет-сервисов (как правило, порнографических сайтов).","Adware detected","Обнаружен URL-адрес, ведущий к рекламному ПО.","Multiple threats detected","Обнаружено несколько объектов.","Detected a highly dangerous malicious object that cannot be classified using either of available classes of malware","Обнаружен особо опасный неклассифицированный объект.","MS Office document containing a macro is detected","Обнаружен документ Microsoft Office, содержащий макрос.","X-Response-Info","Этот заголовок содержит статус проверяемого объекта или ответ на запросы OPTIONS. Вы можете указать, включает ли Kaspersky Scan Engine этот заголовок в свой ответ в элементе SendResponseInfoICAPHeader.","Заголовок имеет следующий формат:","X-Response-Info: {Token}","Здесь {Token} может иметь следующие значения:","Значение","Описание","Allowed","Проверяемый файл или URL-адрес не являются вредоносными.","Blocked","Этот ответ может появиться по следующим причинам:","Обнаружена угроза или легальная программа, которая может быть использована злоумышленниками.","Обнаружен макрос.","Options","Ответ на запросы OPTIONS.","X-Violations-Found","Этот заголовок содержит информацию о проверяемом файле и об угрозах или легальной программе, которая может быть использована злоумышленниками, обнаруженными в этом файле. Вы можете указать, будет ли Kaspersky Scan Engine включать этот заголовок в свой ответ в элементе SendViolationsFoundICAPHeader. Заголовок будет присутствовать только в том случае, если во время проверки обнаружена угроза или легитимный объект, который может быть использован злоумышленниками.","Заголовок имеет следующий формат:","X-Violations-Found: {Count}","{File_name}","{Description}","{Problem_ID}","{Resolution_ID}","Здесь {count} – это количество объектов, которые были обнаружены в файле, {File_name} – имя файла, {Description} – имя первой обнаруженной угрозы или легитимного объекта, который может быть использован злоумышленниками в файле, {Problem_ID} – идентификатор обнаруженной угрозы или легитимного объекта, который может быть использован злоумышленниками, {Resolution_ID} – идентификатор действия над объектом, выполняемого Kaspersky Scan Engine.","В текущей версии Kaspersky Scan Engine значение {Resolution_ID} всегда равно 0."," Заголовки ответов ","221159.htm"));
Page.push(new Array("SendResponseDescICAPHeader","Указывает, включает ли Kaspersky Scan Engine заголовок X-Response-Desc в свой ответ ICAP-клиенту.","Этот элемент необязателен. Если он отсутствует в файле конфигурации, используется значение 0.","Путь","ICAPSettings > SendResponseDescICAPHeader","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента SendResponseDescICAPHeader","Значение","Описание","1","Включить заголовок X-Response-Desc в ответы ICAP-клиенту.","0","Не включать заголовок X-Response-Desc в ответы ICAP-клиенту.","Пример","Ниже приведен пример этого элемента.","<SendResponseDescICAPHeader>1</SendResponseDescICAPHeader>"," SendResponseDescICAPHeader ","221160.htm"));
Page.push(new Array("SendResponseInfoICAPHeader","Указывает, включает ли Kaspersky Scan Engine заголовок X-Response-Info в свой ответ ICAP-клиенту.","Этот элемент необязателен. Если он отсутствует в файле конфигурации, используется значение 0.","Путь","ICAPSettings > SendResponseInfoICAPHeader","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента SendResponseInfoICAPHeader","Значение","Описание","1","Включить заголовок X-Response-Info в ответы ICAP-клиенту.","0","Не включать заголовок X-Response-Info в ответы ICAP-клиенту.","Пример","Ниже приведен пример этого элемента.","<SendResponseInfoICAPHeader>1</SendResponseInfoICAPHeader>"," SendResponseInfoICAPHeader ","221161.htm"));
Page.push(new Array("SendViolationsFoundICAPHeader","Указывает, включает ли Kaspersky Scan Engine заголовок X-Violations-Found в свой ответ ICAP-клиенту.","Этот элемент необязателен. Если он отсутствует в файле конфигурации, используется значение 0.","Путь","ICAPSettings > SendViolationsFoundICAPHeader","Атрибуты","Этот элемент не имеет атрибутов.","Возможные значения","Этот элемент имеет следующие возможные значения.","Возможные значения элемента SendViolationsFoundICAPHeader","Значение","Описание","1","Включить заголовок X-Violations-Found в ответы ICAP-клиенту.","0","Не включать заголовок X-Violations-Found в ответы ICAP-клиенту.","Пример","Ниже приведен пример этого элемента.","<SendViolationsFoundICAPHeader>1</SendViolationsFoundICAPHeader>"," SendViolationsFoundICAPHeader ","221162.htm"));
Page.push(new Array("Получение подробной информации о событиях из системного журнала","Если логирование системного журнала включено, Kaspersky Scan Engine отправляет информацию о событиях демону syslog в формате CEF или RAW.","В формате CEF информация включает:","Название события.","Уровень важности события. Чем выше уровень, тем важнее событие.","IP-адрес компьютера, на котором запущен Kaspersky Scan Engine, в формате IPv4.","Имя хоста компьютера, на котором запущен Kaspersky Scan Engine.","Описание события.","В формате RAW информация включает описание события."," Получение подробной информации о событиях из системного журнала ","221189.htm"));
Page.push(new Array("UseAlways","Указывает, всегда ли Kaspersky Scan Engine использует постоянное соединение Keep-alive, даже если клиенты ICAP не запрашивают его.","Этот элемент необязателен.","Путь","ICAPSettings > KeepAliveSettings > UseAlways","Атрибуты","Этот элемент не имеет атрибутов.","Значение","Допустимые значения:","0 – указывает, всегда ли Kaspersky Scan Engine использует постоянное соединение Keep-alive, даже если клиенты ICAP не запрашивают его.","1 – Kaspersky Scan Engine всегда использует постоянное соединение Keep-alive.","Значение по умолчанию: 0.","Пример","Ниже приведен пример этого элемента.","<UseAlways>0</UseAlways>"," UseAlways ","221376.htm"));
Page.push(new Array("Экспорт настроек","Вы можете экспортировать параметры Kaspersky Scan Engine в виде ZIP-архива с набором файлов конфигурации.","В архиве находятся следующие файлы конфигурации:","klScanEngineUI.xml","Для режима HTTP:","kavhttpd.xml","httpdkavlog.ini","Для режима ICAP:","kavicapd.xml","icapdkavlog.conf","Чтобы экспортировать настройки,","Нажмите кнопкуExport configuration files в левом нижнем углу любой страницы параметров Kaspersky Scan Engine."," Экспорт настроек ","221467.htm"));
Page.push(new Array("Использование Kaspersky Scan Engine в режиме ICAP с GoAnywhere MFT","Вы можете настроить Kaspersky Scan Engine для работы с GoAnywhere MFT. Для удобства этот процесс разделен на несколько этапов.","Настройка Kaspersky Scan Engine","Для интеграции с GoAnywhere MFT Kaspersky Scan Engine должен работать в режиме ICAP.","Чтобы настроить Kaspersky Scan Engine:","Включите отправку кода состояния HTTP 204 No Content. Сделать это можно следующими способами:","В Kaspersky Scan Engine GUI активируйте переключатель Send code 204 на странице настроек службы.","В файле конфигурации режима ICAP укажите 1 в элементе Allow204.","Настройка GoAnywhere MFT для работы с Kaspersky Scan Engine","Чтобы добавить Kaspersky Scan Engine в GoAnywhere MFT:","В веб-консоли GoAnywhere MFT откройте страницу Resources.","В списке Resource Types выберите ICAP Servers.","GoAnywhere MFT. ICAP-серверы","Нажмите на кнопку Add ICAP Server.","Заполните открывшуюся форму:","Name. Укажите любое имя для сервера Kaspersky Scan Engine. Например, Kaspersky Scan Engine ICAP.","URL. Укажите URL-адрес, который Kaspersky Scan Engine использует в режиме ответа. То есть URL-адрес должен содержать часть, определяющую метод RESP. Например, icap://{KSE_ICAP}:1344/resp.","GoAnywhere MFT. Настройки ICAP-сервера Kaspersky Scan Engine","Нажмите на кнопку Test.","GoAnywhere MFT проверяет соединение с недавно добавленным сервером Kaspersky Scan Engine. Пример успешного тестирования показан на картинке ниже.","GoAnywhere MFT. Успешное подключение к ICAP-серверу Kaspersky Scan Engine","Нажмите Save.","Теперь вы можете использовать Kaspersky Scan Engine для сканирования объектов из GoAnywhere MFT.","Настройка GoAnywhere MFT завершена","Создание регулярной задачи проверки","Вы можете создать задачу регулярной проверки объектов в Kaspersky Scan Engine.","Чтобы создать регулярную задачу проверки:","В веб-консоли GoAnywhere MFT откройте страницу Workflow/Projects.","Нажмите на кнопку Create a Project.","В открывшейся форме заполните поле Project Name (например, регулярная проверка Kaspersky Scan Engine).","Нажмите Save.","Откроется страница со списком Component Library.","GoAnywhere MFT. Библиотека компонентов","В списке","Component Library",":","а. Дважды нажмите на элемент File System/Create File List, а затем заполните открывшуюся форму:","File List Variable. Укажите files.","Base Directory. Укажите путь к директории, в которой находятся объекты, отправляемые на сканирование в Kaspersky Scan Engine.","GoAnywhere MFT. Параметры списка файлов","б. Дважды нажмите на элемент Loops/For-Each Loop, а затем заполните открывшуюся форму:","Items Variable. Укажите ${files}.","Current Item Variable. Укажите file.","в. Дважды нажмите на элемент Integration/ICAP, а затем заполните открывшуюся форму:","ICAP Server. Укажите ICAP Kaspersky Scan Engine.","Source File. Укажите ${file}.","Output Variables/ICAP Status Code Variable. Укажите icap_resp_code.","GoAnywhere MFT. Параметры интеграции с ICAP-сервером","г. Дважды нажмите на элемент Job Control/If, а затем заполните открывшуюся форму:","Condition. Укажите ${icap_resp_code == 200}.","GoAnywhere MFT. Условие if","д. Дважды нажмите на элемент File System/Delete, а затем заполните открывшуюся форму:","Input Files Variable. Укажите ${file}.","GoAnywhere MFT. Переменная файлов input file","Специалисты \"Лаборатории Касперского\" рекомендуют сразу же удалять вредоносное ПО, но вы можете указать другое действие, например переместить вредоносное ПО в другую директорию, переименовать вредоносное ПО или настроить GoAnywhere MFT на отправку уведомления специалисту по безопасности.","После создания этих элементов расположите их в следующем иерархическом порядке:","File System/Create File List","Loops/For-Each Loop","Integration/ICAP","Job Control/If"," File System/Delete","GoAnywhere MFT. Иерархия настроек","Откройте страницу Workflow/Schedule и заполните форму:","а. В поле Project укажите регулярную проверку Kaspersky Scan Engine.","GoAnywhere MFT. Обычный проект сканирования","б. На вкладке Schedule укажите необходимую частоту сканирования.","GoAnywhere MFT. Регулярное расписание сканирования","в. Нажмите Save."," Использование Kaspersky Scan Engine в режиме ICAP с GoAnywhere MFT ","221715.htm"));
Page.push(new Array("Обновление Kaspersky Scan Engine в Linux","В этом разделе описывается, как обновить Kaspersky Scan Engine с предыдущей версии на системах Linux."," Обновление Kaspersky Scan Engine в Linux ","221907.htm"));
Page.push(new Array("Автоматическое обновление (Linux)","Начиная с Kaspersky Scan Engine версии 2.0, вы можете автоматически обновить Kaspersky Scan Engine до более новой версии.","Использование утилиты install для обновления","Вы можете обновить Kaspersky Scan Engine с помощью той же утилиты, которая используется для установки Kaspersky Scan Engine – утилиты install. Вы можете найти утилиту в пакете распространения.","Утилита install обновляет Kaspersky Scan Engine, если программа соответствует следующим требованиям:","Kaspersky Scan Engine уже установлен на компьютере (то есть существует директория /opt/kaspersky/ScanEngine).\nЕсли на компьютере не установлен Kaspersky Scan Engine, утилита install выполнит автоматическую установку. ","Уже установлен Kaspersky Scan Engine версии 2.0  или более поздней. Эта версия более ранняя, чем версия, устанавливаемая при обновлении.\nЕсли версия Kaspersky Scan Engine не соответствует этому требованию, утилита install выдает сообщение об ошибке и закрывается. ","При обновлении Kaspersky Scan Engine утилита install выполняет резервное копирование важных объектов, таких как файлы конфигурации, сертификаты TLS и лицензия. Успешное обновление означает, что все эти объекты уже интегрированы в новую версию Kaspersky Scan Engine. Если по какой-либо причине обновление не удается, утилита install восстанавливает предыдущую версию Kaspersky Scan Engine, включая объекты, для которых выполнено резервное копирование.","Остановка экземпляров Kaspersky Scan Engine","Если обновляемый экземпляр Kaspersky Scan Engine является частью кластера, вам необходимо остановить все экземпляры в кластере перед обновлением.","Важно остановить все экземпляры, поскольку утилита install изменяет базу данных kavebase при обновлении Kaspersky Scan Engine.","Чтобы остановить экземпляр Kaspersky Scan Engine:","Если экземпляр работает в режиме ICAP, выполните команду service kavicapd stop.","Если экземпляр работает в режиме HTTP, выполните команду service kavhttpd stop.","Если экземпляр использует Kaspersky Scan Engine GUI, выполните команду service klScanEngineUI stop.","Обновление Kaspersky Scan Engine","Для автоматического обновления Kaspersky Scan Engine:","Убедитесь, что у вас есть права администратора.","Запустите утилиту install.","Ознакомьтесь с Пользовательским соглашением (End User License Agreement, EULA) для Kaspersky Scan Engine.\nЕсли вы согласны с условиями Пользовательского соглашения, примите его. Если вы не принимаете условия Пользовательского соглашения, обновление прекратится. ","Если вы согласились использовать Kaspersky Security Network (KSN) ранее, утилита install отобразит текущие условия Пользовательского соглашения для KSN и Политику конфиденциальности. Ознакомьтесь с новым Пользовательским соглашением для KSN и Политикой конфиденциальности.\nЕсли вы согласны с условиями Пользовательского соглашения и Политики конфиденциальности, примите их. Если вы не примете условия Пользовательского соглашения для KSN и Политики конфиденциальности, вы не сможете использовать KSN, но обновление продолжится. Вы сможете включить KSN позже, используя Kaspersky Scan Engine GUI или файлы конфигурации Kaspersky Scan Engine (HTTP или ICAP). ","Укажите абсолютный путь к директории, в которой находится пакет KAV SDK.\nПакет KAV SDK находится в отдельной директории, начиная с версии 2.1 Kaspersky Scan Engine. ","После того как вы укажете необходимые данные, Kaspersky Scan Engine будет обновлен, а затем запущен.","После обновления Kaspersky Scan Engine вы можете в любой момент проверить целостность его компонентов с помощью утилиты проверки целостности.","Миграция из скрипта инициализации в файл модуля systemd","Начиная с Kaspersky Scan Engine версии 2.1, скрипт инициализации больше не поддерживается. Вместо этого скрипта вы можете использовать файл модуля systemd.","Если вы использовали скрипт инициализации для управления Kaspersky Scan Engine в предыдущих версиях, утилита install автоматически выполнит миграцию со скрипта инициализации на systemd во время обновления.","Узнайте больше об использовании systemd в режимах HTTP и ICAP.","Добавление новых элементов в файлы конфигурации","В новой версии Kaspersky Scan Engine добавлены новые элементы. Утилита install не добавляет эти элементы в файлы конфигурации во время обновления. Вы можете добавить новые элементы с помощью Kaspersky Scan Engine GUI или напрямую в файлы конфигурации kavhttpd.xml и kavicapd.xml. Смотрите также подробную информацию о новых элементах в файле конфигурации.","Очистка кеша браузера","Если вы используете Kaspersky Scan Engine GUI, очистите кеш браузера после обновления."," Автоматическое обновление (Linux) ","221941.htm"));
Page.push(new Array("AuthSettings","Настройки аутентификации по токену API.","Этот элемент необязателен.","Путь","ServerSettings > AuthSettings","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","UseAccessToken","AuthRequestField","UseBearerAuthScheme","AccessTokens","Пример","Ниже приведен пример этого элемента.","<AuthSettings>","<UseAccessToken>0</UseAccessToken> <!--Enable or disable API-token authentication -->","<AuthRequestField>Authorization</AuthRequestField>","<UseBearerAuthScheme>1</UseBearerAuthScheme>","<AccessTokens>","<Token>","<Name>Unlimited key</Name>","<Value>SldYQTUyOUNVMnE3VWR2N3Izamk2QkVNc2hhLTV5dTBLcVUzeXZLdGYtNkkrVFUyQUVRQUNLQUFCSWdwRUlJTQ==</Value>","<Description>ScanEngine Clients. Full access scope</Description>","<Enabled>1</Enabled>","</Token>","<Token>","<Name>Key for URL-scanning</Name>","<Value>XUmCkYURUdWQldFGIT3TlEQUQQwkBy2LLNaNMVtrkSQUR2kSNUZV=NT2zLRzQJycVW5VNhUVOdLVcUd3YeVFnT=h</Value>","<Description>Server access key. Only URL-scanning</Description>","<Enabled>0</Enabled>","</Token>","</AccessTokens>","</AuthSettings>"," AuthSettings ","222092.htm"));
Page.push(new Array("UseAccessToken","Указывает, включена ли авторизация по токену API.","Если вы включили авторизацию по токену API и служба kavhttpd не запущена, запуск klScanEngineUI также инициирует запуск службы kavhttpd.","Элемент UseAccessToken не может быть пустым. Элемент необязателен.","Путь","ServerSettings > AuthSettings > UseAccessToken","Значение","Допустимые значения:","0 – авторизация по токену API выключена.","1 – авторизация по токену API включена.","Значение по умолчанию: 0.","Пример","Ниже приведен пример этого элемента.","<UseAccessToken>0</UseAccessToken>"," UseAccessToken ","222099.htm"));
Page.push(new Array("AuthRequestField","Указывает имя поля заголовка запроса, содержащего токен API.","Если для элемента UseAccessToken установлено значение 1, элемент AuthRequestField является обязательным.","Путь","ServerSettings > AuthSettings > AuthRequestField","Значение","Значение должно соответствовать следующим требованиям:","Длина от 3 до 40 символов.","Состоит из символов, разрешенных для имен полей заголовков в соответствии с RFC 7230.","Значение по умолчанию: Authorization.","Пример","Ниже приведен пример этого элемента.","<AuthRequestField>Authorization</AuthRequestField>"," AuthRequestField ","222116.htm"));
Page.push(new Array("UseBearerAuthScheme","Указывает, поддерживает ли Kaspersky Scan Engine схему аутентификации Bearer. Если включена поддержка схемы аутентификации Bearer, Kaspersky Scan Engine ожидает, что поле заголовка запроса, имя которого указано в AuthRequestField, начинается с префикса Bearer.","Если для элемента UseAccessToken установлено значение 1, элемент UseBearerAuthScheme является обязательным.","Путь","ServerSettings > AuthSettings > UseBearerAuthScheme","Значение","Допустимые значения:","0 – поддержка схемы аутентификации Bearer выключена.","1 – поддержка схемы аутентификации Bearer включена.","Значение по умолчанию: 1.","Пример","Ниже приведен пример этого элемента.","<UseBearerAuthScheme>1</UseBearerAuthScheme>"," UseBearerAuthScheme ","222121.htm"));
Page.push(new Array("AccessTokens","Этот элемент является контейнером для элементов Token. Если включена аутентификация HTTP-клиентов, Kaspersky Scan Engine предоставляет доступ к своим функциям только тем HTTP-клиентам, которые успешно прошли аутентификацию с помощью токена API.","Если для элемента UseAccessToken установлено значение 1, элемент AccessTokens является обязательным.","Путь","ServerSettings > AuthSettings > AccessTokens","Пример","Ниже приведен пример этого элемента.","<AccessTokens>","<Token>","<Name>Unlimited key</Name>","<Value>SldYQTUyOUNVMnE3VWR2N3Izamk2QkVNc2hhLTV5dTBLcVUzeXZLdGYtNkkrVFUyQUVRQUNLQUFCSWdwRUlJTQ==</Value>","<Description>ScanEngine Clients. Full access scope</Description>","<Enabled>1</Enabled>","</Token>","<Token>","<Name>Key for URL-scanning</Name>","<Value>XUmCkYURUdWQldFGIT3TlEQUQQwkBy2LLNaNMVtrkSQUR2kSNUZV=NT2zLRzQJycVW5VNhUVOdLVcUd3YeVFnT=h</Value>","<Description>Server access key. Only URL-scanning</Description>","<Enabled>0</Enabled>","</Token>","</AccessTokens>"," AccessTokens ","224176.htm"));
Page.push(new Array("Token","Указывает параметры токена API, такие как его имя и значение. В элементе AccessTokens может быть несколько элементов Token.","Если для элемента UseAccessToken установлено значение 1, должен быть хотя бы один элемент Token, который не может быть пустым.","Путь","ServerSettings > AuthSettings > AccessTokens > Token","Вложенные элементы","Этот элемент является контейнером для следующих вложенных элементов:","Name;","Value;","Description;","Enabled.","См. описание этих элементов ниже.","Token > Name","Уникальное имя токена. Каждый токен в элементе AccessTokens должен иметь уникальное имя.","Имя должно содержать от 1 до 40 символов Unicode.","Если для элемента UseAccessToken установлено значение 1, должен быть хотя бы один элемент Name, который не может быть пустым.","Token > Value","Элемент, содержащий зашифрованное значение токена API, длиной 88 символов ASCII.","Не указывайте это значение непосредственно в файле конфигурации; используйте вместо него Kaspersky Scan Engine GUI или kl_access_util. Когда токен добавляется через Kaspersky Scan Engine GUI или kl_access_util, его значение шифруется. Не помещайте исходный токен в элемент Value.","Если для элемента UseAccessToken установлено значение 1, должен быть хотя бы один элемент Value, который не может быть пустым.","Token > Description","Описание содержит дополнительную информацию о токене. Например, имя клиента, использующего токен, или дата и время создания токена.","Описание может содержать до 1000 символов Unicode.","Этот элемент необязателен.","Token > Enabled","Указывает, должен ли Kaspersky Scan Engine авторизовать клиентов, указавших токен в заголовке запроса.","Возможные значения:","0 – токен выключен. Kaspersky Scan Engine не авторизует клиентов, указавших токен в заголовке запроса.","1 – токен включен. Kaspersky Scan Engine может авторизовать клиентов, указавших токен в заголовке запроса.","Если для элемента UseAccessToken установлено значение 1, должен быть хотя бы один элемент Enabled, который не может быть пустым.","Пример","Ниже приведен пример элемента Token.","<Token>","<Name>Unlimited key</Name>","<Value>SldYQTUyOUNVMnE3VWR2N3Izamk2QkVNc2hhLTV5dTBLcVUzeXZLdGYtNkkrVFUyQUVRQUNLQUFCSWdwRUlJTQ==</Value>","<Description>Kaspersky Scan Engine Clients. Full access scope</Description>","<Enabled>1</Enabled>","</Token>"," Token ","224177.htm"));
Page.push(new Array("Настройки авторизации (Authorization)","В этом разделе описан раздел Authorization на странице Settings.","Если при загрузке веб-страницы произошла ошибка и настройки недоступны, перезагрузите страницу.","Раздел Authorization содержит следующие параметры:","Enable HTTP clients authorization. Указывает, следует ли Kaspersky Scan Engine использовать авторизацию по токену API.","Для авторизации токена API требуется HTTPS-соединение.","Authorization header field",". Имя поля заголовка запроса, содержащего токен API. Значение, которое вы указываете здесь, должно соответствовать следующим требованиям:","Длина от 3 до 40 символов.","Состоит из символов, разрешенных для имен полей заголовков в соответствии с RFC 7230.","Значение по умолчанию: Authorization.","Add bearer prefix. Указывает, поддерживает ли Kaspersky Scan Engine схему аутентификации Bearer. Если этот переключатель активирован, Kaspersky Scan Engine ожидает, что поле заголовка запроса, имя которого указано в Authorization header field, начинается с префикса Bearer.","Управление токенами","Таблица API Tokens содержит следующую информацию о токенах API:","Имя токена. Каждый токен имеет уникальное имя.","Описание. Некоторые описания могут отсутствовать. Это свойство необязательно.","Состояние. Kaspersky Scan Engine авторизует HTTP-клиент, только если его токен включен.","Из таблицы вы можете редактировать () или удалить () существующий токен. Редактирование токена аналогично добавлению токена (см. инструкцию ниже).","Чтобы добавить новый токен:","Нажмите кнопку Add token.","Укажите параметры нового токена:","Name. Уникальное имя токена. Имя должно содержать от 1 до 40 символов Unicode.","Description. Дополнительная информация о токене. Например, имя владельца токена. Описание может содержать до 1000 символов Unicode.","Token. Токен, который клиент должен отправить в Kaspersky Scan Engine API для авторизации. Значение должно быть уникальным и содержать от 4 до 100 символов ASCII. Должна быть как минимум одна заглавная и одна строчная буква латинского алфавита, одна цифра и один из следующих специальных символов: -._ ~ + /).\n\n\nЧтобы Kaspersky Scan Engine сгенерировал для вас уникальный токен, нажмите кнопку Generate token. Сгенерированный токен появится в поле Token. Вы можете изменить это значение, если хотите. \n\n\nСкопируйте токен куда-нибудь, чтобы найти его позже. После нажатия кнопки Save токен не будет доступен в Kaspersky Scan Engine GUI. В файле конфигурации kavhttpd.xml значение токена зашифровано. Если вы забыли или потеряли токен, вы можете создать новый. ","Enable token. Активируйте этот переключатель, если вы хотите, чтобы Kaspersky Scan Engine авторизовал клиентов, указавших токен в заголовке запроса. Если переключатель деактивирован, Kaspersky Scan Engine не авторизует клиентов, указавших токен в заголовке запроса.\n\n\nЕсли вы включили авторизацию по токену API и служба kavhttpd не запущена, запуск klScanEngineUI также инициирует запуск службы kavhttpd. ","Нажмите Save.","Новый токен появится в таблице API Tokens."," Настройки авторизации (Authorization) ","224195.htm"));
Page.push(new Array("Пример HTTP-запроса, содержащего токен API для авторизации","Если в Kaspersky Scan Engine включена авторизация HTTP-клиентов, все HTTP-запросы должны содержать токен API.","В следующем примере показан HTTP-запрос, содержащий токен API в поле Authorization:","POST /scanfile HTTP/1.0","Content-Length: 35","X-KAV-ProtocolVersion: 1","X-KAV-Timeout: 10","Authorization: SldYQTUyOUNVMnE3VWR2N3Izamk2QkVNc2hhLTV5dTBLcVUzeXZLdGYtNkkrVFUyQUVRQUNLQUFCSWdwRUlJTQ==","* Full path to the EICAR test file *","В этом примере Authorization – это имя по умолчанию для поля заголовка запроса, используемого для авторизации. Вы можете изменить это имя в разделе Authorization Kaspersky Scan Engine GUI.","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Date: Mon, 10 February 2014 12:25:21 GMT","Server: KAVHTTPD","Content-Length: 32","Connection: close","Content-Type: text/plain","X-KAV-ProtocolVersion: 1","DETECT EICAR-Test-File","Если авторизация не удалась и был указан префикс Bearer, ответ будет следующим:","HTTP/1.1 401 Unauthorized","WWW-Authenticate: Bearer realm=\"API Kaspersky Scan Engine\"","Если авторизация не удалась и префикс Bearer не был указан, ответ будет следующим:","HTTP/1.1 401 Unauthorized","WWW-Authenticate: Token realm=\"API Kaspersky Scan Engine\""," Пример HTTP-запроса, содержащего токен API для авторизации ","224307.htm"));
Page.push(new Array("Пример HTTP-запроса, содержащего токен API для авторизации","Протокол версии 3.0","Если в Kaspersky Scan Engine включена авторизация HTTP-клиентов, все HTTP-запросы должны содержать токен API.","В следующем примере показан HTTP-запрос, содержащий токен API в поле Authorization:","POST /api/v3.0/scanfile HTTP/1.0","Content-Type: application/octet-stream","Content-Length: 22","Authorization: SldYQTUyOUNVMnE3VWR2N3Izamk2QkVNc2hhLTV5dTBLcVUzeXZLdGYtNkkrVFUyQUVRQUNLQUFCSWdwRUlJTQ==","{","\"timeout\": \"10000\",","\"object\": \"\\/home\\/user\\/eicar\"","}","В этом примере Authorization – это имя по умолчанию для поля заголовка запроса, используемого для авторизации. Вы можете изменить это имя в разделе Authorization Kaspersky Scan Engine GUI.","Ниже приведен пример ответа на запрос:","HTTP/1.0 200 OK","Connection: close","Content-Type: text/plain","Server: KAVHTTPD/1.0","X-KAV-ProtocolVersion: 3","Date: Wed, 30 Jan 2019 15:46:29 GMT","Content-Length: 75","{","\"object\": \"\\/home\\/user\\/eicar\",","\"scanResult\": \"DETECT\",","\"detectionName\": \"EICAR-Test-File\"","}","Если авторизация не удалась и был указан префикс Bearer, ответ будет следующим:","HTTP/1.1 401 Unauthorized","WWW-Authenticate: Bearer realm=\"API Kaspersky Scan Engine\"","Если авторизация не удалась и префикс Bearer не был указан, ответ будет следующим:","HTTP/1.1 401 Unauthorized","WWW-Authenticate: Token realm=\"API Kaspersky Scan Engine\""," Пример HTTP-запроса, содержащего токен API для авторизации ","224308.htm"));
Page.push(new Array("DatabaseVersionICAPHeader","Указывает имя поля заголовка ответа, которое содержит информацию о версии антивирусных баз, используемых Kaspersky Scan Engine для проверки объектов.","Этот элемент необязателен.","Путь","ICAPSettings > DatabaseVersionICAPHeader","Значение","Значение должно состоять из символов, разрешенных для имен полей заголовков в соответствии с RFC 7230.","Пример","Ниже приведен пример этого элемента.","<DatabaseVersionICAPHeader>X-AV-Database-time</DatabaseVersionICAPHeader>"," DatabaseVersionICAPHeader ","225156.htm"));
Page.push(new Array("RequestingICAPHeaders","Указывает, должен ли Kaspersky Scan Engine включать заголовок X-Include в свой ответ на запрос OPTIONS от ICAP-клиента.","Этот элемент необязателен и может быть пустым. Если элемент пустой, Kaspersky Scan Engine не включает заголовок X-Include в ответы.","Путь","ICAPSettings > RequestingICAPHeaders","Вложенные элементы","Этот элемент является контейнером для вложенных элементов ICAPHeader.","Пример","Ниже приведен пример этого элемента.","<RequestingICAPHeaders>","<ICAPHeader>HTTPUserNameICAPHeader</ICAPHeader>","<ICAPHeader>HTTPClientIpICAPHeader</ICAPHeader>","</RequestingICAPHeaders>"," RequestingICAPHeaders ","225221.htm"));
Page.push(new Array("ICAPHeader","Указывает, должен ли Kaspersky Scan Engine включать заголовки, указанные в HTTPUserNameICAPHeader и HTTPClientIpICAPHeader, в свой ответ на запрос OPTIONS от ICAP-клиента.","Этот элемент не может быть пустым.","Путь","ICAPSettings > RequestingICAPHeaders > ICAPHeader","Значение","Возможные значения элемента ICAPHeader","Значение","Описание","HTTPUserNameICAPHeader","Kaspersky Scan Engine включает значение, указанное в HTTPUserNameICAPHeader, в поле заголовка ответа X-Include.","HTTPClientIpICAPHeader","Kaspersky Scan Engine включает значение, указанное в HTTPClientIpICAPHeader, в поле заголовка ответа X-Include.","Пример","Ниже приведен пример этого элемента.","<ICAPHeader>HTTPUserNameICAPHeader</ICAPHeader>"," ICAPHeader ","225222.htm"));
Page.push(new Array("Рекомендуемые настройки для режима HTTP","В этом разделе описаны рекомендуемые настройки Kaspersky Scan Engine в режиме HTTP.","Если вы используете Kaspersky Scan Engine GUI, укажите рекомендуемые настройки, как описано в таблице ниже.","Рекомендуемые настройки режима HTTP в Kaspersky Scan Engine GUI","Настройки в Kaspersky Scan Engine GUI","Рекомендуемые настройки","Service > Keep-alive connection","См. описание KeepAliveSettings ниже.","Service > Connection timeout","См. описание TimeoutMs в KeepAliveSettings ниже.","Service > Sessions","См. описание MaxHTTPSessionsNum ниже.","Service > Connections","См. описание MaxIncomingConnectionsNum ниже.","Service > Threads","В два раза больше значения ScannersCount.","Service > Processes","Равно количеству ядер процессора.","Scanning > Enable reputation checking","Активируйте переключатель","Scanning > Enable Phishing Protection","Активируйте переключатель","Scanning > Object scan timeout","10000 (10 секунд)","Scanning > Heuristic analysis level","Low","Scanning > Actions on detected objects","См. описание Mode ниже.","Scanning > Size limit for the received file","10343 КБ (10,1 МБ)","Получайте обновленное значение от вашего технического менеджера по работе с клиентами не реже одного раза в год.","Scanning > Maximum depth","5","Scanning > Types of files to scan","Установите флажок:","Packed objects","Archives","Emails databases","Emails","Если вы не используете Kaspersky Scan Engine GUI, укажите рекомендуемые настройки в файле конфигурации kavhttpd.xml, как описано в таблице ниже.","Рекомендуемые настройки для режима HTTP в файле конфигурации","Параметр в kavhttpd.xml","Рекомендуемые настройки","ScannersCount","Равно количеству ядер процессора.","ThreadsCount","В два раза больше значения ScannersCount.","MaxIncomingConnectionsNum","См. описание MaxIncomingConnectionsNum ниже.","MaxHTTPSessionsNum","См. описание MaxHTTPSessionsNum ниже","QueueLen","Больше или равно значению MaxHTTPSessionsNum","Больше, чем значение ThreadsCount","MaxTCPFileSize","10591440 байт (10,1 МБ)","Получайте обновленное значение от вашего технического менеджера по работе с клиентами не реже одного раза в год.","Flags","Укажите флаги:","KAV_O_M_PACKED","KAV_O_M_ARCHIVED","KAV_O_M_MAILPLAIN","KAV_O_M_MAILBASES","KAV_O_M_HEURISTIC_LEVEL_SHALLOW","KAV_SHT_ENGINE_KSN","KAV_SHT_ENGINE_APUF","Mode","См. описание Mode ниже.","MaxArchivesScanningDepth","5","SessionTimeout","10000 (10 секунд)","KeepAliveSettings","См. описание KeepAliveSettings ниже.","ScannersCount","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service > Processes.","Рекомендуемое количество сканирующих процессов равно количеству ядер процессора. Например, если Kaspersky Scan Engine работает на компьютере с 4-ядерным процессором, установите ScannersCount равным 4.","Смотрите также подраздел \"Пример работы Kaspersky Scan Engine в режиме HTTP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen, MaxIncomingConnectionsNum и MaxHTTPSessionsNum\".","ThreadsCount","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service > Threads.","Рекомендуемое количество потоков сканирования зависит от количества процессов сканирования, указанного в ScannersCount: значение ThreadsCount в два раза больше значения ScannersCount. Например, если Kaspersky Scan Engine работает на компьютере с 4-ядерным процессором, а ScannersCount имеет значение 4, установите для ThreadsCount значение 8.","Смотрите также подраздел \"Пример работы Kaspersky Scan Engine в режиме HTTP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen, MaxIncomingConnectionsNum и MaxHTTPSessionsNum\".","MaxIncomingConnectionsNum","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service > Connections.","Вы можете настроить этот параметр, чтобы задать длину очереди входящих TCP-соединений, ожидающих соединения с HTTPD. Подробнее о настройке очереди подключений см. в разделе \"Настройка очереди подключений в режиме HTTP\".","Например, вы ожидаете в среднем десять одновременных подключений к клиентам. Если для параметра MaxHTTPSessionsNum установлено значение 10, все 10 одновременных подключений будут приняты HTTPD для обработки. 11-е входящее TCP-соединение будет ожидать соединения с HTTPD. По крайней мере, 11 дополнительных подключений могут ждать принятия HTTPD, в то время как 12-е дополнительное подключение вызовет сообщение об ошибке. Поэтому при установке значения MaxIncomingConnectionsNum учитывайте значение MaxHTTPSessionNum: значение, указанное в MaxIncomingConnectionsNum, должно быть в несколько раз больше, чем значение, указанное в MaxHTTPSessionNum.","MaxHTTPSessionsNum","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service > Sessions.","При указании значения этого параметра учитывайте следующее:","Максимальное количество потоков сканирования (ThreadsCount).","Максимальную длину очереди задач сканирования (QueueLen).","Максимальную длину очереди ожидания сканирования (MaxIncomingConnectionsNum).","Специфику HTTPD: как правило, HTTPD запускает один процесс сканирования для одной задачи сканирования.","Рекомендуемое значение:","больше или равно:","5*ThreadsCount/4 (при сканировании файлов и URL-адресов).","3*ThreadsCount/2 (при сканировании системной памяти).","соответствует ожидаемому количеству HTTP-клиентов, выполняющих запросы к HTTPD.","Смотрите также подраздел \"Пример работы Kaspersky Scan Engine в режиме HTTP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen, MaxIncomingConnectionsNum и MaxHTTPSessionsNum\".","QueueLen","Поскольку задачи сканирования ставятся в очередь из всех одновременно открытых сеансов, учитывайте параметры MaxHTTPSessionsNum. Длина очереди не должна быть меньше значения MaxHTTPSessionsNum. В противном случае некоторые клиенты получат ошибку при открытии сессий.","Поскольку задачи сканирования обрабатываются потоками из очереди, длина очереди не должна быть меньше количества потоков в ThreadsCount. В противном случае некоторые потоки не будут использоваться.","Рекомендуемое значение QueueLen:","Больше, чем значение ThreadsCount.","Больше или равно значению MaxHTTPSessionsNum.","Смотрите также подраздел \"Пример работы Kaspersky Scan Engine в режиме HTTP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen, MaxIncomingConnectionsNum и MaxHTTPSessionsNum\".","MaxTCPFileSize","Во время сканирования HTTPD загружает файлы в системную память. Чем больше размер файла и количество активных сеансов, тем больше используется системная память. Указанное значение должно быть меньше размера ОЗУ.","Чтобы повысить производительность, вы можете указать максимальный размер HTTP-сообщений, отправляемых в HTTPD, и установить значение 10591440 байт (10,1 МБ). Это значение обеспечивает обнаружение большинства вредоносных программ.","Если вы следовали приведенной выше рекомендации, мы также рекомендуем один раз в год проконсультироваться со своим персональным техническим менеджером, чтобы получить обновленное рекомендуемое значение, поскольку средний размер вредоносного ПО меняется из года в год.","Flags","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Types of files to scan, Settings > Scanning > Heuristic analysis level и Settings > Scanning > Enable reputation checking.","Рекомендуемое значение для Flags следующее:","KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILPLAIN | KAV_O_M_MAILBASES | KAV_O_M_HEURISTIC_LEVEL_SHALLOW | KAV_SHT_ENGINE_KSN","Если используется флаг KAV_SHT_ENGINE_KSN, также рекомендуется включить защиту от фишинга одним из следующих способов:","В элементе Flags файла конфигурации kavhttpd.xml добавьте флаг KAV_SHT_ENGINE_APUF.","На странице Settings > Scanning в Kaspersky Scan Engine GUI активируйте переключатель Enable Phishing Protection.","Защита от фишинга полезна, когда Kaspersky Scan Engine проверяет URL-адреса.","Mode","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Actions on detected objects.","Если предполагается указать локальный путь к объекту (запрос scanfile для сканирования локального файла), укажите следующее:","KAV_DELETE (если требуется удалить объект без попытки лечения).","KAV_CLEAN_DELETE (если требуется вылечить объект или удалить его, если лечение невозможно).","Во всех остальных случаях указывайте KAV_SKIP.","MaxArchivesScanningDepth","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Maximum depth.","Рекомендуется ограничить максимальную глубину распаковки вложенных архивов во время сканирования. Рекомендуемое значение MaxArchivesScanningDepth – 5.","SessionTimeout","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Object scan timeout.","Вы можете установить тайм-аут для всех операций в сеансе: соединение с клиентом, получение данных и проверка объекта. Настройку тайм-аута можно использовать с заголовком X-KAV-Timeout (см. Настройка тайм-аута сеанса).","Настройка тайм-аута позволяет:","немедленно освобождать поток сканирования, если время сеанса истекло.","более быстро управлять очередью входящих TCP-соединений (длина очереди задается в MaxIncomingConnectionsNum).","Первоначально HTTPD получает данные, а затем загружает файлы в системную память во время сканирования. Чем больше размер файла и количество активных сеансов, тем больше используется системная память. Чтобы повысить производительность, вы можете указать максимальный размер HTTP-сообщений, отправляемых в HTTPD (см. MaxTCPFileSize выше), и ограничить время сеанса в SessionTimeout. Это позволит вам пропустить крупные объекты или объекты, требующие длительного времени для сканирования.","Перед установкой значения SessionTimeout рекомендуется оценить ожидаемое количество HTTP-клиентов, запрашивающих HTTPD, а также вероятную длину очереди входящих TCP-соединений.","Обычно значение SessionTimeout по умолчанию 10000 (10 секунд).","KeepAliveSettings","Этот параметр в Kaspersky Scan Engine GUI Settings > Service > Keep-alive connection.","Мы рекомендуем включить Keep-Alive. Когда включен Keep-Alive, Kaspersky Scan Engine поддерживает постоянное соединение даже после обработки запроса и истечения времени ожидания сеанса. Это дает следующие преимущества:","сокращение сетевого трафика.","сокращение использования ресурсов сервера.","сокращение времени задержки при обработке запросов.","Keep-Alive особенно полезен для HTTPS-соединений, которые требуют больше процессорного времени и больше взаимодействий клиент-сервер.","Чтобы включить Keep-Alive, установите для элемента Enabled в KeepAliveSettings значение 1.","Чтобы определить значения для TimeoutMs и MaxRequests, оцените количество клиентов и количество запросов от клиентов.","Например, вы рассчитали, что максимальное количество клиентов равно 10, поэтому устанавливаете MaxHTTPSessionsNum равным 10. Если TimeoutMs и MaxRequests не ограничены и все 10 клиентов отправляют запросы непрерывно, Kaspersky Scan Engine поддерживает соединения с этими 10 клиентами без ограничений. В результате новые соединения не могут быть приняты HTTPD для обработки.","Другой пример. Вы рассчитали, что максимальное количество клиентов равно 10, поэтому устанавливаете MaxHTTPSessionsNum равным 10. Вы также подсчитали, что максимальное количество запросов от одного клиента составляет 15, поэтому вы устанавливаете MaxRequests на 15. Если вы не установили ограничение для TimeoutMs и клиенты не отправляют 15 запросов, Kaspersky Scan Engine поддерживает соединения с этими 10 клиентами без ограничений, поэтому новые соединения не могут быть приняты HTTPD для обработки.","Пример работы Kaspersky Scan Engine в режиме HTTP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen, MaxIncomingConnectionsNum и MaxHTTPSessionsNum","Допустим, Kaspersky Scan Engine установлен на компьютере с четырьмя ядрами процессора и у этого компьютера 15 одновременных подключений, а Kaspersky Scan Engine настроен следующим образом:","ScannersCount = 4","ThreadsCount = 8","QueueLen = 20","MaxHTTPSessionsNum = 10","MaxIncomingConnectionsNum = 20","В этом случае:","Пять из пятнадцати клиентов будут поставлены в очередь на подключение.","Десять сессий откроются для десяти клиентов.","Десять открытых сессий сформируют очередь задач сканирования. Если количество задач сканирования превышает значение QueueLen, клиент получит ошибку 503 - Service overloaded.","Kaspersky Scan Engine запускает четыре процесса сканирования.","Четыре процесса сканирования создают восемь потоков для одновременной обработки восьми задач проверки из очереди (один поток для одной задачи сканирования)."," Рекомендуемые настройки для режима HTTP ","225526.htm"));
Page.push(new Array("Рекомендуемые настройки для режима ICAP","В этом разделе описаны рекомендуемые настройки Kaspersky Scan Engine в режиме ICAP.","Если вы используете Kaspersky Scan Engine GUI, укажите рекомендуемые настройки, как описано в таблице ниже.","Рекомендуемые настройки для режима ICAP в Kaspersky Scan Engine GUI","Настройки в Kaspersky Scan Engine GUI","Рекомендуемые настройки","Service > Processes","Равно количеству ядер процессора.","Service > Threads","В два раза больше значения ScannersCount.","Service > Sessions","См. описание MaxIcapSessionsCount ниже.","Service > Partial mode","Вкл.","Service > Delay","10","Service > Chunk size","4","Service > Prevent re-downloading","Вкл.","Service > Maximum cache size","5000","Service > Lifetime for blocked URLs","1800","Service > Keep-alive","См. описание KeepAliveSettings ниже.","Scanning > Skip large objects","Вкл.","10343 КБ (10,1 МБ)","Получайте обновленное значение от вашего технического менеджера по работе с клиентами не реже одного раза в год.","Scanning > Types of files to scan","Установите флажки:","Packed objects","Archives","Email databases","Emails","Scanning > Heuristic analysis level","Low","Scanning > Object scan timeout","10000 (10 секунд)","Scanning > Maximum depth","5","Scanning > Scan scope in Request mode","URL (сканирование только запрошенных URL-адресов).","Scanning > Scan scope in Response mode","Files","Scanning > Enable reputation checking","См. описание UseKSN ниже.","Если вы не используете Kaspersky Scan Engine GUI, укажите рекомендуемые параметры в файле конфигурации kavicapd.xml, как описано в таблице ниже.","Рекомендуемые настройки для режима ICAP в файле конфигурации","Параметр в kavicapd.xml","Рекомендуемые настройки","ScannersCount","Равно количеству ядер процессора.","ThreadsCount","В два раза больше значения ScannersCount.","MaxIcapSessionsCount","См. описание MaxIcapSessionsCount ниже.","QueueLen","Больше, чем значение ThreadsCount.","Как минимум вдвое больше значения MaxIcapSessionsCount.","RAMUsageLimit","Не превышает размер ОЗУ.","В два раза больше максимального размера файла для сканирования больших файлов.","Не менее 600 МБ, что в два раза больше размера антивирусных баз и библиотек Kaspersky Scan Engine (всего 300 МБ).","ScanMaxFileSize","10343 КБ (10,1 МБ)","Получайте обновленное значение от вашего технического менеджера по работе с клиентами не реже одного раза в год.","ScanningMode","Укажите флаги:","KAV_O_M_PACKED","KAV_O_M_ARCHIVED","KAV_O_M_MAILPLAIN","KAV_O_M_MAILBASES","KAV_O_M_HEURISTIC_LEVEL_SHALLOW","ScanTimeout","10000 (10 секунд)","MaxArchivesScanningDepth","5","ScanInReqMode","URL (сканирование только запрошенных URL-адресов).","ScanInRespMode","Content (сканирование только тела HTTP-сообщения).","TransferBeforeScanEnding","1","Delay","(Атрибут TransferBeforeScanEnding)","10","ChunkSize","(Атрибут TransferBeforeScanEnding)","4","BlockedUrlCacheEnabled","(Атрибут TransferBeforeScanEnding)","1","BlockedUrlCacheKb","(Атрибут TransferBeforeScanEnding)","5000","BlockedUrlCacheTtlSec","(Атрибут TransferBeforeScanEnding)","1800","UseKSN","См. описание UseKSN ниже.","KeepAliveSettings","См. описание KeepAliveSettings ниже.","ScannersCount","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service > Processes.","Рекомендуемое количество сканирующих процессов равно количеству ядер процессора. Например, если Kaspersky Scan Engine работает на компьютере с 4-ядерным процессором, установите ScannersCount равным 4.","См. также подраздел \"Пример работы Kaspersky Scan Engine в режиме ICAP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen и MaxIcapSessionsCount\".","ThreadsCount","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service > Threads.","Рекомендуемое количество потоков сканирования зависит от количества процессов сканирования, указанного в ScannersCount: значение ThreadsCount в два раза больше значения ScannersCount. Например, если Kaspersky Scan Engine работает на компьютере с 4-ядерным процессором, а ScannersCount имеет значение 4, установите для ThreadsCount значение 8.","См. также подраздел \"Пример работы Kaspersky Scan Engine в режиме ICAP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen и MaxIcapSessionsCount\".","MaxIcapSessionsCount","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service > Sessions.","При определении максимального числа одновременных подключений к Kaspersky Scan Engine учитывайте следующее:","Максимальное количество потоков сканирования (ThreadsCount).","Максимальную длину очереди задач сканирования (QueueLen).","Специфику ICAP: как правило, kavicapd запускает два потока сканирования для одной задачи сканирования.","Чем больше количество активных соединений, тем быстрее заполняются все потоки сканирования и, как следствие, тем длиннее очередь для задач сканирования.","Рекомендуемое значение MaxIcapSessionsCount:","Равно среднему количеству запросов ICAP-клиента в минуту.","Больше, чем значение ScannersCount.","Больше, чем значение ThreadsCount.","Превышает количество активных процессов, используемых прокси-сервером.","Превышает максимальное количество подключений от клиентов, обслуживаемых выбранным прокси-сервером.","См. также подраздел \"Пример работы Kaspersky Scan Engine в режиме ICAP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen и MaxIcapSessionsCount\".","QueueLen","Длина очереди задач сканирования не должна быть меньше количества потоков проверки (ThreadsCount). В противном случае некоторые потоки сканирования никогда не будут использоваться.","Поскольку задачи сканирования ставятся в очередь из всех открытых сеансов, учитывайте значение MaxIcapSessionsCount. Очередь задач сканирования не должна быть меньше MaxIcapSessionsCount. В противном случае некоторые клиенты получат ошибку 503 - Service overloaded при попытке открыть сеанс.","Рекомендуемое значение QueueLen:","Больше, чем значение ThreadsCount.","Как минимум вдвое больше значения MaxIcapSessionsCount.","См. также подраздел \"Пример работы Kaspersky Scan Engine в режиме ICAP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen и MaxIcapSessionsCount\".","RAMUsageLimit","Если в Kaspersky Scan Engine поступает много больших объектов для сканирования или много одновременных запросов, программа часто может останавливать обработку запросов из-за чрезмерного потребления системной памяти. Когда обработка запроса прекращается, Kaspersky Scan Engine записывает в файл журнала одно из следующих сообщений: Can't accept request: Not enough memory! или Can't accept new request: Not enough memory! Клиенты получают сообщение об ошибке 503 - Service overloaded.","Рекомендуется ограничить максимальный объем системной памяти, чтобы предотвратить ее чрезмерное использование. При превышении этого лимита Kaspersky Scan Engine прекращает сканирование объектов.","Рекомендуемое значение RAMUsageLimit:","Не превышает размер ОЗУ.","В два раза больше максимального размера файла для сканирования больших файлов. Например, для сканирования файла размером 1 ГБ требуется около 2 ГБ ОЗУ.","Не менее 600 МБ, что в два раза больше размера антивирусных баз и библиотек Kaspersky Scan Engine (всего 300 МБ). Такой размер необходим из-за того, что объем системной памяти удваивается при перезагрузке базы данных.","ScanMaxFileSize","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Skip large objects.","При указании максимального размера файла для сканирования Kaspersky Scan Engine учитывайте значение RAMUsageLimit: ScanMaxFileSize не должен быть больше RAMUsageLimit. Чтобы повысить производительность Kaspersky Scan Engine, установите ScanMaxFileSize равным 10343 КБ (10,1 МБ). Это рекомендуемое значение, поскольку его достаточно для обнаружения большинства вредоносных программ.","Если вы следовали приведенной выше рекомендации, мы также рекомендуем один раз в год проконсультироваться со своим персональным техническим менеджером, чтобы получить обновленное рекомендуемое значение, поскольку средний размер вредоносного ПО меняется из года в год.","ScanningMode","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Types of files to scan и Settings > Scanning > Heuristic analysis level.","Рекомендуемое значение для ScanningMode следующее:","KAV_O_M_PACKED | KAV_O_M_ARCHIVED | KAV_O_M_MAILPLAIN | KAV_O_M_MAILBASES | KAV_O_M_HEURISTIC_LEVEL_SHALLOW","ScanTimeout","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Object scan timeout.","Рекомендуемое значение для ScanTimeout – 10000 (10 секунд).","MaxArchivesScanningDepth","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Maximum depth.","Рекомендуется ограничить максимальную глубину распаковки вложенных архивов во время сканирования. Рекомендуемое значение MaxArchivesScanningDepth – 5.","ScanInReqMode","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Scan scope in Request mode.","Рекомендуемое значение для ScanInReqMode – URL. Если указано это значение, Kaspersky Scan Engine сканирует только запрошенные URL-адреса.","ScanInRespMode","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Scan scope in Response mode.","Рекомендуемое значение для ScanInRespMode – Content. Если указано это значение, Kaspersky Scan Engine сканирует только тело HTTP-сообщения.","TransferBeforeScanEnding","Этот параметр в Kaspersky Scan Engine GUI: Settings > Service, блок настроек Partial mode.","Этот параметр не дает клиенту прервать соединение с прокси-сервером из-за тайм-аута. Это может произойти, когда клиент отправляет на сканирование большой объект и не может дождаться получения отсканированного объекта.","Рекомендуемое значение TransferBeforeScanEnding – 1 (включить). Также рекомендуется использовать атрибуты по умолчанию:","Delay: 10","ChunkSize: 4\nЗначение должно быть как минимум в несколько раз меньше ScanMaxFileSize (см. выше). ","BlockedUrlCacheEnabled: 1","BlockedUrlCacheKb: 5000","BlockedUrlCacheTtlSec: 1800","См. также подробное описание этих атрибутов.","UseKSN","Этот параметр в Kaspersky Scan Engine GUI: Settings > Scanning > Enable reputation checking.","Рекомендуем включить использование данных из KSN (Kaspersky Security Network). Это обеспечивает более быстрое реагирование на угрозы, улучшает производительность некоторых компонентов защиты и уменьшает вероятность ложных срабатываний.","Чтобы включить KSN, установите UseKSN на 1.","Если включен KSN, также рекомендуется включить защиту от фишинга одним из следующих способов:","В элементе ScanningMode файла конфигурации kavicapd.xml добавьте флаг KAV_O_M_PHISHING.","На странице Settings > Scanning в Kaspersky Scan Engine GUI активируйте переключатель Enable Phishing Protection.","Защита от фишинга полезна, когда Kaspersky Scan Engine проверяет URL-адреса.","KeepAliveSettings","Этот параметр в Kaspersky Scan Engine GUI Settings > Service > Keep-alive.","Мы рекомендуем включить Keep-Alive. Когда включен Keep-Alive, Kaspersky Scan Engine поддерживает постоянное соединение даже после обработки запроса и истечения времени ожидания сеанса. Это дает следующие преимущества:","уменьшает сетевой трафик;","уменьшает использование ресурсов сервера;","уменьшает задержку при обработке запросов.","Keep-Alive особенно полезен для HTTPS-соединений, которые требуют больше процессорного времени и больше взаимодействий клиент-сервер.","Чтобы включить Keep-Alive, установите для элемента Enabled в KeepAliveSettings значение 1.","Чтобы определить значения для TimeoutMs и MaxRequests, оцените количество клиентов и количество запросов от клиентов.","Например, вы рассчитали, что максимальное количество клиентов равно 50, поэтому устанавливаете MaxICAPSessionsCount равным 50. Если TimeoutMs и MaxRequests не ограничены и все 50 клиентов отправляют запросы непрерывно, Kaspersky Scan Engine поддерживает соединения с этими 50 клиентами без ограничений. В результате невозможно установить новые соединения.","Другой пример. Вы рассчитали, что максимальное количество клиентов равно 50, поэтому устанавливаете MaxICAPSessionsCount равным 50. Вы также подсчитали, что максимальное количество запросов от одного клиента составляет 15, поэтому вы устанавливаете MaxRequests на 15. Если вы не установили ограничение для TimeoutMs и клиенты не отправляют 15 запросов, Kaspersky Scan Engine поддерживает соединения с этими 50 клиентами без ограничений, поэтому новые соединения не могут быть установлены.","Пример работы Kaspersky Scan Engine в режиме ICAP в зависимости от настроек ScannersCount, ThreadsCount, QueueLen и MaxIcapSessionsCount","Допустим, Kaspersky Scan Engine установлен на компьютере с четырьмя ядрами процессора и у этого компьютера 140 одновременных подключений, а Kaspersky Scan Engine настроен следующим образом:","ScannersCount = 4","ThreadsCount = 8","QueueLen = 200","MaxIcapSessionsCount = 100","В этом случае:","Kaspersky Scan Engine пытается открыть соединения для всех 140 клиентов. Как правило, открыто 100 сеансов. Оставшиеся 40 клиентов, вероятно, получат ошибку 429: Too many requests.","Открытые сеансы сформируют очередь задач сканирования. В идеале очередь может содержать 200 задач.\nЕсли значение QueueLen ограничивает длину очереди менее чем 200 задачами, остальные клиенты получат ошибку 500 - Internal Server Error. ","Kaspersky Scan Engine запускает четыре процесса сканирования.","Четыре процесса сканирования создают восемь потоков для одновременной обработки восьми задач сканирования из очереди. Остальные 192 задачи проверки помещены в очередь.","Если клиент получает ошибку 500: Internal Server Error, это может значить, что достигнут предел длины очереди, указанный в QueueLen. В этом случае вы можете сделать одно из следующих действий:","Уменьшите MaxIcapSessionsCount.\nПеред уменьшением MaxIcapSessionsCount оцените потребности вашего решения в масштабируемости. Если значение MaxIcapSessionsCount уменьшено, все клиенты, число которых превышает значение, указанное в MaxIcapSessionsCount, не смогут создать сеанс и получат ошибку 429: Too many requests. ","Увеличьте QueueLen.\nПеред увеличением QueueLen оцените потребности вашего решения в масштабируемости. Если значение QueueLen слишком велико, а пропускная способность мала, время обработки запроса может увеличиться настолько, что клиент отключится до того, как Kaspersky Scan Engine завершит обработку запроса.  ","Если клиент получает ошибку 503: Service overloaded, это может значить, что во время обработки запроса был достигнут предел потребления системной памяти (журнал содержит запись Not enough memory). В этом случае увеличьте значение RAMUsageLimit."," Рекомендуемые настройки для режима ICAP ","225528.htm"));
Page.push(new Array("Обновление Kaspersky Scan Engine 2.0 и более поздней версии вручную","Чтобы обновить Kaspersky Scan Engine 2.0 и более поздней версии вручную:","Убедитесь, что у вас есть права администратора.","Для Kaspersky Scan Engine 2.0.","Остановите Kaspersky Scan Engine:","Если вы используете Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\n/etc/init.d/kavicapd stop ","Если вы используете Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\n/etc/init.d/kavhttpd stop ","Если вы используете Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\n /etc/init.d/klScanEngineUI stop ","Для Kaspersky Scan Engine 2.1 и более поздней версии.","Остановите Kaspersky Scan Engine:","Если вы использовали Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\nservice kavicapd stop ","Если вы использовали Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\nservice kavhttpd stop ","Если вы использовали Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\nservice klScanEngineUI stop ","Создайте резервные копии следующих данных:","/opt/kaspersky/ScanEngine/etc/klScanEngineUI.xml","Если Kaspersky Scan Engine работал в режиме ICAP:","/opt/kaspersky/ScanEngine/etc/kavicapd.xml","/opt/kaspersky/ScanEngine/icap_data, если вы настроили правила ICAP в kavicapd_gui_rules.conf.","Если Kaspersky Scan Engine работал в режиме HTTP:","/opt/kaspersky/ScanEngine/etc/kavhttpd.xml","Если Kaspersky Scan Engine использовал TLS, вам необходимо скопировать закрытый ключ и сертификат, сгенерированные для использования в TLS-соединениях. Расположение этих файлов указывается в элементах TlsCertificateKeyFile и TlsCertificateFile файла конфигурации kavhttpd.xml.","Если вы сгенерировали сертификат и закрытый ключ для использования с Kaspersky Scan Engine GUI, скопируйте сертификат и закрытый ключ.","Вы можете найти информацию о расположении сертификата и закрытого ключа в элементах SSLCertificatePath и SSLPrivateKeyPath файла klScanEngineUI.xml.","Файл ключа (если Kaspersky Scan Engine был активирован в режиме лицензирования офлайн) или код активации (если Kaspersky Scan Engine был активирован в режиме лицензирования онлайн).","Вы можете найти информацию о расположении файла ключа или кода активации в элементе LicensePath файла конфигурации kavhttpd.xml (если Kaspersky Scan Engine работал в режиме HTTP) или в файле конфигурации kavicapd.xml (если Kaspersky Scan Engine работал в режиме ICAP).","В директории /opt/kaspersky/ScanEngine удалите Kaspersky Scan Engine с помощью uninstall.","Если вы использовали Kaspersky Scan Engine GUI и хотите продолжить использовать базу данных kavebase, созданную ранее в PostgreSQL, вам не нужно подтверждать удаление данных из нее. Однако вам необходимо обновить базу данных с помощью следующей команды:","psql -d kavebase -a -f %tempdir%/samples/migrate.sql","Приведенная выше команда импортирует содержимое %tempdir%/samples/migrate.sql.","%tempdir% в этой команде – это директория, в которой находится распакованное содержимое пакета распространения Kaspersky Scan Engine.","Убедитесь, что пользователь, выполняющий запросы к базе данных, имеет доступ к директории, содержащей migrate.sql, а также имеет доступ на чтение к самому migrate.sql.","Не используйте migrate.sql для обновления базы данных, используемой Kaspersky Scan Engine версии ниже 2.0.","Вам также необходимо указать те же имя пользователя и пароль, которые использовались для подключения к предыдущей версии базы данных. Вы можете указать имя пользователя и пароль позже, при установке Kaspersky Scan Engine.","Если вы забыли имя пользователя или пароль, воспользуйтесь утилитой psql. Если вы забыли имя пользователя или пароль, использованные для подключения к базе данных, используйте утилиту psql, чтобы получить имя пользователя или изменить пароль.","Чтобы увидеть имя пользователя базы данных, выполните следующую команду:","postgres=# \\l kavebase","Утилита psql отображает информацию об имени базы данных и ее владельце (имени пользователя):","List of databases","-[ RECORD 1 ]-----+--------------------------","Name | kavebase","Owner | scanengine","Если вы забыли пароль, вам нужно изменить его с помощью следующей команды:","alter user %USERNAME% with password '%PASSWORD%';","Здесь %PASSWORD% – это новый пароль пользователя %USERNAME%.","Удалите файлы из директории /opt/kaspersky/ScanEngine/ или удалите саму директорию.","Установите новую версию Kaspersky Scan Engine с помощью инсталлятора.","Остановите Kaspersky Scan Engine:","Если вы использовали Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\nservice kavicapd stop ","Если вы использовали Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\nservice kavhttpd stop ","Если вы использовали Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\nservice klScanEngineUI stop ","Скопируйте данные, резервные копии которых были созданы ранее:","Скопируйте klScanEngineUI.xml в /opt/kaspersky/ScanEngine/etc/","Если предыдущая версия Kaspersky Scan Engine работала в режиме ICAP:","Скопируйте kavicapd.xml в /opt/kaspersky/ScanEngine/etc/.","Скопируйте данные из icap_data в /opt/kaspersky/ScanEngine/icap_data, если вы настроили правила ICAP в kavicapd_gui_rules.conf .","Если предыдущая версия Kaspersky Scan Engine работала в режиме HTTP, скопируйте kavhttpd.xml в /opt/kaspersky/ScanEngine/etc/,","Если вы сделали копии закрытого ключа и сертификата для подключения через TLS в режиме HTTP, скопируйте закрытый ключ и сертификат в директории, указанные в элементах TlsCertificateKeyFile и TlsCertificateFile файла конфигурации kavhttpd.xml.","Убедитесь, что только пользователи с правами администратора имеют доступ на чтение сертификата и закрытого ключа.","Если вы использовали Kaspersky Scan Engine GUI и сделали копии сертификата и закрытого ключа, поместите их в места расположения, указанные в элементах SSLCertificatePath и SSLPrivateKeyPath файла klScanEngineUI.xml соответственно.","Убедитесь, что только пользователи с правами администратора имеют доступ на чтение сертификата и закрытого ключа.","Убедитесь, что файл ключа (если предыдущая версия Kaspersky Scan Engine была активирована в режиме лицензирования офлайн) или код активации (если предыдущая версия Kaspersky Scan Engine была активирована в режиме лицензирования онлайн) находится в правильной директории.","Вы можете найти информацию о расположении файла ключа или кода активации в элементе LicensePath файла конфигурации kavhttpd.xml (если Kaspersky Scan Engine работал в режиме HTTP) или в файле конфигурации kavicapd.xml (если Kaspersky Scan Engine работал в режиме ICAP).","Запустите Kaspersky Scan Engine:","Чтобы использовать Kaspersky Scan Engine в режиме ICAP, выполните команду service kavicapd start","Чтобы использовать Kaspersky Scan Engine в режиме HTTP, выполните команду service kavhttpd start","Чтобы использовать Kaspersky Scan Engine GUI, выполните команду service klScanEngineUI start","Если вы используете Kaspersky Scan Engine GUI, очистите кеш браузера после обновления.","Если вы решили использовать ту же базу данных kavebase при установке новой версии Kaspersky Scan Engine, пароль, который вы указали в предыдущей версии для администратора Kaspersky Scan Engine GUI, остается действительным и не сбрасывается на пароль по умолчанию."," Обновление Kaspersky Scan Engine 2.0 и более поздней версии вручную ","225714.htm"));
Page.push(new Array("Обновление Kaspersky Scan Engine 1.0 вручную","Чтобы обновить Kaspersky Scan Engine 1.0 вручную:","Убедитесь, что у вас есть права администратора.","Остановите Kaspersky Scan Engine:","Если вы используете Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\n/etc/init.d/kavicapd stop ","Если вы используете Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\n/etc/init.d/kavhttpd stop ","Если вы используете Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\n /etc/init.d/klScanEngineUI stop ","Создайте резервные копии следующих данных:","Если Kaspersky Scan Engine работал в режиме ICAP и вы настроили правила ICAP в kavicapd_gui_rules.conf, вам необходимо скопировать /opt/kaspersky/ScanEngine/icap_data.","Если вы сгенерировали сертификат и закрытый ключ для использования с Kaspersky Scan Engine GUI, скопируйте сертификат и закрытый ключ.\n\n\nВы можете найти информацию о расположении сертификата и закрытого ключа в элементах SSLCertificatePath и SSLPrivateKeyPath файла klScanEngineUI.xml. ","Файл ключа (если Kaspersky Scan Engine был активирован в режиме лицензирования офлайн) или код активации (если Kaspersky Scan Engine был активирован в режиме лицензирования онлайн).\n\n\nВы можете найти информацию о расположении файла ключа или кода активации в элементе LicensePath файла конфигурации kavhttpd.xml (если Kaspersky Scan Engine работал в режиме HTTP) или в файле конфигурации kavicapd.xml (если Kaspersky Scan Engine работал в режиме ICAP). ","В директории /opt/kaspersky/ScanEngine удалите Kaspersky Scan Engine с помощью uninstall.","Если вы использовали Kaspersky Scan Engine GUI, вам также необходимо подтвердить удаление данных из базы данных kavebase. Структура базы данных Kaspersky Scan Engine 1.0 существенно отличается от новой версии, поэтому вы не можете использовать старую базу данных с новой версией Kaspersky Scan Engine.","Удалите файлы из директории /opt/kaspersky/ScanEngine/ или удалите саму директорию.","Установите новую версию Kaspersky Scan Engine с помощью инсталлятора.","Остановите Kaspersky Scan Engine:","Если вы использовали Kaspersky Scan Engine в режиме ICAP, выполните следующую команду:\n\n\nservice kavicapd stop ","Если вы использовали Kaspersky Scan Engine в режиме HTTP, выполните следующую команду:\n\n\nservice kavhttpd stop ","Если вы использовали Kaspersky Scan Engine GUI, выполните следующую команду:\n\n\nservice klScanEngineUI stop ","Скопируйте данные, резервные копии которых были созданы ранее:","Скопируйте klScanEngineUI.xml в /opt/kaspersky/ScanEngine/etc/.","Чтобы использовать Kaspersky Scan Engine GUI:","Перейдите в /opt/kaspersky/ScanEngine/tools/.","Выполните следующую команду:\n\n\n\n\n./kav_encrypt -d %USERNAME%:%PASSWORD%  \n\n\n\n\nЗдесь %USERNAME% и %PASSWORD% – это имя пользователя и пароль, используемые для подключения к базе данных kavebase. \n\n\n\n\nЕсли вы забыли имя пользователя или пароль, воспользуйтесь утилитой psql. Если вы забыли имя пользователя или пароль, использованные для подключения к базе данных, используйте утилиту psql, чтобы получить имя пользователя или изменить пароль.\nЧтобы увидеть имя пользователя базы данных, выполните следующую команду:\n\n\npostgres=# \\l kavebase\n\n\n\n\nУтилита psql отображает информацию об имени базы данных и ее владельце (имени пользователя):\n\n\nList of databases\n-[ RECORD 1 ]-----+--------------------------\nName | kavebase\nOwner | scanengine \n\n\n\n\nЕсли вы забыли пароль, вам нужно изменить его с помощью следующей команды:\n\n\nalter user %USERNAME% with password '%PASSWORD%'; \n\n\n\n\nЗдесь %PASSWORD% – это новый пароль пользователя %USERNAME%.\n","Если предыдущая версия Kaspersky Scan Engine работала в режиме ICAP и вы настроили правила ICAP в kavicapd_gui_rules.conf, скопируйте данные из /opt/kaspersky/ScanEngine/icap_data.","Если вы использовали Kaspersky Scan Engine GUI и сделали копии сертификата и закрытого ключа, поместите их в места расположения, указанные в элементах SSLCertificatePath и SSLPrivateKeyPath файла klScanEngineUI.xml соответственно.","Убедитесь, что только пользователи с правами администратора имеют доступ на чтение сертификата и закрытого ключа.","Убедитесь, что файл ключа (если предыдущая версия Kaspersky Scan Engine была активирована в режиме лицензирования офлайн) или код активации (если предыдущая версия Kaspersky Scan Engine была активирована в режиме лицензирования онлайн) находится в правильной директории.","Вы можете найти информацию о расположении файла ключа или кода активации в элементе LicensePath файла конфигурации kavhttpd.xml (если Kaspersky Scan Engine работал в режиме HTTP) или в файле конфигурации kavicapd.xml (если Kaspersky Scan Engine работал в режиме ICAP).","Запустите Kaspersky Scan Engine:","Чтобы использовать Kaspersky Scan Engine в режиме ICAP, выполните команду service kavicapd start","Чтобы использовать Kaspersky Scan Engine в режиме HTTP, выполните команду service kavhttpd start","Чтобы использовать Kaspersky Scan Engine GUI, выполните команду service klScanEngineUI start","Если вы используете Kaspersky Scan Engine GUI, очистите кеш браузера после обновления."," Обновление Kaspersky Scan Engine 1.0 вручную ","225715.htm"));
Page.push(new Array("Справочная информация Kaspersky Scan Engine","О Kaspersky Scan Engine","Что нового","Ключевые функции","Технологии обнаружения","Архитектура","Сценарии использования","Системные требования","Режим HTTP","Пример HTTP-запроса на сканирование локального файла","Режим ICAP","Запуск Kaspersky Scan Engine в режиме ICAP","Веб-интерфейс","Использование Kaspersky Scan Engine GUI"," Справочная информация Kaspersky Scan Engine ","226466.htm"));
Page.push(new Array("Обращение в службу технической поддержки","Если вы не нашли решения вашей проблемы в этой документации или других источниках, создайте запрос в службу технической поддержки \"Лаборатории Касперского\". При обращении в службу технической поддержки \"Лаборатории Касперского\" укажите необходимую информацию о Kaspersky Scan Engine."," Обращение в службу технической поддержки ","234774.htm"));
Page.push(new Array("Интеграция с Docker и Kubernetes","Чтобы развернуть и использовать Kaspersky Scan Engine с Docker и Kubernetes, обратитесь к документации по интеграции Kaspersky Scan Engine с облачными сервисами Kubernetes .","В документации также описана интеграция с Amazon ™ Elastic Kubernetes Service и Microsoft® Azure Kubernetes Service."," Интеграция с Docker и Kubernetes ","235568.htm"));
Page.push(new Array("Авторские права","Уважаемый пользователь!","Спасибо, что доверяете нам. Мы надеемся, что этот документ поможет вам в работе и ответит на большинство ваших вопросов.","Внимание! Права на этот документ являются собственностью АО \"Лаборатория Касперского\" (далее также \"Лаборатория Касперского\") и защищены законодательством Российской Федерации об авторском праве и международными договорами. За незаконное копирование и распространение документа и его отдельных частей нарушитель несет гражданскую, административную или уголовную ответственность в соответствии с применимым законодательством.","Копирование в любой форме, распространение, в том числе в переводе, любых материалов возможны только с письменного разрешения \"Лаборатории Касперского\".","Документ и связанные с ним графические изображения могут быть использованы только в информационных, некоммерческих или личных целях.","Документ может быть изменен без предварительного уведомления.","За содержание, качество, актуальность и достоверность используемых в документе материалов, права на которые принадлежат другим правообладателям, а также за возможный ущерб, связанный с использованием этих материалов, \"Лаборатория Касперского\" ответственности не несет.","Дата изменения документа: 23.10.2023","© 2023 АО \"Лаборатория Касперского\"","https://www.kaspersky.comhttps://support.kaspersky.com","О \"Лаборатории Касперского\""," Авторские права ","55937.htm"));
Page.push(new Array("Обновление антивирусной базы и обновляемых модулей","Kaspersky Scan Engine использует обновляемые модули и антивирусные базы, позволяющие расширить возможности обнаружения.","В этом разделе приводятся разъяснения и рекомендации по обновлению антивирусных баз и обновляемых модулей Kaspersky Scan Engine, а также описываются рекомендации по обновлению."," Обновление антивирусной базы и обновляемых модулей ","96464.htm"));

var PageCount=324;
var parsedMainTitle = 'Kaspersky Scan Engine ';
var reviewDate = 1675405022679;
(function () {
    var maxTextLength = 0;
    var fakeDiv = $('<div/>');
    var text;
    var pageSearch = _.filter(Page, function(page) {
        return page;
    });
    pageSearch = _.map(pageSearch, function (page) {
        return {
            link: page[page.length - 1],
            title: page[page.length - 2],
            text: _.map(page.slice(0, page.length - 2), function(item) {
                text = fakeDiv.html(item).text();
                maxTextLength = Math.max(maxTextLength, text.length);

                return text;
            })
        };
    });

    fakeDiv.remove();

    window.search = function (searchWord, searchWordMinLength) {
        var result = {
            found: false,
            isInit: false,
            results: [],
            resultsCount: 0
        };

        if (searchWord !== '') {
            result.searchWord = searchWord;

            var searchLength = searchWord.length > 5 ? searchWord.length - 2 : searchWordMinLength;

            var fuseOptions = {
                shouldSort: true,
                includeScore: true,
                includeMatches: true,
                minMatchCharLength: searchLength,
                tokenize: true,
                matchAllTokens: true,
                findAllMatches: true,
                threshold: 0.2,
                location: 0,
                distance: maxTextLength,
                keys: [{
                    name: 'title',
                    weight: 0.8
                  }, {
                    name: 'text',
                    weight: 0.2
                  }]
            };


            var fuse = new Fuse(pageSearch, fuseOptions);
            var currentResults = fuse.search(searchWord);

            searchWord = searchWord.replace(/(\\|\[|\*|\+|\(|\)|\.|"|'|`)/g, '\\$1');
            var searchRegExp = new RegExp(searchWord, 'gi');

            if (currentResults.length) {
                result.found = true;
                result.results = _.chain(currentResults)
                    .map(function (result) {
                        var item = result.item;
                        var matches = result.matches.slice(0,2);

                        return {
                            title: item.title.replace(searchRegExp, '<mark>$&</mark>'),
                            link: item.link,
                            texts: _.reduce(matches, function(previous, searchResult) {
                                if (searchResult.key === 'text') {
                                    var originalString = searchResult.value;
                                        var firstEntryPosition = originalString.search(searchRegExp);
                                        if (firstEntryPosition < 0) {
                                            var processedResult = originalString;
                                        } else if (firstEntryPosition < 100) {
                                            var slicePosition = Math.max(30,100-firstEntryPosition);
                                            var sentenceStart = originalString.slice(0,firstEntryPosition);
                                            var contextAfterEntry = originalString.slice(firstEntryPosition, firstEntryPosition + slicePosition);
                                            var afterContext = originalString.slice(firstEntryPosition + slicePosition);
                                            var preResult = sentenceStart + contextAfterEntry + afterContext.slice(0,afterContext.indexOf(' '));
                                            var processedResult = preResult.replace(/[.,:;]$/,"") + '...';
                                        } else {
                                            var beforeFirstEntry = originalString.slice(firstEntryPosition-100,firstEntryPosition);
                                            var startOfSentencePosition = beforeFirstEntry.lastIndexOf('. ');
                                            if (startOfSentencePosition < 0) {
                                                var contextOfEntry = originalString.slice(firstEntryPosition-60,firstEntryPosition+60);
                                                var beforeContext = originalString.slice(0,firstEntryPosition-60);
                                                var afterContext = originalString.slice(firstEntryPosition+60);
                                                var preResult = '...' + beforeContext.slice(beforeContext.lastIndexOf(' ')) + contextOfEntry + afterContext.slice(0,afterContext.indexOf(' '));
                                            } else {
                                                var sentenceContainingEntry = beforeFirstEntry.slice(startOfSentencePosition+2);
                                                var contextAfterEntry = originalString.slice(firstEntryPosition, firstEntryPosition+30);
                                                var afterContext = originalString.slice(firstEntryPosition+30);
                                                var preResult = sentenceContainingEntry + contextAfterEntry + afterContext.slice(0,afterContext.indexOf(' '));
                                            }
                                            var processedResult = preResult.replace(/[.,:;]$/,"") + '...';
                                        }
                                    previous.push(processedResult.replace(searchRegExp, '<mark>$&</mark>'));
                                }
                                return previous;
                            }, [])
                        }
                    })
                    .value();

                result.resultsCount = result.results.length;
            }
        }
        return result;
    };
})();


if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

window.loadParent = function () {};

if (!window.isTOCLoaded) {
    window.isTOCLoaded = function () {};
}

// hide content to avoid blink
$(window.document.documentElement).css('visibility', 'hidden');

$(function () {
    var $aside, $container, $content, $header, $modalContent, $modalHeader, $overlay, $pageTitle,
        $tooltip, $tooltipContent, tooltipButton;

    $.support.cors = true;
    $.fx.speeds._default = 200;

    var options = {
        helpers: {
            media_hv_min: 568,
            media_hv_middle: 874,
            media_mobile: 768
        },
        isMacProject: Boolean(window['isMacProject']),
        isIE7: Boolean(navigator.appVersion.match('MSIE 7.')),
        isIE8: Boolean(navigator.appVersion.match('MSIE 8.')),
        isIE9: Boolean(navigator.appVersion.match('MSIE 9.')),
        isIE10: Boolean(navigator.appVersion.match('MSIE 10.')),
        isFirefox: Boolean(navigator.userAgent.match('Firefox')),
        isOperaMini: Object.prototype.toString.call(window["operamini"]) === "[object OperaMini]",
        isFileProtocol: window.location.protocol === 'file:',
        isAllInOne: window.location.pathname.match(/(all-in-one\.htm)[l]?$/),
        searchWord: getParam('searchWord', true),
        searchWordMinLength: 2
    };

    options.lessThanIE11 = options.isIE7 || options.isIE8 || options.isIE9 || options.isIE10;

    if (window.Customization) {
        _.each(window.Localization, function(item, key) {
            if (_.isObject(window.Customization[key])) {
                window.Localization[key] = window.Customization[key].Value;
            }
        });
    }

    setParam('searchWord', null, true);

    var HELP = window.HELP = $.extend(true, window.HELP, options);
    var $window = $(window);
    var html = document.documentElement;
    var $html = $(html);
    var $head = $(document.head);
    var $body = $(document.body);
    var title = $html.find('title').text();

    $body.removeClass("no-js");

    var ContainerTemplateFunction = _.template(ContainerTemplate);
    var HeaderTemplateFunction = _.template(HeaderTemplate);
    var FooterTemplateFunction = _.template(FooterTemplate);
    var AsideTemplateFunction = _.template(AsideTemplate);
    var SearchResultsTemplateFunction = _.template(SearchResultsTemplate);
    var MobileSearchResultsTemplateFunction = _.template(MobileSearchResultsTemplate);
    var LangListTemplateFunction = _.template(LangListTemplate);
    var VersionsTemplateFunction = _.template(VersionsTemplate);
    var MenuTemplateFunction = _.template(MenuTemplate);
    var AllInOneMenuTemplateFunction = _.template(AllInOneMenuTemplate);
    var CustomStylesTemplateFunction = _.template(CustomStylesTemplate);

    window.parsedMainTitle = window.parsedMainTitle || "Kaspersky Online Help";
    window.toggleBlock = toggleBlock;
    window.showAll = showAll;
    window.hideAll = hideAll;
    window.togglePopup = togglePopup;
    window.showPopup = showTooltip;
    window.hidePopup = hideTooltip;

    function getParam(param, useSession) {
        return store(param, undefined, { useSession: useSession });
    }

    function setParam(param, value, useSession) {
        if (value === void 0) {
            value = null;
        }

        store(param, value, { useSession: useSession });
    }

    function toggleBlock(id) {
        if (!HELP.isAllInOne) {
            var $block = $('#d' + id);
            var $toggler = $('#h' + id);

            if ($block.length > 0 && $toggler.length > 0) {
                $block.slideToggle();
                $toggler.toggleClass('is-expanded');
                $window.resize();
            }
        }
    }

    function showAll() {
        $('.expandingblock').slideDown();
        $('.expandingblocktemplate').addClass('is-expanded');
        $window.resize();
    }

    function hideAll() {
        $('.expandingblock').slideUp();
        $('.expandingblocktemplate').removeClass('is-expanded');
        $window.resize();
    }

    function togglePopup(id, legacyblockname, show) {
        switch (show) {
            case true:
                showTooltip(id, legacyblockname);
                break;
            case false:
                hideTooltip();
                break;
            default:
                toggleTooltip(id, legacyblockname);
        }
    }

    function calcTooltipPosition() {
        if (tooltipButton) {
            var body = document.body;
            var delta = 30;
            var offset = 10;

            if (options.isIE7 || options.isIE8) {
                offset = 0;
            }

            var bodyHeight = body.clientHeight;
            var bodyWidth = body.clientWidth;
            var linkRect = tooltipButton.getBoundingClientRect();
            var tooltip = $tooltip[0];
            var isToTop = linkRect.top > bodyHeight - linkRect.bottom;
            var isToLeft = linkRect.left > bodyWidth - linkRect.right;
            var coords = {
                top: isToTop ? "" : linkRect.bottom + offset,
                bottom: isToTop ? bodyHeight - linkRect.top + offset : "",
                left: isToLeft ? "" : linkRect.left - delta,
                right: isToLeft ? bodyWidth - linkRect.right - delta : ""
            };

            $tooltip.toggleClass("is-to-top", isToTop).toggleClass("is-to-left", isToLeft).css(coords);

            var tooltipRect = tooltip.getBoundingClientRect();
            coords = {};

            var isOverlapLeft = tooltipRect.left < delta;
            var isOverlapRight = tooltipRect.right > bodyWidth - delta;

            if (isOverlapLeft) {
                coords.left = delta;
            }

            if (isOverlapRight) {
                coords.right = delta;
            }

            if (isOverlapLeft || isOverlapRight) {
                coords.width = "auto";
            } else {
                coords.width = "";
            }

            $tooltip.css(coords);
            tooltipRect = tooltip.getBoundingClientRect();
            coords = {};

            var isOverlapTop = tooltipRect.top < delta;
            var isOverlapBottom = tooltipRect.bottom > bodyHeight - delta;

            if (isOverlapTop) {
                coords.top = delta;
            }

            if (isOverlapBottom) {
                coords.bottom = delta;
            }

            $tooltip.css(coords);
            if (options.isIE7 || options.isIE8) {
                return $tooltip.height(Math.min($tooltipContent[0] != null ? $tooltipContent[0].scrollHeight : void 0, 200));
            }
        }
    }

    function calcHomeBtnVisibility($viewport) {
        return setTimeout(function () {
            var $homeBtn = $viewport.find('.bt-home');

            var calcHeight;
            if ($homeBtn.hasClass('is-shown')) {
                var btn = $homeBtn[0];
                var style = btn.currentStyle || window.getComputedStyle(btn);
                calcHeight = btn.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
            } else {
                calcHeight = 0;
            }

            var showBtn = $viewport[0].offsetHeight < $viewport[0].scrollHeight - calcHeight;

            $homeBtn.toggleClass('is-shown', showBtn);
        }, 400);
    }

    function showTooltip(id, btnId) {
        if ($tooltip.data("id") !== id) {
            var content = document.getElementById("d" + id).innerHTML;
            $tooltip.data("id", id);
            $tooltipContent.html(content);
        }

        tooltipButton = document.getElementById(btnId);
        $tooltip.show();

        calcTooltipPosition();
    }

    function hideTooltip() {
        $tooltip.hide();
    }

    function toggleTooltip(id, btnId) {
        if ($tooltip.data("id") !== id || $tooltip.css("display") === "none") {
            showTooltip(id, btnId);
        } else {
            hideTooltip();
        }
    }

    function bindEvents() {
        var $asidePlaceholder = $('.js_aside_placeholder');
        var $menuItems = $('.js_menu_item');
        var $mobileSearch = $('.js_mobile_search_result');
        var $viewport = $('.js_main');
        var mobileMenuToggle = function (button) {
            if (!$mobileSearch.hasClass('is-hidden')) {
                $mobileSearch.addClass('is-hidden');
            }

            $asidePlaceholder.toggleClass('is-active');
            $(button).toggleClass('is-active');
        };

        $('.js_burger').on('click', function (event) {
            event.preventDefault();
            mobileMenuToggle(this);
        });

        $body.on('click', '.js_mobile_menu_deeper', function (event) {
            event.preventDefault();
            mobileMenuShowItem($(this).data('id'));
        });

        $body.on('click', '.bt-home', function (event) {
            event.preventDefault();

            $(".js_content, .js_main").animate({
                scrollTop: 0
            }, '500', 'swing');
        });

        $window.on('resize', function () {
            calcTooltipPosition();
            calcHomeBtnVisibility($('.js_main'));
            calcAsideWidth($asidePlaceholder);
        });

        $viewport.on("scroll", calcTooltipPosition);

        $body.on('click', 'a', function (event) {
            var $self = $(this);
            var url = $self.attr('href');

            if (url && url.indexOf('mailto') === 0) {
                return;
            }

            if ($self.hasClass('hyperlinktemplate') || $self.hasClass('namedhyperlinktemplate')) {
                if (url.indexOf('http') === 0 && url.indexOf('help.kaspersky.com') === -1) {
                    if (window.confirm(HELP.localization.ExternalLinkText)) {
                        return;
                    }

                    event.preventDefault();
                }

                return;
            }

            if (HELP.isAllInOne) {
                if (url) {
                    var hash = url.match( /(.*)\.html?$/ );
                    if (hash && hash[1]) {
                        scrollToHash(hash[1]);

                        $(".js_menu_item").removeClass('is-active');
                        var $menuItem = $self.closest('.js_menu_item');
                        setMenuItemActive($menuItem);

                        if (window.history && window.history.pushState) {
                            window.history.pushState({
                                url: url,
                                hash: hash[1]
                            }, document.title, location.pathname + '#' + hash[1]);
                        }

                        event.stopPropagation();
                        event.preventDefault();

                        trackPage();

                        return;
                    }
                }
            }

            if (window.matchMedia) {
                var mq = window.matchMedia('screen and (max-width: 767px)');
                if (mq.matches) {
                    var toggleSiblings = $self.siblings('.js_contents_toggle');
                    if (toggleSiblings.length > 0 && !$self.hasClass('js_menu_link_direct')) {
                        toggleSiblings.trigger('click');
                        event.preventDefault();
                        return;
                    }
                }
            }

            if (url && url !== '#') {
                var localUrlRegExp = /([\w_]+\.htm)[l]?(#[\w]+(.htm)?)?/i;
                var urlMatches = url.match(localUrlRegExp);
                var isLocalUrl = Boolean(urlMatches && (url === urlMatches[1] || (urlMatches[2] && urlMatches[3])));
                var isLocalAnchor = urlMatches && urlMatches[2] && !urlMatches[3];

                if ($self.closest('.js_search_result_wrapper')) {
                    setParam('searchWord', HELP.searchWord, true);
                }

                var $view = $('.js_tabs_viewport');

                /*if ($view.length) {
                    setParam('asideScrollPosition', $view[0].scrollTop);
                }*/

                var $opened_menus = $('.js_contents_toggle.is-toggled+.js_menu_link');

                if ($opened_menus.length) {
                    setParam('openedMenus', _.map($opened_menus, function (a) {
                        return $(a).attr('href');
                    }));
                }

                if (isLocalUrl) {
                    if ($tooltip) {
                        $tooltip.hide();
                    }

                    var targetUrl = url;

                    if (HELP.isMacProject) {
                        targetUrl = "./pgs/" + urlMatches[2].slice(1);
                        if (HELP.isFileProtocol) {
                            $self.attr('href', targetUrl);
                        }
                    }

                    if (!HELP.isFileProtocol) {
                        event.preventDefault();

                        setNavigation(HELP.isMacProject ? urlMatches[2].slice(1) : url);

                        loadContent(targetUrl, true, null, url);

                        if (window.matchMedia && mq && mq.matches) {
                            $('.js_aside_placeholder').removeClass('is-active');
                            $('.js_burger').removeClass('is-active');
                            $('.js_mobile_aside').addClass('is-hidden');
                        }

                        $('.js_home').toggleClass('is-active', HELP.nav.home.url === HELP.nav.currentPage.url);
                    }
                } else if (isLocalAnchor) {
                    if (window.matchMedia && mq && mq.matches) {
                        $('.js_aside_placeholder').removeClass('is-active');
                        $('.js_burger').removeClass('is-active');
                        $('.js_mobile_aside').addClass('is-hidden');
                    }
                }
            } else {
                event.preventDefault();
            }
        });

        $body.on('click', '.js_menu_link, .js_menu_link_direct', function () {
            var $self = $(this);
            delete HELP.searchWord;
            setParam('searchWord', null, true);

            if (!$self.prev().hasClass('js_contents_toggle')) {
                $menuItems.removeClass('is-active');
            }

            $self.children('.js_contents_toggle').addClass('is-toggled').siblings('.js_contents_level').slideDown();
            $self.closest('.js_menu_item').addClass('is-active');

            var href = $self.attr('href');
            var topicRegExp = /[\w_]+\.htm/;
            var hashRegExp = /#([\w_]+)/;

            if (href.indexOf('#') > -1) {
                var locationMatch = location.pathname.match(topicRegExp);
                var hrefMatch = href.match(topicRegExp);
                var hash = href.match(hashRegExp)[1];
                event.preventDefault();

                if (!(locationMatch.length && hrefMatch.length && locationMatch[0] === hrefMatch[0])) {
                    loadContent(href, true, function() {
                        if (hash) {
                            scrollToHash(hash);
                        }
                    });
                }

                if (hash) {
                    scrollToHash(hash);

                    if (!HELP.isMacProject && window.history && window.history.pushState) {
                        window.history.pushState({
                            url: href,
                            hash: hash
                        }, document.title, href);
                    }
                }
            }
        });

        $(window).on('popstate', function (event) {
            var state = event.originalEvent.state;

            if (state && state.url) {
                if (!HELP.isAllInOne) {
                    loadContent(state.url, false, scroll, state.originalUrl);
                    setNavigation(state.url);
                } else {
                    scroll();
                    trackPage();
                    updateBreadcrumb();
                }
            }

            checkPrintSectionLink();

            function scroll() {
                if (state.hash) {
                    $(".js_menu_item").removeClass('is-active');
                    var $menuItem = $(".js_menu_link[href='" + state.hash + ".htm']").closest('.js_menu_item');
                    autoScrollContents($menuItem);

                    scrollToHash(state.hash);
                }
            }
        });

        $body.on('click', '.js_modal_close', function () {
            $overlay.removeClass('is-visible');
        }).on('click', '.js_overlay', function (event) {
            if (!$(event.target).closest('.js_modal').length) {
                $overlay.removeClass('is-visible');
            }
        });

        if (!HELP.isAllInOne) {
            var xStart = null;
            var yStart = null;

            $body.on('touchstart', '.js_content', function(event) {

                var tableInTopic = $(event.target).closest('.tableintopic');
                if (tableInTopic.length && tableInTopic.width() > tableInTopic.parent().width()) {
                    return;
                }

                var touch = event.originalEvent.touches[0];
                if (touch) {
                    xStart = touch.clientX;
                    yStart = touch.clientY;
                }
            });

            $body.on('touchmove', '.js_content', function(event) {
                if (!xStart || !yStart) {
                    return;
                }

                var touch = event.originalEvent.touches[0];
                var xEnd = touch.clientX;
                var yEnd = touch.clientY;
                var xDiff = xStart - xEnd ;
                var yDiff = yStart - yEnd;

                if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
                    if (xDiff > 0 && HELP.nav.nextPage) {
                        $('.js_container').addClass('is-loading');
                        $('.js_main').addClass('swipe-left');
                        setTimeout(function () {
                            $('.js_next_link').click();
                        }, 350);
                    } else if(xDiff < 0 && HELP.nav.prevPage) {
                        $('.js_container').addClass('is-loading');
                        $('.js_main').addClass('swipe-right');
                        setTimeout(function () {
                            $('.js_prev_link').click();
                        }, 350);
                    }

                    xStart = null;
                    yStart = null;
                }
            });
        }
    }

    /*
    #* Langs switch --------------------------------------------------------------------------------------------------
     */
    function loadLangs() {
        HELP.currentLangId = document.documentElement.lang;

        if (!window.Langs) {
            $('.js_selector_mobile_langs').remove();
            return;
        }

        var currentId = 'no id';
        var currentName = 'no name';
        var locLangs = window.LangsLocalization;

        window.Langs.forEach(function(item) {
            if (locLangs && locLangs[item.id]) {
                item.name = locLangs[item.id];
            }

            if (item.id === document.documentElement.lang) {
                HELP.currentLangId = currentId = item.id;
                HELP.currentLangCode = currentName = item.name;
            } else if ((document.documentElement.lang === 'zh-CN' && item.id === 'zh-Hans') ||
                        (document.documentElement.lang === 'zh-TW' && item.id === 'zh-Hant')) {
                currentId = item.id;
                HELP.currentLangCode = currentName = item.name;
            }
        });

        if (~['ja-JP', 'ko-KR', 'zh-Hans', 'zh-Hant', 'zh-HantTW', 'zh-CN', 'zh-TW'].indexOf(HELP.currentLangId)) {
            HELP.searchWordMinLength = 2;
        }

        if (window.Langs.length < 2) {
            $('.js_selector_mobile_langs').remove();
            return;
        }

        var isMac = Boolean(window.location.pathname.match(/pgs\/[\w_\.]+/));
        var isMacTitle = Boolean(window.location.pathname.match(/title\.html?$/));
        var LangListHtml = LangListTemplateFunction({
            langs: window.Langs,
            currentLang: {
                name: currentName,
                id: currentId
            },
            localization: HELP.localization,
            isMac: isMac,
            isMacTitle: isMacTitle
        });

        $header.find('.js_header_lang_list').html(LangListHtml);
        $('.js_selector_mobile_langs').html(LangListHtml).find('.js_dropdown').addClass('dropdown_large');

        $body.on('click', '.js_lang_item', function (event) {
            event.preventDefault();

            var $element = $(this);
            var langId = $element.data('lang-id');
            var path = window.location.pathname;
            var currentFolder = window.location.pathname.match(/([\w]+|[\w\.-]+)(\/pgs)?\/[\w_-]+.html?/)[1];

            window.location.href  = path.replace("/" + currentFolder + "/", "/" + langId + "/");
        });
    }

    function triggerSearch() {
        if (HELP.helpers.searchTimeout) {
            clearTimeout(HELP.helpers.searchTimeout);
        }

        HELP.helpers.searchTimeout = setTimeout(function () {
            var searchWord = $('.js_search_text').val().trim();

            if (searchWord.length < HELP.searchWordMinLength) {
                delete HELP.searchWord;
                setParam('searchWord', null, true);

                searchWord = null;

                $('.js-menu-content, .js_search').show();
                $('.js-search-content, .js_search_clear').hide();
            } else {
                HELP.searchWord = searchWord;
                setParam('searchWord', searchWord, true);

                var resultObj = search(searchWord, HELP.searchWordMinLength);
                resultObj.localization = HELP.localization;
                resultObj.isMacProject = HELP.isMacProject;

                var searchResultsHtml = SearchResultsTemplateFunction(resultObj);

                $('.js-menu-content, .js_search').hide();
                $('.js-search-content, .js_search_clear').show();

                $('.js_search_result_wrapper').html(searchResultsHtml);
            }
        }, 300);
    }

    /*
    #* TOC on the left ------------------------------------------------------------------------------------------------------
     */
    function loadMenu(menu) {
        if (!window['Toc']) {
            return;
        }

        var flatMenu = [];
        var currentUrl = HELP.isAllInOne || HELP.isMacProject ?
            /#([\w_]+)/.exec(location.hash) : /\/([\w_]+\.\w+$)/.exec(location.pathname);
        var currentPage = {};
        var currentLevel, parentPage;

        if (currentUrl && currentUrl[1]) {
            currentUrl = currentUrl[1];
        }

        function buildMenu(menu, level, parentId) {
            var isCurrentMenuLevelActive;
            level = level || 0;

            _.each(menu, function (item) {
                item.level = level;
                if (item.url && item.url.match(/#|(title\.html?)/)) {
                    return;
                }

                if (item.hidden) {
                    return;
                }

                flatMenu.push(item);

                if (item.url === currentUrl || item.url === currentUrl + '.htm') {
                    item.isActive = true;
                    currentPage = item;
                    currentLevel = level;
                }

                if (item.children) {
                    item.childIsActive = buildMenu(item.children, level + 1, item.id);
                }

                if (item.isActive || item.childIsActive) {
                    isCurrentMenuLevelActive = true;
                }

                if (level > 0 && parentId) {
                    return item.parentId = parentId;
                }
            });

            return isCurrentMenuLevelActive;
        }

        buildMenu(menu);

        var i, j, ref, item, prevSection, nextSection;
        for (i = j = 0, ref = flatMenu.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            item = flatMenu[i];
            if (item.url === currentUrl || item.url === currentUrl + '.htm') {
                if (i > 0) {
                    prevSection = flatMenu[i - 1];
                }

                if (i !== flatMenu.length - 1) {
                    nextSection = flatMenu[i + 1];
                }
            }
        }

        if (!currentPage.url) {
            nextSection = flatMenu[0];
        }

        window.HELP = $.extend(true, window.HELP, {
            nav: {
                menu: menu,
                flatMenu: flatMenu,
                home: flatMenu[0],
                currentPage: currentPage,
                currentLevel: currentLevel,
                parentPage: parentPage,
                prevPage: prevSection,
                nextPage: nextSection
            }
        });

        var $homeBtn = $body.find('.js_home');
        var $homeBtnLink = $homeBtn.find('.js_home_link');

        if (HELP.nav.home) {
            $homeBtnLink.attr('href', HELP.nav.home.url);
        }

        if (HELP.isAllInOne) {
            $(window).on('load', function() {
                setTimeout(function() {
                    scrollToHash(currentUrl);
                });
            });
        }

        buildLinks($container);

        var MenuHtml = MenuTemplateFunction({
            menu: menu,
            localization: HELP.localization,
            isMacProject: HELP.isMacProject
        });

        $aside.find('.js_menu').html(MenuHtml);

        $('.js_search_text').on('keyup', function (event) {
            if (event.keyCode === 27) {
                $(this).val('');
            } else {

            }
            triggerSearch();
        });

        $('.js_search_clear').on('click', function () {
            $('.js_search_text').val('');
            triggerSearch();

            $('.cont mark').contents().unwrap();
        });

        $('.js_mobile_search_button').on('click', function () {
            var $this = $(this);
            var $result = $('.js_mobile_search_result');
            var $input = $('.js_mobile_search_input');
            var $clearBtn = $('.js_mobile_search_clear');
            var isShow = !$input.hasClass('is-hidden');

            if (isShow) {
                if ($input.val().length > 0) {
                    var searchWord = $input.val().trim();
                    var resultObj = search(searchWord, HELP.searchWordMinLength);

                    resultObj.localization = HELP.localization;
                    resultObj.isMacProject = HELP.isMacProject;
                    var mobileSearchResultsHtml = MobileSearchResultsTemplateFunction(resultObj);

                    $result.html(mobileSearchResultsHtml).removeClass('is-hidden').addClass('is-active');

                    setTimeout(function () {
                        $('.js_aside_placeholder').removeClass('is-active');
                        $('.js_burger').removeClass('is-active');
                    });
                } else {
                    $result.removeClass('is-active').addClass('is-hidden');
                }

                /*$this.removeClass('is-active');
                $input.addClass('is-hidden');
                $clearBtn.addClass('is-hidden');*/
            } else {
                $input.removeClass('is-hidden');
                $clearBtn.removeClass('is-hidden');
                $this.addClass('is-active');

                if (!$result.is(':empty')) {
                    $result.removeClass('is-hidden').addClass('is-active');
                }

                setTimeout(function () {
                    $input.focus();
                }, 100);
            }
        });

        $('.js_mobile_search_clear').on('click', function () {
            var $searchBtn = $('.js_mobile_search_button');
            var $result = $('.js_mobile_search_result');
            var $input = $('.js_mobile_search_input');

            if ($input.val().length > 0) {
                $input.val('');
                HELP.searchWord = null;
                setParam('searchWord', null, true);

                $result.empty();
            }

            $searchBtn.removeClass('is-active');
            $result.addClass('is-hidden');
            $input.addClass('is-hidden');
            $(this).addClass('is-hidden');
        });

        var triggerMobileSearch = _.debounce(function() {
            $('.js_mobile_search_button').trigger('click');
        }, 350);

        $('.js_mobile_search_input').on('keyup', function (event) {
            if (event.keyCode === 13) {
                $('.js_mobile_search_button').trigger('click');
            // } else {
            //     triggerMobileSearch();
            }
        });

        $('.js_contents_toggle').on('click', function (event) {
            event.preventDefault();

            var $toggler = $(this);
            $toggler.toggleClass('is-toggled');

            if ($toggler.hasClass('is-toggled')) {
                $toggler.siblings('.contents').slideDown();
            } else {
                $toggler.siblings('.contents').slideUp();
            }
        });

        var openedClass = 'dropdown__list_opened';
        $('.js_dropdown_btn').on('click', function (event) {
            event.preventDefault();

            var $list = $(this).siblings('.js_dropdown_list');

            $('.js_dropdown_list').not($list).removeClass(openedClass);

            var maxHeight = html.clientHeight - $list.offset().top - this.clientHeight;

            if (HELP.isFirefox && $list.height() > maxHeight) {
                $list.addClass('dropdown__list_firefox-fix');
            }

            $list.css({
                maxHeight: maxHeight
            }).toggleClass(openedClass);

            $body.on('click.dropdown', function (event) {
                if (!$(event.target).closest('.js_dropdown').length) {
                    $list.removeClass(openedClass);
                    $body.off('click.dropdown');
                }
            });
        });

        bindEvents();
    }

    function loadContent(url, saveToHistory, callback, originalUrl) {
        if (saveToHistory == null) {
            saveToHistory = true;
        }

        var loadingTimeout = setTimeout(function () {
            $('.js_container').addClass('is-loading');
        }, 300);

        $.ajax(url, {
            crossDomain: true,
            dataType: "html",
            success: function (response) {
                if (saveToHistory && window.history && window.history.pushState) {
                    window.history.pushState({
                        url: url,
                        originalUrl: originalUrl
                    }, null, originalUrl || url);
                }

                var frameHtml = processHtml(response);
                var langMatches = frameHtml.match(/\slang="(.+?)"/);

                if ((langMatches != null ? langMatches.length : void 0) > 1 && langMatches[1] !== HELP.currentLangId) {
                    window.location = HELP.isMacProject ? originalUrl : url;
                    return;
                }

                var $cont = $(frameHtml).filter('.cont');
                $content.html($cont);

                $(".js_content, .js_main").animate({
                    scrollTop: 0
                }, '200', 'swing');

                title = $cont.find('.heading1, .heading2, .heading3, .heading4, .heading5').first().text();
                document.title = title;
                $(".js_menu_item").removeClass('is-active');

                var scrollToUrl = HELP.isMacProject ? originalUrl : url || HELP.nav.currentPage.url;
                var $menuItem = $(".js_menu_link[href='" + scrollToUrl + "']").closest('.js_menu_item');
                var $index = $('.js_index_literals');
                var $indexLinks = $index.find('.indexlink > a');
                $indexLinks.removeClass('is-active').filter("[href='" + url + "']").addClass('is-active');

                autoScrollContents($menuItem);
                processContent($container);

                checkPrintSectionLink();

                autotestHelperPostprocess();

				if (loadingTimeout) {
                    clearTimeout(loadingTimeout);
                }

                if (callback && typeof callback === 'function') {
                    callback();
                }

                $('.js_container').removeClass('is-loading');
                $('.js_main').removeClass('swipe-left swipe-right');

                trackPage();
                updateBreadcrumb();
            },
            error: function () {
                window.history.back();
                return window.location = url;
            }
        });
    }

    function processHtml(content, menu) {
        if (menu) {
            var AllInOneMenuHtml = AllInOneMenuTemplateFunction({
                menu: menu,
                localization: HELP.localization
            });
            var resultContent = $();

            menu.forEach(getContent);

            function getContent(item) {
                var id = item.url.match(/(\w+)\.html?/)[1];
                resultContent = resultContent.add('#' + id + ', [name=' + id + ']');

                if (item.children) {
                    item.children.forEach(getContent);
                }
            }

            content = AllInOneMenuHtml + $('<div/>').html(resultContent).html();
        }

        if (typeof content === 'string') {
            content = content.replace(/[™®]|&reg;|&#8482;|&#174;/g, '');

            if (HELP.isMacProject) {
                content = content.replace(/"title.htm#([\w]+.htm)"/gi,'"index.htm#$1"');
            }

            if (HELP.searchWord) {
                var searchRegExp = new RegExp(escapeRegExp(HELP.searchWord) + '(?!([^<]+)?>)', "ig");
                content = content.replace(searchRegExp, "<mark>$&</mark>");
            }
        }

        return content;
    }

    function processContent($container) {
        $container.find('.links').remove();
        buildLinks($container);

        $container.find('.cont').toggleClass('mactitlepage', Boolean(location.pathname.match(/title\.htm/)));
        $container.find('style').remove();

        if (!HELP.isAllInOne) {
            $container.find('.popuponclick, .expandingblock').each(function () {
                var $self = $(this);
                var $toggler = $($self.attr('id').replace('d', '#h'));

                if ($toggler.length > 0) {
                    var $wrapper = $toggler.closest(".settingdescr");

                    if ($wrapper.length === 0) {
                        $wrapper = $toggler.parent();
                    }

                    $wrapper.append($self);

                    if ($self.hasClass('expandingblock')) {
                        $wrapper.addClass('expandingblock-wrapper');

                        var img = $toggler.next('img');

                        if (img.length) {
                            $toggler.append(img);
                        }
                    }
                }
            });
        }

        $container.find('.cont [title]').each(function(index, item) {
            var classes = item.className;
            var $item = $(item);

            if (!$item.is('img') &&
                classes.indexOf('hyperlinktemplate') === -1 &&
                classes.indexOf('crossreferencetemplate') === -1) {
                $item.removeAttr('title');
            }
        });

        $container.find('.hyperlinktemplate').each(function() {
            var $self = $(this);
            var $siblingLink = $self.next('span').find('.hyperlinktemplate');

            if ($siblingLink.length) {
                var text = $siblingLink.text();
                $self.append($siblingLink.parent().text(text));
            }

            if (HELP.isIE9 && $html.attr('dir') === 'rtl') {
                $self.html($self.html().replace(/([A-z0-9\s]{3,})/g, '$1&rlm;'));
            }
        });

        var $tables = $container.find(".tableintopic");
        $tables.wrap("<div class='tableintopic-wrapper'/>");
        var $tableRows = $tables.find('tr');
        $tableRows.filter(':nth-child(2n)').addClass('is-even');
        $tableRows.filter(':nth-child(2n+1)').addClass('is-odd');

        $container.find('.popuponhover, .popuponclick').each(function () {
            var $self = $(this);
            var $toggler = $($self.attr('id').replace('d', '#h'));

            if ($toggler.length > 0) {
                return $toggler.wrap("<div class='link-wrapper'/>").after($self);
            }
        });

        $container.find('.js_feedback_link').attr('href', getMailtoLink());

        /*$container.find('.program').each(function(index, item) {
            var $item = $(item);
            if (!$item.parent().hasClass('js_code')) {
                var siblings = $(item).nextUntil(':not(.program)').addBack();

                if (siblings.length > 1) {
                    siblings.wrapAll('<div class="js_code"></div>');
                    siblings.after('\n');
                }
            }
        });

        $container.find('.exampleheading, .examplebodytext, .exampleheadingblue2015, .examplebodytextblue2015')
            .parent().each(function(index, item) {
                $(item).addClass('example-wrapper');
            });

        // Begin KOS Styles
        
        $container.find('.programkos,.programcfgkos,.programmakefilekos,.programedlkos,.programidlkos,.programcdlkos,.programyamlkos,.programckos,.attentionbodykos').each(function(index, item) {
            var $item = $(item);
            var itemClass = $item.attr('class');
            var checkWrapperClass = itemClass == 'attentionbodykos' ? 'attentionbodykos-wrapped' : 'js_code';
            var setWrapperClass;
            switch (itemClass)
            {
                case 'programkos':
                      setWrapperClass = 'js_code cpp bgprogram';
                      break;
                case 'programcfgkos':
                      setWrapperClass = 'js_code cpp bgprogram';
                      break;
                case 'programmakefilekos':
                      setWrapperClass = 'js_code makefile bgprogram';
                      break;
                case 'programedlkos':
                      setWrapperClass = 'js_code java bgprogram';
                      break;
                case 'programidlkos':
                      setWrapperClass = 'js_code java bgprogram';
                      break;
                case 'programcdlkos':
                      setWrapperClass = 'js_code java bgprogram';
                      break;
                case 'programyamlkos':
                      setWrapperClass = 'js_code makefile bgprogram';
                      break;
                case 'programckos':
                      setWrapperClass = 'js_code cpp bgprogram';
                      break;
                case 'attentionbodykos':
                      setWrapperClass = 'attentionbodykos-wrapped';
            }
            if (!$item.parent().hasClass(checkWrapperClass)) {
                var siblings = $(item).nextUntil(':not(.'+itemClass+')').addBack();
                siblings.wrapAll('<div class="'+setWrapperClass+'"></div>');
                siblings.after('\n');
            }
        });

        // End KOS Styles

        setTimeout(function() {
            $container.find('.js_code').each(function(index, item) {
                window.hljs.highlightBlock(item);
            });
        });*/

        $window.resize();
    }

    function buildLinks($container) {
        $pageTitle = $container.find('.heading1, .heading2, .heading3, .heading4').first();
        var $homeBtn = $container.find('.bt-home');
        var $prevBtnPlaceholder = $container.find('.js_prev_btn_placeholder');
        var $nextBtnPlaceholder = $container.find('.js_next_btn_placeholder');
        var PageTitleTemplateFunction = _.template(PageTitleTemplate);
        var BottomLinksTemlateFunctions = _.template(BottomLinksTemplate);
        var NextLinkTemplateTemlateFunctions = _.template(NextLinkTemplate);
        var PrevLinkTemplateTemlateFunctions = _.template(PrevLinkTemplate);

        if (HELP.nav) {
            var PageTitleHtml = PageTitleTemplateFunction({
                titleHtml: $pageTitle.html(),
                localization: HELP.localization
            });

            $pageTitle.html(PageTitleHtml);

            if (!HELP.isAllInOne) {
                var NextLinkHtml = NextLinkTemplateTemlateFunctions({
                    nextPage: HELP.nav.nextPage,
                    isMacProject: HELP.isMacProject
                });

                var PrevLinkHtml = PrevLinkTemplateTemlateFunctions({
                    prevPage: HELP.nav.prevPage,
                    isMacProject: HELP.isMacProject
                });

                $prevBtnPlaceholder.html(PrevLinkHtml);
                $nextBtnPlaceholder.html(NextLinkHtml);

                if ($homeBtn.length === 1 && (!HELP.isMacProject || window.location.hash)) {
                    $homeBtn = $homeBtn.first();

                    if (window.reviewDate) {
                        var reviewDate = new Date(window.reviewDate);

                        if (HELP.lessThanIE11) {
                            reviewDate = formatDate(reviewDate);
                        } else {
                            var locale = HELP.currentLangId === 'en-EN' ? 'en' : HELP.currentLangId;
                            reviewDate = reviewDate.toLocaleString(locale, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });
                        }
                    }

                    var separator = {
                        'ja-JP': '、',
                        'fa-IR': '،',
                        'ar-AE': '،'
                    };

                    var BottomLinksHtmls = BottomLinksTemlateFunctions({
                        homeBtnHtml: $homeBtn[0].outerHTML,
                        localization: HELP.localization,
                        serviceInfo: {
                            id:  HELP.isMacProject ? window.location.hash.match(/#(\w+)\.htm/)[1] : window.location.pathname.match(/\/(\w+)\.htm/)[1],
                            reviewDate: reviewDate,
                            separator: separator[HELP.currentLangId] || ','
                        }
                    });

                    $homeBtn.replaceWith(BottomLinksHtmls);
                } else {
                    $homeBtn.remove();
                }
            } else {
                $('.js_all_in_one_header').text(HELP.localization.TableOfContents);
            }
        }
    }

    function autoScrollContents($target, animateSpeed) {
        if (animateSpeed == null) {
            animateSpeed = 2;
        }

        if (!$target || !$target.length) {
            return;
        }

        var $view = $('.js_tabs_viewport');
        var $menuItem = $view.find('.js-menu-content:not(.is-hidden)').find($target);

        if (!$menuItem.length || !$view.length) {
            return;
        }

        setMenuItemActive($menuItem);

        var targetTop = getParam('asideScrollPosition');
        if (targetTop) {
            setParam('asideScrollPosition', null);
            var isFromLocalStorage = true;
        } else {
            var view = $view[0];
            var delta1 = view.clientHeight / 5;
            var delta2 = view.clientHeight / 4;
            var isOverBottom = $menuItem.offset().top > view.clientHeight + $view.offset().top;
            var isOverTop = $menuItem.offset().top < $view.offset().top + $menuItem[0].offsetHeight;
            var targetDelta = $menuItem.offset().top - $view.offset().top;
            targetTop = view.scrollTop + targetDelta;
        }

        var scrollingDuration = Math.min(animateSpeed * Math.abs(targetDelta), 1500);
        if (isFromLocalStorage || isOverTop || isOverBottom) {
            $view.animate({
                scrollTop: targetTop
            }, scrollingDuration, 'swing');
        }
    }

    function loadVersions() {
        if (!HELP.localization.products_b2c || !HELP.localization.products_b2b) {
            return;
        }

        var url = window.location.pathname.split('/');
		if (url[1].toLowerCase() == 'help') {
			url.splice(1, 1); // browser url may have prepending /help/
		}
        var productKey = url[1] && url[1];
        var currentVersionUrl = url[2];
        var allProducts = HELP.localization.products_b2c.concat(HELP.localization.products_b2b).concat(HELP.localization.products_kos || []);
		allProducts.forEach(function(product) {
			product.url = product.url.replace(/\/?help\//gi, ''); // product urls in json may have prepending help/
		});

        function productHasSelectedVersion(item) {
            return _.some(item.versions, function (versionItem) {
                let versionNum = versionItem.url.split('/')[0].toLowerCase();
                return versionNum === currentVersionUrl.toLowerCase()
            });
        }

        var product = _.filter(allProducts, function (item) {
            return item.url.toLowerCase() === productKey.toLowerCase()

                // workaround for #4073658
                && productHasSelectedVersion(item);
        })[0];

        if (!product) { // if workaround above fails, try original code
            var product = _.filter(allProducts, function (item) {
                return item.url.toLowerCase() === productKey.toLowerCase();
            })[0];
        }

        var $productLogo = $('.js_product_logo');

        if (!product) {
            return;
        }

        $productLogo.addClass('top-bar__product_' + product.icon);

        var currentVersion;
        _.some(product.versions, function(item) {
            if (item.url.split('/')[0] === currentVersionUrl) {
                currentVersion = item;
                return true;
            }
            return false;
        });

        if (currentVersion && product.versions.length > 1) {
            var VersionsResultsHtml = VersionsTemplateFunction({
                currentVersion: currentVersion,
                versions: product.versions
            });

            $header.find('.js_header_versions_list').html(VersionsResultsHtml);
            $('.js_selector_mobile_versions')
                .html(VersionsResultsHtml).find('.js_dropdown').addClass('dropdown_large');

            $header.on('click', '.js_version_item', function (event) {
                event.preventDefault();

                var versionUrl = $(this).data('version-url');
                /*var path = window.location.pathname.split('/');
                var currentPage = path[path.length - 1];

                window.location.href  = '/' + productKey + '/' + versionUrl + '/' + currentPage;*/
                var main_url = $('a.header__title-link').attr('href');
                if( ! main_url.endsWith('/')) {
                    main_url += '/'
                }
                window.location.href =  main_url + productKey + '/' + versionUrl;
            });
        } else {
            $('.js_selector_mobile_versions').remove();
        }
    }

    function calcAsideWidth(aside) {
        aside.children().css({
            width: aside.width(),
            top: $('.js_header_placeholder').height()
        });
    }

    function getMailtoLink() {
        var link = 'mailto:?subject=Shared from Kaspersky Online Help: "' +
            window.parsedMainTitle + ' - ' + window.document.title + '"&body=' + window.parsedMainTitle +
            ' - ' + window.document.title + '\n' + window.location.href;
        return encodeURI(link);
    }

    function findSection(menuList, sectionUrl) {
        var result =[];

        menuList.forEach(function(item) {
            if (item.url === sectionUrl) {
                result.push(item);
            } else if (item.children) {
                result = result.concat(findSection(item.children, sectionUrl));
            }
        });

        return result;
    }

    function scrollToHash(hash) {
        var $target = $("[name='" + hash + "'], #" + hash);
        var $main = $('.js_main');

        if ($target.length) {
            $main.animate({
                scrollTop: $target[0].offsetTop - $main[0].offsetTop
            }, '500', 'swing');

            document.documentElement.scrollTop = 0;
        }
    }

    function escapeRegExp(text) {
        return text.toString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    function trackPage() {
        if (window._gaq) {
            window._gaq.push(['_trackPageview', location.pathname + location.search + location.hash]);
        }
    }

    function updateBreadcrumb() {
        var breadPage = HELP.nav.currentPage;
        if (!breadPage.level || breadPage.level == 0) {
            return;
        }
        var breadHtml = breadPage.text;
        while (breadPage.parentId) {
            breadPage = HELP.nav.flatMenu.filter(function (b) { return b.id == breadPage.parentId })[0];
            urlPrefix = HELP.isMacProject ? "index.htm#" : "";
            breadHtml = "<a class=\"breadcrumbLink\" href=\"" + urlPrefix + breadPage.url + "\">" + breadPage.text + "</a>&ensp;>&ensp;" + breadHtml;
        }
        document.getElementsByClassName("cont")[0].insertAdjacentHTML('afterbegin', "<div class=\"breadcrumbBlock\">" + breadHtml + "</div>");
    }

    function setNavigation(url) {
        _.each(HELP.nav.flatMenu, function (item, index) {
            if (item.url === url) {
                HELP.nav.currentPage = item;

                if (index > 0) {
                    HELP.nav.prevPage = HELP.nav.flatMenu[index - 1];
                } else {
                    HELP.nav.prevPage = null;
                }

                if (index !== HELP.nav.flatMenu.length - 1) {
                    HELP.nav.nextPage = HELP.nav.flatMenu[index + 1];
                } else {
                    HELP.nav.nextPage = null;
                }
            }
        });
    }

    function handleCookiePolicy(cookiePolicy) {
        if (window.loadGA) {
            window.loadGA();
        }

        //if (getParam('hideCookiePolicy')) {
        if (true) {
            cookiePolicy.remove();
            return;
        }

        cookiePolicy.find('.js_cookie_policy_btn').on('click', function() {
            cookiePolicy.remove();
            setParam('hideCookiePolicy', true);
        });
    }

    function setMenuItemActive($menuItem) {
        $menuItem
            .addClass('is-active')
            .parents('.js_contents_level')
            .add($menuItem.children('.js_contents_level'))
            .slideDown()
            .siblings('.js_contents_toggle')
            .addClass('is-toggled');
    }

    function formatDate(date) {
        var dd = date.getDate();
        var mm = date.getMonth() + 1;
        var yyyy = date.getFullYear();

        if (dd < 10){
            dd = '0' + dd;
        }

        if (mm < 10){
            mm = '0' + mm;
        }

        return dd + '.' + mm + '.' + yyyy;
    }

    function checkPrintSectionLink() {

        if (HELP.isAllInOne) {
            return;
        }

        var link = $('.js_print_section');

        if (HELP.isMacProject && !window.location.hash) {
            link.hide();
        } else {
            link.show();

            var currentUrl = HELP.isMacProject ?
                window.location.hash.match(/#((\w+)\.htm)/)[1] : window.location.pathname.match(/\/(\w+\.\w+)$/)[1];

            link.attr('href', (HELP.isMacProject ? 'pgs/' : '') + 'all-in-one.htm?sectionUrl=' + currentUrl);
        }
    }

	function autotestHelperPostprocess() {
		if (document.title=="AVAILABILITY OF KASPERSKY SECURITY CLOUD") {
			document.getElementsByClassName("js_content")[0].dataset.atSelector = "at-countryRestrictions"; //requested by KSCloud autotesters
		} else if (document.getElementsByClassName("js_content")[0].dataset.atSelector == "at-countryRestrictions") {
			document.getElementsByClassName("js_content")[0].removeAttribute("data-at-selector");
		}
	}

    /*
    #* Rendering starts here --------------------------------------------------------------------------------------------------
     */
    function firstRender() {
        var $footer, $menuItem;
        var sectionUrl = location.search.split('sectionUrl=')[1];
        var menu = window['Toc'];

        if (sectionUrl) {
            menu = findSection(menu, sectionUrl);
        }

        HELP.localization = window.Localization || {};
        HELP.customization = window.Customization || {};
        HELP.pdfOptions = window.PdfOptions || {};

        $html.toggleClass('ie7', HELP.isIE7).toggleClass('ie8', HELP.isIE8)
             .toggleClass('ie9', HELP.isIE9).toggleClass('ie10', HELP.isIE10)
             .toggleClass('is-opera-mini', HELP.isOperaMini)
             .toggleClass('is-offline', HELP.isFileProtocol);

        if (window['HelpViewer'] !== void 0 && window.sessionStorage && JSON.parse && window.sessionStorage.getItem('isTOCHidden') && JSON.parse(window.sessionStorage.getItem('isTOCHidden'))) {
            $html.removeClass('is-menu-shown');
        }

        if (location.hostname === 'localhost' || location.hostname === 'stage.help.kaspersky.com') {
            $html.addClass('is-test-mode');
        }

        var containerHtml = ContainerTemplateFunction({
            localization: HELP.localization
        });

        var parsedMainTitle = window.parsedMainTitle;
        var titlePreffix;

        if (window.Customization) {
            titlePreffix = HELP.customization.CompanyName;
            parsedMainTitle = HELP.customization.ProductName;
        } else if (parsedMainTitle.indexOf('Kaspersky ') === 0) {
            titlePreffix = parsedMainTitle.slice(0, 9);
            parsedMainTitle = parsedMainTitle.slice(10, parsedMainTitle.length);
        } else if (parsedMainTitle.indexOf('KasperskyOS') === 0) {
            titlePreffix = parsedMainTitle.slice(0, 11);
            parsedMainTitle = parsedMainTitle.slice(12, parsedMainTitle.length);
        }

        var headerHtml = HeaderTemplateFunction({
            titlePreffix: titlePreffix || '',
            title: parsedMainTitle,
            localization: HELP.localization,
            customization: HELP.customization,
            isAllInOne: HELP.isAllInOne,
            isOffline: HELP.isFileProtocol,
            isMacProject: HELP.isMacProject,
            pdfOptions: HELP.pdfOptions
        });

        var footerHtml = FooterTemplateFunction({
            localization: HELP.localization,
            customization: HELP.customization
        });

        var asideHtml = AsideTemplateFunction({
            localization: HELP.localization
        });

        if (window.Customization) {
            var customStyles = CustomStylesTemplateFunction({
                customization: HELP.customization
            });

            $head.append(customStyles);
        }

        $container = $(containerHtml);
        $header = $(headerHtml);
        $footer = $(footerHtml);
        $aside = $(asideHtml);

        var $headerPlaceholder = $container.find('.js_header_placeholder');
        var $asidePlaceholder = $container.find('.js_aside_placeholder');
        var $footerPlaceholder = $container.find('.js_footer_placeholder');

        $headerPlaceholder.append($header);
        $asidePlaceholder.append($aside);
        $footerPlaceholder.append($footer);
        $content = $container.find('.js_content');
        $content.append(processHtml($body.html(), sectionUrl ? menu : null));
        $body.html($container);
        processContent($container);
        $body.addClass('js_tabs');

        var $viewport = $('<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">');
        $head.append($viewport);
        $html.find('base').remove();

        if ($.inArray($html.attr('lang'), ['ar-AE', 'fa-IR']) > -1) {
            $html.attr('dir', 'rtl');
        } else {
            $html.attr('dir', 'ltr');
        }

        FastClick.attach(document.body);

        $overlay = $body.find('.js_overlay');
        loadLangs();
        loadVersions();
        loadMenu(menu);
        handleCookiePolicy($body.find('.js_cookie_policy'));
        checkPrintSectionLink();

        if (HELP.searchWord) {
            $body.find('.js_search_text').val(HELP.searchWord);
            triggerSearch();
        }

        if (HELP.nav.currentPage && HELP.nav.currentPage.url) {
            $menuItem = $(".js_menu_link[href='" + HELP.nav.currentPage.url + "']").closest('.js_menu_item');
            autoScrollContents($menuItem, 0);
        }

        var localUrlRegExp = /([\w_]+\.htm)[l]?(#[\w]+(.htm))?/i;
        var urlMatches = window.location.href.match(localUrlRegExp);
        if (HELP.isMacProject) {
            if (urlMatches[2] && urlMatches[3]) {
                loadContent("./pgs/" + urlMatches[2].slice(1), false, null, urlMatches[0]);
            } else {
                loadContent("./pgs/" + HELP.nav.nextPage.url, false, null, urlMatches[0] + '#' + HELP.nav.nextPage.url);
            }
        } else if (window.history && window.history.replaceState && !HELP.isAllInOne) {
            var initialUrl = /\/([\w_-]+\.\w+$)/.exec(location.pathname)[1]+location.hash;
            window.history.replaceState({
                url: initialUrl
            }, null, initialUrl);
        }

        $modalContent = $overlay.find('.js_modal_content');
        $modalHeader = $overlay.find('.js_modal_header');
        $tooltip = $body.find('.js_tooltip');
        $tooltipContent = $body.find('.js_tooltip_content');

        if (HELP.isIE7 || HELP.isIE8) {
            setTimeout(function () {
                calcAsideWidth($asidePlaceholder);
            }, 500);
        }

        $(".downloadhyperlinktemplate").attr("download", "").addClass("hyperlinktemplate");

        autotestHelperPostprocess();
        updateBreadcrumb();

        var kasperskyFont100 = new window.FontFaceObserver('KasperskySans', { weight: 100 });
        var kasperskyFont300 = new window.FontFaceObserver('KasperskySans', { weight: 300 });
        var kasperskyFont600 = new window.FontFaceObserver('KasperskySans', { weight: 600 });
        var kasperskyFont700 = new window.FontFaceObserver('KasperskySans', { weight: 700 });

        Promise.all([
            kasperskyFont100.load(null, 3000),
            kasperskyFont300.load(null, 3000),
            kasperskyFont600.load(null, 3000),
            kasperskyFont700.load(null, 3000)
        ]).then(showPage, showPage);

        function showPage() {
            $html.css('visibility', 'visible');
            $window.resize();

            if (HELP.isAllInOne) {
                window.print();
            }
        }
    }

    firstRender();
});