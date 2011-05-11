$(document).ready(function () {
    var publishButton = $("#tweet_box button");
    publishButton.click(function () {
        $.post("/sina/publishTweet", {"status": $("#tweet_box textarea").val()}, function (data) {
            console.log(data);
        });
    });
});