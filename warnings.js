const config = require('./config.json');
const Slack = require('slack-node');
const os = require('os');

const warnings = {};
const slack = new Slack();
if (config.errorWebhook)
    slack.setWebhook(config.errorWebhook);

warnings.slackMessage = function (message, cb) {
    if (!config.errorWebhook)
        return;

    slack.webhook({
        channel: "#techniek",
        username: 'Audio Player',
        text: os.hostname+": "+message
    }, function (err) {
        if (cb && typeof cb == "function") {
            cb();
        }
    });
}

module.exports = warnings;