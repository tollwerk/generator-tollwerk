'use strict';

var util		= require('util'),
path			= require('path'),
yeoman			= require('yeoman-generator'),
chalk			= require('chalk'),
sys				= require('sys'),
exec			= require('child_process').exec;

var TollwerkTypo3SetupGenerator = module.exports = function TollwerkTypo3SetupGenerator(args, options, config) {
	var self	= this;

	yeoman.generators.Base.apply(this, arguments);

	this.pkg	= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TollwerkTypo3SetupGenerator, yeoman.generators.Base);

/**
 * Install a TYPO3 extension
 * 
 * @param {TollwerkTypo3SetupGenerator} generator		Generator reference
 * @param {String} extension							Extension key
 * @param {Function} callback							Callback
 * @return {void}
 */
function installExtension(generator, extension, callback) {
	exec("./typo3/cli_dispatch.phpsh extbase extension:install " + extension, function (error, stdout, stderr) {
		generator.log(stdout);
		callback(error);
	});
}

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
		name	: 'baseurl',
		message	: 'What is the base URL of the site?'
	},{
		name	: 'sbaseurl',
		message	: 'What is the staging site base URL?'
	},{
		name	: 'author',
		message	: 'What is the site author\'s name?'
	},{
		type	: 'list',
		name	: 'templating',
		message	: 'Which templating system are you going to use?',
		choices	: [{name: 'FluidTYPO3', value: 'ft3'}, {name: 'TemplaVoila!', value: 'tv'}, {name: 'None', value: 'none'}],
		'default'	: 'ft3'
	},{
		type	: 'confirm',
		name	: 'sass',
		message	: 'Would you like to use Sass?',
		'default'	: true
	},{
		type	: 'confirm',
		name	: 'iconizr',
		message	: 'Would you like to use iconizr?',
		'default'	: true
	},{
		type	: 'confirm',
		name	: 'favicon',
		message	: 'Would you like to include favicon / touch icon support?',
		'default'	: true
	},{
		type	: 'confirm',
		name	: 'ga',
		message	: 'Would you like to install the Google Analytics extension (tw_googleanalytics)?',
		'default'	: true
	},{
		type	: 'confirm',
		name	: 'squeezr',
		message	: 'Would you like to install the squeezr extension (squeezr)?',
		'default'	: true
	},{
		type	: 'confirm',
		name	: 'defr',
		message	: 'Would you like to install the defr extension?',
		'default'	: true
	}];

	this.prompt(prompts, function(props) {
		
		// TODO: What happens if no project name is given?
	 	this.project		= props.project.toLowerCase();
	 	
	 	this.baseurl		= props.baseurl.length ? ((props.baseurl.toLowerCase().indexOf('http') !== 0) ? ('http://' + props.baseurl) : props.baseurl) : '';
	 	this.baseurl		= this.baseurl.length ? (this.baseurl + ((this.baseurl.lastIndexOf('/') == (this.baseurl.length - 1)) ? '' : '/')) : ''; 
	 	this.sbaseurl		= props.sbaseurl.length ? ((props.sbaseurl.toLowerCase().indexOf('http') !== 0) ? ('http://' + props.sbaseurl) : props.sbaseurl) : '';
	 	this.sbaseurl		= this.sbaseurl.length ? (this.sbaseurl + ((this.sbaseurl.lastIndexOf('/') == (this.sbaseurl.length - 1)) ? '' : '/')) : '';
		this.author			= props.author;
		this.templating		= props.templating;
		this.sass			= props.sass;
		this.iconizr		= props.iconizr;
		this.favicon		= props.favicon;
		this.ga				= props.ga;
		this.squeezr		= props.squeezr;
		this.defr			= props.defr;
		
		this.deps			= {};
		switch(this.templating) {
			case 'ft3':
				this.deps.flux					= 'fluidtypo3-flux#latest';
				this.deps.fluidpages			= 'fluidtypo3-fluidpages#latest';
				this.deps.fluidcontent			= 'fluidtypo3-fluidcontent#latest';
				this.deps.vhs					= 'fluidtypo3-vhs#latest';
				break;
			case 'tv':
//				TODO: Activate once the TemplaVoila Git repository contains a bower.json file
//				this.deps.templavoila			= 'templavoila#latest';
				break;
		}
		if (this.ga) {
			this.deps.tw_googleanalytics		= 'googleanalytics-typo3#latest';
		}
		if (this.squeezr) {
			this.deps.squeezr					= 'squeezr-typo3#latest';
		}
		if (this.defr) {
			// TODO: Create TYPO3 extension for defr
			// this.deps.defr						= 'defr-typo3#latest';
		}
		
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
	this.copy('bowerrc', '.bowerrc');
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
 	
 	// Page configuration
 	this.template('fileadmin/.templates/ts/page/10_page_config.ts', 'fileadmin/' + this.project + '/.templates/ts/page/10_page_config.ts');
 	this.template('fileadmin/.templates/ts/page/30_page_head.ts', 'fileadmin/' + this.project + '/.templates/ts/page/30_page_head.ts');
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

/**
 * Pull in dependencies
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.dependencies = function() {
	var done		= this.async();
	this.installDependencies({
		skipInstall: this.options['skip-install'],
        callback: function() {
            done();
        }.bind(this)
	});
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
			var that		= this;
			installExtension(that, 'flux', function() {
				installExtension(that, 'fluidpages', function() {
					installExtension(that, 'fluidcontent', function() {
						installExtension(that, 'vhs', that.async());
					});
				});
			});
			break;
			
		// TemplaVoila!
		case 'tv':
//			TODO: Activate once the TemplaVoila Git repository contains a bower.json file
//			installExtension(this, 'templavoila', this.async());
			break;
	}
}

/**
 * Install the Google Analytics extension
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.googleanalytics = function() {
	if (this.ga) {
		installExtension(this, 'tw_googleanalytics', this.async());
		
		// TODO: Add TypoScript
	}
}

/**
 * Install the squeezr extension
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.squeezr = function() {
	if (this.squeezr) {
		installExtension(this, 'squeezr', this.async());
		
		// TODO: Run update script or add a user hint
	}
}

/**
 * Install the defr extension
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.defr = function() {
	if (this.defr) {
		// TODO: Create TYPO3 extension for defr
	}
}

/**
 * Running the setup Grunt task
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.grunt = function() {
	this.log('run grunt');
}