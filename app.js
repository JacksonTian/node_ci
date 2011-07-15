var PORT = 8000;
var http = require('http'),
    mvc = require('./core/mvc'),
    Exception = require('./core/libraries/exception').Exception;

var framework = mvc.bootMVC();

var server = http.createServer(function(request, response) {
    // Use framework to handle the request & response
    framework.handle(request, response);

});

server.addListener("clientError", function (exception) {
    console.log(new Exception(exception).toString());
});

server.addListener("upgrade", function (request, socket, head) {
    console.log("upgrade");
});

server.listen(PORT);

process.on('uncaughtException', function (err) {
    console.log(new Exception(err).toString());
});

console.log("Server runing at port: " + PORT + ".");