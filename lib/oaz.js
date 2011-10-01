var irc = require('irc'),
    request = require('request'),
    crypto = require('crypto'),
    path = require('path'),
    url = require('url'),
    utils = require('./utils'),
    store = require('./store');

var oaz = exports;

oaz.getConfig = function() {
    var config = {
        db: '../oaz.sqlite3',
        server: 'se.quakenet.org',
        nick: 'Jaysus',
        userName: 'jaysus',
        realName: 'Oäz unto others as you would have them oäz unto you.',
        channels: ['#jaysus']
    };

    try {
        require('../config')(config);
    } catch (e) {
    }

    return config;
};

oaz.start = function(config) {
    var db = new store.Store(config.db);
    db.open(function(err) {
        if (err) return console.error(err);

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

        // YouTube
        client.match(/youtube[^=]+=(\w+)/g, function(from, to, message, matches) {
            var id = matches[1];
            var url = 'http://gdata.youtube.com/feeds/api/videos/' + id + '?alt=json';

            request(url, function(err, response, body) {
                var data = JSON.parse(body);
                var entry = data.entry;

                if (entry) {
                    client.say(to, 'YouTube'.bold + ': ' + entry.title.$t);
                }
            });
        });

        // Vimeo
        client.match(/vimeo\.com\/(\d+)/g, function(from, to, message, matches) {
            var id = matches[1];
            var url = 'http://vimeo.com/api/v2/video/' + id + '.json';

            request(url, function(err, response, body) {
                var data = JSON.parse(body);

                if (data) {
                    client.say(to, 'Vimeo'.bold + ': ' + data[0].title);
                }
            });
        });

        // Spotify
        var matchSpotify = function(from, to, message, matches) {
            var uri = 'http://' + matches[0];
            var url = 'http://ws.spotify.com/lookup/1/.json?uri=http://' + uri;

            request(url, function(err, response, body) {
                if (response.statusCode == 200) {
                    var data = JSON.parse(body);
                    var type;
                    var title;

                    switch (data.info.type) {
                        case 'artist':
                            type = 'Artist';
                            title = data.artist.name;
                            break;
                        case 'album':
                            type = 'Album';
                            title = data.album.artist + ' - ' + data.album.name;
                            break;
                        case 'track':
                            type = 'Track';
                            title = data.track.artists[0].name + ' - ' + data.track.name;
                            break;
                    }

                    client.say(to, ('Spotify ' + type).bold + ': ' + title);
                }
            });
        };

        client.match(/open\.spotify\.com\/[\w\/]+/g, matchSpotify);

        // Spotify URI
        client.match(/spotify:(\w+):(\w+)/g, function(from, to, message, matches) {
            var type = matches[1];
            var id = matches[2];
            var uri = 'open.spotify.com/' + type + '/'+ id;

            client.say(to, from + ': That\'s probably supposed to be http://' + uri);

            matchSpotify(from, to, message, [uri]);
        });

        // WiMP
        client.match(/wimp\.no\/(artist|album|track)\/\d+/g, function(from, to, message, matches) {
            var url = 'http://' + matches[0];
            var type = matches[1];

            request(url, function(err, response, body) {
                if (response.statusCode == 200) {
                    var titleMatches = body.match(/<title>(.+)\s\-\s/);

                    if (titleMatches) {
                        var title = titleMatches[0];
                        
                        client.say(to, ('WiMP ' + type.substr(0, 1).toUpperCase() + type.substr(1)).bold + ': ' + title);
                    }
                }
            });
        });

        // Imgur
        client.match(/imgur\.com\/gallery\/\w+/g, function(from, to, message, matches) {
            var url = 'http://' + matches[0] + '.json';

            console.log(url);

            request(url, function(err, response, body) {
                if (response.statusCode == 200) {
                    var data = JSON.parse(body);
                    var title = data.gallery.image.title;

                    client.say(to, 'Imgur'.bold + ': ' + title);
                }
            });
        });
    });
};