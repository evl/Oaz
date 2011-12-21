var request = require('request');

var ageBonus = {
    0: 2000,
    1: 1750,
    2: 1500,
    4: 1350,
    7: 1200,
    13: 1050,
    20: 900,
    60: 750,
    100: 600,
    200: 450,
    365: 300,
    600: 150
};

var countBonus = {
    0: 4000,
    1: 1750,
    2: 1500,
    3: 1350,
    5: 1200,
    10: 1050,
    15: 900,
    32: 750,
    50: 600,
    75: 450,
    100: 300,
    200: 150
};

var calculateScore = exports.calculateScore = function(date, count) {
    var score = 0;
    var now = new Date();
    var age = now.getTime() - date.getTime();
    var days = Math.round(age / 86400000);

    // Age
    for (var ageThreshold in ageBonus) {
        if (days < ageThreshold) {
            score += ageBonus[ageThreshold];
            break;
        }
    }

    // Score
    for (var countThreshold in countBonus) {
        if (count < countThreshold) {
            score += countBonus[countThreshold];
            break;
        }
    }

    return score;
};

exports.configure = function(client) {
    client.match(/http:\/\/\S+/g, function(from, to, message, matches) {
        var url = 'http://api.tweetmeme.com/url_info.json?url=' + matches[0];

        request(url, function(err, response, body) {
            try {
                var data = JSON.parse(body);
                var story = data.story;

                if (story) {
                    var date = new Date(story.created_at + ' GMT');
                    var count = story.url_count;
                    var score = calculateScore(date, count);

                    console.log('Calculated score:', score, 'for url: ' + matches[0]);

                    var message;

                    if (score < 1500) {
                        var severity = Math.ceil(Math.abs(score - 1500) / 300);
                        var meter = 'O' + 'ä'.repeat(severity) + 'z';

                        message = from + ': ' + meter.bold;
                    }

                    if (message) {
                        client.say(to, message);
                    }
                } else {
                    console.error('TweetMeme error:', data.comment);
                }
            } catch (e) {
                console.error('Error parsing TweetMeme response:', e.message);
                console.error(body);
            }
        });
    });
};