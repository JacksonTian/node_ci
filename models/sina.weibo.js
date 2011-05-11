var http = require("http"),
    querystring = require("querystring"),
    oop = require("../libraries/oop").OOP,
    OAuth = require("../libraries/oauth").OAuth;

var Weibo = function (key, secret, token, tokenSecret) {
    this.config = {
        server: 'api.t.sina.com.cn',
        requestTokenURI: 'http://api.t.sina.com.cn/oauth/request_token',
        authorizeTokenURI: 'http://api.t.sina.com.cn/oauth/authorize',
        accessTokenURI: 'http://api.t.sina.com.cn/oauth/access_token',
        signatureMethod: 'HMAC-SHA1',
        consumerKey: key,
        consumerSecret: secret,
        oauthTokenSecret: tokenSecret,
        callbackURI: 'http://jackson.com/sina/callback'
    };
    
    this.oa = new OAuth(this.config, token);
    this.requestToken = {};
};

Weibo.prototype.getRequestToken = function (callback) {
    var weibo = this;
    var oa = weibo.oa;
    oa.header = oa.buildRequestAuthorizationHeader();
    var options = {'host': 'api.t.sina.com.cn', 'Authorization': oa.toAuthorizationHeaderString(oa.config.requestTokenURI)};

    http.createClient(80, 'api.t.sina.com.cn')
        .request('GET', "/oauth/request_token", options)
        .addListener('response', function(response){
            var data = '';
            response.addListener('data',function(chunk){
                data += chunk;
            }).addListener('end', function () {
                weibo.requestToken = OAuth.parseOAuthBody(data);
                callback();
            });
        }).end();

};
/**
 * Get the authorize URL
 *
 * @return string
 */
Weibo.prototype.getAuthorizeURL = function () {
    return this.config.authorizeTokenURI + "?oauth_token=" + this.requestToken.oauthToken + "&oauth_callback=" + encodeURIComponent(this.config.callbackURI);
};

Weibo.prototype.getAccessToken = function (verifier, callback) {
    var weibo = this;
    var oa = weibo.oa;
    oa.oauthVerifier = verifier;
    oa.header = oa.buildAccessAuthorizationHeader();
    var options = {'host': 'api.t.sina.com.cn', 'Authorization': oa.toAuthorizationHeaderString(oa.config.accessTokenURI)};
    //console.log(options);
    http.createClient(80, 'api.t.sina.com.cn')
        .request('GET', "/oauth/access_token", options)
        .addListener('response', function(response){
            var data = '';
            response.addListener('data',function(chunk){
                data += chunk;
            }).addListener('end', function (){
                console.log(data);
                weibo.accessToken = OAuth.parseOAuthBody(data);
                callback();
            });
        }).end();

};

Weibo.prototype.getHomeTimeline = function (callback) {
    var weibo = this;
    var oa = weibo.oa;
    oa.header = oa.buildAuthorizationHeader();
    var options = {
            'host': 'api.t.sina.com.cn', 
            'Authorization': oa.toAuthorizationHeaderString("http://api.t.sina.com.cn/statuses/friends_timeline.json")
        };
    //console.log(options);
    http.createClient(80, 'api.t.sina.com.cn')
        .request('GET', "/statuses/friends_timeline.json", options)
        .on('response', function (response){
            var data = '';
            response.setEncoding("utf8");
            response.on('data',function(chunk){
                data += chunk;
            }).on('end', function (){
                callback(data);
            });
        }).end();
};

Weibo.prototype.publishWeibo = function (callback, parameters) {
    // http://api.t.sina.com.cn/statuses/update.json
    var weibo = this;
    var oa = weibo.oa;
    oa.header = oa.buildAuthorizationHeader();
    var options = {
            'host': 'api.t.sina.com.cn',
            'Authorization': oa.toAuthorizationHeaderString("http://api.t.sina.com.cn/statuses/update.json", "POST", parameters),
        };
    console.log(options);
    http.createClient(80, 'api.t.sina.com.cn')
        .request('POST', "/statuses/update.json", options)
        .on('response', function (response){
            var data = '';
            response.setEncoding("utf8");
            console.log(response.statusCode);
            
            response.on('data',function(chunk){
                data += chunk;
            }).on('end', function (){
                console.log(data);
                if (response.statusCode == "200") {
                    callback(data);
                } else {
                    callback("{\"error\": \"error!\"}");
                }
            });

        }).end(querystring.stringify(parameters));
};

exports.Weibo = Weibo;
