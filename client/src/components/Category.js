import React from "react";

export default function Board({ money, children }) {
  return (
    <React.Fragment>
      <div className="category-bg">
        <div className="category-text">{children}</div>
        <div className="mini-logo"></div>
        <div className="active-money">${money}</div>
      </div>
    </React.Fragment>
  );
}
