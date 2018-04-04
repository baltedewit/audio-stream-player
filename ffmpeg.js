const { spawn } = require('child_process');
const configFile = require('./config.json')

class FfmpegInstance {
    constructor (config) {
        this.noRestart = false;
        this.config = config;
        console.log(this.config)

        this.cmd = spawn('ffplay', [
            '-reconnect', 1,
            config.stream,
            '-af', 'loudnorm=i='+configFile.loudness,
            '-nodisp',
            '-autoexit',
            '-hide_banner',
            '-volume', '100',
            '-stats'
        ])
        
        if (config.stdout)
            this.cmd.stdout.on('data', config.stdout);
        
        if (config.stderr)
            this.cmd.stderr.on('data', config.stderr);
        
        if (config.close)
            this.cmd.on('close', () => this.closed());

        // this.cmd.stderr.pipe(process.stderr)
    }

    close () {
        console.log('closing stream.')
        this.noRestart = true;
        this.cmd.kill();
    }

    closed () {
        if (!this.noRestart) {
            this.config.close()
        }
    }
}

module.exports = FfmpegInstance