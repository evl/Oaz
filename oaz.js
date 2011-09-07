var jerk = require('jerk'),
	request = require('request'),
	crypto = require('crypto'),
	url = require('url'),
	store = require('./lib/store'),
	utils = require('./lib/utils');

var options = {
	server: 'se.quakenet.org',
	encoding: 'utf8',
	log: true,
	nick: 'Jaysus',
	channels: ['#jaysus'],
	user: {
		username: 'jaysus',
		realname: '“Oäz unto others as you would have them oäz unto you.”'
	}
};

try {
	require('./config')(options);
} catch (e) {
}

var bold = function(value) {
	return String.fromCharCode(2) + value + String.fromCharCode(15);
};

var strip = function(value) {
	return value.replace(/[\u0002\u0003\u000f\u00016\u0001f]/g, '');
};

store('oaz.sqlite3', function(err, db) {
	jerk(function(bot) {
		// Oäz
		bot.watch_for(/http:\/\/\S+/, function(message) {
			var uri = url.parse(message.match_data[0]);
			var options = {uri: uri, method: 'HEAD'};

			request(options, function(err, response, body) {
				var key = uri.href;

				if (!err) {
					var entry = {user: message.user, time: (new Date()).toString()};

					db.get(key, function(err, link) {
						link = link || {entries: []};
						link.entries.push(entry);

						db.set(key, link, function(err) {
							console.log(err ? 'Failed to store' : 'Successfully stored', key);
						});

						// Store a reference to the last link that was posted
						db.set('lastLink', key);
					});
				} else {
					console.log('Couldn\'t resolve:', key);
				}
			});
		});

		/*
		bot.watch_for(/^[oO]+[äÄ]+[zZ]+/, function(message) {
			// Fetch the last link
			db.get('lastLink', function(err, key) {
				if (key) {
					// Get the link
					db.get(key, function(err, link) {
						if (link) {
							// Oäz that shit!
							var count = link.entries.length
							var entry = link.entries[count - 1]

							if (!entry.processed) {
								entry.processed = true

								db.set(key, link, function(err) {
									console.log(err ? 'Failed to update' : 'Successfully updated', key)

									var age = 'O{0}z!'.format('ä'.repeat(count))
									var result = '{0}: {1}'.format(entry.user, bold(age))

									if (count > 1) {
										var firstEntry = link.entries[0]

										result += ' (posted {0} times, first by {1})'.format(count, firstEntry.user)
									}

									message.say(result)
								})
							}
						}
					})
				} else {
					console.log('We don\'t have a last link!')
				}
			})
		})
		*/

		// YouTube
		bot.watch_for(/youtube.*v=([^#&\s]+)/, function(message) {
			var id = message.match_data[1];
			var options = {uri: 'http://gdata.youtube.com/feeds/api/videos/{0}?alt=json'.format(id)};

			request(options, function(err, response, body) {
				var data = JSON.parse(body);
				var entry = data.entry;

				if (entry) {
					message.say('{0}: {1}'.format(bold('YouTube'), entry.title.$t));
				}
			});
		});

		// Vimeo
		bot.watch_for(/vimeo\.com\/(\d+)/, function(message) {
			var id = message.match_data[1];
			var options = {uri: 'http://vimeo.com/api/v2/video/{0}.json'.format(id)};

			request(options, function(err, response, body) {
				var data = JSON.parse(body);

				if (data) {
					message.say('{0}: {1}'.format(bold('Vimeo'), data[0].title));
				}
			});
		});

		// Spotify
		bot.watch_for(/(http:\/\/open\.spotify\.com\/[\w\/]+)/, function(message) {
			var id = message.match_data[1];
			var options = {uri: 'http://ws.spotify.com/lookup/1/.json?uri={0}'.format(id)};

			request(options, function(err, response, body) {
				if (response.statusCode == 200) {
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

					message.say('{0}: {1}'.format(bold('Spotify ' + type), title));
				}
			});
		});

		// WiMP
		bot.watch_for(/wimp\.no\/(artist|album|track)\/\d+/, function(message) {
    		var options = {uri: 'http://' + message.match_data[0]};
		    var type = message.match_data[1];

			request(options, function(err, response, body) {
		        if (response.statusCode == 200) {
		            var titlePattern = /<title>(.+)\s\-\s/;
		            var matches = body.match(titlePattern);

		            if (matches) {
		                var title = matches[1];
		                message.say('{0}: {1}'.format(bold('WiMP ' + type.capitalize()), title));
		            }
		        }
			});
		});

		// Weather
		bot.watch_for(/^!(?:weather|temp|termo|temperature) (.+)/, function(message) {
			var query = message.match_data[1];
			var options = {uri: 'http://www.google.com/ig/api?weather={0}'.format(escape(query))};

			request(options, function(err, response, body) {
				// TODO: Might want to use city
				var city = body.match(/<postal_code data="([^"]+)/);
				var description = body.match(/<current_conditions>[\s]*<condition data="([^"]+)"/);
				var temperature = body.match(/<temp_c data="([^"]+)"/);
				var humidity = body.match(/<humidity data="Humidity: (\d+)/);

				if (description) {
					message.say('{0}: {1}°C {2}, {3}% Humidity'.format(bold(city[1]), temperature[1], description[1], humidity[1]));
				}
			});
		});
	}).connect(options);
});