var ViewEngine = {
    render: function (template, data) {
        var template = ViewEngine._parseLogicTags(template, data);
        var buffer = [];
        //console.log(template);
        eval(template);
        return buffer.join("");
    },
    _parseLogicTags: function (template, data) {
        return template.replace(/.+\n/g, function(word){
                word = word.replace("\n", "");
                if (word.search(/<\/?.+>/g) !== -1) {
                    word = ViewEngine._parseDataTags(word);
                    word = "buffer.push('" + word + "\\n');";
                } else {
                    word = ViewEngine._parseExpressions(word);
                }
                return word;
            });
    },
    // <span>{data.abc}</span> -> <span> + data.abc + </span>
    _parseDataTags: function (template) {
        return template.replace(/{(.*?)}/g, function (word, g1) {
            return "' + " + g1 + " + '";
        });
    },
    _parseExpressions: function (template) {
        // Replace the first '#'
        return template.replace(/#/, "");
    }
};

exports.ViewEngine = ViewEngine;