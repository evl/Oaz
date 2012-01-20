String.prototype.repeat = function(count) {
	return new Array(count + 1).join(this);
};

var entities = {
    'amp': '&',
    'lt': '<',
    'gt': '>',
    'quot':
    '"'
};

String.prototype.decodeEntities = function() {
    return this.replace(/&#(\d+);/g, function(value, charCode) {
        return String.fromCharCode(parseInt(charCode, 10));
    }).replace(/&([a-z]+);/g, function(value, entity) {
        return entities[entity] || '';
    });
};

String.prototype.__defineGetter__('bold', function() {
    return String.fromCharCode(2) + this + String.fromCharCode(15);
});

String.prototype.__defineGetter__('stripColors', function() {
    return this.replace(/[\u0002\u0003\u000f\u00016\u0001f]/g, '');
});
