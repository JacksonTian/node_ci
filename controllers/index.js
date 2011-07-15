var http = require("http");
exports.controller = function() {
    var index = function () {
            this.render("index");
        };

    return {
        get: {
            index: index
        }
    };
}();
