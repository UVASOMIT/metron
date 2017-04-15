/// <reference path="../src/metron.framework.ts" />
/// <reference path="../src/metron.lists.ts" />
;
metron.onready(function () {
    var post = new metron.list("Post");
    post.inject("append", "init", function () {
        console.log("Inside of an inject that does an append.");
    });
    post.init();
});
