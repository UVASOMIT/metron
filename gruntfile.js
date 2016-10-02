module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        typescript: {
            options: {
                module: 'umd', 
                target: 'es5',
                rootDir: 'src',
                sourceMap: true,
                declaration: true,
                removeComments: true
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

    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    grunt.registerTask("default", ["typescript", "uglify"]);
};
