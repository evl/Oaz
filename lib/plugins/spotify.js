var request = require('request');

exports.configure = function(client) {
    var matchSpotify = function(from, to, message, matches, meta) {
        var url = 'http://ws.spotify.com/lookup/1/.json?uri=http://' + matches[0];

        request(url, function(err, response, body) {
            if (response.statusCode == 200) {
                try {
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

                    meta.title = title;

                    client.say(to, ('Spotify ' + type).bold + ': ' + title);
                } catch (e) {
                    console.error('Error parsing Spotify response:', e.message);
                    console.error(body);
                }
            }
        });
    };

    client.match(/open\.spotify\.com\/[\w\/]+/g, matchSpotify);

    // Spotify URI
    client.match(/spotify:(\w+):(\w+)/g, function(from, to, message, matches, meta) {
        var type = matches[1];
        var id = matches[2];
        var uri = 'open.spotify.com/' + type + '/'+ id;

        client.say(to, from + ': That\'s probably supposed to be http://' + uri);

        matchSpotify(from, to, message, [uri], meta);
    });
};