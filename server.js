//React - Use for front end && use Node JS - backend



const express = require('express');
//const { report } = require('process');
const app = express();

//express is web framework for node js
const server = require('http').Server(app);
const io = require('socket.io')(server); 
const { v4: uuidv4 } = require('uuid'); 
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
}); 

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer); 
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);   
    //res.render('room'); 
    //res.status(200).send("Hello World"); 
})
 
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room});
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
    })
})



server.listen(3030);
// 3030 is the port and server is local host 
