const socket = io('/'); 
const videoGrid = document.getElementById("video-grid"); 
const myVideo = document.createElement("video");
myVideo.muted = true; 

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: "/",
    port: '443'
});

let myVideoStream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
   
    peer.on('call', call => {

        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
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

    socket.emit('join-room', ROOM_ID, id);
})
  

const connectToNewUser = (userId, stream) => {
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: true, audio: false }, function (stream) {
        var call = peer.call(userId, stream); 
        const video = document.createElement('video');
        call.on('stream', function (remoteStream) {
                addVideoStream(video, remoteStream);
        });
        

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
