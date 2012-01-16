var request = require('request');

exports.configure = function(client) {
    client.match(/wimp\.no\/\w+\/\d+/g, function(from, to, message, matches, meta) {
        var url = 'http://' + matches[0];

        request(url, function(err, response, body) {
            if (response.statusCode == 200) {
                var titleMatches = body.match(/<title>(.+)\s\-\s/);

                if (titleMatches) {
                    meta.title = titleMatches[0];

                    client.say(to, 'WiMP'.bold + ': ' + meta.title);
                }
            }
        });
    });
};