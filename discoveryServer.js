var dgram = require('dgram');

var DiscoveryServer = function(options) {
    this.client = dgram.createSocket('udp4');
    this.serverInfo = options.serverInfo;
    var self = this;
    this.client.bind(options.port, function() {
        self.client.setBroadcast(true);
    });
    this.client.on('message', function(data, info) {
        if (data.toString() == 'openSecurityClient') {
            self.sendServerInfo(info.address, info.port);
        }
    });
};

DiscoveryServer.prototype.sendServerInfo = function(address, port) {
    var message = new Buffer(JSON.stringify(this.serverInfo));
    this.client.send(message, 0, message.length, port, address);
};

module.exports = DiscoveryServer;
