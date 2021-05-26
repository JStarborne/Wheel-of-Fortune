import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Board from "../components/Board";
import Category from "../components/Category";
import Players from "../components/Players";
import Wheel from "../components/Wheel";
import socketIOClient from "socket.io-client";
import { Howl } from "howler";

// Sounds
import puzzleRevealSFX from "../sounds/sfx-puzzlereveal.mp3";
import puzzleSolveSFX from "../sounds/cue-puzzlesolve.mp3";
import dingSFX from "../sounds/sfx-ding.mp3";
import bzztSFX from "../sounds/sfx-buzzer.mp3";
import spinSFX from "../sounds/sfx-spin3.mp3";
import bankruptSFX from "../sounds/sfx-bankrupt.mp3";

// Variables
const SERVER = "http://127.0.0.1:8001";
let socket;

export default function GameBoard() {
  const [letterMatrix, setLetterMatrix] = useState([
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
  ]);
  const [statusMatrix, setStatusMatrix] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);
  const [playerData, setPlayerData] = useState([]);
  const [category, setCategory] = useState("");
  const [wheelShow, setWheelShow] = useState(false);
  const [wheelTransition, setWheelTransition] = useState(false);
  const [wheelPosition, setWheelPosition] = useState(6);
  const [activeMoney, setActiveMoney] = useState(0);

  useEffect(() => {
    socket = socketIOClient(SERVER);

    socket.on("LetterMatrix", (matrix) => {
      setLetterMatrix(matrix);
    });

    socket.on("StatusMatrix", (matrix) => {
      setStatusMatrix(matrix);
    });

    socket.on("Players", (players) => {
      setPlayerData(players);
    });

    socket.on("Category", (cat) => {
      setCategory(cat);
    });

    socket.on("SFX", (sfx) => {
      playSound(sfx);
    });

    socket.on("Spin", () => startSpin());

    // Cleanup
    return () => socket.disconnect();
  }, []); //eslint-disable-line

  function socketEmit(event, msg) {
    socket.emit(event, msg);
  }

  function playSound(cue) {
    let sound;

    switch (cue) {
      case "ding":
        sound = new Howl({ src: [dingSFX], volume: 0.5 });
        sound.play();
        break;
      case "puzzlereveal":
        sound = new Howl({ src: [puzzleRevealSFX], volume: 0.4 });
        sound.play();
        break;
      case "puzzlesolve":
        sound = new Howl({ src: [puzzleSolveSFX], volume: 0.4 });
        sound.play();
        break;
      case "bzzt":
        sound = new Howl({ src: [bzztSFX], volume: 0.5 });
        sound.play();
        break;
      case "spin":
        sound = new Howl({ src: [spinSFX], volume: 0.2 });
        sound.play();
        break;
      case "bankrupt":
        sound = new Howl({ src: [bankruptSFX], volume: 0.3 });
        sound.play();
        break;
      default:
        console.log(`Missing SFX: ${sound}`);
    }
  }

  function startSpin() {
    setWheelShow(true);
    setWheelTransition(true);
    setTimeout(spinWheel, 500, wheelPosition);
  }

  function spinWheel() {
    const force = Math.random() * 160 + 150;
    let pos;
    setWheelPosition((prev) => {
      pos = prev + force;
      return pos;
    });
    setTimeout(wheelReveal, 3800, pos);
  }

  function wheelReveal(pos) {
    let value = 0;
    while (pos > 360) pos -= 360;

    // Calc dollar amounts
    if (pos > 352.3) value = 0;
    // LOSE A TURN
    else if (pos > 337.4) value = 300;
    else if (pos > 322.4) value = 400;
    else if (pos > 307.3) value = 600;
    else if (pos > 292.2) value = 0;
    // BANKRUPT
    else if (pos > 277.1) value = 900;
    else if (pos > 262.3) value = 300;
    // FREE SPIN
    else if (pos > 247.4) value = 500;
    else if (pos > 232.3) value = 900;
    else if (pos > 217.4) value = 300;
    else if (pos > 202.3) value = 400;
    else if (pos > 187.4) value = 550;
    else if (pos > 172.4) value = 800;
    else if (pos > 157.3) value = 500;
    else if (pos > 142.2) value = 300;
    else if (pos > 127.2) value = 500;
    else if (pos > 112.1) value = 600;
    else if (pos > 97.1) value = 2500;
    else if (pos > 82.1) value = 600;
    else if (pos > 67.3) value = 300;
    else if (pos > 52.3) value = 700;
    else if (pos > 37.5) value = 450;
    else if (pos > 22.6) value = 350;
    else if (pos > 7.8) value = 800;
    else value = 0; // LOSE A TURN

    socket.emit("ActiveMoney", value);

    // Lose a turn
    if (pos <= 7.8 || pos > 352.3) {
      socket.emit("PlayerControl", "SkipPlayer");
    }

    // Bankrupt
    if (pos > 292.2 && pos <= 307.3) {
      playSound("bankrupt");
      socket.emit("PlayerControl", "Bankrupt");
    }

    // Free spin
    //if (pos > 262.3 && pos <= 277.1) console.log("Free spin!");

    setActiveMoney(value);

    // Reset wheel pos
    setWheelTransition(false);
    setTimeout(setWheelPosition, 10, pos);

    setTimeout(setWheelShow, 1000, false);
  }

  let freeSpinTaken = playerData.filter((player) => player.freeSpin).length > 0;

  return (
    <React.Fragment>
      <Container className="position-board">
        <Board
          socketEmit={socketEmit}
          letterMatrix={letterMatrix}
          statusMatrix={statusMatrix}
        />
      </Container>
      <div className="lower-third-box">
        <Category money={activeMoney}>{category}</Category>
        <Players data={playerData}></Players>
      </div>
      <Wheel
        show={wheelShow}
        freespin={freeSpinTaken ? false : true}
        transition={wheelTransition}
        position={wheelPosition}
      />
    </React.Fragment>
  );
}
