var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Keypad = require('./keypad_server.js');
var LdapSession = require('./ldapSession.js');
var Auth = require('./auth.js');
var BackboneSyncWebSockets = require('./backboneSyncWebSockets.js');
var EventEmitter = require('events');
var NetAddresses = require('./netAddresses.js');
const DiscoveryServer = require('./discoveryServer.js');

var config = {
    socketioPort: 1081
};

var addresses = NetAddresses.getAddresses();
console.log(addresses);
discoveryServer = new DiscoveryServer({
    port: 12345,
    serverInfo: {
        addresses: addresses,
        port: config.socketioPort
    }
});

server.listen(config.socketioPort);

var appEvents = new EventEmitter();

var ldapSession = new LdapSession({
    host: '192.168.0.222',
    adQuery: 'OU=Bella Vista Church,DC=bvc,DC=local',
    adrdn: 'BVC-NET\\'
});

var auth = new Auth({io: io, ldapSession: ldapSession});
var backboneSyncWebSockets = new BackboneSyncWebSockets({
    io: io,
    auth: auth,
    schema: 'security',
    password: 'jump2seven',
    username: 'mambrose',
    //server: '192.168.0.30',
    server: 'localhost',
    database: 'oss'
});

var keypads = [];

appEvents.on('keypadId', function(id, socket) {
    keypads[id] = new Keypad({
        id: id,
        socket: socket,
        appEvents: appEvents,
        events: {
            alert: function() {
                appEvents.emit('alert', 'door');
            }
        }
    });
});

io.on('connection', function(socket) {
    socket.on('keypadId', function(id) {
        console.log('got keypad id from socket:', id);
        appEvents.emit('keypadId', id, socket);
        io.of('/door').emit('keypadId', id);
    });
});

io.of('/door').on('connection', function(socket) {
    socket.on('cookie', function(cookie) {
        console.log('got cookie for door namspace');
        socket.handshake.session = auth.getSession(cookie);
    });
    socket.on('open', function(data) {
        appEvents.emit('open', data);
    });
});

appEvents.on('alert', function(channel) {
    console.log('alert', channel);
    switch (channel) {
        case 'door':
            io.of('/door').emit('alert');
            break;
    }
});
