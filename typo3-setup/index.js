'use strict';

var util		= require('util'),
path			= require('path'),
yeoman			= require('yeoman-generator'),
chalk			= require('chalk');

var TollwerkTypo3SetupGenerator = module.exports = function TollwerkTypo3SetupGenerator(args, options, config) {
	var self	= this;

	yeoman.generators.Base.apply(this, arguments);

	this.on('end', function() {
		this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg	= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TollwerkTypo3SetupGenerator, yeoman.generators.Base);

/**
 * Generator dialog
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.askFor = function() {
	var done		= this.async();
	
	if (!this.options.nested) {
		this.log(this.yeoman);
		this.log(chalk.magenta('You\'re about scaffolding a tollwerk style TYPO3 project.'));
	}
	this.log();

	var prompts = [{
		name	: 'project',
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
		message	: 'Would you like to include favicon / touch icon support?',
		default	: true
	},{
		type	: 'confirm',
		name	: 'squeezr',
		message	: 'Would you like to install the squeezr extension?',
		default	: true
	},{
		type	: 'confirm',
		name	: 'defr',
		message	: 'Would you like to install the defr extension?',
		default	: true
	}];

	this.prompt(prompts, function(props) {
	 	this.project		= props.project;
		this.templating		= props.templating;
		this.sass			= props.sass;
		this.iconizr		= props.iconizr;
		this.favicon		= props.favicon;
		
		// TODO: What happens if no project name is given?

		done();
	}.bind(this));
}

/**
 * NPM & Bower file installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.app = function() {
	this.template('_package.json', 'package.json');
	this.template('_bower.json', 'bower.json');
}

/**
 * Project & Gruntfile installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.projectfiles = function() {
	this.copy('editorconfig', '.editorconfig');
	this.copy('jshintrc', '.jshintrc');
	this.template('Gruntfile.js', 'Gruntfile.js');
}

/**
 * Base resource installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.baseresources = function() {
	this.copy('README.md', 'fileadmin/' + this.project + '/README.md');

	// Create the fileadmin directory structure
	this.directory('fileadmin', 'fileadmin/' + this.project);

 	// Create Sass directory (if needed)
 	if (this.sass) {
 		this.directory('options/sass/fileadmin', 'fileadmin/' + this.project);
 	}
 	
 	switch (this.templating) {
 		
 		// TemplaVoila!
 		case 'tv':
 			this.directory('options/tv/fileadmin', 'fileadmin/' + this.project);
 			break;
 	}
}

/**
 * Install the templating extensions
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.templating = function() {
	switch (this.templating) {
		
		// FluidTYPO3
		case 'ft3':
			
			break;
			
		// TemplaVoila!
		case 'tv':
		
			break;
	}
}

/**
 * iconizr installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.iconizr = function() {
	if (this.iconizr) {
		this.mkdir('fileadmin/' + this.project + '/.templates/icons');
		this.mkdir('fileadmin/' + this.project + '/css/icons');
	}
}

/**
 * Install the squeezr extension
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.squeezr = function() {
	if (this.squeezr) {
		// TODO: Put a .bowerrc file into the GitHub squeerz extension, defining typo3conf/ext as the install directory. Then, install the extension via bower (see http://bower.io/#custom-install-directory)
	}
}

/**
 * Install the defr extension
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.defr = function() {
	if (this.defr) {
	}
}

/**
 * Favicon / touch icon installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.favicon = function() {
	if (this.favicon) {
		this.directory('options/favicon/fileadmin', 'fileadmin/' + this.project);
		this.mkdir('fileadmin/' + this.project + '/favicons');
	}
}