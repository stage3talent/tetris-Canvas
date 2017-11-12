var scoreboard = document.getElementById('scoreboard');
var submitScore = document.getElementById('submit-score');

if (scoreboard) {
  fetch('/scores').then(res => {
    console.log('Fetching scores.');
    if (res.status === 200) {
      return res.json();
    }

    throw new Error("Bad response.");
  }).then(scores => {
    if (scores.count === 0) { return; }

    scoreboard.style.display = "block"; 

    var counter = 0;

    for (var player in scores.players) {
      var row = document.createElement('tr');
      var position = document.createElement('td');
      var playerName = document.createElement('td');
      var playerScore = document.createElement('td');

      position.innerHTML = ++counter;
      playerName.innerHTML = player;
      playerScore.innerHTML = scores.players[player];

      scoreboard.appendChild(row);
      row.appendChild(position);
      row.appendChild(playerName);
      row.appendChild(playerScore);
    }
  }).catch(err => {
    console.error(err);
  });
} else {
  console.error('No scoreboard specified.');
}

document.addEventListener('tetris', event => {
  if (!submitScore) { return; }

  if (event.detail.trigger === 'start') {
    submitScore.style.display = 'none';
  } else if (event.detail.trigger === 'end') {
    submitScore.score = event.detail.score;
    submitScore.style.display = 'block';
  }
});

submitScore.onsubmit = function(event) {
  // event.preventDefault();
}