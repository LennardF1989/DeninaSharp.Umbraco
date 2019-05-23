/// <binding BeforeBuild='build' Clean='clean' ProjectOpened='build, watch' />
"use strict";

var gulp = require("gulp"),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),
    prefix = require("gulp-autoprefixer"),
    del = require("del"),
    plumber = require("gulp-plumber"),
    notify = require("gulp-notify"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    gulpif = require("gulp-if");

var pluginPathU7 = "../DeninaSharp.Umbraco7.Web/App_Plugins/DeninaSharp/";
var pluginPathU8 = "../DeninaSharp.Umbraco8.Web/App_Plugins/DeninaSharp/";

gulp.task("clean:u7", function () {
    return cleanCSS(pluginPathU7);
});

gulp.task("clean:u8", function () {
    return cleanCSS(pluginPathU8);
});

function cleanCSS(outputPath) {
    return del([
        outputPath + "**/*.css"
    ], { force: true });
}

gulp.task("compile:u7", function (done) {
    compile("u7", pluginPathU7);

    done();
});

gulp.task("compile:u8", function (done) {
    compile("u8", pluginPathU8);

    done();
});

function compile(type, outputPath) {
    compileSASS(type, outputPath);
    mergeJS(type, outputPath);
    copyViews(type, outputPath);
    copyManifest(type, outputPath);
}

function compileSASS(type, outputPath) {
    return gulp
        .src("wwwroot/scss/**/*.scss")
        .pipe(plumber({
            errorHandler: notify.onError(function (error) {
                return {
                    title: "Failed to compile CSS-files!",
                    message: error
                };
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: "wwwroot/scss"
        }))
        .pipe(prefix())
        .pipe(sourcemaps.write(".", { sourceRoot: "wwwroot/scss" }))
        .pipe(gulp.dest(outputPath + "css"));
}

function mergeJS(type, outputPath) {
    return gulp
        .src([
            "wwwroot/js/deninasharp.controller.js",
            "wwwroot/js/deninasharp.controller." + type + ".js",
            "wwwroot/js/deninasharp.gridcontroller.js"
        ])
        .pipe(concat("deninasharp.controller.js"))
        .pipe(gulp.dest(outputPath + "js"));
}

function copyViews(type, outputPath) {
    return gulp
        .src([
            "wwwroot/views/deninasharp.grid.html",
            "wwwroot/views/deninasharp.overlay." + type + ".html",
            "wwwroot/views/deninasharp." + type + ".html"
        ])
        .pipe(rename(function(file) {
            file.basename = file.basename.replace("." + type, "");
        }))
        .pipe(gulp.dest(outputPath + "views"));
}

function copyManifest(type, outputPath) {
    return gulp
        .src("wwwroot/package.manifest")
        .pipe(gulp.dest(outputPath));
}

gulp.task("build:u7", gulp.series(["clean:u7", "compile:u7"]));
gulp.task("build:u8", gulp.series(["clean:u8", "compile:u8"]));

gulp.task("watch:u7", function () {
    gulp.watch("**/*", gulp.series(["build:u7"]));
});

gulp.task("watch:u8", function () {
    gulp.watch("**/*", gulp.series(["build:u8"]));
});

gulp.task("clean", gulp.parallel(["clean:u7", "clean:u8"]));
gulp.task("build", gulp.parallel(["build:u7", "build:u8"]));
gulp.task("watch", gulp.parallel(["watch:u7", "watch:u8"]));
