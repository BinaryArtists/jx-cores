// Refer to mini-antui
// Doc use https://gist.github.com/jeromecoupe/0b807b0c1050647eb340360902c3203a

const path = require('path');
const gulp = require('gulp');
const babel = require('gulp-babel');

const isProduction = process.env.NODE_ENV === 'production';
const dist = isProduction
  ? path.join(__dirname, '../dist')
  : path.join(__dirname, '../build');
const src = path.join(__dirname, '../src');
const babelConfigFilePath = path.join(__dirname, '../babel.config.js');

function scripts() {
  let opts = require(babelConfigFilePath);

  return (
    gulp
      .src([`${src}/**/*.js`])
      .pipe(babel(opts))
      .pipe(gulp.dest(dist))
  );
}

const build = gulp.series(scripts);

exports.build = build;
exports.default = build;
