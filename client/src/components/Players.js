import React from "react";

export default function Players({ data }) {
  return (
    <div className="d-flex justify-content-around position-players">
      {data.map((player) => {
        return (
          <div
            key={player.name}
            className={player.turnActive ? "player-box active" : "player-box"}>
            <div className="align-self-end text-center position-relative">
              <div className="player-name">{player.name}</div>
              <div className="player-points">${player.points}</div>
            </div>
            <div
              className={player.freeSpin ? "freespin" : "freespin hide"}></div>
          </div>
        );
      })}
    </div>
  );
}
