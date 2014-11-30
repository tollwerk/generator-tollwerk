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
 * Uninstall a TYPO3 extension
 * 
 * @param {TollwerkTypo3SetupGenerator} generator		Generator reference
 * @param {String} extension							Extension key
 * @param {Function} callback							Callback
 * @return {void}
 */
function uninstallExtension(generator, extension, callback) {
	exec("./typo3/cli_dispatch.phpsh extbase extension:uninstall " + extension, function (error, stdout, stderr) {
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
		name		: 'project',
		message		: 'How should this project be called?',
		validate	: function(name) {
			return ('' + name).length ? true : 'The project name cannot be empty!';
		}
	},{
		name		: 'baseurl',
		message		: 'What is the base URL of the site?'
	},{
		name		: 'sbaseurl',
		message		: 'What is the staging site base URL?'
	},{
		name		: 'author',
		message		: 'What is the site author\'s name?'
	},{
		type		: 'list',
		name		: 'templating',
		message		: 'Which templating system are you going to use?',
		choices		: [{name: 'None', value: 'none'}, {name: 'TemplaVoila!', value: 'tv'}, {name: 'FluidTYPO3', value: 'ft3'}],
		'default'	: 'none'
	},{
		type		: 'confirm',
		name		: 'sass',
		message		: 'Would you like to use Sass?',
		'default'	: true
	},{
		type		: 'confirm',
		name		: 'iconizr',
		message		: 'Would you like to use iconizr?',
		'default'	: true
	},{
		type		: 'confirm',
		name		: 'favicon',
		message		: 'Would you like to include favicon / touch icon support?',
		'default'	: true
	},{
		type		: 'confirm',
		name		: 'ga',
		message		: 'Would you like to install the Google Analytics extension (tw_googleanalytics)?',
		'default'	: true
	},{
		type		: 'confirm',
		name		: 'squeezr',
		message		: 'Would you like to install the squeezr extension (squeezr)?',
		'default'	: false
	},{
		type		: 'confirm',
		name		: 'defr',
		message		: 'Would you like to install the defr extension?',
		'default'	: false
	},{
		name		: 'git',
		message		: 'Associate with Git repository (git)?'
	}];

	this.prompt(prompts, function(props) {
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
		this.git			= props.git;
		
		this.deps			= {};
		switch(this.templating) {
			case 'ft3':
				this.deps.flux					= 'fluidtypo3-flux#latest';
				this.deps.fluidpages			= 'fluidtypo3-fluidpages#latest';
				this.deps.fluidcontent			= 'fluidtypo3-fluidcontent#latest';
				this.deps.vhs					= 'fluidtypo3-vhs#latest';
				break;
			case 'tv':
				this.deps.templavoila			= 'templavoila#latest';
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
TollwerkTypo3SetupGenerator.prototype.prepareAppFiles = function() {
	this.template('_package.json', 'package.json');
	this.template('_bower.json', 'bower.json');
}

/**
 * Project & Gruntfile installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareProjectFiles = function() {
	this.copy('editorconfig', '.editorconfig');
	this.copy('jshintrc', '.jshintrc');
	this.copy('bowerrc', '.bowerrc');
	this.copy('robots.txt', 'robots.txt');
	this.template('Gruntfile.js', 'Gruntfile.js');
}

/**
 * Base resource installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareBaseResources = function() {

	// Create the fileadmin directory structure
	this.directory('fileadmin', 'fileadmin/' + this.project);

	// Copy the general READMY
	this.copy('README.md', 'fileadmin/' + this.project + '/README.md');
	
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
 	
 	// Create the init scripts
	this.directory('typo3conf', 'typo3conf');
}

/**
 * iconizr installation
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareIconizr = function() {
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
TollwerkTypo3SetupGenerator.prototype.prepareFavicon = function() {
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
TollwerkTypo3SetupGenerator.prototype.prepareDependencies = function() {
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
TollwerkTypo3SetupGenerator.prototype.prepareTemplating = function() {
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
			installExtension(this, 'templavoila', this.async());
			break;
	}
}

/**
 * Install the Google Analytics extension
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareGoogleanalytics = function() {
	if (this.ga) {
		installExtension(this, 'tw_googleanalytics', this.async());
	}
}

/**
 * Install the squeezr extension
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareSqueezr = function() {
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
TollwerkTypo3SetupGenerator.prototype.prepareDefr = function() {
	if (this.defr) {
		// TODO: Create TYPO3 extension for defr
	}
}

/**
 * Additional database setup
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareDatabase = function() {
	var that = this;
	exec("`which php` ./typo3conf/init.php", function (error, stdout, stderr) {
		that.log(stdout);
		that.async(error);
	});
}

/**
 * .htaccess setup
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareHtaccess = function() {
	var htaccess		= [];
	
	// Get .htaccess base including caching headers
	if (this.squeezr) {
		htaccess.push(this.read(path.join(this.destinationRoot(), 'typo3conf/ext/squeezr/Resources/Private/Squeezr/.htaccess')).split('squeezr/cache').join('typo3temp/squeezr/cache'));
	} else {
		htaccess.push(this.read(path.join(this.sourceRoot(), 'options/htaccess/01_deflate_expires')));
	}
	
	// Add gzip compression and ETag optimization
	htaccess.push(this.read(path.join(this.sourceRoot(), 'options/htaccess/02_etag_gzip')));
	
	// Add TYPO3 specifics
	htaccess.push(this.read(path.join(this.sourceRoot(), 'options/htaccess/03_typo3')));
	
	this.write(path.join(this.destinationRoot(), '.htaccess'), htaccess.join("\n\n"));
}

/**
 * Initialize a git repository
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareGit = function() {
	if (this.git) {
		this.template('options/git/_gitignore', '.gitignore');
		
		var that = this;
		
		// (Re)Initialize the Git repository 
		exec("`which git` init", function (error, stdout, stderr) {
			if (!error) {
				
				var setupGit = function() {
					exec("`which git` remote add origin \"" + that.git + "\"", function (error, stdout, stderr) {
						that.async(error);
					});
				};
				
				// Look for existing origin entries
				exec("`which git` remote -v", function (error, stdout, stderr) {
					if (!error) {
						if (stdout.length) {
							for (var l = 0, lines = stdout.split("\n"), removeOrigin = false; l < lines.length; ++l) {
								if (lines[l].indexOf('origin') == 0) {
									removeOrigin = true;
									break;
								}
							}
							
							// If there's anonter origin entry: Remove it before setting up the repo
							if (removeOrigin) {
								exec("`which git` remote rm origin", function (error, stdout, stderr) {
									if (error) {
										that.async(error);
									} else {
										
										// Setup the repo
										setupGit();
									}
								});
								
							} else {
								
								// Setup the repo
								setupGit();
							}
							
						} else {
							// Setup the repo
							setupGit();
						}
						
					} else {
						that.async(error);
					}
				});
				
			} else {
				that.async(error);
			}
		});
	}
}

/**
 * Running the setup Grunt task
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.prepareGrunt = function() {
//	this.log('run grunt');
}

/**
 * Running the setup Grunt task
 * 
 * @return {void}
 */
TollwerkTypo3SetupGenerator.prototype.zFinish = function() {
	this.log();
	this.log(chalk.green.bold('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'));
	this.log(chalk.green.bold('Congratulations - the tollwerk project kickstarter finished successfully!'));
	this.log(chalk.green.bold('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'));
	
	if (this.squeezr) {
		this.log();
		this.log(chalk.red.bold('Please remember to follow these steps to activate the squeezr extension:'));
		this.log(chalk.yellow('1.) Visit the TYPO3 extension manager (EM) and run the squeezr update script. Repeat this each time you modify the extension\'s configuration.'));
		this.log(chalk.yellow('2.) In the constant editor, define some image breakpoints and enable squeezr.'));
	}
}