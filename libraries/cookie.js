var Cookie = function (cookie, response) {
    //weather_config_unit=F; username = jackson;
    var keyValue = cookie.split(";");
    this.response = response;
    this.map = {};
    this.changedMap = {};
    var i, tmp, length = keyValue.length;
    for(i = 0; i < length; i++) {
        tmp = keyValue[i].split("=");
        var key = tmp[0].replace(/\s+/g, "");
        if (key !== '') {
            this.map[key] = tmp[1];
        }
    }
};
Cookie.prototype.setCookie = function (name, value, options) {
    if (name !== '') {
        var item = {};
        item.key = name;
        item.value = value;
        options = options || {};
        options.path = options.path || "/";
        for (var key in options) {
            item[key] = options[key];
        }

        this.changedMap[name] = item;
        console.log("set cookie:");
        console.log(item);
        this.response.setHeader("Set-Cookie", this.getCookies());
    }
};

Cookie.prototype.getCookie = function (key) {
    return key && (this.changedMap[key] || this.map[key] || null);
};

Cookie.prototype.getCookies = function () {
    var map = this.changedMap,
        buffer = [],
        cookie,
        item;

    for(var key in map) {
        item = map[key];
        cookie = [ item.key, "=", item.value, ";" ];
        if (item.expires) {
            cookie.push(" expires=", (new Date(item.expires)).toUTCString(), ";");
        }
        if (item.path) {
            cookie.push(" path=", item.path, ";");
        }
        if (item.domain) {
            cookie.push(" domain=", item.domain, ";");
        }
        if (item.secure) {
            cookie.push(" secure", ";");
        }
        if (item.httpOnly) {
            cookie.push(" httponly");
        }

        buffer.push(cookie.join(""));
    }

    return buffer || [];
};

var CookieManager = function () {
    var getCookie = function (request, response) {
            var cookieStr = request.headers.cookie || "";
            return new Cookie(cookieStr, response);
        };

    return {
        getCookie: getCookie
    };
};

exports.Cookie = CookieManager;