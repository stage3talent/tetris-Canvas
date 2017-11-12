var scoreboard = document.getElementById('scoreboard');

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
      playerScore.innerHTML = scores[player];

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

