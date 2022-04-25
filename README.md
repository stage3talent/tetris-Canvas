# tetris-Canvas
A Tetris web game. Includes a browser localStorage emulator for storing scores.

## Forking

Forked from drakemain/tetris-Canvas.  Changes since the fork are to support configuration with environment variables for the listenPort and to store high scores to an emulation of browser localStorage instead of Mongodb.  This is done ot make it more Docker-friendly.

## Running the application

The oldest version of node.js that is known to run this application is version 6.

Once you run the applilcation (node index.js), it will respond to requests from http://localhost:3003 to play in the browser.

## Routes in the application

The routes that the application will respond to are:

|Route|Purpose|
|-|-|
|/|Normally, the application just reponds to the root route to play the game.|
|/healthy|To test the application to see if it is running.  It should repond with a small 'I am alive' message with a timestamp.|
|/scores|Retrieve or set the high scores.  Will redirect back to the root.|

## Customization

It supports the following customizations through environment variables:

### LISTENPORT

The default LISTENPORT is 3003 but may be overridden by setting this env var.

### STORAGEPATH

The default STORAGEPATH is ./TetrisScores.  If will create this folder.  Each high score is stored as a new file in this folder.  The filename is a Hash value of the user's name.  The data stored is JSON and also includes the user's name.  The hashing of the name to generate the filename makes it hard to figure out which is which, but peeking at the JSON inside will tell you with data corresponds to which user.
