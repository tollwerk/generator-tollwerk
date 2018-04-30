'use strict';

var Generator = require('yeoman-generator');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

module.exports = class extends Generator {
    /**
     * Main method
     */
    main() {
        if (!this.options.nested) {
            this.log(yosay('WELCOME! You\'re using the fantastic tollwerk TYPO3 project kickstarter.'));
        }
        this.log();

        // Determine the current TYPO3 installation state
        var src = false;
        var typo3conf = false;
        try {
            var webdir = fs.lstatSync('public').isDirectory();
            src = webdir && fs.lstatSync('public/index.php').isFile();
            typo3conf = webdir && fs.lstatSync('public/typo3conf').isDirectory();
        } catch (e) {
        }

        // If TYPO3 is not yet installed
        if (!src) {
            this.log(chalk.green('OK, we\'ll begin with installing TYPO3 ...'));
            this.composeWith('tollwerk:typo3-install', {options: {nested: true}});

            // Else: If the TYPO3 install tool has not been run yet
        } else if (!typo3conf) {
            this.log(chalk.yellow('Ah, the TYPO3 sources have already been prepared!'));
            this.composeWith('tollwerk:typo3-check');

            // Else: Setup the components
        } else {
            this.log(chalk.green('Cool, TYPO3 seems to be properly installed! Let\'s move on ...'));
            this.composeWith('tollwerk:typo3-setup');
        }
    }
};
