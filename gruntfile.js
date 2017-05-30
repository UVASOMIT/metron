var path = require("path");
var parentFolder = path.basename(path.resolve(".."));

var getLoaderPackageName = function() {
    if (parentFolder === "node_modules") {
        return "load-grunt-parent-tasks";
    } else {
        return "load-grunt-tasks";
    }
};

module.exports = function (grunt) {
    
    require(getLoaderPackageName())(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        typescript: {
            options: {
                module: 'umd', 
                target: 'es5',
                rootDir: 'src',
                sourceMap: true,
                declaration: true,
                removeComments: true,
                noEmitOnError: false
            },
            base: {
                src: ['src/**/*.ts', "!**/*.d.ts"],
                dest: 'dist/gen/metron.js',
            }
        },
        uglify: {
            options: {
                mangle: false,
                sourceMap: true
            },
            build: {
                files: [
                    {
                        expand: true,
                        cwd: "dist",
                        src: ["**/*.js", "!**/*.min.js"],
                        dest: "dist",
                        ext: ".min.js"
                    }
                ]
            }
        }
    });

    grunt.registerTask("default", ["typescript", "uglify"]);
};
