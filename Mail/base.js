const http = require('http'),
      fs = require('fs'),
	  url = require('url'),
	  qs = require('querystring'),
	  request = require('request'),
	  MongoClient = require('mongodb'),
	  crypto = require('crypto');

var mode = 'PRODUCTION';
var serverName = 'Mail';
var serverLocations = JSON.parse(fs.readFileSync(__dirname + '/../server-locations.json'))[mode.toLowerCase()];
var fonts = serverLocations['fonts'];
var myServer = serverLocations[serverName.toLowerCase()].toLowerCase();
var googleData = JSON.parse(fs.readFileSync('./google-data.json'));
var signinData = fs.readFileSync(__dirname + '/signin.html').toString().replace(/\${serverLocation}/g, fonts);
var homeData = fs.readFileSync(__dirname + '/home.html').toString().replace('${serverLocation}', fonts).replace('${googleClientID}', googleData.clientID);

function genCookie() {
    return crypto.randomBytes(32).toString('hex');
}

function parseCookies(cookies) {
    return cookies.split(/([^=]+=[^;]+);/).filter(Boolean).reduce((a, e) => {var p=e.split(/=/);a[p[0].trim()]=p[1].trim();return a;}, {});
}

MongoClient.connect('mongodb://fonts.yeung.online/FontsTracker', (err, db) => {
	if (err) throw err;
	console.log('Connected to Mongo');
	var sessions = db.collection('sessions');
	var users = db.collection('users');
	http.createServer((req, res) => {
		var u = url.parse(req.url);
		var ip = (req.connection.remoteAddress || 
		 req.socket.remoteAddress ||
		 req.connection.socket.remoteAddress).split(':')[3];
		var lang = req.headers['accept-language']||null;
		var userAgent = req.headers['user-agent']||null;
		
		var user = {ip: ip, lang: lang, userAgent: userAgent};
		
		if (u.pathname === '/') {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(homeData);
		} else if (u.pathname === '/signedin') {
			var code = qs.parse(u.query).code;
			if (!code) {
				res.writeHead(400, {'Content-Type': 'text/plain'});
				res.end('No code!');
				res.end();
				return;
			}
			request.post({
			    url: 'https://www.googleapis.com/oauth2/v4/token',
			    form: {
				code: code,
				client_id: googleData.clientID,
				client_secret: googleData.clientSecret,
				redirect_uri: 'http://mail.yeung.online/signedin',
				grant_type: 'authorization_code'
			    }
    		}, function(err, resp, body) {
        		var data = JSON.parse(body);
        		var accessToken = data.access_token;
        		request('https://www.googleapis.com/plus/v1/people/me/openIdConnect?access_token=' + accessToken, function(err, resp, body) {
            		var userData = JSON.parse(body);
					var cookieName = genCookie();
					users.insert({
						cookie: cookieName,
						data: userData
					}, function() {
						sessions.findOne(user, function(err, userF) {
							console.log(userF);
							var userName = userData.name;
							sessions.findOneAndUpdate(user, {$set: {google: userName}});
							res.writeHead(307, {
								'Location': '/hi',
								'Set-Cookie': 'login=' + cookieName
							});
							res.end();
						});
					});
				});
			});
		} else if (u.pathname === '/hi') {
			var cookies = parseCookies(req.headers.cookie || '');
			var login = cookies.login;
			if (!login) {
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.end('Wot');
			}
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.end(signinData);
		} else {
			res.writeHead(404, {'Content-Type': 'text/plain'});
			res.end('Wot');
		}
	}).listen(myServer.match(/\d+$/) ? myServer.match(/\d+$/)[0] : 80);
});
