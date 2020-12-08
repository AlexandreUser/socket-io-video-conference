const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});
const params = new URLSearchParams(window.location.search);

let name = params.get("name");
let type = params.get("type");
function goToSite() {
  window.location.href = "https://www.treatmentstreet.com/";
}
function goToHome() {
  if (type === "Doctor") {
    window.location.href = "https://www.treatmentstreet.com/doctor/" + name;
  } else {
    window.location.href = "https://www.treatmentstreet.com/patient/" + name;
  }
}
let videoSettings = true;
let audioSettings = true;
document.getElementsByClassName("profileName")[0].innerText = name;
document.getElementsByClassName("profileType")[0].innerText = type;
const myVideo = document.createElement("video");
myVideo.muted = true;

function muteVideo() {
  if (audioSettings) {
    localStream.getAudioTracks()[0].enabled = true;
  } else {
    localStream.getAudioTracks()[0].enabled = false;
  }
  audioSettings = !audioSettings;
}
function endCamera() {
  if (videoSettings) {
    localStream.getVideoTracks()[0].enabled = false;
  } else {
    localStream.getVideoTracks()[0].enabled = true;
  }
  videoSettings = !videoSettings;
}
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: audioSettings,
  })
  .then((stream) => {
    window.localStream = stream;
    console.log(localStream.getVideoTracks()[0]);

    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      console.log("User Connected " + userId);
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  videos = document.getElementsByTagName("video");
  for (let i = 0; i < videos.length; i++) {
    if (i > 0) {
      document.getElementsByTagName("video")[i].id = "small";
      document.getElementsByTagName("video")[i].onclick = function () {
        let reajust = [];
        videoGrid[i] = "";
      };
    }
  }
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
