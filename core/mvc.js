var url = require('url'),
    path = require("path"),
    fs = require("fs"),
    querystring = require("querystring"),
    Router = require("./route").Router,
    Context = require("./context").Context,
    sessionStorage = require("./libraries/session").SessionStorage(),
    Cookie = require("./libraries/cookie").Cookie(),
    Exception = require('./libraries/exception').Exception,
    contentTypes = require("./libraries/contentTypes").contentTypes;

var MVC = function () {
    this.settings = {
        paths: {
            "controllers": "./controllers",
            "views": "./views"
        }
    };

    this.initialize();
};
MVC.prototype.initialize = function () {
    this.router = new Router();
};

MVC.prototype.handle = function (request, response) {
    var framework = this,
        _postData = '';
    //request.setEncoding("utf-8");
    //on用于添加一个监听函数到一个特定的事件
    request.on('data', function(chunk) {
        _postData += chunk;
        //console.log(chunk);
    })
    .on('end', function() {
        request.post = querystring.parse(_postData);
        request.location = url.parse(request.url, true);
        framework.dispatch(request, response);
    });
};

MVC.prototype.dispatch = function (request, response) {
    //console.log(request);
    //通过route来获取controller和action信息
    var routeInfo = this.router.getRouteInfo(request.url, request.method);
    console.log(routeInfo);
    //如果route中有匹配的action，则分发给对应的action
    if (routeInfo.controller === "statics") {
        this.dispatchStatic(request, response, routeInfo.filePath);
    } else {
        try {
            request.get = request.location.query;
            //console.log(request.get);
            request.cookie = Cookie.getCookie(request, response);
            //console.log(request.cookie.map);
            request.session = sessionStorage.getSession(request);
            //console.log(request.session);
            var controller = require('../controllers/' + routeInfo.controller).controller;
            if (controller[routeInfo.method] && controller[routeInfo.method][routeInfo.action]) {
                var context = new Context(request, response, this);
                controller[routeInfo.method][routeInfo.action].apply(context, routeInfo.args);
            } else {
                this.handler500(request, response, 'Error: controller "' + routeInfo.controller + '" without action "' + routeInfo.action + '"');
            }
        } catch (ex) {
            console.log(new Exception(ex).toString());
            this.handler500(request, response, 'Error: controller "' + routeInfo.controller + '" dosen\'t exsit."');
        }
    }
};

MVC.prototype.dispatchStatic = function (request, response, filePath) {
    var framework = this;
    if(!filePath){
        filePath = path.join(__dirname, "..", url.parse(request.url).pathname);
    }
    path.exists(filePath, function(exists) {
        if(!exists) {
            framework.handler404(request, response, "This file doesn't exist.");  
            return;
        }

        fs.readFile(filePath, "binary", function(err, file) {

            if(err) {
                framework.handler500(request, response, err);
                return;
            }

            var ext = path.extname(filePath);
            ext = ext ? ext.slice(1) : 'html';
            response.writeHead(200, {'Content-Type': contentTypes[ext] || 'text/html'});
            response.write(file, "binary");
            response.end();
        });
    });
};
MVC.prototype.handler500 = function(request, response, err){
    console.log("500: " + err);
    console.log("\t" + request.url);
    response.writeHead(500, {'Content-Type': 'text/plain'});
    response.end(err);
};
MVC.prototype.handler404 = function(request, response, err){
    console.log("404: " + request.url);
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end(err);
};

exports.bootMVC = function() {
    return new MVC();
};
