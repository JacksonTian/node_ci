/**
 * author : jolam @ twitter.com/jo32
 */
$(document).ready(function() {
    $.ajaxSetup({
        cache : false
    });

    $("#oauthButton").click(function() {
        handleOauthHandling();
    });

    function handleOauthHandling() {
        $.get("tencent/getOAuthURL", function(data) {
            location.href = data.redirect;
        });
    }

    $("#oauthButton").bind('checkFlag', function(e, text) {
        var flag = $("#flag").text();
        var i = parseInt(flag);
        if (i < 10) {
            $("#flag").text(i + 1 + "");
            handleOauthHandling();
            showMessage("Retrying Getting Oauth Url, time: " + i);
        } else {
            showMessage("Sth Wrong happend, Press F5 Please.");
        }
    });

    function showMessage(text) {
        alert(text);
    }
});