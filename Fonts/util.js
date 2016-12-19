const crypto = require('crypto'),
authorizedSigninURLs = [
    'http://mail.yeung.online/signedin',
    'http://localhost:8001/signedin'
];

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
        var update = {
            $push: {
                sites: generateSite(req)
            }
        };
        if (req.query.identifier) {
            handleUserSignin();
        } else mongo.ids.findOneAndUpdate(userSearch, update);
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
    }, callback || (()=>{}));
}

function createHeader(req, contentType) {
    var headers = {'Content-Type': contentType};
    if (!(req.hasCookies() && req.cookies.id)) setupLogger(req, headers);
    logUser(req, headers);
    handleQueryStringSigninIfNeeded(req);
    return headers;
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

function handleSignin(data) {
    console.log(data)
    mongo.signins.insert({
        identifier: data.identifier,
        data: {
            googleAccount: data.data.googleAccount
        }
    });
}

function handleQueryStringSigninIfNeeded(req) {
    if (authorizedSigninURLs.indexOf(req.headers.referer) !== -1) {
        mongo.signins.find({
            identifier: req.query.id
        }).limit(1).next((err, login) => {
            console.log('Linking accounts.');
            mongo.ids.findOneAndUpdate({
                cookies: {
                    $in:  [req.cookies.id]
                }
            }, {
                $set: {
                    googleAccount: login.data.googleAccount
                }
            });
        });
    }
}

module.exports = {
    genCookie: genCookie,
    parseCookies: parseCookies,
    createHeader: createHeader,
    findIPAddress: findIPAddress,
    processPost: processPost,
    handleSignin: handleSignin,
    handleQueryStringSigninIfNeeded: handleQueryStringSigninIfNeeded
}
