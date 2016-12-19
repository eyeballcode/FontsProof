const http = require('http'),
MongoClient = require('mongodb'),
url = require('url'),
querystring = require('querystring'),
util = require('./util');

var routes = {
    '/evil-tracker': require('./routes/evil-tracker'),
    '/styles.css': require('./routes/styles')
}

var port, linkingPort;
if (false) linkingPort = 8003, port = linkingPort - 1; else linkingPort = 81, port = linkingPort - 1;

MongoClient.connect('mongodb://localhost:27017/Fonts-Proof', (err, db) => {
    if (err) throw err;
    global.mongo = {};
    mongo.ids = db.collection('ids');
    mongo.signins = db.collection('signins');
    mongo.db = db;
    createMainServer();
    createLinkingServer();
});

function setupUtils(req) {
    req.url = url.parse(req.url);

    req.hasCookies = () => {
        return !!req.headers['cookie'];
    }

    req.cookies = req.hasCookies() ? util.parseCookies(req.headers['cookie']) : {};

    req.query = querystring.parse(req.url.query || '');
}

function createMainServer() {
    http.createServer((req, res) => {
        setupUtils(req);
        var path = req.url.pathname;
        if (routes[path]) {
            routes[path](req, res);
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not Found');
        }
    }).listen(port);
}

function createLinkingServer() {
    http.createServer((req, res) => {
        util.processPost(req, res, (data) => {
            if (data.type = 'user-signup') {
                util.handleSignin(data);
            }
        });
    }).listen(linkingPort);
}
