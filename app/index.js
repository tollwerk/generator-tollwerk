'use strict';

var util			= require('util'),
fs					= require('fs'),
path				= require('path'),
yeoman				= require('yeoman-generator'),
chalk				= require('chalk');

var TollwerkGenerator = module.exports = function TollwerkGenerator(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);
	this.pkg		= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TollwerkGenerator, yeoman.generators.Base);

/**
 * Generator dialog
 * 
 * @return {void}
 */
TollwerkGenerator.prototype.askFor = function() {
	var done		= this.async();
	
	this.log(this.yeoman);
	this.log(chalk.magenta('You\'re using the fantastic tollwerk project kickstarter.\n'));
	
	var prompts 	= [{
		type		: 'list',
		name		: 'type',
		message		: 'What type of project do you want to create?',
		choices		: [{name: 'TYPO3 project', value: 'typo3'}],
		'default'	: 'typo3'
	}];

	this.prompt(prompts, function(props) {
	 	this.type	= props.type;
	 	done();
	}.bind(this));
}

/**
 * Main generator method
 * 
 * @return {void}
 */
TollwerkGenerator.prototype.main = function() {
	switch(this.type) {
		
		// Create a TYPO3 project
		case 'typo3':
			this.invoke("tollwerk:typo3", {options: {nested: true}}, this.async());
			break;
	}
}