'use strict';

var util			= require('util'),
fs					= require('fs'),
path				= require('path'),
yeoman				= require('yeoman-generator'),
chalk				= require('chalk');

var TollwerkGenerator = module.exports = function TollwerkGenerator(args, options, config) {
	var that		= this;

	yeoman.generators.Base.apply(this, arguments);
	this.pkg		= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TollwerkGenerator, yeoman.generators.Base);

TollwerkGenerator.prototype.askFor = function() {
	this.log(this.yeoman);
	this.log(chalk.magenta('You\'re using the fantastic tollwerk TYPO3 project kickstarter.\n'));
}
  
TollwerkGenerator.prototype.main = function() {
	
	// Determine the current TYPO3 installation state
	var src			= false,
	typo3conf		= false;
	try {
		src			= fs.lstatSync('index.php').isSymbolicLink();
		typo3conf	= fs.lstatSync('typo3conf').isDirectory();
	} catch (e) {}
	
	// If TYPO3 is not yet present
	if (!src) {
		this.log(chalk.green('We\'ll start with installing TYPO3 ...'));
		this.invoke("tollwerk:install", {options: {nested: true}}, this.async());
		
	// Else: If the TYPO3 install tool has not yet been run
	} else if (!typo3conf) {
		console.log(chalk.red('TYPO3 has already been prepared!'));
		console.log('As a next step, please run the TYPO3 install tool in your browser and re-run this Yeoman generator afterwards.');
		
	// Else: Setup the components
	} else {
		this.log(chalk.red('You\'re using the fantastic tollwerk TYPO3 project kickstarter.'));
	}
}