'use strict';

var util		= require('util'),
path			= require('path'),
yeoman			= require('yeoman-generator'),
chalk			= require('chalk');

var TollwerkGenerator = module.exports = function TollwerkGenerator(args, options, config) {
	var self	= this;

	yeoman.generators.Base.apply(this, arguments);

	this.on('end', function() {
		this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg	= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TollwerkGenerator, yeoman.generators.Base);

TollwerkGenerator.prototype.askFor = function() {
	var done	= this.async();
	this.log(this.yeoman);
	this.log(chalk.magenta('You\'re using the fantastic tollwerk TYPO3 project kickstarter.'));

	var prompts = [{
		name	: 'name',
		message	: 'How should this project be called?'
	},{
		type	: 'list',
		name	: 'templating',
		message	: 'Which templating system are you going to use?',
		choices	: [{name: 'FluidTYPO3', value: 'ft3'}, {name: 'TemplaVoila!', value: 'tv'}, {name: 'None', value: 'none'}],
		default	: 'ft3'
	},{
		type	: 'confirm',
		name	: 'sass',
		message	: 'Would you like to use Sass?',
		default	: true
	},{
		type	: 'confirm',
		name	: 'iconizr',
		message	: 'Would you like to use iconizr?',
		default	: true
	},{
		type	: 'confirm',
		name	: 'favicon',
		message	: 'Would you like to include favicon / device icon support?',
		default	: true
	}];

	this.prompt(prompts, function(props) {
	 	this.name			= props.name;
		this.templating		= props.templating;
		this.sass			= props.sass;
		this.iconizr		= props.iconizr;
		this.favicon		= props.favicon;

		done();
	}.bind(this));
}
  
TollwerkGenerator.prototype.app = function() {
	this.template('_package.json', 'package.json');
	this.template('_bower.json', 'bower.json');
}
  
TollwerkGenerator.prototype.projectfiles = function() {
	this.copy('editorconfig', '.editorconfig');
	this.copy('jshintrc', '.jshintrc');
	this.template('_Gruntfile.js', 'Gruntfile.js');
}
   
TollwerkGenerator.prototype.general = function() {
	this.copy('README.md', 'fileadmin/' + this.name + '/README.md');

	// Create the fileadmin directory structure
	this.directory('fileadmin', 'fileadmin/' + this.name);

 	// Create Sass directory (if needed)
 	if (this.sass) {
 		this.directory('options/sass/fileadmin', 'fileadmin/' + this.name);
 	}
 	
 	switch (this.templating) {
 		
 		// TemplaVoila!
 		case 'tv':
 			this.directory('options/tv/fileadmin', 'fileadmin/' + this.name);
 			break;
 	}
}

TollwerkGenerator.prototype.iconizr = function() {
	if (this.iconizr) {
		this.mkdir('fileadmin/' + this.name + '/.templates/icons');
		this.mkdir('fileadmin/' + this.name + '/css/icons');
	}
}

TollwerkGenerator.prototype.favicon = function() {
	if (this.favicon) {
		this.directory('options/favicon/fileadmin', 'fileadmin/' + this.name);
		this.mkdir('fileadmin/' + this.name + '/favicons');
	}
}