const crypto = require('crypto'),
request = require('request');

function parseCookies(cookies) {
    return cookies.split(/([^=]+=[^;]+);/).filter(Boolean).reduce((a, e) => {var p=e.split(/=/);a[p[0].trim()]=p[1];return a;}, {});
}

function generateOAuthState() {
    return crypto.randomBytes(16).toString('hex');
}

function generateCookie(user) {
    var userNoID = user;
    delete user._id;
    var cookie = crypto.randomBytes(32).toString('hex');
    mongo.sessions.insert({
        login: cookie,
        user: userNoID
    });
    return cookie;
}

function processPost(request, response, callback) {
    var queryData = '';
    if(typeof callback !== 'function') return null;

    if(request.method === 'POST') {
        request.on('data', (data) => {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', () => {
            callback(JSON.parse(queryData));
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end('Use POST, buddy.');
    }
}

function getFontsServer() {
    return true ? 'http://localhost:8002' : 'http://fonts.yeung.online'
}

function getMailServer() {
    return true ? 'http://localhost:8001' : 'http://mail.yeung.online'
}

function getFontsAuthServer() {
    return true ? 'http://localhost:8003' : 'http://fonts.yeung.online:81'
}

function sendUserSignin(account, state) {
    request.post({
        url: `${getFontsAuthServer()}`,
        body: JSON.stringify({
            type: 'user-signin',
            identifier: state,
            data: {
                googleAccount: account.name
            }
        })
    });
}

module.exports = {
    parseCookies: parseCookies,
    processPost: processPost,
    generateOAuthState: generateOAuthState,
    generateCookie: generateCookie,
    getMailServer: getMailServer,
    getFontsServer: getFontsServer,
    sendUserSignin: sendUserSignin
}
