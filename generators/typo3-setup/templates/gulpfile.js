/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-param-reassign */

/* PROJECT CONFIGURATION
 ================================================================================================ */
const project = {
    key: '<%= project %>',
    extkey: '<%= typo3ProviderExtension.extkey %>',
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
const fspath = require('path');
const concatFlatten = require('gulp-concat-flatten');

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

const dist = `./public/fileadmin/${project.key}/`;
const extDist = './public/typo3conf/ext/';
const providerExt = `${extDist}${project.extkey}/`;
const watch = [];


/* POSTCSS + PLUGINS
 ================================================================================================ */
const postcss = require('gulp-postcss');
const postcssAtVariables = require('postcss-at-rules-variables');
const postcssSimplevars = require('postcss-simple-vars');
const postcssFor = require('postcss-for');
const postcssEach = require('postcss-each');
const postcssExtend = require('postcss-extend-rule');
const cssnano = require('cssnano');
const cssnext = require('postcss-cssnext');
const mixins = require('postcss-mixins');
const partialImport = require('postcss-partial-import');
const critical = require('postcss-critical-css');
const comments = require('postcss-discard-comments');
const insert = require('gulp-insert');
const nested = require('postcss-nested');
const assets = require('postcss-assets');
const glob = require('glob');

gulp.task('css', () => {
    // Find a list of CSS resources to be imported for ALL compilations
    const autoIncludes = glob.sync(fspath.resolve(`${providerExt}/Configuration/Css/**/*.css`), { cwd: '/' });

    gulp.src(['*/Resources/Private/Partials/**/*.css', '!*/Resources/Private/Partials/*/_*/**/*.css'], { cwd: extDist })

    // Initialize sourcemaps
        .pipe(sourcemaps.init())

        // Flatten directories
        .pipe(concatFlatten(`${extDist}*/Resources/Private/Partials/*/*`, 'css').on('error', errorHandler('css / concatFlatten')))

        // Import auto includes
        .pipe(insert.transform(function (contents, file) {
            autoIncludes.forEach((f) => {
                contents = `@import "${fspath.relative(fspath.dirname(file.path), f)}";\n${contents}`;
            })
            return contents;
        }))

        // Run PostCSS processors
        .pipe(postcss([
            partialImport(),
            postcssAtVariables(),
            mixins(),
            postcssFor(),
            postcssEach(),
            nested(),
            postcssSimplevars(),
            comments(),
            postcssExtend(),
            cssnext({
                autoprefixer: { browsers: ['IE >= 11'] },
                features: { customProperties: { warnings: false } }
            }),
            assets({ loadPaths: [`${providerExt}/Resources/Public/Fonts`] }),
            critical({
                outputPath: `${dist}css`,
                outputDest: `${project.key}-critical.css`,
                preserve: true,
                minify: false,
            }),
            cssnano({ autoprefixer: false, zindex: false }),
        ]).on('error', errorHandler('css:concat / postcss')))

        // Rename to minified component resource
        .pipe(rename((path) => {
            let p = path.dirname.split(fspath.sep);
            path.basename = ((path.basename.substr(0, 1) === '_') ? '_' : '') + p.pop() + '.min';
            path.dirname = path.dirname.split('/Private/')[0] + '/Public/' + p.pop();
        }))

        // Write atomic component CSS to extension destination directory
        .pipe(gulp.dest(extDist))

        // Exclude internal CSS resources
        .pipe(filter(['**', '!**/_*.css']))

        // Concatenate all CSS resources
        .pipe(concat(`${project.key}-default.min.css`))

        // Write out sourcemaps
        .pipe(sourcemaps.write('.'))

        // Write monolithic CSS to destination directory
        .pipe(gulp.dest(`${dist}css`));
});

// Watch all CSS resources
watch.push([
    [`${extDist}*/Configuration/Css/**/*.css`, `${extDist}*/Resources/Private/Partials/**/*.css`],
    ['css']
]);


/* JAVASCRIPT
 ================================================================================================ */
const uglify = require('gulp-uglify');
const sort = require('gulp-sort');
const pump = require('pump');
const typescript = require('gulp-typescript');

// Concatenable JS resources
gulp.task('js:concat', (cb) => {
    // Prepare filters for critical and non-critical JavaScript resources
    const critical = filter(['**/*.critical.min.js'], { restore: true });
    const noncritical = filter(['**/*.default.min.js'], { restore: true });

    pump([
        // Source all relevant JavaScript resources
        gulp.src([
            '*/Resources/Private/Partials/**/*.js',
            '!*/Resources/Private/Partials/**/_*.js',
            '!*/Resources/Private/Partials/*/_*/**/*.js'
        ], { cwd: extDist }),

        // Initialize sourcemaps
        sourcemaps.init(),

        // Sort resources by path
        sort(),

        // Flatten directories
        concatFlatten(`${extDist}*/Resources/Private/Partials/*/*`, 'js').on('error', errorHandler('js:concat / concatFlatten')),

        // Rename to minified component resource
        rename((path) => {
            let p = path.dirname.split(fspath.sep);
            path.basename = p.pop() + ((path.basename.toLocaleLowerCase() === 'critical') ? '.critical' : '.default') + '.min';
            path.dirname = p.join(fspath.sep).split('/Private/Partials/').join('/Public/');
        }),

        // Transpile to ES5
        typescript({ target: 'ES5', allowJs: true }),

        // Minify
        uglify().on('error', errorHandler('js:concat / uglify')),

        // Write atomic component JavaScript to extension destination directory
        gulp.dest(extDist),

        // Filter critical resources
        critical,

        // Concatenate critical resources
        concat(`${project.key}-critical.min.js`),

        // Write out sourcemaps for critical resources
        sourcemaps.write('.'),

        // Write monolithic critical JavaScript to destination directory
        gulp.dest(`${dist}js`),

        // Restore all resources
        critical.restore,

        // Filter non-critical resources
        noncritical,

        // Concatenate non-critical resources
        concat(`${project.key}-default.min.js`),

        // Write out sourcemaps for non-critical resources
        sourcemaps.write('.'),

        // Write monolithic non-critical JavaScript to destination directory
        gulp.dest(`${dist}js`),
    ], cb);
});

// Standalone scripts
gulp.task('js:compile', (cb) => {
    pump([
        // Source all relevant JavaScript resources
        gulp.src(['*/Resources/Private/Partials/**/_*.js'], { cwd: extDist }),

        // Sort resources by path
        sort(),

        // Flatten directories
        concatFlatten(`${extDist}*/Resources/Private/Partials/*/*`, 'js').on('error', errorHandler('js:concat / concatFlatten')),

        // Rename to minified component resource
        rename((path) => {
            let p = path.dirname.split(fspath.sep);
            path.basename = '_' + p.pop() + '.min';
            path.dirname = p.join(fspath.sep).split('/Private/Partials/').join('/Public/');
        }),

        // Transpile to ES5
        typescript({ target: 'ES5', allowJs: true }),

        // Minify
        uglify().on('error', errorHandler('js:concat / uglify')),

        // Write atomic JavaScript to destination directory
        gulp.dest(extDist)
    ], cb);
});

// Watch all JavaScript resources
watch.push([[`${extDist}*/Resources/Private/Partials/**/*.js`], ['js:concat', 'js:compile']]);


/* ICONS
 ================================================================================================ */
const svgSprite = require('gulp-svg-sprite');

gulp.task('icons', () => gulp.src('**/*.svg', { cwd: `${providerExt}Resources/Private/Icons` })
    // Process icons
        .pipe(svgSprite({
            // log: 'verbose',
            shape: { dest: `../../../${providerExt}Resources/Public/Icons` },
            svg: {
                xmlDeclaration: false,
                doctypeDeclaration: false
            },
            mode: {
                css: {
                    dest: `../../../${providerExt}Resources/Private/Partials/Styles/Icons`,
                    prefix: '.icon-%s',
                    common: 'icon',
                    dimensions: '-dims',
                    layout: 'vertical',
                    sprite: 'icons/icons.svg',
                    render: {
                        css: {
                            dest: `_Styles.css`,
                        },
                    },
                    bust: false
                },
            }
        }))

        // Rename to minified resource
        .pipe(rename((path) => {
            if (path.basename === 'icons' && path.extname === '.svg') {
                path.dirname = 'css/icons';
            }
        }))

        // Write out resulting resources
        .pipe(gulp.dest(dist))
);

// Watch all private icon resources
watch.push([`${providerExt}Resources/Private/Icons/**/*.svg`, ['icons']]);


/* CACHE BUSTING & RESOURCE LOADING
 ================================================================================================ */
const hash = require('gulp-hash-filename');
const shortbread = require('shortbread').stream;
const vinyl = require('vinyl-file');
const template = require('gulp-template');
const async = require('async');

// Clean previously compiled resources
gulp.task('cachebust:clean', () => {
    return gulp.src([`js/*.min.*.js`, 'css/*.min.*.css'], { cwd: dist, read: false }).pipe(clean());
});

// Create hashed versions of existing resources
gulp.task('cachebust:hash', () => {
    return gulp.src([`${dist}js/*.min.js`, `${dist}css/*.min.css`], { base: 'public' })
        .pipe(hash({ format: '{name}.{hash:8}{ext}' }))
        .pipe(gulp.dest('public'));
});

// Compile hashed resources
gulp.task('cachebust:compile', () => {
    let criticalCSS;

    // Prepare a filter for template files
    const tmpl = filter(['**/*.t3s', '**/*.jst'], { restore: true });

    // Determine the critical CSS resource
    try {
        criticalCSS = vinyl.readSync(`${dist}css/${project.key}-critical.css`);
    } catch (e) {
        criticalCSS = null;
    }

    // Determine the critical JavaScript resource
    try {
        criticalJS = vinyl.readSync(`${dist}js/${project.key}-critical.min.js`);
    } catch (e) {
        criticalJS = null;
    }

    // Source relevant resources (including templates)
    return gulp.src(
        [
            `${dist}js/*.min.*.js`,
            `${dist}css/*-default.min.*.css`,
            `${providerExt}Resources/Private/TypoScript/35_page_resources.t3s`,
            `${providerExt}Resources/Private/JavaScript/Resources.jst`
        ],
        { base: 'public' })

    // Rename resources (where necessary)
        .pipe(rename((path) => {
            switch (path.extname) {
                case '.t3s':
                    path.dirname = 'Configuration/TypoScript/Main/Page';
                    break;
                case '.jst':
                    path.basename = '100_resources';
                    path.dirname = 'Resources/Private/JavaScript/Serviceworker';
                    break;
            }
        }))

        // Compile shortbread fragments
        .pipe(shortbread([criticalJS, criticalCSS], null, null, {
            initial: `Resources/Private/Fragments/Initial.html`,
            subsequent: `Resources/Private/Fragments/Subsequent.html`,
            prefix: `/`,
        }))

        // Filter template resources
        .pipe(tmpl)

        // Run templating process
        .pipe(template({
            site: project.key,
            providerExt: `/typo3conf/ext/${project.extkey}/`,
        }, { interpolate: /\{\{(.+?)\}\}/g }))

        // Restore all resources
        .pipe(tmpl.restore)

        // Write out compiled resources
        .pipe(gulp.dest(providerExt));
});

// Overall cache busting task
gulp.task('cachebust', () => {
    sequence('cachebust:clean', 'cachebust:hash', 'cachebust:compile')(errorHandler('cachebust / sequence'));
});

// Watch all relevant resources
watch.push([[`${dist}js/*.min.js`, `${dist}css/*.min.css`], ['cachebust']]);


/* SERVICE WORKER
 ================================================================================================ */
const copy = require('gulp-copy');
const intercept = require('gulp-intercept');
const crypto = require('crypto');

// Copy shared resource to service worker resources
gulp.task('js:caching', () => {
    return gulp.src('Resources/Private/Partials/Styles/Base/Scripts/300_caching.js', { cwd: providerExt })
        .pipe(copy(`${providerExt}Resources/Private/JavaScript/Serviceworker`, { prefix: 6 }));
});
watch.push([[`${providerExt}Resources/Private/Partials/Styles/Base/Scripts/300_caching.js`], ['js:caching']]);

// Compile service worker
gulp.task('js:serviceworker', () => {
    return gulp.src('Resources/Private/JavaScript/Serviceworker/*.js*', { cwd: providerExt })

    // Sort resources by path
        .pipe(sort())

        // Concatenate to service worker resource
        .pipe(concat(`serviceworker.js`))

        // Transpile to ES5
        .pipe(typescript({ target: 'ES5', allowJs: true }))

        // Minify
        .pipe(uglify().on('error', errorHandler('js:concat / uglify')))

        // Inject version
        .pipe(intercept(function (file) {
            const content = file.contents.toString();
            const version = crypto.createHash('md5').update(content).digest('hex');
            file.contents = new Buffer(content.split('VERSION').join(version));
            return file;
        }))

        // Write out to service worker file
        .pipe(gulp.dest('./public/'));
});
watch.push([[`${providerExt}Resources/Private/JavaScript/Serviceworker/*.js*`], ['js:serviceworker']]);


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
