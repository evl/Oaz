var irc = require('irc'),
    fs = require('fs'),
    utils = require('./utils');

exports.getConfig = function() {
    var config = {
        server: 'se.quakenet.org',
        nick: 'Jaysus',
        userName: 'jaysus',
        realName: 'Oäz unto others as you would have them oäz unto you.',
        channels: ['#jaysus'],
        plugins: ['youtube', 'vimeo', 'spotify', 'wimp', 'imgur']
    };

    try {
        require('../config')(config);
    } catch (e) {
    }

    return config;
};

exports.start = function(config) {
    config.autoConnect = false;

    var client = new irc.Client(config.server, config.nick, config);
    client.match = function(pattern, callback) {
        client.on('message', function(from, to, message) {
            var matches;

            while ((matches = pattern.exec(message)) !== null) {
                callback(from, to, message, matches);
            }
        });
    };

    client.on('error', function(message) {
        console.error(message);
    });

    var pluginsDir = __dirname + '/plugins';
    fs.readdir(pluginsDir, function(err, files) {
        if (err) throw err;

        files.forEach(function(file) {
            try {
                var plugin = require(pluginsDir + '/' + file);
                plugin.configure(client, config);
            } catch (e) {
                console.error('Error loading plugin', file + ':' + e.message);
            }
        });
    });

    client.connect();
};