var BoxcarCommandAssistant = function() {
}

BoxcarCommandAssistant.prototype.run = function(future) {

    var ws = new WebSocket('ws://echo.websocket.org');
    ws.send(this.controller.args.name);

    ws.onmessage = function(m) {
        console.log('Got message: ' + m);
        future.result = m;
    }
}

