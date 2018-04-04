const config = require('./config.json');
const net = require('net')
const { StringDecoder } = require('string_decoder');
const FFmpeg = require('./ffmpeg');
const warnings = require('./warnings');

const decoder = new StringDecoder('utf8');
const server = new net.Server(connectionListener)

let ffplay;
let stream;
let retries = 0;
let timeOut;
let lastDate = Date.now();

function connectionListener(socket) {
    socket.on('data', (data) => {
        recv = decoder.write(data).trim();
        recv = recv.split(' ');

        console.log('received command ' + recv)

        if (recv[0].toLowerCase() === 'play') {
            if ((recv[1] && recv[1] == stream) || (!recv[1] && stream == config.fallback))
                return;

            if (ffplay) {
                ffplay.close();
            }
            stream = recv[1] || config.fallback
            restart(0)
        } else if (recv[0].toLowerCase() === 'stop') {
            stream = undefined
            if (ffplay)
                ffplay.close();
        }
    })
}

server.listen(2025, '127.0.0.1');

function restart (re) {
    ffplay = new FFmpeg({ stream, close, stderr });
    lastDate = Date.now()
    retries = re;
}

function close () {
    console.log('stream was closed unintentionally');

    if (retries === 0)
        warnings.slackMessage('Stream was closed unintentionally, restarting...');

    if (retries == 3 && stream != config.fallback) {
        warnings.slackMessage(`Stream (${stream}) could not be started after 3 times. Using fall back: ${config.fallback}`);
        stream = config.fallback
        setTimeout(() => restart(1), 20000) // 20s
    } else if (retries > 3) {
        warnings.slackMessage('Fallback could not be started after 3 times. Manual interaction required.');
    } else {
        setTimeout(() => restart(retries++), 20000) // 20s
    }

    if (timeOut)
        clearTimeout(timeOut);
    timeOut = setTimeout(resetRetries, 60000); //80s
}

function resetRetries() {
    retries = 0;
}

function stderr (data) {
    let recv = decoder.write(data).trim();
    let i = recv.indexOf('aq=')
    let dataRate = Number(recv.substr(i+3, 5).trim())

    if (dataRate > 0) {
        lastDate = Date.now()
    } else if (Date.now() - lastDate > 30000 ) { // 30s
        ffplay.close()
        close()
    }
}
