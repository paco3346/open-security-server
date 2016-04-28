var Session = require('./session.js');

function Auth(options) {
    this.io = options.io;
    this.ldapSession = options.ldapSession;
    this.sessions = {};
    var self = this;
    this.io.of('/auth').on('connection', function(socket) {
        socket.on('cookie', function(key, value) {
            if (key == 'session') {
                if (value == undefined || self.getSession(value) == undefined) {
                    console.log('creating new session');
                    self.setupSocket(socket, self.createSession(socket));
                } else {
                    self.setupSocket(socket, self.getSession(value));
                }
            }
        });
        socket.on('login', function(data) {
            console.log(data);
            socket.handshake.session.login({
                username: data.username,
                password: data.password
            });
        });
        socket.on('logout', function () {
            socket.handshake.session.logout();
        });
        socket.on('update', function () {
            socket.handshake.session.update();
        });
        socket.on('disconnect', function() {
            if (socket.handshake.session != undefined) {
                socket.handshake.session.removeListener('login', socket.loginListener);
                socket.handshake.session.removeListener('logout', socket.logoutListener);
                socket.handshake.session.removeListener('wrongCredentials', socket.wrongCredentialsListener);
            }
        });
    });
}

Auth.prototype.getSession = function(id) {
    return this.sessions[id];
};

Auth.prototype.createSession = function(socket) {
    var newId = new Date().getTime();
    socket.emit('cookie', 'session', newId);
    var session = new Session(newId, this.ldapSession);
    this.sessions[newId] = session;
    return session;
};

Auth.prototype.setupSocket = function(socket, session) {
    socket.loginListener = function() {
        socket.emit('login');
    };
    session.on('login', socket.loginListener);
    socket.logoutListener = function() {
        socket.emit('logout');
    };
    session.on('logout', socket.logoutListener);
    socket.wrongCredentialsListener = function() {
        socket.emit('wrongCredentials');
    };
    session.on('wrongCredentials', socket.wrongCredentialsListener);
    socket.handshake.session = session;
};

module.exports = Auth;
