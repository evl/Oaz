var request = require('request');

exports.configure = function(client) {
    client.match(/youtube.*v[=\/]([\w\-]+)/g, function(from, to, message, matches, meta) {
        var url = 'http://gdata.youtube.com/feeds/api/videos/' + matches[1] + '?alt=json';

        request(url, function(err, response, body) {
            try {
                var data = JSON.parse(body);
                var entry = data.entry;

                if (entry) {
                    meta.title = entry.title.$t;

                    client.say(to, 'YouTube'.bold + ': ' + meta.title);
                }
            } catch (e) {
                console.error('Error parsing YouTube response:', e.message);
                console.error(body);
            }
        });
    });
};