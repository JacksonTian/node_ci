var http = require("http"),
    sinaWeibo = require("../models/sina.weibo");

exports.controller = function () {
    var APP_KEY = "1662172390";
    var APP_SECRET = "93b0e339f829b23546b60e2f25e77a9e";

    var index = function (username) {
            this.render("index");
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
        },
        getOAuthURL = function () {
            var context = this;
            var request = context.request;
            var session = request.session;
            var weibo = new sinaWeibo.Weibo(APP_KEY, APP_SECRET);
            weibo.getRequestToken(function () {
                session.add("requestToken", weibo.requestToken);
                context.renderJSON({redirect: weibo.getAuthorizeURL()});
            });
        },
        getHomeTimeline = function () {
            //http://api.t.sina.com.cn/statuses/friends_timeline.json
            var context = this,
                session = this.request.session,
                accessToken = session.get("accessToken");

            if (accessToken) {
                var weibo = new sinaWeibo.Weibo(APP_KEY, APP_SECRET, accessToken.oauthToken, accessToken.oauthTokenSecret);
                weibo.getHomeTimeline(function (timeline) {
                    console.log(JSON.parse(timeline));
                    context.render("hometimeline", {timeline: JSON.parse(timeline)});
                });

            } else {
                context.redirect("/sina");
            }
        },
        callback = function () {
            var context = this;
            var request = context.request;
            var session = request.session;
            var get = request.get;

            if (get.oauth_token && get.oauth_verifier && (requestToken = session.get("requestToken"))) {
                var weibo = new sinaWeibo.Weibo(APP_KEY, APP_SECRET, requestToken.oauthToken, requestToken.oauthTokenSecret);
                weibo.getAccessToken(get.oauth_verifier, function () {
                    console.log(weibo.accessToken);
                    session.add("accessToken", weibo.accessToken);
                    context.redirect("/sina/getHomeTimeline");
                });
            } else {
                context.redirect("/sina");
            }
        },
        publishTweet = function () {
            var context = this,
                request = context.request,
                session = request.session,
                accessToken = session.get("accessToken");

            if (accessToken) {
                var weibo = new sinaWeibo.Weibo(APP_KEY, APP_SECRET, accessToken.oauthToken, accessToken.oauthTokenSecret);
                weibo.publishWeibo(function (status) {
                    context.renderJSON(JSON.parse(status));
                }, {
                    "status": request.post.status
                });

            } else {
                context.renderJSON({"result": "fails"});
            }
        };

    return {
        get: {
            index: index,
            getHomeTimeline: getHomeTimeline,
            getOAuthURL: getOAuthURL,
            callback: callback
        },
        post: {
            publishTweet: publishTweet
        }
    };
}();
