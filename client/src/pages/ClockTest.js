import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:8001";

export default function GameBoard() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", (data) => {
      setResponse(data);
    });
  }, []);

  return (
    <React.Fragment>
      <p>
        It's <time dateTime={response}>{response}</time>
      </p>
    </React.Fragment>
  );
}
