const fs = require('fs'),
googleData = JSON.parse(fs.readFileSync('google-data.json')),
util = require('../util'),
OAuthServer = require('../OAuthServer'),
request = require('request');

module.exports = (req, res) => {
    new OAuthServer(req, res, 'google',
    'https://www.googleapis.com/oauth2/v4/token', googleData.clientID, googleData.clientSecret,
    `${util.getMailServer()}/google-signin`, (accessToken) => {
        request(`https://www.googleapis.com/plus/v1/people/me/openIdConnect?access_token=${accessToken}`, (err, resp, body) => {
            var userData = JSON.parse(body);
            util.sendUserSignin(userData);
            var userQuery = {name: userData.name, email: userData.email};
            mongo.users.find(userQuery).limit(1).next(user => {
                if (!user) {
                    user = {
                        name: userData.name,
                        email: userData.email
                    }
                    var loginSession = util.generateCookie(user);
                    mongo.users.insert(user, err => {
                        res.writeHead(302, {
                            'Set-Cookie': `login=${loginSession}`,
                            'Location': `${util.getMailServer()}/signedin`
                        });
                        res.end();
                    });
                }
            });
        });
    });
}
