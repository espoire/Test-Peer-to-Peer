
const p = new SimplePeer({
  initiator: location.hash === '#1',
  trickle: false
})

p.on('error', err => console.log('error', err))

p.on('signal', data => {
  console.log('SIGNAL', JSON.stringify(data))
  document.querySelector('#outgoing').textContent = JSON.stringify(data)
})

document.querySelector('form').addEventListener('submit', ev => {
  ev.preventDefault()
  p.signal(JSON.parse(document.querySelector('#incoming').value))
})

p.on('connect', () => {
  console.log('CONNECT')
  const data = 'whatever' + Math.random();
  console.log(`sending: ${data}`);
  p.send(data);
})

p.on('data', data => {
  console.log('data: ' + data)
})

// import Connection from 'Connection.js';

// initialize();

// function initialize() {
//   document.getElementById('send-button').onclick = onClickSend;
//   window.connection = new Connection(initiator);
// }

// function onClickSend() {
//   const textBox = document.getElementById('text-box');

//   const message = textBox.value;
//   textBox.value = '';

//   appendToMessageLog('You', message);
//   send(message);
// }

// function send(message) {

// }

// function appendToMessageLog(sender, message) {
//   const messageEl = document.createElement('p');
//   messageEl.innerText = `${sender}: ${message}`;

//   const logDiv = document.getElementById('message-log');
//   logDiv.appendChild(messageEl);
// }