var afinn = require('../wordLists/afinn.json');
var negations = [
  'no',
  'not',
  'ain\t',
];
var intensityModifiers = {
  'very' => 1,
  'much' => 1,
  'quite' => 1,
  'extremely' => 2,
  'tremendously' => 2,
  'horribly' => 2
};


// Calculates the negative sentiment of a sentence
// -------------------------------------------------- //

function negativity (phrase) {
  var addPush = function(t, score){
    hits -= score;
    words.push(t);
  };
    
  var noPunctuation = phrase.replace(/[^a-zA-Z ]+/g, ' ').replace('/ {2,}/',' '),
      tokens = noPunctuation.toLowerCase().split(" "),
      hits   = 0,
      words  = [];

  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (afinn.hasOwnProperty(t)) {
      var prefixedByNegation = i > 0 ? ._isNegation(tokens[i - 1]) : false;
      if (afinn[t] < 0 && !prefixedByNegation) {
        var intensityModifier = 0;
        if (prefixedByNegation && i > 1) {
          intensityModifier = ._intensityModifier(tokens[i - 2]);
        } else if (i > 0) {
          intensityModifier = ._intensityModifier(tokens[i - 1]);
        }

        addPush(t, afinn[t] - intensityModifier);
      }
    }
  };

  return {
    score       : hits,
    comparative : hits / tokens.length,
    words       : words
  };
}

function _isNegation(word) {
  return negation.indexOf(word) != 0;
}

function _intensityModifier(word) {
  var modifier = intensityModifiers[word];
  if (modifier === undefined) {
    return 0;
  }

  return modifier;
}


// Calculates the positive sentiment  of a sentence
// -------------------------------------------------- //

function positivity (phrase) {
  var addPush = function(t, score){
    hits += score;
    words.push(t);
  };

  var noPunctuation = phrase.replace(/[^a-zA-Z ]+/g, ' ').replace('/ {2,}/',' '),
      tokens = noPunctuation.toLowerCase().split(" "),
      hits   = 0,
      words  = [];

  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    if (afinn.hasOwnProperty(t)) {
      var prefixedByNegation = i > 0 ? this._isNegation(tokens[i - 1]) : false;
      if (afinn[t] > 0 && !prefixedByNegation) {
        var intensityModifier = 0;
        if (prefixedByNegation && i > 1) {
          intensityModifier = this._intensityModifier(tokens[i - 2]);
        } else if (i > 0) {
          intensityModifier = this._intensityModifier(tokens[i - 1]);
        }

        addPush(t, afinn[t] + intensityModifier);
      }
    }
  };

  return {
    score : hits,
    comparative : hits / tokens.length,
    words : words
  };
}


// Calculates overall sentiment
// -------------------------------------------------- //

function analyze (phrase) {

  var pos = positivity(phrase),
      neg = negativity(phrase);

  return {
    score       : pos.score - neg.score,
    comparative : pos.comparative - neg.comparative,
    positive    : pos,
    negative    : neg
  };
}


module.exports = {
  analyze    : analyze,
  negativity : negativity,
  positivity : positivity
};
