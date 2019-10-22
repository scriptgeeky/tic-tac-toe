import React from "react";

function Square(props) {
  let val = !/\d/.test(props.value) ? props.value : null;
  return (
    <button className="square" onClick={props.onClick}>
      {val}
    </button>
  );
}

export default Square;
