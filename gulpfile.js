"use strict";

var gulp = require("gulp");
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps");
var del = require("del");
var less = require("gulp-less");
var pug = require("gulp-pug");
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
var postcss = require("gulp-postcss");
var postcssNormalize = require("postcss-normalize");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var uglify = require("gulp-uglify");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var sprite = require("gulp-svgstore");
var htmlmin = require("gulp-htmlmin");
var server = require("browser-sync").create();

gulp.task("css", function() {
  return gulp
    .src("source/less/style.less")
    .pipe(
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: "Styles",
            message: err.message
          }
        })
      })
    )
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(postcss([
      postcssNormalize({
        forceImport: true
      }),
      autoprefixer({
        grid: "autoplace"
      })
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("pug", function() {
  return gulp
    .src("source/pug/pages/*.pug")
    .pipe(
      plumber({
        errorHandler: notify.onError(function(err) {
          return {
            title: "Pug",
            message: err.message
          }
        })
      })
    )
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest("source"))
});

gulp.task("html", function() {
    return gulp
        .src("source/*.html")
        .pipe(sourcemaps.init())
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("build"))
        .pipe(server.stream());
});

gulp.task("clear", function() {
  return del("build");
});

gulp.task("imagemin", function() {
  return gulp
    .src("source/img/*.{jpg,svg}")
    .pipe(imagemin([
      imagemin.jpegtran({ progressive: true }),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function() {
  return gulp
    .src("source/img/*.{jpg,png}")
    .pipe(webp())
    .pipe(gulp.dest("build/img"));
});

gulp.task("copy:fonts", function() {
  return gulp
    .src(["source/fonts/**/*.{woff,woff2}"], { base: "source" })
    .pipe(gulp.dest("build"));
});

gulp.task("copy:css", function() {
  return gulp
    .src(["source/css/**/*.css", "!source/css/style.css"], { base: "source" })
    .pipe(gulp.dest("build"));
});

gulp.task("copy:pixel-glass", function() {
  return gulp
    .src(["source/pixel-glass/**/*.*"], { base: "source" })
    .pipe(gulp.dest("build"));
});

gulp.task("copy:img", function() {
  return gulp
    .src(["source/img/**/*.{jpg,png,svg}"], { base: "source" })
    .pipe(gulp.dest("build"));
});

gulp.task("js", function(cb) {
  return gulp
    .src("source/js/*.js", { base: "source" })
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(rename({ suffix: ".min"}))
    .pipe(gulp.dest("build"))
    .pipe(server.stream());
});

gulp.task("sprite", function() {
  return gulp
    .src("source/img/icon-*.svg")
    .pipe(sprite())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("image-optimize", gulp.series("imagemin", "webp", "sprite"));
gulp.task("dev-img", gulp.series("copy:img", "webp", "sprite"));

gulp.task("server", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/pug/**/*.pug", gulp.series("pug", "html"));
  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/js/*.js", gulp.series("js"));
});

gulp.task(
  "start",
  gulp.series(
    "clear",
    "copy:fonts",
    "copy:pixel-glass",
    "dev-img",
    "copy:css",
    "css",
    "pug",
    "html",
    "js",
    "server"
  )
);

gulp.task(
  "build",
  gulp.series(
    "clear",
    "copy:fonts",
    "image-optimize",
    "copy:css",
    "css",
    "pug",
    "html",
    "js"
  )
);

