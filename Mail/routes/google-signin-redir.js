const OAuthServer = require('../OAuthServer'),
util = require('../util'),
fs = require('fs'),
googleData = JSON.parse(fs.readFileSync('google-data.json'));

const serverLocation = false ? 'http://localhost:8001' : 'http://mail.yeung.online'

module.exports = (req, res) => {
    var state = util.generateOAuthState();
    var url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleData.clientID}&redirect_uri=${serverLocation}/google-signin&scope=profile email openid&state=${state}`;
    OAuthServer.addState('google', state);
    res.writeHead(307, {'Location': url});
    res.end();
}
