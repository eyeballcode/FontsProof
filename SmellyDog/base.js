const http = require('http'),
      fs = require('fs');

var mode = 'TESTING';
var serverName = 'SmellyDog';
var file = __dirname + '/index.html';
var serverLocations = JSON.parse(fs.readFileSync(__dirname + '/../server-locations.json'))[mode.toLowerCase()];
var myServer = serverLocations[serverName.toLowerCase()].toLowerCase()
var fileData = fs.readFileSync(file).toString().replace('${serverLocation}', serverLocations['fonts']);

http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'plain'});
    res.end(fileData);
}).listen(myServer.match(/\d+$/) ? myServer.match(/\d+$/)[0] : 80);
