var querystring = require("querystring");

var OAuth = function (config, token) {
    this.config = config || {};
    this.oauthToken  = token;
    this.header = {};
};

OAuth.prototype.sign = function(baseString) {
    var method = this.config.signatureMethod;
    console.log("secret: " + this.config.consumerSecret);
    console.log("tokensecret: " + this.config.oauthTokenSecret);
    var key = [encodeURIComponent(this.config.consumerSecret ||''), '&', encodeURIComponent(this.config.oauthTokenSecret ||'')].join('');
    console.log(key);
    if(method === 'HMAC-SHA1') return OAuth.signHmacSha1(baseString, key);
    else if(method === 'RSA-SHA1') return null;
};

OAuth.prototype.toAuthorizationHeaderString = function(uri, method, bodys) {
    method = method || 'GET';
    var buffer = [];
    var header = this.header;
    var signatureBaseString = this.generateSignatureBaseString(method.toUpperCase(), uri, bodys);
    console.log("BaseString: " + signatureBaseString);
    header['oauth_signature'] = this.sign(signatureBaseString);

    for(var v in header) {
        buffer.push([v, '="', encodeURIComponent(header[v]), '"'].join(''));
    }
    return 'OAuth ' + buffer.join(',');
};

/**
 * Build Authorization header string for request token request
 */
OAuth.prototype.buildRequestAuthorizationHeader = function() {
    var config = this.config;
    return {
        'oauth_consumer_key': config.consumerKey,
        'oauth_version': '1.0',
        'oauth_callback': config.callbackURI,
        'oauth_timestamp': (new Date().valueOf()/1000).toFixed().toString(),
        'oauth_nonce': new Date().valueOf().toString(),
        'oauth_signature_method': config.signatureMethod
    };
};
/**
 * Build Authorization header string for access token request
 */
OAuth.prototype.buildAccessAuthorizationHeader = function() {
    var config = this.config;
    return {
        'oauth_consumer_key': config.consumerKey,
        'oauth_version': '1.0',
        'oauth_timestamp': (new Date().valueOf()/1000).toFixed().toString(),
        'oauth_nonce': new Date().valueOf().toString(),
        'oauth_signature_method': config.signatureMethod,
        'oauth_verifier': this.oauthVerifier,
        'oauth_token': this.oauthToken
    };
};

/**
 * Build Authorization header string for data access api request
 */
OAuth.prototype.buildAuthorizationHeader = function() {
    var config = this.config;
    return {
        'oauth_consumer_key': config.consumerKey,
        'oauth_version': '1.0',
        'oauth_nonce': new Date().valueOf().toString(),
        'oauth_timestamp': (new Date().valueOf()/1000).toFixed().toString(),
        'oauth_signature_method': config.signatureMethod,
        'oauth_token': this.oauthToken
    };
};

/**
 * @param method: string ('POST' or 'GET')
 * @param baseURL: string
 * @param headers: header parameters object
 * @param bodys: body parameter object
 */
OAuth.prototype.generateSignatureBaseString = function(method, uri, bodys) {
    var params = [], uri = encodeURI(uri);
    var header = this.header || {};
    bodys = bodys || {};

    for(var idx in header) {
        params.push([idx, encodeURIComponent(header[idx])].join('='));
    }
    for(var idx in bodys) {
        params.push([encodeURIComponent(idx), encodeURIComponent(bodys[idx])].join('='));
    }

    return [method.toUpperCase(), encodeURIComponent(uri.replace(/\?.+$/, '')), encodeURIComponent(params.sort().join('&'))].join('&');
};

OAuth.signHmacSha1 = function(baseString, key) {
    var signer = require('crypto').createHmac('SHA1', key);
    signer.update(baseString);
    return signer.digest('base64');
};

OAuth.parseOAuthBody = function(body) {
    var result = querystring.parse(body);
    console.log(result);
    return {
        oauthToken: result.oauth_token,
        oauthTokenSecret: result.oauth_token_secret,
        userId: result.user_id
    };
};

exports ? exports.OAuth = OAuth : "";