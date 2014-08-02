define('shortcut/constants',[],function() {
  var exports;

  //Work around for stupid Shift key bug created by using lowercase - as a
  //result the shift+num combination was broken
  var SHIFT_NUMPAD = {
    "`":"~",
    "1":"!",
    "2":"@",
    "3":"#",
    "4":"$",
    "5":"%",
    "6":"^",
    "7":"&",
    "8":"*",
    "9":"(",
    "0":")",
    "-":"_",
    "=":"+",
    ";":":",
    "'":"\"",
    ",":"<",
    ".":">",
    "/":"?",
    "\\":"|"
  };

  //Special Keys - and their charCodes
  var SPECIAL_KEYS = {
    'esc':27,
    'escape':27,
    'tab':9,
    'space':32,
    'return':13,
    'enter':13,
    'backspace':8,

    'scrolllock':145,
    'scroll_lock':145,
    'scroll':145,
    'capslock':20,
    'caps_lock':20,
    'caps':20,
    'numlock':144,
    'num_lock':144,
    'num':144,

    'pause':19,
    'break':19,

    'insert':45,
    'home':36,
    'delete':46,
    'end':35,

    'pageup':33,
    'page_up':33,
    'pu':33,

    'pagedown':34,
    'page_down':34,
    'pd':34,

    'left':37,
    'up':38,
    'right':39,
    'down':40,

    'f1':112,
    'f2':113,
    'f3':114,
    'f4':115,
    'f5':116,
    'f6':117,
    'f7':118,
    'f8':119,
    'f9':120,
    'f10':121,
    'f11':122,
    'f12':123
  };

  var MODIFIER_KEYS = [ 'meta', 'shift', 'alt', 'ctrl' ];

  exports = {};
  exports.SHIFT_NUMPAD = SHIFT_NUMPAD;
  exports.SPECIAL_KEYS = SPECIAL_KEYS;
  exports.MODIFIER_KEYS = MODIFIER_KEYS;

  return exports;
});
/**
 * Based on:
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * Version : 2.01.B
 * By Binny V A
 * License : BSD
 */
