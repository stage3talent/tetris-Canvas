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
    if (scores.length === 0) { return; }

    scoreboard.style.display = "block"; 

    var counter = 0;

    for (var player in scores) {
      var row = document.createElement('tr');
      var rank = document.createElement('td');
      var playerName = document.createElement('td');
      var playerScore = document.createElement('td');

      rank.innerHTML = ++counter;
      playerName.innerHTML = scores[player].player;
      playerScore.innerHTML = scores[player].score;

      scoreboard.appendChild(row);
      row.appendChild(rank);
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
    document.getElementById('tetris').focus();
  } else if (event.detail.trigger === 'end') {
    submitScore.elements.score.value = event.detail.score;
    submitScore.style.display = 'block';
  }
});