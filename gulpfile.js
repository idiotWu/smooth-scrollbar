var fs = require('fs');
var gulp = require('gulp');
var util = require('gulp-util');
var stylus = require('gulp-stylus');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var webpack = require('webpack-stream');
var sizereport = require('gulp-sizereport');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();

var getVersion = function() {
    return JSON.parse(fs.readFileSync('./package.json').toString()).version;
};

var compile = function(watch, done) {
    var options = {
        watch: watch,
        output: {
            filename: 'smooth-scrollbar.js',
            library: 'Scrollbar',
            libraryTarget: 'umd'
        },
        module: {
            preLoaders: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'eslint-loader'
            }],
            loaders: [{
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader?optional[]=runtime&stage=0'
            }]
        }
    };

    if (watch) {
        options.devtool = 'inline-source-map';
    }

    return webpack(options, null, function(err, stats) {
        if (err) throw new util.PluginError('webpack', err);

        util.log('[webpack]', stats.toString({
            colors: util.colors.supportsColor,
            chunks: false,
            hash: false,
            version: false
        }));

        browserSync.reload();

        if (watch) {
            watch = false;
            done();
        }
    });
};

gulp.task('scripts:watch', function(done) {
    return gulp.src('src/index.js')
        .pipe(compile(true, done))
        .pipe(replace(/<%= version %>/, getVersion()))
        .pipe(gulp.dest('build/'));
});

gulp.task('scripts:build', function() {
    return gulp.src('src/index.js')
        .pipe(compile(false))
        .pipe(replace(/<%= version %>/, getVersion()))
        .pipe(gulp.dest('build/'));
});

gulp.task('styles:build', function() {
    return gulp.src('src/style/*.styl')
        .pipe(stylus())
        .pipe(autoprefixer('> 1%, last 2 versions, Firefox ESR, Opera 12.1, ie >= 10'))
        .pipe(gulp.dest('build/'))
        .pipe(browserSync.stream());
});

gulp.task('scripts:release', ['scripts:build'], function() {
    return gulp.src('src/index.js')
        .pipe(compile(false))
        .pipe(replace(/<%= version %>/, getVersion()))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});

gulp.task('styles:release', ['styles:build'], function() {
    return gulp.src('build/**/*.css')
        .pipe(gulp.dest('dist/'));
});

gulp.task('replace', function() {
    return gulp.src('test/index.html')
        .pipe(replace(/build/g, 'dist'))
        .pipe(gulp.dest('demo/'));
});

gulp.task('serve', ['scripts:watch', 'styles:build'], function() {
    browserSync.init({
        server: ['./test', '.'],
        routes: {
            '/build': 'build',
            '/bower_components': 'bower_components'
        }
    });

    gulp.watch('src/style/*.styl', ['styles:build']);
    gulp.watch('test/*.*').on('change', browserSync.reload);
});

gulp.task('copy:release', function() {
    return gulp.src(['test/**/*.*', '!test/**/*.html'])
        .pipe(gulp.dest('demo/'));
});

gulp.task('release', ['scripts:release', 'styles:release', 'replace', 'copy:release'], function() {
    return gulp.src('dist/**/*.*')
        .pipe(sizereport());
});

gulp.task('default', ['release']);
