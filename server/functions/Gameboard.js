/*
 ** Mode.js
 ** Handles mode changes and display events with the game board.
 */

const Data = require("../Data");

var animateRepeat = false;

exports.setMode = (socket, mode, db = null) => {
  // Turn off animations
  animateRepeat = false;

  // Set and broadcast
  Data.setMode(mode);
  socket.emit("Mode", mode);

  switch (mode) {
    case "blank":
      console.log("Mode: Blank");
      Data.clearStatusMatrix();
      Data.setCategory("Wheel of Fortune!");
      socket.broadcast.emit("StatusMatrix", Data.getStatusMatrix());
      socket.broadcast.emit("Category", Data.getCategory());
      break;
    case "allwhite":
      console.log("Mode: All White");
      Data.setStatusMatrix([
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      ]);
      socket.broadcast.emit("StatusMatrix", Data.getStatusMatrix());
      break;
    case "blue":
      console.log("Mode: Blue");
      Data.setStatusMatrix([
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      ]);
      socket.broadcast.emit("StatusMatrix", Data.getStatusMatrix());
      break;
    case "vegas":
      console.log("Mode: Vegas!");
      animateRepeat = true;
      setTimeout(() => vegasMode(socket), 10);
      break;
    case "increment":
      console.log("Mode: Increment");
      animateRepeat = true;
      boxIncrement(socket);
      break;
    case "puzzle":
      console.log("Mode: Standard Puzzle");
      db.get(
        "SELECT * FROM puzzles WHERE id = ?",
        [Data.getActivePuzzle()],
        (err, row) => {
          if (err) {
            console.log(err);
          } else if (row) {
            Data.setLetterMatrix(JSON.parse(row.letters));
            Data.setCategory(row.category);
            socket.broadcast.emit("Category", Data.getCategory());
            displayPuzzle(socket);
          } else {
            console.log("Puzzle not found.");
          }
        }
      );
      break;
  }
};

exports.checkLetter = (socket, letter, iteration = 1) => {
  let count = 0;

  if (!letter) return;

  letter = letter.toUpperCase();

  letterMatrix = Data.getLetterMatrix();
  statusMatrix = Data.getStatusMatrix();

  letterMatrix.forEach((row) => {
    row.forEach((box) => {
      if (box === letter) count++;
    });
  });

  Data.addCheckedLetter(letter);
  Data.setLastLetterOccurances(count);

  // Broadcast letter stats
  if (iteration === 1) {
    socket.emit("CheckedLetters", Data.getCheckedLetters());
    socket.emit("LastOccurances", Data.getLastLetterOccurances());
  }

  // Letter not in puzzle
  if (count === 0) {
    // Select next player
    Data.selectNextPlayer();

    // Send bzzt
    socket.broadcast.emit("SFX", "bzzt");

    // Broadcast new player data
    socket.broadcast.emit("Players", Data.getPlayers());
    socket.emit("Players", Data.getPlayers());
    return;
  }

  // Save us looping through if this is the last occurance of the letter
  if (iteration > count) return;

  // Loop through the gameboard from top to bottom and right to left
  for (let x = 13; x >= 0; x--) {
    for (let y = 0; y < 4; y++) {
      if ((y == 0 || y == 3) && x > 11) continue;

      // If the letter matches and isn't reveal yet...
      if (
        letterMatrix[y][x].toUpperCase() == letter &&
        statusMatrix[y][x] == 1
      ) {
        // Update status matrix
        statusMatrix[y][x] = 2;
        Data.setStatusMatrix(statusMatrix);

        // Ding
        socket.broadcast.emit("SFX", "ding");

        // Add money if not a vowel
        if (["A", "E", "I", "O", "U"].includes(letter) !== true)
          Data.addPoints(Data.getActiveMoney());

        // Broadcast new status matrix and player data
        socket.broadcast.emit("Players", Data.getPlayers());
        socket.emit("Players", Data.getPlayers());
        socket.broadcast.emit("StatusMatrix", Data.getStatusMatrix());

        // Play it again, Sam.
        setTimeout(this.checkLetter, 1200, socket, letter, iteration + 1);
        return;
      }
    }
  }
};

