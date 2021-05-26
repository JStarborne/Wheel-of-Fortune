import React, { useRef, useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import socketIOClient from "socket.io-client";

// Variables
const SERVER = "http://127.0.0.1:8001";
let socket;

export default function GameBoard() {
  const [activeMode, setActiveMode] = useState("default");
  const [checkLetter, setCheckLetter] = useState("");
  const [checkedLetters, setCheckedLetters] = useState([]);
  const [lastLetterOccurances, setLastLetterOccurances] = useState(0);
  const [playerData, setPlayerData] = useState([]);
  const modeSelect = useRef();
  const playerAdd = useRef();

  const [puzzleList, setPuzzleList] = useState([]);
  const [selectId, setSelectId] = useState(0);

  useEffect(() => {
    socket = socketIOClient(SERVER);

    socket.on("Players", (players) => {
      setPlayerData(players);
    });

    socket.on("Mode", (mode) => setActiveMode(mode));

    socket.on("PuzzleList", (list) => {
      setPuzzleList(list);
    });

    socket.on("CheckedLetters", (letters) => {
      setCheckedLetters(letters);
    });

    socket.on("LastOccurances", (occurances) =>
      setLastLetterOccurances(occurances)
    );

    // Request puzzle list
    socket.emit("RequestPuzzleList");

    // Cleanup
    return () => socket.disconnect();
  }, []); //eslint-disable-line

  function handleChangeMode(event) {
    event.preventDefault();

    if (modeSelect.current && modeSelect.current.value !== "default") {
      socket.emit("ChangeMode", modeSelect.current.value);
    }
  }

  function handleCheckLetter(event) {
    event.preventDefault();

    if (checkedLetters.includes(checkLetter)) {
      return alert("Letter has already been checked!");
    }

    if (activeMode === "puzzle" && checkLetter && checkLetter.length === 1) {
      socket.emit("CheckLetter", checkLetter);
    }
  }

  function handleAddPlayer(event) {
    event.preventDefault();

    if (playerAdd.current.value.trim().length > 0) {
      socket.emit("AddPlayer", playerAdd.current.value.trim());
    }
  }

  function handlePlayerControl(args) {
    socket.emit("PlayerControl", args);
  }

  function handleFreeSpinChange(event) {
    if (event.target.value === "ClearFreeSpin") socket.emit("ClearFreeSpin");
    else socket.emit("GiveFreeSpin", event.target.value);
  }

  return (
    <React.Fragment>
      <h1>Back-end Control</h1>
      <Container className="bg-dark rounded p-3">
        <Row>
          <Col>
            <h5>Players</h5>
            <div className="d-flex flex-wrap justify-content-around text-center">
              {playerData.map((player) => {
                return (
                  <div key={player.name}>
                    <h5
                      className={
                        player.turnActive ? "mb-0 text-warning" : "mb-0"
                      }>
                      {player.name}
                    </h5>
                    <b>${player.points}</b>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <h5>Add Player</h5>
            <Form onSubmit={handleAddPlayer}>
              <Form.Group>
                <Form.Control
                  type="text"
                  size="lg"
                  className="d-inline w-auto"
                  placeholder="Name"
                  ref={playerAdd}
                />
                <Button type="submit" className="m-3">
                  Add
                </Button>
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <h5>Player Control</h5>
            <Button
              variant="info"
              className="m-1"
              onClick={() => {
                handlePlayerControl("SkipPlayer");
              }}>
              Skip Turn
            </Button>
            <Button
              variant="warning"
              className="m-1"
              onClick={() => {
                handlePlayerControl("ResetPoints");
              }}>
              Reset Points
            </Button>
            <Button
              variant="danger"
              className="m-1"
              onClick={() => {
                handlePlayerControl("ClearPlayers");
              }}>
              Clear Players
            </Button>
          </Col>
          <Col className="col-2">
            <h5>Free Spin</h5>
            <Form.Control as="select" onChange={handleFreeSpinChange}>
              <option value="ClearPlayerData">None</option>
              {playerData.map((player) => {
                return (
                  <option key={"spin-" + player.name} value={player.name}>
                    {player.name}
                  </option>
                );
              })}
            </Form.Control>
          </Col>
          <Col className="col-2">
            <h5>Spin</h5>
            <Button
              variant="success"
              className="m-1"
              onClick={() => {
                socket.emit("Spin");
              }}>
              Spin!
            </Button>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <h5>Puzzle</h5>
            <Form.Group>
              <Form.Control
                as="select"
                size="lg"
                value={selectId}
                onChange={(e) => {
                  socket.emit("ActivePuzzle", e.target.value);
                  setSelectId(e.target.value);
                }}>
                <option disabled value={0}>
                  Select puzzle...
                </option>
                {puzzleList.map((puzzle) => {
                  return (
                    <option key={puzzle.id} value={puzzle.id}>
                      {puzzle.name}
                    </option>
                  );
                })}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <h5>Mode</h5>
            <p className="mb-1">Active Mode: {activeMode}</p>
            <Form onSubmit={handleChangeMode}>
              <Form.Group>
                <Form.Control
                  as="select"
                  size="lg"
                  className="d-inline w-auto"
                  defaultValue="default"
                  ref={modeSelect}>
                  <option value="default" disabled>
                    Please select a mode...
                  </option>
                  <option value="blank">Blank</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="allwhite">All White</option>
                  <option value="blue">All Blue</option>
                  <option value="increment">Increment</option>
                  <option value="vegas">Vegas</option>
                </Form.Control>
                <Button type="submit" className="m-3">
                  Change
                </Button>
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <h5>Check Letter</h5>
            <p className="mb-0">Checked letters: {checkedLetters.join(", ")}</p>
            <p className="mb-1">
              Last Letter Occurances: {lastLetterOccurances}
            </p>
            <Form onSubmit={handleCheckLetter}>
              <Form.Group>
                <Form.Control
                  type="text"
                  size="lg"
                  maxLength="1"
                  className="d-inline w-auto"
                  value={checkLetter}
                  onFocus={(e) => {
                    e.target.setSelectionRange(0, 1);
                  }}
                  onChange={(e) => {
                    const letter = e.target.value.toUpperCase();
                    if (!letter || (letter >= "A" && letter <= "Z"))
                      setCheckLetter(letter);
                  }}></Form.Control>
                <Button type="submit" className="m-3">
                  Check
                </Button>
              </Form.Group>
            </Form>
          </Col>
          <Col className="col-2">
            <h5>Reveal</h5>
            <Button
              onClick={() => {
                socket.emit("RevealPuzzle");
              }}>
              Reveal Puzzle
            </Button>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
}
