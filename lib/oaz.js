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
        plugins: ['youtube', 'vimeo', 'spotify', 'wimp', 'imgur', 'urldb', 'oaz'],
        db: 'oaz'
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
            var meta = {};

            while ((matches = pattern.exec(message)) !== null) {
                if (callback(from, to, message, matches, meta) === false) {
                    break;
                }
            }
        });
    };

    client.on('error', function(message) {
        console.error(message);
    });

    for (var i = 0, l = config.plugins.length; i < l; ++i) {
        var name = config.plugins[i];

        try {
            var plugin = require('./plugins/' + name);
            plugin.configure(client, config);
        } catch (e) {
            console.error('Error loading plugin', file + ':' + e.message);
        }
    }

    client.connect();
};