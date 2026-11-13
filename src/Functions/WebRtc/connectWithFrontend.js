
const wrtc = require("@roamhq/wrtc");
const { createRecorder } = require("./SubFunctions/CreateRecorder");


const {
    RTCPeerConnection,
    RTCSessionDescription,
    RTCIceCandidate,
} = wrtc;


const peers = new WeakMap();

function send(ws, data) {
    if (ws.readyState === 1) {
        ws.send(JSON.stringify(data));
    }
}

// Create a WAV recording from incoming PCM samples




function closePeer(ws) {
    const peer = peers.get(ws);

    if (!peer) return;

    peers.delete(ws);

    if (peer.stopRecording) {
        peer.stopRecording();
    }

    peer.pc.close();

    console.log("WebRTC peer closed");
}
async function webRtcCon(ws, message) {

    // console.log("📩 Incoming WebRTC message:", message.type);

    // BROWSER SENDS OFFER
    if (message.type === "offer") {

      //  console.log("🔄 New WebRTC offer received");

        closePeer(ws);
       // console.log("🧹 Previous peer connection closed");

        const pc = new RTCPeerConnection({
            iceServers: message.iceServers || [],
        });

        peers.set(ws, {
            pc,
            stopRecording: null,
        });

      //  console.log("✅ New RTCPeerConnection created");

        // Send our ICE candidates to browser
        pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
               // console.log("📤 Sending server ICE candidate:", candidate.candidate);

                send(ws, {
                    type: "iceCandidate",
                    candidate,
                });
            } else {
                console.log("🏁 Server ICE candidate gathering completed");
            }
        };

        // Receive browser microphone
        pc.ontrack = ({ track }) => {

    console.log("Track received:", track.kind);
    console.log("Track ID:", track.id);
    console.log("Track state:", track.readyState);
    console.log("Track enabled:", track.enabled);
    console.log("Track muted:", track.muted);

    if (track.kind !== "audio") return;

    const peer = peers.get(ws);

    if (peer) {
        peer.stopRecording = createRecorder(track);
        console.log("Audio recorder started");
    }
};
        pc.onconnectionstatechange = () => {
            console.log("🔗 WebRTC connection state:", pc.connectionState);

            if (
                pc.connectionState === "failed" ||
                pc.connectionState === "closed"
            ) {
                console.log("❌ Connection failed or closed. Cleaning up...");
                closePeer(ws);
            }

            if (pc.connectionState === "connected") {
                console.log("🎉 WebRTC connection established successfully!");
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log("🧊 ICE connection state:", pc.iceConnectionState);
        };

        pc.onsignalingstatechange = () => {
            console.log("📡 Signaling state:", pc.signalingState);
        };

        // Set browser offer
        console.log("📥 Setting remote SDP offer...");

        await pc.setRemoteDescription(
            new RTCSessionDescription(message.sdp)
        );

        console.log("✅ Remote SDP offer set successfully");

        // Create server answer
        console.log("⚙️ Creating SDP answer...");

        const answer = await pc.createAnswer();

        console.log("✅ SDP answer created");

        await pc.setLocalDescription(answer);

        console.log("✅ Local SDP description set");

        send(ws, {
            type: "answer",
            sdp: pc.localDescription,
        });

        console.log("📤 WebRTC answer sent to browser");

        return;
    }

    const peer = peers.get(ws);

    if (!peer) {
        console.log("⚠️ No peer connection found for message:", message.type);
        return;
    }

    // Receive browser ICE candidates
    if (message.type === "iceCandidate") {

        // console.log("📥 Browser ICE candidate received:",
        //     message.candidate?.candidate
        // );

        await peer.pc.addIceCandidate(
            new RTCIceCandidate(message.candidate)
        );

//        console.log("✅ Browser ICE candidate added successfully");
    }

    // Stop recording and close connection
    if (message.type === "stop") {

        console.log("🛑 Stop message received from browser");

        closePeer(ws);

        console.log("🧹 Peer connection and recording stopped");
    }
}

module.exports = { webRtcCon, closePeer };
