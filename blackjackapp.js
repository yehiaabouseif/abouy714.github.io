'use strict';

(function($) {
  var Suit = function(name, abbr, char) {
    this.name = name;
    this.abbr = abbr;
    this.char = char;
  };

  var suits = {
    clubs: new Suit('Clubs', 'C', '&clubs;'),
    diamonds: new Suit('Diamonds', 'D', '&diams;'),
    hearts: new Suit('Hearts', 'H', '&hearts;'),
    spades: new Suit('Spades', 'S', '&spades;')
  };

  var Card = function(value, suit) {
    this.value = value;
    this.suit = suit;
    this.visible = false;
  };

  Card.prototype.getValue = function() {
    return (this.value > 10) ? 10 : this.value;
  };

  Card.prototype.getName = function() {
    if (this.value > 1 && this.value <= 10) {
      return this.value;
    } else {
      switch (this.value) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      }
    }
  };

  Card.prototype.display = function() {
    if (this.visible) {
      return $('<div class="card ' + this.suit.name + '">' +
                 '<span class="rank">' + this.getName() + '</span>' +
                 '<span class="suit">' + this.suit.char + '</span>' +
               '</div>').data('card', this);
    } else {
      return $('<div class="card back ' + this.suit.name + '">' +
                 '<span class="rank">' + this.getName() + '</span>' +
                 '<span class="suit">' + this.suit.char + '</span>' +
               '</div>').data('card', this);
    }
  };

  Card.prototype.toggleVisibility = function() {
    this.visible = !this.visible;
    return this.display();
  };

  // Deck object
  var Deck = function(totalDecks) {
    this.totalDecks = totalDecks || 1;
    this.originalDeck = [];
    this.deck = [];
  };

  Deck.prototype.build = function() {
    this.deck = [];
    for (var i = 1; i <= this.totalDecks; i++) {
      for (var j = 1; j <= 13; j++) {
        this.deck.push(new Card(j, suits.clubs));
        this.deck.push(new Card(j, suits.diamonds));
        this.deck.push(new Card(j, suits.hearts));
        this.deck.push(new Card(j, suits.spades));
      }
    }
  };

  // fisher yates shuffle
  Deck.prototype.shuffle = function() {
    // Size of deck
    var s = this.deck.length;

    for (var i = s - 1; i >= 1; i--) {
      var j = Math.floor(Math.random() * (i + 1));

      var temp = this.deck[i];

      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
    }
  };

  Deck.prototype.reset = function() {
    this.deck = this.originalDeck;
  };

  Deck.prototype.get = function() {
    return this.deck;
  };

  Deck.prototype.deal = function(visible) {
    visible = visible || false;
    if (visible) {
      this.deck[this.deck.length - 1].visible = true;
    }
    return this.deck.pop();
  };

  Deck.prototype.display = function(target, cards) {
    target = target || false;
    cards = cards || this.deck;

    var output = [];

    for (var i = 0; i < cards.length; i++) {
      output.push(cards[i].display().css('left', 2 * i));
    }

    if (target) {
      target.html(output);
    }

    return output;
  };

  // Hand object
  var Hand = function() {
    this.cards = [];
  };

  Hand.prototype.value = function() {
    var value = 0;
    var aces = 0;
    for (var i = 0; i < this.cards.length; i++) {
      if (this.cards[i].getValue() === 1) {
        aces++;
      }
      value += this.cards[i].getValue();
    }

    if (aces && value < 12) {
      value += 10;
    }

    return value;
  };

  Hand.prototype.display = function(target, cards) {
    target = target || false;
    cards = cards || this.cards;

    var output = [];

    for (var i = 0; i < cards.length; i++) {
      output.push(cards[i].display());
    }

    if (target) {
      target.html(output);
    }

    return output;
  };

  Hand.prototype.push = function(card) {
    this.cards.push(card);
  };

  Hand.prototype.pop = function() {
    return this.cards.pop();
  };

  Hand.prototype.shift = function() {
    return this.cards.shift();
  };

  Hand.prototype.clear = function() {
    this.cards = [];
  };

  Hand.prototype.showCards = function() {
    for (var i = 0; i < this.cards.length; i++) {
      this.cards[i].visible = true;
      console.log(this.cards[i]);
    }
  };

  Hand.prototype.check = function() {
    var value = this.value();
    if (value > 21) {
      return -1;
    } else if (value === 21) {
      return 1;
    } else {
      return 0;
    }
  };

  Hand.prototype.automate = function(target, shoe, cb) {
    target = target || false;

    if (!shoe) {
      return false;
    }

    var _this = this;

    _this.showCards();

    var output = _this.display();

    if (target) {
      target.html(output);
    }

    if (_this.value() >= 17) {
      cb(output);
      return;
    }

    var t = function() {
      _this.push(shoe.deal(true));

      output = _this.display();

      if (target) {
        target.html(output);
      }

      if (_this.value() >= 17) {
        cb(output);
      } else {
        setTimeout(t, 1000);
      }
    };

    setTimeout(t, 1000);
  };

  /** Elements */
  var els = {
    dealer: $('.dealer'),
    player: $('.player'),
    shoe:   $('.shoe')
  };

  /** Game Functions */
  var clearStyles = function() {
    els.dealer.removeClass('busted blackjack winner tied loser');
    els.player.removeClass('busted blackjack winner tied loser');
  };

  var checkWinner = function() {
    console.log('Results', dealer.value(), player.value());

    if (dealer.value() === player.value()) {
      els.dealer.addClass('tied');
      els.player.addClass('tied');
      console.log('tie');
    } else if (dealer.value() > 21) {
      els.dealer.addClass('loser');
      els.player.addClass('winner');
      console.log('dealer bust');
    } else if (dealer.value() > player.value()) {
      els.dealer.addClass('winner');
      els.player.addClass('loser');
      console.log('dealer wins');
    } else {
      els.dealer.addClass('loser');
      els.player.addClass('winner');
      console.log('player wins');
    }
  };

  /** Starting Game Logic */

  var shoe = new Deck();

  var dealer = new Hand();
  var player = new Hand();

  $('.build-button').on('click', function() {
    dealer.clear();
    player.clear();

    shoe.build();
    shoe.display(els.shoe);

    dealer.display(els.dealer);
    player.display(els.player);

    $('.deal-button').prop('disabled', false);
    $('.shuffle-button').prop('disabled', false);
    $('.hit-button').prop('disabled', false);
    $('.stand-button').prop('disabled', false);
    clearStyles();
  });

  $('.shuffle-button').on('click', function() {
    shoe.shuffle();
    shoe.display(els.shoe);
  });

  $('.deal-button').on('click', function() {
    $('.hit-button').prop('disabled', false);
    $('.stand-button').prop('disabled', false);

    clearStyles();

    dealer.clear();
    player.clear();

    for (var i = 1; i <= 2; i++) {
      dealer.push(shoe.deal(i === 1));
      player.push(shoe.deal(true));
    }

    console.log('Dealer', dealer.value(), dealer.check());
    console.log('Player', player.value(), player.check());

    shoe.display(els.shoe);
    dealer.display(els.dealer);
    player.display(els.player);

    $('.deal-button').prop('disabled', true);
    $('.shuffle-button').prop('disabled', true);

    if (player.check() === 1 && dealer.check() !== 1) {
      dealer.showCards();
      dealer.display(els.dealer);
      els.dealer.addClass('loser');
      els.player.addClass('blackjack');
      $('.hit-button').prop('disabled', true);
      $('.stand-button').prop('disabled', true);
      $('.deal-button').prop('disabled', false);
      console.log('player blackjack');
    } else if (player.check() === 1 && dealer.check() === 1) {
      dealer.showCards();
      dealer.display(els.dealer);
      els.dealer.addClass('tied');
      els.player.addClass('tied');
      $('.hit-button').prop('disabled', true);
      $('.stand-button').prop('disabled', true);
      $('.deal-button').prop('disabled', false);
      console.log('tied');
    } else if (dealer.check() === 1) {
      dealer.showCards();
      dealer.display(els.dealer);
      els.dealer.addClass('blackjack');
      els.player.addClass('loser');
      $('.hit-button').prop('disabled', true);
      $('.stand-button').prop('disabled', true);
      $('.deal-button').prop('disabled', false);
      console.log('dealer blackjack');
    }
  });

  /*
  $(document).on('click', '.card', function() {
    var card = $(this).data('card');
    $(this).replaceWith(card.toggleVisibility());
  });
  */

  $('.toggle-cards-button').on('click', function() {
    $('.card').each(function() {
      var card = $(this).data('card');
      $(this).replaceWith(card.toggleVisibility());
    });
  });

  $('.hit-button').on('click', function() {
    player.push(shoe.deal(true));

    console.log('Player', player.value(), player.check());

    shoe.display(els.shoe);
    player.display(els.player);

    if (player.check() === -1) {
      els.player.addClass('busted');
      $('.hit-button').prop('disabled', true);
      $('.stand-button').prop('disabled', true);
      $('.deal-button').prop('disabled', false);
      console.log('player busted');
    }
  });

  $('.stand-button').on('click', function() {
    $('.hit-button').prop('disabled', true);
    $('.stand-button').prop('disabled', true);
    $('.deal-button').prop('disabled', false);

    dealer.automate(els.dealer, shoe, checkWinner);
  });
})(jQuery);