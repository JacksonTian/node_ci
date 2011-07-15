var parse = require('url').parse,
    path = require('path');

var Router = function () {
    this.routes = {
        "get": {},
        "post": {},
        "head": {},
        "put": {},
        "delete": {}
    };
};

Router.prototype = {
    // Get route information
    getRouteInfo: function (url, method) {
        var info = {},
            method = method ? method.toLowerCase() : 'get',
            // url: /controller/action/parameter1/parameter2
            // for get method
            pathname = parse(url).pathname;

        var path = pathname.split("/");
        path.shift(); // Remove the first "/"
        info = {
            controller: path[0] || "index",
            action: path[1] || "index",
            args: path.slice(2) || [],
            method: method
        };

        //如果匹配到route，r大概是 {controller:'controller', action:'action', args:['1']}
        return this.filter(info);
    },
    // Redirect route or filter route
    filter: function (info) {
        if (info.controller === "favicon.ico") {
            info.controller = "statics"
            info.filePath = path.join(__dirname, "../statics/favicon.ico");
        }
        return info;
    }
};

exports.Router = Router;
