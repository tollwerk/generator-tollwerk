'use strict';

const generators = require('yeoman-generator');
const yosay = require('yosay');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = generators.Base.extend({

    /**
     * Main method
     */
    main: function () {
        if (!this.options.nested) {
            this.log(yosay('WELCOME! You\'re using the fantastic tollwerk TYPO3 project kickstarter.'));
        }
        this.log();

        // Determine the current TYPO3 installation state
        var src = false;
        var typo3conf = false;
        try {
            var web = fs.lstatSync('web').isDirectory();
            src = web && fs.lstatSync('web/index.php').isSymbolicLink();
            typo3conf = web && fs.lstatSync('web/typo3conf').isDirectory();
        } catch (e) {
        }

        // If TYPO3 is not yet installed
        if (!src) {
            this.log(chalk.green('OK, we\'ll begin with installing TYPO3 ...'));
            this.composeWith("tollwerk:typo3-install", {options: {nested: true}});

            // Else: If the TYPO3 install tool has not been run yet
        } else if (!typo3conf) {
            this.log(chalk.yellow('Ah, the TYPO3 sources have already been prepared!'));
            this.composeWith("tollwerk:typo3-check");

            // Else: Setup the components
        } else {
            this.log(chalk.green('Cool, TYPO3 seems to be properly installed! Let\'s move on ...'));
            this.composeWith("tollwerk:typo3-setup");
        }
    }
});
