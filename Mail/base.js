const http = require('http'),
MongoClient = require('mongodb'),
url = require('url'),
querystring = require('querystring'),
util = require('./util');

var routes = {
    '/': require('./routes/index'),
    '/google-signin': require('./routes/google-signin'),
    '/google-signin-redir': require('./routes/google-signin-redir'),
    '/signedin': require('./routes/signedin')
}

const port = true ? 8001 : 80;

MongoClient.connect('mongodb://localhost:27017/Mail', (err, db) => {
    if (err) throw err;
    global.mongo = {};
    mongo.users = db.collection('users');
    mongo.sessions = db.collection('session');
    mongo.db = db;
    createMainServer();
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
