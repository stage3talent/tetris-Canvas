const shapes = [
  [
    [1,1,1],
    [0,1,0],
    [0,0,0]
  ],
  [
    [0,2,0,0],
    [0,2,0,0],
    [0,2,0,0],
    [0,2,0,0]
  ],
  [
    [3,3],
    [3,3]
  ],
  [
    [4,0,0],
    [4,0,0],
    [4,4,0]
  ],
  [
    [5,5,0],
    [0,5,5],
    [0,0,0]
  ]
];

function pickRandomShape(min = 0, max = 5) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return shapes[Math.floor(Math.random() * (max - min)) + min];
}

class GameState {
  constructor(dimensions, scale) {
    dimensions.height = Math.floor(dimensions.height / scale);
    dimensions.width = Math.floor(dimensions.width / scale);

    this.board = this.buildBoard(dimensions, scale);
    this.activeShape = {"shape": [], "position": {}};
  }

  buildBoard(dimensions) {
    let newBoard = [];

    while (dimensions.height--) {
      newBoard.push(new Array(dimensions.width).fill(0));
    }

    return newBoard;
  }

  setNewActiveShape(shapeMatrix) {
    this.activeShape.shape = shapeMatrix;
    this.activeShape.position = {
      "row": 0,
      "column": Math.floor(this.board[0].length / 2) - Math.floor(shapeMatrix[0].length / 2)
    };
    this.moveActiveShape(this.activeShape.position);
  }

  moveActiveShape(newPosition) {
    if (!this.activeShape.shape) { return false; }

    // prevent from colliding with self
    this.removeActiveShape();

    if (this.collisionCheck(newPosition)) {
      this.insertActiveShape();
      return false; 
    }

    this.activeShape.position = newPosition;
    this.insertActiveShape();

    return true;
  }

  // rotateActiveShape() {
  //   for (var row in this.activeShape.shape) {
  //     for (var cell in row) {

  //     }
  //   }
  // }

  collisionCheck(projectedPosition) {
    for (var rowIndex in this.activeShape.shape) {
      for (var columnIndex in this.activeShape.shape[rowIndex]) {
        if (this.activeShape.shape[rowIndex][columnIndex] !== 0) {
          rowIndex = parseInt(rowIndex);
          columnIndex = parseInt(columnIndex);

          let boardRow = rowIndex + projectedPosition.row;
          let boardColumn = columnIndex + projectedPosition.column;

          if (boardRow < 0 || boardRow > this.board.length - 1
            || boardColumn < 0 || boardColumn > this.board[0].length - 1) {
            console.log('Boundary collision!');
            return true;
          }

          let boardValue = this.board[boardRow][boardColumn];

          if (boardValue !== 0) {
            console.log('Shape collision!');
            return true;
          }
        }
      }
    }

    return false;
  }

  getCompleteLineRows() {
    var lines = [];

    for (var row in this.board) {
      if (this.checkRowForLine(row)) {
        lines.push(row);
      }
    }

    return lines;
  }

  shiftDownToRow(row) {
    var currentRow = row;

    while (currentRow > 0) {
      // use slice to coerce a new array instead of a refernece
      this.board[currentRow] = this.board[--currentRow].slice();
    }
  }

  checkRowForLine(rowIndex) {
    if (rowIndex < 0 || rowIndex > this.board.length) { return false; } 
    for (var cell in this.board[rowIndex]) {
      if (this.board[rowIndex][cell] === 0) {
        return false;
      }
    }

    return true;
  }

  insertActiveShape() {
    this.activeShape.shape.forEach((rowArray, rowIndex) => {
      rowArray.forEach((cellValue, columnIndex) => {
        let newRow = rowIndex + this.activeShape.position.row;
        let newColumn = columnIndex + this.activeShape.position.column;

        if (cellValue !== 0) {
          this.board[newRow][newColumn] = cellValue;
        }
      });
    });
  }

