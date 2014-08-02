define(function(require) {
  var Shortcut = require('shortcut');
  var simulate = require('test/helpers/simulate');
  var $ = require('jquery');

  describe('Shortcut', function() {
    var subject = Shortcut;
    var runner, secondRunner;

    beforeEach(function() {
      runner = jasmine.createSpy('runner');
      secondRunner = jasmine.createSpy('secondRunner');

      subject.enable();
      expect(subject.keyBindingCount()).toEqual(0);
      jasmine.fixture = $('<div id="fixture" />').appendTo(document.body);
    });

    afterEach(function() {
      jasmine.fixture.remove();
      Shortcut.disable();
      Shortcut.reset();
    });

    it('should include without errors', function() {});

    describe('#add', function() {
      it('should add a keybinding', function() {
        expect(function() {
          subject.add('ctrl+enter', runner);
        }).not.toThrow();

        expect(subject.keyBindingCount('ctrl+enter')).toEqual(1);
      });

      describe('shortcut ordering', function() {
        it('should implicitly order keys, enter+ctrl == ctrl+enter', function() {
          subject.add('ctrl+enter', runner);
          subject.add('enter+ctrl', secondRunner);

          simulate('ctrl+enter');
          expect(secondRunner).toHaveBeenCalled();
          expect(runner).not.toHaveBeenCalled();
        });

        it('alt+f+ctrl+shift == ctrl+alt+shift+f', function() {
          subject.add('alt+f+ctrl+shift', runner);
          expect(subject.keyBindingCount('alt+f+ctrl+shift')).toBe(0);
          expect(subject.keyBindingCount('ctrl+alt+shift+f')).toBe(1);
          console.log(subject)
        })
      });
    });

    describe('running', function() {
      it('should run a keybinding', function() {
        subject.add('ctrl+enter', runner);
        simulate('ctrl+enter');
        expect(runner).toHaveBeenCalled();
      });
    });

    describe('#remove', function() {
      it('should remove a specific keybinding runner', function() {
        subject.add('enter', runner);
        expect(subject.keyBindingCount()).toEqual(1);
        subject.remove('enter', runner);
        expect(subject.keyBindingCount()).toEqual(0);
      });

      it('should remove a specific keybinding runner for a specific context', function() {
        subject.add('enter', runner, { context: 'foo' });
        expect(subject.keyBindingCount()).toEqual(1);

        subject.remove('enter', runner);
        expect(subject.keyBindingCount()).toEqual(1);

        subject.remove('enter', runner, { context: 'foo' });
        expect(subject.keyBindingCount()).toEqual(0);
      });

      it('should remove all runners for a keybinding', function() {
        subject.add('enter', runner);
        subject.add('enter', runner);
        expect(subject.keyBindingCount()).toEqual(2);
        subject.remove('enter');
        expect(subject.keyBindingCount()).toEqual(0);
      });
    });

    describe('#removeById', function() {
      it('should work', function() {
        subject.add('enter', runner);
        var id = subject.add('enter', runner);
        expect(subject.keyBindingCount()).toEqual(2);
        subject.removeById(id);
        expect(subject.keyBindingCount()).toEqual(1);
      });

      it('should remove a specific keybinding runner for a specific context', function() {
        subject.add('enter', runner, { context: 'foo' });
        expect(subject.keyBindingCount()).toEqual(1);

        subject.remove('enter', runner);
        expect(subject.keyBindingCount()).toEqual(1);

        subject.remove('enter', runner, { context: 'foo' });
        expect(subject.keyBindingCount()).toEqual(0);
      });

      it('should remove all runners for a keybinding', function() {
        subject.add('enter', runner);
        subject.add('enter', runner);
        expect(subject.keyBindingCount()).toEqual(2);
        subject.remove('enter');
        expect(subject.keyBindingCount()).toEqual(0);
      });
    });

    describe('options.propagate', function() {
      it('should work', function() {
        var secondRunner = jasmine.createSpy('secondRunner');
        subject.add('ctrl+f', runner);
        subject.add('ctrl+f', secondRunner, { propagate: false });

        simulate('ctrl+f');

        expect(runner).not.toHaveBeenCalled();
        expect(secondRunner).toHaveBeenCalled();
      });

      it('should propagate', function() {
        var secondRunner = jasmine.createSpy('secondRunner');
        subject.add('ctrl+f', runner);
        subject.add('ctrl+f', secondRunner, { propagate: true });

        simulate('ctrl+f');

        expect(secondRunner).toHaveBeenCalled();
        expect(runner).toHaveBeenCalled();
      });
    });

    describe('options.disableInInput', function() {
      it('should not run when INPUT has focus', function() {
        var $node = $('<input type="text" />').appendTo(jasmine.fixture);

        subject.add('ctrl+enter', runner, { disableInInput: true });
        simulate('ctrl+enter', $node[0]);

        expect(runner).not.toHaveBeenCalled();
      });

      it('should not run when TEXTAREA has focus', function() {
        var $node = $('<textarea />').appendTo(jasmine.fixture);

        subject.add('ctrl+enter', runner, { disableInInput: true });
        simulate('ctrl+enter', $node[0]);

        expect(runner).not.toHaveBeenCalled();
      });

      it('should run when input[type="radio"] has focus', function() {
        var $node = $('<input type="radio" />').appendTo(jasmine.fixture);

        subject.add('ctrl+enter', runner, { disableInInput: true });
        simulate('ctrl+enter', $node[0]);

        expect(runner).toHaveBeenCalled();
      });

      it('should run when input[type="checkbox"] has focus', function() {
        var $node = $('<input type="checkbox" />').appendTo(jasmine.fixture);

        subject.add('ctrl+enter', runner, { disableInInput: true });
        simulate('ctrl+enter', $node[0]);

        expect(runner).toHaveBeenCalled();
      });
    });

    describe('#keyBindings', function() {
      it('should report the bound shortcuts', function() {
        subject.add('ctrl+f', runner);
        subject.add('ctrl+alt+x', runner);

        expect(subject.keyBindings()).toEqual([
          'ctrl+f',
          'ctrl+alt+x'
        ]);
      });
    });
  });
});