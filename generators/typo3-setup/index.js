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
            name: 't3x_tw_squeezr',
            message: 'Would you like to install the TYPO3 extension »tw_squeezr«?',
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

            const typo3MajorVersion = parseInt(this.t3version.split('.').shift(), 10);
            const ft3Branch = (typo3MajorVersion >= 8) ? ':dev-master' : '';

            // Build a list of TYPO3 extensions to install
            this.typo3Extensions = {};
            if (props.t3x_fluid_content) {
                this.typo3Extensions['flux'] = 'fluidtypo3/flux' + ft3Branch;
                this.typo3Extensions['fluidcontent'] = 'fluidtypo3/fluidcontent' + ft3Branch;
            }
            if (props.t3x_fluid_pages) {
                this.typo3Extensions['flux'] = 'fluidtypo3/flux' + ft3Branch;
                this.typo3Extensions['fluidpages'] = 'fluidtypo3/fluidpages' + ft3Branch;
            }
            if (props.t3x_vhs) {
                this.typo3Extensions['vhs'] = 'fluidtypo3/vhs' + ft3Branch;
            }
            if (props.t3x_tw_googleanalytics) {
                this.typo3Extensions['tw_googleanalytics'] = 'tollwerk/tw-googleanalytics';
            }
            if (props.t3x_tw_squeezr) {
                this.typo3Extensions['tw_squeezr'] = 'tollwerk/tw-squeezr';
            }
            if (props.t3x_tw_componentlibrary) {
                this.typo3Extensions['tw_componentlibrary'] = 'tollwerk/tw-componentlibrary';
            }

            // Prepare the provider extension identifiers
            this.typo3ProviderExtension = {
                extkey: 'tw_' + config.project,
                dashed: 'tw-' + config.project.split('_').join('-'),
                compressed: 'tx_' + config.project.split('_').join('').toLowerCase(),
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
        // NPM & Bower file installation
        this._template('_package.json', 'package.json', this.config.getAll());

        // Project & Gruntfile installation
        this._copy('editorconfig', '.editorconfig');
        this._copy('jshintrc', '.jshintrc');
        this._copy('gitattributes', '.gitattributes');
        this._copy('robots.txt', 'web/robots.txt');
        this._template('gulpfile.js', 'gulpfile.js');

        // Configure the composer autoload entries
        var composer = require(path.join(this.destinationRoot(), 'composer.json'));
        composer.autoload = composer.autoload || {};
        composer.autoload['psr-4'] = composer.autoload['psr-4'] || {};
        composer.autoload['psr-4']['Tollwerk\\' + this.typo3ProviderExtension.upperCamelCase + '\\'] = 'web/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Classes/';
        composer.autoload['psr-4']['Tollwerk\\' + this.typo3ProviderExtension.upperCamelCase + '\\Component\\'] = 'web/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Components/';

        // If a component library will be maintained
        if (this.typo3Extensions['tw_componentlibrary']) {
            composer.autoload['psr-4']['Tollwerk\\TwComponentlibrary\\'] = 'web/typo3conf/ext/tw_componentlibrary/Classes/';
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
        this._templateDirectory('fileadmin', 'web/fileadmin/' + this.project);

        // Create the database init script
        this._mkdirp('web/typo3conf');
        this._copy('typo3conf/init.php', 'web/typo3conf/init.php');
        var typo3DbInit = 'typo3conf/init.sql';
        var typo3Version = this.config.get('t3version').split('.');
        while (typo3Version.length) {
            if (fs.existsSync(this.templatePath('typo3conf/init-' + typo3Version.join('_') + '.sql'))) {
                typo3DbInit = 'typo3conf/init-' + typo3Version.join('_') + '.sql';
                break;
            }
            typo3Version.pop();
        }
        this._template(typo3DbInit, 'web/typo3conf/init.sql');

        // Prepare a project specific provider extension
        // Create the provider extension directory structure
        this._templateDirectory('provider', 'web/typo3conf/ext/' + this.typo3ProviderExtension.extkey);

        // If fluidcontent was requested
        if (this.typo3Extensions.fluidcontent) {
            this._templateDirectory('fluidtypo3/Content', 'web/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Resources/Private/Templates/Content');
            this._template('fluidtypo3/Controller/ContentController.php', 'web/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Classes/Controller/ContentController.php');
        }

        // If fluidpages was requested
        if (this.typo3Extensions.fluidpages) {
            this._templateDirectory('fluidtypo3/Page', 'web/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Resources/Private/Templates/Page');
            this._template('fluidtypo3/Controller/PageController.php', 'web/typo3conf/ext/' + this.typo3ProviderExtension.extkey + '/Classes/Controller/PageController.php');
        }

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
            'autoprefixer',
            'css-mqpacker',
            'cssnano',
            'gulp',
            'gulp-add-src',
            'gulp-clean',
            'gulp-concat',
            'gulp-concat-flatten',
            'gulp-download',
            'gulp-favicons',
            'gulp-filter',
            'jkphl/gulp-iconizr',
            'gulp-hash-filename',
            'gulp-postcss',
            'gulp-rename',
            'gulp-sequence',
            'gulp-sort',
            'gulp-sourcemaps',
            'gulp-string-replace',
            'gulp-template',
            'gulp-uglify',
            'gulp-w3cjs',
            'gulp-watch',
            'postcss-calc',
            'postcss-critical-css',
            'postcss-cssnext',
            'postcss-discard-comments',
            'postcss-extend',
            'postcss-mixins',
            'postcss-partial-import',
            'pump',
            'shortbread',
            'through2',
            'vinyl-file',
            'vinyl-request'
        ];

        // Add Fractal & Fractal-TYPO3-Bridge upon request
        if (this.typo3Extensions['tw_componentlibrary']) {
            packages.push('@frctl/fractal');
            packages.push('tollwerk/fractal-typo3');
        }

        this.npmInstall(packages, {'save': true}, function () {
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
            this.spawnCommandSync('php', [
                './web/typo3/cli_dispatch.phpsh',
                'extbase',
                'extension:install',
                extKey
            ]);
        }

        // Install the provider extension
        this.spawnCommandSync('php', [
            './web/typo3/cli_dispatch.phpsh',
            'extbase',
            'extension:install',
            this.typo3ProviderExtension.extkey
        ]);

        // Additional database setup
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

        this._write(path.join(this.destinationRoot(), 'web/.htaccess'), htaccess.join('\n\n'));

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
