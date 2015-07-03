"use strict";

require("babel/register");

var path = require("path");

var babel = require("gulp-babel");
var eslint = require("gulp-eslint");
var gulp = require("gulp");
var isparta = require("isparta");
var istanbul = require("gulp-istanbul");
var mocha = require("gulp-mocha");

var APP_SRC = ["src/**/*.js", "index.js"];
var TEST_SRC = ["test/**/*.js"];
var ALL_SRC = [].concat(APP_SRC, TEST_SRC);

var handleErr = function (err) {
  console.log(err.message);
  process.exit(1);
};

gulp.task("default", ["lint", "test", "build"]);

gulp.task("build", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task("cover", function () {
  return gulp.src(APP_SRC)
    .pipe(istanbul({
      instrumenter: isparta.Instrumenter,
      includeUntested: true
    }));
});

gulp.task("lint", function () {
  return gulp.src(ALL_SRC)
    .pipe(eslint())
    .pipe(eslint.format("stylish"));
});

gulp.task("test", ["cover"], function (done) {
  var mochaErr;

  gulp.src(TEST_SRC)
    .pipe(mocha())
    .on("error", function (err) {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on("end", function () {
      done(mochaErr);
    });
});

gulp.task("watch", function () {
  gulp.watch(ALL_SRC, ["lint", "test"]);
});
