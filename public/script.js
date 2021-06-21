const socket = io('/'); 
const videoGrid = document.getElementById("video-grid"); 
const myVideo = document.createElement("video");
myVideo.muted = true; 

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: "/",
    port: '443'
});

var peers = {}
var str = {}
var c = 0
var number = 0
let myVideoStream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    console.log(stream); 
    addVideoStream(myVideo, stream);
   
    peer.on('call', call => {
        console.log(number,'answer', c); 
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        peers[number++] = userId;
        connectToNewUser(userId, stream);
        console.log(number,'userS', c); 
        console.log("connect new user"); 
    })

    let msg = $('input')
    console.log(msg)

    $('html').keydown((e) => {
        if (e.which == 13 && msg.val().length !== 0)
        {
            console.log(msg.val())
            socket.emit('message', msg.val());
            msg.val('');
            scrollToBottom(); 
        }
    })
    
    socket.on('createMessage', message => {
        console.log('this is coming from server', message);
        $('ul').append(`<li class="messages"><b>user\n</b>${message}</li>`);
    })
    
}); 

peer.on('open', id => {

    peers[number++] = id; 
    socket.emit('join-room', ROOM_ID, id);
    console.log(number, 'open', c); 
})
  

const connectToNewUser = (userId, stream) => {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: false }, function (stream) {
        str[c++] = stream;
        for (let i = 0; i < c; i++) {
            console.log(str[i]); 
            var call = peer.call(userId, str[i]);
        }
        
        const video = document.createElement('video');
        call.on('stream', function (remoteStream) {
                addVideoStream(video, remoteStream);
        });
        
        console.log(number);
        console.log(number, 'connect', c);
    }, function(err) {
        console.log('Failed to get local stream' ,err);
});
 }


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play(); 
    })
    videoGrid.append(video);
}

var scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight")); 
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
    }
    else
    {
        myVideoStream.getAudioTracks()[0].enabled = true; 
    }
}

const videomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
    }
    else
    {
        myVideoStream.getVideoTracks()[0].enabled = true; 
    }
    }