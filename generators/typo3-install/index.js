'use strict';

var Generator = require('../../lib/TollwerkGenerator.js');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var request = require('request');
var typo3versionsURL = 'https://get.typo3.org/json';
var semver = require('semver');

module.exports = class extends Generator {
    /**
     * Prompting methods
     *
     * @type {Object}
     */
    prompting() {

        // Welcome greeting
        if (!this.options.nested) {
            this.log(yosay('You\'re about installing a TYPO3 instance.'));
        }

        var that = this;
        var done = that.async();
        request(typo3versionsURL, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var typo3versions = JSON.parse(body);
                if (typo3versions && (typo3versions.constructor === Object)) {
                    var choices = [];
                    for (var majorminor in typo3versions) {
                        if (typo3versions[majorminor].active) {
                            for (var release in typo3versions[majorminor].releases) {
                                if (semver.valid(typo3versions[majorminor].releases[release].version)) {
                                    choices.push({
                                        name: typo3versions[majorminor].releases[release].version,
                                        value: typo3versions[majorminor].releases[release].version + '|' +
                                        typo3versions[majorminor].releases[release].url.tar + '|' +
                                        typo3versions[majorminor].releases[release].checksums.tar.sha1
                                    });
                                }
                            }
                        }
                    }

                    // Ask for project key, author and TYPO3 version
                    var prompts = [{
                        name: 'project',
                        message: 'What is the project key?',
                        validate: function (name) {
                            return ('' + name).length ? true : 'The project key cannot be empty!';
                        }
                    }, {
                        name: 'title',
                        message: 'What is the project title?',
                        validate: function (name) {
                            return ('' + name).length ? true : 'The project title cannot be empty!';
                        }
                    }, {
                        name: 'author',
                        message: 'What is the site author\'s name?'
                    }, {
                        type: 'list',
                        name: 'version',
                        message: 'Which TYPO3 version should I use?',
                        choices: choices.sort((v1, v2) => semver.rcompare(v1.name, v2.name))
                    }];

                    return that.prompt(prompts).then(function (props) {
                        var t3versionUrlChecksum = props.version.split('|');
                        this.config.set('project', props.project.toLowerCase());
                        this.config.set('title', props.title);
                        this.config.set('author', props.author);
                        this.config.set('t3version', t3versionUrlChecksum[0]);
                        this.config.set('t3url', t3versionUrlChecksum[1]);
                        this.config.set('t3sha1', t3versionUrlChecksum[2]);
                        done();
                    }.bind(that));

                } else {
                    that.log.error('Couldn\t fetch the list of available TYPO3 versions. Please try again later!');
                    done();
                }
            } else {
                that.log.error('Couldn\t fetch the list of available TYPO3 versions. Please try again later!');
                done();
            }
        });
    };

    /**
     * Configuration preparations
     *
     * @type {Object}
     */
    configuring() {
        // Composer preparation
        this._template('_composer.json', 'composer.json', this.config.getAll());
    };

    /**
     * Validate and refine a list of PSR4 autoload entries
     *
     * @param {Object} psr4 PSR4 autoload entries
     * @param {Object} Refined PSR4 autoload entries
     * @private
     */
    _refinePSR4(psr4) {
        const psr4Refined = {};
        for (var ns in psr4) {
            const classesDir = path.join('public', psr4[ns]);
            try {
                if (fs.statSync(path.join(this.destinationRoot(), classesDir)).isDirectory()) {
                    psr4Refined[ns] = classesDir;
                }
            } catch (e) {
            }
        }
        return psr4Refined;
    };

    /**
     * Installing routines
     *
     * @type {Object}
     */
    install() {
        // TYPO3 source installation
        this.log.info(chalk.yellow('Please be patient while composer downloads and installs the TYPO3 sources ...'));
        this.log();
        this.spawnCommandSync('composer', ['install']);
        this.log();
    };

    /**
     * Finalizing
     *
     * @type {Object}
     */
    end() {
        // Prepare the installation for running tests
        var composer = require(path.join(this.destinationRoot(), 'composer.json'));
        composer['autoload-dev'] = require(path.join(this.destinationRoot(), 'vendor/typo3/cms/composer.json'))['autoload-dev'];
        composer['autoload-dev']['psr-4'] = this._refinePSR4(composer['autoload-dev']['psr-4']);
        composer['autoload-dev'].classmap = composer['autoload-dev'].classmap.map(function (classmapPath) {
            try {
                const classesDir = path.join('public', classmapPath);
                if (fs.statSync(path.join(this.destinationRoot(), classesDir)).isDirectory()) {
                    return classesDir;
                }
            } catch (e) {
            }
            return null;
        }).filter(d => !!d);
        fs.writeFileSync(path.join(this.destinationRoot(), 'composer.json'), JSON.stringify(composer, null, 4));

        // Trigger the installation wizard
        fs.openSync(path.join(this.destinationRoot(), 'public/FIRST_INSTALL'), 'w');
        this.log();

        // Static data installation
        var staticSQL = path.join(this.destinationRoot(), 'public/typo3/sysext/extbase/ext_tables_static+adt.sql');
        if (fs.existsSync(staticSQL)) {
            fs.unlinkSync(staticSQL);
        }
        this._copy('cli_lowlevel.sql', 'public/typo3/sysext/extbase/ext_tables_static+adt.sql');

        this.log();
        this.log(chalk.green('Great! The TYPO3 sources have been prepared successfully! Let\'s move on ...'));
        this.composeWith('tollwerk:typo3-check');
    }
};
