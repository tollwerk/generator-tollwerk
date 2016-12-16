'use strict';

var generators = require('yeoman-generator');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var request = require('request');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var typo3versionsURL = 'https://get.typo3.org/json';

module.exports = generators.Base.extend({
    /**
     * Prompting methods
     *
     * @type {Object}
     */
    prompting: {

        /**
         * Main dialog
         *
         * @return {void}
         */
        askFor: function () {

            // Welcome greeting
            if (!this.options.nested) {
                this.log(yosay('OK, now tell me a little more about your project!'));
            }

            var done = this.async();
            var prompts = [{
                type: 'confirm',
                name: 't3x_fluid_content',
                message: 'Would you like to install the TYPO3 extension »fluid_content«?',
                'default': true
            }, {
                type: 'confirm',
                name: 't3x_fluid_pages',
                message: 'Would you like to install the TYPO3 extension »fluid_pages«?',
                'default': false
            }, {
                type: 'confirm',
                name: 't3x_vhs',
                message: 'Would you like to install the TYPO3 extension »vhs«?',
                'default': true
            }, {
                type: 'confirm',
                name: 't3x_tw_googleanalytics',
                message: 'Would you like to install the TYPO3 extension »tw_googleanalytics«?',
                'default': true
            }, {
                type: 'confirm',
                name: 't3x_squeezr',
                message: 'Would you like to install the TYPO3 extension »squeezr«?',
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
                if (props.t3x_fluid_content) {
                    this.typo3Extensions['flux'] = 'fluidtypo3/flux';
                    this.typo3Extensions['fluidcontent'] = 'fluidtypo3/fluidcontent';
                }
                if (props.t3x_fluid_pages) {
                    this.typo3Extensions['flux'] = 'fluidtypo3/flux';
                    this.typo3Extensions['fluidpages'] = 'fluidtypo3/fluidpages';
                }
                if (props.t3x_vhs) {
                    this.typo3Extensions['vhs'] = 'fluidtypo3/vhs';
                }
                if (props.t3x_tw_googleanalytics) {
                    this.typo3Extensions['tw_googleanalytics'] = 'tollwerk/tw-googleanalytics';
                }
                if (props.t3x_squeezr) {
                    this.typo3Extensions['squeezr'] = 'jkphl/squeezr';
                }
                if (props.t3x_tw_componentlibrary) {
                    this.typo3Extensions['tw_componentlibrary'] = 'tollwerk/tw-componentlibrary';
                }

                done();
            }.bind(this));
        }
    },

    /**
     * Configuration preparations
     *
     * @type {Object}
     */
    configuring: {

        /**
         * NPM & Bower file installation
         *
         * @return {void}
         */
        prepareAppFiles: function () {
            this.template('_package.json', 'package.json', this.config.getAll());
        },

        /**
         * Project & Gruntfile installation
         *
         * @return {void}
         */
        prepareProjectFiles: function () {
            this.copy('editorconfig', '.editorconfig');
            this.copy('jshintrc', '.jshintrc');
            this.copy('gitattributes', '.gitattributes');
            this.copy('robots.txt', 'web/robots.txt');
            this.template('gulpfile.js', 'gulpfile.js');
        }
    },

    /**
     * Writing generator specific files
     *
     * @type {Object}
     */
    writing: {

        /**
         * Base resource installation
         *
         * @return {void}
         */
        prepareBaseResources: function () {

            // Create the source directory structure
            this.directory('source', 'source/' + this.project);

            // Create the fileadmin directory structure
            this.directory('fileadmin', 'web/fileadmin/' + this.project);

            // Page configuration
            this.template('source/ts/page/30_page_head.t3s', 'source/' + this.project + '/ts/page/30_page_head.t3s');

            // // Create the database init script
            mkdirp.sync('web/typo3conf');
            this.copy('typo3conf/init.php', 'web/typo3conf/init.php');
            var typo3DbInit = 'typo3conf/init.sql';
            var typo3Version = this.config.get('t3version').split('.');
            while (typo3Version.length) {
                if (fs.existsSync(this.templatePath('typo3conf/init-' + typo3Version.join('_') + '.sql'))) {
                    typo3DbInit = 'typo3conf/init-' + typo3Version.join('_') + '.sql';
                    break;
                }
                typo3Version.pop();
            }
            this.copy(typo3DbInit, 'web/typo3conf/init.sql');
        },
    },

    /**
     * Pull in dependencies
     *
     * @return {void}
     */
    install: {
        /**
         * Source symlinks
         *
         * @return {void}
         */
        installSymlinks: function () {
            var symlinks = {};
            symlinks['../../../../source/' + this.project + '/html'] = 'web/fileadmin/' + this.project + '/.source/html';
            symlinks['../../../../source/' + this.project + '/lang'] = 'web/fileadmin/' + this.project + '/.source/lang';
            symlinks['../../../../source/' + this.project + '/ts'] = 'web/fileadmin/' + this.project + '/.source/ts';

            for (var target in symlinks) {
                try {
                    if (fs.lstatSync(symlinks[target]).isSymbolicLink()) {
                        continue;
                    }
                    fs.unlinkSync(symlinks[target]);
                } catch (e) {
                }
                fs.symlinkSync(target, symlinks[target]);
            }
        },

        /**
         * Install NPM dependencies
         *
         * @return {void}
         */
        installNPM: function () {
            var that = this;
            this.npmInstall([
                'autoprefixer',
                'css-mqpacker',
                'cssnano',
                'gulp',
                'gulp-cache-bust-meta',
                'gulp-clean',
                'gulp-concat',
                'gulp-concat-flatten',
                'gulp-download',
                'gulp-favicons',
                'gulp-filter',
                'jkphl/gulp-iconizr',
                'gulp-postcss',
                'gulp-rename',
                'gulp-sequence',
                'gulp-sort',
                'gulp-sourcemaps',
                'gulp-string-replace',
                'gulp-uglify',
                'gulp-w3cjs',
                'gulp-watch',
                'postcss-critical-css',
                'postcss-cssnext',
                'postcss-partial-import',
                'pump',
                'through2',
                'vinyl-request'
            ], {'save': true}, function () {
                exec('which paxctl', function (error, stdout, stderr) {
                    if (error) {
                        that.log.error('Cannot set PhantomJS PAX headers. Skipping ...');
                    } else {
                        var paxctl = stdout.trim();
                        [
                            'node_modules/iconizr/node_modules/phantomjs/lib/phantom/bin/phantomjs',
                            'node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs'
                        ].forEach(function (phamtomJS) {
                            that.spawnCommandSync(paxctl, ['-cm', phamtomJS]);
                        })
                        ;
                    }
                });

                that.log();
                that.log(chalk.green.bold('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'));
                that.log(chalk.green.bold('Congratulations - the tollwerk project kickstarter finished successfully!'));
                that.log(chalk.green.bold('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'));

                if (that.t3x_squeezr) {
                    that.log();
                    that.log(chalk.red.bold('Please remember to follow these steps to activate the squeezr extension:'));
                    that.log(chalk.yellow('1.) Visit the TYPO3 extension manager (EM) and run the squeezr update script. Repeat this each time you modify the extension\'s configuration.'));
                    that.log(chalk.yellow('2.) In the constant editor, define some image breakpoints and enable squeezr.'));
                }
            });
        },

        /**
         * Install TYPO3 extensions
         *
         * @return {void}
         */
        installTYPO3Extensions: function () {
            for (var extKey in this.typo3Extensions) {
                this.log();
                this.log('Installing TYPO3 extension »' + extKey + '« ...');
                this.spawnCommandSync('composer', ['require', this.typo3Extensions[extKey]]);
                this.spawnCommandSync('php', [
                    './web/typo3/cli_dispatch.phpsh',
                    'extbase',
                    'extension:install',
                    extKey
                ]);
            }
        },

        /**
         * Additional database setup
         *
         * @return {void}
         */
        prepareDatabase: function () {
            var that = this;
            var done = this.async();
            exec('`which php` ./web/typo3conf/init.php', function (error, stdout, stderr) {
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
        },

        /**
         * .htaccess setup
         *
         * @return {void}
         */
        installHtaccess: function () {
            var htaccess = [];

            // Get .htaccess base including caching headers
            if (this.t3x_squeezr) {
                htaccess.push(
                    this.read(
                        path.join(this.destinationRoot(), 'web/typo3conf/ext/squeezr/Resources/Private/Squeezr/.htaccess')
                    ).split('squeezr/cache').join('web/typo3temp/squeezr/cache')
                );
            } else {
                htaccess.push(this.read(path.join(this.sourceRoot(), 'htaccess/01_deflate_expires')));
            }

            // Add gzip compression and ETag optimization
            htaccess.push(this.read(path.join(this.sourceRoot(), 'htaccess/02_etag_gzip')));

            // Add TYPO3 specifics
            htaccess.push(this.read(path.join(this.sourceRoot(), 'htaccess/03_typo3')));

            this.write(path.join(this.destinationRoot(), 'web/.htaccess'), htaccess.join('\n\n'));
        },

        /**
         * Initialize a git repository
         *
         * @return {void}
         */
        installGit: function () {
            if (this.git) {
                this.template('git/_gitignore', '.gitignore');

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
    }
});
