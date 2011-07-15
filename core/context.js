var path = require("path"),
    fs = require("fs"),
    ViewEngine = require("./viewEngine").ViewEngine;

var Context = function (request, response, framework) {
    this.request = request;
    this.response = response;
    this.framework = framework;
};

Context.prototype = {
    render: function (view, data) {
        var context = this,
            framework = context.framework,
            request = context.request,
            response = context.response;

        var ext = ".html";
        var filePath = path.join(__dirname, "../views/", view + ext);
        path.exists(filePath, function(exists) {
            if(!exists) {
                framework.handler404(request, response, "This file doesn't exist.");  
                return;
            }

            fs.readFile(filePath, "utf8", function(err, template) {  
                if (err) {
                    framework.handler500(request, response, err);
                    return;
                }
                try {
                    response.writeHeader(200, {'Content-Type':'text/html; charset=utf-8'});
                    response.write(ViewEngine.render(template, data));
                    response.end();
                } catch (ex) {
                    throw ex;
                    framework.handler500(request, response, "Parse template error.");
                }
            });
        });
    },
    renderView: function () {
        // TODO
    },
    redirect: function (url) {
        var response = this.response;
        response.writeHeader(302, {'Location': url});
        response.end();
    },
    renderJSON: function (data) {
        var response = this.response;
        response.writeHeader(200, {'Content-Type':'text/json; charset=utf-8'});
        response.write(JSON.stringify(data));
        response.end();
    }
};

exports.Context = Context;