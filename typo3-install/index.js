'use strict';

var util			= require('util'),
path				= require('path'),
fs					= require('fs'),
yeoman				= require('yeoman-generator'),
chalk				= require('chalk'),
http				= require('http');

var TollwerkTypo3InstallGenerator = module.exports = function TollwerkTypo3InstallGenerator(args, options, config) {
	var that		= this;

	yeoman.generators.Base.apply(this, arguments);
	
	this.nested		= that.options.nested;
	this.pkg		= JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(TollwerkTypo3InstallGenerator, yeoman.generators.Base);

/**
 * Generator dialog
 * 
 * @return {void}
 */
TollwerkTypo3InstallGenerator.prototype.askFor = function() {
	var done		= this.async();
	
	if (!this.options.nested) {
		this.log(this.yeoman);
		this.log(chalk.magenta('You\'re about installing a TYPO3 instance.'));
	}
	this.log();
	
	var prompts 	= [{
		type		: 'list',
		name		: 'method',
		message		: 'Which TYPO3 sources should I use?',
		choices		: [{name: 'Download from http://get.typo3.org', value: 'dl'}, {name: 'Link to a local distribution', value: 'link'}],
		'default'	: 'dl'
	}];

	this.prompt(prompts, function(props) {
	 	this.typo3src	= props.method;
	 
	 	// If a local TYPO3 distribution should be linked
	 	if (this.typo3src == 'link') {
			this.prompt([{
				name			: 'target',
				message			: 'Path to local TYPO3 distribution',
				'default'		: '/www/htdocs/typo3/typo3_src.6_2'
			}], function(props) {
		 		this.target		= props.target || '';
				done();
		 	}.bind(this));
		 	
		// Else: Download the most recent TYPO3 distribution from http://get.typo3.org
	 	} else {
	 		done();
	 	}
	}.bind(this));
};

/**
 * TYPO3 source installation
 * 
 * @return {void}
 */
TollwerkTypo3InstallGenerator.prototype.sources = function() {
	try {
		var src				= fs.lstatSync('typo3_src').isSymbolicLink();
	} catch (error) {
		var src				= false;
	}
	
	// If the TYPO3 sources are not yet available
	if (!src) {
		
		// If a local TYPO3 distribution should be linked 
		if (this.typo3src == 'link') {
			try {
				var target		= this.target.length ? fs.lstatSync(this.target) : null,
				link			= target ? (target.isDirectory() || target.isSymbolicLink()) : false;
			} catch (error) {
				var link		= false;
			}
	
			if (link) {
				fs.symlinkSync(this.target, 'typo3_src');
			} else {
				this.log.error('Oh! "%s" doesn\'t seem to be a valid local TYPO3 distribution path', this.target);
				this.log();
			}
			
		// Else: Download the current TYPO3 distribution
		} else {
			
			// Determine the latest stable TYPO3 version
			this.log.ok('Determining latest stable TYPO3 version ...');
			var that			= this,
			done				= this.async(),
			versionUrl			= 'http://get.typo3.org/json';
			http.get(versionUrl, function(response) {
				var versions	= '';
			    response.on('data', function(chunk) {
			        versions	+= chunk;
			    });
			    response.on('end', function() {
			    	var latest	= JSON.parse(versions).latest_stable;
			    	
			    	// Download the TYPO3 distribution
			    	that.log('Downloading TYPO3 %s ...', latest);
			    	var distUrl	= 'http://get.typo3.org/' + latest,
			    	archiveName	= 'typo3_src-' + latest + '.tar.gz',
			    	archive		= fs.createWriteStream(archiveName),
					request		= http.get(distUrl, function(response) {
			  			response.pipe(archive);
			  			archive.on('finish', function() {
							archive.close();
							
							// Extract the TYPO3 sources
							that.log.ok('Extracting TYPO3 %s ...', latest);
							var targz		= require('tar.gz'),
							compress		= new targz().extract(archiveName, '.', function(error){
								
								// If an error occured
							    if (error) {
							        that.log.error('Oh! Couldn\'t extract the TYPO3 sources (%s)', error);
							        that.log();
							        done();
							        
								// Else
							    } else {
							    	fs.unlinkSync(archiveName);
							    	fs.symlinkSync('typo3_src-' + latest, 'typo3_src');
							    }
							});
					    });
					}).on('error', function(error) {
						that.log.error('Oh! Couldn\'t download TYPO3 distribution (%s)', error);
						that.log();
						done();
					});
			    });
			}).on('error', function(error) {
				that.log.error('Oh! Couldn\'t get TYPO3 versions from ' + versionUrl + ' (%s)', error);
				that.log();
				done();
			});
		}
	}
};

/**
 * TYPO3 source symlinking
 * 
 * @return {void}
 */
TollwerkTypo3InstallGenerator.prototype.symlinks = function() {
	try {
		var src				= fs.lstatSync('typo3_src').isSymbolicLink();
	} catch (error) {
		that.log.error('Oh! The TYPO3 sources couldn\'t be found (%s)', error);
		that.log();
		return;
	}
	
	try {
		fs.symlinkSync('typo3_src/typo3', 'typo3');
		fs.symlinkSync('typo3_src/index.php', 'index.php');
	} catch(error) {
		that.log.error(chalk.red('Oh! A symbolic link couldn\'t be established (%s)'), error);
		that.log();
		return;
	}
	
	fs.openSync('FIRST_INSTALL', 'w');
};

/**
 * Static data installation
 * 
 * @return {void}
 */
TollwerkTypo3InstallGenerator.prototype.staticdata = function() {
	this.copy('cli_lowlevel.sql', 'typo3/sysext/extbase/ext_tables_static+adt.sql');
};

/**
 * Finalization
 * 
 * @return {void}
 */
TollwerkTypo3InstallGenerator.prototype.finalize = function() {
	this.log.ok('Great! The TYPO3 sources have been prepared successfully!');
	this.log('As a next step, please run the TYPO3 install tool in your browser and re-run this Yeoman generator afterwards.');
	this.log();
};