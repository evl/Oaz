var mongoq = require('mongoq');

exports.configure = function(client, config) {
    if (!config.db) throw new Error('Missing db uri');

    var db = mongoq(config.db);
    db.open(function(err) {
        if (err) throw err;

        var urls = db.collection('urls');

        client.match(/http:\/\/\S+/g, function(from, to, message, matches) {
            var entry = {
                date: new Date(),
                from: from,
                to: to,
                url: matches[0]
            };

            urls.insert(entry, function(err) {
                if (err) console.error('Error storing url:', err.message);
            });
        });
    });
};