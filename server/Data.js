var _letterMatrix = [
  ["", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", ""],
];
var _statusMatrix = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
var _mode = "blank";
var _prevMode = "";
var _players = [];
var _category = "";
var _activePuzzle = 0;
var _activeMoney = 0;
var _checkedLetters = [];
var _lastLetterAmount = 0;

exports.getMode = function () {
  return _mode;
};

exports.setMode = function (mode) {
  _prevMode = _mode;
  _mode = mode;
};

exports.getPrevMode = function () {
  return _prevMode;
};

exports.getActivePuzzle = function () {
  return _activePuzzle;
};

exports.setActivePuzzle = function (id) {
  if (!id || isNaN(id)) return;
  id = parseInt(id);
  _activePuzzle = id;
};

exports.getActiveMoney = function () {
  return _activeMoney;
};

exports.setActiveMoney = function (money) {
  if (!money || isNaN(money)) return;
  _activeMoney = parseInt(money);
};

exports.getLetterMatrix = function () {
  return _letterMatrix;
};

exports.getStatusMatrix = function () {
  return _statusMatrix;
};

exports.setLetterMatrix = function (matrix) {
  _letterMatrix = matrix;
};

exports.setStatusMatrix = function (matrix) {
  _statusMatrix = matrix;
};

exports.clearLetterMatrix = function () {
  _letterMatrix = [
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
  ];
};

exports.clearStatusMatrix = function () {
  _statusMatrix = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
};

exports.revealBox = function (x, y) {
  if (_statusMatrix[y][x] == 2) {
    _statusMatrix[y][x] = 3;
  }
};

exports.getCheckedLetters = function () {
  return _checkedLetters;
};

exports.clearCheckedLetters = function () {
  _checkedLetters = [];
};

exports.addCheckedLetter = function (letter) {
  if (!letter) return;

  letter = letter.toUpperCase();

  if (!_checkedLetters.includes(letter)) _checkedLetters.push(letter);
};

exports.getLastLetterOccurances = function () {
  return _lastLetterAmount;
};

exports.setLastLetterOccurances = function (amount) {
  _lastLetterAmount = amount;
};

exports.getPlayers = function () {
  return _players;
};

exports.addPlayer = function (name) {
  _players.push({
    name: name,
    points: 0,
    turnActive: _players.length < 1,
    freeSpin: false,
  });
  console.log(`New player: ${name}`);
};

exports.removePlayer = function (name) {
  _players = _players.filter((player) => {
    return player.name !== name;
  });
};

exports.clearPlayers = function () {
  _players = [];
};

exports.addPoints = function (points) {
  _players.forEach((player, index) => {
    if (player.turnActive === true) _players[index].points += points;
    return;
  });
};

exports.clearPoints = function () {
  _players.forEach((player, index) => {
    if (player.turnActive === true) _players[index].points = 0;
    return;
  });
};

exports.clearAllPoints = function () {
  _players.forEach((player, index) => {
    _players[index].points = 0;
  });
};

exports.selectFirstPlayer = function () {
  _players.forEach((player, index) => {
    if (index === 0) {
      _players[index].turnActive = true;
      console.log(`Player: ${player.name}`);
    } else {
      _players[index].turnActive = false;
    }
  });
};

exports.selectNextPlayer = function () {
  let nextFlag = false;

  _players.forEach((player, index) => {
    if (player.turnActive === true) {
      _players[index].turnActive = false;
      nextFlag = true;
    } else {
      _players[index].turnActive = nextFlag;
      if (nextFlag === true) {
        nextFlag = false;
        console.log(`Player: ${player.name}`);
      }
    }
  });

  if (nextFlag === true) _players[0].turnActive = true;
};

exports.giveFreeSpinToken = function (name) {
  if (!name) return;

  _players.forEach((player, index) => {
    if (player.name === name) _players[index].freeSpin = true;
    else _players[index].freeSpin = false;
  });
};

exports.clearFreeSpinToken = function () {
  _players.forEach((player, index) => {
    _players[index].freeSpin = false;
  });
};

exports.getCategory = function () {
  return _category;
};

exports.setCategory = function (category) {
  _category = category;
};
