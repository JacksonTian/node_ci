var Exception = function (exception) {
    this.exception = exception;
};
Exception.prototype.toString = function () {
    var exception = this.exception;
    return "type: " + exception.type + "\nstack:" + exception.stack;
};
Exception.prototype.getMessage = function () {
    return this.toString();
};
exports.Exception = Exception;