import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import socketIOClient from "socket.io-client";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";

// Variables
const SERVER = "http://127.0.0.1:8001";
let socket;

export default function PuzzleCreator() {
  const [letterMatrix, setLetterMatrix] = useState([
    ["", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", "", "", "", ""],
  ]);
  const [puzzleName, setPuzzleName] = useState("");
  const [category, setCategory] = useState("");
  const [puzzleId, setPuzzleId] = useState(0);
  const [puzzleList, setPuzzleList] = useState([]);
  const [puzzleSaved, setPuzzleSaved] = useState(null);
  const [selectId, setSelectId] = useState(0);

  useEffect(() => {
    socket = socketIOClient(SERVER);

    socket.on("EditLetterMatrix", (matrix) => {
      setLetterMatrix(matrix);
    });

    socket.on("EditCategory", (cat) => {
      setCategory(cat);
    });

    socket.on("PuzzleList", (list) => {
      setPuzzleList(list);
    });

    socket.on("PuzzleSaved", (msg) => {
      setPuzzleSaved(msg);
      setTimeout(() => {
        setPuzzleSaved(null);
      }, 5000);
    });

    socket.on("PuzzleLoad", (puzzle) => {
      if (puzzle && puzzle.id > 0) {
        setPuzzleId(puzzle.id);
        setPuzzleName(puzzle.name);
        setCategory(puzzle.category);
        setLetterMatrix(JSON.parse(puzzle.letters));
        console.log(puzzle);
      }
    });

    // Request list on page load
    socket.emit("RequestPuzzleList");

    // Cleanup
    return () => socket.disconnect();
  }, []); //eslint-disable-line

  function handleLetterChange(y, x, letter) {
    let tmp = [...letterMatrix];

    if (letter === undefined || letter.length < 1) {
      tmp[y][x] = "";
    } else {
      tmp[y][x] = letter[0].toUpperCase();
    }

    setLetterMatrix(tmp);
  }

  function handleClearBoard() {
    setLetterMatrix([
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ]);
  }

  function handleNewPuzzle() {
    setPuzzleId(0);
    handleClearBoard();
    setPuzzleName("");
    setCategory("");
  }

  function handleSavePuzzle() {
    socket.emit("SavePuzzle", {
      id: puzzleId,
      name: puzzleName,
      category: category,
      matrix: letterMatrix,
    });
  }

  function handleLoadPuzzle(id) {
    socket.emit("LoadPuzzle", id);
  }

  function handleDeletePuzzle(id) {
    if (!id) return;
    socket.emit("DeletePuzzle", id);
  }

  return (
    <React.Fragment>
      <h1>Puzzle Editor</h1>
      <Row>
        <Col className="d-flex justify-content-center">
          <div className="d-flex justify-content-center board-row top">
            {letterMatrix[0].map((status, index) => {
              return (
                <div key={"0-" + index} className="box-letter show">
                  <input
                    type="text"
                    maxLength="1"
                    className="box-letter-edit"
                    value={letterMatrix[0][index]}
                    onKeyDown={(e) => {
                      if (
                        e.code === "Backspace" &&
                        !e.target.value &&
                        e.target.parentElement.previousElementSibling
                      ) {
                        e.target.parentElement.previousElementSibling.firstChild.focus();
                      } else if (e.code === "Space") {
                        e.preventDefault();
                        if (e.target.parentElement.nextElementSibling)
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                      }
                    }}
                    onChange={(e) => {
                      handleLetterChange(0, index, e.target.value);
                      if (e.target.value) {
                        e.target.value = e.target.value[0].toUpperCase();
                        if (
                          e.target.value.length &&
                          e.target.parentElement.nextElementSibling
                        ) {
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                        }
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <div className="d-flex justify-content-center board-row middle">
            {letterMatrix[1].map((status, index) => {
              return (
                <div key={"1-" + index} className="box-letter show">
                  <input
                    type="text"
                    maxLength="1"
                    className="box-letter-edit"
                    value={letterMatrix[1][index]}
                    onKeyDown={(e) => {
                      if (
                        e.code === "Backspace" &&
                        !e.target.value &&
                        e.target.parentElement.previousElementSibling
                      ) {
                        e.target.parentElement.previousElementSibling.firstChild.focus();
                      } else if (e.code === "Space") {
                        e.preventDefault();
                        if (e.target.parentElement.nextElementSibling)
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                      }
                    }}
                    onChange={(e) => {
                      handleLetterChange(1, index, e.target.value);
                      if (e.target.value) {
                        e.target.value = e.target.value[0].toUpperCase();
                        if (
                          e.target.value.length &&
                          e.target.parentElement.nextElementSibling
                        ) {
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                        }
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <div className="d-flex justify-content-center board-row">
            {letterMatrix[2].map((letter, index) => {
              return (
                <div key={"2-" + index} className="box-letter show">
                  <input
                    type="text"
                    maxLength="1"
                    className="box-letter-edit"
                    value={letterMatrix[2][index]}
                    onKeyDown={(e) => {
                      if (
                        e.code === "Backspace" &&
                        !e.target.value &&
                        e.target.parentElement.previousElementSibling
                      ) {
                        e.target.parentElement.previousElementSibling.firstChild.focus();
                      } else if (e.code === "Space") {
                        e.preventDefault();
                        if (e.target.parentElement.nextElementSibling)
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                      }
                    }}
                    onChange={(e) => {
                      handleLetterChange(2, index, e.target.value);
                      if (e.target.value) {
                        e.target.value = e.target.value[0].toUpperCase();
                        if (
                          e.target.value.length &&
                          e.target.parentElement.nextElementSibling
                        ) {
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                        }
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <div className="d-flex justify-content-center board-row">
            {letterMatrix[3].map((letter, index) => {
              return (
                <div key={"3-" + index} className="box-letter show">
                  <input
                    type="text"
                    maxLength="1"
                    className="box-letter-edit"
                    value={letterMatrix[3][index]}
                    onKeyDown={(e) => {
                      if (
                        e.code === "Backspace" &&
                        !e.target.value &&
                        e.target.parentElement.previousElementSibling
                      ) {
                        e.target.parentElement.previousElementSibling.firstChild.focus();
                      } else if (e.code === "Space") {
                        e.preventDefault();
                        if (e.target.parentElement.nextElementSibling)
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                      }
                    }}
                    onChange={(e) => {
                      handleLetterChange(3, index, e.target.value);
                      if (e.target.value) {
                        e.target.value = e.target.value[0].toUpperCase();
                        if (
                          e.target.value.length &&
                          e.target.parentElement.nextElementSibling
                        ) {
                          e.target.parentElement.nextElementSibling.firstChild.focus();
                        }
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
      <Container className="bg-dark rounded p-3 mt-5">
        <Row>
          <Col>
            <h5>Load</h5>
            <Form.Control
              as="select"
              value={selectId}
              onChange={(e) => {
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
            <div className="mt-2 d-flex justify-content-end">
              <Button
                className="m-1"
                variant="danger"
                onClick={() => {
                  handleDeletePuzzle(selectId);
                }}>
                Delete
              </Button>
              <Button
                className="m-1"
                onClick={() => {
                  handleLoadPuzzle(selectId);
                }}>
                Load
              </Button>
            </div>
          </Col>
          <Col>
            <h5>Save</h5>
            <Form.Control
              type="text"
              minLength="1"
              placeholder="Puzzle Name"
              value={puzzleName}
              onChange={(e) => {
                setPuzzleName(e.target.value);
              }}
            />
            <Form.Control
              type="text"
              minLength="1"
              placeholder="Puzzle Category"
              className="mt-2"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
            />
            <div className="mt-2 d-flex justify-content-end">
              <Button onClick={handleSavePuzzle}>Save</Button>
            </div>
          </Col>
          <Col>
            <h5>Control</h5>
            <div className="d-flex flex-wrap justify-content-around">
              <Button variant="success" onClick={handleNewPuzzle}>
                New Puzzle
              </Button>
              <Button variant="secondary" onClick={handleClearBoard}>
                Clear Board
              </Button>
            </div>
            {puzzleId ? (
              <div className="text-danger mt-3">*Editing existing puzzle.</div>
            ) : null}
            <div className="text-success mt-3">{puzzleSaved}</div>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
}
