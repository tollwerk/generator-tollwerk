'use strict';

var util			= require('util'),
fs					= require('fs'),
path				= require('path'),
yeoman				= require('yeoman-generator'),
chalk				= require('chalk');

var TollwerkTypo3Generator = module.exports = function TollwerkTypo3Generator(args, options, config) {
	var that		= this;

	yeoman.generators.Base.apply(this, arguments);
	this.pkg		= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TollwerkTypo3Generator, yeoman.generators.Base);

/**
 * Main generator method
 * 
 * @return {void}
 */
TollwerkTypo3Generator.prototype.main = function() {
	if (!this.options.nested) {
		this.log(this.yeoman);
		this.log(chalk.magenta('You\'re using the fantastic tollwerk TYPO3 project kickstarter.\n'));
	}
	this.log();
	
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
		
	// Else: If the TYPO3 install tool has not yet been run
	} else if (!typo3conf) {
		console.log(chalk.yellow('Ah, the TYPO3 have already been prepared!'));
		console.log('As a next step, please run the TYPO3 install tool in your browser and re-run this Yeoman generator afterwards.');
		console.log();
		
	// Else: Setup the components
	} else {
		this.log(chalk.green('Cool, TYPO3 seems to be properly installed! Let\'s move on ...'));
		this.invoke("tollwerk:typo3-setup", {options: {nested: true}}, this.async());
	}
}