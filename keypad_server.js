var EventEmitter = require('events').EventEmitter;

var keycards = [
     '7A005B0F7A54', //jake
     '7A005B1FC7F9', //mike
     '7A00927328B3', //laura
     '7A0092C4E8C4', //ben
     '7A00927441DD', //mark
     '7A0092A7024D', //gary
     '7A0092AC3672', //ron
     '7A00860BB94E', //dennis
     '7A0092768C12', //shannon
     '7A0092A7F4BB', //cara
     '7A009268DB5B', //kirsten
     '7A0092C984A5', //rosemary
     '7A0085D81334' //calvin
];

function Keypad(options) {
    this.entryTimeout = options.entryTimeout || 2000;
    this.maxLength = options.maxLength || 4;
    this.keyBuffer = '';
    this.keyInterval = null;
    this.id = options.id;
    this.appEvents = options.appEvents;
    this.socket = options.socket;
    /*for(var event in options.events){
        this.on(event, options.events[event]);
    }*/
    var self = this;
    /*this.appEvents.on('keypadId', function(id, socket) {
        console.log(id);
        if (id == self.id) {
            self.socket = socket;
            self._registerSocketListeners();
            console.log('registering socket');
        }
    });*/
    this._registerSocketListeners();
    this.appEvents.on('open', function(data) {
        if (/*data.id == self.id && */self.socket != null) {
            self.socket.emit('unlock');
        }
    });
}

Keypad.prototype = {
    __proto__: EventEmitter.prototype,
    key: function(key) {
        clearInterval(this.keyInterval);
        if (key == "#") {
            this.keyBuffer = '';
            this.appEvents.emit('alert', 'door');
            return;
        }
        var self = this;

        this.keyInterval = setInterval(function() {
            self.emit('timeout');
            console.log('timed out');
            self.socket.emit('buzz');
            clearInterval(self.keyInterval);
            self.keyBuffer = '';
        }, this.entryTimeout);

        this.keyBuffer += key;
        if (this.keyBuffer.length == this.maxLength) {
            this.emit('pin', this.keyBuffer);
            clearInterval(this.keyInterval);
            this.keyBuffer = '';
        }
    },
    rfid: function(data) {
        this.appEvents.emit('rfid', data);
    },
    _registerSocketListeners: function() {
        var self = this;
        this.socket.on('key', function(key) {
            self.key(key);
        });
        this.socket.on('rfid', function(data) {
            if (keycards.indexOf(data) != -1) {
                self.socket.emit('unlock');
            } else {
                self.socket.emit('buzz');
            }
        });
    }
};

module.exports = Keypad;
