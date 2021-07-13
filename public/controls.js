/*function to share screen
It replaces the video of the user with his screen in the stream of all other clients*/
const shareScreen = () => {
    navigator.mediaDevices.getDisplayMedia({
        audio: { echoCancellation: true, noiseSupression: true },
        video: { cursor: "always" }
    }).then(stream => {
        let videoScreen = stream.getVideoTracks()[0]; 
        let s = userPeer.getSenders().find(vid => {
            return vid.track.kind == videoScreen.kind;
        })
      s.replaceTrack(videoScreen);

        //replacing the screen back with client video once screen sharing has ended. 
        videoScreen.onended = () => {
            let videoScreen = myVideoStream.getVideoTracks()[0]; 
            let s = userPeer.getSenders().find(vid => {
                return vid.track.kind == videoScreen.kind;
            })
          s.replaceTrack(videoScreen);
        }
    }), function (err) {
        console.log('Failed to share', err);
    }
}

//function to mute and unmute audio 
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    //if audio is enabled then it is disabled 
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        changeIcon('.mic', 'mic_off', 'Unmute'); 
    }
    //if audio is disabled then it is enabled  
    else
    {
        myVideoStream.getAudioTracks()[0].enabled = true;
        changeIcon('.mic', 'mic', 'Mute'); 
    }
}

//function to mute and unmute video 
const videomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    //if video is enabled, then it is disabled. 
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        changeIcon('.video', 'videocam_off', 'Show Video'); 
    }
    //if video is disables, then it is enabled
    else
    {
        myVideoStream.getVideoTracks()[0].enabled = true;
        changeIcon('.video', 'videocam', 'Hide Video'); 
    }
}

// helper function to change icons in buttons 
const changeIcon = (htmlElement, icon_name, description) =>
{
    const html = `
    <i class="material-icons"> ${icon_name} </i>
    <span> ${description} </span>
  ` 
  document.querySelector(`${htmlElement}`).innerHTML = html; 
}
