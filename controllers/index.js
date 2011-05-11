var http = require("http");
exports.controller = function() {
    var index = function (username) {
            var response = this.response,
                request = this.request,
                username = username || request.cookie.getCookie("username");
            request.cookie.setCookie("username", username, {path: "/"});
            response.writeHead(200, {'Content-Type': 'text/plain'});
            console.log("set cookie:");
            console.log(request.cookie.getCookies());
            response.end('Hello, '+ username +'\n');
        },
        tweets = function () {
            var res = this.response
                tweets,
                template = '<li>\
                   <em>@user.screen_name</em>\
                   <img src="@user.profile_image_url" />\
                   <span>@text</span>\
                <li>';
            http.createClient(80, 'api.t.sina.com.cn')
                .request('GET', '/statuses/public_timeline.json?source=1662172390', {'host': 'api.t.sina.com.cn'})
                .addListener('response', function(response){
                    var result = '';
                     response.addListener('data',function(data){
                        result += data;
                     }).addListener('end',function( ){
                        tweets = JSON.parse(result);
                        res.writeHeader(200, {'Content-Type':'text/html; charset=utf-8'});
                        res.write('<!docytype html><html><head><title>Public tweets from sina</title><link rel="stylesheet" type="text/css" href="/static/style.css" media="all" /></head><body>');
                        res.write('<div id="tweets"><ul>');
                        if(tweets && tweets.length) {
                            for(var i = 0; i<tweets.length; i++) {
                                var itm = template.replace(/@([\w\.]+)/g, function(){ return eval('tweets[i].'+arguments[1]) });
                                res.write(itm);
                            }
                        }
                        res.end('</ul></div></body></html>');
                     });
                }).end();
        },
        getEmotions = function () {
            var context = this;
            http.createClient(80, 'api.t.sina.com.cn')
                .request('GET', '/emotions.json?source=1662172390', {'host': 'api.t.sina.com.cn'})
                .addListener('response', function(response){
                    var result = '';
                    response.addListener('data',function(data){
                        result += data;
                    }).addListener('end',function( ){
                        var emotions = JSON.parse(result);
                        context.render("emotions", {"emotions": emotions});
                     });
                }).end();
        };
    
    return {
        get: {
            index: index,
            tweets: tweets,
            getEmotions: getEmotions
        }
    };
}();
