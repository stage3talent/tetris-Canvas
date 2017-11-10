const express = require('express');

const tetris = express();

tetris.get('/', (req, res, next) => {
  console.log('Tetris request.');
  next();
});

tetris.use(express.static('static'));

tetris.listen(3003);