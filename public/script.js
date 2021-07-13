const socket = io('/');
const videoGrid = document.getElementById("video-grid");

//variable to store client's video 
const myVideo = document.createElement("video");
myVideo.muted = true; 

//initialising peer object 
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: "/",
    port: '443'
});

//stores client's video stream
let myVideoStream
//stores peerConnection of client 
let userPeer;
//stores list of peers in the room 
const peerList = {}
//stores unique id of client 
let userId = ""
//stores usernames mapped to their ids
const userName = {}
//stores user's personal emoji 
let emoji 


/* an emoji out of the following is randomly assigned to a person
and displayed in front of the client name in chat messages */

const Emojis = ['😀', '🐀','🐁','🐭','🐹','🐂','🐃','🐄','🐮','🐅','🐆','🐯','🐇','🐐','🐑','🐏','🐴',
    '🐎','🐱','🐈','🐰','🐓','🐔','🐤','🐣','🐥','🐦','🐧','🐘','🐩','🐕','🐷','🐖',
    '🐗','🐫','🐪','🐶','🐺','🐻','🐨','🐼','🐵','🙈','🙉','🙊','🐒','🐉','🐲','🐊',
    '🐍','🐢','🐸','🐋','🐳','🐬','🐙','🐟','🐠','🐡','🐚','🐌','🐛','🐜','🐝','🐞',
];

//function that returns a random emoji to be assigned to a user
  function randomEmoji() {
    const randomIndex = Math.floor(Math.random() * Emojis.length);
    return Emojis[randomIndex];
  }
emoji = randomEmoji();


//getting reference to the client's camera 
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;

    //add's clients video to his stream 
    addVideoStream(myVideo, myVideoStream);
    

    //function to answer call sent by a peer 
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            userPeer = call.peerConnection;
            addVideoStream(video, userVideoStream);
        })
        call.on('close', () => {
            video.remove(); 
        })
    })

    //fires a function to call the newly connected client from other clients in the room 
    //informs other user's in the room that a new client has joined 
    socket.on('user-connected', (userId) => {
        socket.emit('chat_message',"has joined call.", "", emoji);
        connectToNewUser(userId, stream);
    })
   
    //variable to store the chat message written by a client 
    let msg = $('input')
    
    //fires a function to send the chat typed by the client in the chat to other clients
    //this happens everytime the client types a message and presses enter 
    $('html').keydown((e) => {
        if (e.which == 13 && msg.val().length !== 0)
        {
            let name = userName[userId] || 'Anonymous_user';  
            socket.emit('chat_message',msg.val(), name, emoji);
            msg.val('');
            scrollToBottom();
        }
    })

    /* function to display the chat sent by the user in the chat window whenever the user presses enter 
    the user name and emoji are also displayed along with the messages */ 
    socket.on('sendMessage', function (message, userName, emoji) {
        $('ul').append(`<li class="messages"><p> <b>${emoji} <u>${userName}</u>\n</b>${message}</p> </li>`);
        scrollToBottom();
    })
    
    //function to remove user from the room once disconnected 
    socket.on('user-disconnected', userId => {
        if (peerList[userId])
            peerList[userId].close();  
    })


    //function to display participants in a room when a user requests for it by clicking the participants button 
    socket.on('display_participant', arr => {
        var m = "The participants of this meeting are - \n\n";
        var j = 1;
        //appending all the names of the clients in the room to a string 
        for (i in arr)
        {
            m += `${j}) `; 
            m += arr[i];
            m += "\n\n";
            j += 1; 
        }
        $('ul').append(`<p><li class="messages"><b>${m}</li></p>`);
    })
    
});


//function to display raised hand message when a client raises hand 
const raiseHand = () => {
    let name = userName[userId] || 'Anonymous_user';  
    socket.emit('chat_message',"has raised hand ✋", name, emoji);
}


//function executed when participants button is clicked. 
//it fires a function to gather all the names of the clients in the room from server and display them 
const display_participants = () => {
    socket.emit('participate');
}

//function executed when a peer connection is opened. 
//the user joins a room once this happens  
peer.on('open', function (id) {
    userId = id;
    userName[userId] = prompt("Enter name"); 
    socket.emit('join-room', ROOM_ID, userId, userName[userId]);
    
    
})


//function to call new user and add his video to our stream once connected 
const connectToNewUser = (userId, stream) => {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: true }, function (stream) {
        stream = myVideoStream; 
        var call = peer.call(userId, stream); 
        const video = document.createElement('video');
        call.on('stream', function (remoteStream) {
            userPeer = call.peerConnection;
            addVideoStream(video, remoteStream);
        });
        call.on('close', () => {
            video.remove(); 
        })
        peerList[userId] = call; 
    }, function(err) {
        console.log('Failed to get local stream' ,err);
});
 }

//function to add client's video to the specified video stream 
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);

    //adjusts size of all user videos when new clients are added. 
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width = 100 / totalUsers + "%";        }
    }
}

//scrolls the chat window automatically as soon as the messages reach the end of the screen 
var scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight")); 
}

