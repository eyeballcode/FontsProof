const fs = require('fs'),
util = require('../util');

module.exports = (req, res) => {
    res.writeHead(200, util.createHeader(req, 'text/css'));
    fs.createReadStream('css/styles.css').pipe(res);
}
