const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('mongodb');
const monk = require('monk');

const db = monk('localhost:27017/TetrisScores');
const tetris = express();
tetris.use(bodyParser.json());
tetris.use(bodyParser.urlencoded({ extended: true }));

tetris.get('/', (req, res, next) => {
  console.log('Tetris request.');
  next();
});

tetris.get('/scores', (req, res) => {
  console.log('Fetching scores.');
  let scores = getScoreboard();

  res.status(200).send(scores);
});

tetris.post('/scores', (req, res) => {
  console.log('Submitting new score');
  console.log(req.body);

  res.redirect('/');
});

tetris.use(express.static('static'));

tetris.listen(3003);

function getScoreboard() {
  var scoreBoard = {};

  db.get('usercollection').find({},{},(e,docs) => {
    console.log(docs);
  });

  scoreBoard.players = {
    'joe': 25,
    'mary': 10,
    'john': 100
  };

  counter = 0;

  for (var player in scoreBoard.players) {
    counter++;
  }

  scoreBoard.count = counter;

  return scoreBoard;
}