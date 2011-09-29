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

String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.substr(1);
};

String.prototype.toBold = function() {
    return String.fromCharCode(2) + this + String.fromCharCode(15);
};

String.prototype.toPlainText = function() {
    return this.replace(/[\u0002\u0003\u000f\u00016\u0001f]/g, '');
};