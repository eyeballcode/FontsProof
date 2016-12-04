const http = require('http'),
      fs = require('fs'),
      MongoClient = require('mongodb'),
      crypto = require('crypto'),
      url = require('url'),
	  qs = require('querystring');

var mode = 'TESTING';
var serverName = 'Fonts';
var serverLocations = JSON.parse(fs.readFileSync(__dirname + '/../server-locations.json'))[mode.toLowerCase()];
var myServer = serverLocations[serverName.toLowerCase()].toLowerCase();
var styleData = fs.readFileSync(__dirname + '/styles.css');
var trackerData = fs.readFileSync(__dirname + '/tracker.html').toString().replace('${serverLocation}', myServer);

function genCookie() {
    return crypto.randomBytes(32).toString('hex');
}

function parseCookies(cookies) {
    return cookies.split(/([^=]+=[^;]+);/).filter(Boolean).reduce((a, e) => {var p=e.split(/=/);a[p[0]]=p[1];return a;}, {});
}

function getCookieHeader(req) {
    var referer = url.parse(req.headers.referer || myServer + req.url); // Spelling??
    var cookies = parseCookies(req.headers.cookie || '');  
    var id = cookies.id;
    var val = {};

    if (!id) { // ID not set
        id = genCookie();
        val['Set-Cookie'] = 'id=' + id;
	    console.log('New session with id ' + id);
        ids.insert({
            id: id,
            sites: [],
            google: null
        });
    }
	if (referer.pathname !== '/evil-tracker' && referer.host !== myServer)
    	ids.findOneAndUpdate({id: id}, {
			$push: {
				sites: {
					host: referer.host,
					page: referer.pathname,
					time: +new Date()
				}
			}
    	});
    return val;
}

MongoClient.connect('mongodb://localhost:27017/Fonts-Proof', (err, db) => {
    if (err) throw err;
    console.log('Connected to MongoDB');
    global.ids = db.collection('ids');
    http.createServer((req, res) => {
		var header = getCookieHeader(req);
		var u = url.parse(req.url);
		if (u.pathname === '/styles.css') {
			header['Content-Type'] = 'text/css';
			res.writeHead(200, header);
			res.end(styleData);
		} else if (u.pathname === '/hey') {
			var name = qs.parse(u.query).gmail;
			var cookie = parseCookies(req.headers.cookie).id;
			ids.findOne({id: cookie}, (err, user) => {
				ids.findOneAndUpdate(user, {$set: {google: name}});
			});
		} else if (u.pathname === '/evil-tracker') {
			header['Content-Type'] = 'text/html';
			res.writeHead(200, header);
			res.end(trackerData);
        } else if (u.pathname === '/users') {
			var data = [];
			header['Content-Type'] = 'application/json';
			res.writeHead(200, header);
			ids.find({}).forEach((user) => {
				data.push(user);
			}, () => {
				res.end(JSON.stringify(data));
			});
		} else {
			header['Content-Type'] = 'text/plain';
			res.writeHead(404, header);
			res.end('Wot');
		}
    }).listen(myServer.match(/\d+$/) ? myServer.match(/\d+$/)[0] : 80);
});
