'use strict';

/* PROJECT CONFIGURATION
 ===================================================================================================================== */
var project = {
    key: '<%= project %>',
    description: '<%= title %>',
    author: {
        name: '<%= author %>',
        url: '<%= url %>'
    },
    developer: {
        name: 'tollwerk GmbH',
        url: 'https://tollwerk.de'
    },
    validate: []
};


/* GENERAL SETUP
 ===================================================================================================================== */
var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var sequence = require('gulp-sequence');

/**
 * Stream error handler generator
 *
 * @param {String} task Task name
 * @return {Function} Error handler
 */
function errorHandler(task) {
    return function (err) {
        if (err) {
            gutil.log(gutil.colors.red('ERROR in task "' + task + '"'));
            gutil.log(err.message);
            this.emit('end', new gutil.PluginError(task, err));
        }
    }
}

var src = './source/' + project.key + '/';
var dist = './web/fileadmin/' + project.key + '/';
var extDist = './web/typo3conf/ext/';
var watch = [];


/* POSTCSS + PLUGINS
 ===================================================================================================================== */
gulp.task('css', function () {
    var postcss = require('gulp-postcss');
    var sourcemaps = require('gulp-sourcemaps');
    var cssnano = require('cssnano');
    var cssnext = require('postcss-cssnext');
    var partialImport = require('postcss-partial-import');
    var mqPacker = require('css-mqpacker');
    var critical = require('postcss-critical-css');

    // Concatenable CSS resources
    gulp.src(['*/Resources/Private/Css/*.css', '!*/Resources/Private/Css/_*.css'], {cwd: extDist})
        .pipe(sourcemaps.init()) // Initialize sourcemaps
        .pipe(postcss([
            partialImport(),
            cssnext({autoprefixer: {browsers: ['IE >= 10']}}),
            critical({
                outputPath: dist + 'css',
                outputDest: project.key + '-critical.css',
                preserve: true,
                minify: false
            }),
            mqPacker(),
            cssnano({autoprefixer: false})
        ]).on('error', errorHandler('css:concat / postcss'))) // Run PostCSS processors
        .pipe(rename(function (path) { // Rename to minified file
            path.dirname = path.dirname.split('/Private/').join('/Public/');
            path.basename += '.min';
        }))
        .pipe(gulp.dest(extDist)) // Write single CSS to extension destination directory
        .pipe(concat(project.key + '.min.css'))
        .pipe(sourcemaps.write('.')) // Write out sourcemaps
        .pipe(gulp.dest(dist + 'css')); // Write combined CSS to destination directory

    // Non-Concatenable CSS resources
    gulp.src('*/Resources/Private/Css/_*.css', {cwd: extDist})
        .pipe(sourcemaps.init()) // Initialize sourcemaps
        .pipe(postcss([
            partialImport(),
            cssnext({autoprefixer: {browsers: ['IE >= 10']}}),
            mqPacker(),
            cssnano({autoprefixer: false})
        ]).on('error', errorHandler('css:noconcat / postcss'))) // Run PostCSS processors
        .pipe(rename(function (path) { // Rename to minified file
            path.dirname = path.dirname.split('/Private/').join('/Public/');
            path.basename = path.basename.substr(1) + '.min';
        }))
        .pipe(gulp.dest(extDist)) // Write single CSS to extension destination directory
        .pipe(rename(function (path) { // Prefix with project key
            path.dirname = '.';
            path.basename = project.key + '-' + path.basename;
        }))
        .pipe(sourcemaps.write('.')) // Write out sourcemaps
        .pipe(gulp.dest(dist + 'css')); // Write combined CSS to destination directory

    return;
});
watch.push([extDist + '*/Resources/Private/Css/**/*.css', ['css']]);


/* JAVASCRIPT
 ===================================================================================================================== */
var uglify = require('gulp-uglify');
var concatFlatten = require('gulp-concat-flatten');
var sort = require('gulp-sort');
var pump = require('pump');
gulp.task('js', function (cb) {
    pump([
            gulp.src(src + 'js/**/*.js'),
            sort(),
            concatFlatten(src + 'js', 'js').on('error', errorHandler('js / concatFlatten')),
            rename(function (path) { // Rename to minified file
                if (path.dirname !== '.') {
                    path.basename = path.dirname.split('/').shift();
                    path.dirname = '.';
                }
                path.basename += '.min';
            }),
            uglify().on('error', errorHandler('js / uglify')),
            gulp.dest(dist + 'js')
        ],
        cb
    );
});
watch.push([src + 'js/**/*.js', ['js']]);


