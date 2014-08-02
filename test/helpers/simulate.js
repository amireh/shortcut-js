define(function(require) {
  var MODIFIERS = [ 'ctrl', 'alt', 'shift', 'meta' ];
  var K = require('shortcut/constants');

  return function simulate(sequence, target, eventType) {
    var i, evt, code, char;
    var node = $(target || document)[0];
    var modifiers = {};

    var keys = sequence.split('+');
    var modifiers = keys.reduce(function(hsh, key) {
      if (MODIFIERS.indexOf(key) > -1) {
        hsh[key] = true;
      }
      else {
        char = key;
      }

      return hsh;
    }, {});

    eventType = eventType || 'keyup';

    if (char.length > 1) {
      code = K.SPECIAL_KEYS[char];
    }
    else {
      code = char.charCodeAt(0);
    }

    evt = $.Event(eventType);
    evt.altGraphKey = false;
    evt.altKey = !!modifiers.alt;
    evt.bubbles = true;
    evt.cancelBubble = false;
    evt.cancelable = true;
    evt.charCode = code;
    evt.clipboardData = undefined;
    evt.ctrlKey = !!modifiers.ctrl;
    evt.currentTarget = node;
    evt.defaultPrevented = false;
    evt.detail = 0;
    evt.eventPhase = 2;
    evt.keyCode = code;
    evt.keyIdentifier = char.toUpperCase();
    evt.keyLocation = 0;
    evt.layerX = 0;
    evt.layerY = 0;
    evt.metaKey = !!modifiers.meta;
    evt.pageX = 0;
    evt.pageY = 0;
    evt.returnValue = true;
    evt.shiftKey = !!modifiers.shift;
    evt.srcElement = node;
    evt.target = node;
    evt.type = eventType;
    evt.view = window;
    evt.which = code;

    $(node).trigger(evt);
  };
});