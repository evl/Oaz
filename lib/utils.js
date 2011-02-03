String.prototype.format = function() {
	var result = this;
	var i = arguments.length;

	while (i--) {
		result = result.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}

	return result;
};

String.prototype.repeat = function(num) {
	return new Array(++num).join(this);
};