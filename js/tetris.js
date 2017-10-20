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

    this.score = 0;
    this.scoreDelta = 0;

    this.board = this.buildBoard(dimensions, scale);
    this.activeShape = {"shape": [], "position": {}};

    this.isPaused = false;
  }

  buildBoard(dimensions) {
    let newBoard = [];

    while (dimensions.height--) {
      newBoard.push(new Array(dimensions.width).fill(0));
    }

    return newBoard;
  }

  setNewActiveShape(shapeMatrix) {
    this.activeShape.shape = [];

    for (var row in shapeMatrix) {
      this.activeShape.shape.push(new Array(shapeMatrix[row].length).fill(0));
      for (var column in this.activeShape.shape[row]) {
        this.activeShape.shape[row][column] = shapeMatrix[row][column];
      }
    }

    console.log(this.activeShape.shape);

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

  rotateActiveShape() {
    this.removeActiveShape();



    const layers = this.activeShape.shape.length;
    let layerLength = layers - 1;
    let layer = 0;
    let currentBuffer = 0;
    let nextBuffer = 0;
    let currentCoords = {'row': 0, 'column': 0};
    let newCoords = {'row': 0, 'column': 0};

    while (layer < Math.floor(layers / 2)) {
      console.log('ROTATING LAYER', layer);

      for (var i = 0; i < layerLength; i++) {

        currentCoords.row = layer;
        currentCoords.column = layer + i;
        currentBuffer = this.activeShape.shape[currentCoords.row][currentCoords.column];


        for (var j = 0; j < 4; j++) {
          newCoords.row = currentCoords.column;
          newCoords.column = (layers - 1) - currentCoords.row;

          nextBuffer = this.activeShape.shape[newCoords.row][newCoords.column];
          this.activeShape.shape[newCoords.row][newCoords.column] = currentBuffer;

          console.log('CORNER', j, '| VALUE', currentBuffer, currentCoords);
          console.log('DEST', '| VALUE', nextBuffer, newCoords);

          currentBuffer = nextBuffer;

          currentCoords.row = newCoords.row;
          currentCoords.column = newCoords.column;

          console.table(this.activeShape.shape);
        }
        console.log('ROTATED CORNERS');
      }

      console.log('ROTATED LAYERS');
      ++layer;
      layerLength = layerLength - 2;
    }

    this.insertActiveShape();
  }

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
  constructor(canvas, scoreDisplay, scale = 1) {
    this.timeSinceShift = 0;
    this.shiftDelay = 1000;
    this.gameState = new GameState({
      "width": canvas.width,
      "height": canvas.height
    }, scale);
    this.gameBoard = new GameBoard(canvas, scale);
    this.scoreDisplay = scoreDisplay;
  }

  start() {
    console.log('Game starting!');

    this.updateScore();

    this.spawnNewShape(pickRandomShape());
    tick();
  }

  shift(direction) {
    if (this.gameState.isPaused) { return; }

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

  rotate() {
    if (this.gameState.isPaused) { return; }

    this.gameState.rotateActiveShape();
  }

  lineCheck() {
    var lines = this.gameState.getCompleteLineRows();
    var lineCounter = 1;

    for (var row in lines) {
      this.gameState.scoreDelta += lineCounter++;

      this.gameState.clearRow(lines[row]);
      this.gameState.shiftDownToRow(lines[row]);
    }

    this.updateScore();

    console.log('scoredeta', this.gameState.scoreDelta);
  }

  spawnNewShape(shapeMatrix) {
    console.log('Spawning new shape:');
    console.table(shapeMatrix);
    this.gameState.setNewActiveShape(shapeMatrix);
  }

  updateScore() {
    let scoreDelta = this.gameState.scoreDelta;

    this.scoreDisplay.innerHTML = this.gameState.score;
    this.scoreDisplay.style.fontSize = "5em";

    if (scoreDelta !== 0) {
      this.scoreDisplay.style.fontSize = "6em";
      this.scoreDisplay.innerHTML += ' +' + this.gameState.scoreDelta; 
    }
  }

  pause() {
    if (this.gameState.isPaused) {
      console.log('Unpaused');
      this.gameState.isPaused = false;
    } else {
      console.log('Paused');
      this.gameState.isPaused = true;
    }
  }

  tick(deltaTime) {
    if (this.gameState.isPaused) { return; }

    if (this.timeSinceShift > this.shiftDelay) {
      this.timeSinceShift = 0;

      if (this.gameState.scoreDelta !== 0) {
        console.log('score update');

        this.gameState.score += this.gameState.scoreDelta;
        this.gameState.scoreDelta = 0;
        this.updateScore();
      }

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
var scoreTracker = document.getElementById("score-tracker");

console.log(scoreTracker);

document.addEventListener('keydown', (keyEvent) => {
  if (keyEvent.key === "ArrowLeft") {
    game.shift('left');
  } else if (keyEvent.key === "ArrowRight") {
    game.shift('right');
  } else if (keyEvent.key === "ArrowDown") {
    game.shift('down');
  } else if (keyEvent.key === "ArrowUp") {
    game.rotate();
  } else if (keyEvent.key.toLowerCase() === "p") {
    game.pause();
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

var game = new Game(canvas, scoreTracker, 25);

game.start();