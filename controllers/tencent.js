var http = require("http"),
    tencent = require("../models/tencent.weibo");

exports.controller = function () {
    var APP_KEY = "06d52f07e1bb48e0bade40ca641cecad";
    var APP_SECRET = "eb49a30b8ea8c763ed0159f9f72bdf49";

    var index = function () {
            this.render("tencent_index");
        },
        getOAuthURL = function () {
            var context = this;
            var request = context.request;
            var session = request.session;
            var weibo = new tencent.Weibo(APP_KEY, APP_SECRET);
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
                var weibo = new tencent.Weibo(APP_KEY, APP_SECRET, accessToken.oauthToken, accessToken.oauthTokenSecret);
                weibo.getHomeTimeline(function (timeline) {
                    context.render("hometimeline", {timeline: JSON.parse(timeline)});
                });

            } else {
                context.redirect("/tencent");
            }
        },
        callback = function () {
            var context = this;
            var request = context.request;
            var session = request.session;
            var get = request.get;
            if (get.oauth_token && get.oauth_verifier && (requestToken = session.get("requestToken"))) {

                var weibo = new tencent.Weibo(APP_KEY, APP_SECRET, requestToken.oauthToken, requestToken.oauthTokenSecret);
                weibo.getAccessToken(get.oauth_verifier, function () {
                    console.log(weibo.accessToken);
                    session.add("accessToken", weibo.accessToken);
                    context.redirect("/tencent/getHomeTimeline");
                });
            } else {
                context.redirect("/tencent");
            }
        };

    return {
        get: {
            index: index,
            getHomeTimeline: getHomeTimeline,
            getOAuthURL: getOAuthURL,
            callback: callback
        }
    };
}();
