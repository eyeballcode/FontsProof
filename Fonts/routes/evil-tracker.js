const fs = require('fs');

module.exports = (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('html/tracker.html', (err, data) => {
        data = data.toString().split('$');
        res.write(data[0]);
        mongo.ids.find().forEach(user => {
            var userData =
            `<div class='user'>
                <h4>${user.googleAccount || 'Unlinked gooogle'} @ ${user.ipAddress}: ${user.cookies.join(', ')}</h4>
                <ul>
                    ${generateData(user)}
                </ul>
            </div>`;
            res.write(userData);
        }, () => {
            res.end(data[1]);
        });
    });
}

function generateData(user) {
    return user.sites.reduce((acc, site) => {
        return acc + `<ol>${site.url} @ ${new Date(site.time)}</ol>`;
    }, '');
}
