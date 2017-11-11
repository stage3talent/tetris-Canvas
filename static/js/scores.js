var topScores = document.getElementById('top-scores');

fetch('/scores').then(res => {
  console.log('Fetching scores.');
  return res.json();
}).then(scores => {
  var counter = 0;

  for (var player in scores) {
    var row = document.createElement('tr');
    var position = document.createElement('td');
    var playerName = document.createElement('td');
    var playerScore = document.createElement('td');

    position.innerHTML = ++counter;
    playerName.innerHTML = player;
    playerScore.innerHTML = scores[player];

    topScores.appendChild(row);
    row.appendChild(position);
    row.appendChild(playerName);
    row.appendChild(playerScore);
  }
});