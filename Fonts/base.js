const http = require('http'),
MongoClient = require('mongodb'),
url = require('url'),
util = require('./util');

var routes = {
    '/evil-tracker': require('./routes/evil-tracker'),
    '/styles.css': require('./routes/styles')
}

var port;
if (true) port = 8002; else port = 80;

MongoClient.connect('mongodb://localhost:27017/Fonts-Proof', (err, db) => {
    if (err) throw err;
    global.mongo = {};
    mongo.ids = db.collection('ids');
    mongo.db = db;
    createServer();
});

function setupUtils(req) {
    req.url = url.parse(req.url);

    req.hasCookies = () => {
        return !!req.headers['cookie'];
    }

    req.cookies = req.hasCookies() ? util.parseCookies(req.headers['cookie']) : {};
}

function createServer() {
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
