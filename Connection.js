export default class Connection {
  constructor() {
    this.connection = new RTCPeerConnection();
    this.channel = null;
  }

  listen() {
    // TODO begin accepting remove offers
  }

  async offer() {

    const handlers = {
      open() {
        console.log('open');
      },
      close() {
        console.log('close');
      },
      message(event) {
        console.log(event);
        window.exposed = event;
      },
    };

    this.channel = this.connection.createDataChannel('data', {ordered: false});

    this.setLocalDescriptionAndSend(
      await this.connection.createOffer()
    );
  }

  async answer() {
    this.setLocalDescriptionAndSend(
      await this.connection.createAnswer()
    );
  }

  async setLocalDescriptionAndSend(description) {

    await this.connection.setLocalDescription(description);

    console.log('Sending SDP', 'green');
    console.log({ sdp: description });
  }

  send(obj) {
    const Json = JSON.stringify(obj);

    // TODO transmit
  }
}

/*

WebRTC peer-to-peer overview, from
  https://www.tutorialspoint.com/webrtc/webrtc_rtcpeerconnection_apis.htm

Here is an example of the user's flow −

Register the onicecandidate handler.
  It sends any ICE candidates to the other peer, as they are received.

Register the onaddstream handler.
  It handles the displaying of the video stream once it is received from the
  remote peer.

Register the message handler.
  Your signaling server should also have a handler for messages received from
  the other peer. If the message contains the RTCSessionDescription object, it
  should be added to the RTCPeerConnection object using the
  setRemoteDescription() method. If the message contains the RTCIceCandidate
  object, it should be added to the RTCPeerConnection object using the
  addIceCandidate() method.

Utilize getUserMedia() to set up your local media stream and add it to the
  RTCPeerConnection object using the addStream() method.

Start offer/answer negotiation process.
  This is the only step where the caller's flow is different from the callee's
  one. The caller starts negotiation using the createOffer() method and
  registers a callback that receives the RTCSessionDescription object. Then
  this callback should add this RTCSessionDescription object to your
  RTCPeerConnection object using setLocalDescription(). And finally, the caller
  should send this RTCSessionDescription to the remote peer using the signaling
  server. The callee, on the other, registers the same callback, but in the
  createAnswer() method. Notice that the callee flow is initiated only after
  the offer is received from the caller.

*/