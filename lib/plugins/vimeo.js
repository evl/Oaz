var request = require('request');

exports.configure = function(client) {
    client.match(/vimeo\.com\/(\d+)/g, function(from, to, message, matches) {
        var url = 'http://vimeo.com/api/v2/video/' + matches[1] + '.json';

        request(url, function(err, response, body) {
            try {
                var data = JSON.parse(body);

                if (data) {
                    client.say(to, 'Vimeo'.bold + ': ' + data[0].title);
                }
            } catch (e) {
                console.error('Error parsing Vimeo response:', e.message);
                console.error(body);
            }
        });
    });
};