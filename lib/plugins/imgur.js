var request = require('request');

exports.configure = function(client) {
    client.match(/imgur\.com(?:\/gallery)?\/(\w+)/g, function(from, to, message, matches) {
        var url = 'http://imgur.com/gallery/' + matches[1] + '.json';

        request(url, function(err, response, body) {
            if (response.statusCode == 200) {
                try {
                    var data = JSON.parse(body);
                    var title = data.gallery.image.title;

                    client.say(to, 'Imgur'.bold + ': ' + title);
                } catch (e) {
                    console.error('Error parsing Imgur response:', e.message);
                    console.error(body);
                }
            }
        });
    });
};