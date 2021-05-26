import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function Board({ socketEmit, letterMatrix, statusMatrix }) {
  const statuses = [
    "box-noletter",
    "box-letter",
    "box-active",
    "box-letter show",
  ];

  return (
    <React.Fragment>
      <Row>
        <Col className="d-flex justify-content-center">
          <div className="d-flex justify-content-center board-row top">
            {statusMatrix[0].map((status, index) => {
              return (
                <div
                  key={"0-" + index}
                  className={statuses[status]}
                  onClick={() => {
                    socketEmit("ActivateLetter", [index, 0]);
                  }}>
                  {letterMatrix[0][index]}
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <div className="d-flex justify-content-center board-row middle">
            {statusMatrix[1].map((status, index) => {
              return (
                <div
                  key={"1-" + index}
                  className={statuses[status]}
                  onClick={() => {
                    socketEmit("ActivateLetter", [index, 1]);
                  }}>
                  {letterMatrix[1][index]}
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
                <div
                  key={"2-" + index}
                  className={statuses[statusMatrix[2][index]]}
                  onClick={() => {
                    socketEmit("ActivateLetter", [index, 2]);
                  }}>
                  {letter}
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
                <div
                  key={"3-" + index}
                  className={statuses[statusMatrix[3][index]]}
                  onClick={() => {
                    socketEmit("ActivateLetter", [index, 3]);
                  }}>
                  {letter}
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
}