function displayPuzzle(socket, frame = 0) {
  // Cleanup
  if (frame < 1) {
    Data.clearStatusMatrix();
    Data.clearCheckedLetters();
    Data.setLastLetterOccurances(0);
    socket.broadcast.emit("StatusMatrix", Data.getStatusMatrix());
    socket.emit("CheckedLetters", Data.getCheckedLetters());
    socket.emit("LastOccurances", Data.getLastLetterOccurances());
  }

  // Update Letter Matrix
  if (frame === 1)
    socket.broadcast.emit("LetterMatrix", Data.getLetterMatrix());

  const letterMatrix = Data.getLetterMatrix();
  let statusMatrix = Data.getStatusMatrix();

  // Reveal one row at a time
  for (let y = 0; y < letterMatrix.length; y++) {
    if ((frame === 0 || frame === 13) && (y === 0 || y === 3)) continue;
    const x = y === 0 || y === 3 ? frame - 1 : frame;
    if (letterMatrix[y][x].length === 1) {
      if (letterMatrix[y][x] > "Z" || letterMatrix[y][x] < "A")
        statusMatrix[y][x] = 3;
      else statusMatrix[y][x] = 1;
    }
  }

  // Update and display
  Data.setStatusMatrix(statusMatrix);
  socket.broadcast.emit("StatusMatrix", statusMatrix);

  // Trigger sound on frame 0
  if (frame === 0) socket.broadcast.emit("SFX", "puzzlereveal");

  // Animate at 120ms intervals
  if (frame < 13) setTimeout(() => displayPuzzle(socket, frame + 1), 120);
}

exports.puzzleSolve = function (socket) {
  puzzleSolve(socket);
};

function puzzleSolve(socket, frame = 0) {
  let statusMatrix = Data.getStatusMatrix();

  // Reveal one row at a time
  for (let y = 0; y < statusMatrix.length; y++) {
    if ((frame === 0 || frame === 13) && (y === 0 || y === 3)) continue;
    const x = y === 0 || y === 3 ? frame - 1 : frame;
    if (statusMatrix[y][x] === 1) statusMatrix[y][x] = 3;
  }

  // Update and display
  Data.setStatusMatrix(statusMatrix);
  socket.broadcast.emit("StatusMatrix", statusMatrix);

  // Trigger sound on frame 0
  if (frame === 0) socket.broadcast.emit("SFX", "puzzlesolve");

  // Animate at 30ms intervals
  if (frame < 13) setTimeout(() => puzzleSolve(socket, frame + 1), 30);
}

function boxIncrement(socket, y = 0, x = 0) {
  // Kill it if we're no longer animating
  if (animateRepeat !== true) return;

  // Reset status matrix on each frame
  Data.clearStatusMatrix();
  statusMatrix = Data.getStatusMatrix();

  // Activate each box 1 by 1
  statusMatrix[y][x] = 1;

  // Update and display
  Data.setStatusMatrix(statusMatrix);
  socket.broadcast.emit("StatusMatrix", statusMatrix);

  // Animate at 100ms intervals
  if (x + 1 < statusMatrix[y].length) {
    setTimeout(() => boxIncrement(socket, y, x + 1), 100);
  } else {
    if (y + 1 < statusMatrix.length)
      setTimeout(() => boxIncrement(socket, y + 1, 0), 100);
    else setTimeout(() => boxIncrement(socket, 0, 0), 100);
  }
}

function vegasMode(socket) {
  // Kill it if we're no longer animating
  if (animateRepeat !== true) return;

  //Reset status matrix on each frame
  Data.clearStatusMatrix();
  statusMatrix = Data.getStatusMatrix();

  // Randomly select two boxes and light them up
  randY = Math.floor(Math.random() * (statusMatrix.length - 1));
  randX = Math.floor(Math.random() * (statusMatrix[randY].length - 1));
  statusMatrix[randY][randX] = 1;

  randY = Math.floor(Math.random() * (statusMatrix.length - 1));
  randX = Math.floor(Math.random() * (statusMatrix[randY].length - 1));
  statusMatrix[randY][randX] = 1;

  // Update and display
  Data.setStatusMatrix(statusMatrix);
  socket.broadcast.emit("StatusMatrix", Data.getStatusMatrix());

  // Animate at 150ms intervals
  setTimeout(() => vegasMode(socket), 150);
}
