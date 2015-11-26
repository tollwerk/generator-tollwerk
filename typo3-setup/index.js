'use strict';

var util			= require('util');
var path			= require('path');
var generators		= require('yeoman-generator');
var yosay			= require('yosay');
var wiring			= require('html-wiring');
var chalk			= require('chalk');
var validUrl		= require('valid-url');
var sys				= require('sys');
var exec			= require('child_process').exec;
var execSyncFile	= require('child_process').execFileSync;
var _s				= require('underscore.string');
var mkdirp			= require('mkdirp');
var fs				= require('fs');

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
 * Extract the TYPO3 version
 *
 * @param {TollwerkTypo3SetupGenerator} generator		Generator reference
 * @return {Array|Boolean}								Version
 */
function getTYPO3Version(generator) {
	var version = [];
	try {
		var versionString = execSyncFile(generator.templatePath('version.phps'), [generator.destinationPath('./typo3/sysext/core/ext_emconf.php')]).toString();
		if (versionString.length) {
			version = versionString.split('.');
		}
	} catch(e) {}
	return version;
}

// Main module export
module.exports = generators.Base.extend({

	/**
	 * Constructor
	 * 
	 * @return {void}
	 */
	constructor: function() {
		generators.Base.apply(this, arguments);
		this.pkg	= JSON.parse(wiring.readFileAsString(path.join(__dirname, '../package.json')));
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
				this.log(yosay('You\'re about scaffolding a tollwerk style TYPO3 project.'));
			}
			
			var done		= this.async();
			var prompts 	= [{
				name		: 'project',
				message		: 'How should this project be called?',
				validate	: function(name) {
					return ('' + name).length ? true : 'The project name cannot be empty!';
				}
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
				name		: 'imagemin',
				message		: 'Would you like support for PNG & JPEG minification?',
				'default'	: true
			},{
				name		: 'validation',
				message		: 'Configure W3C validation for URL (none by default):',
				validate	: function(url) {
					return ('' + url).length ? (validUrl.isWebUri(url) ? true : 'Validation requires a valid URL!') : true;
				}
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
//			},{
//				type		: 'confirm',
//				name		: 'defr',
//				message		: 'Would you like to install the defr extension?',
//				'default'	: false
			},{
				name		: 'git',
				message		: 'Associate with Git repository URL (none by default):'
			}];
		
			this.prompt(prompts, function(props) {
			 	this.project		= props.project.toLowerCase();
				this.projectname	= _s.slugify(this.project);
				this.author			= props.author;
				this.templating		= props.templating;
				this.sass			= props.sass;
				this.iconizr		= props.iconizr;
				this.imagemin		= props.imagemin;
				this.validation		= props.validation;
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
//					TODO: Create TYPO3 extension for defr
//					this.deps.defr						= 'defr-typo3#latest';
				}
				
				done();
			}.bind(this));
		}
	},
	
	/**
	 * Configuration preparations
	 * 
	 * @type {Object} 
	 */
	configuring: {
		
		/**
		 * NPM & Bower file installation
		 * 
		 * @return {void}
		 */
		prepareAppFiles: function() {
			this.template('_package.json', 'package.json');
			this.template('_bower.json', 'bower.json');
		},
		
		/**
		 * Project & Gruntfile installation
		 * 
		 * @return {void}
		 */
		prepareProjectFiles: function() {
			this.copy('editorconfig', '.editorconfig');
			this.copy('jshintrc', '.jshintrc');
			this.copy('gitattributes', '.gitattributes');
			this.copy('bowerrc', '.bowerrc');
			this.copy('robots.txt', 'robots.txt');
			this.template('Gruntfile.js', 'Gruntfile.js');
		}
	},
	
	/**
	 * Writing generator specific files
	 * 
	 * @type {Object} 
	 */
	writing: {
		
		/**
		 * Base resource installation
		 * 
		 * @return {void}
		 */
		prepareBaseResources: function() {
		
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
			mkdirp.sync('typo3conf');
			this.copy('typo3conf/init.php', 'typo3conf/init.php');
			var typo3DbInit			= 'typo3conf/init.sql';
			var typo3Version		= getTYPO3Version(this);
			while (typo3Version.length) {
				if (fs.existsSync(this.templatePath('typo3conf/init-' + typo3Version.join('_') + '.sql'))) {
					typo3DbInit		= 'typo3conf/init-' + typo3Version.join('_') + '.sql';
					break;
				}
				typo3Version.pop();
			}
			this.copy(typo3DbInit, 'typo3conf/init.sql');
		},
		
		/**
		 * iconizr installation
		 * 
		 * @return {void}
		 */
		prepareIconizr: function() {
			if (this.iconizr) {
				mkdirp.sync('fileadmin/' + this.project + '/.templates/icons');
				mkdirp.sync('fileadmin/' + this.project + '/css/icons');
			}
		},

		/**
		 * W3C validation installation
		 *
		 * @return {void}
		 */
		prepareValidation: function() {
			if (this.validation) {
				mkdirp.sync('.validation');
				this.copy('options/validation/validation-files.json', '.validation/validation-files.json');
			}
		},

		/**
		 * Image minification
		 *
		 * @return {void}
		 */
		prepareImagemin: function() {
			if (this.imagemin) {
				mkdirp.sync('.backup');
			}
		},

		/**
		 * Favicon / touch icon installation
		 * 
		 * @return {void}
		 */
		prepareFavicon: function() {
			if (this.favicon) {
				this.directory('options/favicon/fileadmin', 'fileadmin/' + this.project);
				mkdirp.sync('fileadmin/' + this.project + '/favicons');
			}
		}
	},


	/**
	 * Pull in dependencies
	 *
	 * @return {void}
	 */
	install: function() {
		this.installDependencies({
			skipInstall: this.options['skip-install'],
			skipMessage: this.options['skip-install-message']
		});
	},

	/**
	 * Finalizing
	 * 
	 * @type {Object} 
	 */
	end: {
		/**
		 * Install the templating extensions
		 * 
		 * @return {void}
		 */
		prepareTemplating: function() {
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
		},
		
		/**
		 * Install the Google Analytics extension
		 * 
		 * @return {void}
		 */
		prepareGoogleanalytics: function() {
			if (this.ga) {
				installExtension(this, 'tw_googleanalytics', this.async());
			}
		},
		
		/**
		 * Install the squeezr extension
		 * 
		 * @return {void}
		 */
		prepareSqueezr: function() {
			if (this.squeezr) {
				installExtension(this, 'squeezr', this.async());
				
				// TODO: Run update script or add a user hint
			}
		},
		
		/**
		 * Install the defr extension
		 * 
		 * @return {void}
		 */
		prepareDefr: function() {
			if (this.defr) {
				// TODO: Create TYPO3 extension for defr
			}
		},
		
		/**
		 * Additional database setup
		 * 
		 * @return {void}
		 */
		prepareDatabase: function() {
			var that = this;
			var done = this.async();
			exec("`which php` ./typo3conf/init.php", function (error, stdout, stderr) {
				if (error) {
					switch (error.code) {
						case 1: console.error('Initialization script must be run via CLI sapi.'); break;
						case 2: console.error('Local configuration could not be found.'); break;
						case 3: console.error('Initialization SQL could not be found or is empty.'); break;
						case 4: console.error('Database queries couldn\'t be performed.'); break;
					}
				}
				that.log(stdout);
				done(error);
			});
		},
		
		/**
		 * .htaccess setup
		 * 
		 * @return {void}
		 */
		prepareHtaccess: function() {
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
		},
		
		/**
		 * Initialize a git repository
		 * 
		 * @return {void}
		 */
		prepareGit: function() {
			if (this.git) {
				this.template('options/git/_gitignore', '.gitignore');
				
				var that = this;
				
				// (Re)Initialize the Git repository 
				exec("`which git` init", function (error, stdout, stderr) {
					if (!error) {
						
						var setupGit = function() {
							exec("`which git` remote add origin \"" + that.git + "\" && `which git` config core.filemode false", function (error, stdout, stderr) {
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
		},
		
		/**
		 * End
		 * 
		 * @return {void}
		 */
		finalize: function() {
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
	}
});