/* ICONS
 ===================================================================================================================== */
var iconizr = require('gulp-iconizr');
gulp.task('iconizr', function () {
    return gulp.src('**/*.svg', {cwd: src + 'icons'})
        .pipe(iconizr({
            dest: '/fileadmin/' + project.key + '/',
            log: 'verbose',
            shape: {
                dest: 'icons'/*,
                 transform: [{svgo: {plugins: [{convertPathData: false}]}}],*/
            },
            icons: {
                dest: 'css',
                prefix: '.icon-%s',
                // mixin: 'icon',
                common: 'icon',
                dimensions: '-dims',
                layout: 'vertical',
                sprite: 'icons/icons.svg',
                render: {
                    css: true
                },
                bust: false,
                preview: 'icons/preview',
                loader: {
                    dest: 'js/icons-loader.html',
                    css: 'icon.%s.css'
                }
            }
        }))
        .pipe(gulp.dest(dist));
});
watch.push([src + 'icons/**/*.svg', ['iconizr']]);


/* CACHE BUSTING
 ===================================================================================================================== */
var cacheBustMeta = require('gulp-cache-bust-meta');
var templates = {};
templates[src + 'tmpl/60_page_dynamic.t3s'] = '.source/ts/page/60_page_dynamic.t3s';
gulp.task('cachebust:clean', function () {
    return gulp.src(['js/*.min.*.js', 'css/*.min.*.css'], {cwd: dist, read: false})
        .pipe(clean());
});
gulp.task('cachebust', function () {
    return gulp.src(['js/*.min.js', 'css/*.min.css'], {cwd: dist, base: dist})
        .pipe(cacheBustMeta(templates))
        .pipe(gulp.dest(dist));
});
watch.push([[dist + 'js/*.min.js', dist + 'css/*.min.css'], function () {
    sequence('cachebust:clean', 'cachebust')(errorHandler('cachebust / sequence'))
}]);


/* FAVICONS
 ===================================================================================================================== */
var favicons = require('gulp-favicons');
var filter = require('gulp-filter');
var replace = require('gulp-string-replace');
var ico = filter(['**/favicon.ico'], {restore: true});
gulp.task('favicons', function () {
    return gulp.src(src + 'favicon/favicon.png').pipe(favicons({
        appName: project.author.name,
        appDescription: project.description,
        developerName: project.developer.name,
        developerURL: project.developer.url,
        background: '#020307',
        path: '/fileadmin/' + project.key + '/favicons',
        url: project.author.url,
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/?homescreen=1',
        version: 1.0,
        logging: false,
        online: false,
        html: 'index.html',
        pipeHTML: true,
        replace: true
    }))
        .on('error', gutil.log)
        .pipe(gulp.dest(dist + 'favicons'))
        .pipe(ico)
        .pipe(gulp.dest('./web/'))
        .pipe(ico.restore)
        .pipe(filter(['**/index.html']))
        .pipe(
            replace(
                '<link rel="shortcut icon" href="/fileadmin/' + project.key + '/favicons/favicon.ico">',
                '<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/><link rel="icon" href="favicon.ico" type="image/x-icon"/>'
            )
        ).pipe(gulp.dest(dist + 'favicons'));
});


/* W3C VALIDATION
 ===================================================================================================================== */
var w3cjs = require('gulp-w3cjs');
var download = require('gulp-download');
var through2 = require('through2');
gulp.task('validate', function () {
    download(project.validate)
        .pipe(w3cjs())
        .pipe(through2.obj(function (file, enc, cb) {
            cb(null, file);
            // if (!file.w3cjs.success){
            //     throw new Error('HTML validation error(s) found');
            // }
        }));
});


/* WATCH
 ===================================================================================================================== */
gulp.task('watch', function () {
    watch.forEach(function (args) {
        gulp.watch(args[0], args[1]);
    });
});


/* DEFAULT TASK
 ===================================================================================================================== */
gulp.task('default', function () {
    // place code for your default task here
});
