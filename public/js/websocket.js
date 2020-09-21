const hostName = window.location.hostname;
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'; 
const port = window.location.port;
const webSocket = new WebSocket(`${wsProtocol}${hostName}:${port}/socket`);

let counter = 0;

function initWebSocket() {

  webSocket.addEventListener('open', (ev) => {
    console.log('websocket open', ev);
    webSocket.addEventListener('message', (ev) => {
      console.log('ev.data', ev.data);
      const data = JSON.parse(ev.data); 
      if (data.path.indexOf('.css') !== -1 ) {
        counter += 1;
        const foundLink = document.querySelector(`link[href^='${data.path}']`);
        foundLink.setAttribute('href', `${data.path}?${counter}`); 
      } else {
        location.reload();
      }
    });
  });

}

document.addEventListener('DOMContentLoaded', initWebSocket);
