var exec = require("child_process").exec;
exec("npm install", function(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    exec("grunt default", function(error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });
});
