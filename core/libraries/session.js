var Session = function (sessionId) {
    this._sessionId = sessionId;
    this._updateTime = new Date().getTime();
    this._map = {};
};
Session.prototype = {
    add: function (key, value) {
        this._map[key] = value;
    },

    remove: function (key) {
        delete this._map[key];
    },

    get: function (key) {
        return this._map[key];
    },

    removeAll: function () {
        this._map = {};
    }
};

var SessionStorage = function () {
    var sessions = {},
        getSession = function (request) {
            var now = new Date().getTime();
            console.log(now);
            var cookie = request.cookie;
            var SESSIONID_KEY = "session_id";
            var EXPIRES_TIME = 20 * 60 * 1000;
            var YEAR = 365 * 24 * 60 * 60 * 1000;
            var sessionId = cookie && cookie.getCookie(SESSIONID_KEY);
            var session = sessions[sessionId];
            if (session && (now - session._updateTime < EXPIRES_TIME)) {
                session._updateTime = now;
            } else {
                try {
                    // Remove the expired session.
                    delete sessions[sessionId];
                } catch (ex) {
                }
                sessionId = [now, Math.round(Math.random() * 1000)].join("");
                cookie.setCookie(SESSIONID_KEY, sessionId, {expires: new Date(now + YEAR).toGMTString()});
                session = sessions[sessionId] = new Session(sessionId);
            }

            return session;
        };

    return {
        getSession: getSession
    }
};

exports.SessionStorage = SessionStorage;