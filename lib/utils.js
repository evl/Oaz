String.prototype.repeat = function(count) {
	return new Array(count + 1).join(this);
};

String.prototype.__defineGetter__('bold', function() {
    return String.fromCharCode(2) + this + String.fromCharCode(15);
});

String.prototype.__defineGetter__('stripColors', function() {
    return this.replace(/[\u0002\u0003\u000f\u00016\u0001f]/g, '');
});
