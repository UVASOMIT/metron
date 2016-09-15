module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        typescript: {
            options: {
                module: 'commonjs', 
                target: 'es5',
                rootDir: 'src',
                sourceMap: true,
                declaration: true
            },
            base: {
                src: ['src/**/*.ts', "!**/*.d.ts"],
                dest: 'dest/gen',
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
                        cwd: "src",
                        src: ["**/*.js", "!**/*.min.js"],
                        dest: "dist",
                        ext: ".min.js"
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("default", ["typescript", "uglify"]);
};
