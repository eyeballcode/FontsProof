const crypto = require('crypto');

function genCookie() {
    return crypto.randomBytes(32).toString('hex');
}

function parseCookies(cookies) {
    return cookies.split(/([^=]+=[^;]+);/).filter(Boolean).reduce((a, e) => {var p=e.split(/=/);a[p[0]]=p[1];return a;}, {});
}

function findIPAddress(req) {
    return req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
}

function logUser(req, headers) {
    var userSearch = {
        cookies: {
            $in: [req.cookies.id]
        }
    };
    mongo.ids.find(userSearch).limit(1).next((err, user) => {
        if (!user) {
            setupLogger(req, headers, logUser);
            return;
        }
        mongo.ids.findOneAndUpdate(userSearch, {
            $push: {
                sites: generateSite(req)
            }
        });
    });
}

function generateSite(req) {
    return {
        url: req.headers.referer || 'unable to determine referrer',
        time: +new Date()
    }
}

function setupLogger(req, headers, callback) {
    var cookie = genCookie();
    console.log('New User ' + cookie);
    req.cookies.id = cookie;
    headers['Set-Cookie'] = `id=${cookie}; httponly;`;
    mongo.ids.insert({
        googleAccount: null,
        ipAddress: findIPAddress(req),
        cookies: [cookie],
        sites: [
            generateSite(req)
        ]
    }, callback || ()=>{});
}

function createHeader(req, contentType) {
    var headers = {'Content-Type': contentType};
    if (!(req.hasCookies() && req.cookies.id)) setupLogger(req, headers);
    logUser(req, headers);

    return headers;
}

module.exports = {
    genCookie: genCookie,
    parseCookies: parseCookies,
    createHeader: createHeader,
    findIPAddress: findIPAddress
}
