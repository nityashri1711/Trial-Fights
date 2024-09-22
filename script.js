//Server

const express = require('express');
const http = require('http');
const path = require ('path');
/*const { Server } = require('socket.io');*/
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use('/img', express.static(path.join(__dirname,'img')));

app.get('/',(req,res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js',(req,res) => {
  res.sendFile(__dirname + '/index.js', { headers: {'Content-Type': 'application/javascript'}});
});

app.get('/utils.js',(req,res) => {
  res.sendFile(__dirname + '/utils.js', { headers: {'Content-Type': 'application/javascript'}});
});

app.get('/classes.js',(req,res) => {
  res.sendFile(__dirname + '/classes.js', { headers: {'Content-Type': 'application/javascript'}});
});

const PORT = process.env.PORT || 4000;

// Serve static files
app.use(express.static(__dirname));

//GAME TIMER ADDED BY NITYA
let timeLeft = 60;  // 60 seconds for the game
let timerId = null;

function startTimer() {
  if (timerId) return; // Prevent starting multiple timers

  timerId = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      io.emit('timerUpdate', timeLeft);  // Broadcast to all clients
    } else {
      clearInterval(timerId);
      /*io.emit('gameOver', 'Time is up!');*/
      timerId=null;
    }
  }, 1000);  // Update every second
}
//NITYA ADDITION DONE

// Listen for socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chatMessage', (data) => {
      io.emit('chatMessage', data);
    });

    socket.emit('timerUpdate',timeLeft); //ADDED BY NITYA

    // Listen for player state updates and broadcast to other players
    socket.on('playerState', (data) => {
        //socket.broadcast.emit('playerUpdate', data);
        io.emit('playerUpdate',data);
    });

    // Listen for enemy state updates and broadcast to other players
    socket.on('enemyState', (data) => {
        //socket.broadcast.emit('enemyUpdate', data);
        io.emit('enemyUpdate', data);
    });
    // Listen for player attack and broadcast
    socket.on('playerAttack', (data) => {
      // Broadcast the attack event to other players
      socket.broadcast.emit('playerAttack', data);
    });
  

    // Listen for enemy attack and broadcast
    socket.on('enemyAttack', (data) => {
      socket.broadcast.emit('enemyAttackUpdate', data);
    });

    //ADDED BY NITYA
    if(!timerId) {
      startTimer();
    }

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log('Server is running on port 4000');
});
