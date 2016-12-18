var fs = require('fs'),
streamReplace = require('stream-replace'),
util = require('../util');

module.exports = (req, res) => {
    if (!req.cookies.login) {
        res.writeHead(301, {
            'Location': `${util.getMailServer()}/google-signin-redir`
        });
        res.end();
        return;
    }

    mongo.sessions.find({
        login: req.cookies.login
    }).limit(1).next((err, session) => {
        if (!session) {
            res.writeHead(301, {
                'Location': `${util.getMailServer()}/google-signin-redir`
                
            });
            res.end();
            return;
        }
        fs.createReadStream('html/signedin.html')
        .pipe(streamReplace(/\$\{serverLocation}/, util.getFontsServer()))
        .pipe(streamReplace(/\$\{userName}/, session.user.name))
        .pipe(res);
    });
}
