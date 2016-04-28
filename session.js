var EventEmitter = require('events').EventEmitter;

function Session(id, ldapSession) {
    this.ldapSession = ldapSession;
    this.id = id;
    this.state = 0;
}

Session.prototype = {
    __proto__: EventEmitter.prototype,
    login: function(data) {
        this.ldapSession.login(data.username, data.password, function(valid) {
            if (valid) {
                console.log('logged in');
                this.state = 1;
                this.update();
            } else {
                this.state = 3;
                this.update();
            }
        }.bind(this));
    },
    logout: function() {
        this.state = 0;
        this.update();
    },
    update: function() {
        if (this.state == 1) {
            this.emit('login');
        } else if (this.state == 3) {
            this.emit('wrongCredentials');
            this.state = 0;
        } else {
            this.emit('logout');
        }
    },
    isAuthenticated: function() {
        return this.state == 1;
    }
};

module.exports = Session;
