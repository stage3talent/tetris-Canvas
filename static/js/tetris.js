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
  ],
  [
    [0,0,6],
    [0,0,6],
    [0,6,6]
  ],
  [
    [0,7,7],
    [7,7,0],
    [0,0,0]
  ]
];

function pickRandomShape(min = 0, max) {
  max = max || shapes.length;

  return shapes[Math.floor(Math.random() * (max - min)) + min];
}

class GameBoard {
  constructor(dimensions) {
    this.score = 0;
    this.scoreDelta = 0;

    this.board = this.buildBoard(dimensions);
    this.activeShape = {"shape": [], "position": {}};

    this.isPaused = false;
    this.playerHasLost = false;
  }

  buildBoard(dimensions) {
    let newBoard = [];

    while (dimensions.height--) {
      newBoard.push(new Array(dimensions.width).fill(0));
    }

    return newBoard;
  }

  reset() {
    this.board.forEach((row, rowIndex) => {
      this.clearRow(rowIndex);
    });

    this.activeShape.shape = [];
    this.score = 0;
    this.scoreDelta = 0;
    this.playerHasLost = false;
  }

  setNewActiveShape(shapeMatrix, position) {
    if (this.collisionCheck(shapeMatrix, position)) {
      return false;
    }

    this.activeShape.shape = [];

    for (var row in shapeMatrix) {
      this.activeShape.shape.push(new Array(shapeMatrix[row].length).fill(0));
      for (var column in this.activeShape.shape[row]) {
        this.activeShape.shape[row][column] = shapeMatrix[row][column];
      }
    }

    this.activeShape.position = position
    this.moveActiveShape(this.activeShape.position);

    return true;
  }

  moveActiveShape(newPosition) {
    if (!this.activeShape.shape) { return false; }

    // prevent from colliding with self
    this.removeActiveShape();

    if (this.collisionCheck(this.activeShape.shape, newPosition)) {
      this.insertActiveShape();
      return false; 
    }

    this.activeShape.position = newPosition;
    this.insertActiveShape();

    return true;
  }

  rotateActiveShape() {
    this.removeActiveShape();

    var rotatedShape = [];

    for (var row in this.activeShape.shape) {
      rotatedShape.push(new Array(this.activeShape.shape[row].length).fill(0));
    }

    const layers = this.activeShape.shape.length;
    let layerLength = layers - 1;
    let layer = 0;
    let currentCoords = {'row': 0, 'column': 0};
    let newCoords = {'row': 0, 'column': 0};

    while (layer < Math.floor(layers / 2)) {

      for (var i = 0; i < layerLength; i++) {
        currentCoords.row = layer;
        currentCoords.column = layer + i;

        for (var j = 0; j < 4; j++) {
          newCoords.row = currentCoords.column;
          newCoords.column = (layers - 1) - currentCoords.row;

          let currentValue = this.activeShape.shape[currentCoords.row][currentCoords.column];

          rotatedShape[newCoords.row][newCoords.column] = currentValue;

          currentCoords.row = newCoords.row;
          currentCoords.column = newCoords.column;
        }
      }

      ++layer;
      layerLength = layerLength - 2;
    }

    if (layers % 2 !== 0) {
      rotatedShape[layer][layer] = this.activeShape.shape[layer][layer];
    }

    if (!this.collisionCheck(rotatedShape, this.activeShape.position)) {
      this.activeShape.shape = rotatedShape;
    }    

    this.insertActiveShape();
  }

