const express = require("express");
const router = express.Router();
const Data = require("../Data");

const POINTS_TO_ADD = 300;

router.get("/control", (req, res) => {
  // Swap mode
  if (req.query.mode) Data.setMode(req.query.mode.trim());

  // Reveal highlighted letter
  if (req.query.reveal && req.query.x && req.query.y)
    Data.revealBox(req.query.x, req.query.y);

  // Clear Players
  if (req.query.clearplayers) {
    Data.clearPlayers();
    Data.setUpdatePlayers();
  }

  // Skip Current Player
  if (req.query.skipplayer) {
    Data.selectNextPlayer();
    Data.setUpdatePlayers();
  }

  // Reset Points
  if (req.query.resetpoints) {
    Data.clearAllPoints();
    Data.setUpdatePlayers();
  }

  // Add Player
  if (req.query.addplayer && Data.getPlayers().length < 6) {
    const name = req.query.addplayer;
    if (name.length > 0) {
      if (
        Data.getPlayers().filter(
          (player) => player.name.toUpperCase() === name.toUpperCase()
        ).length < 1
      ) {
        Data.addPlayer(name);
      }
    }
  }

  // Check a letter
  if (req.query.letter) {
    console.log(`Check: ${req.query.letter.toUpperCase()}`);

    // Snatch money for a vowel
    if (["A", "E", "I", "O", "U"].includes(req.query.letter))
      Data.addPoints(-250);

    checkLetter(req.query.letter);
  }

  // Reveal puzzle solution
  if (req.query.revealsolution) {
    Data.setUpdateStatus("reveal");
  }

  // Return current game state
  res
    .send({
      response: 1,
      mode: Data.getMode(),
      checked_letters: Data.getCheckedLetters(),
      last_letter_occurances: Data.getLastLetterOccurances(),
      players: Data.getPlayers(),
    })
    .status(200);
});

module.exports = router;
