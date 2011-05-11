var http = require("http"),
    querystring = require("querystring"),
    oauth = require('../libraries/oauth');

    //OAuth = ;

var Weibo = function (key, secret, token, tokenSecret) {
    this.config = {
        server: 'open.t.qq.com',
        requestTokenURI: 'https://open.t.qq.com/cgi-bin/request_token',
        authorizeTokenURI: 'https://open.t.qq.com/cgi-bin/authorize',
        accessTokenURI: 'https://open.t.qq.com/cgi-bin/access_token',
        signatureMethod: 'HMAC-SHA1',
        consumerKey: key,
        consumerSecret: secret,
        oauthTokenSecret: tokenSecret,
        callbackURI: 'http://192.168.242.131:8000/tencent/callback'
    };
    
    this.oa = new oauth.OAuth(this.config, token);
    this.requestToken = {};
};

Weibo.prototype.getRequestToken = function (callback) {
    var weibo = this;
    var oa = weibo.oa;
    oa.header = oa.buildRequestAuthorizationHeader();
    var options = {'host': 'open.t.qq.com', 'Authorization': oa.toAuthorizationHeaderString(oa.config.requestTokenURI)};

    http.createClient(443, 'open.t.qq.com', true)
        .request('GET', "/cgi-bin/request_token", options)
        .on('response', function (response) {
            var data = '';
            response.on('data',function(chunk){
                data += chunk;
            }).on('end', function () {
                console.log("data:" + data);
                weibo.requestToken = oauth.OAuth.parseOAuthBody(data);
                //callback();
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
    var options = {'host': 'open.t.qq.com', 'Authorization': oa.toAuthorizationHeaderString(oa.config.accessTokenURI)};
    //console.log(options);
    http.createClient(80, 'open.t.qq.com')
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
            'host': 'open.t.qq.com', 
            'Authorization': oa.toAuthorizationHeaderString("http://open.t.qq.com/statuses/friends_timeline.json")
        };
    //console.log(options);
    http.createClient(80, 'open.t.qq.com')
        .request('GET', "/statuses/friends_timeline.json", options)
        .addListener('response', function (response){
            var data = '';
            response.addListener('data',function(chunk){
                data += chunk;
            }).addListener('end', function (){
                //console.log(data);
                callback(data);
            });
        }).end();
};

exports.Weibo = Weibo;
