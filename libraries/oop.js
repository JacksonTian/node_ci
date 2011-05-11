var OOP = {
    merge: function (source, received) {
        var index;
        for (index in received) {
            if (typeof source[index] === "undefined") {
                source[index] = received[index];
            }
        }
        return source;
    }
};

exports.OOP = OOP;
