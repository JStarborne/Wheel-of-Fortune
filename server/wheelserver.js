/*
 ** Wheel of Fortune Server
 */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Data = require("./Data");
const { setMode, checkLetter, puzzleSolve } = require("./functions/Gameboard");

const port = process.env.PORT || 8001;
const index = require("./routes/index");
const control = require("./routes/control");
const sqlite3 = require("sqlite3");

const app = express();

//Database
const db = new sqlite3.Database("./wheel.db", (err) => {
  if (err) console.log(err);
  //console.log("Connected to database.");
});

// Handle all method of CORS bullshit.
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(index);
app.use(control);

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // Emit data on initial connect
  socket.emit("LetterMatrix", Data.getLetterMatrix());
  socket.emit("StatusMatrix", Data.getStatusMatrix());
  socket.emit("Category", "Wheel of Fortune!");
  socket.emit("Players", Data.getPlayers());

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Add Player
  socket.on("AddPlayer", (name) => {
    if (Data.getPlayers().length < 6 && name.length > 0) {
      if (
        Data.getPlayers().filter(
          (player) => player.name.toUpperCase() === name.toUpperCase()
        ).length < 1
      ) {
        Data.addPlayer(name);
        socket.broadcast.emit("Players", Data.getPlayers());
        socket.emit("Players", Data.getPlayers());
      }
    }
  });

  // Player control features
  socket.on("PlayerControl", (args) => {
    switch (args) {
      case "ClearPlayers":
        Data.clearPlayers();
        break;
      case "SkipPlayer":
        Data.selectNextPlayer();
        break;
      case "ResetPoints":
        Data.clearAllPoints();
        break;
      case "Bankrupt":
        Data.clearPoints();
        Data.selectNextPlayer();
      default:
        console.log(`Invalid Player Control: ${args}`);
    }
    socket.broadcast.emit("Players", Data.getPlayers());
    socket.emit("Players", Data.getPlayers());
  });

  // Change game mode
  socket.on("ChangeMode", (mode) => {
    setMode(socket, mode, db);
  });

  // Check for the presence of a letter
  socket.on("CheckLetter", (letter) => {
    if (!letter || letter.length !== 1) return;

    letter = letter.toUpperCase();

    console.log(`Check: ${letter}`);

    // Snatch money for a vowel
    if (["A", "E", "I", "O", "U"].includes(letter)) Data.addPoints(-250);

    checkLetter(socket, letter, 1);
  });

  // Activate a highlighted letter by coordinates
  socket.on("ActivateLetter", ([x, y]) => {
    Data.revealBox(x, y);
    socket.emit("StatusMatrix", Data.getStatusMatrix());
  });

  // Reveal puzzle solution
  socket.on("RevealPuzzle", () => puzzleSolve(socket));

  // Get puzzle list
  socket.on("RequestPuzzleList", () => {
    sendPuzzleList(socket);
  });

  // Save a puzzle
  socket.on("SavePuzzle", ({ id, name, category, matrix }) => {
    let sql = "";
    if (id === 0) {
      sql = "INSERT INTO puzzles (name, category, letters) VALUES(?, ?, ?)";
      db.run(sql, [name, category, JSON.stringify(matrix)], (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`New puzzle added: ${name}`);
          socket.emit("PuzzleSaved", `Saved puzzle: ${name}`);
          sendPuzzleList(socket);
        }
      });
    } else {
      sql =
        "UPDATE puzzles SET name = ?, category = ?, letters = ? WHERE id = ?";
      db.run(sql, [name, category, JSON.stringify(matrix), id], (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Updated puzzle: ${name}`);
          socket.emit("PuzzleSaved", `Updated puzzle: ${name}`);
          sendPuzzleList(socket);
        }
      });
    }
  });

  // Load a puzzle
  socket.on("LoadPuzzle", (id) => {
    db.get("SELECT * FROM puzzles WHERE id = ?", [id], (err, row) => {
      if (err) {
        console.log(err);
      } else {
        socket.emit("PuzzleLoad", row);
      }
      //console.log(`Load request: ${id}`);
    });
  });

  // Delete a puzzle
  socket.on("DeletePuzzle", (id) => {
    db.run("DELETE FROM puzzles WHERE id = ?", [id], (err) => {
      if (err) {
        console.log(err);
      } else {
        sendPuzzleList(socket);
      }
    });
  });

  // Swap active puzzle
  socket.on("ActivePuzzle", (id) => {
    Data.setActivePuzzle(id);
  });

  // Spin the wheel
  socket.on("Spin", () => {
    socket.broadcast.emit("SFX", "spin");
    socket.broadcast.emit("Spin");
  });

  // Update active money
  socket.on("ActiveMoney", (money) => Data.setActiveMoney(money));

  // Give free spin
  socket.on("GiveFreeSpin", (name) => {
    Data.giveFreeSpinToken(name);
    socket.broadcast.emit("Players", Data.getPlayers());
  });

  // Clear free spin
  socket.on("ClearFreeSpin", () => {
    Data.clearFreeSpinToken();
    socket.broadcast.emit("Players", Data.getPlayers());
  });
});

// Emit puzzle list
function sendPuzzleList(socket) {
  db.all(
    "SELECT id, name, category FROM puzzles ORDER BY name",
    [],
    (err, rows) => {
      if (err) throw err;
      socket.emit("PuzzleList", rows);
    }
  );
}

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));
