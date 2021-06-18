//const { connect } = require("http2");

// const Peer = require("peerjs");

// const { Socket } = require("dgram");
const socket = io('/'); 
const videoGrid = document.getElementById("video-grid"); 
const myVideo = document.createElement("video");
myVideo.muted = true; 

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: "/",
    port: '3030'
});


let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    
    peer.on('call', call => {
        console.log("answer call ")

        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
        console.log("connect new user"); 
    })
    
}); 

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID , id); 
})
  

const connectToNewUser = (userId, stream) => {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: false }, function(stream) {
        var call = peer.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', function(remoteStream) {
            addVideoStream(video, remoteStream);
        });
    }, function(err) {
        console.log('Failed to get local stream' ,err);
});
//     const call = peer.call(userId, stream);
//     console.log(call);
//     const video = document.createElement('video');
//     call.on('stream', userVideoStream => {
//         addVideoStream(video, userVideoStream);
//     })
//     console.log("ewfjoe");
 }


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play(); 
    })
    videoGrid.append(video);
}
