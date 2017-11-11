const express = require('express');

const tetris = express();

tetris.get('/', (req, res, next) => {
  console.log('Tetris request.');
  next();
});

tetris.get('/scores', (req, res) => {
  console.log('Fetching scores.');
  let scores = {
    'joe': 25,
    'mary': 10,
    'john': 100
  }

  res.send(scores);
});

tetris.post('/scores', (req, res) => {
  console.log('Submitting new score');
});

tetris.use(express.static('static'));

tetris.listen(3003);