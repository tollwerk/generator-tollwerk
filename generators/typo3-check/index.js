'use strict';

var Generator = require('yeoman-generator');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

module.exports = class extends Generator {
    /**
     * Prompting methods
     *
     * @type {Object}
     */
    prompting() {

        // Welcome greeting
        if (!this.options.nested) {
            this.log(yosay('Please fire up your browser and surf to your new site. Run the TYPO3 installer and return here afterwards.'));
        }

        // Wait until the user has run the installer
        var prompts = [{
            type: 'confirm',
            name: 'installer',
            message: 'Have your run the installer?',
        }];

        return this.prompt(prompts).then(function (props) {
            this.installer = props.installer;
            this.installed = false;
            if (this.installer) {
                try {
                    var webdir = fs.lstatSync('public').isDirectory();
                    var src = webdir && fs.lstatSync('public/index.php').isSymbolicLink();
                    var typo3conf = webdir && fs.lstatSync('public/typo3conf').isDirectory();
                    this.installed = src && typo3conf;
                } catch (e) {
                    console.log(e);
                }
            }
        }.bind(this));
    };

    /**
     * Finalizing
     *
     * @type {Object}
     */
    end() {
        this.log();
        if (!this.installer) {
            this.log(chalk.red('Listen! Please follow my advise and you\'ll be finished shortly ...'));
            this.composeWith('tollwerk:typo3-check', { options: { nested: true } });
        } else if (this.installed) {
            this.log(chalk.green('Perfect! Let\'s move on configuring your project ...'));
            this.composeWith('tollwerk:typo3-setup');
        } else {
            this.log(chalk.red('Are your really sure? Please double-check and try again ...'));
            this.composeWith('tollwerk:typo3-check', { options: { nested: true } });
        }
    };
}
