var request = require('request');

exports.configure = function(client) {
    var titlePattern = /<title>([^>]+) on Spotify</;

    var lookupSpotify = function(from, to, message, matches, meta) {
        var url = 'http://' + matches[0];

        request(url, function(err, response, body) {
            if (response.statusCode == 200) {
                var matches;

                if ((matches = titlePattern.exec(body))) {
                    meta.title = matches[1];

                    client.say(to, 'Spotify'.bold + ': ' + meta.title);
                }
            }
        });
    };

    client.match(/open\.spotify\.com\/([^ ]+)/g, lookupSpotify);

    // Spotify URI
    client.match(/spotify:(\w+):(\w+)/g, function(from, to, message, matches, meta) {
        var uri = 'open.spotify.com/' + matches[1] + '/'+ matches[2];

        client.say(to, from + ': That\'s probably supposed to be http://' + uri);

        lookupSpotify(from, to, message, matches, meta);
    });
};