var request = require('request');

exports.configure = function(client) {
    client.match(/mixcloud\.com[\/\-\w]+/g, function(from, to, message, matches) {
        var url = 'http://api.' + matches[0];

        request(url, function(err, response, body) {
            if (response.statusCode == 200) {
                try {
                    var data = JSON.parse(body);
                    var title = data.name;

                    client.say(to, 'Mixcloud'.bold + ': ' + title);
                } catch (e) {
                    console.error('Error parsing Mixcloud response:', e.message);
                    console.error(body);
                }
            }
        });
    });
};