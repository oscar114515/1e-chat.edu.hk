(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Uno = {}));
})(this, (function (exports) { 'use strict';

  /**
   * Enum holding available card colors.
   *
   * RED, BLUE, GREEN and YELLOW,
   * represented with indexes
   * 1, 2, 3, 4 respectively.
   */
  exports.Color = void 0;
  (function (Color) {
      Color[Color["RED"] = 1] = "RED";
      Color[Color["BLUE"] = 2] = "BLUE";
      Color[Color["GREEN"] = 3] = "GREEN";
      Color[Color["YELLOW"] = 4] = "YELLOW";
  })(exports.Color || (exports.Color = {}));
  const colors = [exports.Color.RED, exports.Color.BLUE, exports.Color.GREEN, exports.Color.YELLOW];
  /**
   * Runtime type checking
   */
  function isValidColor(color) {
      return colors.indexOf(color) !== -1;
  }

  exports.Value = void 0;
  (function (Value) {
      // numbers
      Value[Value["ZERO"] = 0] = "ZERO";
      Value[Value["ONE"] = 1] = "ONE";
      Value[Value["TWO"] = 2] = "TWO";
      Value[Value["THREE"] = 3] = "THREE";
      Value[Value["FOUR"] = 4] = "FOUR";
      Value[Value["FIVE"] = 5] = "FIVE";
      Value[Value["SIX"] = 6] = "SIX";
      Value[Value["SEVEN"] = 7] = "SEVEN";
      Value[Value["EIGHT"] = 8] = "EIGHT";
      Value[Value["NINE"] = 9] = "NINE";
      // special cards
      Value[Value["DRAW_TWO"] = 10] = "DRAW_TWO";
      Value[Value["REVERSE"] = 11] = "REVERSE";
      Value[Value["SKIP"] = 12] = "SKIP";
      Value[Value["WILD"] = 13] = "WILD";
      Value[Value["WILD_DRAW_FOUR"] = 14] = "WILD_DRAW_FOUR";
  })(exports.Value || (exports.Value = {}));
  const values = [
      exports.Value.ZERO,
      exports.Value.ONE,
      exports.Value.TWO,
      exports.Value.THREE,
      exports.Value.FOUR,
      exports.Value.FIVE,
      exports.Value.SIX,
      exports.Value.SEVEN,
      exports.Value.EIGHT,
      exports.Value.NINE,
      exports.Value.DRAW_TWO,
      exports.Value.REVERSE,
      exports.Value.SKIP,
      exports.Value.WILD,
      exports.Value.WILD_DRAW_FOUR,
  ];
  /**
   * Returns true if `value` is {@link Value.WILD} or {@link Value.WILD_DRAW_FOUR}.
   */
  function isWild(value) {
      return value === exports.Value.WILD || value === exports.Value.WILD_DRAW_FOUR;
  }
  /**
   * Runtime type checking
   */
  function isValidValue(value) {
      return values.indexOf(value) !== -1;
  }

  class Card {
      constructor(value, color) {
          if (!isWild(value) && color === undefined) {
              throw Error('Only wild cards can be initialized with no color');
          }
          this.value = value;
          this.color = color;
      }
      get value() {
          return this._value;
      }
      set value(value) {
          if (this._value !== undefined && !this.isWildCard())
              throw new Error('Card values cannot be changed.');
          else if (!isValidValue(value))
              throw new Error('The value must be a value from Value enum.');
          this._value = value;
      }
      /**
       * Index of the card color (from 0 to 3).
       *
       * WILD and WILD DRAW FOUR will not have this property set at start,
       * leaving it `undefined` until user sets it.
       */
      get color() {
          return this._color;
      }
      /**
       * @throws if trying to change the color of a non-wild card.
       * @throws if trying to set this to an unexistent color.
       */
      set color(color) {
          if (this._color !== undefined && !this.isWildCard())
              throw new Error('Only wild cards can have theirs colors changed.');
          else if (color !== undefined && !isValidColor(color))
              throw new Error('The color must be a value from Color enum.');
          this._color = color;
      }
      isWildCard() {
          return isWild(this.value);
      }
      isSpecialCard() {
          return (this.isWildCard() ||
              this.value === exports.Value.DRAW_TWO ||
              this.value === exports.Value.REVERSE ||
              this.value === exports.Value.SKIP);
      }
      /**
       * Checks if this card instance may be played upon
       * the given card.
       *
       * @example
       *
       * const blueZero = new Card(CardValue.ZERO, CardColor.BLUE);
       * const wild = new Card(CardValue.WILD);
       * const redSkip = new Card(CardValue.SKIP, CardColor.RED);
       * blueZero.matches(redSkip);
       * //> false
       * blueZero.matches(new Card(CardValue.ZERO, CardColor.YELLOW));
       * //> true
       * wild.matches(redSkip);
       * //> true
       *
       * @throws If any of the cards don't have their colors set.
       *
       * @param other The card to be compared with
       */
      matches(other) {
          if (this.isWildCard())
              return true;
          else if (this.color === undefined || other.color === undefined)
              throw new Error('Both cards must have theirs colors set before comparing');
          return other.value === this.value || other.color === this.color;
      }
      get score() {
          switch (this.value) {
              case exports.Value.DRAW_TWO:
              case exports.Value.SKIP:
              case exports.Value.REVERSE:
                  return 20;
              case exports.Value.WILD:
              case exports.Value.WILD_DRAW_FOUR:
                  return 50;
              default:
                  return this.value;
          }
      }
      /**
       * Check if the card exactly equals with the provided values.
       *
       * If `color` is not specified, only `value` is checked.
       *
       * @param value Value to check against
       * @param color Color to check against
       */
      is(value, color) {
          let matches = this.value === value;
          if (!!color)
              matches = matches && this.color === color;
          return matches;
      }
      toString() {
          return `${exports.Color[this.color] || 'NO_COLOR'} ${exports.Value[this.value]}`;
      }
  }

  const defaults = {
      isCancelable: true,
  };
  class Event {
      get type() {
          return this._type;
      }
      get isCancelable() {
          return this._isCancelable;
      }
      get canceled() {
          return this._canceled;
      }
      constructor(type, options) {
          if (!type)
              throw new Error('Event type is mandatory');
          options = Object.assign({}, defaults, options);
          if (typeof options.isCancelable === 'undefined')
              options.isCancelable = true;
          this._type = type;
          this._isCancelable = options.isCancelable;
          this._canceled = false;
      }
      preventDefault() {
          if (this.isCancelable)
              this._canceled = true;
      }
  }

  /**
   * Fired when a player requests cards from the draw pile.
   *
   * @event
   */
  class BeforeDrawEvent extends Event {
      /**
       * @param {Player} player   The player will draw
       * @param {number} quantity The quantity of cards will be drawn
       */
      constructor(player, quantity) {
          super('beforedraw');
          this.player = player;
          this.quantity = quantity;
      }
  }
  /**
   * Fired after player's drawn cards are added to his hands.
   *
   * @event
   */
  class DrawEvent extends Event {
      /**
       * @param {Player} player The player that has drawn
       * @param {Card[]} cards The cards that were drawn
       */
      constructor(player, cards) {
          super('draw');
          this.player = player;
          this.cards = cards;
      }
  }
  /**
   * Fired when a player can pass and requests to pass its turn.
   *
   * @event
   */
  class BeforePassEvent extends Event {
      /**
       * @param {Player} player The player that will pass
       */
      constructor(player) {
          super('beforepass');
          this.player = player;
      }
  }
  /**
   * Fired before player discards a card in the discard pile.
   *
   * @event
   */
  class BeforeCardPlayEvent extends Event {
      /**
       * @param {Card} card The card that will be played
       * @param {Player} player The player that will play
       */
      constructor(card, player) {
          super('beforecardplay');
          this.card = card;
          this.player = player;
      }
  }
  /**
   * Fired after player's card is thrown in the discard pile.
   *
   * @event
   */
  class CardPlayEvent extends Event {
      /**
       * @param {Card} card The card that was played
       * @param {Player} player The player that played
       */
      constructor(card, player) {
          super('cardplay');
          this.card = card;
          this.player = player;
      }
  }
  /**
   * Fired when {@link game#currentPlayer | currentPlayer} changes.
   *
   * @event
   */
  class NextPlayerEvent extends Event {
      /**
       * @param {Player} player The new player
       */
      constructor(player) {
          super('nextplayer');
          this.player = player;
      }
  }
  /**
   * Fired when `winner` has 0 cards at hand.
   *
   * @event
   */
  class GameEndEvent extends Event {
      /**
       * @param {Player} winner The big winner
       * @param {number} score Player's final score
       */
      constructor(winner, score) {
          super('end', {
              isCancelable: false,
          });
          this.winner = winner;
          this.score = score;
      }
  }

  var src = {exports: {}};

  var deck$1 = function(cards, random){
    this.reset = function(){
      this.cards = cards.slice(0);
      this.length = this.cards.length;
    };
    this.shuffle = function(){
      fisherYates(this.cards);
    };

    this.reset();
    this.shuffle();

    this.deal = function(numberOfCards, arrayOfHands){
      for(var i = 0; i < numberOfCards; i++) {
        for(var j = 0; j < arrayOfHands.length; j++) {
          if (!arrayOfHands[j] || !arrayOfHands[j].push) {
            throw new Error('Deck#deal | Undefined Hand');
          }
          arrayOfHands[j].push(this.cards.pop());
        }
      }
      this.length = this.cards.length;
    };

    this.draw = function(num){
      if(!num || num <= 1){
        this.length = this.cards.length - 1;
        return this.cards.pop();
      }

      var ret = [];
      for(var i = 0; i < num; i++)
        ret.push(this.cards.pop());
      this.length = this.cards.length;
      return ret;
    };

    this.drawFromBottomOfDeck = function(num){
      if(!num || num < 1) {
        num = 1;
      }

      var ret = [];
      for(var i = 0; i < num; i++) {
        ret.push(this.cards.shift());
      }
      this.length = this.cards.length;

      if (ret.length === 1) {
        return ret[0];
      } else {
        return ret;
      }
    };

    this.drawRandom = function(num){
      var _draw = function(){
        var index = Math.floor(random() * this.cards.length);
        var card = this.cards[index];
        this.cards.splice(index, 1);
        this.length = this.cards.length;
        return card;
      };

      if(!num || num <= 1){
        return _draw.apply(this);
      }else {
        var cards = [];
        for(var i = 0; i < num; i++){
          cards.push(_draw.apply(this));
        }
        return cards;
      }
    };

    this.putOnTopOfDeck = function(cards){
      if(!cards instanceof Array)
        this.cards.push(cards);
      else
        for(var i = 0; i < cards.length; i++)
          this.cards.push(cards[i]);
      this.length = this.cards.length;
    };

    this.putOnBottomOfDeck = function(cards){
      if(!cards instanceof Array)
        this.cards.unshift(cards);
      else
        for(var i = 0; i < cards.length; i++)
          this.cards.unshift(cards[i]);
      this.length = this.cards.length;
    };

    //array shuffling algorithm: http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    function fisherYates(arr){
      var i = arr.length;
      if(i === 0)
        return false;
      while(--i){
         var j = Math.floor(random() * (i + 1));
         var tempi = arr[i];
         var tempj = arr[j];
         arr[i] = tempj;
         arr[j] = tempi;
      }
    }
  };

  var playingCard$1 = function(suit, description, sort){
    this.suit = suit;
    this.description = description;
    this.sort = sort;

    this.toString = function(){
      return this.description + ' of ' + this.suit + 's';
    };

    this.toShortDisplayString = function(){
      var suit = this.suit.substring(0,1);
      var value;
      switch(this.sort){
        case 11:
          value = 'J';
          break;
        case 12:
          value = 'Q';
          break;
        case 13:
          value = 'K';
          break;
        case 14:
          value = 'A';
          break;
        default:
          value = this.sort;
      }
      return value + suit;
    };
  };

  var playingCard = playingCard$1;

  var playingCardDeck$1 = function(){
    this.cards = [
      new playingCard('Club', 'Two', 2),
      new playingCard('Club', 'Three', 3),
      new playingCard('Club', 'Four', 4),
      new playingCard('Club', 'Five', 5),
      new playingCard('Club', 'Six', 6),
      new playingCard('Club', 'Seven', 7),
      new playingCard('Club', 'Eight', 8),
      new playingCard('Club', 'Nine', 9),
      new playingCard('Club', 'Ten', 10),
      new playingCard('Club', 'Jack', 11),
      new playingCard('Club', 'Queen', 12),
      new playingCard('Club', 'King', 13),
      new playingCard('Club', 'Ace', 14),
      new playingCard('Diamond', 'Two', 2),
      new playingCard('Diamond', 'Three', 3),
      new playingCard('Diamond', 'Four', 4),
      new playingCard('Diamond', 'Five', 5),
      new playingCard('Diamond', 'Six', 6),
      new playingCard('Diamond', 'Seven', 7),
      new playingCard('Diamond', 'Eight', 8),
      new playingCard('Diamond', 'Nine', 9),
      new playingCard('Diamond', 'Ten', 10),
      new playingCard('Diamond', 'Jack', 11),
      new playingCard('Diamond', 'Queen', 12),
      new playingCard('Diamond', 'King', 13),
      new playingCard('Diamond', 'Ace', 14),
      new playingCard('Heart', 'Two', 2),
      new playingCard('Heart', 'Three', 3),
      new playingCard('Heart', 'Four', 4),
      new playingCard('Heart', 'Five', 5),
      new playingCard('Heart', 'Six', 6),
      new playingCard('Heart', 'Seven', 7),
      new playingCard('Heart', 'Eight', 8),
      new playingCard('Heart', 'Nine', 9),
      new playingCard('Heart', 'Ten', 10),
      new playingCard('Heart', 'Jack', 11),
      new playingCard('Heart', 'Queen', 12),
      new playingCard('Heart', 'King', 13),
      new playingCard('Heart', 'Ace', 14),
      new playingCard('Spade', 'Two', 2),
      new playingCard('Spade', 'Three', 3),
      new playingCard('Spade', 'Four', 4),
      new playingCard('Spade', 'Five', 5),
      new playingCard('Spade', 'Six', 6),
      new playingCard('Spade', 'Seven', 7),
      new playingCard('Spade', 'Eight', 8),
      new playingCard('Spade', 'Nine', 9),
      new playingCard('Spade', 'Ten', 10),
      new playingCard('Spade', 'Jack', 11),
      new playingCard('Spade', 'Queen', 12),
      new playingCard('Spade', 'King', 13),
      new playingCard('Spade', 'Ace', 14)
    ];
  };

  //var util = require('util');
  var deck = deck$1;
  var playingCardDeck = playingCardDeck$1;
  var shuffle = src.exports = {};
  var defaultOptions = {
    deck: new playingCardDeck().cards,
    numberOfDecks : 1,
    random: function(){ return Math.random(); }
  };

  shuffle.playingCards = function(){
    return new playingCardDeck().cards;
  };

  shuffle.shuffle = function(options){
    if(!options)
      options = defaultOptions;

    if(!options.deck) {
      options.deck = defaultOptions.deck;
    }

    if(options.numberOfDecks) {
      var oneDeck = options.deck;
      for(var i = 0 ; i < options.numberOfDecks - 1  ; i++) {
        options.deck = options.deck.concat(oneDeck);
      }
    }

    if(!options.random) {
      options.random = defaultOptions.random;
    }

    return new deck(options.deck, options.random);
  };

  var srcExports = src.exports;

  function createUnoDeck() {
      /*
        108 cards
    
        76x numbers (0-9, all colors)
        8x draw two (2x each color)
        8x reverse (2x each color)
        8x skip (2x each color)
        4x wild
        4x wild draw four
      */
      const deck = [];
      const createCards = (qty, value, color) => {
          const cards = [];
          for (let i = 0; i < qty; i++)
              cards.push(new Card(value, color));
          return cards;
      };
      // for each color...
      colors.forEach((color) => {
          // CREATE NUMBERS
          deck.push.apply(deck, createCards(1, exports.Value.ZERO, color));
          for (let n = exports.Value.ONE; n <= exports.Value.NINE; n++) {
              deck.push.apply(deck, createCards(2, n, color));
          }
          deck.push.apply(deck, createCards(2, exports.Value.DRAW_TWO, color));
          deck.push.apply(deck, createCards(2, exports.Value.SKIP, color));
          deck.push.apply(deck, createCards(2, exports.Value.REVERSE, color));
      });
      deck.push.apply(deck, createCards(4, exports.Value.WILD));
      deck.push.apply(deck, createCards(4, exports.Value.WILD_DRAW_FOUR));
      return deck;
  }
  class Deck {
      get cards() {
          return this.shuffle.cards;
      }
      get length() {
          return this.shuffle.length;
      }
      constructor() {
          this.shuffle = srcExports.shuffle({ deck: createUnoDeck() });
      }
      draw(num) {
          num = num || 1;
          let cards = [];
          // if the amount to draw is more than the cards we have...
          if (num >= this.length) {
              const length = this.length;
              // draw all we have...
              cards = cards.concat(this.shuffle.draw.call(this, length));
              // regenerate the draw pile
              this.shuffle.reset();
              this.shuffle.shuffle();
              // then draw the rest we need
              num = num - length;
              if (num === 0)
                  return cards;
          }
          return cards.concat(this.shuffle.draw(num));
      }
  }

  var R = typeof Reflect === 'object' ? Reflect : null;
  var ReflectApply = R && typeof R.apply === 'function'
    ? R.apply
    : function ReflectApply(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };

  var ReflectOwnKeys;
  if (R && typeof R.ownKeys === 'function') {
    ReflectOwnKeys = R.ownKeys;
  } else if (Object.getOwnPropertySymbols) {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
      return Object.getOwnPropertyNames(target)
        .concat(Object.getOwnPropertySymbols(target));
    };
  } else {
    ReflectOwnKeys = function ReflectOwnKeys(target) {
      return Object.getOwnPropertyNames(target);
    };
  }

  function ProcessEmitWarning(warning) {
    if (console && console.warn) console.warn(warning);
  }

  var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
    return value !== value;
  };

  function EventEmitter() {
    EventEmitter.init.call(this);
  }
  var events = EventEmitter;

  // Backwards-compat with node 0.10.x
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._eventsCount = 0;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  var defaultMaxListeners = 10;

  function checkListener(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
    }
  }

  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
        throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
      }
      defaultMaxListeners = arg;
    }
  });

  EventEmitter.init = function() {

    if (this._events === undefined ||
        this._events === Object.getPrototypeOf(this)._events) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
      throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
    }
    this._maxListeners = n;
    return this;
  };

  function _getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return _getMaxListeners(this);
  };

  EventEmitter.prototype.emit = function emit(type) {
    var args = [];
    for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
    var doError = (type === 'error');

    var events = this._events;
    if (events !== undefined)
      doError = (doError && events.error === undefined);
    else if (!doError)
      return false;

    // If there is no 'error' event listener then throw.
    if (doError) {
      var er;
      if (args.length > 0)
        er = args[0];
      if (er instanceof Error) {
        // Note: The comments on the `throw` lines are intentional, they show
        // up in Node's output if this results in an unhandled exception.
        throw er; // Unhandled 'error' event
      }
      // At least give some kind of context to the user
      var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
      err.context = er;
      throw err; // Unhandled 'error' event
    }

    var handler = events[type];

    if (handler === undefined)
      return false;

    if (typeof handler === 'function') {
      ReflectApply(handler, this, args);
    } else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        ReflectApply(listeners[i], this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    checkListener(listener);

    events = target._events;
    if (events === undefined) {
      events = target._events = Object.create(null);
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener !== undefined) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (existing === undefined) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
        // If we've already got an array, just append.
      } else if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }

      // Check for listener leak
      m = _getMaxListeners(target);
      if (m > 0 && existing.length > m && !existing.warned) {
        existing.warned = true;
        // No error code for this since it is a Warning
        // eslint-disable-next-line no-restricted-syntax
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + String(type) + ' listeners ' +
                            'added. Use emitter.setMaxListeners() to ' +
                            'increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        ProcessEmitWarning(w);
      }
    }

    return target;
  }

  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function onceWrapper() {
    if (!this.fired) {
      this.target.removeListener(this.type, this.wrapFn);
      this.fired = true;
      if (arguments.length === 0)
        return this.listener.call(this.target);
      return this.listener.apply(this.target, arguments);
    }
  }

  function _onceWrap(target, type, listener) {
    var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
    var wrapped = onceWrapper.bind(state);
    wrapped.listener = listener;
    state.wrapFn = wrapped;
    return wrapped;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    checkListener(listener);
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        checkListener(listener);
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // Emits a 'removeListener' event if and only if the listener was removed.
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        checkListener(listener);

        events = this._events;
        if (events === undefined)
          return this;

        list = events[type];
        if (list === undefined)
          return this;

        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (position === 0)
            list.shift();
          else {
            spliceOne(list, position);
          }

          if (list.length === 1)
            events[type] = list[0];

          if (events.removeListener !== undefined)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };

  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events, i;

        events = this._events;
        if (events === undefined)
          return this;

        // not listening for removeListener, no need to emit
        if (events.removeListener === undefined) {
          if (arguments.length === 0) {
            this._events = Object.create(null);
            this._eventsCount = 0;
          } else if (events[type] !== undefined) {
            if (--this._eventsCount === 0)
              this._events = Object.create(null);
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = Object.create(null);
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners !== undefined) {
          // LIFO order
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }

        return this;
      };

  function _listeners(target, type, unwrap) {
    var events = target._events;

    if (events === undefined)
      return [];

    var evlistener = events[type];
    if (evlistener === undefined)
      return [];

    if (typeof evlistener === 'function')
      return unwrap ? [evlistener.listener || evlistener] : [evlistener];

    return unwrap ?
      unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
  }

  EventEmitter.prototype.listeners = function listeners(type) {
    return _listeners(this, type, true);
  };

  EventEmitter.prototype.rawListeners = function rawListeners(type) {
    return _listeners(this, type, false);
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events !== undefined) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener !== undefined) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
  };

  function arrayClone(arr, n) {
    var copy = new Array(n);
    for (var i = 0; i < n; ++i)
      copy[i] = arr[i];
    return copy;
  }

  function spliceOne(list, index) {
    for (; index + 1 < list.length; index++)
      list[index] = list[index + 1];
    list.pop();
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  function createProxyListener(originalListener, context) {
      return function (event) {
          const returnValue = originalListener.call(context, event);
          const shouldContinue = returnValue !== false;
          if (!shouldContinue)
              event.preventDefault();
          // console.log("cancel?", !shouldContinue);
          return !event.canceled;
      };
  }
  class CancelableEventEmitter extends events.EventEmitter {
      on(eventName, listener) {
          return super.on(eventName, createProxyListener(listener, this));
      }
      emit(type, data) {
          throw new Error('Event dispatching must be done via #dispatchEvent');
      }
      /**
       * @param {Event} event
       */
      dispatchEvent(event) {
          return this.listeners(event.type).every((handler) => handler(event));
      }
  }

  var GameDirection;
  (function (GameDirection) {
      GameDirection[GameDirection["CLOCKWISE"] = 1] = "CLOCKWISE";
      GameDirection[GameDirection["COUNTER_CLOCKWISE"] = 2] = "COUNTER_CLOCKWISE";
  })(GameDirection || (GameDirection = {}));

  class Player {
      constructor(name) {
          this.hand = [];
          name = !!name ? name.trim() : name;
          if (!name)
              throw new Error('Player must have a name');
          this.name = name;
      }
      getCardByValue(value) {
          if (!value)
              return undefined;
          return this.hand.find((c) => c.value === value);
      }
      hasCard(card) {
          if (!card)
              return false;
          return this.hand.some((c) => c.value === card.value && c.color === card.color);
      }
      removeCard(card) {
          if (!this.hasCard(card))
              return;
          const i = this.hand.findIndex((c) => c.value === card.value && c.color === card.color);
          this.hand.splice(i, 1);
      }
      valueOf() {
          return this.name;
      }
      toString() {
          return this.name;
      }
  }

  const CARDS_PER_PLAYER = 7;
  /**
   * Uno game.
   *
   * @fires `beforedraw`
   * @fires `draw`
   * @fires `beforepass`
   * @fires `beforecardplay`
   * @fires `cardplay`
   * @fires `nextplayer`
   * @fires `end`
   */
  class Game extends CancelableEventEmitter {
      constructor(playerNames, houseRules = []) {
          super();
          this._players = [];
          // control vars
          /**
           * The player have draw in his turn?
           */
          this.drawn = false;
          /**
           * Who yelled uno?
           *
           * key: player name
           * value: true/false
           */
          this.yellers = {};
          this._players = this.fixPlayers(playerNames);
          houseRules.forEach((rule) => rule.setup(this));
          this.newGame();
      }
      newGame() {
          this.drawPile = new Deck();
          this.direction = GameDirection.CLOCKWISE;
          this._players.forEach((p) => (p.hand = this.drawPile.draw(CARDS_PER_PLAYER)));
          // do not start with special cards (REVERSE, DRAW, etc)
          do {
              this._discardedCard = this.drawPile.draw()[0];
          } while (this._discardedCard.isSpecialCard());
          // select starting player
          this._currentPlayer = this._players[getRandomInt(0, this._players.length - 1)];
      }
      getPlayer(name) {
          const player = this._players[this.getPlayerIndex(name)];
          if (!player)
              return undefined;
          return player;
      }
      get currentPlayer() {
          return this._currentPlayer;
      }
      set currentPlayer(player) {
          player = this.getPlayer(player.name);
          if (!player)
              throw new Error('The given player does not exist');
          this._currentPlayer = player;
      }
      get nextPlayer() {
          return this.getNextPlayer();
      }
      get discardedCard() {
          return this._discardedCard;
      }
      set discardedCard(card) {
          if (!card)
              return;
          if (card.color === undefined || card.color === null)
              throw new Error('Discarded cards cannot have theirs colors as null');
          this._discardedCard = card;
      }
      get players() {
          return this._players;
      }
      get deck() {
          return this.drawPile;
      }
      get playingDirection() {
          return this.direction;
      }
      set playingDirection(dir) {
          if (dir !== GameDirection.CLOCKWISE &&
              dir != GameDirection.COUNTER_CLOCKWISE)
              throw new Error('Invalid direction');
          if (dir !== this.direction)
              this.reverseGame();
      }
      /**
       * @fires `beforedraw`
       * @fires `draw`
       */
      draw(player, qty, { silent } = { silent: false }) {
          if (arguments.length == 0)
              player = this._currentPlayer;
          qty = qty || 1;
          if (!silent && !this.dispatchEvent(new BeforeDrawEvent(player, qty)))
              return;
          const drawnCards = this.privateDraw(player, qty);
          if (!silent && !this.dispatchEvent(new DrawEvent(player, drawnCards)))
              return;
          this.drawn = true;
          // reset UNO! yell state
          this.yellers[player.name] = false;
      }
      /**
       * @fires `beforepass`
       * @fires `nextplayer`
       */
      pass() {
          if (!this.drawn)
              throw new Error(`${this._currentPlayer} must draw at least one card before passing`);
          if (!this.dispatchEvent(new BeforePassEvent(this._currentPlayer)))
              return;
          this.goToNextPlayer();
      }
      /**
       * @fires `beforecardplay`
       * @fires `cardplay`
       * @fires `nextplayer`
       * @fires `end`
       */
      play(card, { silent } = { silent: false }) {
          const currentPlayer = this._currentPlayer;
          if (!card)
              return;
          // check if player has the card at hand...
          if (!currentPlayer.hasCard(card))
              throw new Error(`${currentPlayer} does not have card ${card} at hand`);
          if (!silent &&
              !this.dispatchEvent(new BeforeCardPlayEvent(card, this._currentPlayer)))
              return;
          if (card.color == undefined)
              throw new Error('Card must have its color set before playing');
          // check if the played card matches the card from the discard pile...
          if (!card.matches(this._discardedCard))
              throw new Error(`${this._discardedCard}, from discard pile, does not match ${card}`);
          currentPlayer.removeCard(card);
          this._discardedCard = card;
          if (!silent &&
              !this.dispatchEvent(new CardPlayEvent(card, this._currentPlayer)))
              return;
          if (currentPlayer.hand.length == 0) {
              const score = this.calculateScore();
              // game is over, we have a winner!
              this.dispatchEvent(new GameEndEvent(this._currentPlayer, score));
              // TODO: how to stop game after it's finished? Finished variable? >.<
              return;
          }
          switch (this._discardedCard.value) {
              case exports.Value.WILD_DRAW_FOUR:
                  this.privateDraw(this.getNextPlayer(), 4);
                  this.goToNextPlayer(true);
                  break;
              case exports.Value.DRAW_TWO:
                  this.privateDraw(this.getNextPlayer(), 2);
                  this.goToNextPlayer(true);
                  break;
              case exports.Value.SKIP:
                  this.goToNextPlayer(true);
                  break;
              case exports.Value.REVERSE:
                  this.reverseGame();
                  if (this._players.length == 2)
                      // Reverse works like Skip
                      this.goToNextPlayer(true);
                  break;
          }
          this.goToNextPlayer();
      }
      /**
       * Yell UNO!
       *
       * @param yellingPlayer
       * Who is yelling UNO!
       * If no player is given, {@link Game.currentPlayer} is used for this value.
       *
       * @returns
       * The players that need to draw because they did not yell Uno while having 1 card.
       */
      uno(yellingPlayer) {
          yellingPlayer = yellingPlayer || this._currentPlayer;
          // the users that will draw;
          let drawingPlayers;
          // if player is the one who has 1 card, just mark as yelled
          // (he may yell UNO! before throwing his card, so he may have
          // 2 cards at hand when yelling uno)
          if (yellingPlayer.hand.length <= 2 && !this.yellers[yellingPlayer.name]) {
              this.yellers[yellingPlayer.name] = true;
              return [];
          }
          else {
              // else if the user has already yelled or if he has more than 2 cards...
              // is there anyone with 1 card at hand that did not yell uno?
              drawingPlayers = this._players.filter((p) => p.hand.length == 1 && !this.yellers[p.name]);
              // if there isn't anyone...
              if (drawingPlayers.length == 0) {
                  // the player was lying, so he will draw
                  drawingPlayers = [yellingPlayer];
              }
          }
          drawingPlayers.forEach((p) => this.privateDraw(p, 2));
          // return who drawn
          return drawingPlayers;
      }
      fixPlayers(playerNames) {
          if (!playerNames ||
              !playerNames.length ||
              playerNames.length < 2 ||
              playerNames.length > 10)
              throw new Error('There must be 2 to 10 players in the game');
          else if (findDuplicates(playerNames).length)
              throw new Error('Player names must be different');
          return playerNames.map((player) => {
              return new Player(player);
          });
      }
      getNextPlayer() {
          let idx = this.getPlayerIndex(this._currentPlayer);
          if (++idx == this._players.length)
              idx = 0;
          return this._players[idx];
      }
      getPlayerIndex(playerName) {
          if (typeof playerName !== 'string')
              playerName = playerName.name;
          return this._players.map((p) => p.name).indexOf(playerName);
      }
      /**
       * Set current player to the next in the line,
       * with no validations, reseting all per-turn controllers
       * (`draw`, ...)
       *
       * @fires `nextplayer`
       */
      goToNextPlayer(silent) {
          this.drawn = false;
          this._currentPlayer = this.getNextPlayer();
          if (!silent)
              this.dispatchEvent(new NextPlayerEvent(this._currentPlayer));
      }
      reverseGame() {
          this._players.reverse();
          this.direction =
              this.direction == GameDirection.CLOCKWISE
                  ? GameDirection.COUNTER_CLOCKWISE
                  : GameDirection.CLOCKWISE;
      }
      /**
       * Add the given amount of cards to the given player's hand
       * from the draw pile.
       *
       * @param player the player to deliver the cards
       * @param amount the amount that must be drawn
       * @returns the drawn cards
       */
      privateDraw(player, amount) {
          if (!player)
              throw new Error('Player is mandatory');
          // console.log(`draw ${amount} to ${player}`);
          const cards = this.drawPile.draw(amount);
          player.hand = player.hand.concat(cards);
          return cards;
      }
      calculateScore() {
          return this._players
              .map((player) => player.hand)
              .reduce((amount, cards) => {
              amount += cards.reduce((s, c) => (s += c.score), 0);
              return amount;
          }, 0);
      }
  }
  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // https://stackoverflow.com/a/24968449/1574059
  function findDuplicates(array) {
      // expects an string array
      const uniq = array
          .map((name, idx) => {
          return { count: 1, name: name };
      })
          .reduce((a, b) => {
          a[b.name] = (a[b.name] || 0) + b.count;
          return a;
      }, {});
      const duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1);
      return duplicates;
  }

  exports.BeforeCardPlayEvent = BeforeCardPlayEvent;
  exports.BeforeDrawEvent = BeforeDrawEvent;
  exports.BeforePassEvent = BeforePassEvent;
  exports.Card = Card;
  exports.CardPlayEvent = CardPlayEvent;
  exports.DrawEvent = DrawEvent;
  exports.Game = Game;
  exports.GameEndEvent = GameEndEvent;
  exports.NextPlayerEvent = NextPlayerEvent;
  exports.colors = colors;
  exports.isValidColor = isValidColor;
  exports.isValidValue = isValidValue;
  exports.isWild = isWild;
  exports.values = values;

}));
