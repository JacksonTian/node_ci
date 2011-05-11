$(document).ready(function(){
    var shorterURL = $("#shorterURL");
    var longURL = $("#longURL");
    var urlQR = $("#qr");

    $("#shorterForm").submit(function () {
        $.post("/google/getShortURL", {longURL: longURL.val()}, function (data) {
            var entity = data[0];
            var link = '<a href="'+ entity.url_short +'" target="_blank">'+ entity.url_short +'</a>';
            shorterURL.html(link);
            //urlQR.attr("src", data.id + ".qr");
        });
        return false;
    });
});