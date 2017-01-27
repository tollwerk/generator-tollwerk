/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */

/* PROJECT CONFIGURATION
 ================================================================================================ */
const project = {
    key: '<%= project %>',
    description: '<%= title %>',
    author: {
        name: '<%= author %>',
        url: '<%= url %>',
    },
    developer: {
        name: 'tollwerk GmbH',
        url: 'https://tollwerk.de',
    },
    validate: [],
};


/* GENERAL SETUP
 ================================================================================================ */
const gulp = require('gulp');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const sequence = require('gulp-sequence');
const sourcemaps = require('gulp-sourcemaps');
const filter = require('gulp-filter');

/**
 * Stream error handler generator
 *
 * @param {String} task Task name
 * @return {Function} Error handler
 */
function errorHandler(task) {
    return function taskError(err) {
        if (err) {
            gutil.log(gutil.colors.red(`ERROR in task "${task}"`));
            gutil.log(err.message);
            this.emit('end', new gutil.PluginError(task, err));
        }
    };
}

const dist = `./web/fileadmin/${project.key}/`;
const extDist = './web/typo3conf/ext/';
const providerExt = `${extDist}<%= typo3ProviderExtension.extkey %>/`;
const watch = [];


/* POSTCSS + PLUGINS
 ================================================================================================ */
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const extend = require('postcss-extend');
const partialImport = require('postcss-partial-import');
const mqPacker = require('css-mqpacker');
const critical = require('postcss-critical-css');

gulp.task('css', () => {
    // Concatenable CSS resources
    gulp.src(['*/Resources/Private/Css/*.css', '!*/Resources/Private/Css/_*.css'], { cwd: extDist })
        .pipe(sourcemaps.init()) // Initialize sourcemaps
        .pipe(postcss([
            partialImport(),
            extend(),
            cssnext({ autoprefixer: { browsers: ['IE >= 10'] } }),
            critical({
                outputPath: `${dist}css`,
                outputDest: `${project.key}-critical.css`,
                preserve: true,
                minify: false,
            }),
            mqPacker(),
            cssnano({ autoprefixer: false, zindex: false }),
        ]).on('error', errorHandler('css:concat / postcss'))) // Run PostCSS processors
        .pipe(rename((path) => { // Rename to minified file
            path.dirname = path.dirname.split('/Private/').join('/Public/');
            path.basename += '.min';
        }))
        .pipe(gulp.dest(extDist)) // Write single CSS to extension destination directory
        .pipe(concat(`${project.key}.min.css`))
        .pipe(sourcemaps.write('.')) // Write out sourcemaps
        .pipe(gulp.dest(`${dist}css`)); // Write combined CSS to destination directory

    // Non-Concatenable CSS resources
    gulp.src('*/Resources/Private/Css/_*.css', { cwd: extDist })
        .pipe(sourcemaps.init()) // Initialize sourcemaps
        .pipe(postcss([
            partialImport(),
            extend(),
            cssnext({ autoprefixer: { browsers: ['IE >= 10'] } }),
            mqPacker(),
            cssnano({ autoprefixer: false, zindex: false }),
        ]).on('error', errorHandler('css:noconcat / postcss'))) // Run PostCSS processors
        .pipe(rename((path) => { // Rename to minified file
            path.dirname = path.dirname.split('/Private/').join('/Public/');
            path.basename = `${path.basename.substr(1)}.min`;
        }))
        .pipe(gulp.dest(extDist)) // Write single CSS to extension destination directory
        .pipe(rename((path) => { // Prefix with project key
            path.dirname = '.';
            path.basename = `${project.key}-${path.basename}`;
        }))
        .pipe(sourcemaps.write('.')) // Write out sourcemaps
        .pipe(gulp.dest(`${dist}css`)); // Write combined CSS to destination directory
});
watch.push([`${extDist}*/Resources/Private/Css/**/*.css`, ['css']]);


/* JAVASCRIPT
 ================================================================================================ */
const uglify = require('gulp-uglify');
const concatFlatten = require('gulp-concat-flatten');
const sort = require('gulp-sort');
const pump = require('pump');

// Concatenable JS resources
gulp.task('js:concat', (cb) => {
    pump([
        gulp.src([
            '*/Resources/Private/Javascript/**/*.js',
            '!*/Resources/Private/Javascript/_*',
            '!*/Resources/Private/Javascript/_*/**/*.js',
        ], { cwd: extDist }),
        sourcemaps.init(),
        sort(),
        concatFlatten(`${extDist}*/Resources/Private/Javascript`, 'js').on('error', errorHandler('js:concat / concatFlatten')),
        rename((path) => { // Rename to minified file
            path.dirname = path.dirname.split('/Private/').join('/Public/');
            path.basename += '.min';
        }),
        uglify().on('error', errorHandler('js:concat / uglify')),
        gulp.dest(extDist), // Write single JavaScript files to extension destination directory
        concat(`${project.key}.min.js`),
        sourcemaps.write('.'), // Write out sourcemaps
        gulp.dest(`${dist}js`), // Write combined JavaScript file to destination directory
    ], cb);
});
watch.push([
    [
        `${extDist}*/Resources/Private/Javascript/**/*.js`,
        `!${extDist}*/Resources/Private/Javascript/_*`,
        `!${extDist}*/Resources/Private/Javascript/_*/**/*.js`,
    ],
    ['js:concat'],
]);

