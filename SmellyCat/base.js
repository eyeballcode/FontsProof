const http = require('http'),
      fs = require('fs'),
      streamReplace = require('stream-replace');

var serverLocation = false ? 'http://localhost:8002' : 'http://fonts.yeung.online'
var port = false ? 8000 : 80

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'plain'});
    fs.createReadStream('index.html').pipe(streamReplace(/\$\{serverLocation}/, serverLocation)).pipe(res);
}).listen(port);
