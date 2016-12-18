const fs = require('fs'),
streamReplace = require('stream-replace');

const serverLocation = true ? 'http://localhost:8002' : 'http://fonts.yeung.online'

module.exports = (req, res) => {
    fs.createReadStream('html/home.html').pipe(streamReplace(/\$\{serverLocation}/, serverLocation)).pipe(res);
}
