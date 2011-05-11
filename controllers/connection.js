exports.controller = function () {

    var index = function () {
            var response = this.response;
            response.writeHeader(200, {'Content-Type':'text/html; charset=utf-8'});
            setInterval(function () {
                response.write("Hello!");
            }, 1000);
            //response.end();
        };

    return {
        get: {
            index: index
        }
    };
}();
