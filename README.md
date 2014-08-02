# shortcut

A module for managing application-wide keybindings, like closing open pop-ups on `ESCAPE`, submitting forms using `RETURN` when focus is within an input field, or doing something totally crazy when pressing `Ctrl+Alt+Delete`.

Requires jQuery2.

## Example

```javascript
Shortcut.enable();
Shortcut.add('ctrl+enter', function(e) {
    // your handler here
});
```

## Features

**Wide key support: modifiers, special keys, and NUMPAD**

Shortcut supports four modifier keys: `ctrl`, `alt`, `shift`, and `meta`. A keybinding can be composed of any number of modifier keys with one character.

Special keys like `F1` and `Print` are supported. So are the NUMPAD keys.

**The keybinding handler stack**

Often when managing complex layouts I run into the issue of requiring certain keybindings to do different things based on what the user is currently doing. For example, if the user is viewing a modal dialog, you would want `ESCAPE` to close that dialog, while in another context, like inside a text-area widget, you may want that key to do something else.

Shortcut follows a simple approach to reason about this; internally, it uses a Last-In-First-Out stack for handlers bound to each shortcut. The handler that registers last indicates that it is currently occupying the "foreground" of the application and should take precedence over handlers registered prior.

Once the handler is no longer applicable (e.g, the application context it runs in has changed), it un-registers itself and returns control back to the latest handler in the chain.

As the LIFO stack covers the case of context-switching, Shortcut provides an option to deter from this behavior via the `propagate` option. If you define a handler to allow the propagation of the key event, the entire chain will run until a handler consumes the event, or the chain is finished.

## Installation

Shortcut is built as an AMD module using require.js.

### AMD

```javascript
// AMD style:
require([ 'shortcut' ], function(Shortcut) {
});

// or CommonJS style:
define(function(require) {
    var Shortcut = require('shortcut');
});
```

## API

[TBD]

## Credits

This code was based on [Shortcut](http://www.openjs.com/scripts/events/keyboard_shortcuts/) by Binny V A.

## License

BSD