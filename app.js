const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); 

const PORT = 5000;

/////////////////////////////////////////////////////////////////////Parsing DATA////////////////////////////////////////////////////////
app.use(express.urlencoded({ extended: true }));


app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: true }));


const users = {
  admin: { password: 'admin123', role: 'admin' },
  guest: { password: 'guest123', role: 'guest' }
};

/////////////////////////////////////////////////////////////login page//////////////////////////////////////////////////////////

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

//////////////////////////////////////////////////////////////:login permissions///////////////////////////////////////////////////////
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  

  const user = users[username];

  if (user && user.password === password) {
    req.session.user = user;
    if (user.role === 'admin') {
      return res.redirect('/admin');
    } else if (user.role === 'guest') {
      return res.redirect('/guest');
    }
  }
  

  res.redirect('/');
});

/////////////////////////////////////////////////////////////////////////Admin///////////////////////////////////////////////////////
app.get('/admin', (req, res) => {
  if (req.session.user && req.session.user.role === 'admin') {
    console.log('admin connected');
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  res.redirect('/');
});

/////////////////////////////////////////////////////////////////////////Guest///////////////////////////////////////////////////////
app.get('/guest', (req, res) => {
  if (req.session.user && req.session.user.role === 'guest') {
    console.log('Guest is Online');
    return res.sendFile(path.join(__dirname, 'public', 'guest.html'));
  }
  res.redirect('/');
});

////////////////////////////////////////////////////////////////////Socket/////////////////////////////////////////////////////////////////////
io.on('connection', (socket) => {
  console.log('A user connected');


  socket.on('purchase', () => {
    // Emit a notification to admin
    io.emit('notifyAdmin', 'A guest has made a purchase!');
  });


  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});


server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
