'use strict';

var generators = require('yeoman-generator');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var request = require('request');
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
                                    choices.push({
                                        name: typo3versions[majorminor].releases[release].version,
                                        value: typo3versions[majorminor].releases[release].version + '|' +
                                        typo3versions[majorminor].releases[release].url.tar + '|' +
                                        typo3versions[majorminor].releases[release].checksums.tar.sha1
                                    });
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
                            choices: choices.sort(function (t3a, t3b) {
                                return (t3a.name > t3b.name) ? -1 : 1;
                            })
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
        }
    },

    /**
     * Configuration preparations
     *
     * @type {Object}
     */
    configuring: {

        /**
         * Composer preparation
         *
         * @return {void}
         */
        prepareComposer: function () {
            this.template('_composer.json', 'composer.json', this.config.getAll());
        }
    },

    /**
     * Installing routines
     *
     * @type {Object}
     */
    install: {
        /**
         * TYPO3 source installation
         *
         * @return {void}
         */
        sources: function () {
            this.log.info(chalk.yellow('Please be patient while composer downloads and installs the TYPO3 sources ...'));
            this.log();
            this.spawnCommandSync('composer', ['install']);
            this.log();
        },

        /**
         * Trigger the installation wizard
         *
         * @return {void}
         */
        firstInstall: function () {
            fs.openSync(path.join(this.destinationRoot(), 'web/FIRST_INSTALL'), 'w');
            this.log();
        },

        /**
         * Static data installation
         *
         * @return {void}
         */
        staticdata: function () {
            var staticSQL = path.join(this.destinationRoot(), 'web/typo3/sysext/extbase/ext_tables_static+adt.sql');
            if (fs.existsSync(staticSQL)) {
                fs.unlinkSync(staticSQL);
            }
            this.copy('cli_lowlevel.sql', 'web/typo3/sysext/extbase/ext_tables_static+adt.sql');
        }
    },

    /**
     * Finalizing
     *
     * @type {Object}
     */
    end: {
        /**
         * End
         *
         * @return {void}
         */
        finalize: function () {
            this.log();
            this.log(chalk.green('Great! The TYPO3 sources have been prepared successfully! Let\'s move on ...'));
            this.composeWith('tollwerk:typo3-check');
        }
    }
});
