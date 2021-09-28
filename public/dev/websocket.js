/* eslint-env browser */

(function () {

  const hostName = window.location.hostname;
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const port = window.location.port;
  const webSocket = new WebSocket(`${wsProtocol}${hostName}:${port}/socket`);

  function initWebSocket() {
    webSocket.addEventListener('open', (ev) => {
      console.log('webSocket open', ev);
      webSocket.addEventListener('message', (ev) => {
        const uniqueParam = `${Math.random()}`.replace('.', '');
        console.log('ev.data', ev.data);
        //if (typeof ev.data === 'string') return false;
        const data = JSON.parse(ev.data);
        if (data.path && data.path.indexOf('.css') !== -1) {
          const foundLink = document.querySelector(
            `link[href^='${data.path}']`
          );
          foundLink.setAttribute('href', `${data.path}?${uniqueParam}`);
        } else {
          location.reload();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initWebSocket);
})();
