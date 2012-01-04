var request = require('request');

exports.configure = function(client) {
    client.match(/vimeo\.com\/(\d+)/g, function(from, to, message, matches, meta) {
        var url = 'http://vimeo.com/api/v2/video/' + matches[1] + '.json';

        request(url, function(err, response, body) {
            try {
                var data = JSON.parse(body);

                if (data) {
                    meta.title = data[0].title;

                    client.say(to, 'Vimeo'.bold + ': ' + meta.title);
                }
            } catch (e) {
                console.error('Error parsing Vimeo response:', e.message);
                console.error(body);
            }
        });
    });
};