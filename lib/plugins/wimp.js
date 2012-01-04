var request = require('request');

exports.configure = function(client) {
    client.match(/wimp\.no\/(artist|album|track)\/\d+/g, function(from, to, message, matches, meta) {
        var url = 'http://' + matches[0];
        var type = matches[1];

        request(url, function(err, response, body) {
            if (response.statusCode == 200) {
                var titleMatches = body.match(/<title>(.+)\s\-\s/);

                if (titleMatches) {
                    meta.title = titleMatches[0];

                    client.say(to, ('WiMP ' + type.substr(0, 1).toUpperCase() + type.substr(1)).bold + ': ' + meta.title);
                }
            }
        });
    });
};