define('shortcut', ['require','jquery','shortcut/constants'],function(require) {
  // var _ = require('underscore');
  var $ = require('jquery');
  var K = require('shortcut/constants');

  // All the registered handlers for key bindings are stored in this map.
  var keyBindings = {};
  var Shortcut = {};
  var uniqueId = 0;

  //Provide a set of default options
  var DEFAULTS = {
    propagate: false,
    disableInInput: true,
  };

  var SPECIAL_KEYS = K.SPECIAL_KEYS;
  var MODIFIER_KEYS = K.MODIFIER_KEYS;
  var DELIMITER = '+';

  // Stop an event from propagating.
  var consume = function(e) {
    //e.cancelBubble is supported by IE - this will kill the bubbling process.
    e.cancelBubble = true;
    e.returnValue = false;

    // e.stopPropagation works in Firefox.
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (e.preventDefault) {
      e.preventDefault();
    }

    return false;
  };

  // Main routine.
  var onKeyEvent = function(e) {
    var element, inInput;
    var eligibleHandlers = [];
    var rc = true;

    if (!e) {
      e = window.event;
    }

    if (e.target) {
      element = e.target;
    }
    else if (e.srcElement) {
      element = e.srcElement;
    }

    // Text nodes:
    if (element.nodeType === 3) {
      element = element.parentNode;
    }

    if (element.tagName === 'TEXTAREA') {
      inInput = true;
    }
    else if (element.tagName === 'INPUT') {
      if (element.type !== 'radio' && element.type !== 'checkbox') {
        inInput = true;
      }
    }

    Object.keys(keyBindings).some(function(keyBinding) {
      if (matchesKeybinding(e, keyBinding)) {
        eligibleHandlers = [].concat(keyBindings[keyBinding]);

        return true;
      }
    });

    eligibleHandlers.some(function(binding) {
      // Don't enable shortcut keys in Input, Textarea fields for bindings that
      // don't want to:
      if (binding.options.disableInInput && inInput) {
        return;
      }

      binding.callback(e);

      if (!binding.options.propagate) {
        rc = consume(e);
        return true;
      }
    });

    return rc;
  };

  // Given an event and a shortcut keyBinding, test if the keyBinding is
  // fulfilled.
  var matchesKeybinding = function(e, keyBinding) {
    var charCode, character;
    var keys = keyBinding.split('+');

    // Key Pressed - counts the number of valid keypresses - if it is same as
    // the number of keys, the shortcut function is invoked
    var kp = 0;

    // The current key that is being pressed.
    var k, i;

    var modifiers = {
      shift: { wanted: false, pressed: false },
      ctrl : { wanted: false, pressed: false },
      alt  : { wanted: false, pressed: false },
      meta : { wanted: false, pressed: false } // Meta is Mac specific
    };

    // Find Which key is pressed
    if (e.keyCode) {
      charCode = e.keyCode;
    }
    else if (e.which) {
      charCode = e.which;
    }

    character = String.fromCharCode(charCode).toLowerCase();

    if (charCode === 188) { character=","; } //If the user presses , when the type is onkeydown
    if (charCode === 190) { character="."; } //If the user presses , when the type is onkeydown

    if (e.ctrlKey)  { modifiers.ctrl.pressed = true; }
    if (e.shiftKey) { modifiers.shift.pressed = true; }
    if (e.altKey)   { modifiers.alt.pressed = true; }
    if (e.metaKey)  { modifiers.meta.pressed = true; }

    for (i = 0; i < keys.length; i++) {
      k = keys[i];

      //Modifiers
      if (k === 'ctrl' || k === 'control') {
        kp++;
        modifiers.ctrl.wanted = true;
      } else if (k === 'shift') {
        kp++;
        modifiers.shift.wanted = true;
      } else if (k === 'alt') {
        kp++;
        modifiers.alt.wanted = true;
      } else if (k === 'meta') {
        kp++;
        modifiers.meta.wanted = true;
      } else if (k.length > 1) { //If it is a special key
        if (SPECIAL_KEYS[k] === charCode) {
          kp++;
        }
      } else { // The special keys did not match
        if (character === k) {
          kp++;
        }
        // Stupid Shift key bug created by using lowercase
        else if (K.SHIFT_NUMPAD[character] && e.shiftKey) {
          character = K.SHIFT_NUMPAD[character];

          if (character === k) {
            kp++;
          }
        }
      }
    }

    return (
      kp === keys.length &&
      modifiers.ctrl.pressed === modifiers.ctrl.wanted &&
      modifiers.shift.pressed === modifiers.shift.wanted &&
      modifiers.alt.pressed === modifiers.alt.wanted &&
      modifiers.meta.pressed === modifiers.meta.wanted
    );
  };

  /**
   * Start intercepting key events and enable keybinding runners.
   *
   * @param {HTMLElement|String} [target=document.body]
   *        The target to listen to for key events.
   *
   * @param {String} [eventType="keyup"]
   *        The key event to listen to.
   */
  Shortcut.enable = function(target, eventType) {
    this.event = [ eventType || 'keyup', 'shortcut_plugin' ].join('.');
    this.target = target || document;

    $(this.target).on(this.event, onKeyEvent);
  };

  /**
   * Stop intercepting key events, disable keybinding runners.
   */
  Shortcut.disable = function() {
    $(this.target).off(this.event, onKeyEvent);
  };

  /**
   * Reset registered keybinding runners.
   */
  Shortcut.reset = function() {
    keyBindings = {};
  };

  /**
   * Add a new keybinding runner. Runners are maintained in a Last-In-First-Out
   * stack, so the later the runner is registered, the higher precedence it has
   * over others unless it explicitly states otherwise.
   *
   * Examples of valid keyBindings:
   *
   *   - "ctrl+enter"
   *   - "shift+alt+F"
   *   - "f"
   *   - "ctrl+shift+alt+meta+x"
   *
   * @param {String} keyBinding
   *        The key keyBinding which can be any character mixed with special
   *        characters like "alt", "control", "shift", and "meta" (Mac only).
   *
   *        A keyBinding is created by joining characters by "+".
   *
   * @param {Function} callback
   *        Your keybinding handler.
   *
   * @param {Object} [options={}]
   *        Options for the keybinding.
   *
   * @param {Boolean} [options.propagate=false]
   *        Allow other keybinding handlers to handle this event.
   *
   * @param {Boolean} [options.disableInInput=true]
   *        Don't run the keybinding handler if the focus is in a Textarea or
   *        Input field.
   *
   * @param {Mixed} [options.context=null]
   *        The "thisArg" context to execute the callback in.
   *
   * @return {Number}
   *         A unique id for this keybinding runner which you can use to later
   *         remove it.
   */
  Shortcut.add = function(keyBinding, callback, options) {
    var option;
    var id = ++uniqueId;

    options = options || {};

    for (option in DEFAULTS) {
      if (DEFAULTS.hasOwnProperty(option) && options[option] === undefined) {
        options[option] = DEFAULTS[option];
      }
    }

    keyBinding = keyBinding.toLowerCase();
    keyBinding = keyBinding.split(DELIMITER);
    keyBinding.sort(function(a, b) {
      return MODIFIER_KEYS.indexOf(b) - MODIFIER_KEYS.indexOf(a);
    });

    keyBinding = keyBinding.join(DELIMITER);

    keyBindings[keyBinding] = keyBindings[keyBinding] || [];
    keyBindings[keyBinding].unshift({
      id: id,

      callback: callback.bind(options.context),
      options: options,

      // we need these to properly remove the binding if necessary
      _callback: callback,
      _context: options.context,
    });

    return id;
  };
  /**
   * Unregister a keybinding runner.
   *
   * @param {String} keyBinding
   *        The keyBinding the runner was bound to in Shortcut#add.
   *
   * @param {Function} [callback=null]
   *        The runner passed to Shortcut#add, if you want to remove a specific
   *        one. Otherwise, all registered runners for that shortcut are
   *        removed.
   *
   * @param {Object} [options={}]
   * @param {Mixed} options.context
   *        If you registered the runner using a specific context, you must
   *        pass it here to remove the exact runner for that context. Otherwise,
   *        you may end up removing runners for other context instances which
   *        Shortcut will not do for you.
   */
  Shortcut.remove = function(keyBinding, callback, options) {
    var context;

    if (!callback) {
      keyBindings[keyBinding] = [];
    }
    else {
      context = (options || {}).context;
      keyBindings[keyBinding] = keyBindings[keyBinding].filter(function(binding) {
        return !(
          binding._callback === callback &&
          context === binding._context
        );
      });
    }
  };

  /**
   * Unregister a keybinding runner using the #id received when adding it.
   *
   * @param  {Number} id
   *         The output of Shortcut#add when you registered this runner.
   *
   * @return {Boolean}
   *         Whether the runner was found and was removed.
   */
  Shortcut.removeById = function(id) {
    var set, handler;
    Object.keys(keyBindings).some(function(keyBinding) {
      var _set;

      _set = keyBindings[keyBinding];
      _set.some(function(_handler) {
        if (_handler.id === id) {
          set = _set;
          handler = _handler;

          return true;
        }
      });

      return !!handler;
    });

    if (handler) {
      set.splice(set.indexOf(handler), 1);
      return true;
    }
  };

  /**
   * @return {String[]}
   *         The list of keybindings that have any runners registered.
   */
  Shortcut.keyBindings = function() {
    return Object.keys(keyBindings).filter(function(keyBinding) {
      return keyBindings[keyBinding].length > 0;
    });
  };

  /**
   * @return {Number}
   *         The number of runners registered to the given keybindings, or to
   *         all keybindings.
   */
  Shortcut.keyBindingCount = function(keyBinding) {
    if (keyBinding) {
      return (keyBindings[keyBinding] || []).length;
    }

    return Object.keys(keyBindings).reduce(function(count, combo) {
      return count += keyBindings[combo].length;
    }, 0);
  };

  return Shortcut;
});
