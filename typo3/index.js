'use strict';

var util			= require('util'),
fs					= require('fs'),
path				= require('path'),
generators			= require('yeoman-generator'),
yosay				= require('yosay'),
chalk				= require('chalk');

// Main module export
module.exports = generators.Base.extend({

	/**
	 * Constructor
	 * 
	 * @return {void}
	 */
	constructor: function() {
		generators.Base.apply(this, arguments);
		this.pkg	= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
		this.config.save();
	},
	
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
		askFor: function() {
		
			// Welcome greeting
			if (!this.options.nested) {
				this.log(yosay('WELCOME! You\'re using the fantastic tollwerk TYPO3 project kickstarter.'));
			}
			
			// Determine the current TYPO3 installation state
			var src			= false,
			typo3conf		= false;
			try {
				src			= fs.lstatSync('index.php').isSymbolicLink();
				typo3conf	= fs.lstatSync('typo3conf').isDirectory();
			} catch (e) {}
			
			// If TYPO3 is not yet installed
			if (!src) {
				this.log(chalk.green('OK, we\'ll begin with installing TYPO3 ...'));
				this.invoke("tollwerk:typo3-install", {options: {nested: true}}, this.async());
				
			// Else: If the TYPO3 install tool has not been run yet
			} else if (!typo3conf) {
				console.log(chalk.yellow('Ah, the TYPO3 sources have already been prepared!'));
				console.log('As a next step, please run the TYPO3 install tool in your browser and re-run this Yeoman generator afterwards.');
				console.log();
				
			// Else: Setup the components
			} else {
				this.log(chalk.green('Cool, TYPO3 seems to be properly installed! Let\'s move on ...'));
				this.invoke("tollwerk:typo3-setup", {options: {nested: true}}, this.async());
			}
		}
	}
});