// Non-concatenable JS resources
gulp.task('js:noconcat', (cb) => {
    pump([
        gulp.src(['*/Resources/Private/Javascript/_*.js', '*/Resources/Private/Javascript/_*/**/*.js'], { cwd: extDist }),
        sourcemaps.init(),
        sort(),
        concatFlatten(`${extDist}*/Resources/Private/Javascript`, 'js').on('error', errorHandler('js:noconcat / concatFlatten')),
        rename((path) => { // Rename to minified file
            path.dirname = path.dirname.split('/Private/').join('/Public/');
            path.basename = `${path.basename.substr(1)}.min`;
        }),
        uglify().on('error', errorHandler('js:noconcat / uglify')),
        gulp.dest(extDist), // Write single JavaScript files to extension destination directory
        rename((path) => { // Prefix with project key
            path.dirname = '.';
            path.basename = `${project.key}-${path.basename}`;
        }),
        sourcemaps.write('.'), // Write out sourcemaps
        gulp.dest(`${dist}js`), // Write single JavaScript files to destination directory
    ], cb);
});
watch.push([
    [`${extDist}*/Resources/Private/Javascript/_*.js`, `${extDist}*/Resources/Private/Javascript/_*/**/*.js`],
    ['js:noconcat'],
]);


/* ICONS
 ================================================================================================ */
const iconizr = require('gulp-iconizr');

gulp.task('iconizr', () => gulp.src('**/*.svg', { cwd: `${providerExt}Resources/Private/Icons` })
    .pipe(iconizr({
        dest: `/fileadmin/${project.key}/`,
        log: 'verbose',
        shape: {
            dest: 'icons', /* ,
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
                css: true,
            },
            bust: false,
            preview: 'icons/preview',
            loader: {
                dest: 'js/icons-loader.html',
                css: 'icon.%s.css',
            },
        },
    }))
    .pipe(gulp.dest(dist)));
watch.push([`${providerExt}Resources/Private/Icons/**/*.svg`, ['iconizr']]);


/* CACHE BUSTING & RESOURCE LOADING
 ================================================================================================ */
const hash = require('gulp-hash-filename');
const addsrc = require('gulp-add-src');
const shortbread = require('shortbread').stream;
const vinyl = require('vinyl-file');
const template = require('gulp-template');

gulp.task('cachebust:clean', () => gulp.src(['js/*.min.*.js', 'css/*.min.*.css'], { cwd: dist, read: false })
    .pipe(clean()));
gulp.task('cachebust', () => {
    let criticalCSS;
    try {
        criticalCSS = vinyl.readSync(`${dist}css/${project.key}-critical.css`);
    } catch (e) {
        criticalCSS = null;
    }
    const tmpl = filter(['**/*.t3s'], { restore: true });

    return gulp.src([`${dist}js/*.min.js`, `${dist}css/*.min.css`], { base: 'web' })
        .pipe(hash({ format: '{name}.{hash:8}{ext}' }))
        .pipe(gulp.dest('web'))
        .pipe(addsrc(`${providerExt}Resources/Private/TypoScript/35_page_resources.t3s`))
        .pipe(rename((path) => { // Rename to minified file
            if (path.extname === '.t3s') {
                path.dirname = 'Configuration/TypoScript/Main/Page';
            }
        }))
        .pipe(shortbread(criticalCSS, null, null, {
            initial: 'Resources/Private/Fragments/Initial.html',
            subsequent: 'Resources/Private/Fragments/Subsequent.html',
            prefix: '/',
        }))
        .pipe(tmpl)
        .pipe(template({}, { interpolate: /\{\{(.+?)\}\}/g }))
        .pipe(tmpl.restore)
        .pipe(gulp.dest(providerExt));
});
watch.push([[`${dist}js/*.min.js`, `${dist}css/*.min.css`], () => {
    sequence('cachebust:clean', 'cachebust')(errorHandler('cachebust / sequence'));
}]);


/* FAVICONS
 ================================================================================================ */
const favicons = require('gulp-favicons');
const replace = require('gulp-string-replace');

const ico = filter(['**/favicon.ico'], { restore: true });

gulp.task('favicons', () => {
    gulp.src(`${providerExt}Resources/Private/Favicon/favicon.png`)
        .pipe(favicons({
            appName: project.author.name,
            appDescription: project.description,
            developerName: project.developer.name,
            developerURL: project.developer.url,
            background: '#020307',
            path: `/fileadmin/${project.key}/favicons`,
            url: project.author.url,
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/?homescreen=1',
            version: 1.0,
            logging: false,
            online: false,
            html: 'favicons.html',
            pipeHTML: true,
            replace: true,
        }).on('error', gutil.log))
        .pipe(gulp.dest(`${dist}favicons`))
        .pipe(ico)
        .pipe(gulp.dest('./web/'))
        .pipe(ico.restore)
        .pipe(filter(['**/favicons.html']))
        .pipe(replace(
            `<link rel="shortcut icon" href="/fileadmin/${project.key}/favicons/favicon.ico">`,
            '<link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/><link rel="icon" href="favicon.ico" type="image/x-icon"/>'
        ))
        .pipe(gulp.dest(`${dist}favicons`));
});


/* W3C VALIDATION
 ================================================================================================ */
const w3cjs = require('gulp-w3cjs');
const download = require('gulp-download');
const through2 = require('through2');

gulp.task('validate', () => {
    download(project.validate)
        .pipe(w3cjs())
        .pipe(through2.obj((file, enc, cb) => {
            cb(null, file);
            // if (!file.w3cjs.success){
            //     throw new Error('HTML validation error(s) found');
            // }
        }));
});


/* WATCH
 ================================================================================================ */
gulp.task('watch', () => {
    watch.forEach((args) => {
        gulp.watch(args[0], args[1]);
    });
});


/* DEFAULT TASK
 ================================================================================================ */
gulp.task('default', () => {
    // place code for your default task here
});
