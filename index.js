const express     = require('express');
const bodyParser  = require('body-parser');
const listenPort  = process.env.LISTENPORT || 3003;
const storagePath = process.env.STORAGEPATH || "./TetrisScores";
const storage     = require('node-persist');
storage.initSync({
  dir: storagePath
});

const tetris = express();
tetris.use(bodyParser.json());
tetris.use(bodyParser.urlencoded({ extended: true }));

tetris.get('/', (req, res, next) => {
  console.log('Tetris request recieved.');
  next();
});

tetris.get('/healthy', (req, res) => {
  console.log('Health check recieved.');
  res.status(200).send('I am alive on ' + new Date(Date.now()).toGMTString());
});

tetris.get('/scores', (req, res) => {
  console.log('Fetching scores.');

  let scoresArr = getScoreboard();
  res.status(200).send(scoresArr);
});

tetris.post('/scores', (req, res) => {
  console.log('Submitting new score...');
  if ((req.body.player && req.body.score)
  && (typeof(req.body.player) === 'string')
  && (req.body.player.length !== 0)
  && (!isNaN(req.body.score))) {
    var entry = {
      'player': req.body.player,
      'score': Number(req.body.score),
      'date': new Date().getTime()
    }
    setScoreboard(entry); 
  } else {
    console.log('  Bad scoreboard submission.');
  }
  res.redirect('/');
});

tetris.use(express.static('static'));
console.log("Listening on https://localhost:" + listenPort);
tetris.listen(listenPort);

function getScoreboard() {
  return storage.values();
}

function setScoreboard(entry) {
  const old = storage.getItemSync(entry.player);
  if (typeof old === 'undefined') {
    storage.setItemSync(entry.player, entry);
    console.log("  Score saved for new player", entry.player, entry.score);
  } else if (entry.score > old.score) {
    storage.setItemSync(entry.player, entry);
    console.log("  Higher score saved for player", entry.player, entry.score, old.score);
  } else {
    console.log('  Skipping - User did not beat previous score', entry.player, entry.score)
  }
}
