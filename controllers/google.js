var https = require('https'),
    http = require('http');

exports.controller = function () {
    var index = function () {
            this.render("google_index");
        },
        // getShortURL = function () {
            // var context = this;
            // var post = context.request.post;

            // //https://www.googleapis.com/urlshortener/v1/url
            // var options = {
                // host: 'www.googleapis.com',
                // port: 443,
                // path: '/urlshortener/v1/url?key=AIzaSyAPqm_U5TmWX-QfsZM5KkINLAwkBa9zmuY',
                // method: 'POST',
                // headers: {
                    // 'Content-Type': 'application/json'
                // }
            // };

            // var request = https.request(options, function(response) {
                // var data = '';
                
                // response.on('data',function(chunk){
                    // data += chunk;
                    // process.stdout.write(chunk);
                // }).on('end', function (){
                    // console.log(data);
                    // context.renderJSON(JSON.parse(data));
                // });
            // });

            // request.write(JSON.stringify({"longUrl": post.longURL}));
            // request.end();
        // },
        getShortURL = function () {
            var context = this;
            var post = context.request.post;

            //http://api.t.sina.com.cn/short_url/shorten.json;
            var options = {
                host: 'api.t.sina.com.cn',
                port: 80,
                path: '/short_url/shorten.json?source=1662172390&url_long=' + post.longURL,
                method: 'GET'
            };

            var request = http.request(options, function(response) {
                var data = '';
                
                response.on('data',function(chunk){
                    data += chunk;
                }).on('end', function (){
                    console.log(data);
                    context.renderJSON(JSON.parse(data));
                });
            });
            request.end();
        };
        

    return {
        get: {
            index: index
        },
        post: {
            getShortURL: getShortURL
        }
    };
}();
