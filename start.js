var net = require('net');

var client = new net.Socket();
client.connect(2025, '127.0.0.1', function() {
	console.log('play ' + process.argv[2]);
	client.write('play ' + (process.argv[2] || ''));
	client.destroy();
    process.kill(0)
});