  removeActiveShape() {
    this.activeShape.shape.forEach((rowArray, rowIndex) => {
      rowArray.forEach((cellValue, columnIndex) => {
        let currentRow = rowIndex + this.activeShape.position.row;
        let currentColumn = columnIndex + this.activeShape.position.column;

        if (cellValue !== 0) {
          this.board[currentRow][currentColumn] = 0;
        }
      });
    });
  }

  clearRow(row) {
    console.log('clearing row', row);
    for (var i in this.board[row]) {
      this.board[row][i] = 0;
    }
  }

  log() {
    console.log('Game State:');
    console.table(this.board);
  }
}

class GameBoard {
  constructor(canvasReference, scale) {
    this.ctx = canvasReference.getContext('2d');
    this.ctx.scale(scale, scale);
    this.fill();
  }

  fill(color) {
    this.ctx.fillStyle = color || "#1f1f1f";
    this.ctx.fillRect(0,0,canvas.width, canvas.height);  
  }

  updateFrame(state) {
    this.fill();

    state.forEach((row, y) => {
      row.forEach((value, x) => {
      
        if (value !== 0) {
          if (value === 1) {
            this.ctx.fillStyle = "blue";
          } else if (value === 2) {
            this.ctx.fillStyle = "red";
          } else if (value === 3) {
            this.ctx.fillStyle = "green";
          } else if (value === 4) {
            this.ctx.fillStyle = "yellow";
          } else if (value === 5) {
            this.ctx.fillStyle = "lightblue";
          }

          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }
}


class Game {
  constructor(canvas, scale = 1) {
    this.timeSinceShift = 0;
    this.shiftDelay = 1000;
    this.gameState = new GameState({
      "width": canvas.width,
      "height": canvas.height
    }, scale);
    this.gameBoard = new GameBoard(canvas, scale);
  }

  shift(direction) {
    let row = this.gameState.activeShape.position.row;
    let column = this.gameState.activeShape.position.column;
    
    if (direction === 'left') {
      column--;
    } else if (direction === 'right') {
      column++;
    } else if (direction === 'down') {
      row++;
    }

    return this.gameState.moveActiveShape({
      row,
      column
    });
  }

  lineCheck() {
    var lines = this.gameState.getCompleteLineRows();

    console.log(lines);

    for (var row in lines) {
      this.gameState.clearRow(lines[row]);
      this.gameState.shiftDownToRow(lines[row]);
    }
  }

  spawnNewShape(shapeMatrix) {
    console.log('Spawning new shape:');
    console.table(shapeMatrix);
    this.gameState.setNewActiveShape(shapeMatrix);
  }

  tick(deltaTime) {
    if (this.timeSinceShift > this.shiftDelay) {
      this.timeSinceShift = 0;
      if (!this.shift('down')) {
        this.lineCheck();

        this.spawnNewShape(pickRandomShape());
      }
    }

    this.timeSinceShift += deltaTime;
    this.gameBoard.updateFrame(this.gameState.board);
  }
}

var deltaTime = 0;
var lastTickTime = 0;

function tick(time = 0) {
  deltaTime = time - lastTickTime;
  lastTickTime = time;

  game.tick(deltaTime);

  requestAnimationFrame(tick);
}

var canvas = document.getElementById("tetris");

document.addEventListener('keydown', (keyEvent) => {
  if (keyEvent.key === "ArrowLeft") {
    game.shift('left');
  } else if (keyEvent.key === "ArrowRight") {
    game.shift('right');
  } else if (keyEvent.key === "ArrowDown") {
    game.shift('down');
  } else if (keyEvent.key === '1') {
    this.game.spawnNewShape(shapes[0]);
  } else if (keyEvent.key === '2') {
    this.game.spawnNewShape(shapes[1]);
  } else if (keyEvent.key === '3') {
    this.game.spawnNewShape(shapes[2]);
  } else if (keyEvent.key === '4') {
    this.game.spawnNewShape(shapes[3]);
  } else if (keyEvent.key === '5') {
    this.game.spawnNewShape(shapes[4]);
  } else if (keyEvent.key === 'r') {
    this.game.spawnNewShape(pickRandomShape());
  } 
});

var game = new Game(canvas, 25);

tick();