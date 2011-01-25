var jerk = require('jerk')
var request = require('request')
var crypto = require('crypto')
var supermarket = require('supermarket')

var options = {
	server: 'se.quakenet.org',
	nick: 'Jesus2',
	channels: ['#ace'],
	user: {
		username: 'jesus',
		realname: '“Oäz unto others as you would have them oäz unto you.”'
	}
}

String.prototype.format = function() {
	var result = this
	var i = arguments.length

	while (i--) {
		result = result.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i])
	}

	return result
}

String.prototype.repeat = function(num) {
	return new Array(++num).join(this)
}

var Format = {
	bold: function(value) {
		return String.fromCharCode(2) + value + String.fromCharCode(15)
	},
	strip: function(value) {
		return value.replace(/[\u0002\u0003\u000f\u00016\u0001f]/g, '')
	}
}

supermarket({filename: 'oaz.sqlite', json: true}, function(error, db) {
	if (error) throw error

	jerk(function(bot) {
		// Oäz
		bot.watch_for(/http:\/\/\S+/, function(message) {
			var options = {uri: message.match_data[0], method: 'HEAD'}
		
			request(options, function(error, response, body) {
				var url = options.uri.href
				
				if (!error) {
					var entry = {user: message.user, time: (new Date()).toString()}

					db.get(url, function(error, link) {
						link = link || {entries: []}
						link.entries.push(entry)
					
						db.set(url, link, function(error) {
							console.log(error ? 'Failed to store' : 'Successfully stored', url)
						})
					
						// Store a reference to the last link that was posted
						db.set('lastLink', url)
					})
				} else {
					console.log('Couldn\'t resolve:', url)
				}
			})
		})
	
		bot.watch_for(/^[oO]+[äÄ]+[zZ]+/, function(message) {
			// Fetch the last link
			db.get('lastLink', function(error, url) {
				if (url) {
					// Get the link
					db.get(url, function(error, link) {
						if (link) {
							// Oäz that shit!
							var count = link.entries.length
							var entry = link.entries[count - 1]
						
							if (!entry.processed) {
								entry.processed = true
							
								db.set(url, link, function(error) {
									console.log(error ? 'Failed to update' : 'Successfully updated', url)

									var age = 'O{0}z!'.format('ä'.repeat(count))
									var result = '{0}: {1}'.format(entry.user, Format.bold(age))
								
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
	
		// YouTube
		bot.watch_for(/youtube.*v=([^#&\s]+)/, function(message) {
			var id = message.match_data[1]
			var options = {uri: 'http://gdata.youtube.com/feeds/api/videos/{0}?alt=json'.format(id)}

			request(options, function(error, response, body) {
				var data = JSON.parse(body)
				var entry = data.entry

				if (entry) {
					message.say('{0}: {1}'.format(Format.bold('YouTube'), entry.title.$t))
				}
			})
		})
	
		// Vimeo
		bot.watch_for(/vimeo\.com\/(\d+)/, function(message) {
			var id = message.match_data[1]
			var options = {uri: 'http://vimeo.com/api/v2/video/{0}.json'.format(id)}

			request(options, function(error, response, body) {
				var data = JSON.parse(body)

				if (data) {
					message.say('{0}: {1}'.format(Format.bold('Vimeo'), data[0].title))
				}
			})
		})
	
		// Spotify
		bot.watch_for(/(http:\/\/open\.spotify\.com\/[\w\/]+)/, function(message) {
			var id = message.match_data[1]
			var options = {uri: 'http://ws.spotify.com/lookup/1/.json?uri={0}'.format(id)}

			request(options, function(errorror, response, body) {
				if (response.statusCode == 200) {
					var data = JSON.parse(body)
					var type
					var title

					switch (data.info.type) {
						case 'artist':
							type = 'Artist'
							title = data.artist.name
							break
						case 'album':
							type = 'Album'
							title = data.album.artist + ' - ' + data.album.name
							break
						case 'track':
							type = 'Track'
							title = data.track.artists[0].name + ' - ' + data.track.name
							break
					}

					message.say('{0}: {1}'.format(Format.bold('Spotify ' + type), title))
				}
			})
		})
	
		// Weather
		bot.watch_for(/^!(?:weather|temp|termo|temperature) (.+)/, function(message) {
			var query = message.match_data[1]
			var options = {uri: 'http://www.google.com/ig/api?weather={0}'.format(escape(query))}

			request(options, function(error, response, body) {
				// TODO: Might want to use city
				var city = body.match(/<postal_code data="([^"]+)/)
				var description = body.match(/<current_conditions>[\s]*<condition data="([^"]+)"/)
				var temperature = body.match(/<temp_c data="([^"]+)"/)
				var humidity = body.match(/<humidity data="Humidity: (\d+)/)

				if (description) {
					message.say('{0}: {1}°C {2}, {3}% Humidity'.format(Format.bold(city[1]), temperature[1], description[1], humidity[1]))
				}
			})
		})
	}).connect(options)
})