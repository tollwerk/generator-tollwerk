'use strict';

var Generator = require('../../lib/TollwerkGenerator.js');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var request = require('request');
var exec = require('child_process').exec;
var typo3versionsURL = 'https://get.typo3.org/json';

module.exports = class extends Generator {
    /**
     * Prompting methods
     *
     * @type {Object}
     */
    prompting() {

        // Welcome greeting
        if (!this.options.nested) {
            this.log(yosay('OK, now tell me a little more about your project!'));
        }

        var done = this.async();
        var prompts = [{
            type: 'confirm',
            name: 't3x_flux',
            message: 'Would you like to install the TYPO3 extension »flux«?',
            'default': true
        }, {
            type: 'confirm',
            name: 't3x_vhs',
            message: 'Would you like to install the TYPO3 extension »vhs«?',
            'default': true
        }, {
            type: 'confirm',
            name: 't3x_tw_googleanalytics',
            message: 'Would you like to install the TYPO3 extension »tw_googleanalytics«?',
            'default': false
        }, {
            type: 'confirm',
            name: 't3x_tw_componentlibrary',
            message: 'Would you like to maintain a component library?',
            'default': true
        }, {
            name: 'url',
            message: 'What\'s the URL for this project?'
        }, {
            name: 'git',
            message: 'What\'s the Git repository URL for this project?'
        }];

        this.prompt(prompts).then(function (props) {

            // Copy all properties to the configuration
            for (var prop in props) {
                this.config.set(prop, props[prop]);
            }

            // Expose the configuration as templating context
            var config = this.config.getAll();
            for (var name in config) {
                this[name] = config[name];
            }

            // Build a list of TYPO3 extensions to install
            this.typo3Extensions = {};
            if (props.t3x_flux) {
                this.typo3Extensions['flux'] = 'fluidtypo3/flux';
            }
            if (props.t3x_vhs) {
                this.typo3Extensions['vhs'] = 'fluidtypo3/vhs';
            }
            if (props.t3x_tw_googleanalytics) {
                this.typo3Extensions['tw_googleanalytics'] = 'tollwerk/tw-googleanalytics';
            }
            if (props.t3x_tw_componentlibrary) {
                this.typo3Extensions['tw_componentlibrary'] = 'tollwerk/tw-componentlibrary';
            }

            // Prepare the provider extension identifiers
            this.typo3ProviderExtension = {
                extkey: 'tw_' + config.project,
                dashed: 'tw-' + config.project.split('_').join('-'),
                compressed: 'tx_tw' + config.project.split('_').join('').toLowerCase(),
                upperCamelCase: 'Tw' + config.project.split('_').map(function (word) {
                    return word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();
                }).join('')
            };

            done();
        }.bind(this));
    };

    /**
     * Configuration preparations
     *
     * @type {Object}
     */
    configuring() {
        // NPM file installation
        this._template('_package.json', 'package.json', this.config.getAll());

        // Project & Gruntfile installation
        this._copy('editorconfig', '.editorconfig');
        this._copy('jshintrc', '.jshintrc');
        this._copy('gitattributes', '.gitattributes');
        this._copy('robots.txt', 'public/robots.txt');
        this._template('gulpfile.js', 'gulpfile.js');

        // Configure the composer autoload entries
        var composer = require(path.join(this.destinationRoot(), 'composer.json'));
        composer.autoload = composer.autoload || {};
        composer.autoload['psr-4'] = composer.autoload['psr-4'] || {};
        composer.autoload['psr-4']['Tollwerk\\' + this.typo3ProviderExtension.upperCamelCase + '\\'] = 'public/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Classes/';
        composer.autoload['psr-4']['Tollwerk\\' + this.typo3ProviderExtension.upperCamelCase + '\\Component\\'] = 'public/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Components/';

        // If a component library will be maintained
        if (this.typo3Extensions['tw_componentlibrary']) {
            composer.autoload['psr-4']['Tollwerk\\TwComponentlibrary\\'] = 'public/typo3conf/ext/tw_componentlibrary/Classes/';
        }

        fs.writeFileSync(path.join(this.destinationRoot(), 'composer.json'), JSON.stringify(composer, null, 4));
    };

    /**
     * Writing generator specific files
     *
     * @type {Object}
     */
    writing() {

        // Base resource installation
        // Create the fileadmin directory structure
        this._templateDirectory('fileadmin', 'public/fileadmin/' + this.project);

        // Create the database init script
        this._mkdirp('public/typo3conf');
        this._copy('typo3conf/init.php', 'public/typo3conf/init.php');
        var typo3DbInit = 'typo3conf/init.sql';
        var typo3Version = this.config.get('t3version').split('^').pop().split('.');
        while (typo3Version.length) {
            if (fs.existsSync(this.templatePath('typo3conf/init-' + typo3Version.join('_') + '.sql'))) {
                typo3DbInit = 'typo3conf/init-' + typo3Version.join('_') + '.sql';
                break;
            }
            typo3Version.pop();
        }
        this._template(typo3DbInit, 'public/typo3conf/init.sql');

        // Prepare a project specific provider extension
        // Create the provider extension directory structure
        this._templateDirectory('provider', 'public/typo3conf/ext/' + this.typo3ProviderExtension.extkey);

        // Prepare the Fractal installation
        if (this.typo3Extensions['tw_componentlibrary']) {

            // Create the source directory structure
            this._mkdirp('fractal/build');
            this._mkdirp('fractal/components');
            this._mkdirp('fractal/docs');
            this._mkdirp('fractal/public');

            // Fractal configuration
            this._template('fractal.js', 'fractal.js');
        }
    };

    /**
     * Pull in dependencies
     *
     * @return {void}
     */
    install() {
        // Install NPM dependencies
        var that = this;
        var packages = [
            'async',
            'autoprefixer',
            'css-mqpacker',
            'cssnano',
            'gulp',
            'gulp-add-src',
            'gulp-clean',
            'gulp-concat',
            'gulp-concat-flatten',
            'gulp-copy',
            'gulp-download',
            'gulp-favicons',
            'gulp-filter',
            'gulp-hash-filename',
            'gulp-insert',
            'gulp-intercept',
            'gulp-postcss',
            'gulp-rename',
            'gulp-sequence',
            'gulp-sort',
            'gulp-sourcemaps',
            'gulp-string-replace',
            'gulp-svg-sprite',
            'gulp-template',
            'gulp-typescript',
            'gulp-uglify',
            'gulp-w3cjs',
            'gulp-watch',
            'postcss-assets',
            'postcss-at-rules-variables',
            'postcss-calc',
            'postcss-critical-css',
            'postcss-cssnext',
            'postcss-discard-comments',
            'postcss-each',
            'postcss-extend',
            'postcss-extend-rule',
            'postcss-for',
            'postcss-mixins',
            'postcss-nested',
            'postcss-partial-import',
            'pump',
            'shortbread',
            'through2',
            'typescript',
            'vinyl-file',
            'vinyl-request'
        ];

        // Add Fractal & Fractal-TYPO3-Bridge upon request
        if (this.typo3Extensions['tw_componentlibrary']) {
            packages.push('@frctl/fractal');
            packages.push('tollwerk/fractal-typo3');
            packages.push('fractal-tenon');
        }

        this.npmInstall(packages, { 'save': true }, function () {
            exec('which paxctl', function (error, stdout, stderr) {
                if (error) {
                    that.log.error('Cannot set PhantomJS PAX headers. Skipping ...');
                } else {
                    var paxctl = stdout.trim();
                    ['node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs'].forEach(function (phamtomJS) {
                        that.spawnCommandSync(paxctl, ['-cm', phamtomJS]);
                    });
                }
            });

            // Adjust file permissions
            that.log('Adjusting file & directory permissions ...');
            that.spawnCommandSync('find', ['-type', 'f', '-exec', 'chmod', '664', '{}', '\;']);
            that.spawnCommandSync('find', ['-type', 'd', '-exec', 'chmod', '775', '{}', '\;']);

            that.log();
            that.log(chalk.green.bold('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'));
            that.log(chalk.green.bold('Congratulations - the tollwerk project kickstarter finished successfully!'));
            that.log(chalk.green.bold('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'));

            if (that.t3x_tw_squeezr) {
                that.log();
                that.log(chalk.red.bold('Please remember to follow these steps to activate the squeezr extension:'));
                that.log(chalk.yellow('1.) Visit the TYPO3 extension manager (EM) and run the squeezr update script. Repeat this each time you modify the extension\'s configuration.'));
                that.log(chalk.yellow('2.) In the constant editor, define some image breakpoints and enable squeezr.'));
            }
        });

        // Install TYPO3 extensions
        for (var extKey in this.typo3Extensions) {
            this.log();
            this.log('Installing TYPO3 extension »' + extKey + '« ...');
            this.spawnCommandSync('composer', ['require', this.typo3Extensions[extKey]]);
            this.spawnCommandSync('php', ['./vendor/bin/typo3', 'extension:install', extKey]);
        }

        // Install the base extension
        this.spawnCommandSync('php', ['./vendor/bin/typo3', 'extension:install', 'tw_base']);

        // Install the provider extension
        this.spawnCommandSync('php', ['./vendor/bin/typo3', 'extension:install', this.typo3ProviderExtension.extkey]);

        // Additional database setup
        var that = this;
        var done = this.async();
        exec('`which php` ./public/typo3conf/init.php', function (error, stdout, stderr) {
            if (error) {
                switch (error.code) {
                    case 1:
                        console.error('Initialization script must be run via CLI sapi.');
                        break;
                    case 2:
                        console.error('Local configuration could not be found.');
                        break;
                    case 3:
                        console.error('Initialization SQL could not be found or is empty.');
                        break;
                    case 4:
                        console.error('Database queries couldn\'t be performed.');
                        break;
                }
            }
            that.log(stdout);
            done(error);
        });

        // .htaccess setup
        var htaccess = [];

        // Get .htaccess base including caching headers
        if (this.t3x_tw_squeezr) {
            htaccess.push(
                this._read(
                    path.join(this.destinationRoot(), 'vendor/jkphl/squeezr/.htaccess')
                ).split('RewriteRule').join('RewriteCond %{REQUEST_URI} !^/typo3/\n    RewriteRule')
            );
        } else {
            htaccess.push(this._read(path.join(this.sourceRoot(), 'htaccess/01_deflate_expires')));
        }

        // Add gzip compression and ETag optimization
        htaccess.push(this._read(path.join(this.sourceRoot(), 'htaccess/02_etag_gzip')));

        // Add TYPO3 specifics
        htaccess.push(this._read(path.join(this.sourceRoot(), 'htaccess/03_typo3')));

        this._write(path.join(this.destinationRoot(), 'public/.htaccess'), htaccess.join('\n\n'));

        // Initialize a git repository
        if (this.git) {
            this._template('git/_gitignore', '.gitignore');

            var that = this;
            var done = this.async();

            // (Re)Initialize the Git repository
            exec('`which git` init', function (error, stdout, stderr) {
                if (!error) {

                    var setupGit = function () {
                        exec('`which git` remote add origin "' + that.git + '" && `which git` config core.filemode false', function (error, stdout, stderr) {
                            done(error);
                        });
                    };

                    // Look for existing origin entries
                    exec('`which git` remote -v', function (error, stdout, stderr) {
                        if (!error) {
                            if (stdout.length) {
                                for (var l = 0, lines = stdout.split('\n'), removeOrigin = false; l < lines.length; ++l) {
                                    if (lines[l].indexOf('origin') === 0) {
                                        removeOrigin = true;
                                        break;
                                    }
                                }

                                // If there's another origin entry: Remove it before setting up the repo
                                if (removeOrigin) {
                                    exec('`which git` remote rm origin', function (error, stdout, stderr) {
                                        if (error) {
                                            done(error);
                                        } else {

                                            // Setup the repo
                                            setupGit();
                                        }
                                    });

                                } else {

                                    // Setup the repo
                                    setupGit();
                                }

                            } else {
                                // Setup the repo
                                setupGit();
                            }

                        } else {
                            done(error);
                        }
                    });

                } else {
                    done(error);
                }
            });
        }
    }
};
