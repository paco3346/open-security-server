var pg = require('pg');

function BackboneSyncWebSockets(options) {
    this.io = options.io;
    this.auth = options.auth;
    this.sessions = {};
    var self = this;
    var port = options.port ? options.port : 5432;
    this.schema = options.schema;
    this.conString = 'postgresql://' + options.username + ':' + options.password + '@' + options.server + ':' + port + '/' + options.database;
    console.log(this.conString);
    this.io.of('/db').on('connection', function(socket) {
        socket.on('cookie', function(cookie) {
            socket.handshake.session = self.auth.getSession(cookie);
        });
        socket.on('create', function(params) {
            if (socket.handshake.session.isAuthenticated()) {
                self.create(socket, params);
            }
        });
        socket.on('read', function(params) {
            if (socket.handshake.session.isAuthenticated()) {
                self.read(socket, params);
            }
        });
        socket.on('update', function(params) {
            if (socket.handshake.session.isAuthenticated()) {
                self.update(socket, params);
            }
        });
        socket.on('delete', function(params) {
            if (socket.handshake.session.isAuthenticated()) {
                self.delete(socket, params);
            }
        });
    });
}

BackboneSyncWebSockets.prototype.create = function(socket, params) {
    return this.sessions[id];
};

BackboneSyncWebSockets.prototype.read = function(socket, params) {
    var self = this;
    pg.connect(self.conString, function(err, client, done) {
        if (err) {
            console.log(err);
            return;
        }

        var query = 'SELECT id, data, enabled FROM ' + self.schema + '.' + params.model;

        if (params.id) {
            query+= ' WHERE id = ' + params.id;
        }

        if (params.limit) {
            query += ' LIMIT ' + params.limit;
        }

        client.query(query, function(err, result) {
            done();
            if (err) {
                console.log(err);
            } else {
                var retRows = [];
                for (var index in result.rows) {
                    var retRow  = {
                        id: result.rows[index].id,
                        enabled: result.rows[index].enabled
                    };
                    for (var attrname in result.rows[index].data) {
                        retRow[attrname] = result.rows[index].data[attrname];
                    }
                    retRows.push(retRow);
                }
                var data = params.returnCollection ? retRows : retRows[0];
                socket.emit('result', {uid: params.uid, data: data});
            }
        });
    });
};

BackboneSyncWebSockets.prototype.update = function(socket, params) {
    return this.sessions[id];
};

BackboneSyncWebSockets.prototype.delete = function(socket, params) {
    return this.sessions[id];
};

module.exports = BackboneSyncWebSockets;
