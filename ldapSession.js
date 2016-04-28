var ldap = require('ldap-verifyuser');

function LdapSession(options) {
    this.sessions = {};
    this.config = {
        server: 'ldap://' + options.host,
        adrdn: options.adrdn,
        adquery: options.adQuery,
        debug: false
    };
}

LdapSession.prototype = {
    login: function(username, password, callback) {
        callback(true);
        /*ldap.verifyUser(this.config, username, password, function(e, data) {
            callback(data.valid);
        });*/
    }
};

module.exports = LdapSession;
