var sqlite3 = require('sqlite3');

var Store = exports.Store = function(filename) {
	this.filename = filename;
};

Store.prototype.open = function(callback) {
	var db = new sqlite3.Database(this.filename, function(err) {
		if (err && callback) return callback(err);

		db.run("CREATE TABLE IF NOT EXISTS store (key TEXT UNIQUE, value BLOB)", function(err) {
			if (callback) callback(null);			
		});
	});

	this.db = db;
};

Store.prototype.close = function(callback) {
	this.db.close(callback);
};

Store.prototype.set = function(key, value, callback) {
	this.db.run("INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)", [key, JSON.stringify(value)], callback);
};

Store.prototype.get = function(key, callback) {
	this.db.get("SELECT value FROM store WHERE key = ?", [key], function(err, row) {
		var value;
		
		if (row) {
			value = JSON.parse(row.value);
		}
		
		callback(err, value, key);
	});
};

Store.prototype.all = function(callback) {
	this.db.all("SELECT key, value FROM store", function(err, rows) {
		if (rows) {
			rows.forEach(function(row) {
				row.value = JSON.parse(row.value);
			});
		}
		
		callback(err, rows);
	});
};

Store.prototype.remove = function(key, callback) {
	this.db.run("DELETE FROM store WHERE key = ?", [key], callback);
};