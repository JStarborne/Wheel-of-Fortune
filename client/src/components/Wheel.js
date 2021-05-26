import React from "react";

export default function Wheel({ show, transition, position, freespin }) {
  return (
    <div className={show ? "wheel-position" : "wheel-position hide"}>
      <div className="wheel-chevron"></div>
      <div
        className={freespin ? "wheel" : "wheel nofreespin"}
        style={{
          transition: transition
            ? "cubic-bezier(0.58, 0.3, 0.000001, 1) 4s"
            : null,
          transform: "rotate(-" + position + "deg)",
        }}></div>
    </div>
  );
}