  collisionCheck(shape, projectedPosition) {
    for (var rowIndex in shape) {
      for (var columnIndex in shape[rowIndex]) {
        if (shape[rowIndex][columnIndex] !== 0) {
          rowIndex = parseInt(rowIndex);
          columnIndex = parseInt(columnIndex);

          let boardRow = rowIndex + projectedPosition.row;
          let boardColumn = columnIndex + projectedPosition.column;

          if (boardRow < 0) {
            console.log('Ceiling collision!');
            return true;
          } else if (boardRow > this.board.length -1) {
            console.log('Floor collision!');
            return true;
          } else if (boardColumn < 0) {
            console.log('Left wall collision!');
            return true;
          } else if (boardColumn > this.board[boardRow].length - 1) {
            console.log('Right wall collision!');
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

class GameRenderer {
  constructor(canvasReference, dimensions) {
    let scale = this.getScale({
      'width': canvasReference.width,
      'height': canvasReference.height
    }, dimensions);

    this.ctx = canvasReference.getContext('2d');
    this.ctx.scale(scale.horizontal, scale.vertical);
    this.fill();
  }

  fill(color) {
    this.ctx.fillStyle = color || "#1f1f1f";
    this.ctx.fillRect(0,0,canvas.width, canvas.height);  
  }

  getScale(canvasDimensions, desiredGameSize) {
    var horizontalScale = canvasDimensions.width / desiredGameSize.width;
    var verticalScale = canvasDimensions.height / desiredGameSize.height;

    return {'horizontal': horizontalScale, 'vertical': verticalScale};
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
          } else if (value === 6) {
            this.ctx.fillStyle = "purple";
          } else if (value === 7) {
            this.ctx.fillStyle = "pink";
          } else {
            this.ctx.fillStyle = "white";
          }

          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }
}


class Game {
  constructor(canvas, dimensions) {
    this.timeSinceShift = 0;
    this.shiftDelay = 1000;
    this.board = new GameBoard({
      "width": dimensions.width,
      "height": dimensions.height
    });
    this.renderer = new GameRenderer(canvas, dimensions);
    this.scoreDisplay = document.getElementById("score-tracker");
    this.messageBox = document.getElementById("alerts");
  }

  start() {
    this.writeMessage('', '6em');

    this.updateScore();

    this.spawnNewShape(pickRandomShape());
    tick();

    this.dispatchEvent({trigger: 'start'});
  }

  reset() {
    this.renderer.fill();
    this.board.reset();
    this.shiftDelay = 1000;
    this.start();
  }

  pause() {
    this.board.isPaused = !this.board.isPaused;

    if (this.board.isPaused) {
      this.writeMessage('Game paused.', 'orange');
    } else {
      this.writeMessage('');
    }
  }

  end() {
    this.writeMessage('Game over! =(', 'red');
    this.board.playerHasLost = true;

    this.dispatchEvent({
      trigger: 'end',
      score: this.board.score
    });
  }

  writeMessage(message, color = 'black', size = '5em') {
    if (!this.messageBox) { return; }

    this.messageBox.textContent = message;
    this.messageBox.style.color = color;
    this.messageBox.style.size = size;
  }

  shift(direction) {
    if (this.board.isPaused) { return; }

    let row = this.board.activeShape.position.row;
    let column = this.board.activeShape.position.column;
    
    if (direction === 'left') {
      column--;
    } else if (direction === 'right') {
      column++;
    } else if (direction === 'down') {
      row++;
    }

    return this.board.moveActiveShape({
      row,
      column
    });
  }

  rotate() {
    if (this.board.isPaused) { return; }

    this.board.rotateActiveShape();
  }

  lineCheck() {
    var lines = this.board.getCompleteLineRows();
    var lineCounter = 1;

    for (var row in lines) {
      this.board.scoreDelta += lineCounter++;

      this.board.clearRow(lines[row]);
      this.board.shiftDownToRow(lines[row]);
    }

    this.updateScore();
  }

  spawnNewShape(shapeMatrix) {
    let spawnPosition = {
      "row": 0,
      "column": Math.floor(this.board.board[0].length / 2) - Math.floor(shapeMatrix[0].length / 2)
    };

    var success = this.board.setNewActiveShape(shapeMatrix, spawnPosition);

    if (!success) {
      this.end();
    }
  }

  updateScore() {
    if (!this.scoreDisplay) { return; }

    let scoreDelta = this.board.scoreDelta;

    this.scoreDisplay.innerHTML = this.board.score;
    this.scoreDisplay.style.fontSize = "5em";

    if (scoreDelta !== 0) {
      this.scoreDisplay.style.fontSize = "6em";
      this.scoreDisplay.innerHTML += ' +' + this.board.scoreDelta; 
    }
  }

  tick(deltaTime) {
    if (this.board.isPaused || this.board.playerHasLost) { return; }

    if (this.timeSinceShift > this.shiftDelay) {
      this.timeSinceShift = 0;

      if (this.board.scoreDelta !== 0) {
        this.board.score += this.board.scoreDelta;
        this.board.scoreDelta = 0;
        this.updateScore();
      }

      if (!this.shift('down')) {
        this.lineCheck();

        this.spawnNewShape(pickRandomShape());

        if (this.shiftDelay > 10){
          this.shiftDelay--;
        }
      }
    }

    this.timeSinceShift += deltaTime;
    this.renderer.updateFrame(this.board.board);
  }

  dispatchEvent(detail) {
    var gameEvent = new CustomEvent('tetris', {
      detail: detail
    });

    document.dispatchEvent(gameEvent);
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

var canvas = document.getElementById('tetris');
canvas.focus();

canvas.addEventListener('keydown', (keyEvent) => {
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
  } else if (keyEvent.key === 'r') {
    game.reset();
  }
});

var game = new Game(canvas, {
  'width': 10,
  'height': 20
});

game.start();