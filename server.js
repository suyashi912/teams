//importing installed dependencies 
const express = require('express');
const app = express();
//server creation 
const server = require('http').Server(app);         
const io = require('socket.io')(server);

//using peer server for connection 
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

//setting view folder as 'views' and view engine as 'embedded javascript' 
app.set('views', './views')
app.set('view engine', 'ejs');

//setting static file as public 
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true })); 
app.use('/peerjs', peerServer);

//stores names of current rooms 
const roomNames = {};
let user; 
/*making a request to render the first page of the application ('login.ejs') 
It displays the existing rooms and allows creation of new rooms. */
app.get('/', (req, res) => {
    res.render('login', {roomNames : roomNames});
})


//rendering common board (jam board) between all the rooms such that everyone can draw on it together
app.get('/jamBoard', (req, res) => {
    res.render('jamBoard');
   });


//rendering personal board of any user. It can be shared among other members of room using screen sharing. 
app.get('/personal_board', (req, res) => {
    res.render('personal_board'); 
})


//creating a new room with the name entered by the user 
app.post('/room', (req, res) => {
    //prevent creation of multiple rooms with same name 
    if (roomNames[req.body.room] != null) {
        return res.redirect('/')
    }

    user = req.body.user; 
    roomNames[req.body.room] = { users: {} }
    res.redirect(req.body.room); 
    //create a new room with the entered name 
    io.emit('room-created', req.body.room)
  })


//rendering the room created/selected by the user
app.get('/:room', (req, res) => {
    if (roomNames[req.params.room] == null) {
        return res.redirect('/')
    }
    res.render('room', { roomId: req.params.room });
})


//functions that use web socket upon connection
//this event automatically fires upon connection 
io.on('connection', socket => {
    //creates a new room and adds the name of the room and url into the main page for people to join 
    socket.on('room-created', function (room) {
        const Link = document.createElement('a');
        Link.href = `${room}`
        Link.innerText = room; 
        const dropdown_menu = document.getElementsByClassName("dropdown-content");
        dropdown_menu.append(Link);
    })
   
    //this executes when peer is connected and joins the room 
    socket.on('join-room', (roomId, userId, userName) => {

        //user is added to his room list 
        roomNames[roomId].users[socket.id] = userName; 
        socket.join(roomId);


        //new user connection is broadcasted to each user so that call can be made 
        socket.broadcast.to(roomId).emit('user-connected', userId);


        //displays the names of the participants in the given room
        //it is displayed in the chat section of the user who requested it. 
        socket.on('participate', function () {
            var user_names = []
            getUserRooms(socket).forEach(room => {
                if (room == roomId) {
                    for (var i in roomNames[room].users) {
                        user_names.push(roomNames[room].users[i])
                    }
                }
            });
            //user_names contains names of users in the given room  
            socket.emit('display_participant', user_names);
        })


        //when the user disconnects, he/she is removed from their corresponding room. 
        socket.on('disconnect', () => {
            getUserRooms(socket).forEach(room => {
                socket.broadcast.to(roomId).emit('user-disconnected', roomNames[room].users[socket.id]);
                delete roomNames[room].users[socket.id]; 
            });
        })


        //function to send chat messages across all users in the room. 
        socket.on('chat_message', function (message, name, emoji) {
            io.to(roomId).emit('sendMessage', message, name, emoji);
        })
    })


    //function to dynamically share the drawing on jam board  
    socket.on('mouse', function(data, stroke, width, fill_color) {
        socket.broadcast.emit('mouseDraw', data, stroke, width, fill_color);
    });
    
    
})

//function that returns the roomNames dictionary in form of an array for easy traversal
//it is used in 'participate' and 'disconnect' functions above 
function getUserRooms(socket) {
    return Object.entries(roomNames).reduce((names, [name, room]) => {
        if (room.users[socket.id] != null) names.push(name);
        return names;
    }, []); 
}


server.listen(process.env.PORT || 3030);

