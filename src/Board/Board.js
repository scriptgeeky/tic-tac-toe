import React from "react";
import Square from "../Square/Square";

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array.from(Array(9).keys()),
      xIsNext: true,
      humanPlayer: "X",
      aiPlayer: "O"
    };
  }

  // Click handler to kick off the chain of events
  handleClick = i => {
    const squares = this.state.squares.slice();
    if (
      calculateWinner(this.state.squares, null) ||
      typeof squares[i] !== "number"
    ) {
      // if there's a winner of we've ran out of empty spots the game is over
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      squares: squares,
      xIsNext: !this.state.xIsNext // Now it's the computer's turn
    });
  };

  // Let's restart game
  resetBoard = () => {
    this.setState({
      squares: Array.from(Array(9).keys()),
      xIsNext: true
    });
  };

  // Assign a click event listener and bind it
  renderSquare = i => {
    return (
      <Square
        value={this.state.squares[i]}
        onClick={() => this.handleClick(i)}
      />
    );
  };

  // Just need a list of tempty squares
  emptySquares = origBoard => {
    let newBoard = []; // let's create a a new array to track empty spots
    for (let b = 0; b < origBoard.length; b++) {
      if (typeof origBoard[b] === "number") {
        newBoard.push(b); // let's use a number to determine if it's an empty one
      }
    }
    return newBoard;
  };

  determineBestSquare = (newBoard, player) => {
    let availSpots = this.emptySquares(newBoard); // find available empty using the existing board
    let topScore; // we'll use this to track the highest possible score
    let topMove; // we'll use this to determine the top move
    let result;

    if (calculateWinner(newBoard, this.state.humanPlayer)) {
      return { score: -10 }; // if O wins we return -10
    } else if (calculateWinner(newBoard, this.state.aiPlayer)) {
      return { score: 10 }; // if X wins we return 10
    } else if (availSpots.length === 0) {
      return { score: 0 }; //tie, we return 0
    }

    let moves = []; // we'll need to track the scores for later evaluation

    for (let i = 0; i < availSpots.length; i++) {
      let move = {};

      move.index = newBoard[availSpots[i]]; // set the index number of the empty spot
      newBoard[availSpots[i]] = player; // set an empty spot on newBoard to the current player

      if (player === this.state.aiPlayer) {
        result = this.determineBestSquare(newBoard, this.state.humanPlayer);
        move.score = result.score; // just need the score for tracking
      } else {
        result = this.determineBestSquare(newBoard, this.state.aiPlayer);
        move.score = result.score; // just need the score for tracking
      }
      newBoard[availSpots[i]] = move.index; // let's reset the new board to what it was before
      moves.push(move);
    }

    if (player === this.state.aiPlayer) {
      topScore = -10000; // we choose the lowest score when the machine is playing
      for (let i = 0; i < moves.length; i++) {
        // let's loop through the moves
        if (moves[i].score > topScore) {
          topScore = moves[i].score; // higher score than the bestScore move gets stored
          topMove = i; // even if we have moves with similar scores, only the first one is stored
        }
      }
    } else {
      topScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < topScore) {
          // We're looking for the smallest score to store
          topScore = moves[i].score;
          topMove = i;
        }
      }
    }
    return moves[topMove];
  };

  // We want to run this after every render
  componentDidUpdate = () => {
    if (!this.state.xIsNext) {
      // But only if the computer's turn is up
      this.handleClick(
        this.determineBestSquare(this.state.squares, this.state.aiPlayer).index
      );
    }
  };

  render = () => {
    const winner = calculateWinner(this.state.squares, null);
    let status;
    if (winner) {
      status = "Winner: " + winner;
    }

    return (
      <div>
        <h1>Tic Tac Toe</h1>
        <div className="status">{status}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
        <button onClick={() => this.resetBoard()}>Reset game?</button>
      </div>
    );
  };
}

export default Board;

function calculateWinner(squares, player) {
  // List of all winning combinations
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
  ];
  if (player !== null) {
    // Track/attribute wins to a player
    let plays = [];
    let won = null;

    // Let's determine which of the plays belong to the player
    // NOTE: tried using reduce here with IIFE but it caused an out of limits error
    // replaced with for loop which is less performant on larger datasets but should be fine here
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === player) plays.push(i);
    }

    for (let [index, win] of lines.entries()) {
      // Let's check to see if the player won
      if (win.every(elem => plays.indexOf(elem) > -1)) {
        // has the player played in every spot that matters
        won = { index: index, player: player }; // let's track the which combo was won and who won it
        break;
      }
    }
    return won;
  } else {
    // This one is only get a boolean answer if the game is won
    for (let i = 0; i < lines.length; i++) {
      let [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }
}
