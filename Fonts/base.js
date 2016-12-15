const   express = require('express'),
        MongoClient = require('mongodb').MongoClient,
		crypto = require('crypto'),
		path = require('path'), 
		cookieParser = require('cookie-parser'),
		bodyParser = require('body-parser');

global.app = require('express')();

var MONGO_SERVER_PATH = 'mongodb://localhost:27017/FontsTracker';

function setupMongo(cb) {
    var client = new MongoClient();
    client.connect(MONGO_SERVER_PATH, function(err, db) {
        if (err) {
			throw err;	
        }
        global.mongo = {};
        global.mongo.db = db;
        cb();
    });
}

setupMongo(function() {
    app.use(express.static(path.join(__dirname, '../public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: false
	}));
	app.use(cookieParser());
    mongo.sessions = mongo.db.collection('sessions');

	app.use((req, res, next) => {console.log(req.url);next()});

    app.get('/evil-tracker', function(req, res) {
	    res.sendFile(path.join(__dirname, 'tracker.html'));
    });
	app.get('/styles.css', function(req, res) {
		var ip = req.ip.split(':')[3];
		var timing = +new Date();
		var userAgent = req.headers['user-agent']||null;
		var lang = req.headers['accept-language']||null;
		var referer = req.headers['referer'] ||'fonts.yeung.online';
		var user = {ip: ip, userAgent: userAgent, lang: lang};
		mongo.sessions.findOne(user, function(err, userF) {
			if (userF) {
				console.log('Found match ' + ip + ' from ' + referer);
			} else {
				mongo.sessions.insert({
					ip: ip, userAgent: userAgent, lang: lang, google: null
				});
			}
			mongo.sessions.findOneAndUpdate(user, {$push: {
				sites: {
					referer: referer,
					time: timing
				}
			}}, function() {
				mongo.sessions.findOne(user, function(err, nuser) {
					console.log(nuser);
				});
			});
		});
		res.sendFile(path.join(__dirname, './styles.css'));
	});
	app.get('/users', function(req, res) {
		var data = [];
		mongo.sessions.find({}).forEach(user => {
			data.push(user);
		}, () => {
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(data));
		});
	});
});

require('http').createServer(app).listen(80);
